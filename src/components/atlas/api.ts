'use client'

import { useQuery } from '@tanstack/react-query'
import type {
  AestheticDetailResponse,
  AestheticsResponse,
  ExploreResult,
  PipelineResponse,
  StatsResponse,
  SuggestItem,
  TimelineResponse,
} from '@/lib/aesthetic'

export async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) {
    let message = `Request failed (${res.status})`
    try {
      const body = (await res.json()) as { error?: string }
      if (body?.error) message = body.error
    } catch {
      // keep default message
    }
    throw new Error(message)
  }
  return res.json() as Promise<T>
}

export async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    let message = `Request failed (${res.status})`
    try {
      const data = (await res.json()) as { error?: string }
      if (data?.error) message = data.error
    } catch {
      // keep default message
    }
    throw new Error(message)
  }
  return res.json() as Promise<T>
}

export function useAesthetics(queryString: string) {
  return useQuery({
    queryKey: ['aesthetics', queryString],
    queryFn: () => fetchJson<AestheticsResponse>(`/api/aesthetics?${queryString}`),
    placeholderData: (prev) => prev,
  })
}

export function useAestheticDetail(slug: string | null, enabled: boolean) {
  return useQuery({
    queryKey: ['aesthetic', slug],
    queryFn: () => fetchJson<AestheticDetailResponse>(`/api/aesthetics/${slug}`),
    enabled: enabled && !!slug,
    staleTime: 60_000,
  })
}

export function useSuggest(q: string, enabled: boolean) {
  return useQuery({
    queryKey: ['suggest', q],
    queryFn: () => fetchJson<{ items: SuggestItem[] }>(`/api/suggest?q=${encodeURIComponent(q)}`),
    enabled: enabled && q.trim().length >= 2,
    staleTime: 30_000,
  })
}

export function useTimeline() {
  return useQuery({
    queryKey: ['timeline'],
    queryFn: () => fetchJson<TimelineResponse>('/api/timeline'),
    staleTime: 30_000,
  })
}

export function usePipeline() {
  return useQuery({
    queryKey: ['pipeline'],
    queryFn: () => fetchJson<PipelineResponse>('/api/pipeline'),
    staleTime: 10_000,
  })
}

export interface AuditResponse {
  total: number
  target: number
  targetProgress: number
  completeness: {
    core: number
    deep: number
    gaps: Array<{ field: string; missing: number }>
  }
  status: { verified: number; researched: number; draft: number; flagged: number }
  generatedAt: string
}

export function useAudit() {
  return useQuery({
    queryKey: ['audit'],
    queryFn: () => fetchJson<AuditResponse>('/api/audit'),
    staleTime: 15_000,
  })
}

export function useExplore(dims: string | null) {
  return useQuery({
    queryKey: ['explore', dims],
    queryFn: () => fetchJson<{ items: ExploreResult[] }>(`/api/explore?dims=${encodeURIComponent(dims ?? '')}`),
    enabled: !!dims,
  })
}

export function useStats() {
  return useQuery({
    queryKey: ['stats'],
    queryFn: () => fetchJson<StatsResponse>('/api/stats'),
    staleTime: 15_000,
  })
}
