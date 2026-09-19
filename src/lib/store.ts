// Aesthetic Atlas — read-only data store.
//
// The library lives in plain files:
//   data/aesthetics/<slug>.json + data/relations.json   canonical source (one file per aesthetic)
//   public/data/*.parquet   columnar build output (scripts/data/build.ts), deployed statically
//   public/data/*.{json,ndjson,csv,duckdb}   full-library downloads
//
// At runtime an in-memory DuckDB instance loads the Parquet files and every API
// route queries it with SQL. Nested fields (colors, images, references…) are
// JSON strings in Parquet so the row shape matches `AestheticRow` exactly.
// The files are re-read automatically when the Parquet build changes on disk.
import { statSync } from 'node:fs'
import path from 'node:path'
import { DuckDBInstance, type DuckDBConnection, type DuckDBValue } from '@duckdb/node-api'
import { AIC_IIIF, AIC_RELAY } from './image-url'

const DATA_DIR = path.join(process.cwd(), 'public', 'data')
const AESTHETICS = path.join(DATA_DIR, 'aesthetics.parquet')
const RELATIONS = path.join(DATA_DIR, 'relations.parquet')

interface StoreState {
  conn: DuckDBConnection
  version: number
}

const g = globalThis as unknown as { __atlasStore?: Promise<StoreState> }

function dataVersion(): number {
  return statSync(AESTHETICS).mtimeMs + statSync(RELATIONS).mtimeMs
}

const sqlPath = (p: string) => `'${p.replace(/\\/g, '/').replace(/'/g, "''")}'`

async function open(): Promise<StoreState> {
  const version = dataVersion()
  const instance = await DuckDBInstance.create(':memory:')
  const conn = await instance.connect()
  // Art Institute of Chicago images are served through the site's relay (src/lib/image-url.ts).
  await conn.run(
    `CREATE TABLE aesthetics AS SELECT * REPLACE (replace(images, '${AIC_IIIF}', '${AIC_RELAY}') AS images) FROM read_parquet(${sqlPath(AESTHETICS)})`
  )
  await conn.run(`CREATE TABLE relations AS SELECT * FROM read_parquet(${sqlPath(RELATIONS)})`)
  return { conn, version }
}

async function store(): Promise<DuckDBConnection> {
  let current = g.__atlasStore
  if (current) {
    const state = await current.catch(() => null)
    if (!state || state.version !== dataVersion()) current = undefined
  }
  if (!current) {
    current = open()
    g.__atlasStore = current
    current.catch(() => {
      if (g.__atlasStore === current) g.__atlasStore = undefined
    })
  }
  return (await current).conn
}

/**
 * Run a parameterised query and return plain JSON-safe row objects.
 * Use `$1, $2…` placeholders. Cast aggregates to INT/DOUBLE in SQL — BIGINT
 * values come back as strings.
 */
export async function query<T = Record<string, unknown>>(sql: string, params: DuckDBValue[] = []): Promise<T[]> {
  const conn = await store()
  const reader = await conn.runAndReadAll(sql, params)
  return reader.getRowObjectsJson() as unknown as T[]
}

export async function queryOne<T = Record<string, unknown>>(sql: string, params: DuckDBValue[] = []): Promise<T | null> {
  const rows = await query<T>(sql, params)
  return rows[0] ?? null
}

/** Build a `$n, $n+1, …` placeholder list for an IN (...) clause. */
export function placeholders(count: number, start = 1): string {
  return Array.from({ length: count }, (_, i) => `$${start + i}`).join(', ')
}
