import Link from 'next/link'
import { CONTRIBUTING_URL } from '@/lib/site'

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[70svh] max-w-3xl flex-col items-center justify-center px-4 text-center">
      <p className="eyebrow">404</p>
      <h1 className="display mt-3 text-6xl sm:text-7xl">Not in the vault — yet.</h1>
      <p className="mt-4 text-fg-muted">This page or aesthetic doesn’t exist. Search for it, or contribute it.</p>
      <div className="mt-8 flex gap-3">
        <Link href="/aesthetics" className="rounded-full bg-fg px-5 py-2.5 text-sm text-bg">
          Browse aesthetics
        </Link>
        <a href={CONTRIBUTING_URL || '/about'} className="rounded-full border border-line-strong px-5 py-2.5 text-sm text-fg-muted hover:text-fg">
          Contribute
        </a>
      </div>
    </main>
  )
}
