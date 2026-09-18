# Contributing to Aestheticpedia

Thanks for helping build the vault. Most contributions are data: adding a missing aesthetic, or improving an
existing record. No database, no special tools — every aesthetic is a JSON file.

## Fix or improve a record

1. Find the file: `data/aesthetics/<slug>.json` (the slug is the last part of the page URL). Every page also has an
   **“Improve this record”** link that opens GitHub’s editor.
2. Edit, then open a pull request. CI checks it automatically.

VS Code validates and autocompletes these files against [`data/schema.json`](data/schema.json).

## Add a new aesthetic

```bash
npm install
npm run data:new -- "Name of the aesthetic" --category "Art Movement" --type historical
```

This creates the file, pre-fills the summary/description, Wikipedia title and Wikidata id if an article exists,
and fetches freely licensed images. Then fill in the rest and check it:

```bash
npm run data:validate -- --strict name-of-the-aesthetic.json
npm run data:build
npm run dev   # look at /aesthetics/name-of-the-aesthetic
```

### The bar for a new record (`--strict`)

- `summary` ≥ 40 characters; `description` ≥ 200 characters
- ≥ 3 palette colours as `{ "hex": "#rrggbb", "name": "…" }`
- a period (`periodStart` or `startYear`) and an `origin` or `geography`
- ≥ 1 source with a URL — prefer museums, archives and scholarship (tier A), then encyclopedias and major press (B)
- ≥ 1 image, each with `license` and `pageUrl`

## Rules

- **Write in your own words.** Text copied from Wikipedia is allowed only with attribution in `sources` (it is
  CC BY-SA, as is this project).
- **Images must be freely licensed** (public domain, CC0, CC BY, CC BY-SA). Keep `artist`, `license`, `licenseUrl`
  and `pageUrl`. No hot-linked images from shops, Pinterest or social media.
- **Sources must be real and checkable.** Dead links are removed automatically by `npm run data:links`.
- **Be careful with cultural traditions.** Name the people and place, use the community’s own terms, and cite
  sources from within the culture where possible.
- **Style/mood profiles** (`dnaAxes`, `emotionProfile`, 0–100) are editorial judgements — keep them consistent with
  similar records.

## Field reference

| Field | Meaning |
|---|---|
| `category` | One of the 24 categories (see `src/lib/schema.ts`) |
| `establishment` | Type: `historical`, `regional_tradition`, `community_subculture`, `commercial_style`, `internet_aesthetic`, `experimental_hybrid` |
| `status` | `draft` (Stub) → `researched` (Documented) → `verified` (Reviewed); `flagged` = needs review |
| `dataQuality` | Evidence: `well_documented`, `moderately_documented`, `emerging`, `interpretive`, `experimental` |
| `visualDNA` | Formal vocabulary: shape, line, composition, texture… |
| `relations` | In `data/relations.json`: `{ from, to, type, note }` with types like `influenced_by`, `variant_of`, `reacts_against` |

## Code contributions

```bash
npm run typecheck && npm run lint && npm run build
```

Use npm (not bun/yarn/pnpm). Keep the UI on the design tokens in `src/app/globals.css` so aesthetic pages can
re-theme it.
