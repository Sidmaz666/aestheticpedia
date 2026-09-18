// Fill empty origin / period fields from the record's own sources — no guessing:
//  1. Aesthetics Wiki records: "primary platform" and "decade of origin" infobox fields.
//  2. Other records: explicit statements in the first two sentences of the (sourced)
//     description — "originated/developed/emerged in <place>", "<X> is a <Demonym> …",
//     and explicit centuries/decades/years ("in the 17th century", "the 1920s", "in 1886").
// Only empty fields are filled; nothing is overwritten.
//
//   node scripts/data/enrich-text-facts.ts
import { cache, getJSON, loadAesthetics, saveAesthetic, sleep } from './lib.ts'

// Country ⇄ demonym pairs (English forms used in encyclopedia prose).
const PLACES: [string, string][] = [
  ['Afghanistan', 'Afghan'], ['Albania', 'Albanian'], ['Algeria', 'Algerian'], ['Angola', 'Angolan'], ['Argentina', 'Argentine'], ['Armenia', 'Armenian'],
  ['Australia', 'Australian'], ['Austria', 'Austrian'], ['Azerbaijan', 'Azerbaijani'], ['Bangladesh', 'Bangladeshi'], ['Belarus', 'Belarusian'], ['Belgium', 'Belgian'],
  ['Benin', 'Beninese'], ['Bhutan', 'Bhutanese'], ['Bolivia', 'Bolivian'], ['Bosnia and Herzegovina', 'Bosnian'], ['Brazil', 'Brazilian'], ['Bulgaria', 'Bulgarian'],
  ['Burkina Faso', 'Burkinabé'], ['Cambodia', 'Cambodian'], ['Cameroon', 'Cameroonian'], ['Canada', 'Canadian'], ['Chile', 'Chilean'], ['China', 'Chinese'],
  ['Colombia', 'Colombian'], ['Congo', 'Congolese'], ['Croatia', 'Croatian'], ['Cuba', 'Cuban'], ['Cyprus', 'Cypriot'], ['Czech Republic', 'Czech'],
  ['Denmark', 'Danish'], ['Ecuador', 'Ecuadorian'], ['Egypt', 'Egyptian'], ['England', 'English'], ['Estonia', 'Estonian'], ['Ethiopia', 'Ethiopian'],
  ['Fiji', 'Fijian'], ['Finland', 'Finnish'], ['France', 'French'], ['Georgia', 'Georgian'], ['Germany', 'German'], ['Ghana', 'Ghanaian'],
  ['Greece', 'Greek'], ['Guatemala', 'Guatemalan'], ['Haiti', 'Haitian'], ['Hungary', 'Hungarian'], ['Iceland', 'Icelandic'], ['India', 'Indian'],
  ['Indonesia', 'Indonesian'], ['Iran', 'Iranian'], ['Iran', 'Persian'], ['Iraq', 'Iraqi'], ['Ireland', 'Irish'], ['Israel', 'Israeli'], ['Italy', 'Italian'],
  ['Jamaica', 'Jamaican'], ['Japan', 'Japanese'], ['Jordan', 'Jordanian'], ['Kazakhstan', 'Kazakh'], ['Kenya', 'Kenyan'], ['Korea', 'Korean'],
  ['Kyrgyzstan', 'Kyrgyz'], ['Laos', 'Lao'], ['Latvia', 'Latvian'], ['Lebanon', 'Lebanese'], ['Lithuania', 'Lithuanian'], ['Madagascar', 'Malagasy'],
  ['Malaysia', 'Malaysian'], ['Mali', 'Malian'], ['Mexico', 'Mexican'], ['Mongolia', 'Mongolian'], ['Morocco', 'Moroccan'], ['Mozambique', 'Mozambican'],
  ['Myanmar', 'Burmese'], ['Namibia', 'Namibian'], ['Nepal', 'Nepali'], ['Netherlands', 'Dutch'], ['New Zealand', 'New Zealand'], ['Nigeria', 'Nigerian'],
  ['Norway', 'Norwegian'], ['Pakistan', 'Pakistani'], ['Palestine', 'Palestinian'], ['Panama', 'Panamanian'], ['Papua New Guinea', 'Papuan'], ['Paraguay', 'Paraguayan'],
  ['Peru', 'Peruvian'], ['Philippines', 'Filipino'], ['Poland', 'Polish'], ['Portugal', 'Portuguese'], ['Romania', 'Romanian'], ['Russia', 'Russian'],
  ['Rwanda', 'Rwandan'], ['Samoa', 'Samoan'], ['Saudi Arabia', 'Saudi'], ['Scotland', 'Scottish'], ['Senegal', 'Senegalese'], ['Serbia', 'Serbian'],
  ['Slovakia', 'Slovak'], ['Slovenia', 'Slovene'], ['South Africa', 'South African'], ['Spain', 'Spanish'], ['Sri Lanka', 'Sri Lankan'], ['Sudan', 'Sudanese'],
  ['Sweden', 'Swedish'], ['Switzerland', 'Swiss'], ['Syria', 'Syrian'], ['Taiwan', 'Taiwanese'], ['Tajikistan', 'Tajik'], ['Tanzania', 'Tanzanian'],
  ['Thailand', 'Thai'], ['Tibet', 'Tibetan'], ['Tonga', 'Tongan'], ['Tunisia', 'Tunisian'], ['Turkey', 'Turkish'], ['Turkmenistan', 'Turkmen'],
  ['Uganda', 'Ugandan'], ['Ukraine', 'Ukrainian'], ['United Kingdom', 'British'], ['United States', 'American'], ['Uruguay', 'Uruguayan'], ['Uzbekistan', 'Uzbek'],
  ['Venezuela', 'Venezuelan'], ['Vietnam', 'Vietnamese'], ['Wales', 'Welsh'], ['Yemen', 'Yemeni'], ['Zambia', 'Zambian'], ['Zimbabwe', 'Zimbabwean'],
]
const COUNTRY = new Map(PLACES.map(([c]) => [c.toLowerCase(), c]))
const DEMONYM = new Map(PLACES.map(([c, d]) => [d.toLowerCase(), c]))
const alt = (xs: string[]) => xs.sort((a, b) => b.length - a.length).map((x) => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')
const RE_ORIGIN = new RegExp(`\\b(?:originat(?:ed|ing|es)|developed|emerged|arose|began|founded|created|invented|first appeared|practi[sc]ed)\\s+(?:primarily\\s+|mainly\\s+|largely\\s+)?in\\s+(?:the\\s+)?(${alt(PLACES.map(([c]) => c))})\\b`, 'i')
const RE_DEMONYM = new RegExp(`\\b(?:is|was|are|were)\\s+(?:a|an|the)\\s+(?:[a-z-]+\\s+){0,2}?(${alt(PLACES.map(([, d]) => d))})\\b`, 'i')

const ORD: Record<string, number> = { first: 1, second: 2, third: 3, fourth: 4, fifth: 5, sixth: 6, seventh: 7, eighth: 8, ninth: 9, tenth: 10, eleventh: 11, twelfth: 12, thirteenth: 13, fourteenth: 14, fifteenth: 15, sixteenth: 16, seventeenth: 17, eighteenth: 18, nineteenth: 19, twentieth: 20 }
function periodFrom(text: string): { label: string; year: number } | null {
  const c = /\b(early |mid-|mid |late )?(\d{1,2})(?:st|nd|rd|th)[- ]century( BCE| BC| B\.C\.)?/i.exec(text) ?? /\b(early |mid-|late )?(first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth|eleventh|twelfth|thirteenth|fourteenth|fifteenth|sixteenth|seventeenth|eighteenth|nineteenth|twentieth)[- ]century( BCE| BC)?/i.exec(text)
  if (c) {
    const n = /\d/.test(c[2]) ? Number(c[2]) : ORD[c[2].toLowerCase()]
    if (!n || n > 21) return null
    const bce = !!c[3]
    const off = /late/i.test(c[1] ?? '') ? 66 : /mid/i.test(c[1] ?? '') ? 33 : 0
    const year = bce ? -(n * 100) + off : (n - 1) * 100 + off
    return { label: c[0].replace(/^\w/, (m) => m.toUpperCase()), year }
  }
  const d = /\bthe (1[0-9]|20)(\d)0s\b/.exec(text)
  if (d) return { label: `${d[1]}${d[2]}0s`, year: Number(`${d[1]}${d[2]}0`) }
  const y = /\b(?:in|from|since|around|circa|c\.)\s+(\d{3,4})\b(?!\s*(?:km|m|people|square|metres|meters|feet))/.exec(text)
  if (y && Number(y[1]) >= 500 && Number(y[1]) <= 2025) return { label: y[1], year: Number(y[1]) }
  return null
}

const firstSentences = (s: string) => (s.match(/^[\s\S]{0,600}?[.!?](?:\s|$)[\s\S]{0,400}?[.!?](?:\s|$)/)?.[0] ?? s.slice(0, 700))

// ---- Aesthetics Wiki infobox (cached pages) ----
const wikiCache = cache<unknown>('aestheticswiki')
async function wikiPlatform(title: string): Promise<string> {
  const url = `https://aesthetics.fandom.com/api.php?${new URLSearchParams({ format: 'json', action: 'parse', page: title, prop: 'text', section: '0', redirects: '1' })}`
  let res: any = wikiCache.get(url)
  if (!res) {
    try {
      res = await getJSON(url)
      wikiCache.set(url, res)
      await sleep(250)
    } catch {
      return ''
    }
  }
  const html: string = res.parse?.text?.['*'] ?? ''
  const m = /data-source="primary_platform"[^>]*>[\s\S]*?<div class="pi-data-value[^"]*"[^>]*>([\s\S]*?)<\/div>/.exec(html)
  return m ? m[1].replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\[\d+\]/g, '').replace(/\s+/g, ' ').trim().slice(0, 100) : ''
}

const ONLINE = /\b(tumblr|tiktok|instagram|youtube|pinterest|twitter|x \(twitter\)|reddit|soundcloud|vine|internet|web|online|discord|bandcamp|weheartit|we heart it|myspace|deviantart|4chan|facebook|twitch|spotify|musical?ly|livejournal|imageboards?|forums?|blogs?|fotolog|netlog|vk|vkontakte|geocities|angelfire|tripod|weibo|douyin|xiaohongshu|bilibili|bebo|flickr|itch\.io|steam|baidu|picsart|canva|kuaishou|orkut|friendster|habbo|neopets|snapchat|personal homepages)\b/i

let origins = 0
let periods = 0
for (const a of loadAesthetics()) {
  let changed = false
  const isWiki = a.sources.some((s) => /aesthetics\.fandom\.com/.test(s.url ?? ''))
  if (!a.origin && isWiki) {
    const title = decodeURIComponent((a.sources.find((s) => /aesthetics\.fandom\.com/.test(s.url ?? ''))!.url ?? '').split('/wiki/')[1] ?? '').replace(/_/g, ' ')
    const platform = title ? await wikiPlatform(title) : ''
    // The infobox field is a platform, not always an online one ("teen magazines"): only web
    // platforms make the origin "Online".
    if (platform && ONLINE.test(platform)) {
      a.origin = `Online (${platform})`
      origins++
      changed = true
    }
  }
  const text = firstSentences(a.description || a.summary)
  if (!a.origin && text) {
    const o = RE_ORIGIN.exec(text)
    const d = !o ? RE_DEMONYM.exec(text) : null
    const place = o ? COUNTRY.get(o[1].toLowerCase()) : d ? DEMONYM.get(d[1].toLowerCase()) : undefined
    if (place) {
      a.origin = place
      if (!a.geography) a.geography = place
      origins++
      changed = true
    }
  }
  if (!a.periodStart && a.startYear === null && text) {
    const p = periodFrom(text)
    if (p) {
      a.periodStart = p.label
      a.startYear = p.year
      if (!a.era) a.era = p.label
      periods++
      changed = true
    }
  }
  if (changed) {
    a.updatedAt = new Date().toISOString()
    saveAesthetic(a)
  }
}
console.log(`✓ origin filled for ${origins}, period for ${periods}`)
