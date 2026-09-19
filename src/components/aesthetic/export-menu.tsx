'use client'

import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import { Check, ChevronDown, Download, Link2, Share2 } from 'lucide-react'
import { EXPORT_GROUPS } from './export-formats'
import { copyText } from './palette-swatches'
import { SITE_NAME } from '@/lib/site'

export function ExportMenu({ slug }: { slug: string }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const btnRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  // The menu floats in a portal (the hero clips overflow and the section bar sits above it),
  // placed below the button — or above it when there is more room there — and kept on screen.
  const [pos, setPos] = useState<{ top?: number; bottom?: number; right: number; maxHeight: number; host: HTMLElement } | null>(null)

  useLayoutEffect(() => {
    if (!open) return
    const place = () => {
      const r = btnRef.current!.getBoundingClientRect()
      const below = window.innerHeight - r.bottom - 12
      const above = r.top - 12
      const right = Math.max(8, window.innerWidth - r.right)
      // Inside the overlay, render within it so the aesthetic's theme variables apply.
      const host = (btnRef.current!.closest('#aesthetic-modal') as HTMLElement | null) ?? document.body
      setPos(below >= 320 || below >= above ? { top: r.bottom + 8, right, maxHeight: below - 8, host } : { bottom: window.innerHeight - r.top + 8, right, maxHeight: above - 8, host })
    }
    place()
    const close = () => setOpen(false)
    window.addEventListener('resize', place)
    window.addEventListener('scroll', close, { capture: true, passive: true })
    return () => {
      window.removeEventListener('resize', place)
      window.removeEventListener('scroll', close, { capture: true })
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node
      if (!ref.current?.contains(t) && !menuRef.current?.contains(t)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey, true)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey, true)
    }
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex h-10 items-center gap-2 rounded-full bg-fg px-4 text-sm font-medium text-bg transition-opacity hover:opacity-90"
      >
        <Download className="size-4" aria-hidden />
        Export
        <ChevronDown className={`size-3.5 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden />
      </button>
      {open &&
        pos &&
        createPortal(
        <div
          ref={menuRef}
          role="menu"
          style={{ position: 'fixed', top: pos.top, bottom: pos.bottom, right: pos.right, maxHeight: Math.max(200, pos.maxHeight) }}
          className="z-[120] w-[min(22rem,calc(100vw-1rem))] overflow-y-auto overscroll-contain rounded-2xl border border-line-strong bg-surface p-2 shadow-2xl shadow-black/50 scrollbar-thin animate-in fade-in-0 zoom-in-95 duration-150"
        >
          {EXPORT_GROUPS.map((g) => (
            <div key={g.group} className="py-1">
              <p className="eyebrow px-2.5 py-1.5">{g.group}</p>
              {g.formats.map((f) => (
                <a
                  key={f.id}
                  role="menuitem"
                  href={`/api/v1/aesthetics/${slug}?format=${f.id}&download=1`}
                  download
                  onClick={() => setOpen(false)}
                  className="flex items-baseline justify-between gap-3 rounded-lg px-2.5 py-2 text-sm hover:bg-surface-2"
                >
                  <span className="text-fg">{f.label}</span>
                  <span className="truncate text-right text-xs text-fg-subtle">{f.description}</span>
                </a>
              ))}
            </div>
          ))}
        </div>,
          pos.host
        )}
    </div>
  )
}

const noop = () => () => {}

export function ShareButton({ slug, name }: { slug: string; name: string }) {
  const [done, setDone] = useState(false)
  // Decided after mount so the server and first client render agree (no hydration mismatch).
  const canShare = useSyncExternalStore(noop, () => typeof navigator.share === 'function', () => false)
  const share = async () => {
    const url = `${window.location.origin}/aesthetics/${slug}`
    if (navigator.share) {
      try {
        await navigator.share({ title: `${name} — ${SITE_NAME}`, url })
        return
      } catch {
        /* cancelled — fall back to copy */
      }
    }
    if (await copyText(url, 'Link')) {
      setDone(true)
      setTimeout(() => setDone(false), 1500)
    }
  }
  return (
    <button
      type="button"
      onClick={share}
      className="grid size-10 place-items-center rounded-full border border-line-strong text-fg-muted transition-colors hover:border-fg-subtle hover:text-fg"
      aria-label="Share link"
      title="Share"
    >
      {done ? <Check className="size-4" aria-hidden /> : canShare ? <Share2 className="size-4" aria-hidden /> : <Link2 className="size-4" aria-hidden />}
    </button>
  )
}
