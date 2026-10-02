// Collect freely licensed audio for each record from its Wikipedia article's embedded media
// (Wikimedia Commons sound files: music samples, instruments, performances, field recordings).
// Only files with a free license are kept, with artist, license and file page.
//
//   node scripts/data/audio.ts
import type { AestheticRecord } from '../../src/lib/schema.ts'
import { cache, getJSON, loadAesthetics, pool, saveAesthetic } from './lib.ts'

const http = cache<unknown>('http')
async function wp<T = any>(params: Record<string, string>): Promise<T> {
  // Same URL shape as images.ts so its cached article parses are reused.
  const qs = new URLSearchParams({ format: 'json', formatversion: '2', maxlag: '5', ...params })
  const url = `https://en.wikipedia.org/w/api.php?${qs}`
  const hit = http.get(url)
  if (hit) return hit as T
  const res = await getJSON<T>(url)
  http.set(url, res)
  return res
}

const AUDIO = /\.(ogg|oga|opus|mp3|flac|wav)$/i
// Spoken-word and pronunciation clips are not the record's sound. Lingua Libre recordings are
// named "LL-Q1860 (eng)-<word>" — the existing patterns missed them, and a Roblox voice clip ended
// up on a meme record.
const SKIP = /(pronunciation|pronounce|^En-|^Ipa|spoken|wikipedia|voice[_ ]of|-pron|^LL-Q\d|lingualibre|lingua libre)/i
const strip = (s: unknown) => (typeof s === 'string' ? s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : '')

/** Read a Commons file's licence metadata, keeping only freely-licensed audio. */
async function freeAudio(titles: string[], cap = 4): Promise<any[]> {
  if (!titles.length) return []
  const res = await wp<any>({
    action: 'query',
    titles: titles.map((f) => `File:${f}`).join('|'),
    prop: 'imageinfo',
    iiprop: 'url|mime|mediatype|extmetadata|size',
    iiextmetadatafilter: 'ObjectName|ImageDescription|Artist|LicenseShortName|LicenseUrl|NonFree',
    iiextmetadatalanguage: 'en',
  })
  const out: any[] = []
  for (const p of res.query?.pages ?? []) {
    const ii = p.imageinfo?.[0]
    const m = ii?.extmetadata ?? {}
    if (!ii || !/^(audio|application\/ogg)/.test(ii.mime ?? '')) continue
    if (m.NonFree?.value === 'true' || /fair use|non-free/i.test(m.LicenseShortName?.value ?? '')) continue
    const title = strip(m.ObjectName?.value) || strip(m.ImageDescription?.value).slice(0, 140) || String(p.title).replace(/^File:/, '').replace(/\.[a-z0-9]+$/i, '').replace(/_/g, ' ')
    const item: Record<string, unknown> = {
      url: String(ii.url),
      title: title.slice(0, 160),
      pageUrl: String(ii.descriptionurl).split('?')[0],
      source: 'Wikimedia Commons',
      mime: String(ii.mime),
    }
    if (typeof ii.duration === 'number') item.duration = Math.round(ii.duration)
    const artist = strip(m.Artist?.value).slice(0, 120)
    if (artist) item.artist = artist
    const license = strip(m.LicenseShortName?.value)
    if (license) item.license = license
    if (/^https?:/.test(m.LicenseUrl?.value ?? '')) item.licenseUrl = m.LicenseUrl.value
    out.push(item)
  }
  return out.slice(0, cap)
}

/** Commons search for recordings of the subject itself — the article often embeds none. */
async function commonsSearch(term: string): Promise<string[]> {
  const res = await wp<any>({
    action: 'query',
    generator: 'search',
    gsrsearch: `filetype:audio ${term}`,
    gsrnamespace: '6',
    gsrlimit: '6',
    prop: 'imageinfo',
    iiprop: 'mime',
  })
  return (res.query?.pages ?? [])
    .map((p: any) => String(p.title).replace(/^File:/, ''))
    .filter((f: string) => AUDIO.test(f) && !SKIP.test(f))
}

async function audioFor(a: AestheticRecord) {
  // Article-embedded recordings first…
  if (a.wikipedia) {
    const parsed = await wp<any>({ action: 'parse', page: a.wikipedia, prop: 'images', redirects: '1' })
    const files: string[] = (parsed.parse?.images ?? []).filter((f: string) => AUDIO.test(f) && !SKIP.test(f)).slice(0, 8)
    const embedded = await freeAudio(files)
    if (embedded.length) return embedded
  }
  // …then Commons itself, keyed on the record's own name. This also covers records with no
  // Wikipedia article (gamelan, fado, highlife), where the early return used to skip them entirely.
  return freeAudio(await commonsSearch(a.name), 3)
}

const all = loadAesthetics()
let withAudio = 0
let done = 0
await pool(
  all.filter((a) => !Array.isArray(a.audio) || !a.audio.length),
  4,
  async (a) => {
    try {
      const audio = await audioFor(a)
      const before = JSON.stringify(a.audio ?? [])
      if (audio.length) {
        ;(a as AestheticRecord & { audio: unknown }).audio = audio
        withAudio++
      } else delete (a as { audio?: unknown }).audio
      if (JSON.stringify(a.audio ?? []) !== before) saveAesthetic(a)
    } catch (e) {
      console.error(`✗ ${a.slug}: ${String(e).slice(0, 100)}`)
    }
    if (++done % 200 === 0) console.log(`  ${done}`)
  }
)
console.log(`✓ ${withAudio} records with audio`)
