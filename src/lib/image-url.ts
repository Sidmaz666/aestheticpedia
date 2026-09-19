// Images from the Art Institute of Chicago (CC0, IIIF) are served only to clients that identify
// themselves with an AIC-User-Agent header (https://api.artic.edu/docs/#introduction); anything
// else, including every browser <img> request, gets a challenge page. The site therefore serves
// them through its own relay, /api/img/aic/… (src/app/api/img/aic/[...path]/route.ts), which adds
// the header. The store rewrites the URLs once when it loads the data (src/lib/store.ts); the raw
// downloads in /data keep the original addresses.
import { SITE_URL } from '@/lib/site'

export const AIC_IIIF = 'https://www.artic.edu/iiif/2/'
export const AIC_RELAY = '/api/img/aic/'
export const AIC_HEADERS: Record<string, string> = {
  'AIC-User-Agent': `Aestheticpedia (${process.env.NEXT_PUBLIC_REPO_URL || SITE_URL})`,
  'User-Agent': `Aestheticpedia/1.0 (${process.env.NEXT_PUBLIC_REPO_URL || SITE_URL})`,
}
/** The IIIF paths the relay serves: one image id at the sizes the records use. */
export const AIC_PATH = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/full\/(200|400|843|1686),\/0\/default\.jpg$/

/** An image address the site can render: absolute http(s), or one of its own relayed images. */
export const isImageUrl = (u: unknown): u is string => typeof u === 'string' && (/^https?:\/\//.test(u) || u.startsWith(AIC_RELAY))

/** Absolute form, for exports, feeds and sitemaps read outside the site. */
export const absoluteUrl = (u: string) => (u.startsWith('/') ? `${SITE_URL}${u}` : u)

/** The original address of a relayed image (for server-side fetches that can send the header). */
export const upstreamUrl = (u: string) => (u.startsWith(AIC_RELAY) ? AIC_IIIF + u.slice(AIC_RELAY.length) : u)
