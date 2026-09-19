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
  if (!d) return { title: 'Not found' }
  const a = d.aesthetic
  const image = a.images[0]
  return {
    title: a.name,
    description: a.summary || a.description.slice(0, 180),
    alternates: {
      canonical: `/aesthetics/${slug}`,
      types: { 'application/json': `/api/v1/aesthetics/${slug}`, 'text/markdown': `/api/v1/aesthetics/${slug}.md` },
    },
    openGraph: {
      type: 'article',
      title: `${a.name} — ${SITE_NAME}`,
      description: a.summary,
      url: `${SITE_URL}/aesthetics/${slug}`,
      images: image ? [{ url: image.url, alt: image.caption }] : undefined,
    },
    twitter: { card: 'summary_large_image', title: a.name, description: a.summary, images: image ? [image.url] : undefined },
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
      <AestheticArticle detail={detail} similar={similar} lineage={lineage} among={among} mode="page" materialPhotos={resolveMaterials(detail.aesthetic)} />
    </>
  )
}
