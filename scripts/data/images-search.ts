// Find freely licensed images for records that still have none, by searching
// Wikimedia Commons (and Openverse as a capped fallback) for the aesthetic's name.
// Strict relevance rule: the record's name or one of its aliases must appear as a phrase in
// the file's title or description. Maps, diagrams, logos and non-free files are excluded.
//
//   node scripts/data/images-search.ts [--openverse N]   (N = max Openverse requests, default 180)
import { readFileSync } from 'node:fs'
import type { AestheticRecord, ImageRecord } from '../../src/lib/schema.ts'
import { cache, getJSON, loadAesthetics, pool, saveAesthetic, sleep } from './lib.ts'

const args = process.argv.slice(2)
const OPENVERSE_BUDGET = args.includes('--openverse') ? Number(args[args.indexOf('--openverse') + 1]) : 180
const http = cache<unknown>('images-search')

const NOT_EXAMPLE =
  /\b(maps?|karte|carte|mapa|mappa|verbreitung|distribution|locator|location map|diagram|chart|graph|logo|flag of|coat of arms|seal of|signature|screenshot|icon)\b/i

// AI-generated pictures are never examples of a documented aesthetic.
const AI_MADE = /\bprompt:|\b(ai[- ]generated|generated (with|by) ai|stable diffusion|midjourney|dall[- ]e|text-to-image|made with ai|synthography)\b/i
// Records whose search results were reviewed by hand and found not to depict the aesthetic
// (homonyms, unrelated buildings, archive scans). They keep waiting for a real match.
const REVIEWED_NO_MATCH = new Set(["after-hours","american-pioneers","british-countryside","casuals","dark-triad","flamenco","gangsta-rap","japonisme","motomami","new-money","old-hollywood","pirate","rajput-palaces","sedefkari","space-western","tomesode","vampire","vulture-culture","weimar-cabaret","yugo-nostalgia","mission-school","clean-girl","buffalo-style","horror","buchon","choni","black-ivy","coastal-style","acubi","chav"])

const norm = (s: string) =>
  s
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\(.*?\)/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
const strip = (s: unknown) => (typeof s === 'string' ? s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : '')

function phrases(a: AestheticRecord): string[] {
  return [...new Set([a.name, ...a.aliases].map(norm).filter((p) => p.length >= 4 && p.split(' ').length <= 6))]
}
// Words that describe the record (motifs, tags, category, summary) — an image must share one,
// beyond the name itself, so homonyms (an aircraft called "Buchón") are rejected.
const STOPWORDS = new Set('about above after again also although among another around because before being below between both could during each either every first found from further have having here into itself known like made many more most much other over same should since some such than that their them then there these they this those through under until upon very were what when where which while with within would your style styles aesthetic aesthetics often used known typically include includes including especially various called term'.split(' '))
const stem = (w: string) => w.replace(/(es|s)$/, '')
const rawContext = (a: AestheticRecord) => {
  const nameTokens = new Set(phrases(a).flatMap((p) => p.split(' ')))
  // Place names are excluded: "Spanish" in a caption does not make an aircraft a Spanish subculture.
  const text = [a.subcategory, ...a.tags, ...a.objects, ...a.materials, ...a.keyExamples, a.summary, a.description.slice(0, 600)].join(' ')
  const places = new Set(norm(`${a.origin} ${a.geography}`).split(' '))
  return new Set(norm(text).split(' ').filter((w) => w.length >= 5 && !STOPWORDS.has(w) && !nameTokens.has(w) && !places.has(w)).map(stem))
}
// Words used by more than 1.5% of records ("power", "internet", "technology") are too generic to
// confirm that an image depicts this particular aesthetic.
const ALL = loadAesthetics()
const DF = new Map<string, number>()
for (const a of ALL) for (const w of rawContext(a)) DF.set(w, (DF.get(w) ?? 0) + 1)
const GENERIC = ALL.length * 0.015
function contextWords(a: AestheticRecord): Set<string> {
  return new Set([...rawContext(a)].filter((w) => (DF.get(w) ?? 0) <= GENERIC))
}
// Two distinct descriptive words must match: one shared word is too often a coincidence
// ("Easter" + "mountain" landscape, "Buffalo" + restaurant portrait).
const sharesContext = (text: string, ctx: Set<string>) => new Set(norm(text).split(' ').filter((w) => w.length >= 5 && ctx.has(stem(w))).map(stem)).size >= 2
const mentions = (text: string, ps: string[]) => {
  const t = ` ${norm(text)} `
  return ps.some((p) => t.includes(` ${p} `) || t.includes(` ${p}s `))
}

async function commons(a: AestheticRecord): Promise<ImageRecord[]> {
  const ps = phrases(a)
  if (!ps.length) return []
  const url = `https://commons.wikimedia.org/w/api.php?${new URLSearchParams({
    action: 'query',
    format: 'json',
    formatversion: '2',
    generator: 'search',
    gsrnamespace: '6',
    gsrsearch: `"${a.name.replace(/\s*\(.*?\)\s*/g, ' ').trim()}" filetype:bitmap`,
    gsrlimit: '20',
    prop: 'imageinfo',
    iiprop: 'url|size|mime|extmetadata',
    iiurlwidth: '1280',
    iiextmetadatafilter: 'ImageDescription|ObjectName|Artist|DateTimeOriginal|LicenseShortName|LicenseUrl|NonFree',
    iiextmetadatalanguage: 'en',
  })}`
  let res: any = http.get(url)
  if (!res) {
    res = await getJSON(url)
    http.set(url, res)
  }
  const out: ImageRecord[] = []
  for (const p of (res.query?.pages ?? []).sort((x: any, y: any) => (x.index ?? 0) - (y.index ?? 0))) {
    const ii = p.imageinfo?.[0]
    const m = ii?.extmetadata ?? {}
    if (!ii || !/^image\/(jpeg|png|webp)$/.test(ii.mime ?? '')) continue
    if (m.NonFree?.value === 'true' || /fair use|non-free/i.test(m.LicenseShortName?.value ?? '')) continue
    if ((ii.width ?? 0) < 480 || (ii.height ?? 0) < 320) continue
    const title = String(p.title).replace(/^File:/, '').replace(/\.[a-z]+$/i, '').replace(/_/g, ' ')
    const desc = strip(m.ImageDescription?.value)
    const text = `${title} ${desc} ${strip(m.ObjectName?.value)}`
    if (NOT_EXAMPLE.test(text) || AI_MADE.test(text) || !mentions(text, ps) || !sharesContext(text, contextWords(a))) continue
    const display = String(ii.thumburl ?? ii.url).split('?')[0]
    const img: ImageRecord = {
      url: display,
      thumb: /\/thumb\//.test(display) ? display.replace(/\/(\d+)px-([^/]+)$/, '/500px-$2') : display,
      full: String(ii.url).split('?')[0],
      pageUrl: String(ii.descriptionurl).split('?')[0],
      caption: (desc && !desc.includes('QS:') ? desc : title).slice(0, 280),
      source: 'Wikimedia Commons',
      artist: strip(m.Artist?.value).slice(0, 160) || undefined,
      date: strip(m.DateTimeOriginal?.value).slice(0, 60) || undefined,
      license: strip(m.LicenseShortName?.value).slice(0, 60) || undefined,
      licenseUrl: /^https?:/.test(m.LicenseUrl?.value ?? '') ? m.LicenseUrl.value : undefined,
      width: String(Math.min(ii.width, 1280)),
      height: String(Math.round((Math.min(ii.width, 1280) / ii.width) * ii.height)),
    }
    for (const k of Object.keys(img) as (keyof ImageRecord)[]) if (img[k] === undefined) delete img[k]
    out.push(img)
    if (out.length >= 6) break
  }
  return out
}

let openverseUsed = 0
async function openverse(a: AestheticRecord): Promise<ImageRecord[]> {
  if (openverseUsed >= OPENVERSE_BUDGET) return []
  const ps = phrases(a)
  if (!ps.length) return []
  const url = `https://api.openverse.org/v1/images/?${new URLSearchParams({
    q: `"${a.name.replace(/\s*\(.*?\)\s*/g, ' ').trim()}"`,
    license: 'by,by-sa,cc0,pdm',
    mature: 'false',
    page_size: '20',
  })}`
  let res: any = http.get(url)
  if (!res) {
    openverseUsed++
    await sleep(3200) // anonymous limit: 20/min
    try {
      res = await getJSON(url, 1)
    } catch {
      return []
    }
    http.set(url, res)
  }
  const out: ImageRecord[] = []
  for (const r of res.results ?? []) {
    if (r.source === 'wikimedia') continue // already covered by the Commons search
    const text = `${r.title ?? ''} ${(r.tags ?? []).map((t: any) => t.name).join(' ')}`
    if (NOT_EXAMPLE.test(text) || AI_MADE.test(`${text} ${r.description ?? ''}`) || !mentions(text, ps) || !sharesContext(`${text} ${r.description ?? ''}`, contextWords(a))) continue
    if ((r.width ?? 0) && r.width < 480) continue
    out.push({
      url: r.url,
      thumb: r.thumbnail ?? r.url,
      pageUrl: r.foreign_landing_url,
      caption: String(r.title ?? a.name).slice(0, 280),
      source: `Openverse · ${r.source}`,
      artist: r.creator ? String(r.creator).slice(0, 160) : undefined,
      license: `CC ${String(r.license).toUpperCase()}${r.license_version ? ` ${r.license_version}` : ''}`.replace('CC PDM', 'Public domain').replace('CC CC0', 'CC0'),
      licenseUrl: r.license_url,
      width: String(r.width ?? 0),
      height: String(r.height ?? 0),
    } as ImageRecord)
    for (const k of Object.keys(out[out.length - 1]) as (keyof ImageRecord)[]) if (out[out.length - 1][k] === undefined) delete out[out.length - 1][k]
    if (out.length >= 4) break
  }
  return out
}

// Records with no images, plus records whose images came from an earlier search pass
// (no Wikipedia match, not museum-sourced) so they are re-checked under the current rules.
// Records illustrated only by the Art Institute of Chicago (served through the site's relay, see
// src/lib/image-url.ts) are searched too; anything found goes first and the AIC images are kept after it.
// Hand-curated image sets (data/curated-images.json) are never re-searched.
const aicOnly = (a: AestheticRecord) => a.images.length > 0 && a.images.every((i) => /artic\.edu\//.test(i.url))
const CURATED = new Set<string>(JSON.parse(readFileSync(new URL('../../data/curated-images.json', import.meta.url), 'utf8')).slugs)
const todo = ALL.filter(
  (a) =>
    !CURATED.has(a.slug) &&
    (a.images.length === 0 || aicOnly(a) || (!a.wikipedia && a.images.every((i) => i.source === 'Wikimedia Commons' || i.source.startsWith('Openverse'))))
)
console.log(`${todo.length} records without images`)
let found = 0
let done = 0
await pool(todo, 3, async (a) => {
  try {
    let imgs = REVIEWED_NO_MATCH.has(a.slug) ? [] : await commons(a)
    if (!imgs.length && !REVIEWED_NO_MATCH.has(a.slug)) imgs = await openverse(a)
    if (aicOnly(a)) {
      if (imgs.length) {
        a.images = [...imgs, ...a.images]
        a.updatedAt = new Date().toISOString()
        saveAesthetic(a)
        found++
      }
    } else if (imgs.length || a.images.length) {
      a.images = imgs
      a.updatedAt = new Date().toISOString()
      saveAesthetic(a)
      found++
    }
  } catch (e) {
    console.error(`✗ ${a.slug}: ${String(e).slice(0, 90)}`)
  }
  if (++done % 100 === 0) console.log(`  ${done}/${todo.length} · ${found} illustrated · openverse ${openverseUsed}`)
})
console.log(`✓ ${found}/${todo.length} records illustrated (openverse requests: ${openverseUsed})`)
