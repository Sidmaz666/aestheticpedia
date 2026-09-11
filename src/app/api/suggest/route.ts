import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import type { SuggestItem } from '@/lib/aesthetic'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const q = (req.nextUrl.searchParams.get('q') ?? '').trim().replace(/[%_]/g, '').slice(0, 60)
    if (q.length < 1) {
      return NextResponse.json({ items: [] as SuggestItem[] })
    }

    const lower = q.toLowerCase()

    // Prefix matches on name first, then alias prefix (aliases is a JSON string
    // array — a raw `"` in the serialized form always opens a string element).
    const rows = await db.aesthetic.findMany({
      where: {
        OR: [{ name: { startsWith: q } }, { aliases: { contains: `"${q}` } }],
      },
      select: { slug: true, name: true, category: true, aliases: true },
      take: 40,
    })

    const nameMatches = rows
      .filter((r) => r.name.toLowerCase().startsWith(lower))
      .sort((a, b) => a.name.length - b.name.length)

    const aliasMatches = rows
      .filter((r) => !r.name.toLowerCase().startsWith(lower))
      .sort((a, b) => a.name.length - b.name.length)

    // If prefixes alone don't fill the list, fall back to substring matches on name.
    let substringMatches: typeof rows = []
    if (nameMatches.length + aliasMatches.length < 10) {
      const seen = new Set([...nameMatches, ...aliasMatches].map((r) => r.slug))
      const subs = await db.aesthetic.findMany({
        where: { name: { contains: q }, slug: { notIn: [...seen] } },
        select: { slug: true, name: true, category: true },
        take: 10,
      })
      substringMatches = subs
    }

    const items: SuggestItem[] = [...nameMatches, ...aliasMatches, ...substringMatches]
      .slice(0, 10)
      .map((r) => ({ slug: r.slug, name: r.name, category: r.category }))

    return NextResponse.json({ items })
  } catch (err) {
    console.error('[api/suggest] failed:', err)
    return NextResponse.json({ error: 'Suggest query failed' }, { status: 500 })
  }
}
