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
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Every way the world')
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
  const card = page.locator('a[href^="/aesthetics/"]').first()
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

test('connections network renders on canvas', async ({ page }) => {
  await page.goto('/connections')
  const canvas = page.locator('canvas')
  await expect(canvas).toBeVisible()
  expect((await canvas.boundingBox())!.width).toBeGreaterThan(300)
})

test('blend produces a hybrid from two records', async ({ page }) => {
  await page.goto('/blend?a=bauhaus&b=art-nouveau')
  await expect(page.getByText('Speculative blend')).toBeVisible()
  await expect(page.getByRole('heading', { level: 2 })).toContainText('Fusion')
})

test('theme toggle switches to light mode', async ({ page }) => {
  await page.goto('/about')
  await page.getByRole('button', { name: /Switch to light mode/ }).click()
  await expect(page.locator('html')).toHaveClass(/light/)
})
