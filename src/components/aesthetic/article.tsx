import Link from 'next/link'
import { ArrowUpRight, BookOpen, Braces, ExternalLink, FileCode2, GitPullRequest, Globe, Landmark, PlaySquare } from 'lucide-react'
import {
  DATA_QUALITY_LABELS,
  ESTABLISHMENT_LABELS,
  STATUS_HINTS,
  STATUS_LABELS,
  imageCredit as credit,
  labelize,
  type AestheticDetailResponse,
  type AestheticFull,
  type AestheticSummary,
  type ReferenceEntry,
  type RelationTarget,
} from '@/lib/aesthetic'
import { AestheticCard, periodLabel } from './card'
import { ConnectionMap, LineageTree } from './diagrams'
import type { LineageNode } from '@/lib/queries'
import { MetricsSection } from './metrics'
import { ExportMenu, ShareButton } from './export-menu'
import { Gallery, HeroImage } from './gallery'
import { PaletteSwatches } from './palette-swatches'
import { SectionNav } from './section-nav'
import { MaterialGallery } from './materials'
import { Imagine } from '@/components/ai/imagine'
import { StyleDemo } from './style-demo'
import { SITE_NAME, repoEdit } from '@/lib/site'


const RELATION_LABELS: Record<string, [string, string]> = {
  // type: [outgoing label, incoming label]
  parent: ['Parent style', 'Parent of'],
  variant_of: ['Variant of', 'Variants'],
  influenced_by: ['Influenced by', 'Went on to influence'],
  influenced: ['Went on to influence', 'Influenced by'],
  confused_with: ['Often confused with', 'Often confused with'],
  hybrid_of: ['Hybrid of', 'Parent of hybrid'],
  sibling: ['Sibling styles', 'Sibling styles'],
  related: ['Related', 'Related'],
  reacts_against: ['Reacts against', 'Provoked a reaction from'],
  opposite: ['Opposite of', 'Opposite of'],
}

function groupRelations(rel: AestheticDetailResponse['relations']) {
  const groups = new Map<string, Map<string, RelationTarget & { note: string }>>()
  const add = (label: string, t: RelationTarget, note: string) => {
    if (!groups.has(label)) groups.set(label, new Map())
    groups.get(label)!.set(t.slug, { ...t, note })
  }
  for (const r of rel.outgoing) add(RELATION_LABELS[r.type]?.[0] ?? labelize(r.type), r.target, r.note)
  for (const r of rel.incoming) add(RELATION_LABELS[r.type]?.[1] ?? labelize(r.type), r.source, r.note)
  // A record appearing under a specific label shouldn't repeat under "Related".
  const specific = new Set([...groups.entries()].filter(([k]) => k !== 'Related').flatMap(([, m]) => [...m.keys()]))
  const related = groups.get('Related')
  if (related) for (const s of specific) related.delete(s)
  return [...groups.entries()].filter(([, m]) => m.size).map(([label, m]) => ({ label, items: [...m.values()] }))
}

function Section({ id, eyebrow, title, children, intro }: { id: string; eyebrow: string; title: string; intro?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-40 border-t border-line pt-10 sm:pt-14" aria-labelledby={`${id}-title`}>
      <div data-reveal className="mb-8 grid gap-3 lg:grid-cols-[minmax(0,18rem)_1fr] lg:gap-10">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h2 id={`${id}-title`} className="display mt-2 text-4xl sm:text-5xl">
            {title}
          </h2>
        </div>
        {intro && <p className="max-w-2xl self-end text-sm leading-relaxed text-fg-subtle lg:pb-1.5">{intro}</p>}
      </div>
      {children}
    </section>
  )
}

function KV({ data, columns = 2 }: { data: Record<string, string>; columns?: 2 | 3 }) {
  const entries = Object.entries(data).filter(([, v]) => v)
  if (!entries.length) return null
  return (
    <dl data-reveal-group className={`grid gap-x-10 gap-y-6 sm:grid-cols-2 ${columns === 3 ? 'lg:grid-cols-3' : ''}`}>
      {entries.map(([k, v]) => (
        <div key={k} className="border-t border-line pt-3">
          <dt className="eyebrow">{labelize(k)}</dt>
          <dd className="mt-1.5 text-[0.95rem] leading-relaxed text-fg-muted">{v}</dd>
        </div>
      ))}
    </dl>
  )
}

function Chips({ items, tone = 'plain' }: { items: string[]; tone?: 'plain' | 'accent' }) {
  return (
    <ul className="flex flex-wrap gap-1.5">
      {items.map((m) => (
        <li
          key={m}
          className={`rounded-full border px-3 py-1 text-sm ${tone === 'accent' ? 'border-accent/40 bg-accent-soft text-fg' : 'border-line-strong text-fg-muted'}`}
        >
          {m}
        </li>
      ))}
    </ul>
  )
}

const REF_GROUPS: { label: string; icon: typeof BookOpen; types: string[] }[] = [
  { label: 'Read', icon: BookOpen, types: ['article', 'scholar'] },
  { label: 'See', icon: Landmark, types: ['museum', 'exhibition', 'images'] },
  { label: 'Watch', icon: PlaySquare, types: ['video'] },
  { label: 'Explore', icon: Globe, types: ['web', 'archive'] },
]

function References({ refs }: { refs: ReferenceEntry[] }) {
  const groups = REF_GROUPS.map((g) => ({ ...g, items: refs.filter((r) => g.types.includes(r.type)) })).filter((g) => g.items.length)
  if (!groups.length) return null
  return (
    <div className="grid gap-8 md:grid-cols-2">
      {groups.map((g) => (
        <div key={g.label}>
          <p className="eyebrow flex items-center gap-2">
            <g.icon className="size-3.5" aria-hidden /> {g.label}
          </p>
          <ul className="mt-3 divide-y divide-line border-y border-line">
            {g.items.map((r) => (
              <li key={r.url}>
                <a href={r.url} target="_blank" rel="noopener noreferrer" className="group flex items-start justify-between gap-4 py-3">
                  <span className="min-w-0">
                    <span className="block text-sm text-fg group-hover:text-accent">{r.title}</span>
                    {r.note && <span className="mt-0.5 block text-xs text-fg-subtle">{r.note}</span>}
                  </span>
                  <ArrowUpRight className="mt-0.5 size-4 shrink-0 text-fg-subtle transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent" aria-hidden />
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

function Facts({ a }: { a: AestheticFull }) {
  const rows: [string, React.ReactNode][] = [
    ['Category', <Link key="c" href={`/aesthetics?category=${encodeURIComponent(a.category)}`} className="link-underline">{a.category}</Link>],
    ...(a.subcategory ? ([['Subcategory', a.subcategory]] as [string, string][]) : []),
    ['Type', ESTABLISHMENT_LABELS[a.establishment] ?? labelize(a.establishment)],
    ...(periodLabel(a) ? ([['Period', periodLabel(a)]] as [string, string][]) : []),
    ...(a.origin ? ([['Origin', a.origin]] as [string, string][]) : []),
    ...(a.geography && a.geography !== a.origin ? ([['Geography', a.geography]] as [string, string][]) : []),
    ['Status', <span key="s" title={STATUS_HINTS[a.status]}>{STATUS_LABELS[a.status] ?? a.status}</span>],
    ['Evidence', DATA_QUALITY_LABELS[a.dataQuality] ?? labelize(a.dataQuality)],
    ...(a.wikipedia
      ? ([
          [
            'Wikipedia',
            <a key="w" href={`https://en.wikipedia.org/wiki/${encodeURIComponent(a.wikipedia.replace(/ /g, '_'))}`} target="_blank" rel="noopener noreferrer" className="link-underline">
              {a.wikipedia}
            </a>,
          ],
        ] as [string, React.ReactNode][])
      : []),
    ...(a.wikidata
      ? ([
          [
            'Wikidata',
            <a key="q" href={`https://www.wikidata.org/wiki/${a.wikidata}`} target="_blank" rel="noopener noreferrer" className="link-underline font-mono text-xs">
              {a.wikidata}
            </a>,
          ],
        ] as [string, React.ReactNode][])
      : []),
    ['Updated', new Date(a.updatedAt).toLocaleDateString('en', { year: 'numeric', month: 'short', day: 'numeric' })],
  ]
  return (
    <dl className="divide-y divide-line border-y border-line text-sm">
      {rows.map(([k, v]) => (
        <div key={k} className="grid grid-cols-[7rem_1fr] gap-3 py-2.5">
          <dt className="text-fg-subtle">{k}</dt>
          <dd className="min-w-0 text-fg-muted">{v}</dd>
        </div>
      ))}
    </dl>
  )
}

export function AestheticArticle({
  detail,
  similar,
  mode,
  lineage,
  among,
}: {
  detail: AestheticDetailResponse
  similar: AestheticSummary[]
  mode: 'page' | 'modal'
  lineage: { ancestors: LineageNode[]; descendants: LineageNode[] }
  among: { from: string; to: string; type: string }[]
}) {
  const a = detail.aesthetic
  const relations = groupRelations(detail.relations)
  const [hero, ...rest] = a.images
  const applied: [string, Record<string, string>][] = [
    ['Lighting', a.lighting],
    ['Photography', a.photography],
    ['Architecture', a.architecture],
    ['Fashion', a.fashion],
    ['Interiors & environment', a.environment],
    ['Graphic design', a.graphicDesign],
  ]
  const hasApplied = applied.some(([, d]) => Object.keys(d).length) || Object.keys(a.uiTranslation).length || Object.keys(a.recipe).length
  const hasLanguage =
    Object.keys(a.visualDNA).length || Object.keys(a.typography).length || a.materials.length || a.textures.length || a.objects.length || a.keyExamples.length

  const sections = [
    { id: 'overview', label: 'Overview', show: true },
    { id: 'gallery', label: `Gallery${a.images.length ? ` (${a.images.length})` : ''}`, show: a.images.length > 0 },
    { id: 'palette', label: 'Palette', show: a.colors.length > 0 },
    { id: 'listen', label: 'Listen', show: a.audio.length > 0 },
    { id: 'language', label: 'Visual language', show: !!hasLanguage },
    { id: 'applied', label: 'In practice', show: !!hasApplied },
    { id: 'demo', label: 'Live demo', show: a.colors.length > 0 },
    { id: 'profile', label: 'Palette analysis', show: !!a.metrics },
    { id: 'imagine', label: 'Imagine', show: true },
    { id: 'related', label: 'Related', show: relations.length > 0 || similar.length > 0 },
    { id: 'sources', label: 'Sources', show: true },
  ].filter((s) => s.show)

  return (
    <article className="relative">
      {/* ---------- Hero ---------- */}
      <header className={`relative isolate flex items-end overflow-hidden ${mode === 'page' ? '-mt-16 min-h-[88svh] pt-16' : 'min-h-[78svh]'}`}>
        <HeroImage image={hero} colors={a.colors} name={a.name} />
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/55 to-black/25" aria-hidden />
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/50 to-transparent" aria-hidden />
        <div className="relative mx-auto w-full max-w-[1600px] px-4 pb-10 sm:px-6 sm:pb-14 lg:px-10">
          <p className="eyebrow !text-fg-muted">
            <Link href={`/aesthetics?category=${encodeURIComponent(a.category)}`} className="hover:text-fg">
              {a.category}
            </Link>
            <span className="mx-2 opacity-50">/</span>
            {ESTABLISHMENT_LABELS[a.establishment] ?? labelize(a.establishment)}
          </p>
          <h1 key={a.slug} data-split className="display mt-4 max-w-6xl text-[clamp(3.2rem,10vw,9.5rem)] text-fg [text-shadow:0_2px_30px_rgb(0_0_0/0.25)]">{a.name}</h1>
          {a.aliases.length > 0 && <p className="mt-3 max-w-3xl text-sm text-fg-muted">Also known as {a.aliases.join(' · ')}</p>}
          <div className="mt-8 flex flex-wrap items-end justify-between gap-6">
            <p className="max-w-2xl text-lg leading-relaxed text-fg sm:text-xl">{a.summary}</p>
            <div className="flex items-center gap-2">
              <ShareButton slug={a.slug} name={a.name} />
              <ExportMenu slug={a.slug} />
            </div>
          </div>
          <div className="mt-8 flex flex-wrap gap-x-8 gap-y-2 font-mono text-xs uppercase tracking-[0.12em] text-fg-muted">
            {periodLabel(a) && <span>{periodLabel(a)}</span>}
            {a.origin && <span>{a.origin}</span>}
            <span>{STATUS_LABELS[a.status] ?? a.status}</span>
          </div>
          {hero && (
            <p className="mt-4 max-w-xl truncate text-[11px] text-fg-subtle" title={credit(hero)}>
              Cover: {hero.caption} — {credit(hero)}
            </p>
          )}
        </div>
      </header>

      {/* ---------- Section nav ---------- */}
      <div className={`sticky z-20 border-y border-line bg-bg/85 backdrop-blur-xl ${mode === 'page' ? 'top-16' : 'top-0'}`}>
        <div className="mx-auto max-w-[1600px] px-4 py-2.5 sm:px-6 lg:px-10">
          <SectionNav sections={sections} scrollRootId={mode === 'modal' ? 'aesthetic-modal-scroll' : undefined} />
        </div>
      </div>

      <div className="mx-auto max-w-[1600px] space-y-16 px-4 pb-24 pt-12 sm:space-y-24 sm:px-6 lg:px-10">
        {/* ---------- Overview ---------- */}
        <section id="overview" className="scroll-mt-40 grid gap-12 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-20" aria-label="Overview">
          <div className="max-w-3xl space-y-8">
            {a.description ? (
              <div className="space-y-5 text-[1.075rem] leading-[1.75] text-fg-muted first-letter:float-left first-letter:mr-3 first-letter:font-[family-name:var(--ae-display,var(--font-instrument))] first-letter:text-[4.2rem] first-letter:leading-[0.85] first-letter:text-fg">
                {a.description.split(/\n{2,}/).map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            ) : (
              <p className="text-fg-subtle">A full description has not been written yet — contributions are welcome.</p>
            )}
            {a.culturalContext && (
              <div>
                <p className="eyebrow">Cultural context</p>
                <div className="mt-3 space-y-4 text-[1rem] leading-[1.75] text-fg-muted">
                  {a.culturalContext.split(/\n{2,}/).map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </div>
            )}
            {a.tags.length > 0 && (
              <ul className="flex flex-wrap gap-1.5">
                {a.tags.map((t) => (
                  <li key={t}>
                    <Link href={`/aesthetics?tag=${encodeURIComponent(t)}`} className="rounded-full bg-surface-2 px-2.5 py-1 text-xs text-fg-muted hover:text-fg">
                      #{t}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <aside className="space-y-8 lg:sticky lg:top-40 lg:self-start">
            <Facts a={a} />
            <div className="flex flex-wrap gap-2 text-xs">
              <a href={`/api/v1/aesthetics/${a.slug}`} className="inline-flex items-center gap-1.5 rounded-full border border-line-strong px-3 py-1.5 text-fg-muted hover:text-fg">
                <Braces className="size-3.5" aria-hidden /> JSON
              </a>
              <a href={`/api/v1/aesthetics/${a.slug}.md`} className="inline-flex items-center gap-1.5 rounded-full border border-line-strong px-3 py-1.5 text-fg-muted hover:text-fg">
                <FileCode2 className="size-3.5" aria-hidden /> Markdown
              </a>
              {repoEdit(`data/aesthetics/${a.slug}.json`) && (
                <a href={repoEdit(`data/aesthetics/${a.slug}.json`)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-full border border-line-strong px-3 py-1.5 text-fg-muted hover:text-fg">
                  <GitPullRequest className="size-3.5" aria-hidden /> Improve this record
                </a>
              )}
            </div>
          </aside>
        </section>

        {rest.length > 0 || hero ? (
          <Section
            id="gallery"
            eyebrow="Visual record"
            title="Gallery"
            intro={`Freely licensed photographs, scans and artworks${
              a.wikipedia && a.wikipedia.toLowerCase() !== a.name.toLowerCase() ? ` from the encyclopedia article on “${a.wikipedia}”` : ''
            }. Select an image for full size, credits and license.`}
          >
            <Gallery images={a.images} name={a.name} colors={a.colors} />
          </Section>
        ) : null}

        {a.colors.length > 0 && (
          <Section
            id="palette"
            eyebrow="Colour"
            title="Palette"
            intro={
              a.paletteSource === 'derived'
                ? 'Extracted automatically from this record’s images — a starting point until an editor curates it. Click a swatch to copy its hex value.'
                : 'Characteristic colours of the aesthetic, chosen by editors. Click a swatch to copy its hex value; exports include CSS, Tailwind, design tokens and swatch files.'
            }
          >
            <PaletteSwatches colors={a.colors} name={a.name} />
          </Section>
        )}

        {a.audio.length > 0 && (
          <Section id="listen" eyebrow="Sound" title="Listen" intro="Freely licensed recordings from the record's encyclopedia article on Wikimedia Commons.">
            <ul className="grid gap-3 md:grid-cols-2">
              {a.audio.map((t) => (
                <li key={t.url} className="rounded-2xl border border-line bg-surface p-4">
                  <p className="text-sm text-fg">{t.title}</p>
                  <p className="mt-0.5 text-xs text-fg-subtle">
                    {[t.artist, t.license, t.duration ? `${Math.floor(t.duration / 60)}:${String(t.duration % 60).padStart(2, '0')}` : ''].filter(Boolean).join(' · ')}{' '}
                    ·{' '}
                    <a href={t.pageUrl} target="_blank" rel="noopener noreferrer" className="link-underline">
                      source
                    </a>
                  </p>
                  <audio controls preload="none" src={t.url} className="mt-3 w-full">
                    <a href={t.url}>Download recording</a>
                  </audio>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {hasLanguage ? (
          <Section id="language" eyebrow="Form" title="Visual language">
            <div className="space-y-12">
              <KV data={a.visualDNA} columns={3} />
              {(Object.keys(a.typography).length > 0 || a.typePairing.display) && (
                <div className="grid gap-8 rounded-2xl border border-line bg-surface p-6 sm:p-8 lg:grid-cols-[1.2fr_1fr]">
                  <div>
                    <p className="eyebrow">Typography</p>
                    <p className="mt-4 text-[clamp(2.4rem,6vw,4.5rem)] leading-[0.95] text-fg" style={{ fontFamily: 'var(--ae-display, var(--font-instrument)), Georgia, serif' }}>
                      {a.name.split(/[\s(]/)[0]} Aa
                    </p>
                    <p className="mt-4 max-w-md text-sm leading-relaxed text-fg-muted" style={{ fontFamily: 'var(--ae-body, inherit)' }}>
                      The quick brown fox jumps over the lazy dog — 0123456789
                    </p>
                    {a.typePairing.display && (
                      <p className="mt-4 font-mono text-xs text-fg-subtle">
                        {a.typePairing.display} / {a.typePairing.body}
                      </p>
                    )}
                  </div>
                  <KV data={{ ...a.typography, ...(a.typePairing.notes ? { pairing: a.typePairing.notes } : {}) }} />
                </div>
              )}
              <div className="grid gap-10 md:grid-cols-2">
                {a.objects.length > 0 && (
                  <div>
                    <p className="eyebrow mb-3">Signature objects</p>
                    <Chips items={a.objects} />
                  </div>
                )}
                {a.keyExamples.length > 0 && (
                  <div>
                    <p className="eyebrow mb-3">Key examples</p>
                    <Chips items={a.keyExamples} />
                  </div>
                )}
                {a.sounds.length > 0 && (
                  <div>
                    <p className="eyebrow mb-3">Sound</p>
                    <Chips items={a.sounds} />
                  </div>
                )}
              </div>
              <MaterialGallery title="Materials" terms={a.materials} />
              <MaterialGallery title="Textures & surfaces" terms={a.textures} />
            </div>
          </Section>
        ) : null}

        {hasApplied ? (
          <Section id="applied" eyebrow="Application" title="In practice" intro="How the aesthetic shows up across disciplines — and how to evoke it today.">
            <div className="space-y-12">
              {applied
                .filter(([, d]) => Object.keys(d).length)
                .map(([title, d]) => (
                  <div key={title} className="grid gap-4 lg:grid-cols-[14rem_1fr] lg:gap-10">
                    <h3 className="display text-2xl">{title}</h3>
                    <KV data={d} />
                  </div>
                ))}
              {Object.keys(a.uiTranslation).length > 0 && (
                <div className="grid gap-4 lg:grid-cols-[14rem_1fr] lg:gap-10">
                  <h3 className="display text-2xl">Interface translation</h3>
                  <KV data={a.uiTranslation} />
                </div>
              )}
              {Object.keys(a.recipe).length > 0 && (
                <div className="rounded-2xl border border-accent/30 bg-accent-soft p-6 sm:p-8">
                  <h3 className="display text-3xl">How to evoke it</h3>
                  <dl className="mt-6 grid gap-6 sm:grid-cols-2">
                    {Object.entries(a.recipe).map(([k, v]) => (
                      <div key={k}>
                        <dt className="eyebrow">{labelize(k)}</dt>
                        <dd className="mt-2 text-sm leading-relaxed text-fg-muted">{Array.isArray(v) ? <Chips items={v} /> : v}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}
            </div>
          </Section>
        ) : null}

        {a.colors.length > 0 && (
          <Section id="demo" eyebrow="Interactive" title="Live demo" intro="The aesthetic rendered as working interfaces, posters and a real-time 3D material study — generated from this record’s palette, textures and type.">
            <StyleDemo a={a} />
          </Section>
        )}

        {a.metrics && (
          <Section id="profile" eyebrow="Measured" title="Palette analysis" intro="Warmth, saturation, lightness, contrast and hue range — computed from the palette’s actual colours.">
            <MetricsSection metrics={a.metrics} />
          </Section>
        )}

        <Section id="imagine" eyebrow="On-device AI" title="Imagine it" intro="Generate a fresh interpretation with a text-to-image model that runs entirely in your browser. Clearly labelled as AI — never mixed with the documented images.">
          <Imagine a={a} />
        </Section>

        {(relations.length > 0 || similar.length > 0) && (
          <Section id="related" eyebrow="Connections" title="Related aesthetics">
            <div className="space-y-14">
              <ConnectionMap detail={detail} among={among} />
              <LineageTree name={a.name} ancestors={lineage.ancestors} descendants={lineage.descendants} />
              {relations.map((g) => (
                <div key={g.label}>
                  <p className="eyebrow mb-3">{g.label}</p>
                  <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {g.items.map((t) => (
                      <li key={t.slug}>
                        <Link href={`/aesthetics/${t.slug}`} className="group flex items-center gap-3 rounded-xl border border-line p-2 pr-3 transition-colors hover:border-line-strong hover:bg-surface" title={t.note || undefined}>
                          <span className="size-12 shrink-0 overflow-hidden rounded-lg bg-surface-2">
                            {t.image && <img src={t.image} alt="" loading="lazy" decoding="async" referrerPolicy="no-referrer" className="size-full object-cover" />}
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate text-sm text-fg group-hover:text-accent">{t.name}</span>
                            <span className="block truncate text-xs text-fg-subtle">{t.category}</span>
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              {similar.length > 0 && (
                <div>
                  <p className="eyebrow mb-3">More in {a.category}</p>
                  <div className="no-scrollbar -mx-4 flex snap-x gap-3 overflow-x-auto px-4 sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10">
                    {similar.map((s) => (
                      <div key={s.slug} className="w-56 shrink-0 snap-start sm:w-64">
                        <AestheticCard a={s} variant="rail" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Section>
        )}

        <Section id="sources" eyebrow="Evidence" title="Sources & further reading" intro="Every link is checked automatically; dead links are removed. Tier A = museums, archives and scholarship · B = encyclopedias and major press · C = specialist and community documentation.">
          <div className="space-y-12">
            {a.sources.length > 0 && (
              <ol className="grid gap-x-10 sm:grid-cols-2">
                {a.sources.map((s, i) => (
                  <li key={`${s.name}-${i}`} className="flex items-start gap-3 border-t border-line py-3 text-sm">
                    <span className="mt-0.5 font-mono text-xs text-fg-subtle">{String(i + 1).padStart(2, '0')}</span>
                    <span className="min-w-0 flex-1">
                      {s.url ? (
                        <a href={s.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-fg hover:text-accent">
                          {s.name} <ExternalLink className="size-3 shrink-0 opacity-60" aria-hidden />
                        </a>
                      ) : (
                        <span className="text-fg-muted">{s.name}</span>
                      )}
                    </span>
                    {s.tier && (
                      <span className="rounded-md border border-line-strong px-1.5 font-mono text-[10px] text-fg-subtle" title={`Source tier ${s.tier}`}>
                        {s.tier}
                      </span>
                    )}
                  </li>
                ))}
              </ol>
            )}
            <References refs={a.references} />
            {a.images.length > 0 && (
              <div>
                <p className="eyebrow mb-3">Image credits</p>
                <ol className="space-y-1.5 text-xs text-fg-subtle">
                  {a.images.map((img, i) => (
                    <li key={img.url}>
                      {i + 1}. {img.caption.slice(0, 120)} — {credit(img)}
                      {img.pageUrl && (
                        <>
                          {' '}
                          <a href={img.pageUrl} target="_blank" rel="noopener noreferrer" className="link-underline">
                            source
                          </a>
                        </>
                      )}
                    </li>
                  ))}
                </ol>
              </div>
            )}
            <p className="text-xs text-fg-subtle">
              Cite as: {SITE_NAME} contributors, “{a.name}”, {SITE_NAME}, updated {a.updatedAt.slice(0, 10)}. Text available under CC BY-SA 4.0.
            </p>
          </div>
        </Section>
      </div>
    </article>
  )
}
