// Build a glossary of real photographs for the materials and textures named in records.
// Each distinct term is matched to an English Wikipedia article (exact title/redirect, then
// its head noun, e.g. "gilded bronze" → "Bronze"); the article's lead image is kept only if it
// is freely licensed. The card is labelled with the article actually matched, so nothing is
// passed off as something it isn't. Output: data/materials.json (copied to public/data by build).
//
//   node scripts/data/materials.ts
import { writeFileSync } from 'node:fs'
import path from 'node:path'
import { ROOT, cache, getJSON, loadAesthetics, sleep } from './lib.ts'

export interface MaterialEntry {
  title: string
  url: string
  image: { thumb: string; pageUrl: string; license: string; artist?: string } | null
  extract: string
}

const http = cache<unknown>('materials')
async function wp<T = any>(params: Record<string, string>): Promise<T> {
  const qs = new URLSearchParams({ format: 'json', formatversion: '2', ...params })
  const url = `https://en.wikipedia.org/w/api.php?${qs}`
  const hit = http.get(url)
  if (hit) return hit as T
  const res = await getJSON<T>(url)
  http.set(url, res)
  return res
}

const norm = (s: string) => s.toLowerCase().replace(/\s+/g, ' ').trim()
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
const MODIFIERS = /^(hand-?\w*|polished|brushed|hammered|raw|rough|smooth|aged|weathered|matte|glossy|glazed|gilded|painted|carved|woven|natural|dark|light|pale|deep|fine|thick|thin|heavy|soft|hard|dyed|printed|lacquered|patinated|distressed|reclaimed|vintage|antique|faux|burnished|oiled|waxed|bleached|stained|unglazed|handmade|handwoven|hand|block|bare|exposed|textured|frosted|tinted|colored|coloured)\s+/

function candidates(term: string): string[] {
  const t = norm(term).replace(/[()]/g, '')
  const words = t.split(' ')
  let stripped = t
  while (MODIFIERS.test(stripped)) stripped = stripped.replace(MODIFIERS, '')
  const out = [t, stripped, words.slice(-2).join(' '), words[words.length - 1]]
  return [...new Set(out.filter((x) => x.length > 2))].map(cap)
}

const terms = new Map<string, number>()
for (const a of loadAesthetics()) for (const t of [...a.materials, ...a.textures]) if (t.length < 60) terms.set(norm(t), (terms.get(norm(t)) ?? 0) + 1)
console.log(`${terms.size} distinct material/texture terms`)

// Resolve all candidate titles in batches of 50.
const allCands = [...new Set([...terms.keys()].flatMap(candidates))]
const resolved = new Map<string, { title: string; image?: string; extract: string } | null>()
for (let i = 0; i < allCands.length; i += 50) {
  const batch = allCands.slice(i, i + 50)
  const res = await wp<any>({
    action: 'query',
    redirects: '1',
    titles: batch.join('|'),
    prop: 'pageprops|pageimages|extracts',
    ppprop: 'disambiguation',
    piprop: 'name',
    exintro: '1',
    explaintext: '1',
    exsentences: '1',
    exlimit: '50',
  })
  const alias = new Map<string, string>()
  for (const r of [...(res.query?.normalized ?? []), ...(res.query?.redirects ?? [])]) alias.set(r.from, r.to)
  const pages = new Map<string, any>((res.query?.pages ?? []).map((p: any) => [p.title, p]))
  for (const t of batch) {
    let cur = t
    for (let k = 0; k < 3 && alias.has(cur); k++) cur = alias.get(cur)!
    const p = pages.get(cur)
    resolved.set(t, p && !p.missing && p.pageprops?.disambiguation === undefined ? { title: p.title, image: p.pageimage, extract: String(p.extract ?? '') } : null)
  }
  if (i % 1000 === 0) console.log(`  titles ${i}/${allCands.length}`)
  await sleep(100)
}

// Licence-check lead images, 25 files per request.
const files = [...new Set([...resolved.values()].map((r) => r?.image).filter(Boolean) as string[])]
const imageInfo = new Map<string, MaterialEntry['image']>()
for (let i = 0; i < files.length; i += 25) {
  const res = await wp<any>({
    action: 'query',
    titles: files.slice(i, i + 25).map((f) => `File:${f}`).join('|'),
    prop: 'imageinfo',
    iiprop: 'url|mime|extmetadata',
    iiurlwidth: '330',
    iiextmetadatafilter: 'LicenseShortName|Artist|NonFree',
  })
  const norms = new Map<string, string>((res.query?.normalized ?? []).map((n: any) => [n.to, n.from]))
  for (const p of res.query?.pages ?? []) {
    const ii = p.imageinfo?.[0]
    const meta = ii?.extmetadata ?? {}
    const name = (norms.get(p.title) ?? p.title).replace(/^File:/, '')
    const nonFree = meta.NonFree?.value === 'true' || /fair use|non-free/i.test(meta.LicenseShortName?.value ?? '')
    if (!ii || nonFree || !/^image\/(jpeg|png|webp)$/.test(ii.mime ?? '')) {
      imageInfo.set(name, null)
      continue
    }
    imageInfo.set(name, {
      thumb: String(ii.thumburl ?? ii.url).split('?')[0],
      pageUrl: String(ii.descriptionurl).split('?')[0],
      license: String(meta.LicenseShortName?.value ?? '').replace(/<[^>]+>/g, '').trim(),
      artist: String(meta.Artist?.value ?? '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 120) || undefined,
    })
  }
  await sleep(100)
}

const glossary: Record<string, MaterialEntry> = {}
for (const term of terms.keys()) {
  for (const c of candidates(term)) {
    const r = resolved.get(c)
    if (!r) continue
    const image = r.image ? (imageInfo.get(r.image.replace(/_/g, ' ')) ?? imageInfo.get(r.image) ?? null) : null
    glossary[term] = {
      title: r.title,
      url: `https://en.wikipedia.org/wiki/${encodeURIComponent(r.title.replace(/ /g, '_'))}`,
      image,
      extract: r.extract.slice(0, 240),
    }
    break
  }
}
const withImg = Object.values(glossary).filter((g) => g.image).length
writeFileSync(path.join(ROOT, 'data', 'materials.json'), JSON.stringify(glossary, null, 1) + '\n')
console.log(`✓ ${Object.keys(glossary).length}/${terms.size} terms matched, ${withImg} with free images → data/materials.json`)
