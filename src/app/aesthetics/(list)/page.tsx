import type { Metadata } from 'next'
import { Suspense } from 'react'
import { BrowseView } from '@/components/views/browse'
import { BrowseFallback } from '@/components/views/browse-fallback'
import { getFacets, listAesthetics, parseListParams } from '@/lib/queries'
import { BROWSE_PAGE_SIZE } from '@/lib/browse'

export const metadata: Metadata = {
  title: 'Browse all aesthetics',
  description: 'Search and filter every aesthetic in the vault by category, type, region, era and status.',
  alternates: { canonical: '/aesthetics' },
}

export default async function BrowsePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams
  const p = new URLSearchParams()
  for (const [k, v] of Object.entries(sp)) {
    if (v === undefined || k === 'page') continue
    if (Array.isArray(v)) v.forEach((x) => p.append(k, x))
    else p.set(k, v)
  }
  const key = p.toString()
  const [facets, first] = await Promise.all([
    getFacets(),
    listAesthetics({ ...parseListParams(p), page: 1, pageSize: BROWSE_PAGE_SIZE, facets: false }),
  ])
  return (
    <Suspense fallback={<BrowseFallback first={first} facets={facets} category={p.get('category') ?? ''} />}>
      <BrowseView initialFacets={facets} initialFirst={first} initialKey={key} />
    </Suspense>
  )
}
