import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { asColorArray, safeParse, type TimelineResponse } from '@/lib/aesthetic'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const rows = await db.aesthetic.findMany({
      where: { startYear: { not: null } },
      orderBy: { startYear: 'asc' },
      select: {
        slug: true,
        name: true,
        category: true,
        startYear: true,
        endYear: true,
        periodStart: true,
        colors: true,
        popularity: true,
        establishment: true,
      },
    })

    const items = rows.map((r) => ({
      slug: r.slug,
      name: r.name,
      category: r.category,
      startYear: r.startYear as number,
      endYear: r.endYear ?? null,
      periodLabel: r.periodStart,
      colors: asColorArray(safeParse<unknown>(r.colors, [])),
      popularity: r.popularity,
      establishment: r.establishment,
    }))

    const years = items.map((i) => i.startYear)
    const res: TimelineResponse = {
      items,
      min: years.length ? Math.min(...years) : null,
      max: years.length ? Math.max(...years) : null,
    }
    return NextResponse.json(res)
  } catch (err) {
    console.error('[api/timeline] failed:', err)
    return NextResponse.json({ error: 'Timeline query failed' }, { status: 500 })
  }
}
