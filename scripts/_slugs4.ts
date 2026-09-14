import { PrismaClient } from '@prisma/client'
const db = new PrismaClient()
async function main() {
  const slugs = ['shanghai-tailored-qipao','furisode','bursa-silk-court-kaftans','hawaiian-lei','yukata','qing-dragon-robe','peking-opera-lianpu','sichuan-bianlian-face-changing','talchum-mask-aesthetics','empire-style','grandmillennial','izakaya','viennese-coffeehouse','washitsu','high-tech-interiors','dunhuang-mogao-murals','rangoli','benin-bronzes','yoruba-beaded-crowns','mandala-sand-painting']
  const missing: string[] = []
  for (const s of slugs) {
    const e = await db.aesthetic.findUnique({ where: { slug: s }, select: { slug: true, status: true, culturalContext: true } })
    if (e) console.log(`${e.slug} [${e.status}] ctx=${e.culturalContext.length ? 'YES' : 'no'}`)
    else missing.push(s)
  }
  console.log('MISSING:', JSON.stringify(missing))
}
main().then(()=>process.exit(0))
