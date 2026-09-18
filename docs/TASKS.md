# Project record & roadmap

A running log of what has been done and what is next. Newest first. Keep entries factual (numbers, files).

## Status snapshot

| Metric | Value |
|---|---|
| Records | 1,133 curated + Wikidata import (see `public/data/manifest.json` for live counts) |
| Records with images | 994 of the original 1,133 (from 128 before 2026-09-18) |
| Images | 8,036 freely licensed, each with artist/license/source page |
| Linked to Wikidata | 859 of the original 1,133 |
| Relations | 3,115 (+ Wikidata-derived) |

## 2026-09-18 — Platform rebuild

**Data layer**
- [x] Replaced Prisma/SQLite with files: one JSON per aesthetic in `data/aesthetics/`, relations in `data/relations.json`.
- [x] `scripts/data/build.ts`: zod validation → JSON, NDJSON, CSV, Parquet, DuckDB + manifest (SHA-256) in `public/data/`.
- [x] Runtime queries through an in-memory DuckDB over Parquet (`src/lib/store.ts`, `src/lib/queries.ts`).
- [x] Normaliser fixes: `{h,n}` palettes → `{hex,name}` (31 records), malformed URLs, 21 inverted year ranges ("present" parsed as a year), BCE starts.
- [x] Validator (`validate.ts`) with strict contribution bar and generated JSON Schema (`data/schema.json`).

**Images & links**
- [x] Removed 766 dead sandbox-CDN image URLs (`z-cdn.chatglm.cn`).
- [x] `images.ts`: Wikipedia article matching → article images in reading order → Wikidata Commons category → Art Institute of Chicago public domain. Non-free/icon/map files excluded. 994 records illustrated, 8,036 images.
- [x] Thumbnails use Wikimedia standard sizes (500/1280px — 480px is rejected by Wikimedia).
- [x] `check-links.ts`: Wikipedia titles verified via API (catches invented titles), other URLs probed; failures hidden in the UI. Report in `public/data/validation.json`.
- [x] `palette.ts`: palettes derived from images for records without curated colours (`paletteSource: "derived"`).

**Collection**
- [x] `import-wikidata.ts`: art movements, art styles, architectural styles, fashion styles, subcultures, internet aesthetics, painting techniques, textile processes with English Wikipedia articles; de-duplicated against existing names/aliases/titles/QIDs; Wikidata relations (P737, P279, P155).

**API & AI access**
- [x] `/api/v1` REST (list/search/detail/discover/blend/compare/timeline/categories/stats/formats), CORS, OpenAPI 3.1.
- [x] 16 per-record export formats (`src/lib/formats.ts`).
- [x] MCP server `/api/mcp` (tools, resources, prompts, completion) + `/.well-known/mcp.json`.
- [x] `/llms.txt`, `/llms-full.txt`, sitemap, robots, JSON-LD.

**Frontend**
- [x] Next.js 16.3 / React 19.3 / Tailwind 4; removed ~40 unused shadcn components and 60+ unused packages; npm only.
- [x] New design system (dark "vault" / light "paper"); aesthetic pages re-theme the whole site from their palette (WCAG-checked) and load their typefaces.
- [x] Full-screen record overlay via intercepted routes, with a round, high-contrast close button (Esc/back).
- [x] Pages: home, browse (URL-synced filters, infinite scroll), record, timeline (era chart, no scrollbars), discover, blend, data & API, about/terminology.
- [x] Terminology: Stub / Documented / Reviewed / Needs review; Evidence ratings; "Type" instead of "establishment"; "Data & API" replaces the dashboard.

**Project**
- [x] README, CONTRIBUTING, ARCHITECTURE, this record; CI (validate + build + typecheck + lint); issue/PR templates.
- [x] Removed sandbox leftovers (`.zscripts`, `mini-services`, agent logs, tool dumps, old research pipeline — all recoverable from git history).

## Next

- [ ] Review Wikipedia matches marked `related` and search-based matches for mismatched imagery (e.g. a plant photo on a weaving record).
- [ ] Illustrate the remaining records without images (Commons search by native-language names; more museum APIs: Met, Rijksmuseum, Smithsonian Open Access).
- [ ] Write visual grammar, typography and style profiles for imported Stubs (editorial work — do not auto-generate).
- [ ] Import from more Wikidata classes (craft techniques, costume, garden styles, typefaces/lettering traditions, ornament).
- [ ] Multilingual names (Wikidata labels) and non-English Wikipedia fallbacks for regional traditions.
- [ ] Scheduled CI job running `data:links` weekly.
- [ ] Choose a production domain and set `NEXT_PUBLIC_SITE_URL`.
