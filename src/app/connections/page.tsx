import type { Metadata } from 'next'
import { ConnectionsView } from '@/components/views/connections'
import { getGraph } from '@/lib/queries'

export const revalidate = 3600
export const metadata: Metadata = {
  title: 'Connections — the network of aesthetics',
  description: 'An interactive network of how aesthetics influence, vary and react against one another.',
  alternates: { canonical: '/connections' },
}

export default async function ConnectionsPage() {
  const { nodes, links } = await getGraph()
  return <ConnectionsView nodes={nodes} links={links} />
}
