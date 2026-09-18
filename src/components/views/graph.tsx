'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { forceCenter, forceCollide, forceLink, forceManyBody, forceSimulation, forceX, forceY, type Simulation, type SimulationLinkDatum, type SimulationNodeDatum } from 'd3-force'
import { Maximize, Minus, Plus, Search } from 'lucide-react'
import type { GraphLink, GraphNode } from '@/lib/queries'
import { categoryColor } from '@/lib/category-colors'

type N = GraphNode & SimulationNodeDatum
type L = SimulationLinkDatum<N> & { type: string }

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

export function GraphView({ nodes: rawNodes, links: rawLinks }: { nodes: GraphNode[]; links: GraphLink[] }) {
  const router = useRouter()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
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
    const nodes: N[] = rawNodes.filter((n) => !hidden.has(n.category)).map((n) => ({ ...n }))
    const ids = new Set(nodes.map((n) => n.slug))
    const links: L[] = rawLinks.filter((l) => ids.has(l.source) && ids.has(l.target)).map((l) => ({ source: l.source, target: l.target, type: l.type }))
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
      draw()
    }

    const sim: Simulation<N, L> = forceSimulation<N, L>(nodes)
      .force('link', forceLink<N, L>(links).id((d) => d.slug).distance(34).strength(0.35))
      .force('charge', forceManyBody<N>().strength(-42).distanceMax(420))
      .force('collide', forceCollide<N>().radius((d) => radius(d) + 1.5))
      .force('x', forceX<N>(0).strength(0.035))
      .force('y', forceY<N>(0).strength(0.035))
      .force('center', forceCenter(0, 0))
      .alphaDecay(0.025)

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

      ctx.lineWidth = 0.6 / Math.max(0.6, k)
      for (const l of links) {
        const s = l.source as N
        const t = l.target as N
        const key = focusRef.current ?? hoverRef.current
        const on = hl && hl.has(s.slug) && hl.has(t.slug) && (s.slug === key || t.slug === key)
        ctx.strokeStyle = on ? colAccent : colLine
        ctx.globalAlpha = hl ? (on ? 0.95 : 0.08) : 0.45
        ctx.beginPath()
        ctx.moveTo(s.x!, s.y!)
        ctx.lineTo(t.x!, t.y!)
        ctx.stroke()
      }
      for (const n of nodes) {
        const r = radius(n)
        ctx.globalAlpha = hl ? (hl.has(n.slug) ? 1 : 0.15) : 0.92
        const img = images.current.get(n.slug)
        if (k * r > 9 && img?.complete && img.naturalWidth) {
          ctx.save()
          ctx.beginPath()
          ctx.arc(n.x!, n.y!, r, 0, Math.PI * 2)
          ctx.clip()
          ctx.drawImage(img, n.x! - r, n.y! - r, r * 2, r * 2)
          ctx.restore()
          ctx.strokeStyle = categoryColor(n.category)
          ctx.lineWidth = 1.2 / k
          ctx.stroke()
        } else {
          ctx.fillStyle = categoryColor(n.category)
          ctx.beginPath()
          ctx.arc(n.x!, n.y!, r, 0, Math.PI * 2)
          ctx.fill()
        }
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
    redraw.current = draw

    sim.on('tick', draw)
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(wrap)

    // Lazy-load thumbnails for hubs (drawn when zoomed in far enough)
    for (const n of nodes.slice(0, 300)) {
      if (!n.image || images.current.has(n.slug)) continue
      const img = new Image()
      img.referrerPolicy = 'no-referrer'
      img.src = n.image
      img.onload = () => draw()
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
        draw()
        return
      }
      const n = pick(e.clientX - rect.left, e.clientY - rect.top)
      canvas.style.cursor = n ? 'pointer' : 'grab'
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
      draw()
    }
    canvas.addEventListener('pointerdown', onDown)
    canvas.addEventListener('pointermove', onMove)
    canvas.addEventListener('pointerup', onUp)
    canvas.addEventListener('wheel', onWheel, { passive: false })
    return () => {
      sim.stop()
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
      <div ref={wrapRef} className="absolute inset-0">
        <canvas ref={canvasRef} className="block touch-none" aria-label="Network of related aesthetics" role="img" />
      </div>

      {/* Title + search */}
      <div className="pointer-events-none relative z-10 flex flex-wrap items-start justify-between gap-4 p-4 sm:p-6 lg:px-10">
        <div className="pointer-events-auto max-w-md rounded-2xl border border-line bg-bg/80 p-5 backdrop-blur-xl">
          <p className="eyebrow">Relationship network</p>
          <h1 className="display mt-1 text-5xl">Connections</h1>
          <p className="mt-2 text-sm text-fg-muted">
            {nodes.length.toLocaleString('en')} aesthetics joined by {links.length.toLocaleString('en')} documented relations —
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
        </div>
      </div>

      {/* Hover card */}
      {hover && (
        <div className="pointer-events-none absolute bottom-24 left-1/2 z-10 flex w-[min(24rem,calc(100%-2rem))] -translate-x-1/2 items-center gap-3 rounded-2xl border border-line bg-bg/90 p-3 backdrop-blur-xl sm:bottom-6">
          <span className="size-14 shrink-0 overflow-hidden rounded-xl bg-surface-2">
            {hover.image && <img src={hover.image} alt="" className="size-full object-cover" referrerPolicy="no-referrer" />}
          </span>
          <span className="min-w-0">
            <span className="block truncate font-medium">{hover.name}</span>
            <span className="block truncate text-xs text-fg-subtle">
              {hover.category}
              {hover.startYear !== null ? ` · ${hover.startYear < 0 ? `${-hover.startYear} BCE` : hover.startYear}` : ''} · {hover.degree} connections
            </span>
          </span>
        </div>
      )}

      {/* Legend / filters */}
      <div className="absolute inset-x-0 bottom-0 z-10 border-t border-line bg-bg/80 backdrop-blur-xl">
        <div className="no-scrollbar flex gap-1.5 overflow-x-auto px-4 py-3 sm:px-6 lg:px-10">
          {categories.map(([c, n]) => {
            const off = hidden.has(c)
            return (
              <button
                key={c}
                type="button"
                aria-pressed={!off}
                onClick={() =>
                  setHidden((s) => {
                    const next = new Set(s)
                    if (next.has(c)) next.delete(c)
                    else next.add(c)
                    return next
                  })
                }
                className={`flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition-opacity ${off ? 'border-line opacity-40' : 'border-line-strong'}`}
              >
                <span className="size-2.5 rounded-full" style={{ background: categoryColor(c) }} />
                {c} <span className="text-fg-subtle">{n}</span>
              </button>
            )
          })}
        </div>
        <p className="sr-only">Relation types: {Object.values(LINK_LABEL).join(', ')}</p>
      </div>
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
