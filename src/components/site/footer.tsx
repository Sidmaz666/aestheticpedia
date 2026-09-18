import Link from 'next/link'
import { CONTRIBUTING_URL, REPO_URL, SITE_NAME } from '@/lib/site'
import { Logo, NAV } from './nav'


export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-line">
      <div className="mx-auto grid max-w-[1600px] gap-12 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr_1fr] lg:px-10">
        <div className="max-w-sm">
          <Logo className="text-fg" />
          <p className="mt-4 text-sm leading-relaxed text-fg-subtle">
            An open, contributor-built encyclopedia of the world’s aesthetics. Text is licensed CC BY-SA 4.0; every
            image is credited with its own license.
          </p>
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
        <p className="mx-auto max-w-[1600px] px-4 py-5 text-xs text-fg-subtle sm:px-6 lg:px-10">
          Images from Wikimedia Commons and museum open-access collections, credited on each record. {SITE_NAME} is
          not affiliated with any of the institutions it cites.
        </p>
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
