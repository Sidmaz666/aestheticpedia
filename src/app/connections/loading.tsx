import { Loading, Skeleton, stagger } from '@/components/site/skeleton'

/** Shaped like Connections: the full-bleed network stage with its side panel. */
export default function ConnectionsLoading() {
  return (
    <Loading label="Loading the network…" className="relative h-[calc(100svh-4rem)] w-full overflow-hidden">
      <Skeleton className="absolute inset-0 rounded-none opacity-40" />
      <div className="absolute left-4 top-4 w-[min(22rem,calc(100%-2rem))] space-y-3 rounded-2xl border border-line bg-surface/80 p-5 backdrop-blur">
        <p className="eyebrow">Relationship network</p>
        <p className="display text-4xl">Connections</p>
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-10 w-full rounded-full" />
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-5 w-full" style={stagger(i)} />
        ))}
      </div>
    </Loading>
  )
}
