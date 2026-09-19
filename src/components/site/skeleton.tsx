// Loading placeholders shaped like the content they stand in for, so a page keeps its layout while
// data arrives. They share the `.shimmer` sweep from globals.css (still under reduced motion).
import type { CSSProperties, ReactNode } from 'react'

/** A shimmering block; size and shape come from className. */
export function Skeleton({ className = '', style }: { className?: string; style?: CSSProperties }) {
  return <span aria-hidden className={`shimmer relative block overflow-hidden rounded-md bg-surface-2 ${className}`} style={style} />
}

/** Stagger for a list of skeletons, so the sweep ripples across a grid instead of flashing in unison. */
export const stagger = (i: number): CSSProperties => ({ animationDelay: `${(i % 6) * 80}ms` })

/** Stands in for AestheticCard: portrait image with the caption block at its foot. */
export function CardSkeleton({ i = 0, variant = 'grid' }: { i?: number; variant?: 'grid' | 'rail' | 'compact' }) {
  return (
    <div className={`shimmer relative ${variant === 'rail' ? 'aspect-[3/4]' : 'aspect-[4/5]'} overflow-hidden rounded-xl bg-surface-2 ring-1 ring-inset ring-line`} style={stagger(i)} aria-hidden>
      <span className="absolute inset-x-0 bottom-0 space-y-2 p-3.5 sm:p-4">
        <span className="block h-2 w-1/3 rounded bg-fg/10" />
        <span className={`block rounded bg-fg/15 ${variant === 'compact' ? 'h-4 w-4/5' : 'h-5 w-3/4'}`} />
        <span className="block h-2 w-1/2 rounded bg-fg/10" />
        <span className="block h-1.5 w-full rounded-full bg-fg/10" />
      </span>
    </div>
  )
}

/** Stands in for a Discover match: landscape image, palette strip and two lines. */
export function ResultCardSkeleton({ i = 0 }: { i?: number }) {
  return (
    <div className="overflow-hidden rounded-[calc(1.25rem*var(--r-scale,1))] border border-line bg-surface" aria-hidden>
      <Skeleton className="aspect-[16/10] rounded-none" style={stagger(i)} />
      <Skeleton className="h-3 rounded-none opacity-60" style={stagger(i)} />
      <div className="space-y-2.5 p-4">
        <Skeleton className="h-5 w-2/3" style={stagger(i)} />
        <Skeleton className="h-3 w-1/2" style={stagger(i)} />
      </div>
    </div>
  )
}

/** Accessible wrapper: one status announcement for the whole placeholder region. */
export function Loading({ label = 'Loading…', className = '', children }: { label?: string; className?: string; children: ReactNode }) {
  return (
    <div role="status" aria-busy="true" aria-live="polite" className={className}>
      <span className="sr-only">{label}</span>
      {children}
    </div>
  )
}

/** Page heading placeholder for routes whose title is not known before the data (records). */
export function HeadingSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={className} aria-hidden>
      <Skeleton className="h-3 w-28" />
      <Skeleton className="mt-3 h-12 w-72 max-w-full sm:h-14 sm:w-96" />
      <Skeleton className="mt-4 h-4 w-full max-w-xl" />
      <Skeleton className="mt-2 h-4 w-2/3 max-w-md" />
    </div>
  )
}
