import type { MetadataRoute } from 'next'
import { INDEXABLE, SITE_URL } from '@/lib/site'

// Production: open to search engines and AI crawlers alike — the content is openly licensed.
// Preview and development deployments: closed, so they never compete with the real site.
export default function robots(): MetadataRoute.Robots {
  if (!INDEXABLE) return { rules: [{ userAgent: '*', disallow: '/' }] }
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/api/v1/openapi.json', '/llms.txt'],
        // JSON endpoints, the MCP transport and per-record export downloads are for programs, not the index.
        disallow: ['/api/', '/*?*format=', '/*?*download='],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
