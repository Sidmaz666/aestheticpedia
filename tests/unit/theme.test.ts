import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { contrast, themeFromPalette } from '@/lib/theme'

const rgb = (hex: string): [number, number, number] => {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}
const dir = path.join(process.cwd(), 'data', 'aesthetics')
const palettes = readdirSync(dir).map((f) => JSON.parse(readFileSync(path.join(dir, f), 'utf8')).colors)

describe('themeFromPalette', () => {
  it('returns null for palettes too small to theme', () => {
    expect(themeFromPalette([])).toBeNull()
    expect(themeFromPalette([{ hex: '#ff0000', name: 'red' }])).toBeNull()
  })

  it('meets WCAG contrast for every palette in the library', () => {
    let checked = 0
    for (const p of palettes) {
      const t = themeFromPalette(p)
      if (!t) continue
      const bg = rgb(t.vars['--bg'])
      expect(contrast(rgb(t.vars['--fg']), bg)).toBeGreaterThanOrEqual(7)
      expect(contrast(rgb(t.vars['--fg-muted']), bg)).toBeGreaterThanOrEqual(4.5)
      expect(contrast(rgb(t.vars['--fg-subtle']), bg)).toBeGreaterThanOrEqual(4.5)
      expect(contrast(rgb(t.vars['--accent']), bg)).toBeGreaterThanOrEqual(3)
      expect(contrast(rgb(t.vars['--accent-fg']), rgb(t.vars['--accent']))).toBeGreaterThanOrEqual(3)
      checked++
    }
    expect(checked).toBeGreaterThan(500)
  })
})
