'use client'

import { useRef, useState, useSyncExternalStore } from 'react'
import * as Popover from '@radix-ui/react-popover'
import { Check, ChevronDown, Download, Link2, Share2 } from 'lucide-react'
import { EXPORT_GROUPS } from './export-formats'
import { copyText } from './palette-swatches'
import { SITE_NAME } from '@/lib/site'

/**
 * Export menu (Radix Popover — the primitive shadcn/ui's Popover is built on): outside click,
 * Escape and focus handled by Radix, collision-aware placement, scrolls within itself without
 * closing, and renders above everything. Inside the aesthetic overlay it portals into the
 * overlay so the aesthetic's theme colours apply. `hrefFor` overrides where a format is
 * downloaded from (e.g. the Blend API for a blend).
 */
export function ExportMenu({ slug, hrefFor }: { slug: string; hrefFor?: (format: string) => string }) {
  const [open, setOpen] = useState(false)
  const [filter, setFilter] = useState('')
  const [container, setContainer] = useState<HTMLElement | null>(null)
  const btnRef = useRef<HTMLButtonElement>(null)
  const q = filter.trim().toLowerCase()
  const groups = EXPORT_GROUPS.map((g) => ({ ...g, formats: g.formats.filter((f) => !q || `${f.label} ${f.description} ${g.group} ${f.ext}`.toLowerCase().includes(q)) })).filter((g) => g.formats.length)
  const total = EXPORT_GROUPS.reduce((n, g) => n + g.formats.length, 0)

  return (
    <Popover.Root
      open={open}
      onOpenChange={(o) => {
        if (o) setContainer((btnRef.current?.closest('#aesthetic-modal') as HTMLElement | null) ?? null)
        else setFilter('')
        setOpen(o)
      }}
    >
      <Popover.Trigger asChild>
        <button
          ref={btnRef}
          type="button"
          className="flex h-10 items-center gap-2 rounded-full bg-fg px-4 text-sm font-medium text-bg transition-opacity hover:opacity-90"
        >
          <Download className="size-4" aria-hidden />
          Export
          <ChevronDown className={`size-3.5 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden />
        </button>
      </Popover.Trigger>
      <Popover.Portal container={container ?? undefined}>
        <Popover.Content
          align="end"
          sideOffset={8}
          collisionPadding={12}
          onOpenAutoFocus={(e) => e.preventDefault()}
          className="z-[99999] flex w-[min(24rem,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-2xl border border-line-strong bg-surface text-fg shadow-2xl shadow-black/50 outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
          style={{ maxHeight: 'min(34rem, var(--radix-popover-content-available-height))' }}
        >
          <div className="border-b border-line p-2.5">
            <input
              autoFocus
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder={`Search ${total} formats — tailwind, figma, android…`}
              aria-label="Filter export formats"
              className="h-9 w-full rounded-lg border border-line-strong bg-bg px-3 text-sm placeholder:text-fg-subtle focus:border-accent focus:outline-none"
            />
          </div>
          <div role="menu" aria-label="Export formats" className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2 scrollbar-thin">
            {groups.length === 0 && <p className="px-3 py-6 text-center text-sm text-fg-subtle">No format matches “{filter}”.</p>}
            {groups.map((g) => (
              <div key={g.group} className="py-1">
                <p className="eyebrow px-2.5 py-1.5">{g.group}</p>
                {g.formats.map((f) => (
                  <a
                    key={f.id}
                    role="menuitem"
                    href={hrefFor ? hrefFor(f.id) : `/api/v1/aesthetics/${slug}?format=${f.id}&download=1`}
                    download
                    onClick={() => setOpen(false)}
                    className="flex items-baseline justify-between gap-3 rounded-lg px-2.5 py-2 text-sm outline-none hover:bg-surface-2 focus-visible:bg-surface-2"
                  >
                    <span className="shrink-0 text-fg">{f.label}</span>
                    <span className="truncate text-right text-xs text-fg-subtle">{f.description}</span>
                  </a>
                ))}
              </div>
            ))}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}

const noop = () => () => {}

export function ShareButton({ slug, name, url: shareUrl }: { slug: string; name: string; url?: string }) {
  const [done, setDone] = useState(false)
  // Decided after mount so the server and first client render agree (no hydration mismatch).
  const canShare = useSyncExternalStore(noop, () => typeof navigator.share === 'function', () => false)
  const share = async () => {
    const url = shareUrl ?? `${window.location.origin}/aesthetics/${slug}`
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
