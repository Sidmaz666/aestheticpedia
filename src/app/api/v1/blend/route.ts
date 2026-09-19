import type { NextRequest } from 'next/server'
import { fail, handle, ok, options } from '@/lib/api'
import type { HybridResponse } from '@/lib/aesthetic'
import { synthesize } from '@/lib/blend'
import { paletteMetrics } from '@/lib/palette-metrics'
import { blendRecord } from '@/lib/blend-record'
import { resolveMaterials } from '@/lib/materials'
import { EXPORT_FORMATS, renderFormat } from '@/lib/formats'
import { raw } from '@/lib/api'
import { getAesthetic } from '@/lib/queries'

export const dynamic = 'force-dynamic'
export const OPTIONS = options

async function blend(a?: string | null, b?: string | null, format?: string | null, download = false) {
  if (!a || !b) return fail(400, 'Provide two slugs: ?a=…&b=… (or POST { a, b })')
  if (a === b) return fail(400, 'Pick two different aesthetics')
  const [A, B] = await Promise.all([getAesthetic(a), getAesthetic(b)])
  if (!A || !B) return fail(404, `No aesthetic with slug "${!A ? a : b}"`)
  const hybrid = synthesize(A.aesthetic, B.aesthetic)
  const record = blendRecord(A.aesthetic, B.aesthetic, hybrid)
  if (format && format !== 'json-full') {
    const out = renderFormat(format, record, { outgoing: [A, B].map((d) => ({ type: 'hybrid_of', note: 'Parent of this blend', target: { slug: d.aesthetic.slug, name: d.aesthetic.name, category: d.aesthetic.category } })), incoming: [] })
    if (!out) return fail(400, `Unknown format "${format}"`, { formats: EXPORT_FORMATS.map((f) => f.id) })
    return raw(out.body as BodyInit, out.mime, download ? { 'Content-Disposition': `attachment; filename="${record.slug}.${out.ext}"` } : {})
  }
  const res: HybridResponse = {
    hybrid,
    metrics: paletteMetrics(hybrid.palette ?? []),
    record,
    materialPhotos: resolveMaterials(record),
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
  blend(req.nextUrl.searchParams.get('a'), req.nextUrl.searchParams.get('b'), req.nextUrl.searchParams.get('format'), req.nextUrl.searchParams.get('download') === '1')
)

export const POST = handle('blend', async (req: NextRequest) => {
  const body = (await req.json().catch(() => null)) as { a?: string; b?: string } | null
  return blend(body?.a?.trim(), body?.b?.trim())
})
