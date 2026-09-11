import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { mapAestheticFull } from '@/lib/aesthetic'

export const dynamic = 'force-dynamic'

const MAX_SLUGS = 4

export async function GET(req: NextRequest) {
  try {
    const raw = req.nextUrl.searchParams.get('slugs') ?? ''
    const slugs = [...new Set(raw.split(',').map((s) => s.trim()).filter(Boolean))].slice(0, MAX_SLUGS)

    if (slugs.length === 0) {
      return NextResponse.json({ error: 'Provide 1-4 slugs, e.g. ?slugs=a,b' }, { status: 400 })
    }

    const rows = await db.aesthetic.findMany({ where: { slug: { in: slugs } } })
    const bySlug = new Map(rows.map((r) => [r.slug, r]))
    const ordered = slugs
      .map((s) => bySlug.get(s))
      .filter((r): r is NonNullable<typeof r> => !!r)

    const missing = slugs.filter((s) => !bySlug.has(s))
    return NextResponse.json({ items: ordered.map(mapAestheticFull), missing })
  } catch (err) {
    console.error('[api/compare] failed:', err)
    return NextResponse.json({ error: 'Compare query failed' }, { status: 500 })
  }
}
