// Stable, distinguishable hue per category for charts and graphs (OKLCH, works on dark and light).
import { CATEGORIES } from '@/lib/schema'

export const CATEGORY_COLORS: Record<string, string> = Object.fromEntries(
  CATEGORIES.map((c, i) => {
    const hue = Math.round((i * 360) / CATEGORIES.length + 18) % 360
    const light = i % 2 ? 0.72 : 0.8
    return [c, `oklch(${light} 0.13 ${hue})`]
  })
)

export const categoryColor = (c: string) => CATEGORY_COLORS[c] ?? 'oklch(0.75 0.02 80)'
