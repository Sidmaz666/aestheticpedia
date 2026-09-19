# Project record & roadmap

A running log of what has been done and what is next. Newest first. Keep entries factual (numbers, files).

## Status snapshot (2026-09-18)

| Metric | Value |
|---|---|
| Records | 4,228 (1,127 curated · 2,268 Wikidata/Wikipedia · 833 Aesthetics Wiki); 3,484 with images, 3,711 with palettes; live counts in `public/data/manifest.json` |
| Images | 23,450 freely licensed, all with artist/license/source page |
| Known gaps | 744 records without images (472 internet aesthetics), 1,803 without a start year, 1,649 without an origin, 517 without a palette — left empty rather than guessed |
| Material/texture photos | 1,764 terms with real photos (`data/materials.json`) |
| Relations | 8,500+ (curated + Wikidata P737/P279/P155 + Aesthetics Wiki "related") |
| Tests | 63 unit (Vitest) · 27 e2e (Playwright, desktop + mobile) — all passing |

## 2026-09-18 — Round 3: coverage, real data only, on-device agent

- [x] Coverage: crawl of ~58 Wikipedia category trees (styles, crafts, regional art, textiles, costume, cinema, photography) → Wikidata classes reviewed into an allow-list (`data/crawl-classes.json`, with explicit exclusions) → 463 new records: rug traditions, Japanese traditional crafts, pottery styles, lace/embroidery, regional art of Asia, Africa, Oceania and the Middle East.
- [x] Gap filling: 910 more records illustrated, net of removals (Wikipedia + Commons/Openverse search with two-word context check); origins for ~640 and periods for 526 from Wikidata and explicit statements in each record's own sources; 96 records with audio.
- [x] Quality: 905 unsourced AI style profiles removed (palette metrics measured from real colours instead); AI-generated images removed (except on AI-art records); 22 wrong Wikipedia matches undone with their images, references, Wikidata ids and palettes (`fix-wikipedia-links.ts`); 25 records with images from a related article reviewed by contact sheet — 7 cleared, 17 pruned to the images that depict the subject (`data/curated-images.json`); ~50 search-image false positives rejected by hand.
- [x] Live demo rebuilt from real data only (3D gallery of the record's images, web page, poster, palette map, UI kit, type); procedural line art/painting/pattern/shader removed.
- [x] On-device agent: Needle 3 (Cactus Compute, 35 MB WASM) routes to 14 grounded tools; optional Qwen 3.5 writer; 3D robot guide that takes on each aesthetic, follows the pointer, doubles as back-to-top.
- [x] UI: Connections page restructured (graph above a filter bar with wheel scrolling, arrows, show/hide all; hover card no longer clipped); wheel scrolling for chip and tab rows; proper carousels, palette thumbnails instead of blank boxes, pointer cursor on every interactive element, hydration and script-tag warnings fixed, redundant "Full page" button removed.

## 2026-09-18 — Round 2: scale, visuals, AI, deployment

- [x] Site identity from environment (`src/lib/site.ts`, `.env.example`): URL (defaults to Vercel URL), name, tagline, description, repo. No hard-coded domains.
- [x] Link cleanup: 1,167 dead links and ~5,700 generic search-engine links removed; dead source URLs stripped (citation kept).
- [x] Wikipedia mismatches corrected via `data/wikipedia-overrides.json` (e.g. Anthropophagy → Anthropophagic movement).
- [x] Maps/diagrams filtered out of galleries (multilingual: map, Karte, Verbreitung, carte…).
- [x] Import from Wikidata: art movements/styles, architectural styles, fashion styles, subcultures, painting techniques, textile processes, art genres, pottery styles, gardens, traditional costume, ornament — specific classes first; literary/music/film/game genres and non-visual movements excluded; 76 non-aesthetics pruned by review; homonyms disambiguated; 6 duplicates merged.
- [x] Import from the Aesthetics Wiki (CC BY-SA): 833 internet/community aesthetics with motifs, values, colour names, related aesthetics; wiki images not used (licensing unclear).
- [x] Real material/texture photos (replacing procedural swatches); Commons audio + "Listen" section (69 records).
- [x] Images for 1,588 newly imported records; 1,434 palettes derived from images; origins for 578 and periods for 58 more records from Wikidata (P495/P17/P276/P2348).
- [x] 222 placeholder style/mood profiles (all values 50) removed; Discover ranks only assessed records.
- [x] Data page charts: category treemap, century histogram, origins, record types, image licences.
- [x] Visualisations: Connections network (canvas, d3-force), Colour atlas (+ search by colour API), lineage tree and connection map per record.
- [x] Motion: GSAP reveals/counters/split headlines; registered CSS colour properties animate theme changes; radius and body font follow the aesthetic.
- [x] On-device AI: WebLLM assistant and Janus-Pro 1B image generation (the assistant was replaced in round 3 by the Needle 3 agent and robot guide).
- [x] Tests: data integrity, WCAG theme contrast for every palette, exports, queries, MCP, hygiene (control characters); Playwright e2e for pages, overlay close button, API, MCP, AI files, mobile overflow.
- [x] Git: history authored by sidmaz666; pushed to GitHub. CI workflow parked in `docs/ci/ci.yml` (token lacks `workflow` scope).

## 2026-09-18 — Round 1: platform rebuild

- [x] Prisma/SQLite → one JSON file per aesthetic + DuckDB over Parquet; JSON/NDJSON/CSV/Parquet/DuckDB downloads.
- [x] Images resolved from Wikipedia/Commons/AIC (994 records, 8,036 images) replacing dead sandbox-CDN URLs.
- [x] `/api/v1` REST + 16 export formats + OpenAPI; MCP server; llms.txt, sitemap, JSON-LD.
- [x] Redesign (Next.js 16, React 19, Tailwind 4): full-screen record overlay with round close button, per-aesthetic theming, timeline without scrollbars, Data & API page replacing the dashboard, new terminology.
- [x] npm + Node only; unused dependencies and sandbox leftovers removed.

## Next

- [ ] Editorial depth for imported Stubs: visual grammar, typography, style profiles (by contributors — never auto-generated).
- [ ] More image sources for the 744 records still without images (Met, Rijksmuseum, Smithsonian Open Access, Europeana; an Openverse API key would lift the anonymous 200/day limit).
- [ ] Origins/periods for the remaining records need editorial research — do not infer.
- [ ] Multilingual names from Wikidata labels; non-English Wikipedia fallbacks for regional traditions.
- [ ] Scheduled link checks in CI once the workflow is enabled.
