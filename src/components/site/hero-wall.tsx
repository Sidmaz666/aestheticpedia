'use client'

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import { Pause, Play } from 'lucide-react'

const noop = () => () => {}
const ROWS = 5

/** Seeded shuffle so a row's order is random but stable for the visit. */
function shuffle<T>(xs: T[], rand: () => number): T[] {
  const a = [...xs]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/**
 * Full-bleed marquee behind the home hero: straight rows that fill the whole section, each
 * with its own random selection, speed, direction and starting offset (randomised on the
 * client so server and client HTML agree). It keeps drifting — slower — for visitors who
 * prefer reduced motion, and always has a pause control (WCAG 2.2.2). Pauses off-screen and
 * in background tabs.
 */
export function HeroWall({ images }: { images: string[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(true)
  const [paused, setPaused] = useState(false)
  const mounted = useSyncExternalStore(noop, () => true, () => false)
  const reduced = useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
      mq.addEventListener('change', cb)
      return () => mq.removeEventListener('change', cb)
    },
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    () => false
  )

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => setVisible(!!e?.isIntersecting && document.visibilityState === 'visible'))
    obs.observe(el)
    const onVis = () => setVisible(document.visibilityState === 'visible')
    document.addEventListener('visibilitychange', onVis)
    return () => {
      obs.disconnect()
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [])

  const rows = useMemo(() => {
    if (!mounted || images.length === 0) return []
    let seed = Math.floor(Math.random() * 2 ** 31)
    const rand = () => (seed = (seed * 1103515245 + 12345) % 2 ** 31) / 2 ** 31
    return Array.from({ length: ROWS }, (_, r) => {
      const duration = 60 + rand() * 80 // 60–140 s per loop
      return {
        key: r,
        images: shuffle(images, rand).slice(0, Math.max(10, Math.ceil(images.length * 0.6))),
        duration,
        reverse: rand() > 0.5,
        delay: -rand() * duration, // start mid-loop so rows never line up
      }
    })
  }, [mounted, images])

  const running = visible && !paused
  return (
    <>
      <div
        ref={ref}
        className={`pointer-events-none absolute inset-0 -z-10 overflow-hidden transition-opacity duration-1000 ${rows.length ? 'opacity-45' : 'opacity-0'}`}
        aria-hidden
      >
        {/* Rows start above the top edge, so the wall runs on behind the header with no seam. */}
        <div className="absolute inset-x-0 -top-[9vh] bottom-0 flex flex-col gap-3">
          {rows.map((row) => (
            <div key={row.key} className="relative min-h-0 flex-1">
              <div
                className="hero-marquee absolute inset-y-0 left-0 flex w-max will-change-transform"
                style={{
                  animationDuration: `${row.duration * (reduced ? 2.5 : 1)}s`,
                  animationDirection: row.reverse ? 'reverse' : 'normal',
                  animationDelay: `${row.delay}s`,
                  animationPlayState: running ? 'running' : 'paused',
                }}
              >
                {/* Two copies so the -50% translate loops seamlessly (margins, not gap, keep it exact). */}
                {[...row.images, ...row.images].map((src, i) => (
                  <img
                    key={`${src}-${i}`}
                    src={src}
                    alt=""
                    loading={i < 8 ? 'eager' : 'lazy'}
                    decoding="async"
                    referrerPolicy="no-referrer"
                    className="mr-3 aspect-[4/3] h-full shrink-0 rounded-xl bg-surface-2 object-cover"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      {rows.length > 0 && (
        <button
          type="button"
          onClick={() => setPaused((p) => !p)}
          aria-pressed={paused}
          aria-label={paused ? 'Play background motion' : 'Pause background motion'}
          title={paused ? 'Play background motion' : 'Pause background motion'}
          className="absolute bottom-6 left-4 z-10 grid size-9 place-items-center rounded-full border border-line-strong bg-bg/70 text-fg-muted backdrop-blur transition-colors hover:text-fg sm:left-6 lg:left-10"
        >
          {paused ? <Play className="size-4" aria-hidden /> : <Pause className="size-4" aria-hidden />}
        </button>
      )}
    </>
  )
}
