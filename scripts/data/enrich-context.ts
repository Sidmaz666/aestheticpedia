// Fill empty culturalContext from the record's own Wikipedia article: the opening of its
// History / Origins / Background / Development section (plain text, cited to the article).
// Only empty fields are filled.
//
//   node scripts/data/enrich-context.ts
import { cache, getJSON, loadAesthetics, pool, saveAesthetic } from './lib.ts'

const http = cache<unknown>('wp-fulltext')
// Most articles document the aesthetic under a history heading, but plenty describe it under
// "Aesthetic", "Characteristics", "Elements" or "Style" instead — and leave those records empty.
const HEADINGS = /^(history|origins?|background|development|historical background|early history|history and development|emergence|origin and history|overview)$/i
const DESCRIPTIVE =
  /^(aesthetic|characteristics?|elements?|style|taste|description|overview|significance|legacy|influence|character|appearance|design|features?|concepts?|practice|context|genre|form|look|summary|introduction|main characteristics|visual language)$/i

async function article(title: string): Promise<string> {
  const url = `https://en.wikipedia.org/w/api.php?${new URLSearchParams({ action: 'query', format: 'json', formatversion: '2', prop: 'extracts', explaintext: '1', redirects: '1', titles: title })}`
  let res = http.get(url) as any
  if (!res) {
    res = await getJSON(url)
    http.set(url, res)
  }
  return String(res?.query?.pages?.[0]?.extract ?? '')
}

function contextFrom(text: string): string {
  // Split into "== Heading ==" sections; take the best matching top-level section.
  const parts = text.split(/\n(={2,3})\s*([^=\n]+?)\s*\1\n/)
  const found: { rank: number; body: string }[] = []
  for (let i = 1; i + 2 < parts.length; i += 3) {
    if (parts[i] !== '==') continue
    const heading = parts[i + 1].trim()
    const rank = HEADINGS.test(heading) ? 0 : DESCRIPTIVE.test(heading) ? 1 : -1
    if (rank < 0) continue
    const paras = parts[i + 2]
      .split(/\n+/)
      .map((p) => p.trim())
      .filter((p) => p.length > 80 && !/^=/.test(p))
    let out = ''
    for (const p of paras) {
      if (out.length + p.length > 1100) break
      out += (out ? '\n\n' : '') + p
    }
    if (!out && paras[0]) out = paras[0].slice(0, 1100).replace(/\s+\S*$/, '') + '…'
    if (out) found.push({ rank, body: out })
  }
  found.sort((a, b) => a.rank - b.rank)
  return found[0]?.body ?? ''
}

const todo = loadAesthetics().filter((a) => !a.culturalContext && a.wikipedia)
console.log(`${todo.length} records to check`)
let filled = 0
let done = 0
await pool(todo, 4, async (a) => {
  try {
    const ctx = contextFrom(await article(a.wikipedia!))
    if (ctx) {
      a.culturalContext = ctx
      a.updatedAt = new Date().toISOString()
      saveAesthetic(a)
      filled++
    }
  } catch (e) {
    console.error(`✗ ${a.slug}: ${String(e).slice(0, 80)}`)
  }
  if (++done % 250 === 0) console.log(`  ${done}/${todo.length} · ${filled} filled`)
})
console.log(`✓ cultural context for ${filled} records`)
