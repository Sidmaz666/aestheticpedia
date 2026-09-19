'use client'

import { CardSkeleton, Loading } from '@/components/site/skeleton'
import { useEffect, useMemo, useState, useRef } from 'react'
import { useHorizontalWheel } from '@/lib/use-horizontal-wheel'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query'
import { Loader2, Search, SlidersHorizontal, X } from 'lucide-react'
import { AestheticCard } from '@/components/aesthetic/card'
import { ESTABLISHMENT_LABELS, STATUS_LABELS, type AestheticsResponse, type Facets } from '@/lib/aesthetic'
import { fetchJson } from '@/lib/client'
import { compact } from '@/lib/format'

const PAGE_SIZE = 36
const SORTS = [
  ['popular', 'Most notable'],
  ['name', 'A → Z'],
  ['oldest', 'Oldest first'],
  ['newest', 'Newest first'],
  ['recent', 'Recently added'],
] as const

export function BrowseView({ initialFacets }: { initialFacets: Facets }) {
  const router = useRouter()
  const pillsRef = useRef<HTMLElement>(null)
  useHorizontalWheel(pillsRef)
  const pathname = usePathname()
  const sp = useSearchParams()
  const [q, setQ] = useState(sp.get('q') ?? '')
  const [showFilters, setShowFilters] = useState(false)

  const params = useMemo(() => {
    const p = new URLSearchParams(sp.toString())
    p.delete('page')
    return p
  }, [sp])
  const key = params.toString()

  const set = (k: string, v: string | null) => {
    const p = new URLSearchParams(sp.toString())
    if (v === null || v === '') p.delete(k)
    else p.set(k, v)
    router.replace(`${pathname}${p.toString() ? `?${p}` : ''}`, { scroll: false })
  }

  // Debounced search → URL
  useEffect(() => {
    const t = setTimeout(() => {
      if ((sp.get('q') ?? '') !== q.trim()) set('q', q.trim() || null)
    }, 250)
    return () => clearTimeout(t)
  }, [q])

  const query = useInfiniteQuery({
    queryKey: ['browse', key],
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }) => {
      const p = new URLSearchParams(key)
      p.set('page', String(pageParam))
      p.set('pageSize', String(PAGE_SIZE))
      if (pageParam > 1) p.set('facets', 'false')
      return fetchJson<AestheticsResponse>(`/api/v1/aesthetics?${p}`, { signal })
    },
    getNextPageParam: (last) => (last.page * last.pageSize < last.total ? last.page + 1 : undefined),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  })

  const items = query.data?.pages.flatMap((p) => p.items) ?? []
  const total = query.data?.pages[0]?.total ?? 0
  const facets = query.data?.pages[0]?.facets?.categories.length ? query.data.pages[0].facets : initialFacets
  const category = sp.get('category') ?? ''
  const active = [
    ['category', category],
    ['type', sp.get('type') ?? ''],
    ['region', sp.get('region') ?? ''],
    ['status', sp.get('status') ?? ''],
    ['era', sp.get('era') ?? ''],
    ['tag', sp.get('tag') ?? ''],
    ['images', sp.get('images') === 'true' ? 'With images' : ''],
  ].filter(([, v]) => v) as [string, string][]

  const label = (k: string, v: string) =>
    k === 'type' ? ESTABLISHMENT_LABELS[v] ?? v : k === 'status' ? STATUS_LABELS[v] ?? v : k === 'tag' ? `#${v}` : v

  return (
    <main className="mx-auto w-full max-w-[1600px] px-4 pb-16 pt-10 sm:px-6 lg:px-10">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="eyebrow">Index</p>
          <h1 className="display mt-2 text-6xl sm:text-7xl">{category || 'All aesthetics'}</h1>
          <p className="mt-3 text-sm text-fg-subtle" aria-live="polite">
            {query.isPending ? 'Loading…' : `${compact(total)} record${total === 1 ? '' : 's'}`}
            {query.isFetching && !query.isPending && <Loader2 className="ml-2 inline size-3.5 animate-spin" aria-hidden />}
          </p>
        </div>
        <div className="flex w-full items-center gap-2 sm:w-auto">
          <label className="relative flex-1 sm:w-80">
            <span className="sr-only">Filter by text</span>
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-fg-subtle" aria-hidden />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Name, place, material, tag…"
              className="h-11 w-full rounded-full border border-line-strong bg-surface pl-10 pr-4 text-sm placeholder:text-fg-subtle focus:border-fg-subtle focus:outline-none"
            />
          </label>
          <button
            type="button"
            onClick={() => setShowFilters((s) => !s)}
            aria-expanded={showFilters}
            className={`flex h-11 items-center gap-2 rounded-full border px-4 text-sm transition-colors ${showFilters ? 'border-fg bg-fg text-bg' : 'border-line-strong text-fg-muted hover:text-fg'}`}
          >
            <SlidersHorizontal className="size-4" aria-hidden /> Filters
          </button>
        </div>
      </div>

      {/* Category pills */}
      <nav ref={pillsRef} aria-label="Categories" className="no-scrollbar mask-fade-x -mx-4 mt-8 flex gap-2 overflow-x-auto px-4 sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10">
        <Pill active={!category} onClick={() => set('category', null)}>
          All
        </Pill>
        {facets.categories.map((c) => (
          <Pill key={c.name} active={category === c.name} onClick={() => set('category', category === c.name ? null : c.name)}>
            {c.name} <span className="ml-1 opacity-50">{c.count}</span>
          </Pill>
        ))}
      </nav>

      {showFilters && (
        <div className="mt-4 grid gap-3 rounded-2xl border border-line bg-surface p-4 sm:grid-cols-2 lg:grid-cols-5">
          <Select label="Type" value={sp.get('type') ?? ''} onChange={(v) => set('type', v)} options={facets.establishments.map((e) => [e.name, `${ESTABLISHMENT_LABELS[e.name] ?? e.name} (${e.count})`])} />
          <Select label="Region" value={sp.get('region') ?? ''} onChange={(v) => set('region', v)} options={facets.regions.map((e) => [e.name, `${e.name} (${e.count})`])} />
          <Select label="Status" value={sp.get('status') ?? ''} onChange={(v) => set('status', v)} options={facets.statuses.map((e) => [e.name, `${STATUS_LABELS[e.name] ?? e.name} (${e.count})`])} />
          <Select label="Sort" value={sp.get('sort') ?? 'popular'} onChange={(v) => set('sort', v === 'popular' ? null : v)} options={SORTS.map(([v, l]) => [v, l])} noAll />
          <label className="flex items-center gap-3 self-end rounded-xl border border-line px-3 py-2.5 text-sm text-fg-muted">
            <input type="checkbox" checked={sp.get('images') === 'true'} onChange={(e) => set('images', e.target.checked ? 'true' : null)} className="size-4 accent-[var(--accent)]" />
            Only records with images
          </label>
        </div>
      )}

      {active.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {active.map(([k, v]) => (
            <button key={k} type="button" onClick={() => set(k, null)} className="flex items-center gap-1.5 rounded-full bg-surface-2 px-3 py-1 text-xs text-fg-muted hover:text-fg">
              {label(k, v)} <X className="size-3" aria-hidden />
            </button>
          ))}
          <button type="button" onClick={() => router.replace(pathname, { scroll: false })} className="text-xs text-fg-subtle underline underline-offset-2 hover:text-fg">
            Clear all
          </button>
        </div>
      )}

      {query.isError ? (
        <p className="mt-16 text-center text-fg-muted">
          Couldn’t load results.{' '}
          <button type="button" className="underline" onClick={() => query.refetch()}>
            Try again
          </button>
        </p>
      ) : query.isPending ? (
        <Loading label="Loading aesthetics…">
          <Grid>
            {Array.from({ length: 18 }, (_, i) => (
              <CardSkeleton key={i} i={i} />
            ))}
          </Grid>
        </Loading>
      ) : items.length === 0 ? (
        <div className="mt-20 text-center">
          <p className="display text-4xl">Nothing matches — yet.</p>
          <p className="mt-3 text-sm text-fg-subtle">Loosen the filters, or contribute the aesthetic you were looking for.</p>
        </div>
      ) : (
        <>
          <Grid dim={query.isFetching && !query.isFetchingNextPage}>
            {items.map((a, i) => (
              <AestheticCard key={a.slug} a={a} priority={i < 6} />
            ))}
          </Grid>
          {query.hasNextPage && (
            <div className="mt-10 flex justify-center">
              <button
                type="button"
                onClick={() => query.fetchNextPage()}
                disabled={query.isFetchingNextPage}
                className="flex h-12 items-center gap-2 rounded-full border border-line-strong px-6 text-sm text-fg-muted transition-colors hover:border-fg-subtle hover:text-fg disabled:opacity-60"
              >
                {query.isFetchingNextPage && <Loader2 className="size-4 animate-spin" aria-hidden />}
                Show more · {compact(total - items.length)} remaining
              </button>
            </div>
          )}
          <InfiniteSentinel onVisible={() => query.hasNextPage && !query.isFetchingNextPage && query.fetchNextPage()} />
        </>
      )}
    </main>
  )
}

function Grid({ children, dim = false }: { children: React.ReactNode; dim?: boolean }) {
  return (
    <div className={`mt-8 grid grid-cols-2 gap-3 transition-opacity sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 ${dim ? 'opacity-60' : ''}`}>{children}</div>
  )
}

function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-sm transition-colors ${active ? 'border-fg bg-fg text-bg' : 'border-line-strong text-fg-muted hover:border-fg-subtle hover:text-fg'}`}
    >
      {children}
    </button>
  )
}

function Select({ label, value, onChange, options, noAll = false }: { label: string; value: string; onChange: (v: string) => void; options: [string, string][]; noAll?: boolean }) {
  return (
    <label className="grid gap-1.5">
      <span className="eyebrow">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 rounded-xl border border-line-strong bg-bg px-3 text-sm text-fg focus:border-fg-subtle focus:outline-none"
      >
        {!noAll && <option value="">All</option>}
        {options.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
    </label>
  )
}

function InfiniteSentinel({ onVisible }: { onVisible: () => void }) {
  const [el, setEl] = useState<HTMLDivElement | null>(null)
  useEffect(() => {
    if (!el) return
    const obs = new IntersectionObserver((e) => e[0]?.isIntersecting && onVisible(), { rootMargin: '800px' })
    obs.observe(el)
    return () => obs.disconnect()
  }, [el, onVisible])
  return <div ref={setEl} aria-hidden className="h-px" />
}
