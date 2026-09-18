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
- `images-search.ts` — for records still without images: Commons search for the exact name, Openverse as a capped
  fallback. An image must name the aesthetic and share two distinctive descriptive words with the record; maps,
  logos and AI-generated images are rejected; hand-reviewed non-matches are listed in the script.
- `crawl-wikipedia.ts` + `import-wikidata.ts --from-crawl` — walks ~58 Wikipedia category trees (styles, crafts,
  regional art, textiles, costume, cinema, photography…), resolves each page's Wikidata class, and imports pages
  whose class is on the reviewed allow-list in `data/crawl-classes.json` (with an explicit title exclusion list).
- `enrich-wikidata.ts`, `enrich-text-facts.ts` — fill empty origin/period from Wikidata statements, then from explicit
  statements in the record's own sourced text (“originated in Japan”, “a 17th-century…”); never overwrite.
- `normalize.ts` — repairs palette shapes, bad URLs, duplicate strings, year ranges (“present”, centuries, BCE);
  removes unsourced AI style profiles and AI-generated images (except on records about AI imagery).
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
- **On-device agent** (`src/components/ai/agent-dock.tsx`, `src/lib/ai/`):
  - `robot.tsx` — the guide's 3D robot, raymarched in a single WebGL fragment shader. Every 400 ms it reads the
    visible theme (`--fg`, `--accent`, `--accent-2`, `--bg`, `--r-scale`, from the overlay when one is open) and eases
    towards it; moods (idle, think, happy, talk, sleep) drive the eyes and antenna. SVG fallback without WebGL.
  - `needle.worker.ts` — Needle 3 (Cactus Compute, Apache-2.0) in a Web Worker: vendored WASM engine in
    `public/vendor/needle/`, weights (35 MB) fetched once from Hugging Face at a pinned revision and kept in Cache
    Storage. It maps a request to tool calls with a calibrated confidence.
  - `tools.ts` — the tool schemas the model sees. `agent.ts` grounds the calls: drops calls whose arguments are not
    in the request, resolves names against the library (expanding truncated ones, mapping “this” to the page on
    screen), repairs misrouted calls (a style name passed as a colour), then runs the tools on `/api/v1` and returns
    cards, tables, swatches and actions. Greetings, hex codes, “surprise me” and “similar to X” bypass the model.
  - `engine.ts` — optional writer (WebLLM, WebGPU: Qwen 3.5 0.8B/2B, Qwen 3 0.6B) that writes prose only from the
    agent's results; Janus-Pro 1B text-to-image for the “Imagine it” section.

## Public interfaces

- REST: `/api/v1/*` (CORS, cached) — described in `src/lib/openapi.ts`, served at `/api/v1/openapi.json`.
- Exports: `src/lib/formats.ts` (16 formats), via `?format=` or a file extension on the slug.
- MCP: `src/lib/mcp.ts` + `/api/mcp` — Streamable HTTP, stateless JSON; tools, resources (`aesthetic://{slug}`),
  prompts, completion. Discovery at `/.well-known/mcp.json`.
- AI/SEO: `/llms.txt`, `/llms-full.txt`, `/sitemap.xml`, `/robots.txt`, JSON-LD (`WebSite`, `DefinedTerm`).
