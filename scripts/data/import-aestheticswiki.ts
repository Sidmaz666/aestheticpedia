// Import internet-era and community aesthetics from the Aesthetics Wiki (aesthetics.fandom.com,
// text licensed CC BY-SA). Only pages with an aesthetic infobox are used. Each record keeps an
// attributed source link; the wiki's own images are NOT imported (their licensing is unclear).
//
// Mapped fields: other names → aliases; decade of origin → period; key motifs → objects;
// key values → tags; key colours → swatches for the colour names given (standard colour-name
// values, marked paletteSource "derived"); related aesthetics → relations.
//
//   node scripts/data/import-aestheticswiki.ts [--dry]
import type { AestheticRecord, RelationRecord } from '../../src/lib/schema.ts'
import { cache, getJSON, loadLibrary, pool, saveAesthetic, saveRelations, sleep, slugify } from './lib.ts'

const DRY = process.argv.includes('--dry')
const API = 'https://aesthetics.fandom.com/api.php'
const http = cache<unknown>('aestheticswiki')

async function api<T = any>(params: Record<string, string>): Promise<T> {
  const url = `${API}?${new URLSearchParams({ format: 'json', ...params })}`
  const hit = http.get(url)
  if (hit) return hit as T
  const res = await getJSON<T>(url)
  http.set(url, res)
  await sleep(250)
  return res
}

const decode = (s: string) =>
  s
    .replace(/<br\s*\/?>/gi, ', ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&#x27;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(Number(d)))
    .replace(/\[\d+\]/g, '')
    .replace(/\s+/g, ' ')
    .trim()

function infobox(html: string, key: string): string {
  const m = new RegExp(`data-source="${key}"[^>]*>[\\s\\S]*?<div class="pi-data-value[^"]*"[^>]*>([\\s\\S]*?)</div>`).exec(html)
  return m ? decode(m[1]) : ''
}
const list = (s: string, max = 12) =>
  [...new Set(s.split(/,|;|•|\/(?!\/)|\band\b/).map((x) => x.replace(/\(.*?\)/g, '').trim()).filter((x) => x.length > 1 && x.length < 60))].slice(0, max)

// Standard colour names → hex (CSS/X11 names plus common descriptive names).
const COLOR_NAMES: Record<string, string> = {
  black: '#000000', white: '#ffffff', grey: '#808080', gray: '#808080', silver: '#c0c0c0', red: '#ff0000', maroon: '#800000',
  crimson: '#dc143c', burgundy: '#800020', pink: '#ffc0cb', 'pastel pink': '#f8c8dc', 'hot pink': '#ff69b4', 'baby pink': '#f4c2c2',
  magenta: '#ff00ff', purple: '#800080', lavender: '#e6e6fa', lilac: '#c8a2c8', violet: '#ee82ee', 'dark purple': '#301934',
  blue: '#0000ff', navy: '#000080', 'navy blue': '#000080', 'baby blue': '#89cff0', 'light blue': '#add8e6', 'sky blue': '#87ceeb',
  cyan: '#00ffff', teal: '#008080', turquoise: '#40e0d0', aqua: '#00ffff', green: '#008000', 'forest green': '#228b22',
  'olive green': '#708238', olive: '#808000', 'sage green': '#9caf88', sage: '#9caf88', mint: '#98ff98', 'mint green': '#98ff98',
  'moss green': '#8a9a5b', 'dark green': '#006400', 'neon green': '#39ff14', lime: '#00ff00', yellow: '#ffff00', 'pastel yellow': '#fdfd96',
  mustard: '#e1ad01', gold: '#ffd700', golden: '#ffd700', orange: '#ffa500', 'burnt orange': '#cc5500', peach: '#ffe5b4', coral: '#ff7f50',
  brown: '#8b4513', 'dark brown': '#654321', 'light brown': '#b5651d', tan: '#d2b48c', beige: '#f5f5dc', cream: '#fffdd0', ivory: '#fffff0',
  khaki: '#c3b091', sepia: '#704214', rust: '#b7410e', terracotta: '#e2725b', 'off-white': '#faf9f6', 'dark red': '#8b0000',
  'blood red': '#8a0303', 'neon pink': '#ff6ec7', 'neon blue': '#1f51ff', 'electric blue': '#7df9ff', chrome: '#dbe4eb', holographic: '#c8b8e8',
  pastel: '#ffd1dc', 'pastel blue': '#aec6cf', 'pastel purple': '#b39eb5', 'pastel green': '#77dd77', charcoal: '#36454f', 'dark grey': '#a9a9a9',
}
function swatches(text: string) {
  const t = text.toLowerCase()
  const found: { hex: string; name: string }[] = []
  const names = Object.keys(COLOR_NAMES).sort((a, b) => b.length - a.length)
  let rest = t
  for (const n of names) {
    const re = new RegExp(`\\b${n.replace(/[-/]/g, '[- ]?')}s?\\b`)
    if (re.test(rest)) {
      found.push({ hex: COLOR_NAMES[n], name: n })
      rest = rest.replace(re, ' ')
    }
    if (found.length >= 6) break
  }
  return found
}

const norm = (s: string) =>
  s
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\(.*?\)/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()

const { aesthetics, relations } = loadLibrary()
const have = new Map<string, string>()
for (const a of aesthetics) for (const n of [a.name, ...a.aliases, a.wikipedia ?? '']) if (n) have.set(norm(n), a.slug)
const slugs = new Set(aesthetics.map((a) => a.slug))

// All article titles.
const titles: string[] = []
let apcontinue: string | undefined
do {
  const res = await api<any>({ action: 'query', list: 'allpages', apnamespace: '0', apfilterredir: 'nonredirects', aplimit: '500', ...(apcontinue ? { apcontinue } : {}) })
  titles.push(...res.query.allpages.map((p: any) => p.title))
  apcontinue = res.continue?.apcontinue
} while (apcontinue)
console.log(`${titles.length} wiki articles`)

const created: AestheticRecord[] = []
const related = new Map<string, string[]>()
const now = new Date().toISOString()
let skipped = 0
await pool(titles, 3, async (title) => {
  if (have.has(norm(title))) return
  let html = ''
  try {
    html = (await api<any>({ action: 'parse', page: title, prop: 'text', section: '0', redirects: '1' })).parse?.text?.['*'] ?? ''
  } catch {
    return
  }
  const motifs = infobox(html, 'key_motifs')
  const colours = infobox(html, 'key_colours')
  if (!motifs && !colours) {
    skipped++
    return // not an aesthetic page (guides, lists, meta pages)
  }
  const body = html.replace(/<aside[\s\S]*?<\/aside>/g, '').replace(/<table[\s\S]*?<\/table>/g, '').replace(/<div class="(?:quote|notice)[\s\S]*?<\/div>/g, '')
  const paras = [...body.matchAll(/<p>([\s\S]*?)<\/p>/g)].map((m) => decode(m[1])).filter((p) => p.length > 60 && !/^(sensitive content|warning)/i.test(p))
  if (!paras.length) return
  const description = paras.slice(0, 4).join('\n\n').slice(0, 2000)
  const summary = (paras[0].match(/^.{40,300}?[.!?](?=\s|$)/)?.[0] ?? paras[0].slice(0, 260)).trim()
  const decade = infobox(html, 'decade_of_origin')
  const dm = /(1[5-9]|20)(\d)0s/.exec(decade)
  const startYear = dm ? Number(`${dm[1]}${dm[2]}0`) : null
  const others = list(infobox(html, 'other_names'), 6).filter((n) => !have.has(norm(n)))
  const name = title.replace(/\s*\(.*?\)\s*$/, '').trim()
  let slug = slugify(name)
  if (!slug || slugs.has(slug)) slug = `${slug}-aesthetic`
  if (slugs.has(slug)) return
  slugs.add(slug)
  const colors = swatches(colours)
  const url = `https://aesthetics.fandom.com/wiki/${encodeURIComponent(title.replace(/ /g, '_'))}`
  const rec: AestheticRecord = {
    slug,
    name,
    aliases: others,
    category: 'Internet Aesthetic',
    subcategory: '',
    establishment: 'internet_aesthetic',
    status: 'draft',
    confidence: 45,
    origin: '',
    geography: 'Online',
    periodStart: decade.slice(0, 80),
    periodEnd: '',
    startYear,
    endYear: null,
    era: dm ? `${startYear}s` : '',
    summary,
    description,
    culturalContext: infobox(html, 'key_values') ? `Key values (per the Aesthetics Wiki): ${infobox(html, 'key_values')}` : '',
    colors,
    ...(colors.length ? { paletteSource: 'derived' as const } : {}),
    visualDNA: colours ? { colour: colours.slice(0, 300) } : {},
    typography: {},
    typePairing: {},
    materials: [],
    textures: [],
    lighting: {},
    photography: {},
    architecture: {},
    fashion: {},
    objects: list(motifs, 14),
    environment: {},
    graphicDesign: {},
    uiTranslation: {},
    recipe: {},
    emotionProfile: {},
    dnaAxes: {},
    keyExamples: list(infobox(html, 'related_media'), 8),
    sounds: [],
    tags: ['aesthetics wiki', ...list(infobox(html, 'key_values'), 6).map((t) => t.toLowerCase())],
    images: [],
    sources: [{ name: `Aesthetics Wiki — ${title} (CC BY-SA)`, url, tier: 'C' }],
    references: [],
    wikidata: null,
    wikipedia: null,
    popularity: 30,
    isNiche: true,
    dataQuality: 'emerging',
    verifiedAt: null,
    createdAt: now,
    updatedAt: now,
  }
  created.push(rec)
  related.set(slug, list(infobox(html, 'related_aesthetics'), 20))
  for (const n of [name, ...others]) have.set(norm(n), slug)
})

const newRels: RelationRecord[] = []
const seen = new Set(relations.map((r) => `${r.from}|${r.to}|${r.type}`))
for (const [from, names] of related) {
  for (const n of names) {
    const to = have.get(norm(n))
    const key = `${from}|${to}|related`
    if (to && to !== from && !seen.has(key)) {
      seen.add(key)
      newRels.push({ from, to, type: 'related', note: 'Aesthetics Wiki: related aesthetics' })
    }
  }
}
console.log(`${created.length} new records (${skipped} non-aesthetic pages skipped), ${newRels.length} relations`)
console.log('sample:', created.slice(0, 20).map((r) => r.name).join(', '))
if (!DRY) {
  for (const r of created) saveAesthetic(r)
  saveRelations([...relations, ...newRels])
  console.log('✓ written')
}
