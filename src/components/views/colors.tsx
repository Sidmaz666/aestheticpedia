'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { AestheticCard } from '@/components/aesthetic/card'
import type { AestheticSummary } from '@/lib/aesthetic'
import { fetchJson } from '@/lib/client'

export interface ColorAtlasData {
  records: [slug: string, name: string][]
  /** [hex, record index] */
  colors: [string, number][]
  spectra: { category: string; gradient: string; count: number }[]
}

const rgbOf = (hex: string) => {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255] as const
}
/** hue 0–360, saturation 0–1, lightness 0–1 */
function hsl(hex: string): [number, number, number] {
  const [r, g, b] = rgbOf(hex).map((v) => v / 255)
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  if (max === min) return [0, 0, l]
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  const h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4
  return [h * 60, s, l]
}

export function ColorAtlas({ data }: { data: ColorAtlasData }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [picked, setPicked] = useState<string>('#c9a227')
  const [hover, setHover] = useState<{ hex: string; name: string; x: number; y: number } | null>(null)
  const size = 640

  // Position every colour: angle = hue, radius = lightness (dark centre → light rim); greys along the centre band.
  const points = useMemo(
    () =>
      data.colors.map(([hex, i]) => {
        const [h, s, l] = hsl(hex)
        const rad = ((h - 90) * Math.PI) / 180
        const r = (0.12 + 0.86 * l) * (size / 2 - 8) * (s < 0.08 ? 0.35 : 1)
        return { hex, i, x: size / 2 + Math.cos(rad) * r, y: size / 2 + Math.sin(rad) * r }
      }),
    [data.colors]
  )

  useEffect(() => {
    const c = canvasRef.current!
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    c.width = size * dpr
    c.height = size * dpr
    const ctx = c.getContext('2d')!
    ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, size, size)
    for (const p of points) {
      ctx.fillStyle = p.hex
      ctx.beginPath()
      ctx.arc(p.x, p.y, 3.2, 0, Math.PI * 2)
      ctx.fill()
    }
  }, [points])

  const onMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * size
    const y = ((e.clientY - rect.top) / rect.height) * size
    let best = null as (typeof points)[number] | null
    let bd = 64
    for (const p of points) {
      const d = (p.x - x) ** 2 + (p.y - y) ** 2
      if (d < bd) {
        bd = d
        best = p
      }
    }
    setHover(best ? { hex: best.hex, name: data.records[best.i][1], x: e.clientX - rect.left, y: e.clientY - rect.top } : null)
  }

  const { data: matches, isFetching } = useQuery({
    queryKey: ['by-color', picked],
    queryFn: () => fetchJson<{ items: (AestheticSummary & { match: string; distance: number })[] }>(`/api/v1/colors?limit=24&hex=${picked.slice(1)}`),
  })

  return (
    <main className="mx-auto w-full max-w-[1600px] px-4 pb-16 pt-10 sm:px-6 lg:px-10">
      <p className="eyebrow">Colour atlas</p>
      <h1 className="display mt-2 text-6xl sm:text-7xl">Every palette, one wheel</h1>
      <p className="mt-3 max-w-2xl text-fg-muted">
        {data.colors.length.toLocaleString('en')} colours from {data.records.length.toLocaleString('en')} aesthetics, placed by
        hue (around the wheel) and lightness (dark centre, light rim). Hover to identify, click to find aesthetics that use
        a colour — or pick your own.
      </p>

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,640px)_1fr]">
        <div className="relative mx-auto w-full max-w-[640px]">
          <canvas
            ref={canvasRef}
            onPointerMove={onMove}
            onPointerLeave={() => setHover(null)}
            onClick={() => hover && setPicked(hover.hex)}
            className="aspect-square w-full cursor-crosshair rounded-full bg-surface ring-1 ring-line"
            style={{ width: '100%', height: 'auto' }}
            role="img"
            aria-label="Colour wheel of all aesthetic palettes"
          />
          {hover && (
            <span
              className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-[130%] whitespace-nowrap rounded-full border border-line-strong bg-bg/90 px-3 py-1 text-xs backdrop-blur"
              style={{ left: hover.x, top: hover.y }}
            >
              <span className="mr-1.5 inline-block size-2.5 rounded-full align-middle" style={{ background: hover.hex }} />
              {hover.hex} · {hover.name}
            </span>
          )}
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-3 rounded-full border border-line-strong py-1.5 pl-1.5 pr-4">
              <input
                type="color"
                value={picked}
                onChange={(e) => setPicked(e.target.value)}
                className="size-9 cursor-pointer rounded-full border-0 bg-transparent p-0"
                aria-label="Pick a colour"
              />
              <span className="font-mono text-sm uppercase">{picked}</span>
            </label>
            <p className="text-sm text-fg-subtle">
              Aesthetics whose palette contains the closest match {isFetching && <Loader2 className="inline size-3.5 animate-spin" aria-hidden />}
            </p>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
            {(matches?.items ?? []).map((a) => (
              <div key={a.slug} className="relative">
                <AestheticCard a={a} variant="compact" />
                <span className="pointer-events-none absolute left-2 top-2 flex items-center gap-1 rounded-full bg-black/55 px-2 py-0.5 font-mono text-[10px] text-white backdrop-blur">
                  <span className="size-2 rounded-full" style={{ background: a.match }} />
                  {a.match}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <section className="mt-20" aria-labelledby="spectra">
        <h2 id="spectra" className="display text-5xl">Category spectra</h2>
        <p className="mt-2 max-w-2xl text-sm text-fg-subtle">Every colour used by each category, sorted by hue — the chromatic signature of a field.</p>
        <ul className="mt-8 space-y-3">
          {data.spectra.map((s) => (
            <li key={s.category} className="grid items-center gap-2 sm:grid-cols-[16rem_1fr]">
              <span className="text-sm text-fg-muted">
                {s.category} <span className="text-fg-subtle">· {s.count}</span>
              </span>
              <span className="block h-7 rounded-full ring-1 ring-inset ring-line" style={{ background: s.gradient }} />
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}
