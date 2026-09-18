'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'

export function CopyBlock({ label, code }: { label: string; code: string }) {
  const [done, setDone] = useState(false)
  return (
    <figure className="overflow-hidden rounded-2xl border border-line bg-surface">
      <figcaption className="flex items-center justify-between gap-3 border-b border-line px-4 py-2.5">
        <span className="text-xs text-fg-subtle">{label}</span>
        <button
          type="button"
          onClick={async () => {
            await navigator.clipboard.writeText(code).catch(() => {})
            setDone(true)
            setTimeout(() => setDone(false), 1400)
          }}
          className="flex items-center gap-1.5 text-xs text-fg-subtle hover:text-fg"
          aria-label={`Copy: ${label}`}
        >
          {done ? <Check className="size-3.5" aria-hidden /> : <Copy className="size-3.5" aria-hidden />}
          {done ? 'Copied' : 'Copy'}
        </button>
      </figcaption>
      <pre className="no-scrollbar overflow-x-auto p-4 font-mono text-[12.5px] leading-relaxed text-fg-muted">
        <code>{code}</code>
      </pre>
    </figure>
  )
}
