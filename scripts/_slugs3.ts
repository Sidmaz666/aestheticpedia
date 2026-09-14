import { PrismaClient } from '@prisma/client'
const db = new PrismaClient()
async function main() {
  const slugs = ['impasto-sculptural-paint','aquarelle','batik','action-painting','bokeh-quality','halftone-dot-rosettes','8-bit-palette-snapping','iridescence','rembrandt-lighting-in-paint','heavy-vignetting','exploded-view-technical-manuals','child-art-developmental-stages','celtic-knotwork','pixel-art-outlines','croquis-9-head-convention','editorial-caricature-exaggeration','vinyl-record-surface','burl-figuring','nero-marquina-marble-culture','honed-granite-surfaces']
  for (const s of slugs) {
    const e = await db.aesthetic.findUnique({ where: { slug: s }, select: { slug: true, name: true, summary: true, status: true, culturalContext: true } })
    if (e) console.log(`${e.slug} [${e.status}] ctx=${e.culturalContext.length ? 'YES' : 'no'} :: ${e.summary.slice(0,100)}`)
    else console.log(`MISSING ${s}`)
  }
}
main().then(()=>process.exit(0))
