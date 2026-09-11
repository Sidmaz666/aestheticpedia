'use client'

import { AlertTriangle, Compass, RotateCcw } from 'lucide-react'
import type { ReactNode } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { STATUS_DOTS, STATUS_LABELS } from '@/lib/aesthetic'
import { cn } from '@/lib/utils'

export function StatusDot({ status, className }: { status: string; className?: string }) {
  const label = STATUS_LABELS[status] ?? status
  return (
    <span
      role="img"
      aria-label={`Status: ${label}`}
      title={`Status: ${label}`}
      className={cn(
        'inline-block h-2.5 w-2.5 shrink-0 rounded-full ring-1 ring-black/5',
        STATUS_DOTS[status] ?? 'bg-stone-400',
        className
      )}
    />
  )
}

export function StatusBadge({ status }: { status: string }) {
  const label = STATUS_LABELS[status] ?? status
  return (
    <Badge variant="outline" className="gap-1.5 border-stone-300 bg-white/70 font-normal">
      <StatusDot status={status} />
      {label}
    </Badge>
  )
}

export function SectionHeading({ children, hint }: { children: ReactNode; hint?: string }) {
  return (
    <div className="mb-3">
      <h3 className="font-serif text-xl text-stone-900">{children}</h3>
      {hint ? <p className="mt-0.5 text-xs text-stone-500">{hint}</p> : null}
    </div>
  )
}

export function Chip({ children, tone = 'default' }: { children: ReactNode; tone?: 'default' | 'accent' | 'warn' }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs',
        tone === 'default' && 'border-stone-200 bg-stone-100 text-stone-700',
        tone === 'accent' && 'border-amber-700/30 bg-[#f7f0df] text-amber-900',
        tone === 'warn' && 'border-red-900/20 bg-red-50 text-red-900'
      )}
    >
      {children}
    </span>
  )
}

export function ErrorState({
  message,
  onRetry,
  compact,
}: {
  message?: string
  onRetry: () => void
  compact?: boolean
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-stone-300 bg-white/50 text-center',
        compact ? 'p-6' : 'p-10'
      )}
      role="alert"
    >
      <AlertTriangle className="h-6 w-6 text-amber-700" aria-hidden="true" />
      <div>
        <p className="font-medium text-stone-800">Something went wrong</p>
        <p className="mt-1 max-w-sm text-sm text-stone-500">{message ?? 'The archive could not be reached.'}</p>
      </div>
      <Button variant="outline" size="sm" onClick={onRetry} className="gap-1.5">
        <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
        Try again
      </Button>
    </div>
  )
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-stone-300 bg-white/50 p-12 text-center">
      <div className="text-stone-400" aria-hidden="true">
        {icon ?? <Compass className="h-8 w-8" />}
      </div>
      <div>
        <p className="font-serif text-lg text-stone-800">{title}</p>
        {description ? <p className="mt-1 max-w-md text-sm text-stone-500">{description}</p> : null}
      </div>
      {action}
    </div>
  )
}

export function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border border-stone-200 bg-white">
      <Skeleton className="h-10 w-full rounded-none" />
      <div className="space-y-2.5 p-4">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
        <div className="flex gap-1.5 pt-1">
          <Skeleton className="h-5 w-14 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-12 rounded-full" />
        </div>
      </div>
    </div>
  )
}
