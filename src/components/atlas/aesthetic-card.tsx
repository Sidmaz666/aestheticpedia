'use client'

import { motion } from 'framer-motion'
import { PaletteStrip } from '@/components/atlas/palette-strip'
import { StatusDot } from '@/components/atlas/bits'
import { ESTABLISHMENT_LABELS, type ColorEntry } from '@/lib/aesthetic'

/** Minimal shape both atlas rows and explore results satisfy. */
export interface AestheticCardItem {
  slug: string
  name: string
  category: string
  summary: string
  colors: ColorEntry[]
  establishment?: string
  status?: string
  tags?: string[]
}

export function AestheticCard({
  item,
  onOpen,
  footer,
}: {
  item: AestheticCardItem
  onOpen: (slug: string) => void
  /** Optional replacing content under the summary (used by Explorer results). */
  footer?: React.ReactNode
}) {
  return (
    <motion.button
      type="button"
      onClick={() => onOpen(item.slug)}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.985 }}
      transition={{ duration: 0.18 }}
      className="group flex h-full flex-col overflow-hidden rounded-lg border border-stone-200 bg-white text-left shadow-sm transition-colors hover:border-[#b08d57]/60 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b08d57] focus-visible:ring-offset-2 focus-visible:ring-offset-[#faf8f4]"
      aria-label={`${item.name} — open details`}
    >
      <PaletteStrip
        colors={item.colors}
        label={item.name}
        className="h-10 shrink-0 border-b border-stone-200/70"
      />
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-serif text-lg leading-snug text-stone-900 group-hover:text-[#6f5527]">
            {item.name}
          </h3>
          {item.status && (
            <span className="mt-1.5">
              <StatusDot status={item.status} />
            </span>
          )}
        </div>
        <p className="mt-1 text-xs uppercase tracking-wide text-stone-400">
          {item.category}
          {item.establishment
            ? ` · ${ESTABLISHMENT_LABELS[item.establishment] ?? item.establishment}`
            : ''}
        </p>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-stone-600">
          {item.summary || 'Entry awaiting its summary — the pipeline will fill this in.'}
        </p>
        {footer ? (
          <div className="mt-3">{footer}</div>
        ) : (
          item.tags &&
          item.tags.length > 0 && (
            <div className="mt-auto flex flex-wrap gap-1.5 pt-3" aria-label="Tags">
              {item.tags.slice(0, 3).map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-stone-200 bg-stone-50 px-2 py-0.5 text-[11px] text-stone-600"
                >
                  {t}
                </span>
              ))}
            </div>
          )
        )}
      </div>
    </motion.button>
  )
}
