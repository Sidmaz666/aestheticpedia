import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { deriveRegion, eraBucket, type StatsResponse } from '@/lib/aesthetic'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const [
      total,
      relations,
      statusG,
      categoryG,
      establishmentG,
      qualityG,
      geoYearRows,
      batchG,
      recentBatches,
      backlogOpen,
      lastAgg,
    ] = await Promise.all([
      db.aesthetic.count(),
      db.relation.count(),
      db.aesthetic.groupBy({ by: ['status'], _count: { _all: true } }),
      db.aesthetic.groupBy({ by: ['category'], _count: { _all: true } }),
      db.aesthetic.groupBy({ by: ['establishment'], _count: { _all: true } }),
      db.aesthetic.groupBy({ by: ['dataQuality'], _count: { _all: true } }),
      db.aesthetic.findMany({ select: { geography: true, origin: true, startYear: true } }),
      db.researchBatch.groupBy({ by: ['status'], _count: { _all: true } }),
      db.researchBatch.findMany({ orderBy: { createdAt: 'desc' }, take: 8 }),
      db.backlogTerm.count({ where: { status: 'open' } }),
      db.aesthetic.aggregate({ _max: { updatedAt: true } }),
    ])

    const counts = (rows: { name: string; count: number }[]) =>
      rows.sort((a, b) => b.count - a.count)

    const byStatus = counts(
      statusG.map((r) => ({ name: r.status, count: r._count._all }))
    )
    const byCategory = counts(
      categoryG.map((r) => ({ name: r.category, count: r._count._all }))
    )
    const byEstablishment = counts(
      establishmentG.map((r) => ({ name: r.establishment, count: r._count._all }))
    )
    const byDataQuality = counts(
      qualityG.map((r) => ({ name: r.dataQuality, count: r._count._all }))
    )

    // Era buckets from startYear
    const eraCounts = new Map<string, number>()
    // Region buckets derived from geography/origin
    const regionCounts = new Map<string, number>()
    for (const r of geoYearRows) {
      const era = eraBucket(r.startYear)
      eraCounts.set(era, (eraCounts.get(era) ?? 0) + 1)
      const region = deriveRegion(r.geography, r.origin)
      regionCounts.set(region, (regionCounts.get(region) ?? 0) + 1)
    }
    const byEra = counts([...eraCounts.entries()].map(([name, count]) => ({ name, count })))
    const byRegion = counts([...regionCounts.entries()].map(([name, count]) => ({ name, count })))

    const pipelineStatus = (kind: string) =>
      batchG.find((b) => b.status === kind)?._count._all ?? 0

    const res: StatsResponse = {
      total,
      relations,
      byStatus,
      byCategory,
      byEstablishment,
      byEra,
      byRegion,
      byDataQuality,
      pipeline: {
        queued: pipelineStatus('queued'),
        running: pipelineStatus('running'),
        done: pipelineStatus('done'),
        failed: pipelineStatus('failed'),
        backlogOpen,
        recent: recentBatches.map((b) => ({
          domain: b.domain,
          kind: b.kind,
          status: b.status,
          inserted: b.inserted,
          duplicates: b.duplicates,
          error: b.error,
          finishedAt: b.finishedAt ? b.finishedAt.toISOString() : null,
          createdAt: b.createdAt.toISOString(),
        })),
      },
      lastUpdated: lastAgg._max.updatedAt ? lastAgg._max.updatedAt.toISOString() : null,
    }
    return NextResponse.json(res)
  } catch (err) {
    console.error('[api/stats] failed:', err)
    return NextResponse.json({ error: 'Failed to compute stats' }, { status: 500 })
  }
}
