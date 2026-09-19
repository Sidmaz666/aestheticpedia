import Script from 'next/script'
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono, Instrument_Serif } from 'next/font/google'
import type { ReactNode } from 'react'
import './globals.css'
import { Providers } from '@/components/providers'
import { SiteFooter } from '@/components/site/footer'
import { SiteHeader } from '@/components/site/header'
import { Motion } from '@/components/site/motion'
import { AgentDock } from '@/components/ai/agent-dock'
import { MagicCursor } from '@/components/site/magic-cursor'
import { MOTION_BOOT } from '@/lib/motion-boot'
import { CONTACT_EMAIL, INDEXABLE, REPO_OWNER, REPO_URL, SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE, SITE_URL, TWITTER_HANDLE, VERIFICATION } from '@/lib/site'

const geist = Geist({ variable: '--font-geist', subsets: ['latin'], display: 'swap' })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'], display: 'swap' })
const display = Instrument_Serif({
  variable: '--font-instrument',
  subsets: ['latin', 'latin-ext'],
  weight: '400',
  style: ['normal', 'italic'],
  display: 'swap',
})

const description = SITE_DESCRIPTION

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${SITE_NAME} — ${SITE_TAGLINE}`, template: `%s · ${SITE_NAME}` },
  description,
  applicationName: SITE_NAME,
  keywords: [
    'aesthetics',
    'aesthetic encyclopedia',
    'art movements',
    'architectural styles',
    'internet aesthetics',
    'subcultures',
    'traditional crafts',
    'visual culture',
    'design history',
    'colour palettes',
    'moodboard',
    'design tokens',
    'open data',
  ],
  category: 'reference',
  creator: REPO_OWNER || SITE_NAME,
  publisher: SITE_NAME,
  authors: REPO_OWNER ? [{ name: REPO_OWNER, url: `https://github.com/${REPO_OWNER}` }] : undefined,
  formatDetection: { email: false, address: false, telephone: false },
  openGraph: { type: 'website', siteName: SITE_NAME, title: `${SITE_NAME} — ${SITE_TAGLINE}`, description, url: SITE_URL, locale: 'en_US' },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description,
    ...(TWITTER_HANDLE ? { site: TWITTER_HANDLE, creator: TWITTER_HANDLE } : {}),
  },
  verification: { google: VERIFICATION.google, yandex: VERIFICATION.yandex, other: VERIFICATION.bing ? { 'msvalidate.01': VERIFICATION.bing } : undefined },
  alternates: {
    canonical: '/',
    types: {
      'application/json': '/api/v1',
      'text/plain': '/llms.txt',
    },
  },
  // Only production is indexed (see INDEXABLE in src/lib/site.ts); previews are noindex.
  robots: INDEXABLE
    ? { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 } }
    : { index: false, follow: false },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0b0b0c' },
    { media: '(prefers-color-scheme: light)', color: '#f6f4ef' },
  ],
  colorScheme: 'dark light',
  width: 'device-width',
  initialScale: 1,
}

// Structured data for the whole site: the publishing organisation and the website (with a
// sitelinks search box). Record pages add their own DefinedTerm + BreadcrumbList.
const siteJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/icon.png`, width: 512, height: 512 },
      ...(CONTACT_EMAIL ? { email: CONTACT_EMAIL } : {}),
      sameAs: [REPO_URL, REPO_OWNER ? `https://github.com/${REPO_OWNER}` : ''].filter(Boolean),
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      name: SITE_NAME,
      alternateName: SITE_TAGLINE,
      url: SITE_URL,
      description,
      inLanguage: 'en',
      publisher: { '@id': `${SITE_URL}/#organization` },
      license: 'https://creativecommons.org/licenses/by-sa/4.0/',
      potentialAction: {
        '@type': 'SearchAction',
        target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/aesthetics?q={search_term_string}` },
        'query-input': 'required name=search_term_string',
      },
    },
  ],
}

export default function RootLayout({ children, modal }: { children: ReactNode; modal: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geist.variable} ${geistMono.variable} ${display.variable}`}>
      <head>
        <Script id="motion-boot" strategy="beforeInteractive">
          {MOTION_BOOT}
        </Script>
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
          <Motion />
          <AgentDock />
          <MagicCursor />
        </Providers>
      </body>
    </html>
  )
}
