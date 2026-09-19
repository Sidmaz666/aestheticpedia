import { AIC_HEADERS, AIC_IIIF, AIC_PATH } from '@/lib/image-url'

/**
 * GET /api/img/aic/{id}/full/{843|400|1686|200},/0/default.jpg — an Art Institute of Chicago
 * open-access (CC0) image, fetched with the AIC-User-Agent header that its IIIF server requires
 * (see src/lib/image-url.ts). Only IIIF image paths are accepted; responses are cached for a year
 * at the edge, so each image is fetched from AIC once.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const path = (await params).path.join('/')
  if (!AIC_PATH.test(path)) return new Response('Not found', { status: 404 })
  let res: Response
  try {
    res = await fetch(AIC_IIIF + path, { headers: AIC_HEADERS, signal: AbortSignal.timeout(15_000) })
  } catch {
    return new Response('Upstream unavailable', { status: 504, headers: { 'Cache-Control': 'no-store' } })
  }
  const type = res.headers.get('content-type') ?? ''
  if (!res.ok || !type.startsWith('image/')) {
    return new Response('Image unavailable', { status: res.status === 404 ? 404 : 502, headers: { 'Cache-Control': 'public, max-age=300' } })
  }
  return new Response(res.body, {
    headers: {
      'Content-Type': type,
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Access-Control-Allow-Origin': '*',
      'X-Image-Source': 'Art Institute of Chicago (CC0)',
    },
  })
}
