# Aestheticpedia

**The open encyclopedia of the world’s aesthetics.** Art movements, architectural styles, cultural traditions,
crafts, dress, sacred art, subcultures and internet aesthetics — each documented with a description, cultural
context, palette, visual grammar, typography, materials, relations, freely licensed images (with credits) and
cited sources.

- Every record is **one JSON file** in [`data/aesthetics/`](data/aesthetics) — contribute with a pull request.
- The whole library ships as **JSON, NDJSON, CSV, Parquet and a DuckDB database** in [`public/data/`](public/data).
- A free **REST API** (`/api/v1`, OpenAPI 3.1), an **MCP server** (`/api/mcp`) and **`llms.txt`** make it usable by apps and AI assistants.
- Each record (and each blend) exports to **every common design and data format**: shadcn/ui (CSS + registry JSON), Tailwind v3/v4, daisyUI, MUI, Chakra, Bootstrap, CSS/SCSS/Less/Stylus, W3C design tokens, Style Dictionary, Tokens Studio, Android, SwiftUI, Flutter, Compose, GIMP/ASE/ACO/Procreate/Sketch/Paint.NET palettes, SVG, Markdown, HTML, JSON, JSON-LD, YAML, CSV, BibTeX, RIS and more.

## Features

- **Thousands of aesthetics** from curated research, Wikidata/Wikipedia, the Aesthetics Wiki and museum collections — each record attributed (live counts in [`public/data/manifest.json`](public/data/manifest.json)).
- **Real media only:** freely licensed photographs and artworks (Wikimedia Commons, Art Institute of Chicago), real material/texture photos, Commons audio recordings. Every file keeps artist, license and source page.
- **Visualisations:** relationship network, colour atlas (every palette on one wheel, search by colour), per-record lineage tree and connection map, timeline with era density chart.
- **Aesthetic theming:** each record page re-skins the site — palette-derived colours (WCAG-checked), corner radius from its style profile, its own typefaces — with animated transitions.
- **On-device agent:** a 3D robot guide (raymarched in one WebGL shader; it takes on each aesthetic's colours and corner radius, doubles as back-to-top). It runs **Needle 3** (Cactus Compute, 35 MB, WebAssembly — no GPU needed) to pick tools — search, describe, compare, blend, similar, colour, mood, place, era, open pages, switch theme, download data — and answers from the library's own records. An optional writer model — MiniCPM5 1B (recommended; OpenBMB, Apache-2.0, a community WebLLM build pinned to an audited commit), or Qwen 3.5 0.8B/2B / Qwen 3 0.6B — turns results into prose on the GPU via WebLLM. Text-to-image generation uses Janus-Pro 1B (Transformers.js). Downloads are opt-in with progress; nothing leaves the browser.
- **Open interfaces:** REST API + OpenAPI, MCP server, `llms.txt`, JSON-LD, sitemap, design and data exports, full downloads.
- **Blend and Discover:** cross any two records into a full synthesized aesthetic page (every section and export), or find records by mood and palette.
- **Listen & cursor:** a themed audio deck (live spectrum/radial/oscilloscope, waveform scrubber, pitch readout) and a choice of six animated wand cursors.
- **Your shelf:** star any aesthetic or blend; starred items are kept in the browser and shown on the home page.

## Quick start

Requires Node ≥ 22.18 (runs the TypeScript data scripts natively) and npm.

```bash
npm install
npm run data:build   # validate data/ and build public/data/*
npm run dev          # http://localhost:3000
```

Configuration is optional — copy [`.env.example`](.env.example) to `.env.local` (or set the variables in Vercel) to change the
site name, tagline, description, canonical URL and repository links. On Vercel the site URL defaults to the project's
production domain.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` / `build` / `start` | Next.js app (build also rebuilds the data bundles) |
| `npm run data:build` | Validate every record, then write JSON/NDJSON/CSV/Parquet/DuckDB + manifest to `public/data/` |
| `npm run data:validate` | Schema + integrity checks and a quality-gap report (`--strict file.json` for the contribution bar) |
| `npm run data:new -- "Name"` | Scaffold a record, pre-filled from Wikipedia/Wikidata, with images |
| `npm run data:images` | Resolve images + Wikipedia/Wikidata links (`--slug x`, `--all`) |
| `npm run data:links` | Check every source, reference and image URL; hide dead ones; write `public/data/validation.json` |
| `npm run data:normalize` | Repair shape defects; drop dead links, search-engine links and map/diagram images |
| `npm run data:import` | Import art movements, styles, architecture, dress, subcultures… from Wikidata/Wikipedia |
| `node scripts/data/import-aestheticswiki.ts` | Import internet aesthetics from the Aesthetics Wiki (CC BY-SA) |
| `npm run data:palette` | Derive palettes from a record's own images (marked `derived`) |
| `npm run data:enrich` | Fill thin descriptions from the verified Wikipedia article (attributed) |
| `node scripts/data/materials.ts` | Real photos for material/texture terms (`data/materials.json`) |
| `node scripts/data/audio.ts` | Freely licensed recordings from each record's article |
| `node scripts/data/merge.ts <drop> <keep>` | Merge duplicate records |
| `npm test` / `npm run test:e2e` | Unit tests (Vitest) / end-to-end tests (Playwright, after `npm run build`) |
| `npm run typecheck` / `lint` | Code quality |

## How it fits together

```
data/aesthetics/*.json  ──validate──►  scripts/data/build.ts  ──DuckDB──►  public/data/{json,ndjson,csv,parquet,duckdb}
   (source of truth)                                                              │
                                                                                  ▼
                                               src/lib/store.ts (in-memory DuckDB over Parquet)
                                                                                  │
                                         src/lib/queries.ts ──► pages (RSC) · /api/v1 · /api/mcp · llms.txt · sitemap
```

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for details and [docs/TASKS.md](docs/TASKS.md) for the project
record and roadmap.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). In short: one aesthetic per file, your own words (or attributed CC BY-SA
text), freely licensed images with credits, and real sources. CI validates every pull request.

## Deploying to Vercel

Import the repository in Vercel — no settings are required. The build (`npm run build`) validates the data, writes
`public/data/*` and builds Next.js; serverless functions ship with the Parquet files (see `next.config.ts`). Optionally set
the variables from `.env.example`.

CI: the workflow lives at [`docs/ci/ci.yml`](docs/ci/ci.yml). To enable it, move it to `.github/workflows/ci.yml` using a
GitHub token with the `workflow` scope (`gh auth refresh -s workflow`).

## Licensing

- Code: MIT.
- Record text and data: CC BY-SA 4.0.
- Images: not ours — each image carries its creator, license and source page in the record.
