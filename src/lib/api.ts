// Response helpers for the public API: CORS, caching and consistent errors.
import { NextResponse } from 'next/server'

export const API_VERSION = '1.0.0'

export const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Accept, Mcp-Session-Id, Mcp-Protocol-Version, Last-Event-ID',
  'Access-Control-Expose-Headers': 'Mcp-Session-Id, X-Total-Count, X-Offset, X-Count, Link',
}

const CACHE = 'public, max-age=60, s-maxage=300, stale-while-revalidate=86400'

export function ok(data: unknown, init: { headers?: Record<string, string>; cache?: boolean } = {}) {
  return NextResponse.json(data, {
    headers: { ...CORS_HEADERS, ...(init.cache === false ? { 'Cache-Control': 'no-store' } : { 'Cache-Control': CACHE }), ...init.headers },
  })
}

export function raw(body: BodyInit, contentType: string, headers: Record<string, string> = {}) {
  return new Response(body, { headers: { ...CORS_HEADERS, 'Content-Type': contentType, 'Cache-Control': CACHE, ...headers } })
}

export function fail(status: number, message: string, details?: unknown) {
  return NextResponse.json({ error: { status, message, ...(details ? { details } : {}) } }, { status, headers: CORS_HEADERS })
}

export function options() {
  return new Response(null, { status: 204, headers: { ...CORS_HEADERS, 'Access-Control-Max-Age': '86400' } })
}

/** Wrap a handler so unexpected errors become JSON 500s (and get logged). */
export function handle<A extends unknown[]>(name: string, fn: (...args: A) => Promise<Response>) {
  return async (...args: A): Promise<Response> => {
    try {
      return await fn(...args)
    } catch (err) {
      console.error(`[api] ${name} failed:`, err)
      return fail(500, `${name} failed`)
    }
  }
}
