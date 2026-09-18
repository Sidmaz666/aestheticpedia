/**
 * Patch 14-f — full-depth backfill for 35 existing entries (manifest-14f.json: Subculture Styles + Regional & Cultural Traditions).
 * Task 14-f. Contract: { slug, ctx, vd{shape,line,composition,texture},
 * typ{display,body,notes}, lit{quality,temperature,shadow}, ui{background,surface,components,motion} }.
 * ctx is real cultural context (150-500 chars) with named practitioners, places, dates and social roles;
 * vd/typ/lit/ui are era- and community-specific visual/typographic/lighting/UI translations.
 * Slugs and order follow the manifest exactly. No entries invented, none omitted.
 */
export const PATCHES: any[] = [
  {
    slug: "sweet-lolita",
    ctx: "Sweet Lolita crystallized in 1990s Harajuku around Angelic Pretty and Baby, the Stars Shine Bright, whose dessert-print JSK dresses — Toy Parade, Sugary Carnival — turned Rococo frills into candy pastels. Street-snaps magazines like Kera and the early-2000s egl LiveJournal community spread the rules; members met for tea parties where the doll-like, deliberately modest volume reads as a refusal of adult sexualization rather than childishness.",
    vd: {
      shape: "bell-shaped cupcake skirts, puffed sleeve heads, tiered ruffles, dessert motifs of cakes, strawberries and crowns",
      line: "scalloped lace edges, piped ribbon swirls, sweetly curved heart appliqués and bow outlines",
      composition: "layered tiers centered on a large border print, bow clusters at bust and waist, apron panels",
      texture: "glossy satin, soft chiffon piles, powdered-matte tulle and sugared bead sparkle",
    },
    typ: {
      display: "rounded romaji logotypes like Angelic Pretty's puffy script, ribbon-tied hearts over the i-dots",
      body: "small rounded scripts for care tags; blog-era pixel fonts in community posts",
      notes: "print names lean saccharine — Sugary Carnival, Toy Parade; typography stays bubbly, never sleek",
    },
    lit: {
      quality: "high-key diffused daylight like a patisserie window, no hard edges",
      temperature: "warm-toned",
      shadow: "faint pink bounce rather than cast shadow; shadows hide under lace scallops only",
    },
    ui: {
      background: "whipped-cream gradient from baby pink to cream",
      surface: "glossy candy tiles, frosted glass, soft fleece panels",
      components: "rounded pill buttons with bow glyphs, scalloped cards, sticker-style icons",
      motion: "gentle bounce and springy pops; transitions settle with a little jiggle",
    },
  },
  {
    slug: "traditional-goth",
    ctx: "Born at the Batcave, the weekly night Specimen's Jonny Slut and Ollie Wisdom ran in Soho's Meard Street from 1982, where Bauhaus's 'Bela Lugosi's Dead' (1979) served as scene anthem. Siouxsie Sioux and Robert Smith's backcombed manes, fishnet and Victorian mourning lace gave UK post-punk kids a uniform of glamorous gloom, assembled from Kensington Market stalls, charity-shop lace and DIY black dye.",
    vd: {
      shape: "gaunt silhouettes, bat-wing sleeves, pointed winkle-pickers, teased crowns rising like black thunderheads",
      line: "spidery fishnet grids, tearing lace vines, kohl-drawn high cheekbone contours",
      composition: "one black figure against fog, transparent fabrics layered over opaque bodices",
      texture: "crushed velvet, cobweb lace, hairspray-stiff hair, powder-white face matte",
    },
    typ: {
      display: "blackletter and gothic-revival titling from gig flyers — Sisters of Mercy's templar serifs",
      body: "typewriter-set fanzine columns with high-contrast Xerox texture",
      notes: "lettering leans occult-historical; hand-scrawled band names beat any corporate logo",
    },
    lit: {
      quality: "low colored stage spots cutting through dry ice",
      temperature: "cool-toned",
      shadow: "hard painted shadows — the scene's whole grammar is silhouette against backlight",
    },
    ui: {
      background: "near-black with subtle violet fog gradients",
      surface: "worn leather, matte vinyl, brushed pewter",
      components: "chain-link dividers, coffin-shaped badges, monochrome toggle switches",
      motion: "slow creeping fades like smoke; sudden strobe-flash state changes",
    },
  },
  {
    slug: "ballroom-culture",
    ctx: "Forged in Harlem, ballroom grew from the 1967-68 pageants Crystal LaBeija organized after walking out of a racist drag circuit; her House of LaBeija modeled the chosen-family houses that shelter Black and Latino LGBTQ+ youth. Categories — realness, vogue, legendary status — turned survival into competition, documented for the mainstream by Paris Is Burning (1990) and Willi Ninja's vogue fame.",
    vd: {
      shape: "sculptural silhouettes — voluminous capes, face-framing hair, sharp realness tailoring",
      line: "vogue's angular elbow-and-wrist geometry, clean runway vectors",
      composition: "centered catwalk down an open square (the walk), judges' table as proscenium",
      texture: "sequins in floodlight, glossy latex, crisp taffeta, baby-hair gel sheen",
    },
    typ: {
      display: "show-poster italics and chrome 1980s lettering; category names read like boxing-title belts",
      body: "category scripts — 'Legendary', 'Realness' — in confident extended sans",
      notes: "language announces trophy rank: plaques, trophies and house banners carry heraldic weight",
    },
    lit: {
      quality: "hot follow-spot glare from the judges' table through club haze",
      temperature: "warm-toned",
      shadow: "long thrown shadows down the runway floor; crowd edges fall into darkness",
    },
    ui: {
      background: "midnight club black lit by stage-lamp pools",
      surface: "glossy dance-floor laminate, gold foil accents, velvet-rope texture",
      components: "trophy badges, category drop-caps, readable scorecards, house crests",
      motion: "snapping vogue cuts — pose, hold, throw, at the track's BPM",
    },
  },
  {
    slug: "gothic-lolita",
    ctx: "Coined around Mana, Malice Mizer's costumed guitarist, whose 1999 brand Moi-même-Moitié packaged 'Elegant Gothic Lolita' in black crosses, coffins and cathedral lace. It fused Victorian mourning dress with visual-kei stagecraft, spreading through Kera magazine and the Harajuku bridge crowd; Moi-même-Moitié's cross prints and Baby, the Stars Shine Bright's dark line built the wardrobe.",
    vd: {
      shape: "cathedral arches in lace panels, coffin-point bodices, bell sleeves ending in ruffles",
      line: "fine rococo scrollwork, chain-and-cross borders, strict black piping",
      composition: "monochrome black-and-white figure centered like a mourning portrait, cameo focal points",
      texture: "glazed velvet, guipure lace, cold silver findings, matte crepe",
    },
    typ: {
      display: "blackletter logotype and cathedral-spire serifs; Moi-même-Moitié's engraved gothic caps",
      body: "elegant old-style serifs for essays on lace care and etiquette",
      notes: "typography stays restrained and funerary — engraved invitation, never horror poster",
    },
    lit: {
      quality: "moonlight through stained glass: colored, subdued and even",
      temperature: "cool-toned",
      shadow: "soft violet-gray shadows pooling in fabric folds",
    },
    ui: {
      background: "ivory vellum under black iron scroll frames",
      surface: "polished ebony panels, cold gilt filigree, worn leather book spines",
      components: "medallion buttons, cross-hatched rules, cameo avatars, ribbon-wrapped toggles",
      motion: "slow ceremonial fades; a candle-flame flicker on loading states",
    },
  },
  {
    slug: "mod-subculture",
    ctx: "London's working-class modernists — 'clean living under difficult circumstances,' in scene promoter Peter Meaden's phrase — bought Italian mohair suits on the never-never, wore US Army fishtail parkas over them, and rode chromed Vespa and Lambretta scooters to all-nighters at the Scene in Ham Yard and Manchester's Twisted Wheel. The Who's Quadrophenia and Brighton's 1964 bank-holiday battles with rockers fixed the image forever.",
    vd: {
      shape: "lean tailored jackets, three-button lapels, parka fishtails, round scooter mirrors and lamp housings",
      line: "pinstripes, checked mohair weaves, razor trouser creases, chevron engine chrome",
      composition: "head-to-toe vertical trimness; scooter chrome framed against tonal brick",
      texture: "smooth mohair, patent leather shoes, quilted parka lining, chromed lamp grille",
    },
    typ: {
      display: "target-bullseye motifs with condensed grotesk caps — The Who's 1965 target logo",
      body: "tight newspaper-agate listing type for club all-nighter bills",
      notes: "lettering is mod-utility: record-sleeve sans, R&B import label stickers, chevron flags",
    },
    lit: {
      quality: "crisp overcast London daylight and hot club downlights",
      temperature: "neutral-toned",
      shadow: "sharp midday shadows echoing clean tailoring lines; stage spots isolate the dancer",
    },
    ui: {
      background: "pale dove gray with red-white-blue target accents",
      surface: "brushed chrome, glossy scooter paint, smooth mohair weave",
      components: "bullseye progress rings, ticket-stub buttons, chevron dividers",
      motion: "quick wheel-spin transitions; Vespa-indicator blink state changes",
    },
  },
  {
    slug: "ganguro",
    ctx: "Peaking in Shibuya around 1999-2000, ganguro (roughly 'black face') were gyaru who torched the old pale-skin beauty ideal: deep salon tans, orange or silver-bleached hair, white eye concealer and lipstick, day-glo minis and platform boots. Egg magazine street snaps and Shibuya 109 shops like Alba Rosa defined the look; its extreme manba offshoot added paint-white eye patches and decals.",
    vd: {
      shape: "deep bronze tan fields, big whitened eye blotches, orange hair clouds, chunky platform wedges",
      line: "thick dolly lower lashes, hard hibiscus-print borders, chunky zipper outlines",
      composition: "the face as canvas — dark skin base, white accent islands, neon print blocks",
      texture: "glossy bronzer sheen, frosted lip gloss, plastic jelly sandals, sun-bleached chiffon",
    },
    typ: {
      display: "puffy outlined gyaru logotypes with glitter — EGG magazine's rhinestone masthead style",
      body: "loose handwritten gyaru-moji character play in flip-phone texts",
      notes: "lettering is loud and stickered — rhinestone initials, gal slang, distorted romaji",
    },
    lit: {
      quality: "flat high-noon beach light; no shadow allowed on the face",
      temperature: "warm-toned",
      shadow: "deliberately erased — under-eye white paint cancels every natural shadow",
    },
    ui: {
      background: "hot coral-orange gradient into sand tan",
      surface: "glossy jelly vinyl, glitter gel surfaces, tanning-oil sheen panels",
      components: "rhinestone buttons, sticker-sheet icons, flip-phone keypad grids",
      motion: "sunny flip-phone transitions — quick shutter snaps and bouncy slide-ins",
    },
  },
  {
    slug: "classic-lolita",
    ctx: "The mature register of Lolita, shaped from the late 1990s by brands Victorian Maiden and Mary Magdalene and by Juliette et Justine's Rococo prints: muted burgundy, navy and ivory, jabot collars and tea-length hems drawn from 1950s tailoring more than fairytale frills. Worn with discreet pearls, it dominates adult community tea parties in Tokyo, Paris and São Paulo alike.",
    vd: {
      shape: "A-line tea-length skirts, fitted bodices, jabot collars, small bows instead of Sweet frill mountains",
      line: "tucked pleats, delicate pintucks, quiet floral vine borders",
      composition: "balanced vertical paneling, border print confined to the hem, single cameo focal point",
      texture: "woven jacquard, fine corded lace, matte cotton poplin, napped velvet ribbons",
    },
    typ: {
      display: "engraved Victorian book-cover serif with small ornamental swashes",
      body: "old-style garalde text faces for coord diaries and essays",
      notes: "typography is library-quiet: deckle-edge letterpaper, wax-seal monograms",
    },
    lit: {
      quality: "soft north-window daylight, even and unhurried",
      temperature: "neutral-toned",
      shadow: "gentle gray-green shadow in folds; nothing harsher than overcast",
    },
    ui: {
      background: "warm ivory paper with faint tea-stain vignettes",
      surface: "linen weave, aged brass, matte porcelain",
      components: "bookplate cards, slim serif menus, lace-bordered panels",
      motion: "measured curtain-like fades; nothing bounces, everything settles",
    },
  },
  {
    slug: "hime-gyaru",
    ctx: "'Princess gyaru' bloomed in late-2000s Shibuya around the shop Jesus Diamante: champagne pinks and ivory, tiaras, fur stoles and enormous teased chignons with pulled-out face curls, permed, lacquered and maintained at real salon cost. It stretched gyaru's rebellion into hyper-luxury — a princess fantasy financed by part-time jobs and chronicled in Egg and PopTeen.",
    vd: {
      shape: "high bouffant chignons with long face-framing tendrils, tiara crowns, puff-sleeved princess dresses",
      line: "curling rose-print borders, swooping rhinestone scrolls, curved princess seams",
      composition: "ornament concentrated at head and hem — crown above, lace train below",
      texture: "satin moiré, ostrich-feather fluff, rhinestone sparkle, glossy permed ringlets",
    },
    typ: {
      display: "script logotype with flourishes and diamond glyphs — Jesus Diamante's crowned lettering",
      body: "soft italic captions in bling magazine layouts",
      notes: "lettering sparkles: tiara-topped initials, rose-crested monograms",
    },
    lit: {
      quality: "salon-mirror glow — bright, warm, flattering ring light",
      temperature: "warm-toned",
      shadow: "diffused pink shadow; highlights bloom on tiaras and ringlets",
    },
    ui: {
      background: "blush-to-champagne shimmer gradient",
      surface: "pearlized satin, faux-fur trim, faceted rhinestone tiles",
      components: "crown badges, rose-petal buttons, lace-framed profile cards",
      motion: "soft sparkle twinkles and curtsey-like ease-out drops",
    },
  },
  {
    slug: "ouji-style",
    ctx: "Ouji — 'prince style' — is Lolita's masculine counterpart, worn largely by gender-nonconforming Japanese youth at the same community tea parties: breeches, jabots, tailcoats, riding boots and tricorn hints drawn from Victorian and Regency boy aristocrats. Alice and the Pirates (Baby, the Stars Shine Bright's offshoot) and Atelier Boz built whole lines around it; wearers share photos as 'prince coords'.",
    vd: {
      shape: "cropped tailcoats, knickerbocker breeches, jabot cravats, tall boots, small-brimmed top hats",
      line: "military braid, piped lapel edges, chain swags, crisp double-stitching",
      composition: "symmetric court-portrait framing; high collar anchors, vertical button rows",
      texture: "velveteen, grosgrain ribbon, polished boot leather, antique brass buttons",
    },
    typ: {
      display: "engraved aristocratic serif caps with fleuron ornaments",
      body: "period-appropriate small serifs; Latin tags and court dates in italics",
      notes: "lettering borrows from 19th-century calling cards — wax seals, deckled edges",
    },
    lit: {
      quality: "candlelit ballroom glow, amber and concentrated",
      temperature: "warm-toned",
      shadow: "deep Rembrandt shadows behind collar and hat brim",
    },
    ui: {
      background: "deep forest or burgundy field with gilt pinstripe",
      surface: "tufted velvet, antique brass, mahogany grain",
      components: "wax-seal buttons, ribbon-and-medal progress markers, crest medallions",
      motion: "stately slide-and-bow transitions; flags unfurl slowly",
    },
  },
  {
    slug: "german-expressionism",
    ctx: "Weimar cinema's visual revolution: Decla's Das Cabinet des Dr. Caligari (1920) had designers Hermann Warm, Walter Reimann and Walter Röhrig paint canvas sets into jagged nightmare geometry — 'films must be drawings brought to life.' UFA's Nosferatu (Murnau, 1922) and Metropolis (Lang, 1927) carried painted shadows and machine-gothic into the world vocabulary of horror and film noir.",
    vd: {
      shape: "slanted chimneys, knife-sharp alley wedges, spiral shadows, chairs tilted like expressionist crescents",
      line: "distorted diagonals and forced perspective drawn flat onto canvas flats",
      composition: "sets as psychological diagram — every angle channels dread toward the actor",
      texture: "flat paint, stenciled light bolts, heavily kohl-eyed faces, glossy title cards",
    },
    typ: {
      display: "hand-lettered expressionist intertitles — jagged calligraphic card type as in Caligari",
      body: "fraktur-adjacent intertitle faces with irregular rhythm",
      notes: "typography is part of the set design: letters warp with the walls",
    },
    lit: {
      quality: "artificial painted light — shafts and spirals rendered as scenery, then hard real spots",
      temperature: "cool-toned",
      shadow: "the protagonist: spidery black shapes, often painted rather than cast",
    },
    ui: {
      background: "charcoal night with sickly green-cyan washes",
      surface: "painted canvas flats, raw plaster, forged-iron silhouette",
      components: "tilted off-axis cards, jagged dividers, eye-shaped focus markers",
      motion: "whip-tilt transitions, iris wipes, sudden stop-motion jerks",
    },
  },
  {
    slug: "giallo",
    ctx: "Named for Mondadori's yellow-spined crime paperbacks (Il Giallo Mondadori, running since 1929), the Italian thriller flowered in Mario Bava's Blood and Black Lace (1964) and Dario Argento's The Bird with the Crystal Plumage (1970) through Deep Red (1975): baroque murder set-pieces, black-gloved killers and Ennio Morricone's needling jazz, staged in saturated primary gel light.",
    vd: {
      shape: "razor-blade close-ups, flashbulb-lit mannequins, corridors drowned in primary red-blue gel",
      line: "black leather glove silhouettes, sharp venetian-blind slashes, jump-cut match strokes",
      composition: "body-centered fetishistic inserts — eyes, gloved hands, the murder object enlarged",
      texture: "glossy blood-red paint, smeared glass, grainy Technicolor-era film stock",
    },
    typ: {
      display: "bold drop-shadow poster serifs and slashed Italian title lettering",
      body: "inset typewriter case notes for the police-procedural beats",
      notes: "titles lean lurid; the wild foreign-market retitles are part of the canon",
    },
    lit: {
      quality: "theatrical gel saturation — crimson and cyan pools over everything",
      temperature: "warm-toned",
      shadow: "colored shadows from mixed gels; the killer revealed as doorway silhouette",
    },
    ui: {
      background: "deep crimson vignette with cyan highlights",
      surface: "wet asphalt gloss, venetian-blind slats, mannequin resin",
      components: "dossier cards, alarm-red alert badges, evidence-tag lists",
      motion: "flashbulb white-out transitions; sudden zoom-thrusts on tap",
    },
  },
  {
    slug: "insular-manuscript-illumination",
    ctx: "Produced in Irish and Northumbrian monasteries between the 7th and 9th centuries — the Lindisfarne Gospels written by Eadfrith around 700, the Book of Kells raised at Iona and Kells around 800 — Insular illumination fused Celtic metalwork motifs (spirals, trumpet patterns, interlace) with the Gospel book as devotional showpiece, its carpet pages and Chi Rho monograms painted in orpiment, indigo and lead white.",
    vd: {
      shape: "carpet pages as dense knotwork rectangles; Chi Rho monograms blooming into spiral-filled orbs",
      line: "endless ribbon interlace, doubled trumpet-spiral terminals, zoomorphic heads snapping cords",
      composition: "fearful symmetry — every panel mirrored; text hemmed by braided frame bands",
      texture: "oak-gall ink on vellum nap, raised orpiment yellow, cinnabar red, weathered gold leaf",
    },
    typ: {
      display: "Insular half-uncial majuscules with swelled pen-ends and red-dot triangulation",
      body: "minuscule gloss script set between tightly ruled lines",
      notes: "initial letters detonate into zoomorphs; Kells marginalia hides cats, otters and moths",
    },
    lit: {
      quality: "north-lit scriptorium daylight, cool and steady for fine line work",
      temperature: "cool-toned",
      shadow: "minimal; gold and orpiment carry their own glow against vellum cream",
    },
    ui: {
      background: "aged vellum cream with foxing flecks",
      surface: "calfskin parchment, gold-leaf foil, raised gesso islands",
      components: "knotwork borders, drop-cap medallions, marginal-beast Easter eggs",
      motion: "ink draws itself along cord paths on load; slow gold shimmer",
    },
  },
  {
    slug: "azulejo",
    ctx: "Portugal took the Moorish az-zulayj — polished tile — and made it a national medium: Seville-trained craftsmen set the pattern in the 16th century, Dutch Delft painters brought blue-and-white in the 17th, and after the 1755 Lisbon earthquake tile-clad façades rebuilt the city cheaply and fast. Jorge Colaço's 1905-16 panels at Porto's São Bento station and the Capela das Almas keep the walls speaking history.",
    vd: {
      shape: "square tile fields, diamond-and-star pattern units (azulejos de padrão), long figurative narrative panels",
      line: "cobalt outlines over tin-glaze white, arabesque borders, grout-true geometry",
      composition: "walls woven like textile — repeating units assembling into panoramic scenes",
      texture: "glassy tin-glaze sheen, crackle hairlines, chip-worn corners on stair risers",
    },
    typ: {
      display: "tile-mosaic sign lettering — cobalt shop names set letter-by-letter into façades",
      body: "brushed serif captions inside commemorative tile panels",
      notes: "Portuguese street signage is literally typographic tilework; letterforms fit the grid",
    },
    lit: {
      quality: "Atlantic daylight bouncing off glaze; interiors angled to catch the sheen",
      temperature: "neutral-toned",
      shadow: "soft, broken by glaze highlights rather than cast deep",
    },
    ui: {
      background: "cobalt-on-white tile grid backdrop",
      surface: "glazed ceramic, limestone, hand-thrown edge irregularities",
      components: "pattern-tile icon squares, narrative panel banners, corner medallions",
      motion: "sliding tile reveals; patterns assemble one tile at a time",
    },
  },
  {
    slug: "ofrenda-de-dia-de-muertos",
    ctx: "The Día de Muertos altar merges Mexica Miccailhuitl offerings with All Saints and All Souls days: families build two- or three-tiered altars on November 1-2, laying cempasúchil marigold paths, papel picado, pan de muerto, sugar skulls, copal smoke and photographs to guide souls home. UNESCO inscribed the indigenous festivity in 2008; Janitzio, Pátzcuaro and Mixquic draw pilgrims nightly.",
    vd: {
      shape: "stepped tier arches, papel picado banners cut with skulls and suns, marigold-bloom arches",
      line: "paper-cut filigree outlines, embroidered altar-cloth borders, candle-row verticals",
      composition: "vertical stacking — portrait of the honored dead at top, food and salt at base, candles framing",
      texture: "velvety cempasúchil petals, crinkled tissue paper, sugar-crusted calaveras, copal resin smoke",
    },
    typ: {
      display: "Posada-style lettered calavera banners and rhyming tombstone headings",
      body: "hand-lettered name cards for the deceased beside their portraits",
      notes: "literary calaveras — satirical epitaph verses — are a written genre of the season",
    },
    lit: {
      quality: "candle-flame constellations in dark rooms; warm points rather than wash",
      temperature: "warm-toned",
      shadow: "deep but friendly — darkness holds the candle islands, purple papel picado accents",
    },
    ui: {
      background: "midnight purple vignette with marigold-orange glow points",
      surface: "petal confetti, cut-paper lace, sugar frosting grain",
      components: "photo-frame remembrance cards, candle progress dots, flower-path buttons",
      motion: "petals drift and settle; candle flames flicker on hover",
    },
  },
  {
    slug: "kawaii-stationery-culture",
    ctx: "Grown out of 1970s cute handwriting (kawaii moji) and industrialized by Sanrio — Yuko Shimizu's Hello Kitty debuted in 1974 — Japan's stationery culture turned letter sets, sticker sacks and B5 notebooks into social currency among schoolgirls. San-X's Rilakkuma (2003) and Kamoi's mt washi tape carried the style from Shibuya stationers to global scrapbooking and journaling.",
    vd: {
      shape: "plump rounded animal blobs, marshmallow food shapes, chubby hands with no joints",
      line: "soft unbroken outlines, blushing cheek arcs, dotted contour notes",
      composition: "families of characters grouped in friezes; generous margins reserved for doodles",
      texture: "fuzzy flocking, glossy resin stickers, pastel gel-pen shimmer",
    },
    typ: {
      display: "rounded kawaii logotype with bubble terminals — Sanrio letterforms double as characters",
      body: "maru gothic faces with a hand-drawn wobble in the stems",
      notes: "letter-pads invite writing inside speech bubbles; error margins are doodle zones",
    },
    lit: {
      quality: "shadowless photo-booth brightness, pastel even light",
      temperature: "warm-toned",
      shadow: "barely-there drop shadows rendered in peach tint",
    },
    ui: {
      background: "milky pastel gradient — mint, cream, sakura",
      surface: "soft-touch plastic, washi texture, squishy silicone",
      components: "sticker toggles, character mascots as loaders, speech-bubble tooltips",
      motion: "springy squash-and-stretch; mascots blink and wave when idle",
    },
  },
  {
    slug: "sukhothai-walking-buddha",
    ctx: "Under the kings of Sukhothai (1238-1438) and infused by Sinhalese Theravada teaching, Thai bronze casters achieved the Walking Buddha — serene, mid-stride — as at Wat Sa Si's famous Phra Leela image. Royal workshops casting bronze and stucco over brick cores gave the Buddha long fluid limbs, a flame-tipped finial and drawn-bow brows: an icon of grace (leela) unique in Buddhist art.",
    vd: {
      shape: "walking figure with swinging hip, elongated arms, flame-shaped finial, lotus-bud crown",
      line: "smooth continuous bronze contour, arched brows like drawn bows, snail-shell curls",
      composition: "weight shifted in a gentle S-curve, one hand raised in the abhaya teaching gesture",
      texture: "warm dark bronze patina, cast stucco over brick cores, gilt traces in crevices",
    },
    typ: {
      display: "inscribed dedications in the round Sukhothai script standardized by the Ram Khamhaeng inscription",
      body: "liturgical manuscripts in khom and tham scripts for temple use",
      notes: "the 13th-century Sukhothai inscription stone is treated as the founding document of Thai writing",
    },
    lit: {
      quality: "golden-hour candle and oil-lamp glow on temple bronze",
      temperature: "warm-toned",
      shadow: "soft amber shadows slide across the figure's curve as flames flicker",
    },
    ui: {
      background: "dusk-gold gradient behind sandstone gray",
      surface: "laterite brick, polished bronze, lotus-bud stucco",
      components: "lotus-petal panels, halo rings, gentle stepping progress indicators",
      motion: "slow meditative fades; a halo ring rotates almost imperceptibly",
    },
  },
  {
    slug: "non-la-conical-hat-regional-variants",
    ctx: "Vietnam's nón lá varies by province: Chuông village near Hanoi has woven palm-leaf hats for centuries; Huế's nón bài thơ sandwiches a poem between leaf layers so the verses appear only against the light; the North's nón quai thao adds a flat brim and two carrying straps. Bamboo ribs under palm leaves, stitched with fishing line and pineapple-fiber thread, serve farmers and boatwomen alike.",
    vd: {
      shape: "perfect shallow cones, wide-brimmed quai thao discs, tiered stitch spirals running to the apex",
      line: "radial bamboo rib spokes, concentric fishing-line stitching, fine leaf-vein grain",
      composition: "poem verses hidden between layers, legible only backlit; chin-strap diagonals",
      texture: "translucent palm leaf, bamboo sheen, oiled softness, sweat-darkened working patina",
    },
    typ: {
      display: "embroidered or inked village marks and poem verses inside the hat crown",
      body: "practical labels: maker stamps, market chalk codes",
      notes: "the poem hat's hidden typography is the signature — text as secret structure",
    },
    lit: {
      quality: "tropical hard sun overhead, filtered by leaf translucency",
      temperature: "warm-toned",
      shadow: "the hat itself casts the landscape's essential circle of shade",
    },
    ui: {
      background: "paddy-green to straw-gold gradient",
      surface: "woven palm texture, bamboo rib rails, lacquered band",
      components: "conical progress spinners, radial menu spokes, leaf-textured cards",
      motion: "radial sweep from apex outward; gentle sway like a hat on its hook",
    },
  },
  {
    slug: "ndebele-geometric-painting",
    ctx: "Ndzundza Ndebele women of Mpumalanga began painting bold geometric murals on homestead walls after their 1883 defeat scattered the nation — an asserted identity in paint, later in acrylic on whitewashed plaster. Esther Mahlangu carried the style worldwide, painting a BMW 525i Art Car in 1991 and a 7 Series in 2016, and her school in Mabhoko trains the next generation of women artists.",
    vd: {
      shape: "stepped chevrons, house-blanket diamonds, zigzag staircases, corner chevron guards",
      line: "confident freehand black outlines holding flat color fields in check",
      composition: "whole façade as canvas — gables, doorframes and window edges all patterned",
      texture: "chalky whitewash base, matte acrylic, cracked earthen wall ground beneath",
    },
    typ: {
      display: "geometrized house-name lettering and beadwork-inspired numerals",
      body: "simple painted caps for dates and family names beside doorways",
      notes: "letters obey the same grid logic as the motifs — no curves outside pattern context",
    },
    lit: {
      quality: "highveld sun, hard and clear, flattening color to pure signal",
      temperature: "warm-toned",
      shadow: "strong architectural shadows offset the flat painted pattern",
    },
    ui: {
      background: "whitewash white with black geometric frame rails",
      surface: "plaster, painted wood, bead-strung trims",
      components: "chevron dividers, diamond checkboxes, pattern-tiled section headers",
      motion: "stepped staccato reveals; patterns paint themselves in bands",
    },
  },
  {
    slug: "haida-formline-art",
    ctx: "On Haida Gwaii, the formline system — ovoids, U-shapes and split-U contours flowing across carved cedar and argillite — reached its classical peak with Charles Edenshaw (c. 1839-1920). After the potlatch ban (1885-1951), Bill Reid's Raven and the First Men (1980) and Robert Davidson's prints re-energized the tradition; Raven and Eagle crests still organize kin and pole imagery.",
    vd: {
      shape: "ovoid eye sockets, U-form feathers and fins, split-ovoid joints, crest bodies as fitted puzzle fields",
      line: "swelling and tapering formlines in thick, thin and mid-weight black contour conventions",
      composition: "nested silhouettes; every negative space is another creature's profile",
      texture: "carved red-cedar grain, black argillite polish, abalone inlay glint, paint on bare wood",
    },
    typ: {
      display: "crest-name lettering in bold caps shaped by formline contour logic",
      body: "bilingual Haida-English museum label sans",
      notes: "contemporary prints carry Haida orthography — x with a stroke, glottal marks — as living text",
    },
    lit: {
      quality: "raked coastal light; museum spots tuned to cedar's sheen",
      temperature: "cool-toned",
      shadow: "carved relief throws crisp shadow lines along the formline grooves",
    },
    ui: {
      background: "deep sea-slate green-black",
      surface: "carved cedar, argillite black, abalone shimmer accents",
      components: "crest-shaped badges, ovoid buttons, split-U dividers",
      motion: "creatures transform through nested shapes on transition — one form becoming another",
    },
  },
  {
    slug: "la-catrina-iconography",
    ctx: "José Guadalupe Posada etched La Calavera Catrina around 1910-13 — an elegant skeleton in a broad plumed hat skewering the poor who aspired to be European aristocrats. Diego Rivera fixed her into history in his 1947 Dream of a Sunday Afternoon in Alameda Central mural, adding her body and her name, and she now anchors the whole Día de Muertos language of face paint and papier-mâché.",
    vd: {
      shape: "elegant skull under a plume-topped broad-brim hat, slim-gloved hand, ruffled collar above bare ribs",
      line: "zinc-etching hatch and crosshatch, Posada's expressive outline economy",
      composition: "single frontal calavera figure with a witty caption strip beneath",
      texture: "newsprint halftone grain, sugar-skull frosting relief, feather-boa fluff",
    },
    typ: {
      display: "Posada's woodcut-style display caps and literary calavera verse headings",
      body: "small satirical couplet captions under the figure",
      notes: "every Catrina carries text — a rhyming epitaph or street vendor's cry — image and verse fused",
    },
    lit: {
      quality: "acid daylight of broadsheet printing, then candle-lit altar warmth in use",
      temperature: "warm-toned",
      shadow: "etching hatching does the shadow work; altars add purple candle glow",
    },
    ui: {
      background: "aged newsprint cream with marigold accents",
      surface: "zinc-plate etch grain, sugar-skull crunch, tissue paper",
      components: "engraved-style badges, verse caption boxes, floral-skull icons",
      motion: "halftone fades; skeletons rattle with a two-frame jiggle",
    },
  },
  {
    slug: "dalahast",
    ctx: "Carved in Dalarna's forest workshops since at least the 17th century — loggers whittled horses by stove light — the dalahäst became factory folklore in Nusnäs, where Grannas A. Olsson's (1928) and Nils Olsson's workshops still saw, rasp, prime red and hand-paint kurbits flowers. New York's 1939 World's Fair presented the little horse as Sweden's national symbol.",
    vd: {
      shape: "sturdy arched-neck horse, rounded mane ridges, short legs, broad saddle dip",
      line: "kurbits scrollwork — looping floral vines, dotted leaf clusters, harness outlines",
      composition: "frontal symmetric face markings; saddle and harness zones as painted panels",
      texture: "rasped pine grain under red-orange primer, glossy oil-paint kurbits over matte body",
    },
    typ: {
      display: "hand-painted workshop stamps and Nusnäs certificate lettering",
      body: "simple stamped maker lines on the underside",
      notes: "each genuine horse carries its maker's ink stamp — typography as authenticity seal",
    },
    lit: {
      quality: "warm workshop lamp glow over sawdust haze",
      temperature: "warm-toned",
      shadow: "soft brush-shadow inside the kurbits; homely firelight in photographs",
    },
    ui: {
      background: "Falu red field with cream border",
      surface: "grained pine, oil-paint gloss, stamped ink",
      components: "kurbits-flourished buttons, horse-shaped toggles, carved-look dividers",
      motion: "rocking-horse sway transitions; flowers bloom in on hover",
    },
  },
  {
    slug: "vyshyvanka-embroidery",
    ctx: "The vyshyvanka — Ukraine's embroidered shirt — encodes region in thread: Poltava's white-on-white nastyl' stitching, Borshchiv's somber black, Hutsul mountain cross-stitch. Flax and wool thread on homespun linen carries rhombs, stars, kalyna viburnum and oak leaves as protective charms. Worn at weddings for centuries, it surged as national symbol after 2014, with Vyshyvanka Day each May drawing millions.",
    vd: {
      shape: "geometric rhomb-and-star bands at collar, cuffs and hem on tunic-cut shirt panels",
      line: "counted-thread geometry — nastyl' stitch fields, merezhka drawn-thread ladders",
      composition: "stitch density concentrated at the opening seams: neck, chest placket, shoulders",
      texture: "slubbed homespun linen, raised satin-stitch ridges, crimson-and-black wool thread",
    },
    typ: {
      display: "embroidered initials and dates worked into shirt hems and collar corners",
      body: "museum catalogs set in plain serif with stitch glossaries",
      notes: "each region's stitch alphabet reads like handwriting — Poltava soft, Borshchiv severe",
    },
    lit: {
      quality: "bright flax-field summer light so white-on-white reads",
      temperature: "neutral-toned",
      shadow: "thread height casts micro-shadows that give white-on-white its relief",
    },
    ui: {
      background: "unbleached linen cream",
      surface: "woven flax, matte embroidery floss, tiny glass beads",
      components: "stitch-band dividers, rhomb checkboxes, vyshyvanka-pattern header rails",
      motion: "stitches embroider themselves row by row; band patterns scroll on scroll",
    },
  },
  {
    slug: "raku-ware",
    ctx: "In 1580s Kyoto the tile-maker Chōjirō, working for tea master Sen no Rikyū under Toyotomi Hideyoshi, fired the first raku bowls — hand-pinched, not thrown, pulled glowing from the kiln. Hideyoshi's grant of the 'raku' (pleasure) seal founded the family lineage that continues today with Raku Kichizaemon XVI; black kuro-raku and red aka-raku bowls remain wabi-cha's canonical tea vessels.",
    vd: {
      shape: "low wide-mouthed tea bowls with soft hand-pinched asymmetry and a small ring foot",
      line: "no thrown rings — knife-trimmed foot edges, crackled rim lips, glaze pools",
      composition: "a single vessel as the whole composition; the tea room's negative space around it",
      texture: "matte soot-black raku glaze with crackle webs, rough unglazed clay, family seal stamped in base",
    },
    typ: {
      display: "incised Raku family seal on each bowl base",
      body: "chanoyu diaries and kaiseki menus in brushed vertical Japanese",
      notes: "the potter's seal, not a flourish, is the typography of authorship in tea ceramics",
    },
    lit: {
      quality: "single-candle tea-room light; kiln-mouth glow at the firing",
      temperature: "warm-toned",
      shadow: "deep soft shadow inside bowl hollows; rooms dim to a warm center",
    },
    ui: {
      background: "charred-earth umber with ash-white flecks",
      surface: "soot-matte glaze, raw clay, scorched pine ash",
      components: "seal-stamp icons, crackle-texture cards, bowl-curve progress rings",
      motion: "slow breath-like pulsing; pages change like a lid set on a kettle",
    },
  },
  {
    slug: "mua-roi-nuoc-water-puppet-stagecraft",
    ctx: "Red River Delta villages staged water puppetry on flooded pond stages as early as the Lý dynasty (11th century); puppeteers stand waist-deep behind a bamboo screen, working lacquered wooden figures on long rods. Chú Tễu, the laughing narrator, opens each show as a chèo orchestra of drums, đàn nhị fiddle and bamboo flute drives the spectacle toward wet fireworks finales.",
    vd: {
      shape: "carved wooden figures — dragons, phoenixes, buffalo boys, flag-bearers — riding invisible rods",
      line: "glossy lacquer outlines, gold-leaf detail strokes, ripple-carved water lines",
      composition: "hidden mechanics — the screen hides hands while action floats on the shimmering water plane",
      texture: "water-slick lacquer sheen, fountain-spray sparkle, woven screen silk, firework ember",
    },
    typ: {
      display: "banner calligraphy naming guilds and village patron spirits above the stage",
      body: "chèo opera verse captions projected or declaimed between scenes",
      notes: "spoken and sung narration carries the plot; on-stage text is minimal and ceremonial",
    },
    lit: {
      quality: "outdoor evening show light — lamps over water, warm glow",
      temperature: "warm-toned",
      shadow: "water doubles every puppet in broken reflection; the screen edge stays dark",
    },
    ui: {
      background: "pond-green water plane with ripple gradients",
      surface: "lacquered wood, bamboo screen weave, splashing water",
      components: "puppet-style mascots, wave dividers, curtain-screen overlays",
      motion: "bobbing float animations, splash transitions, ripple rings on tap",
    },
  },
  {
    slug: "hei-matau",
    ctx: "Māori hei matau fishhooks began as functional one-piece bone lures and grew into taonga heirlooms worn at the throat — hei means to wear around the neck. Carved from whalebone, pounamu greenstone or wood, they invoke Māui, who fished up the North Island, and promise safe passage and abundance; Hokitika's West Coast greenstone carvers keep the form alive for a new generation.",
    vd: {
      shape: "open-barb hook silhouette, inward-curving point, slender shank, rounded brow knob",
      line: "whittled low-relief ridges, flowing pounamu fold lines, koru spiral terminals on ornamented pieces",
      composition: "worn centered at the chest, plaited-cord diagonals framing the hook face",
      texture: "polished nephrite jade coolness, whalebone honey patina, cord-fiber twist",
    },
    typ: {
      display: "carved koru and kōwhaiwhai-style notching recording lineage rather than lettering",
      body: "contemporary bilingual labels with Māori macrons (Māori orthography)",
      notes: "these are spoken-heritage objects; inscriptions are rare and treasured",
    },
    lit: {
      quality: "cool coastal daylight showing jade translucency at the edges",
      temperature: "neutral-toned",
      shadow: "shallow shadows in carved grooves; greenstone glows internally against light",
    },
    ui: {
      background: "deep sea teal",
      surface: "greenstone sheen, bone matte, plaited cord",
      components: "hook-shaped scroll icons, cord-wrapped sliders, bone-toggle buttons",
      motion: "pendulum-sway transitions like a pendant coming to rest",
    },
  },
  {
    slug: "inuit-soapstone-carving",
    ctx: "Modern Arctic carving crystallized when James A. Houston reached Kinngait (Cape Dorset) in 1951 and helped found the West Baffin Eskimo Co-operative in 1959, selling carvings south. Carvers in soapstone, serpentine and caribou antler cut hunters, bears, walruses and Sedna the sea mother with minimal-tool directness — now a pillar of Nunavut's economy and of museum collections worldwide.",
    vd: {
      shape: "lumpy stone-preserving masses: crouching bears, hooded hunters, basking seals, Sedna's bound hair",
      line: "few decisive tool cuts; polished flanks set against a raw chisel-scarred base",
      composition: "single subject centered; the stone's natural shape dictates the pose",
      texture: "oiled soapstone sheen, serpentine's green depth, antler's pitted ivory grain",
    },
    typ: {
      display: "engraved disc numbers on the base — the 1950s numbering system tracing each artist",
      body: "co-op certificates and catalogue cards in plain grotesk",
      notes: "the disc-number system made anonymous carvings traceable to individual makers",
    },
    lit: {
      quality: "low arctic sun skimming stone; gallery spots tuned to catch polish",
      temperature: "neutral-toned",
      shadow: "long low-angle shadows emphasize volume; winter blue creeps at the edges",
    },
    ui: {
      background: "snowfield gray-white with stone charcoal",
      surface: "polished steatite, rough quarry edges, antler ivory",
      components: "stone-texture cards, disc-number chips, ice-crack dividers",
      motion: "slow material-weight transitions; carvings turn like turntables",
    },
  },
  {
    slug: "nazca-textiles-and-geoglyphs",
    ctx: "The Nazca (100 BCE-800 CE) of Peru's south coast embroidered Paracas-derived mantles of hummingbirds, demons and running felines, while on the pampa between Nazca and Ingenio they cleared rust-brown pebbles to expose pale subsoil in hundreds of geoglyphs — monkey, spider, heron — long credited with astronomical or water-ritual purpose. Aerial pilots in the 1920s revealed their true scale; Maria Reiche mapped them for decades.",
    vd: {
      shape: "single-line contour animals with spiraling monkey tails; textiles in stepped-fret and floating-figure bands",
      line: "one continuous outline defining each geoglyph; dense embroidered outline stitching on cloth",
      composition: "monumental flat ground drawings readable whole only from above; borders nested within borders",
      texture: "sun-bleached pebble scatter, rust-and-tan desert patina, saturated camelid-wool dyes",
    },
    typ: {
      display: "no script survives; the motifs themselves function logographically across media",
      body: "khipu knot-cords as the neighboring Andean record technology",
      notes: "design reads as image-not-glyph; repetition carries meaning from cloth to desert floor",
    },
    lit: {
      quality: "brutal equatorial high-desert sun, zero diffusion",
      temperature: "warm-toned",
      shadow: "cleared ridges shadow faintly at dawn and dusk — the only moments the lines gain depth",
    },
    ui: {
      background: "desert tan with rust-brown cleared-path inlines",
      surface: "grainy pebble scatter, coarse camelid wool weave",
      components: "line-traced icon buttons, stepped-fret dividers, textile-band headers",
      motion: "aerial pan reveals — motifs draw in a single stroke; fabric weaves itself thread by thread",
    },
  },
  {
    slug: "mexican-calendar-art",
    ctx: "Galas de México, run by the Audiffred family from Mexico City, mass-printed the calendar art of Jesús Helguera — La Leyenda de los Volcanes (1940) — and his peers for cigarette, drink and food brands: idealized Aztec princesses and raven-haired beauties with cinema-adjacent polish. Distributed free in the millions, the images colored popular taste through the Golden Age of Mexican film.",
    vd: {
      shape: "idealized oval faces, glossy raven pompadours, heroic Aztec profiles, volcano-and-pueblo backdrops",
      line: "smooth oil-blended contours, crisp commercial border lines, decorative scroll corners",
      composition: "pin-up centered in a sentimental scene; brand strip anchoring the bottom edge",
      texture: "offset-litho dot grain, glossy calendar varnish, tack-holed corners from decades on walls",
    },
    typ: {
      display: "bold ad-serif brand headers with decorative swashes for the sponsoring company",
      body: "small calendar grids in tabular numerals — the functional half of the art",
      notes: "the date grid is the design's skeleton; typography married painting to commerce",
    },
    lit: {
      quality: "glamour lighting — soft-focus beauty-lamp glow like Golden Age cinema stills",
      temperature: "warm-toned",
      shadow: "romantic soft shadows on faces; landscapes bask in sunset amber",
    },
    ui: {
      background: "faded cream calendar stock with foxed corners",
      surface: "litho gloss, tack-worn paper, varnished print",
      components: "calendar-grid widgets, swash-branded headers, vintage date wheels",
      motion: "page-flip month transitions; varnish sheen glints on scroll",
    },
  },
  {
    slug: "capoeira-visual-language",
    ctx: "Capoeira, forged by enslaved Africans in Brazil's ports and sugar towns, was legitimized under Getúlio Vargas after Mestre Bimba opened his Salvador academy in 1932 and Mestre Pastinha codified capoeira Angola in 1941. Its visual world — white abadá trousers, colored cordão rank cords, berimbau with gourd and coin, the roda circle — now paints Salvador's walls and academies worldwide.",
    vd: {
      shape: "inverted kicks and low sweeps, white trouser arcs, berimbau's long bow curve and gourd bowl",
      line: "circular ginga flow lines, cord knot wraps, painted berimbau stripes",
      composition: "the roda — a circle of bodies around two players, orchestra seated at the head",
      texture: "sweat-sheened cotton, berimbau's polished verga wood, caxixi rattle weave, drumhide",
    },
    typ: {
      display: "academy banners and mestre portraits in bold condensed caps",
      body: "songbook lyrics — ladainhas and corridos — in simple centered verse",
      notes: "graduation is typography too: cord colors knotted and named at the batizado ceremony",
    },
    lit: {
      quality: "hot afternoon yard light; academy bulb warmth at night",
      temperature: "warm-toned",
      shadow: "players' shadows stretch across the roda as they cartwheel through the sun line",
    },
    ui: {
      background: "sunlit sand-yellow with Bahian blue accents",
      surface: "worn wood floor, berimbau wood grain, knotted cord",
      components: "cord-rank progress bars, roda-circle avatars, instrument icons",
      motion: "capoeira flow — circular pendular transitions, screens sliding in ginga rhythm",
    },
  },
  {
    slug: "tango-era-poster-art",
    ctx: "Buenos Aires' tango boom — Carlos Gardel's 1917 'Mi noche triste', the 1913 Paris craze echoing home — fed a graphic culture of sheet-music covers, cabaret programs and Caras y Caretas illustrations: embracing couples, bandoneón flourishes, art-nouveau and deco lettering from houses like Breyer Hermanos. Record labels RCA Victor and Odeon carried the style onto 78 rpm sleeves.",
    vd: {
      shape: "diagonal couple silhouettes in deep embrace, fan-shaped skirts, curved bandoneón bodies",
      line: "litho line with airbrushed tone, ornamental nouveau whiplash borders",
      composition: "couple centered under the title lockup; cabaret stage framing, city silhouette base",
      texture: "newsprint litho grain, gold ink on cabaret programs, worn shellac record labels",
    },
    typ: {
      display: "art-nouveau tango lettering with whiplash terminals; deco condensed for song titles",
      body: "sheet-music lyric stanzas set between the score lines",
      notes: "song-title typography was the brand — 'La Cumparsita' covers are miniature posters",
    },
    lit: {
      quality: "cabaret footlights and café globes; smoky warm pools",
      temperature: "warm-toned",
      shadow: "couples cast long tango shadows on milonga floors; litho tone does the rest",
    },
    ui: {
      background: "smoky sepia night with gilt filigree",
      surface: "aged newsprint, shellac sheen, velvet curtain hint",
      components: "sheet-music headers, record-label badges, ticket-stub buttons",
      motion: "bandoneón-bellows ease-in-out; records spin on audio controls",
    },
  },
  {
    slug: "romanian-ia-embroidery",
    ctx: "The Romanian ia — gathered blouse with the solid altiță shoulder yoke and încreț ruffle collar — was worked region by region: Oltenia's dense polychrome, Muscel's silk florals, Maramureș's austere crosses. Queen Maria wore it abroad and Matisse painted it repeatedly around 1940; since 2013 the Universal Day of the Romanian Blouse (June 24) rallies wearers worldwide.",
    vd: {
      shape: "gathered shoulder yoke (altiță), voluminous square-cut sleeves, încreț ruffle collar",
      line: "geometric cross-stitch fields, peste picior hook-stitch rows, edging chains",
      composition: "ornament mapped to garment structure — yoke solid, sleeves in rhythm bands",
      texture: "hand-loomed cotton and linen, silk thread sheen, tiny puckered stitch dimples",
    },
    typ: {
      display: "embroidered owner initials and regional marks at hem corners",
      body: "ethnographic catalogs with stitch diagrams and region maps",
      notes: "motifs function like signatures — village or family read at a glance",
    },
    lit: {
      quality: "clear courtyard daylight for white linen to glow",
      temperature: "neutral-toned",
      shadow: "stitch relief shadows ripple across the gathered yoke",
    },
    ui: {
      background: "ivory linen with folk-floral corner accents",
      surface: "hand-loomed weave, silk floss sheen, lace trim",
      components: "stitch-diagram tooltips, region-map selectors, yoke-shaped hero cards",
      motion: "sleeve-gather accordion transitions; motifs stitch in crosswise",
    },
  },
  {
    slug: "aran-knitting-tradition",
    ctx: "The Aran jumper is younger than it looks: knitted by islanders' wives from undyed báinín wool in the early 20th century, spread through the Congested Districts Board's knitting schools, then famous after the Clancy Brothers wore Arans on American television in 1961. Cables, honeycomb, diamonds and trellis rise in relief; the 'clan stitch' lore is romantic myth, but every islander once wore one.",
    vd: {
      shape: "deep three-dimensional cable columns, honeycomb cells, diamond lattices with moss-stitch fillers",
      line: "vertical stitch rhythms unbroken from hem to yoke; cabling twists crossing mid-panel",
      composition: "front panels framed by side cable bands; a central underarm gusset diamond",
      texture: "creamy báinín lanolin sheen, raised stitch shadows, dense windproof fabric",
    },
    typ: {
      display: "handwritten knitting patterns with crossed-out revisions; gridded chart notation",
      body: "pattern books in sturdy grotesk with row-number tables",
      notes: "charts are the design language — each stitch symbol as concrete as the knit it draws",
    },
    lit: {
      quality: "soft Atlantic overcast; wool reads best in cool diffuse light",
      temperature: "neutral-toned",
      shadow: "stitch depth supplies its own cable-and-hollow shadow play",
    },
    ui: {
      background: "báinín cream with Atlantic gray-blue trim",
      surface: "chunky knit texture, smooth chart paper, rough tweed panels",
      components: "cable-knit dividers, diamond checkboxes, chart-grid editors",
      motion: "stitches knit across the screen row by row; cables twist on hover",
    },
  },
  {
    slug: "karesansui",
    ctx: "Muromachi Zen abbeys perfected the dry landscape: Ryōan-ji's garden of fifteen stones on raked gravel (late 15th century, at the temple refounded by Hosokawa Katsumoto) and Daisen-in's river-of-void at Daitoku-ji (c. 1509-13) abstract water, islands and mountains into stone and sand. Priests and samurai viewed them seated from verandas — gardens for the mind, never for the feet.",
    vd: {
      shape: "weathered standing stones as mountain-islands, wide gravel fields, clipped azalea mounds, low clay walls",
      line: "samon rake lines running parallel, breaking into waves around the stones",
      composition: "fifteen stones in five groups arranged so no seat reveals them all; fixed veranda viewpoint",
      texture: "compacted white gravel grain, moss softening stone bases, weathered oxblood wall clay",
    },
    typ: {
      display: "kanji garden names and donor tablets engraved in timber",
      body: "temple guidebooks and Zen kōan collections in vertical setting",
      notes: "the garden is 'read' like calligraphy — stones as brushstrokes, gravel as paper",
    },
    lit: {
      quality: "low angled sun across raked sand making the relief visible",
      temperature: "neutral-toned",
      shadow: "long stone shadows at dawn are the garden's daily event; noon flattens to pure pattern",
    },
    ui: {
      background: "warm-white gravel field with moss-green accents",
      surface: "raked sand texture, aged timber veranda, stone matte",
      components: "rake-line dividers, stone-group navigation clusters, lotus icons",
      motion: "ripple rakes animate outward from touch; extremely slow fades",
    },
  },
  {
    slug: "wabi-cha",
    ctx: "Wabi-cha — tea's rustic ideal — ran from Murata Jukō and Takeno Jōō to its perfected form under Sen no Rikyū, the Sakai merchant who served Oda Nobunaga and Toyotomi Hideyoshi and died by ordered suicide in 1591. Rikyū's two-mat Taian hut at Yamazaki, fire-blackened Bizen and Shigaraki bowls and unstripped bamboo ladles made imperfection the highest refinement: harmony, respect, purity, tranquility.",
    vd: {
      shape: "cramped two-mat hut geometry, irregular soot-glazed bowls, off-center scroll alcove and single-flower ikebana",
      line: "hand-thrown wobble edges, rough bamboo grain, asymmetric roji path stones",
      composition: "one focal object in a dim room — scroll, bowl or flower holds all attention",
      texture: "crackled ash glaze, scorched clay, cedar-bark walls, dew-wet moss",
    },
    typ: {
      display: "ink-brushed hanging scroll calligraphy (bokuseki) by Zen monks",
      body: "tea diaries and kaiki gathering records in brush-written vertical Japanese",
      notes: "the scroll chosen for each gathering is the room's only graphic design",
    },
    lit: {
      quality: "paper-screen diffused daylight, dim and close; one candle for evening gatherings",
      temperature: "warm-toned",
      shadow: "soft charcoal shadow in every corner; objects lit from one low shōji side",
    },
    ui: {
      background: "muted earth-gray with ink-wash gradient",
      surface: "rough clay, aged cedar, washi paper",
      components: "brushstroke icons, scroll-side panels, single-flower focal cards",
      motion: "poured-water fades; elements settle like steam off the kettle",
    },
  },
  {
    slug: "ru-ware",
    ctx: "Ru ware, the Northern Song imperial celadon fired around 1086-1106 at Qingliangsi in Baofeng county (Ruzhou, Henan), survives in fewer than a hundred pieces — narcissus cups, brushing washers, incense burners with opalescent sky-after-rain blue glaze, doped with agate and crackled like cicada wings. Emperor Huizong's court prized it above all; a washer sold at Sotheby's Hong Kong for HK$294 million in 2017.",
    vd: {
      shape: "plump simplified forms derived from archaic bronzes — narcissus bowls, shallow washers, incense burners",
      line: "fine crackle web — cicada-wing hairlines mapping the glaze's slow cooling",
      composition: "a single perfect vessel centered on plain ground; no ornament but glaze and crackle",
      texture: "opaque sky-blue glaze like satin jade, milky depth over the pale body, brown iron foot rim",
    },
    typ: {
      display: "imperial inventory inscriptions and palace collection seals in elegant kai script",
      body: "classical Chinese palace catalogs and colophon verses",
      notes: "Qianlong's collector seals stud the greatest pieces — ownership as annotation",
    },
    lit: {
      quality: "even north light revealing glaze depth without glare",
      temperature: "cool-toned",
      shadow: "almost none — the glaze's own opalescence replaces cast shadow",
    },
    ui: {
      background: "pale sky-after-rain celadon gradient",
      surface: "satin glaze, crackle lines, unglazed buff foot",
      components: "crackle-texture cards, seal-red accents, bowl-curve loaders",
      motion: "stillness itself: fades so slow they feel like breath; crackle lines shimmer faintly",
    },
  },
]
