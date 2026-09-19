'use client'

// Starred aesthetics and blends, kept in this browser (localStorage) — no account needed.
// A tiny external store: every component reading it re-renders on change, in this tab and
// in other open tabs (via the `storage` event).
import { useSyncExternalStore } from 'react'

export type SavedItem = {
  /** "a:<slug>" for an aesthetic, "b:/blend?a=…&b=…" for a blend. */
  id: string
  kind: 'aesthetic' | 'blend'
  /** Site-relative link back to the page. */
  href: string
  name: string
  category: string
  image?: string
  /** Blends: the second parent's image, shown beside the first. */
  image2?: string
  colors: string[]
  savedAt: number
}

const KEY = 'aestheticpedia:saved:v1'
const EMPTY: SavedItem[] = []
const listeners = new Set<() => void>()
let cache: SavedItem[] | null = null

function read(): SavedItem[] {
  if (cache) return cache
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) ?? '[]')
    cache = Array.isArray(parsed) ? parsed.filter((x) => x && typeof x.id === 'string' && typeof x.href === 'string') : []
  } catch {
    cache = []
  }
  return cache
}

function write(items: SavedItem[]) {
  cache = items
  try {
    localStorage.setItem(KEY, JSON.stringify(items))
  } catch {
    /* storage full or blocked: keep the in-memory copy for this visit */
  }
  listeners.forEach((l) => l())
}

function subscribe(cb: () => void) {
  listeners.add(cb)
  const onStorage = (e: StorageEvent) => {
    if (e.key !== KEY) return
    cache = null
    cb()
  }
  window.addEventListener('storage', onStorage)
  return () => {
    listeners.delete(cb)
    window.removeEventListener('storage', onStorage)
  }
}

export function useSaved(): SavedItem[] {
  return useSyncExternalStore(subscribe, read, () => EMPTY)
}

export function useIsSaved(id: string): boolean {
  return useSyncExternalStore(subscribe, () => read().some((x) => x.id === id), () => false)
}

export function toggleSaved(item: Omit<SavedItem, 'savedAt'>): boolean {
  const items = read()
  if (items.some((x) => x.id === item.id)) {
    write(items.filter((x) => x.id !== item.id))
    return false
  }
  write([{ ...item, savedAt: Date.now() }, ...items].slice(0, 200))
  return true
}

export function removeSaved(id: string) {
  write(read().filter((x) => x.id !== id))
}
