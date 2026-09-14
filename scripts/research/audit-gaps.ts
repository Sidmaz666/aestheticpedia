import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

const EMPTY = ['', '{}', '[]', '{"":"","":""}']

function isGap(v: string | null): boolean {
  if (v === null) return true
  const t = v.trim()
  if (EMPTY.includes(t)) return true
  if (t === '[]' || t === '{}' || t === '') return true
  return false
}

async function main() {
  const entries = await db.aesthetic.findMany({
    select: {
      slug: true, name: true, category: true, status: true,
      summary: true, description: true, culturalContext: true,
      visualDNA: true, colors: true, typography: true,
      materials: true, textures: true, lighting: true,
      objects: true, uiTranslation: true,
      keyExamples: true, sources: true, references: true,
      aliases: true, tags: true,
    },
  })

  const gaps: Record<string, string[]> = {
    summary: [], description: [], culturalContext: [],
    visualDNA: [], colors: [], typography: [],
    materials: [], textures: [], lighting: [],
    objects: [], uiTranslation: [], keyExamples: [],
    sources: [], references: [], aliases: [], tags: [],
  }

  // deep gap detection for JSON objects: vd missing all 4 keys, typ missing display+body
  const vdAll4: string[] = []
  const typMissing: string[] = []

  for (const e of entries) {
    for (const k of Object.keys(gaps)) {
      const v = (e as Record<string, unknown>)[k]
      if (isGap(v as string)) gaps[k].push(e.slug)
    }
    // visualDNA: needs at least shape+line+composition+texture
    try {
      const vd = JSON.parse(e.visualDNA || '{}')
      const keys = ['shape', 'line', 'composition', 'texture']
      const have = keys.filter((k) => vd[k] && String(vd[k]).length > 10)
      if (have.length < 4) vdAll4.push(e.slug)
    } catch { vdAll4.push(e.slug) }
    // typography: needs display + body
    try {
      const t = JSON.parse(e.typography || '{}')
      if (!t.display || !t.body) typMissing.push(e.slug)
    } catch { typMissing.push(e.slug) }
  }

  const n = entries.length
  console.log(`TOTAL: ${n}`)
  const order = ['culturalContext', 'visualDNA', 'typography', 'colors', 'lighting', 'objects', 'uiTranslation', 'keyExamples', 'materials', 'textures', 'references', 'sources', 'aliases', 'tags', 'summary', 'description']
  for (const k of order) {
    console.log(`${k.padEnd(16)} ${String(gaps[k].length).padStart(5)}  (${((gaps[k].length / n) * 100).toFixed(1)}%)`)
  }
  console.log(`vdAll4(4keys)    ${String(vdAll4.length).padStart(5)}`)
  console.log(`typDispBody      ${String(typMissing.length).padStart(5)}`)

  // category breakdown for the big 3 gaps
  const byCat: Record<string, { ctx: number; vd: number; typ: number; all: number; total: number }> = {}
  const vdSet = new Set(vdAll4), typSet = new Set(typMissing)
  const ctxSet = new Set(gaps.culturalContext)
  const all3Set = new Set()
  for (const e of entries) {
    const cat = e.category
    byCat[cat] ??= { ctx: 0, vd: 0, typ: 0, all: 0, total: 0 }
    byCat[cat].total++
    if (ctxSet.has(e.slug)) { byCat[cat].ctx++; if (vdSet.has(e.slug) && typSet.has(e.slug)) byCat[cat].all++ }
    if (vdSet.has(e.slug)) byCat[cat].vd++
    if (typSet.has(e.slug)) byCat[cat].typ++
  }
  console.log('\nBY CATEGORY (ctx | vd | typ | all3 | total):')
  for (const [cat, s] of Object.entries(byCat).sort((a, b) => b[1].all - a[1].all)) {
    console.log(`${cat.padEnd(22)} ctx ${String(s.ctx).padStart(4)} vd ${String(s.vd).padStart(4)} typ ${String(s.typ).padStart(4)} all3 ${String(s.all).padStart(4)} / ${s.total}`)
  }

  // export slugs of all3-gap entries for patch manifest generation
  const all3 = entries.filter((e) => ctxSet.has(e.slug) && vdSet.has(e.slug) && typSet.has(e.slug))
  const fs = await import('fs')
  fs.writeFileSync('/home/z/my-project/scripts/research/gaps-all3.json', JSON.stringify(all3.map((e) => ({ slug: e.slug, name: e.name, category: e.category, status: e.status })), null, 1))
  fs.writeFileSync('/home/z/my-project/scripts/research/gaps-ctx-only.json', JSON.stringify(entries.filter((e) => ctxSet.has(e.slug) && !all3Set.has(e.slug) && !vdSet.has(e.slug) && !typSet.has(e.slug)).map((e) => ({ slug: e.slug, name: e.name, category: e.category })), null, 1))
  console.log(`\nall3-gap exported: ${all3.length} → gaps-all3.json`)
}

main().finally(() => db.$disconnect())
