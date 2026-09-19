// Materials & textures glossary (real Wikipedia/Commons photos) built by scripts/data/materials.ts.
import { readFileSync, statSync } from 'node:fs'
import path from 'node:path'

import type { MaterialEntry, ResolvedMaterials } from '@/lib/material-types'
export type { MaterialEntry } from '@/lib/material-types'

const FILE = path.join(process.cwd(), 'public', 'data', 'materials.json')
let cached: { mtime: number; data: Record<string, MaterialEntry> } | null = null

export function getMaterialGlossary(): Record<string, MaterialEntry> {
  try {
    const mtime = statSync(FILE).mtimeMs
    if (!cached || cached.mtime !== mtime) cached = { mtime, data: JSON.parse(readFileSync(FILE, 'utf8')) }
    return cached.data
  } catch {
    return {}
  }
}

/** Look up terms (case/space-insensitive); unknown terms return null. */
export function lookupMaterials(terms: string[]): { term: string; entry: MaterialEntry | null }[] {
  const g = getMaterialGlossary()
  return terms.map((term) => ({ term, entry: g[term.toLowerCase().replace(/\s+/g, ' ').trim()] ?? null }))
}

/** Resolve a record's materials and textures against the glossary (server only). */
export function resolveMaterials(a: { materials: string[]; textures: string[] }): ResolvedMaterials {
  return { materials: lookupMaterials(a.materials), textures: lookupMaterials(a.textures) }
}
