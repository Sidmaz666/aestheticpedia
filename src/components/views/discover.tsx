'use client'

import { useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Loader2, RotateCcw } from 'lucide-react'
import { AestheticCard } from '@/components/aesthetic/card'
import { DNA_AXES, EMOTION_KEYS, type AestheticSummary, type ExploreResult } from '@/lib/aesthetic'
import { useDiscover } from '@/lib/client'

const PRESETS: { label: string; values: Record<string, number> }[] = [
  { label: 'Quiet & austere', values: { minimal_maximal: 10, quiet_loud: 10, warm_cold: 55, refined_raw: 30, dense_spacious: 85 } },
  { label: 'Warm & handmade', values: { warm_cold: 15, organic_geometric: 20, natural_synthetic: 15, refined_raw: 65, nostalgic_progressive: 25 } },
  { label: 'Loud & futuristic', values: { quiet_loud: 90, historical_futuristic: 90, analog_digital: 85, minimal_maximal: 75 } },
  { label: 'Ornate & opulent', values: { minimal_maximal: 95, refined_raw: 10, elegant_utilitarian: 10, dense_spacious: 15 } },
  { label: 'Dreamy & surreal', values: { realistic_surreal: 90, soft_harsh: 15, playful_serious: 35, orderly_chaotic: 60 } },
  { label: 'Cozy & nostalgic', values: { nostalgic_progressive: 10, warm_cold: 15, soft_harsh: 15, playful_serious: 40 } },
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

export function DiscoverView() {
  const sp = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const [values, setValues] = useState<Record<string, number>>(() => parse(sp.get('dims')))
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
  const touched = Object.keys(values).length

  const results: AestheticSummary[] = useMemo(
    () =>
      (data?.items ?? []).map((r: ExploreResult) => ({
        slug: r.slug,
        name: r.name,
        category: r.category,
        summary: r.summary,
        colors: r.colors,
        image: r.image,
        imageCount: 0,
        subcategory: '',
        establishment: '',
        status: '',
        era: '',
        origin: '',
        geography: '',
        periodStart: '',
        periodEnd: '',
        startYear: null,
        endYear: null,
        tags: [],
        popularity: 0,
        isNiche: false,
        dataQuality: '',
      })),
    [data]
  )
  const distance = new Map((data?.items ?? []).map((r) => [r.slug, r.distance]))

  return (
    <main className="mx-auto grid w-full max-w-[1600px] gap-10 px-4 pb-16 pt-10 sm:px-6 lg:grid-cols-[24rem_1fr] lg:px-10">
      <aside className="lg:sticky lg:top-20 lg:max-h-[calc(100svh-6rem)] lg:self-start lg:overflow-y-auto lg:no-scrollbar">
        <p className="eyebrow">Style profile search</p>
        <h1 className="display mt-2 text-6xl">Discover</h1>
        <p className="mt-3 text-sm text-fg-muted">Set the qualities you’re after. Only the sliders you move count; results update as you go.</p>

        <div className="mt-6 flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => setValues(p.values)}
              className="rounded-full border border-line-strong px-3 py-1.5 text-xs text-fg-muted transition-colors hover:border-fg-subtle hover:text-fg"
            >
              {p.label}
            </button>
          ))}
          {touched > 0 && (
            <button type="button" onClick={() => setValues({})} className="flex items-center gap-1 rounded-full px-3 py-1.5 text-xs text-fg-subtle hover:text-fg">
              <RotateCcw className="size-3" aria-hidden /> Reset
            </button>
          )}
        </div>

        <div className="mt-8 space-y-5">
          {DNA_AXES.map((a) => (
            <Range key={a.key} id={a.key} left={a.left} right={a.right} value={values[a.key]} onChange={(v) => setValues((s) => ({ ...s, [a.key]: v }))} onClear={() => setValues(({ [a.key]: _, ...rest }) => rest)} />
          ))}
          <p className="eyebrow pt-4">Mood</p>
          {EMOTION_KEYS.map((k) => (
            <Range key={k} id={k} left="" right={k} value={values[k]} onChange={(v) => setValues((s) => ({ ...s, [k]: v }))} onClear={() => setValues(({ [k]: _, ...rest }) => rest)} />
          ))}
        </div>
      </aside>

      <section aria-live="polite" aria-busy={isFetching}>
        <div className="flex h-8 items-center gap-2 text-sm text-fg-subtle">
          {touched === 0 ? 'Move a slider or pick a preset to begin.' : isError ? 'Something went wrong.' : `${results.length} closest matches`}
          {isFetching && <Loader2 className="size-3.5 animate-spin" aria-hidden />}
        </div>
        <div className={`mt-4 grid grid-cols-2 gap-3 transition-opacity sm:grid-cols-3 sm:gap-4 xl:grid-cols-4 ${isFetching ? 'opacity-70' : ''}`}>
          {results.map((r) => (
            <div key={r.slug} className="relative">
              <AestheticCard a={r} />
              <span className="pointer-events-none absolute left-2.5 top-2.5 rounded-full bg-black/55 px-2 py-0.5 font-mono text-[10px] text-white backdrop-blur">
                {Math.max(0, 100 - Math.round(distance.get(r.slug) ?? 0))}% match
              </span>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}

function Range({ id, left, right, value, onChange, onClear }: { id: string; left: string; right: string; value?: number; onChange: (v: number) => void; onClear: () => void }) {
  const set = value !== undefined
  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <label htmlFor={`r-${id}`} className={`capitalize ${set ? 'text-fg' : 'text-fg-subtle'}`}>
          {left ? `${left} ↔ ${right}` : right}
        </label>
        {set ? (
          <button type="button" onClick={onClear} className="font-mono text-fg-subtle hover:text-fg" aria-label={`Clear ${right}`}>
            {Math.round(value)} ×
          </button>
        ) : (
          <span className="font-mono text-fg-subtle/60">—</span>
        )}
      </div>
      <input
        id={`r-${id}`}
        type="range"
        min={0}
        max={100}
        value={value ?? 50}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`mt-1.5 w-full cursor-pointer ${set ? 'accent-[var(--accent)]' : 'opacity-40 accent-[var(--fg-subtle)]'}`}
      />
    </div>
  )
}
