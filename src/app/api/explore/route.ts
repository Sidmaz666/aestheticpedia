import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import {
  KNOWN_DIMS,
  asColorArray,
  safeParse,
  type ExploreResult,
} from '@/lib/aesthetic'

export const dynamic = 'force-dynamic'

const CANDIDATE_LIMIT = 1500
const RESULT_LIMIT = 24
const NEUTRAL = 50

/**
 * GET /api/explore?dims=minimal_maximal:30,quiet_loud:85&category=...
 * Scores candidates by mean absolute difference over the provided dimensions
 * (dna axes + emotion keys), returns the 24 closest matches.
 */
export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams
    const category = sp.get('category') ?? ''
    const dimsRaw = sp.get('dims') ?? ''

    const dims = new Map<string, number>()
    for (const part of dimsRaw.split(',')) {
      const [key, valRaw] = part.split(':')
      if (!key || valRaw === undefined) continue
      if (!KNOWN_DIMS.has(key.trim())) continue
      const val = parseFloat(valRaw)
      if (Number.isNaN(val)) continue
      dims.set(key.trim(), Math.min(100, Math.max(0, val)))
    }

    if (dims.size === 0) {
      return NextResponse.json(
        { error: 'Provide at least one valid dim as key:value (e.g. dims=minimal_maximal:30)' },
        { status: 400 }
      )
    }

    const rows = await db.aesthetic.findMany({
      where: category ? { category } : {},
      select: {
        slug: true,
        name: true,
        category: true,
        summary: true,
        colors: true,
        dnaAxes: true,
        emotionProfile: true,
      },
      take: CANDIDATE_LIMIT,
    })

    const scored: ExploreResult[] = rows.map((row) => {
      const dna = safeParse<Record<string, unknown>>(row.dnaAxes, {})
      const emo = safeParse<Record<string, unknown>>(row.emotionProfile, {})
      const candidates: Record<string, number> = { ...dna, ...emo }

      let sum = 0
      const diffs: { dim: string; diff: number }[] = []
      for (const [dim, userVal] of dims) {
        const raw = candidates[dim]
        const cVal =
          typeof raw === 'number' && !Number.isNaN(raw) ? Math.min(100, Math.max(0, raw)) : NEUTRAL
        const diff = Math.abs(cVal - userVal)
        sum += diff
        diffs.push({ dim, diff })
      }
      const distance = Math.round((sum / dims.size) * 10) / 10

      const delta: Record<string, number> = {}
      diffs
        .sort((a, b) => b.diff - a.diff)
        .slice(0, 4)
        .forEach(({ dim }) => {
          const raw = candidates[dim]
          const cVal =
            typeof raw === 'number' && !Number.isNaN(raw) ? Math.min(100, Math.max(0, raw)) : NEUTRAL
          delta[dim] = Math.round((cVal - (dims.get(dim) ?? NEUTRAL)) * 10) / 10
        })

      return {
        slug: row.slug,
        name: row.name,
        category: row.category,
        summary: row.summary,
        colors: asColorArray(safeParse<unknown>(row.colors, [])),
        distance,
        delta,
      }
    })

    scored.sort((a, b) => a.distance - b.distance)

    return NextResponse.json({ items: scored.slice(0, RESULT_LIMIT), dims: Object.fromEntries(dims) })
  } catch (err) {
    console.error('[api/explore] failed:', err)
    return NextResponse.json({ error: 'Explore query failed' }, { status: 500 })
  }
}
