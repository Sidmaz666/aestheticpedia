// Layout for the Connections network, computed once on the server (at build / revalidation and
// cached in memory) so the browser runs no physics: it only draws. 2D uses d3-force; 3D uses
// d3-force-3d with a pull towards per-category anchors on a sphere (one cluster per category).
import { forceCenter, forceCollide, forceLink, forceManyBody, forceSimulation, forceX, forceY } from 'd3-force'
import * as f3 from 'd3-force-3d'

type In = { slug: string; category: string; degree: number }
type Link = { source: string; target: string }
export type Positions = Map<string, { x: number; y: number; X: number; Y: number; Z: number }>

const round = (v: number | undefined) => Math.round((v ?? 0) * 10) / 10

export function computeLayout(nodes: In[], links: Link[]): Positions {
  const ids = new Set(nodes.map((n) => n.slug))
  const valid = links.filter((l) => ids.has(l.source) && ids.has(l.target))

  // 2D — same forces the map used to run live in the browser.
  const n2 = nodes.map((n) => ({ slug: n.slug, degree: n.degree })) as ({ slug: string; degree: number } & { x?: number; y?: number })[]
  const radius = (n: { degree: number }) => 2.5 + Math.sqrt(n.degree) * 1.6
  forceSimulation(n2)
    .force('link', forceLink(valid.map((l) => ({ ...l }))).id((d: any) => d.slug).distance(34).strength(0.35))
    .force('charge', forceManyBody().strength(-42).distanceMax(420).theta(0.95))
    .force('collide', forceCollide((d: any) => radius(d) + 1.5))
    .force('x', forceX(0).strength(0.035))
    .force('y', forceY(0).strength(0.035))
    .force('center', forceCenter(0, 0))
    .stop()
    .tick(260)

  // 3D — clustered by category.
  const cats = [...new Set(nodes.map((n) => n.category))]
  const counts = new Map<string, number>()
  for (const n of nodes) counts.set(n.category, (counts.get(n.category) ?? 0) + 1)
  cats.sort((a, b) => (counts.get(b) ?? 0) - (counts.get(a) ?? 0))
  const anchors = new Map(
    cats.map((c, i) => {
      const k = cats.length
      const y = 1 - (2 * (i + 0.5)) / k
      const r = Math.sqrt(1 - y * y)
      const phi = i * Math.PI * (3 - Math.sqrt(5))
      const R = 520
      return [c, { x: Math.cos(phi) * r * R, y: y * R, z: Math.sin(phi) * r * R }]
    })
  )
  const n3 = nodes.map((n) => ({ slug: n.slug, category: n.category })) as ({ slug: string; category: string } & f3.Node3D)[]
  const cluster = (alpha: number) => {
    for (const n of n3) {
      const a = anchors.get(n.category)
      if (!a || n.x === undefined) continue
      n.vx! += (a.x - n.x) * 0.028 * alpha
      n.vy! += (a.y - n.y!) * 0.028 * alpha
      n.vz! += (a.z - n.z!) * 0.028 * alpha
    }
  }
  f3.forceSimulation(n3, 3)
    .force('link', f3.forceLink(valid.map((l) => ({ ...l }))).id((d: any) => d.slug).distance(26).strength(0.35))
    .force('charge', f3.forceManyBody().strength(-18).theta(0.95))
    .force('center', f3.forceCenter(0, 0, 0))
    .force('cluster', cluster)
    .stop()
    .tick(240)

  const out: Positions = new Map()
  n2.forEach((n, i) => {
    const m = n3[i]
    out.set(n.slug, { x: round(n.x), y: round(n.y), X: round(m.x), Y: round(m.y), Z: round(m.z) })
  })
  return out
}
