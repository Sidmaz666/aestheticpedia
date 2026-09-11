'use client'

import { useEffect, useMemo, useRef } from 'react'
import { motion } from 'framer-motion'
import { History } from 'lucide-react'
import { EmptyState, ErrorState } from '@/components/atlas/bits'
import { useTimeline } from '@/components/atlas/api'
import { Skeleton } from '@/components/ui/skeleton'
import { ESTABLISHMENT_LABELS, type TimelineItem } from '@/lib/aesthetic'

const BAND_COUNT = 14

function fmtYear(y: number): string {
  return y < 0 ? `${-y} BCE` : `${y}`
}

interface Band {
  start: number
  end: number
  items: TimelineItem[]
}

export function TimelineView({ onOpenDetail }: { onOpenDetail: (slug: string) => void }) {
  const { data, isPending, isError, error, refetch } = useTimeline()

  const bands = useMemo<Band[]>(() => {
    if (!data || data.min === null || data.max === null || data.items.length === 0) return []
    const min = data.min
    const max = data.max
    const span = Math.max(max - min + 1, BAND_COUNT)
    const raw = span / BAND_COUNT
    // Round band width to a human-friendly multiple of 5 (min 5 years).
    const width = Math.max(5, Math.ceil(raw / 5) * 5)
    const out: Band[] = []
    for (let start = min; start <= max; start += width) {
      out.push({ start, end: start + width - 1, items: [] })
    }
    for (const item of data.items) {
      let idx = Math.floor((item.startYear - min) / width)
      if (idx < 0) idx = 0
      if (idx >= out.length) idx = out.length - 1
      out[idx].items.push(item)
    }
    for (const b of out) b.items.sort((a, z) => a.startYear - z.startYear)
    return out
  }, [data])

  if (isError) {
    return (
      <section aria-label="Timeline" className="mx-auto w-full max-w-7xl px-4 py-10">
        <ErrorState message={error.message} onRetry={() => refetch()} />
      </section>
    )
  }

  if (isPending) {
    return (
      <section aria-label="Timeline" className="mx-auto w-full max-w-7xl px-4 py-10">
        <Skeleton className="h-9 w-64" />
        <div className="mt-8 flex gap-4 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="w-44 shrink-0 space-y-2 border-l border-stone-200 pl-3">
              <Skeleton className="h-5 w-24" />
              {Array.from({ length: 4 + (i % 3) }).map((_, j) => (
                <Skeleton key={j} className="h-6 w-full rounded" />
              ))}
            </div>
          ))}
        </div>
      </section>
    )
  }

  if (!data || data.items.length === 0) {
    return (
      <section aria-label="Timeline" className="mx-auto w-full max-w-7xl px-4 py-10">
        <EmptyState
          icon={<History className="h-8 w-8" />}
          title="No dated aesthetics yet."
          description="Entries appear here once the research pipeline assigns start years."
        />
      </section>
    )
  }

  return (
    <section aria-label="Timeline" className="mx-auto w-full max-w-7xl px-4 py-8 sm:py-10">
      <p className="text-xs font-medium uppercase tracking-[0.3em] text-[#8a6d3b]">Timeline</p>
      <h2 className="mt-2 font-serif text-3xl text-stone-900 sm:text-4xl">Aesthetics through time.</h2>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-stone-600">
        {data.items.length} dated entries from{' '}
        <span className="tabular-nums text-stone-900">{fmtYear(data.min)}</span> to{' '}
        <span className="tabular-nums text-stone-900">{fmtYear(data.max)}</span>, placed by start year.
        Scroll horizontally to move through the eras.
      </p>

      <TimelineScroller bands={bands} onOpenDetail={onOpenDetail} />
    </section>
  )
}

function TimelineScroller({
  bands,
  onOpenDetail,
}: {
  bands: Band[]
  onOpenDetail: (slug: string) => void
}) {
  const scrollRef = useRef<HTMLDivElement>(null)

  // Start the view where the entries actually cluster, not in empty antiquity.
  useEffect(() => {
    const el = scrollRef.current
    if (!el || bands.length === 0) return
    const total = bands.reduce((n, b) => n + b.items.length, 0)
    if (total === 0) return
    let acc = 0
    let target = 0
    for (let i = 0; i < bands.length; i++) {
      acc += bands[i].items.length
      if (acc >= total * 0.25) {
        target = i
        break
      }
    }
    const bandWidth = 208 // w-52 = 13rem
    el.scrollLeft = Math.max(0, target * bandWidth - el.clientWidth / 3)
  }, [bands])

  return (
    <div
      ref={scrollRef}
      className="scrollbar-thin mt-8 overflow-x-auto pb-4"
      role="list"
      aria-label="Era bands"
    >
        <div className="flex min-w-max gap-0">
          {bands.map((band, bi) => (
            <motion.div
              key={band.start}
              role="listitem"
              aria-label={`${fmtYear(band.start)}–${fmtYear(band.end)}: ${band.items.length} entries`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: Math.min(bi * 0.04, 0.4) }}
              className="w-44 shrink-0 border-l border-stone-300 pl-3 pr-3 sm:w-52"
            >
              <div className="flex items-baseline justify-between">
                <h3 className="font-serif text-sm text-stone-900 tabular-nums">
                  {fmtYear(band.start)}–{fmtYear(band.end)}
                </h3>
                <span className="text-[11px] tabular-nums text-stone-400">
                  {band.items.length}
                </span>
              </div>
              <div className="scrollbar-thin mt-2 max-h-[60vh] space-y-1.5 overflow-y-auto pr-1">
                {band.items.length === 0 ? (
                  <p className="py-2 text-xs italic text-stone-300">—</p>
                ) : (
                  band.items.map((item) => (
                    <button
                      key={item.slug}
                      type="button"
                      onClick={() => onOpenDetail(item.slug)}
                      className="group flex w-full items-center gap-2 rounded px-1.5 py-1.5 text-left transition-colors hover:bg-[#f5efe1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b08d57]"
                      aria-label={`${item.name}, ${item.startYear}, ${item.category} — open details`}
                    >
                      <span className="flex shrink-0 -space-x-1" aria-hidden="true">
                        {(item.colors.length > 0 ? item.colors.slice(0, 3) : [null, null, null]).map(
                          (c, ci) => (
                            <span
                              key={ci}
                              className="inline-block h-3 w-3 rounded-full border border-white shadow-sm"
                              style={{ backgroundColor: c ? c.hex : '#d6d3d1' }}
                            />
                          )
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-medium text-stone-700 group-hover:text-[#6f5527]">
                          {item.name}
                        </span>
                        <span className="block truncate text-[10px] text-stone-400">
                          {item.startYear}
                          {item.periodLabel ? ` · ${item.periodLabel}` : ''}
                          {' · '}
                          {ESTABLISHMENT_LABELS[item.establishment] ?? item.establishment}
                        </span>
                      </span>
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          ))}
        </div>
    </div>
  )
}
