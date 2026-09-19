// Server-side read model. Every page and every /api/v1 route goes through
// these functions so the website and the public API always agree.
import { computeLayout } from './graph-layout'
import { listValue, type DuckDBValue } from '@duckdb/node-api'
import { query, queryOne } from '@/lib/store'
import { paletteMetrics } from '@/lib/palette-metrics'
import {
  KNOWN_DIMS,
  asColorArray,
  asImageArray,
  asStringArray,
  deriveRegion,
  eraBucket,
  mapAestheticFull,
  mapAestheticSummary,
  safeParse,
  type AestheticDetailResponse,
  type AestheticRow,
  type AestheticSummary,
  type AestheticsResponse,
  type ColorEntry,
  type ExploreResult,
  type Facets,
  type RelationTarget,
  type StatsResponse,
  type SuggestItem,
  type TimelineResponse,
} from '@/lib/aesthetic'

export type SortKey = 'popular' | 'name' | 'recent' | 'oldest' | 'newest'

export interface ListParams {
  q?: string
  categories?: string[]
  establishment?: string
  status?: string
  era?: string
  region?: string
  /** Free-text place: matches origin or geography. */
  place?: string
  /** Year range: records whose active period overlaps [from, to]. */
  from?: number
  to?: number
  /** With from/to: only records whose start year falls inside the range. */
  began?: boolean
  tag?: string
  niche?: boolean
  images?: boolean
  minPop?: number
  sort?: SortKey
  page?: number
  pageSize?: number
  facets?: boolean
}

export function parseListParams(sp: URLSearchParams, maxPageSize = 100): ListParams {
  const num = (k: string) => {
    const n = parseInt(sp.get(k) ?? '', 10)
    return Number.isNaN(n) ? undefined : n
  }
  const sort = sp.get('sort') as SortKey | null
  return {
    q: (sp.get('q') ?? '').trim().slice(0, 100) || undefined,
    categories: sp.getAll('category').filter(Boolean).slice(0, 20),
    establishment: sp.get('type') ?? sp.get('establishment') ?? undefined,
    status: sp.get('status') ?? undefined,
    era: sp.get('era') ?? undefined,
    region: sp.get('region') ?? undefined,
    place: (sp.get('place') ?? '').trim().slice(0, 80) || undefined,
    from: num('from'),
    to: num('to'),
    began: sp.get('began') === 'true' || undefined,
    tag: (sp.get('tag') ?? '').trim().slice(0, 60) || undefined,
    niche: sp.get('niche') === 'true' || undefined,
    images: sp.get('images') === 'true' || undefined,
    minPop: num('minPop'),
    sort: sort && ['popular', 'name', 'recent', 'oldest', 'newest'].includes(sort) ? sort : 'popular',
    page: Math.max(1, num('page') ?? 1),
    pageSize: Math.min(maxPageSize, Math.max(1, num('pageSize') ?? num('limit') ?? 24)),
    facets: sp.get('facets') !== 'false',
  }
}

const ORDER: Record<SortKey, string> = {
  popular: `(images <> '[]') DESC, popularity DESC, name`,
  name: 'name',
  recent: 'createdAt DESC, name',
  oldest: 'startYear NULLS LAST, name',
  newest: 'startYear DESC NULLS LAST, name',
}

function buildWhere(p: ListParams) {
  const where: string[] = []
  const params: DuckDBValue[] = []
  const bind = (v: DuckDBValue) => {
    params.push(v)
    return `$${params.length}`
  }
  if (p.q) {
    const needle = bind(p.q.toLowerCase())
    where.push(
      `(contains(lower(name), ${needle}) OR contains(lower(aliases), ${needle}) OR contains(lower(tags), ${needle}) OR contains(lower(summary), ${needle}) OR contains(lower(origin), ${needle}))`
    )
  }
  if (p.categories?.length) where.push(`list_contains(${bind(listValue(p.categories))}, category)`)
  if (p.establishment) where.push(`establishment = ${bind(p.establishment)}`)
  if (p.status) where.push(`status = ${bind(p.status)}`)
  if (p.era) where.push(`era = ${bind(p.era)}`)
  if (p.place) {
    const pl = bind(p.place.toLowerCase())
    where.push(`(contains(lower(origin), ${pl}) OR contains(lower(geography), ${pl}))`)
  }
  if (p.from !== undefined || p.to !== undefined) {
    where.push('startYear IS NOT NULL')
    if (p.to !== undefined) where.push(`startYear <= ${bind(p.to)}`)
    if (p.from !== undefined) where.push(p.began ? `startYear >= ${bind(p.from)}` : `coalesce(endYear, 9999) >= ${bind(p.from)}`)
  }
  if (p.tag) where.push(`list_contains(from_json(tags, '["VARCHAR"]'), ${bind(p.tag)})`)
  if (p.niche) where.push('isNiche')
  if (p.images) where.push(`images <> '[]'`)
  if (p.minPop !== undefined) where.push(`popularity >= ${bind(p.minPop)}`)
  return { where, params, bind }
}

export async function listAesthetics(p: ListParams): Promise<AestheticsResponse> {
  const { where, params, bind } = buildWhere(p)
  const page = p.page ?? 1
  const pageSize = p.pageSize ?? 24

  // Region is derived from free-text geography/origin, so resolve it in JS.
  if (p.region) {
    const rows = await query<{ slug: string; geography: string; origin: string }>(
      `SELECT slug, geography, origin FROM aesthetics ${where.length ? `WHERE ${where.join(' AND ')}` : ''}`,
      params
    )
    const slugs = rows.filter((r) => deriveRegion(r.geography, r.origin) === p.region).map((r) => r.slug)
    where.push(slugs.length ? `list_contains(${bind(listValue(slugs))}, slug)` : 'FALSE')
  }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : ''
  const [rows, count, facets] = await Promise.all([
    query<AestheticRow>(
      `SELECT * FROM aesthetics ${whereSql} ORDER BY ${ORDER[p.sort ?? 'popular']} LIMIT ${pageSize} OFFSET ${(page - 1) * pageSize}`,
      params
    ),
    queryOne<{ n: number }>(`SELECT count(*)::INT AS n FROM aesthetics ${whereSql}`, params),
    p.facets === false ? Promise.resolve(null) : getFacets(),
  ])
  return {
    items: rows.map(mapAestheticSummary),
    total: count?.n ?? 0,
    page,
    pageSize,
    facets: facets ?? emptyFacets(),
  }
}

/** Full rows for bulk exports (CSV/NDJSON of a filtered list). */
export async function listFullRows(p: ListParams, limit = 5000): Promise<AestheticRow[]> {
  const { where, params } = buildWhere(p)
  return query<AestheticRow>(
    `SELECT * FROM aesthetics ${where.length ? `WHERE ${where.join(' AND ')}` : ''} ORDER BY ${ORDER[p.sort ?? 'name']} LIMIT ${limit}`,
    params
  )
}

const emptyFacets = (): Facets => ({ categories: [], establishments: [], statuses: [], eras: [], regions: [], tags: [] })

type Count = { name: string; count: number }
let facetCache: { at: number; value: Facets } | null = null

export async function getFacets(): Promise<Facets> {
  if (facetCache && Date.now() - facetCache.at < 60_000) return facetCache.value
  const group = (col: string) =>
    query<Count>(`SELECT ${col} AS name, count(*)::INT AS count FROM aesthetics WHERE ${col} <> '' GROUP BY 1 ORDER BY 2 DESC, 1`)
  const [categories, establishments, statuses, eras, geo, tagRows] = await Promise.all([
    group('category'),
    group('establishment'),
    group('status'),
    group('era'),
    query<{ geography: string; origin: string }>('SELECT geography, origin FROM aesthetics'),
    query<{ tags: string }>('SELECT tags FROM aesthetics'),
  ])
  const regions = new Map<string, number>()
  for (const r of geo) {
    const k = deriveRegion(r.geography, r.origin)
    regions.set(k, (regions.get(k) ?? 0) + 1)
  }
  const tags = new Map<string, number>()
  for (const r of tagRows) for (const t of asStringArray(safeParse<unknown>(r.tags, []))) tags.set(t, (tags.get(t) ?? 0) + 1)
  const top = (m: Map<string, number>, n: number) =>
    [...m.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, n)
  const value: Facets = {
    categories: categories.sort((a, b) => a.name.localeCompare(b.name)),
    establishments,
    statuses,
    eras: eras.slice(0, 24),
    regions: top(regions, 24),
    tags: top(tags, 48),
  }
  facetCache = { at: Date.now(), value }
  return value
}

type Edge = Omit<RelationTarget, 'colors'> & { type: string; note: string; image: string | null; colors: string }
const firstColors = (raw: string | null | undefined) => asColorArray(safeParse<unknown>(raw, [])).slice(0, 6)

export async function getAesthetic(slug: string): Promise<AestheticDetailResponse | null> {
  const row = await queryOne<AestheticRow>('SELECT * FROM aesthetics WHERE slug = $1', [slug])
  if (!row) return null
  const edgeSql = (join: 'to' | 'from', match: 'from' | 'to') =>
    `SELECT r.type, r.note, a.slug, a.name, a.category, json_extract_string(a.images, '$[0].thumb') AS image, a.colors
     FROM relations r JOIN aesthetics a ON a.slug = r."${join}" WHERE r."${match}" = $1 ORDER BY r.type, a.name`
  const [outgoing, incoming] = await Promise.all([
    query<Edge>(edgeSql('to', 'from'), [slug]),
    query<Edge>(edgeSql('from', 'to'), [slug]),
  ])
  const target = (e: Edge): RelationTarget => ({ slug: e.slug, name: e.name, category: e.category, image: e.image, colors: firstColors(e.colors) })
  return {
    aesthetic: mapAestheticFull(row),
    relations: {
      outgoing: outgoing.map((e) => ({ type: e.type, note: e.note, target: target(e) })),
      incoming: incoming.map((e) => ({ type: e.type, note: e.note, source: target(e) })),
    },
  }
}

export async function getSummaries(slugs: string[]): Promise<AestheticSummary[]> {
  if (!slugs.length) return []
  const rows = await query<AestheticRow>('SELECT * FROM aesthetics WHERE list_contains($1, slug)', [listValue(slugs)])
  const by = new Map(rows.map((r) => [r.slug, mapAestheticSummary(r)]))
  return slugs.map((s) => by.get(s)).filter((x): x is AestheticSummary => !!x)
}

/** Same-category neighbours with images, for "more like this". */
export async function getSimilar(slug: string, category: string, limit = 8): Promise<AestheticSummary[]> {
  const rows = await query<AestheticRow>(
    `SELECT * FROM aesthetics WHERE category = $1 AND slug <> $2 AND images <> '[]'
     ORDER BY hash(slug || $2) LIMIT ${limit}`,
    [category, slug]
  )
  return rows.map(mapAestheticSummary)
}

export async function suggest(q: string, limit = 10): Promise<SuggestItem[]> {
  const needle = q.trim().toLowerCase().slice(0, 60)
  if (!needle) return []
  const rows = await query<Omit<SuggestItem, 'colors'> & { colors: string }>(
    `WITH c AS (
       SELECT slug, name, category, json_extract_string(images, '$[0].thumb') AS image, colors, lower(name) AS ln,
              list_transform(from_json(aliases, '["VARCHAR"]'), x -> lower(x)) AS la
       FROM aesthetics),
     r AS (
       SELECT slug, name, category, image, colors, length(name) AS nlen,
         CASE WHEN ln = $1 THEN 0
              WHEN starts_with(ln, $1) THEN 1
              WHEN len(list_filter(la, x -> starts_with(x, $1))) > 0 THEN 2
              WHEN contains(ln, $1) THEN 3
              WHEN len(list_filter(la, x -> contains(x, $1))) > 0 THEN 4
              ELSE 9 END AS rank
       FROM c)
     SELECT slug, name, category, image, colors FROM r WHERE rank < 9 ORDER BY rank, nlen, name LIMIT ${Math.min(50, limit)}`,
    [needle]
  )
  return rows.map((r) => ({ ...r, colors: firstColors(r.colors) }))
}

export async function randomAesthetic(mode = 'illustrated'): Promise<AestheticSummary | null> {
  const where: Record<string, string> = {
    any: 'TRUE',
    niche: 'isNiche',
    reviewed: `status = 'verified'`,
    illustrated: `images <> '[]'`,
  }
  const row = await queryOne<AestheticRow>(`SELECT * FROM aesthetics WHERE ${where[mode] ?? where.any} ORDER BY random() LIMIT 1`)
  return row ? mapAestheticSummary(row) : null
}

export async function getTimeline(): Promise<TimelineResponse> {
  const rows = await query<{
    slug: string
    name: string
    category: string
    startYear: number
    endYear: number | null
    periodStart: string
    colors: string
    popularity: number
    establishment: string
    image: string | null
  }>(
    `SELECT slug, name, category, startYear, endYear, periodStart, colors, popularity, establishment,
            json_extract_string(images, '$[0].thumb') AS image
     FROM aesthetics WHERE startYear IS NOT NULL ORDER BY startYear, name`
  )
  const items = rows.map((r) => ({
    slug: r.slug,
    name: r.name,
    category: r.category,
    startYear: r.startYear,
    endYear: r.endYear ?? null,
    periodLabel: r.periodStart,
    colors: asColorArray(safeParse<unknown>(r.colors, [])),
    popularity: r.popularity,
    establishment: r.establishment,
    image: r.image,
  }))
  return {
    items,
    min: items.length ? items[0].startYear : null,
    max: items.length ? Math.max(...items.map((i) => i.startYear)) : null,
  }
}

export function parseDims(raw: string): Map<string, number> {
  const dims = new Map<string, number>()
  for (const part of raw.split(',')) {
    const [key, val] = part.split(':')
    const n = parseFloat(val ?? '')
    if (key && KNOWN_DIMS.has(key.trim()) && !Number.isNaN(n)) dims.set(key.trim(), Math.min(100, Math.max(0, n)))
  }
  return dims
}

/** Nearest aesthetics to a target palette profile (mean absolute distance over the given metrics). */
export async function discover(dims: Map<string, number>, category?: string, limit = 24): Promise<ExploreResult[]> {
  const rows = await query<{
    slug: string
    name: string
    category: string
    summary: string
    colors: string
    dnaAxes: string
    emotionProfile: string
    images: string
  }>(
    `SELECT slug, name, category, summary, colors, dnaAxes, emotionProfile, images FROM aesthetics WHERE json_array_length(colors) >= 3 ${category ? 'AND category = $1' : ''}`,
    category ? [category] : []
  )
  const withValues = rows
    .map((row) => ({
      row,
      values: { ...(paletteMetrics(asColorArray(safeParse<unknown>(row.colors, []))) ?? {}) } as Record<string, unknown>,
    }))
    // Only rank records that were actually assessed on at least half of the requested dimensions.
    .filter(({ values }) => [...dims.keys()].filter((d) => typeof values[d] === 'number').length >= Math.ceil(dims.size / 2))
  const scored = withValues.map(({ row, values }) => {
    const val = (d: string) => {
      const v = values[d]
      return typeof v === 'number' ? Math.min(100, Math.max(0, v)) : 50
    }
    let sum = 0
    const delta: Record<string, number> = {}
    for (const [d, target] of dims) {
      sum += Math.abs(val(d) - target)
      delta[d] = Math.round((val(d) - target) * 10) / 10
    }
    const img = asImageArray(safeParse<unknown>(row.images, []))[0]
    return {
      slug: row.slug,
      name: row.name,
      category: row.category,
      summary: row.summary,
      colors: asColorArray(safeParse<unknown>(row.colors, [])),
      image: img ? (img.thumb ?? img.url) : null,
      distance: Math.round((sum / Math.max(1, dims.size)) * 10) / 10,
      delta,
    }
  })
  return scored.sort((a, b) => a.distance - b.distance || (b.image ? 1 : 0) - (a.image ? 1 : 0)).slice(0, limit)
}

export async function getStats(): Promise<StatsResponse> {
  const group = (col: string) =>
    query<Count>(`SELECT ${col} AS name, count(*)::INT AS count FROM aesthetics GROUP BY 1 ORDER BY 2 DESC, 1`)
  const [totals, byStatus, byCategory, byEstablishment, byDataQuality, geo] = await Promise.all([
    queryOne<{
      total: number
      relations: number
      withImages: number
      images: number
      withWikidata: number
      lastUpdated: string | null
    }>(
      `SELECT count(*)::INT AS total,
              (SELECT count(*)::INT FROM relations) AS relations,
              count(*) FILTER (WHERE images <> '[]')::INT AS withImages,
              coalesce(sum(json_array_length(images)), 0)::INT AS images,
              count(*) FILTER (WHERE wikidata IS NOT NULL)::INT AS withWikidata,
              max(updatedAt) AS lastUpdated
       FROM aesthetics`
    ),
    group('status'),
    group('category'),
    group('establishment'),
    group('dataQuality'),
    query<{ geography: string; origin: string; startYear: number | null }>('SELECT geography, origin, startYear FROM aesthetics'),
  ])
  const era = new Map<string, number>()
  const region = new Map<string, number>()
  for (const r of geo) {
    const e = eraBucket(r.startYear)
    era.set(e, (era.get(e) ?? 0) + 1)
    const g = deriveRegion(r.geography, r.origin)
    region.set(g, (region.get(g) ?? 0) + 1)
  }
  const sorted = (m: Map<string, number>) =>
    [...m.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count)
  return {
    total: totals?.total ?? 0,
    relations: totals?.relations ?? 0,
    withImages: totals?.withImages ?? 0,
    images: totals?.images ?? 0,
    withWikidata: totals?.withWikidata ?? 0,
    byStatus,
    byCategory,
    byEstablishment,
    byEra: sorted(era),
    byRegion: sorted(region),
    byDataQuality,
    lastUpdated: totals?.lastUpdated ?? null,
  }
}

/** Lightweight index of every record (sitemap, llms.txt, static params). */
export async function listIndex(): Promise<
  { slug: string; name: string; category: string; summary: string; updatedAt: string; image: string | null }[]
> {
  return query(
    `SELECT slug, name, category, summary, updatedAt, json_extract_string(images, '$[0].thumb') AS image
     FROM aesthetics ORDER BY name`
  )
}

/** Picks for the home page: illustrated, well-known records spread across categories. */
export async function getShowcase(limit = 24): Promise<AestheticSummary[]> {
  const rows = await query<AestheticRow>(
    `SELECT * FROM (
       SELECT *, row_number() OVER (PARTITION BY category ORDER BY popularity DESC, json_array_length(images) DESC) AS rn
       FROM aesthetics WHERE json_array_length(images) >= 3)
     WHERE rn <= 3 ORDER BY popularity DESC, name LIMIT ${limit}`
  )
  return rows.map(mapAestheticSummary)
}

export async function getCategoryOverview(): Promise<{ name: string; count: number; image: string | null; slug: string | null }[]> {
  return query(
    `SELECT category AS name, count(*)::INT AS count,
            arg_max(json_extract_string(images, '$[0].thumb'), popularity * (images <> '[]')::INT) AS image,
            arg_max(slug, popularity * (images <> '[]')::INT) AS slug
     FROM aesthetics GROUP BY category ORDER BY count DESC`
  )
}

/** Field → SQL predicate that is TRUE when the field is missing. */
const CORE_FIELDS: Record<string, string> = {
  palette: `colors = '[]'`,
  period: `periodStart = ''`,
  origin: `origin = ''`,
  materials: `materials = '[]'`,
  textures: `textures = '[]'`,
  objects: `objects = '[]'`,
  examples: `keyExamples = '[]'`,
  images: `images = '[]'`,
}
const DEEP_FIELDS: Record<string, string> = {
  description: `length(description) < 200`,
  'cultural context': `culturalContext = ''`,
  'visual grammar': `visualDNA = '{}'`,
  typography: `typography = '{}'`,
  lighting: `lighting = '{}'`,
  'interface translation': `uiTranslation = '{}'`,
  'how to evoke it': `recipe = '{}'`,
  sound: `sounds = '[]'`,
  sources: `sources = '[]'`,
  'encyclopedia link': `wikipedia IS NULL`,
}

export interface Completeness {
  core: number
  deep: number
  gaps: { field: string; missing: number }[]
}

export async function getCompleteness(): Promise<Completeness> {
  const all = { ...CORE_FIELDS, ...DEEP_FIELDS }
  const keys = Object.keys(all)
  const row = await queryOne<Record<string, number>>(
    `SELECT count(*)::INT AS total, ${keys.map((k, i) => `count(*) FILTER (WHERE ${all[k]})::INT AS m${i}`).join(', ')} FROM aesthetics`
  )
  const total = row?.total ?? 0
  const missing = (k: string) => row?.[`m${keys.indexOf(k)}`] ?? 0
  const pct = (fields: string[]) =>
    total ? Math.round(((fields.length * total - fields.reduce((s, f) => s + missing(f), 0)) / (fields.length * total)) * 100) : 100
  return {
    core: pct(Object.keys(CORE_FIELDS)),
    deep: pct(Object.keys(DEEP_FIELDS)),
    gaps: keys.map((field) => ({ field, missing: missing(field) })).sort((a, b) => b.missing - a.missing),
  }
}

export interface GraphNode {
  slug: string
  name: string
  category: string
  image: string | null
  color: string | null
  startYear: number | null
  degree: number
  /** Precomputed layout (src/lib/graph-layout.ts): 2D map position and 3D position. */
  x: number
  y: number
  X: number
  Y: number
  Z: number
}
export interface GraphLink {
  source: string
  target: string
  type: string
}

/** Whole relationship network (records with at least one relation). */
// The layout is deterministic for a given data build, so it is computed once per server process.
let graphCache: Promise<{ nodes: GraphNode[]; links: GraphLink[] }> | null = null
export function getGraph(): Promise<{ nodes: GraphNode[]; links: GraphLink[] }> {
  graphCache ??= buildGraph().catch((e) => {
    graphCache = null
    throw e
  })
  return graphCache
}
async function buildGraph(): Promise<{ nodes: GraphNode[]; links: GraphLink[] }> {
  const [links, raw] = await Promise.all([
    query<GraphLink>(`SELECT "from" AS source, "to" AS target, type FROM relations`),
    query<GraphNode>(
      `WITH deg AS (
         SELECT slug, count(*)::INT AS degree FROM (
           SELECT "from" AS slug FROM relations UNION ALL SELECT "to" AS slug FROM relations) GROUP BY slug)
       SELECT a.slug, a.name, a.category, json_extract_string(a.images, '$[0].thumb') AS image,
              json_extract_string(a.colors, '$[0].hex') AS color, a.startYear, d.degree
       FROM aesthetics a JOIN deg d USING (slug) ORDER BY d.degree DESC`
    ),
  ])
  const pos = computeLayout(raw as unknown as { slug: string; category: string; degree: number }[], links)
  const nodes = (raw as unknown as Omit<GraphNode, 'x' | 'y' | 'X' | 'Y' | 'Z'>[]).map((n) => ({ ...n, ...(pos.get(n.slug) ?? { x: 0, y: 0, X: 0, Y: 0, Z: 0 }) }))
  return { nodes, links }
}

/** Every palette colour with its record, for the colour atlas. */
export async function getColorIndex(): Promise<{ slug: string; name: string; category: string; hex: string; colorName: string }[]> {
  return query(
    `SELECT a.slug, a.name, a.category, c.hex, c.name AS colorName
     FROM aesthetics a,
          UNNEST(from_json(a.colors, '[{"hex":"VARCHAR","name":"VARCHAR"}]')) AS t(c)
     WHERE c.hex IS NOT NULL`
  )
}

/** Records whose palettes contain a colour near `hex` (redmean distance), closest first. */
export async function searchByColor(hex: string, limit = 36): Promise<(AestheticSummary & { distance: number; match: string })[]> {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex)
  if (!m) return []
  const n = parseInt(m[1], 16)
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255]
  const rows = await query<AestheticRow & { distance: number; match: string }>(
    `WITH cols AS (
       SELECT a.slug, c.hex,
              ('0x' || substr(c.hex, 2, 2))::INT AS r, ('0x' || substr(c.hex, 4, 2))::INT AS g, ('0x' || substr(c.hex, 6, 2))::INT AS b
       FROM aesthetics a, UNNEST(from_json(a.colors, '[{"hex":"VARCHAR","name":"VARCHAR"}]')) AS t(c)
       WHERE regexp_matches(c.hex, '^#[0-9a-fA-F]{6}$')),
     dist AS (
       SELECT slug, hex,
              sqrt((2 + ((r + $1) / 2.0) / 256) * (r - $1) ^ 2 + 4 * (g - $2) ^ 2 + (2 + (255 - (r + $1) / 2.0) / 256) * (b - $3) ^ 2) AS d
       FROM cols),
     best AS (SELECT slug, min(d) AS distance, arg_min(hex, d) AS match FROM dist GROUP BY slug)
     SELECT a.*, best.distance, best.match FROM best JOIN aesthetics a USING (slug)
     ORDER BY best.distance, a.popularity DESC LIMIT ${Math.min(120, limit)}`,
    [r, g, b]
  )
  return rows.map((row) => ({ ...mapAestheticSummary(row), distance: Math.round(row.distance), match: row.match }))
}

export interface LineageNode {
  slug: string
  name: string
  image: string | null
  colors?: ColorEntry[]
  children: LineageNode[]
}

// Relation types read as "A descends from B" when A --type--> B.
const UP = ['influenced_by', 'variant_of', 'parent', 'hybrid_of']

/** Ancestors and descendants up to `depth` generations (each generation capped for legibility). */
export async function getLineage(slug: string, depth = 2, width = 8): Promise<{ ancestors: LineageNode[]; descendants: LineageNode[] }> {
  const rows = await query<{ from: string; to: string; type: string }>(`SELECT "from", "to", type FROM relations`)
  const up = new Map<string, Set<string>>()
  const down = new Map<string, Set<string>>()
  const add = (m: Map<string, Set<string>>, k: string, v: string) => {
    if (!m.has(k)) m.set(k, new Set())
    m.get(k)!.add(v)
  }
  for (const r of rows) {
    if (UP.includes(r.type)) {
      add(up, r.from, r.to)
      add(down, r.to, r.from)
    } else if (r.type === 'influenced') {
      add(down, r.from, r.to)
      add(up, r.to, r.from)
    }
  }
  const info = new Map(
    (
      await query<{ slug: string; name: string; image: string | null; colors: string }>(
        `SELECT slug, name, json_extract_string(images, '$[0].thumb') AS image, colors FROM aesthetics`
      )
    ).map((r) => [r.slug, r])
  )
  const build = (from: string, m: Map<string, Set<string>>, level: number, seen: Set<string>): LineageNode[] => {
    if (level > depth) return []
    return [...(m.get(from) ?? [])]
      .filter((s) => !seen.has(s) && info.has(s))
      .slice(0, level === 1 ? width : Math.ceil(width / 2))
      .map((s) => {
        seen.add(s)
        const i = info.get(s)!
        return { slug: s, name: i.name, image: i.image, colors: firstColors(i.colors), children: build(s, m, level + 1, seen) }
      })
  }
  return { ancestors: build(slug, up, 1, new Set([slug])), descendants: build(slug, down, 1, new Set([slug])) }
}

/** Links among a set of records (for the connection map). */
export async function getLinksAmong(slugs: string[]): Promise<{ from: string; to: string; type: string }[]> {
  if (slugs.length < 2) return []
  return query(`SELECT "from", "to", type FROM relations WHERE list_contains($1, "from") AND list_contains($1, "to")`, [listValue(slugs)])
}

/** Aggregates for the "library at a glance" charts. */
export async function getInsights() {
  const [centuries, origins, licenses, sources] = await Promise.all([
    query<{ century: number; count: number }>(
      `SELECT (floor(startYear / 100) * 100)::INT AS century, count(*)::INT AS count
       FROM aesthetics WHERE startYear IS NOT NULL AND startYear >= -3000 GROUP BY 1 ORDER BY 1`
    ),
    query<{ name: string; count: number }>(
      `SELECT trim(o) AS name, count(*)::INT AS count
       FROM aesthetics, UNNEST(string_split(origin, ',')) AS t(o)
       WHERE trim(o) <> '' AND length(trim(o)) < 40 GROUP BY 1 ORDER BY 2 DESC LIMIT 24`
    ),
    query<{ name: string; count: number }>(
      `SELECT coalesce(nullif(regexp_replace(i.license, '\s+\d.*$', ''), ''), 'Unspecified') AS name, count(*)::INT AS count
       FROM aesthetics, UNNEST(from_json(images, '[{"license":"VARCHAR"}]')) AS t(i) GROUP BY 1 ORDER BY 2 DESC LIMIT 8`
    ),
    query<{ name: string; count: number }>(
      `SELECT i.source AS name, count(*)::INT AS count
       FROM aesthetics, UNNEST(from_json(images, '[{"source":"VARCHAR"}]')) AS t(i) GROUP BY 1 ORDER BY 2 DESC`
    ),
  ])
  return { centuries, origins, licenses, sources }
}
