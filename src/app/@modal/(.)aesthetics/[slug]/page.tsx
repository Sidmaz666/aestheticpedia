import { notFound } from 'next/navigation'
import { AestheticArticle } from '@/components/aesthetic/article'
import { resolveMaterials } from '@/lib/materials'
import { AestheticModal } from '@/components/aesthetic/modal'
import { getAesthetic, getLineage, getLinksAmong, getSimilar } from '@/lib/queries'
import { themeFromPalette } from '@/lib/theme'

/** Intercepted route: opening an aesthetic from anywhere in the app shows it full-screen over the current page. */
export default async function AestheticOverlay({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const detail = await getAesthetic(slug)
  if (!detail) notFound()
  const a = detail.aesthetic
  const neighbours = [...detail.relations.outgoing.map((r) => r.target.slug), ...detail.relations.incoming.map((r) => r.source.slug)]
  const [similar, lineage, among] = await Promise.all([getSimilar(slug, a.category, 10), getLineage(slug), getLinksAmong(neighbours)])
  const theme = themeFromPalette(a.colors, a.metrics?.contrast)
  return (
    <AestheticModal
      name={a.name}
      themeVars={theme?.vars ?? null}
      themeMode={theme?.mode ?? null}
      display={a.typePairing.display}
      body={a.typePairing.body}
    >
      <AestheticArticle detail={detail} similar={similar} lineage={lineage} among={among} mode="modal" materialPhotos={resolveMaterials(detail.aesthetic)} />
    </AestheticModal>
  )
}
