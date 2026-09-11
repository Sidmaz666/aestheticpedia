import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { type PipelineResponse } from '@/lib/aesthetic'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const [batchG, recent, queuedDomains, backlogOpen] = await Promise.all([
      db.researchBatch.groupBy({ by: ['status'], _count: { _all: true } }),
      db.researchBatch.findMany({ orderBy: { createdAt: 'desc' }, take: 8 }),
      db.researchBatch.findMany({
        where: { status: 'queued' },
        orderBy: { createdAt: 'asc' },
        take: 30,
        select: { domain: true, kind: true },
      }),
      db.backlogTerm.count({ where: { status: 'open' } }),
    ])

    const count = (s: string) => batchG.find((b) => b.status === s)?._count._all ?? 0

    const res: PipelineResponse = {
      queued: count('queued'),
      running: count('running'),
      done: count('done'),
      failed: count('failed'),
      backlogOpen,
      recent: recent.map((b) => ({
        domain: b.domain,
        kind: b.kind,
        status: b.status,
        inserted: b.inserted,
        duplicates: b.duplicates,
        error: b.error,
        finishedAt: b.finishedAt ? b.finishedAt.toISOString() : null,
        createdAt: b.createdAt.toISOString(),
      })),
      queuedDomains: queuedDomains.map((b) => ({ domain: b.domain, kind: b.kind })),
    }
    return NextResponse.json(res)
  } catch (err) {
    console.error('[api/pipeline GET] failed:', err)
    return NextResponse.json({ error: 'Pipeline query failed' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as { action?: string }
    if (body?.action !== 'audit') {
      return NextResponse.json(
        { ok: false, error: "Body must be { action: 'audit' }" },
        { status: 400 }
      )
    }

    const queuedAudits = await db.researchBatch.count({
      where: { status: 'queued', kind: 'audit' },
    })

    if (queuedAudits >= 6) {
      return NextResponse.json({ ok: true, queued: false, reason: 'audit batches already queued' })
    }

    // Queue one targeted expansion batch for each of the least-covered categories,
    // embedding the category so the research worker classifies entries correctly.
    const counts = await db.aesthetic.groupBy({
      by: ['category'],
      _count: { _all: true },
      orderBy: { _count: { category: 'asc' } },
      take: 5,
    })

    if (counts.length === 0) {
      await db.researchBatch.create({
        data: {
          domain: 'Art Movement: Foundational gap expansion',
          focus:
            'Document foundational art movements and design styles missing from the encyclopedia; include non-Western movements',
          kind: 'audit',
          requested: 8,
        },
      })
      return NextResponse.json({ ok: true, queued: true })
    }

    for (const c of counts) {
      await db.researchBatch.create({
        data: {
          domain: `${c.category}: underrepresented gap expansion`,
          focus: `The "${c.category}" category is underrepresented (${c._count._all} entries). Document well-known AND obscure documented aesthetics that are missing from it; prioritize non-Western and niche entries.`,
          kind: 'audit',
          requested: 8,
        },
      })
    }

    return NextResponse.json({ ok: true, queued: true })
  } catch (err) {
    console.error('[api/pipeline POST] failed:', err)
    return NextResponse.json({ ok: false, error: 'Failed to queue audit batch' }, { status: 500 })
  }
}
