/**
 * patch-14b.ts — full-depth backfill patches for manifest-14b.json
 * (25 Art Movements + 10 Architectural Styles).
 * Contract: { slug, ctx, vd{shape,line,composition,texture}, typ{display,body,notes},
 *             lit{quality,temperature,shadow}, ui{background,surface,components,motion} }
 * Applied non-destructively by scripts/research/apply-patches.ts.
 */
export const PATCHES: any[] = [
  {
    slug: 'kalighat-painting',
    ctx: 'Kalighat painting grew from the patua scroll tradition of rural Bengal whose painters settled around the Kalighat Kali temple in Calcutta from the 1830s, selling quick watercolors on mill paper to pilgrims and colonial tourists. Workshop families drew in minutes with lampblack shading and one-stroke curves; satirical sheets on babu culture and the 1871-72 Tarakeshwar scandal created India\'s first urban picture market. W.G. Archer\'s 1953 study and the V&A collection fixed the reputation, and the swift line fed Jamini Roy.',
    vd: {
      shape: 'Flat single figures and pairs on plain grounds; schematic temple thumbnails and satirical type-casts of babus, saints, and courtesans.',
      line: 'One-stroke calligraphic curves — the famous fish-eye eye, looping skirt edges, swift caricature contour in lampblack.',
      composition: 'Figure centered on an empty washed ground, horizon line high, a fly-whisk or pillow prop balancing the mass.',
      texture: 'Mill paper tooth under thin watercolor washes, lampblack shading rubbed at edges, occasional tin-foil ornament.',
    },
    typ: {
      display: 'Hand-brushed Bengali captions and ornate English souvenir lettering on sheet margins',
      body: 'Bold Bengali bazaar printing of 19th-century Calcutta tracts',
      notes: 'Most sheets carry no text; captions appear on scandal prints naming Tarakeshwar protagonists.',
    },
    lit: {
      quality: 'Even studio daylight for rapid production; the flat palette carries all reading',
      temperature: 'warm-toned',
      shadow: 'Minimal modeling beyond lampblack hatching under chins and along drapery',
    },
    ui: {
      background: 'Washed paper ground, cream with faint gray bloom',
      surface: 'Flat color fields like diluted watercolor washes',
      components: 'Outlined cards with one-stroke corners, caption ribbons in Bengali-style lettering',
      motion: 'Quick stroke-in reveals, like a brush laying down a contour',
    },
  },
  {
    slug: 'nsukka-school',
    ctx: 'The Nsukka School formed when Uche Okeke — theorist of the 1958-61 Zaria Art Society and its "natural synthesis" doctrine — returned to lead art at the University of Nigeria, Nsukka in the late 1960s, teaching Igbo uli body and wall design as a modern medium. Chike Aniakor and Obiora Udechukwu carried the uli line into drawing and poetry; El Anatsui taught sculpture there from 1975. Working through the Biafran war, the group tied Igbo aesthetics to postcolonial identity; Okeke\'s Asele Institute in Nimo archived the movement.',
    vd: {
      shape: 'Flowing uli-inspired linear networks across flat fields; figures built from contour rather than mass.',
      line: 'Thin, confident hand-drawn uli curves — commas, crescents, twisted lines borrowed from body and wall painting.',
      composition: 'Linear motifs distributed evenly, symbol clusters (moon, tortoise, kola nut) balanced against open space.',
      texture: 'Uli dye soaked into paper or wall — matte, dry, slightly porous surface',
    },
    typ: {
      display: 'Uli-line display lettering and Nsibidi-derived ideograms, as on Okeke cover designs',
      body: 'Clean modern sans for the English text of Nsukka manifestos and catalogues',
      notes: 'Okeke set Nsibidi signs beside Latin text; poems and drawings share the page.',
    },
    lit: {
      quality: 'Dry Harmattan light, hard and white on the Nsukka sandstone campus',
      temperature: 'warm-toned',
      shadow: 'Shallow, cast off thin lines rather than depth',
    },
    ui: {
      background: 'Deep umber wall tones like freshly plastered compound walls',
      surface: 'Matte ochre panels carrying fine dark linework',
      components: 'Hairline-stroke icons, uli-curve dividers, ideogram badges',
      motion: 'Lines drawing themselves in, like uli strokes laid on a wall',
    },
  },
  {
    slug: 'ottoman-miniature',
    ctx: 'Ottoman miniature flourished in the nakkaşhane, the imperial painting atelier of Topkapı Palace, organized for dynastic histories under Süleyman the Magnificent (Arifi\'s Süleymanname, the Hünername). The Persian-trained Şahkulu developed the saz style of serrated fantasy leaves; Kara Memi introduced tulip-and-rose floral naturalism around 1558. During the Tulip Era Levni painted album scenes and the festival book of Ahmed III\'s 1720 Surname, before European oil portraiture displaced the craft. Production was collective and largely unsigned, serving the sultan\'s self-image.',
    vd: {
      shape: 'Thumb-high figures in flat profile within stacked architecture; saz leaves as knifed silhouettes.',
      line: 'Fine dark contour outlining every form; jali thuluth script bands acting as linear ornament.',
      composition: 'Double-page historical scenes with high horizon, tiered buildings, and gold-framed registers.',
      texture: 'Gouache on sized paper burnished to sheen; shell gold, lapis, and vermilion laid flat.',
    },
    typ: {
      display: 'Jali thuluth headings by court calligraphers inside ruled illuminated cartouches',
      body: 'Naskh narration columns of the Hünername and Surname manuscripts',
      notes: 'Illuminated rosettes open each text block; headings in white on gold or blue.',
    },
    lit: {
      quality: 'Shadowless, even illumination; color blocks carry all the light',
      temperature: 'warm-toned',
      shadow: 'Flat darker washes at doorways and under eaves, no cast shadows',
    },
    ui: {
      background: 'Cream manuscript ground with faint ruling lines',
      surface: 'Turquoise and vermilion panels edged in gold fillets',
      components: 'Cartouche headers, medallion buttons, gilt-framed image tiles',
      motion: 'Pages unrolling side to side like a double-page manuscript spread',
    },
  },
  {
    slug: 'indigenism',
    ctx: 'Peruvian Indigenism was institutionalized at Lima\'s Escuela Nacional de Bellas Artes (founded 1919), where director José Sabogal (1932-43) trained Camilo Blas, Teresa Carvallo, and Enrique Camino Brent to paint Quechua market scenes and Andean massifs in heavy earthen palettes. The movement rode José Carlos Mariátegui\'s journal Amauta (1926-30) and the search for a non-Hispanic national identity, with Mexican murals by Rivera and Orozco as the big example. Sabogal\'s ouster from the Escuela in 1943 made indigenism a national political question.',
    vd: {
      shape: 'Broad, monumental Andean figures — shawled women, shepherds — massed like the hills themselves.',
      line: 'Heavy drawn contours and simple folds; outlines read as carved rather than sketched.',
      composition: 'Figures low against horizon-high mountains; market rows and church steps as stage sets.',
      texture: 'Thick, dry-brushed oil over coarse canvas in earth ochres, browns, and grays',
    },
    typ: {
      display: 'Spanish Art Deco nationalist caps on posters and school hall plaques',
      body: 'Conservative Spanish serif of Lima journals such as Amauta',
      notes: 'Quechua names and place words appear diacritic-free or phonetic in Spanish print.',
    },
    lit: {
      quality: 'High-altitude white light flattening distance into clear planes',
      temperature: 'cool-toned',
      shadow: 'Compact, violet-gray shade behind figures, little aerial perspective',
    },
    ui: {
      background: 'Ochre-to-umber gradient like distant cordillera',
      surface: 'Rough canvas-texture panels in terracotta and gray',
      components: 'Framed market-stall cards, banner-style headers in nationalist caps',
      motion: 'Slow vertical pans like climbing a mountain pass',
    },
  },
  {
    slug: 'prague-group',
    ctx: 'The Prague Group — the Skupina výtvarných umělců, founded in Prague in 1911 after splitting from the Mánes union — gathered Emil Filla, Bohumil Kubišta, Otakar Kubín, Antonín Procházka, and Vincenc Benéš, who digested French Cubism and Fauvism into a Czech idiom. Their journal Umělecký měsíčník argued that modernism and national tradition could fuse; architect members Josef Gočár and Pavel Janák translated the same geometry into Czech Cubist buildings, led by Gočár\'s House of the Black Madonna (1912) on Celetná street.',
    vd: {
      shape: 'Fractured bottles, guitars, and heads split into prismatic planes; buildings as faceted crystals.',
      line: 'Sharp crystal edges and radiating facet lines borrowed from analytic Cubism.',
      composition: 'Central motif exploded upward, planes interlocking around an axis; steep foreground tilts.',
      texture: 'Matte oil in grays, ochres, and muted blues, with a drawn charcoal under-layer showing',
    },
    typ: {
      display: 'Angular Czech avant-garde lettering with cut and stepped strokes',
      body: 'Neat Czech serif of Umělecký měsíčník articles',
      notes: 'Diacritics (ř, ů) handled with pride; titles set in spaced capitals.',
    },
    lit: {
      quality: 'Overcast Bohemian daylight, even and analytical',
      temperature: 'cool-toned',
      shadow: 'Facet planes darkened independently of the light source',
    },
    ui: {
      background: 'Cool gray paper with faint charcoal smudges',
      surface: 'Ochre panels overlaid with hard-edged translucent planes',
      components: 'Faceted corner brackets, stepped dividers, prism-cut buttons',
      motion: 'Planes rotating and refolding like shifting cubist facets',
    },
  },
  {
    slug: 'visionary-environments',
    ctx: 'Visionary environments are monumental yards and shelters built by self-taught makers outside the art market: postman Ferdinand Cheval laid his Palais Idéal at Hauterives, France from 1879 to 1912; Italian immigrant laborer Simon Rodia raised the Watts Towers in Los Angeles between 1921 and 1954; Baptist preacher Howard Finster began Paradise Garden in 1961. Salvation, scripture, and hoarded found materials drive the ornament. Critics such as John Maizels catalogued the genre, and the American Folk Art Museum and Lausanne\'s Collection de l\'Art Brut canonized it.',
    vd: {
      shape: 'Towers, grottos, and bottle spires accreting over decades into whole-yard architectures.',
      line: 'Found-object edges — bottle glass rims, tile shards, cement drips — doing the drawing.',
      composition: 'Enclosed sacred precincts: paths, gates, and scripture stations choreograph the visitor.',
      texture: 'Embedded glass, ceramics, shells, and tools set in gun-gray cement',
    },
    typ: {
      display: 'Hand-painted scripture lettering in wobbling capitals, often red on white',
      body: 'Sign-painter shorthand, stencils, and freehand captions on board and cement',
      notes: 'Quotes from Revelation and personal theology; names, dates, and tithes incised wet.',
    },
    lit: {
      quality: 'Outdoor sunlight refracting through embedded glass and bottle walls',
      temperature: 'warm-toned',
      shadow: 'Yard shade under pergolas and tower stubs at noon',
    },
    ui: {
      background: 'Weathered concrete gray flecked with buried color shards',
      surface: 'Mosaic tiles with cement grout and glinting glass inclusions',
      components: 'Gate-arch menus, sign-post labels, shard-mosaic buttons',
      motion: 'Slow accretion animations, elements settling like ongoing construction',
    },
  },
  {
    slug: 'wpa-printmaking',
    ctx: 'Roosevelt\'s Works Progress Administration put printmakers on federal pay through the Federal Art Project (1935-43). The New York Graphic Arts Division under Anthony Velonis popularized serigraphy with his 1937 silk-screen manual, issuing tens of thousands of posters and print sets for schools and libraries. Louis Lozowick, Mabel Dwight, Harry Sternberg, and Kyra Markham documented strikes, construction, and urban life while the program seeded community art centers across most states, training artists who carried the social-document lithograph into the war years.',
    vd: {
      shape: 'Squat worker figures and bridge, dam, and factory masses simplified to poster geometry.',
      line: 'Broad lithographic crayon strokes and clean silkscreen flats side by side.',
      composition: 'Monumental low horizons; workers and structures fill the frame edge to edge.',
      texture: 'Litho grain and screen mesh visible in gray inks; torn stencil edges',
    },
    typ: {
      display: 'Condensed sans caps of WPA federal posters, often two-color silkscreen',
      body: 'Trade Gothic-style jobbing type of community center bulletins',
      notes: 'See America and project posters paired slogan caps with flat pictograms.',
    },
    lit: {
      quality: 'Overcast documentary light, tonal grays dominant',
      temperature: 'neutral',
      shadow: 'Broad graphite shade anchoring figures to the page',
    },
    ui: {
      background: 'Newsprint off-white with faint litho grain',
      surface: 'Two-ink poster flats in cream and slate blue',
      components: 'Banner headers, stencil icon buttons, project-report cards',
      motion: 'Ink-roller passes revealing content like a pulled print',
    },
  },
  {
    slug: 'dusseldorf-school-of-painting',
    ctx: 'The Düsseldorf school centered on the Kunstakademie Düsseldorf under director Wilhelm von Schadow (1826-59), who made the Rhineland academy one of Europe\'s busiest art schools, drawing students from America, Scandinavia, and Russia. Andreas and Oswald Achenbach, Carl Friedrich Lessing, and Johann Wilhelm Schirmer built minutely finished historical landscapes; Emanuel Leutze painted Washington Crossing the Delaware there in 1851. Graduates such as Worthington Whittredge and Albert Bierstadt carried the school\'s detailed execution into American landscape painting.',
    vd: {
      shape: 'Low historical landscape masses — crags, oaks, ruined towers — under towering skies.',
      line: 'Meticulous branch-by-branch contour; engraving-like finishing over tonal starts.',
      composition: 'Stage-like valleys with staffage figures; depth built in receding tonal bands.',
      texture: 'Smooth enamel-like oil finishing, glazes over underpaint, almost no visible brush',
    },
    typ: {
      display: 'Fraktur exhibition titles on academy announcements',
      body: 'Latin-script German serif of academy catalogs and letters',
      notes: 'Dedication sheets and etchings caption figures in fine engraved script.',
    },
    lit: {
      quality: 'Rhine valley golden-gray light, highly staged',
      temperature: 'warm-toned',
      shadow: 'Deep umbers in foreground groves, luminous distances behind',
    },
    ui: {
      background: 'Smoky sepia gradient like varnished canvas',
      surface: 'Dark wood-and-bronze frames around glazed panels',
      components: 'Medallion labels, engraved-rule dividers, gilt accent borders',
      motion: 'Glaze-like crossfades, images clarifying slowly from dark ground',
    },
  },
  {
    slug: 'precisionism',
    ctx: 'Precisionism was the first homegrown American modernism: after World War I, Charles Sheeler, Charles Demuth, Georgia O\'Keeffe, Louis Lozowick, and Preston Dickinson turned factories, grain elevators, and skyscrapers into hard-edged geometric compositions learned from Parisian Cubism. Sheeler photographed Ford\'s River Rouge plant in 1927 and distilled it into American Landscape (1930); Demuth\'s My Egypt (1927) framed Lancaster grain elevators. Alfred H. Barr\'s young Museum of Modern Art named and championed the tendency, tying national imagery to machine-age capitalism.',
    vd: {
      shape: 'Factory sheds, silos, and stacks reduced to interlocking cylinders and right-angle slabs.',
      line: 'Taut ruled edges; railroad curves and chimney verticals carry the eye.',
      composition: 'Aerial and frontal views compressed; planes overlap in shallow stage space, sky a flat band.',
      texture: 'Smooth airbrushed-look oil, hard surfaces, zero impasto',
    },
    typ: {
      display: 'Geometric sans signage lettering, as on the giant numerals of Demuth\'s Figure 5',
      body: 'Streamlined grotesque captions in MoMA-era exhibition catalogs',
      notes: 'Wordless paintings titled like industry: My Egypt, American Landscape.',
    },
    lit: {
      quality: 'Blinding midday industrial light with no atmospheric haze',
      temperature: 'cool-toned',
      shadow: 'Crisp geometric shade slices cast by pure sun',
    },
    ui: {
      background: 'Flat porcelain-white sky gradient',
      surface: 'Machined steel-gray panels with cold highlights',
      components: 'Grid-aligned cards, gauge-style dials, stencil section numbers',
      motion: 'Precise linear slides, elements docking like machine parts',
    },
  },
  {
    slug: 'sosaku-hanga',
    ctx: 'Sōsaku-hanga ("creative prints") rejected the ukiyo-e division of designer, carver, and printer: Yamamoto Kanae\'s Fish (1904) and Onchi Kōshirō\'s abstract Lyric 5 (1915) were designed, carved, and pulled by the artists themselves. Hiratsuka Un\'ichi organized the Japan Creative Print Association in 1918, and the journal Hosun (1915) circulated handmade impressions to a small subscriber club. Postwar American collectors, especially in Chicago, made the movement respectable, and Munakata Shikō\'s prize-winning woodblocks carried it to international biennials.',
    vd: {
      shape: 'Carved-edge forms — boats, trees, faces — whose irregular knife contour is the subject.',
      line: 'Visible gouge lines, uneven baren pressure rings, torn-block registration quirks',
      composition: 'Asymmetric whites dominating; single motifs isolated in empty sheet',
      texture: 'Woodgrain pressed into ink, sumi blacks over washi fiber tooth',
    },
    typ: {
      display: 'Hand-carved kanji and katakana title bands cut by the artist himself',
      body: 'Minchō print captions in the self-published artist book',
      notes: 'Red seal stamps (hanko) sign each impression; editions are small and numbered.',
    },
    lit: {
      quality: 'Absorbed daylight on paper, ink tones doing all the modeling',
      temperature: 'neutral',
      shadow: 'Flat gray overprint shadows instead of depth',
    },
    ui: {
      background: 'Washi cream with visible fiber flecks',
      surface: 'Unbleached paper panels with deckle edges',
      components: 'Seal-stamp icons, knife-cut dividers, edition-number badges',
      motion: 'Baren-smooth fades, images emerging as if burnished through paper',
    },
  },
  {
    slug: 'anthropophagy',
    ctx: 'Anthropophagy crystallized when Tarsila do Amaral gave Oswald de Andrade Abaporu ("man who eats") in January 1928; he answered with the Manifesto Antropófago in the first Revista de Antropofagia (May 1928), urging Brazil to devour European culture — Cubism absorbed in Paris — and re-digest it with Tupi and Afro-Brazilian substance. Built on the 1922 Semana de Arte Moderna, the movement armed Paulista modernism with anti-colonial satire; the Tropicalists of 1967-68, from Hélio Oiticica to Caetano Veloso, re-cannibalized its program.',
    vd: {
      shape: 'Ballooned ochre figures and monstrous hybrids — Abaporu\'s giant foot and tiny head.',
      line: 'Thick dark contour enclosing flat tropical color plates',
      composition: 'Sun disc, cactus, and figure locked in shallow tropical space; poster-like frontality.',
      texture: 'Matte gouache-tempera surfaces in Pernambuco sand tones',
    },
    typ: {
      display: 'Manifesto capitals mixing Tupi words — Tabu, Abaporu — into European type',
      body: 'Bold condensed sans of Revista de Antropofagia pages',
      notes: 'Numbered manifesto clauses in telegraphic sentences; French and Tupi juxtaposed.',
    },
    lit: {
      quality: 'Equatorial noon glare flattening every form',
      temperature: 'warm-toned',
      shadow: 'Minimal, hard-edged shade locked under figures',
    },
    ui: {
      background: 'Sun-burnt ochre and green washes',
      surface: 'Flat tropical color plates in orange, green, clay',
      components: 'Tooth-shaped cursor accents, sun-disc loaders, contour buttons',
      motion: 'Bouncy, devouring transitions — elements gulping into frame',
    },
  },
  {
    slug: 'sunday-painters',
    ctx: '"Sunday painters" names the amateur tradition of non-professionals who paint at leisure — clerks, farmers, retirees — outside academy and market. Its canon was built by discovery: Grandma Moses, a Washington County, New York farmwife, began painting in her late seventies, entered Louis J. Caldor\'s collection in 1938, appeared in MoMA\'s 1939 Contemporary Unknown American Painters exhibition, and opened at Otto Kallir\'s Galerie St. Etienne in 1940. Sidney Janis\'s 1942 book They Taught Themselves gave such self-taught makers a museum shelf.',
    vd: {
      shape: 'House-front, barn, and flower forms drawn from memory, sized by importance not optics.',
      line: 'Wobbly untrained contour, repeated for confidence, occasionally outlined twice',
      composition: 'Whole worlds at once — interiors seen through walls, roads coiling upward in bird-eye tilts.',
      texture: 'House paint and hobby oils on cardboard, brush marks unbeaten',
    },
    typ: {
      display: 'Naive hand-lettered titles in uneven capitals',
      body: 'Typewriter and gift-shop serif captions on amateur frames',
      notes: 'Dated and signed front and back; titles sometimes composed by relatives or dealers.',
    },
    lit: {
      quality: 'Pleasant daylight without weather logic; shadows optional',
      temperature: 'warm-toned',
      shadow: 'Soft blob shading wherever the brush remembered it',
    },
    ui: {
      background: 'Warm cream like living-room wallpaper',
      surface: 'Cardboard-textured panels with hobby-paint sheen',
      components: 'Frame-within-frame cards, doily corners, sticker badges',
      motion: 'Gentle tilts and nudges, like paintings propped on a sideboard',
    },
  },
  {
    slug: 'makonde-art',
    ctx: 'Makonde carving centers on the Mueda plateau of Mozambique and adjacent southern Tanzania and its dense mpingo ebony. Ritual mapiko face masks, danced by initiated men, survived colonial suppression, while a secular modern school emerged in Dar es Salaam after 1950 around the dealer Mohamed Peera: George Lilanga\'s shetani (spirit) figures and the stacked ujamaa family-tree columns, read as endorsement of Nyerere\'s 1967 socialism, sold through national museums and tourist galleries, internationalizing a village craft within a generation.',
    vd: {
      shape: 'Columnar ujamaa family-tree figures stacked vertically; mask faces broad and helmet-like.',
      line: 'Deep gouged scarification lines looping across cheeks and bodies',
      composition: 'Totemic verticality — ancestors carried upward on one trunk; masks centered in display.',
      texture: 'Polished ebony (mpingo) heartwood gloss against rough bark rind left intact',
    },
    typ: {
      display: 'Bold carved initials and Swahili titles such as Shetani on base plaques',
      body: 'Simple gallery sans of Dar es Salaam dealer cards',
      notes: 'Titles alternate Swahili and Portuguese; maker names hand-inked under bases.',
    },
    lit: {
      quality: 'Hard tropical light snapping highlights off polished ebony',
      temperature: 'neutral',
      shadow: 'Deep black shadow pooled inside carved interstices',
    },
    ui: {
      background: 'Deep espresso brown like oiled ebony',
      surface: 'Glossy blackwood panels with carved-line accents',
      components: 'Totem-column nav rails, scarification-line dividers, mask icons',
      motion: 'Stacked elements rising like carved figures on a family-tree column',
    },
  },
  {
    slug: 'chinese-social-realism',
    ctx: 'Chinese social realism descends from Mao Zedong\'s 1942 Yan\'an Talks on Literature and Art, which ordered art to serve workers, peasants, and soldiers. In the 1950s the Central Academy of Fine Arts in Beijing adopted Soviet academic oil painting through the Maximov training class (1955-57); revolutionary realism combined with revolutionary romanticism was codified by Zhou Yang in 1960. The Cultural Revolution pushed the formula to its peak in Liu Chunhua\'s Chairman Mao Goes to Anyuan (1967) and mass posters; official figuration never fully left Chinese state art after it.',
    vd: {
      shape: 'Heroic proletarian figures monumentalized at foreground scale, muscles and cheekbones idealized.',
      line: 'Academic oil contour fused with brush-drawn drapery; gesture lines read as slogans.',
      composition: 'Red flags, leader portraits, and rays organizing pyramid compositions; crowds sweeping upward.',
      texture: 'Smooth academic glaze over canvas; printed posters add halftone dot',
    },
    typ: {
      display: 'Bold heiti and songti slogan lettering, white or yellow on red',
      body: 'Standard songti of People\'s Daily editorial pages',
      notes: 'Simplified characters mandatory after 1956; quotations set as inset banners.',
    },
    lit: {
      quality: 'Radiant sunrise glow emanating from leaders\' faces',
      temperature: 'warm-toned',
      shadow: 'Soft heroic shading, edges lifted by red rim light',
    },
    ui: {
      background: 'Revolutionary red gradient with faint ray motifs',
      surface: 'Glossy poster-red panels with gold-trim headers',
      components: 'Banner-style nav, badge emblems, quotation inset cards',
      motion: 'Flag-like waving transitions, content unfurling left to right',
    },
  },
  {
    slug: 'norwich-school',
    ctx: 'The Norwich Society of Artists, founded in 1803 by John Crome and Robert Ladbrooke, ran annual exhibitions until 1833 — Britain\'s first provincial art movement. Crome painted Mousehold Heath from direct observation in the manner of Dutch masters such as Hobbema; John Sell Cotman, the school\'s other pole, flattened Greta Bridge and Norfolk watermills into patterned washes over ruled pencil underdrawing. James Stark, George Vincent, and John Thirtle spread the tonal, locally rooted landscape vision through etchings and portfolios.',
    vd: {
      shape: 'Broad heath horizons, wind-bent oaks, watermills squatting in flat Norfolk valleys.',
      line: 'Precise etched outlines for print, broader oily contour for canvas; Cotman ruled pencil grids.',
      composition: 'Low tonal bands stacked to the horizon; small figures and cattle as scale keys.',
      texture: 'Dry earthy oil over linen, scumbled distances, gritty etched paper for prints',
    },
    typ: {
      display: 'Engraved roman capitals titling etchings and society catalogs',
      body: '19th-century English serif of exhibition handbills',
      notes: 'Society labels list members alphabetically; plates signed in copperplate script.',
    },
    lit: {
      quality: 'Changeable North Sea light — silvered overcast breaking into gleam',
      temperature: 'neutral',
      shadow: 'Warm umber foreground shade against luminous skies',
    },
    ui: {
      background: 'Muted heather-green to gray gradient',
      surface: 'Aged paper panels with plate-mark shadows',
      components: 'Etched-line rules, frame plaques, catalog-style lists',
      motion: 'Cloud shadows drifting across panels like weather passing a heath',
    },
  },
  {
    slug: 'metamodernism',
    ctx: 'Metamodernism was named as an aesthetic by Dutch theorists Timotheus Vermeulen and Robin van den Akker in their 2010 essay "Notes on Metamodernism," describing an oscillation between modernist sincerity and postmodern irony; Luke Turner\'s Metamodernist Manifesto (2011) gave it a second frame. The pair\'s web journal catalogued works such as Marina Abramović\'s The Artist Is Present (MoMA, 2010) and Lars von Trier\'s Melancholia as neither naive nor merely detached. The term spread from Dutch cultural criticism into biennales, festival programming, and a decade of art discourse.',
    vd: {
      shape: 'Sincere monumental forms wrapped in ironic gradients — neither naive nor knowing.',
      line: 'Hand-drawn warmth and digital precision sharing one axis, oscillating.',
      composition: 'Symmetries that hold and slip: centered subjects orbiting uncentered meaning.',
      texture: 'Slick digital render up close, human texture at distance — or reversed',
    },
    typ: {
      display: 'Serif-sans hybrid display type pivoting mid-word between eras',
      body: 'Neutral grotesque body text, the journal-blog standard',
      notes: 'Pairings everywhere: hopeful color with deadpan captions; manifestos numbered.',
    },
    lit: {
      quality: 'Studio limelight and screen glow sharing the same stage',
      temperature: 'neutral',
      shadow: 'Dramatic stage shade interrupted by flat digital glow',
    },
    ui: {
      background: 'Infinite-white field with a faint sunset gradient rising',
      surface: 'Frosted glass panels over sincere deep color',
      components: 'Dual-state buttons, oscillating toggles, manifesto cards',
      motion: 'Continuous pendulum easing between modernist snaps and postmodern floats',
    },
  },
  {
    slug: 'sudanese-kriatalism',
    ctx: 'Sudanese "Kri-talism" belongs to the Khartoum School\'s afterlife. The School formed around 1960 at Khartoum\'s art college with Ibrahim El-Salahi, Ahmed Shibrain, and Tag el-Sir Ahmed, fusing Arabic calligraphy, Islamic arabesque, and African motifs into modern Sudanese painting. In 1976 the Crystalist group, close to Kamala Ibrahim Ishag, published a manifesto in the newspaper Al-Ayyam declaring transparency and crystalline perception against the School\'s nationalist ornament. El-Salahi\'s 2013 Tate Modern retrospective fixed the lineage\'s global standing.',
    vd: {
      shape: 'Flat frontal figures and masks built from Arabic letterforms unfolding into faces.',
      line: 'Sini and Kufic strokes bent into brow, eye, and shoulder; transparency everywhere',
      composition: 'Central calligraphic figure over woven arabesque fields; layered translucency like glass.',
      texture: 'Ink, gouache, and burnished leather tones; batik-like crackle in later work',
    },
    typ: {
      display: 'Stylized Arabic display lettering doubling as imagery',
      body: 'Naskh Arabic with Sudanese Latin captions beside it',
      notes: 'Crystalist manifesto prose prized clarity; El-Salahi blurred word and figure deliberately.',
    },
    lit: {
      quality: 'Khartoum furnace light softened to translucency on paper',
      temperature: 'warm-toned',
      shadow: 'Washed umber shade as thin as the paper itself',
    },
    ui: {
      background: 'Sun-bleached sand ground with faint calligraphic watermark',
      surface: 'Parchment panels carrying letterform linework',
      components: 'Glyph-shaped icons, transparent overlay cards, woven-pattern rules',
      motion: 'Letters dissolving into figures and back, slow morph loops',
    },
  },
  {
    slug: 'digital-folk-art',
    ctx: 'Digital folk art names the vernacular image-making of non-professionals on internet platforms: MS Paint compositions, Impact-font memes, pixel-art tributes, devotional graphics forwarded on WhatsApp, and fan templates traded on DeviantArt (founded 2000), Tumblr (2007), and Instagram. Like fairground and farmgate crafts before them, these images evolve by copying with variation — the template-and-remix meme economy — and scholars such as Henry Jenkins read them through participatory culture (Convergence Culture, 2006). Marketplaces like Etsy digitize folk motifs in parallel.',
    vd: {
      shape: 'Blocky sprites, clip-art suns, and meme rectangles with hard 8-bit corners.',
      line: 'Aliased pixel steps and default-brush curves, saved and re-saved into mush.',
      composition: 'Centered subject, caption bar above and below, watermark corner badge.',
      texture: 'JPEG compression artifacts, dithered gradients, sticker die-cut edges',
    },
    typ: {
      display: 'Impact or Comic Sans caption stacks, white on black bar',
      body: 'System-default sans of forum posts and group chats',
      notes: 'Emoji replace punctuation; usernames function as signatures and guild marks.',
    },
    lit: {
      quality: 'Screen backlight, unmodulated, RGB primaries only',
      temperature: 'neutral',
      shadow: 'Hard drop shadows and beveled frames from 2000s default tools',
    },
    ui: {
      background: 'Slack-black or clash-gradient with dithered starfields',
      surface: 'Glossy sticker panels with die-cut white edges',
      components: 'Reaction buttons, badge stickers, template remix cards',
      motion: 'Looping GIF bounce and blink, frames re-cycled from templates',
    },
  },
  {
    slug: 'constructive-universalism',
    ctx: 'Joaquín Torres-García, Uruguayan, spent 43 years in Barcelona, New York, and Paris — co-founding Cercle et Carré with Michel Seuphor in 1930 — before returning to Montevideo in 1934 to codify Universalismo Constructivo: a golden-section grid populated by pictographic signs (sun, fish, boat, anchor, heart, house). His 1936 América Invertida flipped South America to the top of the map. The Taller Torres-García (1943) trained Julio Alpuy, Gonzalo Fonseca, and José Gurvich; the 1944 Martirené hospital murals staged the theory in public.',
    vd: {
      shape: 'Rectangle subdivided by golden-section grid; circles, arcs, and sign-tokens set upon it.',
      line: 'Single-weight ruled lines; every stroke legible as construction geometry',
      composition: 'Grid as cosmogram — sun, fish, anchor, boat, heart, house distributed like a lexicon.',
      texture: 'Flat gouache on board, chalk-white paper showing at edges of color',
    },
    typ: {
      display: 'Geometric capitals set strictly to the same modular grid',
      body: 'Clean sans of Círculo y Cuadrado journal pages',
      notes: 'Torres-García drew his own pictographic type; signs double as alphabet.',
    },
    lit: {
      quality: 'Studio-even light, no atmosphere, color doing the work',
      temperature: 'neutral',
      shadow: 'None; darker values are second colors, not shade',
    },
    ui: {
      background: 'Grid-paper cream with printed golden-section guides',
      surface: 'Flat color tiles inside a visible modular grid',
      components: 'Sign-icon set (sun, fish, boat), grid-aligned buttons, axis rulers',
      motion: 'Elements snapping to grid, south-up map flips on load',
    },
  },
  {
    slug: 'maori-ta-moko',
    ctx: 'Tā moko, Māori skin carving, recorded whakapapa (genealogy), rank, and deeds: men wore full-face moko, women the moko kauae chin tattoo. Tohunga tā moko cut designs with albatross-bone uhi chisels, tapping soot-black ngārehu pigment into grooves; later metal needles flattened the cut. The Tohunga Suppression Act 1907 helped drive the practice underground. Moko kauae revived from the 1970s-80s through leaders like Derek Lardelli, while Te Papa\'s Karanga Aotearoa programme (2003) repatriates tattooed heads (toi moko) taken by colonial collectors.',
    vd: {
      shape: 'Spiral koru and double-spiral pitau swelling across cheeks, forehead, and chin.',
      line: 'Grooved chisel tracks — deep ridged lines alternating with shallow fine hatching',
      composition: 'Moko maps whakapapa: hemispheres of the face divided into genealogical fields.',
      texture: 'Raised scar ridges and inked grooves; skin treated as carved wood',
    },
    typ: {
      display: 'Chiseled capital lettering with spiral terminals on carved lintels',
      body: 'Early missionary-print serif for Māori-language texts',
      notes: 'Modern use honors macrons (ā, ō); ancestor names accompany moko in records.',
    },
    lit: {
      quality: 'Raking light that exposes every groove of the carving',
      temperature: 'neutral',
      shadow: 'Dark inked furrows against raised skin ridges',
    },
    ui: {
      background: 'Charcoal ground with faint koru watermarking',
      surface: 'Carved-wood texture panels with groove shadows',
      components: 'Koru-spiral loading rings, chiseled dividers, whakapapa list trees',
      motion: 'Spirals unfurling like fern fronds on state change',
    },
  },
  {
    slug: 'showa-modern',
    ctx: 'Shōwa modern names Tokyo\'s urban style between the 1923 earthquake reconstruction and the mid-1930s: café culture, cinema, the moga ("modern girl") and mobo of Ginza. Sugiura Hisui\'s posters as Mitsukoshi art director, the constructivist group MAVO founded by Murayama Tomoyoshi in 1923, and Yumeji Takehisa\'s shop imagery blended Art Deco, Bauhaus graphics, and Edo craft into a distinctly Japanese urban chic. Department-store windows, jazz kissa interiors, and advertising carried it until militarism shut the scene down.',
    vd: {
      shape: 'Streamlined cylinders, stepped ziggurat shopfronts, wafer-thin coffee-spoon curves.',
      line: 'Deco rays, zigzag borders, and speed lines running through vertical Japanese text.',
      composition: 'Poster stacks: product hero, radiating sunburst, bilingual brand lockup.',
      texture: 'Chromolithograph gloss, pochoir flats, lacquer-black grounds',
    },
    typ: {
      display: 'Art Deco katakana display type with cut counters and stepped strokes',
      body: 'Minchō for text columns, set vertically with Western numerals beside',
      notes: 'Department-store posters pair Edo craft motifs with jazz-age deco geometry.',
    },
    lit: {
      quality: 'Electric nightlife glow — café bulbs and cinema marquees',
      temperature: 'warm-toned',
      shadow: 'Ink-flat shade with deco drop-shadow blocks',
    },
    ui: {
      background: 'Cream deco field with radiating sunburst motif',
      surface: 'Lacquer-black and vermilion panels with gilt edge-lines',
      components: 'Marquee-style headers, zigzag dividers, ticket-stub buttons',
      motion: 'Marquee-bulb chasing, panels swiveling like shop displays',
    },
  },
  {
    slug: 'mono-ha',
    ctx: 'Mono-ha ("school of things") coalesced in 1968-70, when Nobuo Sekine\'s Phase—Mother Earth (1968, Suma Rikyū Park, Kobe) — a cylinder of earth dug up and reburied — turned sculpture into the bare relation of materials. The artist-theorist Lee Ufan set out its logic in Sonzai to mu o koete (1970); Kishio Suga, Susumu Koshimizu, Kōji Enokura, and Katsuro Yoshida propped stone against steel, earth, paraffin, and rope without fabrication. Critic Toshiaki Minemura coined the label; the 1970 Tokyo Biennale "Between Man and Matter" gave the group its frame.',
    vd: {
      shape: 'Raw slabs, boulders, and earth pits left as found, propped not shaped.',
      line: 'Gravity-drawn contact lines where steel meets stone meets floor',
      composition: 'Two or three materials in tension across emptiness; the gap is the work.',
      texture: 'Unfinished matter — rust bloom, damp earth, paraffin sheen, raw stone',
    },
    typ: {
      display: 'Thin minchō or unadorned gothic type, nearly invisible titles',
      body: 'Sparse Japanese text blocks with extreme margins',
      notes: 'Catalogs list materials and dates only; no interpretation offered.',
    },
    lit: {
      quality: 'Gallery fluorescence flattened to warehouse evenness',
      temperature: 'neutral',
      shadow: 'Soft contact shadows recording weight, nothing more',
    },
    ui: {
      background: 'Raw concrete gray, boards and bolts showing',
      surface: 'Untreated panels: stone, rusted steel, plywood swatches',
      components: 'Hairline rules, weight-balanced layout, material-name labels',
      motion: 'Near-imperceptible settling drifts; content rests, barely breathing',
    },
  },
  {
    slug: 'bio-art',
    ctx: 'Bio art works with living systems: Joe Davis encoded the icon Microvenus into bacterial DNA at MIT in 1990; Eduardo Kac\'s GFP Bunny (2000) made Alba, a rabbit engineered with green fluorescent protein, the movement\'s emblem; Oron Catts and Ionat Zurr founded SymbioticA at the University of Western Australia in 2000, growing Victimless Leather (2004) and teaching artists to work inside biology labs. Marta de Menezes altered butterfly wing patterns in Nature? (1999). Dutch platforms — The Hague\'s ArtScience Interfaculty, Amsterdam\'s Waag — spread the practice.',
    vd: {
      shape: 'Proliferating cell masses, vessel trees, and lab-grown forms grown, not carved.',
      line: 'Branching capillary and hypha curves; electrophoresis bands as serial stripes',
      composition: 'Specimen centered in sterile white; sequence data framed as ornament',
      texture: 'Translucent membrane, bacterial bloom matte, agar gloss',
    },
    typ: {
      display: 'Clinical neo-grotesk with codon strings (ATGC) as display elements',
      body: 'Lab-report sans with numbered protocol steps',
      notes: 'Petri labels, timestamps, and consent disclaimers are part of the artwork.',
    },
    lit: {
      quality: 'Cold incubator and biosafety-cabinet light, UV accents',
      temperature: 'cool-toned',
      shadow: 'Minimal shadow; backlit slides and glowing transgenes instead',
    },
    ui: {
      background: 'Sterile white with faint grid like a culture plate',
      surface: 'Glass-slide panels, wet-look gloss edges',
      components: 'Sample-tray cards, status LEDs, protocol checkboxes',
      motion: 'Slow bloom growth, cells dividing across load states',
    },
  },
  {
    slug: 'driftwood-sculpture',
    ctx: 'Driftwood sculpture turns tide-bleached timber into figure and architecture, a beachcombing craft from the North Atlantic to the Pacific Northwest. Heather Jansch (Devon, 1948-2021) built life-size horses from salvaged oak, elm, and pine, casting several in bronze; Jeff Uitto assembles whales and horses from Puget Sound logs; Oregon coastal towns still show driftwood works at summer festivals. Salt-cured grain, silvered surface, and nail-free joinery define the craft wherever storm-cast wood and patient makers meet.',
    vd: {
      shape: 'Equine and leviathan silhouettes assembled from branch, root, and plank fragments.',
      line: 'Grain lines and tide-worn edges doing the anatomy; no tool marks competing',
      composition: 'Weight borne on a few structural members; mass gathering where limbs knot',
      texture: 'Salt-bleached silver gray, checked splits, barnacle scars at the base',
    },
    typ: {
      display: 'Whittled, hand-painted sign lettering on driftwood plaques',
      body: 'Plain serif of coastal gallery cards and beach-festival posters',
      notes: 'Titles list woods and salvage beaches; maker stamps burned into bases.',
    },
    lit: {
      quality: 'Raking coastal evening light that silverizes the wood',
      temperature: 'warm-toned',
      shadow: 'Long sea-level shadows stretching under the sculpture',
    },
    ui: {
      background: 'Sea-glass gray-green like tide-line haze',
      surface: 'Weathered timber texture with silvered grain',
      components: 'Drift-plank cards, rope-line dividers, beachcomber icon set',
      motion: 'Slow tide-like easing, elements washing gently into place',
    },
  },
  {
    slug: 'neuve-invention',
    ctx: '"Neuve Invention" was coined in the early 1980s by Michel Thévoz, founding director of Lausanne\'s Collection de l\'Art Brut (opened 1976 to house Jean Dubuffet\'s 1971 donation), for self-taught work too aesthetically aware to qualify as strict Art Brut, which demanded total indifference to public recognition. The museum\'s upper rooms showed such creators — often psychiatric or institutional outsiders who nonetheless composed deliberately — as a bridge between Dubuffet\'s hardcore category and art singulier, opening an argument about where "outsider" begins.',
    vd: {
      shape: 'Deliberate, composed formats — notebooks, panels, shrines — showing practiced construction.',
      line: 'Confident rule and border work; systematic hatching where Art Brut is involuntary',
      composition: 'Ordered registers and symmetries, the maker visibly staging the image',
      texture: 'Mixed found surfaces — magazine transfers, pencil polish, household paint',
    },
    typ: {
      display: 'Swiss-neutral museum lettering of Lausanne catalogs in Univers style',
      body: 'French serif essay text in Collection de l\'Art Brut monographs',
      notes: 'Wall labels give dates and institutions only, refusing pathology gossip.',
    },
    lit: {
      quality: 'Cool museum track-light, protective and clinical',
      temperature: 'neutral',
      shadow: 'Conserved flat lighting, glass-case reflections the only depth',
    },
    ui: {
      background: 'Gallery-white with faint archival gray',
      surface: 'Archival mat boards and glass-glint panels',
      components: 'Catalog-number chips, vitrine cards, restrained Swiss nav',
      motion: 'Curated crossfades, unhurried and catalog-quiet',
    },
  },
  {
    slug: 'sudano-sahelian-architecture',
    ctx: 'Sudano-Sahelian architecture is the earthen monumental style of the Sahel, from the Mali Empire (c. 1235-1600) onward. Timbuktu\'s Djinguereber mosque rose under Mansa Musa, who returned from hajj in 1324-25 with the Andalusian architect-poet Abu Ishaq al-Saheli; Djenné\'s Great Mosque, rebuilt in 1907 by the barey ton mason guild under Ismaila Traoré, fronts the market square on the site of a 13th-century mosque. Annual replastering (crépissage) is a civic festival, and toron palm-beam stubs give the walls their bristling silhouette.',
    vd: {
      shape: 'Piriform buttressed walls, tapering minarets, pyramidal portal masses rising from flat towns.',
      line: 'Toron palm-beam horizontals bristling in rows against curved earthen edges.',
      composition: 'Mosque walls modeled in relief — pilaster buttresses and vertical finials pacing the courtyard.',
      texture: 'Finger-combed banco plaster, mud-brick coursing, whitewashed prayer-niche panels',
    },
    typ: {
      display: 'Painted Arabic lettering on plastered portal drums',
      body: 'Modern bilingual Latin-Arabic signage of Djenné and Timbuktu',
      notes: 'Crépissage day posters and donor boards relist annually on fresh plaster.',
    },
    lit: {
      quality: 'Saharan glare bouncing off pale clay; dawn and dusk turn the walls rose',
      temperature: 'warm-toned',
      shadow: 'Toron beams striping the buttresses; interiors cool and lamp-dark',
    },
    ui: {
      background: 'Sun-baked clay gradient from sand to cocoa',
      surface: 'Combed-mud panels with toron-beam peg accents',
      components: 'Buttress-frame cards, finial bullets, portal-arch headers',
      motion: 'Annual-replaster pulse — surfaces renewing in festival sweeps',
    },
  },
  {
    slug: 'indo-saracenic',
    ctx: 'Indo-Saracenic was the Raj\'s official style from the 1870s: British architects dressed Victorian institutions in Mughal domes, chhatris, cusped arches, and jali screens to stage imperial legitimacy. Robert Fellowes Chisholm\'s Senate House, Madras (1879), Henry Irwin\'s Mysore Palace (1897) and Madras High Court (1892), George Wittet\'s Prince of Wales Museum, Bombay (1905-15), and William Emerson\'s Victoria Memorial, Calcutta (1906-21, paid by public subscription) form the canon; municipal buildings spread it from Karachi to Rangoon. Lutyens resisted it, then compromised.',
    vd: {
      shape: 'Victorian bodies under Mughal onion domes, chhatri corner turrets, and cusped arcades.',
      line: 'Cusped arch outlines, polychrome trim courses, cast-iron balustrade curlicues.',
      composition: 'Symmetrical elevations around a great central dome; pavilions marking every corner.',
      texture: 'Red brick and rendered stone banded in buff and white; jali screens and tile inlay',
    },
    typ: {
      display: 'Chiseled roman capitals in cusp-framed panels over entrances',
      body: 'Victorian Clarendon-style letterpress of Raj officialdom',
      notes: 'Bilingual plaques pair English capitals with Urdu nastaliq panels.',
    },
    lit: {
      quality: 'Brassy colonial afternoon light filtered through deep verandas',
      temperature: 'warm-toned',
      shadow: 'Jali screens cutting shade into lattice patterns',
    },
    ui: {
      background: 'Buff sandstone gradient with brick-red fields',
      surface: 'Banded stone panels with carved cusped-arch cards',
      components: 'Dome-shaped headers, chhatri badges, lattice-pattern dividers',
      motion: 'Ceremonial slow reveals, gates opening like great railway entrances',
    },
  },
  {
    slug: 'naqsh-e-jahan-ensemble',
    ctx: 'Naqsh-e Jahan ("Image of the World") Square, Isfahan, built 1598-1629 by Shah Abbas I\'s Safavid court, reorganized a capital around royal spectacle: engineer Ali Akbar Isfahani\'s Shah Mosque (begun 1611) faces the square at a skewed angle preserving qibla alignment; the Sheikh Lotfollah Mosque (1619) served the harem; Ali Qapu\'s timber pavilion overlooked polo chases run in the square, while the Qaysariyya portal opened the royal bazaar. Calligrapher Ali Reza Abbasi\'s white thuluth bands wrap turquoise tilework; UNESCO listed the ensemble in 1979.',
    vd: {
      shape: 'Rectangular square about 512 by 159 meters framed by arcades, domes, and a six-storey pavilion.',
      line: 'Pointed iwan profiles, double-shell dome curves, calligraphic banding along every edge.',
      composition: 'Skewed Shah Mosque iwan balancing qibla against the square grid; Lotfollah dome as pivot.',
      texture: 'Seven-color haft-rangi tile, turquoise-on-cream calligraphy, marble dado troughs',
    },
    typ: {
      display: 'Monumental jali thuluth by Ali Reza Abbasi running in white tile bands',
      body: 'Nastaliq administrative and poetic documents of the Safavid court',
      notes: 'Foundations and waqf inscriptions date and name the patrons of Abbas I in tile.',
    },
    lit: {
      quality: 'Desert sun flooding the square while domes and iwans shade the interiors',
      temperature: 'warm-toned',
      shadow: 'Deep iwan shadow caves against blazing tiled exteriors',
    },
    ui: {
      background: 'Turquoise-and-cream tile wash with gilt hairlines',
      surface: 'Glazed panel cards like haft-rangi mosaic sections',
      components: 'Iwan-arch headers, muqarnas dropdowns, bazaar-arcade nav',
      motion: 'Polished reflections sweeping like light across glazed domes',
    },
  },
  {
    slug: 'sidi-bou-said-style',
    ctx: 'Sidi Bou Saïd, a cliff village above the Gulf of Tunis named for the 13th-century Sufi saint Abu Said al-Baji, received Andalusian refugees after 1609, whose courtyard houses and mashrabiya set its plan. The painter-musicologist Baron Rodolphe d\'Erlanger, building his Dar Nejma Ezzahra (1912-22), imposed the now-canonical white walls and cobalt-blue doors; French decrees from 1915 codified the palette, making the village a protected site. Paul Klee and August Macke painted there in 1914, fixing its reputation among European moderns.',
    vd: {
      shape: 'Cube houses terracing down a cliff, domed entrances, barrel-vaulted terraces above the gulf.',
      line: 'Cobalt outlines chasing every door and shutter — nail-head ironwork, scroll grilles.',
      composition: 'White massing punctuated by blue apertures; alleys stair-step toward the marabout dome.',
      texture: 'Rough lime whitewash over stone, studded blue-painted cedar and iron',
    },
    typ: {
      display: 'Hand-painted Arabic door lintel lettering in deep cobalt',
      body: 'Relaxed French sans of Tunis guesthouse signage',
      notes: 'Blue-on-white stencil motifs echo village ironwork; Tunisian French lingers in labels.',
    },
    lit: {
      quality: 'Mediterranean glare doubling off white walls into blue shade',
      temperature: 'cool-toned',
      shadow: 'Blue-violet shade pooling in stair landings and arcades',
    },
    ui: {
      background: 'Chalk white with cobalt corner strokes',
      surface: 'Whitewashed cards edged in studded cobalt borders',
      components: 'Door-arch buttons, grille-pattern dividers, dome-topped toggles',
      motion: 'Shutter-swing reveals, blinds lifting like mashrabiya slats',
    },
  },
  {
    slug: 'banco-masonry',
    ctx: 'Banco is the Sahel\'s earth-building craft: puddled or sun-dried molded mud bricks bedded in mud mortar, plastered with the same mix, finished with toron palm-beam stubs left proud as scaffolding and ornament. It backs the Great Mosque of Djenné — maintained by the hereditary barey ton mason guilds since the 1907 rebuild — and Larabanga mosque in Ghana, and underlies Koutammakou\'s Batammariba tower-houses in Togo (UNESCO 2004). Djenné-Djeno\'s ruins date the technique to about 250 BCE, making it one of West Africa\'s oldest continuous building systems.',
    vd: {
      shape: 'Load-bearing earthen cubes with tapering walls, pot-bellied buttresses, low door eyes.',
      line: 'Course lines of molded banco bricks reading as soft horizontal ridges',
      composition: 'Compound courtyards nested around granaries; mosque walls thickest at the base',
      texture: 'Smooth hand-finished plaster over brick, annual repairs visible as color steps',
    },
    typ: {
      display: 'Clay-relief lettering pressed into fresh wall plaster',
      body: 'Stencil-painted sans on whitewashed plaster panels',
      notes: 'Mason guild records are oral; modern plaques credit the barey ton by name.',
    },
    lit: {
      quality: 'Low Sahel sun raking a wet-plaster sheen at dawn',
      temperature: 'warm-toned',
      shadow: 'Buttress shade cooling interiors to earthen brown',
    },
    ui: {
      background: 'Terracotta-to-umber earthen gradient',
      surface: 'Hand-smoothed clay panels with subtle trowel arcs',
      components: 'Coursed-brick dividers, buttress cards, embossed-handprint buttons',
      motion: 'Slow trowel-smoothing transitions, panels healing over',
    },
  },
  {
    slug: 'ise-shrine-shinden',
    ctx: 'Ise\'s shoden, chief shrine of the Kotai Jingu to Amaterasu, embodies shinmei-zukuri, Japan\'s oldest shrine style: a raised-floor rectangle of unstained hinoki cypress with kaya thatch, chigi crossed finials, and katsuogi ridge logs. Every twenty years since 690 the Shikinen Sengu rebuilds it on an adjacent site — the 62nd renewal completed in 2013 — preserving pre-Buddhist joinery as living ritual rather than monument. The Mie priesthood draws centuries-old cypress from the Kiso forests, and the blank planed timber defines Japanese sacred space.',
    vd: {
      shape: 'Raised-floor rectangle with straight gabled roof, chigi cross finials, katsuogi ridge logs.',
      line: 'Planed-plank edges and raked thatch courses; horizontal fascia lines calm the mass.',
      composition: 'Four-fenced precinct gate on axis; mirror-shrine core hidden from view entirely.',
      texture: 'Unpainted hinoki cypress silvering to honey, miscanthus thatch shaggy at the eaves',
    },
    typ: {
      display: 'Brushed kanji name tablets on cypress, ink-black on bare wood',
      body: 'Vertical minchō setting for ritual texts and shrine registers',
      notes: 'New tablets and shimenagi paper streamers replace old ones every twenty years.',
    },
    lit: {
      quality: 'Filtered forest light through cedar canopy onto pale timber',
      temperature: 'neutral',
      shadow: 'Gravel-court brightness against deep veranda dimness',
    },
    ui: {
      background: 'Pale hinoki cream with faint wood grain',
      surface: 'Sanded timber cards with woven-thatch accents',
      components: 'Gate-arch frames, shide-zigzag markers, ridge-log dividers',
      motion: 'Twenty-year renewal cycle echoed in patient, ceremonial fades',
    },
  },
  {
    slug: 'majlis-reception',
    ctx: 'The majlis — "place of sitting" — is the Gulf and Arab world\'s formal reception room: a stripped floor space lined with a long masnad mattress against the wall, loose arm-and-back cushions, and a low coffee service where the host pours cardamom qahwa from a brass dallah into handleless cups. Men\'s majalis sit apart from family quarters in Gulf courtyard houses, cooled by barjeel wind towers; UNESCO inscribed the majlis as a cultural and social space on the Representative List in 2015, and Doha\'s Msheireb houses keep working examples.',
    vd: {
      shape: 'Long low floor mattresses lining walls, cushion rows, and a central carpet island.',
      line: 'Cushion piping and carpet borders drawing the horizon at knee height.',
      composition: 'Host seat nearest the door; guests arrayed along walls; coffee tray orbiting the circle.',
      texture: 'Tufted wool carpet, velvet cushion nap, brass dallah sheen',
    },
    typ: {
      display: 'Diwani calligraphy plaques greeting guests over the door',
      body: 'Naskh invitations and bilingual hospitality signage',
      notes: 'UNESCO listed the majlis in 2015; etiquette prints guide hosts and guests.',
    },
    lit: {
      quality: 'Lantern-warm interior glow against barjeel-filtered daylight',
      temperature: 'warm-toned',
      shadow: 'Cushion-dense shade along walls, bright carpet island at center',
    },
    ui: {
      background: 'Desert-sand tone with faint carpet medallion watermark',
      surface: 'Woven-wool panels with brass trim accents',
      components: 'Cushion-row cards, dallah-pour icons, guest-order seating charts',
      motion: 'Coffee-tray orbit animation, cushions compressing on selection',
    },
  },
  {
    slug: 'falu-red-farmstead',
    ctx: 'Falu rödfärg, the deep red paint of Swedish timber buildings, is iron-oxide pigment crushed from the slag heaps of the Falun copper mine, worked since the Viking era and a UNESCO site since 2001. Gustav Vasa\'s court painted royal castles brick-red from the 16th century; by the 18th and 19th the pigment, cheap and binding with linseed oil, coated Dalarna farmsteads in the red-wall-white-trim ideal that Carl Larsson\'s house at Sundborn popularized. Manors wore red to imitate brick rank, peasants wore it by default, and the palette became national identity.',
    vd: {
      shape: 'Timber manor and cottage boxes with steep gables, white corner boards boxing each wall.',
      line: 'Crisp white knutlådar corner trim and window frames outlining red planes.',
      composition: 'Clustered red buildings ringing a cobbled yard; barn, cottage, and forge in one hue.',
      texture: 'Linseed-oil red with light reflet sheen, rough sawn timber beneath, turf or shingle roofs',
    },
    typ: {
      display: 'Kurbits folk-painted capitals of Dalarna inn signs',
      body: 'Swedish fraktur of parish registers and farm ledgers',
      notes: 'Red paint tins still carry the Falun mine brand; Carl Larsson interiors popularized it.',
    },
    lit: {
      quality: 'Low Nordic summer sun gilding red walls to ember tone',
      temperature: 'warm-toned',
      shadow: 'Blue-gray winter shade pooling in white-trimmed corners',
    },
    ui: {
      background: 'Falu red field with white trim hairlines',
      surface: 'Sawn-timber texture under translucent red glaze',
      components: 'Corner-board frames, kurbits-scroll dividers, mine-brand badges',
      motion: 'Sun-crossing sheen drifting over panels like linseed light',
    },
  },
  {
    slug: 'chichen-itza-puuc-style',
    ctx: 'The Puuc style — named for the low hills of southwest Yucatán — peaks in the Late to Terminal Classic (c. 700-950 CE). Builders faced rubble cores with fine veneer masonry, kept lower walls plain, and spent ornament on the upper frieze: pre-cut stone mosaic of stepped frets, lattice, and stacked Chac rain-god masks with curled snouts, as at Uxmal\'s Governor\'s Palace. At Chichén Itzá the annex of Las Monjas and La Iglesia carry the same Puuc friezes beside colonnaded halls, a stylistic layer predating the Toltec-flavored mainstream.',
    vd: {
      shape: 'Long palace platforms, colonnaded halls, and plain lower walls crowned by high mosaic friezes.',
      line: 'Stepped-fret greca bands, lattice mosaic, and Chac mask contours with curled snouts.',
      composition: 'Two-part facade discipline: austere base, exuberant upper register; masks stacked at corners.',
      texture: 'Fine veneer masonry fitted without mortar, polished limestone quoins',
    },
    typ: {
      display: 'Maya glyph blocks carved on lintels as title cartouches',
      body: 'Modern bilingual Spanish-Yucatec museum signage',
      notes: 'Long Count dates anchor facade programs; deciphered royal names read as captions.',
    },
    lit: {
      quality: 'Zenithal Yucatec sun bleaching limestone to bone white',
      temperature: 'warm-toned',
      shadow: 'Frieze depth shadowing under every protruding mask snout',
    },
    ui: {
      background: 'Limestone pale with jungle-green field margins',
      surface: 'Veneer-masonry texture cards in sun-bleached gray',
      components: 'Glyph-block icons, fret-pattern rules, mask-corner ornaments',
      motion: 'Frieze bands scrolling like a stone mosaic register',
    },
  },
  {
    slug: 'wharenui',
    ctx: 'The wharenui, Māori meeting house, is built as a standing ancestor: the koruru face over the door, maihi bargeboards as arms, amo boards as legs, tahuhu ridgepole as spine over poupou wall figures. Te Hau ki Tūranga, carved at Gisborne by Raharuhi Rukupo\'s workshop in 1842 and now in Te Papa, is the classic survivor; inside, kōwhaiwhai painted rafters and tukutuku lattice panels — women\'s weaving — complete the genealogy of the descent group. Houses front the marae ātea, where pōwhiri welcome protocols unfold.',
    vd: {
      shape: 'Gable-faced house as ancestor: koruru head, outstretched maihi arms, amo legs, porch mouth.',
      line: 'Deep-carved spirals tracking ribs and muscles on every post and bar',
      composition: 'Interior ridgepole spine above rows of poupou ancestors; tukutuku panels flank the aisle.',
      texture: 'Oiled carved totara or kauri, woven flax tukutuku, kōwhaiwhai paint on rafters',
    },
    typ: {
      display: 'Chiseled Māori capitals on lintels and name boards',
      body: 'Bilingual te reo Māori and English serif of marae programs',
      notes: 'Macrons and tohutō restored in modern signage; whakapapa read aloud, not printed.',
    },
    lit: {
      quality: 'Interior glow from central hearth and low door daylight',
      temperature: 'warm-toned',
      shadow: 'Carve-shadow making ancestors step from dark posts',
    },
    ui: {
      background: 'Deep carved-timber brown with rafter pattern echo',
      surface: 'Woven flax panels beside glossy carved posts',
      components: 'Poupou-style section posts, spiral loaders, welcome-mat entry card',
      motion: 'Pōwhiri-paced progress — slow approach, pause, then entry',
    },
  },
]
