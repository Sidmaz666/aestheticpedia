import type { Metadata } from 'next'
import { TimelineView } from '@/components/views/timeline'
import { getTimeline } from '@/lib/queries'

export const revalidate = 3600
export const metadata: Metadata = {
  title: 'Timeline of aesthetics',
  description: 'Every dated aesthetic from antiquity to the 2020s, era by era.',
  alternates: { canonical: '/timeline' },
}

export default async function TimelinePage() {
  const { items } = await getTimeline()
  // Only what the view renders — keeps the page payload small.
  const slim = items.map((i) => ({ slug: i.slug, name: i.name, category: i.category, startYear: i.startYear, image: i.image, colors: i.colors.slice(0, 3) }))
  return <TimelineView items={slim} />
}
