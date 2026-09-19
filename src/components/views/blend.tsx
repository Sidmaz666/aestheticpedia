'use client'

import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeftRight, Dices, Loader2, Search, X } from 'lucide-react'
import type { AestheticDetailResponse, AestheticSummary, BlendParent, HybridResponse, SuggestItem } from '@/lib/aesthetic'
import { themeFromPalette } from '@/lib/theme'
import { AestheticArticle } from '@/components/aesthetic/article'
import { AestheticFonts } from '@/components/aesthetic/theme-scope'
import { fetchJson, useSuggest } from '@/lib/client'
import { METRIC_AXES, type PaletteMetrics } from '@/lib/palette-metrics'
import { Thumb } from '@/components/aesthetic/thumb'

// Pairings that make instructive blends (all are documented records).
const PAIRS: [string, string, string, string][] = [
  ['bauhaus', 'Bauhaus', 'art-nouveau', 'Art Nouveau'],
  ['cottagecore', 'Cottagecore', 'cyberpunk', 'Cyberpunk'],
  ['wabi-sabi', 'Wabi-sabi', 'memphis-design', 'Memphis Design'],
  ['vaporwave', 'Vaporwave', 'baroque-sculpture', 'Baroque sculpture'],
  ['afrofuturism', 'Afrofuturism', 'art-deco', 'Art Deco'],
  ['ukiyo-e', 'Ukiyo-e', 'brutalism', 'Brutalism'],
  ['dark-academia', 'Dark Academia', 'solarpunk', 'Solarpunk'],
  ['gothic-architecture', 'Gothic architecture', 'mid-century-modern', 'Mid-century modern'],
]

export function BlendView() {
  const sp = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const a = sp.get('a') ?? ''
  const b = sp.get('b') ?? ''
  const go = (na: string, nb: string) => {
    const p = new URLSearchParams()
    if (na) p.set('a', na)
    if (nb) p.set('b', nb)
    router.replace(p.size ? `${pathname}?${p}` : pathname, { scroll: false })
  }
  const [rolling, setRolling] = useState(false)
  // Arriving with nothing chosen shows a random curated pairing, so the page is never empty.
  useEffect(() => {
    if (!sp.get('a') && !sp.get('b')) {
      const [sa, , sb] = PAIRS[Math.floor(Math.random() * PAIRS.length)]
      router.replace(`${pathname}?a=${sa}&b=${sb}`, { scroll: false })
    }
  }, [])
  const surprise = async () => {
    setRolling(true)
    try {
      const [x, y] = await Promise.all([0, 1].map(() => fetchJson<{ item: AestheticSummary }>('/api/v1/random?mode=illustrated')))
      if (x.item.slug !== y.item.slug) go(x.item.slug, y.item.slug)
    } finally {
      setRolling(false)
    }
  }

  const { data, isFetching, error } = useQuery({
    queryKey: ['blend', a, b],
    queryFn: () => fetchJson<HybridResponse>(`/api/v1/blend?a=${encodeURIComponent(a)}&b=${encodeURIComponent(b)}`),
    enabled: !!a && !!b && a !== b,
  })
  const [A, B] = data?.parents ?? []

  return (
    <main className="mx-auto w-full max-w-[1400px] px-4 pb-24 pt-10 sm:px-6 lg:px-10">
      <header className="flex flex-wrap items-end justify-between gap-6">
        <div className="max-w-2xl">
          <p className="eyebrow">Speculative synthesis</p>
          <h1 className="display mt-2 text-6xl sm:text-7xl">Blend</h1>
          <p className="mt-3 text-fg-muted">
            Cross two documented aesthetics. Everything below is derived from their records — palettes, images, materials, measured colour
            profiles — and shown side by side, so you can see where they agree and where they pull apart. A design prompt, not a documented style.
          </p>
        </div>
        <button
          type="button"
          onClick={surprise}
          disabled={rolling}
          className="flex h-11 items-center gap-2 rounded-full border border-line-strong px-5 text-sm text-fg-muted transition-colors hover:border-accent hover:text-fg disabled:opacity-60"
        >
          {rolling ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Dices className="size-4" aria-hidden />} Surprise me
        </button>
      </header>

      {/* Parents */}
      <div className="mt-10 grid items-stretch gap-4 md:grid-cols-[1fr_auto_1fr]">
        <Slot label="First aesthetic" slug={a} parent={A} onPick={(s) => go(s, b)} />
        <div className="flex items-center justify-center gap-2 md:flex-col">
          <button
            type="button"
            onClick={() => go(b, a)}
            disabled={!a || !b}
            className="group grid size-14 place-items-center rounded-full border border-line-strong bg-surface text-fg shadow-lg transition-all hover:-translate-y-0.5 hover:border-accent disabled:opacity-40"
            aria-label="Swap the two aesthetics"
            title="Swap"
            // The blend's anchor colour glows around the button once there is a result.
            style={data?.hybrid.palette?.[0] ? { boxShadow: `0 0 0 5px ${data.hybrid.palette[0].hex}55, 0 10px 30px -10px ${data.hybrid.palette[0].hex}` } : undefined}
          >
            <ArrowLeftRight className="size-5 transition-transform duration-300 group-hover:rotate-180" aria-hidden />
          </button>
          <span className="text-[11px] uppercase tracking-wider text-fg-subtle">Swap</span>
        </div>
        <Slot label="Second aesthetic" slug={b} parent={B} onPick={(s) => go(a, s)} />
      </div>

      {(!a || !b) && (
        <section className="mt-12">
          <p className="eyebrow">Try a pairing</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {PAIRS.map(([sa, na, sb, nb]) => (
              <button
                key={sa + sb}
                type="button"
                onClick={() => go(sa, sb)}
                className="group rounded-2xl border border-line bg-surface p-4 text-left transition-colors hover:border-line-strong"
              >
                <span className="display block text-xl leading-tight text-fg group-hover:text-accent">
                  {na} <span className="text-fg-subtle">×</span> {nb}
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      {a && b && a === b && <p className="mt-10 text-sm text-fg-muted">Pick two different aesthetics.</p>}
      {isFetching && (
        <p className="mt-10 flex items-center gap-2 text-sm text-fg-subtle">
          <Loader2 className="size-4 animate-spin" aria-hidden /> Blending…
        </p>
      )}
      {error && <p className="mt-10 text-sm text-danger">{(error as Error).message}</p>}
      {data && A && B && !isFetching && <Result data={data} A={A} B={B} />}

      {a && b && (
        <section className="mt-20 border-t border-line pt-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="eyebrow">Try another pairing</p>
            <button type="button" onClick={surprise} disabled={rolling} className="flex items-center gap-1.5 text-sm text-fg-muted hover:text-fg disabled:opacity-60">
              <Dices className="size-4" aria-hidden /> Random pair
            </button>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {PAIRS.filter(([sa, , sb]) => !(sa === a && sb === b)).map(([sa, na, sb, nb]) => (
              <button key={sa + sb} type="button" onClick={() => go(sa, sb)} className="rounded-full border border-line-strong px-4 py-2 text-sm text-fg-muted transition-colors hover:border-accent hover:text-fg">
                {na} × {nb}
              </button>
            ))}
          </div>
        </section>
      )}
    </main>
  )
}

// ---------------------------------------------------------------------------
function Result({ data, A, B }: { data: HybridResponse; A: BlendParent; B: BlendParent }) {
  const record = data.record
  const theme = useMemo(() => (record ? themeFromPalette(record.colors, record.metrics?.contrast ?? undefined) : null), [record])
  if (!record) return null
  const h = data.hybrid
  const detail: AestheticDetailResponse = {
    aesthetic: record,
    relations: {
      outgoing: [A, B].map((p) => ({ type: 'hybrid_of', note: 'Parent of this blend', target: { slug: p.slug, name: p.name, category: p.category ?? '', image: p.images?.[0]?.thumb ?? p.images?.[0]?.url ?? null, colors: p.colors } })),
      incoming: [],
    },
  }
  const lineage = { ancestors: [A, B].map((p) => ({ slug: p.slug, name: p.name, image: p.images?.[0]?.thumb ?? null, colors: p.colors, children: [] })), descendants: [] }
  const qs = `a=${encodeURIComponent(A.slug)}&b=${encodeURIComponent(B.slug)}`
  return (
    <div className="mt-14">
      {/* What only a blend has: where each parent sits against the blend, and where they agree or pull apart */}
      <section className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        {A.metrics && B.metrics && (
          <div className="rounded-2xl border border-line bg-surface p-5 sm:p-7">
            <p className="eyebrow">Palette profile</p>
            <p className="display mt-1 text-2xl">Where the three palettes sit</p>
            <div className="mt-5 space-y-4">
              {METRIC_AXES.map((m) => (
                <MetricRow key={m.key} axis={m} a={A.metrics![m.key]} b={B.metrics![m.key]} mix={data.metrics?.[m.key as keyof PaletteMetrics]} names={[A.name, B.name]} />
              ))}
            </div>
            <div className="flex flex-wrap gap-4 pt-4 text-xs text-fg-subtle">
              <Legend color="var(--fg)" label={A.name} />
              <Legend color="var(--accent)" label="Blend" ring />
              <Legend color="var(--fg-subtle)" label={B.name} hollow />
            </div>
          </div>
        )}
        <div className="grid gap-4">
          <Panel title="Where they agree" items={h.sharedDNA} empty="Few shared tendencies — expect strong contrast." tone="agree" />
          <Panel title="Tensions to resolve" items={h.conflicts} empty="No major conflicts between these palettes." tone="tension" />
        </div>
      </section>

      {/* The blend as a full aesthetic page, themed with its own palette and type */}
      <div
        id="blend-scope"
        className="mt-10 overflow-hidden rounded-[calc(1.75rem*var(--r-scale,1))] border border-line bg-bg text-fg"
        style={{ ...((theme?.vars ?? {}) as CSSProperties), colorScheme: theme?.mode }}
      >
        <AestheticFonts display={record.typePairing.display} body={record.typePairing.body} targetId="blend-scope" />
        <div className="px-4 pt-6 sm:px-8">
          <p className="rounded-full border border-line-strong bg-surface px-4 py-2 text-center text-xs text-fg-muted">{data.label}</p>
        </div>
        <AestheticArticle
          detail={detail}
          similar={[]}
          mode="blend"
          materialPhotos={data.materialPhotos}
          lineage={lineage}
          among={[]}
          exportHref={(fmt) => `/api/v1/blend?${qs}&format=${fmt}&download=1`}
          shareUrl={typeof window === 'undefined' ? undefined : window.location.href}
        />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
function Slot({ label, slug, parent, onPick }: { label: string; slug: string; parent?: BlendParent; onPick: (slug: string) => void }) {
  const [q, setQ] = useState('')
  const [debounced, setDebounced] = useState('')
  const [editing, setEditing] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(q), 150)
    return () => clearTimeout(t)
  }, [q])
  const { data } = useSuggest(debounced)
  const { data: current } = useQuery({
    queryKey: ['pick', slug],
    queryFn: () => fetchJson<{ items: SuggestItem[] }>(`/api/v1/search?limit=5&q=${encodeURIComponent(slug.replace(/-/g, ' '))}`),
    enabled: !!slug && !parent,
    select: (d) => d.items.find((i) => i.slug === slug) ?? { slug, name: slug.replace(/-/g, ' '), category: '' },
  })

  if (slug && !editing) {
    const name = parent?.name ?? current?.name ?? slug
    const image = parent?.images?.[0]?.thumb ?? parent?.images?.[0]?.url ?? current?.image
    const colors = parent?.colors ?? current?.colors ?? []
    return (
      <div className="group relative flex min-h-44 flex-col justify-end overflow-hidden rounded-[calc(1.25rem*var(--r-scale,1))] border border-line bg-surface">
        {image ? (
          <img src={image} alt="" referrerPolicy="no-referrer" className="absolute inset-0 size-full object-cover opacity-70 transition-transform duration-700 group-hover:scale-105" />
        ) : (
          <div className="absolute inset-0 flex">
            {colors.map((c, i) => (
              <span key={i} className="flex-1" style={{ background: c.hex }} />
            ))}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/60 to-transparent" />
        <div className="relative p-5">
          <p className="eyebrow">{label}</p>
          <Link href={`/aesthetics/${slug}`} className="display mt-1 block truncate text-3xl text-fg hover:text-accent">
            {name}
          </Link>
          {parent?.category && <p className="text-xs text-fg-subtle">{parent.category}</p>}
          {colors.length > 0 && (
            <div className="mt-3 flex h-2 overflow-hidden rounded-full">
              {colors.map((c, i) => (
                <span key={i} className="flex-1" style={{ background: c.hex }} />
              ))}
            </div>
          )}
        </div>
        <div className="absolute right-3 top-3 flex gap-1.5">
          <button
            type="button"
            onClick={() => {
              setEditing(true)
              setTimeout(() => inputRef.current?.focus(), 0)
            }}
            className="rounded-full bg-bg/80 px-3 py-1.5 text-xs text-fg backdrop-blur hover:bg-bg"
          >
            Change
          </button>
          <button type="button" onClick={() => onPick('')} className="grid size-8 place-items-center rounded-full bg-bg/80 text-fg-muted backdrop-blur hover:text-fg" aria-label={`Clear ${label}`}>
            <X className="size-4" aria-hidden />
          </button>
        </div>
      </div>
    )
  }

  const items = q ? (data?.items ?? []) : []
  return (
    <div className="relative">
      <label className="flex min-h-44 flex-col justify-center gap-3 rounded-[calc(1.25rem*var(--r-scale,1))] border border-dashed border-line-strong bg-surface/40 p-5 transition-colors focus-within:border-accent">
        <span className="eyebrow">{label}</span>
        <span className="flex items-center gap-3">
          <Search className="size-5 text-fg-subtle" aria-hidden />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onBlur={() => setTimeout(() => setEditing(false), 150)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && items[0]) {
                onPick(items[0].slug)
                setQ('')
                setEditing(false)
              }
              if (e.key === 'Escape') setEditing(false)
            }}
            placeholder="Search an aesthetic…"
            className="w-full bg-transparent text-xl placeholder:text-fg-subtle focus:outline-none"
            aria-label={label}
          />
        </span>
      </label>
      {items.length > 0 && (
        <ul className="absolute inset-x-0 top-full z-20 mt-2 max-h-80 overflow-y-auto rounded-2xl border border-line-strong bg-surface p-1.5 shadow-2xl no-scrollbar">
          {items.map((it) => (
            <li key={it.slug}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onPick(it.slug)
                  setQ('')
                  setEditing(false)
                }}
                className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left hover:bg-surface-2"
              >
                <Thumb image={it.image} colors={it.colors} name={it.name} className="size-10 rounded-lg" />
                <span className="min-w-0">
                  <span className="block truncate text-sm">{it.name}</span>
                  <span className="block truncate text-xs text-fg-subtle">{it.category}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}



function MetricRow({ axis, a, b, mix, names }: { axis: (typeof METRIC_AXES)[number]; a: number; b: number; mix?: number; names: [string, string] }) {
  return (
    <div className="grid items-center gap-2 sm:grid-cols-[9rem_1fr]">
      <p className="text-sm text-fg" title={axis.describe}>
        {axis.left} ↔ {axis.right}
      </p>
      <div className="relative h-8">
        <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-line" />
        <div className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-accent-soft" style={{ left: `${Math.min(a, b)}%`, width: `${Math.abs(a - b)}%` }} />
        <Marker at={a} className="bg-fg" label={`${names[0]}: ${a}`} />
        <Marker at={b} className="border-2 border-fg-subtle bg-bg" label={`${names[1]}: ${b}`} />
        {mix !== undefined && <Marker at={mix} className="bg-accent ring-4 ring-accent-soft" label={`Blend: ${mix}`} />}
      </div>
    </div>
  )
}
function Marker({ at, className, label }: { at: number; className: string; label: string }) {
  return <span className={`absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full ${className}`} style={{ left: `${at}%` }} title={label} aria-label={label} role="img" />
}
function Legend({ color, label, ring, hollow }: { color: string; label: string; ring?: boolean; hollow?: boolean }) {
  return (
    <span className="flex items-center gap-2">
      <span className={`size-3 rounded-full ${ring ? 'ring-4 ring-accent-soft' : ''}`} style={hollow ? { border: `2px solid ${color}` } : { background: color }} />
      {label}
    </span>
  )
}

function Panel({ title, items, empty, tone }: { title: string; items?: string[]; empty: string; tone: 'agree' | 'tension' }) {
  return (
    <div className={`rounded-2xl border p-6 ${tone === 'agree' ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-amber-500/30 bg-amber-500/5'}`}>
      <p className="eyebrow">{title}</p>
      {items?.length ? (
        <ul className="mt-3 space-y-2 text-sm leading-relaxed text-fg-muted">
          {items.map((i) => (
            <li key={i} className="flex gap-2">
              <span className={tone === 'agree' ? 'text-emerald-500' : 'text-amber-500'}>{tone === 'agree' ? '＝' : '≠'}</span>
              {i}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-fg-subtle">{empty}</p>
      )}
    </div>
  )
}


