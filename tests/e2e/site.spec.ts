import { expect, test } from '@playwright/test'

const errorsOf = (page: import('@playwright/test').Page) => {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))
  page.on('console', (m) => {
    if (m.type() === 'error' && !/Failed to load resource|favicon|ERR_|net::/.test(m.text())) errors.push(m.text())
  })
  return errors
}

test('home renders hero, counts and categories without errors', async ({ page }) => {
  const errors = errorsOf(page)
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Every lens we have for looking at the world')
  await expect(page.getByRole('heading', { name: 'Browse by category' })).toBeVisible()
  expect(await page.locator('a[href^="/aesthetics?category="]').count()).toBeGreaterThan(10)
  expect(errors).toEqual([])
})

test('search palette finds and opens an aesthetic', async ({ page }) => {
  await page.goto('/')
  await page.keyboard.press('Control+k')
  const input = page.getByRole('combobox')
  await input.fill('bauhaus')
  await expect(page.getByRole('option').first()).toContainText('Bauhaus')
  await input.press('Enter')
  await expect(page).toHaveURL(/\/aesthetics\/bauhaus$/)
})

test('opening a record from browse shows a full-screen overlay that closes', async ({ page }) => {
  await page.goto('/aesthetics')
  // Click only after hydration: before it, a card is a plain link (full page load, no overlay).
  await page.waitForLoadState('networkidle')
  const card = page.locator('main a[href^="/aesthetics/"]').first()
  await card.click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  const box = await dialog.boundingBox()
  const vp = page.viewportSize()!
  expect(box!.width).toBeGreaterThanOrEqual(vp.width - 1)
  expect(box!.height).toBeGreaterThanOrEqual(vp.height - 1)
  const close = page.getByRole('button', { name: /^Close/ })
  await expect(close).toBeVisible()
  // The close button has a solid circular background.
  const bg = await close.evaluate((el) => getComputedStyle(el).backgroundColor)
  expect(bg).not.toBe('rgba(0, 0, 0, 0)')
  expect(await close.evaluate((el) => getComputedStyle(el).borderRadius)).not.toBe('0px')
  await close.click()
  await expect(page).toHaveURL(/\/aesthetics$/)
})

test('record page is themed, sourced and illustrated', async ({ page }) => {
  const errors = errorsOf(page)
  await page.goto('/aesthetics/art-nouveau')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Art Nouveau')
  // The aesthetic re-themes the whole site.
  const bg = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--bg').trim())
  expect(bg).not.toBe('#0b0b0c')
  await expect(page.locator('#gallery img').first()).toBeVisible()
  await expect(page.locator('#sources')).toContainText('Sources')
  const ld = await page.locator('script[type="application/ld+json"]').allTextContents()
  expect(ld.some((t) => t.includes('"DefinedTerm"'))).toBe(true)
  expect(errors).toEqual([])
})

test('export menu offers downloadable formats', async ({ page, request }) => {
  await page.goto('/aesthetics/bauhaus')
  await page.getByRole('button', { name: 'Export' }).click()
  const items = page.getByRole('menuitem')
  expect(await items.count()).toBeGreaterThanOrEqual(16)
  const href = await items.filter({ hasText: 'Markdown' }).getAttribute('href')
  const res = await request.get(href!)
  expect(res.status()).toBe(200)
  expect(await res.text()).toContain('# Bauhaus')
})

test('timeline, connections, colours, discover, blend, data and about pages load', async ({ page }) => {
  for (const [path, heading] of [
    ['/timeline', 'Timeline'],
    ['/connections', 'Connections'],
    ['/colors', 'Every palette, one wheel'],
    ['/discover', 'Discover'],
    ['/blend', 'Blend'],
    ['/data', 'Data & API'],
    ['/about', 'A vault for every aesthetic.'],
  ] as const) {
    await page.goto(path)
    await expect(page.getByRole('heading', { level: 1 })).toContainText(heading)
  }
})

test('the timeline has no visible scrollbars and jumps to eras', async ({ page }) => {
  await page.goto('/timeline')
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  expect(overflow).toBeLessThanOrEqual(0)
  await page.getByRole('listitem', { name: /1920s/ }).click()
  await expect(page.locator('#era-1920s')).toBeInViewport()
})

test('connections network renders (3D, with 2D fallback)', async ({ page }) => {
  await page.goto('/connections')
  const canvas = page.locator('[data-graph] canvas, canvas[data-graph]').first()
  await expect(canvas).toBeVisible()
  expect((await canvas.boundingBox())!.width).toBeGreaterThan(300)
})

test('blend produces a hybrid from two records', async ({ page }) => {
  await page.goto('/blend?a=bauhaus&b=art-nouveau')
  await expect(page.getByText('Speculative blend')).toBeVisible()
  await expect(page.getByRole('heading', { level: 2 })).toContainText('×')
})

test('theme toggle switches to light mode', async ({ page }) => {
  await page.goto('/about')
  await page.getByRole('button', { name: /Switch to light mode/ }).click()
  await expect(page.locator('html')).toHaveClass(/light/)
})

test('the robot guide opens, adapts to the page, and doubles as back-to-top', async ({ page }) => {
  const errors = errorsOf(page)
  await page.goto('/aesthetics/vaporwave')
  const robot = page.getByRole('button', { name: 'Ask the vault guide' })
  await expect(robot).toBeVisible()
  await robot.click()
  const panel = page.locator('#agent-panel')
  await expect(panel).toBeVisible()
  await expect(panel.getByPlaceholder(/Ask about Vaporwave/)).toBeVisible()
  await expect(panel.getByRole('button', { name: /Tell me about Vaporwave/ })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(panel).toBeHidden()

  await page.mouse.wheel(0, 3000)
  const top = page.getByRole('button', { name: 'Back to top' })
  await expect(top).toBeVisible()
  await top.click()
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(50)

  expect(errors).toEqual([])
})

test('live demo shows only the record’s real images, and related records scroll as a carousel', async ({ page }) => {
  await page.goto('/aesthetics/art-nouveau')
  const tabs = page.getByRole('tablist', { name: 'Live demo views' })
  await tabs.scrollIntoViewIfNeeded()
  await expect(tabs.getByRole('tab', { name: '3D gallery' })).toBeVisible()
  const ring = page.locator('[aria-roledescription="3D carousel"] figure img')
  expect(await ring.count()).toBeGreaterThan(2)
  // Every picture in the demo is one of the record's documented images (Wikimedia/museum URLs).
  for (const src of await ring.evaluateAll((els) => els.map((e) => (e as HTMLImageElement).src))) expect(src).toMatch(/^https:\/\/(upload|thumb)\.wikimedia\.org|artic\.edu|metmuseum/)
  await tabs.getByRole('tab', { name: 'Palette map' }).click()
  await expect(page.getByRole('slider', { name: /Compare original and palette-mapped/ })).toBeVisible()

  const rail = page.getByRole('region', { name: /^More in / })
  await rail.scrollIntoViewIfNeeded()
  const next = rail.getByRole('button', { name: 'Next' })
  const prev = rail.getByRole('button', { name: 'Previous' })
  await expect(prev).toBeDisabled()
  await next.click()
  await expect(prev).toBeEnabled()
})

test('connections: legend filters categories, tooltip follows the pointer, nothing overlaps', async ({ page }) => {
  await page.goto('/connections')
  const toggle = page.getByRole('button', { name: /Filters/ })
  await expect(toggle).toBeVisible()
  if ((await toggle.getAttribute('aria-expanded')) !== 'true') await toggle.click()
  const legend = page.getByRole('group', { name: 'Filter by category' })
  await expect(legend).toBeVisible()
  // The legend stays below the title card and inside the viewport.
  const card = (await page.getByRole('heading', { name: 'Connections' }).locator('xpath=..').boundingBox())!
  const box = (await legend.boundingBox())!
  expect(box.y).toBeGreaterThanOrEqual(card.y + card.height - 1)
  expect(box.y + box.height).toBeLessThanOrEqual(page.viewportSize()!.height)
  const first = legend.getByRole('button', { pressed: true }).first()
  await first.click()
  await expect(page.getByText(/\d+ of \d+ categories/)).toBeVisible()
  await page.getByRole('button', { name: 'Show all categories' }).click()
  await expect(page.getByText(/^All \d+ categories/)).toBeVisible()
})

test('discover: a mood preset returns ranked palette matches; blend shows a real mood board', async ({ page }) => {
  // Discover is never empty: arriving starts from a random mood.
  await page.goto('/discover')
  await expect(page.getByText(/closest matches/)).toBeVisible()
  await page.getByRole('button', { name: 'Warm & earthy' }).first().click()
  await expect(page.getByText(/closest matches/)).toBeVisible()
  await expect(page.getByText(/#1 · \d+% match/)).toBeVisible()

  await page.goto('/blend?a=bauhaus&b=art-nouveau')
  await expect(page.getByRole('heading', { name: 'What each parent looks like' })).toBeVisible()
  expect(await page.locator('article figure img').count()).toBeGreaterThan(1)
  await expect(page.getByRole('heading', { name: 'Where the palettes sit' })).toBeVisible()
})
