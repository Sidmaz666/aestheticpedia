'use client'

// Browser-side access to the public API (/api/v1) with React Query hooks.
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import type {
  AestheticsResponse,
  ExploreResult,
  SuggestItem,
  TimelineResponse,
} from '@/lib/aesthetic'

async function readError(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as { error?: { message?: string } | string }
    if (typeof body.error === 'string') return body.error
    if (body.error?.message) return body.error.message
  } catch {
    /* not JSON */
  }
  return `Request failed (${res.status})`
}

export async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init)
  if (!res.ok) throw new Error(await readError(res))
  return (await res.json()) as T
}

export const postJson = <T,>(url: string, body: unknown) =>
  fetchJson<T>(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })

export function useAesthetics(queryString: string) {
  return useQuery({
    queryKey: ['aesthetics', queryString],
    queryFn: ({ signal }) => fetchJson<AestheticsResponse>(`/api/v1/aesthetics?${queryString}`, { signal }),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  })
}

export function useSuggest(q: string) {
  const term = q.trim()
  return useQuery({
    queryKey: ['suggest', term],
    queryFn: ({ signal }) => fetchJson<{ items: SuggestItem[] }>(`/api/v1/search?limit=8&q=${encodeURIComponent(term)}`, { signal }),
    enabled: term.length > 0,
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  })
}

export function useTimeline() {
  return useQuery({
    queryKey: ['timeline'],
    queryFn: () => fetchJson<TimelineResponse>('/api/v1/timeline'),
    staleTime: 5 * 60_000,
  })
}

export function useDiscover(dims: string | null, category = '') {
  return useQuery({
    queryKey: ['discover', dims, category],
    queryFn: ({ signal }) =>
      fetchJson<{ items: ExploreResult[] }>(
        `/api/v1/discover?limit=24&dims=${encodeURIComponent(dims ?? '')}${category ? `&category=${encodeURIComponent(category)}` : ''}`,
        { signal }
      ),
    enabled: !!dims,
    placeholderData: keepPreviousData,
  })
}
