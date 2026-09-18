'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { gsap } from 'gsap'
import { SplitText } from 'gsap/SplitText'

/**
 * Site-wide motion, driven by data attributes so server components can opt in:
 *   data-reveal            fade/rise into view once
 *   data-reveal-group      children rise in with a stagger
 *   data-count="1234"      number counts up when visible
 *   data-split             headline reveals word by word on mount
 * Works for content added later (infinite scroll, overlays) via a MutationObserver.
 * Disabled entirely for prefers-reduced-motion (the html.motion-ok class is never set).
 */
export function Motion() {
  const pathname = usePathname()

  useEffect(() => {
    const root = document.documentElement
    if (!root.classList.contains('motion-ok')) return
    gsap.registerPlugin(SplitText)

    const reveal = (el: HTMLElement) => {
      if (el.dataset.revealed) return
      el.dataset.revealed = '1'
      if (el.hasAttribute('data-reveal-group')) {
        gsap.fromTo(
          el.children,
          { autoAlpha: 0, y: 22 },
          { autoAlpha: 1, y: 0, duration: 0.9, ease: 'expo.out', stagger: { each: 0.045, from: 'start' }, clearProps: 'transform' }
        )
        gsap.set(el, { autoAlpha: 1 })
      } else if (el.dataset.count) {
        const end = Number(el.dataset.count)
        const obj = { v: 0 }
        gsap.set(el, { autoAlpha: 1 })
        gsap.to(obj, {
          v: end,
          duration: 1.6,
          ease: 'power3.out',
          onUpdate: () => {
            el.textContent = Math.round(obj.v).toLocaleString('en')
          },
        })
      } else {
        gsap.fromTo(el, { autoAlpha: 0, y: 26 }, { autoAlpha: 1, y: 0, duration: 1, ease: 'expo.out', clearProps: 'transform' })
      }
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            reveal(e.target as HTMLElement)
            io.unobserve(e.target)
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.01 }
    )

    const splits: SplitText[] = []
    const scan = (node: ParentNode) => {
      node.querySelectorAll<HTMLElement>('[data-reveal],[data-reveal-group],[data-count]').forEach((el) => {
        if (!el.dataset.revealed && !el.dataset.watched) {
          el.dataset.watched = '1'
          io.observe(el)
        }
      })
      node.querySelectorAll<HTMLElement>('[data-split]').forEach((el) => {
        if (el.dataset.splitDone) return
        el.dataset.splitDone = '1'
        const split = SplitText.create(el, { type: 'words', mask: 'words' })
        splits.push(split)
        gsap.from(split.words, { yPercent: 110, duration: 1.1, ease: 'expo.out', stagger: 0.06, delay: 0.05 })
        gsap.set(el, { autoAlpha: 1 })
      })
    }

    scan(document)
    const mo = new MutationObserver((muts) => {
      for (const m of muts) for (const n of m.addedNodes) if (n instanceof HTMLElement) scan(n.parentElement ?? n)
    })
    mo.observe(document.body, { childList: true, subtree: true })

    return () => {
      io.disconnect()
      mo.disconnect()
      splits.forEach((s) => s.revert())
    }
  }, [pathname])

  return null
}
