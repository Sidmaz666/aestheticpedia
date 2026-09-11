/**
 * Aesthetic Atlas — Research pipeline runner.
 *
 * Usage:
 *   bun scripts/research/run.ts curated   # seed curated flagship entries
 *   bun scripts/research/run.ts queue     # create discovery batch queue from DOMAIN_BATCHES
 *   bun scripts/research/run.ts worker    # run the full research loop (long-running)
 *   bun scripts/research/run.ts enrich 500
 *   bun scripts/research/run.ts verify 300
 *   bun scripts/research/run.ts audit     # LLM gap analysis -> audit batches
 *   bun scripts/research/run.ts stats
 */
import { DOMAIN_BATCHES } from './domains'
import { EXPANDED_BATCHES } from './domains-expanded'
import { CURATED, seedCurated } from './curated-seed'
import {
  dbp, llmJSON, sleep, ensureKnownNames, insertEntry, validateEntry, isRateLimitedError, rateLimitedNow,
  DISCOVERY_SYSTEM, discoveryPrompt, ENRICH_SYSTEM, enrichPrompt,
  VERIFY_SYSTEM, verifyPrompt, objValSafe,
} from './lib'

const CONC = 2
const MAX_ROUNDS = 6
const PER_BATCH = 8

const log = (...args: any[]) => console.log(new Date().toISOString().slice(11, 19), ...args)

// ---------- queue ----------

async function createQueue() {
  const ALL: Array<[string, string, string]> = [...DOMAIN_BATCHES, ...EXPANDED_BATCHES]
  let n = 0
  for (const [category, domain, focus] of ALL) {
    const exists = await dbp.researchBatch.findFirst({ where: { domain, focus, kind: 'discovery' } })
    if (exists) continue
    await dbp.researchBatch.create({ data: { domain, focus, kind: 'discovery', requested: PER_BATCH } })
    n++
  }
  log(`Queue created: ${n} new batches (${ALL.length} total specs)`)
}

// ---------- discovery processing ----------

async function claimBatch() {
  return dbp.researchBatch.findFirst({ where: { status: 'queued' }, orderBy: { createdAt: 'asc' } })
}

async function runBatch(batch: { id: string; domain: string; focus: string; kind: string; attempts: number }) {
  await dbp.researchBatch.update({ where: { id: batch.id }, data: { status: 'running', attempts: { increment: 1 } } })
  try {
    const json = await llmJSON(
      DISCOVERY_SYSTEM,
      discoveryPrompt(batch.domain, batch.focus, categoryForBatch(batch), PER_BATCH)
    )
    if (!Array.isArray(json)) throw new Error('response not an array')
    await ensureKnownNames()
    let inserted = 0
    let duplicates = 0
    let invalid = 0
    for (const raw of json.slice(0, PER_BATCH + 6)) {
      const entry = validateEntry(raw, categoryForBatch(batch))
      if ('error' in entry) { invalid++; continue }
      const res = await insertEntry(entry, { batchId: batch.id, status: 'draft' })
      if (res.ok) inserted++
      else if (res.reason?.startsWith('duplicate')) duplicates++
    }
    await dbp.researchBatch.update({
      where: { id: batch.id },
      data: { status: 'done', inserted, duplicates, finishedAt: new Date() },
    })
    log(`✓ [${batch.kind}] ${batch.domain}: +${inserted} (${duplicates} dup, ${invalid} invalid)`)
  } catch (e: any) {
    const rateLimited = isRateLimitedError(e)
    const attempts = batch.attempts + (rateLimited ? 0 : 1)
    const failed = !rateLimited && attempts >= 3
    await dbp.researchBatch.update({
      where: { id: batch.id },
      data: { status: failed ? 'failed' : 'queued', error: String(e.message).slice(0, 300) },
    })
    if (!rateLimited) {
      log(`✗ [${batch.kind}] ${batch.domain}: ${String(e.message).slice(0, 120)} (attempt ${attempts})`)
    }
  }
}

function categoryForBatch(batch: { domain: string; kind: string }): string {
  const found = DOMAIN_BATCHES.find(([, d]) => d === batch.domain)
  if (found) return found[0]
  // Audit/expansion batches embed their category as "Category: domain"
  const idx = batch.domain.indexOf(': ')
  if (idx > 0) {
    const cat = batch.domain.slice(0, idx)
    const known = new Set(DOMAIN_BATCHES.map(([c]) => c))
    if (known.has(cat)) return cat
  }
  return 'Uncategorized'
}

async function processDiscovery(maxBatches = Infinity) {
  let completed = 0
  for (;;) {
    if (completed >= maxBatches) return
    const running = await dbp.researchBatch.count({ where: { status: 'running' } })
    const next = await claimBatch()
    if (!next) break
    const slots = CONC - running
    if (slots <= 0) { await sleep(500); continue }
    const promises = [runBatch(next)]
    for (let i = 1; i < slots; i++) {
      const b = await claimBatch()
      if (!b) break
      promises.push(runBatch(b as any))
    }
    await Promise.all(promises)
    completed += promises.length
    await sleep(400)
  }
}

// ---------- audit (gap analysis) ----------

export async function auditGen() {
  const cats = await dbp.aesthetic.groupBy({ by: ['category'], _count: { _all: true } })
  const lines = cats
    .sort((a, b) => b._count._all - a._count._all)
    .map((c) => `${c.category}: ${c._count._all}`)
    .join('\n')
  log('Running taxonomy gap audit over', cats.length, 'categories…')
  const openBacklog = await dbp.backlogTerm.findMany({
    where: { status: 'open' },
    orderBy: { createdAt: 'desc' },
    take: 60,
    select: { name: true },
  })
  const backlogHint = openBacklog.length > 0 ? `\n\nAlso unresolved referenced names awaiting coverage (verify real before batching): ${openBacklog.map((b) => b.name).join(', ')}` : ''
  const json = await llmJSON(
    `You are the taxonomy auditor of an encyclopedia of world aesthetics. You identify major DOCUMENTED aesthetics, styles and movements that are missing so coverage can be expanded. Strict JSON only.`,
    `The encyclopedia currently has these category counts:\n${lines}\n\nIdentify the most important GAPS: whole families, regions, eras or documented niche clusters that are missing or clearly underrepresented.${backlogHint}
Focus on genuinely documented aesthetics only (art movements, architecture, fashion, subcultures, internet aesthetics, regional traditions, typography, film, photography, games, music scenes, materials, etc.).
Return a JSON array of up to 24 batches:
[{"domain": "short batch title", "focus": "guidance naming specific documented styles to include", "category": "one of the existing category labels above or a new precise label", "count": 20}]
Never invent names. Prefer non-Western and underrepresented areas when justified.`
  )
  if (!Array.isArray(json)) { log('audit: no array returned'); return 0 }
  let n = 0
  for (const b of json.slice(0, 24)) {
    if (!b?.domain) continue
    const cat = String(b.category ?? '').slice(0, 60)
    await dbp.researchBatch.create({
      data: {
        // Embed category so runBatch can classify entries ("Category: domain").
        domain: cat ? `${cat}: ${String(b.domain).slice(0, 140)}` : String(b.domain).slice(0, 160),
        focus: String(b.focus ?? '').slice(0, 600),
        kind: 'audit',
        requested: Math.min(24, Math.max(10, Number(b.count) || 20)),
      },
    })
    n++
  }
  log(`Audit created ${n} expansion batches`)
  return n
}

// ---------- gap completion (no missing data policy) ----------

// Completes the shallow identity fields some entries are missing (palette,
// period, origin, textures, objects, era). Runs between enrichment and
// verification so every entry approaches a complete record.
const FILL_BATCH = 10

export async function fillGaps(target: number) {
  let done = 0
  let consecutiveFails = 0
  const skip = new Set<string>()
  for (;;) {
    const incomplete = await dbp.aesthetic.findMany({
      where: {
        id: { notIn: [...skip] },
        status: { not: 'flagged' },
        OR: [
          { colors: '[]' },
          { periodStart: '' },
          { origin: '' },
          { textures: '[]' },
          { objects: '[]' },
          { materials: '[]' },
          { era: '' },
          { keyExamples: '[]' },
        ],
      },
      orderBy: [{ popularity: 'desc' }, { createdAt: 'asc' }],
      take: FILL_BATCH,
      select: { id: true, name: true, category: true, summary: true, colors: true, periodStart: true, origin: true, textures: true, objects: true, materials: true, era: true, keyExamples: true },
    })
    if (incomplete.length === 0 || done >= target) break

    const res = await llmJSON(
      `You are a meticulous design researcher completing encyclopedia records about aesthetics, styles and movements. Only provide factual, documented details. Strict JSON only.`,
      `Complete the MISSING fields for each aesthetic below. If a field is already listed as present, do not repeat it.

${incomplete.map((e) => {
  const missing: string[] = []
  const parse = (s: string) => { try { return JSON.parse(s) } catch { return null } }
  if (!parse(e.colors)?.length) missing.push('colors')
  if (!e.periodStart) missing.push('period')
  if (!e.origin) missing.push('origin')
  if (!parse(e.textures)?.length) missing.push('textures')
  if (!parse(e.objects)?.length) missing.push('objects')
  if (!parse(e.materials)?.length) missing.push('materials')
  if (!e.era) missing.push('era')
  if (!parse(e.keyExamples)?.length) missing.push('examples')
  return `${missing.length ? missing.join(',') : 'nothing'} :: ${e.name} [${e.category}] — ${e.summary.slice(0, 100)}`
}).join('\n')}

Return JSON array of objects:
{"n": exact name, "col": [{"h": "#rrggbb", "n": "name"}] 4-5, "p": "period like 1890-1914", "o": "origin place", "tx": [2-4 textures], "obj": [3-6 typical objects], "m": [3-6 materials], "era": "era label", "ex": [2-4 real-world examples]}
Only include the requested fields. If genuinely unknown, omit the field.`
    ).catch((e) => {
      log(`fill batch failed: ${String(e.message).slice(0, 100)}`)
      return null
    })
    if (!Array.isArray(res)) {
      consecutiveFails++
      // Circuit: sustained rate-limit cooldown — abort the pass so the worker
      // moves on and the next wave retries when the API recovers.
      if (consecutiveFails >= 2) {
        log('fill: API rate-limited — aborting pass for this wave')
        return
      }
      for (const e of incomplete) skip.add(e.id)
      await sleep(5000)
      continue
    }
    consecutiveFails = 0

    for (const e of incomplete) {
      const item = res.find((r: any) => r && String(r.n ?? '').toLowerCase().trim() === e.name.toLowerCase().trim())
      if (!item) continue
      try {
        const cur = await dbp.aesthetic.findUnique({ where: { id: e.id } })
        if (!cur) continue
        const arrMerge = (curJson: string, patch: any, max = 10) => {
          const curArr: string[] = Array.isArray(JSON.parse(curJson || '[]')) ? JSON.parse(curJson) : []
          const add = Array.isArray(patch) ? patch.filter((x) => typeof x === 'string' && x.trim()) : []
          return JSON.stringify([...curArr, ...add].slice(0, max))
        }
        const colorArr = (v: any) => {
          if (!Array.isArray(v) || cur.colors !== '[]') return undefined
          const out = v.filter((c: any) => c && typeof c.h === 'string' && /^#[0-9a-fA-F]{6}$/.test(c.h)).slice(0, 7).map((c: any) => ({ hex: c.h.toLowerCase(), name: String(c.n ?? '').slice(0, 60) }))
          return out.length ? JSON.stringify(out) : undefined
        }
        const startYear = !cur.startYear && item.p ? parsePeriodYear(String(item.p), 'start') : undefined
        const endYear = !cur.endYear && item.p ? parsePeriodYear(String(item.p), 'end') : undefined
        await dbp.aesthetic.update({
          where: { id: e.id },
          data: {
            ...(cur.colors === '[]' ? { colors: colorArr(item.col) ?? cur.colors } : {}),
            ...(cur.periodStart === '' && item.p ? { periodStart: String(item.p).split(/[–—-]/)[0]?.trim().slice(0, 40) ?? '' } : {}),
            ...(cur.periodEnd === '' && item.p && /[–—-]/.test(String(item.p)) ? { periodEnd: String(item.p).split(/[–—-]/)[1]?.trim().slice(0, 40) ?? '' } : {}),
            ...(cur.origin === '' && item.o ? { origin: String(item.o).slice(0, 120) } : {}),
            ...(cur.textures === '[]' ? { textures: arrMerge(cur.textures, item.tx, 8) } : {}),
            ...(cur.objects === '[]' ? { objects: arrMerge(cur.objects, item.obj, 10) } : {}),
            ...(cur.materials === '[]' ? { materials: arrMerge(cur.materials, item.m, 10) } : {}),
            ...(cur.era === '' && item.era ? { era: String(item.era).slice(0, 60) } : {}),
            ...(cur.keyExamples === '[]' ? { keyExamples: arrMerge(cur.keyExamples, item.ex, 6) } : {}),
            ...(startYear != null ? { startYear } : {}),
            ...(endYear != null ? { endYear } : {}),
          },
        })
        done++
      } catch (err: any) {
        log(`fill update failed for ${e.name}: ${err.message}`)
      }
    }
    log(`gap-filled ${done}/${target}`)
    await sleep(300)
  }
  log(`Gap-fill pass complete: ${done} entries completed`)
}

function parsePeriodYear(period: string, which: 'start' | 'end'): number | null {
  if (!period) return null
  const p = period.toLowerCase()
  const mCent = p.match(/(\d{1,2})(?:st|nd|rd|th)\s*century/)
  if (mCent) {
    const n = parseInt(mCent[1], 10)
    let base = (n - 1) * 100
    if (which === 'end') base += 99
    if (p.includes('bc') || p.includes('bce')) base = -base
    return base
  }
  const nums = [...p.matchAll(/(\d{3,4})\s*(bce|bc)?/g)].map((m) => {
    const v = parseInt(m[1], 10)
    return m[2] ? -v : v
  })
  if (nums.length === 0) return null
  return which === 'start' ? nums[0] : (nums.length > 1 ? nums[nums.length - 1] : nums[0])
}

// ---------- enrichment ----------

const ENRICH_BATCH = 8

export async function enrich(target: number) {
  await ensureKnownNames()
  let done = 0
  let consecutiveFails = 0
  const skip = new Set<string>()
  for (;;) {
    const drafts = await dbp.aesthetic.findMany({
      where: {
        id: { notIn: [...skip] },
        OR: [
          { status: 'draft' },
          // Flagship (verified/researched) entries missing deep decomposition:
          // they are the most-visited pages, so fill their gaps too.
          { status: { in: ['researched', 'verified'] }, visualDNA: '{}' },
          { status: { in: ['researched', 'verified'] }, typography: '{}' },
          { status: { in: ['researched', 'verified'] }, uiTranslation: '{}' },
        ],
      },
      orderBy: [{ popularity: 'desc' }, { createdAt: 'asc' }],
      take: ENRICH_BATCH,
      select: { id: true, name: true, summary: true, status: true },
    })
    if (drafts.length === 0 || done >= target) break

    // One LLM call covers the whole batch (prompt supports arrays) — ~8x fewer
    // requests than per-entry calls, which matters under strict rate limits.
    const res = await llmJSON(
      ENRICH_SYSTEM,
      enrichPrompt(drafts.map((d) => ({ name: d.name, summary: d.summary })))
    ).catch((e) => {
      log(`enrich batch failed: ${String(e.message).slice(0, 100)}`)
      return null
    })
    if (!Array.isArray(res)) {
      consecutiveFails++
      if (consecutiveFails >= 2) {
        log('enrich: API rate-limited — aborting pass for this wave')
        return
      }
      // Unrecoverable batch — skip these drafts for this round so the loop
      // cannot stall forever on the same entries.
      for (const d of drafts) skip.add(d.id)
      await sleep(5000)
      continue
    }
    consecutiveFails = 0

    const strArr = (v: any): string[] =>
      Array.isArray(v) ? v.filter((x) => typeof x === 'string' && x.trim()).slice(0, 6) : []

    for (const draft of drafts) {
      const item = res.find(
        (r: any) => r && String(r.n ?? '').toLowerCase().trim() === draft.name.toLowerCase().trim()
      )
      if (!item) continue
      const existing = await dbp.aesthetic.findUnique({ where: { id: draft.id } })
      if (!existing) continue
      const merge = (curKey: string, patch: any) => ({ ...JSON.parse(existing[curKey] || '{}'), ...objValSafe(patch) })
      try {
        const sounds = strArr(item.snd)
        const hasDeep =
          Object.keys(item.vd ?? {}).length > 0 ||
          Object.keys(item.typ ?? {}).length > 0 ||
          Object.keys(item.ui ?? {}).length > 0
        await dbp.aesthetic.update({
          where: { id: draft.id },
          data: {
            visualDNA: JSON.stringify(merge('visualDNA', item.vd)),
            typography: JSON.stringify(merge('typography', item.typ)),
            lighting: JSON.stringify(merge('lighting', item.lit)),
            photography: JSON.stringify(merge('photography', item.pho)),
            architecture: JSON.stringify(merge('architecture', item.arc)),
            fashion: JSON.stringify(merge('fashion', item.fash)),
            environment: JSON.stringify(merge('environment', item.env)),
            graphicDesign: JSON.stringify(merge('graphicDesign', item.gd)),
            uiTranslation: JSON.stringify(merge('uiTranslation', item.ui)),
            recipe: JSON.stringify(merge('recipe', item.rec)),
            ...(sounds.length > 0 && JSON.parse(existing.sounds || '[]').length === 0
              ? { sounds: JSON.stringify(sounds) }
              : {}),
            // Only drafts advance status; verified entries keep their badge.
            ...(hasDeep && draft.status === 'draft' ? { status: 'researched' } : {}),
          },
        })
        done++
      } catch (e: any) {
        log(`enrich update failed for ${draft.name}: ${e.message}`)
      }
    }
    log(`enriched ${done}/${target}`)
    await sleep(300)
  }
  log(`Enrichment pass complete: ${done} entries deepened`)
}

// ---------- verification ----------

export async function verify(target: number) {
  let processed = 0
  let confirmed = 0
  let flagged = 0
  let consecutiveFails = 0
  for (;;) {
    const entries = await dbp.aesthetic.findMany({
      where: { status: 'researched', verifiedAt: null },
      orderBy: { popularity: 'desc' },
      take: 20,
      select: { id: true, name: true, category: true, summary: true },
    })
    if (entries.length === 0 || processed >= target) break
    const res = await llmJSON(VERIFY_SYSTEM, verifyPrompt(entries)).catch(() => null)
    if (!Array.isArray(res)) {
      consecutiveFails++
      if (consecutiveFails >= 2) {
        log('verify: API rate-limited — aborting pass for this wave')
        return
      }
      await sleep(1000)
      continue
    }
    consecutiveFails = 0
    for (const v of res) {
      const e = entries[Number(v?.i)]
      if (!e) continue
      const verdict = String(v?.v ?? '')
      const conf = Math.max(0, Math.min(100, Math.round(Number(v?.c ?? 60))))
      if (verdict === 'confirmed' && conf >= 65) {
        await dbp.aesthetic.update({ where: { id: e.id }, data: { status: 'verified', verifiedAt: new Date(), confidence: conf } })
        confirmed++
      } else if (verdict === 'suspect') {
        await dbp.aesthetic.update({ where: { id: e.id }, data: { status: 'flagged', confidence: Math.min(conf, 40) } })
        flagged++
      }
      processed++
    }
    log(`verified batch: ${confirmed} confirmed, ${flagged} flagged (${processed}/${target})`)
    await sleep(400)
  }
  log(`Verification pass: processed ${processed}, confirmed ${confirmed}, flagged ${flagged}`)
}

// ---------- stats ----------

export async function stats() {
  const total = await dbp.aesthetic.count()
  const byStatus = await dbp.aesthetic.groupBy({ by: ['status'], _count: { _all: true } })
  const byCat = await dbp.aesthetic.groupBy({ by: ['category'], _count: { _all: true }, orderBy: { _count: { category: 'desc' } } })
  const batches = await dbp.researchBatch.groupBy({ by: ['status'], _count: { _all: true } })
  const backlog = await dbp.backlogTerm.count({ where: { status: 'open' } })
  console.log('TOTAL:', total)
  console.log('STATUS:', byStatus.map((s) => `${s.status}=${s._count._all}`).join(' '))
  console.log('BATCHES:', batches.map((s) => `${s.status}=${s._count._all}`).join(' '))
  console.log('BACKLOG:', backlog)
  console.log('TOP CATEGORIES:', byCat.slice(0, 12).map((c) => `${c.category}=${c._count._all}`).join(', '))
}

// ---------- worker loop ----------

async function worker() {
  log('Worker starting (concurrency', CONC + ')')
  await ensureKnownNames()
  for (;;) {
    // 0. Complete shallow identity fields (palette, period, origin...) —
    //    the "no missing data" policy for every record.
    const incompleteCount = await dbp.aesthetic.count({
      where: {
        status: { not: 'flagged' },
        OR: [
          { colors: '[]' }, { periodStart: '' }, { origin: '' }, { textures: '[]' },
          { objects: '[]' }, { materials: '[]' }, { era: '' }, { keyExamples: '[]' },
        ],
      },
    })
    if (incompleteCount > 0) {
      log(`— gap-fill: ${incompleteCount} entries missing identity fields —`)
      await fillGaps(Math.min(40, incompleteCount))
    }
    // 1. Deepen existing entries FIRST — flagship + popular pages get their
    //    full decomposition before new shallow entries are discovered.
    const enrichable = await dbp.aesthetic.count({
      where: {
        OR: [
          { status: 'draft' },
          { status: { in: ['researched', 'verified'] }, visualDNA: '{}' },
          { status: { in: ['researched', 'verified'] }, typography: '{}' },
          { status: { in: ['researched', 'verified'] }, uiTranslation: '{}' },
        ],
      },
    })
    if (enrichable > 0) {
      log(`— enrichment: ${enrichable} entries need depth —`)
      await enrich(Math.min(80, enrichable))
    }
    // 2. Verify what has been researched.
    const researched = await dbp.aesthetic.count({ where: { status: 'researched', verifiedAt: null } })
    if (researched > 0) {
      await verify(Math.min(120, researched))
    }
    // 3. Then discover new entries in waves.
    const queued = await dbp.researchBatch.count({ where: { status: 'queued' } })
    if (queued > 0) {
      log(`— discovery: ${queued} queued —`)
      await processDiscovery(24)
    }
    // Continuous-expansion loop: whenever the queue is nearly drained, the
    // taxonomy auditor inventories gaps + unresolved backlog names and queues
    // a new wave of targeted batches. The library never stops growing.
    const discoveryDone = await dbp.researchBatch.count({ where: { kind: 'discovery', status: 'done' } })
    const auditBatches = await dbp.researchBatch.count({ where: { kind: 'audit', status: { in: ['queued', 'running'] } } })
    const queuedNow = await dbp.researchBatch.count({ where: { status: 'queued' } })
    if (discoveryDone > 0 && auditBatches === 0 && queuedNow < 30) {
      const auditCount = await auditGen().catch((e) => { log('audit failed:', e.message); return 0 })
      if (auditCount > 0) await processDiscovery(24)
    }
    const remaining = await dbp.researchBatch.count({ where: { status: 'queued' } })
    const stillEnrichable = await dbp.aesthetic.count({ where: { status: 'draft' } })
    if (rateLimitedNow()) {
      log('API cooling down — worker resting 90s')
      await sleep(90_000)
    } else if (remaining === 0 && stillEnrichable === 0) {
      log('Queue drained. Idle 90s…')
      await sleep(90_000)
    } else {
      await sleep(1000)
    }
  }
}

// ---------- CLI ----------

const cmd = process.argv[2] ?? 'stats'
;(async () => {
  try {
    if (cmd === 'curated') await seedCurated()
    else if (cmd === 'queue') await createQueue()
    else if (cmd === 'fill-gaps') await fillGaps(Number(process.argv[3] ?? 200))
    else if (cmd === 'worker') await worker()
    else if (cmd === 'audit') await auditGen()
    else if (cmd === 'enrich') await enrich(Number(process.argv[3] ?? 200))
    else if (cmd === 'verify') await verify(Number(process.argv[3] ?? 200))
    else if (cmd === 'stats') await stats()
    else if (cmd === 'curated-list') console.log(CURATED.map((c) => c.n).join(', '))
    else console.log('unknown command', cmd)
  } catch (e: any) {
    console.error('FATAL', e)
    process.exitCode = 1
  } finally {
    await dbp.$disconnect()
  }
})()
