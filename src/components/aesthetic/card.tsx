import Link from 'next/link'
import type { AestheticSummary } from '@/lib/aesthetic'
import { ArtImage } from './art-image'

export function PaletteBar({ colors, className = '' }: { colors: { hex: string; name: string }[]; className?: string }) {
  if (!colors.length) return null
  return (
    <span className={`flex h-1.5 overflow-hidden rounded-full ${className}`} aria-hidden>
      {colors.slice(0, 6).map((c, i) => (
        <span key={`${c.hex}-${i}`} className="flex-1" style={{ background: c.hex }} />
      ))}
    </span>
  )
}

export function periodLabel(a: Pick<AestheticSummary, 'periodStart' | 'periodEnd' | 'startYear' | 'era'>) {
  if (a.periodStart) return a.periodEnd && a.periodEnd !== a.periodStart ? `${a.periodStart} – ${a.periodEnd}` : a.periodStart
  if (a.startYear !== null) return a.startYear < 0 ? `${-a.startYear} BCE` : String(a.startYear)
  return a.era
}

export function AestheticCard({
  a,
  priority = false,
  variant = 'grid',
}: {
  a: AestheticSummary
  priority?: boolean
  variant?: 'grid' | 'rail' | 'compact'
}) {
  const aspect = variant === 'rail' ? 'aspect-[3/4]' : variant === 'compact' ? 'aspect-square' : 'aspect-[4/5]'
  return (
    <Link
      href={`/aesthetics/${a.slug}`}
      className="group relative block rounded-xl focus-visible:outline-offset-4"
      prefetch={false}
    >
      <ArtImage
        src={a.image}
        alt=""
        colors={a.colors}
        priority={priority}
        seed={a.name.length}
        className={`${aspect} rounded-xl bg-surface-2 ring-1 ring-inset ring-line`}
        imgClassName="group-hover:scale-[1.04]"
      />
      <span className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-t from-black/75 via-black/10 to-transparent opacity-90 transition-opacity group-hover:opacity-100" />
      <span className="absolute inset-x-0 bottom-0 p-3.5 sm:p-4">
        <span className="block font-mono text-[10px] uppercase tracking-[0.14em] text-white/70">{a.category}</span>
        <span className="display mt-1 block text-[1.45rem] leading-[1.02] text-white sm:text-[1.6rem]">{a.name}</span>
        <span className="mt-2 flex items-center gap-2 text-xs text-white/70">
          <span className="truncate">{[periodLabel(a), a.origin].filter(Boolean).join(' · ')}</span>
        </span>
        <PaletteBar colors={a.colors} className="mt-2.5 opacity-90" />
      </span>
      {a.imageCount > 1 && (
        <span className="absolute right-2.5 top-2.5 rounded-full bg-black/45 px-2 py-0.5 font-mono text-[10px] text-white/85 backdrop-blur">
          {a.imageCount} images
        </span>
      )}
    </Link>
  )
}
