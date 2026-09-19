import type { MetadataRoute } from 'next'
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE } from '@/lib/site'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME} — ${SITE_TAGLINE}`,
    short_name: SITE_NAME,
    description: SITE_DESCRIPTION,
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#0b0b0c',
    theme_color: '#0b0b0c',
    categories: ['education', 'reference', 'design'],
    icons: [
      { src: '/icon.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcuts: [
      { name: 'Browse aesthetics', url: '/aesthetics' },
      { name: 'Discover by mood and palette', url: '/discover' },
      { name: 'Blend two aesthetics', url: '/blend' },
    ],
  }
}
