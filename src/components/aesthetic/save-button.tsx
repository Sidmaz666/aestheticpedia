'use client'

import { Star } from 'lucide-react'
import { toast } from 'sonner'
import { toggleSaved, useIsSaved, type SavedItem } from '@/lib/saved'

/** Star an aesthetic or a blend; saved items appear on the home page ("Your shelf"). */
export function SaveButton({ item }: { item: Omit<SavedItem, 'savedAt'> }) {
  const saved = useIsSaved(item.id)
  const label = saved ? `Remove ${item.name} from your shelf` : `Save ${item.name} to your shelf`
  return (
    <button
      type="button"
      onClick={() => {
        const now = toggleSaved(item)
        toast.success(now ? 'Saved to your shelf' : 'Removed from your shelf', {
          description: now ? 'Find it on the home page.' : undefined,
          action: { label: 'Undo', onClick: () => toggleSaved(item) },
        })
      }}
      aria-pressed={saved}
      aria-label={label}
      title={saved ? 'Saved — click to remove' : 'Save to your shelf'}
      className={`grid size-10 place-items-center rounded-full border transition-colors ${
        saved ? 'border-accent bg-accent-soft text-accent' : 'border-line-strong text-fg-muted hover:border-fg-subtle hover:text-fg'
      }`}
    >
      <Star className={`size-4 transition-transform ${saved ? 'scale-110 fill-current' : ''}`} aria-hidden />
    </button>
  )
}
