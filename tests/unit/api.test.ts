import { describe, expect, it } from 'vitest'
import { synthesize } from '@/lib/blend'
import { handleRpc } from '@/lib/mcp'
import { discover, getAesthetic, listAesthetics, parseDims, suggest } from '@/lib/queries'

type Rpc = { result?: any; error?: { code: number } }

describe('queries', () => {
  it('searches and filters', async () => {
    const res = await listAesthetics({ q: 'deco', pageSize: 5 })
    expect(res.total).toBeGreaterThan(0)
    expect(res.items.length).toBeLessThanOrEqual(5)
    const arch = await listAesthetics({ categories: ['Architectural Style'], pageSize: 3, facets: false })
    expect(arch.items.every((i) => i.category === 'Architectural Style')).toBe(true)
  })

  it('ranks exact name matches first in suggestions', async () => {
    expect((await suggest('bauhaus'))[0]?.slug).toBe('bauhaus')
  })

  it('resolves relations in both directions', async () => {
    const d = await getAesthetic('art-nouveau')
    expect(d!.relations.outgoing.length + d!.relations.incoming.length).toBeGreaterThan(0)
  })

  it('discovers by style profile and ignores unknown dimensions', async () => {
    expect(parseDims('minimal_maximal:10,bogus:50').size).toBe(1)
    const items = await discover(parseDims('minimal_maximal:5,quiet_loud:5'), undefined, 5)
    expect(items).toHaveLength(5)
    expect(items[0].distance).toBeLessThanOrEqual(items[4].distance)
  })

  it('blends deterministically', async () => {
    const [a, b] = await Promise.all([getAesthetic('bauhaus'), getAesthetic('art-nouveau')])
    const x = synthesize(a!.aesthetic, b!.aesthetic)
    expect(synthesize(a!.aesthetic, b!.aesthetic)).toEqual(x)
    expect(x.palette!.length).toBeGreaterThanOrEqual(3)
  })
})

describe('MCP server', () => {
  it('initializes with a supported protocol version', async () => {
    const r = (await handleRpc({ jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2025-06-18' } })) as Rpc
    expect(r.result.protocolVersion).toBe('2025-06-18')
    expect(r.result.capabilities.tools).toBeDefined()
  })

  it('lists and calls tools', async () => {
    const list = (await handleRpc({ jsonrpc: '2.0', id: 2, method: 'tools/list' })) as Rpc
    expect(list.result.tools.map((t: { name: string }) => t.name)).toContain('search_aesthetics')
    const call = (await handleRpc({
      jsonrpc: '2.0',
      id: 3,
      method: 'tools/call',
      params: { name: 'get_aesthetic', arguments: { slug: 'bauhaus' } },
    })) as Rpc
    expect(call.result.content[0].text).toContain('# Bauhaus')
  })

  it('reads resources, errors on unknown methods, ignores notifications', async () => {
    const res = (await handleRpc({ jsonrpc: '2.0', id: 4, method: 'resources/read', params: { uri: 'aesthetic://bauhaus' } })) as Rpc
    expect(res.result.contents[0].text).toContain('Bauhaus')
    const err = (await handleRpc({ jsonrpc: '2.0', id: 5, method: 'nope' })) as Rpc
    expect(err.error!.code).toBe(-32601)
    expect(await handleRpc({ jsonrpc: '2.0', method: 'notifications/initialized' })).toBeNull()
  })
})
