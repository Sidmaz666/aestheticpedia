'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import type { TimelineItem } from '@/lib/aesthetic'
import { paletteArt } from '@/components/aesthetic/art-image'

const ERAS: { id: string; label: string; from: number; to: number; blurb: string }[] = [
  { id: 'ancient', label: 'Antiquity', from: -50000, to: 499, blurb: 'Prehistoric craft to the classical world' },
  { id: 'medieval', label: 'Medieval', from: 500, to: 1399, blurb: 'Sacred art, courts and pilgrim routes' },
  { id: '1400s', label: '15th century', from: 1400, to: 1499, blurb: 'Renaissance, Timurid and Ming worlds' },
  { id: '1500s', label: '16th century', from: 1500, to: 1599, blurb: 'Mannerism, Mughal ateliers, Momoyama' },
  { id: '1600s', label: '17th century', from: 1600, to: 1699, blurb: 'Baroque splendour and Edo refinement' },
  { id: '1700s', label: '18th century', from: 1700, to: 1799, blurb: 'Rococo, Neoclassicism, the Grand Tour' },
  { id: '1800s', label: 'Early 19th c.', from: 1800, to: 1849, blurb: 'Romanticism and revivals' },
  { id: '1850s', label: 'Late 19th c.', from: 1850, to: 1899, blurb: 'Industry, Impressionism, Arts & Crafts' },
  { id: '1900s', label: '1900s–1910s', from: 1900, to: 1919, blurb: 'Art Nouveau into the avant-garde' },
  { id: '1920s', label: '1920s', from: 1920, to: 1929, blurb: 'Deco, Bauhaus, Constructivism' },
  { id: '1930s', label: '1930s', from: 1930, to: 1939, blurb: 'Streamline and surrealism' },
  { id: '1940s', label: '1940s', from: 1940, to: 1949, blurb: 'Wartime austerity and noir' },
  { id: '1950s', label: '1950s', from: 1950, to: 1959, blurb: 'Mid-century modern and atomic age' },
  { id: '1960s', label: '1960s', from: 1960, to: 1969, blurb: 'Pop, psychedelia, space age' },
  { id: '1970s', label: '1970s', from: 1970, to: 1979, blurb: 'Punk, disco, earth tones' },
  { id: '1980s', label: '1980s', from: 1980, to: 1989, blurb: 'Memphis, neon, postmodernism' },
  { id: '1990s', label: '1990s', from: 1990, to: 1999, blurb: 'Grunge, rave and the early web' },
  { id: '2000s', label: '2000s', from: 2000, to: 2009, blurb: 'Y2K, Frutiger Aero, blog culture' },
  { id: '2010s', label: '2010s', from: 2010, to: 2019, blurb: 'Vaporwave, cottagecore, internet cores' },
  { id: '2020s', label: '2020s', from: 2020, to: 2100, blurb: 'Post-pandemic and post-internet' },
]

const year = (y: number) => (y < 0 ? `${Math.abs(y).toLocaleString('en')} BCE` : String(y))

type Item = Pick<TimelineItem, 'slug' | 'name' | 'category' | 'startYear' | 'image' | 'colors'>

export function TimelineView({ items }: { items: Item[] }) {
  const categories = useMemo(() => [...new Set(items.map((i) => i.category))].sort(), [items])
  const [category, setCategory] = useState('')
  const filtered = category ? items.filter((i) => i.category === category) : items
  const groups = ERAS.map((e) => ({ ...e, items: filtered.filter((i) => i.startYear >= e.from && i.startYear <= e.to) }))
  const max = Math.max(1, ...groups.map((g) => g.items.length))

  const jump = (id: string) => document.getElementById(`era-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  return (
    <main className="mx-auto w-full max-w-[1600px] px-4 pb-16 pt-10 sm:px-6 lg:px-10">
      <p className="eyebrow">Chronology</p>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-6">
        <h1 className="display text-6xl sm:text-7xl">Timeline</h1>
        <label className="flex items-center gap-3 text-sm text-fg-subtle">
          Category
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="h-10 rounded-full border border-line-strong bg-surface px-4 text-sm text-fg focus:outline-none">
            <option value="">All ({items.length})</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
      </div>
      <p className="mt-3 max-w-2xl text-fg-muted">
        {filtered.length.toLocaleString('en')} dated aesthetics, placed by the year they emerged. Select an era in the chart to jump to it.
      </p>

      {/* Density chart — doubles as era navigation */}
      <div className="sticky top-16 z-10 -mx-4 mt-10 border-y border-line bg-bg/85 px-4 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10">
        <div className="grid h-20 grid-cols-[repeat(20,minmax(0,1fr))] items-end gap-1" role="list" aria-label="Aesthetics per era">
          {groups.map((g) => (
            <button
              key={g.id}
              type="button"
              role="listitem"
              onClick={() => jump(g.id)}
              disabled={!g.items.length}
              className="group flex h-full flex-col justify-end"
              title={`${g.label}: ${g.items.length}`}
              aria-label={`${g.label}, ${g.items.length} aesthetics`}
            >
              <span
                className="block w-full rounded-t-sm bg-fg-subtle/60 transition-colors group-hover:bg-accent group-disabled:opacity-30"
                style={{ height: `${Math.max(4, (g.items.length / max) * 100)}%` }}
              />
            </button>
          ))}
        </div>
        <div className="mt-1.5 grid grid-cols-[repeat(20,minmax(0,1fr))] gap-1 font-mono text-[9px] text-fg-subtle">
          {groups.map((g, i) => (
            <span key={g.id} className={`truncate text-center ${i % 2 ? 'hidden sm:block' : ''}`}>
              {g.id === 'ancient' ? 'Ant.' : g.id === 'medieval' ? 'Med.' : g.id.replace('00s', '00')}
            </span>
          ))}
        </div>
      </div>

      <ol className="mt-4">
        {groups
          .filter((g) => g.items.length)
          .map((g) => (
            <li key={g.id} id={`era-${g.id}`} className="grid scroll-mt-44 gap-6 border-b border-line py-12 lg:grid-cols-[16rem_1fr] lg:gap-12">
              <div className="lg:sticky lg:top-48 lg:self-start">
                <h2 className="display text-5xl">{g.label}</h2>
                <p className="mt-2 font-mono text-xs text-fg-subtle">
                  {g.from < 0 ? 'before 500' : `${g.from}–${Math.min(g.to, new Date().getFullYear())}`} · {g.items.length}
                </p>
                <p className="mt-3 text-sm text-fg-muted">{g.blurb}</p>
              </div>
              <ul data-reveal-group className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
                {g.items.map((it) => (
                  <li key={it.slug}>
                    <Link href={`/aesthetics/${it.slug}`} prefetch={false} className="group block">
                      <span className="relative block aspect-[4/3] overflow-hidden rounded-lg ring-1 ring-inset ring-line" style={it.image ? { backgroundColor: it.colors[0]?.hex } : paletteArt(it.colors, it.name.length)}>
                        {it.image && (
                          <img src={it.image} alt="" loading="lazy" decoding="async" referrerPolicy="no-referrer" className="size-full object-cover transition-transform duration-700 group-hover:scale-105" />
                        )}
                        <span className="absolute left-2 top-2 rounded-full bg-black/55 px-2 py-0.5 font-mono text-[10px] text-white backdrop-blur">
                          {year(it.startYear)}
                        </span>
                      </span>
                      <span className="mt-2 block text-sm leading-snug text-fg group-hover:text-accent">{it.name}</span>
                      <span className="block truncate text-xs text-fg-subtle">{it.category}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          ))}
      </ol>
    </main>
  )
}
