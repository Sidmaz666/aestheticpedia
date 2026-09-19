'use client'

import { ResultCardSkeleton } from '@/components/site/skeleton'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Loader2, Plus, RotateCcw, X } from 'lucide-react'
import type { ExploreResult } from '@/lib/aesthetic'
import { METRIC_AXES } from '@/lib/palette-metrics'
import { useDiscover } from '@/lib/client'

// Each axis drawn as the thing it measures, so the slider explains itself.
const TRACK: Record<string, string> = {
  warmth: 'linear-gradient(90deg,#3b82f6,#22d3ee,#a3a3a3,#f59e0b,#ef4444)',
  saturation: 'linear-gradient(90deg,#8a8a8a,#b08d8d,#e0569a,#ff1f8f)',
  lightness: 'linear-gradient(90deg,#0b0b0c,#4b4b50,#a8a8ad,#f5f5f5)',
  hueRange: 'linear-gradient(90deg,#c0392b,#c0392b 20%,#e67e22,#f1c40f,#2ecc71,#3498db,#9b59b6)',
}
// Contrast: from two close greys to black against white.
const TRACK_CONTRAST = 'linear-gradient(90deg,#9ca3af,#a1a1aa 30%,#52525b 60%,#000 80%,#fff)'

// Presets, each with a sample palette so the card shows what it means.
const PRESETS: { label: string; values: Record<string, number>; swatch: string[] }[] = [
  { label: 'Warm & earthy', values: { warmth: 85, saturation: 35, lightness: 45 }, swatch: ['#6b3f1d', '#a0522d', '#c68642', '#e2b07a', '#5c4033'] },
  { label: 'Cool & calm', values: { warmth: 15, saturation: 25, contrast: 20 }, swatch: ['#6b8fa3', '#9fb7c4', '#c9d6de', '#7d9a8f', '#e6ecef'] },
  { label: 'Bright & vivid', values: { saturation: 85, lightness: 60, hueRange: 80 }, swatch: ['#ff2d95', '#ffd400', '#00c2ff', '#7cff4f', '#ff6a00'] },
  { label: 'Dark & dramatic', values: { lightness: 20, contrast: 85 }, swatch: ['#0a0a0a', '#2b0f14', '#5a1020', '#c9a227', '#f0e6d2'] },
  { label: 'Pale & soft', values: { lightness: 85, contrast: 15, saturation: 30 }, swatch: ['#f7e1e6', '#e8e1f5', '#dff0ea', '#fbf1d9', '#eef2f7'] },
  { label: 'Monochrome', values: { hueRange: 5, saturation: 15 }, swatch: ['#111111', '#444444', '#777777', '#aaaaaa', '#e5e5e5'] },
]

const parse = (raw: string | null) => {
  const out: Record<string, number> = {}
  for (const part of (raw ?? '').split(',')) {
    const [k, v] = part.split(':')
    if (k && v !== undefined && !Number.isNaN(Number(v))) out[k] = Math.max(0, Math.min(100, Number(v)))
  }
  return out
}
const serialize = (v: Record<string, number>) =>
  Object.entries(v)
    .map(([k, n]) => `${k}:${Math.round(n)}`)
    .join(',')
const word = (key: string, v: number) => {
  const a = METRIC_AXES.find((m) => m.key === key)!
  if (v >= 65) return a.right.toLowerCase()
  if (v <= 35) return a.left.toLowerCase()
  return `balanced ${key === 'hueRange' ? 'hue range' : key}`
}

export function DiscoverView() {
  const sp = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  // Arriving without a query starts from a mood, so the page is never empty. The page is
  // prerendered, so the first render uses a fixed mood (server and client agree) and a random one
  // is picked right after hydration.
  const [values, setValues] = useState<Record<string, number>>(() => {
    const fromUrl = parse(sp.get('dims'))
    return Object.keys(fromUrl).length ? fromUrl : { ...PRESETS[0].values }
  })
  useEffect(() => {
    if (Object.keys(parse(sp.get('dims'))).length) return
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one random start after hydration
    setValues({ ...PRESETS[Math.floor(Math.random() * PRESETS.length)].values })
  }, [])
  const [debounced, setDebounced] = useState(serialize(values))

  useEffect(() => {
    const t = setTimeout(() => {
      const s = serialize(values)
      setDebounced(s)
      router.replace(s ? `${pathname}?dims=${s}` : pathname, { scroll: false })
    }, 220)
    return () => clearTimeout(t)
  }, [values, pathname, router])

  const { data, isFetching, isError } = useDiscover(debounced || null)
  const keys = Object.keys(values)
  const results: ExploreResult[] = data?.items ?? []
  const summary = useMemo(() => keys.map((k) => word(k, values[k])).join(', '), [keys, values])
  const activePreset = PRESETS.find((p) => serialize(p.values) === serialize(values))?.label

  return (
    <main className="mx-auto grid w-full max-w-[1600px] gap-10 px-4 pb-20 pt-10 sm:px-6 md:grid-cols-[18rem_minmax(0,1fr)] lg:grid-cols-[22rem_minmax(0,1fr)] lg:px-10">
      <aside className="md:sticky md:top-20 md:max-h-[calc(100svh-6rem)] md:self-start md:overflow-y-auto md:pr-2 no-scrollbar">
        <p className="eyebrow">Palette search</p>
        <h1 className="display mt-2 text-6xl">Discover</h1>
        <p className="mt-3 text-sm leading-relaxed text-fg-muted">
          Describe the colours you want and find the aesthetics whose real palettes match. Every record is measured from its documented colours;
          only the qualities you switch on count.
        </p>

        <p className="eyebrow mt-8">Start from a mood</p>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-2">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => setValues(p.values)}
              aria-pressed={activePreset === p.label}
              className={`overflow-hidden rounded-xl border text-left transition-colors ${activePreset === p.label ? 'border-accent ring-1 ring-accent' : 'border-line hover:border-line-strong'}`}
            >
              <span className="flex h-7">
                {p.swatch.map((c) => (
                  <span key={c} className="flex-1" style={{ background: c }} />
                ))}
              </span>
              <span className="block px-2.5 py-2 text-xs text-fg">{p.label}</span>
            </button>
          ))}
        </div>

        <div className="mt-8 flex items-center justify-between">
          <p className="eyebrow">Fine-tune</p>
          {keys.length > 0 && (
            <button type="button" onClick={() => setValues({})} className="flex items-center gap-1 text-xs text-fg-subtle hover:text-fg">
              <RotateCcw className="size-3" aria-hidden /> Reset
            </button>
          )}
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 md:grid-cols-1">
          {METRIC_AXES.map((a) => (
            <Axis
              key={a.key}
              id={a.key}
              left={a.left}
              right={a.right}
              describe={a.describe}
              value={values[a.key]}
              onChange={(v) => setValues((s) => ({ ...s, [a.key]: v }))}
              onToggle={() =>
                setValues((s) => {
                  if (a.key in s) {
                    const { [a.key]: _, ...rest } = s
                    return rest
                  }
                  return { ...s, [a.key]: 50 }
                })
              }
            />
          ))}
        </div>
        <p className="mt-6 text-xs text-fg-subtle">
          Prefer a single colour? Search by hue on the{' '}
          <Link href="/colors" className="underline underline-offset-2 hover:text-fg">
            colour wheel
          </Link>
          .
        </p>
      </aside>

      <section aria-live="polite" aria-busy={isFetching} className="min-w-0">
        {keys.length === 0 ? (
          <EmptyState onPick={setValues} />
        ) : (
          <>
            <div className="flex flex-wrap items-end justify-between gap-3 border-b border-line pb-4">
              <div>
                <p className="eyebrow">Looking for</p>
                <p className="display mt-1 text-3xl capitalize sm:text-4xl">{summary}</p>
              </div>
              <p className="flex items-center gap-2 text-sm text-fg-subtle">
                {isFetching && <Loader2 className="size-3.5 animate-spin" aria-hidden />}
                {isError ? 'Something went wrong.' : isFetching && !results.length ? 'Finding matches…' : `${results.length} closest matches`}
              </p>
            </div>
            <ul className={`mt-6 grid grid-cols-1 gap-4 transition-opacity sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 ${isFetching && results.length ? 'opacity-60' : ''}`}>
              {isFetching && !results.length
                ? Array.from({ length: 6 }, (_, i) => (
                    <li key={i}>
                      <ResultCardSkeleton i={i} />
                    </li>
                  ))
                : results.map((r, i) => (
                    <li key={r.slug}>
                      <ResultCard r={r} rank={i + 1} values={values} />
                    </li>
                  ))}
            </ul>
          </>
        )}
      </section>
    </main>
  )
}

function Axis({ id, left, right, describe, value, onChange, onToggle }: { id: string; left: string; right: string; describe: string; value?: number; onChange: (v: number) => void; onToggle: () => void }) {
  const on = value !== undefined
  return (
    <div className={`rounded-xl border p-3 transition-colors ${on ? 'border-line-strong bg-surface' : 'border-line'}`}>
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={`r-${id}`} className={`text-sm ${on ? 'text-fg' : 'text-fg-muted'}`} title={describe}>
          {left} <span className="text-fg-subtle">↔</span> {right}
        </label>
        <button
          type="button"
          onClick={onToggle}
          aria-pressed={on}
          aria-label={on ? `Stop using ${left}–${right}` : `Use ${left}–${right}`}
          className={`flex h-7 items-center gap-1 rounded-full px-2.5 text-xs transition-colors ${on ? 'bg-accent text-accent-fg' : 'border border-line-strong text-fg-muted hover:text-fg'}`}
        >
          {on ? (
            <>
              {Math.round(value)} <X className="size-3" aria-hidden />
            </>
          ) : (
            <>
              <Plus className="size-3" aria-hidden /> Use
            </>
          )}
        </button>
      </div>
      <input
        id={`r-${id}`}
        type="range"
        min={0}
        max={100}
        value={value ?? 50}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-valuetext={`${Math.round(value ?? 50)} — ${word(id, value ?? 50)}`}
        className={`discover-range mt-2.5 w-full ${on ? '' : 'opacity-35'}`}
        style={{ backgroundImage: id === 'contrast' ? TRACK_CONTRAST : TRACK[id] }}
      />
      <div className="mt-1 flex justify-between text-[10px] uppercase tracking-wider text-fg-subtle">
        <span>{left}</span>
        <span>{right}</span>
      </div>
    </div>
  )
}

function ResultCard({ r, rank, values }: { r: ExploreResult; rank: number; values: Record<string, number> }) {
  const match = Math.max(0, 100 - Math.round(r.distance))
  // The two requested qualities it fits best (delta = its measured value − the target).
  const why = Object.keys(values)
    .filter((k) => r.delta?.[k] !== undefined)
    .sort((a, b) => Math.abs(r.delta[a]) - Math.abs(r.delta[b]))
    .slice(0, 2)
    .map((k) => word(k, values[k] + r.delta[k]))
  return (
    <Link href={`/aesthetics/${r.slug}`} className="group block overflow-hidden rounded-[calc(1.25rem*var(--r-scale,1))] border border-line bg-surface transition-colors hover:border-line-strong">
      <div className="relative aspect-[16/10] overflow-hidden bg-surface-2">
        {r.image ? (
          <img src={r.image} alt="" loading="lazy" referrerPolicy="no-referrer" className="size-full object-cover transition-transform duration-700 group-hover:scale-105" />
        ) : (
          <div className="flex size-full">
            {r.colors.map((c, i) => (
              <span key={i} className="flex-1" style={{ background: c.hex }} />
            ))}
          </div>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-black/60 px-2.5 py-1 font-mono text-[11px] text-white backdrop-blur">
          #{rank} · {match}% match
        </span>
      </div>
      <div className="flex h-3">
        {r.colors.map((c, i) => (
          <span key={i} className="flex-1" style={{ background: c.hex }} title={`${c.name} ${c.hex}`} />
        ))}
      </div>
      <div className="p-4">
        <p className="display truncate text-2xl text-fg group-hover:text-accent">{r.name}</p>
        <p className="text-xs text-fg-subtle">{r.category}</p>
        {r.summary && <p className="mt-2 line-clamp-2 text-sm text-fg-muted">{r.summary}</p>}
        {why.length > 0 && <p className="mt-3 text-[11px] uppercase tracking-wider text-fg-subtle">Closest on: {why.join(' · ')}</p>}
      </div>
    </Link>
  )
}

function EmptyState({ onPick }: { onPick: (v: Record<string, number>) => void }) {
  return (
    <div className="grid h-full min-h-[60svh] place-items-center rounded-3xl border border-dashed border-line-strong p-8 text-center">
      <div className="max-w-lg">
        <div className="mx-auto flex h-3 w-48 overflow-hidden rounded-full">
          {['#3b82f6', '#22d3ee', '#a3a3a3', '#f59e0b', '#ef4444'].map((c) => (
            <span key={c} className="flex-1" style={{ background: c }} />
          ))}
        </div>
        <p className="display mt-6 text-4xl">What should it feel like?</p>
        <p className="mt-3 text-sm text-fg-muted">Pick a mood on the left, or switch on a quality — warmth, vividness, lightness, contrast, variety of hues — and set how much of it you want.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {PRESETS.slice(0, 4).map((p) => (
            <button key={p.label} type="button" onClick={() => onPick(p.values)} className="rounded-full border border-line-strong px-4 py-2 text-sm text-fg-muted hover:border-accent hover:text-fg">
              {p.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
