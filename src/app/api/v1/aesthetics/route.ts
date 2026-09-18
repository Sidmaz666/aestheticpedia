import type { NextRequest } from 'next/server'
import { handle, ok, options, raw } from '@/lib/api'
import { mapAestheticFull } from '@/lib/aesthetic'
import { toCsv, toMarkdown } from '@/lib/formats'
import { listAesthetics, listFullRows, parseListParams } from '@/lib/queries'

export const dynamic = 'force-dynamic'
export const OPTIONS = options

/**
 * GET /api/v1/aesthetics — search, filter and page through the library.
 *   ?q= &category= (repeatable) &type= &status= &era= &region= &place= &from= &to= (years; &began=true = started in range) &tag= &images=true
 *   &sort=popular|name|recent|oldest|newest &page= &pageSize= (≤100) &facets=false
 *   &format=json (default) | ndjson | csv | md   (non-JSON formats return full records, ≤5000)
 */
export const GET = handle('list aesthetics', async (req: NextRequest) => {
  const sp = req.nextUrl.searchParams
  const format = sp.get('format') ?? 'json'
  const params = parseListParams(sp)

  if (format === 'json') {
    const res = await listAesthetics(params)
    return ok(res, { headers: { 'X-Total-Count': String(res.total) } })
  }

  const rows = (await listFullRows(params)).map(mapAestheticFull)
  if (format === 'ndjson') return raw(rows.map((r) => JSON.stringify(r)).join('\n') + '\n', 'application/x-ndjson; charset=utf-8')
  if (format === 'csv')
    return raw(toCsv(rows as unknown as Record<string, unknown>[]), 'text/csv; charset=utf-8', {
      'Content-Disposition': 'attachment; filename="aesthetics.csv"',
    })
  if (format === 'md') return raw(rows.map((r) => toMarkdown(r)).join('\n\n\n'), 'text/markdown; charset=utf-8')
  return ok({ error: { status: 400, message: 'format must be json, ndjson, csv or md' } })
})
