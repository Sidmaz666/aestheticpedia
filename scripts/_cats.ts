import { PrismaClient } from '@prisma/client'
const db = new PrismaClient()
async function main() {
  const byCat = await db.aesthetic.groupBy({ by: ['category'], _count: true, orderBy: { _count: { category: 'desc' } } })
  for (const c of byCat) console.log(String(c._count).padStart(4), c.category)
}
main().then(()=>process.exit(0))
