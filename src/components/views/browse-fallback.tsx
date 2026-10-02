// Server-rendered first paint for /aesthetics. BrowseView reads the URL with useSearchParams, so Next
// leaves it client-only and the page ships blank; this fallback is the Suspense fallback and shows
// the real first page with the initial paint. BrowseView hydrates in place with the same data.
import Link from 'next/link'
import { Search, SlidersHorizontal } from 'lucide-react'
import { AestheticCard } from '@/components/aesthetic/card'
import type { AestheticsResponse, Facets } from '@/lib/aesthetic'
import { compact } from '@/lib/format'

export function BrowseFallback({ first, facets, category }: { first: AestheticsResponse; facets: Facets; category: string }) {
  return (
    <main className="mx-auto w-full max-w-[1600px] px-4 pb-16 pt-10 sm:px-6 lg:px-10" suppressHydrationWarning>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="eyebrow">Index</p>
          <h1 className="display mt-2 text-6xl sm:text-7xl">{category || 'All aesthetics'}</h1>
          <p className="mt-3 text-sm text-fg-subtle">
            {compact(first.total)} record{first.total === 1 ? '' : 's'}
          </p>
        </div>
        <div className="flex w-full items-center gap-2 sm:w-auto" aria-hidden>
          <span className="relative flex h-11 flex-1 items-center rounded-full border border-line-strong bg-surface pl-10 pr-4 text-sm text-fg-subtle sm:w-80">
            <Search className="absolute left-4 size-4" />
            Name, place, material, tag…
          </span>
          <span className="flex h-11 items-center gap-2 rounded-full border border-line-strong px-4 text-sm text-fg-muted">
            <SlidersHorizontal className="size-4" /> Filters
          </span>
        </div>
      </div>
      <nav aria-label="Categories" className="no-scrollbar mask-fade-x -mx-4 mt-8 flex gap-2 overflow-x-auto px-4 sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10">
        <span
          className={`shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm ${
            !category ? 'bg-fg text-bg' : 'border border-line-strong text-fg-muted'
          }`}
        >
          All
        </span>
        {facets.categories.map((c) => (
          <Link
            key={c.name}
            href={`/aesthetics?category=${encodeURIComponent(c.name)}`}
            className={`shrink-0 whitespace-nowrap rounded-full border border-line-strong px-4 py-2 text-sm ${
              category === c.name ? 'border-fg bg-fg text-bg' : 'text-fg-muted'
            }`}
          >
            {c.name} <span className="ml-1 opacity-50">{c.count}</span>
          </Link>
        ))}
      </nav>
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
        {first.items.map((a, i) => (
          <AestheticCard key={a.slug} a={a} priority={i < 6} />
        ))}
      </div>
    </main>
  )
}
