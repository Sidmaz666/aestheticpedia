'use client'

import { Skeleton, stagger } from '@/components/site/skeleton'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import * as Dialog from '@radix-ui/react-dialog'
import { ArrowRight, CornerDownLeft, Loader2, Search } from 'lucide-react'
import { useSuggest } from '@/lib/client'
import { Thumb } from '@/components/aesthetic/thumb'

export function SearchDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const router = useRouter()
  const [q, setQ] = useState('')
  const [active, setActive] = useState(0)
  const [debounced, setDebounced] = useState('')
  const listRef = useRef<HTMLUListElement>(null)

  useEffect(() => {
    const t = setTimeout(() => setDebounced(q), 120)
    return () => clearTimeout(t)
  }, [q])

  const { data, isFetching } = useSuggest(debounced)
  const items = debounced ? (data?.items ?? []) : []
  const total = items.length + (q.trim() ? 1 : 0)

  const go = (href: string) => {
    onOpenChange(false)
    setQ('')
    router.push(href)
  }
  const choose = (i: number) => {
    if (i < items.length) go(`/aesthetics/${items[i].slug}`)
    else if (q.trim()) go(`/aesthetics?q=${encodeURIComponent(q.trim())}`)
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content
          className="fixed left-1/2 top-[12vh] z-[91] w-[min(640px,calc(100vw-1.5rem))] -translate-x-1/2 overflow-hidden rounded-2xl border border-line-strong bg-surface shadow-2xl shadow-black/50 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
          aria-describedby={undefined}
        >
          <Dialog.Title className="sr-only">Search aesthetics</Dialog.Title>
          <div className="flex items-center gap-3 border-b border-line px-4">
            {isFetching ? (
              <Loader2 className="size-4 shrink-0 animate-spin text-fg-subtle" aria-hidden />
            ) : (
              <Search className="size-4 shrink-0 text-fg-subtle" aria-hidden />
            )}
            <input
              autoFocus
              value={q}
              onChange={(e) => {
                setQ(e.target.value)
                setActive(0)
              }}
              onKeyDown={(e) => {
                if (e.key === 'ArrowDown') {
                  e.preventDefault()
                  setActive((a) => Math.min(total - 1, a + 1))
                } else if (e.key === 'ArrowUp') {
                  e.preventDefault()
                  setActive((a) => Math.max(0, a - 1))
                } else if (e.key === 'Enter') {
                  e.preventDefault()
                  choose(active)
                }
              }}
              placeholder="Search aesthetics, movements, crafts, eras…"
              className="h-14 w-full bg-transparent text-base text-fg placeholder:text-fg-subtle focus:outline-none"
              role="combobox"
              aria-expanded={total > 0}
              aria-controls="search-results"
              aria-activedescendant={total ? `search-opt-${active}` : undefined}
            />
            <kbd className="hidden rounded border border-line-strong px-1.5 py-0.5 font-mono text-[10px] text-fg-subtle sm:block">ESC</kbd>
          </div>
          <ul id="search-results" ref={listRef} role="listbox" className="max-h-[60vh] overflow-y-auto p-2 no-scrollbar">
            {debounced && isFetching && !items.length &&
              Array.from({ length: 4 }, (_, i) => (
                <li key={`sk-${i}`} className="flex items-center gap-3 px-3 py-2" aria-hidden>
                  <Skeleton className="size-11 shrink-0 rounded-lg" style={stagger(i)} />
                  <span className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/2" style={stagger(i)} />
                    <Skeleton className="h-3 w-1/4" style={stagger(i)} />
                  </span>
                </li>
              ))}
            {items.map((it, i) => (
              <li
                key={it.slug}
                id={`search-opt-${i}`}
                role="option"
                aria-selected={active === i}
                onMouseEnter={() => setActive(i)}
                onClick={() => choose(i)}
                className={`flex cursor-pointer items-center gap-3 rounded-xl px-2.5 py-2 ${active === i ? 'bg-surface-2' : ''}`}
              >
                <Thumb image={it.image} colors={it.colors} name={it.name} className="size-11 rounded-lg" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm text-fg">{it.name}</span>
                  <span className="block truncate text-xs text-fg-subtle">{it.category}</span>
                </span>
                {active === i && <CornerDownLeft className="size-3.5 text-fg-subtle" aria-hidden />}
              </li>
            ))}
            {q.trim() && (
              <li
                id={`search-opt-${items.length}`}
                role="option"
                aria-selected={active === items.length}
                onMouseEnter={() => setActive(items.length)}
                onClick={() => choose(items.length)}
                className={`flex cursor-pointer items-center gap-3 rounded-xl px-3 py-3 text-sm ${active === items.length ? 'bg-surface-2 text-fg' : 'text-fg-muted'}`}
              >
                <Search className="size-4" aria-hidden />
                <span className="flex-1">
                  Search all records for <span className="text-fg">“{q.trim()}”</span>
                </span>
                <ArrowRight className="size-4" aria-hidden />
              </li>
            )}
            {!q.trim() && (
              <li className="px-3 py-6 text-center text-sm text-fg-subtle">
                Try <span className="text-fg-muted">bauhaus</span>, <span className="text-fg-muted">wabi-sabi</span>,{' '}
                <span className="text-fg-muted">vaporwave</span> or <span className="text-fg-muted">kente</span>
              </li>
            )}
            {debounced && !isFetching && items.length === 0 && (
              <li className="px-3 pb-3 text-xs text-fg-subtle">No name matches — full-text search may still find it.</li>
            )}
          </ul>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
