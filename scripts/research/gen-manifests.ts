/**
 * Generates backfill manifests: JSON slices of entries with missing depth
 * fields, ordered so patch agents get thematically coherent, prioritized
 * batches. Output goes to scripts/research/patches/manifest-*.json.
 *
 *   bun scripts/research/gen-manifests.ts            # 4 draft slices + 1 verified ctx slice
 *   bun scripts/research/gen-manifests.ts 40 80      # custom slice sizes
 */
import { PrismaClient } from '@prisma/client'
import { writeFileSync, mkdirSync } from 'fs'

const db = new PrismaClient()
const E = '{}'

// category → priority (user-facing breadth first)
const CAT_ORDER = [
  'Art Movement',
  'Architectural Style',
  'Internet Aesthetic',
  'Subculture Style',
  'Film & Cinema',
  'Graphic Design',
  'Web & UI Design',
  'Historical Period Style',
  'Regional & Cultural Tradition',
  'Textile & Craft',
  'Painting Technique & School',
  'Fashion & Dress',
  'Religious & Sacred Art',
  'Interior Design',
  'Furniture & Product Design',
  'Drawing & Line Work',
  'Texture & Material Study',
  'Material & Surface',
  'Music & Sonic Culture',
  'Illustration & Comics',
  'Science Fiction & Fantasy',
  'Game & Pixel Aesthetic',
  'Technology & Retrofuturism',
  'Color & Light',
  'Visual Effects & Phenomena',
]

async function main() {
  const draftSlice = Number(process.argv[2] ?? 35)
  const ctxSlice = Number(process.argv[3] ?? 60)
  mkdirSync('scripts/research/patches', { recursive: true })

  const missing = await db.aesthetic.findMany({
    where: { visualDNA: E, typography: E, culturalContext: '' },
    select: { slug: true, name: true, category: true, subcategory: true, origin: true, era: true, summary: true, popularity: true, status: true },
  })
  missing.sort((a: any, b: any) => {
    const ca = CAT_ORDER.indexOf(a.category)
    const cb = CAT_ORDER.indexOf(b.category)
    if (ca !== cb) return (ca < 0 ? 99 : ca) - (cb < 0 ? 99 : cb)
    return b.popularity - a.popularity
  })
  console.log(`missing-all3: ${missing.length}`)

  let idx = 0
  let file = 0
  const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
  while (idx < missing.length && file < letters.length) {
    const slice = missing.slice(idx, idx + draftSlice)
    if (slice.length === 0) break
    writeFileSync(
      `scripts/research/patches/manifest-14${letters[file]}.json`,
      JSON.stringify(slice, null, 2)
    )
    console.log(`manifest-14${letters[file]}.json: ${slice.length} (${slice[0].category} … ${slice[slice.length - 1].category})`)
    idx += draftSlice
    file++
  }

  // culturalContext-only slice for verified entries
  const verifiedNoCtx = await db.aesthetic.findMany({
    where: { status: 'verified', culturalContext: '' },
    select: { slug: true, name: true, category: true, subcategory: true, origin: true, era: true, summary: true, popularity: true, status: true },
    orderBy: { popularity: 'desc' },
    take: ctxSlice,
  })
  if (verifiedNoCtx.length > 0) {
    writeFileSync(
      'scripts/research/patches/manifest-14i.json',
      JSON.stringify(verifiedNoCtx, null, 2)
    )
    console.log(`manifest-14i.json: ${verifiedNoCtx.length} verified ctx-only`)
  }
  process.exit(0)
}

main().catch((e) => {
  console.error('gen-manifests failed:', e)
  process.exit(1)
})
