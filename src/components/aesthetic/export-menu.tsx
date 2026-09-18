'use client'

import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown, Download, Link2, Share2 } from 'lucide-react'
import { EXPORT_GROUPS } from './export-formats'
import { copyText } from './palette-swatches'
import { SITE_NAME } from '@/lib/site'

export function ExportMenu({ slug }: { slug: string }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
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
      {open && (
        <div
          role="menu"
          className="absolute right-0 z-30 mt-2 max-h-[70vh] w-[min(22rem,calc(100vw-2rem))] overflow-y-auto rounded-2xl border border-line-strong bg-surface p-2 shadow-2xl shadow-black/40 no-scrollbar"
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
        </div>
      )}
    </div>
  )
}

export function ShareButton({ slug, name }: { slug: string; name: string }) {
  const [done, setDone] = useState(false)
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
      {done ? <Check className="size-4" aria-hidden /> : typeof navigator !== 'undefined' && 'share' in navigator ? <Share2 className="size-4" aria-hidden /> : <Link2 className="size-4" aria-hidden />}
    </button>
  )
}
