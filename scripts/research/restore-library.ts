/**
 * Library restore — rebuilds the Aesthetic + Relation tables from a JSON
 * export produced by export-library.ts. Idempotent: existing slugs are
 * updated in place, missing slugs are created with stable ids preserved.
 * Use ONLY after sandbox rollback data loss.
 *
 *   bun scripts/research/restore-library.ts [input.json]
 */
import { PrismaClient } from '@prisma/client'
import { readFileSync } from 'fs'

const db = new PrismaClient()

type Rel = { from: string; to: string; type: string }

async function main() {
  const src = process.argv[2] ?? 'db/library-export.json'
  const raw = JSON.parse(readFileSync(src, 'utf8')) as { entries: any[]; relations: Rel[] }
  console.log(`restore from ${src}: ${raw.entries.length} entries, ${raw.relations.length} relations`)

  // snapshot current ids so we can drop stale relations safely
  const existing = await db.aesthetic.findMany({ select: { id: true } })
  const existingIds = new Set(existing.map((e) => e.id))

  let created = 0
  let updated = 0
  for (const e of raw.entries) {
    const { id, batchId, ...data } = e
    const hit = await db.aesthetic.findUnique({ where: { slug: e.slug }, select: { id: true } })
    if (hit) {
      await db.aesthetic.update({ where: { id: hit.id }, data })
      updated++
    } else {
      // preserve original id so relations stay coherent
      try {
        await db.aesthetic.create({ data: { id, ...data } })
        created++
      } catch {
        await db.aesthetic.create({ data })
        created++
      }
    }
  }

  // rebuild relations only when both endpoints exist; clear old edges first
  if (created > 0) {
    await db.relation.deleteMany({})
    let rels = 0
    for (const r of raw.relations) {
      const from = await db.aesthetic.findUnique({ where: { slug: r.from }, select: { id: true } })
      const to = await db.aesthetic.findUnique({ where: { slug: r.to }, select: { id: true } })
      if (!from || !to) continue
      try {
        await db.relation.create({ data: { fromId: from.id, toId: to.id, type: r.type } })
        rels++
      } catch {}
    }
    console.log(`relations rebuilt: ${rels}/${raw.relations.length}`)
  }

  console.log(`DONE created=${created} updated=${updated} (pre-existing ids: ${existingIds.size})`)
  process.exit(0)
}

main().catch((e) => {
  console.error('restore failed:', e)
  process.exit(1)
})
