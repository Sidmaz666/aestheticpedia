'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { FlaskConical, Loader2, Shuffle, TriangleAlert, Wand2 } from 'lucide-react'
import { toast } from 'sonner'
import { postJson, useSuggest } from '@/components/atlas/api'
import { PaletteStrip } from '@/components/atlas/palette-strip'
import { Chip, SectionHeading } from '@/components/atlas/bits'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import type { AestheticSummary, HybridResponse, SuggestItem } from '@/lib/aesthetic'

function AestheticPicker({
  label,
  value,
  onPick,
  exclude,
}: {
  label: string
  value: AestheticSummary | null
  onPick: (a: AestheticSummary) => void
  exclude: string | null
}) {
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const { data } = useSuggest(q, open && q.trim().length >= 2)
  const items: SuggestItem[] =
    data?.items?.filter((s) => s.slug !== exclude && s.slug !== value?.slug).slice(0, 8) ?? []

  return (
    <div className="flex-1">
      <p className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-stone-500">{label}</p>
      {value ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex w-full items-center gap-3 rounded-lg border border-[#b08d57]/50 bg-white p-3 text-left shadow-sm hover:border-[#8a6d3b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b08d57]"
        >
          {value.colors?.length > 0 && (
            <span className="flex h-9 w-16 shrink-0 overflow-hidden rounded">
              {value.colors.slice(0, 5).map((c, i) => (
                <span key={i} className="flex-1" style={{ background: c.hex }} />
              ))}
            </span>
          )}
          <span className="min-w-0">
            <span className="block truncate font-serif text-stone-900">{value.name}</span>
            <span className="block truncate text-xs text-stone-500">{value.category}</span>
          </span>
        </button>
      ) : (
        <Input
          value={q}
          onChange={(e) => {
            setQ(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search an aesthetic…"
          aria-label={label}
          className="bg-white"
        />
      )}
      {open && (
        <div className="relative z-10 mt-1">
          <div className="absolute inset-x-0 top-0 max-h-64 overflow-y-auto rounded-lg border border-stone-200 bg-white shadow-lg scrollbar-thin">
            {items.length === 0 && (
              <p className="px-3 py-3 text-sm text-stone-500">
                {q.trim().length < 2 ? 'Type at least two letters…' : 'No matches yet.'}
              </p>
            )}
            {items.map((s) => (
              <button
                key={s.slug}
                type="button"
                onClick={() => {
                  onPick({
                    slug: s.slug,
                    name: s.name,
                    category: s.category,
                    subcategory: '',
                    establishment: '',
                    status: '',
                    era: '',
                    origin: '',
                    geography: '',
                    periodStart: '',
                    periodEnd: '',
                    startYear: null,
                    endYear: null,
                    summary: '',
                    colors: [],
                    tags: [],
                    popularity: 0,
                    isNiche: false,
                    dataQuality: '',
                  })
                  setQ('')
                  setOpen(false)
                }}
                className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left hover:bg-stone-50 focus-visible:bg-stone-50 focus-visible:outline-none"
              >
                <span className="truncate font-medium text-stone-800">{s.name}</span>
                <span className="shrink-0 text-xs text-stone-500">{s.category}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export function LabView({ onOpenDetail }: { onOpenDetail: (slug: string) => void }) {
  const [a, setA] = useState<AestheticSummary | null>(null)
  const [b, setB] = useState<AestheticSummary | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<HybridResponse | null>(null)

  const generate = async () => {
    if (!a || !b) return
    setLoading(true)
    setResult(null)
    try {
      const res = await postJson<HybridResponse>('/api/hybrid', { a: a.slug, b: b.slug })
      setResult(res)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Hybrid generation failed')
    } finally {
      setLoading(false)
    }
  }

  const surprise = async () => {
    try {
      const res = await fetch('/api/random')
      if (!res.ok) throw new Error('The collection is still filling up — try again soon.')
      const body = (await res.json()) as { item: AestheticSummary }
      if (!a) setA(body.item)
      else if (!b) setB(body.item)
      else setB(body.item)
      toast.success(`Drew "${body.item.name}"`)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Random pick failed')
    }
  }

  const h = result?.hybrid

  return (
    <main id="main" className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:py-12">
      <div className="max-w-3xl">
        <p className="text-xs font-medium uppercase tracking-[0.3em] text-[#8a6d3b]">The Laboratory</p>
        <h2 className="mt-3 font-serif text-3xl text-stone-900 sm:text-4xl">Combine two aesthetics.</h2>
        <p className="mt-3 text-stone-600">
          Choose two visual languages and generate an experimental synthesis — palettes, materials,
          typography, UI translation. Every result is clearly labeled as an AI-generated experiment,
          never as a documented historical style.
        </p>
      </div>

      <div className="mt-8 flex flex-col gap-4 rounded-xl border border-stone-200 bg-white p-4 sm:p-6 md:flex-row md:items-start">
        <AestheticPicker label="First aesthetic" value={a} onPick={setA} exclude={b?.slug ?? null} />
        <div className="flex items-center justify-center py-1 md:pt-9">
          <FlaskConical className="h-5 w-5 text-[#8a6d3b]" aria-hidden="true" />
        </div>
        <AestheticPicker label="Second aesthetic" value={b} onPick={setB} exclude={a?.slug ?? null} />
        <div className="flex gap-2 md:pt-9">
          <Button
            onClick={generate}
            disabled={!a || !b || loading}
            className="min-h-[44px] bg-[#8a6d3b] text-white hover:bg-[#755b30]"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Wand2 className="h-4 w-4" aria-hidden="true" />}
            Generate
          </Button>
          <Button
            variant="outline"
            onClick={surprise}
            className="min-h-[44px] border-stone-300 hover:border-[#8a6d3b] hover:text-[#8a6d3b]"
            aria-label="Draw a random aesthetic"
          >
            <Shuffle className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </div>

      {loading && (
        <div className="mt-8 space-y-4">
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-24 w-full" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </div>
        </div>
      )}

      {result && h && (
        <motion.article
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mt-10 overflow-hidden rounded-xl border border-stone-200 bg-white"
          aria-label="Generated experimental hybrid"
        >
          <div className="border-b border-stone-200 bg-stone-50 px-4 py-3 sm:px-6">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#8a6d3b]">
              <TriangleAlert className="h-4 w-4" aria-hidden="true" />
              {result.label}
            </p>
            <h3 className="mt-2 font-serif text-2xl text-stone-900 sm:text-3xl">{h.name}</h3>
            {h.tagline && <p className="mt-1 text-stone-600">{h.tagline}</p>}
          </div>

          {h.palette && h.palette.length > 0 && (
            <div className="px-4 pt-5 sm:px-6">
              <PaletteStrip colors={h.palette} className="h-12 rounded-lg" />
            </div>
          )}

          <div className="grid gap-5 p-4 sm:p-6 md:grid-cols-2">
            {h.synthesis && (
              <div className="md:col-span-2">
                <SectionHeading>Suggested synthesis</SectionHeading>
                <p className="mt-2 leading-relaxed text-stone-700">{h.synthesis}</p>
              </div>
            )}
            {h.materials?.length ? (
              <div>
                <SectionHeading>Materials</SectionHeading>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {h.materials.map((m, i) => (
                    <Chip key={i}>{m}</Chip>
                  ))}
                </div>
              </div>
            ) : null}
            {h.objects?.length ? (
              <div>
                <SectionHeading>Objects</SectionHeading>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {h.objects.map((m, i) => (
                    <Chip key={i}>{m}</Chip>
                  ))}
                </div>
              </div>
            ) : null}
            {h.typography?.display || h.typography?.body ? (
              <div>
                <SectionHeading>Typography</SectionHeading>
                <p className="mt-2 text-sm text-stone-700">
                  {h.typography.display && (
                    <>
                      <span className="font-medium text-stone-900">Display:</span> {h.typography.display}
                      <br />
                    </>
                  )}
                  {h.typography.body && (
                    <>
                      <span className="font-medium text-stone-900">Body:</span> {h.typography.body}
                    </>
                  )}
                </p>
              </div>
            ) : null}
            {h.lighting && (
              <div>
                <SectionHeading>Lighting</SectionHeading>
                <p className="mt-2 text-sm leading-relaxed text-stone-700">{h.lighting}</p>
              </div>
            )}
            {h.architecture && (
              <div>
                <SectionHeading>Architecture</SectionHeading>
                <p className="mt-2 text-sm leading-relaxed text-stone-700">{h.architecture}</p>
              </div>
            )}
            {h.fashion && (
              <div>
                <SectionHeading>Fashion</SectionHeading>
                <p className="mt-2 text-sm leading-relaxed text-stone-700">{h.fashion}</p>
              </div>
            )}
            {h.photography && (
              <div>
                <SectionHeading>Photography</SectionHeading>
                <p className="mt-2 text-sm leading-relaxed text-stone-700">{h.photography}</p>
              </div>
            )}
            {h.ui && (h.ui.background || h.ui.components) && (
              <div className="md:col-span-2">
                <SectionHeading>UI translation</SectionHeading>
                <dl className="mt-2 grid gap-2 text-sm text-stone-700 sm:grid-cols-2">
                  {h.ui.background && (
                    <div className="rounded-md border border-stone-200 bg-stone-50 p-3">
                      <dt className="text-xs font-semibold uppercase tracking-wider text-stone-500">Background</dt>
                      <dd className="mt-1">{h.ui.background}</dd>
                    </div>
                  )}
                  {h.ui.surface && (
                    <div className="rounded-md border border-stone-200 bg-stone-50 p-3">
                      <dt className="text-xs font-semibold uppercase tracking-wider text-stone-500">Surface</dt>
                      <dd className="mt-1">{h.ui.surface}</dd>
                    </div>
                  )}
                  {h.ui.components && (
                    <div className="rounded-md border border-stone-200 bg-stone-50 p-3">
                      <dt className="text-xs font-semibold uppercase tracking-wider text-stone-500">Components</dt>
                      <dd className="mt-1">{h.ui.components}</dd>
                    </div>
                  )}
                  {h.ui.motion && (
                    <div className="rounded-md border border-stone-200 bg-stone-50 p-3">
                      <dt className="text-xs font-semibold uppercase tracking-wider text-stone-500">Motion</dt>
                      <dd className="mt-1">{h.ui.motion}</dd>
                    </div>
                  )}
                </dl>
              </div>
            )}
            {h.sharedDNA?.length ? (
              <div>
                <SectionHeading>Shared DNA</SectionHeading>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {h.sharedDNA.map((m, i) => (
                    <Chip key={i} tone="accent">
                      {m}
                    </Chip>
                  ))}
                </div>
              </div>
            ) : null}
            {h.conflicts?.length ? (
              <div>
                <SectionHeading>Conflicting DNA</SectionHeading>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {h.conflicts.map((m, i) => (
                    <Chip key={i} tone="warn">
                      {m}
                    </Chip>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          {result.parents?.length > 0 && (
            <div className="border-t border-stone-200 px-4 py-4 sm:px-6">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-stone-500">Parent aesthetics</p>
              <div className="mt-2 flex flex-wrap gap-3">
                {result.parents.map((p) => (
                  <button
                    key={p.slug}
                    type="button"
                    onClick={() => onOpenDetail(p.slug)}
                    className="flex items-center gap-2 rounded-md border border-stone-200 bg-white px-3 py-2 text-sm hover:border-[#b08d57] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b08d57]"
                  >
                    {p.colors?.length > 0 && (
                      <span className="flex h-5 w-9 overflow-hidden rounded-sm">
                        {p.colors.slice(0, 4).map((c, i) => (
                          <span key={i} className="flex-1" style={{ background: c.hex }} />
                        ))}
                      </span>
                    )}
                    <span className="font-serif text-stone-800">{p.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </motion.article>
      )}
    </main>
  )
}
