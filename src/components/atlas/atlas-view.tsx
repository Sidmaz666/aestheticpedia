'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { SearchX, SlidersHorizontal } from 'lucide-react'
import { AestheticCard } from '@/components/atlas/aesthetic-card'
import { CardSkeleton, EmptyState, ErrorState } from '@/components/atlas/bits'
import { FilterPanel } from '@/components/atlas/filter-panel'
import { useAesthetics } from '@/components/atlas/api'
import { Button } from '@/components/ui/button'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  filtersActive,
  filtersToQuery,
  type AtlasFilters,
} from '@/lib/aesthetic'

interface AtlasViewProps {
  filters: AtlasFilters
  onFiltersChange: (patch: Partial<AtlasFilters>) => void
  onClearFilters: () => void
  onOpenDetail: (slug: string) => void
}

export function AtlasView({ filters, onFiltersChange, onClearFilters, onOpenDetail }: AtlasViewProps) {
  const [sheetOpen, setSheetOpen] = useState(false)
  const queryString = filtersToQuery(filters)
  const { data, isPending, isError, error, isPlaceholderData, refetch } = useAesthetics(queryString)
  const facets = data?.facets

  const total = data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / (data?.pageSize ?? 24)))

  const goToPage = (p: number) => {
    onFiltersChange({ page: Math.min(Math.max(1, p), totalPages) })
    document.getElementById('atlas-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const active = filtersActive(filters)

  return (
    <section id="atlas-results" aria-label="Aesthetic archive" className="mx-auto w-full max-w-7xl px-4 py-8 sm:py-10">
      <div className="lg:grid lg:grid-cols-[270px_minmax(0,1fr)] lg:gap-10">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block" aria-label="Filters">
          <div className="sticky top-32">
            <h2 className="mb-4 font-serif text-lg text-stone-900">Refine the archive</h2>
            <FilterPanel filters={filters} onChange={onFiltersChange} onClear={onClearFilters} facets={facets} />
          </div>
        </aside>

        <div className="min-w-0">
          {/* Results header */}
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <h2 className="order-1 font-serif text-xl text-stone-900 sm:text-2xl">
              {isPending ? (
                'Consulting the archive…'
              ) : (
                <>
                  {total} aesthetic{total === 1 ? '' : 's'}
                  {filters.q.trim() ? (
                    <span className="text-stone-500"> matching “{filters.q.trim()}”</span>
                  ) : (
                    ''
                  )}
                </>
              )}
            </h2>

            <div className="order-3 ml-auto flex items-center gap-2 sm:order-2">
              {/* Mobile filters */}
              <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="gap-1.5 border-stone-300 lg:hidden" aria-label="Open filters">
                    <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
                    Filters
                    {active && (
                      <span
                        className="ml-0.5 inline-block h-2 w-2 rounded-full bg-[#8a6d3b]"
                        aria-label="Filters active"
                      />
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 overflow-y-auto scrollbar-thin sm:max-w-sm">
                  <SheetHeader className="p-0">
                    <SheetTitle className="font-serif text-xl">Refine the archive</SheetTitle>
                    <SheetDescription>Filter the collection by any dimension.</SheetDescription>
                  </SheetHeader>
                  <div className="px-4 pb-6">
                    <FilterPanel
                      filters={filters}
                      onChange={(patch) => {
                        onFiltersChange(patch)
                      }}
                      onClear={() => {
                        onClearFilters()
                      }}
                      facets={facets}
                    />
                  </div>
                </SheetContent>
              </Sheet>

              <label htmlFor="sort-select" className="sr-only">
                Sort results
              </label>
              <Select
                value={filters.sort}
                onValueChange={(v) => onFiltersChange({ sort: v as AtlasFilters['sort'], page: 1 })}
              >
                <SelectTrigger id="sort-select" className="h-10 w-[170px] border-stone-300 bg-white/80">
                  <SlidersHorizontal className="mr-1 h-3.5 w-3.5 text-stone-400" aria-hidden="true" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular">Most popular</SelectItem>
                  <SelectItem value="recent">Recently added</SelectItem>
                  <SelectItem value="name">Name A–Z</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {isError ? (
            <ErrorState message={error.message} onRetry={() => refetch()} />
          ) : isPending ? (
            <GridSkeleton />
          ) : data.items.length === 0 ? (
            <EmptyState
              icon={<SearchX className="h-8 w-8" />}
              title="No aesthetics match those dimensions yet."
              description="The research pipeline is continuously adding entries — try loosening the filters, or clear them to browse everything documented so far."
              action={
                <Button variant="outline" onClick={onClearFilters} className="mt-1 border-stone-300">
                  Clear all filters
                </Button>
              }
            />
          ) : (
            <>
              <motion.div
                aria-busy={isPlaceholderData}
                className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
                initial="hidden"
                animate="show"
                variants={{ hidden: {}, show: { transition: { staggerChildren: 0.03 } } }}
              >
                {data.items.map((item) => (
                  <motion.div
                    key={item.slug}
                    variants={{
                      hidden: { opacity: 0, y: 10 },
                      show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
                    }}
                    className="h-full"
                  >
                    <AestheticCard item={item} onOpen={onOpenDetail} />
                  </motion.div>
                ))}
              </motion.div>

              {totalPages > 1 && (
                <Pagination className="mt-10" aria-label="Archive pagination">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#atlas-results"
                        aria-disabled={filters.page <= 1}
                        className={filters.page <= 1 ? 'pointer-events-none opacity-40' : ''}
                        onClick={(e) => {
                          e.preventDefault()
                          goToPage(filters.page - 1)
                        }}
                      />
                    </PaginationItem>
                    <PageItems page={filters.page} totalPages={totalPages} goToPage={goToPage} />
                    <PaginationItem>
                      <PaginationNext
                        href="#atlas-results"
                        aria-disabled={filters.page >= totalPages}
                        className={filters.page >= totalPages ? 'pointer-events-none opacity-40' : ''}
                        onClick={(e) => {
                          e.preventDefault()
                          goToPage(filters.page + 1)
                        }}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  )
}

function PageItems({
  page,
  totalPages,
  goToPage,
}: {
  page: number
  totalPages: number
  goToPage: (p: number) => void
}) {
  // Compact window: first, last, and neighbors of current page.
  const pages = new Set<number>([1, totalPages, page - 1, page, page + 1])
  const list = [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b)
  const items: (number | '…')[] = []
  list.forEach((p, i) => {
    if (i > 0 && p - list[i - 1] > 1) items.push('…')
    items.push(p)
  })

  return (
    <>
      {items.map((p, i) =>
        p === '…' ? (
          <PaginationItem key={`gap-${i}`}>
            <PaginationEllipsis />
          </PaginationItem>
        ) : (
          <PaginationItem key={p}>
            <PaginationLink
              href="#atlas-results"
              isActive={p === page}
              onClick={(e) => {
                e.preventDefault()
                goToPage(p)
              }}
              aria-label={`Go to page ${p}`}
            >
              {p}
            </PaginationLink>
          </PaginationItem>
        )
      )}
    </>
  )
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4" aria-label="Loading results">
      {Array.from({ length: 12 }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  )
}
