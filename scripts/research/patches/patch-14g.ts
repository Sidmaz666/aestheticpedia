/**
 * Patch 14-g — full-depth backfill for 35 existing entries (manifest-14g.json, Regional & Cultural Traditions slice).
 * Task 14-g. Contract: { slug, ctx, vd{shape,line,composition,texture},
 * typ{display,body,notes}, lit{quality,temperature,shadow}, ui{background,surface,components,motion} }.
 * ctx is real cultural context (150-500 chars); vd/typ/lit/ui are era-specific
 * visual/typographic/lighting/UI translations. Slugs and order follow the manifest exactly.
 */
export const PATCHES: any[] = [
  {
    slug: "jianzhi-papercuts",
    ctx: "Chinese papercutting is documented from the Northern Dynasties: the oldest survivors are 5th-6th-century floral roundels from Astana, Turpan. In northern farmhouses, red jianzhi on lattice windows (chuanghua) mark Spring Festival, weddings and births, with 'double happiness' cutouts in bridal chambers. Cutting was a domestic skill passed mother to daughter, while Yuxian in Hebei developed dyed multicolour styles; UNESCO listed Chinese papercuts in 2009.",
    vd: {
      shape: "symmetrical roundels, window-flower medallions, zodiac beasts, opera silhouettes cut from one sheet",
      line: "razor-thin connecting strands, sawtooth edges, interlocking negative-space piercings",
      composition: "radial symmetry, outer sawtooth border framing the central figure, every element joined to the sheet",
      texture: "crisp red xuan paper grain, fibrous cut edges, layered translucent overlaps on window glass",
    },
    typ: {
      display: "fat rounded folk kaiti characters — 'double happiness' and blessing words cut like papercut panels",
      body: "songti newsprint blocks and kaishu couplet script pasted beside the cuts at New Year",
      notes: "lettering is often cut, not written: characters share the same connecting-strand logic as the imagery",
    },
    lit: {
      quality: "bright spring window daylight glowing through translucent red paper",
      temperature: "warm-toned",
      shadow: "cut-out shadows printed on whitewashed walls and kang mats",
    },
    ui: {
      background: "warm festival red field or lattice-window cream",
      surface: "matte paper texture with subtle fibre grain",
      components: "symmetric medallion cards, festival banner ribbons, cut-out decorative dividers",
      motion: "paper-folding reveals, medallions rotating like window flowers on load",
    },
  },
  {
    slug: "chinese-knotting",
    ctx: "Decorative knots appear in Chinese material culture from the Tang dynasty onward, but Chinese knotting (zhongguojie) flourished under the Ming and Qing as ornament on fans, pipes, hairpins and belt hooks — the endless knot (panchang) being one of Buddhism's Eight Auspicious Symbols. Each knot is worked from a single cord with no loose ends, a continuity prized in New Year and wedding gifts. The craft was codified in 1970s-80s Taiwan by Lydia Chen.",
    vd: {
      shape: "diamond, round and barrel knots — panchang endless loops, double coins, lucky buttons",
      line: "one continuous cord with no visible ends, flat-woven bands turning into raised bosses",
      composition: "central knot medallion with dangling tassels and bead stops in symmetrical drop silhouettes",
      texture: "silk rattail cord sheen, tightly packed twist ridges, glossy jade and agate bead accents",
    },
    typ: {
      display: "medallion-like fat calligraphy framed by knot borders; the panchang knot used as a logotype",
      body: "kaishu gift-tag script and songti packaged-goods labels",
      notes: "largely wordless signalling: colour and knot type carry the meaning, text stays auxiliary",
    },
    lit: {
      quality: "soft indoor lamplight catching silk cord highlights",
      temperature: "warm-toned",
      shadow: "small crisp tassel shadows, knot bosses casting tiny rings",
    },
    ui: {
      background: "silk cream or deep lacquer red",
      surface: "smooth satin gradient with cord-sheen highlights",
      components: "knot medallion icons, tassel pull-to-refresh, bead-dot indicators",
      motion: "tassel sway; knots drawing themselves cord-first on load",
    },
  },
  {
    slug: "duan-inkstone-tradition",
    ctx: "Duan inkstones are cut from purple slate quarried at Mount Lanke near Duanzhou — today's Zhaoqing, Guangdong — since the early Tang, when the pits first paid tribute. Tang poets Liu Yuxi and Li He praised them; connoisseurs grade the stone's 'eyes', pale mineral eyespots, like gems. Song catalogues rank Duan first among China's four famous inkstones. The old pit lies below the Xi River waterline, so quarrying ran only in dry seasons, making large stones courtly rarities.",
    vd: {
      shape: "oblong basin-and-hood stones, leaf-shaped pools, cloud-shaped scoops marked with 'eye' spots",
      line: "carved low relief of clouds, cranes and swirling water following the stone's natural layering",
      composition: "ink pool sunk low at centre, one carved side panel, the flat grinding face dominating",
      texture: "dense violet-grey slate, cool waxy polish, veined blue-white striations, glassy eyes",
    },
    typ: {
      display: "engraved seal-script and clerical-script colophons cut into the stone's sides by owners",
      body: "scholarly running-script inscriptions and Qing catalogue titles",
      notes: "colophons accumulate across generations — the inkstone doubles as a dated document",
    },
    lit: {
      quality: "raking scholar's-studio light revealing stone veining and eyes",
      temperature: "cool-toned",
      shadow: "the ink pool as darkest plane; carved relief held in soft micro-shadow",
    },
    ui: {
      background: "deep slate violet-charcoal",
      surface: "polished stone slab with visible veining",
      components: "engraved stone plaques, ink-pool wells as input fields, colophon side notes",
      motion: "ink drop blooming across the interface as the loading state",
    },
  },
  {
    slug: "balinese-carving",
    ctx: "Balinese carving serves the island's Hindu-Balinese temples: volcanic paras-stone split gates, carved beams and mythological figures — barong lions, Rangda witch-queens, naga serpents — made by hereditary workshops, notably the woodcarvers of Mas village. In the 1930s the Pita Maha cooperative, formed with Europeans Walter Spies and Rudolf Bonnet, turned carving toward tourist commissions, and master Ida Bagus Tilem of Mas developed expressive hardwood figures.",
    vd: {
      shape: "flame-leaf gate crowns, barong lion masks, coiled naga, squatting guardian figures",
      line: "deep-cut curling vines, incised scale and feather hatching, swirling acanthus-like foliage",
      composition: "symmetrical gateway programmes, dense edge-to-edge ornament, figures stacked in tiers",
      texture: "golden teak satin grain, pitted grey paras stone, polished figures against chisel-rough grounds",
    },
    typ: {
      display: "aksara Bali carved titles on temple gates and palanquin panels",
      body: "lontar palm-leaf script for ritual texts; modern Latin for workshop signs",
      notes: "script and carving share one leaf-shaped stroke logic; Balinese script derives from Old Javanese Kawi",
    },
    lit: {
      quality: "hot equatorial sun alternating with temple lamp glow",
      temperature: "warm-toned",
      shadow: "deep carved relief shadows, flower-offering dappling on stone",
    },
    ui: {
      background: "temple cream stone or night-ceremony deep teal",
      surface: "carved relief borders framing content panels",
      components: "gateway-arch headers, flower-offering buttons, tiered meru-shaped menus",
      motion: "petal offerings drifting; gate panels sliding apart on navigation",
    },
  },
  {
    slug: "dong-ho-folk-woodblock-prints",
    ctx: "Dong Ho village in Thuan Thanh, Bac Ninh, north of Hanoi, made woodblock prints for the Tet market: family workshops — the Nguyen Dang Che and Nguyen Huu Sam lines — printed on do bark paper dusted with crushed scallop shell, coloured with lake indigo, red stone and charred leaves. Satirical sheets like 'Dam cuoi chuot' sold beside auspicious cocks and pigs at spring fairs. The trade collapsed in the twentieth century; Vietnam listed it as national heritage in 2013.",
    vd: {
      shape: "flat folk figures — mice in procession, fighting cocks, plump pigs, maidens with fans",
      line: "bold black woodblock contours, chunky positive shapes, no shading lines at all",
      composition: "centred narrative vignettes, flat colour fields, a titling strip across the top",
      texture: "speckled scallop-shell paper ground, grainy pigment overprints, hand-rubbed pressure mottling",
    },
    typ: {
      display: "bold Chinese-character or chu Nom title cartouches hand-inked atop each print",
      body: "sparse brush captions naming scenes and the workshop (e.g. Dong Ho)",
      notes: "text is minimal and folded into the picture plane; workshop seals authenticate the sheets",
    },
    lit: {
      quality: "north-light workshop evenness over the printing tables",
      temperature: "neutral-toned",
      shadow: "flat woodblock inks leave no modelling; the paper grain carries all tone",
    },
    ui: {
      background: "shell-white paper with fine speckle",
      surface: "grainy flat print texture with visible overprint misregistration",
      components: "woodblock-style buttons with chunky keylines, narrative-strip comics",
      motion: "block stamps pressing down on tap; colour layers peeling apart",
    },
  },
  {
    slug: "bat-trang-ceramics",
    ctx: "Bat Trang, 'the bowl kiln', sits on the Red River bank downstream of Hanoi; tradition holds its kilns were founded when potters fled south during the Tran-era wars, settling migrants from Bo Bat in Ninh Binh. Under the Later Le dynasty the village peaked, firing blue-and-white temple wares — incense burners, altar sets — with cobalt brushwork of lotus and phoenixes. In the 1990s wood-fired dragon kilns gave way to gas, and the village became a ceramic tourism hub.",
    vd: {
      shape: "bulbous jars, flared bowls, temple incense burners with relief dragons and lion feet",
      line: "sweeping cobalt brushwork — lotus scrolls, cloud collars, freehand phoenix tails",
      composition: "banded registers, central medallions, shoulder-and-foot borders on porcelain bodies",
      texture: "glassy bluish-white glaze pooling over crisp underglaze blue, kiln-spot crazing",
    },
    typ: {
      display: "underglaze-blue brush cartouches with Han-character marks, reign dates and workshop names",
      body: "kaishu-style dedications on altar wares and temple fittings",
      notes: "inscriptions double as documentation: dates, patrons and village potters recorded in glaze",
    },
    lit: {
      quality: "kiln-fire orange against cool courtyard daylight over glaze",
      temperature: "warm-toned",
      shadow: "glazed surfaces throwing soft specular pools, crisp rim shadows",
    },
    ui: {
      background: "porcelain blue-white",
      surface: "glassy glaze gradient with pooling edges",
      components: "medallion plates as avatars, banded section registers, brush-drawn icons",
      motion: "cobalt strokes painting themselves in; kiln-glow progress ring",
    },
  },
  {
    slug: "maasai-beadwork-aesthetic",
    ctx: "Maasai beadwork grew from nineteenth-century trade: glass seed beads carried by Swahili-coast caravans from Zanzibar replaced iron and bone ornaments. Married women fabricate collars, earrings and warriors' (moran) regalia, choreographing colour fields that encode meaning: red for cattle blood and courage, blue for the sky-god Enkai, green for pasture, white for milk and peace. Colour widths signal age-set, marital status and clan, making each collar legible social text across Kenya/Tanzania.",
    vd: {
      shape: "wide disc collars, stacked hoop rings, plate earrings, triangular panel bibs",
      line: "straight bead rows marching in horizontal and chevron stripes with hard colour boundaries",
      composition: "concentric colour fields keyed to age and status, radiating bands from a central medallion",
      texture: "glass bead gloss, leather backing grain, metallic button highlights",
    },
    typ: {
      display: "modern rounded geometric caps for Swahili/English signage in the bead-palette colours",
      body: "simple humanist sans for market labels and cooperative cards",
      notes: "no indigenous script — the bead colour blocks themselves function as the communicative 'type'",
    },
    lit: {
      quality: "high-altitude savanna sun saturating bead colours",
      temperature: "warm-toned",
      shadow: "minimal — bead gloss reflects while the leather backing absorbs",
    },
    ui: {
      background: "sun-bright white or earth red",
      surface: "matte panels framed with bead-dot borders",
      components: "colour-block status chips, collar-ring avatars, chevron progress bars",
      motion: "rows of beads cascading in; ring collars expanding on select",
    },
  },
  {
    slug: "gele-sculpture",
    ctx: "Gele is the sculptural headwrap of Yoruba women in southwestern Nigeria and Benin, tied from a single stiff length of damask or handwoven aso-oke. At Lagos 'owambe' parties, weddings and church services, celebrity gele stylists pull, pleat and fan the cloth into architectural antennae, wings and crowns whose height advertises the wearer's standing. Matching 'aso-ebi' uniforms bind wedding guests into one palette, and photographer Kelechi Amadi-Obi has carried the look onto global pages.",
    vd: {
      shape: "architectural sails, pleated fans, antenna peaks and wings built from one cloth length",
      line: "razor-pleated folds and knife creases against soft gathered billows",
      composition: "asymmetric crown volume balanced above the face, fabric frame bowing the whole silhouette",
      texture: "crisp starched damask sheen, handwoven aso-oke ribbing, sequin glints",
    },
    typ: {
      display: "high-contrast editorial Didone headlines over event photography; Yoruba praise names with diacritics",
      body: "clean geometric sans for aso-ebi invitations and stylists' posts",
      notes: "typography rides the fashion cycle — event titles and hashtags matter as much as the wrap",
    },
    lit: {
      quality: "event strobe and golden-hour Lagos light raking across damask folds",
      temperature: "warm-toned",
      shadow: "hard pleat shadows fanning out from the crown's architecture",
    },
    ui: {
      background: "event-photo hero with vibrant colour overlay",
      surface: "satin-sheen cards",
      components: "pleated-fold headers, aso-ebi colour-palette pickers, badge ribbons",
      motion: "fabric folds unfurling on scroll; stately slow glamour transitions",
    },
  },
  {
    slug: "whakairo-carving",
    ctx: "Whakairo is Maori carving in totara, kauri, bone and pounamu greenstone, made by tohunga whakairo under tapu restriction. Whare whakairo — carved meeting houses — front their bargeboards with a tekoteko ancestor figure and line the rafters with eponymous chiefs, spiralled in haehae grooves and pakati notching derived from ta moko. Te Hau-ki-Turanga, raised near Gisborne in 1842-45, is the oldest surviving carved house; canoes and storehouses carried the same genealogy into wood.",
    vd: {
      shape: "stacked ancestor figures with three-fingered hands, slit nostrils, wide spiral eyes",
      line: "haehae parallel grooves filled with pakati notching, double-spiral koru endings",
      composition: "genealogical registers along the rafters, frontal tekoteko at the gable apex, full-bleed carving",
      texture: "red ochre and soot black rubbed into open grain, paua shell eye inlays",
    },
    typ: {
      display: "chunky letterforms with koru-spiral terminals carved or painted for wharenui lintels",
      body: "humanist Latin sans set with macrons (a, o, u) for bilingual Te Reo signage",
      notes: "pre-contact carving carried the text role; today dual-script panels front every marae building",
    },
    lit: {
      quality: "candle and open-fire glow inside the wharenui meeting house",
      temperature: "warm-toned",
      shadow: "paua shell eyes and ochre catching light while the grooves go black",
    },
    ui: {
      background: "deep charcoal-brown like smoked timber",
      surface: "carved grain texture with ochre accents",
      components: "koru-spiral loaders, carved-gate section dividers, genealogy timeline as a rafter",
      motion: "spirals unfurling like opening koru; panels breathing in firelight",
    },
  },
  {
    slug: "papunya-tula-dot-painting",
    ctx: "At Papunya settlement in 1971-72, schoolteacher Geoffrey Bardon encouraged Pintupi, Luritja, Anmatyerre and Warlpiri men to paint a Honey Ant Dreaming mural, launching acrylic painting from designs once made in sand and on the body. Founders Kaapa Tjampitjinpa, Clifford Possum Tjapaltjarri and Johnny Warangkula dotted over and beyond sacred ground patterns, partly veiling restricted imagery. The artists formed Papunya Tula Pty Ltd in 1973; studios later moved to Kintore and Kiwirrkurra.",
    vd: {
      shape: "concentric circles, wavy journey lines, U-shaped seated figures, arc campsites",
      line: "thousands of uniform dots padding around masked sacred forms and straight ceremonial paths",
      composition: "aerial map-like Dreaming tracks covering the whole field — no horizon, no single focal figure",
      texture: "matte acrylic stipple over pale ground, precise pointillist ridges, ochre earth underwash",
    },
    typ: {
      display: "neutral museum grotesk for catalogue titles and artist names under skin-name protocols",
      body: "small caption sans giving the Dreaming track and date, kept visually quiet",
      notes: "the painting itself carries knowledge text-like; typography deliberately withholds, never decorates",
    },
    lit: {
      quality: "outback sun bleaching the ground, gallery downlights on canvas",
      temperature: "warm-toned",
      shadow: "the dot stipple kills shadow; tone comes only from ochre concentration",
    },
    ui: {
      background: "pale sand and ochre field",
      surface: "matte stipple texture",
      components: "concentric-circle menu rings, dotted-path progress tracks, map-like navigation",
      motion: "dots marching along Dreaming lines as activity indicators",
    },
  },
  {
    slug: "kwakwaka-wakw-transformation-masks",
    ctx: "For the Kwakwaka'wakw of northern Vancouver Island, transformation masks open the winter potlatch dances when dancers pull concealed strings so a human face snaps into raven, bear or Dzunuk'wa, the Wild Woman of the Woods. Hereditary carvers such as Willie Seaweed of Fort Rupert engineered the cedar mechanisms and mineral-pigment paint. Canada's potlatch ban (1884-1951) collapsed after the 1921 Village Island raids; seized regalia was later repatriated to Alert Bay's U'mista Cultural Centre.",
    vd: {
      shape: "oversized cedar mask heads, hinged beaks and mandibles, muscular boards, crown rings",
      line: "bold black contours framing red and white zones, incised eyebrow sweeps",
      composition: "mask frontality with concealed string mechanics; layered inner faces revealed on opening",
      texture: "cedar grain under ochre-red, black and white mineral paint, ermine and cedar-bark fringe",
    },
    typ: {
      display: "bold condensed caps for potlatch and museum display titles",
      body: "humanist sans supporting Kwak'wala orthography (k', w, x marks)",
      notes: "Boas-era and modern orthographies coexist; U'mista labels pair both on one card",
    },
    lit: {
      quality: "winter ceremonial firelight leaping across cedar masks",
      temperature: "warm-toned",
      shadow: "mask planes tilting in and out of flame shadow, the fringe trembling",
    },
    ui: {
      background: "cedar red-brown",
      surface: "painted cedar grain with black keylines",
      components: "mask cards that flip and transform, hinged drawer panels, fringe-trimmed buttons",
      motion: "mask transformation flips revealing second states; string-pull gestures",
    },
  },
  {
    slug: "lakota-floral-beadwork",
    ctx: "After the 1850s, glass seed beads traded onto the Plains replaced porcupine quillwork among the Lakota — Oglala, Hunkpapa and Sicangu bands. Through Great Lakes and Metis contacts, floral ornament travelled west, and Lakota women developed a bolder, densely filled style: moccasins, vests, cradle yokes and tipi bags carpeted in stylised blossoms with no ground showing. At Pine Ridge the Red Cloud Indian Art Show, running since 1969, keeps the tradition in living competition.",
    vd: {
      shape: "yoke-shaped cradle tops, fully beaded moccasin panels, saddle-flap tipi bags, rosettes",
      line: "curving vine-and-leaf trails, three-directional bead lanes, outlined blossom silhouettes",
      composition: "edge-to-edge fill with no bare ground, mirrored quarters, bold central floral medallions",
      texture: "tight glass seed-bead domes, sinew-pulled ridges, smoked hide sheen beneath",
    },
    typ: {
      display: "beaded-style block letters and chunky western serif for rodeo and giveaway banners",
      body: "workhorse serif of trade catalogues and mission-school print",
      notes: "lettering on beaded bags mimics the floral surround; modern Lakota orthography appears on signage",
    },
    lit: {
      quality: "prairie sun and powwow arena floodlight on bead gloss",
      temperature: "warm-toned",
      shadow: "bead domes sparkle as micro-highlights while hide grounds stay matte",
    },
    ui: {
      background: "smoked-hide tan",
      surface: "beaded texture borders on flat panels",
      components: "floral medallion badges, fully beaded edge cards, rosette buttons",
      motion: "beads filling in flower by flower on load; soft powwow sway",
    },
  },
  {
    slug: "kinngait-printmaking",
    ctx: "Printmaking at Kinngait (Cape Dorset) on Baffin Island began in 1959 when James Houston helped Inuit artists form the West Baffin Eskimo Co-operative and issue the first annual print collection. Stonecuts, stencils and etchings on kozo paper translated hunting memory and legend: Kenojuak Ashevak's 'Enchanted Owl' (1960) became a national icon, while Pitseolak Ashoona and later Annie Pootoogook drew camp life and southern contact. Prints travel south through Toronto's Dorset Fine Arts.",
    vd: {
      shape: "stilled Arctic animals — owls, loons, bears, walrus — and hooded camp figures",
      line: "bold contour lines, simplified geometric anatomy, single expressive eyes",
      composition: "centred single subjects floating on white; stacked narrative registers in the stonecut series",
      texture: "gritty stone-block ink bite, kozo paper tooth, stencil-flat colour pools",
    },
    typ: {
      display: "Inuktitut syllabics set large for co-op and annual collection covers",
      body: "bilingual syllabics-plus-Latin captions naming artist, community and title",
      notes: "every print is signed in syllabics and Latin; Dorset Fine Arts keeps the pairing on all releases",
    },
    lit: {
      quality: "low Arctic sun and long blue snowlight",
      temperature: "cool-toned",
      shadow: "stonecut ink sits flat; shadow is implied by spare line only",
    },
    ui: {
      background: "snow white with arctic blue-grey accents",
      surface: "stonecut ink texture with paper tooth",
      components: "stencil-flat illustration cards, syllabic type pairings, co-op stamp marks",
      motion: "print lift-off reveal; ink pressing into paper on load",
    },
  },
  {
    slug: "maya-codex-style",
    ctx: "Classic Maya scribes (aj ts'ib) painted screenfold books of bark paper surfaced with lime stucco, pairing figural scenes and glyph columns; astronomer-priests tabulated the Venus cycle and eclipse tables in the Dresden Codex. Most codices burned — Bishop Diego de Landa's 1562 auto-da-fé at Maní destroyed scores, leaving four known books. Codex-style ceramics copy the books' conventions: profile lords, red frames and floating glyph blocks on lowland vases before the ninth-century collapse.",
    vd: {
      shape: "profile lords in ritual pose, squat deity heads, bar-and-dot number clusters",
      line: "confident black calligraphic contour with red outline accents and no cast shadow",
      composition: "screenfold registers, glyph columns flanking each scene, red frame margins dividing pages",
      texture: "limewashed amate smoothness, translucent pigment, aged brown staining at the folds",
    },
    typ: {
      display: "glyph blocks as monumental display units — the writing system itself is the 'typeface'",
      body: "no separate body text; bar-and-dot numerals govern rhythm and layout",
      notes: "page design is typographic in effect: columns, margins and punctuation-like day signs",
    },
    lit: {
      quality: "courtyard daylight on stuccoed pages; the scribe's resin lamp at dusk",
      temperature: "warm-toned",
      shadow: "no cast shadow; red frames organise depth symbolically",
    },
    ui: {
      background: "aged stucco cream",
      surface: "folded screenfold panels",
      components: "glyph-block icon set, red-frame page dividers, day-sign calendar widgets",
      motion: "screenfold pages opening horizontally; glyphs assembling from columns",
    },
  },
  {
    slug: "maya-codex-glyphic-style",
    ctx: "Maya writing mixed logograms with syllabic signs — roughly 800 glyphs recording royal genealogy and Long Count dates on stelae, lintels and panels. Yaxchilan's carved lintels show Shield Jaguar and Lady Xoc in bloodletting ritual beneath captioned text. After centuries of misreading, Yuri Knorozov argued in 1952 that the script was phonetic, and Tatiana Proskouriakoff showed in 1960 that the Piedras Negras stelae recorded real reigns — recovering history the books burned at Maní could no longer tell.",
    vd: {
      shape: "squared glyph blocks stacked in double columns, crouching head-variant numerals",
      line: "deep incised and low-relief carving with crisp interior detail lines",
      composition: "an Initial Series date introduction followed by narrative caption columns down the stele face",
      texture: "weathered limestone tooth, chisel-crisp edges softened by rain erosion, stucco remnants",
    },
    typ: {
      display: "carved glyph blocks built from principal-sign cores with affix clusters",
      body: "captioned dedicatory texts following the Initial Series date formula",
      notes: "decipherment made epigraphy readable — phonetic complements and logograms alternate within words",
    },
    lit: {
      quality: "tropical noon hard on carved limestone faces",
      temperature: "neutral-toned",
      shadow: "deep relief shadows carry legibility at raking angles",
    },
    ui: {
      background: "limestone pale",
      surface: "carved relief panels with erosion speckle",
      components: "stele-style header monoliths, Long Count date steppers, column text blocks",
      motion: "date wheels ticking through cycles; chisel-carve text reveal",
    },
  },
  {
    slug: "traje-charro",
    ctx: "The traje charro grew from the riding dress of hacienda vaqueros in Jalisco and Michoacán, codified in the early twentieth century into graded galas — faena, media gala, gala, gran gala — the last dense with silver or gold botoneria buttons. After the Revolution, charro films starring Jorge Negrete and the outfit's adoption by mariachi made it a symbol of mexicanidad. Charreria, the rope-and-horse sport it serves, entered UNESCO's Intangible Heritage list in 2016.",
    vd: {
      shape: "fitted short jacket and narrow calzones; mushroom sombrero with an upturned rolled brim",
      line: "rows of engraved silver botoneria, piping seams, embroidered faunal motifs down the leg",
      composition: "symmetric button panels bisecting the body, matched braid borders at cuffs and hems",
      texture: "fine wool suiting sheen, chased silver buttons, stiff felt hat nap",
    },
    typ: {
      display: "ornate charreria poster lettering with horn-and-rope flourishes",
      body: "bold grotesque listings for charreadas and ferias",
      notes: "mariachi cover art and tequila labels borrow the same decorated caps",
    },
    lit: {
      quality: "arena sun and golden-hour dust light over the lienzo charro",
      temperature: "warm-toned",
      shadow: "silver buttons flashing; the hat brim cutting a hard face shadow",
    },
    ui: {
      background: "arena dust gold with charcoal trim",
      surface: "wool suiting texture with silver button sheen",
      components: "botoneria button rows as nav dots, sombrero icon set, rank-badge headers",
      motion: "buttons lighting up in sequence; ribbon roping in on section change",
    },
  },
  {
    slug: "frevo-umbrellas",
    ctx: "Frevo, the brass-band dance music of Recife, Pernambuco, takes its name from ferver, to boil. In the nineteenth century clubs hired capoeira-strong fighters to clear the way for their bands; the fighters' swagger distilled into acrobatic named passos — steps like dentista and ferrolho — and the fighting staff shrank into the tiny ribboned umbrella, colour-coded to each club. The Galo da Madrugada block has led the carnival since 1978, and UNESCO inscribed Frevo in 2012.",
    vd: {
      shape: "tiny cone-domed umbrellas, flared skirts of sequin fringe, lunging passista silhouettes",
      line: "ribbons circling the parasol edge, twirling arc trails, brass-section staccato rhythm",
      composition: "a single dancer isolated against the crowd, the umbrella held as compositional pivot",
      texture: "satin sheen, sequin flash, glitter-trimmed petal edges",
    },
    typ: {
      display: "bouncing tropical script for club names on banners and passista costumes",
      body: "condensed poster sans for passo names and carnival schedules",
      notes: "the passo vocabulary (dentista, ferrolho) works like a named 'typeface' of dance moves",
    },
    lit: {
      quality: "noon carnival glare bouncing off Recife's streets",
      temperature: "warm-toned",
      shadow: "the umbrella disc is the only shadow — dancers keep the sun off",
    },
    ui: {
      background: "Recife street-sun yellow",
      surface: "sequin-satin shimmer",
      components: "umbrella-spin menu pivots, passo step-name chips, brass equalizer bars",
      motion: "umbrella twirl as loading spinner; beat-synced bouncy transitions",
    },
  },
  {
    slug: "trinidad-fancy-sailor-mas",
    ctx: "Sailor mas entered Trinidad Carnival when servicemen's ships crowded Port of Spain harbour after both world wars; by the 1950s the Fancy Sailor was a marquee character. Bands dress in naval whites rebuilt into spectacle — huge sequinned epaulettes, crowns, ribboned 'boats' as headdresses, simulated medals — while dancers march with a rolling sailor strut behind steelbands on the Queen's Park Savannah. Mas camps labour for months on the regalia, and ole mas jokers parody the same uniform.",
    vd: {
      shape: "exaggerated naval silhouette: puffed sleeves, giant epaulettes, crown-topped boat headdresses",
      line: "rows of sequins and braid tracing uniform seams out into spectacle scale",
      composition: "matched band rows marching in formation, each sailor a mirrored uniform unit",
      texture: "sequin scales, grosgrain ribbon, patent-leather shine, tinsel fringe",
    },
    typ: {
      display: "sequin-bright band-name lettering, often rhinestoned across the sailor's chest plate",
      body: "sturdy sans for mas-camp ledgers and band route maps",
      notes: "military stencil influence arrives with the uniforms themselves",
    },
    lit: {
      quality: "Caribbean sun sequin-flash and street-lamp glow for night parade",
      temperature: "warm-toned",
      shadow: "sequin scales scatter light; epaulettes shade the collarbones",
    },
    ui: {
      background: "carnival midnight with street-glow gradients",
      surface: "sequin-scale shimmer",
      components: "epaulette tab bars, medal badges, boat-shaped headdress icons",
      motion: "sequin shimmer ripple; marching beat progression on navigation",
    },
  },
  {
    slug: "fileteado-porteno",
    ctx: "Fileteado began around 1900 in Buenos Aires when Italian immigrant sign painters — the Ventrucca family among them — decorated carriages with long-haired brush fillets, then trucks and buses. Miguel Venturo added flowers, birds, dragons, flags and mottoes framing portraits and football crests. The trade declined, then revived through Carlos Carboni and Martiniano Arce; the city declared fileteado heritage in 1975, and tango covers and café fronts carry its scrolls today.",
    vd: {
      shape: "symmetrical acanthus volutes, flowers, birds, small dragons, flag-tipped finials",
      line: "long continuous fillet strokes swelling and tapering from one pull of a loaded brush",
      composition: "mirrored frames around a central cartouche, corner blossoms, a motto ribbon beneath",
      texture: "enamel gloss over lacquered panel, hand-brushed gradients, gold-leaf accents",
    },
    typ: {
      display: "the tradition IS lettering: filete scroll-framed words with flag finials and bird terminals",
      body: "sign-painter's shaded roman and condensed grotesque on truck flanks",
      notes: "mottoes, football slogans and tango titles all ride the same scroll frames",
    },
    lit: {
      quality: "garage lamp over enamel work; street sun on the finished panels",
      temperature: "neutral-toned",
      shadow: "painted highlights do the modelling; real shadow stays graphic",
    },
    ui: {
      background: "enamel navy or cream",
      surface: "glossy lacquer with hand-painted gradients",
      components: "scroll-framed buttons, ribbon motto banners, bird-and-flower corner ornaments",
      motion: "single-stroke fillet lines drawing themselves; volutes blooming outward",
    },
  },
  {
    slug: "telemark-rosemaling",
    ctx: "Rosemaling ('rose painting') spread through Norwegian farming districts from the late 1700s into the 1800s as itinerant painters worked farm by farm, decorating ale bowls, tine boxes and wall panels. Telemark's branch is the most painterly: asymmetrical C- and S-scrolls of acanthus derived from carved church ornament, twisting trompe-l'oeil ribbons, strong colour over black or raw wood. Emigration carried it to Wisconsin and Minnesota, where a twentieth-century revival keeps the scroll alive.",
    vd: {
      shape: "bulbous ale bowls, round tine boxes, sweeping S- and C-scroll bouquets",
      line: "asymmetric swinging scroll strokes with pointed leaf tips and dot berries",
      composition: "a scroll wreath circling the object's rim, central tulip rosette, trompe-l'oeil twisted ribbon",
      texture: "oil-paint sheen on wood, wet-into-wet blended petals, black or red-brown ground",
    },
    typ: {
      display: "rosemaling scroll frames around initials and farm names on plates and trunks",
      body: "Fraktur-derived blackletter from Norwegian and Norwegian-American immigrant print",
      notes: "memory books and certificates paired scroll painting with blackletter text",
    },
    lit: {
      quality: "window-side winter light across farmhouse interiors",
      temperature: "cool-toned",
      shadow: "petals modelled by painted light; almost no true cast shadow",
    },
    ui: {
      background: "warm cream or folk red-brown ground",
      surface: "oil-paint sheen with blended petal gradients",
      components: "scroll-framed panels, tine-box round icons, ale-bowl curved dividers",
      motion: "scroll strokes growing leaf by leaf with gentle hand-painted easing",
    },
  },
  {
    slug: "gakti-dress-tradition",
    ctx: "Gakti, the Sami ceremonial dress, is cut from wool felt and reindeer leather in blue, red, green and yellow; collar shape, ribbon placement and silver belt ornament tell the wearer's home district, family and marital status — Kautokeino and Karasjok cuts differ at a glance. Tin-thread embroidery and curled-toe reindeer-skin shoes complete the outfit. Gakti is worn at confirmations, weddings, Sami National Day on 6 February and political assemblies — a visible stand for language and land.",
    vd: {
      shape: "tunic gakti with yoke bands, curved toe-curl shoes, horn-topped silver brooches",
      line: "horizontal colour banding across the chest yoke, braid borders and ribbon stripes",
      composition: "four-colour zoning keyed to district; ornament concentrated at collar and hem",
      texture: "boiled wool density, tin-thread glint on dark cloth, soft reindeer hide",
    },
    typ: {
      display: "chunky geometric sans in the four Sami colours for duodji craft hangtags",
      body: "plain sans for Northern Sami text, handling a with ring diacritics cleanly",
      notes: "the dress speaks district; modern type keeps the Sami language visible in public space",
    },
    lit: {
      quality: "low polar daylight with snow bounce, indoor fire warmth",
      temperature: "cool-toned",
      shadow: "tin thread glinting; felt bands holding a flat even tone",
    },
    ui: {
      background: "Sami blue with banded colour strips",
      surface: "felted wool texture",
      components: "yoke-band headers, tin-thread line icons, district-code colour chips",
      motion: "bands sliding to reveal content; snow-quiet slow fades",
    },
  },
  {
    slug: "pysanka-writing",
    ctx: "Pysanka — from pysaty, 'to write' — is the Ukrainian wax-resist Easter egg: a kistka stylus lays beeswax over white shell, then successive dye baths 'write' the design in reverse. Pagan sun and fertility signs — the 40-triangle sorokolyk, deer, Berehynia goddesses — were folded into Easter symbolism; Hutsul eggs run dark, Lemko eggs use drop-pull dots. Soviet campaigns pushed practice into the diaspora, and Kolomyia's egg-shaped Pysanka Museum (2000) guards the craft at home.",
    vd: {
      shape: "egg-shell ovals divided by eight meridian axes into the 40-triangle sorokolyk web",
      line: "fine wax-resist strokes holding crisp white boundaries against deep dye fields",
      composition: "axis-mundi divisions, stylised Berehynia goddess figures, sun stars at the pole centres",
      texture: "glossy varnish over dye, visible wax crackle, mottled hand-dipped tonal shifts",
    },
    typ: {
      display: "folk hand-lettering with wax-resist irregularity for 'Khristos Voskres' Easter greetings",
      body: "Ukrainian Cyrillic bookish faces for gift cards and museum labels",
      notes: "designs are 'written', not drawn — the vocabulary of symbols acts as a script",
    },
    lit: {
      quality: "Easter-morning church candles and spring window light",
      temperature: "warm-toned",
      shadow: "egg curvature shading the dye gradients; wax holding the highlight",
    },
    ui: {
      background: "deep dye gradient from russet to near-black",
      surface: "glossy varnish with wax crackle",
      components: "axis-divided grid layouts, symbol palette of stars and goddesses, dye-bath progress",
      motion: "wax lines resisting, then dye flooding; colour deepening layer by layer",
    },
  },
  {
    slug: "wycinanki-papercuts",
    ctx: "Polish wycinanki grew out of cottage decoration in the late nineteenth century, when paper cuts replaced woven spider pająki on beams and stoves. Two schools dominate: Kurpie's single-colour, symmetrical 'tree of life' and star rounds, cut with sheep-shearing scissors; and Lowicz's dense multicolour layering, where roosters and bouquets are pasted paper-on-paper in rainbow rims. Village women sold sheets at fairs, museums institutionalised the craft, and emigrants carried it to Chicago parishes.",
    vd: {
      shape: "symmetrical roosters with fan tails, tree-of-life sprays, star medallions",
      line: "shear-cut edges, scalloped feather tiers, snipped fringe borders",
      composition: "mirror symmetry built from stacked colour layers, each darker sheet cut inside the last",
      texture: "layered construction-paper depth, matte pigment, pasted edge ridges",
    },
    typ: {
      display: "symmetric lettering wreathed in rooster and flower cuts on parish and school banners",
      body: "bold folk sans for fair posters and ethnographic captions",
      notes: "the Kurpie and Lowicz schools each frame text with their own cut vocabulary",
    },
    lit: {
      quality: "cottage window light against stove-warm interiors",
      temperature: "warm-toned",
      shadow: "layered paper edges casting fine step shadows on the walls",
    },
    ui: {
      background: "cream with layered paper rainbow rims",
      surface: "matte construction-paper stack",
      components: "rooster-framed badges, star medallion menus, fringe-edged cards",
      motion: "paper layers peeling back; symmetric cuts blooming open",
    },
  },
  {
    slug: "voronet-blue",
    ctx: "Voronet monastery in Bucovina was raised in 1487-88 by Stephen the Great to celebrate the victory at Vaslui; its west wall received the monumental Last Judgment fresco in 1547 under Petru Rares. The 'Voronet blue' saturating that sky — a pigment whose recipe is still debated, often linked to lapis or azurite — earned the church the title 'Sistine Chapel of the East'. With Sucevita, Moldovita, Humor and Arbore, the painted monasteries joined UNESCO's list in 1993.",
    vd: {
      shape: "elongated Byzantine saints, arched tympana, rank upon rank of heaven's hosts",
      line: "fluid dark contour lines, curling drapery folds, stylised cloud scrolls",
      composition: "the west wall's Last Judgment as a full-façade scroll, souls weighed along a river of fire",
      texture: "matte lime fresco tooth, saturated Voronet blue sky, flaking pigment patina",
    },
    typ: {
      display: "Church Slavonic uncial inscriptions in red title bands over the frescoes",
      body: "Slavonic minuscule charters and donor texts; modern Romanian museum panels",
      notes: "inscriptions date the restorations and name the metropolitan patrons of the painting",
    },
    lit: {
      quality: "Bucovina morning sun striking the west façade",
      temperature: "warm-toned",
      shadow: "fresco modelling handled in pigment; architectural reveals go deep blue-black",
    },
    ui: {
      background: "Voronet blue field",
      surface: "fresco matte with lime-wash grain",
      components: "arched icon frames, gold title bands, saint-file menu columns",
      motion: "slow fresco-fade transitions; pigment-wash section sweeps",
    },
  },
  {
    slug: "maramures-woodcarving",
    ctx: "In Maramures, northern Romania, oak is the civic material: churches climb into tall shingled spires — the 54-metre one at Surdesti (1721) is among Europe's tallest wooden structures — while village gates (poarta maramureseana) carry carved rope twists, sun wheels, tulips and wolf-tooth borders guarding thresholds. Hereditary carpenter families hewed beams with broad axes and joined them without nails. Eight wooden churches entered UNESCO's list in 1999, and Sapanta's Merry Cemetery crosses extend the idiom.",
    vd: {
      shape: "towering shingled spires, three-roofed gates, beam-end zoomorphic profiles",
      line: "chip-carved rope twists, sun-wheel rosettes, wolf-tooth dentil borders",
      composition: "carved zones stacked along the gateposts, symmetry between portal columns, tapering spire",
      texture: "silvered oak weathering, adze scallops, deep-cut geometric shadow lines",
    },
    typ: {
      display: "deep-carved oak lettering on gates and cemetery crosses in archaic letterforms",
      body: "chiselled names and dates; village annals in modern print",
      notes: "the Merry Cemetery at Sapanta makes epitaphs a carved folk-poetry genre",
    },
    lit: {
      quality: "low Carpathian sun raking across shingles and gates",
      temperature: "cool-toned",
      shadow: "chip-carved geometry holds crisp dark lines at every hour",
    },
    ui: {
      background: "weathered silver-oak grey",
      surface: "adzed timber with chip-carve borders",
      components: "gate-post section frames, rope-twist dividers, sun-wheel motifs as icons",
      motion: "gates swinging open on section change; carve lines drawing in",
    },
  },
  {
    slug: "transylvanian-saxon-church-architecture",
    ctx: "Transylvanian Saxons — German settlers invited by Hungary's crown in the twelfth century — ringed their village churches with curtain walls and towers against Mongol and Ottoman raids. Biertan, seat of the Lutheran bishopric from 1572, stacked three concentric walls and kept a 'marriage prison' where couples seeking divorce were locked until they reconciled. Prejmer's fortress church is the largest east of the Alps; seven villages, Biertan among them, joined UNESCO's list in 1993.",
    vd: {
      shape: "square keep-like church towers, ring curtain walls with loop-holed storerooms",
      line: "round-arched Romanesque windows, Gothic pointed vaults, battlement crenellations",
      composition: "concentric defensive rings around the nave, bastion towers at the corners, village below the hill",
      texture: "rough coursed sandstone, timber-framed wall walkways, lichen-stained tile roofs",
    },
    typ: {
      display: "German Fraktur inscriptions and tower dedication dates cut in stone",
      body: "Lutheran church books and parish ledgers in Kurrent script",
      notes: "Saxon settlements marked identity in letterform as much as in fortification",
    },
    lit: {
      quality: "hilltop church light over misted valleys; torch glow inside the walls",
      temperature: "cool-toned",
      shadow: "loop-hole light shafts, storeroom gloom, crenellation notches",
    },
    ui: {
      background: "stone grey-blue with torch amber accents",
      surface: "coured sandstone and timber walkway planks",
      components: "bastion corner cards, loop-hole icon slits, wall-walk breadcrumb trails",
      motion: "portcullis-draw reveals; torchlight flicker on hover",
    },
  },
  {
    slug: "celtic-revival-design",
    ctx: "Celtic Revival design re-entered Victorian craft through museum treasures — the Tara Brooch, the Ardagh Chalice and the Book of Kells — whose interlace and spirals Irish and Scottish workshops reinterpreted in metal, wood and print. Liberty & Co.'s Cymric line (1899-1904) built its success on Manx designer Archibald Knox's knotwork silver; the Irish Free State put Celtic ornament on its 1922 coinage; and George Bain's 1951 manual codified Pictish and Insular geometry for postwar designers.",
    vd: {
      shape: "interlace knots with no visible ends, trumpet spirals, key-pattern borders, brooch discs",
      line: "one ribbon threading endlessly over and under, with hairline double-strand detailing",
      composition: "knotwork frames enclosing zoomorphic terminals, circular symmetry around a central boss",
      texture: "polished pewter and silver, engraved shadow, embossed gold filigree",
    },
    typ: {
      display: "Insular half-uncial revival — Book of Kells-style initials with beast terminals",
      body: "Arts & Crafts serifs and Cuala Press letterpress text",
      notes: "George Bain's construction grids turned illuminated initials into teachable geometry",
    },
    lit: {
      quality: "museum-case light on silver and pewter knots",
      temperature: "neutral-toned",
      shadow: "engraved lines pooling shadow; high-polish specular points",
    },
    ui: {
      background: "parchment cream with green and gold accents",
      surface: "illuminated-page texture",
      components: "knotwork border frames, beast-terminal initial caps, brooch medallion buttons",
      motion: "interlace weaving itself strand over strand on load",
    },
  },
  {
    slug: "calcada-portuguesa",
    ctx: "Lisbon's calcada portuguesa began in 1842, when the engineer Eusebio Pinheiro Faria set prisoners to paving the road by Sao Jorge Castle in white limestone and black basalt; the famous wave pattern at Rossio square followed in 1848-49. The calceteiro trade — laying thumbnail stones freehand — spread with Portuguese administration to Rio de Janeiro, Macau and the colonies. Worries persist: the stones are slippery, the trade ageing, and the city keeps a calceteiro school to replace masters.",
    vd: {
      shape: "basalt waves, fish-scale fans, compass roses, ship and beast vignettes in the pavement",
      line: "hand-set stone courses following drawn outlines in curving flow lines",
      composition: "monochrome figure-ground puzzles stretched across plazas, borders framing the walks",
      texture: "worn limestone sheen, chipped basalt edges, glossy rain-slick undulation",
    },
    typ: {
      display: "azulejo-panel shop names and wave-framed 'Lisboa' signage along the pavements",
      body: "utility sans on tram stops and museum wayfinding",
      notes: "the squares themselves 'write': compass roses, fish and ship names laid in stone",
    },
    lit: {
      quality: "Atlantic glare and wet-street after-rain sheen",
      temperature: "neutral-toned",
      shadow: "stone relief only millimetres deep — shadow thin but omnipresent",
    },
    ui: {
      background: "limestone white with basalt black pattern",
      surface: "polished stone sheen with slight unevenness",
      components: "wave-pattern dividers, compass-rose menus, stone-mosaic icon tiles",
      motion: "pavement patterns assembling stone by stone; wave shimmer",
    },
  },
  {
    slug: "netsuke-carving",
    ctx: "Netsuke are carved toggles — katabori figures, flat manju discs, kagamibuta mirror-lid forms — that anchor medicine cases (inro) and pipes to the obi sash, since kimono lack pockets. Edo-period urban buyers demanded wit and craft in boxwood, ivory and stag antler; masters such as Masanao of Ise and Tomotada carved rats, masks and tigers, signing with tiny kakihan monograms. After 1868, japonisme carried thousands into Western collections, and ivory bans now push carvers to mammoth ivory and tagua nut.",
    vd: {
      shape: "palm-size kneeling figures, coiled rats, gourd manju discs, mask forms",
      line: "soft transitions between volumes, incised fur and cloth folds, sweeping curves",
      composition: "all-around composition resolved from every angle; himotoshi cord holes hidden at the base",
      texture: "ambered ivory patina, dense boxwood polish, worn silk-cord sheen at the drill holes",
    },
    typ: {
      display: "kakihan — carvers' cipher monograms — the tiniest signatures in craft",
      body: "minute engraved kanji signatures alongside collector inventory numbers",
      notes: "modern catalogues set netsuke labels with kanji-Latin pairing and auction lot codes",
    },
    lit: {
      quality: "close lamp light for connoisseurship; rotating exhibit spots",
      temperature: "warm-toned",
      shadow: "carved cavities going ink-dark; patina warming under lamplight",
    },
    ui: {
      background: "collector's-cabinet deep walnut",
      surface: "ivory patina and boxwood polish",
      components: "rotatable object cards, kakihan signature marks, drawer-grid gallery",
      motion: "objects turning slowly; cord-thread drawing between items",
    },
  },
  {
    slug: "mon-family-crests",
    ctx: "Mon are Japanese family and institutional crests: circular emblems of stylised kiku chrysanthemums, paulownia, plum blossoms and geometric abstractions, fixed on formal montsuki kimono (usually five crests), armour, banners and gravestones. Court nobles adapted them in the Heian period for ox-carts and dress, and Sengoku warlords flew them on battlefield flags. Hundreds of Edo-period variants are catalogued, and the grammar survives in commerce and at modern weddings and funerals.",
    vd: {
      shape: "circular enclosures holding stylised chrysanthemums, paulownia leaves, geometric fans",
      line: "radial petal symmetry, bold thick-and-thin strokes, crisp negative cuts",
      composition: "a single centred emblem repeated in fives on formal dress, corner-anchored on flags",
      texture: "flat ink-black silk resist, woven crest threads, embossed lacquer seal surfaces",
    },
    typ: {
      display: "circular crest medallions acting as logos — the chrysanthemum (kiku) and paulownia (kiri) seals",
      body: "Mincho-style print text on montsuki formal invitations",
      notes: "corporate marks descend from mon: Mitsubishi's three-diamond derives from an Iwasaki family crest",
    },
    lit: {
      quality: "flat even studio light for crest registration",
      temperature: "neutral-toned",
      shadow: "none intended — crests read as pure flat sign forms",
    },
    ui: {
      background: "formal white or ink black",
      surface: "flat silk-texture panels",
      components: "crest medallion logos, five-crest formal header, family-tree relation maps",
      motion: "crest stamps pressing on confirmation; radial symmetry easing in",
    },
  },
  {
    slug: "yangliuqing-nianhua",
    ctx: "Yangliuqing, a canal town west of Tianjin, made New Year pictures (nianhua) from the late Ming onward and peaked under Qianlong and Jiaqing, when hundreds of workshops — Dai Lianzeng and Qi Jianlong foremost — served the Spring Festival trade. Prints are 'half printed, half painted': woodblock outlines, then hand colouring by women piece-workers filling chubby babies with lotus, door gods Qin Qiong and Yuchi Gong, opera scenes. The craft entered China's national intangible heritage register in 2006.",
    vd: {
      shape: "chubby lotus-holding babies, armoured door gods, theatre-stage tableaux",
      line: "crisp woodblock key-line with supple brush-filled drapery and rimmed colour blocks",
      composition: "central figure group with symmetrical attendants, a top title strip, packed festive borders",
      texture: "hand-tinted watercolour blooming over print, soft paper tooth, satiny pigment layers",
    },
    typ: {
      display: "brush-drawn title strips naming scenes; door gods' names in bold show-bill style",
      body: "songti woodblock text for legend captions and workshop marks",
      notes: "operatic titles frame the reading; the prints are labelled like stage bills",
    },
    lit: {
      quality: "winter workshop lamplight over the colouring tables",
      temperature: "warm-toned",
      shadow: "printed flats use no shadow; watercolour blooms imply depth",
    },
    ui: {
      background: "festival red with gold trim",
      surface: "print-plus-hand-colour grain",
      components: "door-guard paired buttons, title-strip headers, baby-and-lotus celebration icons",
      motion: "woodblock keyline printing first, then colours flooding in",
    },
  },
  {
    slug: "weifang-kites",
    ctx: "Weifang in Shandong is China's kite capital, its Weixian workshops bending bamboo into hard-wing and soft-wing frames covered in silk paper and painted with opera heroes and the dragon-headed centipede, a segmented flyer strung to tens of metres. Neighbouring Yangjiabu's nianhua block-cutters supplied the painting vocabulary. Weifang staged its first International Kite Festival in 1984 and was declared 'World Kite Capital' by the international kite federation in 1988, flying the festival each April.",
    vd: {
      shape: "hard-wing swallow kites, dragon-headed centipedes strung in segments, butterflies",
      line: "bamboo spine-and-wing curves traced by painted contours and tassel ribbons",
      composition: "symmetric face-like kite heads, painted medallions across taut silk, segmented trains",
      texture: "bamboo flex, translucent rice-paper glow, painted pigment crackle in wind",
    },
    typ: {
      display: "painted banner calligraphy across kite faces, often auspicious phrases",
      body: "kaishu labels naming kite types and masters' workshops",
      notes: "the bamboo frame's symmetry doubles as a typographic grid for the calligraphy",
    },
    lit: {
      quality: "April sky light filtering through rice-paper sails",
      temperature: "neutral-toned",
      shadow: "the kite body shading the ground far below; paper glowing against blue",
    },
    ui: {
      background: "April sky blue",
      surface: "translucent paper glow over a bamboo frame grid",
      components: "kite-face cards, segmented centipede progress, wind-ribbon notifications",
      motion: "kites rising on scroll; frames flexing in gusts, tassels trailing",
    },
  },
  {
    slug: "zhuanshi-seal-carving",
    ctx: "Seal carving (zhuanshi) works zhuanshu seal script — standardised under Qin Shi Huang in 221 BCE — into stone matrices for stamped red impressions. When scholar-artists took up the knife in the Ming, carving seals joined calligraphy and painting among the literati arts; Qing masters Ding Jing, Deng Shiru, Wu Changshuo and Qi Baishi cut intaglio baiwen and relief zhuwen characters into Shoushan and Qingtian stones. The Xiling Seal Art Society, founded at Hangzhou in 1904, remains the tradition's academy.",
    vd: {
      shape: "square seal matrices, bordered script fields, knobbed stone tops carved as beasts",
      line: "square-tension seal-script strokes with even line weight and rigorous grid discipline",
      composition: "characters mirrored for stamping; baiwen white-on-red and zhuwen red-on-white pairings",
      texture: "buttery soapstone cut faces, cinnabar paste gloss, ink bleed on paper impressions",
    },
    typ: {
      display: "zhuanshu seal script itself — baiwen intaglio and zhuwen relief impressions",
      body: "kaishu and running script set beside carved seals in scholar albums",
      notes: "the Xiling Seal Art Society (1904) codified study; stamped impressions are the print evidence",
    },
    lit: {
      quality: "scholar's desk lamp at the moment of stamping",
      temperature: "warm-toned",
      shadow: "cinnabar paste pooling in the intaglio; stone powder dusting the relief",
    },
    ui: {
      background: "rice-paper warm white",
      surface: "stone-cut texture with cinnabar red accents",
      components: "seal-stamp confirm buttons, mirrored-script icons, impression-grid gallery",
      motion: "stamp press with a red bloom; grid snapping like chisel work",
    },
  },
  {
    slug: "kangra-painting",
    ctx: "Kangra painting names the Pahari school that flowered under Raja Sansar Chand (r. 1775-1823) from his Sujanpur Tira court in Himachal Pradesh. Guler-trained heirs of Pandit Seu — the brothers Manaku and Nainsukh — brought fine squirrel-hair brushwork, tempera on wasli paper, and misty washes of green, ochre and pale blue. Subjects follow the Bhagavata Purana and Jayadeva's Gita Govinda: Krishna and Radha in groves, the Baramasa months. Gurkha invasion after 1805 thinned the ateliers.",
    vd: {
      shape: "slender Radha-Krishna figures, domed pavilions, looping cypress and banana groves",
      line: "hairline brush contour, fine double-line jewellery, tremulous foliage hatching",
      composition: "flat picture-plane vignettes framed by architecture; gentle diagonal narration, no cast shadow",
      texture: "burnished wasli surface, thin tempera veils, gold and beetle-wing accents",
    },
    typ: {
      display: "Devanagari verse captions identifying Baramasa months and Gita Govinda verses",
      body: "Takri script for the revenue documents and court records of Sansar Chand's administration",
      notes: "the paintings read like books: verse panels above and below, figures at the centre",
    },
    lit: {
      quality: "even tonal light, like the late monsoon glow the paintings describe",
      temperature: "neutral-toned",
      shadow: "shadows refused in pigment — depth comes from wash, never cast light",
    },
    ui: {
      background: "misted valley green-gold wash",
      surface: "burnished wasli smoothness",
      components: "verse-caption panels, pavilion-arch cards, delicate line icons",
      motion: "wash gradients blooming; foliage hatching drawing itself in",
    },
  },
  {
    slug: "dambulla-cave-temple-murals",
    ctx: "Dambulla's rock cave monastery in Sri Lanka's Matale District began when King Valagamba, sheltering there in the first century BCE, later endowed the shrines; five caves now hold 153 Buddha images, including a 14-metre reclining figure. Much of the painting was renewed in the Kandyan eighteenth century under King Kirti Sri Rajasinha: ceilings covered with rows of standing Buddhas, Jataka stories and makara torana arches across some 2,100 square metres. The Golden Temple of Dambulla joined UNESCO's list in 1991.",
    vd: {
      shape: "a reclining Buddha on a pillow, rows of identical standing Buddhas, makara-arch thrones",
      line: "sinuous outlined drapery, flame-like halo edges, painted pilaster striping",
      composition: "ceiling-to-floor programmes; repetitive Buddha ranks under vaulted rock canopies",
      texture: "pitted gneiss cave ceiling, Kandyan-era distemper bloom, gold-leaf highlights",
    },
    typ: {
      display: "painted Sinhala round-script titles naming the cave shrines and donor kings",
      body: "Sinhala and Pali devotional texts on modern signage boards",
      notes: "Kandyan-era repainting added donor genealogies; brass plaques now catalogue the caves",
    },
    lit: {
      quality: "cave darkness pierced by shrine lamps and doorway sunshafts",
      temperature: "warm-toned",
      shadow: "painted Buddhas emerging from rock blackness; gold leaf carrying the flame light",
    },
    ui: {
      background: "cave rock darkness with lamp-lit amber",
      surface: "pitted stone ceiling texture",
      components: "arched shrine cards, Buddha-file galleries, donor plaque footers",
      motion: "lamp glow blooming panel by panel; slow reverent fades",
    },
  },
]
