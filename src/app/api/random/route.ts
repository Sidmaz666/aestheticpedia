import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { Prisma } from '@prisma/client'
import { mapAestheticSummary } from '@/lib/aesthetic'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const mode = req.nextUrl.searchParams.get('mode') ?? 'any'

    let where: Prisma.AestheticWhereInput = {}
    if (mode === 'niche') where = { isNiche: true }
    else if (mode === 'verified') where = { status: 'verified' }

    const total = await db.aesthetic.count({ where })
    if (total === 0) {
      return NextResponse.json(
        { error: 'No aesthetics available for this mode yet' },
        { status: 404 }
      )
    }

    const skip = Math.floor(Math.random() * total)
    const rows = await db.aesthetic.findMany({
      where,
      skip,
      take: 1,
      orderBy: { slug: 'asc' },
    })

    if (rows.length === 0) {
      return NextResponse.json({ error: 'No aesthetic found' }, { status: 404 })
    }
    return NextResponse.json({ item: mapAestheticSummary(rows[0]) })
  } catch (err) {
    console.error('[api/random] failed:', err)
    return NextResponse.json({ error: 'Failed to pick a random aesthetic' }, { status: 500 })
  }
}
