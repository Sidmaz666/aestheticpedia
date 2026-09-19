// Fill missing start dates and origins from explicit statements in each record's own sources:
// its sourced text (summary, description, cultural context) and, when the record is linked to a
// Wikipedia article about it, that article's intro and History section. Only explicit claims are
// used — nothing is inferred from category, era of neighbours or images:
//   date   ← "(1880–1910)" / "(c. 1880 – 1910)" in the defining sentence, or an origin verb
//            ("emerged", "originated", "dates back to", "was founded"…) followed within the same
//            sentence by a year, decade ("the 1920s"), century ("the 15th century") or BCE date
//   origin ← a demonym in the defining sentence ("is a traditional Japanese form…" → Japan), or
//            "originated / developed / emerged in <country or region>"
//   online ← for Internet Aesthetic records, origin "Online" only when the text itself names the
//            internet or a platform (Tumblr, TikTok, Instagram…)
//
//   node scripts/data/enrich-dates-origins.ts [--dry] [SHOW=n]
import { cache, getJSON, loadAesthetics, saveAesthetic, sleep } from './lib.ts'

const DRY = process.argv.includes('--dry')
const http = cache<unknown>('wikipedia-sections')
const UA = { 'User-Agent': 'Aestheticpedia/1.0 (https://github.com/Sidmaz666/aestheticpedia; open aesthetics encyclopedia) node' }

async function extract(title: string): Promise<string> {
  const url = `https://en.wikipedia.org/w/api.php?${new URLSearchParams({ action: 'query', format: 'json', formatversion: '2', prop: 'extracts', explaintext: '1', redirects: '1', titles: title })}`
  let res = http.get(url) as any
  if (!res) {
    try {
      res = await getJSON<any>(url, 4, { headers: UA })
      http.set(url, res)
      await sleep(300)
    } catch {
      return ''
    }
  }
  return String(res?.query?.pages?.[0]?.extract ?? '')
}

// Country / region names and their demonyms (demonym → canonical place).
const PLACES: [string, string[]][] = [
  ['Afghanistan', ['Afghan']], ['Albania', ['Albanian']], ['Algeria', ['Algerian']], ['Argentina', ['Argentine', 'Argentinian']], ['Armenia', ['Armenian']],
  ['Australia', ['Australian']], ['Austria', ['Austrian']], ['Azerbaijan', ['Azerbaijani']], ['Bangladesh', ['Bangladeshi']], ['Belgium', ['Belgian', 'Flemish']],
  ['Bhutan', ['Bhutanese']], ['Bolivia', ['Bolivian']], ['Brazil', ['Brazilian']], ['Bulgaria', ['Bulgarian']], ['Cambodia', ['Cambodian', 'Khmer']],
  ['Cameroon', ['Cameroonian']], ['Canada', ['Canadian']], ['Chile', ['Chilean']], ['China', ['Chinese']], ['Colombia', ['Colombian']], ['Croatia', ['Croatian']],
  ['Cuba', ['Cuban']], ['Czech Republic', ['Czech', 'Bohemian']], ['Denmark', ['Danish']], ['Ecuador', ['Ecuadorian']], ['Egypt', ['Egyptian']], ['Estonia', ['Estonian']],
  ['Ethiopia', ['Ethiopian']], ['Finland', ['Finnish']], ['France', ['French']], ['Georgia', ['Georgian']], ['Germany', ['German']], ['Ghana', ['Ghanaian']],
  ['Greece', ['Greek']], ['Guatemala', ['Guatemalan']], ['Haiti', ['Haitian']], ['Hungary', ['Hungarian']], ['Iceland', ['Icelandic']], ['India', ['Indian']],
  ['Indonesia', ['Indonesian', 'Javanese', 'Balinese']], ['Iran', ['Iranian', 'Persian']], ['Iraq', ['Iraqi']], ['Ireland', ['Irish']], ['Israel', ['Israeli']],
  ['Italy', ['Italian']], ['Jamaica', ['Jamaican']], ['Japan', ['Japanese']], ['Jordan', ['Jordanian']], ['Kazakhstan', ['Kazakh']], ['Kenya', ['Kenyan']],
  ['Korea', ['Korean']], ['Kyrgyzstan', ['Kyrgyz']], ['Laos', ['Lao', 'Laotian']], ['Latvia', ['Latvian']], ['Lebanon', ['Lebanese']], ['Lithuania', ['Lithuanian']],
  ['Malaysia', ['Malaysian']], ['Mali', ['Malian']], ['Malta', ['Maltese']], ['Mexico', ['Mexican']], ['Mongolia', ['Mongolian']], ['Morocco', ['Moroccan']],
  ['Myanmar', ['Burmese']], ['Nepal', ['Nepali', 'Nepalese', 'Newar']], ['Netherlands', ['Dutch']], ['New Zealand', ['Māori', 'Maori']], ['Nigeria', ['Nigerian', 'Yoruba', 'Igbo']],
  ['Norway', ['Norwegian']], ['Pakistan', ['Pakistani']], ['Palestine', ['Palestinian']], ['Peru', ['Peruvian']], ['Philippines', ['Filipino', 'Philippine']],
  ['Poland', ['Polish']], ['Portugal', ['Portuguese']], ['Romania', ['Romanian']], ['Russia', ['Russian']], ['Saudi Arabia', ['Saudi']], ['Scotland', ['Scottish']],
  ['Senegal', ['Senegalese']], ['Serbia', ['Serbian']], ['Slovakia', ['Slovak']], ['Slovenia', ['Slovene', 'Slovenian']], ['South Africa', ['South African']],
  ['Spain', ['Spanish']], ['Sri Lanka', ['Sri Lankan', 'Sinhalese']], ['Sweden', ['Swedish']], ['Switzerland', ['Swiss']], ['Syria', ['Syrian']], ['Taiwan', ['Taiwanese']],
  ['Thailand', ['Thai']], ['Tibet', ['Tibetan']], ['Tunisia', ['Tunisian']], ['Turkey', ['Turkish']], ['Ukraine', ['Ukrainian']], ['United Kingdom', ['British']],
  ['England', ['English']], ['Wales', ['Welsh']], ['United States', ['American']], ['Uruguay', ['Uruguayan']], ['Uzbekistan', ['Uzbek']], ['Venezuela', ['Venezuelan']],
  ['Vietnam', ['Vietnamese']], ['Yemen', ['Yemeni']], ['Zimbabwe', ['Zimbabwean']],
  // Historical and cultural regions
  ['Ottoman Empire', ['Ottoman']], ['Byzantine Empire', ['Byzantine']], ['Mesopotamia', ['Mesopotamian', 'Sumerian', 'Assyrian', 'Babylonian']],
  ['Ancient Rome', ['Roman']], ['Scandinavia', ['Scandinavian', 'Nordic', 'Norse', 'Viking']], ['Mesoamerica', ['Mesoamerican', 'Aztec', 'Maya', 'Mayan']],
  ['Andes', ['Andean', 'Inca', 'Incan']], ['Europe', ['European']], ['Africa', ['African']], ['Latin America', ['Latin American']], ['Caribbean', ['Caribbean']],
  ['Middle East', ['Middle Eastern']], ['Central Asia', ['Central Asian']], ['Southeast Asia', ['Southeast Asian']], ['Islamic world', ['Islamic']],
]
const DEMONYM = new Map<string, string>()
for (const [place, ds] of PLACES) for (const d of ds) DEMONYM.set(d.toLowerCase(), place)
const PLACE_NAMES = new Map(PLACES.map(([p]) => [p.toLowerCase(), p]))
for (const extra of ['Paris', 'London', 'New York', 'Tokyo', 'Vienna', 'Berlin', 'Moscow', 'Kyoto', 'Edo', 'Florence', 'Venice', 'Rome', 'Amsterdam', 'Barcelona', 'Munich', 'Milan', 'Chicago', 'Los Angeles', 'Mumbai', 'Kolkata', 'Bengal', 'Kerala', 'Rajasthan', 'Gujarat', 'Punjab', 'Kashmir', 'Assam', 'Manipur', 'Andalusia', 'Catalonia', 'Flanders', 'Bavaria', 'Tuscany', 'Anatolia', 'Persia', 'Siberia', 'Patagonia', 'Yucatán', 'Oaxaca', 'Bali', 'Java', 'Okinawa', 'Hokkaido', 'Hawaii', 'Polynesia', 'Melanesia', 'Micronesia', 'Mongolia'])
  PLACE_NAMES.set(extra.toLowerCase(), extra)

const firstSentence = (t: string) => (t.replace(/\s+/g, ' ').match(/^.{20,400}?[.!?](?=\s|$)/)?.[0] ?? t.slice(0, 300))
const sentences = (t: string) => t.replace(/\s+/g, ' ').match(/[^.!?]+[.!?]+/g) ?? []

const ORIGIN_VERB = /\b(emerged|originated|originates|developed|began|arose|appeared|flourished|founded|established|coined|popularized|popularised|dates back|dating back|dating from|dates from|first appeared|first recorded|first used|introduced|invented|started|was born|came into being|evolved|surfaced)\b/i
const YEAR_RX = /\b(?:in|by|around|from|since|during|to|of|c\.|circa|about)?\s*(?:the\s+)?(?:(early|mid|mid-|late)\s*-?\s*)?(\d{1,2})(?:st|nd|rd|th)\s+century(\s+(?:BCE|BC))?|\b(\d{3,4})s\b|\b(\d{1,5})\s*(BCE|BC)\b|\b(1[0-9]{3}|20[0-2][0-9])\b(?!\s*(?:years|yrs))/i

function parseDate(sentence: string): { year: number; label: string } | null {
  const m = YEAR_RX.exec(sentence)
  // "well established by the mid 18th century" dates a state already reached, not a beginning.
  if (!m || /^\s*by\b/i.test(m[0])) return null
  if (m[2]) {
    const c = Number(m[2])
    const bce = !!m[3]
    const phase = (m[1] ?? '').toLowerCase().replace('-', '')
    const off = phase === 'mid' ? 40 : phase === 'late' ? 70 : 0
    const year = bce ? -(c * 100) + off : (c - 1) * 100 + off
    const ord = c % 100 >= 11 && c % 100 <= 13 ? 'th' : (({ 1: 'st', 2: 'nd', 3: 'rd' }) as Record<number, string>)[c % 10] ?? 'th'
    const label = `${phase ? `${phase}-` : ''}${c}${ord} century${bce ? ' BCE' : ''}`
    return { year, label }
  }
  if (m[4]) return { year: Number(m[4]), label: `${m[4]}s` }
  if (m[5]) return { year: -Number(m[5]), label: `${m[5]} BCE` }
  if (m[7]) return { year: Number(m[7]), label: m[7] }
  return null
}

// A claim counts only when the record is its grammatical subject: the sentence opens with the
// record's name or an alias ("Bellfounding in East Asia dates from…"), or with a pronoun or generic
// subject standing for it ("It emerged…", "The style developed…"). Sentences that merely mention
// it ("Local versions of chinoiserie were developed in India", "The Book Art Association, founded
// in 2008") are about something else.
const SUBJECT = /^(it|these|they|(?:this|the) (style|movement|term|genre|form|tradition|technique|aesthetic|practice|craft|art|school|trend|look|subculture|fashion|scene))\b/
const plain = (s: string) => s.toLowerCase().replace(/\s*\(.*?\)\s*/g, ' ').replace(/[^a-z0-9ā-ž]+/g, ' ').trim()
// After the name, the next word must continue the same subject ("Cape Cod style was…", "the
// scene subculture emerged…"), not begin a different compound ("Shōka shimputai was introduced").
const NEXT = /^(is|was|are|were|has|have|had|first|originally|reportedly|primarily|initially|probably|likely|also|or|in|on|at|as|itself|then|tradition|traditions|style|movement|art|subculture|architecture|painting|technique|school|scene|furniture|genre|form|craft|design|fashion|trend|culture|dates|dated|emerged|originated|developed|began|arose|appeared|flourished|evolved|started|surfaced|became|came|rose)$/
let pronounsOk = true
function aboutRecord(prefix: string, names: string[]): boolean {
  const p = plain(prefix).replace(/^(the|a|an) /, '')
  const named = names.find((n) => p === n || (p.startsWith(n + ' ') && NEXT.test(p.slice(n.length + 1).split(' ')[0])))
  const subject = named ?? (pronounsOk ? SUBJECT.exec(p)?.[0] : undefined)
  // Between the subject and the verb: no second subject ("… and Rowlandson established") and no
  // relative clause about another noun ("… alebrijes, which originated").
  return subject !== undefined && !/\b(and|which|who|whose)\b/.test(p.slice(subject.length))
}
const nameWords = (a: { name: string; aliases: string[] }) => [...new Set([a.name, ...a.aliases].map(plain).map((n) => n.replace(/^(the|a|an) /, '')).filter((n) => n.length >= 3))]

let evidence = ''
let historyAt = Infinity
function findDate(texts: string[], words: string[]): { year: number; label: string; end?: number } | null {
  for (const t of texts) {
    // A range in parentheses right after the subject's name: "Art Nouveau (1890–1910) is…".
    const r = /^([^(.]{2,60})\((?:c\.\s*|ca\.\s*|circa\s*)?(1[0-9]{3}|20[0-2][0-9])\s*[–—-]\s*(1[0-9]{3}|20[0-2][0-9]|present)\)/.exec(firstSentence(t))
    if (r && !words.includes(plain(r[1]).replace(/^(the|a|an) /, ''))) continue
    if (r) evidence = firstSentence(t)
    if (r) return { year: Number(r[2]), label: r[2], end: r[3] === 'present' ? undefined : Number(r[3]) }
  }
  for (const [ti, t] of texts.entries()) {
    // "It was invented…" deep in a History section may be about anything that section discusses.
    pronounsOk = ti < historyAt
    for (const s of sentences(t)) {
      const v = ORIGIN_VERB.exec(s)
      if (!v || !aboutRecord(s.slice(0, v.index), words)) continue
      // Later developments are not the origin ("was subsequently popularized", "further
      // popularized", "evolved … from the 19th century onward", "introduced into Arabic prose").
      if (/\b(further|later|subsequently|onwards?|again|revived|reintroduced|introduced (into|to))\b/i.test(s)) continue
      // The date must come after the origin verb, within the same sentence, and not be an end
      // ("…flourished until 1258").
      const window = s.slice(v.index, v.index + 140)
      const cut = /\b(until|till|to|through|ended|end of|fall of|decline|lasted)\b/i.exec(window)
      // Parentheses hold other dates (a founder's lifespan, a dynasty's reign).
      const d = parseDate((cut ? window.slice(0, cut.index) : window).replace(/\([^)]*\)/g, ' '))
      if (d && d.year <= 2026 && d.year >= -40000) {
        evidence = s
        return d
      }
    }
  }
  pronounsOk = true
  return null
}

function findOrigin(texts: string[], words: string[]): string | null {
  for (const t of texts) {
    const first = firstSentence(t)
    // "is a (traditional|historic|…) <Demonym> <noun>" in the defining sentence.
    const m = /\b(?:is|was|are|were)\s+(?:an?|the)\s+(?:[a-z-]+\s+){0,3}?([A-Z][a-zā]+(?:\s[A-Z][a-z]+)?)\s+(?:[a-z-]+\s+){0,2}?(?:style|form|art|tradition|technique|genre|movement|school|craft|dress|garment|textile|pottery|architecture|painting|aesthetic|subculture|fashion|design|motif|pattern|type|method)\b/.exec(first)
    if (m) {
      const place = DEMONYM.get(m[1].toLowerCase()) ?? DEMONYM.get(m[1].split(' ')[0].toLowerCase())
      if (place) {
        evidence = first
        return place
      }
    }
  }
  for (const t of texts)
    for (const s of sentences(t)) {
      const m = /\b(?:originated|originates|developed|emerged|arose|began|flourished|was born)\s+(?:primarily\s+|mainly\s+|first\s+)?in\s+(?:the\s+)?([A-Z][A-Za-zā]+(?:\s[A-Z][a-z]+){0,2})/.exec(s)
      if (!m || !aboutRecord(s.slice(0, m.index), words)) continue
      const place = PLACE_NAMES.get(m[1].toLowerCase()) ?? PLACE_NAMES.get(m[1].split(' ').slice(0, 2).join(' ').toLowerCase())
      if (place) {
        evidence = s
        return place
      }
    }
  return null
}

const ONLINE = /\b(internet|online|tumblr|tiktok|instagram|pinterest|youtube|reddit|twitter|4chan|social media|vaporwave community|web ?1\.0|myspace|deviantart|discord)\b/i

// Online only when the record itself is said to have begun there ("Cutecore emerged on Tumblr…"):
// being popular on TikTok today, or a term coined by someone's online project, is not an origin.
const bornOnline = (t: string, names: string[]) =>
  sentences(t).some((s) => {
    const v = ORIGIN_VERB.exec(s)
    return !!v && aboutRecord(s.slice(0, v.index), names) && ONLINE.test(s.slice(v.index)) && !/\b(later|subsequently|further|revived|again)\b/i.test(s)
  })

const all = loadAesthetics()
// Country/region overviews ("Architecture of Germany", "Art in Paris") have no single start date.
const OVERVIEW = /^(architecture|art|arts|culture|visual culture|clothing|pottery|textiles?|handcrafts?|crafts|photography|painting|sculpture|design|fashion)\s+(of|in)\s/i
const todo = all.filter((a) => (a.startYear === null && !a.periodStart) || !a.origin)
console.log(`${todo.length} records missing a start date or an origin`)
const filled = { date: 0, origin: 0, online: 0 }
let shown = 0
let i = 0
for (const a of todo) {
  const texts = [a.summary, a.description, a.culturalContext].filter(Boolean)
  historyAt = Infinity
  // The record's own Wikipedia article, only when it is about the record (name overlap).
  if (a.wikipedia && a.wikipedia.toLowerCase().split(/\W+/).some((w) => w.length > 3 && a.name.toLowerCase().includes(w))) {
    const ext = await extract(a.wikipedia)
    if (ext) {
      const intro = ext.split(/\n==/)[0]
      const hist = /\n==+\s*(History|Origins?|Background|Development)\s*==+\n([\s\S]*?)(?=\n==[^=])/i.exec(ext)?.[2] ?? ''
      texts.push(intro, hist.slice(0, 4000))
      historyAt = texts.length - 1
    }
  }
  const added: Record<string, unknown> = {}
  evidence = ''
  if (a.startYear === null && !a.periodStart && !OVERVIEW.test(a.name)) {
    const d = findDate(texts, nameWords(a))
    if (d) {
      a.startYear = d.year
      a.periodStart = d.label
      if (d.end && a.endYear === null && !a.periodEnd) {
        a.endYear = d.end
        a.periodEnd = String(d.end)
      }
      added.period = `${d.label}${d.end ? ` – ${d.end}` : ''}`
      filled.date++
    }
  }
  if (!a.origin) {
    const o = findOrigin(texts, nameWords(a))
    if (o) {
      a.origin = o
      if (!a.geography) a.geography = o
      added.origin = o
      filled.origin++
    } else if (a.category === 'Internet Aesthetic' && texts.some((t) => bornOnline(t, nameWords(a)))) {
      a.origin = 'Online'
      if (!a.geography) a.geography = 'Online'
      added.origin = 'Online'
      filled.online++
    }
  }
  if (Object.keys(added).length) {
    a.updatedAt = new Date().toISOString()
    if (!DRY) saveAesthetic(a)
    if (process.env.SHOW && shown++ < Number(process.env.SHOW)) console.log(`  ${a.slug}:`, JSON.stringify(added), process.env.WHY ? `
      ↳ ${evidence.trim().slice(0, 220)}` : '')
  }
  if (++i % 500 === 0) console.log(`  ${i}/${todo.length}`, filled)
}
console.log('✓ filled', filled)
