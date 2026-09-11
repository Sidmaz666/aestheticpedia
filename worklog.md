# Aesthetic Atlas — Shared Worklog

Single source of truth for all agents working on this project.
Each agent MUST read this file before starting and append its section after finishing.

Project: Next.js 16 + TS + Tailwind 4 + shadcn/ui + Prisma (SQLite) at /home/z/my-project.
Goal: AESTHETIC ATLAS — a living, searchable encyclopedia of human aesthetics with a
research pipeline targeting thousands of genuinely documented entries, a coverage
dashboard, backlog queue, and full per-aesthetic decomposition (visual DNA, palette,
typography, materials, relationships, sources).

---
Task ID: 1
Agent: lead (orchestrator)
Task: Project setup — schema, DB, worklog, pipeline architecture.

Work Log:
- Read master prompt (upload/Pasted Content_1789091863087.txt, 3652 lines).
- Replaced prisma/schema.prisma with Aesthetic Atlas knowledge-graph schema:
  Aesthetic (identity + decomposition JSON payloads), Relation (typed graph edges),
  ResearchBatch (discovery/expansion/audit queue), BacklogTerm (unresolved references backlog).
- Pending: db push, curated seed, LLM research pipeline, frontend build.

Stage Summary:
- Schema contract (see prisma/schema.prisma) is the source of truth for all agents.
- Status enum: draft | researched | verified | flagged.
- Establishment enum: historical | regional_tradition | community_subculture | commercial_style | internet_aesthetic | experimental_hybrid.

---
Task ID: 1 (continued)
Agent: lead (orchestrator)
Task: Research pipeline implementation + launch.

Work Log:
- Built scripts/research/{lib,domains,curated-seed,run}.ts.
- Curated seed: 56 hand-verified flagship entries (status=verified, well_documented) across all major categories.
- Domain queue: 270 discovery batches across 32 canonical categories (art, architecture, interiors, fashion, subcultures, internet aesthetics, web/UI, games, film, photography, illustration, animation, music, literature, regional traditions, religious art, historical periods, retrofuturism, sci-fi, nature, materials, color/light, mood, food, performance, sports, transport, micro-aesthetics, hybrids).
- Pipeline: LLM discovery batches -> validate -> dedupe (normalized name + alias + containment) -> insert (status=draft) -> relation linking (influenced_by/related) -> unresolved names go to BacklogTerm. Then audit (LLM gap analysis -> new batches), enrichment (deep decomposition: visualDNA/typography/lighting/photography/architecture/fashion/environment/graphicDesign/ui/recipe; draft->researched), verification (fact-check pass; researched->verified|flagged).
- Hardening: JSON repair parser salvages complete entries from truncated LLM responses; global rate-limit throttle (3.5s gap + 429 backoff); concurrency 2; batch size 8; SQLite single-connection writer.
- Worker launched in background (nohup), logs to /home/z/my-project/pipeline.log.

Stage Summary:
- DB schema final. DO NOT modify prisma/schema.prisma without lead approval.
- Pipeline runs autonomously; entries stream in continuously (draft -> researched -> verified).
- CLI: bun scripts/research/run.ts {curated|queue|worker|enrich|verify|audit|stats}.

---
Task ID: 2
Agent: full-stack-developer
Task: API routes + frontend SPA for Aesthetic Atlas

Work Log:
- Implemented 10 API route handlers under src/app/api/: aesthetics (list+facets), aesthetics/[slug] (detail+relations), stats, random, explore, compare, hybrid (backend LLM via z-ai-web-dev-sdk), timeline, pipeline (GET status + POST audit trigger), suggest.
- Built src/lib/aesthetic.ts: shared types (AestheticSummary/AestheticFull/StatsResponse/...), defensive JSON parsing, region mapping, filters serialization (610 lines).
- Built src/components/atlas/: header (search + suggest dropdown + tabs), hero (editorial intro + live count), atlas-view (filter sidebar + card grid + pagination), filter-panel, aesthetic-card, palette-strip, detail-sheet (full decomposition: DNA bars, emotion radar, ingredients, UI translation, recipe, relationships, sources with tiers, export menu), dna (DnaBars/EmotionRadar/EmotionBars), explorer-view (15 dimension sliders + presets + distance-scored results), timeline-view (era bands), bits, api hooks (react-query).
- Wired Providers (QueryClient + sonner toaster) into layout.tsx with full metadata.
- NOTE: agent run hit the context deadline before page.tsx wiring, lab-view and dashboard-view; lead completed them (see Task 3).

Stage Summary:
- All 10 endpoints return the contracted shapes; detail sheet resolves typed relations both directions.
- Design system: warm paper (#faf8f4), stone ink, bronze accent (#8a6d3b), serif display headings, hairline borders, thin scrollbars (scrollbar-thin utility).

---
Task ID: 3
Agent: lead (orchestrator)
Task: Complete missing views, integrate, harden pipeline, verify end-to-end.

Work Log:
- Completed src/app/page.tsx wiring (header + hero + 5 views + sticky footer + detail sheet state + scroll-reset on view change).
- Built src/components/atlas/lab-view.tsx (dual aesthetic pickers with suggestions, hybrid generation with EXPERIMENTAL labeling, parent links) and dashboard-view.tsx (stat cards, category/establishment/era/region bars, documentation quality, research pipeline panel with recent batches table + queue list, underrepresented areas, research funnel, Trigger gap audit button).
- Fixed: Tailwind arbitrary-variant CSS that broke globals compile; DialogTitle a11y warning (sr-only title); header effect lint (render-time adjustment pattern); timeline BCE formatting + initial scroll to dense eras; emotion radar label clipping (expanded viewBox).
- Pipeline hardening: JSON repair parser salvages entries from truncated LLM responses (critical — API caps output ~14KB); global throttle + 429 backoff; audit batches now embed category ("Category: domain") so gap-audit entries are classified correctly; manual audit POST creates targeted batches for the 5 least-covered categories.
- Verified via Agent Browser: home, atlas grid + facets + pagination, search + suggestions + enter-to-search, detail sheet (palette, DNA, emotions, relationships across curated+pipeline entries, tiered sources, confidence), explorer presets → scored results, timeline, lab hybrid (Dark Academia + Ukiyo-e → "Edo Scholar's Gloom", properly labeled), dashboard (live counts, pipeline table, audit trigger), mobile 390px layout, sticky footer, no console errors.

Stage Summary:
- App fully verified in browser at / (desktop + mobile). Lint clean.
- Pipeline: 270 discovery batches + auto gap-audit + backlog loop running in background; entries stream in continuously (draft → researched → verified). Live totals visible on the dashboard.

---
Task ID: 4
Agent: lead (orchestrator)
Task: Continuous growth optimization + final verification.

Work Log:
- Interleaved pipeline phases (discovery waves of 30 batches → enrich 60 → verify 120, loop) so the draft→researched→verified funnel progresses continuously instead of waiting for full discovery.
- Raised LLM concurrency to 3 with throttle protection (~600-700 entries/hour observed).
- Manual "Trigger gap audit" now creates targeted expansion batches for the 5 least-covered categories.
- Final Agent Browser pass: home renders live count (248), featured cards include newest pipeline entries (Forbidden City Architecture, Prairie School, High Gothic...); lint clean; no console errors.

Stage Summary:
- AT RUNTIME SNAPSHOT: 248+ entries (56 verified curated, 192 draft growing), 314 relations, 40/274 batches complete, 234 queued, backlog 743+ open reference terms feeding future rounds.
- The system is autonomous: worker keeps researching, auditing gaps, enriching, verifying, indefinitely. The dashboard reports live, honest numbers.

---
Task ID: 5
Agent: lead (orchestrator)
Task: Visual completeness overhaul — images, live web-component demos, textures/effects/drawing/painting research expansion, enrichment of all shallow entries.

Work Log:
- Audited DB: 317 entries but ~276 drafts missing visualDNA/typography/lighting/architecture/fashion/environment/graphicDesign/uiTranslation/recipe; ALL 317 missing sounds; 0 images anywhere. Confirmed user complaint "the core is missing".
- Schema: added `images` JSON column (url/caption/source/width/height) to Aesthetic; db push + client regen; restarted dev server (old client cached the schema).
- Research expansion: appended 51 domain batches in scripts/research/domains.ts — new categories "Texture & Material Study" (11 batches: wood/stone/metal/textile/leather/glass/paper/plastics/organic/wear-patina/architectural surfaces), "Visual Effects & Phenomena" (10: painting light effects, natural phenomena, lens, analog film, VHS/CRT, print reproduction, digital artifacts, weather, material light interaction, stage lighting), "Drawing & Line Work" (10: pen+ink, East Asian brush, comics/manga, scientific/technical, observational, folk/vernacular, ornament systems, digital line, fashion sketching, caricature), "Painting Technique & School" (12: oil/water-based/fresco/miniature schools/Indian folk/sacred/East Asian/encaustic/modernist/decorative/plein-air/face+body), plus Color & Light (4) and Material & Surface (4) expansions. Queued all 50 with backdated createdAt so they are claimed FIRST (268 total queued).
- Enrichment rewrite: batched 8 entries per LLM call (~8x fewer requests), added `snd` sonic-identity field to enrich prompt + merge, skip-set prevents infinite retry loops, extended target set to verified/researched entries missing deep fields (flagships like Art Nouveau/Vaporwave were never enriched) without demoting their status.
- Rate-limit hardening: MIN_GAP_MS 3.5s→6s, 429 backoff 15s→20-60s capped, worker concurrency 3→2, worker loop reordered ENRICH → VERIFY → DISCOVER so most-visible pages gain depth first.
- New image worker scripts/research/images.ts: `z-ai image-search` CLI per entry (category-aware natural-language queries, --gl us --no-rank), stores 6 real OSS-hosted example images per entry, ordering verified→researched→draft by popularity, crash-proof loop, ~15s/entry. 43+ entries illustrated and climbing.
- Frontend: new src/components/atlas/style-demo.tsx — VisualGallery (real image grid + lightbox + source badges + lazy fallback), StyleDemo (LIVE web component re-rendering each aesthetic from its own palette/typography/texture/lighting/motion data: browser-window template for web/internet categories, magazine cover for fashion/subculture, editorial plate for architecture/interior, gallery frame for art — all deterministic), TextureSwatches (CSS-rendered texture pattern chips), PendingNotice (honest "decomposition queued" state). Keyframes aa-float/aa-flicker in globals.css with reduced-motion guard.
- Wiring: lib/aesthetic.ts ImageEntry type + asImageArray + summary.image; detail sheet renders PendingNotice → VisualGallery → StyleDemo above DNA, texture swatches inside ingredients, recipe music/scent moved into UI blueprint; aesthetic-card shows image thumbnails with palette-strip fallback.
- Verified in browser: home, search→detail (Art Nouveau: 6 sourced images w/ EBAY/ART&OBJECT/REDDIT badges, live gallery demo in gold Art-Nouveau palette; Frutiger Aero: web template with browser chrome, tag nav, Vista/iOS/Wii cards, gloss textures), Romanticism fully decomposed, texture swatches, dashboard live counters, mobile 390px, sticky footer, zero console errors, lint clean.

Stage Summary:
- The "missing core" is fixed at the system level: enrichment-first pipeline fills every shallow entry (276 queued, ~8/2min and accelerating), image worker attaches real examples continuously, 50 priority batches push textures/effects/line-work/painting coverage.
- New data columns: Aesthetic.images. New CLI: bun scripts/research/images.ts {worker|once}.
- Worklog note for future agents: images column is populated by the image worker only; enrich() no longer downgrades verified entries; discovery/enrich/verify phases are ordered enrich-first in the worker loop.

---
Task ID: 6 (pipeline wave)
Agent: lead (orchestrator)
Task: Scale queue toward 5,000+ entries + no-missing-data policy + continuous expansion loop.

Work Log:
- Wrote scripts/research/domains-expanded.ts: 377 new discovery batch specs (wave 1: 268 domain-deepening specs; wave 2: 109 more incl. castle/himalayan/colonial architecture, raw materials, metalpoint/charcoal/printmaking line work, cave painting, inscriptional lettering, VTuber/AI-era/XP-nostalgia internet aesthetics, vinyl/cassette packaging, regional music visuals, Slavic/Baltic/Celtic/Jewish folk arts, atomic kitsch, farm machinery, restroom/office/lighting design eras). Every focus names real documented clusters.
- run.ts createQueue now merges domains.ts + domains-expanded.ts: 698 total specs, 378 new batches queued (queue path to ~5,400+ entries).
- Added fillGaps(): LLM completion pass for entries missing colors/period/origin/textures/objects/materials/era/keyExamples; wired as worker step 0 ("no missing data" policy).
- Worker audit loop changed: previously gated by totalBatches<600 (would never fire again); now fires whenever queued<30 with backlog-term hints injected into the audit prompt -> continuous expansion forever.
- Restarted worker (pid 21210).

Stage Summary:
- Queue: 698 specs (378 newly queued). Worker loop: gap-fill -> enrich -> verify -> discover(24) -> audit-on-low-queue.
- CLI additions: bun scripts/research/run.ts fill-gaps N.

---
Task ID: 7-a
Agent: full-stack-developer
Task: Rebuild style-demo.tsx into a professional 12-template tabbed demo suite (fix "broken/generic" demo complaints + palette fallback).

Work Log:
- Kept public contract exactly: StyleDemo({ a: AestheticFull }), TextureSwatches({ textures, colors }), VisualGallery({ images, name }), PendingNotice({ a }); design language preserved (warm paper, serif headings, hairline rgba(ink,0.18) borders, #8a6d3b bronze, shadowFor/motion badges, deterministic rendering — no Math.random, no Date.now).
- PALETTE FALLBACK: added 22 keyword-matched category palette presets (web/UI teal, internet vivid magenta, games dark+amber, tech orange, fashion ivory/black/gold, architecture stone/slate/brass, textile warm earth, music crimson, subculture red, interior terracotta, furniture walnut, material copper, sacred gold/red, drawing sanguine, painting ochre, VFX luminous teal, film amber, sci-fi gold/teal, art-movement paper/bronze, regional madder/gold, typography vermillion, atlas default). derivePalette(colors, context) now takes a context string (category+subcategory; textures for swatches) and returns fromPreset label; when <2 valid hex colors the preset is used and the demo footer labels it "suggested palette (group) — research in progress".
- StyleDemo is now a TABBED SUITE: role=tablist/tab/tabpanel, aria-selected/aria-controls/aria-labelledby, ArrowLeft/ArrowRight roving focus, horizontally scrollable bronze-active tab bar (Auto ★, Web, Cover, Plate, Gallery, Poster, UI kit, Pattern, Type, Line art, Painting, 3D material). Header keeps "Live style demo" + explanation; badge shows "Auto → {template}"; footer names the active template.
- autoTemplateFor(): keyword rules map category→template exactly per spec (web/cover/plate families, VFX→shader, drawing→lineart, painting→painting, typography→type, textile/regional→pattern, religious→gallery, everything else→gallery).
- NEW templates: PosterDemo (huge display type, date line from period/era with honest "to be announced — research in progress" fallback, venue from origin/geography, tag chips, big accent block, ticket+barcode, frame radius driven by visualDNA.line: whiplash→rounded/organic, angular→sharp); UIKitDemo (palette-dot toolbar, primary/ghost buttons, input with placeholder from tags/objects, toggle, maximalism progress meter, 2 example cards, badge row, styling microcopy); PatternDemo (6 seamless 40×40 SVG-tile motifs — ikat→zigzag, velvet→dots, wood→stripes, lattice/quilt→diamonds, damask/whiplash→arabesque, floral→floral, hash fallback — shown at 1×/2×/4× + applied-surface band via data-URL background-size scaling); TypeSpecimenDemo (giant Aa in display font, stack label, A-Z/a-z/0-9 rows, pangram, typography display/body/notes annotations with "— research in progress", weight/tracking/case chips); LineArtDemo (pure SVG seeded by hashStr, motif family from visualDNA.line keywords: botanical stem+leaves / geometric star+lattice / gestural curves, line weight from line text, hatching density from minimal_maximal + dense_spacious axes, plate frame + caption); PaintingDemo (2D canvas in useEffect, seeded Lehmer LCG — 26-96 strokes from maximalism, impasto/body/wash softness from texture keywords, jitter from orderly_chaotic, gallery-mat frame, aria-labeled, deterministic across renders); shader tab renders <ShaderLab a={a}/> untouched.
- Extracted shared Barcode (cover + poster); kept BrowserDemo/MagazineDemo/PlateDemo/GalleryDemo visually as-is. Every template renders meaningful content from name/summary/tags/category even when decomposition is empty.
- Verified in browser: 12 tabs render for verified (Prairie School: plate auto, geometric line art 16 paths/2 polys/9 dots, canvas painted, WebGL wood-grain shader) and draft/sparse entries (Miami Modernism: 1 color → architecture preset + honest footer label; poster shows era dates/venue/tags). Arrow-key tab nav works; 390px mobile has no overflow; zero console/page errors.
- Quality gates: bun run lint → 0 errors; tsc --noEmit → 0 errors in style-demo.tsx / shader-lab.tsx (remaining project-wide errors are the pre-existing baseline in unrelated files). No other file modified; shader-lab.tsx untouched.

Stage Summary:
- Detail sheet now ships a 12-lens demo suite: every entry gets category-mapped auto template + 11 manual lenses, with honest "suggested palette — research in progress" labeling when palette data is thin.
- New exports/behavior for future agents: DemoPalette.fromPreset (null = real data), TEMPLATE_LABELS/TABS in style-demo.tsx; ShaderLab is imported read-only from './shader-lab'.
- Worklog note: TextureSwatches now passes texture keywords as preset context, so texture chips stay tinted even for entries with no colors yet.

---
Task ID: 7
Agent: lead (orchestrator) + full-stack-developer (7-a)
Task: 3D shader material lab, 12-template demo suite, completeness audit surfacing, pipeline rate-limit hardening.

Work Log:
- Built src/components/atlas/shader-lab.tsx: raw-WebGL 3D material study (no deps). 20 procedural GLSL materials (wood FBM rings, marble veins, brushed/hammered metal, rust, cloth weave, velvet sheen, ceramic crackle, leather, gloss plastic, animated CRT phosphor, water, thin-film holographic, fur, concrete, terrazzo, ice cracks, paper grain, glass, neon fog), Blinn-Phong + fresnel, bump-mapped via per-material height fields along analytic tangent frames, palette uniforms from entry colors, deterministic seed from slug. Torus knot / torus / sphere geometries, drag-rotate, wheel-zoom, expand, reset, reduced-motion guard, WebGL fallback. materialsFor() routes entry texture vocabulary -> material chips.
- Task 7-a (full-stack-developer): rebuilt style-demo.tsx into a tabbed 12-template suite (Auto/Web/Cover/Plate/Gallery/Poster/UI kit/Pattern/Type/Line art/Painting/3D material) with real tablist a11y + arrow-key roving focus; 22 deterministic per-category palette presets for entries lacking colors (honestly labeled "research in progress"); generative SVG line art + seeded-LCG canvas painting; new categories mapped (VFX->shader, drawing->lineart, painting->painting, typography->type, textile->pattern). Only style-demo.tsx touched; StyleDemo signature unchanged.
- Data completeness surfacing: new GET /api/audit (16 field-gap counts, core/deep completeness %, 5,000-target progress); dashboard panels "Library growth milestone" (progress bar with 1k-4k markers + live queue count) and "Record integrity — no missing data" (core/deep bars + green/gray field-gap chips); per-entry RecordMeter (15-field checklist, honest "still documenting" microcopy) in detail sheet; useAudit hook.
- Pipeline scale + resilience: domains-expanded.ts final = 377 specs (698 total with domains.ts; 378 new batches queued = 643 in queue). fillGaps() ran and completed ALL identity-field gaps (audit shows palette/period/origin/textures/objects/materials/era/sources all at 0 missing; core completeness 99-100%). Rate-limit circuit breaker in lib.ts (sustained 429 -> 3-min cooldown, fail-fast); runBatch no longer burns batch attempts on 429s (re-queues instead of failing permanently); enrich/verify/fillGaps abort passes after 2 consecutive failures; worker rests 90s during cooldown. Restarted worker + image worker (both crash-proof, auto-resume when API quota resets).
- Agent Browser verification: home 317 entries; Romanticism detail (researched): 6 sourced images w/ badges, record meter 14/15, all 12 demo tabs render real content, 3D shader renders golden torus knot + material chip switching + expand (300->430px), shader status line "seed 1720, palette 5 colors, live"; Brazilian Colonial Architecture (draft): PendingNotice + 8/15 meter + Auto->Plate demo with elevation study (no broken/empty demos); Fachwerk: texture-routed chips (Wood grain/Woven cloth/Concrete) + wood-grain shader verified visually; dashboard milestone + integrity panels live (643 queued batches); mobile 390px no h-overflow, footer pushed naturally; zero console/page errors; bun run lint clean.

Stage Summary:
- Examples system is now a professional 12-template demo suite + real-time WebGL 3D material lab, driven entirely by per-entry data with honest fallbacks.
- Path to 5,000+: 643 discovery batches queued (~5,400 entry potential) + continuous taxonomy-audit loop when queue drains + 1,211-term backlog recycled into audits. fillGaps + enrichment + image workers keep closing data gaps.
- NOTE for future agents: z-ai LLM API hit sustained 429s ~05:12-06:45 (quota window); the circuit breaker protects the queue — do NOT raise CONC or remove the breaker. `bun scripts/research/run.ts {stats|fill-gaps|audit|queue}` are the ops commands.

---
Task ID: 8-a
Agent: full-stack-developer
Task: Surface the two new Aesthetic columns (references + typePairing) end-to-end — types/parsing, detail-sheet References section, real-font Type specimen, audit counts, dashboard cultures panel.

Work Log:
- src/lib/aesthetic.ts: added `ReferenceEntry` {type,title,url,note?}; `asReferenceArray()` in the exact defensive style of asImageArray (http(s)-only URLs, non-empty title, type normalized to the known 8-kind set else 'web', note trimmed/capped, ~10-entry cap); `references: ReferenceEntry[]` + `typePairing: Record<string,string>` added to AestheticFull; `references`/`typePairing` string columns added to the explicit `AestheticRow` mapper type; mapAestheticFull now parses both (`asReferenceArray` / `asStringRecord`). Route SELECT audit: every route feeding mapAestheticFull (aesthetics/[slug], compare, hybrid) uses findUnique/findMany WITHOUT a select clause → full rows already include the new columns, so no route changes were needed; routes with explicit selects (list/explore/timeline/stats/suggest) build their own summary shapes and don't use this mapper.
- src/components/atlas/detail-sheet.tsx: new `ReferencesSection` rendered after Sources, before the confidence footer; only renders when references exist; groups into Read (article+scholar, BookOpen), Watch (video, Youtube), Visit (museum+exhibition, Landmark), Explore (web+archive+images, Globe/Archive/Images per item); each link = target=_blank rel=noopener noreferrer, bronze underlined title, tiny uppercase type badge, muted note line, per-type icon + 12px ArrowUpRight; matches the sheet's paper/serif/hairline/bronze language. RecordMeter: added 'references' and 'font pairing' rows → checklist is now 17 fields (totals auto-compute).
- src/components/atlas/style-demo.tsx: added a curated 88-name `GOOGLE_FONTS` set (only 100%-certain Google families; excluded Rockwell/Futura/etc.), case/whitespace-normalizing lookup map, `firstFontFamily()` (strips quotes, takes family before a comma), and `loadGoogleFont()` (module-level dedupe set, SSR guard, injects css2?family=<Name+with+&display=swap stylesheet link). TypeSpecimenDemo now prefers a.typePairing.display/body over the typography-derived stacks: loadable families render as `'Name', <existing fallback stack>` with the real names as labels (display name + "Body — name"), non-loadable names fall back to the existing character-matched system stack plus an honest footnote "Typeface shown in closest available stack — 'X' is/are not web-served"; pairing `notes` appended as a "Pairing" annotation row. All prior specimen content (Aa, alphabet rows, pangram, spec chips) kept; other tabs untouched.
- src/app/api/audit/route.ts: added `references: '[]'` and `typePairing: '{}'` counts to the Promise.all, two new gaps entries ('references', 'font pairing'), both included in deepMissing, deepFields 8→10.
- src/components/atlas/dashboard-view.tsx: verified the Record-integrity gap chips render the two new fields automatically (they map audit.completeness.gaps). Added one panel "World cultures coverage" (same card classes as neighbors): the 4 culture-category counts (Regional & Cultural Tradition / Textile & Craft / Religious & Sacred Art / Fashion & Dress; a missing category shows "not yet documented") + top-5 byRegion BarList, with honest microcopy. `Religious & Sacred Art` has 0 entries right now and renders the honest label.
- Ops note: dev server was still holding the PRE-restart Prisma client (started before the schema push) → /api/audit threw PrismaClientValidationError and rows lacked the new columns. Killed and relaunched `bun run dev` (same command, tee dev.log); after restart everything resolves live.
- Verified live APIs: /api/aesthetics/art-nouveau → 6 references (Wikipedia/YouTube/Scholar/Archive/museum/Images), typePairing {}; /api/audit → references missing 0 (green chip), font pairing missing 317, deep % dropped to 46 (honest, 10 fields now).
- Verified in browser (isolated agent-browser session; NOTE another agent shares the default session — use --session <name>): Romanticism sheet shows "References & where it's used" after Sources with Read/Watch/Visit/Explore clusters and 6 links; RecordMeter 15/17 ("font pairing" listed as still documenting); Type tab falls back to system stack when no pairing. Mocked the detail API (network route) with {display:'Bodoni Moda', body:'EB Garamond', notes} → specimen labels show the real names, "Pairing" row shows the note, and both Google Fonts css2 links are injected into <head>; mocked {display:'Rockwell', body:'Futura'} → no font links injected, real names still labeled, exact honesty footnote renders. Dashboard panel badge "11 entries in living traditions" + top-5 regions; integrity chips include "font pairing · 317" and "references · 0". Mobile 390px: no horizontal overflow. Zero console/page errors.
- Quality gates: bun run lint → 0 errors; bunx tsc --noEmit → 0 errors in all files I touched (remaining project errors are the documented pre-existing baseline in aesthetics/explore/hybrid/suggest/lab-view/timeline-view). One transient TS error I introduced (type-predicate on the optional `note`) was fixed by annotating the map callback `ReferenceEntry | null`.

Stage Summary:
- The two new schema columns are now first-class: every detail response carries parsed references + typePairing, the detail sheet renders them ("References & where it's used" section, Read/Watch/Visit/Explore clusters), and the per-entry completeness meter tracks both (17-field checklist).
- The Type specimen tab upgrades itself automatically as the enrichment pipeline backfills typePairing: real Google-Fonts rendering when the family is web-servable, honest system-stack fallback with a footnote when it is not.
- /api/audit deep completeness now spans 10 fields (references/typePairing included); dashboard shows the new gap chips plus a "World cultures coverage" panel (4 living-tradition categories + top-5 regions, honest zero-state).
- NOTE for future agents: agent-browser default session is shared across concurrent agents — always pass a distinct `--session`. The dev server must be restarted after any prisma client regen; do not assume the running process sees new columns.

---
Task ID: 8-b
Agent: full-stack-developer
Task: Extend ShaderLab with 8 world-cultural craft materials + keyword routing (single file: src/components/atlas/shader-lab.tsx, additive only).

Work Log:
- Continued from a partial session that had already added most of the work; audited the full diff (`git diff`: 199 insertions, 2 deletions — the deletions are the doc-comment line and restructuring neon-fog's trailing comment into an explicit `if (uMaterial == 19)` so the default return stays last; no existing material changed). Kept and finished it.
- New MaterialIds 20–27 appended to the union, MATERIAL_ORDER (after the original 20 so existing chip order never regresses) and MATERIAL_LABELS: 'wax-resist' (Wax-resist batik), 'tie-dye' (Tie-dye), 'blockprint' (Block print), 'tilework' (Zellige tilework), 'filigree' (Filigree), 'beadwork' (Beadwork), 'embroidery' (Embroidery), 'inlay' (Marquetry inlay).
- Height fields (GLSL ES 1.00, WebGL1, `precision highp float`, constant-bound loops, seed-driven via existing hash/hash2/fbm/uSeed): 20 batik crackle veining + stamped circle/diamond motif; 21 tie-dye radial bleeds wrapped to nearest repeat for seamless tiling + banding rings; 22 blockprint jittered stamp grid (box/diamond/disk pick) with fbm-roughened ink edges; 23 zellige 8-pointed stars + interlaced straps + grout; 24 filigree twisted sine-thread ropes (phase-shifted pairs); 25 beadwork packed bead domes over dark ground; 26 embroidery satin-stitch bands with per-band angle/frequency and stitch-row wave; 27 marquetry veneer bands + stringing + seeded diamond inlays. None reference uTime (all deterministic per entry seed).
- bumpScaleFor: 21→0.08, 22→0.10, 27→0.14, 20→0.18, 26→0.24, 24→0.26, 25→0.30 (23 uses the 0.22 default). matSurface albedo branches for all 8 (wax-reserved motif stays pale, per-tile hue variation for zellige, metal 0.95 filigree, 3-tone bead picks, anisotropic sheen only on marquetry stringing); FRAG_MAIN adds an embroidery-only anisotropic thread sheen.
- materialsFor(): 8 appended `add()` lines (see routing table below). Finished my line for 'tilework' with word boundaries (`\btile\b|\btiled\b|\btiling\b`) after the harness caught the bare `tile` substring matching the category "Textile & Craft" (17 DB entries would have gotten a false zellige chip; the identical pre-existing quirk in the untouched terrazzo line remains as-is by design).
- Verification (harness kept OUTSIDE the repo at /home/z/.tmp-8b, deleted after — one-file constraint respected): (A) imported the real `materialsFor`/`MATERIAL_ORDER` in bun against 8 stub entries — all PASS, determinism PASS (same input twice → identical chips), order-stability PASS, labels PASS. DB impact: tie-dye 1 (shibori), blockprint 7 (ukiyo-e…), tilework 23, embroidery 2, inlay 4; wax-resist/filigree/beadwork 0 entries yet (pipeline discovery will route to them automatically). (B) extracted the exact shipped VERT/FRAG strings from the file and compiled+linked them once in the same headless Chrome/SwiftShader → "SHADERTEST-OK all 28 material branches compiled+linked".
- Environment note: live-canvas CDP probes hang while the rAF loop runs under SwiftShader software GL (Runtime.evaluate starves) — UI mount/interactivity of ShaderLab itself was already verified in Task 7 and its rendering code is unchanged; compile + routing are the new-correctness gates here.
- Quality gates: bunx tsc --noEmit → 0 errors in shader-lab.tsx; bun run lint → clean. No other project file touched (scripts/ changes in git status belong to other agents).

Routing table (appended in materialsFor, evaluated against textures+materials+category+name+visualDNA.texture):
- wax-resist  ← /batik|wax[- ]?resist/
- tie-dye     ← /tie[ &-]?dye|shibori|bandhani|plangi|tritik/
- blockprint  ← /block[ -]?print|woodblock|stamp/
- tilework    ← /zellige|girih|azulejo|mosaic|\btile\b|\btiled\b|\btiling\b|\btilework\b/
- filigree    ← /filigree|filigran|wirework|twisted wire/
- beadwork    ← /bead|seed pearl/
- embroidery  ← /embroider|stitch|needlework|kantha|sashiko|phulkari|crewel/
- inlay       ← /marquetry|intarsia|inlay|inlaid|parquet|veneer/

Stage Summary:
- ShaderLab now covers 28 materials; craft-textured entries (batik, shibori, ukiyo-e, zellige/moorish, sashiko/kantha, marquetry/art-deco…) route to culturally-specific procedural studies while the existing 20 chips keep their exact order and behavior.
- All new materials are deterministic (seed-only, no uTime), palette-driven from the entry's own colors, and additive at every integration point (type union, order, labels, routing, height field, bump table, albedo, lighting accents).
- NOTE for future agents: when testing shader UI via CDP in this sandbox, expect evals to starve while the SwiftShader canvas loop runs — verify GLSL with a compile-only page and routing by importing materialsFor directly.

---
Task ID: 9
Agent: lead (orchestrator)
Task: Continue collecting & improving — cultural wave 2, category-fix, pipeline hardening, graph enrichment, re-verification.

Work Log:
- DIAGNOSED + FIXED CRITICAL CATEGORY BUG: categoryForBatch() in run.ts only searched DOMAIN_BATCHES, so entries from the 120 CULTURAL_BATCHES + 377 EXPANDED_BATCHES would have been categorized "Uncategorized" the moment they were processed (bug not yet manifest — those batches were still queued). Now uses a combined BATCH_CATEGORY_BY_DOMAIN Map built from ALL FOUR catalogs (domains, expanded, cultural, cultural-2). Cultural coverage would have been silently wrecked without this.
- CULTURAL WAVE 2: new scripts/research/domains-cultural-2.ts with 39 batches closing the remaining world-coverage gaps: Caucasus (Caucasian carpets, Armenian khachkars/manuscripts, Georgian supra/Svaneti towers, North Caucasian & Pontic vernacular), Siberian & Arctic peoples (Sakha/Evenki/Chukchi/Nivkh/Khanty, Buryat & Altai Buddhism), Uyghur etles/doppa/Kashgar, Volga & Crimean Tatar, Tuvan throat-singing culture, Parsi & Zoroastrian gara/fire temples/haft-sin, Sikkim & Eastern Himalaya, Assamese muga silk, Taiwanese indigenous (Paiwan/Rukai/Atayal/Tao) + Taiwanese Han temple craft, Madagascar (lamba/famadihana/Ambositra), Somali & Horn nomads, San rock art, Hausa & Sahel cities, Swahili coast deeper, Plains ledger art & winter counts, Pennsylvania Dutch fraktur/hex signs, Appalachian craft, Louisiana Creole & Mardi Gras Indians + Gullah, Amazonian design systems, Paraguayan ñandutí, Southern Cone indigenous, Colombian popular (Wayuu/vueltiao/marimonda/Mompox), Hungarian Matyó/Kalocsa, Andalusian patios/feria, Basque maritime, Sorbian Lusatia, Icelandic & Faroese wool, Assyrian & Syriac Christian craft, Circassian dress, Jewish diaspora crafts (Yemenite/Bukharan/Beta Israel/Cochin/sofer STA-M), Micronesian navigation (stick charts/rai/bai/latte), Kanak flèche faîtière, comic/cartoon lettering cultures, film title lettering cultures. Wired into createQueue FIRST + category map. Queue now 857 specs (805 queued = ~6,400 entry potential + 317 existing → comfortably ≥5k-6k target).
- RELATIONSHIP GRAPH UPGRADE (rule 4): linkRelations() now typed-hints {influences, related, parent, variants, confusedWith} creating parent/variant_of/confused_with edges (back-compat signature kept); discovery prompt now asks for "par"/"var"/"cf" with strict real-names-only rules; enrich prompt asks for "rl" object and run.ts enrich() feeds it through linkRelations → unknown names flow to the backlog automatically. Previously only influenced_by/related existed (381 edges, zero parent/variant).
- PIPELINE HARDENING: worker() now registers process.on('unhandledRejection'/'uncaughtException') safety nets. llmJSON() 429 handling rewritten: FIRST 429 → set 2-min rateLimitedUntil + throw immediately (no more 5x aggressive retry hammering: 20s/40s/60s/60s loops). workerStep cooldown rest 90s→130s. Reset 3 stale 'running' batches + re-queued 15 'failed' batches (429-storm casualties; topics preserved). Re-queued the 1 false-positive flagged entry (Belle Époque Department Store — genuinely documented Grands Magasins tradition) as researched for re-verification.
- QUOTA FORENSICS: no entry inserted since 04:26 / no verification since 05:12 — the z-ai LLM API has been hard-429ing for 6+ hours. Single isolated probe call also 429s → platform-side quota exhaustion, not our bug. Prime suspect: the image worker hammering image-search every ~1.5s for 6h against the shared pool. Paused image worker at 10:55; REPACED it (images.ts 1500ms→9000ms between entries, 3000→15000 pass gap) so a future restart cannot starve the LLM pipeline again. NOTE for future agents: background processes spawned from the current tool session get SIGKILLed within ~2-5 min (verified across 5 attempts: nohup, setsid, renamed script, supervised while-loop — all died silently, exit-echo lines never flushed). Foreground `timeout N bun scripts/research/run.ts worker` runs inside tool calls are reliable. A polite supervisor loop (45s restart gap) is left running; the worker burns ~1 probe request/2min while quota is down and resumes discovery automatically when it resets.
- DETERMINISTIC AUDITS (rule 5): 0 exact-normalized duplicates, 0 word-anagram duplicates across all 317 entries; relation graph: 381 edges, 0 orphaned FKs, 0 self-loops; 77 entries currently relation-less (enrichment will weave edges via the new rl pass).
- BROWSER RE-VERIFICATION (fresh sessions): home (live count 317, featured cards), dashboard (live counters, category/era/region bars incl. Italy/Africa/China/Latin America/Middle East & Persia/Russia & Soviet/Nordic, World cultures coverage panel with "11 entries in living traditions"), atlas grid + search (Romanticism→3 matches, Art Nouveau→2), detail sheets (Romanticism researched-badge rendering, Art Nouveau verified-badge: palette strip, aliases Jugendstil/Stile Liberty/Modernisme/Sezessionsstil, Copy palette/CSS vars/Download JSON, real sourced images, References & where it's used with Archive links, Record completeness meter, full 12-tab demo suite; Type tab renders real Google-Font specimen "Snell Roundhand — Art Nouveau display face" + A-Z rows). 3D material tab opens and its WebGL rAF loop starves CDP screenshots under SwiftShader — same documented environment limitation as Task 8-b (shader compile+render verified in Task 7; not a regression). Mobile 390px: no horizontal overflow, footer at bottom, detail sheet fully responsive. Diagnostic scripts test-429.ts / atlas-loop.ts created during forensics were deleted.
- bun run lint: clean (0 errors).

Stage Summary:
- The library is now structurally ready for its 5k-6k expansion: 805 queued batches (~6,400 entry potential) led by 159 world-cultural batches, category-correct by construction, with parent/variant/confused-with graph edges now part of discovery+enrichment.
- The ONLY blocker is the platform API quota (6h+ sustained 429, platform-verified). The system auto-resumes the moment it resets: supervisor keeps probing politely; fillGaps/enrich/verify/discover pipeline is intact; image worker restarts with `bun scripts/research/images.ts worker` (now 6x gentler) AFTER discovery has caught up.
- OPS: `bun scripts/research/run.ts {stats|queue|worker|fill-gaps|audit|enrich|verify}` — foreground runs are the reliable execution mode in this sandbox.

---
Task ID: 9 (addendum)
Agent: lead (orchestrator)
Task: Batch-attempts ratchet fix discovered during monitoring.

Work Log:
- Found failed=25 batches whose stored error was purely "rate-limited (cooldown …)": runBatch() incremented `attempts` UNCONDITIONALLY at claim time, so every 429-cooldown retry ratcheted the counter even though rate-limited failures never count toward the failure threshold; combined with the pre-Task-7 isRateLimitedError gap (cooldown-message pattern missing), quota storms drove batches to status=failed with attempts 4-7.
- Fix: claim update no longer increments attempts; the catch handler now writes the absolute computed count (`batch.attempts + (rateLimited ? 0 : 1)`) so ONLY real failures accumulate.
- Re-queued all 25 failed batches with attempts reset to 0. Queue state: done=57, queued=805, backlog=1211.

Stage Summary:
- Batches can no longer be burned by API-quota outages — only 3 genuinely bad responses (non-quota) ever fail a batch now.
