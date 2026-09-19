'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { toast } from 'sonner'

export function CopyButton({ text, label, className }: { text: string; label: string; className?: string }) {
  const [done, setDone] = useState(false)
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={className}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text)
          setDone(true)
          toast.success(`${label.replace(/^Copy /, '').replace(/^./, (c) => c.toUpperCase())} copied`)
          setTimeout(() => setDone(false), 1500)
        } catch {
          toast.error('Couldn’t copy')
        }
      }}
    >
      {done ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
    </button>
  )
}
