// Validate the library and report quality gaps.
//
//   node scripts/data/validate.ts                   schema + integrity (fails on errors) + quality summary
//   node scripts/data/validate.ts --strict a b …    also enforce the contribution bar on the given files
//   node scripts/data/validate.ts --json            machine-readable report
//
// Also regenerates data/schema.json (JSON Schema for editors) from the zod schema.
import { writeFileSync } from 'node:fs'
import path from 'node:path'
import { z } from 'zod'
import { AestheticSchema, type AestheticRecord } from '../../src/lib/schema.ts'
import { ROOT, loadLibrary } from './lib.ts'

const args = process.argv.slice(2)
const JSON_OUT = args.includes('--json')
const strictIdx = args.indexOf('--strict')
const strictFiles = new Set(strictIdx >= 0 ? args.slice(strictIdx + 1).filter((a) => !a.startsWith('--')).map((f) => path.basename(f)) : [])

// Editor support: VS Code maps data/aesthetics/*.json to this schema (.vscode/settings.json).
const jsonSchema = z.toJSONSchema(AestheticSchema, { target: 'draft-2020-12', unrepresentable: 'any' })
writeFileSync(path.join(ROOT, 'data', 'schema.json'), JSON.stringify({ title: 'Aestheticpedia record', ...jsonSchema }, null, 2) + '\n')

const { aesthetics, relations } = loadLibrary()
const errors: string[] = []
const warnings = new Map<string, string[]>()
const warn = (slug: string, msg: string) => {
  if (!warnings.has(slug)) warnings.set(slug, [])
  warnings.get(slug)!.push(msg)
}

/** The bar a new or edited record must meet to be merged. */
function qualityIssues(a: AestheticRecord): string[] {
  const out: string[] = []
  if (a.summary.length < 40) out.push('summary shorter than 40 characters')
  if (a.description.length < 200) out.push('description shorter than 200 characters')
  if (a.colors.length < 3) out.push('fewer than 3 palette colours')
  if (!a.periodStart && a.startYear === null) out.push('no period or start year')
  if (!a.origin && !a.geography) out.push('no origin or geography')
  if (!a.sources.some((s) => s.url)) out.push('no source with a URL')
  if (!a.images.length) out.push('no images')
  if (a.images.some((i) => !i.license && i.source !== 'Art Institute of Chicago')) out.push('image without a license')
  if (a.images.some((i) => !i.pageUrl)) out.push('image without a source page (pageUrl)')
  if (!a.wikipedia && !a.wikidata) out.push('no Wikipedia/Wikidata link (fine for niche aesthetics — mention sources instead)')
  return out
}

const slugs = new Set<string>()
const names = new Map<string, string>()
for (const raw of aesthetics) {
  const file = (raw as { __file?: string }).__file ?? '?'
  const r = AestheticSchema.safeParse(raw)
  if (!r.success) {
    for (const i of r.error.issues.slice(0, 8)) errors.push(`${file}: ${i.path.join('.') || '(root)'} — ${i.message}`)
    continue
  }
  const a = r.data
  if (file !== `${a.slug}.json`) errors.push(`${file}: file name must equal slug ("${a.slug}.json")`)
  if (slugs.has(a.slug)) errors.push(`${file}: duplicate slug`)
  const key = a.name.toLowerCase()
  if (names.has(key)) errors.push(`${file}: duplicate name "${a.name}" (also ${names.get(key)})`)
  slugs.add(a.slug)
  names.set(key, a.slug)
  if (a.startYear !== null && a.endYear !== null && a.endYear < a.startYear) errors.push(`${file}: endYear before startYear`)
  for (const issue of qualityIssues(a)) {
    if (strictFiles.has(file) && !issue.startsWith('no Wikipedia')) errors.push(`${file}: ${issue}`)
    else warn(a.slug, issue)
  }
}
for (const rel of relations) {
  if (!slugs.has(rel.from)) errors.push(`relations.json: unknown "from" slug ${rel.from}`)
  if (!slugs.has(rel.to)) errors.push(`relations.json: unknown "to" slug ${rel.to}`)
}

const counts = new Map<string, number>()
for (const list of warnings.values()) for (const w of list) counts.set(w, (counts.get(w) ?? 0) + 1)
const report = {
  records: aesthetics.length,
  relations: relations.length,
  errors,
  quality: {
    recordsWithGaps: warnings.size,
    byIssue: Object.fromEntries([...counts.entries()].sort((a, b) => b[1] - a[1])),
  },
}

if (JSON_OUT) console.log(JSON.stringify(report, null, 2))
else {
  console.log(`${aesthetics.length} records · ${relations.length} relations`)
  console.log('\nQuality gaps (records affected):')
  for (const [k, v] of Object.entries(report.quality.byIssue)) console.log(`  ${String(v).padStart(5)}  ${k}`)
  if (errors.length) console.error(`\n✗ ${errors.length} error(s):\n  ${errors.slice(0, 100).join('\n  ')}`)
  else console.log('\n✓ schema and integrity checks passed')
}
process.exit(errors.length ? 1 : 0)
