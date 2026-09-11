'use client'

import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Compass } from 'lucide-react'
import { Header } from '@/components/atlas/header'
import { Hero } from '@/components/atlas/hero'
import { AtlasView } from '@/components/atlas/atlas-view'
import { ExplorerView } from '@/components/atlas/explorer-view'
import { TimelineView } from '@/components/atlas/timeline-view'
import { LabView } from '@/components/atlas/lab-view'
import { DashboardView } from '@/components/atlas/dashboard-view'
import { DetailSheet } from '@/components/atlas/detail-sheet'
import type { ViewKind } from '@/components/atlas/view-kind'
import { DEFAULT_FILTERS, filtersActive, type AtlasFilters } from '@/lib/aesthetic'

export default function Home() {
  const [view, setView] = useState<ViewKind>('atlas')
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState<AtlasFilters>(DEFAULT_FILTERS)
  const [detailSlug, setDetailSlug] = useState<string | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const openDetail = useCallback((slug: string) => {
    setDetailSlug(slug)
    setDetailOpen(true)
  }, [])

  const handleViewChange = useCallback((v: ViewKind) => {
    setView(v)
    window.scrollTo({ top: 0 })
  }, [])

  const handleFiltersChange = useCallback((patch: Partial<AtlasFilters>) => {
    setFilters((prev) => ({ ...prev, ...patch }))
  }, [])

  const clearFilters = useCallback(() => {
    setFilters({ ...DEFAULT_FILTERS })
    setQuery('')
  }, [])

  // Header search drives the Atlas query + switches to the Atlas view.
  const handleQueryChange = useCallback((q: string) => {
    setQuery(q)
    setFilters((prev) => ({ ...prev, q, page: 1 }))
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDetailOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const heroVisible = view === 'atlas' && !filtersActive(filters)

  return (
    <div className="flex min-h-screen flex-col bg-[#faf8f4] text-stone-900">
      <Header
        view={view}
        onViewChange={handleViewChange}
        query={query}
        onQueryChange={handleQueryChange}
        onOpenDetail={openDetail}
      />

      <Hero visible={heroVisible} onOpenDetail={openDetail} onBrowse={() => {
        document.getElementById('atlas-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }} />

      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="flex flex-1 flex-col"
        >
          {view === 'atlas' && (
            <AtlasView
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onClearFilters={clearFilters}
              onOpenDetail={openDetail}
            />
          )}
          {view === 'explorer' && <ExplorerView onOpenDetail={openDetail} />}
          {view === 'timeline' && <TimelineView onOpenDetail={openDetail} />}
          {view === 'lab' && <LabView onOpenDetail={openDetail} />}
          {view === 'dashboard' && <DashboardView />}
        </motion.div>
      </AnimatePresence>

      <footer className="mt-auto border-t border-stone-200 bg-[#f5f1e8] pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Compass className="h-4 w-4 text-[#8a6d3b]" aria-hidden="true" />
            <p className="font-serif text-sm tracking-wide text-stone-700">
              Aesthetic Atlas — a living encyclopedia of human aesthetics.
            </p>
          </div>
          <p className="max-w-xl text-xs leading-relaxed text-stone-500">
            Entries blend established history, community documentation and AI-assisted research
            synthesis. Sources and quality tiers are shown per entry; interpretive fields are labeled.
            The research pipeline expands the collection continuously.
          </p>
        </div>
      </footer>

      <DetailSheet slug={detailSlug} open={detailOpen} onOpenChange={setDetailOpen} onNavigate={openDetail} />
    </div>
  )
}
