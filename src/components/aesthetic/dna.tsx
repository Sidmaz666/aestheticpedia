'use client'

import { DNA_AXES, EMOTION_KEYS, type DnaAxis } from '@/lib/aesthetic'

/** A labeled horizontal axis bar: left label ← value → right label. */
function AxisBar({ axis, value }: { axis: DnaAxis; value: number }) {
  return (
    <div
      className="grid grid-cols-[86px_minmax(0,1fr)_86px] items-center gap-3 sm:grid-cols-[110px_minmax(0,1fr)_110px]"
      title={`${axis.left} ↔ ${axis.right}: ${value}/100`}
    >
      <span className="text-right text-[11px] leading-tight text-fg-subtle sm:text-xs">
        {axis.left}
      </span>
      <div
        className="relative h-1.5 rounded-full bg-line"
        role="meter"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${axis.left} ↔ ${axis.right}`}
      >
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#c9ad7c] to-accent"
          style={{ width: `${Math.max(2, Math.min(100, value))}%` }}
        />
        <div
          className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-surface bg-accent shadow"
          style={{ left: `${Math.max(2, Math.min(100, value))}%` }}
        />
      </div>
      <span className="text-[11px] leading-tight text-fg-subtle sm:text-xs">{axis.right}</span>
    </div>
  )
}

export function DnaBars({ dnaAxes }: { dnaAxes: Record<string, number> }) {
  const present = DNA_AXES.filter((a) => typeof dnaAxes[a.key] === 'number')
  if (present.length === 0) return null
  return (
    <div className="space-y-3.5">
      {present.map((a) => (
        <AxisBar key={a.key} axis={a} value={dnaAxes[a.key]} />
      ))}
    </div>
  )
}

/** Compact SVG radar for the 10-key emotion profile. */
export function EmotionRadar({ profile }: { profile: Record<string, number> }) {
  const keys = EMOTION_KEYS.filter((k) => typeof profile[k] === 'number') as string[]
  if (keys.length < 3) return null

  const size = 250
  const cx = size / 2
  const cy = size / 2
  const r = 74
  const labelR = r + 20
  const angleFor = (i: number) => (Math.PI * 2 * i) / keys.length - Math.PI / 2

  const point = (i: number, ratio: number): [number, number] => [
    cx + Math.cos(angleFor(i)) * r * ratio,
    cy + Math.sin(angleFor(i)) * r * ratio,
  ]

  const ringPoints = (ratio: number) =>
    keys.map((_, i) => point(i, ratio).join(',')).join(' ')

  const valuePoints = keys
    .map((k, i) => point(i, Math.min(100, profile[k]) / 100).join(','))
    .join(' ')

  return (
    <svg
      width={size}
      height={size}
      viewBox={`-44 -10 ${size + 88} ${size + 20}`}
      role="img"
      aria-label={`Emotional profile radar: ${keys
        .map((k) => `${k} ${profile[k]}`)
        .join(', ')}`}
      className="mx-auto max-w-full"
    >
      {[0.25, 0.5, 0.75, 1].map((ratio) => (
        <polygon
          key={ratio}
          points={ringPoints(ratio)}
          fill="none"
          stroke="var(--line-strong)"
          strokeWidth={1}
        />
      ))}
      {keys.map((_, i) => {
        const [x, y] = point(i, 1)
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="var(--line)" strokeWidth={1} />
      })}
      <polygon points={valuePoints} fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth={1.5} />
      {keys.map((k, i) => {
        const [x, y] = point(i, 1)
        const [lx, ly] = [
          cx + Math.cos(angleFor(i)) * labelR,
          cy + Math.sin(angleFor(i)) * labelR,
        ]
        const cos = Math.cos(angleFor(i))
        const anchor = cos > 0.25 ? 'start' : cos < -0.25 ? 'end' : 'middle'
        return (
          <text
            key={k}
            x={lx}
            y={ly + 3}
            textAnchor={anchor}
            className="fill-fg-subtle text-[9px] capitalize"
            style={{ fontSize: 9 }}
          >
            {k}
          </text>
        )
      })}
      {keys.map((k, i) => {
        const [x, y] = point(i, Math.min(100, profile[k]) / 100)
        return <circle key={`dot-${k}`} cx={x} cy={y} r={2.5} fill="var(--accent)" />
      })}
    </svg>
  )
}

/** Numeric bar list complementing the radar (also serves as accessible fallback). */
export function EmotionBars({ profile }: { profile: Record<string, number> }) {
  const keys = EMOTION_KEYS.filter((k) => typeof profile[k] === 'number') as string[]
  if (keys.length === 0) return null
  return (
    <ul className="space-y-2.5">
      {keys.map((k) => (
        <li key={k} className="flex items-center gap-3">
          <span className="w-20 shrink-0 text-xs capitalize text-fg-muted">{k}</span>
          <div
            className="relative h-1.5 flex-1 rounded-full bg-line"
            role="meter"
            aria-valuenow={profile[k]}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={k}
          >
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-accent/80"
              style={{ width: `${Math.max(2, Math.min(100, profile[k]))}%` }}
            />
          </div>
          <span className="w-8 shrink-0 text-right text-[11px] tabular-nums text-fg-subtle">
            {Math.round(profile[k])}
          </span>
        </li>
      ))}
    </ul>
  )
}
