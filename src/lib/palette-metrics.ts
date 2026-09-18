// Measured palette analysis — computed from a record's actual colours, never assigned by hand
// or by a model. Every value is 0–100 and reproducible from the hex codes alone.
import type { ColorEntry } from '@/lib/aesthetic'

export interface PaletteMetrics {
  /** 0 = cool (blues/greens), 100 = warm (reds/oranges); greys count as neutral. */
  warmth: number
  /** Mean colourfulness (HSL saturation). */
  saturation: number
  /** Mean lightness. */
  lightness: number
  /** Strongest light/dark contrast between any two colours (WCAG ratio, scaled 1:1 → 0, 21:1 → 100). */
  contrast: number
  /** How much of the colour wheel the chromatic colours span (0 = one hue, 100 = full spectrum). */
  hueRange: number
}

export const METRIC_AXES: { key: keyof PaletteMetrics; left: string; right: string; describe: string }[] = [
  { key: 'warmth', left: 'Cool', right: 'Warm', describe: 'Saturation-weighted average of how close each hue sits to orange-red versus blue-cyan.' },
  { key: 'saturation', left: 'Muted', right: 'Vivid', describe: 'Average HSL saturation of the palette.' },
  { key: 'lightness', left: 'Dark', right: 'Light', describe: 'Average HSL lightness of the palette.' },
  { key: 'contrast', left: 'Soft', right: 'High-contrast', describe: 'The largest WCAG contrast ratio between two palette colours.' },
  { key: 'hueRange', left: 'Monochrome', right: 'Polychrome', describe: 'Arc of the colour wheel covered by the palette’s chromatic colours.' },
]

export const METRIC_KEYS = new Set<string>(METRIC_AXES.map((m) => m.key))

function rgb(hex: string): [number, number, number] | null {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex)
  if (!m) return null
  const n = parseInt(m[1], 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}
function hsl([r, g, b]: [number, number, number]): [number, number, number] {
  const [R, G, B] = [r / 255, g / 255, b / 255]
  const max = Math.max(R, G, B)
  const min = Math.min(R, G, B)
  const l = (max + min) / 2
  if (max === min) return [0, 0, l]
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  const h = max === R ? (G - B) / d + (G < B ? 6 : 0) : max === G ? (B - R) / d + 2 : (R - G) / d + 4
  return [h * 60, s, l]
}
function luminance([r, g, b]: [number, number, number]) {
  const f = (v: number) => {
    const s = v / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
}

const round = (n: number) => Math.round(Math.max(0, Math.min(100, n)))

export function paletteMetrics(colors: ColorEntry[]): PaletteMetrics | null {
  const cs = colors.map((c) => rgb(c.hex)).filter((c): c is [number, number, number] => !!c)
  if (cs.length < 3) return null
  const hs = cs.map(hsl)

  // Warmth: cos distance of hue from 30° (orange-red), weighted by saturation; greys pull to 50.
  let wSum = 0
  let wWeight = 0
  for (const [h, s] of hs) {
    const warm = (Math.cos(((h - 30) * Math.PI) / 180) + 1) / 2 // 1 at 30°, 0 at 210°
    wSum += warm * s
    wWeight += s
  }
  const chroma = wWeight / hs.length
  const warmth = wWeight > 0 ? 50 + (wSum / wWeight - 0.5) * 100 * Math.min(1, chroma * 2) : 50

  const saturation = (hs.reduce((a, [, s]) => a + s, 0) / hs.length) * 100
  const lightness = (hs.reduce((a, [, , l]) => a + l, 0) / hs.length) * 100

  const lums = cs.map(luminance)
  const ratio = (Math.max(...lums) + 0.05) / (Math.min(...lums) + 0.05)
  const contrast = ((ratio - 1) / 20) * 100

  // Hue range: 360° minus the largest empty gap between chromatic hues.
  const hues = hs.filter(([, s, l]) => s > 0.18 && l > 0.08 && l < 0.92).map(([h]) => h).sort((a, b) => a - b)
  let hueRange = 0
  if (hues.length > 1) {
    let gap = 360 - hues[hues.length - 1] + hues[0]
    for (let i = 1; i < hues.length; i++) gap = Math.max(gap, hues[i] - hues[i - 1])
    hueRange = ((360 - gap) / 300) * 100
  }

  return { warmth: round(warmth), saturation: round(saturation), lightness: round(lightness), contrast: round(contrast), hueRange: round(hueRange) }
}
