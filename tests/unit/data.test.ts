import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { AestheticSchema, RelationSchema } from '@/lib/schema'

const dir = path.join(process.cwd(), 'data', 'aesthetics')
const files = readdirSync(dir).filter((f) => f.endsWith('.json'))
const records = files.map((f) => ({ file: f, data: JSON.parse(readFileSync(path.join(dir, f), 'utf8')) }))
const STANDARD_WIDTHS = [120, 250, 330, 500, 960, 1280, 1920]

describe('data/aesthetics', () => {
  it('has a large library', () => expect(records.length).toBeGreaterThan(1000))

  it('every record passes the schema and matches its file name', () => {
    const bad = records
      .map(({ file, data }) => {
        const r = AestheticSchema.safeParse(data)
        if (!r.success) return `${file}: ${r.error.issues[0]?.path.join('.')} ${r.error.issues[0]?.message}`
        return file === `${r.data.slug}.json` ? null : `${file}: slug mismatch`
      })
      .filter(Boolean)
    expect(bad).toEqual([])
  })

  it('slugs and names are unique', () => {
    const slugs = records.map((r) => r.data.slug)
    const names = records.map((r) => String(r.data.name).toLowerCase())
    expect(new Set(slugs).size).toBe(slugs.length)
    expect(new Set(names).size).toBe(names.length)
  })

  it('never references the dead sandbox image CDN', () => {
    expect(records.filter((r) => JSON.stringify(r.data.images).includes('chatglm')).map((r) => r.file)).toEqual([])
  })

  it('uses only standard Wikimedia thumbnail widths', () => {
    const bad = records.flatMap((r) =>
      (r.data.images as { url: string; thumb?: string }[])
        .flatMap((i) => [i.url, i.thumb ?? ''])
        .filter((u) => {
          const m = /\/(\d+)px-[^/]*$/.exec(u)
          return m !== null && !STANDARD_WIDTHS.includes(Number(m[1]))
        })
    )
    expect(bad).toEqual([])
  })

  it('every image is attributed with a source page', () => {
    const bad = records.flatMap((r) =>
      (r.data.images as { source?: string; pageUrl?: string }[]).filter((i) => !i.source || !i.pageUrl).map(() => r.file)
    )
    expect(bad).toEqual([])
  })

  it('year ranges are ordered', () => {
    const bad = records.filter(({ data }) => data.startYear !== null && data.endYear !== null && data.endYear < data.startYear)
    expect(bad.map((r) => r.file)).toEqual([])
  })

  it('relations are valid and point at existing records', () => {
    const rels = JSON.parse(readFileSync(path.join(process.cwd(), 'data', 'relations.json'), 'utf8'))
    const slugs = new Set(records.map((r) => r.data.slug))
    const bad = rels.filter((rel: { from: string; to: string }) => !RelationSchema.safeParse(rel).success || !slugs.has(rel.from) || !slugs.has(rel.to))
    expect(bad).toEqual([])
  })
})

describe('curated corrections stick', () => {
  const bySlug = new Map(records.map((r) => [r.data.slug, r.data]))
  const overrides = JSON.parse(readFileSync(path.join(process.cwd(), 'data', 'wikipedia-overrides.json'), 'utf8')) as Record<string, string | null>

  it('records follow their Wikipedia overrides (no wrong article, images or Wikidata id)', () => {
    const bad: string[] = []
    for (const [slug, title] of Object.entries(overrides)) {
      const a = bySlug.get(slug)
      if (!a || slug.startsWith('$')) continue
      if (title === null && a.wikipedia) bad.push(`${slug}: should have no article, has ${a.wikipedia}`)
      if (title && a.wikipedia && a.wikipedia !== title) bad.push(`${slug}: ${a.wikipedia} ≠ ${title}`)
    }
    expect(bad).toEqual([])
  })

  it('hand-curated image sets are present', () => {
    const { slugs } = JSON.parse(readFileSync(path.join(process.cwd(), 'data', 'curated-images.json'), 'utf8')) as { slugs: string[] }
    for (const s of slugs) expect(bySlug.get(s)?.images.length, s).toBeGreaterThan(2)
  })
})
