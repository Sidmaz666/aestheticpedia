import { PrismaClient } from '@prisma/client'
const db = new PrismaClient()
async function main() {
  const total = await db.aesthetic.count()
  const byStatus = await db.aesthetic.groupBy({ by: ['status'], _count: true })
  const queued = await db.researchBatch.count({ where: { status: 'queued' } })
  const done = await db.researchBatch.count({ where: { status: 'done' } })
  console.log('TOTAL', total)
  console.log('STATUSES', JSON.stringify(byStatus))
  console.log('QUEUE queued=', queued, 'done=', done)
  const cats = await db.aesthetic.groupBy({ by: ['category'], _count: true, orderBy: { _count: { category: 'desc' } } })
  console.log('CATEGORIES(' + cats.length + ')')
  for (const c of cats) console.log(' ', c._count, c.category)
}
main().finally(() => db.$disconnect())
