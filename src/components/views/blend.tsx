'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeftRight, Check, Copy, Dices, Link2, Loader2, Search, X } from 'lucide-react'
import { toast } from 'sonner'
import type { AestheticSummary, BlendParent, HybridResponse, SuggestItem } from '@/lib/aesthetic'
import { fetchJson, useSuggest } from '@/lib/client'
import { METRIC_AXES, type PaletteMetrics } from '@/lib/palette-metrics'
import { Thumb } from '@/components/aesthetic/thumb'
import { firstFontFamily, loadGoogleFont, lookupGoogleFont } from '@/components/aesthetic/fonts'

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
  const h = data.hybrid
  const palette = h.palette ?? []
  const from = (hex: string) => (A.colors.some((c) => c.hex.toLowerCase() === hex.toLowerCase()) ? A.name : B.colors.some((c) => c.hex.toLowerCase() === hex.toLowerCase()) ? B.name : 'blend of both')
  const display = firstFontFamily(h.typography?.display)
  const body = firstFontFamily(h.typography?.body)
  useEffect(() => {
    for (const f of [display, body]) if (f) loadGoogleFont(f)
  }, [display, body])

  const brief = [
    `# ${h.name}`,
    '',
    h.tagline ?? '',
    '',
    `Parents: ${A.name} × ${B.name} (${data.label})`,
    '',
    '## Palette',
    ...palette.map((c) => `- ${c.hex} ${c.name} (from ${from(c.hex)})`),
    h.sharedDNA?.length ? `\n## Where they agree\n${h.sharedDNA.map((x) => `- ${x}`).join('\n')}` : '',
    h.conflicts?.length ? `\n## Tensions\n${h.conflicts.map((x) => `- ${x}`).join('\n')}` : '',
    h.materials?.length ? `\n## Materials\n${h.materials.join(', ')}` : '',
    h.objects?.length ? `\n## Objects\n${h.objects.join(', ')}` : '',
    h.typography?.display || h.typography?.body ? `\n## Typography\nDisplay: ${h.typography?.display ?? '—'} · Body: ${h.typography?.body ?? '—'}` : '',
    ...(['synthesis', 'architecture', 'lighting', 'fashion', 'photography'] as const).map((k) => (h[k] ? `\n## ${k[0].toUpperCase() + k.slice(1)}\n${h[k]}` : '')),
  ]
    .filter((x) => x !== undefined)
    .join('\n')

  return (
    <article className="mt-14 space-y-16">
      {/* Title */}
      <section className="flex flex-wrap items-end justify-between gap-6 border-b border-line pb-10">
        <div className="max-w-3xl">
          <p className="eyebrow">{data.label}</p>
          <h2 className="display mt-3 text-5xl leading-[1.02] sm:text-7xl">{h.name}</h2>
          {h.tagline && <p className="mt-4 text-lg leading-relaxed text-fg-muted">{h.tagline}</p>}
        </div>
        <div className="flex flex-wrap gap-2">
          <CopyButton text={brief} label="Copy brief" icon={<Copy className="size-4" aria-hidden />} />
          <CopyButton text={typeof window === 'undefined' ? '' : window.location.href} label="Copy link" icon={<Link2 className="size-4" aria-hidden />} />
        </div>
      </section>

      {/* Palette */}
      <section>
        <SectionTitle eyebrow="Palette" title="The blended palette" note="Click a colour to copy it. Each swatch says which parent it comes from." />
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {palette.map((c, i) => (
            <Swatch key={`${c.hex}-${i}`} hex={c.hex} name={c.name} source={from(c.hex)} />
          ))}
        </div>
      </section>

      {/* Mood board from the parents' real images */}
      {(A.images?.length || B.images?.length) && (
        <section>
          <SectionTitle eyebrow="Mood board" title="What each parent looks like" note="Documented images from both records, side by side (hover for credits)." />
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {[A, B].map((p) => (
              <div key={p.slug}>
                <div className="grid grid-cols-2 gap-2">
                  {(p.images ?? []).slice(0, 3).map((im, i) => (
                    <figure key={im.url} className={`group relative overflow-hidden rounded-[calc(0.9rem*var(--r-scale,1))] bg-surface-2 ${i === 0 ? 'col-span-2 aspect-[16/9]' : 'aspect-[4/3]'}`}>
                      <img src={im.thumb ?? im.url} alt={im.caption} loading="lazy" referrerPolicy="no-referrer" className="size-full object-cover transition-transform duration-700 group-hover:scale-105" />
                      <figcaption className="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-black/80 to-transparent p-3 text-[11px] text-white transition-transform group-hover:translate-y-0">
                        <span className="line-clamp-2">{im.caption}</span>
                        <span className="block truncate opacity-75">{[im.artist, im.license, im.source].filter(Boolean).join(' · ')}</span>
                      </figcaption>
                    </figure>
                  ))}
                  {!p.images?.length && (
                    <div className="col-span-2 flex aspect-[16/9] overflow-hidden rounded-xl">
                      {p.colors.map((c, i) => (
                        <span key={i} className="flex-1" style={{ background: c.hex }} />
                      ))}
                    </div>
                  )}
                </div>
                <Link href={`/aesthetics/${p.slug}`} className="mt-3 flex items-center justify-between gap-3 text-sm">
                  <span className="display text-2xl text-fg hover:text-accent">{p.name}</span>
                  <span className="text-xs text-fg-subtle">{[p.periodStart, p.origin].filter(Boolean).join(' · ') || p.category}</span>
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Measured palette profiles */}
      {A.metrics && B.metrics && (
        <section>
          <SectionTitle eyebrow="Palette profile" title="Where the palettes sit" note="Measured from the real colours (0–100). The blend is measured from its own palette." />
          <div className="mt-6 space-y-5 rounded-2xl border border-line bg-surface p-5 sm:p-8">
            {METRIC_AXES.map((m) => (
              <MetricRow key={m.key} axis={m} a={A.metrics![m.key]} b={B.metrics![m.key]} mix={data.metrics?.[m.key as keyof PaletteMetrics]} names={[A.name, B.name]} />
            ))}
            <div className="flex flex-wrap gap-4 pt-2 text-xs text-fg-subtle">
              <Legend color="var(--fg)" label={A.name} />
              <Legend color="var(--accent)" label="Blend" ring />
              <Legend color="var(--fg-subtle)" label={B.name} hollow />
            </div>
          </div>
        </section>
      )}

      {/* Agreements / tensions */}
      <section className="grid gap-4 md:grid-cols-2">
        <Panel title="Where they agree" items={h.sharedDNA} empty="Few shared tendencies — expect strong contrast." tone="agree" />
        <Panel title="Tensions to resolve" items={h.conflicts} empty="No major conflicts between these palettes." tone="tension" />
      </section>

      {/* Brief */}
      <section>
        <SectionTitle eyebrow="Design brief" title="How it could come together" />
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {h.synthesis && <BriefCard title="How it merges" text={h.synthesis} wide />}
          {(display || body) && (
            <div className="rounded-2xl border border-line bg-surface p-6">
              <p className="eyebrow">Typography</p>
              <p className="mt-3 text-4xl leading-tight text-fg" style={{ fontFamily: display && lookupGoogleFont(display) ? `"${lookupGoogleFont(display)}", serif` : undefined }}>
                {h.name?.split(' × ')[0]}
              </p>
              <p className="mt-2 text-sm text-fg-muted" style={{ fontFamily: body && lookupGoogleFont(body) ? `"${lookupGoogleFont(body)}", sans-serif` : undefined }}>
                Display {h.typography?.display || '—'} · Body {h.typography?.body || '—'}
              </p>
            </div>
          )}
          {h.materials && h.materials.length > 0 && <ChipCard title="Materials" items={h.materials} />}
          {h.objects && h.objects.length > 0 && <ChipCard title="Objects" items={h.objects} />}
          <BriefCard title="Architecture" text={h.architecture} />
          <BriefCard title="Lighting" text={h.lighting} />
          <BriefCard title="Fashion" text={h.fashion} />
          <BriefCard title="Photography" text={h.photography} />
          <BriefCard title="Interface" text={[h.ui?.background, h.ui?.surface, h.ui?.components, h.ui?.motion].filter(Boolean).join(' ')} />
        </div>
      </section>
    </article>
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

function SectionTitle({ eyebrow, title, note }: { eyebrow: string; title: string; note?: string }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h3 className="display mt-1 text-3xl sm:text-4xl">{title}</h3>
      </div>
      {note && <p className="max-w-md text-sm text-fg-subtle">{note}</p>}
    </div>
  )
}

function Swatch({ hex, name, source }: { hex: string; name: string; source: string }) {
  const [done, setDone] = useState(false)
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(hex)
          setDone(true)
          setTimeout(() => setDone(false), 1200)
        } catch {
          toast.error('Could not copy')
        }
      }}
      className="group overflow-hidden rounded-[calc(1rem*var(--r-scale,1))] border border-line bg-surface text-left"
      title={`Copy ${hex}`}
    >
      <span className="relative block aspect-[4/3]" style={{ background: hex }}>
        <span className="absolute right-2 top-2 grid size-7 place-items-center rounded-full bg-black/40 text-white opacity-0 backdrop-blur transition-opacity group-hover:opacity-100">
          {done ? <Check className="size-3.5" aria-hidden /> : <Copy className="size-3.5" aria-hidden />}
        </span>
      </span>
      <span className="block p-3">
        <span className="block truncate text-sm text-fg">{name || hex}</span>
        <span className="flex items-center justify-between gap-2 font-mono text-[11px] text-fg-subtle">
          {hex}
          <span className="truncate font-sans">from {source}</span>
        </span>
      </span>
    </button>
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

function BriefCard({ title, text, wide }: { title: string; text?: string; wide?: boolean }) {
  if (!text) return null
  return (
    <div className={`rounded-2xl border border-line bg-surface p-6 ${wide ? 'md:col-span-2 xl:col-span-3' : ''}`}>
      <p className="eyebrow">{title}</p>
      <p className="mt-3 text-sm leading-relaxed text-fg-muted">{text}</p>
    </div>
  )
}
function ChipCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-6">
      <p className="eyebrow">{title}</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {items.map((i) => (
          <span key={i} className="rounded-full border border-line-strong px-3 py-1 text-xs text-fg-muted">
            {i}
          </span>
        ))}
      </div>
    </div>
  )
}

function CopyButton({ text, label, icon }: { text: string; label: string; icon: React.ReactNode }) {
  const [done, setDone] = useState(false)
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text || window.location.href)
          setDone(true)
          toast.success(`${label.replace('Copy ', '')} copied`)
          setTimeout(() => setDone(false), 1500)
        } catch {
          toast.error('Could not copy')
        }
      }}
      className="flex h-10 items-center gap-2 rounded-full border border-line-strong px-4 text-sm text-fg-muted transition-colors hover:border-accent hover:text-fg"
    >
      {done ? <Check className="size-4" aria-hidden /> : icon} {label}
    </button>
  )
}
