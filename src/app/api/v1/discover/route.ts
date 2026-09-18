import type { NextRequest } from 'next/server'
import { fail, handle, ok, options } from '@/lib/api'
import { METRIC_AXES } from '@/lib/palette-metrics'
import { discover, parseDims } from '@/lib/queries'

export const dynamic = 'force-dynamic'
export const OPTIONS = options

/**
 * GET /api/v1/discover?dims=warmth:80,saturation:30&category=…
 * Nearest aesthetics by measured palette metrics (warmth, saturation, lightness, contrast, hueRange; 0–100).
 */
export const GET = handle('discover', async (req: NextRequest) => {
  const dims = parseDims(req.nextUrl.searchParams.get('dims') ?? '')
  if (!dims.size)
    return fail(400, 'Provide dims as key:value pairs (0–100), e.g. dims=warmth:80,saturation:30', {
      dimensions: METRIC_AXES.map((a) => a.key),
    })
  const limit = Math.min(60, parseInt(req.nextUrl.searchParams.get('limit') ?? '24', 10) || 24)
  const items = await discover(dims, req.nextUrl.searchParams.get('category') ?? undefined, limit)
  return ok({ dims: Object.fromEntries(dims), items })
})
