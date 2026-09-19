'use client'

import Link from 'next/link'
import { Shuffle, Star } from 'lucide-react'
import { toast } from 'sonner'
import { Carousel } from '@/components/ui/carousel'
import { removeSaved, toggleSaved, useSaved, type SavedItem } from '@/lib/saved'

/** Home-page shelf of starred aesthetics and blends. Renders nothing until something is saved. */
export function SavedShelf() {
  const items = useSaved()
  if (!items.length) return null
  return (
    <section className="mx-auto max-w-[1600px] px-4 pt-16 sm:px-6 lg:px-10" aria-labelledby="shelf-title">
      <Carousel
        label="Your shelf"
        slideClassName="w-56 sm:w-64"
        title={
          <>
            <p className="eyebrow flex items-center gap-1.5">
              <Star className="size-3 fill-current text-accent" aria-hidden /> Saved in this browser
            </p>
            <h2 id="shelf-title" className="display mt-2 text-4xl sm:text-5xl">
              Your shelf
            </h2>
          </>
        }
      >
        {items.map((it) => (
          <ShelfCard key={it.id} item={it} />
        ))}
      </Carousel>
    </section>
  )
}

function ShelfCard({ item }: { item: SavedItem }) {
  const band = item.colors.length ? `linear-gradient(135deg, ${item.colors.join(', ')})` : undefined
  const remove = () => {
    removeSaved(item.id)
    const { savedAt: _, ...rest } = item
    toast('Removed from your shelf', { action: { label: 'Undo', onClick: () => toggleSaved(rest) } })
  }
  return (
    <div className="group relative">
      <Link href={item.href} className="block">
        <span className="relative block aspect-[4/5] overflow-hidden rounded-xl bg-surface-2 ring-1 ring-inset ring-line" style={{ background: band }}>
          {/* A blend shows both parents side by side. */}
          <span className="absolute inset-0 flex">
            {[item.image, item.image2].filter(Boolean).map((src) => (
              <img
                key={src}
                src={src}
                alt=""
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
                className="h-full min-w-0 flex-1 object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ))}
          </span>
          {item.kind === 'blend' && (
            <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/55 px-2.5 py-1 text-[11px] text-white backdrop-blur">
              <Shuffle className="size-3" aria-hidden /> Blend
            </span>
          )}
        </span>
        <span className="mt-3 flex h-1 overflow-hidden rounded-full" aria-hidden>
          {item.colors.map((c, i) => (
            <span key={`${c}-${i}`} className="flex-1" style={{ background: c }} />
          ))}
        </span>
        <span className="mt-2 block truncate text-base text-fg group-hover:text-accent">{item.name}</span>
        <span className="block truncate text-xs text-fg-subtle">{item.category}</span>
      </Link>
      <button
        type="button"
        onClick={remove}
        aria-label={`Remove ${item.name} from your shelf`}
        title="Remove from shelf"
        className="absolute right-2.5 top-2.5 grid size-8 place-items-center rounded-full bg-black/55 text-white backdrop-blur transition-colors hover:bg-black/75"
      >
        <Star className="size-3.5 fill-current" aria-hidden />
      </button>
    </div>
  )
}
