import { describe, expect, it } from 'vitest'
import { EXPORT_FORMATS, renderFormat, toCsv, toYaml } from '@/lib/formats'
import { getAesthetic } from '@/lib/queries'

describe('export formats', async () => {
  const d = (await getAesthetic('art-nouveau'))!

  it('loads a real record', () => expect(d.aesthetic.name).toBe('Art Nouveau'))

  it.each(EXPORT_FORMATS.map((f) => f.id))('renders %s', (id) => {
    const out = renderFormat(id, d.aesthetic, d.relations)
    expect(out).not.toBeNull()
    expect(out!.body.length).toBeGreaterThan(20)
  })

  it('markdown carries title, sources and license', () => {
    const md = renderFormat('md', d.aesthetic, d.relations)!.body as string
    expect(md.startsWith('# Art Nouveau')).toBe(true)
    expect(md).toContain('## Sources')
    expect(md).toContain('CC BY-SA 4.0')
  })

  it('JSON and JSON-LD parse', () => {
    expect(JSON.parse(renderFormat('json', d.aesthetic)!.body as string).slug).toBe('art-nouveau')
    expect(JSON.parse(renderFormat('jsonld', d.aesthetic)!.body as string)['@type']).toBe('DefinedTerm')
  })

  it('ASE has the right magic header and one block per colour', () => {
    const ase = renderFormat('ase', d.aesthetic)!.body as Uint8Array
    expect(String.fromCharCode(...ase.slice(0, 4))).toBe('ASEF')
    const blocks = (ase[8] << 24) | (ase[9] << 16) | (ase[10] << 8) | ase[11]
    expect(blocks).toBe(d.aesthetic.colors.length + 2)
  })

  it('CSV quotes fields safely', () => {
    expect(toCsv([{ a: 'x,y', b: 'say "hi"', c: 3 }])).toBe('a,b,c\r\n"x,y","say ""hi""",3\r\n')
  })

  it('YAML quotes ambiguous scalars', () => {
    expect(toYaml({ a: 'yes', b: '1920', c: 'plain' })).toBe('a: "yes"\nb: "1920"\nc: plain')
  })
})

describe('design-system and tool exports', async () => {
  const a = (await getAesthetic('art-nouveau'))!.aesthetic
  const text = (id: string) => renderFormat(id, a)!.body as string
  const bytes = (id: string) => renderFormat(id, a)!.body as Uint8Array

  it('every JSON-based format parses', () => {
    for (const f of EXPORT_FORMATS.filter((x) => x.mime.startsWith('application/json'))) expect(() => JSON.parse(text(f.id)), f.id).not.toThrow()
  })

  it('shadcn/ui theme defines the variables shadcn components read', () => {
    const css = text('shadcn')
    for (const v of ['--background', '--foreground', '--primary', '--primary-foreground', '--border', '--ring', '--radius', '--chart-1']) expect(css).toContain(`${v}:`)
    expect(css).toMatch(/\.dark \{/)
    expect(JSON.parse(text('shadcn-json')).type).toBe('registry:theme')
  })

  it('app themes use valid colour literals', () => {
    expect(text('flutter')).toMatch(/Color\(0xFF[0-9A-F]{6}\)/)
    expect(text('compose')).toMatch(/Color\(0xFF[0-9A-F]{6}\)/)
    expect(text('android')).toMatch(/<color name="[a-z0-9_]+">#[0-9A-F]{6}<\/color>/)
    expect(text('swiftui')).toMatch(/Color\(red: [01]\.\d{3}, green: [01]\.\d{3}, blue: [01]\.\d{3}\)/)
  })

  it('Procreate swatches is a valid stored ZIP with Swatches.json', () => {
    const z = bytes('procreate')
    expect([...z.slice(0, 4)]).toEqual([0x50, 0x4b, 0x03, 0x04])
    const name = new TextDecoder().decode(z.slice(30, 30 + 13))
    expect(name).toBe('Swatches.json')
    const size = z[18] | (z[19] << 8) | (z[20] << 16) | (z[21] << 24)
    const json = JSON.parse(new TextDecoder().decode(z.slice(43, 43 + size)))
    expect(json[0].swatches.length).toBe(a.colors.length)
    expect(json[0].swatches[0].hue).toBeGreaterThanOrEqual(0)
  })

  it('Photoshop .aco starts with a version-1 header and colour count', () => {
    const b = bytes('aco')
    expect((b[0] << 8) | b[1]).toBe(1)
    expect((b[2] << 8) | b[3]).toBe(a.colors.length)
  })
})
