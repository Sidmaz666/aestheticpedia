import Link from 'next/link'
import { Mail, Star } from 'lucide-react'
import { CONTRIBUTING_URL, REPO_URL, SITE_NAME } from '@/lib/site'
import { getProjectInfo } from '@/lib/github'
import { Logo, NAV } from './nav'
import { GitHubMark } from './project-card'


export async function SiteFooter() {
  const project = await getProjectInfo()
  const iconBtn =
    'inline-flex h-9 items-center gap-2 rounded-full border border-line-strong px-3.5 text-xs text-fg-muted transition-colors hover:border-fg-subtle hover:text-fg'
  return (
    <footer className="mt-24 border-t border-line">
      <div className="mx-auto grid max-w-[1600px] gap-12 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr_1fr] lg:px-10">
        <div className="max-w-sm">
          <Logo className="text-fg" />
          <p className="mt-4 text-sm leading-relaxed text-fg-subtle">
            An open, contributor-built encyclopedia of the world’s aesthetics. Text is licensed CC BY-SA 4.0; every
            image is credited with its own license.
          </p>
          {project && (
            <div className="mt-6 flex flex-wrap gap-2">
              <a href={project.repo.url} target="_blank" rel="noopener noreferrer" className={iconBtn} aria-label={`${project.repo.fullName} on GitHub`}>
                <GitHubMark className="size-3.5" /> GitHub
                {project.repo.stars !== null && (
                  <span className="inline-flex items-center gap-0.5 font-mono text-[11px]">
                    <Star className="size-3" aria-hidden /> {project.repo.stars}
                  </span>
                )}
              </a>
              {project.email && (
                <a href={`mailto:${project.email}`} className={iconBtn} aria-label={`Email ${project.owner.name}`}>
                  <Mail className="size-3.5" aria-hidden /> Contact
                </a>
              )}
            </div>
          )}
        </div>
        <FooterCol title="Explore" links={NAV.slice(0, 4)} />
        <FooterCol
          title="Open data"
          links={[
            { href: '/data', label: 'Downloads' },
            { href: '/data#api', label: 'REST API' },
            { href: '/data#mcp', label: 'MCP server' },
            { href: '/llms.txt', label: 'llms.txt' },
            { href: '/api/v1/openapi.json', label: 'OpenAPI spec' },
          ]}
        />
        <FooterCol
          title="Project"
          links={[
            { href: '/about', label: 'About & methodology' },
            { href: '/about#terminology', label: 'Terminology' },
            ...(CONTRIBUTING_URL ? [{ href: CONTRIBUTING_URL, label: 'Contribute an aesthetic' }] : []),
            ...(REPO_URL ? [{ href: REPO_URL, label: 'Source code' }] : []),
          ]}
        />
      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-x-8 gap-y-3 px-4 py-5 text-xs text-fg-subtle sm:px-6 lg:px-10">
          <p className="max-w-3xl">
            Images from Wikimedia Commons and museum open-access collections, credited on each record. {SITE_NAME} is
            not affiliated with any of the institutions it cites.
          </p>
          {project && (
            <a href={project.owner.url} target="_blank" rel="noopener noreferrer" className="group inline-flex items-center gap-2 hover:text-fg">
              <img src={project.owner.avatar} alt="" width={20} height={20} className="size-5 rounded-full" />
              Conjured by <span className="font-mono text-fg-muted group-hover:text-fg">@{project.owner.login.toLowerCase()}</span>
            </a>
          )}
        </div>
      </div>
    </footer>
  )
}

function FooterCol({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <p className="eyebrow">{title}</p>
      <ul className="mt-4 space-y-2.5">
        {links.map((l) => (
          <li key={l.href}>
            {l.href.startsWith('http') || l.href.includes('.') ? (
              <a href={l.href} className="text-sm text-fg-muted transition-colors hover:text-fg">
                {l.label}
              </a>
            ) : (
              <Link href={l.href} className="text-sm text-fg-muted transition-colors hover:text-fg">
                {l.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
