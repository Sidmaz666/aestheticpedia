// Site identity — every value comes from the environment (see .env.example), so a deployment
// can be renamed or moved without code changes. Used by pages, metadata, SEO, the API, MCP,
// llms.txt, exports and citations.
//
// URL resolution order: NEXT_PUBLIC_SITE_URL → Vercel production domain → Vercel deployment
// URL → http://localhost:3000.

const clean = (u: string) => u.replace(/\/+$/, '')
const withProtocol = (host?: string) => (host ? (/^https?:\/\//.test(host) ? host : `https://${host}`) : undefined)

export const SITE_URL = clean(
  process.env.NEXT_PUBLIC_SITE_URL ||
    withProtocol(process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL) ||
    withProtocol(process.env.NEXT_PUBLIC_VERCEL_URL || process.env.VERCEL_URL) ||
    `http://localhost:${process.env.PORT || 3000}`
)

export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'Aestheticpedia'
export const SITE_TAGLINE = process.env.NEXT_PUBLIC_SITE_TAGLINE || 'The open encyclopedia of aesthetics'
export const SITE_DESCRIPTION =
  process.env.NEXT_PUBLIC_SITE_DESCRIPTION ||
  `The open encyclopedia of the world’s aesthetics — art movements, architectural styles, cultural traditions, crafts, subcultures and internet aesthetics, each with real images, palettes, sources and a free API.`
/** Source repository (contribution links, "improve this record"). Empty hides those links. */
export const REPO_URL = clean(process.env.NEXT_PUBLIC_REPO_URL || '')
export const REPO_BRANCH = process.env.NEXT_PUBLIC_REPO_BRANCH || 'main'
export const TWITTER_HANDLE = process.env.NEXT_PUBLIC_TWITTER_HANDLE || ''
export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL || ''

export const repoFile = (p: string) => (REPO_URL ? `${REPO_URL}/blob/${REPO_BRANCH}/${p}` : '')
export const repoEdit = (p: string) => (REPO_URL ? `${REPO_URL}/edit/${REPO_BRANCH}/${p}` : '')
export const CONTRIBUTING_URL = repoFile('CONTRIBUTING.md')

/**
 * Deployment stage. On Vercel, VERCEL_ENV is "production" | "preview" | "development"; elsewhere
 * a production build counts as production. Only production is indexed by search engines —
 * preview deployments are noindex so they never compete with the real site. Override with
 * NEXT_PUBLIC_ALLOW_INDEXING=true|false.
 */
export const DEPLOY_ENV = process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.VERCEL_ENV || (process.env.NODE_ENV === 'production' ? 'production' : 'development')
export const INDEXABLE =
  process.env.NEXT_PUBLIC_ALLOW_INDEXING === 'true' ? true : process.env.NEXT_PUBLIC_ALLOW_INDEXING === 'false' ? false : DEPLOY_ENV === 'production'

/** Search-console verification tokens (optional). */
export const VERIFICATION = {
  google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
  bing: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION || undefined,
  yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION || undefined,
}

/** Repository owner (GitHub login), for author/publisher metadata. */
export const REPO_OWNER = /github\.com\/([^/]+)/i.exec(REPO_URL)?.[1] ?? ''
