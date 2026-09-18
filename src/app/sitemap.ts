import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/formats'
import { listIndex } from '@/lib/queries'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const index = await listIndex()
  const now = new Date()
  const pages = ['', '/aesthetics', '/timeline', '/discover', '/blend', '/data', '/about'].map((p) => ({
    url: `${SITE_URL}${p}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: p === '' ? 1 : 0.7,
  }))
  return [
    ...pages,
    ...index.map((a) => ({
      url: `${SITE_URL}/aesthetics/${a.slug}`,
      lastModified: new Date(a.updatedAt),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
      images: a.image ? [a.image] : undefined,
    })),
  ]
}
