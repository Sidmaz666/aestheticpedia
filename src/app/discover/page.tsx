import type { Metadata } from 'next'
import { Suspense } from 'react'
import { DiscoverView } from '@/components/views/discover'

export const metadata: Metadata = {
  title: 'Discover by palette',
  description: 'Find aesthetics by their measured palette — warm or cool, muted or vivid, dark or light, soft or high-contrast.',
  alternates: { canonical: '/discover' },
}

export default function DiscoverPage() {
  return (
    <Suspense>
      <DiscoverView />
    </Suspense>
  )
}
