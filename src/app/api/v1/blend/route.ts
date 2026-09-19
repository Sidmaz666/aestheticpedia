import type { NextRequest } from 'next/server'
import { fail, handle, ok, options } from '@/lib/api'
import type { HybridResponse } from '@/lib/aesthetic'
import { synthesize } from '@/lib/blend'
import { paletteMetrics } from '@/lib/palette-metrics'
import { getAesthetic } from '@/lib/queries'

export const dynamic = 'force-dynamic'
export const OPTIONS = options

async function blend(a?: string | null, b?: string | null) {
  if (!a || !b) return fail(400, 'Provide two slugs: ?a=…&b=… (or POST { a, b })')
  if (a === b) return fail(400, 'Pick two different aesthetics')
  const [A, B] = await Promise.all([getAesthetic(a), getAesthetic(b)])
  if (!A || !B) return fail(404, `No aesthetic with slug "${!A ? a : b}"`)
  const hybrid = synthesize(A.aesthetic, B.aesthetic)
  const res: HybridResponse = {
    hybrid,
    metrics: paletteMetrics(hybrid.palette ?? []),
    parents: [A, B].map(({ aesthetic: x }) => ({
      slug: x.slug,
      name: x.name,
      colors: x.colors,
      category: x.category,
      summary: x.summary,
      periodStart: x.periodStart,
      origin: x.origin,
      images: x.images.slice(0, 4).map(({ url, thumb, caption, artist, license, source, pageUrl }) => ({ url, thumb, caption, artist, license, source, pageUrl })),
      metrics: x.metrics,
    })),
    label: 'Speculative blend — derived algorithmically from two documented records; not a documented style.',
  }
  return ok(res)
}

/** GET /api/v1/blend?a=bauhaus&b=vaporwave — deterministic blend of two records. */
export const GET = handle('blend', async (req: NextRequest) =>
  blend(req.nextUrl.searchParams.get('a'), req.nextUrl.searchParams.get('b'))
)

export const POST = handle('blend', async (req: NextRequest) => {
  const body = (await req.json().catch(() => null)) as { a?: string; b?: string } | null
  return blend(body?.a?.trim(), body?.b?.trim())
})
