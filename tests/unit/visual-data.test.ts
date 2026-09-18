import { describe, expect, it } from 'vitest'
import { getColorIndex, getGraph, searchByColor } from '@/lib/queries'

describe('visualisation data', () => {
  it('builds a consistent relationship graph', async () => {
    const { nodes, links } = await getGraph()
    expect(nodes.length).toBeGreaterThan(500)
    const ids = new Set(nodes.map((n) => n.slug))
    expect(links.every((l) => ids.has(l.source) && ids.has(l.target))).toBe(true)
    expect(nodes[0].degree).toBeGreaterThanOrEqual(nodes[nodes.length - 1].degree)
  })

  it('indexes every palette colour', async () => {
    const colors = await getColorIndex()
    expect(colors.length).toBeGreaterThan(3000)
    expect(colors.every((c) => /^#[0-9a-f]{6}$/i.test(c.hex))).toBe(true)
  })

  it('finds records by colour, closest first', async () => {
    const items = await searchByColor('#c9a227', 10)
    expect(items).toHaveLength(10)
    expect(items[0].distance).toBeLessThanOrEqual(items[9].distance)
    expect(items[0].match).toMatch(/^#[0-9a-f]{6}$/i)
  })
})
