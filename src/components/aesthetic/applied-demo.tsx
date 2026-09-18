'use client'

// "Live demo": the aesthetic applied, built only from what the record documents — its real
// images (with credits), measured palette, font pairing and text. Nothing is generated or
// invented: every picture shown here is one of the record's own freely licensed images.
import { useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react'
import { ImageOff, Move3d } from 'lucide-react'
import type { AestheticFull, ColorEntry } from '@/lib/aesthetic'

type Tab = 'web' | 'poster' | 'ui' | 'type' | 'map' | 'gallery3d'
const TABS: { id: Tab; label: string; needsImages?: boolean }[] = [
  { id: 'gallery3d', label: '3D gallery', needsImages: true },
  { id: 'web', label: 'Web page' },
  { id: 'poster', label: 'Poster' },
  { id: 'map', label: 'Palette map', needsImages: true },
  { id: 'ui', label: 'UI kit' },
  { id: 'type', label: 'Type' },
]

function autoTab(a: AestheticFull): Tab {
  const n = a.images.length
  const cat = `${a.category} ${a.subcategory}`.toLowerCase()
  if (n >= 4 && /art|painting|architect|regional|religious|textile|craft|sculpt|photograph|film/.test(cat)) return 'gallery3d'
  if (n >= 1 && /fashion|dress|subculture|music/.test(cat)) return 'poster'
  if (/internet|web|graphic|technology|game/.test(cat)) return 'web'
  if (n >= 4) return 'gallery3d'
  return n ? 'poster' : 'ui'
}

// ---------------------------------------------------------------------------
// Colour utilities (real WCAG contrast for the UI kit)
// ---------------------------------------------------------------------------
const rgb = (hex: string): [number, number, number] => {
  const h = hex.replace('#', '')
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
}
const lum = (hex: string) => {
  const [r, g, b] = rgb(hex).map((v) => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
const contrast = (a: string, b: string) => {
  const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m)
  return (x + 0.05) / (y + 0.05)
}
const onColor = (hex: string) => (contrast(hex, '#ffffff') >= contrast(hex, '#111111') ? '#ffffff' : '#111111')

const credit = (img: AestheticFull['images'][number]) => [img.artist, img.date, img.license, img.source].filter(Boolean).join(' · ')

// ---------------------------------------------------------------------------
export function AppliedDemo({ a }: { a: AestheticFull }) {
  const [tab, setTab] = useState<Tab>(() => autoTab(a))
  const images = a.images.filter((i) => i.url)
  const colors = a.colors.length ? a.colors : [{ hex: '#888888', name: 'neutral' }]
  const available = TABS.filter((t) => !t.needsImages || images.length > (t.id === 'gallery3d' ? 2 : 0))

  return (
    <div>
      <div role="tablist" aria-label="Live demo views" className="no-scrollbar -mx-1 mb-5 flex gap-1.5 overflow-x-auto px-1">
        {available.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`shrink-0 rounded-full border px-4 py-1.5 text-sm transition-colors ${tab === t.id ? 'border-accent bg-accent text-accent-fg' : 'border-line-strong text-fg-muted hover:text-fg'}`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div role="tabpanel">
        {tab === 'gallery3d' && <Gallery3D a={a} images={images} />}
        {tab === 'web' && <WebPage a={a} images={images} colors={colors} />}
        {tab === 'poster' && <Poster a={a} images={images} colors={colors} />}
        {tab === 'map' && <PaletteMap a={a} images={images} colors={colors} />}
        {tab === 'ui' && <UIKit a={a} images={images} colors={colors} />}
        {tab === 'type' && <TypeSpecimen a={a} />}
      </div>
      <p className="mt-4 text-xs text-fg-subtle">
        Built only from this record: {images.length} documented image{images.length === 1 ? '' : 's'} (credited on hover), {a.colors.length} palette colour{a.colors.length === 1 ? '' : 's'}
        {a.paletteSource === 'derived' ? ' measured from those images' : ''}, and {a.typePairing.display ? `the ${a.typePairing.display} / ${a.typePairing.body ?? 'body'} pairing` : 'the site’s default type'}.
      </p>
    </div>
  )
}

type Props = { a: AestheticFull; images: AestheticFull['images']; colors: ColorEntry[] }

// ---------------------------------------------------------------------------
// 3D gallery: the record's own images on a ring you can drag.
// ---------------------------------------------------------------------------
function Gallery3D({ a, images }: { a: AestheticFull; images: AestheticFull['images'] }) {
  const items = images.slice(0, 12)
  const n = items.length
  const ring = useRef<HTMLDivElement>(null)
  const state = useRef({ angle: 0, velocity: 0.08, dragging: false, lastX: 0, tilt: -6 })
  const [active, setActive] = useState(0)
  const [width, setWidth] = useState(220)
  const radius = Math.round(width / 2 / Math.tan(Math.PI / Math.max(n, 3)) + 24)

  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth < 640 ? 150 : 220)
    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let raf = 0
    const tick = () => {
      const s = state.current
      if (!s.dragging) {
        s.angle += reduce ? 0 : s.velocity
        s.velocity += ((reduce ? 0 : 0.08) - s.velocity) * 0.02
      }
      if (ring.current) ring.current.style.transform = `translateZ(${-radius}px) rotateX(${s.tilt}deg) rotateY(${s.angle}deg)`
      const front = Math.round(((-s.angle % 360) + 360) % 360 / (360 / n)) % n
      setActive((cur) => (cur === front ? cur : front))
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [n, radius])

  const onDown = (e: ReactPointerEvent) => {
    state.current.dragging = true
    state.current.lastX = e.clientX
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }
  const onMove = (e: ReactPointerEvent) => {
    const s = state.current
    if (!s.dragging) return
    const dx = e.clientX - s.lastX
    s.lastX = e.clientX
    s.angle += dx * 0.25
    s.velocity = dx * 0.25
    s.tilt = Math.max(-16, Math.min(8, s.tilt + e.movementY * 0.05))
  }
  const onUp = () => (state.current.dragging = false)
  const step = (dir: number) => {
    state.current.angle -= dir * (360 / n)
    state.current.velocity = 0
  }
  const img = items[active]

  return (
    <div className="overflow-hidden rounded-[calc(1.5rem*var(--r-scale,1))] border border-line bg-[radial-gradient(ellipse_at_50%_30%,var(--surface-2),var(--bg)_70%)]">
      <div
        className="relative h-[380px] cursor-grab touch-pan-y select-none active:cursor-grabbing sm:h-[460px]"
        style={{ perspective: '1100px' }}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') step(-1)
          if (e.key === 'ArrowRight') step(1)
        }}
        tabIndex={0}
        role="group"
        aria-roledescription="3D carousel"
        aria-label={`${a.name}: ${n} documented images. Drag or use the arrow keys to turn.`}
      >
        <div ref={ring} className="absolute left-1/2 top-1/2" style={{ transformStyle: 'preserve-3d', width: 0, height: 0 }}>
          {items.map((im, i) => (
            <figure
              key={im.url}
              className="absolute overflow-hidden rounded-[calc(0.75rem*var(--r-scale,1))] bg-surface shadow-2xl shadow-black/40 ring-1 ring-line"
              style={{
                width,
                height: width * 1.3,
                left: -width / 2,
                top: -(width * 1.3) / 2,
                transform: `rotateY(${(360 / n) * i}deg) translateZ(${radius}px)`,
                backfaceVisibility: 'hidden',
              }}
            >
              <img src={im.thumb ?? im.url} alt={im.caption} draggable={false} loading="lazy" referrerPolicy="no-referrer" className="size-full object-cover" />
            </figure>
          ))}
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-bg to-transparent" />
        <span className="pointer-events-none absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-bg/70 px-3 py-1 text-xs text-fg-muted backdrop-blur">
          <Move3d className="size-3.5" aria-hidden /> Drag to turn
        </span>
      </div>
      {img && (
        <div className="flex items-start justify-between gap-4 border-t border-line p-4 text-sm">
          <div className="min-w-0">
            <p className="line-clamp-2 text-fg">{img.caption}</p>
            <p className="mt-1 truncate text-xs text-fg-subtle">{credit(img)}</p>
          </div>
          <div className="flex shrink-0 gap-1.5">
            <button type="button" onClick={() => step(-1)} className="grid size-9 place-items-center rounded-full border border-line-strong text-fg-muted hover:text-fg" aria-label="Previous image">
              ‹
            </button>
            <button type="button" onClick={() => step(1)} className="grid size-9 place-items-center rounded-full border border-line-strong text-fg-muted hover:text-fg" aria-label="Next image">
              ›
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Web page: a landing page assembled from the record.
// ---------------------------------------------------------------------------
function WebPage({ a, images, colors }: Props) {
  const hero = images[0]
  const cards = images.slice(1, 4)
  const nav = ['Overview', 'Gallery', 'Palette', 'Sources']
  return (
    <div className="overflow-hidden rounded-[calc(1rem*var(--r-scale,1))] border border-line-strong bg-bg shadow-2xl shadow-black/30">
      <div className="flex items-center gap-2 border-b border-line bg-surface-2 px-3 py-2">
        <span className="flex gap-1.5">
          {['#ff5f57', '#febc2e', '#28c840'].map((c) => (
            <span key={c} className="size-2.5 rounded-full" style={{ background: c }} />
          ))}
        </span>
        <span className="mx-auto truncate rounded-full bg-bg px-4 py-0.5 font-mono text-[11px] text-fg-subtle">{a.slug}.example</span>
      </div>
      <header className="flex items-center justify-between px-5 py-4 sm:px-8">
        <span className="display text-xl text-fg">{a.name}</span>
        <nav className="hidden gap-5 text-sm text-fg-muted sm:flex">
          {nav.map((n) => (
            <span key={n}>{n}</span>
          ))}
        </nav>
      </header>
      <section className="relative isolate min-h-[300px] overflow-hidden px-5 py-14 sm:px-8 sm:py-20">
        {hero && <img src={hero.url} alt="" referrerPolicy="no-referrer" className="absolute inset-0 -z-10 size-full object-cover" />}
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-bg via-bg/80 to-transparent" />
        <p className="eyebrow">{[a.periodStart, a.origin].filter(Boolean).join(' · ') || a.category}</p>
        <h3 className="display mt-3 max-w-xl text-4xl leading-[1.05] text-fg sm:text-6xl">{a.name}</h3>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-fg-muted sm:text-base">{a.summary}</p>
        <span className="mt-6 inline-flex h-10 items-center rounded-[calc(999px*var(--r-scale,1))] bg-accent px-5 text-sm font-medium text-accent-fg">Explore the style</span>
      </section>
      {cards.length > 0 && (
        <section className="grid gap-4 p-5 sm:grid-cols-3 sm:p-8">
          {cards.map((c) => (
            <figure key={c.url} className="overflow-hidden rounded-[calc(0.75rem*var(--r-scale,1))] border border-line bg-surface" title={credit(c)}>
              <img src={c.thumb ?? c.url} alt={c.caption} loading="lazy" referrerPolicy="no-referrer" className="aspect-[4/3] w-full object-cover" />
              <figcaption className="line-clamp-2 p-3 text-xs text-fg-muted">{c.caption}</figcaption>
            </figure>
          ))}
        </section>
      )}
      <footer className="flex h-3">
        {colors.map((c, i) => (
          <span key={i} className="flex-1" style={{ background: c.hex }} />
        ))}
      </footer>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Poster: one real image, the documented facts, the palette.
// ---------------------------------------------------------------------------
function Poster({ a, images, colors }: Props) {
  const [i, setI] = useState(0)
  const img = images[i]
  const ink = colors.reduce((best, c) => (contrast(c.hex, colors[0].hex) > contrast(best.hex, colors[0].hex) ? c : best), colors[0])
  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,26rem)_1fr]">
      <div className="relative aspect-[3/4] overflow-hidden rounded-[calc(0.5rem*var(--r-scale,1))] shadow-2xl shadow-black/40" style={{ background: colors[0].hex, color: onColor(colors[0].hex) }}>
        {img ? (
          <img src={img.url} alt={img.caption} referrerPolicy="no-referrer" className="absolute inset-0 size-full object-cover" />
        ) : (
          <div className="absolute inset-0 grid place-items-center opacity-60">
            <ImageOff className="size-10" aria-hidden />
          </div>
        )}
        <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${colors[0].hex} 8%, transparent 60%)` }} />
        <div className="absolute inset-x-0 bottom-0 p-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em]" style={{ color: ink.hex }}>
            {[a.periodStart, a.origin].filter(Boolean).join(' — ') || a.category}
          </p>
          <p className="display mt-2 text-5xl leading-[0.95]" style={{ color: onColor(colors[0].hex) }}>
            {a.name}
          </p>
          <div className="mt-4 flex h-2 overflow-hidden rounded-full">
            {colors.map((c, k) => (
              <span key={k} className="flex-1" style={{ background: c.hex }} />
            ))}
          </div>
        </div>
      </div>
      <div className="space-y-4 text-sm text-fg-muted">
        <p>A poster set from the record: the image is one of its documented pictures, the colours are its palette, the headline uses its display face.</p>
        {img && <p className="text-xs text-fg-subtle">Image: {img.caption} — {credit(img)}</p>}
        {images.length > 1 && (
          <div className="flex flex-wrap gap-2">
            {images.slice(0, 10).map((im, k) => (
              <button key={im.url} type="button" onClick={() => setI(k)} aria-label={`Use image ${k + 1}`} className={`size-14 overflow-hidden rounded-lg ring-2 ${k === i ? 'ring-accent' : 'ring-transparent opacity-70 hover:opacity-100'}`}>
                <img src={im.thumb ?? im.url} alt="" loading="lazy" referrerPolicy="no-referrer" className="size-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Palette map: the real image redrawn using only the record's palette.
// ---------------------------------------------------------------------------
function PaletteMap({ images, colors }: Props) {
  const [i, setI] = useState(0)
  const [split, setSplit] = useState(50)
  const [error, setError] = useState<string | null>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const img = images[i]
  const pal = useMemo(() => colors.map((c) => rgb(c.hex)), [colors])

  useEffect(() => {
    if (!img) return
    const el = new Image()
    el.crossOrigin = 'anonymous'
    el.referrerPolicy = 'no-referrer'
    el.onload = () => {
      const c = canvas.current
      if (!c) return
      const scale = Math.min(1, 900 / el.naturalWidth)
      c.width = Math.round(el.naturalWidth * scale)
      c.height = Math.round(el.naturalHeight * scale)
      const ctx = c.getContext('2d', { willReadFrequently: true })!
      ctx.drawImage(el, 0, 0, c.width, c.height)
      let data: ImageData
      try {
        data = ctx.getImageData(0, 0, c.width, c.height)
      } catch {
        setError('This image’s host does not allow its pixels to be read, so it can’t be remapped. Pick another image.')
        return
      }
      // Nearest palette colour with 4×4 ordered dithering (perceptually weighted RGB).
      const B = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5]
      const d = data.data
      for (let y = 0; y < c.height; y++)
        for (let x = 0; x < c.width; x++) {
          const k = (y * c.width + x) * 4
          const t = (B[(y & 3) * 4 + (x & 3)] / 16 - 0.5) * 24
          const r = d[k] + t
          const g = d[k + 1] + t
          const b = d[k + 2] + t
          let best = 0
          let bd = Infinity
          for (let p = 0; p < pal.length; p++) {
            const dr = r - pal[p][0]
            const dg = g - pal[p][1]
            const db = b - pal[p][2]
            const dist = 2 * dr * dr + 4 * dg * dg + 3 * db * db
            if (dist < bd) {
              bd = dist
              best = p
            }
          }
          d[k] = pal[best][0]
          d[k + 1] = pal[best][1]
          d[k + 2] = pal[best][2]
        }
      ctx.putImageData(data, 0, 0)
    }
    el.onerror = () => setError('The image could not be loaded.')
    el.src = img.url
  }, [img, pal])

  if (!img) return null
  return (
    <div className="space-y-4">
      <div className="relative mx-auto max-w-4xl overflow-hidden rounded-[calc(1rem*var(--r-scale,1))] border border-line bg-surface">
        <img src={img.url} alt={img.caption} referrerPolicy="no-referrer" className="block w-full" />
        {!error && (
          <canvas ref={canvas} aria-label={`The same image drawn with only the ${colors.length} palette colours`} className="absolute inset-0 size-full" style={{ clipPath: `inset(0 0 0 ${split}%)` } as CSSProperties} />
        )}
        {!error && (
          <>
            <span className="pointer-events-none absolute inset-y-0 w-0.5 bg-white/80 shadow" style={{ left: `${split}%` }} />
            <input type="range" min={0} max={100} value={split} onChange={(e) => setSplit(Number(e.target.value))} aria-label="Compare original and palette-mapped image" className="absolute inset-0 size-full cursor-ew-resize opacity-0" />
            <span className="absolute left-3 top-3 rounded-full bg-black/55 px-2.5 py-1 text-[11px] text-white">Original</span>
            <span className="absolute right-3 top-3 rounded-full bg-black/55 px-2.5 py-1 text-[11px] text-white">Palette only · {colors.length} colours</span>
          </>
        )}
      </div>
      {error && <p className="text-sm text-fg-muted">{error}</p>}
      <p className="text-xs text-fg-subtle">
        {img.caption} — {credit(img)}. Drag across the picture to compare it with the same image drawn using only this record’s palette.
      </p>
      {images.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {images.slice(0, 10).map((im, k) => (
            <button key={im.url} type="button" onClick={() => {
                setI(k)
                setError(null)
              }} aria-label={`Map image ${k + 1}`} className={`size-14 overflow-hidden rounded-lg ring-2 ${k === i ? 'ring-accent' : 'ring-transparent opacity-70 hover:opacity-100'}`}>
              <img src={im.thumb ?? im.url} alt="" loading="lazy" referrerPolicy="no-referrer" className="size-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// UI kit: components in the palette, with measured contrast.
// ---------------------------------------------------------------------------
function UIKit({ a, images, colors }: Props) {
  const [on, setOn] = useState(true)
  const card = images[0]
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-5 rounded-[calc(1.25rem*var(--r-scale,1))] border border-line bg-surface p-6">
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex h-10 items-center rounded-[calc(999px*var(--r-scale,1))] bg-accent px-5 text-sm font-medium text-accent-fg">Primary</span>
          <span className="inline-flex h-10 items-center rounded-[calc(999px*var(--r-scale,1))] border border-line-strong px-5 text-sm text-fg">Secondary</span>
          <span className="inline-flex h-10 items-center rounded-[calc(999px*var(--r-scale,1))] px-5 text-sm text-accent underline-offset-4 hover:underline">Link</span>
        </div>
        <label className="block text-sm">
          <span className="text-fg-muted">Search {a.name}</span>
          <span className="mt-1.5 flex h-11 items-center rounded-[calc(0.75rem*var(--r-scale,1))] border border-line-strong bg-bg px-3 text-fg-subtle">{a.tags[0] ?? a.category}…</span>
        </label>
        <button type="button" onClick={() => setOn((v) => !v)} className="flex items-center gap-3 text-sm text-fg" aria-pressed={on}>
          <span className={`relative h-6 w-11 rounded-full transition-colors ${on ? 'bg-accent' : 'bg-line-strong'}`}>
            <span className={`absolute top-0.5 size-5 rounded-full bg-bg shadow transition-transform ${on ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </span>
          Apply {a.name} theme
        </button>
        <div className="flex flex-wrap gap-1.5">
          {[...a.tags, ...a.materials].slice(0, 6).map((t) => (
            <span key={t} className="rounded-full bg-accent-soft px-3 py-1 text-xs text-fg">
              {t}
            </span>
          ))}
        </div>
        {card && (
          <figure className="overflow-hidden rounded-[calc(1rem*var(--r-scale,1))] border border-line bg-bg" title={credit(card)}>
            <img src={card.thumb ?? card.url} alt={card.caption} loading="lazy" referrerPolicy="no-referrer" className="aspect-[16/9] w-full object-cover" />
            <figcaption className="p-4">
              <p className="display text-2xl text-fg">{a.name}</p>
              <p className="mt-1 line-clamp-2 text-sm text-fg-muted">{a.summary}</p>
            </figcaption>
          </figure>
        )}
      </div>
      <div>
        <p className="eyebrow mb-3">Palette as tokens · measured contrast</p>
        <ul className="space-y-2">
          {colors.map((c, i) => {
            const cr = contrast(c.hex, onColor(c.hex))
            return (
              <li key={i} className="flex items-center gap-3 rounded-[calc(0.75rem*var(--r-scale,1))] border border-line p-2">
                <span className="grid h-12 w-20 shrink-0 place-items-center rounded-lg text-xs font-medium" style={{ background: c.hex, color: onColor(c.hex) }}>
                  Aa
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm text-fg">{c.name || `Colour ${i + 1}`}</span>
                  <span className="font-mono text-xs text-fg-subtle">{c.hex}</span>
                </span>
                <span className={`rounded-full px-2 py-0.5 font-mono text-[11px] ${cr >= 4.5 ? 'bg-emerald-500/15 text-emerald-500' : 'bg-amber-500/15 text-amber-500'}`}>
                  {cr.toFixed(1)}:1 {cr >= 7 ? 'AAA' : cr >= 4.5 ? 'AA' : 'large text'}
                </span>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Type specimen: the documented pairing, set in the record's own words.
// ---------------------------------------------------------------------------
function TypeSpecimen({ a }: { a: AestheticFull }) {
  const display = a.typePairing.display
  const body = a.typePairing.body
  const text = (a.description || a.summary).split(/\n+/)[0].slice(0, 420)
  return (
    <div className="grid gap-8 rounded-[calc(1.25rem*var(--r-scale,1))] border border-line bg-surface p-6 sm:p-10 lg:grid-cols-[1fr_1.2fr]">
      <div>
        <p className="eyebrow">Display{display ? ` · ${display}` : ' · site default'}</p>
        <p className="display mt-3 text-[clamp(5rem,14vw,10rem)] leading-none text-fg">Aa</p>
        <p className="display mt-4 break-words text-2xl text-fg-muted">ABCDEFGHIJKLM NOPQRSTUVWXYZ abcdefghijklm nopqrstuvwxyz 0123456789</p>
      </div>
      <div className="space-y-5">
        <p className="display text-4xl leading-tight text-fg sm:text-5xl">{a.name}</p>
        <p className="eyebrow">Body{body ? ` · ${body}` : ' · site default'}</p>
        <p className="text-base leading-relaxed text-fg-muted">{text}</p>
        {!display && <p className="text-xs text-fg-subtle">This record has no documented type pairing yet, so the site’s default faces are shown.</p>}
      </div>
    </div>
  )
}
