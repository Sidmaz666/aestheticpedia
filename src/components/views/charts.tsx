// Server-rendered SVG charts (no client JS). Colours come from the design tokens.
import Link from 'next/link'
import { hierarchy, treemap, treemapSquarify } from 'd3-hierarchy'
import { categoryColor } from '@/lib/category-colors'

type Row = { name: string; count: number }

export function CategoryTreemap({ rows }: { rows: Row[] }) {
  const W = 1200
  const H = 520
  const root = hierarchy<{ name: string; count?: number; children?: Row[] }>({ name: 'root', children: rows })
    .sum((d) => d.count ?? 0)
    .sort((a, b) => (b.value ?? 0) - (a.value ?? 0))
  treemap<{ name: string; count?: number; children?: Row[] }>().size([W, H]).paddingInner(3).tile(treemapSquarify.ratio(1.4))(root)
  const leaves = root.leaves() as unknown as { x0: number; x1: number; y0: number; y1: number; data: Row }[]
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Records per category (treemap)">
      {leaves.map((l) => {
        const w = l.x1 - l.x0
        const h = l.y1 - l.y0
        return (
          <Link key={l.data.name} href={`/aesthetics?category=${encodeURIComponent(l.data.name)}`}>
            <g className="group">
              <rect x={l.x0} y={l.y0} width={w} height={h} rx={6} fill={categoryColor(l.data.name)} opacity={0.85} className="transition-opacity group-hover:opacity-100" />
              {w > 90 && h > 34 && (
                <>
                  <text x={l.x0 + 10} y={l.y0 + 20} className="fill-[#111] text-[13px] font-medium">
                    {l.data.name.length * 7 > w - 16 ? `${l.data.name.slice(0, Math.floor((w - 16) / 7))}…` : l.data.name}
                  </text>
                  <text x={l.x0 + 10} y={l.y0 + 38} className="fill-[#111]/70 font-mono text-[11px]">
                    {l.data.count.toLocaleString('en')}
                  </text>
                </>
              )}
              <title>{`${l.data.name}: ${l.data.count}`}</title>
            </g>
          </Link>
        )
      })}
    </svg>
  )
}

const centuryLabel = (c: number) => (c < 0 ? `${-c / 100 + 1}th c. BCE`.replace(/^1th/, '1st').replace(/^2th/, '2nd').replace(/^3th/, '3rd') : `${c}s`)

export function CenturyHistogram({ rows }: { rows: { century: number; count: number }[] }) {
  if (!rows.length) return null
  const W = 1200
  const H = 240
  const max = Math.max(...rows.map((r) => r.count))
  const bw = W / rows.length
  return (
    <svg viewBox={`0 0 ${W} ${H + 40}`} className="h-auto w-full" role="img" aria-label="Aesthetics by century of emergence">
      {rows.map((r, i) => {
        const h = Math.max(2, (r.count / max) * H)
        return (
          <g key={r.century}>
            <rect x={i * bw + 2} y={H - h} width={bw - 4} height={h} rx={3} fill="var(--accent)" opacity={0.35 + 0.65 * (r.count / max)}>
              <title>{`${centuryLabel(r.century)}: ${r.count}`}</title>
            </rect>
            {(i % Math.ceil(rows.length / 12) === 0 || i === rows.length - 1) && (
              <text x={i * bw + bw / 2} y={H + 22} textAnchor="middle" className="fill-fg-subtle font-mono text-[11px]">
                {r.century < 0 ? `${-r.century}BCE` : r.century}
              </text>
            )}
          </g>
        )
      })}
      <line x1={0} x2={W} y1={H} y2={H} stroke="var(--line-strong)" />
    </svg>
  )
}

export function Donut({ rows, label }: { rows: Row[]; label: string }) {
  const total = rows.reduce((s, r) => s + r.count, 0) || 1
  const R = 90
  const C = 2 * Math.PI * R
  const lens = rows.map((r) => (r.count / total) * C)
  const offsets = lens.map((_, i) => lens.slice(0, i).reduce((a, b) => a + b, 0))
  const palette = ['var(--accent)', 'oklch(0.75 0.12 160)', 'oklch(0.72 0.12 250)', 'oklch(0.72 0.14 25)', 'oklch(0.8 0.1 90)', 'oklch(0.7 0.12 310)', 'oklch(0.7 0.05 80)', 'var(--fg-subtle)']
  return (
    <figure className="flex flex-wrap items-center gap-6">
      <svg viewBox="0 0 220 220" className="size-44 shrink-0 -rotate-90" role="img" aria-label={label}>
        {rows.map((r, i) => (
          <circle key={r.name} cx={110} cy={110} r={R} fill="none" stroke={palette[i % palette.length]} strokeWidth={28} strokeDasharray={`${lens[i]} ${C - lens[i]}`} strokeDashoffset={-offsets[i]} />
        ))}
      </svg>
      <figcaption className="min-w-0 flex-1">
        <ul className="space-y-1.5 text-sm">
          {rows.map((r, i) => (
            <li key={r.name} className="flex items-center justify-between gap-3">
              <span className="flex min-w-0 items-center gap-2 text-fg-muted">
                <span className="size-2.5 shrink-0 rounded-full" style={{ background: palette[i % palette.length] }} />
                <span className="truncate">{r.name}</span>
              </span>
              <span className="font-mono text-xs text-fg-subtle">{Math.round((r.count / total) * 100)}%</span>
            </li>
          ))}
        </ul>
      </figcaption>
    </figure>
  )
}

export function BarList({ rows, href }: { rows: Row[]; href?: (name: string) => string }) {
  const max = Math.max(1, ...rows.map((r) => r.count))
  return (
    <ul className="space-y-2">
      {rows.map((r) => {
        const body = (
          <>
            <div className="flex justify-between gap-3 text-sm">
              <span className="truncate text-fg-muted">{r.name}</span>
              <span className="font-mono text-xs text-fg-subtle">{r.count.toLocaleString('en')}</span>
            </div>
            <div className="mt-1 h-1.5 rounded-full bg-surface-2">
              <div className="h-full rounded-full bg-accent" style={{ width: `${Math.max(1, (r.count / max) * 100)}%` }} />
            </div>
          </>
        )
        return <li key={r.name}>{href ? <Link href={href(r.name)} className="block hover:opacity-80">{body}</Link> : body}</li>
      })}
    </ul>
  )
}
