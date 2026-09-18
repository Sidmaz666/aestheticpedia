# Project record & roadmap

A running log of what has been done and what is next. Newest first. Keep entries factual (numbers, files).

## Status snapshot (2026-09-18)

| Metric | Value |
|---|---|
| Records | 3,765 (1,127 curated · 1,805 Wikidata/Wikipedia · 833 Aesthetics Wiki); 2,574 with images, 3,084 with palettes; live counts in `public/data/manifest.json` |
| Images | 10,000+ freely licensed, all with artist/license/source page; 8,036 original URLs link-checked (100% OK) |
| Material/texture photos | 1,764 terms with real photos (`data/materials.json`) |
| Relations | 8,500+ (curated + Wikidata P737/P279/P155 + Aesthetics Wiki "related") |
| Tests | 56 unit (Vitest) · 24 e2e (Playwright, desktop + mobile) — all passing |

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
- [x] On-device AI: WebLLM assistant (Web Worker, retrieval tools: search, current record, colour, blend) and Janus-Pro 1B image generation; opt-in downloads with progress toasts; outputs labelled.
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
- [ ] More image sources for records still without images (Met, Rijksmuseum, Smithsonian Open Access, Europeana).
- [ ] Multilingual names from Wikidata labels; non-English Wikipedia fallbacks for regional traditions.
- [ ] Scheduled link checks in CI once the workflow is enabled.
