import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { AestheticArticle } from '@/components/aesthetic/article'
import { resolveMaterials } from '@/lib/materials'
import { AestheticFonts } from '@/components/aesthetic/theme-scope'
import { toJsonLd } from '@/lib/formats'
import { SITE_NAME, SITE_URL } from '@/lib/site'
import { getAesthetic, getLineage, getLinksAmong, getSimilar } from '@/lib/queries'
import { themeCss, themeFromPalette } from '@/lib/theme'

export const revalidate = 3600
export const dynamicParams = true
export function generateStaticParams() {
  return [] // rendered on first request, then cached (ISR)
}

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const d = await getAesthetic(slug)
  // Resolving this before the page streams lets crawlers get a real 404 status.
  if (!d) notFound()
  const a = d.aesthetic
  // A search-snippet-sized description, cut at a word.
  const raw = (a.summary || a.description).replace(/s+/g, ' ').trim()
  const description = raw.length > 158 ? raw.slice(0, 155).replace(/s+S*$/, '') + '…' : raw
  return {
    title: `${a.name} — ${a.category}`,
    description,
    keywords: [a.name, ...a.aliases, a.category, ...a.tags].slice(0, 16),
    alternates: {
      canonical: `/aesthetics/${slug}`,
      types: { 'application/json': `/api/v1/aesthetics/${slug}`, 'text/markdown': `/api/v1/aesthetics/${slug}.md` },
    },
    // The share image is generated per record (opengraph-image.tsx next to this page).
    openGraph: {
      type: 'article',
      title: `${a.name} — ${SITE_NAME}`,
      description,
      url: `${SITE_URL}/aesthetics/${slug}`,
      section: a.category,
      tags: a.tags.slice(0, 8),
      modifiedTime: a.updatedAt,
    },
    twitter: { card: 'summary_large_image', title: a.name, description },
    other: a.colors[0] ? { 'theme-color': a.colors[0].hex } : undefined,
  }
}

export default async function AestheticPage({ params }: Props) {
  const { slug } = await params
  const detail = await getAesthetic(slug)
  if (!detail) notFound()
  const a = detail.aesthetic
  const neighbours = [...detail.relations.outgoing.map((r) => r.target.slug), ...detail.relations.incoming.map((r) => r.source.slug)]
  const [similar, lineage, among] = await Promise.all([getSimilar(slug, a.category, 10), getLineage(slug), getLinksAmong(neighbours)])
  const theme = themeFromPalette(a.colors, a.metrics?.contrast)

  return (
    <>
      {/* The whole site takes on this aesthetic while its page is open. */}
      {theme && <style href={`ae-theme-${slug}`} precedence="high">{themeCss(theme, 'html:root')}</style>}
      <AestheticFonts display={a.typePairing.display} body={a.typePairing.body} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(toJsonLd(a)) }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: SITE_NAME, item: SITE_URL },
              { '@type': 'ListItem', position: 2, name: 'Aesthetics', item: `${SITE_URL}/aesthetics` },
              { '@type': 'ListItem', position: 3, name: a.category, item: `${SITE_URL}/aesthetics?category=${encodeURIComponent(a.category)}` },
              { '@type': 'ListItem', position: 4, name: a.name, item: `${SITE_URL}/aesthetics/${slug}` },
            ],
          }),
        }}
      />
      <AestheticArticle detail={detail} similar={similar} lineage={lineage} among={among} mode="page" materialPhotos={resolveMaterials(detail.aesthetic)} />
    </>
  )
}
