'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { RotateCw } from 'lucide-react'
import { REPO_URL } from '@/lib/site'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])
  const issue = REPO_URL
    ? `${REPO_URL}/issues/new?${new URLSearchParams({ title: `Error on ${typeof location === 'undefined' ? '' : location.pathname}`, body: `Digest: ${error.digest ?? 'n/a'}\n\nWhat were you doing?\n` })}`
    : ''
  return (
    <main className="mx-auto flex min-h-[70svh] max-w-2xl flex-col items-center justify-center px-4 text-center">
      <p className="eyebrow">Something broke</p>
      <h1 className="display mt-4 text-5xl sm:text-7xl">The vault jammed.</h1>
      <p className="mt-4 text-fg-muted">An unexpected error stopped this page from loading. Trying again usually fixes it.</p>
      {error.digest && <p className="mt-3 font-mono text-xs text-fg-subtle">Reference: {error.digest}</p>}
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button type="button" onClick={reset} className="inline-flex h-11 items-center gap-2 rounded-full bg-fg px-6 text-sm font-medium text-bg hover:opacity-90">
          <RotateCw className="size-4" aria-hidden /> Try again
        </button>
        <Link href="/" className="inline-flex h-11 items-center rounded-full border border-line-strong px-6 text-sm text-fg-muted hover:text-fg">
          Home
        </Link>
        {issue && (
          <a href={issue} target="_blank" rel="noopener noreferrer" className="inline-flex h-11 items-center rounded-full border border-line-strong px-6 text-sm text-fg-muted hover:text-fg">
            Report it
          </a>
        )}
      </div>
    </main>
  )
}
