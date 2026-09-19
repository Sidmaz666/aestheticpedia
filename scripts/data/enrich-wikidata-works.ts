// Fill empty descriptive fields from Wikidata for records linked to a Wikidata item.
// Only empty fields are filled; nothing is overwritten; every value comes from Wikidata.
//
//   aliases      ← the item's English alternative labels (skos:altLabel)
//   subcategory  ← the item's English description ("architectural style in …")
//   keyExamples  ← the most notable works/buildings whose movement (P135) or architectural
//                  style (P149) is this item, ranked by Wikipedia sitelinks
//   materials    ← the most frequent materials (P186) of those works
//
//   node scripts/data/enrich-wikidata-works.ts
import { cache, getJSON, loadAesthetics, saveAesthetic, sleep } from './lib.ts'

const http = cache<unknown>('wikidata-works')
async function sparql(query: string): Promise<any[]> {
  const hit = http.get(query)
  if (hit) return hit as any[]
  for (let i = 0; i < 4; i++) {
    try {
      const res = await getJSON<any>(`https://query.wikidata.org/sparql?format=json&query=${encodeURIComponent(query)}`, 2, {
        headers: { Accept: 'application/sparql-results+json' },
      })
      http.set(query, res.results.bindings)
      return res.results.bindings
    } catch (e) {
      console.warn(`  SPARQL retry ${i + 1}: ${String(e).slice(0, 80)}`)
      await sleep(5000 * (i + 1))
    }
  }
  return []
}
const v = (b: any, k: string): string | undefined => b[k]?.value
const qidOf = (uri?: string) => uri?.split('/').pop() ?? ''
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()

const records = loadAesthetics().filter((a) => a.wikidata)
const byQ = new Map(records.map((a) => [a.wikidata!, a]))
const qids = [...byQ.keys()]
console.log(`${qids.length} records with a Wikidata item`)

const labels = new Map<string, { desc: string; aliases: string[] }>()
const works = new Map<string, { label: string; links: number; materials: string[] }[]>()

for (let i = 0; i < qids.length; i += 120) {
  const batch = qids.slice(i, i + 120)
  const values = batch.map((q) => `wd:${q}`).join(' ')
  const meta = await sparql(`
SELECT ?item (SAMPLE(?d) AS ?desc) (GROUP_CONCAT(DISTINCT ?alias; separator="|") AS ?aliases) WHERE {
  VALUES ?item { ${values} }
  OPTIONAL { ?item schema:description ?d FILTER(lang(?d) = "en") }
  OPTIONAL { ?item skos:altLabel ?alias FILTER(lang(?alias) = "en") }
} GROUP BY ?item`)
  for (const b of meta) labels.set(qidOf(v(b, 'item')), { desc: v(b, 'desc') ?? '', aliases: (v(b, 'aliases') ?? '').split('|').filter(Boolean) })

  const rows = await sparql(`
SELECT ?style ?work ?workLabel ?links (GROUP_CONCAT(DISTINCT ?matLabel; separator="|") AS ?mats) WHERE {
  VALUES ?style { ${values} }
  { ?work wdt:P135 ?style } UNION { ?work wdt:P149 ?style }
  ?work wikibase:sitelinks ?links .
  FILTER(?links >= 4)
  ?work rdfs:label ?workLabel FILTER(lang(?workLabel) = "en")
  OPTIONAL { ?work wdt:P186 ?mat . ?mat rdfs:label ?matLabel FILTER(lang(?matLabel) = "en") }
} GROUP BY ?style ?work ?workLabel ?links`)
  for (const b of rows) {
    const q = qidOf(v(b, 'style'))
    if (!works.has(q)) works.set(q, [])
    works.get(q)!.push({ label: v(b, 'workLabel')!, links: Number(v(b, 'links')), materials: (v(b, 'mats') ?? '').split('|').filter(Boolean) })
  }
  console.log(`  ${Math.min(i + 120, qids.length)}/${qids.length}`)
  await sleep(600)
}

// Wikidata material labels that describe supports or generic media rather than materials.
const NOT_MATERIAL = /^(material|object|paper|canvas|panel|surface|medium)$/i
let filled = { aliases: 0, subcategory: 0, keyExamples: 0, materials: 0 }
for (const [q, a] of byQ) {
  let changed = false
  const meta = labels.get(q)
  if (meta) {
    if (!a.aliases.length && meta.aliases.length) {
      a.aliases = meta.aliases.filter((x) => x.length < 60 && norm(x) !== norm(a.name)).slice(0, 6)
      if (a.aliases.length) (filled.aliases++, (changed = true))
    }
    if (!a.subcategory && meta.desc && meta.desc.length < 90 && !/^wikimedia/i.test(meta.desc)) {
      a.subcategory = meta.desc.replace(/^./, (m) => m.toUpperCase())
      filled.subcategory++
      changed = true
    }
  }
  const ws = (works.get(q) ?? []).sort((x, y) => y.links - x.links)
  if (!a.keyExamples.length && ws.length) {
    const seen = new Set<string>()
    a.keyExamples = ws.map((w) => w.label).filter((l) => !/^Q\d+$/.test(l) && !seen.has(l) && seen.add(l)).slice(0, 8)
    if (a.keyExamples.length) (filled.keyExamples++, (changed = true))
  }
  if (!a.materials.length && ws.length) {
    const count = new Map<string, number>()
    for (const w of ws) for (const m of w.materials) if (!NOT_MATERIAL.test(m)) count.set(m, (count.get(m) ?? 0) + 1)
    a.materials = [...count.entries()].sort((x, y) => y[1] - x[1]).slice(0, 6).map(([m]) => m)
    if (a.materials.length) (filled.materials++, (changed = true))
  }
  if (changed) {
    a.updatedAt = new Date().toISOString()
    saveAesthetic(a)
  }
}
console.log('✓ filled', filled)
