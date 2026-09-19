'use client'

import { useEffect, useState, useSyncExternalStore } from 'react'
import { Check, Cpu, Download, ExternalLink, Loader2, Sparkles } from 'lucide-react'
import type { AestheticFull } from '@/lib/aesthetic'
import { IMAGE_MODEL, generateImage, imageModelCached, webgpuStatus } from '@/lib/ai/engine'

const noop = () => () => {}

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
  const [cached, setCached] = useState(false)
  // Decided after hydration (server and first client render agree).
  const gpu = useSyncExternalStore(noop, () => JSON.stringify(webgpuStatus()), () => JSON.stringify({ ok: true }))
  const { ok: gpuOk, reason } = JSON.parse(gpu) as { ok: boolean; reason?: string }
  useEffect(() => {
    let live = true
    imageModelCached().then((c) => live && setCached(c))
    return () => {
      live = false
    }
  }, [])

  const run = async () => {
    setStatus('Loading model…')
    try {
      const url = await generateImage(prompt, setStatus)
      setImages((xs) => [url, ...xs].slice(0, 6))
      setStatus(null)
      setCached(true)
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
        {/* The model, stated plainly: what it is, how big, and where it runs. */}
        <div className="rounded-2xl border border-line bg-surface p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="eyebrow">Image model</p>
              <p className="mt-1 text-lg text-fg">{IMAGE_MODEL.label}</p>
              <p className="text-xs text-fg-subtle">
                {IMAGE_MODEL.publisher} · {IMAGE_MODEL.license} licence ·{' '}
                <a href={IMAGE_MODEL.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-0.5 underline-offset-4 hover:underline">
                  model card <ExternalLink className="size-3" aria-hidden />
                </a>
              </p>
            </div>
            {cached ? (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-accent-soft px-2.5 py-1 text-xs text-fg">
                <Check className="size-3.5" aria-hidden /> Ready on this device
              </span>
            ) : (
              <span className="shrink-0 rounded-full border border-line-strong px-2.5 py-1 font-mono text-xs text-fg-muted">{IMAGE_MODEL.size}</span>
            )}
          </div>
          <p className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-fg-subtle">
            <Cpu className="mt-0.5 size-3.5 shrink-0" aria-hidden />
            {gpuOk
              ? cached
                ? 'Runs on your GPU (WebGPU). Nothing is uploaded — the prompt and the image stay in this browser.'
                : `Runs on your GPU (WebGPU). The first run downloads ${IMAGE_MODEL.size} once and keeps it cached; nothing is uploaded.`
              : reason}
          </p>
          {gpuOk && (
            <button
              type="button"
              onClick={run}
              disabled={!!status || !prompt.trim()}
              className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-fg px-5 text-sm font-medium text-bg transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {status ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Sparkles className="size-4" aria-hidden />}
              {status ?? (cached ? 'Generate an image' : `Download (${IMAGE_MODEL.size}) & generate`)}
            </button>
          )}
        </div>
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
