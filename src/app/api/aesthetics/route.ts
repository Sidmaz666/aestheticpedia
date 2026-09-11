import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { Prisma } from '@prisma/client'
import {
  mapAestheticSummary,
  deriveRegion,
  safeParse,
  asStringArray,
  type Facets,
  type AestheticsResponse,
} from '@/lib/aesthetic'

export const dynamic = 'force-dynamic'

const REGION_FACET_LIMIT = 24
const ERA_FACET_LIMIT = 20
const TAG_FACET_LIMIT = 40

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams

    const q = (sp.get('q') ?? '').trim().replace(/[%_]/g, '').slice(0, 100)
    const categories = sp.getAll('category').filter(Boolean).slice(0, 20)
    const establishment = sp.get('establishment') ?? ''
    const status = sp.get('status') ?? ''
    const era = sp.get('era') ?? ''
    const region = sp.get('region') ?? ''
    const tag = (sp.get('tag') ?? '').trim().slice(0, 60)
    const niche = sp.get('niche') === 'true'
    const minPopRaw = parseInt(sp.get('minPop') ?? '', 10)
    const sort = sp.get('sort') === 'recent' || sp.get('sort') === 'name' ? sp.get('sort') : 'popular'
    const page = Math.max(1, parseInt(sp.get('page') ?? '1', 10) || 1)
    const pageSize = Math.min(60, Math.max(1, parseInt(sp.get('pageSize') ?? '24', 10) || 24))

    const where: Prisma.AestheticWhereInput = {}

    if (q) {
      // SQLite LIKE (Prisma contains) is ASCII case-insensitive; aliases/tags are
      // JSON string columns so a substring match on the raw JSON works as intended.
      where.OR = [
        { name: { contains: q } },
        { aliases: { contains: q } },
        { tags: { contains: q } },
        { summary: { contains: q } },
      ]
    }
    if (categories.length > 0) where.category = { in: categories }
    if (establishment) where.establishment = establishment
    if (status) where.status = status
    if (era) where.era = era
    if (tag) where.tags = { contains: `"${tag}"` }
    if (niche) where.isNiche = true
    if (!Number.isNaN(minPopRaw)) where.popularity = { gte: minPopRaw }

    // Region is a derived label (geography/origin → bucket), so resolve the
    // matching slug set with a narrow projection scan.
    if (region) {
      const geoRows = await db.aesthetic.findMany({
        where,
        select: { slug: true, geography: true, origin: true },
      })
      const slugs = geoRows
        .filter((r) => deriveRegion(r.geography, r.origin) === region)
        .map((r) => r.slug)
      if (slugs.length === 0) {
        const empty: AestheticsResponse = {
          items: [],
          total: 0,
          page,
          pageSize,
          facets: await buildFacets(),
        }
        return NextResponse.json(empty)
      }
      where.slug = { in: slugs }
    }

    const orderBy: Prisma.AestheticOrderByWithRelationInput[] =
      sort === 'recent'
        ? [{ createdAt: 'desc' }, { name: 'asc' }]
        : sort === 'name'
          ? [{ name: 'asc' }]
          : [{ popularity: 'desc' }, { name: 'asc' }]

    const [rows, total, facets] = await Promise.all([
      db.aesthetic.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.aesthetic.count({ where }),
      buildFacets(),
    ])

    const res: AestheticsResponse = {
      items: rows.map(mapAestheticSummary),
      total,
      page,
      pageSize,
      facets,
    }
    return NextResponse.json(res)
  } catch (err) {
    console.error('[api/aesthetics] failed:', err)
    return NextResponse.json({ error: 'Failed to query aesthetics' }, { status: 500 })
  }
}

async function buildFacets(): Promise<Facets> {
  const [categoryG, establishmentG, statusG, eraG, geoRows, tagRows] = await Promise.all([
    db.aesthetic.groupBy({ by: ['category'], _count: { _all: true } }),
    db.aesthetic.groupBy({ by: ['establishment'], _count: { _all: true } }),
    db.aesthetic.groupBy({ by: ['status'], _count: { _all: true } }),
    db.aesthetic.groupBy({ by: ['era'], _count: { _all: true }, where: { era: { not: '' } } }),
    db.aesthetic.findMany({ select: { geography: true, origin: true } }),
    db.aesthetic.findMany({ select: { tags: true } }),
  ])

  const toCounts = (rows: { _count: { _all: number } } & Record<string, string | null>[], key: string) =>
    rows
      .map((r) => ({ name: (r[key] as string) ?? '', count: r._count._all }))
      .filter((r) => r.name)
      .sort((a, b) => b.count - a.count)

  const regionCounts = new Map<string, number>()
  for (const r of geoRows) {
    const label = deriveRegion(r.geography, r.origin)
    regionCounts.set(label, (regionCounts.get(label) ?? 0) + 1)
  }

  const tagCounts = new Map<string, number>()
  for (const r of tagRows) {
    for (const t of asStringArray(safeParse<unknown>(r.tags, []))) {
      const clean = t.trim()
      if (!clean) continue
      tagCounts.set(clean, (tagCounts.get(clean) ?? 0) + 1)
    }
  }

  return {
    categories: toCounts(categoryG, 'category').sort((a, b) => a.name.localeCompare(b.name)),
    establishments: toCounts(establishmentG, 'establishment'),
    statuses: toCounts(statusG, 'status'),
    eras: toCounts(eraG, 'era').slice(0, ERA_FACET_LIMIT),
    regions: [...regionCounts.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, REGION_FACET_LIMIT),
    tags: [...tagCounts.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, TAG_FACET_LIMIT),
  }
}
