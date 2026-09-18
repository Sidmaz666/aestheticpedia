// Validate data/aesthetics/*.json + data/relations.json, then use DuckDB to
// emit the deployable library bundles into public/data/:
//
//   aesthetics.json      full records, nested JSON (array)
//   aesthetics.ndjson    one record per line (streaming / LLM ingestion)
//   aesthetics.csv       flat table, nested fields as JSON strings
//   aesthetics.parquet   columnar (what the site's API queries)
//   relations.{json,csv,parquet}
//   aestheticpedia.duckdb   both tables in one DuckDB database file
//   manifest.json        counts, checksums, build time
//
//   node scripts/data/build.ts            fail on any schema error
import { createHash } from 'node:crypto'
import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { DuckDBInstance } from '@duckdb/node-api'
import { AestheticSchema, NESTED_FIELDS, RelationSchema, type AestheticRecord } from '../../src/lib/schema.ts'
import { CACHE_DIR, OUT_DIR, ROOT, loadLibrary, orderKeys } from './lib.ts'

const { aesthetics, relations } = loadLibrary()
const errors: string[] = []
const slugs = new Set<string>()
const names = new Map<string, string>()

const clean: AestheticRecord[] = []
for (const raw of aesthetics) {
  const file = (raw as { __file?: string }).__file
  const r = AestheticSchema.safeParse(raw)
  if (!r.success) {
    for (const issue of r.error.issues.slice(0, 5)) errors.push(`${file}: ${issue.path.join('.')} — ${issue.message}`)
    continue
  }
  const a = r.data
  if (file !== `${a.slug}.json`) errors.push(`${file}: file name must be "${a.slug}.json"`)
  if (slugs.has(a.slug)) errors.push(`${file}: duplicate slug "${a.slug}"`)
  const nameKey = a.name.toLowerCase()
  if (names.has(nameKey)) errors.push(`${file}: duplicate name "${a.name}" (also ${names.get(nameKey)})`)
  names.set(nameKey, a.slug)
  slugs.add(a.slug)
  clean.push(orderKeys(a))
}

const relSeen = new Set<string>()
const cleanRels = relations.filter((rel) => {
  const r = RelationSchema.safeParse(rel)
  if (!r.success) {
    errors.push(`relations.json ${rel.from}->${rel.to}: ${r.error.issues[0]?.message}`)
    return false
  }
  if (!slugs.has(rel.from) || !slugs.has(rel.to)) {
    errors.push(`relations.json ${rel.from}->${rel.to}: unknown slug`)
    return false
  }
  const key = `${rel.from}|${rel.to}|${rel.type}`
  if (rel.from === rel.to || relSeen.has(key)) return false
  relSeen.add(key)
  return true
})

if (errors.length) {
  console.error(`✗ ${errors.length} validation error(s):\n  ` + errors.slice(0, 200).join('\n  '))
  process.exit(1)
}

clean.sort((a, b) => a.name.localeCompare(b.name, 'en'))
mkdirSync(OUT_DIR, { recursive: true })
const out = (f: string) => path.join(OUT_DIR, f)

writeFileSync(out('aesthetics.json'), JSON.stringify(clean))
writeFileSync(out('aesthetics.ndjson'), clean.map((a) => JSON.stringify(a)).join('\n') + '\n')
writeFileSync(out('relations.json'), JSON.stringify(cleanRels))
// Materials glossary (real photos for material/texture terms) ships alongside the library.
if (existsSync(path.join(ROOT, 'data', 'materials.json'))) copyFileSync(path.join(ROOT, 'data', 'materials.json'), out('materials.json'))

// Flatten nested values into JSON strings (NDJSON staging file for DuckDB).
const staging = path.join(CACHE_DIR, 'staging')
mkdirSync(staging, { recursive: true })
const flat = clean.map((a) => {
  const o: Record<string, unknown> = { ...a, wikidata: a.wikidata ?? null, wikipedia: a.wikipedia ?? null }
  for (const f of NESTED_FIELDS) o[f] = JSON.stringify(a[f] ?? [])
  return o
})
writeFileSync(path.join(staging, 'a.ndjson'), flat.map((o) => JSON.stringify(o)).join('\n'))
writeFileSync(path.join(staging, 'r.ndjson'), cleanRels.map((o) => JSON.stringify(o)).join('\n'))

const q = (p: string) => `'${p.replace(/\\/g, '/').replace(/'/g, "''")}'`
const INT = new Set(['confidence', 'popularity', 'startYear', 'endYear'])
const columns = [...new Set(flat.flatMap((o) => Object.keys(o)))]
const colSpec = columns
  .map((c) => `"${c}": '${INT.has(c) ? 'INTEGER' : c === 'isNiche' ? 'BOOLEAN' : 'VARCHAR'}'`)
  .join(', ')

const dbFile = out('aestheticpedia.duckdb')
rmSync(dbFile, { force: true })
rmSync(`${dbFile}.wal`, { force: true })
const instance = await DuckDBInstance.create(dbFile)
const db = await instance.connect()
await db.run(
  `CREATE TABLE aesthetics AS SELECT * FROM read_json(${q(path.join(staging, 'a.ndjson'))}, format='newline_delimited', columns={${colSpec}}, maximum_object_size=67108864)`
)
await db.run(
  `CREATE TABLE relations AS SELECT * FROM read_json(${q(path.join(staging, 'r.ndjson'))}, format='newline_delimited', columns={"from":'VARCHAR',"to":'VARCHAR',"type":'VARCHAR',"note":'VARCHAR'})`
)
for (const t of ['aesthetics', 'relations']) {
  await db.run(`COPY ${t} TO ${q(out(`${t}.parquet`))} (FORMAT parquet, COMPRESSION zstd)`)
  await db.run(`COPY ${t} TO ${q(out(`${t}.csv`))} (HEADER, DELIMITER ',')`)
}
const stats = (
  await db.runAndReadAll(`SELECT count(*)::INT AS aesthetics,
    count(DISTINCT category)::INT AS categories,
    count(*) FILTER (WHERE images <> '[]')::INT AS withImages,
    coalesce(sum(json_array_length(images)), 0)::INT AS images,
    coalesce(sum(json_array_length("references")), 0)::INT AS "references",
    count(*) FILTER (WHERE wikidata IS NOT NULL)::INT AS withWikidata
    FROM aesthetics`)
).getRowObjectsJson()[0] as Record<string, number>
db.closeSync()
instance.closeSync()
rmSync(staging, { recursive: true, force: true })

const FILES = [
  'aesthetics.json',
  'aesthetics.ndjson',
  'aesthetics.csv',
  'aesthetics.parquet',
  'relations.json',
  'relations.csv',
  'relations.parquet',
  'aestheticpedia.duckdb',
]
const manifest = {
  name: 'Aestheticpedia',
  license: 'CC BY-SA 4.0 (text); images carry their own licenses',
  builtAt: new Date().toISOString(),
  counts: { ...stats, relations: cleanRels.length },
  files: FILES.map((f) => ({
    name: f,
    path: `/data/${f}`,
    bytes: statSync(out(f)).size,
    sha256: createHash('sha256').update(readFileSync(out(f))).digest('hex'),
  })),
}
writeFileSync(out('manifest.json'), JSON.stringify(manifest, null, 2) + '\n')
console.log('✓ built', manifest.counts)
