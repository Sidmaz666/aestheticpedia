import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { SearchTrigger } from '@/components/site/search-trigger'
import { LostSuggestions } from '@/components/site/lost-suggestions'
import { getShowcase } from '@/lib/queries'
import { CONTRIBUTING_URL } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Not found',
  description: 'This page or aesthetic isn’t in the vault — yet.',
  robots: { index: false, follow: true },
}

export default async function NotFound() {
  const showcase = await getShowcase(10).catch(() => [])
  const images = showcase.filter((s) => s.image).slice(0, 5)
  return (
    <main className="relative isolate flex min-h-[80svh] flex-col items-center overflow-hidden px-4 pb-20 pt-16 text-center">
      {/* A faint strip of real vault images behind the message. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 flex h-64 gap-3 opacity-25 [mask-image:linear-gradient(to_bottom,black,transparent)]" aria-hidden>
        {images.map((s) => (
          <img key={s.slug} src={s.image!} alt="" loading="lazy" referrerPolicy="no-referrer" className="h-full min-w-0 flex-1 object-cover" />
        ))}
      </div>
      <div className="mx-auto flex w-full max-w-2xl flex-col items-center pt-24">
        <p className="eyebrow">404 · Not in the vault</p>
        <h1 className="display mt-4 text-6xl sm:text-8xl">
          This lens is <em className="not-italic text-accent">missing</em>.
        </h1>
        <p className="mt-5 max-w-lg text-lg text-fg-muted">
          The page or aesthetic you were after isn’t here — it may have moved, or it hasn’t been documented yet.
        </p>
        <div className="mt-10 flex w-full max-w-xl flex-col gap-3 sm:flex-row">
          <SearchTrigger />
          <Link href="/aesthetics" className="flex h-14 items-center justify-center gap-2 rounded-full bg-fg px-7 text-sm font-medium text-bg transition-opacity hover:opacity-90">
            Browse all <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
        <LostSuggestions />
        <p className="mt-10 text-sm text-fg-subtle">
          Think it belongs here?{' '}
          <a href={CONTRIBUTING_URL || '/about'} className="link-underline text-fg-muted">
            Contribute it
          </a>{' '}
          — every record is one JSON file.
        </p>
      </div>
    </main>
  )
}
