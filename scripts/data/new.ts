// Scaffold a new aesthetic record, pre-filled from Wikipedia/Wikidata where possible.
//
//   npm run data:new -- "Art Deco"
//   npm run data:new -- "Kawaii" --category "Internet Aesthetic" --type internet_aesthetic
//   npm run data:new -- "Chinoiserie" --wikipedia "Chinoiserie"
//
// Creates data/aesthetics/<slug>.json, fetches images for it, and prints what still needs
// writing by hand (palette, visual grammar, sources…). Run `npm run data:validate` after editing.
import { existsSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { CATEGORIES, ESTABLISHMENTS, type AestheticRecord } from '../../src/lib/schema.ts'
import { SRC_DIR, getJSON, loadAesthetics, saveAesthetic, slugify } from './lib.ts'

const args = process.argv.slice(2)
const opt = (k: string) => (args.includes(k) ? args[args.indexOf(k) + 1] : undefined)
const name = args.find((a, i) => !a.startsWith('--') && !args[i - 1]?.startsWith('--'))
if (!name) {
  console.error('Usage: npm run data:new -- "Aesthetic name" [--category "…"] [--type historical] [--wikipedia "Title"]')
  process.exit(1)
}
const category = (opt('--category') ?? 'Art Movement') as AestheticRecord['category']
const establishment = (opt('--type') ?? 'historical') as AestheticRecord['establishment']
if (!CATEGORIES.includes(category)) throw new Error(`--category must be one of: ${CATEGORIES.join(', ')}`)
if (!ESTABLISHMENTS.includes(establishment)) throw new Error(`--type must be one of: ${ESTABLISHMENTS.join(', ')}`)

const slug = slugify(name)
if (existsSync(path.join(SRC_DIR, `${slug}.json`))) throw new Error(`${slug}.json already exists`)
const clash = loadAesthetics().find((a) => a.name.toLowerCase() === name.toLowerCase() || a.aliases.some((x) => x.toLowerCase() === name.toLowerCase()))
if (clash) throw new Error(`"${name}" already exists as ${clash.slug}`)

// Wikipedia intro + Wikidata id
let summary = ''
let description = ''
let wikipedia: string | null = null
let wikidata: string | null = null
const title = opt('--wikipedia') ?? name
try {
  const res = await getJSON<any>(
    `https://en.wikipedia.org/w/api.php?${new URLSearchParams({
      action: 'query',
      format: 'json',
      formatversion: '2',
      redirects: '1',
      titles: title,
      prop: 'extracts|pageprops|description',
      exintro: '1',
      explaintext: '1',
      ppprop: 'wikibase_item|disambiguation',
    })}`
  )
  const p = res.query?.pages?.[0]
  if (p && !p.missing && p.pageprops?.disambiguation === undefined) {
    wikipedia = p.title
    wikidata = p.pageprops?.wikibase_item ?? null
    const paras = String(p.extract ?? '').split(/\n+/).map((s: string) => s.trim()).filter(Boolean)
    description = paras.join('\n\n')
    summary = (paras[0] ?? '').split(/(?<=\.)\s/)[0] ?? ''
    console.log(`✓ Wikipedia: ${p.title}${wikidata ? ` (${wikidata})` : ''}`)
  } else console.log('• No Wikipedia article found — write the description by hand.')
} catch (e) {
  console.log(`• Wikipedia lookup failed: ${e}`)
}

const now = new Date().toISOString()
const record: AestheticRecord = {
  slug,
  name,
  aliases: [],
  category,
  subcategory: '',
  establishment,
  status: 'draft',
  confidence: 50,
  origin: '',
  geography: '',
  periodStart: '',
  periodEnd: '',
  startYear: null,
  endYear: null,
  era: '',
  summary,
  description,
  culturalContext: '',
  colors: [],
  visualDNA: {},
  typography: {},
  typePairing: {},
  materials: [],
  textures: [],
  lighting: {},
  photography: {},
  architecture: {},
  fashion: {},
  objects: [],
  environment: {},
  graphicDesign: {},
  uiTranslation: {},
  recipe: {},
  emotionProfile: {},
  dnaAxes: {},
  keyExamples: [],
  sounds: [],
  tags: [],
  images: [],
  sources: wikipedia
    ? [{ name: `Wikipedia — ${wikipedia}`, url: `https://en.wikipedia.org/wiki/${encodeURIComponent(wikipedia.replace(/ /g, '_'))}`, tier: 'B' }]
    : [],
  references: [],
  wikidata,
  wikipedia,
  popularity: 40,
  isNiche: false,
  dataQuality: wikipedia ? 'moderately_documented' : 'interpretive',
  verifiedAt: null,
  createdAt: now,
  updatedAt: now,
}
saveAesthetic(record)
console.log(`✓ created data/aesthetics/${slug}.json`)

spawnSync(process.execPath, [path.join(import.meta.dirname, 'images.ts'), '--slug', slug], { stdio: 'inherit' })

console.log(`
Next steps — edit data/aesthetics/${slug}.json:
  • colors: 3–8 characteristic colours as { "hex": "#rrggbb", "name": "…" }
  • periodStart / startYear, origin, geography, era
  • summary (one sentence) and description (≥ 200 characters, your own words or CC BY-SA text with attribution)
  • visualDNA, materials, textures, objects, keyExamples
  • sources: museum/scholarly references with URLs (tier A/B/C)
Then run: npm run data:validate -- --strict ${slug}.json && npm run data:build`)
