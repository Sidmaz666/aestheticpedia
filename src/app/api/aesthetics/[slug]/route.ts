import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { mapAestheticFull, type AestheticDetailResponse } from '@/lib/aesthetic'

export const dynamic = 'force-dynamic'

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params
    const row = await db.aesthetic.findUnique({ where: { slug } })
    if (!row) {
      return NextResponse.json({ error: 'Aesthetic not found' }, { status: 404 })
    }

    const [outgoing, incoming] = await Promise.all([
      db.relation.findMany({
        where: { fromId: row.id },
        include: { to: { select: { slug: true, name: true, category: true } } },
      }),
      db.relation.findMany({
        where: { toId: row.id },
        include: { from: { select: { slug: true, name: true, category: true } } },
      }),
    ])

    const res: AestheticDetailResponse = {
      aesthetic: mapAestheticFull(row),
      relations: {
        outgoing: outgoing.map((r) => ({ type: r.type, note: r.note, target: r.to })),
        incoming: incoming.map((r) => ({ type: r.type, note: r.note, source: r.from })),
      },
    }
    return NextResponse.json(res)
  } catch (err) {
    console.error('[api/aesthetics/[slug]] failed:', err)
    return NextResponse.json({ error: 'Failed to load aesthetic' }, { status: 500 })
  }
}
