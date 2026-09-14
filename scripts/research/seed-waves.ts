/**
 * Deterministic curated-wave seeder.
 *
 * Insert agent-authored entry files WITHOUT any LLM dependency — used when
 * the platform LLM quota is exhausted but the library must keep growing.
 *
 * Usage:
 *   bun scripts/research/seed-waves.ts scripts/research/waves/<file>.ts [...more files]
 *
 * Each wave file must export `ENTRIES: any[]` in the compact curated format
 * PLUS an explicit `cat` (category) per entry. Every entry is validated by the
 * same validateEntry()/insertEntry() path as LLM discoveries: dedupe against
 * the full known-name index, tiered sources, auto-generated external reference
 * deep links, and typed relation edges.
 */
import { dbp, validateEntry, insertEntry, ensureKnownNames, sleep } from './lib'

async function seedFile(path: string) {
  const mod = await import(path)
  const entries: any[] = mod.ENTRIES
  if (!Array.isArray(entries) || entries.length === 0) {
    console.log(`⚠ ${path}: no ENTRIES export or empty array`)
    return { ok: 0, dup: 0, fail: 0, invalid: 0 }
  }
  console.log(`— seeding ${entries.length} entries from ${path} —`)
  await ensureKnownNames()
  let ok = 0
  let dup = 0
  let fail = 0
  let invalid = 0
  for (const raw of entries) {
    if (!raw || typeof raw !== 'object' || !raw.cat) {
      invalid++
      continue
    }
    const entry = validateEntry(raw, raw.cat)
    if ('error' in entry) {
      console.log(`  ✗ ${raw.n ?? '(unnamed)'}: ${entry.error}`)
      invalid++
      continue
    }
    const res = await insertEntry(entry as any, { status: 'verified' })
    if (res.ok) {
      ok++
      console.log(`  ✓ ${entry.name} [${(entry as any).category}]`)
    } else if (res.reason === 'duplicate' || res.reason === 'duplicate-alias') {
      dup++
      console.log(`  = ${entry.name}: ${res.reason}`)
    } else {
      fail++
      console.log(`  ✗ ${entry.name}: ${res.reason ?? 'insert failed'}`)
    }
    await sleep(5)
  }
  console.log(`→ ${path}: ${ok} inserted, ${dup} duplicates skipped, ${fail} failed, ${invalid} invalid`)
  return { ok, dup, fail, invalid }
}

async function main() {
  const files = process.argv.slice(2)
  if (files.length === 0) {
    console.log('usage: bun scripts/research/seed-waves.ts <wave-file.ts> [...]')
    process.exit(1)
  }
  const totals = { ok: 0, dup: 0, fail: 0, invalid: 0 }
  for (const f of files) {
    const r = await seedFile(f)
    totals.ok += r.ok
    totals.dup += r.dup
    totals.fail += r.fail
    totals.invalid += r.invalid
  }
  const count = await dbp.aesthetic.count()
  console.log(`TOTAL INSERTED: ${totals.ok} | LIBRARY COUNT: ${count}`)
  process.exit(0)
}

main().catch((e) => {
  console.error('seed-waves failed:', e)
  process.exit(1)
})
