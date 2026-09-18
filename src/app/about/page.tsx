import type { Metadata } from 'next'
import Link from 'next/link'
import { DATA_QUALITY_LABELS, ESTABLISHMENT_LABELS, STATUS_HINTS, STATUS_LABELS } from '@/lib/aesthetic'
import { CATEGORIES } from '@/lib/schema'

export const metadata: Metadata = {
  title: 'About, methodology & terminology',
  description: 'How Aestheticpedia is researched, sourced, illustrated, validated and licensed — and what its terms mean.',
  alternates: { canonical: '/about' },
}

const EVIDENCE_HINTS: Record<string, string> = {
  well_documented: 'Covered by museums, scholarship and encyclopedias',
  moderately_documented: 'Reliable secondary sources exist',
  emerging: 'Recent; documented mostly by press and practitioners',
  interpretive: 'A useful grouping the sources support but do not name as such',
  experimental: 'A speculative or community-coined label',
}
const TYPE_HINTS: Record<string, string> = {
  historical: 'A named movement or period style with a documented history',
  regional_tradition: 'A living or historical practice rooted in a people or place',
  community_subculture: 'A style carried by a social scene or subculture',
  commercial_style: 'A look shaped by industry, brands or media production',
  internet_aesthetic: 'Born and named online',
  experimental_hybrid: 'A documented crossing of two or more established styles',
}

const FIELDS: [string, string][] = [
  ['Visual grammar', 'The formal vocabulary — shapes, line, composition, surface — that makes the aesthetic recognisable.'],
  ['Palette', 'Characteristic colours, derived from documented works; not a brand guideline.'],
  ['Style profile', 'Fifteen scales between opposing qualities (e.g. minimal ↔ maximal), scored 0–100 by editors.'],
  ['Mood profile', 'The feelings the aesthetic reliably evokes, 0–100.'],
  ['In practice', 'How the aesthetic appears in lighting, photography, architecture, fashion, interiors, graphic and interface design.'],
  ['How to evoke it', 'Practical ingredients — materials, objects, music, scent — for recreating the look.'],
  ['Relations', 'Typed links between records: influenced by, variant of, reacts against, often confused with, and more.'],
  ['Sources', 'Tier A: museums, archives, scholarship · B: encyclopedias and major press · C: specialist and community documentation.'],
]

function Glossary({ title, rows }: { title: string; rows: [string, string][] }) {
  return (
    <div>
      <h3 className="display text-3xl">{title}</h3>
      <dl className="mt-4 divide-y divide-line border-y border-line">
        {rows.map(([k, v]) => (
          <div key={k} className="grid gap-1 py-3 sm:grid-cols-[12rem_1fr] sm:gap-6">
            <dt className="text-fg">{k}</dt>
            <dd className="text-sm text-fg-muted">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

export default function AboutPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 pb-16 pt-10 sm:px-6 lg:px-10">
      <p className="eyebrow">About</p>
      <h1 className="display mt-2 text-6xl sm:text-7xl">A vault for every aesthetic.</h1>
      <div className="mt-8 space-y-5 text-lg leading-relaxed text-fg-muted">
        <p>
          Aestheticpedia documents the visual languages people have made — historical movements, architectural styles,
          regional crafts and dress, sacred art, subcultures, commercial looks and aesthetics born online — as structured,
          sourced, reusable records.
        </p>
        <p>
          Each record combines an encyclopedic description with a design-oriented breakdown: palette, forms, materials,
          typography, how the aesthetic shows up across disciplines, and how it relates to others. Everything is open data.
        </p>
      </div>

      <section className="mt-20 space-y-6" aria-labelledby="method">
        <h2 id="method" className="display text-5xl">Methodology</h2>
        <ol className="grid gap-4 sm:grid-cols-2">
          {[
            ['Research', 'Records are written from museum collections, scholarship, encyclopedias and specialist sources, each cited with a quality tier.'],
            ['Illustration', 'Images are matched through Wikipedia, Wikidata and Wikimedia Commons, and museum open-access collections (Art Institute of Chicago). Only freely licensed files are used; non-free, icon and map files are excluded; every image keeps its artist, license and source page.'],
            ['Validation', 'Every build checks each record against a strict schema (slugs, hex colours, URLs, enumerations, relation targets). A link checker verifies Wikipedia titles through the MediaWiki API and probes every other URL; dead links are hidden automatically.'],
            ['Review', 'Records move from Stub to Documented to Reviewed as they are deepened and checked. Anyone can propose changes on GitHub.'],
          ].map(([t, d], i) => (
            <li key={t} className="rounded-2xl border border-line bg-surface p-6">
              <span className="font-mono text-xs text-fg-subtle">0{i + 1}</span>
              <p className="display mt-2 text-3xl">{t}</p>
              <p className="mt-2 text-sm leading-relaxed text-fg-muted">{d}</p>
            </li>
          ))}
        </ol>
        <p className="text-sm text-fg-subtle">
          Style and mood profiles are editorial judgements to help discovery, not measurements. Where a label is
          community-coined or interpretive, the record’s evidence rating says so.
        </p>
      </section>

      <section id="terminology" className="mt-20 scroll-mt-24 space-y-12" aria-labelledby="terms">
        <h2 id="terms" className="display text-5xl">Terminology</h2>
        <Glossary title="Status" rows={Object.entries(STATUS_LABELS).map(([k, v]) => [v, STATUS_HINTS[k]])} />
        <Glossary title="Evidence" rows={Object.entries(DATA_QUALITY_LABELS).map(([k, v]) => [v, EVIDENCE_HINTS[k]])} />
        <Glossary title="Type" rows={Object.entries(ESTABLISHMENT_LABELS).map(([k, v]) => [v, TYPE_HINTS[k]])} />
        <Glossary title="Record sections" rows={FIELDS} />
        <div>
          <h3 className="display text-3xl">Categories</h3>
          <ul className="mt-4 flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <li key={c}>
                <Link href={`/aesthetics?category=${encodeURIComponent(c)}`} className="rounded-full border border-line-strong px-3 py-1.5 text-sm text-fg-muted hover:text-fg">
                  {c}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mt-20 space-y-4" aria-labelledby="license">
        <h2 id="license" className="display text-5xl">Licensing</h2>
        <p className="text-fg-muted">
          Record text and data are available under{' '}
          <a href="https://creativecommons.org/licenses/by-sa/4.0/" className="link-underline">CC BY-SA 4.0</a>. Images are not
          ours: each is credited to its creator with its own license (public domain, CC0, CC BY, CC BY-SA…) and a link to its
          source page. The site’s code is MIT-licensed.
        </p>
      </section>
    </main>
  )
}
