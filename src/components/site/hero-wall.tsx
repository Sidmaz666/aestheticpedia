'use client'

import { useEffect, useRef, useState } from 'react'

/** Slowly drifting wall of record images behind the home hero. Pauses when off-screen. */
export function HeroWall({ images }: { images: string[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const [running, setRunning] = useState(true)

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

  const rows = [0, 1, 2].map((r) => images.filter((_, i) => i % 3 === r).slice(0, 7))
  return (
    <div ref={ref} className="pointer-events-none absolute inset-0 -z-10 overflow-hidden opacity-50" aria-hidden>
      <div className="flex h-full -rotate-6 scale-110 flex-col justify-center gap-3">
        {rows.map((row, r) => (
          <div
            key={r}
            className="flex w-max gap-3 animate-marquee will-change-transform"
            style={{
              animationDirection: r % 2 ? 'reverse' : 'normal',
              animationDuration: `${110 + r * 30}s`,
              animationPlayState: running ? 'running' : 'paused',
            }}
          >
            {[...row, ...row].map((src, i) => (
              <img
                key={`${src}-${i}`}
                src={src}
                alt=""
                width={320}
                height={220}
                loading={r === 1 || i < 4 ? 'eager' : 'lazy'}
                decoding="async"
                referrerPolicy="no-referrer"
                className="h-[22vh] w-[32vh] rounded-xl bg-surface-2 object-cover"
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
