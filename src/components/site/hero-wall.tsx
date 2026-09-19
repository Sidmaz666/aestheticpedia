'use client'

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'

const noop = () => () => {}

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
 * Marquee wall behind the home hero: several rows of record images, each row with its own
 * random selection, speed, direction and starting offset. Randomised on the client only (so
 * server and client HTML agree); pauses off-screen, when the tab is hidden, on hover of the
 * hero, and entirely for reduced-motion visitors.
 */
export function HeroWall({ images }: { images: string[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const [running, setRunning] = useState(true)
  const mounted = useSyncExternalStore(noop, () => true, () => false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => setRunning(!!e?.isIntersecting && document.visibilityState === 'visible'))
    obs.observe(el)
    const onVis = () => setRunning(document.visibilityState === 'visible')
    document.addEventListener('visibilitychange', onVis)
    return () => {
      obs.disconnect()
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [])

  const rows = useMemo(() => {
    if (!mounted || images.length === 0) return []
    let seed = Math.floor(Math.random() * 2 ** 31)
    const rand = () => ((seed = (seed * 1103515245 + 12345) % 2 ** 31) / 2 ** 31)
    const count = 5
    return Array.from({ length: count }, (_, r) => {
      const picks = shuffle(images, rand).slice(0, Math.max(8, Math.ceil(images.length / 2)))
      const duration = 70 + rand() * 90 // 70–160 s per loop
      return {
        key: r,
        images: picks,
        duration,
        reverse: rand() > 0.5,
        delay: -rand() * duration, // start mid-loop so rows don't line up
        size: 0.85 + rand() * 0.3, // slight height variation per row
      }
    })
  }, [mounted, images])

  return (
    <div
      ref={ref}
      className={`pointer-events-none absolute inset-0 -z-10 overflow-hidden transition-opacity duration-1000 ${rows.length ? 'opacity-45' : 'opacity-0'}`}
      aria-hidden
    >
      <div className="absolute -inset-x-[10%] -inset-y-[15%] flex -rotate-[5deg] flex-col justify-center gap-3">
        {rows.map((row) => (
          <div
            key={row.key}
            className="flex w-max shrink-0 animate-marquee will-change-transform motion-reduce:animate-none"
            style={{
              animationDirection: row.reverse ? 'reverse' : 'normal',
              animationDuration: `${row.duration}s`,
              animationDelay: `${row.delay}s`,
              animationPlayState: running ? 'running' : 'paused',
            }}
          >
            {/* Two copies so the -50% translate loops seamlessly. */}
            {[...row.images, ...row.images].map((src, i) => (
              <img
                key={`${src}-${i}`}
                src={src}
                alt=""
                loading={i < 6 ? 'eager' : 'lazy'}
                decoding="async"
                referrerPolicy="no-referrer"
                className="mr-3 shrink-0 rounded-xl bg-surface-2 object-cover"
                style={{ height: `${17 * row.size}vh`, width: `${25 * row.size}vh` }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
