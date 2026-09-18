import { expect, test } from '@playwright/test'

// Runs in the mobile project: no horizontal overflow and a working menu on every main page.
for (const path of ['/', '/aesthetics', '/aesthetics/art-nouveau', '/timeline', '/colors', '/discover', '/blend', '/data', '/about']) {
  test(`no horizontal overflow on ${path}`, async ({ page }) => {
    await page.goto(path)
    await page.waitForLoadState('networkidle')
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
    expect(overflow).toBeLessThanOrEqual(1)
  })
}

test('mobile menu opens and navigates', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Open menu' }).click()
  await page.getByRole('navigation', { name: 'Mobile' }).getByRole('link', { name: 'Timeline' }).click()
  await expect(page).toHaveURL(/\/timeline$/)
})
