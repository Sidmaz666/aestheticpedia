'use client'

import { useCallback, useEffect, useRef, type CSSProperties, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'
import { AestheticFonts } from './theme-scope'

/** Round, high-contrast close button that stays legible over any image or theme. */
export function CloseButton({ onClick, label = 'Close' }: { onClick: () => void; label?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={`${label} (Esc)`}
      className="grid size-12 place-items-center rounded-full bg-fg text-bg shadow-lg shadow-black/40 ring-1 ring-black/10 transition-transform duration-200 hover:scale-105 active:scale-95"
    >
      <X className="size-5" strokeWidth={2.25} aria-hidden />
    </button>
  )
}

/**
 * Full-screen overlay for an aesthetic opened from within the site. Covers the
 * whole viewport, adopts the aesthetic's theme, locks page scroll and closes on
 * Esc / the close button (returning to where the visitor was).
 */
export function AestheticModal({
  children,
  name,
  themeVars,
  themeMode,
  display,
  body,
}: {
  children: ReactNode
  name: string
  themeVars: Record<string, string> | null
  themeMode: 'dark' | 'light' | null
  display?: string
  body?: string
}) {
  const router = useRouter()
  const ref = useRef<HTMLDivElement>(null)
  const close = useCallback(() => router.back(), [router])

  useEffect(() => {
    const prev = document.documentElement.style.overflow
    document.documentElement.style.overflow = 'hidden'
    ref.current?.focus({ preventScroll: true })
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !e.defaultPrevented) close()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.documentElement.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [close])

  // New aesthetic inside the same overlay → start at the top.
  useEffect(() => {
    ref.current?.scrollTo({ top: 0 })
  }, [name])

  return (
    <div
      id="aesthetic-modal"
      role="dialog"
      aria-modal="true"
      aria-label={name}
      className="fixed inset-0 z-[80] animate-in fade-in-0 duration-300"
      style={{ ...(themeVars as CSSProperties), colorScheme: themeMode ?? undefined }}
    >
      <AestheticFonts display={display} body={body} targetId="aesthetic-modal" />
      <div
        ref={ref}
        id="aesthetic-modal-scroll"
        tabIndex={-1}
        className="absolute inset-0 overflow-y-auto overscroll-contain bg-bg text-fg outline-none scrollbar-thin"
      >
        {children}
      </div>
      <div className="pointer-events-none fixed right-3 top-3 z-[85] sm:right-6 sm:top-5">
        <div className="pointer-events-auto">
          <CloseButton onClick={close} label={`Close ${name}`} />
        </div>
      </div>
    </div>
  )
}

export function ModalSkeleton() {
  const router = useRouter()
  return (
    <div className="fixed inset-0 z-[80] bg-bg" aria-busy="true" aria-label="Loading aesthetic">
      <div className="fixed right-3 top-3 z-[85] sm:right-6 sm:top-5">
        <CloseButton onClick={() => router.back()} />
      </div>
      <div className="h-[78svh] animate-pulse bg-surface-2" />
      <div className="mx-auto max-w-[1600px] space-y-4 px-4 py-10 sm:px-6 lg:px-10">
        <div className="h-4 w-40 animate-pulse rounded bg-surface-2" />
        <div className="h-4 w-full max-w-2xl animate-pulse rounded bg-surface-2" />
        <div className="h-4 w-full max-w-xl animate-pulse rounded bg-surface-2" />
      </div>
    </div>
  )
}
