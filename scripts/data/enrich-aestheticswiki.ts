// Fill empty fields of Aesthetics Wiki records from the article's infobox (CC BY-SA; the
// article is already cited as a source). Only empty fields are filled:
//   origin/geography ← "location of origin"
//   aliases          ← "other names"
//   keyExamples      ← "iconic figures", "related media", "related brands"
//   periodStart/era  ← "decade of origin" (when no period is recorded yet)
//
//   node scripts/data/enrich-aestheticswiki.ts
import { cache, getJSON, loadAesthetics, saveAesthetic, sleep } from './lib.ts'
import { parseYear } from './years.ts'

const API = 'https://aesthetics.fandom.com/api.php'
const http = cache<unknown>('aestheticswiki')
async function parse(title: string): Promise<string> {
  const url = `${API}?${new URLSearchParams({ format: 'json', action: 'parse', page: title, prop: 'text', section: '0', redirects: '1' })}`
  let res = http.get(url) as any
  if (!res) {
    try {
      res = await getJSON(url)
      http.set(url, res)
      await sleep(250)
    } catch {
      return ''
    }
  }
  return res?.parse?.text?.['*'] ?? ''
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
  [...new Set(s.split(/,|;|•/).map((x) => x.replace(/\(.*?\)/g, '').trim()).filter((x) => x.length > 1 && x.length < 70))].slice(0, max)

const wikiTitle = (url: string) => decodeURIComponent(url.split('/wiki/')[1] ?? '').replace(/_/g, ' ')
const filled = { origin: 0, aliases: 0, keyExamples: 0, period: 0 }
for (const a of loadAesthetics()) {
  const src = a.sources.find((s) => /aesthetics\.fandom\.com\/wiki\//.test(s.url ?? ''))
  if (!src) continue
  const need = !a.origin || !a.aliases.length || !a.keyExamples.length || (!a.periodStart && a.startYear === null)
  if (!need) continue
  const html = await parse(wikiTitle(src.url!))
  if (!html) continue
  let changed = false
  const loc = infobox(html, 'location_of_origin')
  if (!a.origin && loc && loc.length < 90) {
    a.origin = loc
    if (!a.geography || a.geography === 'Online') a.geography = loc
    filled.origin++
    changed = true
  }
  if (!a.aliases.length) {
    const names = list(infobox(html, 'other_names'), 6).filter((n) => n.toLowerCase() !== a.name.toLowerCase())
    if (names.length) {
      a.aliases = names
      filled.aliases++
      changed = true
    }
  }
  if (!a.keyExamples.length) {
    const ex = [...list(infobox(html, 'iconic_figures'), 5), ...list(infobox(html, 'related_media'), 5), ...list(infobox(html, 'related_brands'), 4)]
    const uniq = [...new Set(ex)].slice(0, 10)
    if (uniq.length) {
      a.keyExamples = uniq
      filled.keyExamples++
      changed = true
    }
  }
  if (!a.periodStart && a.startYear === null) {
    const decade = infobox(html, 'decade_of_origin')
    const y = decade ? parseYear(decade, 'start') : null
    if (decade && y !== null) {
      a.periodStart = decade.slice(0, 80)
      a.startYear = y
      if (!a.era) a.era = decade.slice(0, 40)
      filled.period++
      changed = true
    }
  }
  if (changed) {
    a.updatedAt = new Date().toISOString()
    saveAesthetic(a)
  }
}
console.log('✓ filled', filled)
