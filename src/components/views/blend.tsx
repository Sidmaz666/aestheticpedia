'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeftRight, Loader2, Search, X } from 'lucide-react'
import type { HybridResponse, SuggestItem } from '@/lib/aesthetic'
import { fetchJson, useSuggest } from '@/lib/client'
import { Thumb } from '@/components/aesthetic/thumb'

export function BlendView() {
  const sp = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const a = sp.get('a') ?? ''
  const b = sp.get('b') ?? ''
  const set = (k: 'a' | 'b', v: string) => {
    const p = new URLSearchParams(sp.toString())
    if (v) p.set(k, v)
    else p.delete(k)
    router.replace(`${pathname}?${p}`, { scroll: false })
  }

  const { data, isFetching, error } = useQuery({
    queryKey: ['blend', a, b],
    queryFn: () => fetchJson<HybridResponse>(`/api/v1/blend?a=${encodeURIComponent(a)}&b=${encodeURIComponent(b)}`),
    enabled: !!a && !!b && a !== b,
  })
  const h = data?.hybrid

  return (
    <main className="mx-auto w-full max-w-[1400px] px-4 pb-16 pt-10 sm:px-6 lg:px-10">
      <p className="eyebrow">Speculative synthesis</p>
      <h1 className="display mt-2 text-6xl sm:text-7xl">Blend</h1>
      <p className="mt-3 max-w-2xl text-fg-muted">
        Cross two documented aesthetics. The result is derived only from their records — palettes interleaved around a
        blended anchor colour, materials and objects alternated, agreements and tensions read from their measured palettes.
        It is a design prompt, not a documented style.
      </p>

      <div className="mt-10 grid items-center gap-4 md:grid-cols-[1fr_auto_1fr]">
        <Picker label="First aesthetic" slug={a} onPick={(s) => set('a', s)} />
        <button
          type="button"
          onClick={() => {
            const p = new URLSearchParams(sp.toString())
            p.set('a', b)
            p.set('b', a)
            router.replace(`${pathname}?${p}`, { scroll: false })
          }}
          disabled={!a || !b}
          className="mx-auto grid size-11 place-items-center rounded-full border border-line-strong text-fg-muted hover:text-fg disabled:opacity-40"
          aria-label="Swap"
        >
          <ArrowLeftRight className="size-4" aria-hidden />
        </button>
        <Picker label="Second aesthetic" slug={b} onPick={(s) => set('b', s)} />
      </div>

      {isFetching && (
        <p className="mt-10 flex items-center gap-2 text-sm text-fg-subtle">
          <Loader2 className="size-4 animate-spin" aria-hidden /> Blending…
        </p>
      )}
      {error && <p className="mt-10 text-sm text-danger">{(error as Error).message}</p>}

      {h && data && (
        <article className="mt-12 overflow-hidden rounded-3xl border border-line bg-surface">
          <div className="flex h-40 sm:h-56">
            {(h.palette ?? []).map((c, i) => (
              <div key={`${c.hex}-${i}`} className="flex flex-1 items-end p-3" style={{ background: c.hex }}>
                <span className="rounded bg-black/35 px-1.5 py-0.5 font-mono text-[10px] text-white backdrop-blur">{c.hex}</span>
              </div>
            ))}
          </div>
          <div className="space-y-10 p-6 sm:p-10">
            <div>
              <p className="eyebrow">{data.label}</p>
              <h2 className="display mt-3 text-5xl sm:text-6xl">{h.name}</h2>
              <p className="mt-3 max-w-3xl text-fg-muted">{h.tagline}</p>
              <p className="mt-4 text-sm text-fg-subtle">
                Parents:{' '}
                {data.parents.map((p, i) => (
                  <span key={p.slug}>
                    {i > 0 && ' × '}
                    <Link href={`/aesthetics/${p.slug}`} className="link-underline text-fg">
                      {p.name}
                    </Link>
                  </span>
                ))}
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2">
              <Block title="How it merges" text={h.synthesis} />
              <List title="Where they agree" items={h.sharedDNA} empty="Few shared tendencies — expect contrast." />
              <List title="Tensions to resolve" items={h.conflicts} empty="No major conflicts between these profiles." />
              <List title="Materials" items={h.materials} />
              <List title="Objects" items={h.objects} />
              <Block title="Typography" text={[h.typography?.display && `Display: ${h.typography.display}`, h.typography?.body && `Body: ${h.typography.body}`].filter(Boolean).join(' · ')} />
              <Block title="Architecture" text={h.architecture} />
              <Block title="Lighting" text={h.lighting} />
              <Block title="Fashion" text={h.fashion} />
              <Block title="Photography" text={h.photography} />
              <Block title="Interface" text={[h.ui?.background, h.ui?.surface, h.ui?.components, h.ui?.motion].filter(Boolean).join(' ')} />
            </div>
          </div>
        </article>
      )}
    </main>
  )
}

function Block({ title, text }: { title: string; text?: string }) {
  if (!text) return null
  return (
    <div>
      <p className="eyebrow">{title}</p>
      <p className="mt-2 text-sm leading-relaxed text-fg-muted">{text}</p>
    </div>
  )
}
function List({ title, items, empty }: { title: string; items?: string[]; empty?: string }) {
  if (!items?.length && !empty) return null
  return (
    <div>
      <p className="eyebrow">{title}</p>
      {items?.length ? (
        <ul className="mt-2 space-y-1 text-sm text-fg-muted">
          {items.map((i) => (
            <li key={i}>— {i}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-fg-subtle">{empty}</p>
      )}
    </div>
  )
}

function Picker({ label, slug, onPick }: { label: string; slug: string; onPick: (slug: string) => void }) {
  const [q, setQ] = useState('')
  const [debounced, setDebounced] = useState('')
  useEffect(() => {
    const t = setTimeout(() => setDebounced(q), 150)
    return () => clearTimeout(t)
  }, [q])
  const { data } = useSuggest(debounced)
  const { data: current } = useQuery({
    queryKey: ['pick', slug],
    queryFn: () => fetchJson<{ items: SuggestItem[] }>(`/api/v1/search?limit=1&q=${encodeURIComponent(slug.replace(/-/g, ' '))}`),
    enabled: !!slug,
    select: (d) => d.items.find((i) => i.slug === slug) ?? { slug, name: slug.replace(/-/g, ' '), category: '' },
  })

  if (slug && current)
    return (
      <div className="flex items-center gap-4 rounded-2xl border border-line bg-surface p-3">
        <Thumb image={current.image} colors={current.colors} name={current.name} className="size-16 rounded-xl" />
        <span className="min-w-0 flex-1">
          <span className="eyebrow block">{label}</span>
          <span className="display block truncate text-2xl capitalize">{current.name}</span>
        </span>
        <button type="button" onClick={() => onPick('')} className="grid size-9 place-items-center rounded-full text-fg-subtle hover:bg-surface-2 hover:text-fg" aria-label={`Clear ${label}`}>
          <X className="size-4" aria-hidden />
        </button>
      </div>
    )

  return (
    <div className="relative">
      <label className="flex h-[5.5rem] items-center gap-3 rounded-2xl border border-dashed border-line-strong px-4">
        <Search className="size-4 text-fg-subtle" aria-hidden />
        <span className="sr-only">{label}</span>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={label} className="w-full bg-transparent text-lg placeholder:text-fg-subtle focus:outline-none" />
      </label>
      {q && (data?.items.length ?? 0) > 0 && (
        <ul className="absolute inset-x-0 top-full z-20 mt-2 max-h-80 overflow-y-auto rounded-2xl border border-line-strong bg-surface p-1.5 shadow-2xl no-scrollbar">
          {data!.items.map((it) => (
            <li key={it.slug}>
              <button type="button" onClick={() => { onPick(it.slug); setQ('') }} className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left hover:bg-surface-2">
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
