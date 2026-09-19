'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Loader2, Shuffle } from 'lucide-react'
import type { AestheticSummary, SuggestItem } from '@/lib/aesthetic'
import { fetchJson } from '@/lib/client'
import { Thumb } from '@/components/aesthetic/thumb'

/** "Did you mean…": searches the vault for the words in the missing URL. */
export function LostSuggestions() {
  const pathname = usePathname()
  const router = useRouter()
  const [items, setItems] = useState<SuggestItem[] | null>(null)
  const [rolling, setRolling] = useState(false)
  const words = decodeURIComponent(pathname.split('/').filter(Boolean).pop() ?? '')
    .replace(/[-_+]+/g, ' ')
    .replace(/\.[a-z]+$/i, '')
    .trim()

  useEffect(() => {
    if (words.length < 2) return
    let live = true
    // The whole phrase first, then each word, then each word without its last letter
    // (typos like "art-decoo" still find Art Deco).
    const tokens = words.split(' ').filter((t) => t.length >= 3)
    const trimmed = tokens.map((t) => (t.length > 4 ? t.slice(0, -1) : t)).join(' ')
    const tries = [...new Set([words, trimmed, ...tokens.map((t) => t.slice(0, -1)), ...tokens].filter((t) => t.length >= 3))]
    ;(async () => {
      const found = new Map<string, SuggestItem>()
      for (const q of tries) {
        try {
          const d = await fetchJson<{ items: SuggestItem[] }>(`/api/v1/search?limit=6&q=${encodeURIComponent(q)}`)
          for (const it of d.items) if (!found.has(it.slug)) found.set(it.slug, it)
        } catch {
          /* keep trying the next form */
        }
        if (found.size >= 4) break
      }
      if (live) setItems([...found.values()].slice(0, 6))
    })()
    return () => {
      live = false
    }
  }, [words])

  const surprise = async () => {
    setRolling(true)
    try {
      const { item } = await fetchJson<{ item: AestheticSummary }>('/api/v1/random?mode=illustrated', { cache: 'no-store' })
      router.push(`/aesthetics/${item.slug}`)
    } finally {
      setRolling(false)
    }
  }

  return (
    <div className="w-full">
      {words.length >= 2 && (
        <div className="mt-10 text-left">
          <p className="eyebrow">Did you mean</p>
          {items === null ? (
            <p className="mt-3 flex items-center gap-2 text-sm text-fg-subtle">
              <Loader2 className="size-4 animate-spin" aria-hidden /> Searching for “{words}”…
            </p>
          ) : items.length ? (
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {items.map((s) => (
                <li key={s.slug}>
                  <Link href={`/aesthetics/${s.slug}`} className="flex items-center gap-3 rounded-xl border border-line bg-surface/70 p-2 pr-4 transition-colors hover:border-line-strong hover:bg-surface-2">
                    <Thumb image={s.image} colors={s.colors} name={s.name} className="size-12 shrink-0 rounded-lg" />
                    <span className="min-w-0">
                      <span className="block truncate text-fg">{s.name}</span>
                      <span className="block truncate text-xs text-fg-subtle">{s.category}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-fg-subtle">Nothing close to “{words}” yet.</p>
          )}
        </div>
      )}
      <button
        type="button"
        onClick={surprise}
        disabled={rolling}
        className="mt-8 inline-flex h-11 items-center gap-2 rounded-full border border-line-strong px-5 text-sm text-fg-muted transition-colors hover:border-accent hover:text-fg disabled:opacity-60"
      >
        {rolling ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Shuffle className="size-4" aria-hidden />} Take me somewhere random
      </button>
    </div>
  )
}
