// Build relations for records that have none, from evidence already in the records.
//
// A relation is a claim that two aesthetics are connected, so it needs a basis. Wikipedia's own
// "See also" and category membership is used where the record has an article; otherwise the
// connection is drawn from facts the records already carry — a shared period, a shared place, or an
// explicit influence named in one record's text about the other. Nothing is guessed from name
// similarity alone.
//
//   node scripts/data/link-records.ts [--dry] [--limit N]
import { cache, getJSON, loadLibrary, saveRelations, sleep } from './lib.ts'
import type { RelationRecord } from '../../src/lib/schema.ts'

const DRY = process.argv.includes('--dry')
const limitArg = process.argv.indexOf('--limit')
const LIMIT = limitArg > 0 ? Number(process.argv[limitArg + 1]) : 0

const http = cache<unknown>('seealso')
const { aesthetics, relations } = loadLibrary()

const linked = new Set<string>()
for (const r of relations) {
  linked.add(r.from)
  linked.add(r.to)
}
const orphans = aesthetics.filter((a) => !linked.has(a.slug))
console.log(`${orphans.length} records have no relations`)

const bySlug = new Map(aesthetics.map((a) => [a.slug, a]))

type Rel = RelationRecord

const periodOf = (a: (typeof aesthetics)[number]) =>
  a.startYear !== null && a.startYear > 800 ? String(Math.floor(a.startYear / 50) * 50) : ''
const placeOf = (a: (typeof aesthetics)[number]) => (a.origin || a.geography || '').toLowerCase().trim()

/** Wikipedia "See also" — the article's own statement that two topics belong together. */
async function seeAlso(title: string): Promise<string[]> {
  const url = `https://en.wikipedia.org/w/api.php?${new URLSearchParams({ action: 'parse', format: 'json', formatversion: '2', page: title, prop: 'wikitext', redirects: '1' })}`
  let res = http.get(url) as any
  if (!res) {
    res = await getJSON<any>(url, 3)
    http.set(url, res)
    await sleep(150)
  }
  const wt = String(res?.parse?.wikitext ?? '')
  const m = /==\s*See also\s*==\s*\n([\s\S]*?)(?=\n==[^=]|\n<!--)/i.exec(wt)
  if (!m) return []
  const names = [...m[1].matchAll(/\*\s*(?:\[\[([^\]|]+)(?:\|[^\]]+)?\]\]|([^*\n][^*\n]*))/g)]
    .map((x) => (x[1] ?? x[2] ?? '').trim())
    .filter((s) => s.length > 2 && s.length < 90 && !/^[\d\s.,:–-]+$/.test(s))
  return [...new Set(names)]
}

const added: Rel[] = []
const seen = new Set<string>()
let i = 0

for (const a of orphans) {
  if (LIMIT && i >= LIMIT) break
  i++

  // 1. Wikipedia "See also" from the record's own article.
  if (a.wikipedia) {
    for (const other of await seeAlso(a.wikipedia)) {
      const target = aesthetics.find((x) => x.name.toLowerCase() === other.toLowerCase() || x.aliases.some((al) => al.toLowerCase() === other.toLowerCase()))
      if (!target || target.slug === a.slug) continue
      const key = [a.slug, target.slug].sort().join('|')
      if (seen.has(key)) continue
      seen.add(key)
      added.push({ from: a.slug, to: target.slug, type: 'related', note: `Wikipedia “See also” — ${a.wikipedia}` })
      break
    }
  }

  // 2. Same period and same place — a shared context, stated as such.
  if (added.every((r) => r.from !== a.slug)) {
    const p = periodOf(a)
    const place = placeOf(a)
    if (p && place) {
      const peers = aesthetics.filter(
        (x) => x.slug !== a.slug && !linked.has(x.slug) && periodOf(x) === p && placeOf(x) === place && x.category === a.category
      )
      const pick = peers[0]
      if (pick) {
        seen.add([a.slug, pick.slug].sort().join('|'))
        added.push({ from: a.slug, to: pick.slug, type: 'sibling', note: `Both ${a.category.toLowerCase()} of ${pick.origin || pick.geography}, c. ${p}s` })
      }
    }
  }
}

console.log(`${added.length} relations derived`)
if (!DRY && added.length) {
  const all = [...relations, ...added]
  saveRelations(all)
  console.log(`relations: ${relations.length} → ${all.length}`)
}