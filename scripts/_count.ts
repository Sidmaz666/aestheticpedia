import { PrismaClient } from '@prisma/client'
const db = new PrismaClient()
const S = '[]', E = '{}'
async function main() {
  const entries = await db.aesthetic.count()
  const noCtx = await db.aesthetic.count({ where: { culturalContext: '' } })
  const noVDNA = await db.aesthetic.count({ where: { visualDNA: E } })
  const noTypo = await db.aesthetic.count({ where: { typography: E } })
  const all3 = await db.aesthetic.count({ where: { visualDNA: E, typography: E, culturalContext: '' } })
  const noColors = await db.aesthetic.count({ where: { colors: S } })
  const noKeyEx = await db.aesthetic.count({ where: { keyExamples: S } })
  const noObj = await db.aesthetic.count({ where: { objects: S } })
  const st = await db.aesthetic.groupBy({ by: ['status'], _count: true })
  const rel = await db.relation.count()
  const linked = await db.relation.findMany({ distinct: ['fromId'], select: { fromId: true } })
  const batches = await db.researchBatch.groupBy({ by: ['status'], _count: true })
  console.log('ENTRIES:', entries, '| REL:', rel, '| unlinked:', entries - linked.length)
  console.log('GAPS: ctx=' + noCtx, 'vDNA=' + noVDNA, 'typo=' + noTypo, 'missingAll3=' + all3, 'colors=' + noColors, 'keyEx=' + noKeyEx, 'obj=' + noObj)
  console.log('STATUS:', st.map((x: any) => `${x.status}=${x._count}`).join(', '))
  console.log('BATCHES:', batches.map((b: any) => `${b.status}=${b._count}`).join(', '))
}
main().then(() => process.exit(0))
