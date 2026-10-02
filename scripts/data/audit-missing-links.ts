// Completeness check: find records that should be linked to a Wikipedia article or Wikidata item
// but are not. For each unlinked record, search Wikipedia for an article whose title matches the
// record's name (or a close variant). When an exact/near-exact match exists, the record was simply
// missed by an earlier import — link it so the site can show the article, the dates and the images.
//
// Prints candidates and, unless --dry is passed, writes the link onto the record.
//
//   node scripts/data/audit-missing-links.ts [--dry]
import { getJSON, loadAesthetics, saveAesthetic, slugify, sleep } from './lib.ts'

const DRY = process.argv.includes('--dry')
const UA = { 'User-Agent': 'Aestheticpedia/1.0 (https://github.com/Sidmaz666/aestheticpedia; open aesthetics encyclopedia) node' }

const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/[‘’]/g, "'")
    .replace(/\b(aesthetic|aesthetics|style|design|movement|art|style of|the)\b/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()

const unlinked = loadAesthetics().filter((a) => !a.wikipedia && !a.wikidata)
console.log(`${unlinked.length} records have no Wikipedia/Wikidata link`)

const found: { slug: string; name: string; title: string; qid: string | null }[] = []

for (let i = 0; i < unlinked.length; i++) {
  const a = unlinked[i]
  const queries = [a.name, slugify(a.name).replace(/-/g, ' ')].filter(Boolean)
  let hit: { title: string; qid: string | null } | null = null
  for (const q of [...new Set(queries)]) {
    let res: any
    try {
      res = await getJSON<any>(
        `https://en.wikipedia.org/w/api.php?${new URLSearchParams({
          action: 'query',
          format: 'json',
          formatversion: '2',
          redirects: '1',
          list: 'search',
          srsearch: q,
          srlimit: '5',
          srnamespace: '0',
        })}`,
        3,
        { headers: UA }
      )
    } catch {
      continue
    }
    const target = norm(a.name)
    for (const r of res.query?.search ?? []) {
      const t = r.title
      // Only accept a title that is essentially the record's name, and is not a disambiguation page.
      const tn = norm(t)
      if (!tn || tn !== target) continue
      if (/\(disambiguation\)/i.test(t)) continue
      let qid: string | null = null
      try {
        const p = await getJSON<any>(
          `https://en.wikipedia.org/w/api.php?${new URLSearchParams({ action: 'query', format: 'json', formatversion: '2', titles: t, prop: 'pageprops', ppprop: 'wikibase_item' })}`,
          3,
          { headers: UA }
        )
        qid = p.query?.pages?.[0]?.pageprops?.wikibase_item ?? null
      } catch {
        /* no qid is fine */
      }
      hit = { title: t, qid }
      break
    }
    if (hit) break
    await sleep(120)
  }
  if (hit) {
    found.push({ slug: a.slug, name: a.name, title: hit.title, qid: hit.qid })
    console.log(`  ${a.slug} → ${hit.title}${hit.qid ? ` (${hit.qid})` : ''}`)
  }
  if ((i + 1) % 50 === 0) console.log(`  …${i + 1}/${unlinked.length}`)
}

console.log(`\n${found.length} records could be linked to a matching article`)
if (!DRY) {
  const byslug = new Map(loadAesthetics().map((a) => [a.slug, a]))
  for (const f of found) {
    const a = byslug.get(f.slug)
    if (!a) continue
    a.wikipedia = f.title
    if (f.qid && !a.wikidata) a.wikidata = f.qid
    if (!a.sources.some((s) => s.url?.includes('en.wikipedia.org'))) {
      a.sources.unshift({ name: `Wikipedia — ${f.title}`, url: `https://en.wikipedia.org/wiki/${encodeURIComponent(f.title.replace(/ /g, '_'))}`, tier: 'B' })
    }
    a.updatedAt = new Date().toISOString()
    saveAesthetic(a)
  }
  console.log(`linked ${found.length} records`)
}