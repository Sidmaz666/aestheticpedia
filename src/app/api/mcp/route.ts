import type { NextRequest } from 'next/server'
import { CORS_HEADERS, options } from '@/lib/api'
import { SERVER_INFO, SUPPORTED_VERSIONS, handleRpc, type RpcRequest } from '@/lib/mcp'
import { SITE_URL } from '@/lib/formats'

export const dynamic = 'force-dynamic'
export const OPTIONS = options

const reply = (body: unknown, status = 200) =>
  new Response(body === null ? null : JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  })

/**
 * POST /api/mcp — MCP Streamable HTTP endpoint (stateless; responds with JSON).
 * Accepts a single JSON-RPC message or a batch array (2025-03-26 clients).
 */
export async function POST(req: NextRequest) {
  const version = req.headers.get('mcp-protocol-version')
  if (version && !SUPPORTED_VERSIONS.includes(version))
    return reply({ jsonrpc: '2.0', id: null, error: { code: -32600, message: `Unsupported protocol version ${version}` } }, 400)

  let payload: unknown
  try {
    payload = await req.json()
  } catch {
    return reply({ jsonrpc: '2.0', id: null, error: { code: -32700, message: 'Parse error' } }, 400)
  }

  if (Array.isArray(payload)) {
    const results = (await Promise.all(payload.map((m) => handleRpc(m as RpcRequest)))).filter(Boolean)
    return results.length ? reply(results) : reply(null, 202)
  }
  const result = await handleRpc(payload as RpcRequest)
  return result ? reply(result) : reply(null, 202)
}

/** GET — no server-initiated stream; return a human/agent readable description instead of 405 for browsers. */
export async function GET(req: NextRequest) {
  if ((req.headers.get('accept') ?? '').includes('text/event-stream')) return new Response(null, { status: 405, headers: { ...CORS_HEADERS, Allow: 'POST, OPTIONS' } })
  return reply({
    ...SERVER_INFO,
    transport: 'streamable-http',
    endpoint: `${SITE_URL}/api/mcp`,
    protocolVersions: SUPPORTED_VERSIONS,
    usage: 'POST JSON-RPC 2.0 messages (initialize, tools/list, tools/call, resources/read, prompts/get).',
    docs: `${SITE_URL}/data#mcp`,
  })
}

export async function DELETE() {
  return new Response(null, { status: 405, headers: { ...CORS_HEADERS, Allow: 'POST, OPTIONS' } })
}
