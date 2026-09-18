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
