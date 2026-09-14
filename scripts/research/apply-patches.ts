/**
 * Deterministic patch applier — backfills missing fields on EXISTING entries
 * from authored patch files. Same quality bar as the wave seeder: every patch
 * is shape-validated, length-capped, and merged non-destructively with
 * existing JSON. Entries that reach the full depth bar (ctx + visualDNA +
 * typography) are promoted draft → researched.
 *
 * Patch file contract:
 *   export const PATCHES: any[] = [{
 *     slug: 'barbizon-school',            // required, must exist
 *     ctx: 'cultural context prose',      // 80-700 chars
 *     vd: { shape, line, composition, texture },  // >=3 keys, strings
 *     typ: { display, body, notes },      // >=1 of display/body
 *     lit: { quality, temperature, shadow },      // optional, >=2 keys
 *     ui:  { background, surface, components, motion }, // optional, >=2 keys
 *     rec: { materials, lighting, objects, music, scent }, // optional
 *     ex: ['example', ...],               // optional 2-6
 *     obj: ['object', ...],               // optional 2-10
 *     sounds: ['sound', ...],             // optional 1-6
 *   }]
 *
 * Usage:
 *   bun scripts/research/apply-patches.ts /abs/path/patch-file.ts [...]
 */
import { dbp } from './lib'

const VD_KEYS = new Set(['shape', 'line', 'composition', 'texture', 'forms', 'pattern', 'motifs', 'materials'])
const LIT_KEYS = new Set(['quality', 'temperature', 'shadow', 'direction'])
const UI_KEYS = new Set(['background', 'surface', 'components', 'motion', 'typography'])

function str(v: unknown, min: number, max: number): string | null {
  if (typeof v !== 'string') return null
  const s = v.trim()
  if (s.length < min || s.length > max) return null
  return s
}

function strArr(v: unknown, min: number, max: number, cap: number): string[] | null {
  if (!Array.isArray(v)) return null
  const arr = v.filter((x) => typeof x === 'string' && x.trim().length > 1).map((x) => (x as string).trim().slice(0, 120))
  if (arr.length < min || arr.length > max) return null
  return arr.slice(0, cap)
}

function objFilter(v: unknown, allowed: Set<string>, minKeys: number, valMax: number): Record<string, string> | null {
  if (!v || typeof v !== 'object' || Array.isArray(v)) return null
  const out: Record<string, string> = {}
  for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
    if (!allowed.has(k)) continue
    const s = str(val, 2, valMax)
    if (s) out[k] = s
  }
  return Object.keys(out).length >= minKeys ? out : null
}

function mergeObj(existingJson: string, patch: Record<string, string>): string {
  let base: Record<string, string> = {}
  try {
    const parsed = JSON.parse(existingJson)
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) base = parsed
  } catch {}
  return JSON.stringify({ ...base, ...patch })
}

async function applyFile(path: string) {
  const mod = await import(path)
  const patches: any[] = mod.PATCHES
  if (!Array.isArray(patches) || patches.length === 0) {
    console.log(`⚠ ${path}: no PATCHES export or empty`)
    return { applied: 0, skipped: 0, promoted: 0 }
  }
  console.log(`— applying ${patches.length} patches from ${path} —`)
  let applied = 0
  let skipped = 0
  let promoted = 0
  for (const p of patches) {
    if (!p || typeof p !== 'object' || typeof p.slug !== 'string') {
      skipped++
      continue
    }
    const entry = await dbp.aesthetic.findUnique({ where: { slug: p.slug } })
    if (!entry) {
      console.log(`  ✗ ${p.slug}: not found`)
      skipped++
      continue
    }
    const data: Record<string, unknown> = {}
    const appliedKeys: string[] = []

    if (p.ctx !== undefined) {
      const ctx = str(p.ctx, 80, 700)
      if (ctx && !entry.culturalContext) {
        data.culturalContext = ctx
        appliedKeys.push('ctx')
      }
    }
    if (p.vd !== undefined) {
      const vd = objFilter(p.vd, VD_KEYS, 3, 140)
      if (vd) {
        data.visualDNA = mergeObj(entry.visualDNA, vd)
        appliedKeys.push('vd')
      }
    }
    if (p.typ !== undefined) {
      const typ = objFilter(p.typ, new Set(['display', 'body', 'notes', 'displayFont', 'bodyFont']), 1, 160)
      if (typ) {
        data.typography = mergeObj(entry.typography, typ)
        appliedKeys.push('typ')
      }
    }
    if (p.lit !== undefined) {
      const lit = objFilter(p.lit, LIT_KEYS, 2, 120)
      if (lit) {
        data.lighting = mergeObj(entry.lighting, lit)
        appliedKeys.push('lit')
      }
    }
    if (p.ui !== undefined) {
      const ui = objFilter(p.ui, UI_KEYS, 2, 160)
      if (ui) {
        data.uiTranslation = mergeObj(entry.uiTranslation, ui)
        appliedKeys.push('ui')
      }
    }
    if (p.rec !== undefined && entry.recipe === '{}') {
      if (p.rec && typeof p.rec === 'object' && !Array.isArray(p.rec) && Object.keys(p.rec).length >= 2) {
        data.recipe = JSON.stringify(p.rec)
        appliedKeys.push('rec')
      }
    }
    if (p.ex !== undefined && entry.keyExamples === '[]') {
      const ex = strArr(p.ex, 2, 6, 6)
      if (ex) {
        data.keyExamples = JSON.stringify(ex)
        appliedKeys.push('ex')
      }
    }
    if (p.obj !== undefined && entry.objects === '[]') {
      const obj = strArr(p.obj, 2, 10, 10)
      if (obj) {
        data.objects = JSON.stringify(obj)
        appliedKeys.push('obj')
      }
    }
    if (p.sounds !== undefined && entry.sounds === '[]') {
      const snd = strArr(p.sounds, 1, 6, 6)
      if (snd) {
        data.sounds = JSON.stringify(snd)
        appliedKeys.push('snd')
      }
    }

    if (appliedKeys.length === 0) {
      skipped++
      continue
    }

    const afterCtx = (data.culturalContext as string) ?? entry.culturalContext
    const afterVd = (data.visualDNA as string) ?? entry.visualDNA
    const afterTyp = (data.typography as string) ?? entry.typography
    let didPromote = false
    if (entry.status === 'draft' && afterCtx && afterVd !== '{}' && afterTyp !== '{}') {
      data.status = 'researched'
      didPromote = true
    }

    try {
      await dbp.aesthetic.update({ where: { id: entry.id }, data })
      applied++
      if (didPromote) promoted++
    } catch {
      skipped++
    }
  }
  console.log(`  file done: applied=${applied} skipped=${skipped} promoted=${promoted}`)
  return { applied, skipped, promoted }
}

async function main() {
  const files = process.argv.slice(2)
  if (files.length === 0) {
    console.log('usage: bun scripts/research/apply-patches.ts <patch-file.ts> [...]')
    process.exit(1)
  }
  const totals = { applied: 0, skipped: 0, promoted: 0 }
  for (const f of files) {
    const r = await applyFile(f)
    totals.applied += r.applied
    totals.skipped += r.skipped
    totals.promoted += r.promoted
  }
  console.log(`ALL DONE: applied=${totals.applied} skipped=${totals.skipped} promoted=${totals.promoted}`)
  process.exit(0)
}

main().catch((e) => {
  console.error('apply-patches failed:', e)
  process.exit(1)
})
