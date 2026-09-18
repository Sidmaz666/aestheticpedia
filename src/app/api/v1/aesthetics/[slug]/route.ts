import type { NextRequest } from 'next/server'
import { fail, handle, ok, options, raw } from '@/lib/api'
import { EXPORT_FORMATS, renderFormat } from '@/lib/formats'
import { getAesthetic, getSimilar } from '@/lib/queries'

export const dynamic = 'force-dynamic'
export const OPTIONS = options

/**
 * GET /api/v1/aesthetics/{slug}            full record + relations + similar
 * GET /api/v1/aesthetics/{slug}?format=md  any export format (see /api/v1/formats)
 * A file extension on the slug works too: /api/v1/aesthetics/bauhaus.md
 */
export const GET = handle(
  'get aesthetic',
  async (req: NextRequest, ctx: { params: Promise<{ slug: string }> }) => {
    let { slug } = await ctx.params
    let format = req.nextUrl.searchParams.get('format') ?? ''
    const dot = slug.indexOf('.')
    if (dot > 0) {
      const ext = slug.slice(dot + 1)
      slug = slug.slice(0, dot)
      format ||= EXPORT_FORMATS.find((f) => f.id === ext || f.ext === ext)?.id ?? ext
    }

    const detail = await getAesthetic(slug)
    if (!detail) return fail(404, `No aesthetic with slug "${slug}"`)

    if (!format || format === 'full') {
      const similar = await getSimilar(slug, detail.aesthetic.category, 8)
      return ok({ ...detail, similar })
    }

    const out = renderFormat(format, detail.aesthetic, detail.relations)
    if (!out) return fail(400, `Unknown format "${format}"`, { formats: EXPORT_FORMATS.map((f) => f.id) })
    const download = req.nextUrl.searchParams.get('download') === '1'
    return raw(out.body as BodyInit, out.mime, {
      ...(download ? { 'Content-Disposition': `attachment; filename="${slug}.${out.ext}"` } : {}),
      Link: `</aesthetics/${slug}>; rel="canonical"`,
    })
  }
)
