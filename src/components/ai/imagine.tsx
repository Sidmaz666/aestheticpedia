'use client'

import { useState } from 'react'
import { Download, Loader2, Sparkles } from 'lucide-react'
import type { AestheticFull } from '@/lib/aesthetic'
import { IMAGE_MODEL, generateImage, webgpuStatus } from '@/lib/ai/engine'

/** Prompt assembled only from the record's own data. */
export function promptFor(a: AestheticFull): string {
  const parts = [
    `An image in the ${a.name} aesthetic`,
    a.category ? `(${a.category.toLowerCase()}${a.periodStart ? `, ${a.periodStart}` : ''}${a.origin ? `, ${a.origin}` : ''})` : '',
    a.colors.length ? `Colour palette: ${a.colors.slice(0, 5).map((c) => c.name || c.hex).join(', ')}.` : '',
    a.materials.length ? `Materials: ${a.materials.slice(0, 4).join(', ')}.` : '',
    a.visualDNA.shape || a.visualDNA.composition ? `${a.visualDNA.shape ?? ''} ${a.visualDNA.composition ?? ''}`.trim() : '',
    a.objects.length ? `Featuring ${a.objects.slice(0, 3).join(', ')}.` : '',
    'Highly detailed, faithful to the style.',
  ]
  return parts.filter(Boolean).join(' ').replace(/\s+/g, ' ').slice(0, 600)
}

export function Imagine({ a }: { a: AestheticFull }) {
  const [prompt, setPrompt] = useState(() => promptFor(a))
  const [status, setStatus] = useState<string | null>(null)
  const [images, setImages] = useState<string[]>([])
  const [consent, setConsent] = useState(false)
  const gpu = typeof window === 'undefined' ? { ok: true } : webgpuStatus()

  const run = async () => {
    setStatus('Loading model…')
    try {
      const url = await generateImage(prompt, setStatus)
      setImages((xs) => [url, ...xs].slice(0, 6))
      setStatus(null)
    } catch (e) {
      setStatus(`Generation failed: ${e instanceof Error ? e.message : String(e)}`)
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
      <div className="space-y-4">
        <label className="block">
          <span className="eyebrow">Prompt (built from this record — edit freely)</span>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={6}
            className="mt-2 w-full resize-y rounded-xl border border-line-strong bg-bg p-3 text-sm leading-relaxed focus:outline-none"
          />
        </label>
        {!gpu.ok ? (
          <p className="rounded-xl bg-surface-2 p-3 text-sm text-fg-muted">{gpu.reason}</p>
        ) : (
          <>
            <label className="flex items-start gap-2 text-xs text-fg-subtle">
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 accent-[var(--accent)]" />
              <span>
                Download {IMAGE_MODEL.label} ({IMAGE_MODEL.size}) to run on this device. It is cached after the first time; nothing is
                uploaded.
              </span>
            </label>
            <button
              type="button"
              onClick={run}
              disabled={!consent || !!status}
              className="flex h-11 items-center gap-2 rounded-full bg-fg px-5 text-sm font-medium text-bg disabled:opacity-50"
            >
              {status ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Sparkles className="size-4" aria-hidden />}
              {status ?? 'Generate an image'}
            </button>
          </>
        )}
        <p className="text-xs text-fg-subtle">
          Generated images are AI interpretations, not documented examples of {a.name}. The real, sourced images are in the gallery above.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {images.length === 0 ? (
          <div className="col-span-2 grid aspect-[2/1] place-items-center rounded-2xl border border-dashed border-line-strong text-sm text-fg-subtle">
            Generated images appear here
          </div>
        ) : (
          images.map((src, i) => (
            <figure key={src} className="group relative overflow-hidden rounded-xl ring-1 ring-line">
              <img src={src} alt={`AI-generated interpretation of ${a.name} #${images.length - i}`} className="aspect-square w-full object-cover" />
              <figcaption className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/70 to-transparent p-2 text-[10px] text-white">
                AI-generated
                <a href={src} download={`${a.slug}-ai-${images.length - i}.png`} className="grid size-7 place-items-center rounded-full bg-white/20" aria-label="Download image">
                  <Download className="size-3.5" aria-hidden />
                </a>
              </figcaption>
            </figure>
          ))
        )}
      </div>
    </div>
  )
}
