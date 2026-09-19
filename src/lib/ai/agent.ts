'use client'

// The on-device agent. Needle 3 (a 35 MB tool-calling model, see needle.worker.ts) decides
// which tools a request needs; this module grounds its arguments against the real library
// (resolving names, expanding truncated ones, mapping "this" to the page on screen), runs the
// tools against the public API and returns structured, sourced results. Nothing leaves the
// browser except ordinary requests to this site's own API.
import { toast } from 'sonner'
import type { AestheticDetailResponse, AestheticsResponse, AestheticSummary, ColorEntry, ExploreResult, SuggestItem } from '@/lib/aesthetic'
import { fetchJson } from '@/lib/client'
import { colorToHex } from './colors'
import { AGENT_TOOLS, DEICTIC, MOODS, SITE_PAGES } from './tools'

export interface AgentCard {
  slug: string
  name: string
  category?: string
  image?: string | null
  note?: string
  colors?: ColorEntry[]
}
export interface AgentReply {
  text: string
  cards?: AgentCard[]
  swatches?: ColorEntry[]
  actions?: { label: string; href: string }[]
  /** Side-by-side comparison: column heads and [label, left, right] rows. */
  table?: { head: [string, string]; rows: [string, string, string][] }
  navigate?: string
  theme?: 'dark' | 'light' | 'system'
  download?: string
  /** Tools that ran, shown as a trace under the reply. */
  tools: string[]
  /** Source text the optional writer model may use to expand the answer. */
  context?: string
  /** Model routing time in ms (for transparency). */
  ms?: number
}
export interface AgentContext {
  current?: { slug: string; name: string } | null
}
interface Call {
  name: string
  arguments: Record<string, string>
}

// ---------------------------------------------------------------------------
// Needle worker (singleton)
// ---------------------------------------------------------------------------
export const ROUTER_MODEL = { label: 'Needle 3', size: '35 MB', repo: 'Cactus-Compute/needle3' }
const SYSTEM =
  'You operate an encyclopedia of visual aesthetics. [Viewing: X] names the aesthetic on screen; words like this or it refer to it. Call the tools that fulfil the request.'

let worker: Worker | null = null
let ready: Promise<void> | null = null
let seq = 0
const pending = new Map<number, { resolve: (v: any) => void; reject: (e: Error) => void }>()
const listeners = new Set<(p: number) => void>()
let progress = 0

export const routerProgress = () => progress
export function onRouterProgress(fn: (p: number) => void) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}
export const routerLoaded = () => progress >= 1 && ready !== null

function rpc<T>(msg: Record<string, unknown>): Promise<T> {
  const id = ++seq
  return new Promise<T>((resolve, reject) => {
    pending.set(id, { resolve, reject })
    worker!.postMessage({ id, ...msg })
  })
}

export function loadRouter(): Promise<void> {
  if (ready) return ready
  const toastId = 'needle'
  worker = new Worker(new URL('./needle.worker.ts', import.meta.url), { type: 'module' })
  worker.onmessage = (e) => {
    const d = e.data
    if (d.type === 'progress') {
      progress = Math.min(0.99, d.loaded / d.total)
      listeners.forEach((l) => l(progress))
      if (!d.cached)
        toast.loading(`Downloading ${ROUTER_MODEL.label}`, {
          id: toastId,
          duration: Infinity,
          description: `${Math.round(progress * 100)}% · ${(d.loaded / 1e6).toFixed(0)} / ${(d.total / 1e6).toFixed(0)} MB`,
        })
      return
    }
    const p = pending.get(d.id)
    if (!p) return
    pending.delete(d.id)
    if (d.ok) p.resolve(d)
    else p.reject(new Error(d.error))
  }
  toast.loading('Waking the guide', { id: toastId, duration: Infinity, description: `${ROUTER_MODEL.label} · ${ROUTER_MODEL.size}, downloaded once, runs on your device` })
  ready = rpc<void>({ type: 'init', system: SYSTEM, tools: AGENT_TOOLS }).then(
    () => {
      progress = 1
      listeners.forEach((l) => l(1))
      toast.success('The guide is ready', { id: toastId, duration: 3000, description: `${ROUTER_MODEL.label}, running entirely on your device` })
    },
    (err) => {
      ready = null
      progress = 0
      listeners.forEach((l) => l(0))
      worker?.terminate()
      worker = null
      toast.error('Couldn’t start the guide', { id: toastId, duration: 8000, description: err.message })
      throw err
    }
  )
  return ready
}

async function route(input: string): Promise<{ calls: Call[]; confidence: number; ms: number }> {
  await loadRouter()
  const r = await rpc<{ result: { function_calls: Call[]; confidence: number }; ms: number }>({ type: 'complete', input })
  return { calls: r.result.function_calls ?? [], confidence: Number(r.result.confidence) || 0, ms: r.ms }
}

// ---------------------------------------------------------------------------
// Grounding helpers
// ---------------------------------------------------------------------------
const norm = (s: string) => s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim()
const search = (q: string, limit = 6) =>
  fetchJson<{ items: SuggestItem[] }>(`/api/v1/search?limit=${limit}&q=${encodeURIComponent(q)}`).then((r) => r.items).catch(() => [] as SuggestItem[])

/**
 * Resolve a (possibly truncated or pronoun) name to a real aesthetic. Tries the longest span of
 * the visitor's own words that starts with the argument ("art" → "art deco"), then the argument.
 */
async function resolveName(arg: string | undefined, text: string, ctx: AgentContext): Promise<SuggestItem | null> {
  const a = (arg ?? '').trim()
  if ((!a || DEICTIC.test(a)) && ctx.current) return { slug: ctx.current.slug, name: ctx.current.name, category: '' }
  if (!a) return null
  if (ctx.current && norm(a) === norm(ctx.current.name)) return { slug: ctx.current.slug, name: ctx.current.name, category: '' }
  const words = norm(text).split(' ')
  const head = norm(a).split(' ')
  const at = words.findIndex((_, i) => head.every((h, j) => words[i + j] === h))
  const spans: string[] = []
  if (at >= 0) for (let n = Math.min(4, words.length - at); n > head.length; n--) spans.push(words.slice(at, at + head.length + n - head.length).join(' '))
  spans.push(norm(a))
  for (const span of spans) {
    const items = await search(span, 8)
    const exact = items.find((i) => norm(i.name) === span)
    if (exact) return exact
    if (span === norm(a) && items[0] && (norm(items[0].name).includes(span) || span.includes(norm(items[0].name)))) return items[0]
  }
  return null
}

/** "compare X and Y", "blend X with Y", "X vs Y" → the two raw spans. */
function pairFrom(text: string): [string, string] | null {
  const t = text
    .replace(/^[^a-z0-9#]*(please\s+)?(can you\s+)?(compare|contrast|blend|mix|fuse|cross|combine|merge|what(?:'s| is) the difference between|how does|how do)\s+/i, '')
    .replace(/[?.!]+$/, '')
  const m = /^(.+?)\s+(?:and|with|vs\.?|versus|x|×|to|into|against)\s+(.+?)(?:\s+(?:differ|compare|together))?$/i.exec(t)
  return m ? [m[1].trim(), m[2].trim()] : null
}

function eraRange(s: string): [number, number] | null {
  const t = s.toLowerCase()
  const bce = /\b(bce|bc|b\.c\.)\b/.test(t)
  const dec = /\b(\d{3,4})s\b/.exec(t)
  if (dec) return [Number(dec[1]), Number(dec[1]) + 9]
  const ORD: Record<string, number> = { first: 1, second: 2, third: 3, fourth: 4, fifth: 5, sixth: 6, seventh: 7, eighth: 8, ninth: 9, tenth: 10, eleventh: 11, twelfth: 12, thirteenth: 13, fourteenth: 14, fifteenth: 15, sixteenth: 16, seventeenth: 17, eighteenth: 18, nineteenth: 19, twentieth: 20, 'twenty-first': 21 }
  const c = /\b(\d{1,2})(?:st|nd|rd|th)\s+century\b/.exec(t) ?? /\b([a-z-]+)\s+century\b/.exec(t)
  if (c) {
    const n = /\d/.test(c[1]) ? Number(c[1]) : ORD[c[1]]
    if (n) return bce ? [-n * 100, -(n - 1) * 100 - 1] : [(n - 1) * 100, n * 100 - 1]
  }
  const y = /\b(\d{3,4})\b/.exec(t)
  if (y) return bce ? [-Number(y[1]), -Number(y[1])] : [Number(y[1]), Number(y[1])]
  const NAMED: [RegExp, number, number][] = [
    [/prehistor|stone age|neolithic/, -10000, -3000], [/ancient|antiquity|classical/, -3000, 500], [/medieval|middle ages/, 500, 1500],
    [/renaissance/, 1400, 1600], [/baroque/, 1600, 1750], [/georgian/, 1714, 1837], [/victorian/, 1837, 1901], [/edwardian/, 1901, 1914],
    [/edo/, 1603, 1868], [/meiji/, 1868, 1912], [/ming/, 1368, 1644], [/qing/, 1644, 1912], [/mughal/, 1526, 1857], [/interwar/, 1918, 1939],
    [/post ?war|mid[- ]century/, 1945, 1970], [/y2k|millennium/, 1997, 2004], [/today|current|contemporary|now/, 2015, 2026],
  ]
  for (const [re, a, b] of NAMED) if (re.test(t)) return [a, b]
  return null
}

const MOOD_DIMS: Record<string, string> = {
  warm: 'warmth:85', cool: 'warmth:15', muted: 'saturation:20', vivid: 'saturation:85', dark: 'lightness:15', light: 'lightness:85',
  'high contrast': 'contrast:90', soft: 'contrast:25,saturation:35', monochrome: 'hueRange:5', colorful: 'hueRange:90',
}
const PAGE_HREF: Record<string, string> = { home: '/', browse: '/aesthetics', timeline: '/timeline', connections: '/connections', colors: '/colors', discover: '/discover', blend: '/blend', data: '/data', about: '/about' }

const toCard = (i: SuggestItem | AestheticSummary | ExploreResult, note?: string): AgentCard => ({
  slug: i.slug,
  name: i.name,
  category: i.category,
  image: i.image ?? null,
  colors: i.colors?.slice(0, 5),
  note: note ?? ('summary' in i ? i.summary?.slice(0, 140) : undefined),
})
const list = (qs: string) => fetchJson<AestheticsResponse>(`/api/v1/aesthetics?pageSize=6&facets=false&${qs}`)
const detail = (slug: string) => fetchJson<AestheticDetailResponse & { similar?: AestheticSummary[] }>(`/api/v1/aesthetics/${slug}`)

// ---------------------------------------------------------------------------
// Deterministic intents that don't need the model (exact, instant).
// ---------------------------------------------------------------------------
function quickIntent(text: string): Call[] | null {
  const t = text.trim()
  if (/^(hi|hello|hey|hiya|yo|howdy|good (morning|afternoon|evening))\b[\s!.?]*$/i.test(t)) return [{ name: '_greet', arguments: {} }]
  if (/^(help|what can you do\??|who are you\??)$/i.test(t)) return [{ name: '_greet', arguments: {} }]
  const hex = /(^|\s)#([0-9a-f]{6}|[0-9a-f]{3})\b/i.exec(t)
  if (hex) return [{ name: 'find_by_color', arguments: { color: `#${hex[2]}` } }]
  if (/\b(surprise me|random|anything|roll the dice|shuffle)\b/i.test(t) && t.split(/\s+/).length <= 6) return [{ name: 'random_aesthetic', arguments: {} }]
  const sim = /\b(?:similar to|like|related to|resembl\w+|alternatives to)\s+(.+?)[?.!]*$/i.exec(t)
  if (sim && /\b(similar|related|resembl|alternatives|more like|styles like|aesthetics like)\b/i.test(t)) return [{ name: 'similar_aesthetics', arguments: { name: sim[1] } }]
  return null
}

/** Fix model calls that don't fit their tool (e.g. a style name passed as a colour). */
function repair(calls: Call[], text: string, ctx: AgentContext): Call[] {
  const lower = text.toLowerCase()
  const pair = pairFrom(text)
  const moods = calls.filter((c) => c.name === 'find_by_mood').map((c) => c.arguments.mood)
  if (moods.length > 1) calls = [{ name: 'find_by_mood', arguments: { mood: moods.join(',') } }, ...calls.filter((c) => c.name !== 'find_by_mood')]
  return calls.flatMap<Call>((c) => {
    const args = { ...c.arguments }
    if (c.name === 'find_by_color') {
      const v = args.color ?? ''
      if (colorToHex(v)) return [c]
      const mood = MOODS.find((m) => norm(v) === m || new RegExp(`\\b${m}\\b`).test(norm(v)))
      if (mood) return [{ name: 'find_by_mood', arguments: { mood } }]
      if (/\b(colou?rs?|palette)\b/.test(lower)) return [{ name: 'describe_aesthetic', arguments: { name: v } }]
      return [{ name: 'search_aesthetics', arguments: { query: text } }]
    }
    if ((c.name === 'compare_aesthetics' || c.name === 'blend_aesthetics') && pair) {
      args.first = pair[0]
      args.second = pair[1]
      if (/\b(blend|mix|fuse|cross|combine|merge|hybrid)\b/.test(lower)) return [{ name: 'blend_aesthetics', arguments: args }]
      if (/\b(compare|contrast|differ|difference|vs|versus)\b/.test(lower)) return [{ name: 'compare_aesthetics', arguments: args }]
    }
    if ((c.name === 'compare_aesthetics' || c.name === 'blend_aesthetics') && args.first && args.first === args.second && ctx.current) args.first = ctx.current.name
    // "aesthetics from Nigeria", "styles in Kyoto": a place search, not a keyword search.
    const place = /\b(?:from|in|of)\s+([A-Z][\p{L}'-]+(?:\s+[A-Z][\p{L}'-]+){0,2})\s*[?.!]*$/u.exec(text)
    if (c.name === 'search_aesthetics' && place && /\b(aesthetics?|styles?|art|fashion|design|architecture|crafts?|traditions?)\b/i.test(text)) return [{ name: 'find_by_place', arguments: { place: place[1] } }]
    return [{ name: c.name, arguments: args }]
  })
}

// ---------------------------------------------------------------------------
// Tool implementations
// ---------------------------------------------------------------------------
async function exec(call: Call, text: string, ctx: AgentContext): Promise<AgentReply> {
  const a = call.arguments ?? {}
  switch (call.name) {
    case '_greet':
      return {
        tools: [],
        text: 'Hi! I’m the vault’s on-device guide. I can explain an aesthetic, compare or blend two, find styles by colour, mood, place or era, open pages and switch the theme. Try one of the suggestions below.',
      }
    case 'search_aesthetics': {
      const q = a.query || text
      let res = await list(`q=${encodeURIComponent(q)}`).catch(() => null)
      let items = res?.items ?? []
      if (!items.length) {
        // Fall back to the most distinctive words of the request.
        const words = norm(q).split(' ').filter((w) => w.length > 3 && !/^(show|find|some|something|aesthetic|aesthetics|style|styles|that|with|from|about|what|which|like)$/.test(w))
        for (const w of words.slice(0, 3)) {
          res = await list(`q=${encodeURIComponent(w)}`).catch(() => null)
          if (res?.items.length) {
            items = res.items
            break
          }
        }
      }
      return items.length
        ? { tools: [`search “${q}”`], text: `Found ${res!.total} aesthetic${res!.total === 1 ? '' : 's'} for “${q}”. The closest matches:`, cards: items.map((i) => toCard(i)), actions: [{ label: 'See all results', href: `/aesthetics?q=${encodeURIComponent(q)}` }], context: items.map((i) => `${i.name} (${i.category}): ${i.summary}`).join('\n') }
        : { tools: [`search “${q}”`], text: `Nothing in the library matches “${q}” yet. Try a broader word, a place or a colour.` }
    }
    case 'describe_aesthetic':
    case 'open_aesthetic': {
      const hit = await resolveName(a.name, text, ctx)
      if (!hit) return exec({ name: 'search_aesthetics', arguments: { query: a.name || text } }, text, ctx)
      if (call.name === 'open_aesthetic') return { tools: [`open ${hit.name}`], text: `Opening ${hit.name}.`, navigate: `/aesthetics/${hit.slug}` }
      const d = await detail(hit.slug)
      const x = d.aesthetic
      const when = [x.periodStart, x.periodEnd && x.periodEnd !== x.periodStart ? x.periodEnd : ''].filter(Boolean).join(' – ')
      const facts = [when && `Period: ${when}`, x.origin && `Origin: ${x.origin}`, x.materials.length ? `Materials: ${x.materials.slice(0, 5).join(', ')}` : '', x.keyExamples?.length ? `Key examples: ${x.keyExamples.slice(0, 3).join(', ')}` : '']
        .filter(Boolean)
        .join('\n')
      return {
        tools: [`read ${x.name}`],
        text: `${x.name} — ${x.summary || x.description.slice(0, 280)}${facts ? `\n\n${facts}` : ''}`,
        swatches: x.colors.slice(0, 8),
        actions: [{ label: `Open ${x.name}`, href: `/aesthetics/${x.slug}` }],
        context: `${x.name}\n${x.summary}\n${x.description.slice(0, 1800)}\n${facts}\nPalette: ${x.colors.map((c) => `${c.name} ${c.hex}`).join(', ')}`,
      }
    }
    case 'compare_aesthetics':
    case 'blend_aesthetics': {
      const [p, q] = await Promise.all([resolveName(a.first, text, ctx), resolveName(a.second, text, ctx)])
      const missing = [!p && a.first, !q && a.second].filter(Boolean)
      if (!p || !q) return { tools: ['resolve names'], text: `I couldn’t find ${missing.map((m) => `“${m}”`).join(' or ')} in the library. Check the spelling, or search for it first.` }
      if (call.name === 'blend_aesthetics')
        return { tools: [`blend ${p.name} × ${q.name}`], text: `Blending ${p.name} with ${q.name}.`, navigate: `/blend?a=${p.slug}&b=${q.slug}` }
      const [da, db] = await Promise.all([detail(p.slug), detail(q.slug)])
      const A = da.aesthetic
      const B = db.aesthetic
      const shared = A.materials.filter((m) => B.materials.map((n) => n.toLowerCase()).includes(m.toLowerCase()))
      const span = (x: typeof A) => [x.periodStart, x.periodEnd && x.periodEnd !== x.periodStart ? x.periodEnd : ''].filter(Boolean).join(' – ')
      const rows: [string, string, string][] = [
        ['Period', span(A), span(B)],
        ['Origin', A.origin, B.origin],
        ['Category', A.category, B.category],
        ['Materials', A.materials.slice(0, 3).join(', '), B.materials.slice(0, 3).join(', ')],
      ]
      if (A.metrics && B.metrics)
        rows.push(
          ['Palette warmth', String(A.metrics.warmth), String(B.metrics.warmth)],
          ['Saturation', String(A.metrics.saturation), String(B.metrics.saturation)],
          ['Contrast', String(A.metrics.contrast), String(B.metrics.contrast)]
        )
      return {
        tools: [`compare ${A.name} ↔ ${B.name}`],
        text: `${A.name} and ${B.name}, side by side${shared.length ? ` — both use ${shared.slice(0, 4).join(', ')}` : ''}.`,
        table: { head: [A.name, B.name], rows: rows.filter(([, x, y]) => x || y) },
        swatches: [...A.colors.slice(0, 5), ...B.colors.slice(0, 5)],
        cards: [toCard({ ...A, image: A.images[0]?.thumb ?? A.image }), toCard({ ...B, image: B.images[0]?.thumb ?? B.image })],
        context: `${A.name}: ${A.summary}\n${A.description.slice(0, 900)}\n\n${B.name}: ${B.summary}\n${B.description.slice(0, 900)}`,
      }
    }
    case 'similar_aesthetics': {
      const hit = await resolveName(a.name, text, ctx)
      if (!hit) return exec({ name: 'search_aesthetics', arguments: { query: a.name || text } }, text, ctx)
      const d = await detail(hit.slug)
      const rel = [...d.relations.outgoing.map((r) => ({ ...r.target, note: r.type })), ...d.relations.incoming.map((r) => ({ ...r.source, note: r.type }))]
      const cards = [...rel.map((r) => toCard(r as SuggestItem, r.note.replace(/_/g, ' '))), ...(d.similar ?? []).map((s) => toCard(s))]
      const seen = new Set<string>()
      return {
        tools: [`relatives of ${d.aesthetic.name}`],
        text: `Aesthetics connected to or resembling ${d.aesthetic.name}:`,
        cards: cards.filter((c) => !seen.has(c.slug) && seen.add(c.slug)).slice(0, 8),
        actions: [{ label: 'See the connection map', href: `/aesthetics/${hit.slug}#related` }],
      }
    }
    case 'find_by_color': {
      const hex = colorToHex(a.color ?? '')
      if (!hex) return exec({ name: 'search_aesthetics', arguments: { query: text } }, text, ctx)
      const r = await fetchJson<{ items: (AestheticSummary & { match: string })[] }>(`/api/v1/colors?limit=8&hex=${hex}`)
      return {
        tools: [`colour search #${hex}`],
        text: `Aesthetics whose palettes include a colour close to ${a.color?.startsWith('#') ? '' : `${a.color} `}#${hex}:`,
        swatches: [{ hex: `#${hex}`, name: a.color ?? '' }],
        cards: r.items.map((i) => toCard(i, `closest: ${i.match}`)),
        actions: [{ label: 'Open the colour explorer', href: `/colors?hex=${hex}` }],
      }
    }
    case 'find_by_mood': {
      // One or several moods ("warm,muted") combine into a single palette query.
      const moods = (a.mood ?? '').split(',').map((m) => m.trim()).filter((m) => (MOODS as readonly string[]).includes(m))
      if (!moods.length) moods.push('warm')
      const mood = moods.join(' and ')
      const dims = moods.map((m) => MOOD_DIMS[m]).join(',')
      const r = await fetchJson<{ items: ExploreResult[] }>(`/api/v1/discover?limit=8&dims=${dims}`)
      return {
        tools: [`palette mood “${mood}”`],
        text: `Aesthetics with ${mood} palettes (measured from their documented colours):`,
        cards: r.items.map((i) => toCard(i)),
        actions: [{ label: 'Tune it in Discover', href: `/discover?dims=${dims}` }],
      }
    }
    case 'find_by_place': {
      const place = a.place || text
      const r = await list(`place=${encodeURIComponent(place)}`).catch(() => null)
      if (!r?.items.length) return exec({ name: 'search_aesthetics', arguments: { query: place } }, text, ctx)
      return { tools: [`place “${place}”`], text: `${r.total} aesthetic${r.total === 1 ? '' : 's'} from ${place}:`, cards: r.items.map((i) => toCard(i)), actions: [{ label: 'Browse them all', href: `/aesthetics?q=${encodeURIComponent(place)}` }] }
    }
    case 'find_by_era': {
      const range = eraRange(a.era || text)
      if (!range) return exec({ name: 'search_aesthetics', arguments: { query: a.era || text } }, text, ctx)
      // Styles that began in the period first; the total counts everything active in it.
      const [began, active] = await Promise.all([list(`from=${range[0]}&to=${range[1]}&began=true`), list(`from=${range[0]}&to=${range[1]}&pageSize=1`)])
      const r = { ...began, total: active.total }
      const fmt = (y: number) => (y < 0 ? `${-y} BCE` : String(y))
      return {
        tools: [`era ${fmt(range[0])}–${fmt(range[1])}`],
        text: `${r.total} aesthetic${r.total === 1 ? ' was' : 's were'} active between ${fmt(range[0])} and ${fmt(range[1])}. ${began.total ? `${began.total} began then, including:` : 'Some of them:'}`,
        cards: r.items.map((i) => toCard(i, i.periodStart ? `${i.periodStart}${i.origin ? ` · ${i.origin}` : ''}` : undefined)),
        actions: [{ label: 'See it on the timeline', href: '/timeline' }],
      }
    }
    case 'random_aesthetic': {
      const r = await fetchJson<{ item: AestheticSummary }>('/api/v1/random?mode=illustrated')
      return { tools: ['random pick'], text: `How about ${r.item.name}? ${r.item.summary}`, cards: [toCard(r.item)], actions: [{ label: `Open ${r.item.name}`, href: `/aesthetics/${r.item.slug}` }] }
    }
    case 'go_to_page': {
      const page = (SITE_PAGES as readonly string[]).includes(a.page) ? a.page : 'browse'
      return { tools: [`go to ${page}`], text: `Taking you to ${page}.`, navigate: PAGE_HREF[page] }
    }
    case 'set_theme': {
      const mode = a.mode === 'light' || a.mode === 'dark' ? a.mode : 'system'
      return { tools: [`theme ${mode}`], text: `Switched to ${mode === 'system' ? 'your system' : mode} mode.`, theme: mode }
    }
    case 'download_data': {
      const ext = ['json', 'csv', 'parquet', 'ndjson'].includes(a.format) ? a.format : a.format === 'duckdb' ? 'duckdb' : 'json'
      const file = ext === 'duckdb' ? 'aestheticpedia.duckdb' : `aesthetics.${ext}`
      return { tools: [`download ${file}`], text: `Here is the full dataset as ${ext.toUpperCase()}. Every format is listed on the data page.`, actions: [{ label: `Download ${file}`, href: `/data/${file}` }, { label: 'All downloads', href: '/data#downloads' }] }
    }
  }
  return exec({ name: 'search_aesthetics', arguments: { query: text } }, text, ctx)
}

// Parameters with a fixed vocabulary; the model may map words onto them ("cozy" → warm).
const ENUM_PARAMS = new Set(['mood', 'page', 'mode', 'format'])

/**
 * A call is grounded when every free-text argument appears in what the visitor wrote (or in the
 * page context we supplied). Drops hallucinated or carried-over calls.
 */
function isGrounded(c: Call, input: string): boolean {
  const t = ` ${norm(input)} `
  return Object.entries(c.arguments ?? {}).every(([k, v]) => {
    if (ENUM_PARAMS.has(k) || typeof v !== 'string') return true
    const n = norm(v)
    if (!n || DEICTIC.test(v.trim())) return true
    if (/^[0-9a-f]{3,6}$/.test(n) && /#/.test(v)) return true
    // Most of the argument's words must come from the input.
    const words = n.split(' ')
    return words.filter((w) => t.includes(` ${w} `) || t.includes(` ${w}s `) || t.includes(w)).length >= Math.ceil(words.length * 0.6)
  })
}

const uniqueBy = <T,>(xs: T[], key: (x: T) => string) => {
  const seen = new Set<string>()
  return xs.filter((x) => !seen.has(key(x)) && seen.add(key(x)))
}

const dedupe = (calls: Call[]) => {
  const seen = new Set<string>()
  return calls.filter((c) => {
    const key = `${c.name}:${JSON.stringify(c.arguments)}`
    return !seen.has(key) && seen.add(key)
  })
}

/** Run one request end to end and merge the results of every tool it needed. */
export async function runAgent(text: string, ctx: AgentContext): Promise<AgentReply> {
  let calls = quickIntent(text)
  let ms: number | undefined
  if (!calls) {
    // Name the aesthetic on screen only when the request points at it ("this", "it"), so the
    // model isn't tempted to act on the page for unrelated questions.
    const pointsHere = ctx.current && /\b(this|it|its|here|current|that one)\b/i.test(text)
    const input = pointsHere ? `[Viewing: ${ctx.current!.name}] ${text}` : text
    const r = await route(input)
    ms = r.ms
    const grounded = dedupe(r.calls.filter((c) => isGrounded(c, input)))
    calls = r.confidence < 0.35 || !grounded.length ? [{ name: 'search_aesthetics', arguments: { query: text } }] : repair(grounded, text, ctx)
    // "tell me more about it" searched for the page's own name → describe it instead.
    calls = calls.map((c) =>
      c.name === 'search_aesthetics' && ctx.current && norm(c.arguments.query ?? '') === norm(ctx.current.name) ? { name: 'describe_aesthetic', arguments: { name: ctx.current.name } } : c
    )
  }
  calls = dedupe(calls)
  const replies: AgentReply[] = []
  for (const c of calls.slice(0, 3)) replies.push(await exec(c, text, ctx).catch((e) => ({ tools: [c.name], text: `That step failed: ${e instanceof Error ? e.message : e}` })))
  const nav = replies.find((r) => r.navigate)
  return {
    text: replies.map((r) => r.text).join('\n\n'),
    cards: uniqueBy(replies.flatMap((r) => r.cards ?? []), (c) => c.slug).slice(0, 10),
    swatches: replies.flatMap((r) => r.swatches ?? []),
    table: replies.find((r) => r.table)?.table,
    actions: uniqueBy(replies.flatMap((r) => r.actions ?? []), (x) => x.href).slice(0, 4),
    navigate: nav?.navigate,
    theme: replies.find((r) => r.theme)?.theme,
    tools: replies.flatMap((r) => r.tools),
    context: replies.map((r) => r.context).filter(Boolean).join('\n\n') || undefined,
    ms,
  }
}
