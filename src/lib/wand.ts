'use client'

// Cursor preference (kept in this browser): which wand, whether it leaves a trail, or the
// system cursor. Same tiny external-store pattern as src/lib/saved.ts.
import { useSyncExternalStore } from 'react'

export const WAND_IDS = ['willow', 'star', 'elder', 'crystal', 'rune', 'moon'] as const
export type WandId = (typeof WAND_IDS)[number]
/** trail: on/off; intensity: trail strength 0–1 (default 0.15). */
export type WandPrefs = { wand: WandId | 'system'; trail: boolean; intensity: number }

const KEY = 'aestheticpedia:wand:v1'
const DEFAULT: WandPrefs = { wand: 'willow', trail: true, intensity: 0.15 }
const listeners = new Set<() => void>()
let cache: WandPrefs | null = null

function read(): WandPrefs {
  if (cache) return cache
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? 'null')
    cache =
      v && (WAND_IDS.includes(v.wand) || v.wand === 'system')
        ? { wand: v.wand, trail: v.trail !== false, intensity: typeof v.intensity === 'number' ? Math.min(1, Math.max(0, v.intensity)) : DEFAULT.intensity }
        : DEFAULT
  } catch {
    cache = DEFAULT
  }
  return cache
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

export function useWandPrefs(): WandPrefs {
  return useSyncExternalStore(subscribe, read, () => DEFAULT)
}

export function setWandPrefs(patch: Partial<WandPrefs>) {
  cache = { ...read(), ...patch }
  try {
    localStorage.setItem(KEY, JSON.stringify(cache))
  } catch {
    /* private mode: keep it for this visit */
  }
  listeners.forEach((l) => l())
}
