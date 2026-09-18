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
