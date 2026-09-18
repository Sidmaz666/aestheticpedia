import type { NextRequest } from 'next/server'
import { fail, handle, ok, options } from '@/lib/api'
import { DNA_AXES, EMOTION_KEYS } from '@/lib/aesthetic'
import { discover, parseDims } from '@/lib/queries'

export const dynamic = 'force-dynamic'
export const OPTIONS = options

/**
 * GET /api/v1/discover?dims=minimal_maximal:20,quiet_loud:15&category=…
 * Nearest aesthetics to a target style profile (0–100 per dimension).
 */
export const GET = handle('discover', async (req: NextRequest) => {
  const dims = parseDims(req.nextUrl.searchParams.get('dims') ?? '')
  if (!dims.size)
    return fail(400, 'Provide dims as key:value pairs, e.g. dims=minimal_maximal:20,quiet_loud:15', {
      dimensions: [...DNA_AXES.map((a) => a.key), ...EMOTION_KEYS],
    })
  const limit = Math.min(60, parseInt(req.nextUrl.searchParams.get('limit') ?? '24', 10) || 24)
  const items = await discover(dims, req.nextUrl.searchParams.get('category') ?? undefined, limit)
  return ok({ dims: Object.fromEntries(dims), items })
})
