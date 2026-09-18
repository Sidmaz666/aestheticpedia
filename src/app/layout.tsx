import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono, Instrument_Serif } from 'next/font/google'
import type { ReactNode } from 'react'
import './globals.css'
import { Providers } from '@/components/providers'
import { SiteFooter } from '@/components/site/footer'
import { SiteHeader } from '@/components/site/header'
import { SITE_URL } from '@/lib/formats'

const geist = Geist({ variable: '--font-geist', subsets: ['latin'], display: 'swap' })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'], display: 'swap' })
const display = Instrument_Serif({
  variable: '--font-instrument',
  subsets: ['latin', 'latin-ext'],
  weight: '400',
  style: ['normal', 'italic'],
  display: 'swap',
})

const description =
  'The open encyclopedia of the world’s aesthetics — art movements, architectural styles, cultural traditions, crafts, subcultures and internet aesthetics, each with real images, palettes, sources and a free API.'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: 'Aestheticpedia — the open encyclopedia of aesthetics', template: '%s · Aestheticpedia' },
  description,
  applicationName: 'Aestheticpedia',
  keywords: ['aesthetics', 'art movements', 'architectural styles', 'visual culture', 'design history', 'color palettes', 'moodboard', 'open data'],
  openGraph: { type: 'website', siteName: 'Aestheticpedia', title: 'Aestheticpedia', description, url: SITE_URL },
  twitter: { card: 'summary_large_image', title: 'Aestheticpedia', description },
  alternates: {
    canonical: '/',
    types: {
      'application/json': '/api/v1',
      'text/plain': '/llms.txt',
    },
  },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  themeColor: '#0b0b0c',
  colorScheme: 'dark light',
  width: 'device-width',
  initialScale: 1,
}

const siteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Aestheticpedia',
  url: SITE_URL,
  description,
  inLanguage: 'en',
  license: 'https://creativecommons.org/licenses/by-sa/4.0/',
  potentialAction: {
    '@type': 'SearchAction',
    target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/aesthetics?q={search_term_string}` },
    'query-input': 'required name=search_term_string',
  },
}

export default function RootLayout({ children, modal }: { children: ReactNode; modal: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geist.variable} ${geistMono.variable} ${display.variable}`}>
      <head>
        <link rel="preconnect" href="https://upload.wikimedia.org" />
        <link rel="preconnect" href="https://thumb.wikimedia.org" />
        <link rel="alternate" type="text/markdown" href="/llms.txt" title="LLM-readable index" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }} />
      </head>
      <body className="flex min-h-dvh flex-col font-sans">
        <Providers>
          <a
            href="#main"
            className="sr-only z-[100] rounded-full bg-accent px-4 py-2 text-accent-fg focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
          >
            Skip to content
          </a>
          <SiteHeader />
          <div id="main" className="flex flex-1 flex-col">
            {children}
          </div>
          <SiteFooter />
          {modal}
        </Providers>
      </body>
    </html>
  )
}
