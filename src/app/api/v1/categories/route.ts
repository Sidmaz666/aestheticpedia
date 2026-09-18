import { handle, ok, options } from '@/lib/api'
import { getCategoryOverview, getFacets } from '@/lib/queries'

export const dynamic = 'force-dynamic'
export const OPTIONS = options

/** GET /api/v1/categories — categories (with cover image) plus every filter facet. */
export const GET = handle('categories', async () => {
  const [categories, facets] = await Promise.all([getCategoryOverview(), getFacets()])
  return ok({ categories, facets })
})
