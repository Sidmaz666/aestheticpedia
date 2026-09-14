import { PrismaClient } from '@prisma/client'
const db = new PrismaClient()
async function main() {
  const names = ['ashcan', 'regional', 'supremat', 'fauv', 'supa', 'harlem', 'precision', 'barbizon', 'hudson', 'ukiyo', 'pictorial', 'vaudeville', 'wpa', 'blue period', 'still life', 'byzantine mosaic', 'stained glass']
  for (const n of names) {
    const hits = await db.aesthetic.findMany({ where: { OR: [{ name: { contains: n } }, { category: { contains: n } }] }, select: { slug: true, name: true, status: true }, take: 3 })
    if (hits.length) hits.forEach(h => console.log(`${h.slug} | ${h.name} | ${h.status}`))
    else console.log(`-- none for "${n}"`)
  }
}
main().then(()=>process.exit(0))
