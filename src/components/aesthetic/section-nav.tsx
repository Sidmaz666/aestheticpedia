'use client'

import { useEffect, useRef, useState } from 'react'
import { useHorizontalWheel } from '@/lib/use-horizontal-wheel'

/** Sticky in-page navigation with scroll-spy. Scrolls horizontally without a visible scrollbar. */
export function SectionNav({ sections, scrollRootId }: { sections: { id: string; label: string }[]; scrollRootId?: string }) {
  const [active, setActive] = useState(sections[0]?.id)
  const navRef = useRef<HTMLElement>(null)
  useHorizontalWheel(navRef)

  useEffect(() => {
    const root = scrollRootId ? document.getElementById(scrollRootId) : null
    const obs = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (vis[0]) setActive(vis[0].target.id)
      },
      { root, rootMargin: '-20% 0px -65% 0px' }
    )
    for (const s of sections) {
      const el = document.getElementById(s.id)
      if (el) obs.observe(el)
    }
    return () => obs.disconnect()
  }, [sections, scrollRootId])

  return (
    <nav ref={navRef} aria-label="On this page" className="no-scrollbar -mx-1 flex gap-1 overflow-x-auto px-1">
      {sections.map((s) => (
        <a
          key={s.id}
          href={`#${s.id}`}
          onClick={(e) => {
            e.preventDefault()
            document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            history.replaceState(null, '', `#${s.id}`)
          }}
          aria-current={active === s.id ? 'true' : undefined}
          className={`shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm transition-colors ${
            active === s.id ? 'bg-fg text-bg' : 'text-fg-muted hover:bg-surface-2 hover:text-fg'
          }`}
        >
          {s.label}
        </a>
      ))}
    </nav>
  )
}
