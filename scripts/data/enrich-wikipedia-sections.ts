// Fill empty descriptive fields of records linked to a Wikipedia article from that article's
// own sections (the article is already the record's cited source; text is CC BY-SA and quoted
// as written, clipped at a sentence). Only empty fields are filled:
//   visualDNA    ← "Characteristics" / "Style" / "Features" / "Design" / "Motifs" / "Iconography"…
//   recipe       ← { technique: "Technique(s)" / "Process" / "Production" / "Method" / "Materials and techniques" }
//   fashion      ← "Clothing" / "Dress" / "Costume" / "Fashion" / "Garments"
//   architecture ← "Architecture" / "Buildings" (records that are not themselves architectural styles)
//   environment  ← "Interior(s)" / "Interior design" / "Decoration" / "Gardens"
//   photography  ← "Photography";  graphicDesign ← "Graphic design" / "Posters" / "Typography"
//   keyExamples  ← short lines of "Notable examples" / "Examples" / "Notable works" / "Notable buildings"
//
//   node scripts/data/enrich-wikipedia-sections.ts [--dry] [SHOW=n env prints n samples]
import { cache, getJSON, loadAesthetics, saveAesthetic, sleep } from './lib.ts'

const DRY = process.argv.includes('--dry')
const http = cache<unknown>('wikipedia-sections')
const UA = { 'User-Agent': 'Aestheticpedia/1.0 (https://github.com/Sidmaz666/aestheticpedia; open aesthetics encyclopedia) node' }

async function extracts(titles: string[]): Promise<Map<string, string>> {
  const url = `https://en.wikipedia.org/w/api.php?${new URLSearchParams({ action: 'query', format: 'json', formatversion: '2', prop: 'extracts', explaintext: '1', redirects: '1', titles: titles.join('|') })}`
  let res = http.get(url) as any
  if (!res) {
    res = await getJSON<any>(url, 4, { headers: UA })
    http.set(url, res)
    await sleep(350)
  }
  const out = new Map<string, string>()
  const redirect = new Map<string, string>((res?.query?.redirects ?? []).map((r: any) => [r.to, r.from]))
  const normal = new Map<string, string>((res?.query?.normalized ?? []).map((r: any) => [r.to, r.from]))
  for (const p of res?.query?.pages ?? []) {
    if (!p.extract) continue
    let t = p.title as string
    t = redirect.get(t) ?? t
    t = normal.get(t) ?? t
    out.set(t, p.extract)
  }
  return out
}

type Sec = { level: number; title: string; body: string; children: Sec[] }
function sections(text: string): Sec[] {
  const parts = text.split(/\n(={2,4})\s*([^=\n]+?)\s*\1\n/)
  const top: Sec[] = []
  for (let i = 1; i + 2 < parts.length + 1; i += 3) {
    const s: Sec = { level: parts[i].length, title: parts[i + 1].trim(), body: (parts[i + 2] ?? '').trim(), children: [] }
    if (s.level === 2 || !top.length) top.push(s)
    else top[top.length - 1].children.push(s)
  }
  return top
}
/** Whole sentences up to n characters. */
function prose(body: string, n: number) {
  const paras = body.split(/\n+/).map((p) => p.trim()).filter((p) => p.length > 60 && /[.!?]$/.test(p))
  let out = ''
  for (const sentence of paras.join(' ').match(/[^.!?]+[.!?]+(?=\s|$)/g) ?? []) {
    if ((out + sentence).length > n) break
    out += sentence
  }
  return out.trim()
}
function kv(sec: Sec, maxKeys = 5, n = 600): Record<string, string> {
  const out: Record<string, string> = {}
  const own = prose(sec.body, n)
  if (own) out.Overview = own
  for (const c of sec.children) {
    if (Object.keys(out).length >= maxKeys) break
    const t = prose(c.body, 450)
    if (t) out[c.title] = t
  }
  return out
}
const find = (secs: Sec[], re: RegExp) => secs.find((s) => re.test(s.title))
const empty = (v: unknown) => v == null || (Array.isArray(v) ? v.length === 0 : typeof v === 'object' ? Object.keys(v as object).length === 0 : v === '')

// Only when the article is about the record itself, not a broader parent topic ("Banana" for a
// banana-fibre cloth): its title must cover at least half of the name's words, or equal an alias.
const STOP = new Set(['the', 'of', 'and', 'in', 'a', 'de', 'la', 'le', 'art', 'style', 'styles', 'aesthetic', 'aesthetics', 'tradition', 'traditional', 'culture'])
const words = (x: string) => new Set(x.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').split(' ').filter((w) => w.length > 1 && !STOP.has(w)).map((w) => w.slice(0, 6)))
function aboutRecord(a: { name: string; aliases: string[]; wikipedia?: string | null }) {
  const t = words(a.wikipedia ?? '')
  const lower = (a.wikipedia ?? '').toLowerCase()
  if (a.aliases.some((x) => x.toLowerCase() === lower) || a.name.toLowerCase() === lower) return true
  const n = [...words(a.name)]
  return n.length > 0 && n.filter((w) => t.has(w)).length / n.length >= 0.5
}
const all = loadAesthetics().filter((a) => a.wikipedia && aboutRecord(a))
const fields = ['visualDNA', 'recipe', 'fashion', 'architecture', 'environment', 'photography', 'graphicDesign', 'keyExamples'] as const
const todo = all.filter((a) => fields.some((f) => empty(a[f])))
console.log(`${todo.length} records with a Wikipedia article and an empty field`)
const filled: Record<string, number> = {}
let shown = 0

// Full-text extracts come back for one page per request, so ask for one title at a time.
for (let i = 0; i < todo.length; i += 1) {
  const batch = todo.slice(i, i + 1)
  let texts: Map<string, string>
  try {
    texts = await extracts(batch.map((a) => a.wikipedia!))
  } catch (e) {
    console.error(`✗ batch ${i}: ${String(e).slice(0, 80)}`)
    continue
  }
  for (const a of batch) {
    const text = texts.get(a.wikipedia!)
    if (!text) continue
    const secs = sections(text)
    const added: Record<string, unknown> = {}
    const set = <K extends (typeof fields)[number]>(k: K, v: (typeof a)[K]) => {
      if (!empty(a[k]) || empty(v)) return
      a[k] = v
      added[k] = v
      filled[k] = (filled[k] ?? 0) + 1
    }
    const style = find(secs, /^(characteristics|characteristic features|style|styles|stylistic features|features|design|description|form|forms|appearance|elements|motifs|iconography|aesthetics?|visual (style|elements|characteristics)|principles|decoration|ornament(ation)?)$/i)
    if (style) set('visualDNA', kv(style))
    const tech = find(secs, /^(techniques?|process|production|method|methods|manufactur(e|ing)|making|materials and techniques|technique and materials|construction)$/i)
    if (tech) {
      const t = prose(tech.body, 700) || (tech.children[0] ? prose(tech.children[0].body, 600) : '')
      if (t) set('recipe', { technique: t })
    }
    const dress = find(secs, /^(clothing|dress|costumes?|fashion|garments?|attire)$/i)
    if (dress) set('fashion', kv(dress))
    if (a.category !== 'Architectural Style') {
      const arch = find(secs, /^(architecture|buildings)$/i)
      if (arch) set('architecture', kv(arch))
    }
    const env = find(secs, /^(interiors?|interior design|interior decoration|gardens?)$/i)
    if (env) set('environment', kv(env))
    const photo = find(secs, /^photography$/i)
    if (photo) set('photography', kv(photo))
    const gd = find(secs, /^(graphic design|posters?|typography)$/i)
    if (gd) set('graphicDesign', kv(gd))
    const ex = find(secs, /^(notable (examples|works|buildings|artists|practitioners)|examples|selected works|list of works)$/i)
    if (ex) {
      const lines = [ex, ...ex.children]
        .flatMap((s) => s.body.split(/\n+/))
        .map((l) => l.trim())
        .filter((l) => l.length > 2 && l.length <= 90 && !/[.!?]$/.test(l))
      set('keyExamples', [...new Set(lines)].slice(0, 12))
    }
    if (Object.keys(added).length) {
      a.updatedAt = new Date().toISOString()
      if (!DRY) saveAesthetic(a)
      if (process.env.SHOW && shown++ < Number(process.env.SHOW)) console.log(a.slug, JSON.stringify(added, null, 1).slice(0, 1200))
    }
  }
  if (i % 250 === 0) console.log(`  ${Math.min(i + 20, todo.length)}/${todo.length}`, filled)
}
console.log('✓ filled', filled)
