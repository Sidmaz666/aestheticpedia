import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { handle, ok, options } from '@/lib/api'
import type { DataManifest, ValidationReport } from '@/lib/aesthetic'
import { getCompleteness, getStats } from '@/lib/queries'

export const dynamic = 'force-dynamic'
export const OPTIONS = options

async function readJson<T>(file: string): Promise<T | null> {
  try {
    return JSON.parse(await readFile(path.join(process.cwd(), 'public', 'data', file), 'utf8')) as T
  } catch {
    return null
  }
}

/** GET /api/v1/stats — library counts, coverage, completeness, download manifest and link-check report. */
export const GET = handle('stats', async () => {
  const [stats, completeness, manifest, validation] = await Promise.all([
    getStats(),
    getCompleteness(),
    readJson<DataManifest>('manifest.json'),
    readJson<ValidationReport>('validation.json'),
  ])
  return ok({ ...stats, completeness, manifest, validation })
})
