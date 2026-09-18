'use client'

// Horizontal carousel: native scroll-snap (touch/trackpad), mouse drag, arrow buttons that
// disable at the ends, keyboard arrows, edge fades and a progress bar. Children are slides.
import { Children, useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export function Carousel({
  children,
  label,
  title,
  slideClassName = 'w-60 sm:w-64',
  bleed = true,
}: {
  children: ReactNode
  /** Accessible name of the carousel. */
  label: string
  /** Optional heading rendered left of the controls. */
  title?: ReactNode
  slideClassName?: string
  /** Extend the track to the page gutters. */
  bleed?: boolean
}) {
  const track = useRef<HTMLDivElement>(null)
  const [edges, setEdges] = useState({ start: true, end: false, progress: 0, visible: 1 })
  const drag = useRef<{ x: number; left: number; moved: boolean } | null>(null)

  const measure = useCallback(() => {
    const el = track.current
    if (!el) return
    const max = el.scrollWidth - el.clientWidth
    setEdges({ start: el.scrollLeft <= 2, end: el.scrollLeft >= max - 2, progress: max > 0 ? el.scrollLeft / max : 1, visible: el.scrollWidth ? el.clientWidth / el.scrollWidth : 1 })
  }, [])

  useEffect(() => {
    measure()
    const el = track.current
    if (!el) return
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [measure, children])

  const page = (dir: 1 | -1) => {
    const el = track.current
    if (!el) return
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: 'smooth' })
  }

  const count = Children.count(children)

  return (
    <div role="region" aria-roledescription="carousel" aria-label={label} className="group/carousel">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div className="min-w-0">{title}</div>
        {!(edges.start && edges.end) && (
          <div className="flex shrink-0 items-center gap-2">
            <span className="hidden font-mono text-xs text-fg-subtle sm:inline">{count} items</span>
            <button
              type="button"
              onClick={() => page(-1)}
              disabled={edges.start}
              aria-label="Previous"
              className="grid size-10 place-items-center rounded-full border border-line-strong text-fg transition-colors hover:border-accent hover:text-accent disabled:pointer-events-none disabled:opacity-30"
            >
              <ChevronLeft className="size-4" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => page(1)}
              disabled={edges.end}
              aria-label="Next"
              className="grid size-10 place-items-center rounded-full border border-line-strong text-fg transition-colors hover:border-accent hover:text-accent disabled:pointer-events-none disabled:opacity-30"
            >
              <ChevronRight className="size-4" aria-hidden />
            </button>
          </div>
        )}
      </div>
      <div className={`relative ${bleed ? '-mx-4 sm:-mx-6 lg:-mx-10' : ''}`}>
        <div
          ref={track}
          tabIndex={0}
          onScroll={measure}
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight') page(1)
            if (e.key === 'ArrowLeft') page(-1)
          }}
          onPointerDown={(e) => {
            if (e.pointerType !== 'mouse' || !track.current) return
            drag.current = { x: e.clientX, left: track.current.scrollLeft, moved: false }
          }}
          onPointerMove={(e) => {
            const d = drag.current
            if (!d || !track.current) return
            const dx = e.clientX - d.x
            if (Math.abs(dx) > 4) {
              d.moved = true
              track.current.style.scrollSnapType = 'none'
              track.current.scrollLeft = d.left - dx
            }
          }}
          onPointerUp={() => {
            if (track.current) track.current.style.scrollSnapType = ''
          }}
          onPointerLeave={() => {
            drag.current = null
            if (track.current) track.current.style.scrollSnapType = ''
          }}
          onClickCapture={(e) => {
            // A drag should not also open the card under the pointer.
            if (drag.current?.moved) {
              e.preventDefault()
              e.stopPropagation()
            }
            drag.current = null
          }}
          className={`no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain scroll-smooth pb-1 outline-none focus-visible:ring-2 focus-visible:ring-accent ${bleed ? 'scroll-px-4 px-4 sm:scroll-px-6 sm:px-6 lg:scroll-px-10 lg:px-10' : ''}`}
        >
          {Children.map(children, (child, i) => (
            <div className={`shrink-0 snap-start ${slideClassName}`} role="group" aria-roledescription="slide" aria-label={`${i + 1} of ${count}`}>
              {child}
            </div>
          ))}
        </div>
        <div className={`pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-bg to-transparent transition-opacity ${edges.start ? 'opacity-0' : 'opacity-100'}`} />
        <div className={`pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-bg to-transparent transition-opacity ${edges.end ? 'opacity-0' : 'opacity-100'}`} />
      </div>
      {!(edges.start && edges.end) && (
        <div className="mt-4 h-0.5 overflow-hidden rounded-full bg-line" aria-hidden>
          <div
            className="h-full rounded-full bg-accent transition-[margin] duration-150"
            style={{ width: `${Math.max(8, edges.visible * 100)}%`, marginLeft: `${edges.progress * (100 - Math.max(8, edges.visible * 100))}%` }}
          />
        </div>
      )}
    </div>
  )
}
