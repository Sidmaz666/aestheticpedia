'use client'

import { useState } from 'react'
import type { ColorEntry } from '@/lib/aesthetic'

/**
 * Small thumbnail for a record: its first image; if it has none (or it fails to load), its
 * documented palette as colour bands; if it has neither, its initials. Never a blank box.
 */
export function Thumb({ image, colors, name, className = 'size-12 rounded-lg' }: { image?: string | null; colors?: ColorEntry[]; name: string; className?: string }) {
  const [failed, setFailed] = useState(false)
  if (image && !failed)
    return (
      <span className={`block shrink-0 overflow-hidden bg-surface-2 ${className}`}>
        <img src={image} alt="" loading="lazy" decoding="async" referrerPolicy="no-referrer" onError={() => setFailed(true)} className="size-full object-cover" />
      </span>
    )
  if (colors?.length)
    return (
      <span className={`flex shrink-0 overflow-hidden ring-1 ring-line ${className}`} title={`No image yet — palette: ${colors.map((c) => c.name || c.hex).join(', ')}`}>
        {colors.map((c, i) => (
          <span key={i} className="h-full flex-1" style={{ background: c.hex }} />
        ))}
      </span>
    )
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
  return (
    <span className={`grid shrink-0 place-items-center bg-accent-soft font-mono text-xs text-accent ${className}`} title="No image or palette documented yet">
      {initials}
    </span>
  )
}
