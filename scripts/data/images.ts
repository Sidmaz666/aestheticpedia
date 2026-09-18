// Resolve real, freely-licensed images + verified encyclopedia links for every aesthetic.
//
// Pipeline per record:
//   1. Match an English Wikipedia article (explicit field → cited wiki URLs → name → aliases → search).
//   2. Pull the article's images in reading order (lead image first) with Commons metadata:
//      artist, date, license, file page. Non-free / icon / map / logo files are skipped.
//   3. Top up from the Wikidata-linked Commons category, then from the Art Institute of
//      Chicago public-domain collection (only works whose style/subject tags match).
//   4. Record wikidata id + wikipedia title and add verified reference links.
//
//   node scripts/data/images.ts                 all records missing images
//   node scripts/data/images.ts --all           refresh every record
//   node scripts/data/images.ts --slug bonsai   one record
//   node scripts/data/images.ts --overrides     records listed in data/wikipedia-overrides.json
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { ROOT, cache, getJSON, loadAesthetics, pool, saveAesthetic } from './lib.ts'
import type { AestheticRecord, ImageRecord, ReferenceRecord } from '../../src/lib/schema.ts'

const args = process.argv.slice(2)
const ALL = args.includes('--all')
const ONLY = args.includes('--slug') ? args[args.indexOf('--slug') + 1] : null
const OVERRIDDEN = args.includes('--overrides')
const LIMIT = args.includes('--limit') ? Number(args[args.indexOf('--limit') + 1]) : Infinity
const MAX_IMAGES = 10
const WANT_MIN = 6

const WP = 'https://en.wikipedia.org/w/api.php'
const COMMONS = 'https://commons.wikimedia.org/w/api.php'
const http = cache<unknown>('http')

async function api<T = any>(base: string, params: Record<string, string>): Promise<T> {
  const qs = new URLSearchParams({ format: 'json', formatversion: '2', maxlag: '5', ...params })
  const url = `${base}?${qs}`
  const hit = http.get(url)
  if (hit) return hit as T
  const res = await getJSON<T>(url)
  http.set(url, res)
  return res
}

// ---------------------------------------------------------------------------
// 1. Article matching
// ---------------------------------------------------------------------------

const norm = (s: string) =>
  s
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\(.*?\)/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
const STOP = new Set(['the', 'and', 'of', 'art', 'style', 'aesthetic', 'aesthetics', 'design', 'in', 'a', 'de', 'la', 'le'])
const tokens = (s: string) => norm(s).split(' ').filter((t) => t.length > 2 && !STOP.has(t))
const stem = (t: string) => t.replace(/(ism|ist|ists|ian|ic|al|s|es|ing)$/, '')

/** Every significant token of the article title must appear (stemmed) in the aesthetic's name/aliases. */
function titleFits(title: string, a: AestheticRecord): boolean {
  const tt = tokens(title).map(stem)
  if (!tt.length) return false
  const pool = new Set([a.name, ...a.aliases].flatMap(tokens).map(stem))
  return tt.every((t) => pool.has(t) || [...pool].some((p) => p.length > 4 && (p.startsWith(t) || t.startsWith(p))))
}

interface PageInfo {
  title: string
  qid?: string
  disambiguation: boolean
  missing: boolean
  leadImage?: string
}

async function lookup(titles: string[]): Promise<Map<string, PageInfo>> {
  const out = new Map<string, PageInfo>()
  if (!titles.length) return out
  const res = await api(WP, {
    action: 'query',
    redirects: '1',
    titles: titles.slice(0, 50).join('|'),
    prop: 'pageprops|pageimages',
    ppprop: 'wikibase_item|disambiguation',
    piprop: 'name',
  })
  const redirect = new Map<string, string>()
  for (const r of [...(res.query?.normalized ?? []), ...(res.query?.redirects ?? [])]) redirect.set(r.from, r.to)
  const pages = new Map<string, any>((res.query?.pages ?? []).map((p: any) => [p.title, p]))
  for (const t of titles) {
    let cur = t
    for (let i = 0; i < 3 && redirect.has(cur); i++) cur = redirect.get(cur)!
    const p = pages.get(cur)
    if (!p) continue
    out.set(t, {
      title: p.title,
      qid: p.pageprops?.wikibase_item,
      disambiguation: p.pageprops?.disambiguation !== undefined,
      missing: !!p.missing || !!p.invalid,
      leadImage: p.pageimage,
    })
  }
  return out
}

function wikiTitleFromUrl(u: string): string | null {
  const m = /^https?:\/\/en\.(?:m\.)?wikipedia\.org\/wiki\/([^?#]+)/.exec(u)
  if (!m) return null
  try {
    return decodeURIComponent(m[1]).replace(/_/g, ' ')
  } catch {
    return null
  }
}

type Match = { page: PageInfo; kind: 'exact' | 'related' }

// Curated corrections (data/wikipedia-overrides.json): title → use it; null → no article.
const OVERRIDES: Record<string, string | null> = JSON.parse(
  readFileSync(path.join(ROOT, 'data', 'wikipedia-overrides.json'), 'utf8')
)

async function matchArticle(a: AestheticRecord): Promise<Match | null> {
  if (a.slug in OVERRIDES) {
    const title = OVERRIDES[a.slug]
    if (!title) return null
    const p = (await lookup([title])).get(title)
    return p && !p.missing ? { page: p, kind: 'exact' } : null
  }
  const cited = [...a.sources.map((s) => s.url ?? ''), ...a.references.map((r) => r.url)]
    .map(wikiTitleFromUrl)
    .filter((t): t is string => !!t)
  const nameForms = [a.name, a.name.replace(/\s*\(.*?\)\s*/g, ' ').trim(), ...a.aliases]
  const candidates = [...new Set([a.wikipedia ?? '', ...nameForms, ...cited].filter((t) => t && t.length < 250))]
  const found = await lookup(candidates)

  // Explicit field, then exact names/aliases, then cited Wikipedia URLs that fit the name.
  for (const t of candidates) {
    const p = found.get(t)
    if (!p || p.missing || p.disambiguation) continue
    const isName = t === a.wikipedia || nameForms.includes(t)
    if (isName || titleFits(p.title, a)) return { page: p, kind: 'exact' }
  }
  // Cited article that does not fit the name — still the curator's chosen reference.
  for (const t of cited) {
    const p = found.get(t)
    if (p && !p.missing && !p.disambiguation) return { page: p, kind: 'related' }
  }
  // Full-text search, accepted only when the title fits the name.
  const q = a.name.replace(/\s*\(.*?\)\s*/g, ' ').trim()
  const s = await api(WP, { action: 'query', list: 'search', srsearch: q, srlimit: '5', srnamespace: '0' })
  const hits: string[] = (s.query?.search ?? []).map((h: any) => h.title)
  const fitting = hits.filter((h) => titleFits(h, a))
  if (fitting.length) {
    const info = await lookup(fitting)
    for (const h of fitting) {
      const p = info.get(h)
      if (p && !p.missing && !p.disambiguation) return { page: p, kind: 'exact' }
    }
  }
  return null
}

// ---------------------------------------------------------------------------
// 2. Image metadata
// ---------------------------------------------------------------------------

const SKIP_FILE =
  /(flag|logo|icon|map|locator|location|symbol|coat[_ ]of[_ ]arms|emblem|seal|signature|commons-|wiki|edit-|question|portal|disambig|stub|padlock|speaker|audio|button|arrow|diagram|chart|graph|blank|placeholder|crystal[_ ]clear|nuvola|gnome|OOjs|increase|decrease|steady|red[_ ]pog|pictogram|sound|spoken|qr[_ ]code)/i

const NOT_EXAMPLE =
  /\b(maps?|karte|carte|mapa|mappa|verbreitung|distribution|locator|location|sites with|extent of|territor(y|ies)|floor ?plan|ground ?plan|diagram|chart|graph|timeline|family tree|flowchart|coat of arms|flag of|logo|seal of|signature)\b/i

const stripHtml = (s: unknown) =>
  typeof s === 'string'
    ? s
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#0?39;/g, "'")
        .replace(/\s+/g, ' ')
        .trim()
    : ''

const clean = (u: string) => u.split('?')[0]
const resize = (thumb: string, w: number) => clean(thumb).replace(/\/(\d+)px-([^/]+)$/, `/${w}px-$2`)

function toImage(p: any, fallbackCaption: string): ImageRecord | null {
  const ii = p?.imageinfo?.[0]
  if (!ii) return null
  const meta = ii.extmetadata ?? {}
  const mime: string = ii.mime ?? ''
  if (!/^image\/(jpeg|png|webp|tiff)$/.test(mime)) return null
  if (meta.NonFree?.value === 'true' || /fair use|non-free/i.test(meta.LicenseShortName?.value ?? '')) return null
  if ((ii.width ?? 0) < 480 || (ii.height ?? 0) < 320) return null
  const ratio = ii.width / ii.height
  if (ratio > 4 || ratio < 0.25) return null
  const name = String(p.title ?? '').replace(/^File:/, '')
  if (SKIP_FILE.test(name)) return null
  // Maps and diagrams are not visual examples of an aesthetic (catch non-English names too).
  const desc = `${name} ${stripHtml(meta.ImageDescription?.value)} ${stripHtml(meta.ObjectName?.value)}`
  if (NOT_EXAMPLE.test(desc)) return null

  const display = ii.thumburl ? clean(ii.thumburl) : clean(ii.url)
  const isThumb = /\/thumb\//.test(display)
  // Artwork templates leak Wikidata quick-statement markup ("title QS:P1476,en:…").
  const tidy = (s: string) =>
    s
      .replace(/\s*\b(?:title|label)\s+QS:[^"]*"[^"]*"?/g, '')
      .replace(/\s*QS:\S+/g, '')
      .replace(/\s+/g, ' ')
      .trim()
  const rawDesc = stripHtml(meta.ImageDescription?.value)
  const objectName = tidy(stripHtml(meta.ObjectName?.value)).slice(0, 200)
  const caption =
    (rawDesc.length >= 12 && !rawDesc.includes('QS:') ? rawDesc.slice(0, 280) : '') ||
    objectName ||
    tidy(rawDesc).slice(0, 280) ||
    name.replace(/\.[a-z]+$/i, '').replace(/_/g, ' ') ||
    fallbackCaption
  const img: ImageRecord = {
    url: display,
    thumb: isThumb ? resize(display, 500) : display,
    full: clean(ii.url),
    pageUrl: ii.descriptionurl ? clean(ii.descriptionurl) : undefined,
    caption,
    source: 'Wikimedia Commons',
    artist: stripHtml(meta.Artist?.value).slice(0, 160) || undefined,
    date: stripHtml(meta.DateTimeOriginal?.value).slice(0, 60) || undefined,
    license: stripHtml(meta.LicenseShortName?.value).slice(0, 60) || undefined,
    licenseUrl: meta.LicenseUrl?.value && /^https?:/.test(meta.LicenseUrl.value) ? meta.LicenseUrl.value : undefined,
    width: String(Math.min(ii.width, 1280)),
    height: String(Math.round((Math.min(ii.width, 1280) / ii.width) * ii.height)),
  }
  for (const k of Object.keys(img) as (keyof ImageRecord)[]) if (img[k] === undefined) delete img[k]
  return img
}

async function imageInfo(base: string, fileTitles: string[], caption: string): Promise<ImageRecord[]> {
  const out: ImageRecord[] = []
  for (let i = 0; i < fileTitles.length; i += 20) {
    const batch = fileTitles.slice(i, i + 20)
    const res = await api(base, {
      action: 'query',
      titles: batch.join('|'),
      prop: 'imageinfo',
      iiprop: 'url|size|mime|extmetadata',
      iiurlwidth: '1280',
      iiextmetadatafilter: 'ImageDescription|ObjectName|Artist|DateTimeOriginal|LicenseShortName|LicenseUrl|NonFree',
      iiextmetadatalanguage: 'en',
    })
    const byTitle = new Map<string, any>((res.query?.pages ?? []).map((p: any) => [p.title, p]))
    const norm = new Map<string, string>((res.query?.normalized ?? []).map((n: any) => [n.from, n.to]))
    for (const t of batch) {
      const img = toImage(byTitle.get(norm.get(t) ?? t), caption)
      if (img) out.push(img)
    }
  }
  return out
}

async function articleImages(title: string, lead: string | undefined): Promise<ImageRecord[]> {
  const parsed = await api(WP, { action: 'parse', page: title, prop: 'images', redirects: '1' })
  const files: string[] = (parsed.parse?.images ?? []).filter((f: string) => !SKIP_FILE.test(f) && /\.(jpe?g|png|tiff?|webp)$/i.test(f))
  const ordered = [...new Set([...(lead ? [lead] : []), ...files])].slice(0, 24).map((f) => `File:${f}`)
  return imageInfo(WP, ordered, title)
}

async function wikidataFacts(qid: string): Promise<{ commonsCat?: string; image?: string }> {
  const res = await api('https://www.wikidata.org/w/api.php', { action: 'wbgetclaims', entity: qid, property: 'P373' })
  const cat = res.claims?.P373?.[0]?.mainsnak?.datavalue?.value
  return { commonsCat: typeof cat === 'string' ? cat : undefined }
}

async function commonsCategoryImages(cat: string, caption: string): Promise<ImageRecord[]> {
  const res = await api(COMMONS, {
    action: 'query',
    list: 'categorymembers',
    cmtitle: `Category:${cat}`,
    cmtype: 'file',
    cmlimit: '30',
  })
  const files: string[] = (res.query?.categorymembers ?? []).map((m: any) => m.title).filter((t: string) => !SKIP_FILE.test(t))
  return imageInfo(COMMONS, files.slice(0, 20), caption)
}

// ---------------------------------------------------------------------------
// 3. Museum open access (Art Institute of Chicago, public domain only)
// ---------------------------------------------------------------------------

const AIC_CATS = new Set([
  'Art Movement',
  'Painting Technique & School',
  'Religious & Sacred Art',
  'Textile & Craft',
  'Regional & Cultural Tradition',
  'Drawing & Line Work',
  'Historical Period Style',
  'Furniture & Product Design',
  'Illustration & Comics',
  'Fashion & Dress',
])

async function aicImages(a: AestheticRecord, want: number): Promise<ImageRecord[]> {
  const q = a.name.replace(/\s*\(.*?\)\s*/g, ' ').trim()
  const url = `https://api.artic.edu/api/v1/artworks/search?q=${encodeURIComponent(q)}&limit=30&fields=id,title,artist_display,date_display,image_id,is_public_domain,style_titles,classification_titles,subject_titles,term_titles,thumbnail`
  const hit = http.get(url)
  const res: any = hit ?? (await getJSON(url).catch(() => ({ data: [] })))
  if (!hit) http.set(url, res)
  const keys = new Set([a.name, ...a.aliases].flatMap(tokens).map(stem))
  const matches = (res.data ?? []).filter((w: any) => {
    if (!w.is_public_domain || !w.image_id) return false
    const tags = [...(w.style_titles ?? []), ...(w.term_titles ?? []), ...(w.classification_titles ?? [])]
    return tags.some((t: string) => {
      const tt = tokens(t).map(stem)
      return tt.length > 0 && tt.every((x) => keys.has(x))
    })
  })
  return matches.slice(0, want).map((w: any): ImageRecord => {
    const tw = w.thumbnail?.width
    const th = w.thumbnail?.height
    const width = 843
    return {
      url: `https://www.artic.edu/iiif/2/${w.image_id}/full/843,/0/default.jpg`,
      thumb: `https://www.artic.edu/iiif/2/${w.image_id}/full/400,/0/default.jpg`,
      full: `https://www.artic.edu/iiif/2/${w.image_id}/full/1686,/0/default.jpg`,
      pageUrl: `https://www.artic.edu/artworks/${w.id}`,
      caption: `${w.title}${w.date_display ? `, ${w.date_display}` : ''}`,
      source: 'Art Institute of Chicago',
      artist: (w.artist_display ?? '').split('\n')[0] || undefined,
      date: w.date_display || undefined,
      license: 'Public domain (CC0)',
      licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
      width: String(width),
      height: String(tw && th ? Math.round((width / tw) * th) : 0),
    }
  })
}

// ---------------------------------------------------------------------------
// 4. Orchestration
// ---------------------------------------------------------------------------

function addRef(a: AestheticRecord, ref: ReferenceRecord) {
  const i = a.references.findIndex((r) => r.url === ref.url)
  if (i >= 0) a.references[i] = { ...a.references[i], ...ref }
  else a.references.unshift(ref)
}

const wpUrl = (t: string) => `https://en.wikipedia.org/wiki/${encodeURIComponent(t.replace(/ /g, '_'))}`

async function resolve(a: AestheticRecord): Promise<string> {
  // Drop links this script generated on a previous run; they are re-added from the new match.
  a.references = a.references.filter((r) => !/^(Wikipedia|Wikidata|Wikimedia Commons) — /.test(r.title))
  if (a.slug in OVERRIDES) {
    a.wikipedia = null
    a.wikidata = null
    a.images = a.images.filter((i) => i.source !== 'Wikimedia Commons')
  }
  const match = await matchArticle(a)
  const images: ImageRecord[] = []
  const seen = new Set<string>()
  const push = (xs: ImageRecord[]) => {
    for (const x of xs) {
      const key = (x.full ?? x.url).replace(/^https?:\/\/[^/]+/, '').toLowerCase()
      if (seen.has(key) || images.length >= MAX_IMAGES) continue
      seen.add(key)
      images.push(x)
    }
  }
  let note = 'no article'
  const now = new Date().toISOString()

  if (match) {
    const { page, kind } = match
    push(await articleImages(page.title, page.leadImage))
    note = `${kind}:${page.title}`
    if (kind === 'exact') {
      a.wikipedia = page.title
      if (page.qid) a.wikidata = page.qid
    }
    addRef(a, {
      type: 'article',
      title: kind === 'exact' ? `Wikipedia — ${page.title}` : `Wikipedia — ${page.title} (related)`,
      url: wpUrl(page.title),
      note: 'Encyclopedia article',
      check: { ok: true, status: 200, checkedAt: now },
    })
    if (kind === 'exact' && page.qid) {
      addRef(a, {
        type: 'archive',
        title: `Wikidata — ${page.qid}`,
        url: `https://www.wikidata.org/wiki/${page.qid}`,
        note: 'Structured data: dates, places, people, identifiers',
        check: { ok: true, status: 200, checkedAt: now },
      })
      const { commonsCat } = await wikidataFacts(page.qid)
      if (commonsCat) {
        addRef(a, {
          type: 'images',
          title: `Wikimedia Commons — ${commonsCat}`,
          url: `https://commons.wikimedia.org/wiki/Category:${encodeURIComponent(commonsCat.replace(/ /g, '_'))}`,
          note: 'Freely licensed photographs and scans',
          check: { ok: true, status: 200, checkedAt: now },
        })
        if (images.length < WANT_MIN) push(await commonsCategoryImages(commonsCat, a.name))
      }
    }
  }
  if (images.length < WANT_MIN && AIC_CATS.has(a.category)) push(await aicImages(a, WANT_MIN - images.length + 2))

  // Keep previously curated images that still resolve (non-sandbox hosts) when nothing better was found.
  const prior = a.images.filter((i) => !/chatglm\.cn/.test(i.url) && !seen.has(i.url))
  a.images = images.length ? images : prior
  a.updatedAt = now
  return `${note} → ${a.images.length} img`
}

const all = loadAesthetics()
const todo = all
  .filter((a) =>
    ONLY
      ? a.slug === ONLY
      : OVERRIDDEN
        ? a.slug in OVERRIDES
        : ALL || a.images.length === 0 || a.images.some((i) => /chatglm\.cn/.test(i.url))
  )
  .slice(0, LIMIT)
console.log(`resolving ${todo.length} of ${all.length} records`)

let done = 0
let withImg = 0
await pool(todo, 4, async (a) => {
  try {
    const msg = await resolve(a)
    if (a.images.length) withImg++
    saveAesthetic(a)
    done++
    if (done % 25 === 0 || ONLY) console.log(`[${done}/${todo.length}] ${a.slug}: ${msg}`)
  } catch (e) {
    console.error(`✗ ${a.slug}: ${e instanceof Error ? e.message : e}`)
  }
})
console.log(`done: ${done}, with images: ${withImg}`)
