import { Loading, Skeleton, stagger } from '@/components/site/skeleton'

/** Shaped like Data & API: heading, headline figures, charts and the download list. */
export default function DataLoading() {
  return (
    <Loading label="Loading Data & API…">
      <main className="mx-auto w-full max-w-[1600px] px-4 pb-16 pt-10 sm:px-6 lg:px-10">
        <p className="eyebrow">Open data</p>
        <h1 className="display mt-2 max-w-4xl text-6xl sm:text-7xl">Data &amp; API</h1>
        <Skeleton className="mt-4 h-4 w-full max-w-2xl" />
        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" style={stagger(i)} />
          ))}
        </div>
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-72 rounded-2xl" />
          <Skeleton className="h-72 rounded-2xl" style={stagger(1)} />
        </div>
        <div className="mt-10 space-y-2">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-14 rounded-xl" style={stagger(i)} />
          ))}
        </div>
      </main>
    </Loading>
  )
}
