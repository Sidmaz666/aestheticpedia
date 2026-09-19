'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { gsap } from 'gsap'
import { SplitText } from 'gsap/SplitText'
import { compact } from '@/lib/format'

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
            el.textContent = compact(Math.round(obj.v))
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
    const watched = new WeakSet<Element>()
    // Only touch elements React has already hydrated (it tags them with an internal fiber key):
    // changing server-rendered HTML before hydration causes a hydration mismatch. Elements that
    // aren't hydrated yet (streamed or suspended parts of the page) are picked up by a re-scan.
    const hydrated = (el: Element) => Object.keys(el).some((k) => k.startsWith('__reactFiber'))
    let retries = 0
    let retry = 0
    const scan = (node: ParentNode) => {
      let pending = 0
      node.querySelectorAll<HTMLElement>('[data-reveal],[data-reveal-group],[data-count]').forEach((el) => {
        if (el.dataset.revealed || watched.has(el)) return
        if (!hydrated(el)) return void pending++
        watched.add(el)
        io.observe(el)
      })
      node.querySelectorAll<HTMLElement>('[data-split]').forEach((el) => {
        if (el.dataset.splitDone) return
        if (!hydrated(el)) return void pending++
        el.dataset.splitDone = '1'
        // Word masks get room below the baseline (.split-word-mask in globals.css) so descenders
        // (g, y, p) are not clipped, and the split is undone once the words have risen in.
        const split = SplitText.create(el, { type: 'words', mask: 'words', wordsClass: 'split-word' })
        splits.push(split)
        gsap.from(split.words, { yPercent: 110, duration: 1.1, ease: 'expo.out', stagger: 0.06, delay: 0.05, onComplete: () => split.revert() })
        gsap.set(el, { autoAlpha: 1 })
      })
      if (pending && retries++ < 60) {
        clearTimeout(retry)
        retry = window.setTimeout(() => scan(document), 100)
      }
    }

    scan(document)
    const mo = new MutationObserver((muts) => {
      for (const m of muts) for (const n of m.addedNodes) if (n instanceof HTMLElement) scan(n.parentElement ?? n)
    })
    mo.observe(document.body, { childList: true, subtree: true })

    return () => {
      clearTimeout(retry)
      io.disconnect()
      mo.disconnect()
      splits.forEach((s) => s.revert())
    }
  }, [pathname])

  return null
}
