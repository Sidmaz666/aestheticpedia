'use client'

import { useMemo } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Braces,
  Building2,
  CalendarDays,
  Camera,
  Download,
  ExternalLink,
  FlaskConical,
  Globe,
  Lamp,
  Link2,
  Loader2,
  MapPin,
  Palette,
  Shirt,
  Sparkles,
  TreePine,
  Type,
} from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from '@/components/ui/sheet'
import { Chip, ErrorState, SectionHeading, StatusBadge } from '@/components/atlas/bits'
import { ColorSwatch, PaletteStrip } from '@/components/atlas/palette-strip'
import { DnaBars, EmotionBars, EmotionRadar } from '@/components/atlas/dna'
import { PendingNotice, StyleDemo, TextureSwatches, VisualGallery } from '@/components/atlas/style-demo'
import { useAestheticDetail } from '@/components/atlas/api'
import {
  DATA_QUALITY_LABELS,
  ESTABLISHMENT_LABELS,
  labelize,
  type AestheticFull,
} from '@/lib/aesthetic'

interface DetailSheetProps {
  slug: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onNavigate: (slug: string) => void
}

/** Per-entry record completeness — part of the no-missing-data audit policy. */
function RecordMeter({ a }: { a: AestheticFull }) {
  const checks: Array<{ label: string; ok: boolean }> = [
    { label: 'palette', ok: a.colors.length > 0 },
    { label: 'period', ok: Boolean(a.periodStart || a.era) },
    { label: 'origin', ok: Boolean(a.origin || a.geography) },
    { label: 'materials', ok: a.materials.length > 0 },
    { label: 'textures', ok: a.textures.length > 0 },
    { label: 'objects', ok: a.objects.length > 0 },
    { label: 'examples', ok: a.keyExamples.length > 0 },
    { label: 'visual DNA', ok: Object.keys(a.visualDNA).length > 0 },
    { label: 'typography', ok: Object.keys(a.typography).length > 0 },
    { label: 'lighting', ok: Object.keys(a.lighting).length > 0 },
    { label: 'UI translation', ok: Object.keys(a.uiTranslation).length > 0 },
    { label: 'recipe', ok: Object.keys(a.recipe).length > 0 },
    { label: 'sonic identity', ok: a.sounds.length > 0 },
    { label: 'sources', ok: a.sources.length > 0 },
    { label: 'images', ok: a.images.length > 0 },
  ]
  const ok = checks.filter((c) => c.ok).length
  const missing = checks.filter((c) => !c.ok).map((c) => c.label)
  const pct = Math.round((ok / checks.length) * 100)
  return (
    <section
      className="rounded-lg border border-stone-200 bg-stone-50 px-4 py-3"
      aria-label="Record completeness"
    >
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="font-medium text-stone-700">
          Record completeness — {ok}/{checks.length} fields documented
        </span>
        <span className={`tabular-nums ${pct >= 90 ? 'text-emerald-800' : pct >= 60 ? 'text-amber-800' : 'text-stone-500'}`}>
          {pct}%
        </span>
      </div>
      <Progress value={pct} className="mt-2 h-1.5" />
      <p className="mt-1.5 text-xs text-stone-500">
        {missing.length === 0
          ? 'Every documented field is populated for this entry.'
          : `Still documenting: ${missing.join(', ')}. The research pipeline fills gaps continuously, most-visited entries first.`}
      </p>
    </section>
  )
}

export function DetailSheet({ slug, open, onOpenChange, onNavigate }: DetailSheetProps) {
  const { data, isPending, isError, error, refetch } = useAestheticDetail(slug, open)
  const aesthetic = data?.aesthetic
  const relations = data?.relations

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full gap-0 overflow-y-auto scrollbar-thin p-0 sm:max-w-4xl"
        aria-describedby={undefined}
      >
        {!aesthetic && <SheetTitle className="sr-only">Aesthetic details</SheetTitle>}
        {isPending && (
          <div className="p-8">
            <div className="flex items-center gap-2 text-stone-500" role="status">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Retrieving entry…
            </div>
          </div>
        )}
        {isError && (
          <div className="p-8">
            <ErrorState message={error.message} onRetry={() => refetch()} />
          </div>
        )}
        {aesthetic && (
          <DetailBody
            aesthetic={aesthetic}
            relations={relations ?? { outgoing: [], incoming: [] }}
            onNavigate={onNavigate}
          />
        )}
      </SheetContent>
    </Sheet>
  )
}

function DetailBody({
  aesthetic: a,
  relations,
  onNavigate,
}: {
  aesthetic: AestheticFull
  relations: { outgoing: RelationEdge[]; incoming: RelationEdge[] }
  onNavigate: (slug: string) => void
}) {
  const hexes = a.colors.map((c) => c.hex)

  const cssVars = useMemo(
    () =>
      a.colors
        .map((c, i) => {
          const key =
            c.name
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/^-+|-+$/g, '') || `color-${i + 1}`
          return `--aa-${key}: ${c.hex};`
        })
        .join('\n'),
    [a.colors]
  )

  const copy = async (text: string, what: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success(`${what} copied to clipboard`)
    } catch {
      toast.error(`Could not copy ${what.toLowerCase()}`)
    }
  }

  const downloadJson = () => {
    const blob = new Blob([JSON.stringify(a, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${a.slug}.json`
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
    toast.success(`Downloaded ${a.slug}.json`)
  }

  const period = [a.periodStart, a.periodEnd].filter(Boolean).join(' — ')
  const years =
    a.startYear !== null
      ? `${a.startYear}${a.endYear !== null ? `–${a.endYear}` : ''}`
      : ''

  return (
    <article className="pb-16">
      {/* Palette hero band */}
      <PaletteStrip colors={a.colors} label={a.name} className="h-24 w-full sm:h-28" />

      <div className="px-5 pt-6 sm:px-10">
        {/* Header */}
        <header>
          <div className="flex flex-wrap items-center gap-2 pr-10">
            <Badge className="bg-[#8a6d3b] font-normal text-[#fdfcf8] hover:bg-[#8a6d3b]">
              {a.category}
            </Badge>
            {a.establishment && (
              <Badge variant="outline" className="border-stone-300 bg-white/70 font-normal">
                {ESTABLISHMENT_LABELS[a.establishment] ?? labelize(a.establishment)}
              </Badge>
            )}
            <StatusBadge status={a.status} />
            {a.isNiche && (
              <Badge variant="outline" className="border-amber-700/40 bg-[#f7f0df] font-normal text-amber-900">
                Niche
              </Badge>
            )}
          </div>

          <SheetTitle asChild>
            <h2 className="mt-3 font-serif text-3xl leading-tight text-stone-900 sm:text-4xl">
              {a.name}
            </h2>
          </SheetTitle>
          {a.aliases.length > 0 && (
            <SheetDescription className="mt-1 text-sm">
              Also known as: {a.aliases.join(' · ')}
            </SheetDescription>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-stone-600">
            {period && (
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5 text-stone-400" aria-hidden="true" /> {period}
                {years && <span className="text-stone-400">({years})</span>}
              </span>
            )}
            {a.origin && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-stone-400" aria-hidden="true" /> {a.origin}
              </span>
            )}
            {a.geography && (
              <span className="inline-flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5 text-stone-400" aria-hidden="true" /> {a.geography}
              </span>
            )}
            {a.era && <span className="text-stone-400">{a.era}</span>}
          </div>

          {/* Export */}
          <div className="mt-5 flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 border-stone-300"
              onClick={() => copy(hexes.join(', '), 'Palette')}
              disabled={hexes.length === 0}
            >
              <Palette className="h-3.5 w-3.5" aria-hidden="true" />
              Copy palette
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 border-stone-300"
              onClick={() => copy(cssVars, 'CSS variables')}
              disabled={hexes.length === 0}
            >
              <Braces className="h-3.5 w-3.5" aria-hidden="true" />
              Copy CSS variables
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 border-stone-300"
              onClick={downloadJson}
            >
              <Download className="h-3.5 w-3.5" aria-hidden="true" />
              Download JSON
            </Button>
          </div>
        </header>

        <div className="mt-8 space-y-10">
          {a.summary && (
            <section aria-label="Summary">
              <p className="border-l-2 border-[#8a6d3b]/50 pl-4 text-base leading-relaxed text-stone-700 sm:text-lg">
                {a.summary}
              </p>
            </section>
          )}

          {a.description && (
            <section aria-label="Description">
              <SectionHeading>Description</SectionHeading>
              <p className="whitespace-pre-line text-sm leading-relaxed text-stone-600">
                {a.description}
              </p>
            </section>
          )}

          {a.culturalContext && (
            <section aria-label="Cultural context">
              <SectionHeading>Cultural context</SectionHeading>
              <p className="whitespace-pre-line text-sm leading-relaxed text-stone-600">
                {a.culturalContext}
              </p>
            </section>
          )}

          <PendingNotice a={a} />

          <RecordMeter a={a} />

          <VisualGallery images={a.images} name={a.name} />

          <StyleDemo a={a} />

          <DnaSection dnaAxes={a.dnaAxes} />
          <EmotionSection profile={a.emotionProfile} />
          <IngredientsSection a={a} />
          <TypographySection typography={a.typography} />

          {Object.keys(a.visualDNA).length > 0 && (
            <section aria-label="Visual DNA">
              <SectionHeading hint="The formal vocabulary of the style.">
                Visual DNA
              </SectionHeading>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {Object.entries(a.visualDNA).map(([k, v]) => (
                  <div key={k} className="rounded-lg border border-stone-200 bg-white p-4">
                    <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#8a6d3b]">
                      {labelize(k)}
                    </p>
                    <p className="mt-1.5 text-sm leading-relaxed text-stone-600">{v}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          <FieldCardGrid
            title="Applied fields"
            hint="How the aesthetic expresses itself across disciplines."
            cards={[
              { key: 'lighting', title: 'Lighting', icon: <Lamp className="h-4 w-4" />, data: a.lighting },
              { key: 'photography', title: 'Photography', icon: <Camera className="h-4 w-4" />, data: a.photography },
              { key: 'architecture', title: 'Architecture', icon: <Building2 className="h-4 w-4" />, data: a.architecture },
              { key: 'fashion', title: 'Fashion', icon: <Shirt className="h-4 w-4" />, data: a.fashion },
              { key: 'environment', title: 'Environment', icon: <TreePine className="h-4 w-4" />, data: a.environment },
              { key: 'graphicDesign', title: 'Graphic design', icon: <Type className="h-4 w-4" />, data: a.graphicDesign },
            ]}
          />

          {Object.keys(a.uiTranslation).length > 0 && (
            <section aria-label="UI translation">
              <SectionHeading hint="Recreating the aesthetic in interface design — see the live demo above for the rendered result.">
                UI translation
              </SectionHeading>
              <div className="overflow-hidden rounded-lg border border-stone-200 bg-white">
                <div className="border-b border-stone-100 bg-[#faf8f4] px-4 py-2.5 text-xs font-medium uppercase tracking-[0.14em] text-stone-500">
                  Interface blueprint
                </div>
                <div className="grid gap-4 p-4 sm:grid-cols-2">
                  <dl className="space-y-3">
                    {Object.entries(a.uiTranslation).map(([k, v]) => (
                      <div key={k}>
                        <dt className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#8a6d3b]">
                          {labelize(k)}
                        </dt>
                        <dd className="mt-0.5 text-sm leading-relaxed text-stone-600">{v}</dd>
                      </div>
                    ))}
                  </dl>
                  <dl className="space-y-3">
                    {Object.entries(a.recipe)
                      .filter(([k]) => ['music', 'scent'].includes(k))
                      .map(([k, v]) => (
                        <div key={k}>
                          <dt className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#8a6d3b]">
                            {labelize(k)}
                          </dt>
                          <dd className="mt-0.5 text-sm leading-relaxed text-stone-600">
                            {Array.isArray(v) ? v.join(' · ') : v}
                          </dd>
                        </div>
                      ))}
                  </dl>
                </div>
              </div>
            </section>
          )}

          <RecipeSection recipe={a.recipe} />

          <RelationsSection relations={relations} onNavigate={onNavigate} />

          {a.sources.length > 0 && (
            <section aria-label="Sources">
              <SectionHeading hint="Where the documentation comes from.">
                Sources
              </SectionHeading>
              <ul className="divide-y divide-stone-100 rounded-lg border border-stone-200 bg-white">
                {a.sources.map((s, i) => (
                  <li key={`${s.name}-${i}`} className="flex items-center justify-between gap-3 px-4 py-3">
                    <span className="min-w-0 text-sm text-stone-700">
                      {s.url ? (
                        <a
                          href={s.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-[#6f5527] underline decoration-[#8a6d3b]/30 underline-offset-2 hover:decoration-[#8a6d3b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b08d57]"
                        >
                          <span className="truncate">{s.name}</span>
                          <ExternalLink className="h-3 w-3 shrink-0" aria-hidden="true" />
                        </a>
                      ) : (
                        s.name
                      )}
                    </span>
                    {s.tier && <TierBadge tier={s.tier} />}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Meta footer */}
          <footer className="rounded-lg border border-stone-200 bg-[#f5f1e6] p-4">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-stone-600">
              <span className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-[0.14em] text-stone-500">Confidence</span>
                <Progress value={a.confidence} className="h-1.5 w-24 [&>div]:bg-[#8a6d3b]" aria-label={`Research confidence ${a.confidence}%`} />
                <span className="tabular-nums">{a.confidence}%</span>
              </span>
              {a.dataQuality && (
                <span>
                  <span className="text-xs uppercase tracking-[0.14em] text-stone-500">Data quality</span>{' '}
                  {DATA_QUALITY_LABELS[a.dataQuality] ?? labelize(a.dataQuality)}
                </span>
              )}
              {a.verifiedAt && (
                <span>
                  <span className="text-xs uppercase tracking-[0.14em] text-stone-500">Last reviewed</span>{' '}
                  {new Date(a.verifiedAt).toLocaleDateString()}
                </span>
              )}
            </div>
            <p className="mt-2.5 flex items-center gap-1.5 text-xs text-stone-500">
              <Sparkles className="h-3 w-3" aria-hidden="true" />
              Documented by the Aesthetic Atlas research pipeline.
            </p>
          </footer>
        </div>
      </div>
    </article>
  )
}

/* ---------------------------------- sections ---------------------------------- */

function DnaSection({ dnaAxes }: { dnaAxes: Record<string, number> }) {
  if (Object.keys(dnaAxes).length === 0) return null
  return (
    <section aria-label="Aesthetic DNA">
      <SectionHeading hint="Where the style sits on each aesthetic dimension.">
        Aesthetic DNA
      </SectionHeading>
      <DnaBars dnaAxes={dnaAxes} />
    </section>
  )
}

function EmotionSection({ profile }: { profile: Record<string, number> }) {
  if (Object.keys(profile).length === 0) return null
  return (
    <section aria-label="Emotional profile">
      <SectionHeading hint="The feelings this aesthetic reliably produces.">
        Emotional profile
      </SectionHeading>
      <div className="grid items-center gap-6 rounded-lg border border-stone-200 bg-white p-4 sm:grid-cols-[240px_minmax(0,1fr)] sm:p-6">
        <EmotionRadar profile={profile} />
        <EmotionBars profile={profile} />
      </div>
    </section>
  )
}

function IngredientsSection({ a }: { a: AestheticFull }) {
  const hasAny =
    a.colors.length > 0 ||
    a.materials.length > 0 ||
    a.textures.length > 0 ||
    a.objects.length > 0 ||
    a.keyExamples.length > 0 ||
    a.sounds.length > 0
  if (!hasAny) return null

  return (
    <section aria-label="The ingredients">
      <SectionHeading hint="The raw vocabulary of the style.">The ingredients</SectionHeading>
      <div className="space-y-4">
        {a.colors.length > 0 && (
          <ChipRow label="Colors">
            {a.colors.map((c, i) => (
              <ColorSwatch key={`${c.hex}-${i}`} color={c} />
            ))}
          </ChipRow>
        )}
        {a.materials.length > 0 && (
          <ChipRow label="Materials">
            {a.materials.map((m) => (
              <Chip key={m} tone="accent">
                {m}
              </Chip>
            ))}
          </ChipRow>
        )}
        {a.textures.length > 0 && (
          <div>
            <p className="mb-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-stone-500">
              Textures (rendered samples)
            </p>
            <TextureSwatches textures={a.textures} colors={a.colors} />
          </div>
        )}
        {a.objects.length > 0 && (
          <ChipRow label="Objects">
            {a.objects.map((o) => (
              <Chip key={o}>{o}</Chip>
            ))}
          </ChipRow>
        )}
        {a.sounds.length > 0 && (
          <ChipRow label="Sounds">
            {a.sounds.map((s) => (
              <Chip key={s}>{s}</Chip>
            ))}
          </ChipRow>
        )}
        {a.keyExamples.length > 0 && (
          <ChipRow label="Key examples">
            {a.keyExamples.map((k) => (
              <Chip key={k} tone="accent">
                {k}
              </Chip>
            ))}
          </ChipRow>
        )}
      </div>
    </section>
  )
}

function ChipRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-stone-500">
        {label}
      </p>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  )
}

function TypographySection({ typography }: { typography: Record<string, string> }) {
  const entries = Object.entries(typography)
  if (entries.length === 0) return null
  return (
    <section aria-label="Typography">
      <SectionHeading>Type &amp; letterforms</SectionHeading>
      <div className="grid gap-3 sm:grid-cols-2">
        {entries.map(([k, v]) => (
          <div key={k} className="rounded-lg border border-stone-200 bg-white p-4">
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#8a6d3b]">
              {labelize(k)}
            </p>
            <p
              className={
                k === 'display'
                  ? 'mt-1.5 font-serif text-lg italic leading-snug text-stone-800'
                  : 'mt-1.5 text-sm leading-relaxed text-stone-600'
              }
            >
              {v}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}

function FieldCardGrid({
  title,
  hint,
  cards,
}: {
  title: string
  hint: string
  cards: { key: string; title: string; icon: React.ReactNode; data: Record<string, string> }[]
}) {
  const present = cards.filter((c) => Object.keys(c.data).length > 0)
  if (present.length === 0) return null
  return (
    <section aria-label={title}>
      <SectionHeading hint={hint}>{title}</SectionHeading>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {present.map((c) => (
          <div key={c.key} className="rounded-lg border border-stone-200 bg-white p-4">
            <p className="flex items-center gap-2 text-sm font-medium text-stone-800">
              <span className="text-[#8a6d3b]">{c.icon}</span>
              {c.title}
            </p>
            <dl className="mt-2.5 space-y-2">
              {Object.entries(c.data).map(([k, v]) => (
                <div key={k}>
                  <dt className="text-[11px] uppercase tracking-[0.12em] text-stone-400">{labelize(k)}</dt>
                  <dd className="text-sm leading-relaxed text-stone-600">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>
    </section>
  )
}

function RecipeSection({ recipe }: { recipe: Record<string, string | string[]> }) {
  const entries = Object.entries(recipe)
  if (entries.length === 0) return null
  return (
    <section aria-label="Design recipe">
      <SectionHeading hint="Everything you need to recreate the aesthetic.">
        Design recipe
      </SectionHeading>
      <div className="rounded-lg border border-stone-200 bg-white p-4 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          {entries.map(([k, v]) => (
            <div key={k}>
              <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-[#8a6d3b]">
                <FlaskConical className="h-3 w-3" aria-hidden="true" />
                {labelize(k)}
              </p>
              {Array.isArray(v) ? (
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {v.map((x) => (
                    <Chip key={x}>{x}</Chip>
                  ))}
                </div>
              ) : (
                <p className="mt-1 text-sm leading-relaxed text-stone-600">{v}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

interface RelationEdge {
  type: string
  note?: string
  target?: { slug: string; name: string; category: string }
  source?: { slug: string; name: string; category: string }
}

function RelationsSection({
  relations,
  onNavigate,
}: {
  relations: { outgoing: RelationEdge[]; incoming: RelationEdge[] }
  onNavigate: (slug: string) => void
}) {
  if (relations.outgoing.length === 0 && relations.incoming.length === 0) {
    return (
      <section aria-label="Relationships">
        <SectionHeading>Relationships</SectionHeading>
        <p className="text-sm text-stone-500">No documented relationships yet — the pipeline may link this entry later.</p>
      </section>
    )
  }

  const group = (edges: RelationEdge[]) => {
    const map = new Map<string, RelationEdge[]>()
    for (const e of edges) {
      const list = map.get(e.type) ?? []
      list.push(e)
      map.set(e.type, list)
    }
    return [...map.entries()]
  }

  return (
    <section aria-label="Relationships">
      <SectionHeading hint="The aesthetic family tree.">Relationships</SectionHeading>
      <div className="space-y-4">
        {relations.outgoing.length > 0 && (
          <div>
            <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-stone-500">
              <ArrowRight className="h-3 w-3" aria-hidden="true" /> Outgoing
            </p>
            <div className="space-y-2.5">
              {group(relations.outgoing).map(([type, edges]) => (
                <div key={type} className="flex flex-wrap items-center gap-1.5">
                  <span className="mr-1 min-w-fit text-xs capitalize text-stone-400">
                    {labelize(type)}:
                  </span>
                  {edges.map((e) =>
                    e.target ? (
                      <RelationChip
                        key={`${e.target.slug}-${type}`}
                        name={e.target.name}
                        note={e.note}
                        onClick={() => onNavigate(e.target!.slug)}
                      />
                    ) : null
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        {relations.incoming.length > 0 && (
          <div>
            <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-stone-500">
              <ArrowLeft className="h-3 w-3" aria-hidden="true" /> Incoming
            </p>
            <div className="space-y-2.5">
              {group(relations.incoming).map(([type, edges]) => (
                <div key={type} className="flex flex-wrap items-center gap-1.5">
                  <span className="mr-1 min-w-fit text-xs capitalize text-stone-400">
                    {labelize(type)}:
                  </span>
                  {edges.map((e) =>
                    e.source ? (
                      <RelationChip
                        key={`${e.source.slug}-${type}`}
                        name={e.source.name}
                        note={e.note}
                        onClick={() => onNavigate(e.source!.slug)}
                      />
                    ) : null
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

function RelationChip({
  name,
  note,
  onClick,
}: {
  name: string
  note?: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={note || undefined}
      className="inline-flex min-h-[32px] items-center gap-1.5 rounded-full border border-stone-300 bg-white px-3 py-1 text-sm text-stone-700 shadow-sm transition-colors hover:border-[#b08d57] hover:bg-[#f7f0df] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b08d57]"
    >
      <Link2 className="h-3 w-3 text-[#8a6d3b]" aria-hidden="true" />
      {name}
    </button>
  )
}

function TierBadge({ tier }: { tier: string }) {
  const t = tier.toUpperCase()
  const styles: Record<string, string> = {
    A: 'bg-[#8a6d3b] text-[#fdfcf8]',
    B: 'bg-[#f0e4c8] text-[#6f5527]',
    C: 'bg-stone-200 text-stone-600',
    D: 'bg-stone-100 text-stone-400',
  }
  return (
    <span
      className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded text-[10px] font-bold ${styles[t] ?? styles.C}`}
      title={`Source tier ${t}`}
      aria-label={`Source tier ${t}`}
    >
      {t}
    </span>
  )
}
