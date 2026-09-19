import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { ImageResponse } from 'next/og'
import { compact } from '@/lib/format'
import { OG_SIZE, googleFont } from '@/lib/og'
import { getShowcase, getStats } from '@/lib/queries'
import { SITE_NAME, SITE_TAGLINE } from '@/lib/site'

export const alt = `${SITE_NAME} — ${SITE_TAGLINE}`
export const size = OG_SIZE
export const contentType = 'image/png'
export const revalidate = 86400

/** The site's share card: wordmark, headline, live counts and a mosaic of real vault images. */
const counts_text = (s: { total: number; images: number; relations: number }) =>
  `${compact(s.total)}${compact(s.images)}${compact(s.relations)}AESTHETICSIMAGESCONNECTIONSaestheticsimagesconnections`

export default async function Image() {
  const [stats, showcase, logo] = await Promise.all([
    getStats(),
    getShowcase(12),
    readFile(path.join(process.cwd(), 'public/brand/logo-on-dark.png')).catch(() => null),
  ])
  const images = showcase.map((s) => s.image).filter(Boolean).slice(0, 6) as string[]
  const headline = 'Every lens we have for looking at the world'
  const labels = counts_text(stats)
  const [serif, sans] = await Promise.all([googleFont('Instrument Serif', `${headline}${SITE_NAME}`), googleFont('Geist', labels)])
  const counts: [string, number][] = [
    ['aesthetics', stats.total],
    ['images', stats.images],
    ['connections', stats.relations],
  ]
  return new ImageResponse(
    (
      <div style={{ display: 'flex', width: '100%', height: '100%', background: '#0b0b0c', color: '#f3f0ea', fontFamily: sans ? 'Sans' : undefined }}>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: 690, padding: '64px 56px 56px 64px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {logo && <img src={`data:image/png;base64,${logo.toString('base64')}`} width={52} height={52} alt="" />}
            <span style={{ fontFamily: serif ? 'Serif' : undefined, fontSize: 40 }}>{SITE_NAME}</span>
          </div>
          <div style={{ display: 'flex', fontFamily: serif ? 'Serif' : undefined, fontSize: 78, lineHeight: 0.98, letterSpacing: -1.5 }}>{headline}</div>
          <div style={{ display: 'flex', gap: 36, fontSize: 22, color: '#a8a39a' }}>
            {counts.map(([label, n]) => (
              <div key={label} style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: 40, color: '#e3bb6e' }}>{compact(n)}</span>
                <span style={{ textTransform: 'uppercase', letterSpacing: 3, fontSize: 16 }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', width: 510, height: 630, gap: 8, padding: 8 }}>
          {images.map((src) => (
            <img key={src} src={src} width={243} height={197} alt="" style={{ objectFit: 'cover', borderRadius: 14 }} />
          ))}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        ...(sans ? [{ name: 'Sans', data: sans, style: 'normal' as const, weight: 400 as const }] : []),
        ...(serif ? [{ name: 'Serif', data: serif, style: 'normal' as const, weight: 400 as const }] : []),
      ],
    }
  )
}
