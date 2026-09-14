import { PrismaClient } from '@prisma/client'
const db = new PrismaClient()
async function main() {
  const entries = await db.aesthetic.findMany({
    where: { status: 'draft', culturalContext: '', visualDNA: '{}', typography: '{}' },
    select: { slug: true, name: true, category: true, summary: true },
    orderBy: [{ category: 'asc' }, { popularity: 'desc' }],
  })
  console.log('MISSING-ALL3 DRAFTS:', entries.length)
  for (const e of entries.slice(0, 35)) {
    console.log(`- ${e.slug} | ${e.name} | ${e.category} | ${e.summary.slice(0, 90)}`)
  }
}
main().then(()=>process.exit(0))
