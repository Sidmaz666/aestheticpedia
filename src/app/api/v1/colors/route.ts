import type { NextRequest } from 'next/server'
import { handle, ok, options } from '@/lib/api'
import { getColorIndex, searchByColor } from '@/lib/queries'

export const dynamic = 'force-dynamic'
export const OPTIONS = options

/**
 * GET /api/v1/colors            every palette colour with its record
 * GET /api/v1/colors?hex=c9a227 records whose palettes contain a nearby colour
 */
export const GET = handle('colors', async (req: NextRequest) => {
  const hex = req.nextUrl.searchParams.get('hex')
  if (hex) return ok({ hex: `#${hex.replace('#', '')}`, items: await searchByColor(hex, Number(req.nextUrl.searchParams.get('limit')) || 36) })
  return ok({ colors: await getColorIndex() })
})
