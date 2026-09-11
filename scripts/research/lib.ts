/**
 * Aesthetic Atlas — Research Pipeline shared library.
 *
 * Uses z-ai-web-dev-sdk (backend) to run LLM-assisted research batches:
 * discovery -> validation -> dedupe -> insert -> relation linking -> backlog.
 *
 * Quality policy (see /docs/source-policy):
 * - Only real, documented aesthetics. No invented names.
 * - Every entry carries sources with tiers (A museum/academic, B encyclopedia/press,
 *   C specialist/community wiki, D informal).
 * - Uncertainty is preserved via confidence + status; nothing is silently merged.
 */
import { PrismaClient } from '@prisma/client'
import ZAI from 'z-ai-web-dev-sdk'

// Single connection so concurrent LLM workers serialize SQLite writes safely.
export const dbp = new PrismaClient({
  datasources: { db: { url: 'file:/home/z/my-project/db/custom.db?connection_limit=1&socket_timeout=15' } },
})

// ---------- text helpers ----------

export function normalizeName(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\u4e00-\u9fff\u3040-\u30ff\uac00-\ud7af]/g, '')
}

export function slugify(s: string): string {
  const base = s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
  return base || 'aesthetic'
}

export function parseYear(period: string, which: 'start' | 'end'): number | null {
  if (!period) return null
  const p = period.toLowerCase()
  const mCent = p.match(/(\d{1,2})(?:st|nd|rd|th)\s*century/)
  if (mCent) {
    const n = parseInt(mCent[1], 10)
    let base = (n - 1) * 100
    if (which === 'end') base += 99
    if (p.includes('bc') || p.includes('bce')) base = -base
    return base
  }
  const nums = [...p.matchAll(/(\d{3,4})\s*(bce|bc)?/g)].map((m) => {
    const v = parseInt(m[1], 10)
    return m[2] ? -v : v
  })
  if (nums.length === 0) return null
  if (which === 'start') return nums[0]
  return nums.length > 1 ? nums[nums.length - 1] : nums[0]
}

// ---------- LLM ----------

let _zai: Awaited<ReturnType<typeof ZAI.create>> | null = null
async function zai() {
  if (!_zai) _zai = await ZAI.create()
  return _zai
}

// Simple global throttle so concurrent workers respect API rate limits.
// Raised from 3.5s after sustained 429 storms; 6s + per-worker jitter keeps
// throughput near the sustainable ceiling without wasting requests.
const MIN_GAP_MS = 6000
let lastRequestStart = 0
async function throttle() {
  for (;;) {
    const now = Date.now()
    const wait = lastRequestStart + MIN_GAP_MS - now
    if (wait <= 0) {
      lastRequestStart = now
      return
    }
    await sleep(Math.min(wait, 1000))
  }
}

// Circuit breaker: when the API sustains 429s, fail fast for a cooldown
// window instead of burning retries (and discovery-batch attempts) against
// a closed endpoint. The worker treats this as a transient condition.
let rateLimitedUntil = 0
export function rateLimitedNow(): boolean {
  return Date.now() < rateLimitedUntil
}
export function isRateLimitedError(e: unknown): boolean {
  const msg = String((e as Error)?.message ?? '')
  return msg.includes('429') || msg.toLowerCase().includes('too many') || msg.includes('rate-limited (cooldown)')
}

export async function llmJSON(system: string, user: string, retries = 5): Promise<any> {
  if (Date.now() < rateLimitedUntil) {
    throw new Error(`rate-limited (cooldown ${Math.ceil((rateLimitedUntil - Date.now()) / 1000)}s)`)
  }
  let lastErr: Error | null = null
  for (let i = 1; i <= retries; i++) {
    try {
      await throttle()
      const z = await zai()
      const completion = await z.chat.completions.create({
        messages: [
          { role: 'assistant', content: system },
          { role: 'user', content: user },
        ],
        thinking: { type: 'disabled' },
      })
      const raw = completion.choices[0]?.message?.content ?? ''
      const json = extractJSON(raw)
      if (json === null) throw new Error('no JSON in response')
      rateLimitedUntil = 0
      return json
    } catch (e: any) {
      lastErr = e
      const msg = String(e?.message ?? '')
      if (i < retries) {
        const is429 = msg.includes('429') || msg.toLowerCase().includes('too many')
        await sleep(is429 ? Math.min(20000 * i, 60000) : 2000 * i)
      }
    }
  }
  if (isRateLimitedError(lastErr)) {
    rateLimitedUntil = Date.now() + 180_000
    logRate('sustained 429s — cooling down 3 minutes')
  }
  throw lastErr ?? new Error('LLM failed')
}

let lastRateLog = 0
function logRate(msg: string) {
  const now = Date.now()
  if (now - lastRateLog > 60_000) {
    lastRateLog = now
    console.log(new Date().toISOString().slice(11, 19), msg)
  }
}

export function extractJSON(raw: string): any {
  if (!raw) return null
  let t = raw.trim()
  t = t.replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim()
  const firstArr = t.indexOf('[')
  const firstObj = t.indexOf('{')
  try {
    if (firstArr !== -1 && (firstObj === -1 || firstArr < firstObj)) {
      const last = t.lastIndexOf(']')
      return JSON.parse(t.slice(firstArr, last + 1))
    }
    if (firstObj !== -1) {
      const last = t.lastIndexOf('}')
      return JSON.parse(t.slice(firstObj, last + 1))
    }
  } catch {
    // fall through to truncated-JSON repair
  }
  // Repair: responses truncated or with per-element errors (output token limit).
  // Recover each complete top-level object from the array independently.
  if (firstArr !== -1) {
    let depth = 0
    let inStr = false
    let esc = false
    const spans: Array<[number, number]> = []
    let objStart = -1
    for (let i = firstArr; i < t.length; i++) {
      const c = t[i]
      if (inStr) {
        if (esc) esc = false
        else if (c === '\\') esc = true
        else if (c === '"') inStr = false
        continue
      }
      if (c === '"') inStr = true
      else if (c === '{') {
        if (depth === 0) objStart = i
        depth++
      } else if (c === '}') {
        depth--
        if (depth === 0 && objStart !== -1) {
          spans.push([objStart, i])
          objStart = -1
        }
      }
    }
    const salvaged: any[] = []
    for (const [a, b] of spans) {
      try {
        salvaged.push(JSON.parse(t.slice(a, b + 1)))
      } catch {}
    }
    if (salvaged.length > 0) return salvaged
  }
  return null
}

export function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

// ---------- validation / coercion ----------

const ESTABLISHMENTS = new Set([
  'historical',
  'regional_tradition',
  'community_subculture',
  'commercial_style',
  'internet_aesthetic',
  'experimental_hybrid',
])

const DNA_KEYS: Array<[string, string]> = [
  ['mi', 'minimal_maximal'],
  ['og', 'organic_geometric'],
  ['wc', 'warm_cold'],
  ['ns', 'natural_synthetic'],
  ['ad', 'analog_digital'],
  ['hf', 'historical_futuristic'],
  ['rr', 'refined_raw'],
  ['ps', 'playful_serious'],
  ['sh', 'soft_harsh'],
  ['ql', 'quiet_loud'],
  ['oc', 'orderly_chaotic'],
  ['ds', 'dense_spacious'],
  ['rs', 'realistic_surreal'],
  ['eu', 'elegant_utilitarian'],
  ['np', 'nostalgic_progressive'],
]

const EMO_KEYS = ['warm', 'cold', 'playful', 'serious', 'chaotic', 'ordered', 'nostalgic', 'futuristic', 'peaceful', 'ominous']

function clampInt(v: any, min = 0, max = 100): number {
  const n = Math.round(Number(v))
  if (!Number.isFinite(n)) return 50
  return Math.max(min, Math.min(max, n))
}

function strArr(v: any, max = 10): string[] {
  if (!Array.isArray(v)) return []
  return v
    .filter((x) => typeof x === 'string' && x.trim().length > 0 && x.trim().length < 200)
    .map((x) => x.trim())
    .slice(0, max)
}

function strVal(v: any, max = 1200): string {
  if (typeof v !== 'string') return ''
  return v.trim().slice(0, max)
}

function objVal(v: any): Record<string, string> {
  if (!v || typeof v !== 'object' || Array.isArray(v)) return {}
  const out: Record<string, string> = {}
  for (const [k, val] of Object.entries(v as any)) {
    if (typeof val === 'string' && val.trim()) out[k.slice(0, 40)] = val.trim().slice(0, 500)
    else if (typeof val === 'number') out[k.slice(0, 40)] = String(val)
  }
  return out
}

export function objValSafe(v: any): Record<string, string> {
  return objVal(v)
}

function colorArr(v: any): Array<{ hex: string; name: string }> {
  if (!Array.isArray(v)) return []
  const out: Array<{ hex: string; name: string }> = []
  for (const c of v) {
    let hex = ''
    let name = ''
    if (typeof c === 'string') {
      hex = c
    } else if (c && typeof c === 'object') {
      hex = String(c.h ?? c.hex ?? '')
      name = String(c.n ?? c.name ?? '').slice(0, 60)
    }
    hex = hex.trim()
    if (/^#[0-9a-fA-F]{6}$/.test(hex)) out.push({ hex: hex.toLowerCase(), name })
    else if (/^#[0-9a-fA-F]{3}$/.test(hex)) {
      out.push({ hex: '#' + hex.slice(1).split('').map((ch) => ch + ch).join(''), name })
    }
    if (out.length >= 7) break
  }
  return out
}

function sourceArr(v: any): Array<{ name: string; url: string; tier: string }> {
  if (!Array.isArray(v)) return []
  const out: Array<{ name: string; url: string; tier: string }> = []
  for (const s of v) {
    if (!s) continue
    let name = ''
    let url = ''
    let tier = 'C'
    if (typeof s === 'string') {
      name = s.slice(0, 160)
    } else if (typeof s === 'object') {
      name = String(s.n ?? s.name ?? '').slice(0, 160)
      url = String(s.u ?? s.url ?? '').slice(0, 300)
      tier = String(s.t ?? s.tier ?? 'C').toUpperCase().slice(0, 1)
    }
    if (!name && !url) continue
    if (!'ABCD'.includes(tier)) tier = 'C'
    if (url && !/^https?:\/\//.test(url)) url = url.startsWith('www.') ? 'https://' + url : ''
    if (!name) name = url.replace(/^https?:\/\/(www\.)?/, '').slice(0, 80)
    out.push({ name, url, tier })
    if (out.length >= 4) break
  }
  return out
}

export interface RawEntry {
  [k: string]: any
}

export interface ValidEntry {
  name: string
  aliases: string[]
  category: string
  subcategory: string
  establishment: string
  summary: string
  description: string
  origin: string
  geography: string
  periodStart: string
  periodEnd: string
  era: string
  colors: Array<{ hex: string; name: string }>
  materials: string[]
  textures: string[]
  objects: string[]
  keyExamples: string[]
  typography: Record<string, string>
  visualDNA: Record<string, string>
  recipe: Record<string, string>
  dnaAxes: Record<string, number>
  emotionProfile: Record<string, number>
  sources: Array<{ name: string; url: string; tier: string }>
  tags: string[]
  popularity: number
  isNiche: boolean
  influences: string[]
  related: string[]
  confidence: number
}

export function validateEntry(raw: RawEntry, defaultCategory: string): ValidEntry | { error: string } {
  const name = strVal(raw.n ?? raw.name, 120)
  if (!name || name.length < 2) return { error: 'missing name' }
  const desc = strVal(raw.desc ?? raw.description, 2500)
  if (desc.length < 40) return { error: `description too short for ${name}` }

  const establishmentRaw = strVal(raw.e ?? raw.establishment, 40)
  const establishment = ESTABLISHMENTS.has(establishmentRaw) ? establishmentRaw : classifyEstablishment(defaultCategory)

  const dnaIn = raw.dna && typeof raw.dna === 'object' ? raw.dna : {}
  const dnaAxes: Record<string, number> = {}
  for (const [short, full] of DNA_KEYS) {
    const v = dnaIn[short] ?? dnaIn[full]
    dnaAxes[full] = clampInt(v)
  }
  const emoIn = raw.emo && typeof raw.emo === 'object' ? raw.emo : {}
  const emotionProfile: Record<string, number> = {}
  for (const k of EMO_KEYS) {
    const v = emoIn[k]
    emotionProfile[k] = clampInt(v)
  }

  const period = strVal(raw.p ?? raw.period, 80)
  const periodStart = /[–—-]/.test(period) ? period.split(/[–—-]/)[0].trim() : period
  const periodEnd = /[–—-]/.test(period) ? (period.split(/[–—-]/)[1]?.trim() ?? '') : ''

  const sources = sourceArr(raw.src ?? raw.sources)

  return {
    name,
    aliases: strArr(raw.a ?? raw.aliases, 8),
    category: strVal(raw.cat, 60) || defaultCategory,
    subcategory: strVal(raw.c ?? raw.subcategory, 120),
    establishment,
    summary: strVal(raw.sum ?? raw.summary, 400) || desc.slice(0, 180),
    description: desc,
    origin: strVal(raw.o ?? raw.origin, 120),
    geography: strVal(raw.g ?? raw.geography, 160),
    periodStart,
    periodEnd,
    era: strVal(raw.era, 60),
    colors: colorArr(raw.col ?? raw.colors),
    materials: strArr(raw.m ?? raw.materials, 10),
    textures: strArr(raw.tx ?? raw.textures, 8),
    objects: strArr(raw.obj ?? raw.objects, 10),
    keyExamples: strArr(raw.ex ?? raw.keyExamples, 6),
    typography: objVal(raw.typ ?? raw.typography),
    visualDNA: objVal(raw.vd ?? raw.visualDNA),
    recipe: objVal(raw.rec ?? raw.recipe),
    dnaAxes,
    emotionProfile,
    sources,
    tags: strArr(raw.tg ?? raw.tags, 10).map((t) => t.toLowerCase().slice(0, 40)),
    popularity: clampInt(raw.pop ?? raw.popularity ?? 50),
    isNiche: raw.niche === true || clampInt(raw.pop ?? 50) < 30,
    influences: strArr(raw.inf ?? raw.influences, 6),
    related: strArr(raw.rel ?? raw.related, 8),
    confidence: sources.length >= 2 ? clampInt(65 + sources.filter((s) => s.tier === 'A' || s.tier === 'B').length * 10) : 55,
  }
}

function classifyEstablishment(category: string): string {
  const map: Record<string, string> = {
    'Art Movement': 'historical',
    'Architectural Style': 'historical',
    'Historical Period Style': 'historical',
    'Internet Aesthetic': 'internet_aesthetic',
    'Web & UI Design': 'commercial_style',
    'Game & Pixel Aesthetic': 'commercial_style',
    'Regional & Cultural Tradition': 'regional_tradition',
    'Religious & Sacred Art': 'regional_tradition',
    'Subculture Style': 'community_subculture',
    'Music & Sonic Culture': 'community_subculture',
    'Fashion & Dress': 'commercial_style',
    'Hybrid & Experimental': 'experimental_hybrid',
    'Micro-aesthetic': 'internet_aesthetic',
    'Mood & Atmosphere': 'community_subculture',
    'Texture & Material Study': 'regional_tradition',
    'Material & Surface': 'regional_tradition',
    'Visual Effects & Phenomena': 'historical',
    'Drawing & Line Work': 'historical',
    'Painting Technique & School': 'historical',
    'Color & Light': 'historical',
  }
  return map[category] ?? 'community_subculture'
}

// ---------- dedupe / insert ----------

let knownNames: Set<string> | null = null
let knownIds: Map<string, string> | null = null

export async function ensureKnownNames() {
  if (!knownNames) {
    const rows = await dbp.aesthetic.findMany({ select: { id: true, name: true, aliases: true } })
    knownNames = new Set()
    knownIds = new Map()
    for (const r of rows) {
      const n = normalizeName(r.name)
      knownNames.add(n)
      if (!knownIds.has(n)) knownIds.set(n, r.id)
      try {
        const aliases = JSON.parse(r.aliases || '[]')
        for (const a of aliases) {
          if (typeof a === 'string') {
            const an = normalizeName(a)
            knownNames.add(an)
            if (!knownIds.has(an)) knownIds.set(an, r.id)
          }
        }
      } catch {}
    }
  }
}

export function isLikelyDupe(name: string, known: Set<string>): boolean {
  const n = normalizeName(name)
  if (!n) return true
  if (known.has(n)) return true
  // containment heuristic for near-duplicates ("vaporwave" vs "vaporwave art")
  if (n.length >= 6) {
    for (const k of known) {
      if (k.length >= 6 && (k.includes(n) || n.includes(k))) return true
    }
  }
  return false
}

export async function insertEntry(
  entry: ValidEntry,
  opts: { batchId?: string; status?: string; dataQuality?: string } = {}
): Promise<{ ok: boolean; reason?: string; slug?: string }> {
  if (!knownNames) await ensureKnownNames()
  if (isLikelyDupe(entry.name, knownNames!)) return { ok: false, reason: 'duplicate' }
  for (const a of entry.aliases) {
    if (isLikelyDupe(a, knownNames!)) return { ok: false, reason: 'duplicate-alias' }
  }

  let slug = slugify(entry.name)
  const existing = await dbp.aesthetic.findUnique({ where: { slug } })
  if (existing) slug = `${slug}-${Date.now().toString(36).slice(-4)}`

  const startYear = parseYear(entry.periodStart, 'start')
  const endYear = parseYear(entry.periodEnd || entry.periodStart, 'end')

  const sourceTiers = entry.sources.map((s) => s.tier)
  const dataQuality =
    opts.dataQuality ??
    (sourceTiers.filter((t) => t === 'A' || t === 'B').length >= 2
      ? 'well_documented'
      : sourceTiers.some((t) => t === 'A' || t === 'B')
        ? 'moderately_documented'
        : sourceTiers.length > 0
          ? 'emerging'
          : 'interpretive')

  try {
    const created = await dbp.aesthetic.create({
      data: {
        slug,
        name: entry.name,
        aliases: JSON.stringify(entry.aliases),
        category: entry.category,
        subcategory: entry.subcategory,
        establishment: entry.establishment,
        status: opts.status ?? 'draft',
        confidence: entry.confidence,
        origin: entry.origin,
        geography: entry.geography,
        periodStart: entry.periodStart,
        periodEnd: entry.periodEnd,
        startYear,
        endYear,
        era: entry.era,
        summary: entry.summary,
        description: entry.description,
        colors: JSON.stringify(entry.colors),
        materials: JSON.stringify(entry.materials),
        textures: JSON.stringify(entry.textures),
        objects: JSON.stringify(entry.objects),
        keyExamples: JSON.stringify(entry.keyExamples),
        typography: JSON.stringify(entry.typography),
        visualDNA: JSON.stringify(entry.visualDNA),
        recipe: JSON.stringify(entry.recipe),
        dnaAxes: JSON.stringify(entry.dnaAxes),
        emotionProfile: JSON.stringify(entry.emotionProfile),
        sources: JSON.stringify(entry.sources),
        tags: JSON.stringify(entry.tags),
        popularity: entry.popularity,
        isNiche: entry.isNiche,
        dataQuality,
        batchId: opts.batchId ?? null,
      },
    })
    knownNames!.add(normalizeName(entry.name))
    knownIds!.set(normalizeName(entry.name), created.id)
    for (const a of entry.aliases) {
      const an = normalizeName(a)
      knownNames!.add(an)
      if (!knownIds!.has(an)) knownIds!.set(an, created.id)
    }
    await linkRelations(created.id, entry.name, entry.influences, entry.related)
    return { ok: true, slug: created.slug }
  } catch (e: any) {
    return { ok: false, reason: `db: ${String(e.message).slice(0, 120)}` }
  }
}

export async function linkRelations(
  aestheticId: string,
  aestheticName: string,
  influences: string[],
  related: string[]
) {
  if (!knownIds) await ensureKnownNames()
  const targets: Array<{ type: string; names: string[] }> = [
    { type: 'influenced_by', names: influences },
    { type: 'related', names: related },
  ]
  for (const { type, names } of targets) {
    for (const name of names) {
      if (!name) continue
      const n = normalizeName(name)
      if (!n || n === normalizeName(aestheticName)) continue
      const targetId = knownIds!.get(n)
      if (targetId && targetId !== aestheticId) {
        try {
          await dbp.relation.create({ data: { fromId: aestheticId, toId: targetId, type } })
        } catch {}
      } else if (!targetId) {
        try {
          await dbp.backlogTerm.create({
            data: { name: name.slice(0, 100), context: aestheticName, reason: `unresolved_${type}` },
          })
        } catch {}
      }
    }
  }
}

// ---------- discovery prompt ----------

export const DISCOVERY_SYSTEM = `You are a meticulous cultural design researcher building a factual encyclopedia of human aesthetics. You document ONLY real, verifiable aesthetics, styles, movements, subcultures and visual languages that exist in literature, archives, encyclopedias, specialist press, or community documentation. You NEVER invent names or fabricate sources. You answer with strict JSON only — no markdown fences, no commentary.`

export function discoveryPrompt(domain: string, focus: string, category: string, count: number): string {
  return `Document ${count} real aesthetics for this research domain.

Domain: ${domain}
${focus ? 'Focus: ' + focus : ''}

Category label for ALL entries: "${category}"

Rules:
- Only genuine, documented aesthetics. Include well-known AND obscure/niche entries. Prefer less-famous documented styles over repeating obvious ones.
- International scope; include non-Western entries whenever the domain allows.
- establishment must be one of: historical (established art/architecture/design history), regional_tradition (living or folk cultural tradition), community_subculture (documented subculture), commercial_style (industry/commercial style), internet_aesthetic (internet-born label), experimental_hybrid (only documented hybrids).
- sources: 1-3 REAL references per entry. tier: A = museum/academic/official archive, B = encyclopedia or established publication, C = specialist website or community wiki (e.g. Aesthetics Wiki, ArchDaily, It's Nice That), D = informal/social. Use real well-known URLs (e.g. https://en.wikipedia.org/wiki/Art_Nouveau). If unsure of exact URL use the site root. NEVER fabricate.
- For non-Latin names, use the common English/romanized name and put the native script in aliases.
- dna and emo values are 0-100 integers along the stated axis.

Return a MINIFIED JSON array ONLY (no indentation, no markdown). Schema per entry (keep every string tight; desc 2-4 sentences max):
{"n": name, "a": [aliases], "c": subcategory, "e": establishment, "o": origin place, "g": geography, "p": period text like "1890-1914" or "1960s", "era": era label, "sum": 1-2 sentence definition, "desc": exactly 2 sentences: what it looks like, WHY it looks this way, history/cultural context, "col": [{"h": "#rrggbb", "n": "color name"}] 4-5 colors, "m": [materials 3-6], "tx": [textures 2-4], "obj": [typical objects 3-6], "ex": [real-world examples 2-4], "inf": [aesthetics it was influenced by, by name 2-4], "rel": [related aesthetics, by name 2-4], "src": [{"n": source name, "u": url, "t": tier}] 1-3, "tg": [tags 3-6 lowercase], "pop": 0-100 recognition, "niche": bool, "dna": {"mi": minimal-maximal, "og": organic-geometric, "wc": warm-cold, "ns": natural-synthetic, "ad": analog-digital, "hf": historical-futuristic, "rr": refined-raw, "ps": playful-serious, "sh": soft-harsh, "ql": quiet-loud, "oc": orderly-chaotic, "ds": dense-spacious, "rs": realistic-surreal, "eu": elegant-utilitarian, "np": nostalgic-progressive}, "emo": {"warm": x, "cold": x, "playful": x, "serious": x, "chaotic": x, "ordered": x, "nostalgic": x, "futuristic": x, "peaceful": x, "ominous": x}}`
}

// ---------- enrichment prompt ----------

export const ENRICH_SYSTEM = `You are a meticulous design researcher expanding encyclopedia entries about aesthetics with deep, accurate visual decomposition. Only include details genuinely characteristic of the aesthetic — omit fields that do not apply. Strict JSON only.`

export function enrichPrompt(entries: Array<{ name: string; summary: string }>): string {
  return `For each aesthetic below, produce a deep visual decomposition JSON object.

${entries.map((e, i) => `${i + 1}. ${e.name}${e.summary ? ' — ' + e.summary : ''}`).join('\n')}

Return a JSON array of ${entries.length} objects:
{"n": exact name, "vd": {"shape": shape language, "line": line language, "composition": composition, "texture": textures, "forms": recurring forms/motifs}, "typ": {"display": headline typography, "body": body typography, "notes": lettering notes}, "lit": {"quality": light quality, "direction": direction, "temperature": warm/cool, "shadow": shadow character}, "pho": {"approach": photographic approach, "grade": color grade / film look}, "arc": {"forms": architectural forms, "examples": real example buildings or settings}, "fash": {"silhouettes": ..., "garments": key garments, "acc": accessories & details}, "env": {"places": typical environments, "weather": weather/atmosphere}, "gd": {"layout": graphic layout style, "icon": iconography/motifs}, "ui": {"background": page background treatment, "surface": surface/card treatment, "components": buttons/inputs style, "motion": animation behavior}, "rec": {"materials": key materials for reproduction, "lighting": lighting advice, "objects": objects to acquire, "music": music associations, "scent": scent associations}, "snd": [sonic identity 2-4 items: music genres, ambient sounds, audio character]}

Rules: every string <= 220 chars. Only include what genuinely applies. Do not fabricate historical claims. All fields except snd are objects of short strings.`
}

// ---------- verification prompt ----------

export const VERIFY_SYSTEM = `You are a fact-checker reviewing encyclopedia entries about aesthetics, styles and movements. You verify whether each name genuinely refers to a documented aesthetic/style/movement/subculture (not invented, not a mislabel). Strict JSON only.`

export function verifyPrompt(names: Array<{ name: string; category: string; summary: string }>): string {
  return `Fact-check each of these aesthetics entries. Verdict:
- "confirmed": you are confident this is a real documented aesthetic/style/movement/subculture/visual language.
- "likely": probably real but documentation is thin or contested.
- "suspect": likely invented, a typo, a mislabel, or too trivial to document.

Entries:
${names.map((e, i) => `${i + 1}. ${e.name} [${e.category}] — ${e.summary.slice(0, 140)}`).join('\n')}

Return JSON array: [{"i": index, "v": "confirmed|likely|suspect", "c": 0-100 confidence, "note": short note}]`
}
