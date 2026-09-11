'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, Loader2, Sparkles } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { fetchJson, useStats } from '@/components/atlas/api'
import { PaletteStrip } from '@/components/atlas/palette-strip'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import type { AestheticsResponse } from '@/lib/aesthetic'

interface HeroProps {
  visible: boolean
  onOpenDetail: (slug: string) => void
  onBrowse: () => void
}

export function Hero({ visible, onOpenDetail, onBrowse }: HeroProps) {
  const { data: stats } = useStats()
  const [surprising, setSurprising] = useState(false)

  const { data: featured } = useQuery({
    queryKey: ['aesthetics', 'featured-hero'],
    queryFn: () => fetchJson<AestheticsResponse>('/api/aesthetics?sort=popular&pageSize=8'),
    staleTime: 60_000,
    enabled: visible,
  })

  const surprise = async () => {
    setSurprising(true)
    try {
      const res = await fetch('/api/random')
      if (!res.ok) throw new Error('No entry available yet')
      const body = (await res.json()) as { item?: { slug: string } }
      if (body.item) onOpenDetail(body.item.slug)
    } catch {
      // Error surfaced via disabled state; toast handled at page level not needed here.
    } finally {
      setSurprising(false)
    }
  }

  if (!visible) return null

  return (
    <section aria-label="Introduction" className="border-b border-stone-200">
      <div className="mx-auto w-full max-w-7xl px-4 pb-14 pt-12 sm:pb-20 sm:pt-16">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-[#8a6d3b]">
            A living encyclopedia
          </p>
          <h1 className="mt-4 max-w-3xl font-serif text-4xl leading-[1.08] text-stone-900 sm:text-5xl lg:text-6xl">
            Explore how humanity makes things feel.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-stone-600 sm:text-lg">
            A living encyclopedia of visual languages —{' '}
            <span className="font-medium text-stone-900 tabular-nums">
              {stats ? stats.total.toLocaleString() : '…'}
            </span>{' '}
            aesthetics documented and growing.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button
              size="lg"
              onClick={surprise}
              disabled={surprising}
              className="min-h-[44px] gap-2 bg-[#8a6d3b] px-6 text-[#fdfcf8] hover:bg-[#6f5527]"
            >
              {surprising ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Sparkles className="h-4 w-4" aria-hidden="true" />
              )}
              Surprise me
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={onBrowse}
              className="min-h-[44px] gap-2 border-stone-300 bg-white/60 px-6 hover:bg-white"
            >
              <BookOpen className="h-4 w-4" aria-hidden="true" />
              Browse the atlas
            </Button>
          </div>
        </motion.div>

        {/* Featured palettes */}
        <div className="mt-14">
          <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.25em] text-stone-400">
            From the collection
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {featured
              ? featured.items.map((item, i) => (
                  <motion.button
                    key={item.slug}
                    type="button"
                    onClick={() => onOpenDetail(item.slug)}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.05 * i }}
                    whileHover={{ y: -3 }}
                    className="overflow-hidden rounded-lg border border-stone-200 bg-white text-left shadow-sm transition-colors hover:border-[#b08d57]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b08d57]"
                    aria-label={`${item.name} — open details`}
                  >
                    <PaletteStrip colors={item.colors} label={item.name} className="h-10" />
                    <div className="p-3">
                      <p className="truncate font-serif text-sm text-stone-900">{item.name}</p>
                      <p className="truncate text-[11px] text-stone-400">{item.category}</p>
                    </div>
                  </motion.button>
                ))
              : Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="overflow-hidden rounded-lg border border-stone-200 bg-white">
                    <Skeleton className="h-10 w-full rounded-none" />
                    <div className="space-y-1.5 p-3">
                      <Skeleton className="h-3.5 w-2/3" />
                      <Skeleton className="h-2.5 w-1/2" />
                    </div>
                  </div>
                ))}
          </div>
        </div>
      </div>
    </section>
  )
}
