'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { toast } from 'sonner'
import type { ColorEntry } from '@/lib/aesthetic'
import { contrast } from '@/lib/theme'

const rgbOf = (hex: string): [number, number, number] => {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

export async function copyText(text: string, what: string) {
  try {
    await navigator.clipboard.writeText(text)
    toast.success(`${what} copied`)
    return true
  } catch {
    toast.error(`Couldn’t copy ${what.toLowerCase()}`)
    return false
  }
}

export function PaletteSwatches({ colors, name }: { colors: ColorEntry[]; name: string }) {
  const [copied, setCopied] = useState<string | null>(null)
  if (!colors.length) return null
  const copy = async (hex: string) => {
    if (await copyText(hex.toUpperCase(), hex.toUpperCase())) {
      setCopied(hex)
      setTimeout(() => setCopied(null), 1400)
    }
  }
  return (
    <div>
      <div className="flex h-40 overflow-hidden rounded-2xl ring-1 ring-inset ring-line sm:h-48" role="list" aria-label={`${name} palette`}>
        {colors.map((c, i) => {
          const rgb = rgbOf(c.hex)
          const ink = contrast(rgb, [255, 255, 255]) > contrast(rgb, [0, 0, 0]) ? '#fff' : '#111'
          return (
            <button
              key={`${c.hex}-${i}`}
              type="button"
              role="listitem"
              onClick={() => copy(c.hex)}
              className="group relative flex flex-1 flex-col justify-end p-3 text-left transition-[flex-grow] duration-500 ease-out hover:flex-[1.6] focus-visible:flex-[1.6] focus-visible:outline-none"
              style={{ background: c.hex, color: ink }}
              aria-label={`Copy ${c.name || 'colour'} ${c.hex}`}
            >
              <span className="block truncate text-[11px] opacity-80">{c.name}</span>
              <span className="mt-0.5 flex items-center gap-1.5 font-mono text-xs uppercase">
                {c.hex}
                {copied === c.hex ? (
                  <Check className="size-3" aria-hidden />
                ) : (
                  <Copy className="size-3 opacity-0 transition-opacity group-hover:opacity-70" aria-hidden />
                )}
              </span>
            </button>
          )
        })}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <SmallButton onClick={() => copyText(colors.map((c) => c.hex).join(', '), 'Hex list')}>Copy hex list</SmallButton>
        <SmallButton
          onClick={() =>
            copyText(
              `:root {\n${colors.map((c, i) => `  --color-${i + 1}: ${c.hex}; /* ${c.name} */`).join('\n')}\n}`,
              'CSS variables'
            )
          }
        >
          Copy CSS variables
        </SmallButton>
        <SmallButton onClick={() => copyText(JSON.stringify(colors, null, 2), 'Palette JSON')}>Copy JSON</SmallButton>
      </div>
    </div>
  )
}

export function SmallButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full border border-line-strong px-3 py-1.5 text-xs text-fg-muted transition-colors hover:border-fg-subtle hover:text-fg"
    >
      {children}
    </button>
  )
}
