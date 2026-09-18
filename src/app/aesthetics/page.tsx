import type { Metadata } from 'next'
import { Suspense } from 'react'
import { BrowseView } from '@/components/views/browse'
import { getFacets } from '@/lib/queries'

export const metadata: Metadata = {
  title: 'Browse all aesthetics',
  description: 'Search and filter every aesthetic in the vault by category, type, region, era and status.',
  alternates: { canonical: '/aesthetics' },
}

export default async function BrowsePage() {
  const facets = await getFacets()
  return (
    <Suspense>
      <BrowseView initialFacets={facets} />
    </Suspense>
  )
}
