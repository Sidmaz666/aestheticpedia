import Link from 'next/link'
import { ArrowRight, Bot, Braces, Database, GitPullRequest } from 'lucide-react'
import { AestheticCard } from '@/components/aesthetic/card'
import { HeroWall } from '@/components/site/hero-wall'
import { SearchTrigger } from '@/components/site/search-trigger'
import { getCategoryOverview, getShowcase, getStats } from '@/lib/queries'
import { CONTRIBUTING_URL, SITE_TAGLINE } from '@/lib/site'
import { Carousel } from '@/components/ui/carousel'

export const revalidate = 3600

export default async function Home() {
  const [stats, showcase, categories] = await Promise.all([getStats(), getShowcase(36), getCategoryOverview()])
  const wall = showcase.filter((s) => s.image)
  const fmt = (n: number) => n.toLocaleString('en')

  return (
    <main>
      {/* ---------- Hero ---------- */}
      <section className="relative -mt-16 overflow-hidden pt-16">
        <HeroWall images={wall.map((w) => w.image!)} />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,var(--bg)_0%,color-mix(in_oklab,var(--bg)_85%,transparent)_45%,color-mix(in_oklab,var(--bg)_40%,transparent)_100%)]" aria-hidden />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-48 bg-gradient-to-t from-bg to-transparent" aria-hidden />

        <div className="mx-auto flex min-h-[92svh] max-w-[1600px] flex-col items-center justify-center px-4 py-24 text-center sm:px-6 lg:px-10">
          <p className="eyebrow animate-fade-up">{SITE_TAGLINE}</p>
          <h1 data-split className="display mt-6 max-w-5xl animate-fade-up text-[clamp(3.4rem,9vw,8.5rem)] [animation-delay:80ms]">
            Every way we have seen <em className="not-italic text-accent">and felt</em> the world
          </h1>
          <p className="mt-6 max-w-2xl animate-fade-up text-lg leading-relaxed text-fg-muted [animation-delay:160ms]">
            {fmt(stats.total)} aesthetics — from Nok terracotta to vaporwave — documented with real images, palettes,
            sources and relationships. Free to read, free to reuse, open to contributions.
          </p>
          <div className="mt-10 flex w-full max-w-xl animate-fade-up flex-col gap-3 [animation-delay:240ms] sm:flex-row">
            <SearchTrigger total={stats.total} />
            <Link
              href="/aesthetics"
              className="flex h-14 items-center justify-center gap-2 rounded-full bg-fg px-7 text-sm font-medium text-bg transition-opacity hover:opacity-90"
            >
              Browse all <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
          <dl className="mt-16 grid w-full max-w-3xl animate-fade-up grid-cols-2 gap-6 [animation-delay:320ms] sm:grid-cols-4">
            {[
              ['Aesthetics', stats.total],
              ['Images', stats.images],
              ['Categories', stats.byCategory.length],
              ['Connections', stats.relations],
            ].map(([k, v]) => (
              <div key={k as string}>
                <dt className="eyebrow">{k}</dt>
                <dd className="display mt-1 text-4xl sm:text-5xl" data-count={v as number}>
                  {fmt(v as number)}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ---------- Categories ---------- */}
      <section className="mx-auto max-w-[1600px] px-4 pt-16 sm:px-6 lg:px-10" aria-labelledby="cat-title">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Index</p>
            <h2 id="cat-title" className="display mt-2 text-5xl sm:text-6xl">Browse by category</h2>
          </div>
          <Link href="/aesthetics" className="text-sm text-fg-muted hover:text-fg">
            All {fmt(stats.total)} records →
          </Link>
        </div>
        <ul data-reveal-group className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {categories.map((c) => (
            <li key={c.name}>
              <Link
                href={`/aesthetics?category=${encodeURIComponent(c.name)}`}
                className="group relative block aspect-[4/5] overflow-hidden rounded-xl bg-surface-2 ring-1 ring-inset ring-line"
              >
                {c.image && (
                  <img
                    src={c.image}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                    className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                )}
                <span className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <span className="absolute inset-x-0 bottom-0 p-3.5">
                  <span className="display block text-xl leading-tight text-white sm:text-2xl">{c.name}</span>
                  <span className="mt-1 block font-mono text-[11px] text-white/70">{fmt(c.count)} records</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* ---------- Featured ---------- */}
      <section className="pt-24" aria-labelledby="featured-title">
        <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-10">
          <Carousel
            label="From the vault"
            slideClassName="w-64 sm:w-72"
            title={
              <>
                <p className="eyebrow">Selected</p>
                <h2 id="featured-title" className="display mt-2 text-5xl sm:text-6xl">From the vault</h2>
              </>
            }
          >
            {showcase.slice(0, 18).map((a, i) => (
              <AestheticCard key={a.slug} a={a} variant="rail" priority={i < 4} />
            ))}
          </Carousel>
        </div>
      </section>

      {/* ---------- Ways in ---------- */}
      <section data-reveal-group className="mx-auto grid max-w-[1600px] gap-4 px-4 pt-24 sm:px-6 md:grid-cols-3 lg:px-10">
        {[
          { href: '/timeline', title: 'Timeline', text: 'Walk from prehistoric craft to post-internet style, era by era.' },
          { href: '/discover', title: 'Discover', text: 'Describe a feeling — minimal, warm, loud, nostalgic — and find the aesthetics that match.' },
          { href: '/blend', title: 'Blend', text: 'Cross two documented aesthetics into a speculative hybrid palette and brief.' },
        ].map((c) => (
          <Link key={c.href} href={c.href} className="group rounded-2xl border border-line bg-surface p-8 transition-colors hover:border-line-strong">
            <h3 className="display text-4xl">{c.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-fg-muted">{c.text}</p>
            <ArrowRight className="mt-8 size-5 text-fg-subtle transition-transform group-hover:translate-x-1 group-hover:text-accent" aria-hidden />
          </Link>
        ))}
      </section>

      {/* ---------- Open by design ---------- */}
      <section className="mx-auto max-w-[1600px] px-4 pt-24 sm:px-6 lg:px-10" aria-labelledby="open-title">
        <div data-reveal className="grid gap-10 rounded-3xl border border-line bg-surface p-8 sm:p-12 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <p className="eyebrow">Open by design</p>
            <h2 id="open-title" className="display mt-2 text-5xl sm:text-6xl">Built to be reused — by people and by machines.</h2>
            <p className="mt-5 max-w-lg text-fg-muted">
              Every record is a plain JSON file on GitHub. The full library downloads as JSON, CSV, Parquet or a DuckDB
              database; a free REST API and an MCP server let apps and AI assistants search it directly.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/data" className="flex h-11 items-center gap-2 rounded-full bg-fg px-5 text-sm font-medium text-bg hover:opacity-90">
                Data & API <ArrowRight className="size-4" aria-hidden />
              </Link>
              <a
                href={CONTRIBUTING_URL || '/about'}
                className="flex h-11 items-center gap-2 rounded-full border border-line-strong px-5 text-sm text-fg-muted hover:text-fg"
              >
                <GitPullRequest className="size-4" aria-hidden /> Contribute
              </a>
            </div>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {[
              { icon: Database, title: 'Full downloads', text: 'JSON · NDJSON · CSV · Parquet · DuckDB, with checksums.' },
              { icon: Braces, title: 'REST API', text: 'Search, filter and export any record in 16 formats. OpenAPI 3.1.' },
              { icon: Bot, title: 'MCP server', text: 'Plug the vault into Claude and other AI assistants.' },
              { icon: GitPullRequest, title: 'One file per aesthetic', text: 'Add or fix a record with a pull request; CI validates it.' },
            ].map((f) => (
              <li key={f.title} className="rounded-2xl border border-line bg-bg p-5">
                <f.icon className="size-5 text-accent" aria-hidden />
                <p className="mt-4 font-medium">{f.title}</p>
                <p className="mt-1 text-sm text-fg-subtle">{f.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  )
}
