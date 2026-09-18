import { notFound } from 'next/navigation'
import { AestheticArticle } from '@/components/aesthetic/article'
import { AestheticModal } from '@/components/aesthetic/modal'
import { getAesthetic, getSimilar } from '@/lib/queries'
import { themeFromPalette } from '@/lib/theme'

/** Intercepted route: opening an aesthetic from anywhere in the app shows it full-screen over the current page. */
export default async function AestheticOverlay({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const detail = await getAesthetic(slug)
  if (!detail) notFound()
  const a = detail.aesthetic
  const similar = await getSimilar(slug, a.category, 10)
  const theme = themeFromPalette(a.colors)
  return (
    <AestheticModal
      name={a.name}
      themeVars={theme?.vars ?? null}
      themeMode={theme?.mode ?? null}
      display={a.typePairing.display}
      body={a.typePairing.body}
    >
      <AestheticArticle detail={detail} similar={similar} mode="modal" />
    </AestheticModal>
  )
}
