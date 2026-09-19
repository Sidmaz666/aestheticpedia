'use client'

// The relationship network in 3D: orbit, pan and zoom; nodes clustered by category and sized
// by their number of connections; links coloured by relationship type; hover highlights a
// node's neighbourhood, click flies to it and opens its details.
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import Link from 'next/link'
import { ArrowUpRight, ChevronUp, Maximize, Minus, Pause, Play, Plus, Search, X } from 'lucide-react'
import type { GraphLink, GraphNode } from '@/lib/queries'
import { categoryColor } from '@/lib/category-colors'
import { Thumb } from '@/components/aesthetic/thumb'
import { compact } from '@/lib/format'

type N = GraphNode & { x?: number; y?: number; z?: number; vx?: number; vy?: number; vz?: number }
type L = { source: string | N; target: string | N; type: string }

export const LINK_TYPES: { key: string; label: string; color: string; types: string[] }[] = [
  { key: 'influence', label: 'Influence', color: '#f5b642', types: ['influenced_by', 'influenced'] },
  { key: 'variant', label: 'Variant / parent', color: '#4ade80', types: ['variant_of', 'parent'] },
  { key: 'sibling', label: 'Sibling', color: '#60a5fa', types: ['sibling'] },
  { key: 'hybrid', label: 'Hybrid', color: '#c084fc', types: ['hybrid_of'] },
  { key: 'reaction', label: 'Reaction / opposite', color: '#f87171', types: ['reacts_against', 'opposite'] },
  { key: 'related', label: 'Related', color: '#94a3b8', types: ['related', 'confused_with'] },
]
const GROUP_OF = new Map(LINK_TYPES.flatMap((g) => g.types.map((t) => [t, g])))

/** Resolve any CSS colour (incl. oklch) to hex — three.js only understands sRGB notations. */
function cssToHex(css: string): string {
  const c = document.createElement('canvas')
  c.width = c.height = 1
  const ctx = c.getContext('2d')!
  ctx.fillStyle = css
  ctx.fillRect(0, 0, 1, 1)
  const d = ctx.getImageData(0, 0, 1, 1).data
  return `#${[d[0], d[1], d[2]].map((v) => v.toString(16).padStart(2, '0')).join('')}`
}

const subscribeWide = (cb: () => void) => {
  const mq = window.matchMedia('(min-width: 1024px)')
  mq.addEventListener('change', cb)
  return () => mq.removeEventListener('change', cb)
}

export function Graph3DView({ nodes: rawNodes, links: rawLinks, onSwitch2D }: { nodes: GraphNode[]; links: GraphLink[]; onSwitch2D: () => void }) {
  const mountRef = useRef<HTMLDivElement>(null)
  const tipRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<import('./network-scene').NetworkScene | null>(null)
  const [ready, setReady] = useState(false)
  const [hidden, setHidden] = useState<Set<string>>(() => new Set())
  const [linkOff, setLinkOff] = useState<Set<string>>(() => new Set())
  const [hover, setHover] = useState<N | null>(null)
  const [selected, setSelected] = useState<N | null>(null)
  const [rotating, setRotating] = useState(true)
  const [q, setQ] = useState('')
  const [failed, setFailed] = useState(false)
  const bySlug = useMemo(() => new Map(rawNodes.map((n) => [n.slug, n as N])), [rawNodes])

  const categories = useMemo(() => {
    const m = new Map<string, number>()
    for (const n of rawNodes) m.set(n.category, (m.get(n.category) ?? 0) + 1)
    return [...m.entries()].sort((a, b) => b[1] - a[1])
  }, [rawNodes])

  const neighbours = useMemo(() => {
    const m = new Map<string, Set<string>>()
    for (const l of rawLinks) {
      if (!m.has(l.source)) m.set(l.source, new Set())
      if (!m.has(l.target)) m.set(l.target, new Set())
      m.get(l.source)!.add(l.target)
      m.get(l.target)!.add(l.source)
    }
    return m
  }, [rawLinks])

  const data = useMemo(() => {
    const nodes: N[] = rawNodes.filter((n) => !hidden.has(n.category)).map((n) => ({ ...n }))
    const ids = new Set(nodes.map((n) => n.slug))
    const links: L[] = rawLinks
      .filter((l) => ids.has(l.source) && ids.has(l.target) && !linkOff.has(GROUP_OF.get(l.type)?.key ?? 'related'))
      .map((l) => ({ ...l }))
    return { nodes, links }
  }, [rawNodes, rawLinks, hidden, linkOff])

  // The scene is created once; filters, highlight and rotation are pushed in by the effects below.
  useEffect(() => {
    const el = mountRef.current
    if (!el) return
    let disposed = false
    const colors = new Map(categories.map(([c]) => [c, cssToHex(categoryColor(c))]))
    const bg = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim()
    ;(async () => {
      try {
        const { NetworkScene } = await import('./network-scene')
        if (disposed) return
        sceneRef.current = new NetworkScene(el, {
          nodes: rawNodes,
          links: rawLinks,
          background: bg ? cssToHex(bg) : '#0b0b0c',
          nodeColor: (c) => colors.get(c) ?? '#aaaaaa',
          linkColor: (t) => GROUP_OF.get(t)?.color ?? '#94a3b8',
          onHover: (slug) => setHover(slug ? (bySlug.get(slug) ?? null) : null),
          onClick: (slug) => {
            const n = slug ? bySlug.get(slug) : null
            if (n) focusNode(n)
            else setSelected(null)
          },
        })
        setReady(true)
      } catch {
        setFailed(true)
      }
    })()
    return () => {
      disposed = true
      sceneRef.current?.dispose()
      sceneRef.current = null
    }
  }, [rawNodes, rawLinks])

  useEffect(() => {
    sceneRef.current?.setFilters(hidden, linkOff, (t) => GROUP_OF.get(t)?.key ?? 'related')
  }, [hidden, linkOff, ready])

  useEffect(() => {
    sceneRef.current?.highlight(hover?.slug ?? selected?.slug ?? null)
  }, [hover, selected, ready])

  useEffect(() => {
    sceneRef.current?.setAutoRotate(rotating)
  }, [rotating, ready])

  // Tooltip follows the pointer (positioned directly, no re-render per move).
  useEffect(() => {
    const el = mountRef.current
    if (!el) return
    const onMove = (e: PointerEvent) => {
      const tip = tipRef.current
      if (!tip) return
      const r = el.getBoundingClientRect()
      const px = e.clientX - r.left
      const py = e.clientY - r.top
      const tw = tip.offsetWidth || 280
      const th = tip.offsetHeight || 70
      const x = px + 18 + tw > r.width - 8 ? px - 18 - tw : px + 18
      const y = py + 18 + th > r.height - 8 ? py - 18 - th : py + 18
      tip.style.transform = `translate(${Math.max(8, x)}px, ${Math.max(8, y)}px)`
    }
    el.addEventListener('pointermove', onMove)
    return () => el.removeEventListener('pointermove', onMove)
  }, [])

  function focusNode(n: N) {
    setSelected(n)
    setRotating(false)
    sceneRef.current?.focus(n.slug)
  }
  // Zoom towards/away from the current orbit target (not the origin), keeping the view aimed.
  const zoom = (f: number) => sceneRef.current?.zoom(f)
  const reset = () => {
    setSelected(null)
    sceneRef.current?.reset()
  }
  const matches = q.trim() ? rawNodes.filter((n) => n.name.toLowerCase().includes(q.trim().toLowerCase())).slice(0, 8) : []
  const flyTo = (slug: string) => {
    const n = bySlug.get(slug)
    if (n) focusNode(n)
    setQ('')
  }

  if (failed) {
    return (
      <div className="grid h-full place-items-center p-8 text-center">
        <div>
          <p className="text-fg-muted">The 3D view needs WebGL, which isn’t available here.</p>
          <button type="button" onClick={onSwitch2D} className="mt-4 rounded-full bg-fg px-5 py-2 text-sm text-bg">
            Use the 2D map
          </button>
        </div>
      </div>
    )
  }

  const selNeighbours = selected ? [...(neighbours.get(selected.slug) ?? [])].map((s) => rawNodes.find((n) => n.slug === s)).filter(Boolean).slice(0, 12) as GraphNode[] : []

  return (
    <div className="relative h-full">
      <div ref={mountRef} className="absolute inset-0 cursor-grab touch-none" aria-label="3D network of related aesthetics. Drag to orbit, scroll to zoom, right-drag to pan." role="img" data-graph />

      {/* Left column: title + legend share the height, so they never overlap */}
      <div className="pointer-events-none absolute inset-y-4 left-4 z-10 flex w-[min(21rem,calc(100%-2rem))] flex-col gap-3 sm:left-6 lg:left-10">
        <div className="pointer-events-auto shrink-0 rounded-2xl border border-line bg-bg/80 p-5 backdrop-blur-xl">
          <p className="eyebrow">Relationship network</p>
          <h1 className="display mt-1 text-5xl">Connections</h1>
          <p className="mt-2 text-sm text-fg-muted">
            {compact(data.nodes.length)} aesthetics, {compact(data.links.length)} documented relations. Drag to orbit, scroll to zoom, right-drag to pan;
            click a node for details.
          </p>
          <div className="relative mt-4">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-fg-subtle" aria-hidden />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && matches[0] && flyTo(matches[0].slug)}
              placeholder="Find and fly to an aesthetic…"
              aria-label="Find an aesthetic in the network"
              className="h-10 w-full rounded-full border border-line-strong bg-surface pl-9 pr-3 text-sm focus:border-accent focus:outline-none"
            />
            {matches.length > 0 && (
              <ul className="absolute inset-x-0 top-full z-20 mt-1 rounded-xl border border-line-strong bg-surface p-1 shadow-xl">
                {matches.map((m) => (
                  <li key={m.slug}>
                    <button type="button" onClick={() => flyTo(m.slug)} className="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-1.5 text-left text-sm hover:bg-surface-2">
                      <span className="truncate">{m.name}</span>
                      <span className="shrink-0 text-xs text-fg-subtle">{m.degree} links</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <Legend
          categories={categories}
          hidden={hidden}
          onToggle={(c) =>
            setHidden((s) => {
              const n = new Set(s)
              if (n.has(c)) n.delete(c)
              else n.add(c)
              return n
            })
          }
          onOnly={(c) => setHidden(new Set(categories.map(([x]) => x).filter((x) => x !== c)))}
          onAll={() => setHidden(new Set())}
          linkOff={linkOff}
          onToggleLink={(k) =>
            setLinkOff((s) => {
              const n = new Set(s)
              if (n.has(k)) n.delete(k)
              else n.add(k)
              return n
            })
          }
        />
      </div>

      {/* Controls */}
      <div className="absolute bottom-4 left-4 z-10 flex gap-1 rounded-full border border-line bg-bg/80 p-1 backdrop-blur-xl sm:bottom-auto sm:left-auto sm:right-6 sm:top-4 lg:right-10">
        <IconBtn label="Zoom in" onClick={() => zoom(0.75)}>
          <Plus className="size-4" aria-hidden />
        </IconBtn>
        <IconBtn label="Zoom out" onClick={() => zoom(1.33)}>
          <Minus className="size-4" aria-hidden />
        </IconBtn>
        <IconBtn label={rotating ? 'Stop rotating' : 'Auto-rotate'} onClick={() => setRotating((r) => !r)}>
          {rotating ? <Pause className="size-4" aria-hidden /> : <Play className="size-4" aria-hidden />}
        </IconBtn>
        <IconBtn label="Reset view" onClick={reset}>
          <Maximize className="size-4" aria-hidden />
        </IconBtn>
        <button type="button" onClick={onSwitch2D} className="rounded-full px-3 text-xs text-fg-muted hover:bg-surface-2 hover:text-fg">
          2D map
        </button>
      </div>

      {/* Tooltip */}
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
                {hover.degree} connection{hover.degree === 1 ? '' : 's'} · click for details
              </span>
            </span>
          </>
        )}
      </div>

      {/* Selected node */}
      {selected && (
        <aside className="absolute bottom-4 right-4 z-10 w-[min(22rem,calc(100%-2rem))] overflow-hidden rounded-2xl border border-line-strong bg-bg/90 shadow-2xl backdrop-blur-xl sm:right-6 lg:bottom-auto lg:right-10 lg:top-20" aria-label={`${selected.name} details`}>
          {selected.image && <img src={selected.image} alt="" referrerPolicy="no-referrer" className="aspect-[16/9] w-full object-cover" />}
          <div className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="display truncate text-2xl">{selected.name}</p>
                <p className="flex items-center gap-1.5 text-xs text-fg-subtle">
                  <span className="size-2 rounded-full" style={{ background: categoryColor(selected.category) }} />
                  {selected.category}
                  {selected.startYear !== null && ` · ${selected.startYear < 0 ? `${-selected.startYear} BCE` : selected.startYear}`}
                </p>
              </div>
              <button type="button" onClick={() => setSelected(null)} aria-label="Close details" className="grid size-8 shrink-0 place-items-center rounded-full text-fg-subtle hover:bg-surface-2 hover:text-fg">
                <X className="size-4" aria-hidden />
              </button>
            </div>
            {selNeighbours.length > 0 && (
              <>
                <p className="eyebrow mt-4">Connected to</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {selNeighbours.map((n) => (
                    <button key={n.slug} type="button" onClick={() => flyTo(n.slug)} className="rounded-full border border-line-strong px-2.5 py-1 text-xs text-fg-muted hover:border-accent hover:text-fg">
                      {n.name}
                    </button>
                  ))}
                </div>
              </>
            )}
            <Link href={`/aesthetics/${selected.slug}`} className="mt-4 flex h-10 items-center justify-center gap-1.5 rounded-full bg-fg text-sm font-medium text-bg">
              Open {selected.name} <ArrowUpRight className="size-4" aria-hidden />
            </Link>
          </div>
        </aside>
      )}
    </div>
  )
}

function IconBtn({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} aria-label={label} title={label} className="grid size-9 place-items-center rounded-full text-fg-muted hover:bg-surface-2 hover:text-fg">
      {children}
    </button>
  )
}

function Legend({
  categories,
  hidden,
  onToggle,
  onOnly,
  onAll,
  linkOff,
  onToggleLink,
}: {
  categories: [string, number][]
  hidden: Set<string>
  onToggle: (c: string) => void
  onOnly: (c: string) => void
  onAll: () => void
  linkOff: Set<string>
  onToggleLink: (k: string) => void
}) {
  const wide = useSyncExternalStore(subscribeWide, () => window.matchMedia('(min-width: 1024px)').matches, () => false)
  const [choice, setOpen] = useState<boolean | null>(null)
  const open = choice ?? wide
  return (
    // min-h-0 + flex-1: the legend only ever takes the height left under the title card.
    <div className={`pointer-events-auto flex min-h-0 flex-col overflow-hidden rounded-2xl border border-line bg-bg/85 shadow-xl shadow-black/30 backdrop-blur-xl ${open ? 'flex-1' : ''}`}>
      <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="graph-legend" className="flex w-full shrink-0 items-center justify-between gap-3 px-4 py-3 text-left">
        <span>
          <span className="eyebrow block">Filters</span>
          <span className="text-xs text-fg-muted">
            {hidden.size ? `${categories.length - hidden.size} of ${categories.length} categories` : `All ${categories.length} categories`}
            {linkOff.size ? ` · ${LINK_TYPES.length - linkOff.size} of ${LINK_TYPES.length} link types` : ''}
          </span>
        </span>
        <ChevronUp className={`size-4 text-fg-subtle transition-transform ${open ? '' : 'rotate-180'}`} aria-hidden />
      </button>
      {open && (
        <div id="graph-legend" className="flex min-h-0 flex-1 flex-col border-t border-line">
          <div className="shrink-0 border-b border-line p-3">
            <p className="eyebrow mb-2">Relationships</p>
            <div className="flex flex-wrap gap-1.5">
              {LINK_TYPES.map((t) => {
                const off = linkOff.has(t.key)
                return (
                  <button key={t.key} type="button" aria-pressed={!off} onClick={() => onToggleLink(t.key)} className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] transition-opacity ${off ? 'border-line opacity-40' : 'border-line-strong text-fg'}`}>
                    <span className="h-0.5 w-3 rounded-full" style={{ background: t.color }} />
                    {t.label}
                  </button>
                )
              })}
            </div>
          </div>
          <ul role="group" aria-label="Filter by category" className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-1.5 scrollbar-thin">
            {categories.map(([c, n]) => {
              const off = hidden.has(c)
              return (
                <li key={c} className="group flex items-center gap-1 rounded-lg hover:bg-surface-2">
                  <button type="button" aria-pressed={!off} onClick={() => onToggle(c)} className="flex min-w-0 flex-1 items-center gap-2.5 px-2.5 py-1.5 text-left text-sm">
                    <span className={`size-3 shrink-0 rounded-full transition-opacity ${off ? 'opacity-25' : ''}`} style={{ background: categoryColor(c) }} />
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
            <div className="shrink-0 border-t border-line p-2">
              <button type="button" onClick={onAll} className="w-full rounded-lg py-1.5 text-xs text-fg-muted hover:bg-surface-2 hover:text-fg">
                Show all categories
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
