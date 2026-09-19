// Country-level visual heritage for every UN member state: for each country, look up the
// standard English Wikipedia overview articles for its architecture, art, dress, pottery,
// textiles and crafts ("Architecture of Rwanda", "Yemeni art", "Mongolian clothing"…), and
// import the ones that exist and aren't in the library yet, with the article's intro as text
// and the country as origin. Redirects that land on a generic "Culture of X" page are skipped.
//
//   node scripts/data/import-country-arts.ts [--dry]
import type { AestheticRecord } from '../../src/lib/schema.ts'
import { cache, getJSON, loadAesthetics, saveAesthetic, sleep, slugify } from './lib.ts'

const DRY = process.argv.includes('--dry')
const http = cache<unknown>('country-arts')
const UA = { 'User-Agent': 'Aestheticpedia/1.0 (https://github.com/Sidmaz666/aestheticpedia; open aesthetics encyclopedia) node' }
async function wp<T = any>(params: Record<string, string>): Promise<T> {
  const url = `https://en.wikipedia.org/w/api.php?${new URLSearchParams({ format: 'json', formatversion: '2', ...params })}`
  const hit = http.get(url)
  if (hit) return hit as T
  const res = await getJSON<T>(url, 3, { headers: UA })
  http.set(url, res)
  await sleep(100)
  return res
}
const norm = (s: string) => s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim()

// [country (as used in "X of <country>"), demonym (as in "<demonym> art")]
const COUNTRIES: [string, string][] = (
  'Afghanistan:Afghan;Albania:Albanian;Algeria:Algerian;Andorra:Andorran;Angola:Angolan;Antigua and Barbuda:Antiguan;Argentina:Argentine;Armenia:Armenian;Australia:Australian;Austria:Austrian;' +
  'Azerbaijan:Azerbaijani;the Bahamas:Bahamian;Bahrain:Bahraini;Bangladesh:Bangladeshi;Barbados:Barbadian;Belarus:Belarusian;Belgium:Belgian;Belize:Belizean;Benin:Beninese;Bhutan:Bhutanese;' +
  'Bolivia:Bolivian;Bosnia and Herzegovina:Bosnian;Botswana:Botswanan;Brazil:Brazilian;Brunei:Bruneian;Bulgaria:Bulgarian;Burkina Faso:Burkinabé;Burundi:Burundian;Cape Verde:Cape Verdean;Cambodia:Cambodian;' +
  'Cameroon:Cameroonian;Canada:Canadian;the Central African Republic:Central African;Chad:Chadian;Chile:Chilean;China:Chinese;Colombia:Colombian;the Comoros:Comorian;the Republic of the Congo:Congolese;the Democratic Republic of the Congo:Congolese;' +
  'Costa Rica:Costa Rican;Ivory Coast:Ivorian;Croatia:Croatian;Cuba:Cuban;Cyprus:Cypriot;the Czech Republic:Czech;Denmark:Danish;Djibouti:Djiboutian;Dominica:Dominican;the Dominican Republic:Dominican;' +
  'Ecuador:Ecuadorian;Egypt:Egyptian;El Salvador:Salvadoran;Equatorial Guinea:Equatoguinean;Eritrea:Eritrean;Estonia:Estonian;Eswatini:Swazi;Ethiopia:Ethiopian;Fiji:Fijian;Finland:Finnish;' +
  'France:French;Gabon:Gabonese;the Gambia:Gambian;Georgia (country):Georgian;Germany:German;Ghana:Ghanaian;Greece:Greek;Grenada:Grenadian;Guatemala:Guatemalan;Guinea:Guinean;' +
  'Guinea-Bissau:Bissau-Guinean;Guyana:Guyanese;Haiti:Haitian;Honduras:Honduran;Hungary:Hungarian;Iceland:Icelandic;India:Indian;Indonesia:Indonesian;Iran:Iranian;Iraq:Iraqi;' +
  'Ireland:Irish;Israel:Israeli;Italy:Italian;Jamaica:Jamaican;Japan:Japanese;Jordan:Jordanian;Kazakhstan:Kazakh;Kenya:Kenyan;Kiribati:I-Kiribati;Kuwait:Kuwaiti;' +
  'Kyrgyzstan:Kyrgyz;Laos:Lao;Latvia:Latvian;Lebanon:Lebanese;Lesotho:Basotho;Liberia:Liberian;Libya:Libyan;Liechtenstein:Liechtenstein;Lithuania:Lithuanian;Luxembourg:Luxembourgish;' +
  'Madagascar:Malagasy;Malawi:Malawian;Malaysia:Malaysian;the Maldives:Maldivian;Mali:Malian;Malta:Maltese;the Marshall Islands:Marshallese;Mauritania:Mauritanian;Mauritius:Mauritian;Mexico:Mexican;' +
  'the Federated States of Micronesia:Micronesian;Moldova:Moldovan;Monaco:Monégasque;Mongolia:Mongolian;Montenegro:Montenegrin;Morocco:Moroccan;Mozambique:Mozambican;Myanmar:Burmese;Namibia:Namibian;Nauru:Nauruan;' +
  'Nepal:Nepalese;the Netherlands:Dutch;New Zealand:New Zealand;Nicaragua:Nicaraguan;Niger:Nigerien;Nigeria:Nigerian;North Korea:North Korean;North Macedonia:Macedonian;Norway:Norwegian;Oman:Omani;' +
  'Pakistan:Pakistani;Palau:Palauan;Palestine:Palestinian;Panama:Panamanian;Papua New Guinea:Papua New Guinean;Paraguay:Paraguayan;Peru:Peruvian;the Philippines:Philippine;Poland:Polish;Portugal:Portuguese;' +
  'Qatar:Qatari;Romania:Romanian;Russia:Russian;Rwanda:Rwandan;Saint Kitts and Nevis:Kittitian;Saint Lucia:Saint Lucian;Saint Vincent and the Grenadines:Vincentian;Samoa:Samoan;San Marino:Sammarinese;São Tomé and Príncipe:Santomean;' +
  'Saudi Arabia:Saudi Arabian;Senegal:Senegalese;Serbia:Serbian;Seychelles:Seychellois;Sierra Leone:Sierra Leonean;Singapore:Singaporean;Slovakia:Slovak;Slovenia:Slovenian;the Solomon Islands:Solomon Islands;Somalia:Somali;' +
  'South Africa:South African;South Korea:South Korean;South Sudan:South Sudanese;Spain:Spanish;Sri Lanka:Sri Lankan;Sudan:Sudanese;Suriname:Surinamese;Sweden:Swedish;Switzerland:Swiss;Syria:Syrian;' +
  'Tajikistan:Tajik;Tanzania:Tanzanian;Thailand:Thai;East Timor:Timorese;Togo:Togolese;Tonga:Tongan;Trinidad and Tobago:Trinidadian;Tunisia:Tunisian;Turkey:Turkish;Turkmenistan:Turkmen;' +
  'Tuvalu:Tuvaluan;Uganda:Ugandan;Ukraine:Ukrainian;the United Arab Emirates:Emirati;the United Kingdom:British;the United States:American;Uruguay:Uruguayan;Uzbekistan:Uzbek;Vanuatu:Vanuatuan;Venezuela:Venezuelan;' +
  'Vietnam:Vietnamese;Yemen:Yemeni;Zambia:Zambian;Zimbabwe:Zimbabwean'
)
  .split(';')
  .map((x) => x.split(':') as [string, string])

type Topic = { title: (c: string, d: string) => string; category: AestheticRecord['category']; tag: string }
const TOPICS: Topic[] = [
  { title: (c) => `Architecture of ${c}`, category: 'Architectural Style', tag: 'architecture' },
  { title: (_, d) => `${d} architecture`, category: 'Architectural Style', tag: 'architecture' },
  { title: (_, d) => `${d} art`, category: 'Regional & Cultural Tradition', tag: 'art' },
  { title: (c) => `Art of ${c}`, category: 'Regional & Cultural Tradition', tag: 'art' },
  { title: (c) => `Visual arts of ${c}`, category: 'Regional & Cultural Tradition', tag: 'art' },
  { title: (_, d) => `${d} clothing`, category: 'Fashion & Dress', tag: 'dress' },
  { title: (_, d) => `${d} traditional clothing`, category: 'Fashion & Dress', tag: 'dress' },
  { title: (c) => `Traditional clothing of ${c}`, category: 'Fashion & Dress', tag: 'dress' },
  { title: (_, d) => `${d} pottery`, category: 'Textile & Craft', tag: 'pottery' },
  { title: (_, d) => `${d} textiles`, category: 'Textile & Craft', tag: 'textiles' },
  { title: (_, d) => `${d} handicrafts`, category: 'Textile & Craft', tag: 'crafts' },
  { title: (c) => `Handicrafts of ${c}`, category: 'Textile & Craft', tag: 'crafts' },
  { title: (_, d) => `${d} painting`, category: 'Painting Technique & School', tag: 'painting' },
]

const all = loadAesthetics()
const have = new Set(all.flatMap((a) => [a.name, ...a.aliases, a.wikipedia ?? '']).filter(Boolean).map(norm))
const slugs = new Set(all.map((a) => a.slug))
const want: { title: string; country: string; topic: Topic }[] = []
for (const [c, d] of COUNTRIES) for (const t of TOPICS) want.push({ title: t.title(c, d), country: c.replace(/^the /, '').replace(/ \(country\)$/, ''), topic: t })

// Resolve in batches: must exist, not be a disambiguation, and not redirect to a generic page.
const found = new Map<string, { title: string; extract: string; description: string; qid: string | null }>()
for (let i = 0; i < want.length; i += 20) {
  const res = await wp<any>({
    action: 'query',
    titles: want.slice(i, i + 20).map((w) => w.title).join('|'),
    prop: 'extracts|description|pageprops',
    exintro: '1',
    explaintext: '1',
    exlimit: '20',
    ppprop: 'wikibase_item|disambiguation',
    redirects: '1',
  })
  const back = new Map<string, string>((res.query?.redirects ?? []).map((r: any) => [r.to, r.from]))
  const norms = new Map<string, string>((res.query?.normalized ?? []).map((r: any) => [r.to, r.from]))
  for (const p of res.query?.pages ?? []) {
    if (p.missing || p.pageprops?.disambiguation !== undefined) continue
    if (/^(culture|history|economy|geography|demographics|tourism) of\b|^list of\b/i.test(p.title)) continue
    // The resolved article must still be about a visual topic (redirects can land on the
    // country itself, e.g. "Chadian clothing" → "Chad") and not about an industry.
    if (!/architect|\bart\b|arts\b|painting|cloth|dress|costume|attire|garment|pottery|ceramic|textile|weav|embroider|carpet|rug|craft|jewel|sculpt|design/i.test(p.title)) continue
    if (/\b(industry|economy|trade|market|company)\b/i.test(p.title)) continue
    const asked = back.get(p.title) ?? p.title
    found.set(norms.get(asked) ?? asked, { title: p.title, extract: String(p.extract ?? ''), description: String(p.description ?? ''), qid: p.pageprops?.wikibase_item ?? null })
  }
  if (i % 400 === 0) console.log(`  resolved ${Math.min(i + 20, want.length)}/${want.length}`)
}

const now = new Date().toISOString()
const created: AestheticRecord[] = []
const seen = new Set<string>()
for (const w of want) {
  const p = found.get(w.title)
  if (!p || p.extract.length < 200 || seen.has(p.title) || have.has(norm(p.title))) continue
  seen.add(p.title)
  const paras = p.extract.split(/\n+/).map((s) => s.trim()).filter(Boolean)
  const summary = (paras[0].match(/^.{40,320}?[.!?](?=\s|$)/)?.[0] ?? paras[0].slice(0, 280)).trim()
  const name = p.title.replace(/\s*\(.*?\)\s*$/, '').trim()
  let slug = slugify(name)
  if (!slug || slugs.has(slug)) continue
  slugs.add(slug)
  const wpUrl = `https://en.wikipedia.org/wiki/${encodeURIComponent(p.title.replace(/ /g, '_'))}`
  created.push({
    slug,
    name,
    aliases: [],
    category: w.topic.category,
    subcategory: p.description && p.description.length < 90 ? p.description.replace(/^./, (m) => m.toUpperCase()) : '',
    establishment: 'regional_tradition',
    status: 'draft',
    confidence: 60,
    origin: w.country,
    geography: w.country,
    periodStart: '',
    periodEnd: '',
    startYear: null,
    endYear: null,
    era: '',
    summary,
    description: paras.join('\n\n').slice(0, 2400),
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
    tags: [w.topic.tag, w.country.toLowerCase()],
    images: [],
    sources: [
      { name: `Wikipedia — ${p.title}`, url: wpUrl, tier: 'B', check: { ok: true, status: 200, checkedAt: now } },
      ...(p.qid ? [{ name: `Wikidata — ${p.qid}`, url: `https://www.wikidata.org/wiki/${p.qid}`, tier: 'B' as const, check: { ok: true, status: 200, checkedAt: now } }] : []),
    ],
    references: [],
    wikidata: p.qid,
    wikipedia: p.title,
    popularity: 35,
    isNiche: false,
    dataQuality: 'moderately_documented',
    verifiedAt: null,
    createdAt: now,
    updatedAt: now,
  } as AestheticRecord)
}
const byTopic = new Map<string, number>()
for (const c of created) byTopic.set(c.tags[0], (byTopic.get(c.tags[0]) ?? 0) + 1)
console.log(`${created.length} new country-level records from ${new Set(created.map((c) => c.origin)).size} countries`, Object.fromEntries(byTopic))
console.log('sample:', created.slice(0, 30).map((c) => c.name).join(', '))
if (!DRY) {
  for (const c of created) saveAesthetic(c)
  console.log('✓ written')
}
