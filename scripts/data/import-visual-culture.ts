// For countries still thinly covered, add one "Visual culture of X" record built from the
// visual sections of the country's "Culture of X" Wikipedia article — arts, crafts,
// architecture, dress, textiles, pottery — quoted and attributed. Only created when those
// sections hold real text (≥ 300 characters); nothing is written without a source.
//
//   node scripts/data/import-visual-culture.ts [--dry] [--max N]   (N = countries with < N records, default 5)
import type { AestheticRecord } from '../../src/lib/schema.ts'
import { cache, getJSON, loadAesthetics, saveAesthetic, sleep, slugify } from './lib.ts'

const args = process.argv.slice(2)
const DRY = args.includes('--dry')
const MAX = args.includes('--max') ? Number(args[args.indexOf('--max') + 1]) : 5
const http = cache<unknown>('visual-culture')
const UA = { 'User-Agent': 'Aestheticpedia/1.0 (https://github.com/Sidmaz666/aestheticpedia; open aesthetics encyclopedia) node' }
async function wp<T = any>(params: Record<string, string>): Promise<T> {
  const url = `https://en.wikipedia.org/w/api.php?${new URLSearchParams({ format: 'json', formatversion: '2', ...params })}`
  const hit = http.get(url)
  if (hit) return hit as T
  const res = await getJSON<T>(url, 3, { headers: UA })
  http.set(url, res)
  await sleep(120)
  return res
}

// [country as in "Culture of X", name for the record, match pattern for counting coverage]
const COUNTRIES: [string, string, RegExp][] = [
  ['Antigua and Barbuda', 'Antigua and Barbuda', /antigua|barbuda/i], ['the Bahamas', 'the Bahamas', /bahama/i], ['Bahrain', 'Bahrain', /bahrain/i],
  ['Barbados', 'Barbados', /barbad/i], ['Belize', 'Belize', /beliz/i], ['Botswana', 'Botswana', /botswan|tswana/i], ['Brunei', 'Brunei', /brunei/i],
  ['Burundi', 'Burundi', /burundi/i], ['Cape Verde', 'Cape Verde', /cape verde|cabo verde/i], ['the Central African Republic', 'the Central African Republic', /central african/i],
  ['Chad', 'Chad', /\bchad/i], ['the Comoros', 'the Comoros', /comoro/i], ['Costa Rica', 'Costa Rica', /costa ric/i], ['Ivory Coast', "Côte d'Ivoire", /ivory coast|ivorian|c[ôo]te d.ivoire/i],
  ['Cyprus', 'Cyprus', /cypr/i], ['Djibouti', 'Djibouti', /djibout/i], ['Dominica', 'Dominica', /\bdominica\b/i], ['the Dominican Republic', 'the Dominican Republic', /dominican republic/i],
  ['Equatorial Guinea', 'Equatorial Guinea', /equatorial guinea/i], ['Eswatini', 'Eswatini', /eswatini|swazi/i], ['Gabon', 'Gabon', /gabon/i], ['the Gambia', 'the Gambia', /gambia/i],
  ['Grenada', 'Grenada', /grenad/i], ['Guinea-Bissau', 'Guinea-Bissau', /guinea-bissau/i], ['Guyana', 'Guyana', /guyan/i], ['Kiribati', 'Kiribati', /kiribati/i],
  ['Lebanon', 'Lebanon', /leban/i], ['Liberia', 'Liberia', /liberia/i], ['Liechtenstein', 'Liechtenstein', /liechtenstein/i], ['Madagascar', 'Madagascar', /madagas|malagasy/i],
  ['Malawi', 'Malawi', /malawi/i], ['the Maldives', 'the Maldives', /maldiv/i], ['the Marshall Islands', 'the Marshall Islands', /marshall islands|marshallese/i],
  ['Mauritania', 'Mauritania', /mauritan/i], ['Mauritius', 'Mauritius', /mauriti/i], ['the Federated States of Micronesia', 'Micronesia', /micronesia/i], ['Moldova', 'Moldova', /moldov/i],
  ['Monaco', 'Monaco', /monaco|monégasque/i], ['Montenegro', 'Montenegro', /montenegr/i], ['Nauru', 'Nauru', /nauru/i], ['Nicaragua', 'Nicaragua', /nicaragu/i],
  ['Oman', 'Oman', /\boman/i], ['Palau', 'Palau', /palau/i], ['Rwanda', 'Rwanda', /rwand/i], ['Saint Kitts and Nevis', 'Saint Kitts and Nevis', /saint kitts|nevis/i],
  ['Saint Lucia', 'Saint Lucia', /saint lucia/i], ['Saint Vincent and the Grenadines', 'Saint Vincent and the Grenadines', /saint vincent|grenadines/i], ['San Marino', 'San Marino', /san marino/i],
  ['São Tomé and Príncipe', 'São Tomé and Príncipe', /s[ãa]o tom[ée]/i], ['Seychelles', 'Seychelles', /seychell/i], ['Sierra Leone', 'Sierra Leone', /sierra leon/i],
  ['the Solomon Islands', 'the Solomon Islands', /solomon islands/i], ['South Sudan', 'South Sudan', /south sudan/i], ['Suriname', 'Suriname', /surinam/i], ['Tajikistan', 'Tajikistan', /tajik/i],
  ['East Timor', 'Timor-Leste', /timor/i], ['Tuvalu', 'Tuvalu', /tuvalu/i], ['Uganda', 'Uganda', /ugand/i], ['Vanuatu', 'Vanuatu', /vanuatu/i], ['Yemen', 'Yemen', /yemen/i],
  ['Burkina Faso', 'Burkina Faso', /burkina/i], ['El Salvador', 'El Salvador', /salvador/i], ['Eritrea', 'Eritrea', /eritre/i], ['Iceland', 'Iceland', /iceland/i],
  ['Jordan', 'Jordan', /jordan/i], ['Kuwait', 'Kuwait', /kuwait/i], ['Kyrgyzstan', 'Kyrgyzstan', /kyrgyz/i], ['Libya', 'Libya', /libya/i], ['Luxembourg', 'Luxembourg', /luxembourg/i],
  ['Mongolia', 'Mongolia', /mongol/i], ['Mozambique', 'Mozambique', /mozambi/i], ['Namibia', 'Namibia', /namibi/i], ['Niger', 'Niger', /\bniger\b|nigerien/i], ['Senegal', 'Senegal', /senegal/i],
  ['Somalia', 'Somalia', /somali/i], ['Trinidad and Tobago', 'Trinidad and Tobago', /trinidad|tobago/i], ['Venezuela', 'Venezuela', /venezuel/i], ['Zambia', 'Zambia', /zambi/i],
  ['Laos', 'Laos', /\blao/i], ['Lesotho', 'Lesotho', /lesotho|basotho/i], ['Paraguay', 'Paraguay', /paragua/i], ['Qatar', 'Qatar', /qatar/i], ['Togo', 'Togo', /\btogo/i], ['Tonga', 'Tonga', /tonga/i],
  ['Honduras', 'Honduras', /hondur/i], ['Ecuador', 'Ecuador', /ecuador/i], ['Zimbabwe', 'Zimbabwe', /zimbabw/i], ['Turkmenistan', 'Turkmenistan', /turkmen/i], ['Kazakhstan', 'Kazakhstan', /kazakh/i],
  ['Uzbekistan', 'Uzbekistan', /uzbek/i], ['Panama', 'Panama', /panam/i], ['Angola', 'Angola', /angol/i], ['Algeria', 'Algeria', /alger/i], ['Albania', 'Albania', /albani/i], ['Cuba', 'Cuba', /\bcuba/i],
]
const VISUAL = /\b(arts?|visual arts?|crafts?|handicrafts?|architecture|clothing|dress|costume|attire|textiles?|weaving|pottery|ceramics|painting|sculpture|carving|jewell?ery|design|basketry|tattoo(ing)?)\b/i
const NOT_VISUAL = /\b(martial|performing|literary|music|dance|literature|cuisine|food|sport|film|cinema|theatre|theater|media|religion|language|festivals?|holidays?|radio|television|education)\b/i

/** "== Heading ==" sections (and subsections) whose heading is about visual culture. */
function visualSections(text: string) {
  const parts = text.split(/\n(={2,4})\s*([^=\n]+?)\s*\1\n/)
  const picked: { heading: string; body: string }[] = []
  for (let i = 1; i + 2 < parts.length; i += 3) {
    const heading = parts[i + 1].trim()
    if (!VISUAL.test(heading) || NOT_VISUAL.test(heading)) continue
    const body = parts[i + 2].split(/\n+/).map((p) => p.trim()).filter((p) => p.length > 60).join('\n\n')
    if (body) picked.push({ heading, body })
  }
  return picked
}
const visualLength = (text: string) => visualSections(text).reduce((n, p) => n + p.body.length, 0)

const all = loadAesthetics()
const slugs = new Set(all.map((a) => a.slug))
const now = new Date().toISOString()
const created: AestheticRecord[] = []
for (const [country, display, re] of COUNTRIES) {
  const have = all.filter((a) => re.test(`${a.origin} ${a.geography}`)).length
  if (have >= MAX) continue
  const slug = slugify(`visual culture of ${display.replace(/^the /, '')}`)
  if (slugs.has(slug)) continue
  // The culture article first; the country's own article as a fallback.
  let page: any = null
  let text = ''
  for (const title of [`Culture of ${country}`, country.replace(/^the /, '')]) {
    const res = await wp<any>({ action: 'query', prop: 'extracts|pageprops', explaintext: '1', titles: title, redirects: '1', ppprop: 'wikibase_item' })
    const p = res?.query?.pages?.[0]
    if (!p || p.missing) continue
    const t = String(p.extract ?? '')
    if (!page || (visualLength(t) > visualLength(text))) [page, text] = [p, t]
    if (visualLength(text) >= 300) break
  }
  if (!page) continue
  const picked = visualSections(text)
  if (visualLength(text) < 300) continue
  const description = picked.map((p) => `${p.heading}: ${p.body}`).join('\n\n').slice(0, 2600)
  const first = picked[0].body
  const summary = (first.match(/^.{40,320}?[.!?](?=\s|$)/)?.[0] ?? first.slice(0, 280)).trim()
  const wpUrl = `https://en.wikipedia.org/wiki/${encodeURIComponent(page.title.replace(/ /g, '_'))}`
  const name = `Visual culture of ${display}`
  const origin = display.replace(/^the /, '')
  slugs.add(slug)
  created.push({
    slug,
    name,
    aliases: [],
    category: 'Regional & Cultural Tradition',
    subcategory: `Arts, crafts, dress and building traditions of ${display}`,
    establishment: 'regional_tradition',
    status: 'draft',
    confidence: 55,
    origin,
    geography: origin,
    periodStart: '',
    periodEnd: '',
    startYear: null,
    endYear: null,
    era: '',
    summary,
    description,
    culturalContext: `Compiled from the ${picked.map((p) => `“${p.heading}”`).join(', ')} section${picked.length > 1 ? 's' : ''} of Wikipedia's “${page.title}”.`,
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
    tags: ['visual culture', origin.toLowerCase(), ...picked.map((p) => p.heading.toLowerCase()).slice(0, 4)],
    images: [],
    sources: [
      { name: `Wikipedia — ${page.title} (${picked.map((p) => p.heading).join(', ')})`, url: wpUrl, tier: 'B', check: { ok: true, status: 200, checkedAt: now } },
    ],
    references: [],
    wikidata: null,
    wikipedia: null,
    popularity: 30,
    isNiche: false,
    dataQuality: 'moderately_documented',
    verifiedAt: null,
    createdAt: now,
    updatedAt: now,
  } as AestheticRecord)
}
console.log(`${created.length} visual-culture records:`, created.map((c) => `${c.origin} (${c.culturalContext.match(/“[^”]+”/g)?.slice(0, -1).length ?? 0} sections)`).join(', '))
if (!DRY) {
  for (const c of created) saveAesthetic(c)
  console.log('✓ written')
}
