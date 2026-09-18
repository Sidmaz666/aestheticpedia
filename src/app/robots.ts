import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/formats'

// Open to search engines and AI crawlers alike — the content is openly licensed.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/api/mcp'] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
