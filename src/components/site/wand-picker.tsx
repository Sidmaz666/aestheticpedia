'use client'

import { useState, useSyncExternalStore } from 'react'
import * as Popover from '@radix-ui/react-popover'
import { MousePointer2, WandSparkles } from 'lucide-react'
import { setWandPrefs, useWandPrefs, WAND_IDS } from '@/lib/wand'
import { WAND_MQ } from './magic-cursor'
import { WandArt, WANDS } from './wands'

const noop = () => () => {}

/** Header menu for the cursor: pick a wand, toggle its trail, or go back to the system cursor. */
export function WandPicker() {
  const prefs = useWandPrefs()
  const [open, setOpen] = useState(false)
  // Wands only exist for mouse/trackpad users; on touch screens the menu is hidden.
  const fine = useSyncExternalStore(noop, () => window.matchMedia(WAND_MQ).matches, () => false)
  if (!fine) return null
  const current = prefs.wand === 'system' ? null : WANDS[prefs.wand]
  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          aria-label={`Cursor: ${current ? `${current.name} wand` : 'system'}`}
          title="Cursor"
          className="hidden size-10 place-items-center rounded-full text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg data-[state=open]:bg-surface-2 data-[state=open]:text-fg sm:grid"
        >
          <WandSparkles className="size-4" aria-hidden />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={10}
          collisionPadding={12}
          className="z-[99999] w-[min(22rem,calc(100vw-1.5rem))] rounded-2xl border border-line-strong bg-surface p-3 text-fg shadow-2xl shadow-black/50 outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
        >
          <p className="eyebrow px-1">Cursor</p>
          <p className="px-1 pt-1 text-sm text-fg-muted">Choose a wand. Its magic takes each aesthetic’s colours.</p>
          <div role="radiogroup" aria-label="Wand" className="mt-3 grid grid-cols-3 gap-2">
            {WAND_IDS.map((id) => {
              const w = WANDS[id]
              const on = prefs.wand === id
              return (
                <button
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  title={w.blurb}
                  onClick={() => setWandPrefs({ wand: id })}
                  className={`group flex flex-col items-center gap-1.5 rounded-xl border p-2.5 text-xs transition-colors ${
                    on ? 'border-accent bg-accent-soft text-fg' : 'border-line text-fg-muted hover:border-line-strong hover:text-fg'
                  }`}
                >
                  <span className="grid size-12 place-items-center">
                    <WandArt id={id} size={42} className="transition-transform duration-300 group-hover:-rotate-12" />
                  </span>
                  {w.name}
                </button>
              )
            })}
          </div>
          {current && <p className="mt-2 px-1 text-xs text-fg-subtle">{current.blurb}</p>}
          <div className="mt-3 space-y-3 border-t border-line px-1 pt-3">
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                role="switch"
                aria-checked={prefs.trail}
                disabled={prefs.wand === 'system'}
                onClick={() => setWandPrefs({ trail: !prefs.trail })}
                className="flex items-center gap-2.5 text-sm text-fg disabled:opacity-40"
              >
                <span aria-hidden className={`relative inline-block h-5 w-9 shrink-0 rounded-full p-0.5 transition-colors ${prefs.trail ? 'bg-accent' : 'bg-line-strong'}`}>
                  <span className={`block size-4 rounded-full bg-bg shadow transition-transform ${prefs.trail ? 'translate-x-4' : ''}`} />
                </span>
                Trail
              </button>
              <span className="font-mono text-xs text-fg-subtle" aria-hidden>
                {prefs.trail ? `${Math.round(prefs.intensity * 100)}%` : 'Off'}
              </span>
            </div>
            <label className={`block ${!prefs.trail || prefs.wand === 'system' ? 'opacity-40' : ''}`}>
              <span className="sr-only">Trail strength</span>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={Math.round(prefs.intensity * 100)}
                disabled={!prefs.trail || prefs.wand === 'system'}
                onChange={(e) => setWandPrefs({ intensity: Number(e.target.value) / 100 })}
                aria-valuetext={`${Math.round(prefs.intensity * 100)}%`}
                className="audio-range w-full"
                style={{ ['--pct' as string]: `${Math.round(prefs.intensity * 100)}%` }}
              />
              <span className="mt-1 flex justify-between text-[10px] uppercase tracking-[0.14em] text-fg-subtle" aria-hidden>
                <span>Subtle</span>
                <span>Lavish</span>
              </span>
            </label>
          </div>
          <div className="mt-3 flex justify-end border-t border-line px-1 pt-3">
            <button
              type="button"
              aria-pressed={prefs.wand === 'system'}
              onClick={() => setWandPrefs({ wand: prefs.wand === 'system' ? 'willow' : 'system' })}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors ${
                prefs.wand === 'system' ? 'border-accent bg-accent-soft text-fg' : 'border-line-strong text-fg-muted hover:text-fg'
              }`}
            >
              <MousePointer2 className="size-3.5" aria-hidden /> System cursor
            </button>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
