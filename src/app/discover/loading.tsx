import { Loading, ResultCardSkeleton, Skeleton, stagger } from '@/components/site/skeleton'

/** Shaped like Discover: the palette controls beside a grid of matches. */
export default function DiscoverLoading() {
  return (
    <Loading label="Loading Discover…">
      <main className="mx-auto grid w-full max-w-[1600px] gap-10 px-4 pb-20 pt-10 sm:px-6 md:grid-cols-[18rem_minmax(0,1fr)] lg:grid-cols-[22rem_minmax(0,1fr)] lg:px-10">
        <aside>
          <p className="eyebrow">Palette search</p>
          <h1 className="display mt-2 text-6xl">Discover</h1>
          <Skeleton className="mt-4 h-4 w-full" />
          <Skeleton className="mt-2 h-4 w-4/5" />
          <p className="eyebrow mt-8">Start from a mood</p>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-2">
            {Array.from({ length: 6 }, (_, i) => (
              <Skeleton key={i} className="h-16 rounded-xl" style={stagger(i)} />
            ))}
          </div>
          <div className="mt-8 space-y-2">
            {Array.from({ length: 5 }, (_, i) => (
              <Skeleton key={i} className="h-14 rounded-xl" style={stagger(i)} />
            ))}
          </div>
        </aside>
        <section className="min-w-0">
          <div className="border-b border-line pb-4">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="mt-2 h-9 w-72 max-w-full" />
          </div>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3">
            {Array.from({ length: 6 }, (_, i) => (
              <ResultCardSkeleton key={i} i={i} />
            ))}
          </div>
        </section>
      </main>
    </Loading>
  )
}
