import { PrismaClient } from '@prisma/client'
const db = new PrismaClient()
async function main() {
  const total = await db.aesthetic.count()
  const byStatus = await db.aesthetic.groupBy({ by: ['status'], _count: true })
  const rels = await db.relation.count()
  const noCtx = await db.aesthetic.count({ where: { culturalContext: '' } })
  const noVd = await db.aesthetic.count({ where: { visualDNA: '{}' } })
  const noTyp = await db.aesthetic.count({ where: { typography: '{}' } })
  const noColors = await db.aesthetic.count({ where: { colors: '[]' } })
  const noDesc = await db.aesthetic.count({ where: { description: '' } })
  const noRefs = await db.aesthetic.count({ where: { references: '[]' } })
  console.log('TOTAL:', total)
  console.log('STATUS:', JSON.stringify(byStatus.map((s: any) => ({ s: s.status, n: s._count }))))
  console.log('RELATIONS:', rels)
  console.log('GAPS: noCtx=' + noCtx, 'noVd=' + noVd, 'noTyp=' + noTyp, 'noColors=' + noColors, 'noDesc=' + noDesc, 'noRefs=' + noRefs)
}
main().then(()=>process.exit(0))
