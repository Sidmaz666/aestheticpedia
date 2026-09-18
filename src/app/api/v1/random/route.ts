import type { NextRequest } from 'next/server'
import { fail, handle, ok, options } from '@/lib/api'
import { randomAesthetic } from '@/lib/queries'

export const dynamic = 'force-dynamic'
export const OPTIONS = options

/** GET /api/v1/random?mode=illustrated|any|niche|reviewed */
export const GET = handle('random', async (req: NextRequest) => {
  const item = await randomAesthetic(req.nextUrl.searchParams.get('mode') ?? 'illustrated')
  return item ? ok({ item }, { cache: false }) : fail(404, 'No aesthetic matches this mode')
})
