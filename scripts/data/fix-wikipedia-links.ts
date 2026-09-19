// Undo a wrong Wikipedia match and everything that came with it: the article's images, its
// reference links (Wikipedia, Wikidata, Commons category), the Wikidata id, an origin taken
// from that item, and any palette measured from those images. The correction is recorded in
// data/wikipedia-overrides.json (title → correct article, null → none) so it sticks; then run
// `node scripts/data/images.ts --slug <slug>` for records that now point at a correct article.
//
//   node scripts/data/fix-wikipedia-links.ts
import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { ROOT, loadAesthetics, saveAesthetic } from './lib.ts'

// Reviewed 2026-09-18 from records whose article title does not match their name (see TASKS.md).
const FIXES: Record<string, string | null> = {
  boujee: null,
  'british-countryside': null,
  buchon: null,
  'choco-girl': null,
  cleancore: null,
  'coastal-style': null,
  'early-cyber': null,
  femcel: null,
  fjortis: null,
  ghostcore: null,
  maranza: null,
  mdlr: null,
  nautical: null,
  bodikon: null,
  'goth-punk': 'Deathrock',
  casuals: 'Casual (subculture)',
  'femme-fatale': 'Femme fatale',
  hyperrealism: 'Hyperrealism (visual arts)',
  metalhead: 'Heavy metal subculture',
  'old-web': 'GeoCities',
  'turf-roofed-farmhouse': 'Sod roof',
  flogger: 'Scene (subculture)',
  // Reviewed 2026-09-19 (second audit).
  romanesque: 'Romanesque art',
  'military-goth': 'Goth subculture',
  yanki: 'Yanki',
  pijo: null,
  rokku: null,
  'cyber-stylin': null,
  landevejsriddere: null,
  'dark-girly-and-sweet-girly': null,
  denpa: null,
  'poverty-chic': null,
  gorecore: null,
  'haunted-mound': null,
}
// Origins that came from the wrong Wikidata item.
const WRONG_ORIGIN: Record<string, string> = { 'goth-punk': 'Japan' }

const overridesPath = path.join(ROOT, 'data', 'wikipedia-overrides.json')
const overrides = JSON.parse(readFileSync(overridesPath, 'utf8'))
const bySlug = new Map(loadAesthetics().map((a) => [a.slug, a]))
const wikiUrl = (t: string) => `https://en.wikipedia.org/wiki/${encodeURIComponent(t.replace(/ /g, '_'))}`

for (const [slug, title] of Object.entries(FIXES)) {
  const a = bySlug.get(slug)
  if (!a) continue
  overrides[slug] = title
  const wrong = a.wikipedia
  if (!wrong || wrong === title) continue
  const qid = a.wikidata
  const fromWrong = (url?: string) =>
    !!url && (url === wikiUrl(wrong) || decodeURIComponent(url).replace(/_/g, ' ').endsWith(`/wiki/${wrong}`) || (!!qid && url.endsWith(`/${qid}`)) || /commons\.wikimedia\.org\/wiki\/Category:/.test(url))
  a.references = a.references.filter((r) => !fromWrong(r.url))
  a.sources = a.sources.filter((s) => !fromWrong(s.url))
  a.images = []
  if (a.paletteSource === 'derived') {
    a.colors = []
    delete a.paletteSource
  }
  if (WRONG_ORIGIN[slug] && a.origin === WRONG_ORIGIN[slug]) {
    a.origin = ''
    if (a.geography === WRONG_ORIGIN[slug]) a.geography = ''
  }
  a.wikipedia = null
  a.wikidata = null
  a.updatedAt = new Date().toISOString()
  saveAesthetic(a)
  console.log(`${slug}: removed "${wrong}"${title ? ` → will use "${title}"` : ''}`)
}
writeFileSync(overridesPath, JSON.stringify(overrides, null, 2) + '\n')
