// Images from museum open-access collections for records that still have none.
// Sources (both CC0, no API key): The Metropolitan Museum of Art Open Access and the
// Cleveland Museum of Art Open Access. An object is used only if it is public domain / CC0
// and the aesthetic's name (or an alias) appears in its title, culture, period, style,
// classification, object type or subject tags — a mention in free-text description is not
// enough. Image dimensions are read from the file itself.
//
//   node scripts/data/images-museums.ts
import type { AestheticRecord, ImageRecord } from '../../src/lib/schema.ts'
import { createRequire } from 'node:module'
import { cache, getJSON, loadAesthetics, pool, saveAesthetic, sleep } from './lib.ts'

const sharp = createRequire(import.meta.url)('sharp')
const http = cache<unknown>('museums')
const UA = { 'User-Agent': 'Aestheticpedia/1.0 (https://github.com/Sidmaz666/aestheticpedia; open aesthetics encyclopedia) node' }

async function cached<T>(url: string): Promise<T | null> {
  const hit = http.get(url)
  if (hit !== undefined) return hit as T
  try {
    const res = await getJSON<T>(url, 2, { headers: UA })
    http.set(url, res)
    return res
  } catch {
    http.set(url, null)
    return null
  }
}

const norm = (s: unknown) =>
  String(s ?? '')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
const phrases = (a: AestheticRecord) => [...new Set([a.name, ...a.aliases].map(norm).filter((p) => p.length >= 5))]
const hasPhrase = (text: string, ps: string[]) => {
  const t = ` ${norm(text)} `
  return ps.some((p) => t.includes(` ${p} `))
}

async function dims(url: string): Promise<{ w: number; h: number } | null> {
  const key = `dims:${url}`
  const hit = http.get(key) as { w: number; h: number } | null | undefined
  if (hit !== undefined) return hit
  try {
    const buf = Buffer.from(await (await fetch(url, { headers: UA, signal: AbortSignal.timeout(30_000) })).arrayBuffer())
    const m = await sharp(buf).metadata()
    const d = m.width && m.height ? { w: m.width, h: m.height } : null
    http.set(key, d)
    return d
  } catch {
    http.set(key, null)
    return null
  }
}

async function met(a: AestheticRecord): Promise<ImageRecord[]> {
  const ps = phrases(a)
  if (!ps.length) return []
  const s = await cached<{ objectIDs: number[] | null }>(
    `https://collectionapi.metmuseum.org/public/collection/v1/search?hasImages=true&q=${encodeURIComponent(`"${a.name}"`)}`
  )
  const out: ImageRecord[] = []
  for (const id of (s?.objectIDs ?? []).slice(0, 25)) {
    const o = await cached<any>(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`)
    if (!o?.isPublicDomain || !o.primaryImageSmall) continue
    const fields = [o.title, o.culture, o.period, o.dynasty, o.classification, o.objectName, ...(o.tags ?? []).map((t: any) => t.term)].join(' | ')
    if (!hasPhrase(fields, ps)) continue
    const d = await dims(o.primaryImageSmall)
    if (!d) continue
    out.push({
      url: o.primaryImageSmall,
      thumb: o.primaryImageSmall,
      full: o.primaryImage || undefined,
      pageUrl: o.objectURL,
      caption: [o.title, o.culture || o.period, o.objectDate].filter(Boolean).join(', ').slice(0, 280),
      source: 'The Metropolitan Museum of Art',
      artist: o.artistDisplayName || undefined,
      date: o.objectDate || undefined,
      license: 'CC0 (Met Open Access)',
      licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
      width: String(d.w),
      height: String(d.h),
    } as ImageRecord)
    if (out.length >= 6) break
  }
  return out
}

async function cleveland(a: AestheticRecord): Promise<ImageRecord[]> {
  const ps = phrases(a)
  if (!ps.length) return []
  const r = await cached<{ data: any[] }>(
    `https://openaccess-api.clevelandart.org/api/artworks/?q=${encodeURIComponent(a.name)}&has_image=1&cc0=1&limit=25`
  )
  const out: ImageRecord[] = []
  for (const o of r?.data ?? []) {
    const img = o.images?.web
    if (o.share_license_status !== 'CC0' || !img?.url) continue
    const fields = [o.title, ...(o.culture ?? []), o.technique, o.type, o.department, o.collection].join(' | ')
    if (!hasPhrase(fields, ps)) continue
    out.push({
      url: img.url,
      thumb: img.url,
      full: o.images?.print?.url || undefined,
      pageUrl: o.url,
      caption: [o.title, (o.culture ?? [])[0], o.creation_date].filter(Boolean).join(', ').slice(0, 280),
      source: 'Cleveland Museum of Art',
      artist: o.creators?.[0]?.description || undefined,
      date: o.creation_date || undefined,
      license: 'CC0 (CMA Open Access)',
      licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
      width: String(img.width ?? 0),
      height: String(img.height ?? 0),
    } as ImageRecord)
    if (out.length >= 6) break
  }
  return out
}

// Records with no images, and records whose only images come from the Art Institute of Chicago
// (whose matches were often loose; museum objects are matched more strictly here).
const aicOnly = (a: { images: { url: string }[] }) => a.images.length > 0 && a.images.every((i) => /artic\.edu\//.test(i.url))
const todo = loadAesthetics().filter((a) => a.images.length === 0 || aicOnly(a))
console.log(`${todo.length} records without images`)
let found = 0
let done = 0
await pool(todo, 3, async (a) => {
  try {
    let imgs = await met(a)
    if (imgs.length < 3) imgs = [...imgs, ...(await cleveland(a))].slice(0, 6)
    if (imgs.length) {
      for (const i of imgs) for (const k of Object.keys(i) as (keyof ImageRecord)[]) if (i[k] === undefined) delete i[k]
      a.images = imgs
      a.updatedAt = new Date().toISOString()
      saveAesthetic(a)
      found++
    }
  } catch (e) {
    console.error(`✗ ${a.slug}: ${String(e).slice(0, 90)}`)
  }
  await sleep(50)
  if (++done % 100 === 0) console.log(`  ${done}/${todo.length} · ${found} illustrated`)
})
console.log(`✓ ${found}/${todo.length} records illustrated from museum collections`)
