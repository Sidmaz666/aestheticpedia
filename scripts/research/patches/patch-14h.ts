/**
 * Patch 14-h — full-depth backfill for the 35 EXISTING entries in manifest-14h.json
 * (Regional & Cultural Traditions tail: living craft, performance, rock-art and dress traditions).
 * Fields per patch: ctx (cultural context), vd (visual DNA), typ (typography),
 * lit (lighting), ui (UI translation). Slugs match the manifest exactly.
 * Consumed by scripts/research/apply-patches.ts (non-destructive merge into existing entries).
 */

export const PATCHES: any[] = [
  {
    slug: "sri-lankan-batik-workshop-culture",
    ctx: "Batik reached Sri Lanka through Dutch-era links with Java and matured into a cottage industry from the 1950s, then boomed under the 1970-77 import-substitution economy, when batik sarongs, shirts and sarees were promoted as national dress. Family workshops concentrated in Kegalle, Colombo and the south employ mostly women in waxing, dyeing and dewaxing lines, drawing motifs from Kandyan temple murals, elephant peraheras and tropical flora for local ceremonial wear and export.",
    vd: {
      shape: "Rectangular sarong panels and wall hangings with border-and-medallion layouts; elephant and temple silhouettes",
      line: "Fluid tjanting wax outlines pooling into dotted fills; crackle veining where dye seeps through fractured wax",
      composition: "Symmetric kepala end-panels framing central fields; repetitive floral trellises anchored by corner medallions",
      texture: "Waxy hand-drawn resist over matte cotton; layered indigo, maroon and ochre dyes with soft bleeds",
    },
    typ: {
      display: "Rounded Sinhala brush lettering on shop boards and wax-stamped workshop seals",
      body: "Sinhala and English dual labels on folded batik retail packets",
      notes: "1970s state-export cartons reuse a plain grotesque with Sinhala diacritics",
    },
    lit: {
      quality: "Humid studio daylight under tin roofs; dye vats steaming in shafts of sun",
      temperature: "warm-toned",
      shadow: "Wax fumes haze the light; drying lines cast soft stripes across cloth",
    },
    ui: {
      background: "Handloom ivory with faint indigo tide-lines",
      surface: "Matte cotton weave with wax-crackle overlay",
      components: "Medallion buttons, ribbon-dye progress bars, stamp-embossed cards",
      motion: "Dye blooms spreading slowly on hover; crackle reveal on load",
    },
  },
  {
    slug: "wayang-kulit",
    ctx: "Javanese shadow theatre reached courtly maturity under the Mataram realm and its successors in Surakarta and Yogyakarta, where courts kept resident dalangs; villages still stage all-night performances for weddings, vows and ruwatan purification. The dalang alone voices every character against the blencong oil lamp above a banana-trunk log, backed by a gamelan, playing Mahabharata and Ramayana lakon. UNESCO proclaimed it a Masterpiece of the Oral and Intangible Heritage of Humanity in 2003.",
    vd: {
      shape: "Flat fretted leather silhouettes with slender arms and towering headdresses; kayon tree-of-life fan as pivot",
      line: "Openwork tracery of awan-awan cloud holes; scrolling gold prada borders chased into the hide",
      composition: "Screen-centred stage: figures ranked by size from mountain to tip, dalang at right, gamelan behind",
      texture: "Translucent buffalo hide oiled to glow; gilded leaf, indigo and vermilion paint on court sets",
    },
    typ: {
      display: "Pegon and aksara Jawa court scribe lettering titling play repertoires",
      body: "Serat manuscript hands copying lakon episode lists for dalang study",
      notes: "Court edition colophons naming royal patrons at Surakarta and Yogyakarta",
    },
    lit: {
      quality: "Single blencong lamp flaring behind the screen; oil flicker isolates the silhouette",
      temperature: "warm-toned",
      shadow: "Shadows swell and shrink with flame sway; audience side sits in lamp-lit dark",
    },
    ui: {
      background: "Deep indigo night lit from behind",
      surface: "Translucent hide with pierced halo perforation",
      components: "Gilded silhouette icons, banana-log progress rails, lamp-glow toggles",
      motion: "Silhouettes drift and pivot on unseen rods; light pulse marks scene turns",
    },
  },
  {
    slug: "zulu-beadwork-love-letters",
    ctx: "In late nineteenth- and early twentieth-century Natal and Zululand, young Zulu women wove trader-bought glass beads into love letters (izincwadi) whose colours and triangle geometry spelled courtship messages, since couples could rarely meet freely. Codes varied by district and were taught between girls; beaded grades accumulated through a woman's life, peaking at her umemulo coming-out ceremony. The idiom still lives in KwaZulu-Natal beadwork cooperatives and wedding regalia.",
    vd: {
      shape: "Flat beaded panels and belts built of triangle and diamond units pointing toward or away from the reader",
      line: "Hard diagonals of the triangle grid; stepped chevrons counting message words",
      composition: "Colour-blocked message strips under geometric collar and apron fields, symmetric by wear grade",
      texture: "Glossy glass beads threaded on cord — white, black, red, royal blue with natural filler beads",
    },
    typ: {
      display: "Bead colour-sequences acting as letterforms of the courtship code",
      body: "Latin-script isiZulu captions in mission-school copybooks transcribing messages",
      notes: "Collector catalogue keys decoding colour idioms by district",
    },
    lit: {
      quality: "Open veld light flashing off glass bead facets",
      temperature: "neutral-toned",
      shadow: "Tiny bead shadows give a woven stipple; thorn-shade noon contrast at ceremonies",
    },
    ui: {
      background: "Pale hide-toned neutral with bead-gloss sparkle",
      surface: "Faceted bead tiles on woven cord",
      components: "Colour-code legend chips, message-composer swatches, bead-strand dividers",
      motion: "Beads cascade into place; hover decodes a triangle's meaning",
    },
  },
  {
    slug: "kirituhi",
    ctx: "Kirituhi — 'skin art' — emerged in 1990s Aotearoa during the Māori renaissance as a compromise design language: the visual grammar of tā moko (koru spirals, puhoro speed-lines, pakati dog-tooth bands) tattooed without the embedded whakapapa that makes moko sacred and person-specific. Artists including Gordon Toi popularised the term so non-Māori clients and diaspora Māori could wear the patterns ethically; it now circulates through international tattoo conventions and film makeup.",
    vd: {
      shape: "Bracer and chest-panel layouts: symmetrical spirals flanking a spine of story bands",
      line: "Koru unfurling-fern spirals, puhoro speed-lines, pakati dog-tooth serrations cut in negative",
      composition: "Balanced halves without genealogy: notches recording life events, diagonals carrying momentum",
      texture: "Black-ink skin gloss and healed stipple, or slate-grey carved-wood equivalents",
    },
    typ: {
      display: "Kapa haka banner lettering with angular Māori-cut capitals",
      body: "Bilingual te reo Māori / English studio consent and care forms",
      notes: "Convention booth signage distinguishing kirituhi from tā moko",
    },
    lit: {
      quality: "Cool studio ring-light over black ink sheen",
      temperature: "cool-toned",
      shadow: "Skin relief catches low light along healed lines; stencil-blue shadows before the session",
    },
    ui: {
      background: "Charcoal pounamu green-black",
      surface: "Matte ink with faint silverpoint sheen",
      components: "Spiral koru loaders, chevron dividers, consent toggle blocks",
      motion: "Line-work inks itself stroke by stroke on reveal",
    },
  },
  {
    slug: "gwion-gwion-figures",
    ctx: "Painted on Kimberley rock shelters in northwest Australia's sandstone gorges, the Gwion Gwion (long mislabelled 'Bradshaws' after pastoralist Joseph Bradshaw, who saw them in 1891) are slender tasselled human figures in mulberry-red and yellow ochre. Ngarinyin elder David Mowaljarlai championed the ancestral name in the 1990s; custodial families treat the images as potent inherited works, painted in successive phases — tassel, sash, plain figure — whose sequence researchers still debate.",
    vd: {
      shape: "Elegant stick-limbed human silhouettes one to two metres tall, with sashes, armbands and tasselled headdresses",
      line: "Fine even ochre strokes outlining calves, waistbands and tassels; no ground lines",
      composition: "Single-file processions and small groups on shelter walls, later phases layered over earlier",
      texture: "Dry matte ochre — mulberry red, mustard yellow — on weathered sandstone with silica sheen",
    },
    typ: {
      display: "Site recording codes (KIM-1) stencilled on survey tags beside panels",
      body: "Field-catalogue serif captions noting pigment and phase in site registers",
      notes: "Ngarinyin names set in italics with translated glosses in community publications",
    },
    lit: {
      quality: "Raking low sun along gorge walls reveals the figures at certain hours",
      temperature: "warm-toned",
      shadow: "Deep overhang shadow shelters the panels; figures ghost pale in shade",
    },
    ui: {
      background: "Ochre sandstone gradient with grain scatter",
      surface: "Pitted rock texture with faint silica glaze",
      components: "Phase-timeline sliders, tassel-line icons, survey-tag chips",
      motion: "Panels fade in as sun-angle shifts; ghost overlays compare tassel and sash phases",
    },
  },
  {
    slug: "tlingit-chilkat-weaving",
    ctx: "Chilkat weaving (naaxein, 'hanging blanket') is the signature textile of the Chilkat Tlingit around Klukwan, Alaska, practised by women on a single-bar frame with mountain-goat wool spun over shredded cedar-bark warp. Crested blankets — Raven, Killerwhale, Frog formalised in formline curves — were commissioned by house leaders and paid for at potlatches; the craft nearly vanished until master weaver Jennie Thlunaut (1892-1986) of Klukwan taught successive generations across Southeast Alaska.",
    vd: {
      shape: "Fringed dance blankets with five-panel designs; bears, ravens and frogs woven as eyes within eyes",
      line: "Curving formline arcs bent to the weave's right-angle constraints, basket turns around each eye",
      composition: "Symmetric chest-to-hem crest fields, staggered side borders, long twisted hanging fringe",
      texture: "Mountain-goat wool over cedar-bark warp — dense, dry, with soft unspun fringe that swings",
    },
    typ: {
      display: "Formline crest emblems serving as house and clan letterheads",
      body: "Bilingual English-Tlingit museum labels in linguist-standard orthography",
      notes: "Potlatch invitations and song names recorded in clan minute books",
    },
    lit: {
      quality: "Cool northern daylight through plankhouse smokeholes; potlatch firelight on dancing fringe",
      temperature: "neutral-toned",
      shadow: "Fringe shadows ripple; deep black formline voids read as shadow even in sun",
    },
    ui: {
      background: "Deep spruce-forest green-black",
      surface: "Wool-on-bark weave with hanging fringe edge",
      components: "Eye-in-eye crest icons, fringe-textured dividers, clan-selector buttons",
      motion: "Fringe sways gently on scroll; crest eyes blink open on load",
    },
  },
  {
    slug: "moche-fineline-pottery",
    ctx: "Between about 100 and 800 CE, potter-artists of the Moche valleys of Peru's north coast painted rolling narrative scenes in fine red lines on cream stirrup-spout bottles — warriors, messengers, priests and the Presentation sacrifice ceremony. Archaeologist Christopher Donnan traced individual painting 'hands' across five phases and published the vessels through Donna McClelland's rollout drawings; the 1987 discovery of the Lord of Sipán tomb by Walter Alva confirmed the regalia such pots depict.",
    vd: {
      shape: "Stirrup-spout bottles and portrait-head jars, globular bodies with one spout-bridge; disc-like fineline panels",
      line: "Hair-thin red slip lines hatching war clubs, headdresses, tears and speech scrolls",
      composition: "Register-band narratives wrapping the vessel; a rollout reads one story continuously around the form",
      texture: "Burnished cream slip against matte red line work; spouts smoothed to sheen",
    },
    typ: {
      display: "Modeled relief figures serving as vessel title elements",
      body: "Rollout-drawing captions and Donnan phase numbers (I-V) in excavation reports",
      notes: "Iconography indexes naming 'Presentation Theme' scenes in catalogue entries",
    },
    lit: {
      quality: "High desert sun off adobe walls; museum raking light for fineline legibility",
      temperature: "warm-toned",
      shadow: "Crisp noon shadow under the spout bridge; burnished highlights arc across the body",
    },
    ui: {
      background: "Cream slip white with adobe warmth",
      surface: "Burnished ceramic with matte red linework",
      components: "Rollout-carousel viewers, phase badges, stirrup-spout icons",
      motion: "Vessel rotates to unroll the narrative; lines redraw on phase switch",
    },
  },
  {
    slug: "maracatu-regalia",
    ctx: "Maracatu nação processions in Recife and Olinda re-enact the coronations of Congo-Angola kings once staged by Black Catholic brotherhoods of colonial Pernambuco — first recorded in 1711 — and their regalia still perform that invented royalty. Nações like Elefante, Leão Coroado and Estrela Brilhante field a king and queen, a porta-estandarte banner-bearer, baianas and caboclos de lança, costumed in sequinned velvet, mirrors and gilded tin for Carnival processions led by alfaia drums.",
    vd: {
      shape: "Tiered silhouettes: towering crowns, balloon-sleeved capes, hoop skirts, fringed caboclo hats with long lances",
      line: "Sequin rows stitching out dragons, sunbursts and scrolling borders borrowed from ironwork",
      composition: "Procession order as design grid — banner front, royals centre, baiana ranks, drum corps tail",
      texture: "Sequinned velvet, mirror inlay, gilt tin, ostrich plumes and satin under tropical sun",
    },
    typ: {
      display: "Wrought-iron lettering style of old Recife shop plaques echoed on banners",
      body: "Carnival programme booklets in condensed grotesque with Pernambuco flavour",
      notes: "Nation estandarte banners hand-lettered with crowned initials and founding year",
    },
    lit: {
      quality: "Harsh Carnival noon and drum-shadowed streets; night rehearsal under sodium lamps",
      temperature: "warm-toned",
      shadow: "Sequin glitter throws hard sparkle points; awning shade cools the queue rows",
    },
    ui: {
      background: "Carnival crimson fading to gilt cream",
      surface: "Sequin-shimmy velvet with mirror tesserae",
      components: "Crown-shaped badges, banner carousel, drum-pulse meters",
      motion: "Confetti sparkles track the cursor; banner unfurls on drumbeat timing",
    },
  },
  {
    slug: "maracatu-crowns-and-capes",
    ctx: "The crown-and-cape complex of Pernambuco's maracatu nações translates Central African kingship into Brazilian materials: gilded tin and brass crowns set with coloured glass gems and mirror shards, velvet capes heavy with sequin embroidery honouring Nossa Senhora do Rosário, patron of the brotherhoods. Specialist ateliers in Recife's working-class districts remake each set for Carnival, and the calunga doll — the nation's royal heirloom carried by the queen — keeps its own miniature wardrobe.",
    vd: {
      shape: "Domed crowns with arched panels and cross finials; floor-length cape rectangles with mirrored yokes",
      line: "Raised bead-and-sequin outlines tracing royal monograms and Marian vignettes",
      composition: "Frontal symmetry on the wearer's chest; mirror-star axes radiating from the crown centre",
      texture: "Gilded tin scales, faceted glass gems, cracked mirror chips, dense satin-stitch sequin fields",
    },
    typ: {
      display: "Gothic-influenced block initials on capes citing king and queen names",
      body: "Atelier order books with measurements and sequin counts in cursive Portuguese",
      notes: "Calunga doll outfits labelled by nation anniversary year",
    },
    lit: {
      quality: "Atelier bulbs plus procession glare; mirrors multiply the light",
      temperature: "warm-toned",
      shadow: "Mirror shards cast hard glints; velvet absorbs shadow at the cape folds",
    },
    ui: {
      background: "Royal velvet maroon with gold dust",
      surface: "Embossed gilt tin with gem facets",
      components: "Mirror-tile badges, crown toggles, wardrobe-year selectors",
      motion: "Gems catch light in sequence; cape hem swings with scroll momentum",
    },
  },
  {
    slug: "croix-des-bouquets-iron-cut-sculpture",
    ctx: "The iron-cut sculpture tradition began when blacksmith Georges Liautaud of Croix-des-Bouquets, outside Port-au-Prince, started hammering vodou crosses from flattened oil-drum lids around 1944; DeWitt Peters of the Centre d'Art championed him, and the village of Noailles filled with ateliers. Successive masters — Murat Brierre, Gabriel Bien-Aimé, Serge Jolimeau, the Louis-Juste family — chisel lwa spirits, angels and jungle fantasies from recycled steel for collectors worldwide.",
    vd: {
      shape: "Rectangular steel panels with negative-space silhouettes — angels, veve-like spirals, jungle leaves",
      line: "Chisel-cut contour lines following the drum-roll texture; hammered repoussé ridges",
      composition: "Radial and processional layouts: Legba at the crossroads, Damballah coiling through the field",
      texture: "Oxidised oil-drum steel with rust blooms, hammer dents and burnished cutting edges",
    },
    typ: {
      display: "Artist signatures chiselled into a corner of each panel",
      body: "Haitian Creole gallery cards with price lists in plain grotesque",
      notes: "Noailles atelier plaques numbered by workshop row",
    },
    lit: {
      quality: "Open-air atelier glare; cut steel throws filigree shadow onto the workshop dirt",
      temperature: "warm-toned",
      shadow: "Panels read as shadow-catchers — wall display doubles the design",
    },
    ui: {
      background: "Rust-brown with cutout transparency",
      surface: "Hammered steel with dark oxide bloom",
      components: "Silhouette cutout cards, veve-line dividers, hammer-strike loaders",
      motion: "Panels unfold like lifted drums; shadow layer shifts with the cursor",
    },
  },
  {
    slug: "swedish-dalmalning",
    ctx: "Dalmålning — 'Dalarna painting' — flourished in the Swedish parishes of Rättvik, Leksand and Mora from the seventeenth century, peaking around 1780-1850, when itinerant painters like Winter Carl Hansson (1777-1805) decorated log walls, cupboards and boxes with kurbits flower vases, biblical scenes and bridal riders. Working from traced pattern books, they charged by the panel; the style was revived in the twentieth century and now defines Swedish folk imagery worldwide.",
    vd: {
      shape: "Tall kurbits vases overflowing paired tulips, birds and riders within rectangular wall-panel frames",
      line: "Confident double-outline brushstrokes with highlight flicks and arabesque leaf tendrils",
      composition: "Biblical centre scenes framed by kurbits columns; cupboards split into hinge-symmetric panels",
      texture: "Distemper paint soaked into raw pine — chalky greens, iron-red, Prussian blue, lead white",
    },
    typ: {
      display: "Fraktur-lettered scripture quotations and moral couplets on the panels",
      body: "Parish and painter signatures in vernacular cursive with dates",
      notes: "Pattern books with traced kurbits templates passed between villages",
    },
    lit: {
      quality: "Low northern window light over pine plank walls",
      temperature: "warm-toned",
      shadow: "Wood grain shadowing under thin paint; candlelight deepens the iron-reds",
    },
    ui: {
      background: "Pine cream with kurbits green corners",
      surface: "Distemper matte with plank grain",
      components: "Vase-shaped cards, tulip bullets, panel-frame modals",
      motion: "Flowers unfurl along the scroll; scripture captions fade like wall inscriptions",
    },
  },
  {
    slug: "krakow-szopka-nativity-scenes",
    ctx: "Kraków's szopki grew from a licensed winter trade of the city's masons and builders, who crafted multi-tiered cribs splicing St Mary's Basilica towers, Wawel and the Cloth Hall around the Nativity. The Historical Museum of Kraków has run the annual competition since 1937 — interrupted by war, revived in 1957 — with entries judged at the Adam Mickiewicz monument each December; UNESCO inscribed the tradition on its Intangible Cultural Heritage list in 2018.",
    vd: {
      shape: "Exuberant multi-tier spire stacks — Gothic basilica towers, onion domes and Wawel arcade tiers in miniature",
      line: "Foil-folded ridges and tracery-cut strips; pointed-arch micro-architecture on every level",
      composition: "Central Nativity chapel flanked by asymmetric tower masses; figurines ranked at the base",
      texture: "Glossy coloured foil, curved cardboard, cotton-wool sheep, mirror scraps and dressmaker pins",
    },
    typ: {
      display: "Tracery-framed Polish lettering on museum competition labels",
      body: "Entry forms with maker names, districts and years in neat cursive",
      notes: "Prize-diploma calligraphy issued by the Historical Museum of Kraków",
    },
    lit: {
      quality: "December street glow and foil glare; museum vitrine spots at judging",
      temperature: "cool-toned",
      shadow: "Foil folds throw razor highlights; tower niches shadow the figurines",
    },
    ui: {
      background: "Frost blue with foil shimmer",
      surface: "Folded foil panels over cardboard matte",
      components: "Spire-shaped cards, tier-stack progress, prize-ribbon badges",
      motion: "Tiers stack up on load; foil twinkle follows the cursor",
    },
  },
  {
    slug: "horezu-ceramics",
    ctx: "Pottery has been made at Horezu in Romania's Vâlcea county since the late seventeenth century, when Constantin Brâncoveanu built his monastery there and court crafts settled around it. Workshops line Olari Street, where families such as the Ogrezeanu and Vlasie throw red earthenware, coat it in white slip and paint roosters, stars and peacock-tail motifs before firing in two-chamber kilns; UNESCO recognised the craft as Intangible Cultural Heritage in 2012.",
    vd: {
      shape: "Rounded jugs, plates and candlesticks with wide mouths; rooster figurines with fan tails",
      line: "Quill-traced outlines looping into concentric borders, crescents and star sprays",
      composition: "Rooster or peacock-tail motif centred, ringed by dotted and barbed bands on ivory slip",
      texture: "Chalky white engobe over terracotta; cocoa-brown, cobalt and green enamels with fine crazing",
    },
    typ: {
      display: "Potter family initials painted underfoot beside the rooster mark",
      body: "Olari Street shop signs hand-lettered in Romanian diacritics",
      notes: "UNESCO nomination dossiers and fair stall price tags in plain grotesque",
    },
    lit: {
      quality: "Workshop daylight over throwing wheels; kiln-mouth glow at firing",
      temperature: "warm-toned",
      shadow: "Slip shadow on glaze crazing; shelf rows cast even kiln-shade bands",
    },
    ui: {
      background: "Ivory slip with terracotta rim",
      surface: "Crazed engobe matte with enamel dots",
      components: "Rooster badges, band-ring loaders, kiln-dot toggles",
      motion: "Enamel dots fill in sequence; the rooster tail fans on hover",
    },
  },
  {
    slug: "harry-clarke-stained-glass",
    ctx: "Harry Clarke (1889-1931) trained in his father Joshua Clarke's Dublin church-decorating studio and at the Dublin Metropolitan School of Art, then set Irish stained glass on a new course with the Honan Chapel windows in Cork (1914-17). His panels — acid-etched flashed glass, jewel blues, elongated figures dense with fine detail — carry Symbolist and Art Deco inflections; the Geneva Window of 1929 proved so daring it was never installed, and the studio continued under brother Walter until 1973.",
    vd: {
      shape: "Tall lancet panels with elongated figures under canopied Gothic niches",
      line: "Obsessive hair-fine leading and acid-etched flashed-glass detail — eyes, brocades, foliage",
      composition: "Vertical figure stacks on jewel-colour fields; narrative bands read like illuminated pages",
      texture: "Acid-textured flashed glass, deep cobalt and emerald with streaky antique and opalescent mixes",
    },
    typ: {
      display: "Art Nouveau illuminated initials echoing his Book of Job display lettering",
      body: "Dedication panels lettering in textura-flavoured gothic",
      notes: "Corner-pane signatures reading 'Harry Clarke Dublin' in etched script",
    },
    lit: {
      quality: "Back-projected daylight through saturated glass — light is the medium",
      temperature: "cool-toned",
      shadow: "Leading casts dark node-lines; interiors pool in jewel shadow",
    },
    ui: {
      background: "Deep cobalt with emerald vignette",
      surface: "Streaky glass with etched frost",
      components: "Lancet-shaped cards, cameo medallion avatars, leaded-line dividers",
      motion: "Light beams sweep the panes on load; etched detail sharpens on focus",
    },
  },
  {
    slug: "manton-de-manila",
    ctx: "The mantón de Manila — an embroidered silk piano shawl — was woven and embroidered in Cantonese workshops and shipped through Manila aboard the galleon and later steam routes, hence the name. From the mid-nineteenth century the shawls dressed merchants' wives in Manila and then Spanish and Latin American women, becoming core flamenco and fair attire in Andalusia; peonies, chrysanthemums and birds worked in twisted silk thread with long knotted fringes remain the canon.",
    vd: {
      shape: "Square silk fields with all-over floral sprays and long knotted fringes on every border",
      line: "Satin-silk couching outlines of peony petals, chrysanthemum bursts and bird tails",
      composition: "Dense corner-to-corner floral diagonals leaving pale centres; lotus-scroll border bands",
      texture: "Pongee silk sheen with raised twisted-thread embroidery and heavy swinging fringe",
    },
    typ: {
      display: "Feria de Abril poster lettering with bold swash Spanish capitals",
      body: "Manila export labels bilingual in Spanish and Chinese",
      notes: "Flamenco atelier tags listing shawl weight, dye lot and fringe count",
    },
    lit: {
      quality: "Feria lanterns at night; Andalusian noon on taupe silk by day",
      temperature: "warm-toned",
      shadow: "Embroidery relief casts thread shadows; fringe bars stripe the wearer",
    },
    ui: {
      background: "Blush silk with ivory bloom",
      surface: "Pongee sheen with thread relief",
      components: "Fringe-texture dividers, floral swatch chips, knot-tassel toggles",
      motion: "The shawl drape folds open on load; petals shimmer per hover",
    },
  },
  {
    slug: "shippo-cloisonne",
    ctx: "Japanese cloisonné (shippō, 'seven treasures') took modern form when Kaji Tsunekichi of Owari disassembled a Chinese enamel vessel in the 1840s and rebuilt the technique; by the 1870s Nagoya's Andō workshops and Kyoto's Namikawa Yasuyuki were winning world's-fair medals, including Paris 1900. German chemist Gottfried Wagener advised on firing and glazes during the Meiji export boom, and the Andō Cloisonné Company still produces for the Imperial Household today.",
    vd: {
      shape: "Medallion plates, small boxes and vase forms with roundel fields; wire-celled arabesques and clouds",
      line: "Fine copper cloisons tracing chrysanthemum roundels, flowing water and phoenix tails",
      composition: "Central roundel with quartered grounds — graded enamels fading dark to light in each cell",
      texture: "Glassy enamel pools over mirror-polished metal wires — glossy, cool and jewel-hard",
    },
    typ: {
      display: "Kiln marks (Andō seal) underfoot; tanzaku title slips on gift boxes",
      body: "Meiji export labels pairing kanji with romanised firm names",
      notes: "World's-fair award rosettes reprinted on presentation cartons",
    },
    lit: {
      quality: "Soft museum spots igniting enamel depth; Kyoto window light on desk pieces",
      temperature: "cool-toned",
      shadow: "Wire shadows under high glaze; enamel cell gradients mimic depth shadow",
    },
    ui: {
      background: "Deep lapis enamel gradient",
      surface: "Glassy enamel with gold wire cell-lines",
      components: "Roundel icons, wire-frame dividers, award-rosette badges",
      motion: "Enamel cells flood with colour; wires glint on scroll",
    },
  },
  {
    slug: "wajima-lacquer",
    ctx: "Wajima on the Noto Peninsula built Japan's most durable lacquerware by bulking its undercoats with jinoko and iwako — diatomite-rich local clays mixed into the urushi lacquer — over cherry-birch and cypress bodies. Merchant ships of the kitamaebune coastal trade carried Wajima-nuri nationwide from the Edo period, and the town's workshops specialised in chinkin engraving filled with gold and in maki-e powder dusting; the craft was designated an Important Intangible Cultural Property in 1977.",
    vd: {
      shape: "Round trays, stacking boxes and soup bowls with generous walls; chinkin landscape roundels on lids",
      line: "Chinkin burin cuts — fine hatched shadow lines filled with gold leaf and dust",
      composition: "Off-centre landscape medallions on glossy black grounds; plain rims framing the field",
      texture: "Glass-hard urushi black-brown over jinoko clay bulk; satin interiors with gold powder bloom",
    },
    typ: {
      display: "Chinkin-engraved inscription panels on box lids",
      body: "Wooden gift-box labels in brushed kanji naming contents and workshop",
      notes: "Kakihan artist seals lacquered beside the maker's line",
    },
    lit: {
      quality: "Noto harbour daylight; tea-room candle warmth on wet-look lacquer",
      temperature: "warm-toned",
      shadow: "Lacquer depth reads as shadow; gold powder catches single-source glints",
    },
    ui: {
      background: "Urushi black-brown with jinoko grain",
      surface: "Deep-gloss lacquer with satin panels",
      components: "Lid-lift modals, gold-dust progress fills, kakihan seal badges",
      motion: "Gold dust drifts into engraved lines; lids slide open with weight",
    },
  },
  {
    slug: "ise-katagami-patterns",
    ctx: "Katagami stencils for katazome paste-resist dyeing were produced in the Shiroko district of Suzuka, Ise Province, by carving families who sold nationwide to kimono dyers. Patterns are cut into mulberry paper laminated with kakishibu persimmon juice — sometimes with hair-fine silk-tie bridges — using drill, push-knife, pull-knife and punch techniques; Japan designated the craft an Important Intangible Cultural Property in 1973, and stencil archives now anchor textile study worldwide.",
    vd: {
      shape: "Rectangular tea-brown paper stencils and fan shapes; multi-panel repeat squares with registration crosses",
      line: "Kiribori drill-pin dots building tone; tsukibori push-knife curves and hair-fine silk ties",
      composition: "Seamless repeat units — asanoha stars, seigaiha waves, mist bands — tiling edge to edge",
      texture: "Kakishibu-laminated washi, translucent with age, showing blade sheen along the cuts",
    },
    typ: {
      display: "Stencil patterns abstracted from calligraphic characters and family crests",
      body: "Hinagata pattern-book captions in Edo-period kana block printing",
      notes: "Suzuka archive numbering systems on stencil drawer fronts",
    },
    lit: {
      quality: "Shaded dye-house light protecting the paste; north light for carving benches",
      temperature: "neutral-toned",
      shadow: "Stencils cast crisp pattern shadow on paste-coated cloth under the drying sun",
    },
    ui: {
      background: "Kakishibu tea-brown wash",
      surface: "Laminated washi with blade-sheen lines",
      components: "Repeat-tile previews, drill-dot textures, archive-drawer tabs",
      motion: "Tiles snap into seamless repeat; paste bleeds reveal the motif",
    },
  },
  {
    slug: "bingata-resist-dyeing",
    ctx: "Bingata was the court textile of the Ryukyu Kingdom: Shuri workshops near Chūgōkōji lane dyed vivid stencil-and-freehand patterns — maple, plum, phoenix — for royalty and gentry, with motif and colour graded by rank. After Japan annexed the kingdom in 1879 the guild arts withered, but Shiroma Senshin revived bingata in the twentieth century and was named a Living National Treasure in 1972; Okinawan workshops still steep the cloth in ryūkyū indigo and imported pigments.",
    vd: {
      shape: "Kimono-length panels with large repeated motifs — maple leaves, plum branches, phoenix and stream bands",
      line: "Stencil-resist outlines thickened with tsutsugaki paste ridges; rank-graded border bars",
      composition: "Diagonal scatter of motifs across body panels; mirrored sleeves and a reserved collar ground",
      texture: "Deep matte dye on hand-loomed cotton and bashofu; indigo migration halos at the resist edges",
    },
    typ: {
      display: "Chūgōkōji workshop seals stamped near the cloth ends",
      body: "Shuri court records in kanji-kana documenting pattern rights",
      notes: "Shiroma atelier pattern registers listing motif and wearer rank",
    },
    lit: {
      quality: "Okinawan subtropical glare brightening the dye vats; shade-house drying light",
      temperature: "warm-toned",
      shadow: "Paste ridges raise hard little shadows; indigo depth pools in the folds",
    },
    ui: {
      background: "Ryukyu indigo with hibiscus red accents",
      surface: "Matte dyed cotton with resist halos",
      components: "Leaf-scatter cards, rank-bar badges, paste-line dividers",
      motion: "Dye blooms past the resist edges; motifs drift like current",
    },
  },
  {
    slug: "chinese-shadow-puppets",
    ctx: "Shadow theatre (piyingxi) appears in Han-dynasty legend about Emperor Wu and Lady Li and is documented as urban entertainment in Song-dynasty Kaifeng and Hangzhou. Regional schools — Shaanxi's cowhide figures, Hebei's donkey-hide lüpi, Shanxi's Xiaoyi troupes — carve translucent jointed puppets in eleven or more pieces, painted and oiled, playing hand-copied yulu scripts from Journey to the West and Investiture of the Gods; UNESCO inscribed Chinese shadow puppetry in 2011.",
    vd: {
      shape: "Jointed translucent hide figures — general profiles, monkey king, demon masks with detachable arms",
      line: "Knife-carved openwork lattice: scale armour, cloud scrolls and face-profile hairlines",
      composition: "Half-body silhouettes keyed to screen height, ranked by hat and robe type; armies in layered files",
      texture: "Oiled cow or donkey hide, glossy and translucent; vermilion, jade green and magenta pigment pops",
    },
    typ: {
      display: "Troupe banners with brush-written opera titles",
      body: "Hand-copied yulu scripts with performer margin notes",
      notes: "Regional school labels (Shaanxi, Tangshan, Xiaoyi) in catalogue apparatus",
    },
    lit: {
      quality: "One bright white lamp behind a cotton screen; gong-and-pipa night",
      temperature: "warm-toned",
      shadow: "All drama lives in shadow; pigment glows only when the backlight warms it",
    },
    ui: {
      background: "Warm parchment screen glow",
      surface: "Oiled hide translucency with carved lattice",
      components: "Jointed-figure icons, scroll-speed scrubber, troupe banner tabs",
      motion: "Puppets swing on virtual rods; lamp flicker cues scene beats",
    },
  },
  {
    slug: "zigong-lantern-festival-craft",
    ctx: "Zigong, the salt city of Sichuan, formalised its lantern fair in 1964 on the back of a Qing-era temple-lantern habit of its salt merchants, and the festival now fills Zigong's lantern park with silk-skinned, steel-framed giants — dragons, pagodas and dinosaurs nodding to the city's famous fossil beds. Zigong companies ship the majority of Chinese lantern installations abroad, sending frame-benders, silk-stretchers and electricians to run seasonal shows worldwide.",
    vd: {
      shape: "Architectural-scale lantern sculptures — dragons spanning lakes, pagoda towers, dinosaur herds in steel",
      line: "Wire-frame silhouettes skinned with stretched silk; ribbed dragon bellies and arced bridge spans",
      composition: "Narrative routes through lantern parks: gates framing vistas, water reflections doubling the forms",
      texture: "Satin silk over glowing internals; sequined scales, glass-bead curtains and LED filament lace",
    },
    typ: {
      display: "Neon-arc Chinese lantern titles with couplet plaques (duilian)",
      body: "Festival wayfinding in bold CJK sans with English subtitles",
      notes: "Export crew plaques crediting frame-bending and silk-stretching teams",
    },
    lit: {
      quality: "Internal LED and lamp glow after dusk — the objects are the light source",
      temperature: "warm-toned",
      shadow: "Silk walls glow while frames stay dark; lake water shatters the shadow",
    },
    ui: {
      background: "Night-park black with lantern bloom",
      surface: "Silk lantern glow with a wire-frame hint",
      components: "Glow-scale cards, couplet headers, route-map dots",
      motion: "Lanterns breathe and pulse; dusk-to-night transitions between sections",
    },
  },
  {
    slug: "she-inkstone-tradition",
    ctx: "She inkstones, cut from the dark slate of Dragon Tail Mountain quarries in old Shezhou (now She County, Anhui, and Wuyuan), rank among China's Four Famous Inkstones. Southern Tang ruler Li Yu rated them alongside Duan stone, and Song officials took them as tribute. Connoisseurs prize gold-star flecks, 'eyebrow' markings and fine spiral-whorl veining, and Huizhou carvers shape the stone with dragon reliefs and moon-well pools, the quarry craft revived in the 1960s workshops.",
    vd: {
      shape: "Palm-size dark slate slabs with carved ink pools (moon wells) and dragon relief shoulders",
      line: "Natural 'gold star' flecks and eyebrow veining left proud of chisel-smooth fields",
      composition: "Ink pool off-centre on the upper face, reservoir slope below, collector inscriptions on the rim",
      texture: "Greasy-fine black-green slate — cold, dense, faintly glittering with mica stars",
    },
    typ: {
      display: "Seal-script carved inscriptions naming quarry and connoisseur",
      body: "Literati colophons in running script across stone backs and catalogue pages",
      notes: "Vermilion collector seals pressed beside Song-era attributions",
    },
    lit: {
      quality: "Scholar's studio north light; grinding water mirror-bright on stone",
      temperature: "cool-toned",
      shadow: "Carved relief pools soft shadow; wet stone deepens to black glass",
    },
    ui: {
      background: "Slate black-green with mica star scatter",
      surface: "Polished stone with chisel-matte fields",
      components: "Ink-pool loaders, star-fleck badges, colophon cards",
      motion: "Water sheen spreads across the stone; gold stars glint on hover",
    },
  },
  {
    slug: "deccani-painting",
    ctx: "The Deccan sultanates of Ahmadnagar, Bijapur and Golconda bred a painting idiom distinct from Mughal naturalism: dreamlike palette, elongated figures, gold-drenched skies. Landmarks include the Ahmadnagar Nujum al-'Ulum manuscript of the 1570s and portraits of Ibrahim Adil Shah II (r. 1580-1627) in his yellow robe; Persian émigrés such as Farrukh Beg moved between these courts, and Portuguese imports through Goa fed the European echoes in Golconda's ragamala series.",
    vd: {
      shape: "Single-figure portraits and ragamala scenes on rectangular folios with gold cloud-band borders",
      line: "Fine nasta'liq inscriptions flowing in cloud bands; calligraphic hatching on robes",
      composition: "Central figures against flat jewel grounds; gold horizon bands; an asymmetrical sultan gaze",
      texture: "Burnished gold leaf, lapis and vermilion pigment on agate-polished paper",
    },
    typ: {
      display: "Nasta'liq title cartouches in cloud-shaped gold frames",
      body: "Dakhni and Persian manuscript hands on courtly verse",
      notes: "Painter colophons — Farrukh Beg's Bijapur signatures among them",
    },
    lit: {
      quality: "Court candle and oil-lamp glow; gold leaf kindles at every angle",
      temperature: "warm-toned",
      shadow: "Burnished gold flattens shadow; lapis grounds read as night shadow",
    },
    ui: {
      background: "Lapis and gold damascene gradient",
      surface: "Burnished paper with pigment bloom",
      components: "Cloud-band headers, folio-flip carousels, seal medallions",
      motion: "Gold bands gleam with parallax; folios turn with manuscript rhythm",
    },
  },
  {
    slug: "ambalangoda-mask-carving",
    ctx: "Ambalangoda on Sri Lanka's southern coast is the home of mask carving: kaduru-wood masks painted in strident oils for kolam folk comedy, for the sanni yakuma exorcism with its eighteen disease demons, and for raksha dance masks of demons and birds. Workshops such as the Ariyapala and Wijesooriya family ateliers pass carving patterns down the generations, and the town's mask museum and roadside stalls sell the idiom to every tour bus bound for Galle.",
    vd: {
      shape: "Grinning demon masks with domed crowns of cobra hoods, bulging eyes, fangs and curled tongues",
      line: "Deep chisel gouges under paint; raised brow ridges and flame-like hair scrolls",
      composition: "Symmetric demon faces; kolam clown sets in ranked pairs; the eighteen sanni demons as a series",
      texture: "Light kaduru wood under thick oil paint — gloss cracking with use, soot at the ritual edge",
    },
    typ: {
      display: "Sinhala brush lettering on kolam playbills and stall boards",
      body: "Ola-leaf palm-leaf manuscripts of ritual verse in sharp stylus script",
      notes: "Mask-museum labels pairing demon names with their sicknesses",
    },
    lit: {
      quality: "Torch and coconut-oil flame for night sanni rites; bright noon at the tourist stalls",
      temperature: "warm-toned",
      shadow: "Hooded brow shadows deepen the grin; flame light makes the eyes glint",
    },
    ui: {
      background: "Temple crimson with soot black",
      surface: "Gloss oil paint over wood grain",
      components: "Demon-face avatars, series-collector checklists, flame-flicker loaders",
      motion: "Masks bob like dancers; eyes widen on hover",
    },
  },
  {
    slug: "kris-pamor-patterns",
    ctx: "Pamor — the watered pattern of nickel-bearing iron folded and etched into a kris blade — is read by Javanese as both technology and spirit. Master smiths (empu) forge blades of three to nine luk curves, matching pamor types such as beras wutah (scattered rice), udan mas (golden rain) and pedaringan kebak (full granary) to their owner's fortune; blades are ritually cleaned in jamasan ceremonies, and UNESCO proclaimed the Indonesian kris a Masterpiece of Intangible Heritage in 2005.",
    vd: {
      shape: "Asymmetric double-edged blades with 3-9 luk waves, pistol-grip hilts and boat-shaped sheath throats",
      line: "Watered pamor banding — beras wutah scatter, udan mas rain streaks — where etched alloy meets nickel",
      composition: "Pamor reserved as the central ganja strip with edge fades; hilt and sheath carry the crest story",
      texture: "Etched black-and-silver damascene sheen; pamor reads as light playing on water",
    },
    typ: {
      display: "Aksara Jawa smith marks and blade-name carvings near the base",
      body: "Serat manuscript hands describing blade lore and jamasan rites",
      notes: "Empu lineage lists kept in court and village genealogy books",
    },
    lit: {
      quality: "Shaded smithy gloom pierced by forge glow; blades inspected in raking light",
      temperature: "warm-toned",
      shadow: "The damascene pattern shimmers between light and shadow; oil sheen darkens the valleys",
    },
    ui: {
      background: "Forged-iron charcoal with silver ripple",
      surface: "Etched damascene sheen with oil bloom",
      components: "Blade-wave icons, pamor-name badges, jamasan-rite timers",
      motion: "The water pattern flows under the cursor; forging sparks punctuate transitions",
    },
  },
  {
    slug: "hue-imperial-ornament-and-nhat-binh-robes",
    ctx: "The Nguyễn court at Huế codified ornament by rank: the five-clawed dragon belonged to the emperor, and court women's nhật bình robes — flat broad collars embroidered with dragons, phoenixes and the eight treasures (bát bảo) in gilt couched silk — marked ceremonial standing. Tailor bureaus of the Imperial City supplied regalia for anniversaries at The Mieu temple and court audiences; after decades of eclipse the nhật bình returned in Huế festival pageants in the 2010s.",
    vd: {
      shape: "Flat broad-collar nhật bình robe silhouettes; straight cut to the ankle with side slits and gilt frog closures",
      line: "Couched gold-thread dragon and phoenix contours; cloud-scroll bands at collar and hem",
      composition: "Frontal symmetry with rank motifs centred on the chest; bát bảo treasure scatter framing them",
      texture: "Couched metallic thread over dyed silk; padded collar with satin sheen and worn gilt",
    },
    typ: {
      display: "Gilt chư Hán horizontal plaques (hoành phi) over throne halls",
      body: "Chữ Nôm administrative copies of court garment regulations",
      notes: "Embroidered bát bảo badges functioning as wearable heraldry",
    },
    lit: {
      quality: "Incense-hazed throne-hall glow; humid river light on silk folds",
      temperature: "warm-toned",
      shadow: "Gilt thread sparkles against shaded satin; collar shadow frames the face",
    },
    ui: {
      background: "Imperial citadel ivory with gilt edge",
      surface: "Couched gold thread on satin",
      components: "Collar-shaped headers, treasure-scatter icons, rank badges",
      motion: "Gold couching shimmers row by row; robes swish on transition",
    },
  },
  {
    slug: "vietnamese-silk-painting",
    ctx: "Silk painting (lụa vẽ) was recast as fine art at Hanoi's École des Beaux-Arts de l'Indochine, founded in 1924 by Victor Tardieu with the painter Nam Sơn; Nguyễn Phan Chánh turned the medium into a national idiom of brown-washed village scenes, winning notice at the 1931 Paris Colonial Exhibition. Lê Phổ and Mai Trung Thứ carried it abroad; layered ink and gouache washes on woven silk, finished with paper mounting, give the paintings their veiled luminosity.",
    vd: {
      shape: "Soft rectangular compositions — market girls, lotus ponds, village mothers in conical hats",
      line: "Feather-light ink strokes washed under translucent gouache veils; wet edges blooming",
      composition: "Atmospheric depth built by wash layers; figures emerge from mist-brown grounds",
      texture: "Woven silk tooth showing through pigment; mounting-paper back-glow lends haze",
    },
    typ: {
      display: "Red artist seals (ấn) stamped on silk corners",
      body: "École exhibition labels in French and quốc ngữ",
      notes: "1931 Paris Colonial Exhibition catalogue entries in Art Deco type",
    },
    lit: {
      quality: "Diffused tropical light through paper mounting; lamp-warm studio evenings",
      temperature: "warm-toned",
      shadow: "Silk translucency turns shadow into blush; ink settles like suspended shadow",
    },
    ui: {
      background: "Silk ivory with tea-brown mist",
      surface: "Woven silk grain with pigment bloom",
      components: "Seal-stamp badges, wash-fade dividers, folio easels",
      motion: "Washes bloom outward slowly; seals stamp in on completion",
    },
  },
  {
    slug: "xhosa-umbhaco-dress-and-face-paint",
    ctx: "Umbhaco is the Eastern Cape Xhosa ceremonial dress: white cotton garments banded in black — an isikhakha skirt and shoulder wraps enriched with beadwork, buttons and paint — worn with ochre face painting during rites of passage. Married women and initiates of the ulwaluko and intonjane ceremonies dress in it across the former Transkei and Ciskei; preserved through rural homesteads, the idiom has re-entered national visibility through Xhosa-led fashion and heritage pageantry.",
    vd: {
      shape: "Long white isikhakha skirts with black horizontal bands; fitted bodices, shoulder wraps, beaded collars",
      line: "Sharp band boundaries; beaded chevron and triangle runs crossing the white field",
      composition: "Horizontal banding as register; beadwork concentrated at collar, chest and hem like a codex margin",
      texture: "Stiff cotton softened by wear and ochre; bead glass, tin buttons and clay-paint matte",
    },
    typ: {
      display: "Bead-and-button monograms on shoulder wraps",
      body: "isiXhosa hymn and school print from the Lovedale Press tradition",
      notes: "Ceremony records noting the wearer's stage in initiation sequences",
    },
    lit: {
      quality: "Eastern Cape sun hard on white cloth; household lamplight at dressing",
      temperature: "neutral-toned",
      shadow: "Ochre face paint glows against garment shadow; bands stripe shadow on bodies",
    },
    ui: {
      background: "Chalk white with black banding",
      surface: "Matte ochre-stiffened cotton",
      components: "Band-strip dividers, bead-chip toggles, stage badges",
      motion: "Bands scroll like ceremony registers; beadwork stitches in on load",
    },
  },
  {
    slug: "habesha-kemis-tibeb-aesthetic",
    ctx: "The habesha kemis, Ethiopia's white shemma-cotton dress, is defined by tibeb — woven border bands at hem, sleeves and neckline patterned in green, gold and red, widening or narrowing with the occasion. Weavers, many from the Dorze weaving communities that migrated to Addis Ababa, sell through markets like Shiro Meda; the dress dominates Timkat, Meskel, Enkutatash and wedding processions, and tibeb density still signals wealth, region and festivity.",
    vd: {
      shape: "Long white shemma dresses with tibeb border bands at hem, sleeve and collar; netela shawl drapes",
      line: "Tibeb geometry — diamond, zigzag and cross bands in graded colour rows",
      composition: "Border logic: pattern density concentrated at the edges, a white field breathing in the middle",
      texture: "Crisp handwoven cotton strips seamed edge to edge; raised woven tibeb ridges catching light",
    },
    typ: {
      display: "Ge'ez fidel letterforms woven as decorative border rows",
      body: "Amharic wedding and holiday invitation cards in modern type",
      notes: "Market tags from Shiro Meda listing weave origin and weaver",
    },
    lit: {
      quality: "Highland altitude sun whitening the cloth; church candle glow at Timkat",
      temperature: "warm-toned",
      shadow: "Tibeb ridges throw micro shadows; white cloth burns highlight in sun",
    },
    ui: {
      background: "Shemma white with tibeb green-gold frame",
      surface: "Woven cotton with raised band ridges",
      components: "Border-band headers, diamond-weave loaders, holiday badges",
      motion: "Tibeb bands weave in row by row; the shawl drape sways on scroll",
    },
  },
  {
    slug: "zulu-amasunuka-braids",
    ctx: "Amasunzu is the geometrically sculpted Zulu hairstyle — raised lobes, crescents and horn shapes (izimpondo) cut into the hair — worn in the early twentieth century by young men and by women before marriage to signal age-grade and dignity, famously captured in 1920s photographs. Mission-era dress codes eroded it, but the style has been reclaimed since the 2010s by Zulu creatives and hairstylists who read its ridges as ancestral design rather than costume.",
    vd: {
      shape: "Sculpted hair architecture — crescent lobes, horn peaks, stacked quads rising off the scalp",
      line: "Clean parting lines dividing polished sections; razor-cut edges like relief outlines",
      composition: "Symmetric lobes balanced across the crown; height graded by age-grade and occasion",
      texture: "Glossy pomaded black hair with matte shaved channels; bead ornaments clipped at partings",
    },
    typ: {
      display: "Ilanga laseNatal newspaper mastheads anchoring the archive imagery",
      body: "Zulu-language feature columns in mission-set serif types",
      notes: "1920s ethnographic photograph captions with place and sitter names",
    },
    lit: {
      quality: "Studio flash of the 1920s ethnographic portraits; harsh veld sun on hair gloss",
      temperature: "neutral-toned",
      shadow: "Sculpted lobes throw small crisp shadows; pomade highlights read as lighting design",
    },
    ui: {
      background: "Monochrome studio grey with veld warmth",
      surface: "Pomade-gloss panels over a matte base",
      components: "Lobe-shaped icons, style-name chips, era-photograph frames",
      motion: "Hair sections assemble like sculpture; grain-photo fades between eras",
    },
  },
  {
    slug: "agbada-embroidery-economy",
    ctx: "Across Yoruba southwestern Nigeria and Hausa Kano, the agbada — a voluminous three-piece robe — is the currency of male status, and its embroidery economy employs whole lineages of tailors and machinists. Dense hand-guided machine and chain-stitch work radiates from the neck panel over aso-oke or guinea brocade, priced by motif density; chieftaincy investitures, the Ojude Oba festival at Ijebu-Ode and Lagos owambe parties drive seasonal demand, with weavers in Iseyin feeding the trade.",
    vd: {
      shape: "Voluminous gowns with wide-sleeved overlays flowing to mid-calf over tunic and trousers",
      line: "Chain- and satin-stitch embroidery radiating from the neck panel; dense geometric medallions",
      composition: "Embroidery concentrated on the chest yoke and sleeve cuffs; drape folds carrying the rest",
      texture: "Aso-oke slub weave or smooth guinea brocade under raised metallic thread relief",
    },
    typ: {
      display: "Sinuous cursive motifs echoing Arabic talisman scripts on northern robes",
      body: "Owambe event programmes and tailor order slips in Lagos print",
      notes: "Collar-label marks of master tailors stitched inside each robe",
    },
    lit: {
      quality: "Outdoor festival glare and marquee lamp glow; thread glints with each gesture",
      temperature: "warm-toned",
      shadow: "Deep robe folds pool shadow; embroidery reliefs catch hard specular light",
    },
    ui: {
      background: "Indigo aso-oke depth with gold embroidery accents",
      surface: "Raised thread relief on woven slub",
      components: "Neck-panel medallion avatars, stitch-density meters, event badges",
      motion: "Embroidery stitches out progressively; the robe sways on scroll",
    },
  },
  {
    slug: "kowhaiwhai",
    ctx: "Kōwhaiwhai are the painted scroll bands running across the heke rafters and tāhuhu ridgepole of carved meeting houses — spiralling koru and mangōpare hammerhead-shark forms in red, white and black. Traditionally pigmented with red ochre mixed with fish or shark oil and applied by hand, the patterns recount whakapapa and tribal lineage rather than decorative whim; twentieth-century houses such as Te Whare Rūnanga at Waitangi (1940) renewed the canon in modern paints.",
    vd: {
      shape: "Long rafter bands of paired spirals — pitau koru shoots and mangōpare forms — inside border rails",
      line: "Broad red-and-black strokes with notched white highlights along spiral shoulders; rauponga scalloping",
      composition: "Rafter-by-rafter alternation running to the ridgepole; mirrored panels across the house spine",
      texture: "Flat pigment over smooth adzed timber; modern acrylic over older ochre-and-oil grounds",
    },
    typ: {
      display: "House name carvings above the door acting as titles",
      body: "Bilingual whakapapa charts in exhibition print",
      notes: "Pattern-name registers (mangōpare, pitau) in museum handbooks",
    },
    lit: {
      quality: "Smoke-warm interior glow along the rafters; skylight shafts in modern houses",
      temperature: "warm-toned",
      shadow: "Spiral relief casts soft shadow bands overhead; dark timbers swallow the edges",
    },
    ui: {
      background: "Deep kauri brown with red ochre accents",
      surface: "Adzed timber grain under flat paint",
      components: "Rafter-band headers, koru bullets, house-name plaques",
      motion: "Spirals uncurl along the rafter path; ridge glow brightens on section change",
    },
  },
  {
    slug: "malagan-carving",
    ctx: "On New Ireland, Papua New Guinea, malagan carvings are made to be used once: commissioned by clan heirs for mortuary feasts, displayed once, then left to rot or burned once the inherited rights are exercised. North-coast carvers cut tatanua masks, figures and friezes from softwood, painting them lime white, red ochre and soot black with shell and feather additions; German colonial collectors stripped the island in the late nineteenth century, and Picasso kept a malagan head in his Paris studio.",
    vd: {
      shape: "Tall composite figures — birds, fish and human heads stacked and pierced through openwork columns",
      line: "Serpentine openwork bridges linking figures; incised pattern over black-red-white paint fields",
      composition: "Vertical accumulation telling a clan story bottom to top; masks paired as male-female sets",
      texture: "Softwood carved thin, painted lime white, red ochre and soot black; fibre, shell and feather additions",
    },
    typ: {
      display: "Clan-right names (malagan ownership titles) recited as inscriptions",
      body: "German colonial collection labels with field numbers",
      notes: "Nineteenth-century expedition registers documenting purchase sites",
    },
    lit: {
      quality: "Ceremonial firelight and torch glow at night displays; museum case spots today",
      temperature: "warm-toned",
      shadow: "Openwork lets shadow pass through; white lime paint flares in flame light",
    },
    ui: {
      background: "New Ireland night with fire glow",
      surface: "Carved openwork with painted relief",
      components: "Totem-stack cards, ownership-title badges, exhibit-number tags",
      motion: "Figures assemble vertically like display-house racks; shadow play on scroll",
    },
  },
  {
    slug: "wandjina-rock-faces",
    ctx: "Wandjina are the cloud-and-rain beings painted on Kimberley cave walls by the Worrorra, Ngarinyin and Wunambal peoples: mouthless faces ringed in halos, eyes as storm circles, bodies drenched in white ochre with red and yellow accents. Only custodial descendants may repaint them — renewal keeps the country's life force flowing, which is why many images look freshly chalked after millennia. The Mowanjum community near Derby maintains the living connection through its art and culture centre.",
    vd: {
      shape: "Monumental mouthless faces with wide halo rings, eyes as storm circles, shoulders tapering into spirit bodies",
      line: "Thick white outlines re-chalked by custodians; red and yellow ochre accents at halo and body",
      composition: "Figures clustered on shelter walls and ceilings, radiating from water sources",
      texture: "Powdery ochre wash — white, red, yellow — over rough sandstone, older layers beneath",
    },
    typ: {
      display: "The mouthless Wandjina face used as the community-centre emblem",
      body: "Worrorra, Ngarinyin and Wunambal language labels beside English",
      notes: "Permission records governing who may repaint each site",
    },
    lit: {
      quality: "Gorge shade preserving the images; wet-season storm light feels kin to the subject",
      temperature: "cool-toned",
      shadow: "Chalk-white figures glow in overhang shadow; eyes darken before the rains",
    },
    ui: {
      background: "Sandstone overhang grey with ochre glow",
      surface: "Powdery pigment on rock grain",
      components: "Halo-face icons, custodian-permission chips, rain-season timeline",
      motion: "White outlines retrace themselves gently; storm light dims between sections",
    },
  },
  {
    slug: "northwest-coast-bentwood-boxes",
    ctx: "From the Haida, Tlingit and Kwakwaka'wakw coast comes the bentwood box: a single cedar plank kerfed on its long side, steamed until it bends into a watertight rectangle, seamed with spruce root and fitted with a bottom board. Households stored oolichan grease, dried foods and regalia in them, and chiefs commissioned painted formline crests for prestige containers; museum collections from UBC's Museum of Anthropology to the American Museum of Natural History hold canonical examples.",
    vd: {
      shape: "Square-shouldered bentwood chests in graduated sizes, kerfed corners tight as joinery, fitted lids",
      line: "Adzed flat faces framed by crisp corner seams; formline ovoids and U-shapes painted in crest colours",
      composition: "Crest designs wrapping continuously around the faces; storage boxes stacked by size",
      texture: "Red cedar satin with tool sheen; spruce-root stitching and grease-darkened interiors",
    },
    typ: {
      display: "Formline crest emblems serving as house-group identifiers",
      body: "Bilingual museum catalogues in English with Haida and Tlingit terms",
      notes: "Crest-ownership documentation accompanying potlatch regalia",
    },
    lit: {
      quality: "Plankhouse smoke-soft daylight; potlatch firelight on grease-polished wood",
      temperature: "neutral-toned",
      shadow: "Kerfed seams draw hairline shadows; adze dimpling softens the highlights",
    },
    ui: {
      background: "Cedar warm red-brown",
      surface: "Adzed cedar with tool sheen",
      components: "Kerf-line dividers, crest ovoid icons, size-stack previews",
      motion: "Boxes nest inside each other on scroll; crests wrap with a 3D turn",
    },
  },
]
