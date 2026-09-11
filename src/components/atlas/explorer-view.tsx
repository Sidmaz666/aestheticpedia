'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Eraser, Play, SlidersHorizontal, Wand2 } from 'lucide-react'
import { AestheticCard } from '@/components/atlas/aesthetic-card'
import { CardSkeleton, EmptyState, ErrorState } from '@/components/atlas/bits'
import { useExplore } from '@/components/atlas/api'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { DNA_AXES, labelize, type ExploreResult } from '@/lib/aesthetic'

interface Preset {
  label: string
  icon: string
  values: Record<string, number>
}

const PRESETS: Preset[] = [
  {
    label: 'dark & quiet',
    icon: '🌑',
    values: { quiet_loud: 15, warm_cold: 30, minimal_maximal: 25, soft_harsh: 30, peaceful: 70, ominous: 55 },
  },
  {
    label: 'warm & organic',
    icon: '🌿',
    values: { warm_cold: 85, organic_geometric: 20, natural_synthetic: 20, nostalgic_progressive: 30, peaceful: 65 },
  },
  {
    label: 'futuristic & loud',
    icon: '⚡',
    values: { quiet_loud: 85, historical_futuristic: 90, analog_digital: 85, minimal_maximal: 65, futuristic: 85 },
  },
  {
    label: 'cozy & nostalgic',
    icon: '🕯️',
    values: { nostalgic_progressive: 15, warm_cold: 80, nostalgic: 90, playful_serious: 35, peaceful: 70 },
  },
]

export function ExplorerView({ onOpenDetail }: { onOpenDetail: (slug: string) => void }) {
  // undefined = untouched (not included in the query)
  const [values, setValues] = useState<Record<string, number>>({})
  const [submittedDims, setSubmittedDims] = useState<string | null>(null)

  const touchedCount = Object.keys(values).length

  const dimsString = useMemo(
    () =>
      Object.entries(values)
        .map(([k, v]) => `${k}:${v}`)
        .join(','),
    [values]
  )

  const { data, isFetching, isError, error, refetch } = useExplore(submittedDims)

  const setValue = (key: string, v: number | undefined) => {
    setValues((prev) => {
      const next = { ...prev }
      if (v === undefined) delete next[key]
      else next[key] = v
      return next
    })
  }

  const applyPreset = (p: Preset) => {
    setValues({ ...p.values })
  }

  const clearAll = () => {
    setValues({})
    setSubmittedDims(null)
  }

  const search = () => {
    if (touchedCount === 0) return
    setSubmittedDims(dimsString)
  }

  return (
    <section aria-label="Explorer" className="mx-auto w-full max-w-7xl px-4 py-8 sm:py-10">
      <div className="lg:grid lg:grid-cols-[330px_minmax(0,1fr)] lg:gap-10">
        <div>
          <div className="lg:sticky lg:top-32">
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-[#8a6d3b]">Explorer</p>
            <h2 className="mt-2 font-serif text-3xl text-stone-900 sm:text-4xl">
              Find aesthetics by feel.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-stone-600">
              Set the dimensions that matter — the archive returns the closest documented matches.
              Only the sliders you move are used.
            </p>

            {/* Presets */}
            <div className="mt-5 flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => applyPreset(p)}
                  className="inline-flex min-h-[36px] items-center gap-1.5 rounded-full border border-stone-300 bg-white px-3 py-1.5 text-sm text-stone-700 shadow-sm transition-colors hover:border-[#b08d57] hover:bg-[#f7f0df] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b08d57]"
                >
                  <span aria-hidden="true">{p.icon}</span>
                  {p.label}
                </button>
              ))}
            </div>

            {/* Sliders */}
            <div className="scrollbar-thin mt-6 max-h-[52vh] space-y-4 overflow-y-auto rounded-lg border border-stone-200 bg-white p-4 pr-5 lg:max-h-[56vh]">
              {DNA_AXES.map((axis) => (
                <div key={axis.key}>
                  <div className="flex items-baseline justify-between gap-2">
                    <Label
                      htmlFor={`slider-${axis.key}`}
                      className="text-[11px] font-medium uppercase tracking-[0.14em] text-stone-500"
                    >
                      {labelize(axis.key)}
                    </Label>
                    {values[axis.key] !== undefined && (
                      <span className="text-[11px] tabular-nums text-[#8a6d3b]">
                        {values[axis.key]}
                      </span>
                    )}
                  </div>
                  <div className="mt-1 grid grid-cols-[56px_minmax(0,1fr)_56px] items-center gap-2">
                    <span className="text-right text-[10px] leading-tight text-stone-400">
                      {axis.left}
                    </span>
                    <Slider
                      id={`slider-${axis.key}`}
                      value={[values[axis.key] ?? 50]}
                      min={0}
                      max={100}
                      step={1}
                      onValueChange={([v]) => setValue(axis.key, v)}
                      aria-label={`${axis.left} to ${axis.right}`}
                      className="[&_[data-slot=slider-thumb]]:border-[#8a6d3b] [&_[data-slot=slider-range]]:bg-[#8a6d3b]"
                    />
                    <span className="text-[10px] leading-tight text-stone-400">{axis.right}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                onClick={search}
                disabled={touchedCount === 0 || isFetching}
                className="min-h-[44px] gap-2 bg-[#8a6d3b] text-[#fdfcf8] hover:bg-[#6f5527]"
              >
                <Play className="h-4 w-4" aria-hidden="true" />
                {isFetching ? 'Scoring…' : 'Search by dimensions'}
              </Button>
              <Button
                variant="outline"
                onClick={clearAll}
                disabled={touchedCount === 0 && !submittedDims}
                className="min-h-[44px] gap-1.5 border-stone-300"
              >
                <Eraser className="h-3.5 w-3.5" aria-hidden="true" />
                Reset
              </Button>
              <span className="ml-auto self-center text-xs text-stone-400">
                {touchedCount} dim{touchedCount === 1 ? '' : 's'} set
              </span>
            </div>
          </div>
        </div>

        <div className="mt-10 min-w-0 lg:mt-0">
          {isError ? (
            <ErrorState message={error.message} onRetry={() => refetch()} />
          ) : !submittedDims ? (
            <EmptyState
              icon={<Wand2 className="h-8 w-8" />}
              title="Move some sliders, then search."
              description="Every entry in the archive is scored across 15 DNA axes and an emotional profile. The Explorer finds the aesthetics whose measurements sit closest to your target."
            />
          ) : isFetching && !data ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : data && data.items.length === 0 ? (
            <EmptyState
              title="No close matches found."
              description="The archive has no entries near that combination yet — try moving sliders toward the middle."
            />
          ) : data ? (
            <>
              <div className="mb-4 flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-[#8a6d3b]" aria-hidden="true" />
                <p className="text-sm text-stone-600">
                  {data.items.length} closest matches · distance = average deviation from your
                  target (0–100)
                </p>
              </div>
              <motion.div
                className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-3"
                initial="hidden"
                animate="show"
                variants={{ hidden: {}, show: { transition: { staggerChildren: 0.04 } } }}
              >
                {data.items.map((r: ExploreResult) => (
                  <motion.div
                    key={r.slug}
                    variants={{
                      hidden: { opacity: 0, y: 10 },
                      show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
                    }}
                    className="h-full"
                  >
                    <AestheticCard item={r} onOpen={onOpenDetail} footer={<ExploreFooter result={r} />} />
                  </motion.div>
                ))}
              </motion.div>
            </>
          ) : null}
        </div>
      </div>
    </section>
  )
}

function ExploreFooter({ result }: { result: ExploreResult }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span
          className="inline-flex items-center rounded-full bg-[#f0e4c8] px-2 py-0.5 text-[11px] font-medium text-[#6f5527]"
          title="Average deviation from your target dimensions"
        >
          Δ {result.distance}
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5" aria-label="Strongest deviations">
        {Object.entries(result.delta).slice(0, 4).map(([dim, delta]) => (
          <span
            key={dim}
            className="rounded-full border border-stone-200 bg-stone-50 px-2 py-0.5 text-[10px] text-stone-600"
            title={`The archive's ${dim} is ${Math.abs(delta)} points ${delta > 0 ? 'above' : 'below'} your target`}
          >
            {labelize(dim)} {delta > 0 ? '+' : ''}
            {Math.round(delta)}
          </span>
        ))}
      </div>
    </div>
  )
}
