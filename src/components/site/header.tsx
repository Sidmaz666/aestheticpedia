'use client'

import { useEffect, useState, useSyncExternalStore } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { Menu, Moon, Search, Shuffle, Sun, X } from 'lucide-react'
import { fetchJson } from '@/lib/client'
import type { AestheticSummary } from '@/lib/aesthetic'
import { SITE_NAME } from '@/lib/site'
import { Logo, NAV } from './nav'
import { SearchDialog } from './search-dialog'
import { WandPicker } from './wand-picker'
import { OPEN_SEARCH_EVENT } from './search-trigger'

export function SiteHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const { resolvedTheme, setTheme } = useTheme()
  const [searchOpen, setSearchOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  // true only after hydration (theme is unknown on the server)
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )
  // Close the mobile menu on navigation (derived during render, no effect needed).
  const [menuPath, setMenuPath] = useState(pathname)
  if (menuPath !== pathname) {
    setMenuPath(pathname)
    if (menuOpen) setMenuOpen(false)
  }
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = e.target instanceof HTMLElement && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !typing)) {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    const onOpen = () => setSearchOpen(true)
    window.addEventListener('keydown', onKey)
    window.addEventListener(OPEN_SEARCH_EVENT, onOpen)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener(OPEN_SEARCH_EVENT, onOpen)
    }
  }, [])

  const surprise = async () => {
    try {
      const { item } = await fetchJson<{ item: AestheticSummary }>('/api/v1/random?mode=illustrated', { cache: 'no-store' })
      router.push(`/aesthetics/${item.slug}`)
    } catch {
      /* ignore */
    }
  }

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`)

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-300 ${
          scrolled || menuOpen ? 'border-b border-line bg-bg/80 backdrop-blur-xl' : 'border-b border-transparent'
        }`}
      >
        <div className="mx-auto flex h-16 max-w-[1600px] items-center gap-2 px-4 sm:gap-4 sm:px-6 lg:px-10">
          <Link href="/" className="shrink-0 text-fg" aria-label={`${SITE_NAME} home`}>
            <Logo />
          </Link>

          <nav aria-label="Primary" className="ml-4 hidden items-center gap-0.5 xl:flex">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                aria-current={isActive(n.href) ? 'page' : undefined}
                className={`rounded-full px-3 py-1.5 text-sm transition-colors ${
                  isActive(n.href) ? 'bg-surface-2 text-fg' : 'text-fg-muted hover:text-fg'
                }`}
              >
                {n.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-0.5 sm:gap-1.5">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="group flex h-10 items-center gap-2.5 rounded-full border border-line-strong bg-surface/60 pl-3.5 pr-2 text-sm text-fg-subtle transition-colors hover:border-fg-subtle hover:text-fg md:w-64"
              aria-label="Search aesthetics"
            >
              <Search className="size-4" aria-hidden />
              <span className="hidden flex-1 text-left md:inline">Search the vault…</span>
              <kbd className="hidden rounded-full border border-line-strong px-2 py-0.5 font-mono text-[10px] md:inline">⌘ K</kbd>
            </button>
            <button
              type="button"
              onClick={surprise}
              className="hidden size-10 place-items-center rounded-full text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg min-[380px]:grid"
              aria-label="Open a random aesthetic"
              title="Surprise me"
            >
              <Shuffle className="size-4" aria-hidden />
            </button>
            <WandPicker />
            <button
              type="button"
              onClick={() => setTheme(resolvedTheme === 'light' ? 'dark' : 'light')}
              className="grid size-10 place-items-center rounded-full text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg"
              aria-label={mounted && resolvedTheme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            >
              {mounted && resolvedTheme === 'light' ? <Moon className="size-4" aria-hidden /> : <Sun className="size-4" aria-hidden />}
            </button>
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              className="grid size-10 place-items-center rounded-full text-fg-muted hover:bg-surface-2 hover:text-fg xl:hidden"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav aria-label="Mobile" className="max-h-[calc(100svh-4rem)] overflow-y-auto border-t border-line px-4 pb-6 pt-2 no-scrollbar xl:hidden">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className={`block border-b border-line py-4 display text-3xl ${isActive(n.href) ? 'text-accent' : 'text-fg'}`}
              >
                {n.label}
              </Link>
            ))}
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false)
                void surprise()
              }}
              className="flex w-full items-center gap-3 py-4 text-left display text-3xl text-fg-muted hover:text-fg"
            >
              <Shuffle className="size-5" aria-hidden /> Surprise me
            </button>
          </nav>
        )}
      </header>
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  )
}
