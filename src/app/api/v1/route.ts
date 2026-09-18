import { API_VERSION, ok, options } from '@/lib/api'
import { SITE_NAME, SITE_URL } from '@/lib/site'

export const OPTIONS = options

/** GET /api/v1 — API index. */
export function GET() {
  return ok({
    name: `${SITE_NAME} API`,
    version: API_VERSION,
    docs: `${SITE_URL}/data`,
    openapi: `${SITE_URL}/api/v1/openapi.json`,
    mcp: `${SITE_URL}/api/mcp`,
    llms: `${SITE_URL}/llms.txt`,
    downloads: `${SITE_URL}/data/manifest.json`,
    endpoints: {
      list: '/api/v1/aesthetics?q=&category=&type=&status=&era=&region=&tag=&images=&sort=&page=&pageSize=&format=json|ndjson|csv|md',
      get: '/api/v1/aesthetics/{slug}?format=json|md|txt|html|jsonld|yaml|csv|css|scss|tailwind|tokens|gpl|ase|svg|bib|ris',
      search: '/api/v1/search?q=',
      random: '/api/v1/random?mode=illustrated|any|niche|reviewed',
      timeline: '/api/v1/timeline',
      discover: '/api/v1/discover?dims=warmth:80,saturation:30',
      blend: '/api/v1/blend?a=&b=',
      compare: '/api/v1/compare?slugs=a,b',
      categories: '/api/v1/categories',
      stats: '/api/v1/stats',
      formats: '/api/v1/formats',
    },
    license: 'Text CC BY-SA 4.0; images carry individual licenses (see each image object).',
  })
}
