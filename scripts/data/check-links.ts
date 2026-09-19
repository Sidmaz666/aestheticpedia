// Link validation for every URL in the library (sources, references, images).
//
//   • en.wikipedia.org/wiki/… links are verified in batches through the MediaWiki API
//     (missing pages are reported as 404 — this catches invented article titles).
//   • Search-style links (YouTube/Google Scholar/Archive.org searches) always resolve
//     and are not fetched.
//   • Everything else gets an HTTP HEAD (GET fallback). 404/410/DNS failures are marked
//     broken and hidden by the site; 401/403/429/5xx/timeouts are "unverifiable"
//     (bot protection) and stay visible.
//
// Writes a `check: { ok, status, checkedAt }` onto each item and a summary report to
// public/data/validation.json.
//
//   node scripts/data/check-links.ts            re-check links older than 14 days
//   node scripts/data/check-links.ts --force    re-check everything
import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { AestheticSchema } from '../../src/lib/schema.ts'
import { OUT_DIR, USER_AGENT, aicHeaders, cache, getJSON, loadAesthetics, pool, saveAesthetic, sleep } from './lib.ts'

const FORCE = process.argv.includes('--force')
const MAX_AGE = 14 * 24 * 3600 * 1000
const now = new Date().toISOString()

type Check = { ok: boolean; status?: number; checkedAt: string }
type Item = { url: string; check?: Check; thumb?: string }

const SEARCH_LINK =
  /^https:\/\/(www\.youtube\.com\/results|scholar\.google\.com\/scholar\?|www\.google\.com\/search|archive\.org\/search|artsandculture\.google\.com\/search|www\.pinterest\.com\/search|commons\.wikimedia\.org\/w\/index\.php\?search)/

const aesthetics = loadAesthetics()
const fresh = (c?: Check) => !FORCE && c && Date.now() - Date.parse(c.checkedAt) < MAX_AGE

// ---------------------------------------------------------------------------
// Collect
// ---------------------------------------------------------------------------
const wikiTitles = new Map<string, string>() // url → title
const httpUrls = new Set<string>()
for (const a of aesthetics) {
  const items: Item[] = [...a.sources.filter((s) => s.url) as Item[], ...a.references, ...a.images]
  for (const it of items) {
    if (fresh(it.check) || SEARCH_LINK.test(it.url)) continue
    const m = /^https?:\/\/en\.(?:m\.)?wikipedia\.org\/wiki\/([^?#]+)/.exec(it.url)
    if (m) {
      try {
        wikiTitles.set(it.url, decodeURIComponent(m[1]).replace(/_/g, ' '))
        continue
      } catch {
        /* fall through to HTTP */
      }
    }
    httpUrls.add(it.url)
  }
}
console.log(`checking ${wikiTitles.size} Wikipedia links + ${httpUrls.size} other URLs`)

const results = new Map<string, Check>()

// ---------------------------------------------------------------------------
// Wikipedia — batch existence check
// ---------------------------------------------------------------------------
const titles = [...new Set(wikiTitles.values())]
const exists = new Map<string, boolean>()
for (let i = 0; i < titles.length; i += 50) {
  const batch = titles.slice(i, i + 50)
  const qs = new URLSearchParams({
    action: 'query',
    format: 'json',
    formatversion: '2',
    redirects: '1',
    titles: batch.join('|'),
  })
  const res = await getJSON<any>(`https://en.wikipedia.org/w/api.php?${qs}`)
  const alias = new Map<string, string>()
  for (const r of [...(res.query?.normalized ?? []), ...(res.query?.redirects ?? [])]) alias.set(r.from, r.to)
  const pages = new Map<string, any>((res.query?.pages ?? []).map((p: any) => [p.title, p]))
  for (const t of batch) {
    let cur = t
    for (let k = 0; k < 3 && alias.has(cur); k++) cur = alias.get(cur)!
    const p = pages.get(cur)
    exists.set(t, !!p && !p.missing && !p.invalid)
  }
}
for (const [url, title] of wikiTitles) {
  const ok = exists.get(title) ?? false
  results.set(url, { ok, status: ok ? 200 : 404, checkedAt: now })
}

// ---------------------------------------------------------------------------
// HTTP — per host politeness (sequential per host, parallel across hosts)
// ---------------------------------------------------------------------------
const UNVERIFIABLE = new Set([401, 403, 405, 406, 418, 429, 451, 500, 502, 503, 504, 520, 521, 522, 523, 524, 525, 526, 999])

async function probe(url: string): Promise<Check> {
  for (const method of ['HEAD', 'GET'] as const) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const res = await fetch(url, {
          method,
          redirect: 'follow',
          signal: AbortSignal.timeout(12_000),
          headers: {
            'User-Agent': USER_AGENT,
            Accept: 'text/html,application/xhtml+xml,image/*,*/*;q=0.8',
            ...(method === 'GET' ? { Range: 'bytes=0-2047' } : {}),
            ...aicHeaders(url),
          },
        })
        res.body?.cancel().catch(() => {})
        if (res.status === 429) {
          await sleep(3000 * (attempt + 1))
          continue
        }
        if (res.ok || res.status === 206 || (res.status >= 300 && res.status < 400)) return { ok: true, status: res.status, checkedAt: now }
        if (method === 'HEAD' && res.status !== 404 && res.status !== 410) break // retry as GET
        if (res.status === 404 || res.status === 410) return { ok: false, status: res.status, checkedAt: now }
        return { ok: true, status: res.status, checkedAt: now } // unverifiable — keep
      } catch (e) {
        const msg = String(e)
        if (/ENOTFOUND|getaddrinfo|ConnectionRefused|ECONNREFUSED|certificate|CERT_/i.test(msg))
          return { ok: false, status: 0, checkedAt: now }
        if (attempt === 1) return { ok: true, status: 0, checkedAt: now } // timeout — unverifiable
        await sleep(1500)
      }
    }
  }
  return { ok: true, status: 0, checkedAt: now }
}

// Wikimedia image URLs come straight from the MediaWiki imageinfo API (scripts/data/images.ts),
// so their existence is already established. Probe a random sample instead of all of them;
// if the sample shows breakage, fall back to probing every one.
const WIKIMEDIA_MEDIA = /^https:\/\/(upload|thumb)\.wikimedia\.org\//
const media = [...httpUrls].filter((u) => WIKIMEDIA_MEDIA.test(u))
if (media.length > 400) {
  const sample = [...media].sort(() => Math.random() - 0.5).slice(0, 200)
  let bad = 0
  await pool(sample, 4, async (u) => {
    const r = await probe(u)
    results.set(u, r)
    if (!r.ok) bad++
    await sleep(120)
  })
  console.log(`  wikimedia media sample: ${sample.length - bad}/${sample.length} ok`)
  if (bad <= 2) {
    for (const u of media) {
      if (!results.has(u)) results.set(u, { ok: true, status: 200, checkedAt: now })
      httpUrls.delete(u)
    }
  }
}

const byHost = new Map<string, string[]>()
for (const u of httpUrls) {
  let host = 'invalid'
  try {
    host = new URL(u).host
  } catch {
    results.set(u, { ok: false, status: 0, checkedAt: now })
    continue
  }
  if (!byHost.has(host)) byHost.set(host, [])
  byHost.get(host)!.push(u)
}
// Results persist between runs (data/.cache/links) so an interrupted check resumes.
const linkCache = cache<Check>('links')
let probed = 0
await pool([...byHost.entries()], 16, async ([host, urls]) => {
  const delay = /wikimedia|wikipedia/.test(host) ? 150 : 350
  let timeouts = 0
  for (const u of urls) {
    const cached = linkCache.get(u)
    let r: Check
    if (cached && Date.now() - Date.parse(cached.checkedAt) < MAX_AGE && !FORCE) r = cached
    else if (timeouts >= 3) r = { ok: true, status: 0, checkedAt: now } // host is unreachable for bots — circuit open
    else {
      r = await probe(u)
      timeouts = r.status === 0 && r.ok ? timeouts + 1 : 0
      linkCache.set(u, r)
      await sleep(delay)
    }
    results.set(u, r)
    if (++probed % 250 === 0) console.log(`  probed ${probed}/${httpUrls.size}`)
  }
})

// ---------------------------------------------------------------------------
// Apply + report
// ---------------------------------------------------------------------------
const report = {
  checkedAt: now,
  schemaErrors: 0,
  records: aesthetics.length,
  images: { total: 0, ok: 0, broken: 0, entriesWithImages: 0 },
  links: { total: 0, ok: 0, broken: 0, unverifiable: 0, search: 0 },
  brokenSamples: [] as { slug: string; url: string; status: number }[],
}
for (const a of aesthetics) {
  let changed = false
  const apply = (it: Item, kind: 'links' | 'images') => {
    const r = results.get(it.url)
    if (r) {
      it.check = r
      changed = true
    }
    const c = it.check
    if (kind === 'links' && SEARCH_LINK.test(it.url)) {
      report.links.search++
      report.links.total++
      report.links.ok++
      return
    }
    report[kind].total++
    if (c?.ok === false) {
      report[kind].broken++
      if (report.brokenSamples.length < 200) report.brokenSamples.push({ slug: a.slug, url: it.url, status: c.status ?? 0 })
    } else {
      report[kind].ok++
      if (kind === 'links' && c && c.status !== undefined && (c.status === 0 || UNVERIFIABLE.has(c.status))) report.links.unverifiable++
    }
  }
  for (const s of a.sources) if (s.url) apply(s as Item, 'links')
  for (const r of a.references) apply(r, 'links')
  for (const i of a.images) apply(i, 'images')
  if (a.images.some((i) => i.check?.ok !== false)) report.images.entriesWithImages++
  if (!AestheticSchema.safeParse(a).success) report.schemaErrors++
  if (changed) saveAesthetic(a)
}
mkdirSync(OUT_DIR, { recursive: true })
writeFileSync(path.join(OUT_DIR, 'validation.json'), JSON.stringify(report, null, 2) + '\n')
console.log('✓ link check', { images: report.images, links: report.links, schemaErrors: report.schemaErrors })
