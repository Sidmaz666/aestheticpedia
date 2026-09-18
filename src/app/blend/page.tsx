import type { Metadata } from 'next'
import { Suspense } from 'react'
import { BlendView } from '@/components/views/blend'

export const metadata: Metadata = {
  title: 'Blend two aesthetics',
  description: 'Cross two documented aesthetics into a speculative palette and design brief.',
  alternates: { canonical: '/blend' },
}

export default function BlendPage() {
  return (
    <Suspense>
      <BlendView />
    </Suspense>
  )
}
