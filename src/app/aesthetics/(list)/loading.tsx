import { CardSkeleton, Loading, Skeleton, stagger } from '@/components/site/skeleton'

/** Shaped like the browse page: heading, filter bar and a grid of cards. */
export default function BrowseLoading() {
  return (
    <Loading label="Loading aesthetics…">
      <main className="mx-auto w-full max-w-[1600px] px-4 pb-16 pt-10 sm:px-6 lg:px-10">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="mt-4 h-16 w-72 rounded-2xl" />
        <div className="mt-8 flex flex-wrap gap-2">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-10 w-32 rounded-full" style={stagger(i)} />
          ))}
        </div>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {Array.from({ length: 18 }, (_, i) => (
            <CardSkeleton key={i} i={i} />
          ))}
        </div>
      </main>
    </Loading>
  )
}
