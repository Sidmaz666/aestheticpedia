'use client'

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronUp, Maximize, Minus, Plus, Search } from 'lucide-react'
import type { GraphLink, GraphNode } from '@/lib/queries'
import { categoryColor } from '@/lib/category-colors'
import { Thumb } from '@/components/aesthetic/thumb'
import { compact } from '@/lib/format'

// Positions are precomputed on the server (src/lib/graph-layout.ts): the map only draws.
type N = GraphNode
type L = { source: N; target: N; type: string }

const LINK_LABEL: Record<string, string> = {
  influenced_by: 'influenced by',
  influenced: 'influenced',
  variant_of: 'variant of',
  parent: 'parent',
  sibling: 'sibling',
  related: 'related',
  reacts_against: 'reacts against',
  opposite: 'opposite',
  confused_with: 'confused with',
  hybrid_of: 'hybrid of',
}

export function GraphView({ nodes: rawNodes, links: rawLinks, onSwitch3D }: { nodes: GraphNode[]; links: GraphLink[]; onSwitch3D?: () => void }) {
  const router = useRouter()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const tipRef = useRef<HTMLDivElement>(null)
  const [hidden, setHidden] = useState<Set<string>>(() => new Set())
  const [hover, setHover] = useState<N | null>(null)
  const [focus, setFocus] = useState<string | null>(null)
  const [q, setQ] = useState('')
  const view = useRef({ x: 0, y: 0, k: 0.55 })
  const redraw = useRef<() => void>(() => {})
  // Read by the canvas draw loop, which lives outside React renders.
  const hoverRef = useRef<string | null>(null)
  const focusRef = useRef<string | null>(null)

  const categories = useMemo(() => {
    const m = new Map<string, number>()
    for (const n of rawNodes) m.set(n.category, (m.get(n.category) ?? 0) + 1)
    return [...m.entries()].sort((a, b) => b[1] - a[1])
  }, [rawNodes])

  // Simulation data (rebuilt when category filters change)
  const { nodes, links, neighbors } = useMemo(() => {
    const nodes: N[] = rawNodes.filter((n) => !hidden.has(n.category))
    const byId = new Map(nodes.map((n) => [n.slug, n]))
    const links: L[] = rawLinks.filter((l) => byId.has(l.source) && byId.has(l.target)).map((l) => ({ source: byId.get(l.source)!, target: byId.get(l.target)!, type: l.type }))
    const neighbors = new Map<string, Set<string>>()
    for (const l of rawLinks) {
      if (!neighbors.has(l.source)) neighbors.set(l.source, new Set())
      if (!neighbors.has(l.target)) neighbors.set(l.target, new Set())
      neighbors.get(l.source)!.add(l.target)
      neighbors.get(l.target)!.add(l.source)
    }
    return { nodes, links, neighbors }
  }, [rawNodes, rawLinks, hidden])

  const images = useRef(new Map<string, HTMLImageElement>())

  useEffect(() => {
    const canvas = canvasRef.current!
    const wrap = wrapRef.current!
    const ctx = canvas.getContext('2d')!
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    let w = 0
    let h = 0
    const styles = getComputedStyle(document.documentElement)
    const colLine = styles.getPropertyValue('--line-strong').trim() || '#333'
    const colFg = styles.getPropertyValue('--fg').trim() || '#fff'
    const colAccent = styles.getPropertyValue('--accent').trim() || '#e4ba6e'
    const colBg = styles.getPropertyValue('--bg').trim() || '#000'
    const radius = (n: N) => 2.5 + Math.sqrt(n.degree) * 1.6
    // Label only the best-connected hubs at overview zoom; reveal more as the user zooms in.
    const byDegree = [...nodes].sort((a, b) => b.degree - a.degree)
    const labelMin = (k: number) => byDegree[Math.min(byDegree.length - 1, Math.round(35 * k * k))]?.degree ?? 0

    const resize = () => {
      w = wrap.clientWidth
      h = wrap.clientHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      paint()
    }
    // Colours per category, resolved once (categoryColor returns CSS the canvas understands).
    const catColor = new Map<string, string>()
    for (const n of nodes) if (!catColor.has(n.category)) catColor.set(n.category, categoryColor(n.category))

    const hoverSet = () => {
      const key = focusRef.current ?? hoverRef.current
      return key ? new Set([key, ...(neighbors.get(key) ?? [])]) : null
    }

    function draw() {
      const { x, y, k } = view.current
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.fillStyle = colBg
      ctx.fillRect(0, 0, w, h)
      ctx.translate(w / 2 + x, h / 2 + y)
      ctx.scale(k, k)
      const hl = hoverSet()

      // Links: one path per state (normal / highlighted / faded) instead of one stroke per link.
      const key = focusRef.current ?? hoverRef.current
      ctx.lineWidth = 0.6 / Math.max(0.6, k)
      const base = new Path2D()
      const lit = new Path2D()
      for (const l of links) {
        const on = key !== null && (l.source.slug === key || l.target.slug === key)
        const p = on ? lit : base
        p.moveTo(l.source.x, l.source.y)
        p.lineTo(l.target.x, l.target.y)
      }
      ctx.strokeStyle = colLine
      ctx.globalAlpha = hl ? 0.14 : 0.45
      ctx.stroke(base)
      if (hl) {
        ctx.strokeStyle = colAccent
        ctx.globalAlpha = 0.95
        ctx.lineWidth = 1.4 / Math.max(0.6, k)
        ctx.stroke(lit)
      }
      // Nodes: batched per colour; faded ones keep their hue (lower alpha, not grey).
      const batches = new Map<string, Path2D>()
      const faded = new Map<string, Path2D>()
      const withImage: N[] = []
      for (const n of nodes) {
        const r = radius(n)
        const img = images.current.get(n.slug)
        if (k * r > 9 && img?.complete && img.naturalWidth && (!hl || hl.has(n.slug))) {
          withImage.push(n)
          continue
        }
        const col = catColor.get(n.category)!
        const into = hl && !hl.has(n.slug) ? faded : batches
        let p = into.get(col)
        if (!p) into.set(col, (p = new Path2D()))
        p.moveTo(n.x + r, n.y)
        p.arc(n.x, n.y, r, 0, Math.PI * 2)
      }
      ctx.globalAlpha = 0.32
      for (const [col, p] of faded) {
        ctx.fillStyle = col
        ctx.fill(p)
      }
      ctx.globalAlpha = hl ? 1 : 0.92
      for (const [col, p] of batches) {
        ctx.fillStyle = col
        ctx.fill(p)
      }
      for (const n of withImage) {
        const r = radius(n)
        const img = images.current.get(n.slug)!
        ctx.save()
        ctx.beginPath()
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2)
        ctx.clip()
        ctx.drawImage(img, n.x - r, n.y - r, r * 2, r * 2)
        ctx.restore()
        ctx.strokeStyle = catColor.get(n.category)!
        ctx.lineWidth = 1.2 / k
        ctx.stroke()
      }
      // Labels: hubs always, everything when zoomed in, highlighted set on hover.
      ctx.globalAlpha = 1
      ctx.fillStyle = colFg
      ctx.textAlign = 'center'
      ctx.font = `${12 / k}px ui-sans-serif, system-ui, sans-serif`
      const min = labelMin(k)
      const placed: [number, number, number, number][] = []
      for (const n of byDegree) {
        const show = hl ? hl.has(n.slug) : n.degree >= min
        if (!show) continue
        const tw = ctx.measureText(n.name).width
        const bx = n.x! - tw / 2
        const by = n.y! - radius(n) - 16 / k
        const bh = 14 / k
        // Skip labels that would overlap one already drawn.
        if (!hl && placed.some(([x, y, w, h]) => bx < x + w && bx + tw > x && by < y + h && by + bh > y)) continue
        placed.push([bx, by, tw, bh])
        ctx.fillText(n.name, n.x!, n.y! - radius(n) - 4 / k)
      }
    }
    // Draw at most once per frame, however many events ask for it.
    let queued = 0
    const paint = () => {
      if (queued) return
      queued = requestAnimationFrame(() => {
        queued = 0
        draw()
      })
    }
    redraw.current = paint
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(wrap)

    // Lazy-load thumbnails for hubs (drawn when zoomed in far enough)
    for (const n of nodes.slice(0, 300)) {
      if (!n.image || images.current.has(n.slug)) continue
      const img = new Image()
      img.referrerPolicy = 'no-referrer'
      img.src = n.image
      img.onload = () => paint()
      images.current.set(n.slug, img)
    }

    // Interaction: pan, zoom, hover, click
    const toWorld = (cx: number, cy: number) => {
      const { x, y, k } = view.current
      return [(cx - w / 2 - x) / k, (cy - h / 2 - y) / k]
    }
    const pick = (cx: number, cy: number) => {
      const [wx, wy] = toWorld(cx, cy)
      let best: N | null = null
      let bd = Infinity
      for (const n of nodes) {
        const d = (n.x! - wx) ** 2 + (n.y! - wy) ** 2
        const r = radius(n) + 4 / view.current.k
        if (d < r * r && d < bd) {
          bd = d
          best = n
        }
      }
      return best
    }
    let drag: { x: number; y: number; moved: boolean } | null = null
    const onDown = (e: PointerEvent) => {
      drag = { x: e.clientX, y: e.clientY, moved: false }
      canvas.setPointerCapture(e.pointerId)
    }
    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      if (drag) {
        const dx = e.clientX - drag.x
        const dy = e.clientY - drag.y
        if (Math.abs(dx) + Math.abs(dy) > 3) drag.moved = true
        view.current.x += dx
        view.current.y += dy
        drag.x = e.clientX
        drag.y = e.clientY
        paint()
        return
      }
      const n = pick(e.clientX - rect.left, e.clientY - rect.top)
      canvas.style.cursor = n ? 'pointer' : 'grab'
      const tip = tipRef.current
      if (tip && n) {
        const px = e.clientX - rect.left
        const py = e.clientY - rect.top
        const tw = tip.offsetWidth || 288
        const th = tip.offsetHeight || 72
        // Prefer below-right of the pointer; flip when it would leave the graph.
        const x = px + 18 + tw > rect.width - 8 ? px - 18 - tw : px + 18
        const y = py + 18 + th > rect.height - 8 ? py - 18 - th : py + 18
        tip.style.transform = `translate(${Math.max(8, x)}px, ${Math.max(8, y)}px)`
      }
      setHover((prev) => (prev?.slug === n?.slug ? prev : n))
    }
    const onUp = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      if (drag && !drag.moved) {
        const n = pick(e.clientX - rect.left, e.clientY - rect.top)
        if (n) router.push(`/aesthetics/${n.slug}`)
      }
      drag = null
    }
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const rect = canvas.getBoundingClientRect()
      const cx = e.clientX - rect.left - w / 2
      const cy = e.clientY - rect.top - h / 2
      const v = view.current
      const k2 = Math.min(6, Math.max(0.15, v.k * Math.exp(-e.deltaY * 0.0015)))
      v.x = cx - ((cx - v.x) * k2) / v.k
      v.y = cy - ((cy - v.y) * k2) / v.k
      v.k = k2
      paint()
    }
    canvas.addEventListener('pointerdown', onDown)
    canvas.addEventListener('pointermove', onMove)
    canvas.addEventListener('pointerup', onUp)
    canvas.addEventListener('wheel', onWheel, { passive: false })
    return () => {
      cancelAnimationFrame(queued)
      ro.disconnect()
      canvas.removeEventListener('pointerdown', onDown)
      canvas.removeEventListener('pointermove', onMove)
      canvas.removeEventListener('pointerup', onUp)
      canvas.removeEventListener('wheel', onWheel)
    }
  }, [nodes, links])

  // Redraw on hover/focus changes without restarting the simulation
  useEffect(() => {
    hoverRef.current = hover?.slug ?? null
    focusRef.current = focus
    redraw.current()
  }, [hover, focus])

  const zoom = (f: number) => {
    view.current.k = Math.min(6, Math.max(0.15, view.current.k * f))
    redraw.current()
  }
  const matches = q.trim() ? rawNodes.filter((n) => n.name.toLowerCase().includes(q.trim().toLowerCase())).slice(0, 8) : []
  const centerOn = (slug: string) => {
    const n = nodes.find((x) => x.slug === slug)
    if (!n) return
    view.current.k = 1.8
    view.current.x = -n.x! * 1.8
    view.current.y = -n.y! * 1.8
    setFocus(slug)
    setQ('')
    redraw.current()
  }

  return (
    <main className="relative flex h-[calc(100svh-4rem)] flex-col overflow-hidden">
      <div className="relative min-h-0 flex-1">
      <div ref={wrapRef} className="absolute inset-0">
        <canvas ref={canvasRef} className="block touch-none" aria-label="Network of related aesthetics" role="img" data-graph />
      </div>

      {/* Title + search */}
      <div className="pointer-events-none relative z-10 flex flex-wrap items-start justify-between gap-4 p-4 sm:p-6 lg:px-10">
        <div className="pointer-events-auto max-w-md rounded-2xl border border-line bg-bg/80 p-5 backdrop-blur-xl">
          <p className="eyebrow">Relationship network</p>
          <h1 className="display mt-1 text-5xl">Connections</h1>
          <p className="mt-2 text-sm text-fg-muted">
            {compact(nodes.length)} aesthetics joined by {compact(links.length)} documented relations —
            influence, variants, reactions. Scroll to zoom, drag to pan, click a node to open it.
          </p>
          <div className="relative mt-4">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-fg-subtle" aria-hidden />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Find an aesthetic in the network…"
              className="h-10 w-full rounded-full border border-line-strong bg-surface pl-9 pr-3 text-sm focus:outline-none"
            />
            {matches.length > 0 && (
              <ul className="absolute inset-x-0 top-full z-20 mt-1 rounded-xl border border-line-strong bg-surface p-1 shadow-xl">
                {matches.map((m) => (
                  <li key={m.slug}>
                    <button type="button" onClick={() => centerOn(m.slug)} className="w-full rounded-lg px-3 py-1.5 text-left text-sm hover:bg-surface-2">
                      {m.name} <span className="text-xs text-fg-subtle">· {m.degree} links</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {focus && (
            <button type="button" onClick={() => setFocus(null)} className="mt-3 text-xs text-fg-subtle underline underline-offset-2 hover:text-fg">
              Clear focus
            </button>
          )}
        </div>
        <div className="pointer-events-auto flex gap-1 rounded-full border border-line bg-bg/80 p-1 backdrop-blur-xl">
          <IconBtn label="Zoom in" onClick={() => zoom(1.3)}>
            <Plus className="size-4" aria-hidden />
          </IconBtn>
          <IconBtn label="Zoom out" onClick={() => zoom(1 / 1.3)}>
            <Minus className="size-4" aria-hidden />
          </IconBtn>
          <IconBtn
            label="Reset view"
            onClick={() => {
              view.current = { x: 0, y: 0, k: 0.55 }
              setFocus(null)
              redraw.current()
            }}
          >
            <Maximize className="size-4" aria-hidden />
          </IconBtn>
          {onSwitch3D && (
            <button type="button" onClick={onSwitch3D} className="rounded-full px-3 text-xs text-fg-muted hover:bg-surface-2 hover:text-fg">
              3D view
            </button>
          )}
        </div>
      </div>

      {/* Tooltip: follows the pointer, positioned directly (no re-render per move), clamped inside the graph */}
      <div
        ref={tipRef}
        role="tooltip"
        className={`pointer-events-none absolute left-0 top-0 z-20 flex w-72 items-center gap-3 rounded-2xl border border-line-strong bg-bg/95 p-2.5 pr-3.5 shadow-2xl shadow-black/50 backdrop-blur-xl transition-opacity duration-150 ${hover ? 'opacity-100' : 'opacity-0'}`}
      >
        {hover && (
          <>
            <Thumb image={hover.image} name={hover.name} className="size-12 rounded-xl" />
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium text-fg">{hover.name}</span>
              <span className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-fg-subtle">
                <span className="size-2 shrink-0 rounded-full" style={{ background: categoryColor(hover.category) }} />
                {hover.category}
              </span>
              <span className="block truncate text-[11px] text-fg-subtle">
                {hover.startYear !== null ? `${hover.startYear < 0 ? `${-hover.startYear} BCE` : hover.startYear} · ` : ''}
                {hover.degree} connection{hover.degree === 1 ? '' : 's'} · click to open
              </span>
            </span>
          </>
        )}
      </div>

      {/* Legend: categories as a collapsible panel (bottom-left, clear of the robot guide) */}
      <Legend
        categories={categories}
        hidden={hidden}
        visible={nodes.length}
        onToggle={(c) =>
          setHidden((s) => {
            const next = new Set(s)
            if (next.has(c)) next.delete(c)
            else next.add(c)
            return next
          })
        }
        onOnly={(c) => setHidden(new Set(categories.map(([x]) => x).filter((x) => x !== c)))}
        onAll={() => setHidden(new Set())}
      />
      </div>
      <p className="sr-only">Relation types: {Object.values(LINK_LABEL).join(', ')}</p>
    </main>
  )
}

function IconBtn({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} aria-label={label} title={label} className="grid size-9 place-items-center rounded-full text-fg-muted hover:bg-surface-2 hover:text-fg">
      {children}
    </button>
  )
}

const subscribeWide = (cb: () => void) => {
  const mq = window.matchMedia('(min-width: 1024px)')
  mq.addEventListener('change', cb)
  return () => mq.removeEventListener('change', cb)
}

/** Category legend and filter: one row per category with its colour, count, toggle and "only". */
function Legend({
  categories,
  hidden,
  visible,
  onToggle,
  onOnly,
  onAll,
}: {
  categories: [string, number][]
  hidden: Set<string>
  visible: number
  onToggle: (c: string) => void
  onOnly: (c: string) => void
  onAll: () => void
}) {
  // Open by default on wide screens, collapsed on phones; the visitor's choice wins.
  const wide = useSyncExternalStore(subscribeWide, () => window.matchMedia('(min-width: 1024px)').matches, () => false)
  const [choice, setOpen] = useState<boolean | null>(null)
  const open = choice ?? wide
  return (
    <div className="pointer-events-auto absolute bottom-4 left-4 z-10 w-[min(20rem,calc(100%-8rem))] sm:left-6 lg:left-10">
      <div className="overflow-hidden rounded-2xl border border-line bg-bg/85 shadow-xl shadow-black/30 backdrop-blur-xl">
        <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="graph-legend" className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left">
          <span>
            <span className="eyebrow block">Categories</span>
            <span className="text-xs text-fg-muted">
              {hidden.size ? `${categories.length - hidden.size} of ${categories.length} shown` : `All ${categories.length} shown`} · {compact(visible)} nodes
            </span>
          </span>
          <ChevronUp className={`size-4 text-fg-subtle transition-transform ${open ? '' : 'rotate-180'}`} aria-hidden />
        </button>
        {open && (
          <div id="graph-legend" className="border-t border-line">
            <ul role="group" aria-label="Filter by category" style={{ maxHeight: 'min(22rem, max(7rem, calc(100svh - 34rem)))' }} className="overflow-y-auto overscroll-contain p-1.5 scrollbar-thin">
              {categories.map(([c, n]) => {
                const off = hidden.has(c)
                return (
                  <li key={c} className="group flex items-center gap-1 rounded-lg hover:bg-surface-2">
                    <button type="button" aria-pressed={!off} onClick={() => onToggle(c)} className="flex min-w-0 flex-1 items-center gap-2.5 px-2.5 py-1.5 text-left text-sm">
                      <span className={`size-3 shrink-0 rounded-full ring-2 ring-offset-2 ring-offset-bg transition ${off ? 'opacity-30 ring-transparent' : 'ring-transparent'}`} style={{ background: categoryColor(c) }} />
                      <span className={`min-w-0 flex-1 truncate ${off ? 'text-fg-subtle line-through decoration-fg-subtle/50' : 'text-fg'}`}>{c}</span>
                      <span className="font-mono text-[11px] text-fg-subtle">{n}</span>
                    </button>
                    <button type="button" onClick={() => onOnly(c)} className="mr-1 rounded-md px-2 py-1 text-[11px] text-fg-subtle opacity-0 transition-opacity hover:bg-bg hover:text-fg focus-visible:opacity-100 group-hover:opacity-100">
                      only
                    </button>
                  </li>
                )
              })}
            </ul>
            {hidden.size > 0 && (
              <div className="border-t border-line p-2">
                <button type="button" onClick={onAll} className="w-full rounded-lg py-1.5 text-xs text-fg-muted hover:bg-surface-2 hover:text-fg">
                  Show all categories
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
