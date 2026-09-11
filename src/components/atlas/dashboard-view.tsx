'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  BookMarked,
  CircleCheck,
  CircleDashed,
  Clock,
  FlaskConical,
  Gauge,
  Layers,
  Loader2,
  Radar,
  RefreshCw,
  ShieldCheck,
  TriangleAlert,
} from 'lucide-react'
import { toast } from 'sonner'
import { postJson, useAudit, usePipeline, useStats } from '@/components/atlas/api'
import { StatusDot } from '@/components/atlas/bits'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: number | string
  hint?: string
}) {
  return (
    <div className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-stone-500">
        <Icon className="h-4 w-4 text-[#8a6d3b]" aria-hidden="true" />
        {label}
      </div>
      <p className="mt-2 font-serif text-3xl text-stone-900">{typeof value === 'number' ? value.toLocaleString() : value}</p>
      {hint && <p className="mt-1 text-xs text-stone-500">{hint}</p>}
    </div>
  )
}

function BarList({
  items,
  max: maxOverride,
  accent = false,
}: {
  items: { name: string; count: number }[]
  max?: number
  accent?: boolean
}) {
  const max = maxOverride ?? Math.max(1, ...items.map((i) => i.count))
  return (
    <ul className="space-y-2.5">
      {items.map((it) => (
        <li key={it.name}>
          <div className="flex items-baseline justify-between gap-2 text-sm">
            <span className="min-w-0 truncate text-stone-700">{it.name}</span>
            <span className="shrink-0 tabular-nums text-stone-500">{it.count.toLocaleString()}</span>
          </div>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-stone-100">
            <div
              className={accent ? 'h-full rounded-full bg-[#8a6d3b]' : 'h-full rounded-full bg-stone-400'}
              style={{ width: `${Math.max(2, Math.round((it.count / max) * 100))}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  )
}

const STATUS_ORDER = ['verified', 'researched', 'draft', 'flagged']
const ESTABLISHMENT_LABELS: Record<string, string> = {
  historical: 'Historical movement/style',
  regional_tradition: 'Regional & cultural tradition',
  community_subculture: 'Community subculture',
  commercial_style: 'Commercial style',
  internet_aesthetic: 'Internet-born aesthetic',
  experimental_hybrid: 'Documented hybrid',
}

export function DashboardView() {
  const { data: stats, isPending, isError, refetch } = useStats()
  const { data: pipeline } = usePipeline()
  const { data: audit } = useAudit()
  const [triggering, setTriggering] = useState(false)

  const triggerAudit = async () => {
    setTriggering(true)
    try {
      const res = await postJson<{ ok: boolean; queued?: boolean; reason?: string; error?: string }>(
        '/api/pipeline',
        { action: 'audit' }
      )
      if (res.ok && res.queued) toast.success('Gap-audit batch queued — the research pipeline will pick it up.')
      else toast.info(res.reason ?? 'Audit batches are already queued.')
      await refetch()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to queue audit')
    } finally {
      setTriggering(false)
    }
  }

  if (isPending) {
    return (
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:py-12">
        <Skeleton className="h-10 w-64" />
        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-72" />
          <Skeleton className="h-72" />
        </div>
      </main>
    )
  }
  if (isError || !stats) {
    return (
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:py-12">
        <p className="rounded-lg border border-stone-200 bg-white p-6 text-stone-600">
          Coverage statistics are unavailable right now.{' '}
          <Button variant="link" onClick={() => refetch()} className="px-1">
            Retry
          </Button>
        </p>
      </main>
    )
  }

  const statusCount = (s: string) => stats.byStatus.find((x) => x.name === s)?.count ?? 0
  const verified = statusCount('verified')
  const researched = statusCount('researched')
  const draft = statusCount('draft')
  const flagged = statusCount('flagged')
  const underrepresented = stats.byCategory.filter((c) => c.count < 10)
  const topCategories = stats.byCategory.slice(0, 20)

  return (
    <main id="main" className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-[#8a6d3b]">Coverage dashboard</p>
          <h2 className="mt-3 font-serif text-3xl text-stone-900 sm:text-4xl">The encyclopedia, measured.</h2>
          <p className="mt-2 max-w-2xl text-stone-600">
            An honest accounting of what has been documented so far — and what the research pipeline is
            still working on. Coverage grows continuously; nothing here claims to be complete.
          </p>
        </div>
        {stats.lastUpdated && (
          <p className="flex items-center gap-1.5 text-xs text-stone-500">
            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
            Updated {new Date(stats.lastUpdated).toLocaleString()}
          </p>
        )}
      </div>

      {/* Stat cards */}
      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Layers} label="Total aesthetics" value={stats.total} hint="all statuses" />
        <StatCard icon={CircleCheck} label="Verified" value={verified} hint="fact-checked or curated" />
        <StatCard icon={Radar} label="Researched" value={researched} hint="deep decomposition complete" />
        <StatCard icon={CircleDashed} label="Draft / flagged" value={draft + flagged} hint="pipeline working on these" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {/* Category coverage */}
        <section className="rounded-xl border border-stone-200 bg-white p-4 sm:p-6" aria-label="Category coverage">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-serif text-xl text-stone-900">Category coverage</h3>
            <Badge variant="outline" className="border-stone-300 font-normal">
              {stats.byCategory.length} categories
            </Badge>
          </div>
          <BarList items={topCategories} accent />
          {topCategories.length === 0 && <p className="text-sm text-stone-500">No entries yet.</p>}
        </section>

        <div className="space-y-4">
          {/* Establishment split */}
          <section className="rounded-xl border border-stone-200 bg-white p-4 sm:p-6" aria-label="Classification split">
            <h3 className="mb-4 font-serif text-xl text-stone-900">What kind of thing is documented?</h3>
            <BarList
              items={stats.byEstablishment.map((e) => ({
                name: ESTABLISHMENT_LABELS[e.name] ?? e.name,
                count: e.count,
              }))}
            />
          </section>

          {/* Source quality */}
          <section className="rounded-xl border border-stone-200 bg-white p-4 sm:p-6" aria-label="Documentation quality">
            <h3 className="mb-4 font-serif text-xl text-stone-900">Documentation quality</h3>
            <BarList items={stats.byDataQuality} />
            <p className="mt-3 text-xs leading-relaxed text-stone-500">
              Quality reflects the tiers of sources behind each entry (museums and academia first,
              community wikis last). It measures documentation depth — not objective truth.
            </p>
          </section>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {/* Era coverage */}
        <section className="rounded-xl border border-stone-200 bg-white p-4 sm:p-6" aria-label="Era coverage">
          <h3 className="mb-4 font-serif text-xl text-stone-900">Historical coverage</h3>
          <BarList items={stats.byEra.slice(0, 14)} />
        </section>

        {/* Region coverage */}
        <section className="rounded-xl border border-stone-200 bg-white p-4 sm:p-6" aria-label="Geographic coverage">
          <h3 className="mb-4 font-serif text-xl text-stone-900">Geographic coverage</h3>
          <BarList items={stats.byRegion.slice(0, 14)} />
          <p className="mt-3 text-xs leading-relaxed text-stone-500">
            Regions are derived from origin and geography fields. “Other / Global” collects
            transnational styles.
          </p>
        </section>
      </div>

      {/* Library growth milestone */}
      {audit && (
        <section
          className="mt-6 rounded-xl border border-stone-200 bg-white p-4 sm:p-6"
          aria-label="Library growth milestone"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="flex items-center gap-2 font-serif text-xl text-stone-900">
              <Gauge className="h-5 w-5 text-[#8a6d3b]" aria-hidden="true" />
              Library growth milestone
            </h3>
            <Badge variant="outline" className="border-stone-300 font-normal">
              target {audit.target.toLocaleString()} entries
            </Badge>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline justify-between text-sm">
              <span className="text-stone-700">
                {audit.total.toLocaleString()} documented of {audit.target.toLocaleString()}
              </span>
              <span className="tabular-nums text-stone-500">{audit.targetProgress}%</span>
            </div>
            <Progress value={audit.targetProgress} className="mt-2 h-2.5" />
            <div className="relative mt-1 h-4">
              {[1000, 2000, 3000, 4000].map((m) => (
                <span
                  key={m}
                  className="absolute -translate-x-1/2 text-[10px] text-stone-400"
                  style={{ left: `${Math.min(99, (m / audit.target) * 100)}%` }}
                >
                  {m >= 1000 ? `${m / 1000}k` : m}
                </span>
              ))}
            </div>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-stone-500">
            The discovery queue holds {pipeline?.queued.toLocaleString() ?? '—'} research batches; the taxonomy
            auditor queues new waves automatically whenever the queue runs low. The library never stops growing.
          </p>
        </section>
      )}

      {/* Record integrity */}
      {audit && (
        <section
          className="mt-6 rounded-xl border border-stone-200 bg-white p-4 sm:p-6"
          aria-label="Record integrity"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="flex items-center gap-2 font-serif text-xl text-stone-900">
              <ShieldCheck className="h-5 w-5 text-[#8a6d3b]" aria-hidden="true" />
              Record integrity — no missing data
            </h3>
            <Badge variant="outline" className="border-stone-300 font-normal">
              audited {new Date(audit.generatedAt).toLocaleTimeString()}
            </Badge>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <div className="flex items-baseline justify-between text-sm">
                <span className="text-stone-700">Core identity fields (palette, period, origin…)</span>
                <span className="tabular-nums text-stone-500">{audit.completeness.core}%</span>
              </div>
              <Progress value={audit.completeness.core} className="mt-1.5 h-2" />
            </div>
            <div>
              <div className="flex items-baseline justify-between text-sm">
                <span className="text-stone-700">Deep decomposition (DNA, lighting, recipe…)</span>
                <span className="tabular-nums text-stone-500">{audit.completeness.deep}%</span>
              </div>
              <Progress value={audit.completeness.deep} className="mt-1.5 h-2" />
            </div>
          </div>
          {audit.completeness.gaps.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-xs font-medium uppercase tracking-[0.14em] text-stone-500">
                Open field gaps (entries missing each field)
              </p>
              <div className="flex max-h-40 flex-wrap gap-1.5 overflow-y-auto scrollbar-thin pr-1">
                {audit.completeness.gaps.map((g) => (
                  <span
                    key={g.field}
                    className={`rounded-full border px-2.5 py-0.5 text-xs ${
                      g.missing === 0
                        ? 'border-emerald-700/25 bg-emerald-50 text-emerald-900'
                        : 'border-stone-200 bg-stone-50 text-stone-600'
                    }`}
                  >
                    {g.field} · {g.missing.toLocaleString()}
                  </span>
                ))}
              </div>
            </div>
          )}
          <p className="mt-3 text-xs leading-relaxed text-stone-500">
            The pipeline&rsquo;s gap-filling pass completes missing identity fields, the enrichment pass adds deep
            decomposition, and the image worker attaches real example imagery — continuously, highest-traffic
            entries first. Green chips are fully populated fields.
          </p>
        </section>
      )}

      <section
        className="mt-6 rounded-xl border border-stone-200 bg-white p-4 sm:p-6"
        aria-label="Research pipeline"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-serif text-xl text-stone-900">Research pipeline</h3>
          <Button
            size="sm"
            onClick={triggerAudit}
            disabled={triggering}
            className="min-h-[44px] bg-[#8a6d3b] text-white hover:bg-[#755b30]"
          >
            {triggering ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <RefreshCw className="h-4 w-4" aria-hidden="true" />}
            Trigger gap audit
          </Button>
        </div>

        {pipeline ? (
          <>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-lg border border-stone-200 p-3">
                <p className="text-xs uppercase tracking-wider text-stone-500">Queued batches</p>
                <p className="mt-1 font-serif text-2xl text-stone-900">{pipeline.queued}</p>
              </div>
              <div className="rounded-lg border border-stone-200 p-3">
                <p className="text-xs uppercase tracking-wider text-stone-500">Running</p>
                <p className="mt-1 font-serif text-2xl text-stone-900">{pipeline.running}</p>
              </div>
              <div className="rounded-lg border border-stone-200 p-3">
                <p className="text-xs uppercase tracking-wider text-stone-500">Completed</p>
                <p className="mt-1 font-serif text-2xl text-stone-900">{pipeline.done}</p>
              </div>
              <div className="rounded-lg border border-stone-200 p-3">
                <p className="text-xs uppercase tracking-wider text-stone-500">Open backlog</p>
                <p className="mt-1 font-serif text-2xl text-stone-900">{pipeline.backlogOpen}</p>
              </div>
            </div>

            {pipeline.queued > 0 && pipeline.running === 0 && pipeline.done > 0 && (
              <p className="mt-3 flex items-center gap-1.5 text-xs text-amber-800">
                <TriangleAlert className="h-3.5 w-3.5" aria-hidden="true" />
                {pipeline.queued} batches are waiting — the background worker appears idle.
              </p>
            )}

            <div className="mt-5 overflow-hidden rounded-lg border border-stone-200">
              <table className="w-full text-sm">
                <caption className="sr-only">Recent research batches</caption>
                <thead>
                  <tr className="border-b border-stone-200 bg-stone-50 text-left text-xs uppercase tracking-wider text-stone-500">
                    <th scope="col" className="px-3 py-2 font-medium">Domain</th>
                    <th scope="col" className="hidden px-3 py-2 font-medium sm:table-cell">Kind</th>
                    <th scope="col" className="px-3 py-2 font-medium">Status</th>
                    <th scope="col" className="px-3 py-2 font-medium">Added</th>
                  </tr>
                </thead>
                <tbody>
                  {pipeline.recent.map((b, i) => (
                    <tr key={i} className="border-b border-stone-100 last:border-0">
                      <td className="max-w-[280px] truncate px-3 py-2 text-stone-800" title={b.error || b.domain}>
                        {b.domain}
                        {b.error && <span className="ml-1 text-xs text-red-800">— {b.error.slice(0, 60)}</span>}
                      </td>
                      <td className="hidden px-3 py-2 text-stone-500 sm:table-cell">{b.kind}</td>
                      <td className="px-3 py-2">
                        <span className="inline-flex items-center gap-1.5 capitalize text-stone-700">
                          <StatusDot status={b.status === 'done' ? 'verified' : b.status === 'failed' ? 'flagged' : 'draft'} />
                          {b.status}
                        </span>
                      </td>
                      <td className="px-3 py-2 tabular-nums text-stone-700">
                        +{b.inserted}
                        {b.duplicates > 0 && <span className="text-stone-400"> · {b.duplicates} dup</span>}
                      </td>
                    </tr>
                  ))}
                  {pipeline.recent.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-3 py-4 text-center text-stone-500">
                        No batches yet — the pipeline is warming up.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {pipeline.queuedDomains.length > 0 && (
              <div className="mt-5">
                <p className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.14em] text-stone-500">
                  <BookMarked className="h-3.5 w-3.5" aria-hidden="true" />
                  Next in the research queue
                </p>
                <div className="flex max-h-36 flex-wrap gap-1.5 overflow-y-auto scrollbar-thin pr-1">
                  {pipeline.queuedDomains.map((d, i) => (
                    <span key={i} className="rounded-full border border-stone-200 bg-stone-50 px-2.5 py-0.5 text-xs text-stone-600">
                      {d.domain}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="mt-4 flex items-center gap-2 text-sm text-stone-500">
            <FlaskConical className="h-4 w-4" aria-hidden="true" /> Pipeline status unavailable.
          </div>
        )}
      </section>

      {/* Underrepresented */}
      {underrepresented.length > 0 && (
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6 rounded-xl border border-amber-900/20 bg-[#fdf9ef] p-4 sm:p-6"
          aria-label="Underrepresented areas"
        >
          <h3 className="font-serif text-xl text-stone-900">Underrepresented areas</h3>
          <p className="mt-1 text-sm text-stone-600">
            These categories have fewer than ten documented entries so far. The gap audit and backlog
            queue prioritize them for future research rounds.
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {underrepresented.map((c) => (
              <span key={c.name} className="rounded-full border border-amber-900/20 bg-white px-2.5 py-0.5 text-xs text-amber-900">
                {c.name} · {c.count}
              </span>
            ))}
          </div>
        </motion.section>
      )}

      {/* Research funnel */}
      <section className="mt-6 rounded-xl border border-stone-200 bg-white p-4 sm:p-6" aria-label="Research funnel">
        <h3 className="mb-1 font-serif text-xl text-stone-900">Research funnel</h3>
        <p className="mb-4 text-sm text-stone-600">
          Every entry moves from draft → researched → verified as the pipeline deepens and fact-checks it.
        </p>
        {[
          { label: 'Draft — discovered with core metadata', value: draft, total: stats.total },
          { label: 'Researched — deep decomposition added', value: researched, total: stats.total },
          { label: 'Verified — fact-checked or curated', value: verified, total: stats.total },
        ].map((row) => (
          <div key={row.label} className="mb-3 last:mb-0">
            <div className="flex items-baseline justify-between text-sm">
              <span className="text-stone-700">{row.label}</span>
              <span className="tabular-nums text-stone-500">
                {row.value.toLocaleString()} · {stats.total > 0 ? Math.round((row.value / stats.total) * 100) : 0}%
              </span>
            </div>
            <Progress value={stats.total > 0 ? (row.value / stats.total) * 100 : 0} className="mt-1.5 h-1.5" />
          </div>
        ))}
      </section>
    </main>
  )
}
