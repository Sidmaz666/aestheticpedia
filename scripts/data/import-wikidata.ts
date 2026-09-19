// Import aesthetics that exist in Wikidata/Wikipedia but not yet in the library.
//
// For each class below, fetch every instance that has an English Wikipedia article, skip
// anything already present (by Wikidata id, Wikipedia title, name or alias), and create a
// Stub record with the article intro, dates, place of origin and Wikidata relations to
// existing records. Palettes and images are added afterwards by images.ts / palette.ts.
// Nothing is invented: fields without an open source stay empty for editors to fill.
//
//   node scripts/data/import-wikidata.ts            import all classes
//   node scripts/data/import-wikidata.ts --dry      report what would be imported
//   node scripts/data/import-wikidata.ts --from-crawl  import pages found by crawl-wikipedia.ts
//        whose Wikidata class is on the reviewed allow-list in data/crawl-classes.json
import { readFileSync } from 'node:fs'
import type { AestheticRecord, RelationRecord } from '../../src/lib/schema.ts'
import { cache, getJSON, loadLibrary, saveAesthetic, saveRelations, sleep, slugify } from './lib.ts'

const DRY = process.argv.includes('--dry')
const FROM_CRAWL = process.argv.includes('--from-crawl')

const CLASSES: { qid: string; label: string; category: AestheticRecord['category']; establishment: AestheticRecord['establishment']; direct?: boolean }[] = [
  // Specific classes first: a record is assigned to the first class that lists it.
  { qid: 'Q32880', label: 'architectural style', category: 'Architectural Style', establishment: 'historical' },
  { qid: 'Q4442611', label: 'fashion style', category: 'Fashion & Dress', establishment: 'community_subculture' },
  { qid: 'Q264965', label: 'subculture', category: 'Subculture Style', establishment: 'community_subculture' },
  { qid: 'Q113561882', label: 'internet aesthetic', category: 'Internet Aesthetic', establishment: 'internet_aesthetic' },
  { qid: 'Q1231896', label: 'painting technique', category: 'Painting Technique & School', establishment: 'historical' },
  { qid: 'Q7708485', label: 'textile process', category: 'Textile & Craft', establishment: 'regional_tradition' },
  { qid: 'Q1792379', label: 'art genre', category: 'Painting Technique & School', establishment: 'historical', direct: true },
  { qid: 'Q24017852', label: 'pottery style', category: 'Textile & Craft', establishment: 'regional_tradition' },
  { qid: 'Q96338860', label: 'garden type', category: 'Architectural Style', establishment: 'historical' },
  { qid: 'Q3172759', label: 'traditional costume', category: 'Fashion & Dress', establishment: 'regional_tradition' },
  { qid: 'Q335261', label: 'ornament', category: 'Material & Surface', establishment: 'historical' },
{ qid: 'Q968159', label: 'art movement', category: 'Art Movement', establishment: 'historical' },
  { qid: 'Q1792644', label: 'art style', category: 'Art Movement', establishment: 'historical' },
]

const http = cache<unknown>('wikidata')
async function sparql(query: string): Promise<any[]> {
  const hit = http.get(query)
  if (hit) return hit as any[]
  for (let i = 0; i < 4; i++) {
    try {
      const res = await getJSON<any>(`https://query.wikidata.org/sparql?format=json&query=${encodeURIComponent(query)}`, 2, {
        headers: { Accept: 'application/sparql-results+json' },
      })
      const rows = res.results.bindings
      http.set(query, rows)
      return rows
    } catch (e) {
      console.warn(`  SPARQL retry ${i + 1}: ${String(e).slice(0, 80)}`)
      await sleep(5000 * (i + 1))
    }
  }
  return []
}

const v = (b: any, k: string): string | undefined => b[k]?.value
const qidOf = (uri?: string) => uri?.split('/').pop()
const year = (iso?: string) => {
  if (!iso) return null
  const m = /^(-?)(\d{1,6})-/.exec(iso)
  if (!m) return null
  const y = Number(m[2]) * (m[1] ? -1 : 1)
  return y >= -50000 && y <= 2100 ? y : null
}
const norm = (s: string) =>
  s
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\(.*?\)/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()

// Titles that are never aesthetics (lists, people, institutions).
const REJECT = /\b(literature|poetry|poets?|literary|music|musical|opera|theat(re|er)|philosophy|novel|drama)\b|^(list of|index of|outline of|timeline of)\b|\b(company|corporation|university|school district|band|album|film|magazine|museum|foundation)\)?$/i

const { aesthetics, relations } = loadLibrary()
const haveQ = new Set(aesthetics.map((a) => a.wikidata).filter(Boolean) as string[])
// "Goth subculture" ≈ "Goth", "Brutalist architecture" ≈ "Brutalism": compare core names too.
const GENERIC = /\b(subculture|architecture|architectural|art|arts|movement|style|styles|fashion|music|aesthetic|aesthetics|painting|design|school|revival|period|the)\b/g
const core = (s: string) =>
  norm(s)
    .replace(GENERIC, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.replace(/(ism|ist|ists|ian|ic|al|s)$/, ''))
    .join(' ')
const haveNames = new Set(aesthetics.flatMap((a) => [a.name, ...a.aliases, a.wikipedia ?? '']).filter(Boolean).map(norm))
const haveCores = new Set(aesthetics.flatMap((a) => [a.name, ...a.aliases, a.wikipedia ?? '']).filter(Boolean).map(core).filter((c) => c.length > 2))
const bySlug = new Set(aesthetics.map((a) => a.slug))
const qidToSlug = new Map(aesthetics.filter((a) => a.wikidata).map((a) => [a.wikidata!, a.slug]))

interface Candidate {
  qid: string
  title: string
  cls: (typeof CLASSES)[number]
  start: number | null
  end: number | null
  countries: string[]
  influencedBy: string[]
  parents: string[]
  follows: string[]
  aliases: string[]
}
const candidates = new Map<string, Candidate>()

// 1) Light listing per class: item + English Wikipedia title (instances and instances of subclasses).
const listed = new Map<string, { title: string; cls: (typeof CLASSES)[number] }>()
// Classes that disqualify a page even when it also carries an allowed class.
const DENY = new Set(['Q5', 'Q188451', 'Q223393', 'Q201658', 'Q659563', 'Q15961987', 'Q3326717', 'Q12020884', 'Q28820001', 'Q2927074', 'Q7889', 'Q11424', 'Q7725634', 'Q3305213', 'Q41176', 'Q43229', 'Q4830453', 'Q13406463', 'Q4167410', 'Q215380', 'Q1194240', 'Q49773'])
if (FROM_CRAWL) {
  const cfg = JSON.parse(readFileSync(new URL('../../data/crawl-classes.json', import.meta.url), 'utf8')) as {
    classes: (typeof CLASSES)[number][]
    excludeTitles: string[]
    includeTitles?: { title: string; category: string; establishment: string; origin?: string }[]
  }
  const allow = cfg.classes
  const excluded = new Set(cfg.excludeTitles)
  // Reviewed one-off pages whose Wikidata class is too broad to allow-list.
  const picked = new Map((cfg.includeTitles ?? []).map((t) => [t.title, { qid: 'reviewed', label: t.category.toLowerCase(), ...t } as unknown as (typeof CLASSES)[number]]))
  const pages = JSON.parse(readFileSync(new URL('../../data/.cache/crawl.json', import.meta.url), 'utf8')) as { title: string; qid: string; p31: string[] }[]
  // Reviewed titles the crawl never reached: resolve their Wikidata items directly.
  const crawled = new Set(pages.map((p) => p.title))
  const missing = (cfg.includeTitles ?? []).map((t) => t.title).filter((t) => !crawled.has(t))
  for (let i = 0; i < missing.length; i += 40) {
    const res = await getJSON<any>(
      `https://en.wikipedia.org/w/api.php?${new URLSearchParams({ action: 'query', format: 'json', formatversion: '2', prop: 'pageprops', ppprop: 'wikibase_item', titles: missing.slice(i, i + 40).join('|') })}`,
      3,
      { headers: { 'User-Agent': 'Aestheticpedia/1.0 (https://github.com/Sidmaz666/aestheticpedia; open aesthetics encyclopedia) node' } }
    )
    for (const p of res?.query?.pages ?? []) if (p.pageprops?.wikibase_item) pages.push({ title: p.title, qid: p.pageprops.wikibase_item, p31: [] })
    await sleep(500)
  }
  for (const p of pages) {
    if (!p.qid || excluded.has(p.title) || p.p31.some((q) => DENY.has(q))) continue
    const cls = picked.get(p.title) ?? allow.find((c) => p.p31.includes(c.qid))
    if (!cls || REJECT.test(p.title) || /^(history|historiography|timeline|glossary) of\b/i.test(p.title)) continue
    if (haveQ.has(p.qid) || haveNames.has(norm(p.title)) || haveCores.has(core(p.title)) || listed.has(p.qid)) continue
    listed.set(p.qid, { title: p.title, cls })
  }
  console.log(`crawl: ${listed.size} new pages on the class allow-list`)
}
for (const cls of FROM_CRAWL ? [] : CLASSES) {
  const rows = await sparql(`
SELECT DISTINCT ?item ?title WHERE {
  ${cls.direct ? `?item wdt:P31 wd:${cls.qid} .` : `{ ?item wdt:P31 wd:${cls.qid} } UNION { ?item wdt:P31 ?sub . ?sub wdt:P279 wd:${cls.qid} }`}
  # Not visual aesthetics: music, literary, film, video-game and TV genres.
  FILTER NOT EXISTS { VALUES ?g { wd:Q188451 wd:Q223393 wd:Q201658 wd:Q659563 wd:Q15961987 wd:Q3326717 } ?item wdt:P31 ?g }
  ?article schema:about ?item ; schema:isPartOf <https://en.wikipedia.org/> ; schema:name ?title .
}`)
  let fresh = 0
  for (const b of rows) {
    const qid = qidOf(v(b, 'item'))!
    const title = v(b, 'title')!
    if (!qid || !title || REJECT.test(title) || haveQ.has(qid) || haveNames.has(norm(title)) || haveCores.has(core(title)) || listed.has(qid)) continue
    listed.set(qid, { title, cls })
    fresh++
  }
  console.log(`${cls.label}: ${rows.length} with enwiki, ${fresh} new`)
  await sleep(1500)
}

// 2) Details in batches (dates, origin, relations, aliases).
const ids = [...listed.keys()]
for (let i = 0; i < ids.length; i += 150) {
  const batch = ids.slice(i, i + 150)
  const rows = await sparql(`
SELECT ?item
  (SAMPLE(?inc) AS ?inception) (SAMPLE(?st) AS ?start) (SAMPLE(?en) AS ?end)
  (GROUP_CONCAT(DISTINCT ?countryLabel; separator="|") AS ?countries)
  (GROUP_CONCAT(DISTINCT ?inf; separator="|") AS ?influences)
  (GROUP_CONCAT(DISTINCT ?sup; separator="|") AS ?supers)
  (GROUP_CONCAT(DISTINCT ?fol; separator="|") AS ?follows)
  (GROUP_CONCAT(DISTINCT ?alias; separator="|") AS ?aliases)
WHERE {
  VALUES ?item { ${batch.map((q) => `wd:${q}`).join(' ')} }
  OPTIONAL { ?item wdt:P571 ?inc }
  OPTIONAL { ?item wdt:P580 ?st }
  OPTIONAL { ?item wdt:P582 ?en }
  OPTIONAL { ?item wdt:P495 ?country . ?country rdfs:label ?countryLabel FILTER(lang(?countryLabel) = "en") }
  OPTIONAL { ?item wdt:P737 ?inf }
  OPTIONAL { ?item wdt:P279 ?sup }
  OPTIONAL { ?item wdt:P155 ?fol }
  OPTIONAL { ?item skos:altLabel ?alias FILTER(lang(?alias) = "en") }
}
GROUP BY ?item`)
  const byQ = new Map(rows.map((b) => [qidOf(v(b, 'item'))!, b]))
  for (const qid of batch) {
    const b = byQ.get(qid) ?? {}
    const { title, cls } = listed.get(qid)!
    const split = (k: string) => (v(b, k) ?? '').split('|').filter(Boolean)
    candidates.set(qid, {
      qid,
      title,
      cls,
      start: year(v(b, 'inception')) ?? year(v(b, 'start')),
      end: year(v(b, 'end')),
      countries: split('countries'),
      influencedBy: split('influences').map(qidOf).filter(Boolean) as string[],
      parents: split('supers').map(qidOf).filter(Boolean) as string[],
      follows: split('follows').map(qidOf).filter(Boolean) as string[],
      aliases: split('aliases').filter((x) => x.length < 60 && !haveNames.has(norm(x))).slice(0, 6),
    })
  }
  console.log(`  details ${Math.min(i + 150, ids.length)}/${ids.length}`)
  await sleep(800)
}

// Wikipedia intros, 20 titles per request.
const extracts = new Map<string, { extract: string; description: string }>()
const titles = [...new Set([...candidates.values()].map((c) => c.title))]
for (let i = 0; i < titles.length; i += 20) {
  const batch = titles.slice(i, i + 20)
  const res = await getJSON<any>(
    `https://en.wikipedia.org/w/api.php?${new URLSearchParams({
      action: 'query',
      format: 'json',
      formatversion: '2',
      titles: batch.join('|'),
      prop: 'extracts|description|pageprops',
      exintro: '1',
      explaintext: '1',
      exlimit: '20',
      ppprop: 'disambiguation',
    })}`
  )
  for (const p of res.query?.pages ?? []) {
    if (p.missing || p.pageprops?.disambiguation !== undefined) continue
    extracts.set(p.title, { extract: String(p.extract ?? ''), description: String(p.description ?? '') })
  }
  await sleep(200)
}

const century = (y: number) => {
  if (y < 0) return `${Math.ceil(-y / 100)}${['th', 'st', 'nd', 'rd'][Math.ceil(-y / 100) % 10 > 3 || [11, 12, 13].includes(Math.ceil(-y / 100) % 100) ? 0 : Math.ceil(-y / 100) % 10]} century BCE`
  return y < 1800 ? `${Math.floor(y / 100) + 1}${['th', 'st', 'nd', 'rd'][(Math.floor(y / 100) + 1) % 10 > 3 || [11, 12, 13].includes((Math.floor(y / 100) + 1) % 100) ? 0 : (Math.floor(y / 100) + 1) % 10]} century` : `${Math.floor(y / 10) * 10}s`
}

const now = new Date().toISOString()
const created: AestheticRecord[] = []
for (const c of candidates.values()) {
  const ex = extracts.get(c.title)
  if (!ex || ex.extract.length < 80) continue // no usable article text
  const paras = ex.extract
    .split(/\n+/)
    .map((s) => s.trim())
    .filter((s) => s && !/^==/.test(s))
  const description = paras.join('\n\n').slice(0, 2400)
  const first = paras[0] ?? ''
  const summary = (first.match(/^.{40,320}?[.!?](?=\s|$)/)?.[0] ?? first.slice(0, 280)).trim()
  const name = c.title.replace(/\s*\(.*?\)\s*$/, '').trim()
  let slug = slugify(name)
  if (!slug) continue
  if (bySlug.has(slug)) slug = `${slug}-${slugify(c.cls.label)}`
  if (bySlug.has(slug)) continue
  bySlug.add(slug)
  const wpUrl = `https://en.wikipedia.org/wiki/${encodeURIComponent(c.title.replace(/ /g, '_'))}`
  const rec: AestheticRecord = {
    slug,
    name,
    aliases: c.aliases.filter((x) => norm(x) !== norm(name)),
    category: c.cls.category,
    subcategory: ex.description && ex.description.length < 80 ? ex.description.replace(/^./, (m) => m.toUpperCase()) : '',
    establishment: c.cls.establishment,
    status: 'draft',
    confidence: 60,
    // A reviewed title may name its origin when Wikidata has no country for it.
    origin: c.countries.slice(0, 3).join(', ') || (c.cls as { origin?: string }).origin || '',
    geography: c.countries.join(', ') || (c.cls as { origin?: string }).origin || '',
    periodStart: c.start !== null ? century(c.start) : '',
    periodEnd: c.end !== null ? century(c.end) : '',
    startYear: c.start,
    endYear: c.end !== null && c.start !== null && c.end >= c.start ? c.end : null,
    era: c.start !== null ? century(c.start) : '',
    summary,
    description,
    culturalContext: '',
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
    tags: [c.cls.label],
    images: [],
    sources: [
      { name: `Wikipedia — ${c.title}`, url: wpUrl, tier: 'B', check: { ok: true, status: 200, checkedAt: now } },
      { name: `Wikidata — ${c.qid}`, url: `https://www.wikidata.org/wiki/${c.qid}`, tier: 'B', check: { ok: true, status: 200, checkedAt: now } },
    ],
    references: [],
    wikidata: c.qid,
    wikipedia: c.title,
    popularity: 35,
    isNiche: false,
    dataQuality: 'moderately_documented',
    verifiedAt: null,
    createdAt: now,
    updatedAt: now,
  }
  created.push(rec)
  qidToSlug.set(c.qid, slug)
}

// Relations from Wikidata statements (only between records that exist).
const newRels: RelationRecord[] = []
const seen = new Set(relations.map((r) => `${r.from}|${r.to}|${r.type}`))
const add = (from: string, to: string | undefined, type: RelationRecord['type'], note: string) => {
  if (!to || from === to) return
  const k = `${from}|${to}|${type}`
  if (seen.has(k)) return
  seen.add(k)
  newRels.push({ from, to, type, note })
}
for (const c of candidates.values()) {
  const from = qidToSlug.get(c.qid)
  if (!from || !created.some((r) => r.slug === from)) continue
  for (const q of c.influencedBy) add(from, qidToSlug.get(q), 'influenced_by', 'Wikidata P737')
  for (const q of c.parents) add(from, qidToSlug.get(q), 'variant_of', 'Wikidata P279')
  for (const q of c.follows) add(from, qidToSlug.get(q), 'influenced_by', 'Follows (Wikidata P155)')
}

console.log(`\n${created.length} new records, ${newRels.length} new relations`)
const byCat = new Map<string, number>()
for (const r of created) byCat.set(r.category, (byCat.get(r.category) ?? 0) + 1)
console.log(Object.fromEntries(byCat))
console.log('sample:', created.slice(0, 15).map((r) => r.name).join(', '))
if (!DRY) {
  for (const r of created) saveAesthetic(r)
  saveRelations([...relations, ...newRels])
  console.log('✓ written')
}
