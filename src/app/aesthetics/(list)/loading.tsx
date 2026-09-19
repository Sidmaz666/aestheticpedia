/** Shaped like the browse page: heading, filter bar and a grid of cards. */
export default function Loading() {
  return (
    <main aria-busy="true" aria-label="Loading aesthetics" className="mx-auto w-full max-w-[1600px] px-4 pb-16 pt-10 sm:px-6 lg:px-10">
      <div className="h-3 w-24 rounded-full bg-surface-2" />
      <div className="mt-4 h-16 w-72 rounded-2xl bg-surface-2" />
      <div className="mt-8 flex flex-wrap gap-2">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="h-10 w-32 rounded-full bg-surface-2" />
        ))}
      </div>
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {Array.from({ length: 18 }, (_, i) => (
          <div key={i}>
            <div className="shimmer relative aspect-[4/5] overflow-hidden rounded-xl bg-surface-2" style={{ animationDelay: `${(i % 6) * 80}ms` }} />
            <div className="mt-3 h-3 w-3/4 rounded-full bg-surface-2" />
            <div className="mt-2 h-2.5 w-1/2 rounded-full bg-surface-2" />
          </div>
        ))}
      </div>
    </main>
  )
}
