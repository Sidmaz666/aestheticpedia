'use client'

import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { ChevronLeft, ChevronRight, ExternalLink, X } from 'lucide-react'
import { imageCredit as credit, type ColorEntry, type ImageEntry } from '@/lib/aesthetic'
import { ArtImage } from './art-image'

export function Gallery({ images, name, colors }: { images: ImageEntry[]; name: string; colors: ColorEntry[] }) {
  const [index, setIndex] = useState<number | null>(null)
  const [failed, setFailed] = useState<Set<string>>(() => new Set())
  const visible = images.filter((i) => !failed.has(i.url))

  const close = useCallback(() => setIndex(null), [])
  const step = useCallback(
    (d: number) => setIndex((i) => (i === null ? i : (i + d + visible.length) % visible.length)),
    [visible.length]
  )

  useEffect(() => {
    if (index === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        close()
      } else if (e.key === 'ArrowRight') step(1)
      else if (e.key === 'ArrowLeft') step(-1)
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [index, close, step])

  if (!visible.length) return null
  const current = index !== null ? visible[index] : null

  return (
    <>
      <div className="columns-2 gap-3 sm:gap-4 md:columns-3 xl:columns-4">
        {visible.map((img, i) => {
          const w = Number(img.width) || 4
          const h = Number(img.height) || 3
          return (
            <figure key={img.url} className="group mb-3 break-inside-avoid sm:mb-4">
              <button
                type="button"
                onClick={() => setIndex(i)}
                className="block w-full overflow-hidden rounded-xl ring-1 ring-inset ring-line focus-visible:outline-offset-2"
                aria-label={`View image ${i + 1}: ${img.caption}`}
              >
                <span className="block" style={{ aspectRatio: `${w} / ${h}` }}>
                  <img
                    src={img.thumb ?? img.url}
                    alt={img.caption || `${name} example`}
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                    onError={() => setFailed((s) => new Set(s).add(img.url))}
                    className="size-full bg-surface-2 object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  />
                </span>
              </button>
              <figcaption className="mt-1.5 line-clamp-2 text-xs leading-snug text-fg-subtle">
                {img.caption}
              </figcaption>
            </figure>
          )
        })}
      </div>

      {current &&
        createPortal(
          <div
            className="fixed inset-0 z-[120] flex flex-col bg-black/95 text-white animate-in fade-in-0"
            role="dialog"
            aria-modal="true"
            aria-label={`${name} image viewer`}
            onClick={close}
          >
            <div className="flex items-center justify-between gap-4 p-3 sm:p-5" onClick={(e) => e.stopPropagation()}>
              <span className="font-mono text-xs text-white/60">
                {index! + 1} / {visible.length}
              </span>
              <button
                type="button"
                onClick={close}
                className="grid size-11 place-items-center rounded-full bg-white/12 text-white backdrop-blur transition-colors hover:bg-white/25"
                aria-label="Close image viewer"
                autoFocus
              >
                <X className="size-5" aria-hidden />
              </button>
            </div>
            <div className="relative flex min-h-0 flex-1 items-center justify-center px-2 sm:px-16">
              <img
                key={current.url}
                src={current.url}
                alt={current.caption}
                referrerPolicy="no-referrer"
                className="max-h-full max-w-full rounded-lg object-contain shadow-2xl animate-in fade-in-0 zoom-in-95"
                onClick={(e) => e.stopPropagation()}
              />
              {visible.length > 1 && (
                <>
                  <NavButton side="left" onClick={() => step(-1)} />
                  <NavButton side="right" onClick={() => step(1)} />
                </>
              )}
            </div>
            <div className="mx-auto w-full max-w-4xl p-4 text-center sm:p-6" onClick={(e) => e.stopPropagation()}>
              <p className="text-sm text-white/90">{current.caption}</p>
              <p className="mt-1 text-xs text-white/55">
                {credit(current)}
                {current.pageUrl && (
                  <>
                    {' · '}
                    <a href={current.pageUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 underline underline-offset-2 hover:text-white">
                      Source & license <ExternalLink className="size-3" aria-hidden />
                    </a>
                  </>
                )}
              </p>
            </div>
          </div>,
          document.body
        )}
    </>
  )
}

function NavButton({ side, onClick }: { side: 'left' | 'right'; onClick: () => void }) {
  const Icon = side === 'left' ? ChevronLeft : ChevronRight
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      className={`absolute top-1/2 grid size-12 -translate-y-1/2 place-items-center rounded-full bg-white/12 backdrop-blur transition-colors hover:bg-white/25 ${side === 'left' ? 'left-2 sm:left-4' : 'right-2 sm:right-4'}`}
      aria-label={side === 'left' ? 'Previous image' : 'Next image'}
    >
      <Icon className="size-6" aria-hidden />
    </button>
  )
}

/** Hero image with graceful fallback to palette art. */
export function HeroImage({ image, colors, name }: { image?: ImageEntry; colors: ColorEntry[]; name: string }) {
  return (
    <ArtImage
      src={image?.url}
      srcSet={image?.thumb && image.url !== image.thumb ? `${image.thumb} 500w, ${image.url} 1280w` : undefined}
      sizes="100vw"
      alt={image?.caption ?? `${name}`}
      colors={colors}
      priority
      className="absolute inset-0"
    />
  )
}
