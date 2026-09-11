/**
 * Aesthetic Atlas — Visual examples worker.
 *
 * For every entry without images, searches the public web for real example
 * imagery (via `z-ai image-search`, OSS re-hosted stable URLs) and stores
 * 3-6 images per entry in the `images` JSON column.
 *
 * Usage:
 *   bun scripts/research/images.ts worker   # long-running loop (default 1 pass)
 *   bun scripts/research/images.ts once     # single pass, then exit
 *
 * Ordering: verified -> researched -> draft, popularity desc, so the most
 * visible entries get visual examples first.
 */
import { dbp } from './lib'
import { sleep } from './lib'

const log = (...args: any[]) => console.log(new Date().toISOString().slice(11, 19), '[images]', ...args)

interface ImageResult {
  original_url?: string
  caption?: string
  source?: string
  original_width?: string
  original_height?: string
}

interface StoredImage {
  url: string
  caption: string
  source: string
  width: string
  height: string
}

const CATEGORY_QUERY_HINT: Record<string, string> = {
  'Art Movement': 'paintings artwork style',
  'Architectural Style': 'architecture buildings',
  'Interior Design': 'interior room design',
  'Furniture & Product Design': 'furniture product design',
  'Graphic Design': 'graphic design poster',
  'Internet Aesthetic': 'aesthetic moodboard imagery',
  'Web & UI Design': 'website ui design screenshots',
  'Game & Pixel Aesthetic': 'video game screenshots',
  'Film & Cinema': 'movie stills cinematography',
  Photography: 'photography examples',
  'Illustration & Comics': 'illustration artwork',
  'Animation & Cartoon': 'animation stills',
  'Fashion & Dress': 'fashion outfit clothing',
  'Subculture Style': 'subculture fashion street style',
  'Music & Sonic Culture': 'album covers scene fashion',
  'Regional & Cultural Tradition': 'traditional art culture',
  'Religious & Sacred Art': 'sacred art',
  'Historical Period Style': 'historical paintings artifacts',
  'Texture & Material Study': 'texture close-up surface',
  'Material & Surface': 'material surface sample',
  'Visual Effects & Phenomena': 'visual effect light phenomenon',
  'Drawing & Line Work': 'drawing line work artwork',
  'Painting Technique & School': 'painting artwork',
  'Color & Light': 'color palette light mood photography',
  'Typography & Lettering': 'typography lettering examples',
  'Textile & Craft': 'textile craft pattern',
  'Nature & Landscape': 'landscape scenery',
  'Literature & Writing': 'book cover typography',
  'Science Fiction & Fantasy': 'concept art',
  'Technology & Retrofuturism': 'retro technology design',
  'Transport & Machinery': 'vehicle design',
  'Food & Hospitality': 'food presentation',
  'Performance & Festival': 'performance stage costume',
  'Sports & Leisure': 'sports culture style',
  'Mood & Atmosphere': 'mood photography atmosphere',
  'Micro-aesthetic': 'aesthetic imagery moodboard',
  'Hybrid & Experimental': 'style imagery examples',
}

function buildQuery(name: string, category: string): string {
  const hint = CATEGORY_QUERY_HINT[category] ?? 'style examples'
  return `${name} ${hint}`
}

function sanitize(input: string, max: number): string {
  return input.replace(/["'`\\$]/g, '').trim().slice(0, max)
}

async function searchImages(query: string, count = 6): Promise<ImageResult[]> {
  const argv = [
    'z-ai', 'image-search',
    '-q', sanitize(query, 180),
    '--count', String(count),
    '--gl', 'us',
    '--no-rank',
  ]
  try {
    const proc = Bun.spawn(argv, { stdout: 'pipe', stderr: 'pipe' })
    const timer = setTimeout(() => proc.kill(), 150_000)
    const stdout = await new Response(proc.stdout).text()
    const code = await proc.exited
    clearTimeout(timer)
    if (code !== 0) {
      const stderr = await new Response(proc.stderr).text()
      throw new Error(`exit ${code}: ${stderr.slice(0, 120)}`)
    }
    // The CLI may print non-JSON preamble; find the outermost JSON object.
    const start = stdout.indexOf('{')
    const end = stdout.lastIndexOf('}')
    if (start === -1 || end === -1) throw new Error('no JSON in output')
    const parsed = JSON.parse(stdout.slice(start, end + 1))
    if (!parsed || parsed.success !== true || !Array.isArray(parsed.results)) {
      throw new Error(String(parsed?.error ?? 'unsuccessful response').slice(0, 120))
    }
    return parsed.results as ImageResult[]
  } catch (e: any) {
    throw new Error(String(e.message ?? e).slice(0, 160))
  }
}

function toStored(results: ImageResult[], max = 6): StoredImage[] {
  const out: StoredImage[] = []
  const seen = new Set<string>()
  for (const r of results) {
    const url = typeof r.original_url === 'string' ? r.original_url.trim() : ''
    if (!/^https?:\/\/.+/.test(url) || seen.has(url)) continue
    seen.add(url)
    out.push({
      url,
      caption: (r.caption ?? '').slice(0, 200),
      source: (r.source ?? '').slice(0, 80),
      width: (r.original_width ?? '').slice(0, 10),
      height: (r.original_height ?? '').slice(0, 10),
    })
    if (out.length >= max) break
  }
  return out
}

async function nextEntry(failed: Set<string>) {
  // verified first, then researched, then drafts; popularity desc within tier.
  for (const status of ['verified', 'researched', 'draft']) {
    const entry = await dbp.aesthetic.findFirst({
      where: { images: '[]', status, id: { notIn: [...failed] } },
      orderBy: [{ popularity: 'desc' }, { createdAt: 'asc' }],
      select: { id: true, slug: true, name: true, category: true },
    })
    if (entry) return entry
  }
  return null
}

async function processOne(entry: { id: string; slug: string; name: string; category: string }): Promise<boolean> {
  const query = buildQuery(entry.name, entry.category)
  try {
    const results = await searchImages(query)
    const images = toStored(results)
    if (images.length === 0) {
      log(`∅ no results: ${entry.name} ("${query}")`)
      return false
    }
    await dbp.aesthetic.update({ where: { id: entry.id }, data: { images: JSON.stringify(images) } })
    log(`✓ ${entry.name}: ${images.length} images`)
    return true
  } catch (e: any) {
    log(`✗ ${entry.name}: ${String(e.message).slice(0, 100)}`)
    return false
  }
}

async function pass(): Promise<number> {
  const failed = new Set<string>()
  let processed = 0
  let ok = 0
  for (;;) {
    const entry = await nextEntry(failed)
    if (!entry) break
    const success = await processOne(entry)
    processed++
    if (success) ok++
    else failed.add(entry.id)
    // Gentle pacing; image search probes + rehosts are expensive upstream.
    await sleep(1500)
  }
  log(`Pass complete: ${ok}/${processed} entries illustrated`)
  return processed
}

const cmd = process.argv[2] ?? 'worker'
;(async () => {
  try {
    if (cmd === 'once') {
      await pass()
    } else {
      log('worker starting')
      for (;;) {
        try {
          const processed = await pass()
          if (processed === 0) {
            log('nothing left to illustrate; idle 120s')
            await sleep(120_000)
          } else {
            await sleep(3000)
          }
        } catch (e: any) {
          // Never let a transient failure kill the loop.
          log(`pass crashed, retrying in 30s: ${String(e?.message ?? e).slice(0, 160)}`)
          await sleep(30_000)
        }
      }
    }
  } catch (e: any) {
    console.error('FATAL', e)
    process.exitCode = 1
  } finally {
    await dbp.$disconnect()
  }
})()
