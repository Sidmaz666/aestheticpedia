// Fill aliases and keyExamples from Wikidata for records that have an item but no such field.
//   aliases     ← alt labels (P1449) / also known as (P1477), excluding the record's own name
//   keyExamples ← notable work (P800), English label only
//   era         ← derived from the record's own startYear, labelled as derived
//
// Only empty fields are written; nothing is overwritten. See scripts/data/lib.ts for the cache.
//
//   node scripts/data/enrich-wikidata-fields.ts
import { cache, getJSON, loadAesthetics, saveAesthetic, sleep } from './lib.ts'

const http = cache<unknown>('wikidata-fields')

async function sparql(q: string): Promise<any[]> {
  const hit = http.get(q)
  if (hit) return hit as any[]
  const res = await getJSON<any>(`https://query.wikidata.org/sparql?format=json&query=${encodeURIComponent(q)}`, 4, {
    headers: { Accept: 'application/sparql-results+json' },
  })
  http.set(q, res.results.bindings)
  return res.results.bindings
}

const all = loadAesthetics()
const todo = all.filter((a) => a.wikidata && (!a.aliases.length || !a.keyExamples.length))
console.log(`${todo.length} records to enrich`)
const byQ = new Map<string, typeof todo>()
for (const a of todo) {
  if (!byQ.has(a.wikidata!)) byQ.set(a.wikidata!, [])
  byQ.get(a.wikidata!)!.push(a)
}
const ids = [...byQ.keys()]
console.log(`${ids.length} distinct Wikidata items`)

const filled = { aliases: 0, keyExamples: 0, era: 0 }

for (let i = 0; i < ids.length; i += 100) {
  const batch = ids.slice(i, i + 100)
  const rows = await sparql(`
SELECT ?item
  (GROUP_CONCAT(DISTINCT ?altLabel; separator="|") AS ?aliases)
  (GROUP_CONCAT(DISTINCT ?workLabel; separator="|") AS ?works)
WHERE {
  VALUES ?item { ${batch.map((q) => `wd:${q}`).join(' ')} }
  OPTIONAL {
    ?item skos:altLabel ?altLabel . FILTER(lang(?altLabel) = "en")
  }
  OPTIONAL {
    ?item wdt:P800 ?work . ?work rdfs:label ?workLabel FILTER(lang(?workLabel) = "en")
  }
}
GROUP BY ?item`)
  for (const b of rows) {
    const q = String(b.item?.value ?? '').split('/').pop()!
    const records = byQ.get(q)
    if (!records) continue
    const aliases = String(b.aliases?.value ?? '').split('|').filter(Boolean)
    const works = String(b.works?.value ?? '').split('|').filter(Boolean)
    for (const a of records) {
      let dirty = false
      if (!a.aliases.length && aliases.length) {
        // Keep names that differ from the record's own, and are not just a parenthetical restatement.
        const extra = aliases
          .filter((x) => x.toLowerCase() !== a.name.toLowerCase())
          .filter((x) => !a.name.toLowerCase().includes(x.toLowerCase()))
          .slice(0, 6)
        if (extra.length) {
          a.aliases = extra
          filled.aliases++
          dirty = true
        }
      }
      if (!a.keyExamples.length && works.length) {
        const picks = works.slice(0, 4)
        if (picks.length) {
          a.keyExamples = picks
          filled.keyExamples++
          dirty = true
        }
      }
      // era is a display label for a year we already hold — derived, not asserted.
      if (!a.era && a.startYear !== null) {
        const y = a.startYear
        a.era = y < 0 ? `${-y} BCE` : y < 1800 ? `${Math.floor(y / 100) + 1}th century` : `${Math.floor(y / 10) * 10}s`
        filled.era++
        dirty = true
      }
      if (dirty) {
        a.updatedAt = new Date().toISOString()
        saveAesthetic(a)
      }
    }
  }
  if ((i / 100) % 5 === 0) console.log(`  ${i + batch.length}/${ids.length}`, filled)
  await sleep(700)
}
console.log('✓ filled', filled)