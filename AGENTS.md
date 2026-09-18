# AGENTS.md — working on Aestheticpedia

Instructions for AI coding agents (and humans) changing this repository.

## Ground rules

- **npm + Node only** (Node ≥ 22.18). Never use bun, yarn or pnpm. Data scripts are plain `.ts` run by Node's
  type stripping: relative imports need `.ts` extensions; use only erasable TypeScript syntax (no enums/namespaces).
- **Real data only.** Every fact must come from a citable source (Wikipedia/Wikidata/Commons, museum open-access
  APIs, scholarship). Never invent descriptions, palettes, dates, style profiles or images. Leave a field empty
  rather than guessing; derived values must say so (e.g. `paletteSource: "derived"`).
- **Images must be freely licensed** and keep `artist`, `license`, `licenseUrl`, `pageUrl`. Wikimedia thumbnails
  must use standard widths (250, 330, 500, 960, 1280…) — others return HTTP 400/429.
- **Commits** are authored by `sidmaz666 <sidmazumder8@gmail.com>` only, with no co-author trailers.

## Where things are

| Path | What |
|---|---|
| `data/aesthetics/<slug>.json` | One record per aesthetic — the source of truth |
| `data/relations.json` | Typed links between records |
| `data/wikipedia-overrides.json` | Curated article per record when automatic matching is wrong |
| `src/lib/schema.ts` | zod schema (→ `data/schema.json`) |
| `scripts/data/*.ts` | build, validate, normalize, images, palette, enrich, links, import-wikidata, new |
| `public/data/` | Generated bundles (never edit by hand) |
| `src/lib/store.ts`, `queries.ts` | DuckDB runtime + read model shared by pages and API |
| `src/lib/formats.ts`, `mcp.ts`, `openapi.ts` | Exports, MCP server, API description |
| `src/app/` | Routes; `@modal/(.)aesthetics/[slug]` is the full-screen overlay |
| `src/components/aesthetic/` | Record article and its islands (gallery, palette, demo, 3D) |
| `docs/` | Architecture and the task record (`docs/TASKS.md`) — update it when you finish work |

## Before you finish

```bash
npm run data:validate
npm run data:build
npm run typecheck && npm run lint
npm test
npm run build && npm run test:e2e
```

Site identity (name, URL, repo) comes from environment variables via `src/lib/site.ts` — never hard-code them.

## Pitfalls

- Shell heredocs on Windows can eat backslashes in regexes — edit regex code with an editor, and scan for control
  characters (`grep -rlP "[\x00-\x08]" src scripts`).
- Only one `next dev` may run per directory (Next 16); use `next start -p <port>` after a build for a second server.
- Server components can't call plain functions exported from `'use client'` modules — put shared helpers in `src/lib`.
- On Vercel the Parquet files are read from the function bundle — they are included via `outputFileTracingIncludes`.
