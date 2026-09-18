// Derive a complete, accessible UI theme from an aesthetic's palette.
// The result overrides the design-system variables (see globals.css), so an
// aesthetic's page — header, surfaces, links, focus rings — takes on its colours
// while text contrast stays ≥ 4.5:1 (WCAG AA) and accents stay ≥ 3:1.
import type { ColorEntry } from '@/lib/aesthetic'

type RGB = [number, number, number]

const parse = (hex: string): RGB | null => {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim())
  if (!m) return null
  const n = parseInt(m[1], 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}
const toHex = (c: RGB) => '#' + c.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('')
const mix = (a: RGB, b: RGB, t: number): RGB => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]

export function luminance(c: RGB): number {
  const [r, g, b] = c.map((v) => {
    const s = v / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
export const contrast = (a: RGB, b: RGB) => {
  const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m)
  return (x + 0.05) / (y + 0.05)
}
function saturation([r, g, b]: RGB): number {
  const max = Math.max(r, g, b) / 255
  const min = Math.min(r, g, b) / 255
  const l = (max + min) / 2
  if (max === min) return 0
  return l > 0.5 ? (max - min) / (2 - max - min) : (max - min) / (max + min)
}

/** Push `fg` toward white/black until it reaches `target` contrast against `bg`. */
function ensureContrast(fg: RGB, bg: RGB, target: number): RGB {
  if (contrast(fg, bg) >= target) return fg
  const toward: RGB = luminance(bg) > 0.35 ? [0, 0, 0] : [255, 255, 255]
  for (let t = 0.05; t <= 1; t += 0.05) {
    const c = mix(fg, toward, t)
    if (contrast(c, bg) >= target) return c
  }
  return toward
}

export interface AestheticTheme {
  mode: 'dark' | 'light'
  vars: Record<string, string>
}

export function themeFromPalette(colors: ColorEntry[]): AestheticTheme | null {
  const cs = colors.map((c) => parse(c.hex)).filter((c): c is RGB => !!c)
  if (cs.length < 2) return null
  const byLum = [...cs].sort((a, b) => luminance(a) - luminance(b))
  const darkest = byLum[0]
  const lightest = byLum[byLum.length - 1]
  const avgLum = cs.reduce((s, c) => s + luminance(c), 0) / cs.length

  // Light palettes (pastels, paper, porcelain) get a light theme; everything else stays dark
  // so imagery remains the brightest thing on the page.
  const mode: 'dark' | 'light' = avgLum > 0.45 && luminance(lightest) > 0.7 ? 'light' : 'dark'
  const bg: RGB =
    mode === 'dark'
      ? mix(luminance(darkest) < 0.06 ? darkest : mix(darkest, [8, 8, 9], 0.7), [8, 8, 9], 0.25)
      : mix(lightest, [255, 255, 255], 0.35)
  const fgBase: RGB = mode === 'dark' ? mix(lightest, [250, 248, 244], 0.7) : mix(darkest, [14, 12, 10], 0.6)
  const fg = ensureContrast(fgBase, bg, 12)
  // Targets carry a small margin so hex rounding can never dip below WCAG thresholds.
  const fgMuted = ensureContrast(mix(fg, bg, 0.28), bg, 7.2)
  const fgSubtle = ensureContrast(mix(fg, bg, 0.45), bg, 4.7)

  // Accent: the most saturated palette colour that can be made legible on bg.
  const accentSource =
    [...cs].sort((a, b) => saturation(b) * 2 + contrast(b, bg) / 10 - (saturation(a) * 2 + contrast(a, bg) / 10))[0] ?? fg
  const accent = ensureContrast(accentSource, bg, 3.3)
  const accentFg: RGB = contrast([255, 255, 255], accent) >= contrast([12, 10, 8], accent) ? [255, 255, 255] : [12, 10, 8]

  const surface = mix(bg, fg, mode === 'dark' ? 0.045 : 0.0)
  const surface2 = mix(bg, fg, mode === 'dark' ? 0.08 : 0.05)
  const surfaceLight: RGB = mode === 'light' ? mix(bg, [255, 255, 255], 0.6) : surface

  return {
    mode,
    vars: {
      '--bg': toHex(bg),
      '--surface': toHex(mode === 'light' ? surfaceLight : surface),
      '--surface-2': toHex(surface2),
      '--line': toHex(mix(bg, fg, 0.12)),
      '--line-strong': toHex(mix(bg, fg, 0.22)),
      '--fg': toHex(fg),
      '--fg-muted': toHex(fgMuted),
      '--fg-subtle': toHex(fgSubtle),
      '--accent': toHex(accent),
      '--accent-fg': toHex(accentFg),
    },
  }
}

/** CSS text for a theme, scoped to a selector (":root" themes the whole site). */
export function themeCss(theme: AestheticTheme, selector = ':root'): string {
  const decl = Object.entries(theme.vars)
    .map(([k, v]) => `${k}:${v}`)
    .join(';')
  return `${selector}{${decl};color-scheme:${theme.mode}}`
}
