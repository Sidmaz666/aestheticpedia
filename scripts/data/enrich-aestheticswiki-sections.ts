// Fill empty descriptive fields of Aesthetics Wiki records from the article's own sections
// (CC BY-SA; the article is already cited as the record's source). Only empty fields are
// filled and every value is text from the article:
//   visualDNA     ← "Visuals" / "Imagery" / "Characteristics" (prose, per subsection)
//   objects       ← infobox "key motifs", else the Visuals section's list items
//   fashion       ← "Fashion" / "Clothing" / "Style" (per subsection: Tops, Shoes, Hair and Make-Up…)
//   environment   ← "Interior Design" / "Decor" / "Home" / "Places" / "Architecture and Interiors"
//   architecture, photography, graphicDesign, typography ← sections of those names
//   sounds        ← "Music" list items (artists, genres, songs; the wiki playlist is skipped)
//   keyExamples   ← "Media" list items (films, books, games…)
//   recipe        ← { activities: "Activities" list items }
//   culturalContext ← "History" / "Origins" / "Background" prose
//   startYear/periodStart ← an explicit "emerged / originated / coined … in 2014" statement in that prose
//
//   node scripts/data/enrich-aestheticswiki-sections.ts [--dry]
import { cache, getJSON, loadAesthetics, saveAesthetic, sleep } from './lib.ts'

const DRY = process.argv.includes('--dry')
const API = 'https://aesthetics.fandom.com/api.php'
const http = cache<unknown>('aestheticswiki-full')
async function page(title: string): Promise<string> {
  const url = `${API}?${new URLSearchParams({ format: 'json', action: 'parse', page: title, prop: 'text', redirects: '1' })}`
  let res = http.get(url) as any
  if (!res) {
    try {
      res = await getJSON(url, 3, { headers: { 'User-Agent': 'Aestheticpedia/1.0 (https://github.com/Sidmaz666/aestheticpedia; open aesthetics encyclopedia) node' } })
      http.set(url, res)
      await sleep(300)
    } catch {
      return ''
    }
  }
  return res?.parse?.text?.['*'] ?? ''
}

const decode = (s: string) =>
  s
    .replace(/<sup[\s\S]*?<\/sup>/gi, '')
    .replace(/<br\s*\/?>/gi, ', ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&#x27;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(Number(d)))
    .replace(/\[\d+\]|\[citation needed\]/g, '')
    .replace(/\s+([,.;:!?])/g, '$1')
    .replace(/\s+/g, ' ')
    .trim()
const clip = (s: string, n: number) => (s.length <= n ? s : s.slice(0, n).replace(/\s+\S*$/, '') + '…')

type Sec = { level: number; title: string; html: string; children: Sec[] }
function sections(html: string): Sec[] {
  const parts = html.split(/<h([234])[^>]*>([\s\S]*?)<\/h\1>/)
  const flat: Sec[] = []
  for (let i = 1; i + 2 < parts.length + 1; i += 3) {
    // Only article headings carry an mw-headline; infobox and contents headings do not.
    const headline = /<span class="mw-headline"[^>]*>([\s\S]*?)<\/span>/.exec(parts[i + 1])
    if (!headline) continue
    flat.push({ level: Number(parts[i]), title: decode(headline[1]), html: parts[i + 2] ?? '', children: [] })
  }
  const top: Sec[] = []
  for (const s of flat) {
    if (s.level === 2 || !top.length) top.push(s)
    else top[top.length - 1].children.push(s)
  }
  return top
}
function paragraphs(html: string) {
  return [...html.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g)].map((m) => decode(m[1])).filter((t) => t.length > 40)
}
function items(html: string, max = 16, maxLen = 90) {
  return [
    ...new Set(
      [...html.matchAll(/<li(?![^>]*gallerybox)[^>]*>([\s\S]*?)<\/li>/g)]
        .map((m) => decode(m[1].replace(/<ul[\s\S]*$/, '')))
        .filter((t) => t.length > 1 && t.length <= maxLen && !/^\^|^Jump up|^↑/.test(t))
    ),
  ].slice(0, max)
}
const find = (secs: Sec[], re: RegExp) => secs.find((s) => re.test(s.title))
/** A section as key → text: its prose, then each subsection's prose or list. */
function record(sec: Sec, maxKeys = 8): Record<string, string> {
  const out: Record<string, string> = {}
  const own = paragraphs(sec.html)
  const ownItems = items(sec.html, 14, 120)
  if (own.length) out.Overview = clip(own.slice(0, 2).join(' '), 700)
  else if (ownItems.length) out.Overview = clip(ownItems.join('; '), 500)
  for (const c of sec.children) {
    if (Object.keys(out).length >= maxKeys) break
    const p = paragraphs(c.html)
    const li = items(c.html, 14, 120)
    const text = p.length ? clip(p.slice(0, 2).join(' '), 500) : li.length ? clip(li.join('; '), 400) : ''
    if (text && !/playlist/i.test(c.title)) out[c.title] = text
  }
  return out
}
function infobox(html: string, key: string): string {
  const m = new RegExp(`data-source="${key}"[^>]*>[\\s\\S]*?<div class="pi-data-value[^"]*"[^>]*>([\\s\\S]*?)</div>`).exec(html)
  return m ? decode(m[1]) : ''
}
const splitList = (s: string, max = 14) =>
  [...new Set(s.split(/,|;|•/).map((x) => x.replace(/\(.*?\)/g, '').trim()).filter((x) => x.length > 1 && x.length < 60))].slice(0, max)

const empty = (v: unknown) => v == null || (Array.isArray(v) ? v.length === 0 : typeof v === 'object' ? Object.keys(v as object).length === 0 : v === '')
const wikiTitle = (url: string) => decodeURIComponent(url.split('/wiki/')[1] ?? '').replace(/_/g, ' ')
const filled: Record<string, number> = {}
const bump = (k: string) => (filled[k] = (filled[k] ?? 0) + 1)
let seen = 0
let shown = 0

for (const a of loadAesthetics()) {
  const src = a.sources.find((s) => /aesthetics\.fandom\.com\/wiki\//.test(s.url ?? ''))
  if (!src) continue
  const fields = ['visualDNA', 'objects', 'fashion', 'environment', 'architecture', 'photography', 'graphicDesign', 'typography', 'sounds', 'keyExamples', 'recipe', 'culturalContext'] as const
  if (!fields.some((f) => empty(a[f])) && a.startYear !== null) continue
  const html = await page(wikiTitle(src.url!))
  if (!html) continue
  if (++seen % 100 === 0) console.log(`  ${seen} articles read`)
  const secs = sections(html)
  let changed = false
  const added: Record<string, unknown> = {}
  const set = <K extends (typeof fields)[number]>(k: K, v: (typeof a)[K]) => {
    if (!empty(a[k]) || empty(v)) return
    a[k] = v
    added[k] = v
    bump(k)
    changed = true
  }

  const visuals = find(secs, /^(visuals?|imagery|characteristics|aesthetics?|motifs|appearance)$/i)
  if (visuals) set('visualDNA', record(visuals))
  const motifs = splitList(infobox(html, 'key_motifs'))
  set('objects', motifs.length ? motifs : visuals ? items(visuals.html, 16, 60) : [])
  const fashion = find(secs, /^(fashion|clothing|style|attire|outfits?)\b/i)
  if (fashion) set('fashion', record(fashion))
  const env = find(secs, /^(interior design|interiors?|d[ée]cor|home|places|locations|settings?|architecture and interiors?)$/i)
  if (env) set('environment', record(env))
  const arch = find(secs, /^architecture$/i)
  if (arch) set('architecture', record(arch))
  const photo = find(secs, /^photography$/i)
  if (photo) set('photography', record(photo))
  const gd = find(secs, /^(graphic design|design|art ?style|artwork|art)$/i)
  if (gd) set('graphicDesign', record(gd))
  const type = find(secs, /^(typography|fonts?)$/i)
  if (type) set('typography', record(type))
  const music = find(secs, /^music$/i)
  if (music) {
    const pool = [music, ...music.children.filter((c) => !/playlist/i.test(c.title))]
    set('sounds', [...new Set(pool.flatMap((s) => items(s.html, 16, 60)))].filter((t) => !/playlist|spotify|youtube/i.test(t)).slice(0, 16))
  }
  const media = find(secs, /^(media|films?|literature|movies)$/i)
  if (media) set('keyExamples', [...new Set([media, ...media.children].flatMap((s) => items(s.html, 12, 70)))].slice(0, 14))
  const acts = find(secs, /^(activities|hobbies|things to do)$/i)
  if (acts) {
    const li = items(acts.html, 14, 80)
    if (li.length) set('recipe', { activities: li })
  }

  const history = find(secs, /^(history|origins?|background|etymology|terminology)$/i)
  if (history) {
    const prose = [history, ...history.children].flatMap((x) => paragraphs(x.html))
    if (prose.length) set('culturalContext', clip(prose.slice(0, 3).join(' '), 900))
    if (a.startYear === null && !a.periodStart) {
      const m = prose.join(' ').match(/\b(?:emerged|originated|originates|began|coined|started|appeared|popularized|popularised|first used|first appeared|dates back|was created|was born)\b[^.]{0,90}?\b(1[5-9]\d\d|20[0-2]\d)(s?)\b/i)
      if (m) {
        a.startYear = Number(m[1])
        a.periodStart = m[2] ? `${m[1]}s` : m[1]
        bump('startYear')
        changed = true
      }
    }
  }

  if (changed && process.env.SHOW && shown++ < Number(process.env.SHOW)) console.log(a.slug, JSON.stringify(added, null, 1).slice(0, 1600))
  if (changed) {
    a.updatedAt = new Date().toISOString()
    if (!DRY) saveAesthetic(a)
  }
}
console.log(`✓ ${seen} articles; filled`, filled)
