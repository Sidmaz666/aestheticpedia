'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Compass,
  FlaskConical,
  History,
  LayoutDashboard,
  Library,
  Loader2,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react'
import { useSuggest } from '@/components/atlas/api'
import type { ViewKind } from '@/components/atlas/view-kind'
import { cn } from '@/lib/utils'

const TABS: { key: ViewKind; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: 'atlas', label: 'Atlas', icon: Library },
  { key: 'explorer', label: 'Explorer', icon: SlidersHorizontal },
  { key: 'timeline', label: 'Timeline', icon: History },
  { key: 'lab', label: 'Lab', icon: FlaskConical },
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
]

interface HeaderProps {
  view: ViewKind
  onViewChange: (v: ViewKind) => void
  query: string
  onQueryChange: (q: string) => void
  onOpenDetail: (slug: string) => void
}

export function Header({ view, onViewChange, query, onQueryChange, onOpenDetail }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-stone-200 bg-[#faf8f4]/90 backdrop-blur supports-[backdrop-filter]:bg-[#faf8f4]/75">
      <div className="mx-auto w-full max-w-7xl px-4">
        <div className="flex h-14 items-center gap-3 sm:h-16 sm:gap-4">
          <button
            type="button"
            onClick={() => onViewChange('atlas')}
            className="flex min-h-[44px] shrink-0 items-center gap-2 rounded-md px-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b08d57]"
            aria-label="Aesthetic Atlas — go to atlas view"
          >
            <Compass className="h-6 w-6 text-[#8a6d3b]" aria-hidden="true" />
            <span className="font-serif text-lg tracking-[0.18em] text-stone-900 sm:text-xl">
              AESTHETIC&nbsp;ATLAS
            </span>
          </button>

          <div className="mx-auto hidden w-full max-w-md md:block">
            <SearchBox query={query} onQueryChange={onQueryChange} onOpenDetail={onOpenDetail} />
          </div>

          <nav aria-label="Primary" className="ml-auto hidden items-center gap-1 lg:flex">
            {TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => onViewChange(t.key)}
                aria-current={view === t.key ? 'page' : undefined}
                className={cn(
                  'flex min-h-[44px] items-center gap-1.5 border-b-2 px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b08d57]',
                  view === t.key
                    ? 'border-[#8a6d3b] font-medium text-stone-900'
                    : 'border-transparent text-stone-500 hover:text-stone-900'
                )}
              >
                <t.icon className="h-4 w-4" aria-hidden="true" />
                {t.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Mobile: search below brand row */}
        <div className="pb-3 md:hidden">
          <SearchBox query={query} onQueryChange={onQueryChange} onOpenDetail={onOpenDetail} />
        </div>

        {/* Mobile/tablet: scrollable tabs */}
        <nav
          aria-label="Primary"
          className="scrollbar-thin -mt-1 flex gap-1 overflow-x-auto pb-2 lg:hidden"
        >
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => onViewChange(t.key)}
              aria-current={view === t.key ? 'page' : undefined}
              className={cn(
                'flex min-h-[44px] shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b08d57]',
                view === t.key
                  ? 'border-stone-900 bg-stone-900 text-[#faf8f4]'
                  : 'border-stone-300 bg-white/60 text-stone-600 hover:bg-white'
              )}
            >
              <t.icon className="h-4 w-4" aria-hidden="true" />
              {t.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  )
}

function SearchBox({
  query,
  onQueryChange,
  onOpenDetail,
}: {
  query: string
  onQueryChange: (q: string) => void
  onOpenDetail: (slug: string) => void
}) {
  const [value, setValue] = useState(query)
  const [open, setOpen] = useState(false)
  const [debounced, setDebounced] = useState('')
  const [highlight, setHighlight] = useState(-1)
  const [inputFocused, setInputFocused] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const skipSync = useRef(false)

  // Debounce the suggestion query + live filter updates.
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), 200)
    return () => clearTimeout(t)
  }, [value])

  // Live-search the atlas as the user types.
  useEffect(() => {
    if (!skipSync.current) onQueryChange(value)
    skipSync.current = false
  }, [debounced])

  // Sync from parent (e.g. clear-all) when the input is not focused.
  // Adjusting state during render — the React-recommended pattern for
  // reacting to external prop changes without effect-induced cascades.
  const [lastExternal, setLastExternal] = useState(query)
  if (query !== lastExternal) {
    setLastExternal(query)
    if (!inputFocused) setValue(query)
  }

  const { data, isFetching } = useSuggest(debounced, debounced.trim().length >= 2)
  const suggestions = open && debounced.trim().length >= 2 ? (data?.items ?? []) : []

  useEffect(() => {
    const onDocMouseDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onDocMouseDown)
    return () => document.removeEventListener('mousedown', onDocMouseDown)
  }, [])

  const submit = useCallback(() => {
    setOpen(false)
    setHighlight(-1)
    onQueryChange(value)
    inputRef.current?.blur()
  }, [onQueryChange, value])

  const choose = useCallback(
    (slug: string) => {
      setOpen(false)
      setHighlight(-1)
      onOpenDetail(slug)
    },
    [onOpenDetail]
  )

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setOpen(true)
      setHighlight((h) => Math.min(h + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlight((h) => Math.max(h - 1, -1))
    } else if (e.key === 'Enter') {
      if (highlight >= 0 && suggestions[highlight]) {
        choose(suggestions[highlight].slug)
      } else {
        submit()
      }
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400"
          aria-hidden="true"
        />
        <input
          ref={inputRef}
          type="search"
          role="combobox"
          aria-expanded={suggestions.length > 0}
          aria-controls="header-suggest-list"
          aria-label="Search the aesthetic archive"
          placeholder="Search aesthetics, aliases, tags…"
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            setOpen(true)
            setHighlight(-1)
          }}
          onFocus={() => {
            setOpen(true)
            setInputFocused(true)
          }}
          onBlur={() => setInputFocused(false)}
          onKeyDown={onKeyDown}
          className="h-11 w-full rounded-full border border-stone-300 bg-white/80 pl-9 pr-9 text-sm text-stone-900 shadow-sm transition-colors placeholder:text-stone-400 focus:border-[#b08d57] focus:outline-none focus:ring-2 focus:ring-[#b08d57]/30 [&::-webkit-search-cancel-button]:hidden"
        />
        <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center">
          {isFetching ? (
            <Loader2 className="h-4 w-4 animate-spin text-stone-400" aria-hidden="true" />
          ) : value ? (
            <button
              type="button"
              aria-label="Clear search"
              className="rounded-full p-1 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b08d57]"
              onClick={() => {
                setValue('')
                onQueryChange('')
                inputRef.current?.focus()
              }}
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          ) : null}
        </div>
      </div>

      <AnimatePresence>
        {suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 top-full z-50 mt-1.5 overflow-hidden rounded-lg border border-stone-200 bg-white shadow-lg"
          >
            <p className="border-b border-stone-100 px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] text-stone-400">
              Archive entries
            </p>
            <ul id="header-suggest-list" role="listbox" aria-label="Search suggestions" className="scrollbar-thin max-h-80 overflow-y-auto">
              {suggestions.map((s, i) => (
                <li key={s.slug} role="option" aria-selected={i === highlight}>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => choose(s.slug)}
                    onMouseEnter={() => setHighlight(i)}
                    className={cn(
                      'flex w-full items-baseline justify-between gap-3 px-3 py-2.5 text-left transition-colors',
                      i === highlight ? 'bg-[#f5efe1]' : 'bg-white'
                    )}
                  >
                    <span className="truncate font-medium text-stone-800">{s.name}</span>
                    <span className="shrink-0 text-xs text-stone-400">{s.category}</span>
                  </button>
                </li>
              ))}
            </ul>
            <div className="border-t border-stone-100 px-3 py-1.5 text-[11px] text-stone-400">
              Press <kbd className="rounded border border-stone-300 px-1">Enter</kbd> to search the
              full archive
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
