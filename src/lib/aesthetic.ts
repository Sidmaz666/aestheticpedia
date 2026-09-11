// Aesthetic Atlas — shared types, defensive JSON parsing, region + era mapping.
// Used by both API route handlers (server) and frontend components (client).
// Contains no server-only imports.

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ColorEntry {
  hex: string
  name: string
}

export interface SourceEntry {
  name: string
  url?: string
  tier?: string
}

export interface ImageEntry {
  url: string
  caption: string
  source: string
  width: string
  height: string
}

/** Compact record used in grids/lists. */
export interface AestheticSummary {
  slug: string
  name: string
  category: string
  subcategory: string
  establishment: string
  status: string
  era: string
  origin: string
  geography: string
  periodStart: string
  periodEnd: string
  startYear: number | null
  endYear: number | null
  summary: string
  colors: ColorEntry[]
  tags: string[]
  popularity: number
  isNiche: boolean
  dataQuality: string
  /** First example image URL (or null) — used for card thumbnails. */
  image: string | null
}

/** Full record — every JSON column parsed, ready for the detail view. */
export interface AestheticFull extends AestheticSummary {
  aliases: string[]
  confidence: number
  description: string
  culturalContext: string
  visualDNA: Record<string, string>
  typography: Record<string, string>
  materials: string[]
  textures: string[]
  lighting: Record<string, string>
  photography: Record<string, string>
  architecture: Record<string, string>
  fashion: Record<string, string>
  objects: string[]
  environment: Record<string, string>
  graphicDesign: Record<string, string>
  uiTranslation: Record<string, string>
  recipe: Record<string, string | string[]>
  emotionProfile: Record<string, number>
  dnaAxes: Record<string, number>
  keyExamples: string[]
  sounds: string[]
  sources: SourceEntry[]
  images: ImageEntry[]
  verifiedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface RelationTarget {
  slug: string
  name: string
  category: string
}

export interface ResolvedRelations {
  outgoing: { type: string; note: string; target: RelationTarget }[]
  incoming: { type: string; note: string; source: RelationTarget }[]
}

export interface Facets {
  categories: { name: string; count: number }[]
  establishments: { name: string; count: number }[]
  statuses: { name: string; count: number }[]
  eras: { name: string; count: number }[]
  regions: { name: string; count: number }[]
  tags: { name: string; count: number }[]
}

export interface AestheticsResponse {
  items: AestheticSummary[]
  total: number
  page: number
  pageSize: number
  facets: Facets
}

export interface AestheticDetailResponse {
  aesthetic: AestheticFull
  relations: ResolvedRelations
}

export interface StatsResponse {
  total: number
  relations: number
  byStatus: { name: string; count: number }[]
  byCategory: { name: string; count: number }[]
  byEstablishment: { name: string; count: number }[]
  byEra: { name: string; count: number }[]
  byRegion: { name: string; count: number }[]
  byDataQuality: { name: string; count: number }[]
  pipeline: PipelineInfo
  lastUpdated: string | null
}

export interface PipelineBatch {
  domain: string
  kind: string
  status: string
  inserted: number
  duplicates: number
  error: string
  finishedAt: string | null
  createdAt: string
}

export interface PipelineInfo {
  queued: number
  running: number
  done: number
  failed: number
  backlogOpen: number
  recent: PipelineBatch[]
}

export interface PipelineResponse extends PipelineInfo {
  queuedDomains: { domain: string; kind: string }[]
}

export interface ExploreResult {
  slug: string
  name: string
  category: string
  summary: string
  colors: ColorEntry[]
  distance: number
  delta: Record<string, number>
}

export interface TimelineItem {
  slug: string
  name: string
  category: string
  startYear: number
  endYear: number | null
  periodLabel: string
  colors: ColorEntry[]
  popularity: number
  establishment: string
}

export interface TimelineResponse {
  items: TimelineItem[]
  min: number | null
  max: number | null
}

export interface SuggestItem {
  slug: string
  name: string
  category: string
}

export interface HybridResult {
  name?: string
  tagline?: string
  palette?: ColorEntry[]
  materials?: string[]
  typography?: { display?: string; body?: string }
  architecture?: string
  fashion?: string
  objects?: string[]
  lighting?: string
  ui?: { background?: string; surface?: string; components?: string; motion?: string }
  photography?: string
  sharedDNA?: string[]
  conflicts?: string[]
  synthesis?: string
}

export interface HybridResponse {
  hybrid: HybridResult
  parents: { slug: string; name: string; colors: ColorEntry[] }[]
  label: string
}

// ---------------------------------------------------------------------------
// Defensive JSON parsing
// ---------------------------------------------------------------------------

export function safeParse<T>(raw: string | null | undefined, fallback: T): T {
  if (raw === null || raw === undefined || raw === '') return fallback
  try {
    const parsed: unknown = JSON.parse(raw)
    return (parsed ?? fallback) as T
  } catch {
    return fallback
  }
}

/** Coerce an unknown value into a string array (filters non-strings). */
export function asStringArray(value: unknown, fallback: string[] = []): string[] {
  if (!Array.isArray(value)) return fallback
  return value.filter((v): v is string => typeof v === 'string')
}

/** Coerce an unknown value into a 0-100 number, clamped. */
export function asScore(value: unknown): number | null {
  const n = typeof value === 'number' ? value : typeof value === 'string' ? parseFloat(value) : NaN
  if (Number.isNaN(n)) return null
  return Math.min(100, Math.max(0, Math.round(n * 10) / 10))
}

/** Coerce an unknown value into a string record (string keys/values only). */
export function asStringRecord(value: unknown, fallback: Record<string, string> = {}): Record<string, string> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return fallback
  const out: Record<string, string> = {}
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    if (v !== null && v !== undefined && typeof v !== 'object') out[k] = String(v)
  }
  return out
}

export function asNumberRecord(value: unknown, fallback: Record<string, number> = {}): Record<string, number> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return fallback
  const out: Record<string, number> = {}
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    const n = asScore(v)
    if (n !== null) out[k] = n
  }
  return out
}

export function asColorArray(value: unknown, fallback: ColorEntry[] = []): ColorEntry[] {
  if (!Array.isArray(value)) return fallback
  return value
    .map((c) => {
      if (!c || typeof c !== 'object') return null
      const hex = typeof (c as Record<string, unknown>).hex === 'string' ? ((c as Record<string, unknown>).hex as string) : ''
      const name = typeof (c as Record<string, unknown>).name === 'string' ? ((c as Record<string, unknown>).name as string) : ''
      return hex || name ? { hex, name } : null
    })
    .filter((c): c is ColorEntry => c !== null)
}

export function asSourceArray(value: unknown, fallback: SourceEntry[] = []): SourceEntry[] {
  if (!Array.isArray(value)) return fallback
  return value
    .map((s) => {
      if (typeof s === 'string') return { name: s }
      if (!s || typeof s !== 'object') return null
      const rec = s as Record<string, unknown>
      const name = typeof rec.name === 'string' ? rec.name : ''
      if (!name) return null
      return {
        name,
        url: typeof rec.url === 'string' ? rec.url : undefined,
        tier: typeof rec.tier === 'string' ? rec.tier : undefined,
      }
    })
    .filter((s): s is SourceEntry => s !== null)
}

export function asImageArray(value: unknown, fallback: ImageEntry[] = []): ImageEntry[] {
  if (!Array.isArray(value)) return fallback
  return value
    .map((img) => {
      if (!img || typeof img !== 'object') return null
      const rec = img as Record<string, unknown>
      const url = typeof rec.url === 'string' && /^https?:\/\//.test(rec.url) ? rec.url : ''
      if (!url) return null
      const str = (v: unknown, max: number) => (typeof v === 'string' ? v.slice(0, max) : '')
      return {
        url,
        caption: str(rec.caption, 200),
        source: str(rec.source, 80),
        width: str(rec.width, 10),
        height: str(rec.height, 10),
      }
    })
    .filter((img): img is ImageEntry => img !== null)
}

// ---------------------------------------------------------------------------
// Raw row → API shapes (rows come from Prisma with JSON columns as strings)
// ---------------------------------------------------------------------------

export interface AestheticRow {
  slug: string
  name: string
  aliases: string
  category: string
  subcategory: string
  establishment: string
  status: string
  confidence: number
  origin: string
  geography: string
  periodStart: string
  periodEnd: string
  startYear: number | null
  endYear: number | null
  era: string
  summary: string
  description: string
  culturalContext: string
  visualDNA: string
  colors: string
  typography: string
  materials: string
  textures: string
  lighting: string
  photography: string
  architecture: string
  fashion: string
  objects: string
  environment: string
  graphicDesign: string
  uiTranslation: string
  recipe: string
  emotionProfile: string
  dnaAxes: string
  keyExamples: string
  sounds: string
  sources: string
  images: string
  tags: string
  popularity: number
  isNiche: boolean
  dataQuality: string
  verifiedAt?: Date | string | null
  createdAt?: Date | string
  updatedAt?: Date | string
}

const iso = (d: Date | string | null | undefined): string | null => {
  if (!d) return null
  try {
    return d instanceof Date ? d.toISOString() : new Date(d).toISOString()
  } catch {
    return null
  }
}

export function mapAestheticSummary(row: AestheticRow): AestheticSummary {
  const images = asImageArray(safeParse<unknown>(row.images, []))
  return {
    slug: row.slug,
    name: row.name,
    category: row.category,
    subcategory: row.subcategory ?? '',
    establishment: row.establishment,
    status: row.status,
    era: row.era,
    origin: row.origin,
    geography: row.geography,
    periodStart: row.periodStart,
    periodEnd: row.periodEnd,
    startYear: row.startYear ?? null,
    endYear: row.endYear ?? null,
    summary: row.summary,
    colors: asColorArray(safeParse<unknown>(row.colors, [])),
    tags: asStringArray(safeParse<unknown>(row.tags, [])),
    popularity: row.popularity,
    isNiche: row.isNiche,
    dataQuality: row.dataQuality,
    image: images[0]?.url ?? null,
  }
}

export function mapAestheticFull(row: AestheticRow): AestheticFull {
  return {
    ...mapAestheticSummary(row),
    aliases: asStringArray(safeParse<unknown>(row.aliases, [])),
    confidence: row.confidence,
    description: row.description,
    culturalContext: row.culturalContext,
    visualDNA: asStringRecord(safeParse<unknown>(row.visualDNA, {})),
    typography: asStringRecord(safeParse<unknown>(row.typography, {})),
    materials: asStringArray(safeParse<unknown>(row.materials, [])),
    textures: asStringArray(safeParse<unknown>(row.textures, [])),
    lighting: asStringRecord(safeParse<unknown>(row.lighting, {})),
    photography: asStringRecord(safeParse<unknown>(row.photography, {})),
    architecture: asStringRecord(safeParse<unknown>(row.architecture, {})),
    fashion: asStringRecord(safeParse<unknown>(row.fashion, {})),
    objects: asStringArray(safeParse<unknown>(row.objects, [])),
    environment: asStringRecord(safeParse<unknown>(row.environment, {})),
    graphicDesign: asStringRecord(safeParse<unknown>(row.graphicDesign, {})),
    uiTranslation: asStringRecord(safeParse<unknown>(row.uiTranslation, {})),
    recipe: safeParse<Record<string, string | string[]>>(row.recipe, {}),
    emotionProfile: asNumberRecord(safeParse<unknown>(row.emotionProfile, {})),
    dnaAxes: asNumberRecord(safeParse<unknown>(row.dnaAxes, {})),
    keyExamples: asStringArray(safeParse<unknown>(row.keyExamples, [])),
    sounds: asStringArray(safeParse<unknown>(row.sounds, [])),
    sources: asSourceArray(safeParse<unknown>(row.sources, [])),
    images: asImageArray(safeParse<unknown>(row.images, [])),
    verifiedAt: iso(row.verifiedAt),
    createdAt: iso(row.createdAt) ?? new Date(0).toISOString(),
    updatedAt: iso(row.updatedAt) ?? new Date(0).toISOString(),
  }
}

// ---------------------------------------------------------------------------
// Region derivation — priority-ordered, first match wins
// ---------------------------------------------------------------------------

const REGION_RULES: [RegExp, string][] = [
  [/japan/i, 'Japan'],
  [/china/i, 'China'],
  [/korea/i, 'Korea'],
  [/india|south asia/i, 'South Asia'],
  [/islamic|arab|persia|iran|ottoman|moorish/i, 'Middle East & Persia'],
  [/africa/i, 'Africa'],
  [/latin|mexico|andea|andes|aztec|maya|inca/i, 'Latin America'],
  [/france|paris/i, 'France'],
  [/italy/i, 'Italy'],
  [/german/i, 'Germany'],
  [/britain|british|england|scotland|wales|ireland|\buk\b/i, 'UK & Ireland'],
  [/scandinav|nordic|denmark|sweden|norway|finland|iceland/i, 'Nordic'],
  [/russia|soviet/i, 'Russia & Soviet'],
  [/america|usa|u\.s\.|united states|american/i, 'North America'],
]

/** Derive a short region label from geography/origin text (first match by priority). */
export function deriveRegion(...parts: (string | null | undefined)[]): string {
  const text = parts.filter((p): p is string => !!p).join(' ')
  if (!text) return 'Other/Global'
  for (const [re, label] of REGION_RULES) {
    if (re.test(text)) return label
  }
  return 'Other/Global'
}

// ---------------------------------------------------------------------------
// Era bucketing (for stats byEra)
// ---------------------------------------------------------------------------

export const ERA_BUCKETS = [
  'Antiquity-1400',
  '15th',
  '16th',
  '17th',
  '18th',
  '19th',
  '1900s',
  '1910s',
  '1920s',
  '1930s',
  '1940s',
  '1950s',
  '1960s',
  '1970s',
  '1980s',
  '1990s',
  '2000s',
  '2010s',
  '2020s',
  'Unspecified',
] as const

export function eraBucket(startYear: number | null | undefined): string {
  if (startYear === null || startYear === undefined || Number.isNaN(startYear)) return 'Unspecified'
  if (startYear <= 1400) return 'Antiquity-1400'
  if (startYear <= 1500) return '15th'
  if (startYear <= 1600) return '16th'
  if (startYear <= 1700) return '17th'
  if (startYear <= 1800) return '18th'
  if (startYear <= 1900) return '19th'
  const decade = Math.floor(startYear / 10) * 10
  if (decade <= 2020) return `${decade}s`
  return '2020s'
}

// ---------------------------------------------------------------------------
// Display helpers
// ---------------------------------------------------------------------------

/** 'regional_tradition' → 'Regional Tradition' */
export function labelize(value: string): string {
  if (!value) return ''
  return value
    .split(/[\s_]+/)
    .map((w) => (w.length > 2 ? w[0].toUpperCase() + w.slice(1) : w.toUpperCase()))
    .join(' ')
}

export const STATUS_DOTS: Record<string, string> = {
  verified: 'bg-emerald-500',
  researched: 'bg-amber-500',
  draft: 'bg-stone-400',
  flagged: 'bg-red-500',
}

// ---------------------------------------------------------------------------
// DNA axes + emotion keys (shared vocabulary between API and UI)
// ---------------------------------------------------------------------------

export interface DnaAxis {
  key: string
  left: string
  right: string
}

export const DNA_AXES: DnaAxis[] = [
  { key: 'minimal_maximal', left: 'Minimal', right: 'Maximal' },
  { key: 'organic_geometric', left: 'Organic', right: 'Geometric' },
  { key: 'warm_cold', left: 'Warm', right: 'Cold' },
  { key: 'natural_synthetic', left: 'Natural', right: 'Synthetic' },
  { key: 'analog_digital', left: 'Analog', right: 'Digital' },
  { key: 'historical_futuristic', left: 'Historical', right: 'Futuristic' },
  { key: 'refined_raw', left: 'Refined', right: 'Raw' },
  { key: 'playful_serious', left: 'Playful', right: 'Serious' },
  { key: 'soft_harsh', left: 'Soft', right: 'Harsh' },
  { key: 'quiet_loud', left: 'Quiet', right: 'Loud' },
  { key: 'orderly_chaotic', left: 'Orderly', right: 'Chaotic' },
  { key: 'dense_spacious', left: 'Dense', right: 'Spacious' },
  { key: 'realistic_surreal', left: 'Realistic', right: 'Surreal' },
  { key: 'elegant_utilitarian', left: 'Elegant', right: 'Utilitarian' },
  { key: 'nostalgic_progressive', left: 'Nostalgic', right: 'Progressive' },
]

export const EMOTION_KEYS = [
  'warm',
  'cold',
  'playful',
  'serious',
  'chaotic',
  'ordered',
  'nostalgic',
  'futuristic',
  'peaceful',
  'ominous',
] as const

export const KNOWN_DIMS = new Set<string>([...DNA_AXES.map((a) => a.key), ...EMOTION_KEYS])

export const ESTABLISHMENT_LABELS: Record<string, string> = {
  historical: 'Historical',
  regional_tradition: 'Regional Tradition',
  community_subculture: 'Community Subculture',
  commercial_style: 'Commercial Style',
  internet_aesthetic: 'Internet Aesthetic',
  experimental_hybrid: 'Experimental Hybrid',
}

export const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  researched: 'Researched',
  verified: 'Verified',
  flagged: 'Flagged',
}

export const DATA_QUALITY_LABELS: Record<string, string> = {
  well_documented: 'Well documented',
  moderately_documented: 'Moderately documented',
  emerging: 'Emerging',
  interpretive: 'Interpretive',
  experimental: 'Experimental',
}

// ---------------------------------------------------------------------------
// Client-side atlas filter state
// ---------------------------------------------------------------------------

export type SortKey = 'popular' | 'recent' | 'name'

export interface AtlasFilters {
  q: string
  categories: string[]
  establishment: string
  status: string
  era: string
  region: string
  tag: string
  niche: boolean
  sort: SortKey
  page: number
}

export const DEFAULT_FILTERS: AtlasFilters = {
  q: '',
  categories: [],
  establishment: '',
  status: '',
  era: '',
  region: '',
  tag: '',
  niche: false,
  sort: 'popular',
  page: 1,
}

/** True when any filter is actively constraining the atlas grid. */
export function filtersActive(f: AtlasFilters): boolean {
  return !!(
    f.q.trim() ||
    f.categories.length > 0 ||
    f.establishment ||
    f.status ||
    f.era ||
    f.region ||
    f.tag ||
    f.niche
  )
}

/** Serialize filters into a query string for /api/aesthetics. */
export function filtersToQuery(f: AtlasFilters): string {
  const sp = new URLSearchParams()
  if (f.q.trim()) sp.set('q', f.q.trim())
  f.categories.forEach((c) => sp.append('category', c))
  if (f.establishment) sp.set('establishment', f.establishment)
  if (f.status) sp.set('status', f.status)
  if (f.era) sp.set('era', f.era)
  if (f.region) sp.set('region', f.region)
  if (f.tag) sp.set('tag', f.tag)
  if (f.niche) sp.set('niche', 'true')
  if (f.sort !== 'popular') sp.set('sort', f.sort)
  sp.set('page', String(f.page))
  sp.set('pageSize', '24')
  return sp.toString()
}
