import { CardSkeleton, Loading, Skeleton, stagger } from '@/components/site/skeleton'

/** Shaped like the colour atlas: the wheel, the matches beside it and the category spectra. */
export default function ColorsLoading() {
  return (
    <Loading label="Loading the colour atlas…">
      <main className="mx-auto w-full max-w-[1600px] px-4 pb-16 pt-10 sm:px-6 lg:px-10">
        <p className="eyebrow">Colour atlas</p>
        <h1 className="display mt-2 text-6xl sm:text-7xl">Every palette, one wheel</h1>
        <Skeleton className="mt-4 h-4 w-full max-w-2xl" />
        <Skeleton className="mt-2 h-4 w-2/3 max-w-xl" />
        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,640px)_1fr]">
          <Skeleton className="mx-auto aspect-square w-full max-w-[640px] rounded-full" />
          <div>
            <Skeleton className="h-12 w-56 rounded-full" />
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }, (_, i) => (
                <CardSkeleton key={i} i={i} variant="compact" />
              ))}
            </div>
          </div>
        </div>
        <div className="mt-20 space-y-3">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="grid items-center gap-2 sm:grid-cols-[16rem_1fr]">
              <Skeleton className="h-4 w-40" style={stagger(i)} />
              <Skeleton className="h-7 rounded-full" style={stagger(i)} />
            </div>
          ))}
        </div>
      </main>
    </Loading>
  )
}
