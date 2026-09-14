/**
 * Completeness patch r5g — line-work tail: comix, Spanish ink line, hatching family (6).
 * Hand-authored (Task 5-g); facts Wikipedia-API-verified; no LLM involvement.
 * Fills ctx + visualDNA + typography + lighting + uiTranslation.
 */
export const PATCHES: any[] = [
  {
    slug: 'underground-comix-crosshatch-filth',
    ctx: 'Underground comix are the small-press, self-published satirical comics that peaked with the US and UK counterculture of the late 1960s and 1970s, flouting the Comics Code Authority with explicit sex, drugs and violence. Zap Comix, premiering in early 1968 as a Robert Crumb showcase, set the model for the movement; Crumb, Gilbert Shelton, S. Clay Wilson and Trina Robbins inked dense, grotesque line, wearing the insult of filth as a badge.',
    vd: { shape: 'squat grotesque figures with bulging noses, warts and buck teeth', line: 'obsessive dense pen-and-ink crosshatch, quivery and filthy', composition: 'teeming panels packed with mugs, cars and body noise', texture: 'scratchy nib grain, blotting ink, cheap newsprint bleed' },
    typ: { display: 'psychedelic hand-lettered display caps on wobbling baselines', body: 'ragged comic-caption lettering, loose and all-caps' },
    lit: { quality: 'flat harsh newsprint light with no glamour', temperature: 'grimy warm-toned', shadow: 'crosshatch shadows heavy as grease-pencil grime' },
    ui: { background: 'cheap newsprint cream with flecked pulp grain', surface: 'panel-bordered cards with wobbly rule lines', components: 'torn-ticket buttons and comix ad-parody chips', motion: 'zine pages flipping with ragged jitter' },
  },
  {
    slug: 'spanish-tonchi-line',
    ctx: 'Spanish ink-line cartooning — grouped here under the TONCHI label, a name without a standard entry — is the crisp, wry pen-and-ink stroke of the tebeo tradition: the long-running TBO magazine (1917–1983) that named the Spanish medium, the dominant Bruguera and Valenciana houses, and humorists drawing rubbery figures with economical contour and gag timing; artists like Sergio Aragonés and Carlos Ezquerra later carried it to international markets.',
    vd: { shape: 'rubbery small-headed figures carried by big gesture silhouettes', line: 'single-weight ink contour with quick flicks and gag strokes', composition: 'clear gag setups, punchline foreground, airy backgrounds', texture: 'smooth bristol with clean pen grain and brush fills' },
    typ: { display: 'bold rounded cartoon caps with Spanish warmth', body: 'compact humanist sans for gag captions' },
    lit: { quality: 'bright Mediterranean daylight on white paper', temperature: 'warm-toned', shadow: 'one flat hatched shade, drawn rather than cast' },
    ui: { background: 'warm paper white with faint blue-pencil ghosting', surface: 'clean panel cards with hand-ruled frames', components: 'speech-bubble chips and gag-strip carousels', motion: 'quick line strokes completing as panels load' },
  },
  {
    slug: 'hatching-crosshatching',
    ctx: 'Hatching — French hachure — builds tone from closely spaced parallel lines; set at an angle to one another they become cross-hatching. Essential to linear media such as drawing, engraving, etching and woodcut, it arose in the Middle Ages and flowered in fifteenth-century old master prints: Master ES and Martin Schongauer in engraving, Erhard Reuwich and Michael Wolgemut in woodcut pioneered it, and Albrecht Dürer perfected crosshatching in both.',
    vd: { shape: 'tonal fields built from direction-angled stroke groups', line: 'closely spaced parallel strokes, layered at angles', composition: 'value modeled turn by turn across the whole figure', texture: 'incised plate burr, pen tooth, printed line grain' },
    typ: { display: 'old-master serif caps with engraved finials', body: 'quiet book serif for plate annotations' },
    lit: { quality: 'directional raking light like a plate under pressure', temperature: 'neutral-cool', shadow: 'shadow as pure line density, never blurred' },
    ui: { background: 'paper white with a faint plate impression', surface: 'line-hatched cards grading light to dark', components: 'angle-swatch chips and density sliders', motion: 'stroke fields sweeping in at stepped angles' },
  },
  {
    slug: 'stippling',
    ctx: 'Stippling builds tone from small dots: dot density, not line, simulates degrees of solidity and shading — sparse points breathe light, crowded swarms sink into shadow. Suited to pen and ink as much as to printmaking, stipple engraving dotted into copper became the refined medium of late eighteenth-century portrait prints and botanical plates, prized for soft gradation where line hatching felt too hard.',
    vd: { shape: 'edges and volumes coalescing purely from dots', line: 'no lines — massed points in drifting ranks', composition: 'value gradients stepped in invisible dot stages', texture: 'pricked paper grain, granular ink bloom, soft powder' },
    typ: { display: 'fine dotted-outline display caps with engraved air', body: 'small neat serif like a plate caption' },
    lit: { quality: 'even diffuse light with no cast shadows', temperature: 'neutral', shadow: 'shadow deepening only as the dots crowd' },
    ui: { background: 'ivory with a whisper of paper tooth', surface: 'dot-gradient cards fading edge to edge', components: 'density-scrub sliders and dotted rule dividers', motion: 'dots drifting in to form shapes on load' },
  },
  {
    slug: 'contour-hatching',
    ctx: 'Contour hatching steers the parallel strokes of hatching along the curves of the form, so each line traces the surface it models. Where flat hatching lays tone across a subject, contour hatching wraps it — swelling over rounded limbs and bellies, tightening across ridges and folds — so light and volume read three-dimensionally. Long favored by draftsmen of the old-master print tradition, it remains the default for shading figures and drapery.',
    vd: { shape: 'strokes bending with rounded bellies, folds and limbs', line: 'curved parallel lines tracking the surface they shade', composition: 'volume mapped turn by turn, line as topography', texture: 'pencil or pen grain flowing over sculpted form' },
    typ: { display: 'serif display caps with a subtle curve flow', body: 'drawing-manual serif for technique notes' },
    lit: { quality: 'a single studio lamp raking across the model', temperature: 'neutral-warm', shadow: 'line density thickening on the turned-away side' },
    ui: { background: 'warm sketch-paper gray', surface: 'cards whose borders curve with surface flow', components: 'form-rotation dials and stroke-flow sliders', motion: 'stroke fields bending around shapes as they load' },
  },
  {
    slug: 'scratchboard',
    ctx: 'Scratchboard, also called scraperboard, is direct engraving in reverse: cardboard coated in a thin layer of white China clay and covered with black India ink is cut away with sharp blades, so light marks emerge from darkness. It yields highly detailed, precise, evenly textured artwork, left black-and-white or colored, and grew from wood-engraving traditions that fed Victorian and early twentieth-century commercial and newspaper illustration.',
    vd: { shape: 'white forms carved out of a solid black ground', line: 'razor-cut strokes, needle stipple, crosshatched blades', composition: 'high-contrast subjects isolated on pure black fields', texture: 'clay-chalk dust at stroke ends, glossy ink, burr crumbs' },
    typ: { display: 'engraved white-on-black display caps, knife-sharp', body: 'crisp neutral sans for specimen labels' },
    lit: { quality: 'reversed light — marks glow against black', temperature: 'neutral-cool', shadow: 'shadow is the untouched ink ground itself' },
    ui: { background: 'deep india-ink black', surface: 'white-scratched cards with blade-edge highlights', components: 'blade-tool toggles and reductive-scratch sliders', motion: 'lines revealing by being scratched open' },
  },
];
