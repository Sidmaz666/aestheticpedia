import { PrismaClient } from '@prisma/client'
const db = new PrismaClient()
async function main() {
  const rows = await db.aesthetic.findMany({ select: { name: true, textures: true, materials: true, category: true }, take: 900 })
  const want = /zellige|mosaic|tile|azulejo|batik|shibori|filigree|bead|inlay|marquetry|embroider|sashiko|kantha/i
  const hits = rows.filter(r => want.test(r.textures) || want.test(r.materials))
  console.log(hits.slice(0, 12).map(h => h.name).join(' | '))
  process.exit(0)
}
main()
