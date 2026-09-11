'use client'

import type { ColorEntry } from '@/lib/aesthetic'
import { cn } from '@/lib/utils'

const HEX_RE = /^#?[0-9a-fA-F]{3,8}$/

export function normalizeHex(hex: string): string {
  const h = hex.startsWith('#') ? hex : `#${hex}`
  return HEX_RE.test(h) ? h : '#d6d3d1'
}

/**
 * Horizontal palette band. Height/rounding come from the parent className;
 * individual swatches expose hex + name via native title tooltips.
 */
export function PaletteStrip({
  colors,
  className,
  label,
}: {
  colors: ColorEntry[]
  className?: string
  label?: string
}) {
  const safe = colors.filter((c) => HEX_RE.test(c.hex.startsWith('#') ? c.hex : `#${c.hex}`))

  if (safe.length === 0) {
    return (
      <div
        className={cn('bg-gradient-to-r from-stone-300 via-[#e9e2d2] to-stone-300', className)}
        aria-hidden="true"
      />
    )
  }

  const names = safe.map((c) => c.name || c.hex).join(', ')
  return (
    <div
      className={cn('flex overflow-hidden', className)}
      role="img"
      aria-label={label ? `${label} — palette: ${names}` : `Palette: ${names}`}
    >
      {safe.map((c, i) => (
        <div
          key={`${c.hex}-${i}`}
          className="h-full flex-1 transition-[flex-grow] duration-200"
          style={{ backgroundColor: normalizeHex(c.hex) }}
          title={c.name ? `${c.name} · ${normalizeHex(c.hex)}` : normalizeHex(c.hex)}
        />
      ))}
    </div>
  )
}

/** One swatch chip with hex + name, used in detail ingredient grids. */
export function ColorSwatch({ color }: { color: ColorEntry }) {
  const hex = normalizeHex(color.hex)
  return (
    <span className="inline-flex items-center gap-2 rounded-md border border-stone-200 bg-white py-1 pl-1 pr-2.5">
      <span
        className="h-6 w-6 shrink-0 rounded border border-black/10"
        style={{ backgroundColor: hex }}
        aria-hidden="true"
      />
      <span className="text-xs leading-tight">
        <span className="block font-medium text-stone-800">{color.name || 'Unnamed'}</span>
        <span className="block font-mono text-[10px] uppercase text-stone-500">{hex}</span>
      </span>
    </span>
  )
}
