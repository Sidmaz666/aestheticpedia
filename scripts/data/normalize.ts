// Repair common shape defects in data/aesthetics/*.json before validation.
//   node scripts/data/normalize.ts
import { loadLibrary, saveAesthetic, saveRelations, slugify } from './lib.ts'
import { parseYear } from './years.ts'

const { aesthetics, relations } = loadLibrary()
const isUrl = (u: unknown): u is string => {
  if (typeof u !== 'string' || !/^https?:\/\//.test(u) || /\s/.test(u)) return false
  try {
    new URL(u)
    return true
  } catch {
    return false
  }
}
const hex6 = (h: unknown): string | null => {
  if (typeof h !== 'string') return null
  let s = h.trim().toLowerCase()
  if (!s.startsWith('#')) s = '#' + s
  if (/^#[0-9a-f]{3}$/.test(s)) s = '#' + [...s.slice(1)].map((c) => c + c).join('')
  return /^#[0-9a-f]{6}$/.test(s) ? s : null
}
// Same rule as scripts/data/images.ts: maps/diagrams/logos are not examples of an aesthetic.
const NOT_EXAMPLE =
  /\b(maps?|karte|carte|mapa|mappa|verbreitung|distribution|locator|location|sites with|extent of|territor(y|ies)|floor ?plan|ground ?plan|diagram|chart|graph|timeline|family tree|flowchart|coat of arms|flag of|logo|seal of|signature)\b/i
const SEARCH_LINK =
  /^https:\/\/(www\.youtube\.com\/results|scholar\.google\.com\/scholar\?|www\.google\.com\/search|archive\.org\/search|artsandculture\.google\.com\/search|www\.pinterest\.com\/search|commons\.wikimedia\.org\/w\/index\.php\?search)/
const uniqStr =(xs: unknown[]) => [
  ...new Set(xs.filter((x): x is string => typeof x === 'string').map((x) => x.trim()).filter(Boolean)),
]

let fixes = 0
for (const a of aesthetics as any[]) {
  const before = JSON.stringify(a)
  // Year range: "present" means open-ended; recompute inverted ranges from the labels.
  if (a.endYear !== null && /present|today|ongoing|current|contemporary/i.test(a.periodEnd || a.periodStart)) a.endYear = null
  if (a.startYear !== null && a.startYear >= 0 && /\b(bce|bc)\b/i.test(a.periodStart) && !/\bce\b/i.test(a.periodStart.replace(/bce/gi, ''))) {
    a.startYear = parseYear(a.periodStart, 'start') ?? a.startYear
  }
  if (a.startYear !== null && a.endYear !== null && a.endYear < a.startYear) {
    const s = parseYear(a.periodStart, 'start')
    const e = parseYear(a.periodEnd || '', 'end')
    a.startYear = s ?? a.startYear
    a.endYear = e !== null && e >= (s ?? a.startYear) ? e : null
  }
  a.slug = slugify(a.slug) || slugify(a.name)
  a.colors = (a.colors ?? [])
    .map((c: any) => ({ hex: hex6(c?.hex ?? c?.h), name: String(c?.name ?? c?.n ?? '').trim() }))
    .filter((c: any) => c.hex)
  a.sources = (a.sources ?? [])
    .map((s: any) => {
      const o: any = { name: String(s?.name ?? '').trim() }
      // A source whose link failed validation keeps its citation but loses the dead URL.
      if (isUrl(s?.url) && s?.check?.ok !== false) o.url = s.url
      if (['A', 'B', 'C', 'D'].includes(s?.tier)) o.tier = s.tier
      if (s?.check && o.url) o.check = s.check
      return o
    })
    .filter((s: any) => s.name)
  // References: only real, working pages. Dead links (failed check) and generic search-engine
  // queries ("search YouTube for X") are not references and are removed.
  a.references = (a.references ?? []).filter(
    (r: any) => isUrl(r?.url) && r?.title && r?.check?.ok !== false && !SEARCH_LINK.test(r.url)
  )
  a.images = (a.images ?? []).filter(
    (i: any) => i?.check?.ok !== false && !NOT_EXAMPLE.test(`${decodeURIComponent(String(i.url).split('/').pop() ?? '')} ${i.caption ?? ''}`.replace(/_/g, ' '))
  )
  a.images = (a.images ?? []).filter((i: any) => isUrl(i?.url))
  for (const f of ['aliases', 'materials', 'textures', 'objects', 'keyExamples', 'sounds', 'tags']) a[f] = uniqStr(a[f] ?? [])
  for (const f of ['summary', 'description', 'culturalContext', 'origin', 'geography', 'era', 'periodStart', 'periodEnd'])
    a[f] = String(a[f] ?? '').trim()
  for (const f of ['emotionProfile', 'dnaAxes']) {
    const o: Record<string, number> = {}
    for (const [k, v] of Object.entries(a[f] ?? {})) {
      const n = Number(v)
      if (Number.isFinite(n)) o[k] = Math.max(0, Math.min(100, Math.round(n)))
    }
    // A profile where every score is identical (e.g. all 50) is a placeholder, not an assessment.
    const vals = Object.values(o)
    a[f] = vals.length && new Set(vals).size === 1 ? {} : o
  }
  if (JSON.stringify(a) !== before) {
    fixes++
    saveAesthetic(a)
  }
}
saveRelations(relations)
console.log(`normalized ${fixes} records`)
