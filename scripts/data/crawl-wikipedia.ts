// Crawl English Wikipedia category trees for candidate aesthetics, resolve each page's
// Wikidata item and its "instance of" (P31) classes. Output: data/.cache/crawl.json.
// The import step keeps only pages whose P31 is on a reviewed allow-list (see
// data/crawl-classes.json), which screens out people, individual buildings and artworks,
// organisations, films, events and so on.
//
//   node scripts/data/crawl-wikipedia.ts            crawl + write candidates
//   node scripts/data/crawl-wikipedia.ts --classes  print P31 class frequencies for review
import { writeFileSync, readFileSync, existsSync } from 'node:fs'
import path from 'node:path'
import { CACHE_DIR, cache, getJSON, sleep } from './lib.ts'
import type { AestheticRecord } from '../../src/lib/schema.ts'

type Cat = AestheticRecord['category']
type Est = AestheticRecord['establishment']
export const ROOTS: { title: string; depth: number; category: Cat; establishment: Est }[] = [
  { title: 'Architectural styles', depth: 3, category: 'Architectural Style', establishment: 'historical' },
  { title: 'Vernacular architecture', depth: 2, category: 'Architectural Style', establishment: 'regional_tradition' },
  { title: 'Types of garden', depth: 1, category: 'Architectural Style', establishment: 'historical' },
  { title: 'Art movements', depth: 3, category: 'Art Movement', establishment: 'historical' },
  { title: 'Visual arts genres', depth: 2, category: 'Painting Technique & School', establishment: 'historical' },
  { title: 'Painting techniques', depth: 2, category: 'Painting Technique & School', establishment: 'historical' },
  { title: 'Schools of painting', depth: 2, category: 'Painting Technique & School', establishment: 'historical' },
  { title: 'Printmaking', depth: 2, category: 'Drawing & Line Work', establishment: 'historical' },
  { title: 'Calligraphy', depth: 2, category: 'Drawing & Line Work', establishment: 'regional_tradition' },
  { title: 'Textile arts', depth: 3, category: 'Textile & Craft', establishment: 'regional_tradition' },
  { title: 'Embroidery', depth: 2, category: 'Textile & Craft', establishment: 'regional_tradition' },
  { title: 'Weaving', depth: 2, category: 'Textile & Craft', establishment: 'regional_tradition' },
  { title: 'Rugs and carpets', depth: 2, category: 'Textile & Craft', establishment: 'regional_tradition' },
  { title: 'Pottery', depth: 3, category: 'Textile & Craft', establishment: 'regional_tradition' },
  { title: 'Decorative arts', depth: 2, category: 'Textile & Craft', establishment: 'historical' },
  { title: 'Woodworking', depth: 2, category: 'Textile & Craft', establishment: 'regional_tradition' },
  { title: 'Metalworking', depth: 2, category: 'Textile & Craft', establishment: 'regional_tradition' },
  { title: 'Glass art', depth: 2, category: 'Textile & Craft', establishment: 'historical' },
  { title: 'Lacquerware', depth: 2, category: 'Textile & Craft', establishment: 'regional_tradition' },
  { title: 'Jewellery', depth: 2, category: 'Fashion & Dress', establishment: 'regional_tradition' },
  { title: 'Folk art', depth: 3, category: 'Regional & Cultural Tradition', establishment: 'regional_tradition' },
  { title: 'Folk costumes', depth: 3, category: 'Fashion & Dress', establishment: 'regional_tradition' },
  { title: 'Traditional clothing', depth: 3, category: 'Fashion & Dress', establishment: 'regional_tradition' },
  { title: 'Fashion aesthetics', depth: 2, category: 'Fashion & Dress', establishment: 'community_subculture' },
  { title: 'History of fashion', depth: 2, category: 'Fashion & Dress', establishment: 'historical' },
  { title: 'Subcultures', depth: 2, category: 'Subculture Style', establishment: 'community_subculture' },
  { title: 'Internet aesthetics', depth: 1, category: 'Internet Aesthetic', establishment: 'internet_aesthetic' },
  { title: 'Tattooing', depth: 2, category: 'Regional & Cultural Tradition', establishment: 'regional_tradition' },
  { title: 'Masks', depth: 2, category: 'Regional & Cultural Tradition', establishment: 'regional_tradition' },
  { title: 'Body art', depth: 2, category: 'Regional & Cultural Tradition', establishment: 'regional_tradition' },
  { title: 'Ornaments (architecture)', depth: 2, category: 'Material & Surface', establishment: 'historical' },
  { title: 'Visual motifs', depth: 2, category: 'Material & Surface', establishment: 'historical' },
  { title: 'Religious art', depth: 3, category: 'Religious & Sacred Art', establishment: 'regional_tradition' },
  { title: 'Islamic art', depth: 2, category: 'Religious & Sacred Art', establishment: 'regional_tradition' },
  { title: 'Buddhist art', depth: 2, category: 'Religious & Sacred Art', establishment: 'regional_tradition' },
  { title: 'Hindu art', depth: 2, category: 'Religious & Sacred Art', establishment: 'regional_tradition' },
  { title: 'Asian art', depth: 3, category: 'Regional & Cultural Tradition', establishment: 'regional_tradition' },
  { title: 'African art', depth: 3, category: 'Regional & Cultural Tradition', establishment: 'regional_tradition' },
  { title: 'Oceanian art', depth: 3, category: 'Regional & Cultural Tradition', establishment: 'regional_tradition' },
  { title: 'Indigenous art of the Americas', depth: 3, category: 'Regional & Cultural Tradition', establishment: 'regional_tradition' },
  { title: 'Latin American art', depth: 3, category: 'Regional & Cultural Tradition', establishment: 'regional_tradition' },
  { title: 'Central Asian art', depth: 3, category: 'Regional & Cultural Tradition', establishment: 'regional_tradition' },
  { title: 'Korean art', depth: 3, category: 'Regional & Cultural Tradition', establishment: 'regional_tradition' },
  { title: 'Southeast Asian art', depth: 3, category: 'Regional & Cultural Tradition', establishment: 'regional_tradition' },
  { title: 'Indian art', depth: 3, category: 'Regional & Cultural Tradition', establishment: 'regional_tradition' },
  { title: 'Arab art', depth: 2, category: 'Regional & Cultural Tradition', establishment: 'regional_tradition' },
  { title: 'Iranian art', depth: 3, category: 'Regional & Cultural Tradition', establishment: 'regional_tradition' },
  { title: 'Film styles', depth: 2, category: 'Film & Cinema', establishment: 'historical' },
  { title: 'Photography by genre', depth: 2, category: 'Photography', establishment: 'historical' },
  { title: 'Interior design', depth: 2, category: 'Interior Design', establishment: 'historical' },
  { title: 'Furniture', depth: 2, category: 'Furniture & Product Design', establishment: 'historical' },
  { title: 'Graphic design', depth: 2, category: 'Graphic Design', establishment: 'commercial_style' },
  { title: 'Typography', depth: 1, category: 'Graphic Design', establishment: 'historical' },
  { title: 'Science fiction genres', depth: 1, category: 'Science Fiction & Fantasy', establishment: 'community_subculture' },
  { title: 'Retro-futurism', depth: 2, category: 'Technology & Retrofuturism', establishment: 'community_subculture' },
  { title: 'Comics', depth: 1, category: 'Illustration & Comics', establishment: 'historical' },
  { title: 'Illustration', depth: 2, category: 'Illustration & Comics', establishment: 'historical' },
  // Round 4: regional depth — every Indian state (incl. all of Northeast India), South Asia, and
  // craft/textile/folk-art trees by country. The class allow-list still decides what is imported.
  { title: 'Culture of Assam', depth: 2, category: 'Regional & Cultural Tradition', establishment: 'regional_tradition' },
  { title: 'Culture of Manipur', depth: 2, category: 'Regional & Cultural Tradition', establishment: 'regional_tradition' },
  { title: 'Culture of Nagaland', depth: 2, category: 'Regional & Cultural Tradition', establishment: 'regional_tradition' },
  { title: 'Culture of Meghalaya', depth: 2, category: 'Regional & Cultural Tradition', establishment: 'regional_tradition' },
  { title: 'Culture of Mizoram', depth: 2, category: 'Regional & Cultural Tradition', establishment: 'regional_tradition' },
  { title: 'Culture of Tripura', depth: 2, category: 'Regional & Cultural Tradition', establishment: 'regional_tradition' },
  { title: 'Culture of Arunachal Pradesh', depth: 2, category: 'Regional & Cultural Tradition', establishment: 'regional_tradition' },
  { title: 'Culture of Sikkim', depth: 2, category: 'Regional & Cultural Tradition', establishment: 'regional_tradition' },
  { title: 'Culture of Odisha', depth: 2, category: 'Regional & Cultural Tradition', establishment: 'regional_tradition' },
  { title: 'Culture of Kerala', depth: 2, category: 'Regional & Cultural Tradition', establishment: 'regional_tradition' },
  { title: 'Culture of Rajasthan', depth: 2, category: 'Regional & Cultural Tradition', establishment: 'regional_tradition' },
  { title: 'Culture of Gujarat', depth: 2, category: 'Regional & Cultural Tradition', establishment: 'regional_tradition' },
  { title: 'Culture of West Bengal', depth: 2, category: 'Regional & Cultural Tradition', establishment: 'regional_tradition' },
  { title: 'Culture of Tamil Nadu', depth: 2, category: 'Regional & Cultural Tradition', establishment: 'regional_tradition' },
  { title: 'Culture of Karnataka', depth: 2, category: 'Regional & Cultural Tradition', establishment: 'regional_tradition' },
  { title: 'Culture of Andhra Pradesh', depth: 2, category: 'Regional & Cultural Tradition', establishment: 'regional_tradition' },
  { title: 'Culture of Telangana', depth: 2, category: 'Regional & Cultural Tradition', establishment: 'regional_tradition' },
  { title: 'Culture of Bihar', depth: 2, category: 'Regional & Cultural Tradition', establishment: 'regional_tradition' },
  { title: 'Culture of Jharkhand', depth: 2, category: 'Regional & Cultural Tradition', establishment: 'regional_tradition' },
  { title: 'Culture of Chhattisgarh', depth: 2, category: 'Regional & Cultural Tradition', establishment: 'regional_tradition' },
  { title: 'Culture of Madhya Pradesh', depth: 2, category: 'Regional & Cultural Tradition', establishment: 'regional_tradition' },
  { title: 'Culture of Uttar Pradesh', depth: 2, category: 'Regional & Cultural Tradition', establishment: 'regional_tradition' },
  { title: 'Culture of Uttarakhand', depth: 2, category: 'Regional & Cultural Tradition', establishment: 'regional_tradition' },
  { title: 'Culture of Himachal Pradesh', depth: 2, category: 'Regional & Cultural Tradition', establishment: 'regional_tradition' },
  { title: 'Culture of Ladakh', depth: 2, category: 'Regional & Cultural Tradition', establishment: 'regional_tradition' },
  { title: 'Culture of Kashmir', depth: 2, category: 'Regional & Cultural Tradition', establishment: 'regional_tradition' },
  { title: 'Culture of Maharashtra', depth: 2, category: 'Regional & Cultural Tradition', establishment: 'regional_tradition' },
  { title: 'Culture of Goa', depth: 2, category: 'Regional & Cultural Tradition', establishment: 'regional_tradition' },
  { title: 'Culture of Northeast India', depth: 2, category: 'Regional & Cultural Tradition', establishment: 'regional_tradition' },
  { title: 'Indian art', depth: 2, category: 'Regional & Cultural Tradition', establishment: 'regional_tradition' },
  { title: 'Indian painting', depth: 1, category: 'Regional & Cultural Tradition', establishment: 'regional_tradition' },
  { title: 'Indian folk art', depth: 2, category: 'Regional & Cultural Tradition', establishment: 'regional_tradition' },
  { title: 'Indian architectural styles', depth: 1, category: 'Regional & Cultural Tradition', establishment: 'regional_tradition' },
  { title: 'Indian clothing', depth: 2, category: 'Fashion & Dress', establishment: 'regional_tradition' },
  { title: 'Indian handicrafts', depth: 2, category: 'Textile & Craft', establishment: 'regional_tradition' },
  { title: 'Textile arts of India', depth: 2, category: 'Textile & Craft', establishment: 'regional_tradition' },
  { title: 'Geographical indications in India', depth: 2, category: 'Textile & Craft', establishment: 'regional_tradition' },
  { title: 'Culture of Nepal', depth: 2, category: 'Regional & Cultural Tradition', establishment: 'regional_tradition' },
  { title: 'Culture of Bhutan', depth: 2, category: 'Regional & Cultural Tradition', establishment: 'regional_tradition' },
  { title: 'Culture of Bangladesh', depth: 2, category: 'Regional & Cultural Tradition', establishment: 'regional_tradition' },
  { title: 'Culture of Sri Lanka', depth: 2, category: 'Regional & Cultural Tradition', establishment: 'regional_tradition' },
  { title: 'Culture of Myanmar', depth: 2, category: 'Regional & Cultural Tradition', establishment: 'regional_tradition' },
  { title: 'Pakistani art', depth: 2, category: 'Regional & Cultural Tradition', establishment: 'regional_tradition' },
  { title: 'Art by country', depth: 2, category: 'Regional & Cultural Tradition', establishment: 'regional_tradition' },
  { title: 'Textile arts by country', depth: 2, category: 'Textile & Craft', establishment: 'regional_tradition' },
  { title: 'Pottery by country', depth: 2, category: 'Textile & Craft', establishment: 'regional_tradition' },
  { title: 'Crafts by country', depth: 2, category: 'Textile & Craft', establishment: 'regional_tradition' },
  { title: 'Handicrafts', depth: 2, category: 'Textile & Craft', establishment: 'regional_tradition' },
  { title: 'Folk art', depth: 2, category: 'Regional & Cultural Tradition', establishment: 'regional_tradition' },
  { title: 'Weaving', depth: 1, category: 'Textile & Craft', establishment: 'regional_tradition' },
  { title: 'Textile patterns', depth: 1, category: 'Textile & Craft', establishment: 'regional_tradition' },
  { title: 'Indigenous art', depth: 2, category: 'Regional & Cultural Tradition', establishment: 'regional_tradition' },
  { title: 'Masterpieces of the Oral and Intangible Heritage of Humanity', depth: 0, category: 'Regional & Cultural Tradition', establishment: 'regional_tradition' },
]

// Sub-categories that hold people, works, institutions or media rather than styles.
const SKIP_CAT =
  /\b(people|persons|artists|painters|sculptors|architects|designers|writers|poets|musicians|photographers|potters|weavers|craftspeople|makers|by city|buildings|structures|houses|churches|mosques|temples|palaces|castles|works|paintings|sculptures|books|albums|songs|films|video games|television|magazines|periodicals|journals|museums|galleries|collections|organizations|organisations|companies|brands|manufacturers|schools \(educational|universities|events|exhibitions|festivals|awards|births|deaths|lists|images|templates|stubs|wikipedia|redirects|user|portal|in fiction|mythology|characters|terminology|tools|equipment|history of [a-z]+ by)\b/i

const http = cache<unknown>('crawl')
async function wp<T = any>(params: Record<string, string>): Promise<T> {
  const url = `https://en.wikipedia.org/w/api.php?${new URLSearchParams({ format: 'json', formatversion: '2', ...params })}`
  const hit = http.get(url)
  if (hit) return hit as T
  const res = await getJSON<T>(url)
  http.set(url, res)
  await sleep(60)
  return res
}

const OUT = path.join(CACHE_DIR, 'crawl.json')

if (!process.argv.includes('--classes')) {
  const pages = new Map<string, { title: string; root: string; depth: number }>()
  const seenCats = new Set<string>()
  for (const root of ROOTS) {
    let frontier = [`Category:${root.title}`]
    for (let d = 0; d <= root.depth && frontier.length; d++) {
      const next: string[] = []
      for (const cat of frontier) {
        if (seenCats.has(cat)) continue
        seenCats.add(cat)
        let cont: string | undefined
        do {
          const res: any = await wp({ action: 'query', list: 'categorymembers', cmtitle: cat, cmlimit: '500', cmtype: 'page|subcat', ...(cont ? { cmcontinue: cont } : {}) })
          for (const m of res.query?.categorymembers ?? []) {
            if (m.ns === 14) {
              if (!SKIP_CAT.test(m.title)) next.push(m.title)
            } else if (m.ns === 0 && !pages.has(m.title)) pages.set(m.title, { title: m.title, root: root.title, depth: d })
          }
          cont = res.continue?.cmcontinue
        } while (cont)
      }
      frontier = next
    }
    console.log(`${root.title}: ${pages.size} pages so far, ${seenCats.size} categories`)
  }

  // Resolve Wikidata items (50 titles per request).
  const titles = [...pages.keys()]
  const qids = new Map<string, string>()
  for (let i = 0; i < titles.length; i += 50) {
    const res: any = await wp({ action: 'query', titles: titles.slice(i, i + 50).join('|'), prop: 'pageprops', ppprop: 'wikibase_item|disambiguation' })
    for (const p of res.query?.pages ?? []) if (p.pageprops?.wikibase_item && p.pageprops.disambiguation === undefined) qids.set(p.title, p.pageprops.wikibase_item)
  }
  // P31 per item (wbgetentities, 50 per request).
  const ids = [...new Set(qids.values())]
  const p31 = new Map<string, string[]>()
  for (let i = 0; i < ids.length; i += 50) {
    const res: any = await getJSON(
      `https://www.wikidata.org/w/api.php?${new URLSearchParams({ action: 'wbgetentities', ids: ids.slice(i, i + 50).join('|'), props: 'claims', format: 'json' })}`
    )
    for (const [q, e] of Object.entries<any>(res.entities ?? {})) {
      p31.set(q, (e.claims?.P31 ?? []).map((c: any) => c.mainsnak?.datavalue?.value?.id).filter(Boolean))
    }
    await sleep(100)
  }
  const out = titles
    .filter((t) => qids.has(t))
    .map((t) => ({ ...pages.get(t)!, qid: qids.get(t)!, p31: p31.get(qids.get(t)!) ?? [] }))
  writeFileSync(OUT, JSON.stringify(out))
  console.log(`✓ ${out.length} candidate pages with Wikidata items → ${OUT}`)
} else {
  // Frequency table of P31 classes with English labels, for building the allow-list.
  const rows: { p31: string[] }[] = JSON.parse(readFileSync(OUT, 'utf8'))
  const freq = new Map<string, number>()
  for (const r of rows) for (const c of r.p31) freq.set(c, (freq.get(c) ?? 0) + 1)
  const top = [...freq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 250)
  const labels = new Map<string, string>()
  for (let i = 0; i < top.length; i += 50) {
    const res: any = await getJSON(
      `https://www.wikidata.org/w/api.php?${new URLSearchParams({ action: 'wbgetentities', ids: top.slice(i, i + 50).map(([q]) => q).join('|'), props: 'labels', languages: 'en', format: 'json' })}`
    )
    for (const [q, e] of Object.entries<any>(res.entities ?? {})) labels.set(q, e.labels?.en?.value ?? q)
  }
  const existing = existsSync(path.join(CACHE_DIR, 'crawl-classes.txt'))
  writeFileSync(path.join(CACHE_DIR, 'crawl-classes.txt'), top.map(([q, n]) => `${n}\t${q}\t${labels.get(q)}`).join('\n'))
  console.log(`classes written${existing ? ' (updated)' : ''}`)
}
