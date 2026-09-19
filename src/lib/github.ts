// Project and maintainer details, read live from GitHub (cached for a day) so the About page and
// footer stay current without code changes. Everything derives from the repository URL
// (src/lib/site.ts → NEXT_PUBLIC_REPO_URL, Vercel's git metadata, or the local git remote).
// Contact email: NEXT_PUBLIC_CONTACT_EMAIL → the owner's public GitHub email → the email on the
// owner's most recent commit. Set GITHUB_TOKEN to lift the anonymous API rate limit.
import { CONTACT_EMAIL, REPO_URL } from './site'

export type ProjectInfo = {
  owner: { login: string; name: string; avatar: string; url: string; bio: string; location: string; blog: string; followers: number | null }
  repo: {
    fullName: string
    url: string
    description: string
    stars: number | null
    forks: number | null
    issues: number | null
    license: string
    language: string
    pushedAt: string | null
    topics: string[]
  }
  email: string
}

export function parseRepo(url = REPO_URL): { owner: string; repo: string } | null {
  const m = /github\.com[/:]([^/]+)\/([^/#?]+?)(?:\.git)?(?:[/#?].*)?$/i.exec(url)
  return m ? { owner: m[1], repo: m[2] } : null
}

async function gh<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`https://api.github.com${path}`, {
      headers: {
        Accept: 'application/vnd.github+json',
        'User-Agent': 'aestheticpedia',
        ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
      },
      next: { revalidate: 86400 },
      signal: AbortSignal.timeout(6000),
    })
    return res.ok ? ((await res.json()) as T) : null
  } catch {
    return null
  }
}

const usable = (email?: string | null) => !!email && /@/.test(email) && !/noreply/i.test(email)

export async function getProjectInfo(): Promise<ProjectInfo | null> {
  const p = parseRepo()
  if (!p) return null
  const [user, repo, commits] = await Promise.all([
    gh<any>(`/users/${p.owner}`),
    gh<any>(`/repos/${p.owner}/${p.repo}`),
    gh<any[]>(`/repos/${p.owner}/${p.repo}/commits?per_page=20`),
  ])
  const login = user?.login ?? p.owner
  const commitEmail = commits?.find((c) => c?.author?.login?.toLowerCase() === login.toLowerCase() && usable(c?.commit?.author?.email))?.commit.author.email
  return {
    owner: {
      login,
      name: user?.name || login,
      avatar: user?.avatar_url || `https://github.com/${login}.png`,
      url: user?.html_url || `https://github.com/${login}`,
      bio: user?.bio ?? '',
      location: user?.location ?? '',
      blog: user?.blog ?? '',
      followers: user?.followers ?? null,
    },
    repo: {
      fullName: repo?.full_name ?? `${p.owner}/${p.repo}`,
      url: repo?.html_url ?? REPO_URL,
      description: repo?.description ?? '',
      stars: repo?.stargazers_count ?? null,
      forks: repo?.forks_count ?? null,
      issues: repo?.open_issues_count ?? null,
      license: repo?.license?.spdx_id && repo.license.spdx_id !== 'NOASSERTION' ? repo.license.spdx_id : '',
      language: repo?.language ?? '',
      pushedAt: repo?.pushed_at ?? null,
      topics: repo?.topics ?? [],
    },
    email: CONTACT_EMAIL || (usable(user?.email) ? user.email : '') || commitEmail || '',
  }
}
