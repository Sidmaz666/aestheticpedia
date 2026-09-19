import type { NextRequest } from 'next/server'
import { handle, ok, options } from '@/lib/api'
import { suggest } from '@/lib/queries'

export const dynamic = 'force-dynamic'
export const OPTIONS = options

/** GET /api/v1/search?q=vapor&limit=10 — ranked type-ahead over names and aliases. */
export const GET = handle('search', async (req: NextRequest) => {
  const q = req.nextUrl.searchParams.get('q') ?? ''
  const limit = Math.min(50, Math.max(1, parseInt(req.nextUrl.searchParams.get('limit') ?? '10', 10) || 10))
  return ok({ query: q, items: await suggest(q, limit) })
})
