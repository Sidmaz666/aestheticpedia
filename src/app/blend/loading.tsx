import { Loading, Skeleton } from '@/components/site/skeleton'

/** Shaped like Blend: the heading and the two parent pickers. */
export default function BlendLoading() {
  return (
    <Loading label="Loading Blend…">
      <main className="mx-auto w-full max-w-[1600px] px-4 pb-20 pt-10 sm:px-6 lg:px-10">
        <p className="eyebrow">Speculative synthesis</p>
        <h1 className="display mt-2 text-6xl sm:text-7xl">Blend</h1>
        <Skeleton className="mt-4 h-4 w-full max-w-2xl" />
        <div className="mt-10 grid items-center gap-4 md:grid-cols-[1fr_auto_1fr]">
          <Skeleton className="min-h-44 rounded-[calc(1.25rem*var(--r-scale,1))]" />
          <Skeleton className="mx-auto size-14 rounded-full" />
          <Skeleton className="min-h-44 rounded-[calc(1.25rem*var(--r-scale,1))]" style={{ animationDelay: '160ms' }} />
        </div>
      </main>
    </Loading>
  )
}
