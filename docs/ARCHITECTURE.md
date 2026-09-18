# Architecture

## Data

| Layer | Location | Notes |
|---|---|---|
| Source of truth | `data/aesthetics/<slug>.json`, `data/relations.json` | One file per record; stable key order for clean diffs |
| Schema | `src/lib/schema.ts` (zod) → `data/schema.json` | Enforced by `build.ts` and `validate.ts` |
| Build output | `public/data/` | `aesthetics.{json,ndjson,csv,parquet}`, `relations.{json,csv,parquet}`, `aestheticpedia.duckdb`, `manifest.json` (sizes + SHA-256), `validation.json` |
| Runtime | `src/lib/store.ts` | In-memory DuckDB loads the Parquet files; reloads when they change |
| Read model | `src/lib/queries.ts` | Every page and API route uses these functions |

Nested fields (colours, images, references…) are JSON strings in Parquet/CSV so the table stays flat and
spreadsheet-friendly; `mapAestheticFull` in `src/lib/aesthetic.ts` parses them defensively.

## Enrichment pipeline (`scripts/data/`)

- `images.ts` — matches each record to a Wikipedia article (explicit title → name/aliases → cited URLs → search,
  accepting search hits only when the title fits the name), takes the article’s images in reading order with Commons
  metadata, tops up from the Wikidata-linked Commons category and from the Art Institute of Chicago public-domain
  collection (only works whose style/subject tags match). Skips non-free, icon, map and logo files. Records
  `wikipedia`, `wikidata` and verified reference links. Responses are cached in `data/.cache/`.
- `check-links.ts` — verifies Wikipedia titles in batches via the MediaWiki API, probes other URLs per host with
  politeness delays, samples Wikimedia media URLs, stores `check: { ok, status, checkedAt }` on each link. The site
  hides items whose check failed; bot-blocked sites (401/403/429/5xx) are kept as “unverifiable”.
- `normalize.ts` — repairs palette shapes, bad URLs, duplicate strings, year ranges (“present”, centuries, BCE).
- `validate.ts` — schema, integrity, quality report, strict mode for PRs; regenerates `data/schema.json`.
- `new.ts` — scaffolds a record from Wikipedia/Wikidata and fetches images.

## App (Next.js 16, React 19, Tailwind v4)

- **Routes:** `/` home · `/aesthetics` browse · `/aesthetics/[slug]` record (ISR) · `/timeline` · `/discover` ·
  `/blend` · `/data` · `/about`.
- **Overlay:** `app/@modal/(.)aesthetics/[slug]` intercepts in-app navigation to a record and shows it full-screen
  over the current page (round close button, Esc, back). Direct loads render the full page.
- **Theming:** `src/lib/theme.ts` derives a WCAG-checked theme (bg/surface/text/accent) from a record’s palette. The
  full page applies it to `:root`, so the whole site takes on the aesthetic; the overlay scopes it to itself.
  `AestheticFonts` loads the record’s Google Fonts pairing.
- **Design system:** CSS variables in `src/app/globals.css` (“vault” dark default, “paper” light).
- **Interactive islands:** gallery/lightbox, palette swatches, export menu, section scroll-spy, live style demo
  (`style-demo.tsx`, six templates) and the WebGL material study (`shader-lab.tsx`).

## Public interfaces

- REST: `/api/v1/*` (CORS, cached) — described in `src/lib/openapi.ts`, served at `/api/v1/openapi.json`.
- Exports: `src/lib/formats.ts` (16 formats), via `?format=` or a file extension on the slug.
- MCP: `src/lib/mcp.ts` + `/api/mcp` — Streamable HTTP, stateless JSON; tools, resources (`aesthetic://{slug}`),
  prompts, completion. Discovery at `/.well-known/mcp.json`.
- AI/SEO: `/llms.txt`, `/llms-full.txt`, `/sitemap.xml`, `/robots.txt`, JSON-LD (`WebSite`, `DefinedTerm`).
