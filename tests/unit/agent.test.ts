import { describe, expect, it } from 'vitest'
import { colorToHex } from '@/lib/ai/colors'
import { AGENT_TOOLS, DEICTIC } from '@/lib/ai/tools'
import { listAesthetics } from '@/lib/queries'

describe('agent tools', () => {
  it('declares well-formed, uniquely named tool schemas', () => {
    const names = AGENT_TOOLS.map((t) => t.name)
    expect(new Set(names).size).toBe(names.length)
    for (const t of AGENT_TOOLS) {
      expect(t.name).toMatch(/^[a-z_]+$/)
      expect(t.description.length).toBeGreaterThan(10)
      for (const r of t.parameters.required) expect(t.parameters.properties[r], `${t.name}.${r}`).toBeDefined()
    }
  })

  it('recognises references to the aesthetic on screen', () => {
    for (const w of ['this', 'it', 'this one', 'This aesthetic']) expect(DEICTIC.test(w)).toBe(true)
    expect(DEICTIC.test('art deco')).toBe(false)
  })

  it('maps colour words and hex codes, and rejects non-colours', () => {
    expect(colorToHex('teal')).toBe('008080')
    expect(colorToHex('#ABC')).toBe('aabbcc')
    expect(colorToHex('#1f4e79')).toBe('1f4e79')
    expect(colorToHex('dusty rose')).toBe('ff007f')
    expect(colorToHex('gothic')).toBeNull()
    expect(colorToHex('Vaporwave')).toBeNull()
  })
})

describe('list filters used by the agent', () => {
  it('filters by place (origin or geography)', async () => {
    const r = await listAesthetics({ place: 'japan', pageSize: 5, facets: false })
    expect(r.total).toBeGreaterThan(20)
    expect(r.items.every((i) => /japan/i.test(`${i.origin} ${i.geography}`))).toBe(true)
  })

  it('filters by overlapping year range, or by start inside it', async () => {
    const active = await listAesthetics({ from: 1920, to: 1929, pageSize: 50, facets: false })
    const began = await listAesthetics({ from: 1920, to: 1929, began: true, pageSize: 50, facets: false })
    expect(active.total).toBeGreaterThan(began.total)
    expect(began.items.every((i) => i.startYear! >= 1920 && i.startYear! <= 1929)).toBe(true)
    expect(active.items.every((i) => i.startYear! <= 1929 && (i.endYear ?? 9999) >= 1920)).toBe(true)
  })
})
