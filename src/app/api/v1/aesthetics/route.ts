import type { NextRequest } from 'next/server'
import { fail, handle, ok, options, raw } from '@/lib/api'
import { mapAestheticFull } from '@/lib/aesthetic'
import { toCsv, toMarkdown } from '@/lib/formats'
import { listAesthetics, listFullRows, parseListParams } from '@/lib/queries'

export const dynamic = 'force-dynamic'
export const OPTIONS = options

const FULL_PAGE = 200
const MAX_BYTES = 4_000_000

/**
 * GET /api/v1/aesthetics — search, filter and page through the library.
 *   ?q= &category= (repeatable) &type= &status= &era= &region= &place= &from= &to= (years; &began=true = started in range) &tag= &images=true
 *   &sort=popular|name|recent|oldest|newest &page= &pageSize= (≤100) &facets=false
 *   &format=json (default) | ndjson | csv | md   (non-JSON formats return full records, ≤200 per request, &offset= or &page=;
 *   follow the Link: rel="next" header, or download the whole library from /data/aesthetics.{ndjson,csv})
 */
export const GET = handle('list aesthetics', async (req: NextRequest) => {
  const sp = req.nextUrl.searchParams
  const format = sp.get('format') ?? 'json'
  const params = parseListParams(sp)

  if (format === 'json') {
    const res = await listAesthetics(params)
    return ok(res, { headers: { 'X-Total-Count': String(res.total) } })
  }

  if (!['ndjson', 'csv', 'md'].includes(format)) return fail(400, 'format must be json, ndjson, csv or md')
  // Full records are ~8 KB each; a serverless response is capped at 4.5 MB, so these formats are
  // paged (default and maximum 200 records), and a page is cut short if it would still exceed 4 MB.
  const limit = Math.min(FULL_PAGE, Math.max(1, Number(sp.get('pageSize') ?? sp.get('limit')) || FULL_PAGE))
  const offset = Math.max(0, Number(sp.get('offset')) || ((params.page ?? 1) - 1) * limit)
  const { rows: raws, total } = await listFullRows(params, offset, limit)
  const rows = raws.map(mapAestheticFull)
  const render = (rs: typeof rows) =>
    format === 'ndjson'
      ? rs.map((r) => JSON.stringify(r)).join('\n') + '\n'
      : format === 'csv'
        ? toCsv(rs as unknown as Record<string, unknown>[])
        : rs.map((r) => toMarkdown(r)).join('\n\n\n')
  let n = rows.length
  let body = render(rows)
  while (n > 1 && Buffer.byteLength(body) > MAX_BYTES) body = render(rows.slice(0, (n = Math.floor(n / 2))))
  const headers: Record<string, string> = { 'X-Total-Count': String(total), 'X-Offset': String(offset), 'X-Count': String(n) }
  if (offset + n < total) {
    const next = new URL(req.nextUrl)
    next.searchParams.delete('page')
    next.searchParams.set('offset', String(offset + n))
    next.searchParams.set('pageSize', String(limit))
    headers.Link = `<${next.pathname}${next.search}>; rel="next"`
  }
  if (format === 'csv') headers['Content-Disposition'] = 'attachment; filename="aesthetics.csv"'
  const type = { ndjson: 'application/x-ndjson', csv: 'text/csv', md: 'text/markdown' }[format as 'ndjson' | 'csv' | 'md']
  return raw(body, `${type}; charset=utf-8`, headers)
})
