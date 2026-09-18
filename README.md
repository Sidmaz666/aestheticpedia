# Aestheticpedia

**The open encyclopedia of the world’s aesthetics.** Art movements, architectural styles, cultural traditions,
crafts, dress, sacred art, subcultures and internet aesthetics — each documented with a description, cultural
context, palette, visual grammar, typography, materials, relations, freely licensed images (with credits) and
cited sources.

- Every record is **one JSON file** in [`data/aesthetics/`](data/aesthetics) — contribute with a pull request.
- The whole library ships as **JSON, NDJSON, CSV, Parquet and a DuckDB database** in [`public/data/`](public/data).
- A free **REST API** (`/api/v1`, OpenAPI 3.1), an **MCP server** (`/api/mcp`) and **`llms.txt`** make it usable by apps and AI assistants.
- Each record exports to **16 formats**: Markdown, text, HTML, JSON, JSON-LD, YAML, CSV, CSS, SCSS, Tailwind, design tokens, GIMP/Adobe palettes, SVG, BibTeX, RIS.

## Quick start

Requires Node ≥ 22.18 (runs the TypeScript data scripts natively) and npm.

```bash
npm install
npm run data:build   # validate data/ and build public/data/*
npm run dev          # http://localhost:3000
```

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` / `build` / `start` | Next.js app (build also rebuilds the data bundles) |
| `npm run data:build` | Validate every record, then write JSON/NDJSON/CSV/Parquet/DuckDB + manifest to `public/data/` |
| `npm run data:validate` | Schema + integrity checks and a quality-gap report (`--strict file.json` for the contribution bar) |
| `npm run data:new -- "Name"` | Scaffold a record, pre-filled from Wikipedia/Wikidata, with images |
| `npm run data:images` | Resolve images + Wikipedia/Wikidata links (`--slug x`, `--all`) |
| `npm run data:links` | Check every source, reference and image URL; hide dead ones; write `public/data/validation.json` |
| `npm run data:normalize` | Repair common shape defects (colours, URLs, year ranges) |
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

## Licensing

- Code: MIT.
- Record text and data: CC BY-SA 4.0.
- Images: not ours — each image carries its creator, license and source page in the record.
