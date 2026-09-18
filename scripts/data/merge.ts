// Merge duplicate records: `node scripts/data/merge.ts <drop-slug> <keep-slug> [...pairs]`
// The dropped record's name/aliases become aliases of the kept one; relations are re-pointed.
import { existsSync, unlinkSync } from 'node:fs'
import path from 'node:path'
import { SRC_DIR, loadAesthetics, loadRelations, saveAesthetic, saveRelations } from './lib.ts'

const args = process.argv.slice(2)
if (args.length % 2) throw new Error('pass pairs: <drop> <keep>')
const all = new Map(loadAesthetics().map((a) => [a.slug, a]))
let rels = loadRelations()
for (let i = 0; i < args.length; i += 2) {
  const [drop, keep] = [args[i], args[i + 1]]
  const d = all.get(drop)
  const k = all.get(keep)
  if (!d || !k) throw new Error(`unknown slug ${!d ? drop : keep}`)
  k.aliases = [...new Set([...k.aliases, d.name, ...d.aliases].filter((n) => n.toLowerCase() !== k.name.toLowerCase()))]
  for (const s of d.sources) if (s.url && !k.sources.some((x) => x.url === s.url)) k.sources.push(s)
  if (!k.images.length) k.images = d.images
  k.updatedAt = new Date().toISOString()
  saveAesthetic(k)
  rels = rels.map((r) => ({ ...r, from: r.from === drop ? keep : r.from, to: r.to === drop ? keep : r.to })).filter((r) => r.from !== r.to)
  const p = path.join(SRC_DIR, `${drop}.json`)
  if (existsSync(p)) unlinkSync(p)
  console.log(`merged ${drop} → ${keep}`)
}
const seen = new Set<string>()
saveRelations(rels.filter((r) => (seen.has(`${r.from}|${r.to}|${r.type}`) ? false : (seen.add(`${r.from}|${r.to}|${r.type}`), true))))
