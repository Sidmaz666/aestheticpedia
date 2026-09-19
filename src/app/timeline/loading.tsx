import { Loading, Skeleton, stagger } from '@/components/site/skeleton'

/** Shaped like the timeline: heading, era filters, the year ruler and staggered lanes of spans. */
export default function TimelineLoading() {
  return (
    <Loading label="Loading the timeline…">
      <main className="mx-auto w-full max-w-[1600px] px-4 pb-16 pt-10 sm:px-6 lg:px-10">
        <p className="eyebrow">Chronology</p>
        <h1 className="display text-6xl sm:text-7xl">Timeline</h1>
        <Skeleton className="mt-4 h-4 w-full max-w-2xl" />
        <div className="mt-8 flex flex-wrap gap-2">
          {Array.from({ length: 7 }, (_, i) => (
            <Skeleton key={i} className="h-9 w-24 rounded-full" style={stagger(i)} />
          ))}
        </div>
        <Skeleton className="mt-10 h-6 w-full" />
        <div className="mt-4 space-y-3">
          {Array.from({ length: 12 }, (_, i) => (
            <Skeleton key={i} className="h-8 rounded-full" style={{ ...stagger(i), marginLeft: `${(i * 37) % 55}%`, width: `${18 + ((i * 23) % 30)}%` }} />
          ))}
        </div>
      </main>
    </Loading>
  )
}
