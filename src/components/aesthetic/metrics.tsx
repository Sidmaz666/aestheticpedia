// Measured palette analysis bars (server component).
import Link from 'next/link'
import { METRIC_AXES, type PaletteMetrics } from '@/lib/palette-metrics'

export function MetricBars({ metrics }: { metrics: PaletteMetrics }) {
  return (
    <ul className="space-y-5">
      {METRIC_AXES.map((m) => {
        const v = metrics[m.key]
        return (
          <li key={m.key} title={m.describe}>
            <div className="flex items-center justify-between text-xs text-fg-subtle">
              <span>{m.left}</span>
              <span className="font-mono text-fg">{v}</span>
              <span>{m.right}</span>
            </div>
            <div className="relative mt-1.5 h-1.5 rounded-full bg-surface-2" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={v} aria-label={`${m.left} to ${m.right}`}>
              <div className="absolute inset-y-0 left-0 rounded-full bg-accent/70" style={{ width: `${Math.max(2, v)}%` }} />
              <div className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-bg bg-accent" style={{ left: `${Math.max(2, Math.min(98, v))}%` }} />
            </div>
            <p className="mt-1 text-[11px] text-fg-subtle/80">{m.describe}</p>
          </li>
        )
      })}
    </ul>
  )
}

export function MetricsSection({ metrics }: { metrics: PaletteMetrics }) {
  const dims = METRIC_AXES.map((m) => `${m.key}:${metrics[m.key]}`).join(',')
  return (
    <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
      <MetricBars metrics={metrics} />
      <div className="space-y-4 text-sm text-fg-muted">
        <p>
          These numbers are measured, not judged: each is computed from the hex values of this record’s palette, so anyone can
          reproduce them. They describe the colours, not the whole aesthetic.
        </p>
        <Link href={`/discover?dims=${dims}`} className="link-underline text-fg">
          Find aesthetics with a similar palette →
        </Link>
      </div>
    </div>
  )
}
