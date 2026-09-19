import { AIC_HEADERS, AIC_RELAY, upstreamUrl } from '@/lib/image-url'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { ImageResponse } from 'next/og'
import { periodLabel } from '@/components/aesthetic/card'
import { OG_SIZE, googleFont, inkOn } from '@/lib/og'
import { getAesthetic } from '@/lib/queries'
import { SITE_NAME } from '@/lib/site'

export const size = OG_SIZE
export const contentType = 'image/png'
export const revalidate = 86400
export const alt = `${SITE_NAME} record`

/** A record's share card, in its own palette: name, category, era and origin, summary, palette strip and hero image. */
/** The hero as Satori can load it: relayed images (src/lib/image-url.ts) are fetched from their
 *  source with the header it requires and embedded; anything unreachable leaves the card text-only. */
async function heroSrc(url: string | undefined): Promise<string | undefined> {
  if (!url || !url.startsWith(AIC_RELAY)) return url
  try {
    const res = await fetch(upstreamUrl(url), { headers: AIC_HEADERS, signal: AbortSignal.timeout(8000) })
    const type = res.headers.get('content-type') ?? ''
    if (!res.ok || !type.startsWith('image/')) return undefined
    return `data:${type};base64,${Buffer.from(await res.arrayBuffer()).toString('base64')}`
  } catch {
    return undefined
  }
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [d, logo] = await Promise.all([getAesthetic(slug), readFile(path.join(process.cwd(), 'public/brand/logo-on-dark.png')).catch(() => null)])
  const a = d?.aesthetic
  const name = a?.name ?? 'Not in the vault'
  const colors = (a?.colors ?? []).map((c) => c.hex).slice(0, 6)
  const accent = colors.find((c) => inkOn(c) === '#111') ?? '#e3bb6e'
  const hero = await heroSrc(a?.images[0]?.url)
  const meta = a ? [a.category, periodLabel(a), a.origin].filter(Boolean).join('  ·  ') : ''
  const summary = a ? (a.summary.length > 170 ? a.summary.slice(0, 167).replace(/\s+\S*$/, '') + '…' : a.summary) : ''
  const [serif, sans] = await Promise.all([googleFont('Instrument Serif', `${name}${SITE_NAME}`), googleFont('Geist', `${meta}${meta.toUpperCase()}${summary}…`)])
  const nameSize = name.length > 28 ? 64 : name.length > 16 ? 84 : 104
  return new ImageResponse(
    (
      <div style={{ display: 'flex', width: '100%', height: '100%', background: '#0b0b0c', color: '#f3f0ea', fontFamily: sans ? 'Sans' : undefined }}>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: hero ? 700 : 1200, padding: '56px 56px 0 64px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 26, color: '#cfc9bf' }}>
            {logo && <img src={`data:image/png;base64,${logo.toString('base64')}`} width={40} height={40} alt="" />}
            <span style={{ fontFamily: serif ? 'Serif' : undefined, fontSize: 30 }}>{SITE_NAME}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 20, letterSpacing: 3, textTransform: 'uppercase', color: accent }}>{meta}</span>
            <span style={{ fontFamily: serif ? 'Serif' : undefined, fontSize: nameSize, lineHeight: 1, marginTop: 14, letterSpacing: -1 }}>{name}</span>
            {summary && <span style={{ fontSize: 24, lineHeight: 1.35, color: '#b9b3a9', marginTop: 20 }}>{summary}</span>}
          </div>
          <div style={{ display: 'flex', height: 22, marginBottom: 0 }}>
            {(colors.length ? colors : ['#333']).map((c, i) => (
              <div key={`${c}-${i}`} style={{ flex: 1, background: c }} />
            ))}
          </div>
        </div>
        {hero && <img src={hero} width={500} height={630} alt="" style={{ objectFit: 'cover' }} />}
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
