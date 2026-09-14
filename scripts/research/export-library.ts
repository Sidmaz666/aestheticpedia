/**
 * Library insurance — exports the ENTIRE Aesthetic table (plus relations) to a
 * single portable JSON file. If the sandbox ever rolls the project back to an
 * older snapshot, restore-library.ts can rebuild the full library from this
 * file in seconds. Commit the JSON to git after every growth milestone.
 *
 *   bun scripts/research/export-library.ts [output.json]
 */
import { PrismaClient } from '@prisma/client'
import { writeFileSync } from 'fs'

const db = new PrismaClient()

async function main() {
  const out = process.argv[2] ?? 'db/library-export.json'
  const entries = await db.aesthetic.findMany({ orderBy: { createdAt: 'asc' } })
  const relations = await db.relation.findMany({
    select: { fromId: true, toId: true, type: true },
  })
  const idToSlug = new Map(entries.map((e) => [e.id, e.slug]))
  const rels = relations
    .filter((r) => idToSlug.has(r.fromId) && idToSlug.has(r.toId))
    .map((r) => ({ from: idToSlug.get(r.fromId), to: idToSlug.get(r.toId), type: r.type }))
  const payload = {
    exportedAt: new Date().toISOString(),
    count: entries.length,
    relations: rels.length,
    entries,
    relations,
  }
  writeFileSync(out, JSON.stringify(payload))
  console.log(`exported ${entries.length} entries + ${rels.length} relations → ${out} (${(JSON.stringify(payload).length / 1e6).toFixed(1)} MB)`)
  process.exit(0)
}

main().catch((e) => {
  console.error('export failed:', e)
  process.exit(1)
})
