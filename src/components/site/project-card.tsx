import { CircleDot, GitFork, Mail, MapPin, Scale, Star, Users } from 'lucide-react'
import { compact } from '@/lib/format'
import type { ProjectInfo } from '@/lib/github'
import { CONTRIBUTING_URL } from '@/lib/site'
import { CopyButton } from './copy-button'

/** The GitHub mark (used only to link to GitHub, per GitHub's logo guidelines). */
export function GitHubMark({ className = 'size-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden className={className} fill="currentColor">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  )
}

const fmt = (n: number | null) => (n === null ? '' : compact(n))
function ago(iso: string | null) {
  if (!iso) return ''
  const d = (Date.now() - new Date(iso).getTime()) / 86400000
  return d < 1 ? 'today' : d < 2 ? 'yesterday' : d < 30 ? `${Math.round(d)} days ago` : new Date(iso).toLocaleDateString('en', { month: 'short', year: 'numeric' })
}

const base = 'inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm transition-[background-color,border-color,opacity,transform] hover:-translate-y-px active:translate-y-0'
const btn = `${base} border border-line-strong bg-surface/60 text-fg hover:border-fg-subtle hover:bg-surface-2`
const primary = `${base} bg-fg font-medium text-bg hover:opacity-90`
const count = 'rounded-full bg-surface-2 px-2 py-0.5 font-mono text-[11px] text-fg-muted'

/** Maintainer and repository, live from GitHub: avatar, bio, stars/forks/issues and actions. */
export function ProjectCard({ info }: { info: ProjectInfo }) {
  const { owner, repo, email } = info
  return (
    <div className="overflow-hidden rounded-[calc(1.5rem*var(--r-scale,1))] border border-line bg-surface">
      <div className="grid gap-8 p-6 sm:p-8 md:grid-cols-[1fr_auto] md:items-center">
        <div className="flex items-center gap-5">
          <a href={owner.url} target="_blank" rel="noopener noreferrer" className="relative shrink-0" aria-label={`${owner.name} on GitHub`}>
            <img src={owner.avatar} alt="" width={80} height={80} className="size-20 rounded-full object-cover ring-2 ring-accent ring-offset-4 ring-offset-surface" />
            <span className="absolute -bottom-1 -right-1 grid size-7 place-items-center rounded-full bg-fg text-bg ring-4 ring-surface">
              <GitHubMark className="size-3.5" />
            </span>
          </a>
          <div className="min-w-0">
            <p className="eyebrow">Created &amp; maintained by</p>
            <p className="display mt-1 truncate text-3xl text-fg">{owner.name}</p>
            <a href={owner.url} target="_blank" rel="noopener noreferrer" className="font-mono text-sm text-fg-muted hover:text-accent">
              @{owner.login}
            </a>
            {owner.bio && <p className="mt-2 max-w-md text-sm text-fg-muted">{owner.bio}</p>}
            <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-fg-subtle">
              {owner.location && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="size-3" aria-hidden /> {owner.location}
                </span>
              )}
              {owner.followers !== null && (
                <span className="inline-flex items-center gap-1">
                  <Users className="size-3" aria-hidden /> {fmt(owner.followers)} followers
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 md:justify-end">
          <a href={owner.url} target="_blank" rel="noopener noreferrer" className={btn}>
            <GitHubMark /> Follow on GitHub
          </a>
          {email && (
            <span className="inline-flex max-w-full items-center">
              <a href={`mailto:${email}?subject=${encodeURIComponent('Aestheticpedia')}`} className={`${btn} min-w-0 rounded-r-none border-r-0`}>
                <Mail className="size-4 shrink-0" aria-hidden /> <span className="truncate">{email}</span>
              </a>
              <CopyButton text={email} label="Copy email address" className={`${btn} rounded-l-none px-3`} />
            </span>
          )}
        </div>
      </div>

      <div className="border-t border-line bg-bg/40 p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="min-w-0">
            <a href={repo.url} target="_blank" rel="noopener noreferrer" className="group inline-flex items-center gap-2 text-lg text-fg">
              <GitHubMark className="size-5" />
              <span className="font-mono group-hover:text-accent">{repo.fullName}</span>
            </a>
            {repo.description && <p className="mt-1 max-w-xl text-sm text-fg-muted">{repo.description}</p>}
            <p className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-fg-subtle">
              {repo.language && <span>{repo.language}</span>}
              {repo.license && (
                <span className="inline-flex items-center gap-1">
                  <Scale className="size-3" aria-hidden /> {repo.license}
                </span>
              )}
              {repo.pushedAt && <span>Updated {ago(repo.pushedAt)}</span>}
            </p>
            {repo.topics.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {repo.topics.slice(0, 8).map((t) => (
                  <span key={t} className="rounded-full bg-accent-soft px-2.5 py-0.5 text-xs text-fg">
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <a href={repo.url} target="_blank" rel="noopener noreferrer" className={primary}>
              <Star className="size-4" aria-hidden /> Star
              {repo.stars !== null && <span className="rounded-full bg-bg/20 px-2 py-0.5 font-mono text-[11px]">{fmt(repo.stars)}</span>}
            </a>
            <a href={`${repo.url}/fork`} target="_blank" rel="noopener noreferrer" className={btn}>
              <GitFork className="size-4" aria-hidden /> Fork
              {repo.forks !== null && <span className={count}>{fmt(repo.forks)}</span>}
            </a>
            <a href={`${repo.url}/issues/new/choose`} target="_blank" rel="noopener noreferrer" className={btn}>
              <CircleDot className="size-4" aria-hidden /> Report an issue
              {repo.issues !== null && repo.issues > 0 && <span className={count}>{fmt(repo.issues)}</span>}
            </a>
            {CONTRIBUTING_URL && (
              <a href={CONTRIBUTING_URL} target="_blank" rel="noopener noreferrer" className={btn}>
                Contribute
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
