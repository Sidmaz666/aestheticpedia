// Server-rendered relationship diagrams for an aesthetic (pure SVG, no client JS).
import Link from 'next/link'
import { hierarchy, tree } from 'd3-hierarchy'
import type { AestheticDetailResponse, ColorEntry } from '@/lib/aesthetic'
import type { LineageNode } from '@/lib/queries'

const truncate = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1)}…` : s)

/** Ancestors fan out to the left, descendants to the right, the record sits in the middle. */
export function LineageTree({ name, ancestors, descendants }: { name: string; ancestors: LineageNode[]; descendants: LineageNode[] }) {
  if (!ancestors.length && !descendants.length) return null
  const rowH = 30
  const leaves = (ns: LineageNode[]): number => ns.reduce((s, n) => s + Math.max(1, leaves(n.children)), 0)
  const rows = Math.max(3, leaves(ancestors), leaves(descendants))
  const H = rows * rowH + 20
  const W = 1100
  const colW = 210
  const cx = W / 2

  const layout = (nodes: LineageNode[], dir: 1 | -1) => {
    const root = hierarchy<LineageNode>({ slug: '', name, image: null, children: nodes })
    tree<LineageNode>().size([H - 20, 1])(root)
    return root.descendants().map((d) => ({
      d,
      x: cx + dir * d.depth * colW,
      y: (d.x ?? 0) + 10,
    }))
  }
  const left = ancestors.length ? layout(ancestors, -1) : []
  const right = descendants.length ? layout(descendants, 1) : []
  const pos = (arr: ReturnType<typeof layout>) => new Map(arr.map((p) => [p.d, p]))

  const edges = (arr: ReturnType<typeof layout>) => {
    const m = pos(arr)
    return arr
      .filter((p) => p.d.parent)
      .map((p) => {
        const q = m.get(p.d.parent!)!
        const qx = p.d.parent!.depth === 0 ? cx : q.x
        const qy = p.d.parent!.depth === 0 ? H / 2 : q.y
        const mx = (qx + p.x) / 2
        return <path key={`${p.d.data.slug}-${p.d.depth}`} d={`M${qx},${qy} C${mx},${qy} ${mx},${p.y} ${p.x},${p.y}`} fill="none" stroke="var(--line-strong)" strokeWidth={1.2} />
      })
  }
  const labels = (arr: ReturnType<typeof layout>, dir: 1 | -1) =>
    arr
      .filter((p) => p.d.depth > 0)
      .map((p) => (
        <Link key={`${p.d.data.slug}-${p.d.depth}-l`} href={`/aesthetics/${p.d.data.slug}`}>
          <g className="group">
            <circle cx={p.x} cy={p.y} r={5} fill={p.d.depth === 1 ? 'var(--accent)' : 'var(--fg-subtle)'} />
            <text
              x={p.x + dir * 10}
              y={p.y}
              dy="0.35em"
              textAnchor={dir === 1 ? 'start' : 'end'}
              className="fill-fg-muted text-[12px] group-hover:fill-[var(--accent)]"
            >
              {truncate(p.d.data.name, 26)}
            </text>
          </g>
        </Link>
      ))

  return (
    <figure>
      <div className="no-scrollbar overflow-x-auto">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto min-w-[760px] w-full" role="img" aria-label={`Lineage of ${name}`}>
          {edges(left)}
          {edges(right)}
          {labels(left, -1)}
          {labels(right, 1)}
          <rect x={cx - 90} y={H / 2 - 17} width={180} height={34} rx={17} fill="var(--fg)" />
          <text x={cx} y={H / 2} dy="0.35em" textAnchor="middle" className="fill-[var(--bg)] text-[13px] font-medium">
            {truncate(name, 24)}
          </text>
          {left.length > 0 && (
            <text x={cx - colW} y={12} textAnchor="middle" className="fill-fg-subtle font-mono text-[10px] uppercase tracking-widest">
              Roots
            </text>
          )}
          {right.length > 0 && (
            <text x={cx + colW} y={12} textAnchor="middle" className="fill-fg-subtle font-mono text-[10px] uppercase tracking-widest">
              Legacy
            </text>
          )}
        </svg>
      </div>
      <figcaption className="mt-2 text-xs text-fg-subtle">
        Roots: what it grew from (influenced by, variant of, parent). Legacy: what grew from it. Two generations each way, from
        documented relations.
      </figcaption>
    </figure>
  )
}

const TYPE_COLOR: Record<string, string> = {
  influenced_by: 'var(--accent)',
  influenced: 'var(--accent)',
  variant_of: 'oklch(0.75 0.12 160)',
  parent: 'oklch(0.75 0.12 160)',
  sibling: 'oklch(0.75 0.1 250)',
  related: 'var(--fg-subtle)',
  reacts_against: 'oklch(0.7 0.16 25)',
  opposite: 'oklch(0.7 0.16 25)',
  confused_with: 'oklch(0.78 0.12 90)',
  hybrid_of: 'oklch(0.72 0.13 310)',
}
const TYPE_LABEL: Record<string, string> = {
  influenced_by: 'Influence',
  variant_of: 'Variant / parent',
  sibling: 'Sibling',
  related: 'Related',
  reacts_against: 'Reaction / opposite',
  confused_with: 'Often confused',
  hybrid_of: 'Hybrid',
}

/** Radial map: the record in the centre, direct neighbours on a ring, chords where neighbours link to each other. */
export function ConnectionMap({
  detail,
  among,
}: {
  detail: AestheticDetailResponse
  among: { from: string; to: string; type: string }[]
}) {
  const a = detail.aesthetic
  const seen = new Map<string, { slug: string; name: string; image?: string | null; colors?: ColorEntry[]; type: string }>()
  for (const r of detail.relations.outgoing) if (!seen.has(r.target.slug)) seen.set(r.target.slug, { ...r.target, type: r.type })
  for (const r of detail.relations.incoming) if (!seen.has(r.source.slug)) seen.set(r.source.slug, { ...r.source, type: r.type })
  const nodes = [...seen.values()].slice(0, 28)
  if (nodes.length < 2) return null
  const S = 560
  // Horizontal room for labels on the left and right of the ring.
  const PAD = 110
  const c = S / 2
  const R = 200
  const at = new Map(
    nodes.map((n, i) => {
      const ang = (i / nodes.length) * Math.PI * 2 - Math.PI / 2
      return [n.slug, { x: c + Math.cos(ang) * R, y: c + Math.sin(ang) * R, ang }]
    })
  )
  const types = [...new Set(nodes.map((n) => n.type))]
  return (
    <figure className="grid items-center gap-6 lg:grid-cols-[minmax(0,760px)_1fr]">
      <svg viewBox={`${-PAD} 0 ${S + PAD * 2} ${S}`} className="mx-auto h-auto w-full max-w-[760px]" role="img" aria-label={`Connections of ${a.name}`}>
        <defs>
          <clipPath id="ego-clip">
            <circle r={16} />
          </clipPath>
        </defs>
        <circle cx={c} cy={c} r={R} fill="none" stroke="var(--line)" strokeDasharray="2 5" />
        {among.map((l, i) => {
          const p = at.get(l.from)
          const q = at.get(l.to)
          if (!p || !q) return null
          return <path key={i} d={`M${p.x},${p.y} Q${c},${c} ${q.x},${q.y}`} fill="none" stroke="var(--line-strong)" strokeWidth={1} opacity={0.7} />
        })}
        {nodes.map((n) => {
          const p = at.get(n.slug)!
          return <line key={`s-${n.slug}`} x1={c} y1={c} x2={p.x} y2={p.y} stroke={TYPE_COLOR[n.type] ?? 'var(--fg-subtle)'} strokeWidth={1.6} opacity={0.8} />
        })}
        {nodes.map((n) => {
          const p = at.get(n.slug)!
          const right = Math.cos(p.ang) >= 0
          return (
            <Link key={n.slug} href={`/aesthetics/${n.slug}`}>
              <g className="group">
                <g transform={`translate(${p.x},${p.y})`}>
                  <circle r={17.5} fill="var(--surface-2)" stroke={TYPE_COLOR[n.type] ?? 'var(--fg-subtle)'} strokeWidth={1.5} />
                  {n.image ? (
                    <image href={n.image} x={-16} y={-16} width={32} height={32} clipPath="url(#ego-clip)" preserveAspectRatio="xMidYMid slice" />
                  ) : (
                    <PaletteDisc colors={n.colors} name={n.name} />
                  )}
                </g>
                <text
                  x={p.x + (right ? 24 : -24)}
                  y={p.y}
                  dy="0.35em"
                  textAnchor={right ? 'start' : 'end'}
                  className="fill-fg-muted text-[11px] group-hover:fill-[var(--accent)]"
                >
                  {truncate(n.name, 22)}
                </text>
              </g>
            </Link>
          )
        })}
        <circle cx={c} cy={c} r={44} fill="var(--fg)" />
        <text x={c} y={c} dy="0.35em" textAnchor="middle" className="fill-[var(--bg)] text-[12px] font-medium">
          {truncate(a.name, 14)}
        </text>
      </svg>
      <figcaption>
        <ul className="space-y-2 text-sm">
          {types.map((t) => (
            <li key={t} className="flex items-center gap-2.5 text-fg-muted">
              <span className="h-0.5 w-6 rounded" style={{ background: TYPE_COLOR[t] ?? 'var(--fg-subtle)' }} />
              {TYPE_LABEL[t] ?? t.replace(/_/g, ' ')}
            </li>
          ))}
          {among.length > 0 && (
            <li className="flex items-center gap-2.5 text-fg-subtle">
              <span className="h-0.5 w-6 rounded bg-line-strong" /> Links between neighbours ({among.length})
            </li>
          )}
        </ul>
        <p className="mt-4 text-xs text-fg-subtle">
          {nodes.length} directly connected aesthetics{seen.size > nodes.length ? ` (showing ${nodes.length} of ${seen.size})` : ''}. See the whole
          network on <Link href="/connections" className="link-underline">Connections</Link>.
        </p>
      </figcaption>
    </figure>
  )
}

/** A record without an image, drawn in the connection map as a disc of its palette (or initials). */
function PaletteDisc({ colors, name }: { colors?: ColorEntry[]; name: string }) {
  if (!colors?.length)
    return (
      <text textAnchor="middle" dy="0.35em" className="fill-fg-subtle font-mono text-[10px]">
        {name.split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase()}
        <title>No image or palette documented yet</title>
      </text>
    )
  const w = 32 / colors.length
  return (
    <g clipPath="url(#ego-clip)">
      <title>{`No image yet — palette: ${colors.map((c) => c.name || c.hex).join(', ')}`}</title>
      {colors.map((c, i) => (
        <rect key={i} x={-16 + i * w} y={-16} width={w + 0.5} height={32} fill={c.hex} />
      ))}
    </g>
  )
}
