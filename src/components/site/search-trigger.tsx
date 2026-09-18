'use client'

import { Search } from 'lucide-react'

export const OPEN_SEARCH_EVENT = 'aestheticpedia:open-search'

/** Large search field on the home page — opens the global search palette. */
export function SearchTrigger({ total }: { total: number }) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(OPEN_SEARCH_EVENT))}
      className="flex h-14 flex-1 items-center gap-3 rounded-full border border-line-strong bg-surface/70 px-5 text-left text-fg-subtle backdrop-blur transition-colors hover:border-fg-subtle hover:text-fg"
    >
      <Search className="size-5" aria-hidden />
      <span className="flex-1">Search {total.toLocaleString('en')} aesthetics…</span>
      <kbd className="hidden rounded-full border border-line-strong px-2 py-0.5 font-mono text-[10px] sm:inline">/</kbd>
    </button>
  )
}
