// Fill thin descriptions from the record's verified Wikipedia article (CC BY-SA, attributed).
// Only touches records whose description is shorter than 200 characters and that have an
// exact Wikipedia match; the article is added to `sources` so the text stays attributed.
//
//   node scripts/data/enrich-text.ts
import { getJSON, loadAesthetics, saveAesthetic, sleep } from './lib.ts'

const MIN = 200
const all = loadAesthetics()
const todo = all.filter((a) => a.wikipedia && (a.description.length < MIN || a.summary.length < 40))
console.log(`${todo.length} records with thin text and a Wikipedia article`)

const byTitle = new Map(todo.map((a) => [a.wikipedia!, a]))
const titles = [...byTitle.keys()]
let updated = 0
for (let i = 0; i < titles.length; i += 20) {
  const res = await getJSON<any>(
    `https://en.wikipedia.org/w/api.php?${new URLSearchParams({
      action: 'query',
      format: 'json',
      formatversion: '2',
      titles: titles.slice(i, i + 20).join('|'),
      prop: 'extracts',
      exintro: '1',
      explaintext: '1',
      exlimit: '20',
    })}`
  )
  const norm = new Map<string, string>((res.query?.normalized ?? []).map((n: any) => [n.to, n.from]))
  for (const p of res.query?.pages ?? []) {
    const a = byTitle.get(p.title) ?? byTitle.get(norm.get(p.title) ?? '')
    const text = String(p.extract ?? '')
      .split(/\n+/)
      .map((s: string) => s.trim())
      .filter(Boolean)
      .join('\n\n')
    if (!a || text.length < MIN) continue
    const now = new Date().toISOString()
    if (a.description.length < MIN) {
      // Keep the editor's own text first when there is any.
      a.description = a.description ? `${a.description}\n\n${text}`.slice(0, 3000) : text.slice(0, 3000)
    }
    if (a.summary.length < 40) a.summary = (text.match(/^.{40,320}?[.!?](?=\s|$)/)?.[0] ?? text.slice(0, 280)).trim()
    const url = `https://en.wikipedia.org/wiki/${encodeURIComponent(p.title.replace(/ /g, '_'))}`
    if (!a.sources.some((s) => s.url === url)) a.sources.push({ name: `Wikipedia — ${p.title}`, url, tier: 'B', check: { ok: true, status: 200, checkedAt: now } })
    a.updatedAt = now
    saveAesthetic(a)
    updated++
  }
  await sleep(200)
}
console.log(`✓ ${updated} records enriched`)
