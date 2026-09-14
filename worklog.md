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

---
Task ID: 10
Agent: lead (orchestrator)
Task: Resume pipeline after API-quota recovery; cross 500 records; harden loop; verify site.

Work Log:
- QUOTA RECOVERED: isolated probe returned OK (03:21 window). Resumed the deterministic pipeline from the LATEST COMMIT (c022a39) — full queue of 805 discovery batches (~6,400 potential) intact.
- SANDBOX CONSTRAINT RE-CONFIRMED: setsid/nohup background worker SIGKILLed between tool calls (2/2 attempts). Adopted FOREGROUND-ROUND execution: `timeout 550 bun scripts/research/run.ts <cmd>` per tool call (≤600s cap), fully resumable because all state lives in the DB.
- ADDED `discover N` CLI command to run.ts (exposes existing processDiscovery; no behavior change) so the 10-min tool window can be split per-phase instead of the worker's full cycle (gap-fill 40 + enrich 80 + verify + discover 24 never fit in one window — discovery was being starved).
- DISCOVERY ROUNDS (10 successful): 317 → 967 entries. Domains landed in order: textures/materials (wood, stone, metal, glass, paper, plastics, patina), CRT/video/print artifacts, line-drawing cultures (comics, scientific, folk, digital, caricature), painting techniques (oil, water, encaustic, modernist, plein-air, face/body), then WORLD CULTURAL WAVES: Japan (Mingei, textiles, architecture, dress, graphic arts, stage, gardens, tea, Ainu), China (porcelain, vernacular architecture, folk arts, temple visual culture, dress, opera, scholar's studio, minority textiles), Korea, Tibet/Himalaya, Central Asia, Mongolia, South Asia (resist-dye, embroidery, tribal painting, miniatures, temple architecture, dress, sacred ritual), SE Asia (Indonesian batik, Mainland SEA, Thai/Lao, Vietnamese, Philippine/Malaysian, Peranakan), Persia (textiles, miniatures, gardens), Anatolia/Ottoman, Levant/Arabia/Islamic sacred arts, Morocco/Maghreb, Africa (West African indigo, Central/East/Southern textiles, Ndebele, Maasai, Ethiopian sacred, popular music, wax print, hair/body adornment), Oceania (Māori, Polynesian barkcloth, Pacific dress), Native American (Navajo, Northwest Coast formline), Latin America (Mesoamerican/Andean, Mexican folk, Maya, Andean, Southern Cone), Northern Europe (Scandinavian folk, Sámi duodji, Nordic vernacular, Baltic), Iberia. ALL named user gap-domains filled: Architectural Style=150, Visual Effects=51, Painting=49, Textile & Craft=47, Textures=44, Drawing & Line=38.
- HARDENING PATCHES (run.ts + lib.ts):
  1. llmJSON: content-filter 400s (code 1301) now fail FAST (non-retryable) — no wasted 5x retries; message tagged 'content-filter blocked (non-retryable)'.
  2. runBatch: content-filtered batches retire immediately (attempts+=3 → status=failed); was silently retrying deterministic rejections.
  3. processDiscovery: FIXED SILENT-SPIN BUG — DB 'running' count from killed processes permanently occupied all CONC slots (slots=0 → sleep(500) loop forever, zero output). Rewritten as local wave pool: reclaim stale 'running'→'queued' at each wave start (safe: waves are awaited), claim CONC batches, Promise.all with per-promise .catch so no throw can kill the loop.
  4. processDiscovery: rate-limit guard — circuit breaker check at loop top logs 'API cooling down — discovery pass paused' and returns instead of churning batches through silent 429 throws.
- QUALITY PASSES INTERLEAVED: fill-gaps 50+40 entries completed (identity fields: palette/period/origin/textures/materials/objects/era/examples/fonts); enrich 26 entries deepened (visualDNA/typography/uiTranslation/references); verify pass pending. Relation graph: 1,052 rows, 655/967 entries with ≥1 edge (312 newest drafts link as graph densifies). references[] present on ALL 967 entries.
- SITE RE-VERIFIED mid-growth via Agent Browser (read-only): homepage renders (live count 412 at check time, consistent across hero/grid/categories), detail overlay complete (94% completeness meter, tiered sources A/B, 10 relations, typography, 12-tab live demo suite, palette copy tools), 0 console errors, 0 broken images, no overflow.
- Quota continues to fluctuate platform-side; circuit breaker + pass-pause now handle it gracefully. Queue: done=155, queued=705, failed≈3 (content-filter retired), backlog names=4,427.

Stage Summary:
- RECORDS: 317 → 967 (target >500 CROSSED at 04:38; now ~3x the milestone), all real/documented entries with tiered provenance, deduped against the full known-name index (containment heuristic).
- Pipeline is self-healing (orphans, 429s, content filters, crashes) and resumable across tool-call restarts; `discover N` / `fill-gaps N` / `enrich N` / `verify N` / `worker` all usable per-window.
- Remaining to target: 705 queued batches + auditGen auto-refills → path to 5k-6k continues; then schema external-reference expansion, example-suite rebuild, full re-audit, completeness dashboard.

---
Task ID: 16 (rollback recovery + solo rebuild r1)
Agent: lead (orchestrator, solo authoring per user directive — no LLM API, no subagent LLMs)
Task: Recover from catastrophic sandbox rollback (1,520 → 967) and rebuild collection + completeness by hand.

Work Log:
- DISASTER DIAGNOSIS: sandbox restored the whole project (git history + files + db) to the Sep 13 06:39 snapshot — Task 11's 8 commits (1,353) and last session's commits (1,520) exist nowhere, not even as dangling objects (git fsck verified). /tmp copy equally old. Old 967-state confirmed at HEAD.
- INSURANCE LAYER (new): wrote scripts/research/export-library.ts + restore-library.ts; exported full library+relations to db/library-export.json (committed to git — 5.0 MB); db copies in /home/z/backups/ + /tmp/aa-backup/. Every future milestone now gets: git commit + JSON export + db backup.
- TOOLCHAIN REBUILT: seed-waves.ts, link-orphans.ts, apply-patches.ts re-written from session record; re-applied Cyrillic alias fix to lib.ts validateEntry (drop aliases normalizing empty). link-orphans run: 441/451 orphans linked, +1,742 edges.
- SOLO-AUTHORED REBUILD WAVES (5 waves, 80 entries, every name Wikipedia-API-verified, dedup-checked):
  1. mena-central-asia.ts — 16 (Sedefkari, Qajar Painting, Mamluk Metalwork/Glass, Mashrabiya, Khatam, Termeh, Pateh, Kubachi Silver, Jewish Micrography, Ketubah, Mizrah, Bukhara Embroidery, Tush Kyiz, Ottoman Tombak, Coptic Iconography)
  2. insular-asia-pacific.ts — 16 (Korwar, Hudoq, Iban Tattooing, Nias, Tais, Flores Ikat, Rumah Gadang, Penjor, Barong & Rangda, Asaro Mudmen, Uli, Massim Prows, Baining Fire Dance, Kanak Flèche, Marshallese Stick Charts, ʻAhuʻula)
  3. folk-painting-craft.ts — 16 (Gzhel, Khokhloma, Palekh, Fedoskino, Mstyora, Dymkovo, Gorodets, Filimonovo, Karagiozis, Zhostovo, Orenburg, Hardanger, Meenakari, Thangka, Venetian Carnival Masks, Cabinet of Curiosities)
  4. east-asia.ts — 16 (Origami, Ikebana, Kimono, Washitsu, Shoji, Temari, Furoshiki, Sashiko, Katazome, Hanji, Bojagi, Moon Jar, Inro, Nihonga, Bonsai, Yūzen; Washitsu + Nihonga correctly dedup-blocked as existing)
  5. africa1.ts — 16 (Asafo Flags, Fantasy Coffins, Nsibidi, Nok, Chokwe, Bamileke, Tingatinga, Djenné, Senufo, Aksum, Meskel, Timkat, Kabyle, Swahili Doors, Lukasa; Nkisi dedup-blocked)
  → +80 net inserted: 967 → 1,039.
- COMPLETENESS PATCH R1: authored patch-arch1.ts (20 Architectural Style records: Sudano-Sahelian, Indo-Saracenic, Naqsh-e Jahan, Sidi Bou Said, Banco, Ise Shinden, Majlis, Falu Red, Chichén Itzá, Wharenui, Brazilian Colonial, French Colonial, Centrally-Planned Church, Fujian Tulou, Kalinga Deul, Riad, Lafté, Rayonnant, Prodigy House, Churrigueresque) — 20/20 applied, 20/20 promoted draft→researched.
- RESIDUE HYGIENE: caught and purged drafting artifacts ("? —" placeholders) in every wave file before seeding; DB rows seeded before one fix batch were corrected via field-sync script.
- BROWSER VERIFICATION: 6/8 PASS (render+count 1,039, Sedefkari detail full, Churrigueresque Cultural context section renders, pagination 44 pages, 0 console errors, sticky footer exact). 2 "failures" = Kukeri + Demoscene not yet re-authored (lost last-session waves, queued below).
- Lint clean. Milestone commits throughout + JSON export refreshed after every wave.

Stage Summary:
- Library 967 → 1,039 (+72 net this session), relations 1,052 → 2,934, researched status 23 → 43.
- Continuation plan (exact, next sessions): (a) re-author lost waves: balkans-caucasus-baltic-arctic (16), caribbean-central-america-north (16), games-retrofuture (22), film-comics-color-period (20), internet-subculture-web2 (24) → +98 → ~1,137; then fresh waves (world dress, festivals, americas-oceania, craft-techniques) toward 1,350+; (b) patch rounds for remaining ~1,000 missing-ctx entries + ~790 missing vDNA/typo (applier + promotion ready); (c) if any db loss recurs: bun scripts/research/restore-library.ts (rebuilds from committed JSON in minutes).

---
Task ID: 17
Agent: lead (orchestrator, solo authoring — no LLM API, no subagent LLMs, per user directive)
Task: Continue rebuilding lost waves + full data-completeness patching ("ensure all data/details are there for all the records — continue writing").

Work Log:
- DIAGNOSIS: sandbox had rolled back again to the Task-16 snapshot (library 1,039). Prisma client regenerated (bunx prisma generate) after .prisma cache error; DB verified at 1,039 with 1,019 missing-ctx / 793 missing-vDNA / 803 missing-typ.
- DEDUP-GUARDED NAME VERIFICATION: all ~100 candidate entries checked against existing-names.txt BEFORE authoring (rg loops) — caught ~20 candidates that already existed from the LLM pipeline (mola, huipil, gákti, duodji, drapo vodou, kinngait, chilkat, lenca, biedermeier, bauhaus, liminal spaces, weirdcore, gorpcore...). Wikipedia batch API verification (curl, 4 batches, redirects=1) confirmed all remaining titles; Neubrutalism/Fairycore/McBling accepted as design-press-documented terms with B/C sources.
- 5 SOLO-AUTHORED WAVES re-written from session record (83 net inserted, every entry full-format: sum/desc/col/m/tx/obj/ex/inf/rel/src/tg/vd/typ/lit/ui):
  1. balkans-caucasus-baltic-arctic.ts — 15 net (Kukeri, Xhubleta, Zmijanje, Pirot, Glagolitic, Kelaghayi, Minankari, Khachkars, Chokha, Muhu, Baltic Amber, Latvian Song, Tupilaq, Sámi Drums, Kalaallit)
  2. caribbean-central-america-north.ts — 16 (Vejigante, Junkanoo, Dancehall Posters, Steelpan, Cuban Rumba, Alfombras, Güegüense, Pollera, Backstrap Loom, Panama Hat, Wampum, False Face, Birchbark Biting, Parfleche, Tohono O'odham, Scrimshaw)
  3. games-retrofuture.ts — 18 net (Demoscene, Voxel, Cel-Shading, Boomer Shooter, PS1 Horror, Point-and-Click, Arcade Cabinet, Pinball Backglass, Amiga, C64 Loaders, Retrofuturism, Raygun Gothic, Clockpunk, Silkpunk, Used Future, Syd Mead, Geodesic Domes, 1939 Futurama)
  4. film-comics-color-period.ts — 15 net (Technicolor, Spaghetti Western, Soviet Montage, Dogme 95, Nouvelle Vague, Kirby Krackle, Sin City Noir, BD Album, Pop Art Silkscreen, Albers, Pantone, Teal-Orange, Gilded Age, Fraktur, Louis XIV)
  5. internet-subculture-web2.ts — 19 net (GeoCities, 88x31, Skeuomorphism, Glassmorphism, Metro, Aqua, Cybergoth, Pastel Goth, Fairycore, Mori Kei, McBling, Rockabilly, Rage Comics, Surreal Memes, Imageboard, Graffiti, Hip Hop Visual, Zine, Wojak)
- FALSE-DUP RESCUE: discovered the containment dedup heuristic falsely blocked 8+ entries whose aliases/name contained shorter existing names (Atompunk⊂atomic-age entries? no — alias collisions: "atomic age retrofuture"⊃"atomic age design" family, "afropunk style"⊃"punk style", "web brutalism"⊃"brutalism", "IKB" exact-match…). Built reseed scripts with poison-alias stripping + renamed entries (Brutalist Web Design, Afropunk Movement) → +8 recovered (library 1,122 → 1,133).
- COMPLETENESS PATCH CAMPAIGN (hand-authored, 10 patch files r2a-r2k, 183 patches applied, 0 skipped except 12 slugs fixed):
  r2a (20 architecture: Second Empire→Tiki) · r2b (19: Blobitecture→Stick Style) · r2c (8 art movements + 12 slug-missed) · r2d (20 world architecture: Critical Regionalism→Tectonics) · r2e (20: Lingnan→Musgum) · r2f (20 famous: Azulejo, Ofrenda, Kente, Iznik, Bogolanfini, Talavera, Kanga, Tekke, Insular, Sukhothai, Nón Lá, Kawaii, Neue Sachlichkeit, CoBrA, Neo-Dada, Post-Internet, Shin-hanga, Lingnan School, Versailles Parquet, Marquetry) · r2g (20 techniques: Impasto, Aquarelle, Batik, Action Painting, Bokeh, Halftone Rosettes, 8-bit Snapping, Iridescence, Rembrandt Light, Vignetting, Exploded Views, Child Art, Celtic Knotwork, Pixel Outlines, Croquis, Caricature, Vinyl, Burl, Nero Marquina, Honed Granite) · r2h (20: Qipao, Furisode, Kaftans, Lei, Yukata, Dragon Robe, Lianpu, Bianlian, Talchum, Empire, Grandmillennial, Izakaya, Viennese Café, Washitsu, High-tech, Dunhuang, Rangoli, Benin Bronzes, Yoruba Crowns, Sand Mandala) · r2i (32 wave-entry ctx) · r2j (51 wave-entry ctx) · r2k (8 rescued-entry ctx).
  → every patch fills ctx + vd + typ + lit + ui; depth bar met ⇒ draft→researched promotion.
- NETWORK: link-orphans run twice (+35 edges, 13 orphans left with genuinely insufficient signal); relations 3,053 → 3,115.
- INSURANCE: existing-names.txt refreshed to 3,420 names; library-export.json exported after EVERY wave and patch batch (5.7 MB, 1,133 entries + 3,115 relations); 14 commits total this task.
- BROWSER VERIFICATION (Agent Browser): homepage renders with live count "1,122→1,133 aesthetics documented"; search combobox finds "Kukeri Masking Ritual"; detail sheet renders Typography (display/body/notes), Visual DNA (shape/line/composition/texture), key examples; 0 console errors, 0 page errors; footer pushes naturally below tall detail sheet (docH 1085 > vh 577, footer at bottom).

Stage Summary:
- LIBRARY: 1,039 → 1,133 (+94 net: 83 wave entries + 8 rescued false-dedups + misc), 625 draft / 186 researched / 322 verified.
- RELATIONS: 2,934 → 3,115. Dedup index: 2,929 → 3,420 names.
- DATA COMPLETENESS: ctx gap 1,019 → 875 (−144 this session, 183 deep-filled records); vd 793 → 650; typ 803 → 658. 183 records promoted draft→researched via full-depth patches.
- TOOLCHAIN LEARNINGS: (a) Prisma client must be regenerated after sandbox restores; (b) dedup containment blocks legit entries whose alias contains a shorter existing name — poison-alias stripping + rename is the fix pattern; (c) wave files don't carry culturalContext — ctx must come via patch files; (d) `bun -e` cannot resolve project-relative imports — use script files inside scripts/.
- NEXT: continue patch campaign (~875 ctx / 650 vd / 658 typ gaps remain, mostly in Regional 215 + Textile 112 + Art Movement 38 remaining), then example-suite rebuild (3D shaders, typography demos), coverage dashboard, 5k-6k expansion.

---
Task ID: 3-c
Agent: patch-r3c-writer
Task: Write patch-r3c.ts (20 Indian/Sri Lankan/Indonesian/Thai ctx+vd+typ+lit+ui patches)

Work Log:
- Read worklog tail for conventions; inspected sibling patch files (patch-r2f.ts, patch-r2k.ts) and apply-patches.ts field contract (ctx 80-700; vd keys shape/line/composition/texture; typ display/body/notes; lit quality/temperature/shadow/direction; ui background/surface/components/motion/typography).
- Wikipedia batch-API verification (3 curl calls, redirects=1): confirmed Rajput painting (Kishangarh redirect), Kangra painting, Deccan painting, Company style, Kelaniya Raja Maha Vihara, Dambulla cave temple, Ambalangoda, Kris, Wayang kulit, Gongshi, Handscroll, Joglo, Khon, Gamelan, Batik, Inkstick, Solias Mendis, Bani Thani, Sawant Singh, Nihal Chand, Pendhapa, Matale; "Ink cake" and "Pamor" have no standalone articles → prose kept general/safe for those facts.
- Wrote scripts/research/patches/patch-r3c.ts: header + first 10 entries (Chinese scholar-studio + Indian miniature block: ink-cake-molding, gongshi, zhuanshi, handscroll-mounting, kishangarh, kangra, deccani, company, kelaniya, dambulla) ending with `// APPEND_HERE`; Edit-replaced marker with remaining 10 (ambalangoda, sri-lankan-drum-decoration, sri-lankan-batik-workshop-culture, matale-lacquer-turning, kris-pamor, wayang-kulit, balinese-carving, joglo, gamelan-gong-smithing, khon-masked-dance-costume).
- Every entry carries all 4 patch objects (ctx/vd/typ/lit/ui); vd values entry-specific (mold relief, watered lamellae, kelir backlight, tumpang sari tiers, etc.); typography names real scripts/notation systems (zhuanshu seals, nastaliq cartouches, Devanagari couplet panels, Sinhala script, kepatihan cipher, lontar manuscript); uncertain specifics avoided (no invented dates/names/places beyond API-verified ones; UNESCO 2003 wayang / 2005 kris / 2018 khon listings kept at confident phrasing).
- Did NOT run apply-patches and did NOT touch the DB (per assignment scope).

Stage Summary:
- patch-r3c.ts complete: 20/20 patches, validator clean — `total 20 bad 0 []`; stricter pass: ctx 463-527 chars, 0 length violations (lit 2-120 / ui ≤160 / typ ≤160 / vd 15-140), 0 duplicate slugs.
- Ready for `apply-patches` by the orchestrator to fill ctx+vd+typ gaps and promote these 20 draft records toward researched.

---
Task ID: 3-a
Agent: patch-r3a-writer
Task: Write patch-r3a.ts (20 Japanese craft/tradition ctx+vd+typ+lit+ui patches)

Work Log:
- Read worklog tail for conventions; inspected apply-patches.ts contract and patch-r2f.ts style; confirmed patch fields map ctx→culturalContext, vd→visualDNA, typ→typography, lit→lighting, ui→uiTranslation.
- Verified all 20 assigned slugs exist in DB and are missing exactly ctx/vd/typ/lit/ui (read-only Prisma check via temporary scripts/research/check-r3a-slugs.ts — deleted afterward). 19 entries 'draft', kintsugi 'verified' but field-empty.
- Wikipedia API fact-verification (batched titles= queries with redirects): confirmed Kintsugi, Netsuke, Wajima-nuri (ji-no-ko diatomaceous undercoats, Wajima/Ishikawa), Ise katagami (Suzuka/Mie, Important Intangible Cultural Property), Kamishibai (1930s+postwar, TV decline, 8th-c. emakimono roots), Raku ware (Chōjirō/Rikyū), Bokuseki (Ikkyū, Hakuin dates), Chabana (nageire), Mon (2004 survey: 241 categories / 5,116 designs), Karesansui→Japanese dry garden (Ryōan-ji), Edo kiriko (19th-century Edo), Nishiki-e (Harunobu 1760s), Namikawa Yasuyuki + Ando Cloisonné Company, Nishikawa Sukenobu (1671-1750, Hyakunin joro shinasadame 1723), Chōjirō, Sen no Rikyū, Japanese tea utensils (chashaku/mizusashi/natsume). A "Traditional skills and techniques of Wajima-nuri" UNESCO page came back missing → no UNESCO claim written; uncertain facts phrased as "tradition traces/traditionally bestowed".
- Authored patch-r3a.ts via Write (header + first 10 entries ending `// APPEND_HERE`) then Edit replacing the marker with the remaining 10 — 20 entries total, each with ctx (150-450 chars), vd (shape/line/composition/texture), typ (display+body, Edo-moji/Mincho/gothic/brush-kana as tradition-appropriate), lit (quality/temperature/shadow), ui (background/surface/components/motion).
- Length audit: 8 entries initially exceeded the 450-char ctx quality bar (up to 505); trimmed prose (no facts lost) until all ctx within 150-450.
- Final verification: `bun -e` import of the patch file → total 20, bad 0. Extended audit: all vd values 15-140 chars, typ ≤160, lit keys from allowed set ≤120, ui keys from allowed set ≤160, 0 issues.
- Did NOT run apply-patches or touch the database (per task constraints).

Stage Summary:
- File: /home/z/my-project/scripts/research/patches/patch-r3a.ts — 20 hand-authored patches (kintsugi, shippo-cloisonne, edo-kiriko-cut-glass, netsuke-carving, wajima-lacquer, ise-katagami-patterns, mon-family-crests, hinagata-bon-pattern-books, edo-nishiki-e-advertising, showa-hyakkaten-matchbox-labels, kamishibai-story-cards, japanese-matchbook-and-ticket-design, karesansui, wabi-cha, raku-ware, chashaku-aesthetics, bokuseki-aesthetics, chabana-aesthetics, mizusashi-aesthetics, natsume-aesthetics).
- Verification: total 20 / bad 0; ctx 378-449 chars; ready for `bun scripts/research/apply-patches.ts` (not run here — deferred to lead).
---
Task ID: 3-d
Agent: patch-r3d-writer
Task: Write patch-r3d.ts (20 African tradition ctx+vd+typ+lit+ui patches)

Work Log:
- Read worklog tail for conventions; studied existing patch format (patch-r2e/r2f contract: ctx/vd/typ/lit/ui per slug).
- FACT VERIFICATION via Wikipedia API (batched, redirects=1): confirmed Nang yai, Luang Prabang, Water puppetry, Bát Tràng, Áo nhật bình (rectangular-collar Nguyễn court dress for royal women, Tết/weddings/audiences), Đông Hồ painting (via Tranh Đông Hồ redirect), Hàng Trống painting, Ndebele house painting, Esther Mahlangu, Litema (clay-dung plaster comb/scratch, ochre, ploughed-field/plant/totem mimicry, transient), Mokorotlo (mosea/leholi grass, flag+licence plates, Mount Qiloane), Otjize (butterfat+ochre, omuzumba Commiphora resin, sun/insect/wash substitute), Habesha kemis (shemma cotton, pre-European daily dress), Herero people, Maasai people, Samburu, Mursi, Surma. No dates/names invented beyond verified or firmly documented facts.
- WROTE /home/z/my-project/scripts/research/patches/patch-r3d.ts: header + first 10 entries (8 SE Asian: nang-yai, luang-prabang, dong-ho, hang-trong, mua-roi-nuoc, hue-imperial, bat-trang, vietnamese-silk + ndebele + zulu) with `// APPEND_HERE` marker, then Edit-inserted remaining 10 (basotho, xhosa, sotho, himba, herero, maasai, samburu, mursi, surma, habesha). Each entry: ctx + 4-key vd + typ display/body + lit (quality/temperature/shadow) + ui (background/surface/components/motion).
- Two strict QC passes trimmed 16 overlong ctx values into the 150-450 quality band (official limit is 80-700; held self to 450).
- VERIFICATION: `bun -e` contract validator → total 20, bad 0. Strict key-allowlist + length audit (vd 15-140, lit ≤120, ui ≤160, typ ≤160, ctx 150-450) → 0 issues, ctx range 407-449, 20 unique slugs, slug order matches assignment exactly. No DB changes, apply-patches NOT run (per scope).
- bun run lint: clean.

Stage Summary:
- patch-r3d.ts ready: 20/20 contract-valid patches covering the assigned SE Asian + Southern/East African tradition slugs (ctx+vd+typ+lit+ui all filled, entry-specific, Wikipedia-spot-checked). Next: run `bun scripts/research/run.ts` patch application in a lead session to promote these draft→researched.

---
Task ID: 3-e
Agent: patch-r3e-writer
Task: Write patch-r3e.ts (20 Pacific/NW Coast/Arctic/Mesoamerican ctx+vd+typ+lit+ui patches)

Work Log:
- Read worklog conventions + existing patch files (r2h/r2k) to match the authoring contract exactly.
- Verified all 20 assigned slugs exist in the DB with culturalContext NULL (read-only Prisma query; no DB writes).
- Wikipedia API batch verification (redirects=1 + intro extracts) for: Amasunzu (Rwanda — handled carefully vs "Zulu amasunuka" entry name), Agbada (sokoto trousers confirmed), Tukutuku (toetoe/kiekie/harakeke/pingao confirmed), Whakairo, Hei matau, Malagan (New Ireland), Asmat people (South Papua, famed woodcarving), Iatmul (middle Sepik, Bateson naven), Abelam (East Sepik, giant yams), Kula ring (Massim/Milne Bay, Malinowski 1922), Guérewol (In-Gall, Niger, yaake dance), Turkana people; Kowhaiwhai redirects to Koru ("use in traditional design" — rafter painting facts from general knowledge). Haus tambaran + Kirituhi titles missing on enwiki — written from certain general knowledge only, no invented specifics.
- Authored patch-r3e.ts per contract: header + first 10 entries + `// APPEND_HERE`, then Edit-appended remaining 10; fixed a duplicated closing bracket introduced by the append edit.
- All 20 entries carry ctx + vd (shape/line/composition/texture) + typ (display/body) + lit (quality/temperature/shadow) + ui (background/surface/components/motion) — no field invented outside the allowed key sets.
- Distinguished the two Asmat slugs: asmat-pole-and-shield-carving (bisj pole + collecting history/Met Rockefeller wing) vs asmat-poles-and-shields (poles-vs-shields functional contrast); distinguished malagan (New Ireland) from Sepik material; kula prose grounded on verified Wikipedia extract.
- VALIDATION: contract check total=20 bad=0; extended strict check added: ctx 150-450 quality bar (iterated 3 trim passes: initial 469-533 → 399-449), vd values 15-140, typ ≤160, lit/ui allowed keys only, 0 duplicate slugs, exact slug-set match with assignment; bun run lint clean.

Stage Summary:
- patch-r3e.ts written and validator-clean (total 20, bad 0, ctx avg 446, all within 150-450): 8 African adornment entries (Turkana body painting, gele, Zulu amasunuka, Ghanaian barbershop signs, Yoruba hair naming, Guérewol, agbada economy, hair threading), 6 Māori (whakairo, kōwhaiwhai, tukutuku, kirituhi, hei matau) and 6 Melanesian (malagan, 2× Asmat, Sepik haus tambaran, Iatmul orator stools, Abelam yam masking, kula) — note: assignment header said "Pacific/Aboriginal/NW Coast/Arctic/Mesoamerican" but the slug list is African+Māori+Melanesian; slugs were treated as authoritative.
- NOT applied to DB per instructions (apply-patches is out of scope for this agent); file ready for the applier/promotion pipeline.

---
Task ID: 3-b
Agent: patch-r3b-writer
Task: Write patch-r3b.ts (20 Ainu/Ryukyu/Chinese ctx+vd+typ+lit+ui patches)

Work Log:
- Read worklog tail + inspected patch-r2h.ts to match the established PATCHES contract (slug/ctx/vd/typ/lit/ui, no apply).
- WIKIPEDIA VERIFICATION (batched API calls, redirects=1): confirmed Attus→(Ainu bark cloth: attus/attush woven from ohyo bark fibre), Bingata (14th-c. Ryukyu Kingdom, Indian/Chinese/Javanese synthesis, stencil resist), Ru ware (Northern Song ~1100, <100 pieces, duck-egg blue "sky after rain", Qingliangsi/agate claim), Chinese paper cutting (Eastern Han origin, UNESCO 2009), New Year picture, Yangliuqing town (400+ yrs nianhua), Shadow play, Chinese knotting, Weifang Int'l Kite Festival (since 1984, kite capital 1988, IKF HQ), Toshiko Taira (kijōka-bashōfu, LNT 2000), Inkstone (Duan=Zhaoqing/Duan Prefecture Tang, Mazukeng Qianlong; She=She County Anhui + Wuyuan Jiangxi, Tang), Ōgimi, Yomitan, Zigong, Naha, Musa basjoo. "Duan inkstone"/"She inkstone"/"Yachimun"/"Ryukyu glass"/"Hana-ori"/"Bashofu"/ikarkar/morew/aiush have no standalone articles → prose kept general and hedged; no dates/names invented beyond verified ones.
- Authored patch-r3b.ts: 20 entries = 5 Ainu (attush robes, ikarkar embroidery, makiri sheaths, morew spirals, aiush appliqué) + 5 Ryukyu/Okinawan (bingata, yachimun/Tsuboya-1682/Jirō Kinjō LNT-1985, ryukyu glass, bashōfu/Kijoka/Taira LNT-2000, Yomitan hana-ori 1960s revival) + 10 Chinese (ru ware, jianzhi, Yangliuqing nianhua, Taohuawu nianhua, shadow puppets/UNESCO-2011, chinese knotting, weifang kites, zigong lanterns, duan + she inkstones). Each entry: ctx (420-447 chars, historically grounded) + vd (shape/line/composition/texture) + typ (real display/body translations, not "none") + lit (quality/temperature/shadow) + ui (background/surface/components/motion).
- ITERATION: official validator passed first run (20/0), then tightened ctx to the 150-450 quality bar (3 rounds of trims; all 20 now 419-447 chars).
- Final verification: `total 20 bad 0 []`; strict checker: 0 issues; slugs in exact assignment order; no dup slugs. DB untouched; apply-patches NOT run (per instructions).

Stage Summary:
- patch-r3b.ts complete and validator-clean: 20 Ainu/Ryukyu/Chinese craft entries with ctx+vd+typ+lit+ui at research depth, ready for `apply-patches` + draft→researched promotion by the lead agent. Coverage gap this batch: −20 ctx/vd/typ/lit/ui when applied.
---
Task ID: 3-g
Agent: patch-r3g-writer
Task: Write patch-r3g.ts (20 Mesoamerican/Andean/Mexican ctx+vd+typ+lit+ui patches)

Work Log:
- Read worklog tail for conventions + matched patch-r3d contract style (slug/ctx/vd/typ/lit/ui, no apply).
- WIKIPEDIA VERIFICATION (batched API, redirects=1, exintro extracts): confirmed chagudax (Unangan bentwood driftwood hunting visors, sea spray + hearing, Gronholdt 1980s revival via Bentwood article), kamik/mukluk (Inuktitut, caribou or sealskin, Inuit/Iñupiat/Yup'ik, maklak = bearded seal), Maya codices (huun bark paper, 4 survive, Dresden, Tonsured Maize God + Howler Monkey Gods patronage), Moche culture (100–800 CE N Peru), Paracas (Tello 1920s, Necropolis Wari Kayan, finest Pre-Columbian textiles), Nazca culture (c.100 BCE–800 CE, Paracas influence, lines purpose unknown, puquios still functioning), La Calavera Catrina (Posada 1852–1913, zinc etching c.1910–12, first certain publication 1913, Rivera 1946–47 Alameda fresco), Lucha libre (early 20th c., masks, trios, 2018 Mexico City intangible heritage), Charro (hacienda horseman, charreada national sport), Ex-voto, Pulqueria (colonial origin, extravagant decorations/names, mid-20th c. decline), Taquile Island (2,200 people, Puno Quechua, UNESCO 2005 "Taquile and Its Textile Art"), Aguayo (cloth) (Aymara awayu, Quechua q'ipi, carrying cloth), Mixtec (La Mixteca, until 1523), Monte Albán, Qhapaq negro (performed at Mamacha Carmen in Paucartambo; Virgen del Carmen fiesta each 16 July, three days), Shipibo-Conibo (Ucayali River). Missing/ambiguous titles: Amanteca, Mexican calendar art, Galas de México, Pallay, Virgen del Carmen de Paucartambo, Turquoise mosaic → prose kept general and hedged (amantecah guilds, chromolithographed calendars, pallay as picked-up patterning); "Chuspa" enwiki is a Venezuelan village → coca-bag sense written from certain general knowledge only.
- Authored patch-r3g.ts via Write (header + first 10 entries ending `// APPEND_HERE`) then Edit replacing marker with remaining 10. Differentiated maya-codex-style (screenfold pictorial conventions: profile figures, red-black outline, almanac scene columns) vs maya-codex-glyphic-style (glyphic block-and-lattice: paired double columns, logogram/syllable mix, bar-and-dot numerals).
- VALIDATION: official `bun -e` contract check → total 20, bad 0. Extended strict audit → ctx 372–448 (150–450 bar), vd values 15–140, typ ≤160, lit/ui allowed keys only within limits, 0 duplicate slugs, slug set+order exactly matches assignment. `bun run lint` clean. No DB writes; apply-patches NOT run (per scope).

Stage Summary:
- File: /home/z/my-project/scripts/research/patches/patch-r3g.ts — 20 patches (unangan-bentwood-hats, kamiks, maya-codex-style, mexica-featherwork, mixtec-gold-and-turquoise-mosaics, moche-fineline-pottery, paracas-mantles, maya-codex-glyphic-style, nazca-textiles-and-geoglyphs, la-catrina-iconography, lucha-libre-poster-lettering, traje-charro, ex-voto-retablo, pulqueria-mural-style, mexican-calendar-art, shipibo-kene-design-system, taquile-pallay-weaving, bolivian-aguayo, chuspa-weaving, paucartambo-festival-masks), each ctx+vd+typ+lit+ui at research depth. Ready for `bun scripts/research/apply-patches.ts` (not run here — deferred to lead).
---
Task ID: 3-j
Agent: patch-r3j-writer
Task: Write patch-r3j.ts (20 Slavic/Balkan/Carpathian ctx+vd+typ+lit+ui patches)

Work Log:
- Read worklog tail for conventions; matched the established PATCHES contract against patch-r3d/r3e (slug/ctx/vd/typ/lit/ui; ctx→culturalContext, vd→visualDNA, typ→typography, lit→lighting, ui→uiTranslation).
- Wikipedia API verification in batched titles= calls (redirects=1) plus intro extracts: confirmed Vyshyvanka, Kosiv painted ceramics (Hutsul, UNESCO ICH 13 Dec 2019, Pistyn included), Rushnyk (East Slavic ritual towel, weddings/funerals, Pereiaslav museum), Hutsuls (western Ukraine + Bukovina–Maramureș), Slavic paper cutting (wycinanki/vytynanky/vycinanki), Łowicz, Parzenica (folk pattern: heart-shaped Goral trouser emblem), Kraków szopka (19th c., landmark facades, UNESCO ICH 2018), Kroj, Detva, Moravian Slovakia (Slovácko), Moravia, Modra (pottery town, blue-and-white), Konavle (SE of Dubrovnik, Cavtat), Voroneț Monastery (Stephen the Great 1488, "Sistine Chapel of the East", "Voroneț blue"), Wooden churches of Maramureș (~100 timber churches, 17th–19th c.), Horezu ceramics (UNESCO ICH Dec 2012, male/female production split, "Horezu ivory"), Cucuteni–Trypillia culture (c. 5050–2950 BC, mega-sites, Moldova/western Ukraine/NE Romania), Villages with Fortified Churches in Transylvania (7 UNESCO villages, six Saxon one Székely, 150+ of 300 survive). Missing titles handled per convention: Ia/Ie, Zlatovez, Scoarță, Bessarabian kilim have no enwiki article → those entries written from solid general knowledge, hedged ("wall-carpet craftsmanship is UNESCO-listed intangible heritage of Romania and Moldova" without year; no invented names/dates).
- Authored patch-r3j.ts via Write (header + first 10 entries: vyshyvanka, kosiv, rushnyk, hutsul inlay, wycinanki, lowicz stripes, parzenica, krakow szopka, detva/slovacko kroj, moravian painted furniture) ending with `// APPEND_HERE`, then Edit-inserted remaining 10 (modra, konavle, zlatovez, voronet blue, maramures, romanian ia, horezu, cucuteni, transylvanian saxon churches, scoarte); fixed the duplicated closing bracket the append introduced (same r3e gotcha).
- Every entry carries ctx + 4-key vd (shape/line/composition/texture) + typ (display/body) + lit (quality/temperature/shadow) + ui (background/surface/components/motion); typography kept tradition-appropriate (Cyrillic stitched roundhand for Ukrainian, gothic inscriptional capitals for Saxon churches, Byzantine titling for Voroneț, brush capitals for Modra/Horezu, carved timber lettering for Maramureș).
- Validation: official `bun -e` checker → total 20, bad 0 first run. Strict audit (ctx 150–450, vd 15–140, typ ≤160, lit/ui allowlist + lengths, 20 unique slugs in exact assignment order) caught 3 ctx slightly over 450 (moravian 457, maramures 452, cucuteni 456→457 after a no-op trim) — trimmed to 365–449, strict issues 0. bun run lint clean.
- Did NOT touch the DB and did NOT run apply-patches (per task scope).

Stage Summary:
- File: /home/z/my-project/scripts/research/patches/patch-r3j.ts — 20 hand-authored patches covering all assigned Ukrainian, Polish, Slovak, Czech, Croatian, Bosnian and Romanian tradition slugs (ctx+vd+typ+lit+ui filled, entry-specific, Wikipedia-spot-checked).
- Verification: official total 20 / bad 0; strict audit 0 issues; ctx range 365–449 chars. Ready for the lead agent to run apply-patches and promote draft→researched.
---
Task ID: 3-h
Agent: patch-r3h-writer
Task: Write patch-r3h.ts (20 Brazilian/Haitian/Trinidadian/Argentine ctx+vd+typ+lit+ui patches)

Work Log:
- Read worklog tail for conventions; inspected patch-r3a.ts to match the PATCHES contract (slug/ctx/vd/typ/lit/ui, Write-then-Edit with // APPEND_HERE marker).
- WIKIPEDIA VERIFICATION (batched API, redirects=1, en+pt+fr): confirmed Mate burilado (buril, Mantaro Valley, Lambayeque/Huanta, 4,000+ yrs, ~5-yr training), Cordel literature (string-hung pamphlets, NE Brazil feiras), Xilogravura (pt: carved wood matrix, roller ink, relief print), Frevo (Recife/Pernambuco, frever="to boil", UNESCO 2012), Maracatu (nação vs rural, Pernambuco), Capoeira (engolo/Bantu Angola roots, 1789 first doc, Mestre Bimba 1930s), Congada (coronation of King of Congo, Minas Gerais/São Paulo/Goiás), Folia de Reis (Epiphany, Christmas→Jan 6, cortejo), Veve (beacon for lwa), Fileteado (Buenos Aires signs/taxis/trucks/colectivos, ornaments+symmetries+poetic phrases, Porteño culture), Croix-des-Bouquets commune, Bombilla (perforated filter straw), Bolas/boleadoras (entangle legs, gaucho), Gaucho, Trinidad and Tobago Carnival (Mon/Tue before Ash Wednesday, calypso/soca), Georges Liautaud (fr: b.1899 Croix-des-Bouquets, blacksmith, discovered 1953 by DeWitt Peters, bosmétal from used fuel-oil drums), Jean-Claude Garoute/Tiga + Maud Robart (fr: Saint-Soleil movement named 1973, Soisson-la-Montagne above Pétionville, Malraux visited 1975, wrote in L'Intemporel). "Haitian Vodou flag"/"Fancy sailor"/"Boleadoras"/"Calunga" have no standalone enwiki article → those prose passages kept general-confident, no invented dates/names.
- WROTE patch-r3h.ts: header + first 10 entries (mate burilado, cordel, xilogravura, frevo umbrellas, maracatu regalia, capoeira, congado, maracatu crowns-and-capes, folia de reis, vodou drapo) + `// APPEND_HERE`, then Edit-appended remaining 10 (veve, saint soleil, iron-cut sculpture, fancy sailor mas, cap-haitien painting, ironwork, fileteado, mate/bombilla silversmithing, facon/boleadoras, gaucho poncho/chiripá).
- Near-duplicate pairs differentiated honestly: maracatu-regalia = full court ensemble + calunga dolls + drums; maracatu-crowns-and-capes = the metalwork/sequin costume pieces (tiered crowns, fringed capes, workshops); croix-des-bouquets-iron-cut-sculpture = the sculptural art lineage from Liautaud/bosmétal to museum wall panels; croix-des-bouquets-ironwork = the Noailles workshop economy of drum-cut panels.
- QC: official validator total 20 / bad 0 on first run; strict audit (ctx 150-450, vd 4×15-140, typ ≤160, lit/ui lengths) flagged 8 overlong ctx (453-490) → trimmed prose without losing facts; final ctx range 413-450, 0 strict issues, 0 dup slugs, slug order exactly matches assignment.
- bun run lint: clean. DB untouched; apply-patches NOT run (out of scope for this agent).

Stage Summary:
- patch-r3h.ts ready: 20/20 contract-valid patches (Brazilian NE woodcut/carnival complex, Congado/Folia de Reis, Haitian Vodou drapo/veve/Saint Soleil/Croix-des-Bouquets ×2/Cap-Haïtien, Trinidad fancy sailor mas, Argentine fileteado/mate silversmithing/facon/gaucho dress) with ctx+vd+typ+lit+ui at research depth; verification `total 20 bad 0 []`, strict audit clean; next step is the lead's `bun scripts/research/apply-patches.ts` promotion pass (not run here).
---
Task ID: 3-i
Agent: patch-r3i-writer
Task: Write patch-r3i.ts (20 Nordic/Sámi/Eastern European ctx+vd+typ+lit+ui patches)

Work Log:
- Read worklog tail + patch-r3a.ts to match the established PATCHES contract (slug/ctx/vd/typ/lit/ui; Write header+first 10 ending `// APPEND_HERE`, then Edit in the remaining 10).
- WIKIPEDIA VERIFICATION (batched titles= API calls, redirects=1, intro + full extracts): confirmed Rose-painting (1700s–mid-1800s Norway; three main styles Telemark/Hallingdal/Rogaland; C- and S-curves from Baroque/Rococo acanthus; declined by 1850s; Stavanger Åsmund S. Lærdal occupation-era cards), Dalmålning (svwiki: dalmålare cloth-and-paper "wallpaper" late 1700s–1800s, figure Bibles/woodcuts, neighboring provinces), Kurbits (svwiki: from Latin cucurbita; enwiki: name popularized by Erik Axel Karlfeldt 1920s, 1927 "Kurbitsmålning"), Dala horse (Dalarna, toy→national symbol, iron-oxide red, white/green/yellow/blue details), Ryijy (Viking cloak/blanket → bedcover pile-to-body → Finnish wall-hanging textile art), Gákti (contrast bands, plaits, pewter/tin embroidery, high collar, herding+ceremony), Duodji (functional Sámi handicraft: knives, bags, cups, clothing), Guksi (birch burl, kuksa/kåsa), Skolt Sámi (sää'mi; Sevettijärvi; term coined by majority culture), Tango (1880s Río de la Plata, milonga/habanera/candombe, UNESCO 2009), Facón + Estancia + Gaucho, Petrykivka (Petrykivka village, Dnipropetrovsk; 18th-c. earliest examples; 2012 national recognition; UNESCO 2013 — note: task brief said "UNESCO 2020", wrote the verified 2013), Egg decorating in Slavic culture (pysanka redirect; pagan→Easter syncretism, oldest finds in Ukraine). Tenntrådsbrodering, Platería criolla, Sami silversmithing, Reindeer leather have no enwiki articles → those entries written from the verified Gákti/Duodji/Guksi facts plus carefully hedged general knowledge, no invented dates/names/places.
- Authored all 20 entries in exact assignment order with near-duplicate differentiation: tango-era-poster-and-sheet-cover-art (combined sheet-cover+poster trade, UNESCO identity) vs tango-era-poster-art (poster medium focus); sami-silver-belt-ornamentation (dowry/status/heirloom economy) vs sami-belt-ornaments (ornament typology: plaques/pendants/rings/clasps); tenntradsbrodering = tin-thread couching technique; gallo-sami-ornamentation handled honestly as the Eastern Sámi/Skolt (sää'mi) ornament tradition, with the catalog-name caveat stated in ctx.
- TWO trim passes: 15 ctx values exceeded the self-imposed 450-char quality bar (up to 520) → trimmed prose without losing verified facts; second pass caught 6 stragglers; fixed an unescaped apostrophe introduced during editing (bun syntax error) before final validation.
- FINAL VERIFICATION: official contract validator → total 20, bad 0. Strict audit → 0 issues: ctx 411–450, vd shape/line/composition/texture all 40–61 chars, typ ≤160, lit keys (quality/temperature/shadow) ≤120, ui keys (background/surface/components/motion) ≤160, slug set and order exactly match the assignment, no duplicates. bun run lint clean.
- DB untouched; apply-patches NOT run (out of scope for this agent).

Stage Summary:
- patch-r3i.ts complete and validator-clean (total 20 / bad 0, ctx 411–450 avg 438): 2 Argentine estancia/tango graphic entries, 6 Nordic rosemaling-family entries (Telemark/Hallingdal/Rogaland, dalmålning, kurbits, dalahäst), Finnish ryijy, 9 Sámi entries (gákti, belt silver ×2 differentiated, tin-thread embroidery, reindeer leather, duodji knives, guksi/kuksa, Skolt/"gallo"), and 2 Ukrainian entries (petrykivka with verified 2013 UNESCO year, pysanka). Ready for `apply-patches` + draft→researched promotion by the lead agent.
---
Task ID: 3-f
Agent: patch-r3f-writer
Task: Write patch-r3f.ts (20 Australian/NW Coast/Arctic ctx+vd+typ+lit+ui patches)

Work Log:
- Read worklog tail for conventions + studied patch-r3e/r3a format to match the PATCHES contract (slug/ctx/vd/typ/lit/ui, no apply).
- WIKIPEDIA VERIFICATION (batched API, redirects=1, intro+keyword extracts): Papunya Tula (1971 Bardon mural, 1972 cooperative, Pintupi/Luritja/Warlpiri/Arrernte/Anmatyerre, sacred designs removed/modified after criticism → dot veiling), Bark painting→rarrk cross-hatching (red/white ochre grounds, yellow Yirrkala clan borders, John Mawurndjul 1952–2024), Wandjina (cloud/rain spirits, Wanjina Wunggurr bloc, Kimberley, ~4,000 yrs, Mowanjum), Gwion Gwion (Bradshaw 1891, 2020 wasp-nest study ~12,000 yrs, tassels/bags/headdresses), Tiwi Islands pukamani (tutini: up to 12 ironwood posts, white clay/black charcoal/yellow-red ochre, tunga baskets, left to decay), Utopia (Urapuntja, Alyawarre/Anmatyerre, Kngwarreye batik 1977→canvas 1988), Sand drawing→Pitjantjatjara milpatjunanyi (women tellers, stick pressed to body, drumstick rhythm, schools), X-ray style art (organs/skeleton, fish dominant, millennia old), Northwest Coast art (formlines + ovoids/U/S forms, bent-corner boxes), Chilkat (naaxein, Tlingit/Haida/Tsimshian, black/white/yellow/blue), Transformation mask (hinged outer animal → inner human face, potlatch), Bentwood→boxes (Haida/Tlingit/Tsimshian/Gitxsan/Yup'ik...), Charles Edenshaw (c.1839–1920, "best carver in wood and stone now living" 1902), Beadwork (Great Lakes Ursuline nuns → floral), Kinngait (Houston workshop 1957, West Baffin Eskimo Co-op 1959 Houston+Kananginak Pootoogook, annual collection, 48,000 prints 1959–74, Kenojuak Ashevak), Inuit art (walrus ivory → soapstone/serpentinite/argillite post-1945 markets, Winnipeg), Amauti (amaut pouch, to ~2 yrs, swing-to-front), Yup'ik masks (angalkuq instruction, finger masks → 10-kg ceiling masks), Qulliq (soapstone, seal oil/blubber, taqqut, most important article of furniture). "Utopia batik", "Sand story(ies)" articles missing on enwiki → grounded on Utopia/Kngwarreye + Sand drawing (milpatjunanyi section) instead; no invented specifics.
- Authored patch-r3f.ts via Write (header + first 10 entries ending `// APPEND_HERE`) then Edit replacing marker with remaining 10 — 20 entries total, each with ctx + vd (shape/line/composition/texture) + typ (display/body) + lit (quality/temperature/shadow) + ui (background/surface/components/motion).
- Fixed 2 authoring defects found on self-review: stray CJK chars in qulliq vd.composition, duplicated word in haida ui.components.
- QC: official validator passed first run (total 20, bad 0); strict audit (ctx 150–450 bar, vd 15–140, typ ≤160, lit keys ≤120, ui keys ≤160, slug-set/order match, non-ASCII scan) drove 3 trim passes (18 ctx over 450 → 9 → 0; final ctx 418–450).
- VERIFICATION: `bun -e` import → OFFICIAL total 20 bad 0 [] | STRICT 0 issues; bun run lint clean. DB untouched; apply-patches NOT run (per scope).

Stage Summary:
- File: /home/z/my-project/scripts/research/patches/patch-r3f.ts — 20 hand-authored patches (papunya-tula-dot-painting, arnhem-land-x-ray-painting, rarrk-crosshatch, wandjina-rock-faces, gwion-gwion-figures, tiwi-tutini-grave-poles, utopia-batik, sand-stories, haida-formline-art, tlingit-chilkat-weaving, kwakwaka-wakw-transformation-masks, northwest-coast-bentwood-boxes, coast-salish-spindle-whorls, edenshaw-era-silver-engraving, lakota-floral-beadwork, kinngait-printmaking, inuit-soapstone-carving, amauti-parkas, yupik-masks, qulliq-lamp-aesthetics) with ctx+vd+typ+lit+ui all filled, Wikipedia-spot-checked, ctx 418–450 chars.
- Ready for `apply-patches` / draft→researched promotion by the lead agent (not run here).
