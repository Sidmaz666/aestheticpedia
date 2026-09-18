import type { Metadata } from 'next'
import { ColorAtlas, type ColorAtlasData } from '@/components/views/colors'
import { getColorIndex } from '@/lib/queries'

export const revalidate = 3600
export const metadata: Metadata = {
  title: 'Colour atlas',
  description: 'Every palette colour of every aesthetic on one wheel — and find aesthetics by colour.',
  alternates: { canonical: '/colors' },
}

function hue(hex: string) {
  const n = parseInt(hex.slice(1), 16)
  const [r, g, b] = [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  if (max === min) return -1 + (max + min) / 2 // greys first, dark → light
  const d = max - min
  const h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4
  return h * 60
}

export default async function ColorsPage() {
  const rows = await getColorIndex()
  const index = new Map<string, number>()
  const records: ColorAtlasData['records'] = []
  const colors: ColorAtlasData['colors'] = []
  const byCat = new Map<string, string[]>()
  for (const r of rows) {
    if (!index.has(r.slug)) {
      index.set(r.slug, records.length)
      records.push([r.slug, r.name])
    }
    const hex = r.hex.toLowerCase()
    colors.push([hex, index.get(r.slug)!])
    if (!byCat.has(r.category)) byCat.set(r.category, [])
    byCat.get(r.category)!.push(hex)
  }
  const spectra = [...byCat.entries()]
    .map(([category, hexes]) => {
      const sorted = [...hexes].sort((a, b) => hue(a) - hue(b))
      const step = Math.max(1, Math.floor(sorted.length / 80))
      const sample = sorted.filter((_, i) => i % step === 0)
      return { category, count: hexes.length, gradient: `linear-gradient(90deg, ${sample.join(', ')})` }
    })
    .sort((a, b) => b.count - a.count)
  return <ColorAtlas data={{ records, colors, spectra }} />
}
