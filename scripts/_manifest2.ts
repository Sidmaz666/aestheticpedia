import { PrismaClient } from '@prisma/client'
const db = new PrismaClient()
async function main() {
  const entries = await db.aesthetic.findMany({
    where: { status: 'draft', culturalContext: '', visualDNA: '{}', typography: '{}' },
    select: { slug: true, name: true, category: true },
    orderBy: [{ category: 'asc' }, { popularity: 'desc' }],
  })
  const byCat: Record<string, typeof entries> = {}
  for (const e of entries) { (byCat[e.category] ||= []).push(e) }
  for (const [cat, list] of Object.entries(byCat).sort((a,b)=>b[1].length-a[1].length).slice(0,12)) {
    console.log(`\n## ${cat} (${list.length})`)
    list.slice(0, 6).forEach(e => console.log(`- ${e.slug} | ${e.name}`))
  }
}
main().then(()=>process.exit(0))
