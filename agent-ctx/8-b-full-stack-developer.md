# Task 8-b — full-stack-developer work record

Task ID: 8-b
Agent: full-stack-developer
File: src/components/atlas/shader-lab.tsx ONLY (additive: 199 insertions, 2 deletions in git diff — deletions are the doc-comment line + neon-fog trailing comment restructured to an explicit `if (uMaterial == 19)`)

## Task
Add 8 world-cultural craft materials (wax-resist, tie-dye, blockprint, tilework, filigree, beadwork, embroidery, inlay) + keyword routing in materialsFor(), GLSL ES version matching the file (ES 1.00 / WebGL1), fully deterministic. Continued a partial session — audited the diff, kept it, finished it.

## Material ids (new, appended as 20–27)
| id | MaterialId | Label | GLSL content |
|----|------------|-------|--------------|
| 20 | wax-resist | Wax-resist batik | crackle veining + stamped circle/diamond motif, pale wax-reserved highs |
| 21 | tie-dye | Tie-dye | seeded radial bleeds (wrap-to-repeat for seamless tiling) + banding rings |
| 22 | blockprint | Block print | jittered stamp grid, box/diamond/disk pick, fbm-roughened ink edges |
| 23 | tilework | Zellige tilework | 8-pointed stars + interlaced straps + grout, per-tile hue variation |
| 24 | filigree | Filigree | twisted sine-thread ropes (phase-shifted pairs), metal 0.95 |
| 25 | beadwork | Beadwork | packed bead domes over dark ground, 3-tone seeded picks |
| 26 | embroidery | Embroidery | satin-stitch bands (per-band angle/freq) + anisotropic thread sheen |
| 27 | inlay | Marquetry inlay | veneer bands + stringing + seeded diamond inlays, sheen on stringing |

Integration points (all additive): MaterialId union, MATERIAL_ORDER (appended after the original 20 — chip order for existing entries never regresses), MATERIAL_LABELS, materialsFor() routing, matHeight(), bumpScaleFor() (21→.08, 22→.10, 27→.14, 20→.18, 26→.24, 24→.26, 25→.30; 23 default .22), matSurface() albedo, FRAG_MAIN embroidery sheen. No uTime in any new material — deterministic per-entry seed only.

## Routing table (materialsFor, appended)
- wax-resist  ← /batik|wax[- ]?resist/
- tie-dye     ← /tie[ &-]?dye|shibori|bandhani|plangi|tritik/
- blockprint  ← /block[ -]?print|woodblock|stamp/
- tilework    ← /zellige|girih|azulejo|mosaic|\btile\b|\btiled\b|\btiling\b|\btilework\b/
- filigree    ← /filigree|filigran|wirework|twisted wire/
- beadwork    ← /bead|seed pearl/
- embroidery  ← /embroider|stitch|needlework|kantha|sashiko|phulkari|crewel/
- inlay       ← /marquetry|intarsia|inlay|inlaid|parquet|veneer/

Fix made this session: tilework uses word boundaries — bare `tile` matched the category "Textile & Craft" (17 DB entries would get a false zellige chip). The same quirk in the pre-existing terrazzo line is left untouched (not my file area).

## Verification
- Harness (kept OUTSIDE the repo at /home/z/.tmp-8b, deleted after — one-file constraint): imported the REAL materialsFor/MATERIAL_ORDER in bun against 8 stub entries → all 8 route PASS; determinism PASS (same input twice → identical chips); original-20 order stability PASS; labels PASS. DB routing counts: tilework 23, blockprint 7, inlay 4, embroidery 2, tie-dye 1 (shibori); wax-resist/filigree/beadwork 0 entries yet — future pipeline entries route automatically.
- GLSL: extracted the exact shipped VERT + FRAG (FRAG_LIB+HELPERS+MAIN) strings from the file and compiled+linked once in the same headless Chrome/SwiftShader → "SHADERTEST-OK all 28 material branches compiled+linked".
- Environment note: CDP evals starve while the SwiftShader canvas rAF loop runs (live-canvas probes hang); ShaderLab mount/interaction was verified in Task 7 and its rendering code is unchanged — compile + routing are the gates for the new work.

## Gates
- bunx tsc --noEmit → 0 errors in shader-lab.tsx (remaining project errors = pre-existing baseline elsewhere).
- bun run lint → clean.
- No other project file touched (scripts/* modifications in git status belong to other agents; my harness lived in /home/z/.tmp-8b and was deleted).

## Stage Summary
ShaderLab covers 28 materials; craft-textured entries route to culturally-specific procedural studies; everything seed-deterministic, palette-driven, and appended without regressing any existing chip order or material.
