import { expect, test } from '@playwright/test'

test('REST API endpoints respond with CORS', async ({ request }) => {
  for (const path of [
    '/api/v1',
    '/api/v1/aesthetics?q=deco&pageSize=3',
    '/api/v1/aesthetics/bauhaus',
    '/api/v1/search?q=vapor',
    '/api/v1/timeline',
    '/api/v1/discover?dims=warmth:80',
    '/api/v1/blend?a=bauhaus&b=art-nouveau',
    '/api/v1/categories',
    '/api/v1/stats',
    '/api/v1/formats',
    '/api/v1/graph',
    '/api/v1/colors?hex=c9a227',
    '/api/v1/openapi.json',
  ]) {
    const res = await request.get(path)
    expect(res.status(), path).toBe(200)
    expect(res.headers()['access-control-allow-origin'], path).toBe('*')
  }
  expect((await request.get('/api/v1/aesthetics/does-not-exist')).status()).toBe(404)
})

test('every export format downloads', async ({ request }) => {
  const { formats } = await (await request.get('/api/v1/formats')).json()
  for (const f of formats as { id: string; mime: string }[]) {
    const res = await request.get(`/api/v1/aesthetics/art-deco?format=${f.id}`)
    expect(res.status(), f.id).toBe(200)
    expect(res.headers()['content-type'], f.id).toContain(f.mime.split(';')[0])
    expect((await res.body()).length, f.id).toBeGreaterThan(20)
  }
})

test('MCP server speaks JSON-RPC over HTTP', async ({ request }) => {
  const rpc = async (method: string, params?: unknown, id: number | null = 1) =>
    request.post('/api/mcp', { data: { jsonrpc: '2.0', ...(id === null ? {} : { id }), method, params } })
  const init = await (await rpc('initialize', { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'e2e', version: '1' } })).json()
  expect(init.result.serverInfo.name).toBeTruthy()
  expect((await rpc('notifications/initialized', undefined, null)).status()).toBe(202)
  const tools = await (await rpc('tools/list')).json()
  expect(tools.result.tools.length).toBeGreaterThanOrEqual(5)
  const call = await (await rpc('tools/call', { name: 'search_aesthetics', arguments: { query: 'baroque', limit: 3 } })).json()
  expect(call.result.content[0].text).toMatch(/Baroque/i)
})

test('AI discovery files are served', async ({ request }) => {
  for (const [path, needle] of [
    ['/llms.txt', '## Machine access'],
    ['/robots.txt', 'Sitemap:'],
    ['/sitemap.xml', '/aesthetics/'],
    ['/.well-known/mcp.json', 'streamable-http'],
    ['/data/manifest.json', 'aesthetics.parquet'],
  ] as const) {
    const res = await request.get(path)
    expect(res.status(), path).toBe(200)
    expect(await res.text(), path).toContain(needle)
  }
})
