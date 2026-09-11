'use client'

import { useState } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import {
  ESTABLISHMENT_LABELS,
  STATUS_LABELS,
  filtersActive,
  type AtlasFilters,
  type Facets,
} from '@/lib/aesthetic'

interface FilterPanelProps {
  filters: AtlasFilters
  onChange: (patch: Partial<AtlasFilters>) => void
  onClear: () => void
  facets?: Facets
}

export function FilterPanel({ filters, onChange, onClear, facets }: FilterPanelProps) {
  const [localQ, setLocalQ] = useState(filters.q)
  const [qTimer, setQTimer] = useState<ReturnType<typeof setTimeout> | null>(null)

  const setQ = (v: string) => {
    setLocalQ(v)
    if (qTimer) clearTimeout(qTimer)
    setQTimer(
      setTimeout(() => {
        onChange({ q: v, page: 1 })
      }, 250)
    )
  }

  const toggleCategory = (name: string) => {
    const next = filters.categories.includes(name)
      ? filters.categories.filter((c) => c !== name)
      : [...filters.categories, name]
    onChange({ categories: next, page: 1 })
  }

  const active = filtersActive(filters)

  return (
    <div className="space-y-5" aria-label="Atlas filters">
      <div>
        <Label htmlFor="filter-search" className="text-[11px] font-medium uppercase tracking-[0.14em] text-stone-500">
          Search
        </Label>
        <Input
          id="filter-search"
          type="search"
          value={localQ}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Name, alias, tag…"
          className="mt-1.5 h-10 border-stone-300 bg-white/80 focus-visible:ring-[#b08d57]/30 [&::-webkit-search-cancel-button]:hidden"
        />
      </div>

      <div>
        <Label className="text-[11px] font-medium uppercase tracking-[0.14em] text-stone-500">
          Category
        </Label>
        <div className="scrollbar-thin mt-1.5 max-h-64 space-y-1 overflow-y-auto pr-1.5">
          {facets ? (
            facets.categories.map((c) => (
              <label
                key={c.name}
                className="flex min-h-[36px] cursor-pointer items-center gap-2.5 rounded px-1 py-1 text-sm text-stone-700 transition-colors hover:bg-stone-100"
              >
                <Checkbox
                  checked={filters.categories.includes(c.name)}
                  onCheckedChange={() => toggleCategory(c.name)}
                  aria-label={`Filter by category ${c.name} (${c.count} entries)`}
                />
                <span className="flex-1 leading-tight">{c.name}</span>
                <span className="text-xs tabular-nums text-stone-400">{c.count}</span>
              </label>
            ))
          ) : (
            <div className="space-y-2 py-1">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-5 w-full animate-pulse rounded bg-stone-200/70" />
              ))}
            </div>
          )}
          {facets && facets.categories.length === 0 && (
            <p className="py-1 text-sm text-stone-400">No categories yet.</p>
          )}
        </div>
      </div>

      <Separator className="bg-stone-200" />

      <SelectField
        id="filter-establishment"
        label="Establishment"
        placeholder="All kinds"
        value={filters.establishment}
        onChange={(v) => onChange({ establishment: v, page: 1 })}
        options={
          facets?.establishments.map((e) => ({
            value: e.name,
            label: `${ESTABLISHMENT_LABELS[e.name] ?? e.name} (${e.count})`,
          })) ?? []
        }
      />

      <SelectField
        id="filter-status"
        label="Status"
        placeholder="All statuses"
        value={filters.status}
        onChange={(v) => onChange({ status: v, page: 1 })}
        options={
          facets?.statuses.map((s) => ({
            value: s.name,
            label: `${STATUS_LABELS[s.name] ?? s.name} (${s.count})`,
          })) ?? []
        }
      />

      <SelectField
        id="filter-era"
        label="Era"
        placeholder="All eras"
        value={filters.era}
        onChange={(v) => onChange({ era: v, page: 1 })}
        options={facets?.eras.map((e) => ({ value: e.name, label: `${e.name} (${e.count})` })) ?? []}
      />

      <SelectField
        id="filter-region"
        label="Region"
        placeholder="All regions"
        value={filters.region}
        onChange={(v) => onChange({ region: v, page: 1 })}
        options={facets?.regions.map((r) => ({ value: r.name, label: `${r.name} (${r.count})` })) ?? []}
      />

      <div className="flex items-center justify-between">
        <Label htmlFor="filter-niche" className="text-sm text-stone-700">
          Niche only
        </Label>
        <Switch
          id="filter-niche"
          checked={filters.niche}
          onCheckedChange={(v) => onChange({ niche: v, page: 1 })}
          aria-label="Show niche aesthetics only"
        />
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={onClear}
        disabled={!active}
        className="w-full gap-1.5 border-stone-300 disabled:opacity-50"
      >
        <X className="h-3.5 w-3.5" aria-hidden="true" />
        Clear all filters
      </Button>
    </div>
  )
}

function SelectField({
  id,
  label,
  placeholder,
  value,
  onChange,
  options,
}: {
  id: string
  label: string
  placeholder: string
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <div>
      <Label htmlFor={id} className="text-[11px] font-medium uppercase tracking-[0.14em] text-stone-500">
        {label}
      </Label>
      <Select
        value={value || undefined}
        onValueChange={(v) => onChange(v === '__all__' ? '' : v)}
      >
        <SelectTrigger
          id={id}
          className="mt-1.5 h-10 border-stone-300 bg-white/80 data-[placeholder]:text-stone-400"
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="scrollbar-thin max-h-72">
          <SelectItem value="__all__">{placeholder}</SelectItem>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
