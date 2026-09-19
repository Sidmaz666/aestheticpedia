// Fill missing origin and period from Wikidata for records linked to a Wikidata item.
//   origin/geography ← country of origin (P495), country (P17), location (P276), location of creation (P1071)
//   period           ← inception (P571) / start time (P580) / time of invention (P575) / earliest
//                      written record (P1249), else time period (P2348) + its start
// Only empty fields are filled; nothing is overwritten.
//
//   node scripts/data/enrich-wikidata.ts
import { cache, getJSON, loadAesthetics, saveAesthetic, sleep } from './lib.ts'

const http = cache<unknown>('wikidata')
async function sparql(q: string): Promise<any[]> {
  const hit = http.get(q)
  if (hit) return hit as any[]
  const res = await getJSON<any>(`https://query.wikidata.org/sparql?format=json&query=${encodeURIComponent(q)}`, 3, {
    headers: { Accept: 'application/sparql-results+json' },
  })
  http.set(q, res.results.bindings)
  return res.results.bindings
}

const year = (iso?: string) => {
  const m = iso ? /^(-?)(\d{1,6})-/.exec(iso) : null
  if (!m) return null
  const y = Number(m[2]) * (m[1] ? -1 : 1)
  return y >= -50000 && y <= 2100 ? y : null
}
const label = (y: number) => (y < 0 ? `${-y} BCE` : y < 1800 ? `${Math.floor(y / 100) + 1}th century`.replace(/^1th/, '1st').replace(/^2th/, '2nd').replace(/^3th/, '3rd').replace(/^(\d*1)1th/, '$11th') : `${Math.floor(y / 10) * 10}s`)

const todo = loadAesthetics().filter((a) => a.wikidata && (!a.origin || (!a.periodStart && a.startYear === null)))
console.log(`${todo.length} records to enrich`)
const byQ = new Map(todo.map((a) => [a.wikidata!, a]))
const ids = [...byQ.keys()]
let filledOrigin = 0
let filledPeriod = 0
for (let i = 0; i < ids.length; i += 150) {
  const batch = ids.slice(i, i + 150)
  const rows = await sparql(`
SELECT ?item
  (GROUP_CONCAT(DISTINCT ?placeLabel; separator="|") AS ?places)
  (SAMPLE(?inc) AS ?inception) (SAMPLE(?st) AS ?start) (SAMPLE(?inv) AS ?invented) (SAMPLE(?rec) AS ?recorded)
  (SAMPLE(?periodLabel) AS ?period) (SAMPLE(?pst) AS ?periodStart)
WHERE {
  VALUES ?item { ${batch.map((q) => `wd:${q}`).join(' ')} }
  OPTIONAL { ?item wdt:P495|wdt:P17|wdt:P276|wdt:P1071 ?place . ?place rdfs:label ?placeLabel FILTER(lang(?placeLabel) = "en") }
  OPTIONAL { ?item wdt:P571 ?inc }
  OPTIONAL { ?item wdt:P580 ?st }
  OPTIONAL { ?item wdt:P575 ?inv }
  OPTIONAL { ?item wdt:P1249 ?rec }
  OPTIONAL { ?item wdt:P2348 ?p . ?p rdfs:label ?periodLabel FILTER(lang(?periodLabel) = "en") OPTIONAL { ?p wdt:P580|wdt:P571 ?pst } }
}
GROUP BY ?item`)
  for (const b of rows) {
    const q = String(b.item?.value ?? '').split('/').pop()!
    const a = byQ.get(q)
    if (!a) continue
    let changed = false
    const places = String(b.places?.value ?? '').split('|').filter(Boolean)
    if (!a.origin && places.length) {
      a.origin = places.slice(0, 3).join(', ')
      if (!a.geography) a.geography = places.join(', ')
      filledOrigin++
      changed = true
    }
    if (!a.periodStart && a.startYear === null) {
      const y = year(b.inception?.value) ?? year(b.start?.value) ?? year(b.invented?.value) ?? year(b.recorded?.value) ?? year(b.periodStart?.value)
      const period = b.period?.value as string | undefined
      if (y !== null) {
        a.startYear = y
        a.periodStart = period ?? label(y)
        if (!a.era) a.era = label(y)
        filledPeriod++
        changed = true
      } else if (period) {
        a.periodStart = period
        filledPeriod++
        changed = true
      }
    }
    if (changed) {
      a.updatedAt = new Date().toISOString()
      saveAesthetic(a)
    }
  }
  await sleep(800)
}
console.log(`✓ origin filled for ${filledOrigin}, period for ${filledPeriod}`)
