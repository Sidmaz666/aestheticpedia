# Project record & roadmap

A running log of what has been done and what is next. Newest first. Keep entries factual (numbers, files).

## Status snapshot (2026-09-19)

| Metric | Value |
|---|---|
| Records | 4,713 across 24 categories; 3,954 with images, 4,339 with palettes; live counts in `public/data/manifest.json` |
| Images | 27,162 freely licensed, all with artist/license/source page |
| Relations | 8,750 |
| Coverage | Every UN member state has at least one record except Grenada, Liechtenstein, Maldives, San Marino, São Tomé and Príncipe, and Saint Vincent (no documented visual tradition found in open sources) |
| Known gaps | 759 records without images (mostly internet aesthetics with no freely licensed pictures), 2,178 without a start year, 1,539 without an origin, 374 without a palette. Editorial fields (style/mood profiles, UI translation, lighting, type pairing) are empty for most records because no source provides them — left empty rather than invented |
| Tests | 89 unit (Vitest) · 30 e2e (Playwright, desktop + mobile) |

## 2026-09-19 — Round 4: regional depth, full fields, design exports

- [x] Geographical Indications of India: 117 registered handicraft/textile GIs with their own articles (Muga silk, Gamosa, Asharikandi terracotta, Sarthebari bell metal of Assam; Shaphee Lanphee, Moirang Phee, Wangkhei Phee of Manipur; Tripura Risa; Pochampally, Kanchipuram, Patola, Paithani…), `import-gi.ts`; instruments and industry articles excluded.
- [x] Regional crawl: every Indian state incl. all of Northeast India, Nepal, Bhutan, Bangladesh, Sri Lanka, Myanmar, Pakistan, art/textiles/pottery/crafts by country, folk and indigenous art, UNESCO masterpieces — imported through the reviewed class allow-list.
- [x] Field enrichment from sources: Wikidata works (key examples, materials, subcategory, aliases), Wikipedia History/Origins sections (cultural context, attributed), Aesthetics Wiki infobox (origin, key examples), CC0 museum images (Met, Cleveland), era/geography derived exactly.
- [x] 37 export formats per aesthetic and per blend: shadcn/ui (CSS + registry), Tailwind v3/v4, daisyUI, MUI, Chakra, Bootstrap, Less, Stylus, TS theme, W3C tokens, Style Dictionary, Tokens Studio, colour values, GIMP, ASE, ACO, Procreate, Sketch, Paint.NET, Android, SwiftUI, Flutter, Compose, plus documents, data and citations.
- [x] Blend rendered as a full aesthetic page (synthesized record with every section and export).
- [x] 3D Connections (orbit, clusters, relationship-coloured links, filters, fly-to), marquee hero, Discover/Blend random starts, floating export menu with search, robot minimize removed, pill spacing fixed.
- [x] Every UN member state: country-level architecture/art/dress/craft articles (`import-country-arts.ts`), "Visual culture of X" records quoted from the visual sections of each country's culture article where no dedicated article exists (`import-visual-culture.ts`), traditional clothing added to the class allow-list, and reviewed one-off titles (`includeTitles` in `data/crawl-classes.json`: Ngil mask, Bijago art, Sao civilisation, Nguzu nguzu, Kampong Ayer, Quadrille dress, Madras costume, Masonjoany, Gule Wamkulu, Imigongo…).
- [x] Star/save any aesthetic or blend (kept in the browser); starred items appear on the home page as "Your shelf", with undo.
- [x] UI kit switch fixed (knob inside the track; it now really toggles the panel between the aesthetic's theme and a neutral one).
- [x] Listen: a new audio deck built on react-audio-canvas (`useAudio` for playback/analysis, `detectNote` for pitch): spectrum, radial and oscilloscope visualizers in the record's palette, real waveform scrubber (drag/keyboard), live pitch/brightness/level readouts, playlist, loop, volume, ±10 s, media-session keys, Commons MP3 transcodes where Ogg/FLAC can't play. The library's bundled React 18 JSX runtime is shimmed (`src/lib/react-audio-canvas-shim.ts`) since only its hooks are used.
- [x] Project card (About) and footer buttons, live from GitHub: maintainer avatar/name/@handle/bio, repo stars/forks/issues, Follow/Star/Fork/Report/Contribute/Email (with copy). The repository comes from `NEXT_PUBLIC_REPO_URL`, else Vercel git metadata, else the local git remote; the contact email from `NEXT_PUBLIC_CONTACT_EMAIL`, else the owner's public GitHub email, else their latest commit. MIT `LICENSE` added (the site and package.json already declared MIT).
- [x] Robot wizard hat: raymarched brim, floppy cone on a curved spine, velvet band with embroidered stars and a glowing bauble; two-link spring physics (lags and whips with head turns, nods, rolls and lean; gravity follows the head's tilt; squash and stretch on hops).
- [x] SEO and production: generated Open Graph/Twitter cards (site: headline, live counts, vault mosaic; each record: its name, category, era, origin, summary, palette and hero image in the brand serif); Organization + WebSite (sitelinks search) JSON-LD, BreadcrumbList on records, Dataset on /data (Google Dataset Search); web manifest; snippet-sized descriptions, keywords, article times; Google-rich robots directives; previews noindex and closed robots.txt via VERCEL_ENV; verification tokens from env; security headers (nosniff, referrer policy, frame options, HSTS, permissions policy).
- [x] 404 (search, "did you mean" from the missing URL with typo tolerance, random jump, vault image strip), branded loader and page-shaped skeletons (records, browse), error page with reference and "report it", global-error for layout failures; spinners keep turning (slowly) under reduced motion.
- [x] Counts shown compactly (4.7k+, 27.1k+ — rounded down, "+" when rounded, exact value on hover) and only where they inform (hero stats, result and graph/timeline headers) — not in the search placeholder or repeated in copy; no counts hard-coded in text.
- [x] Willow is the default wand; cursor trail defaults to 15% strength with an on/off switch and a Subtle–Lavish slider in the cursor menu.
- [x] Robot readable on light themes (shell = lighter of text/background tone, visor = darker); headline descenders no longer clipped by the reveal masks; hydration mismatch fixed (motion only touches elements React has hydrated); real 404 status for missing records (no streaming boundary above record pages).
- [x] Connections rebuilt for speed: layout precomputed on the server (d3-force / d3-force-3d, cached per build) so no physics runs in the browser; 3D drawn with one InstancedMesh (nodes) + one LineSegments buffer (links) and fat lines only for the highlighted node's links; renders only while something moves (fully still when paused); highlighting fades unrelated nodes/links towards the background but keeps their hue (no grey). 2D map uses the same layout, batched Path2D drawing (one path per colour/state) and one redraw per frame. 3d-force-graph removed. ~60 fps in 3D on an integrated GPU, 57 fps panning the 2D map.
- [x] Image model card instead of a checkbox (model, publisher, licence, real size 1.9 GB, WebGPU note, "Ready on this device" once cached). Research: Janus-Pro 1B is the only text-to-image model with a ready browser build under 2 GB; SD-Turbo (official ONNX Runtime build) is faster but ≈2.5 GB; SDXS-512 / Tiny-SD / BK-SDM are small but need converting and hosting.
- [x] Themed scrollbars; the wand steps aside over scrollbars and ignores scrollbar drags; footer reads "Conjured by @sidmaz666".
- [x] Responsive audit (11 pages × 7 widths, 320–1920 px): header fits 320 px phones (shuffle moves into the mobile menu), Timeline filter no longer overflows at 320 px, Connections controls move below the title on phones, reveal animations have a CSS failsafe, Discover's random start no longer causes a hydration mismatch; no runtime or hydration errors on any page, desktop or mobile.
- [x] Section-level enrichment: 1,135 fields from each internet aesthetic's own Aesthetics Wiki article and 797 from each record's own Wikipedia article (visual language, techniques, dress, architecture, interiors, photography, examples) — only empty fields, only when the article is about the record; 12 wrong Wikipedia links corrected.
- [x] Writer model: MiniCPM5 1B added as the recommended on-device writer (community WebLLM build CharlZKP/MiniCPM5-1B-MLC for web-llm 0.2.85, pinned to commit cd20b6b; f16 or f32 variant chosen by the GPU). Benchmarked against Qwen 3.5 0.8B on grounded answers: 41 vs 32 tok/s warm, 0.32 vs 0.40 s to first token, and no invented facts (Qwen glossed Japonisme wrongly); ≈0.7 GB, one-off 17 s shader compile.
- [x] Toasts: themed, icon aligned to the title line, readable descriptions, pill actions; AI progress toasts split into a short title and a detail line. The robot lifts clear of the footer and does a double hop at the end of a page.
- [x] Wand cursor: six wands (Starlight, Elder, Crystal, Willow, Obsidian, Moonlit) with their own trails, picked from the header; states for hover, disabled, press/hold-to-charge, click, double-click, right-click, drag ribbon, text selection, scroll, page loading and idle; text caret kept in fields; off on touch screens, reduced for reduced motion; system cursor one click away.

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
