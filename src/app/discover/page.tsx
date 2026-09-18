import type { Metadata } from 'next'
import { Suspense } from 'react'
import { DiscoverView } from '@/components/views/discover'

export const metadata: Metadata = {
  title: 'Discover by style profile',
  description: 'Find aesthetics by feel — minimal or maximal, warm or cold, quiet or loud, nostalgic or futuristic.',
  alternates: { canonical: '/discover' },
}

export default function DiscoverPage() {
  return (
    <Suspense>
      <DiscoverView />
    </Suspense>
  )
}
