// Derive palettes from a record's own images for records without an editor-curated palette.
// Downloads up to four 500px thumbnails, clusters their pixels (k-means in Lab-ish space),
// keeps the 5–6 most prominent distinct colours and names them after the nearest named colour.
// Marks the result paletteSource: "derived" so the UI can say where it came from.
//
//   node scripts/data/palette.ts            records with < 3 colours
//   node scripts/data/palette.ts --slug x   one record
import sharp from 'sharp'
import type { AestheticRecord } from '../../src/lib/schema.ts'
import { USER_AGENT, aicHeaders, loadAesthetics, pool, saveAesthetic, sleep } from './lib.ts'

const ONLY = process.argv.includes('--slug') ? process.argv[process.argv.indexOf('--slug') + 1] : null

type RGB = [number, number, number]

// Named colours (CSS + common pigment names) for human-readable swatch names.
const NAMES: [string, string][] = Object.entries({
  black: '#000000', charcoal: '#36454f', 'ink blue': '#1b2a41', graphite: '#4b4e53', slate: '#708090', 'dove grey': '#b0b0ac',
  silver: '#c0c0c0', 'bone white': '#e3dac9', ivory: '#fffff0', 'paper white': '#f4f1ea', cream: '#f3e5ab', linen: '#faf0e6',
  sand: '#c2b280', ochre: '#cc7722', 'raw sienna': '#c9803a', 'burnt sienna': '#8a3324', umber: '#635147', sepia: '#704214',
  'walnut brown': '#5d432c', chocolate: '#7b3f00', terracotta: '#c65d3b', rust: '#b7410e', brick: '#a4452c', vermilion: '#e34234',
  crimson: '#a51c30', 'carmine red': '#960018', burgundy: '#800020', 'rose pink': '#e8a0a8', blush: '#dea5a4', coral: '#f88379',
  salmon: '#fa8072', peach: '#ffcba4', apricot: '#fbceb1', tangerine: '#f28500', amber: '#ffbf00', 'saffron yellow': '#f4c430',
  gold: '#d4af37', mustard: '#e1ad01', lemon: '#fff44f', 'olive green': '#708238', moss: '#8a9a5b', sage: '#9caf88',
  'forest green': '#228b22', 'bottle green': '#006a4e', emerald: '#50c878', jade: '#00a86b', mint: '#98ff98', teal: '#008080',
  turquoise: '#40e0d0', aqua: '#7fdbd4', 'sky blue': '#87ceeb', cerulean: '#2a52be', cobalt: '#0047ab', 'ultramarine': '#3f00ff',
  'prussian blue': '#003153', navy: '#000080', indigo: '#4b0082', 'denim blue': '#1560bd', periwinkle: '#ccccff', lavender: '#b57edc',
  lilac: '#c8a2c8', violet: '#8f00ff', plum: '#8e4585', aubergine: '#472d47', magenta: '#ff00ff', fuchsia: '#c154c1',
  'hot pink': '#ff69b4', 'dusty rose': '#b56576', taupe: '#8b8589', stone: '#928e85', 'warm grey': '#a39e93', khaki: '#c3b091',
  beige: '#d9c7a7', tan: '#d2b48c', camel: '#c19a6b', copper: '#b87333', bronze: '#8c6a3f', brass: '#b5a642', 'verdigris': '#43b3ae',
}).map(([n, h]) => [n, h])

const hex = (c: RGB) => '#' + c.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')
const parse = (h: string): RGB => {
  const n = parseInt(h.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}
// Cheap perceptual distance (redmean).
const dist = (a: RGB, b: RGB) => {
  const r = (a[0] + b[0]) / 2
  const dr = a[0] - b[0]
  const dg = a[1] - b[1]
  const db = a[2] - b[2]
  return Math.sqrt((2 + r / 256) * dr * dr + 4 * dg * dg + (2 + (255 - r) / 256) * db * db)
}
function nameOf(c: RGB): string {
  let best = ''
  let bd = Infinity
  for (const [n, h] of NAMES) {
    const d = dist(c, parse(h))
    if (d < bd) {
      bd = d
      best = n
    }
  }
  return best
}

async function pixels(url: string): Promise<RGB[]> {
  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT, ...aicHeaders(url) }, signal: AbortSignal.timeout(20000) })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const buf = Buffer.from(await res.arrayBuffer())
  const { data, info } = await sharp(buf).resize(48, 48, { fit: 'cover' }).removeAlpha().raw().toBuffer({ resolveWithObject: true })
  const out: RGB[] = []
  for (let i = 0; i < data.length; i += info.channels) out.push([data[i], data[i + 1], data[i + 2]])
  return out
}

function kmeans(px: RGB[], k: number): { c: RGB; n: number }[] {
  // k-means++ style seeding by spread, deterministic.
  const cents: RGB[] = [px[Math.floor(px.length / 2)]]
  while (cents.length < k) {
    let far = px[0]
    let d = -1
    for (const p of px) {
      const m = Math.min(...cents.map((c) => dist(p, c)))
      if (m > d) {
        d = m
        far = p
      }
    }
    cents.push(far)
  }
  let counts = new Array(k).fill(0)
  for (let it = 0; it < 12; it++) {
    const sums = cents.map(() => [0, 0, 0])
    counts = new Array(k).fill(0)
    for (const p of px) {
      let bi = 0
      let bd = Infinity
      cents.forEach((c, i) => {
        const dd = dist(p, c)
        if (dd < bd) {
          bd = dd
          bi = i
        }
      })
      sums[bi][0] += p[0]
      sums[bi][1] += p[1]
      sums[bi][2] += p[2]
      counts[bi]++
    }
    cents.forEach((_, i) => {
      if (counts[i]) cents[i] = [sums[i][0] / counts[i], sums[i][1] / counts[i], sums[i][2] / counts[i]]
    })
  }
  return cents.map((c, i) => ({ c, n: counts[i] })).sort((a, b) => b.n - a.n)
}

async function derive(a: AestheticRecord): Promise<boolean> {
  const urls = a.images.slice(0, 4).map((i) => i.thumb ?? i.url)
  const px: RGB[] = []
  for (const u of urls) {
    try {
      px.push(...(await pixels(u)))
    } catch {
      /* skip unreadable image */
    }
    await sleep(150)
  }
  if (px.length < 500) return false
  const clusters = kmeans(px, 9)
  const picked: RGB[] = []
  for (const { c, n } of clusters) {
    if (n < px.length * 0.025) continue
    if (picked.some((p) => dist(p, c) < 60)) continue
    picked.push(c)
    if (picked.length === 6) break
  }
  if (picked.length < 3) return false
  const used = new Map<string, number>()
  a.colors = picked.map((c) => {
    const base = nameOf(c)
    const n = (used.get(base) ?? 0) + 1
    used.set(base, n)
    return { hex: hex(c), name: n > 1 ? `${base} ${n}` : base }
  })
  a.paletteSource = 'derived'
  return true
}

const todo = loadAesthetics().filter((a) => (ONLY ? a.slug === ONLY : a.colors.length < 3 && a.images.length > 0))
console.log(`deriving palettes for ${todo.length} records`)
let ok = 0
await pool(todo, 4, async (a) => {
  if (await derive(a)) {
    saveAesthetic(a)
    ok++
    if (ok % 50 === 0 || ONLY) console.log(`  ${ok}: ${a.slug} → ${a.colors.map((c) => c.hex).join(' ')}`)
  }
})
console.log(`✓ ${ok}/${todo.length} palettes derived`)
