'use client'

import dynamic from 'next/dynamic'
import { useState, useSyncExternalStore } from 'react'
import { Loader2 } from 'lucide-react'
import type { GraphLink, GraphNode } from '@/lib/queries'
import { GraphView } from './graph'

// three.js is only downloaded on this page, and only for the 3D view.
const Graph3DView = dynamic(() => import('./graph3d').then((m) => m.Graph3DView), {
  ssr: false,
  loading: () => (
    <div role="status" className="relative grid h-full place-items-center text-sm text-fg-subtle">
      <span className="shimmer absolute inset-0 bg-surface-2 opacity-40" aria-hidden />
      <span className="relative flex items-center gap-2">
        <Loader2 className="size-4 animate-spin" aria-hidden /> Building the 3D network…
      </span>
    </div>
  ),
})

const noop = () => () => {}
const hasWebGL = () => {
  try {
    return !!document.createElement('canvas').getContext('webgl2')
  } catch {
    return false
  }
}

/** Connections page: 3D network by default (WebGL), 2D map as fallback or on request. */
export function ConnectionsView({ nodes, links }: { nodes: GraphNode[]; links: GraphLink[] }) {
  const webgl = useSyncExternalStore(noop, hasWebGL, () => true)
  const [mode, setMode] = useState<'3d' | '2d' | null>(null)
  const current = mode ?? (webgl ? '3d' : '2d')
  if (current === '2d') return <GraphView nodes={nodes} links={links} onSwitch3D={webgl ? () => setMode('3d') : undefined} />
  return (
    <main className="relative h-[calc(100svh-4rem)] overflow-hidden">
      <Graph3DView nodes={nodes} links={links} onSwitch2D={() => setMode('2d')} />
    </main>
  )
}
