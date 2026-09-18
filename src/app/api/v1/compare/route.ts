import type { NextRequest } from 'next/server'
import { fail, handle, ok, options } from '@/lib/api'
import { getAesthetic } from '@/lib/queries'

export const dynamic = 'force-dynamic'
export const OPTIONS = options

/** GET /api/v1/compare?slugs=a,b[,c,d] — full records side by side. */
export const GET = handle('compare', async (req: NextRequest) => {
  const slugs = [...new Set((req.nextUrl.searchParams.get('slugs') ?? '').split(',').map((s) => s.trim()).filter(Boolean))].slice(0, 4)
  if (!slugs.length) return fail(400, 'Provide 1–4 slugs, e.g. ?slugs=bauhaus,memphis-design')
  const found = await Promise.all(slugs.map((s) => getAesthetic(s)))
  return ok({
    items: found.filter((d) => d).map((d) => d!.aesthetic),
    missing: slugs.filter((_, i) => !found[i]),
  })
})
