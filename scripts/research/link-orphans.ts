/**
 * Deterministic relation backfill — links entries that have ZERO outgoing
 * relation edges by scoring stored factual signals only (category, tags,
 * origin/geography, era). No LLM, no invented facts: an edge is only created
 * when two entries share enough documented signals.
 *
 *   bun scripts/research/link-orphans.ts
 */
import { dbp } from './lib'

const MIN_SCORE = 3

type Lite = {
  id: string
  name: string
  category: string
  tags: string[]
  origin: string
  geography: string
  era: string
}

function tokens(s: string): string[] {
  return s
    .toLowerCase()
    .split(/[,/&;]+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 2)
}

function eraOverlap(a: string, b: string): boolean {
  if (!a || !b) return false
  const la = a.toLowerCase()
  const lb = b.toLowerCase()
  return la === lb || la.includes(lb) || lb.includes(la)
}

async function main() {
  const all = (await dbp.aesthetic.findMany({
    select: { id: true, name: true, category: true, tags: true, origin: true, geography: true, era: true },
  })) as Lite[]
  for (const e of all) {
    try {
      e.tags = JSON.parse(e.tags as unknown as string)
    } catch {
      e.tags = []
    }
  }

  const rels = await dbp.relation.findMany({ select: { fromId: true, toId: true } })
  const have = new Set<string>()
  const outDegree = new Map<string, number>()
  for (const r of rels) {
    have.add(`${r.fromId}>${r.toId}`)
    have.add(`${r.toId}>${r.fromId}`)
    outDegree.set(r.fromId, (outDegree.get(r.fromId) ?? 0) + 1)
  }

  const orphans = all.filter((e) => (outDegree.get(e.id) ?? 0) === 0)
  console.log(`entries=${all.length} orphans(0 outgoing)=${orphans.length} minScore=${MIN_SCORE}`)

  let linked = 0
  let edges = 0
  for (const a of orphans) {
    const at = new Set(a.tags.map((t) => t.toLowerCase()))
    const aOrig = new Set([...tokens(a.origin), ...tokens(a.geography)])
    const scored: Array<{ b: Lite; score: number }> = []
    for (const b of all) {
      if (b.id === a.id) continue
      let score = 0
      if (b.category === a.category) score += 2
      let sharedTags = 0
      for (const t of b.tags) if (at.has(t.toLowerCase())) sharedTags++
      score += sharedTags
      const bOrig = tokens(b.geography).filter((t) => aOrig.has(t))
      if (bOrig.length > 0 || aOrig.has(b.origin.toLowerCase())) score += 1
      if (eraOverlap(a.era, b.era)) score += 1
      if (score >= MIN_SCORE) scored.push({ b, score })
    }
    scored.sort((x, y) => y.score - x.score || x.b.name.localeCompare(y.b.name))
    let added = 0
    for (const { b } of scored) {
      if (added >= 4) break
      if (have.has(`${a.id}>${b.id}`)) continue
      try {
        await dbp.relation.create({ data: { fromId: a.id, toId: b.id, type: 'related' } })
        have.add(`${a.id}>${b.id}`)
        have.add(`${b.id}>${a.id}`)
        added++
        edges++
      } catch {}
    }
    if (added > 0) linked++
  }
  console.log(`linked ${linked}/${orphans.length} orphans, created ${edges} edges`)
  process.exit(0)
}

main().catch((e) => {
  console.error('link-orphans failed:', e)
  process.exit(1)
})
