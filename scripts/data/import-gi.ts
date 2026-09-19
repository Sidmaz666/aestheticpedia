// Import India's registered Geographical Indications for handicrafts and textiles — each one
// a protected, place-bound craft tradition (Muga silk of Assam, Aranmula Kannadi, Pochampally
// ikat…). Source: Wikipedia's "Geographical indications in India" registry table. Only GIs
// that link to their own Wikipedia article are imported, with that article's intro as the
// text; already-present crafts are skipped. The GI registration is recorded as a fact, not as
// the craft's start date.
//
//   node scripts/data/import-gi.ts [--dry]
import type { AestheticRecord } from '../../src/lib/schema.ts'
import { cache, getJSON, loadAesthetics, saveAesthetic, sleep, slugify } from './lib.ts'

const DRY = process.argv.includes('--dry')
const http = cache<unknown>('gi')
const UA = { 'User-Agent': 'Aestheticpedia/1.0 (https://github.com/Sidmaz666/aestheticpedia; open aesthetics encyclopedia) node' }
async function wp<T = any>(params: Record<string, string>): Promise<T> {
  const url = `https://en.wikipedia.org/w/api.php?${new URLSearchParams({ format: 'json', formatversion: '2', ...params })}`
  const hit = http.get(url)
  if (hit) return hit as T
  const res = await getJSON<T>(url, 3, { headers: UA })
  http.set(url, res)
  await sleep(120)
  return res
}
const strip = (s: string) =>
  s
    .replace(/<sup[\s\S]*?<\/sup>/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(Number(d)))
    .replace(/\s+/g, ' ')
    .trim()
const norm = (s: string) => s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim()

const page = await wp<any>({ action: 'parse', page: 'List of geographical indications in India', prop: 'text', redirects: '1' })
const html: string = page.parse.text
const LIST_URL = `https://en.wikipedia.org/wiki/${encodeURIComponent(page.parse.title.replace(/ /g, '_'))}`

type Row = { name: string; article: string | null; type: string; state: string; year: string }
const rows: Row[] = []
for (const m of html.matchAll(/<tr>([\s\S]*?)<\/tr>/g)) {
  const cells = [...m[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map((c) => c[1])
  if (cells.length < 6) continue
  const type = strip(cells[3])
  if (!/^(Handicraft|Textiles?)$/i.test(type)) continue
  const link = /<a href="\/wiki\/([^"#]+)"(?![^>]*class="new")[^>]*>/.exec(cells[2])
  rows.push({ name: strip(cells[2]), article: link ? decodeURIComponent(link[1]).replace(/_/g, ' ') : null, type, state: strip(cells[4]), year: strip(cells[5]) })
}
console.log(`${rows.length} handicraft/textile GIs, ${rows.filter((r) => r.article).length} with an article`)

const all = loadAesthetics()
const haveNames = new Set(all.flatMap((a) => [a.name, ...a.aliases, a.wikipedia ?? '']).filter(Boolean).map(norm))
const slugs = new Set(all.map((a) => a.slug))
const cand = rows.filter((r) => r.article && !haveNames.has(norm(r.article)) && !haveNames.has(norm(r.name)))

// Resolve articles: intro text, short description, Wikidata id (20 per request).
const info = new Map<string, { title: string; extract: string; description: string; qid: string | null }>()
const titles = [...new Set(cand.map((r) => r.article!))]
for (let i = 0; i < titles.length; i += 20) {
  const res = await wp<any>({
    action: 'query',
    titles: titles.slice(i, i + 20).join('|'),
    prop: 'extracts|description|pageprops',
    exintro: '1',
    explaintext: '1',
    exlimit: '20',
    ppprop: 'wikibase_item|disambiguation',
    redirects: '1',
  })
  const redirect = new Map<string, string>((res.query?.redirects ?? []).map((r: any) => [r.to, r.from]))
  for (const p of res.query?.pages ?? []) {
    if (p.missing || p.pageprops?.disambiguation !== undefined) continue
    info.set(redirect.get(p.title) ?? p.title, { title: p.title, extract: String(p.extract ?? ''), description: String(p.description ?? ''), qid: p.pageprops?.wikibase_item ?? null })
  }
}

const now = new Date().toISOString()
const created: AestheticRecord[] = []
const seenTitles = new Set<string>()
for (const r of cand) {
  const p = info.get(r.article!)
  if (!p || p.extract.length < 80 || seenTitles.has(p.title) || haveNames.has(norm(p.title))) continue
  // Economic or corporate articles describe an industry, not the craft itself.
  if (/\b(industry|economy|company|corporation|cooperative|district|town|city)\b/i.test(p.title)) continue
  // Musical instruments are GI handicrafts, but sound rather than visual traditions.
  if (/\b(dhol|drum|flute|sifung|instrument|veena|sitar)\b/i.test(`${p.title} ${p.description}`)) continue
  seenTitles.add(p.title)
  const paras = p.extract.split(/\n+/).map((s) => s.trim()).filter(Boolean)
  const summary = (paras[0].match(/^.{40,320}?[.!?](?=\s|$)/)?.[0] ?? paras[0].slice(0, 280)).trim()
  const name = p.title.replace(/\s*\(.*?\)\s*$/, '').trim()
  let slug = slugify(name)
  if (!slug) continue
  if (slugs.has(slug)) slug = `${slug}-${slugify(r.state)}`
  if (slugs.has(slug)) continue
  slugs.add(slug)
  const painting = /painting|chitra|art\b|mural|miniature/i.test(`${name} ${p.description}`)
  const state = r.state.replace(/\s*\[.*?\]\s*/g, '')
  const wpUrl = `https://en.wikipedia.org/wiki/${encodeURIComponent(p.title.replace(/ /g, '_'))}`
  created.push({
    slug,
    name,
    aliases: norm(r.name) !== norm(name) ? [r.name] : [],
    category: painting ? 'Painting Technique & School' : 'Textile & Craft',
    subcategory: p.description && p.description.length < 90 ? p.description.replace(/^./, (m) => m.toUpperCase()) : `Geographical Indication craft of ${state}`,
    establishment: 'regional_tradition',
    status: 'draft',
    confidence: 65,
    origin: `${state}, India`,
    geography: `${state}, India`,
    periodStart: '',
    periodEnd: '',
    startYear: null,
    endYear: null,
    era: '',
    summary,
    description: paras.join('\n\n').slice(0, 2400),
    culturalContext: `Registered as a Geographical Indication of India (${r.type.toLowerCase()}, ${state}; registration ${r.year}), which protects the name for products made in its place of origin by traditional methods.`,
    colors: [],
    visualDNA: {},
    typography: {},
    typePairing: {},
    materials: [],
    textures: [],
    lighting: {},
    photography: {},
    architecture: {},
    fashion: {},
    objects: [],
    environment: {},
    graphicDesign: {},
    uiTranslation: {},
    recipe: {},
    emotionProfile: {},
    dnaAxes: {},
    keyExamples: [],
    sounds: [],
    tags: ['geographical indication', r.type.toLowerCase(), state.toLowerCase()],
    images: [],
    sources: [
      { name: `Wikipedia — ${p.title}`, url: wpUrl, tier: 'B', check: { ok: true, status: 200, checkedAt: now } },
      { name: 'Wikipedia — Geographical indications in India (GI registry list)', url: LIST_URL, tier: 'B', check: { ok: true, status: 200, checkedAt: now } },
      ...(p.qid ? [{ name: `Wikidata — ${p.qid}`, url: `https://www.wikidata.org/wiki/${p.qid}`, tier: 'B' as const, check: { ok: true, status: 200, checkedAt: now } }] : []),
    ],
    references: [],
    wikidata: p.qid,
    wikipedia: p.title,
    popularity: 30,
    isNiche: true,
    dataQuality: 'moderately_documented',
    verifiedAt: null,
    createdAt: now,
    updatedAt: now,
  } as AestheticRecord)
}
const byState = new Map<string, number>()
for (const c of created) byState.set(c.origin, (byState.get(c.origin) ?? 0) + 1)
console.log(`${created.length} new GI crafts`, Object.fromEntries([...byState.entries()].sort((a, b) => b[1] - a[1])))
console.log('sample:', created.slice(0, 20).map((c) => c.name).join(', '))
if (!DRY) {
  for (const c of created) saveAesthetic(c)
  console.log('✓ written')
}
