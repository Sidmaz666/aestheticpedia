/**
 * Patch 14-e — full-depth backfill for the 35 EXISTING entries in manifest-14e.json
 * (Architectural Styles tail: regional traditions, revivals, vernacular craft
 * + the first Internet Aesthetics: liminal spaces, light academia, weirdcore).
 * Fields per patch: ctx (cultural context), vd (visual DNA), typ (typography),
 * lit (lighting), ui (UI translation). Slugs match the manifest exactly.
 * Consumed by scripts/research/apply-patches.ts (non-destructive merge into existing entries).
 */

export const PATCHES: any[] = [
  {
    slug: 'tectonics',
    ctx: "Named in Eduard F. Sekler's 1965 Harvard essay 'Structure, Construction, Tectonics' and canonized in Kenneth Frampton's Studies in Tectonic Culture (1995), tectonics treats the expressive joint — how a building shows its own assembly — as architecture's core content. Its canon runs from Mies's I-beam facades and Carlo Scarpa's Castelvecchio stairs to Gramazio & Kohler's robotic brickwork on the Gantenbein winery facade (ETH Zurich, 2006), a discourse carried by schools and journals.",
    vd: {
      shape: 'Buildings presented as assembled stacks of beams, plates and modules; depth comes from real structure, not cladding',
      line: 'Straight joinery lines with bolt-and-weld rhythms; shadow gaps trace the edge of every part',
      composition: 'Orthogonal grids foregrounded; corners, cantilevers and connections become the focal moments',
      texture: 'Brushed steel, raw concrete, oiled timber, honest brick coursing — surfaces shown exactly as made',
    },
    typ: {
      display: 'Grotesque sans set with technical spacing, like drawing annotations',
      body: 'Neutral sans of the Helvetica/Akzidenz lineage on airy leading',
      notes: 'Part labels, index numbers and grid ticks used as decorative text',
    },
    lit: {
      quality: 'Even, directional studio-like light that rakes joints and reveals relief',
      temperature: 'neutral-toned',
      shadow: 'Crisp shadow gaps at every junction; no diffuse gloom anywhere',
    },
    ui: {
      background: 'Light concrete grey with a faint drafting-grid paper tone',
      surface: 'Layered cards showing true edge depth and hairline borders',
      components: 'Squared buttons with visible stacking, blueprint-style dividers, tab-joint frames',
      motion: 'Snap-into-place movements; hover lifts one layer to expose the construction beneath',
    },
  },
  {
    slug: 'lingnan-gardens',
    ctx: "Gardens of the Pearl River Delta gentry — the 'Four Great Gardens of Lingnan': Qinghui Garden in Shunde, Liang Garden in Foshan, Ke Garden in Dongguan and Yuyin Shanfang in Panyu — were built and rebuilt from the Ming through the Qing by merchant-scholar families on tight urban plots. Compact water courts, grey brick, oyster-shell window grilles and glass imported through the Canton trade suit the humid subtropical climate and the region's merchant money.",
    vd: {
      shape: 'Compact walled courts with meandering water, zigzag bridges and pavilions wedged into small plots',
      line: 'Grey-brick ridgelines, carved lime-plaster friezes, moon-gate circles, oyster-shell lattice mullions',
      composition: 'Framed borrowed scenery: moon doors and latticed windows crop garden vignettes like paintings',
      texture: 'Polished granite paving, grey brick, oyster-shell grilles, tinted imported stained glass',
    },
    typ: {
      display: 'Carved hardwood plaques and paired couplets in black-lacquer calligraphy',
      body: 'Regular-script brush characters on fans, couplets and garden poems',
      notes: 'Vermilion seal stamps punctuate poem panels and garden names',
    },
    lit: {
      quality: 'Humid light filtered by deep eaves and banyan shade, doubling in still ponds',
      temperature: 'cool-toned',
      shadow: 'Deep veranda shade grading into sunlit courts; dappled foliage patterns',
    },
    ui: {
      background: 'Muted celadon water-grey with a grey-brick undertone',
      surface: 'Grey-brick panels framed by dark carved wood lattices',
      components: 'Moon-gate avatars, zigzag-bridge dividers, lattice-etched cards, pond-reflection glows',
      motion: 'Slow fades as if stepping through a moon gate; ripple reflections track the scroll',
    },
  },
  {
    slug: 'lanna-thai-architecture',
    ctx: "Architecture of the Lanna Kingdom founded when King Mangrai established Chiang Mai in 1263. Teak vihans on raised platforms, with v-shaped kalae roof finials and naga bargeboards, sheltered the region's blend of spirit cults and Theravada Buddhism; Wat Phra That Doi Suthep (1383) and Wat Phra Singh's Viharn Lai Kham — rebuilt around 1811 under Chao Mahotraprathet with murals by the painter Thit Buaphan — anchor the canon. After King Kawila's 1796 refoundation, teak wealth rebuilt the temples.",
    vd: {
      shape: 'Raised teak platforms carrying steep, tiered roofs with upswept kalae finials at each gable',
      line: 'Swelling naga bargeboards sweep down the eaves; carved brackets and verge boards repeat in tiers',
      composition: 'Symmetrical vihan fronts under dense roof stacks; compounds scatter pavilions among bodhi trees',
      texture: 'Oiled teak grain, gilded black lacquer, mirrored-glass inlay on gables and pedals',
    },
    typ: {
      display: 'Gilded Lanna tham script banners and temple plaques on black lacquer',
      body: 'Palm-leaf manuscript letters of the Lanna tham (tua mueang) script',
      notes: 'Yantra cloth and gilded wooden labels flank shrine doors',
    },
    lit: {
      quality: 'Lamplight and candle glow in incense-thinned teak halls; gold leaf glints from dark wood',
      temperature: 'warm-toned',
      shadow: 'Steep eaves throw deep cool shade; gold picks out carving from the darkness',
    },
    ui: {
      background: 'Deep teak brown with dusk-gold accents',
      surface: 'Lacquered dark panels edged with mirror-glass inlay',
      components: 'Naga-curve headers, kalae corner ornaments, banner-style buttons with gilded tips',
      motion: 'Candle-flicker hovers; slow banner-drop reveals between sections',
    },
  },
  {
    slug: 'great-zimbabwe-architecture',
    ctx: "Capital of the Shona kingdom that flourished 1100-1450 between the Zambezi and Limpopo, feeding its wealth into the Indian Ocean gold-and-ivory trade. Rulers raised the Great Enclosure: about 250 m of mortarless granite wall rising 11 m in regular courses with a chevron frieze, beside the 10 m Conical Tower. Colonial apologists (J. T. Bent, 1891) credited Phoenicians; David Randall-MacIver (1905) proved African builders. UNESCO-listed 1986; the site's soapstone birds gave the nation its name.",
    vd: {
      shape: 'Coursed granite walls rising in rounded enclosures up granite kopjes; drums nested within drums',
      line: 'Chevron and herringbone friezes along the top courses; regular horizontal block lines',
      composition: 'Nested enclosures funnel through narrow stone corridors toward the Conical Tower',
      texture: 'Split granite blocks weathered under grey-green lichen; daga clay floors; carved soapstone',
    },
    typ: {
      display: 'The soapstone Zimbabwe Birds — carved raptors that became national insignia',
      body: 'Classic serif labels of site museums and archaeological reports',
      notes: 'Flag and currency carry the bird motif as a modern seal',
    },
    lit: {
      quality: 'High African sun flaring off granite; abrupt shade inside the wall passages',
      temperature: 'warm-toned',
      shadow: 'Narrow daga-roofed corridors cut black while wall tops glare white',
    },
    ui: {
      background: 'Granite grey-green with a warm dust tone',
      surface: 'Coursed stone panels mottled with lichen',
      components: 'Conical-tower badges, chevron-rule dividers, corridor-like nested cards',
      motion: 'Slow corridor wipes between sections; stone-warm glow on hover',
    },
  },
  {
    slug: 'papuan-longhouse',
    ctx: "Elongated communal houses across New Guinea where one ridge-beamed hall shelters a whole clan: men's sections and fireplaces along the centre, sleeping bays at the sides. In the Sepik Basin the Abelam and Kwoma raise the type into haus tambaran spirit houses — painted gable faces and ancestral masts over ceremonial plazas — where initiation and yam rituals are held. Sago-palm thatch, bamboo cordage and shared community labour raise them in days, and they remain clan identity made buildable.",
    vd: {
      shape: 'Long low ridges under bowed thatch vaults; gable ends blooming into mask faces and carved masts',
      line: 'Lashed bamboo lines and thatch scallops; bold ochre face-and-spiral motifs on the gables',
      composition: 'Village plaza fronts the great gable; inside, a central spine of hearths organises clan space',
      texture: 'Rough sago thatch, splintered bamboo, smoke-blackened timber, ochre and lime paint',
    },
    typ: {
      display: 'Painted gable-face glyphs standing in for the clan name',
      body: 'Chalky hand-lettering on communal notice boards',
      notes: 'Masks and shield motifs double as clan identifiers',
    },
    lit: {
      quality: 'Dim hearth glow inside; hard equatorial shafts of sun through the door gaps',
      temperature: 'warm-toned',
      shadow: 'Smoke-browned gloom deepening away from the door; plaza glare outside',
    },
    ui: {
      background: 'Smoke brown with ochre dust',
      surface: 'Thatch-fibre texture framed by bamboo slats',
      components: 'Mask-face mastheads, lashed-bamboo dividers, hearth-glow buttons',
      motion: 'Slow mask-face reveals with a firelight flicker on hover',
    },
  },
  {
    slug: 'soviet-mosaics-in-architecture',
    ctx: "State-commissioned smalt mosaics cladding Soviet facades, foyers and metro vestibules from the Khrushchev thaw through the Brezhnev 1970s. Kyiv's monumental school — Alla Horska and the Sixtiers artists, Ada Rybachuk and Melnyk Vovenko's panel campaigns — worked beside ateliers in Baku, Tashkent and Yerevan to tile cosmonauts, steelworkers and dancers into concrete. Glass smalt survived frost where paint failed; after 1991 many panels became flashpoints between demolition and listed heritage.",
    vd: {
      shape: 'Flat monumental panels stretched across tower flanks and foyer walls; figures heroic and simplified',
      line: 'Bold contour lines in smalt; clean profiles of workers, cosmonauts, dancers and wheat sheaves',
      composition: 'Figure groups arc across the architecture like friezes; tesserae follow the gesture',
      texture: 'Glittering glass smalt, gold-mirror cubes, rough board-formed concrete borders',
    },
    typ: {
      display: 'Striking Cyrillic display lettering set in metal or smalt over entrances',
      body: 'Utilitarian Soviet sans on address plates and dedication plaques',
      notes: 'Plaques record dates and the artist collectives behind each panel',
    },
    lit: {
      quality: 'Cold northern daylight glinting off smalt; sodium lamps warming the facades at dusk',
      temperature: 'cool-toned',
      shadow: 'Panels glow against grey slab shadows; interiors keep deep foyer shade',
    },
    ui: {
      background: 'Concrete panel grey washed with blue smalt',
      surface: 'Tessera-grained cards flecked with metallic gold',
      components: 'Mosaic hero banners, heroic figure silhouettes, gold-fleck badges',
      motion: 'Tesserae shimmer on scroll; panels assemble block by block on load',
    },
  },
  {
    slug: 'kura-dozou',
    ctx: "Edo-period merchant wealth lived in kura: storehouses of thick rammed-earth walls under steep tiled roofs, plastered white with black namako-kabe lattice bands that resisted fire, thieves and damp. Kurashiki — literally 'village of storehouses' — grew rich warehousing daimyo rice, and its Bikan quarter kura became the Ohara Museum in 1930. A household's kura held kimono, tea, deeds and dowry; opening it at New Year announced a family's standing.",
    vd: {
      shape: 'Squat plastered cubes under steep tiled hips; a few tiny high windows betray the purpose',
      line: 'Black-and-white namako lattice bands dividing white walls into crisp horizontal registers',
      composition: 'Storehouses aligned behind merchant houses along canal lanes, one heavy door apiece',
      texture: 'Smooth lime plaster, charcoal-grey tiles, heavy iron-strapped doors, worn sills',
    },
    typ: {
      display: 'Family crests (mon) carved above the storehouse doors',
      body: 'Vertical wooden shop signs in brush-drawn kanji',
      notes: 'Deeds and silks kept within in paulownia tansu chests',
    },
    lit: {
      quality: 'Cool dim interiors kept steady for silks; slatted daylight on narrow lanes',
      temperature: 'cool-toned',
      shadow: 'Deep eave shade pools at thresholds; near-dark interiors until the door opens',
    },
    ui: {
      background: 'Plaster white with charcoal tile accents',
      surface: 'Smooth white cards with black lattice borders',
      components: 'Lattice-band dividers, mon crest badges, iron-strap drawer handles',
      motion: 'Heavy vault-door slide transitions; warm lamp glow on unlock hover',
    },
  },
  {
    slug: 'hakka-walled-villages',
    ctx: "Fortified clan housing of the Hakka, north-Chinese migrants who pushed into Guangdong, Jiangxi and Fujian from the Song era onward and built defensively amid feuds and banditry. Jiangxi's Longnan wei — the Qing-era Guanxi New Walled Village is the classic — and Guangdong's half-ring weilongwu enclose ancestor halls, wells, schools and granaries behind metres-thick rammed-earth or stone walls pierced by a single gate and gun loopholes; a lineage of hundreds lived as one garrison.",
    vd: {
      shape: 'Massive ring or half-ring compounds enclosing courtyards and a central ancestor hall',
      line: 'Horizontal courses of rammed earth and grey stone; one gate line breaks the drum',
      composition: 'Hundreds of near-identical rooms ring concentric walkways around wells and granaries',
      texture: 'Rain-silvered rammed earth, grey tiled roof rings, worn stone thresholds',
    },
    typ: {
      display: 'Carved stone village-name plaques above the single gate',
      body: 'Red-paper couplets flanking doors; brush characters on ancestral tablets',
      notes: 'Lineage genealogies (zupu) record rooms, rites and rank',
    },
    lit: {
      quality: 'Open courtyard skylight flooding the ancestral hall; ring corridors stay dim',
      temperature: 'neutral-toned',
      shadow: 'Corridor shade as deep as cave interiors against a bright central court',
    },
    ui: {
      background: 'Rammed-earth taupe with grey tile tones',
      surface: 'Earth-textured cards arranged in courtyard rings',
      components: 'Ring-shaped navigation wheels, gate-arch modals, ancestral-hall hero panels',
      motion: 'Concentric ripples spreading from centre; slow gate-swing reveals',
    },
  },
  {
    slug: 'ganch-plasterwork',
    ctx: "Carved gypsum plaster — ganch — is Central Asia's signature architectural craft, perfected in Bukhara's ateliers under the Shaibanid and Manghit dynasties. Master carvers (ustoz) cut damp ganch panels with teshna chisels into girih star-lattices, islimi vines and stalactite muqarnas: white monochrome relief modelled only by light. Bukhara's Bolo Haouz mosque iwan and the emir's late-19th-century Sitorai Mokhi-Khosa palace carry the craft, which Bukharan families still teach today.",
    vd: {
      shape: 'Panels of interlaced star polygons and muqarnas niches carved into domes, squinches and mihrabs',
      line: 'Girih strapwork weaving through islimi vines; knife-crisp bevelled edges everywhere',
      composition: 'White monochrome relief stacked tier on tier: band, medallion, niche, dome',
      texture: 'Chalky cut gypsum catching shadow in bevels; smoothed fields above deep voids',
    },
    typ: {
      display: 'Thuluth and naskh calligraphy carved in high relief',
      body: 'Foundation inscriptions (kitabe) set in cartouches',
      notes: 'Craftsman signatures (ustoz names) hidden within ornament bands',
    },
    lit: {
      quality: 'Raking low sun lifts every bevel into relief; interiors stay cool and even',
      temperature: 'warm-toned',
      shadow: 'Bevel shadows model the white field; flat midday sun erases them',
    },
    ui: {
      background: 'Warm gypsum white with sand-coloured shadow',
      surface: 'Bevelled-relief cards with dome-curve corners',
      components: 'Muqarnas stacked menus, girih medallion icons, cartouche labels',
      motion: 'A light rake sweeps carved headers on hover; slow dome-bloom on load',
    },
  },
  {
    slug: 'dhow-boat-decoration',
    ctx: "Before oil, Gulf prosperity sailed in dhows — teak-hulled, lateen-rigged freighters built by shipwrights of Kuwait, Bahrain and Oman's Sur from Malabar timber, carrying pearls, dates and the India run. Their carving was functional piety: apotropaic eyes at the bow, gilded geometric relief on stern transoms, cabins and rails, a vocabulary borrowed from mosque ornament. Steamships and oil (1930s-1960s) ended the working fleet; racing booms and museum restorations keep the craft alive.",
    vd: {
      shape: 'Lateen-rigged hulls with high curved sterns and one long sweeping sheer line',
      line: 'Painted bow eyes; carved geometric stern panels and scrollworked rails',
      composition: 'Carved cabin aft, cargo amidships, a great triangular lateen sail aloft',
      texture: 'Oiled teak, coir rope, salt-bleached wood, gold leaf on carved rails',
    },
    typ: {
      display: 'Boat names in ornate Arabic script on stern boards',
      body: 'Chalk cargo tallies and port marks on planks',
      notes: 'Oculus eyes painted at the bow as protective signs',
    },
    lit: {
      quality: 'Harsh Gulf glare over open water; warm lamplight in the carved stern cabin',
      temperature: 'warm-toned',
      shadow: 'Sail shadow bands the deck; carving reads best by candlelight at anchor',
    },
    ui: {
      background: 'Deep sea blue with salt-white foam light',
      surface: 'Teak-plank cards with rope-bound corners',
      components: 'Bow-eye icons, sail-curve banners, stern-carved badges',
      motion: 'Billow-sail parallax drifts; tide-slow rocking on scroll',
    },
  },
  {
    slug: 'halsingland-farmhouse-interiors',
    ctx: "In 19th-century Hälsingland, Sweden's wealthiest peasant farmers raised two-storey timber farmhouses and hired itinerant painters to make their best rooms rival manor interiors. Jonas Wallström of Färila and his peers stencilled garlands, imitated marble and grained wood in linseed distemper, covering walls, ceilings and stoves in ordered suites of finest room, dinner room and guest chambers. UNESCO listed the Hälsingegårdar as Decorated Farmhouses in 2012.",
    vd: {
      shape: 'Best rooms wrapped floor to ceiling in painted ornament: walls, ceilings, doors, stoves',
      line: 'Stencil borders and garland outlines framing marble-imitation panels in ordered rows',
      composition: 'Entry corridors lead to staged chambers — finest room, dinner room, sewing room',
      texture: 'Matte linseed distemper, hand-stencilled borders, grained wood imitation, linen weave',
    },
    typ: {
      display: 'House names and blessings in rustic folk lettering above doors',
      body: 'Almanacs and hymn prints pinned in parlour frames',
      notes: 'Painter stencils (mallning) repeat as room-wide motifs',
    },
    lit: {
      quality: 'Low northern window light over matte paint; oil lamps for evening visits',
      temperature: 'cool-toned',
      shadow: 'Small-pane windows cast soft grid shadows; corners stay gentle umber',
    },
    ui: {
      background: 'Warm cream with faint stencil grey-blue',
      surface: 'Distemper-matte cards with stencil borders',
      components: 'Stencil-rule dividers, garland corner ornaments, framed almanac widgets',
      motion: 'Gentle fades like drying distemper; hover warms the stencil palette',
    },
  },
  {
    slug: 'finnish-church-villages',
    ctx: "Finland's parishes spanned vast forests, so settlement crystallised around the church: church towns of small painted-red guest cabins (mäkitupa) where far-flung farmers slept over communion weekends. Old Rauma, Porvoo and Naantali preserve the type with their medieval street plans, while Petäjävesi Old Church (1763-65), raised in log by master builder Jaakko Klemetinpoika Leppänen and UNESCO-listed in 1994, shows the wooden heart of the tradition. Cabin rows doubled as market and court weeks.",
    vd: {
      shape: 'Cruciform log church under a steep shingle roof; lanes of small red cabins lead toward it',
      line: 'Hand-hewn log courses, white window surrounds, red-oxide board lines',
      composition: 'Churchyard at the centre; cabins and storehouses ranked along the radial lanes',
      texture: 'Tarred red-oxide timber, grey shingles, smoke-dark log interiors',
    },
    typ: {
      display: 'Congregation boards in sturdy rustic serif',
      body: 'Printed catechisms and hymnals in Swedish-era blackletter and roman',
      notes: "Cabin doors branded with their owners' initials",
    },
    lit: {
      quality: 'Long low sun over lakes; candle glow within the log nave',
      temperature: 'warm-toned',
      shadow: 'Smoke-dark interiors; blue winter dusk across the cabin lanes',
    },
    ui: {
      background: 'Winter white with red-oxide accents',
      surface: 'Log-grain cards with white frame borders',
      components: 'Lane-path breadcrumbs, cabin-row lists, spire markers',
      motion: 'Sleigh-smooth glides; candle-flicker hover on church pages',
    },
  },
  {
    slug: 'sondergotik',
    ctx: "'Sondergotik' — special Gothic — is the label German art history gave the idiosyncratic Late Gothic of Germany, Austria and Bohemia (c. 1350-1520): hall churches whose aisles rise to nave height, net, stellar and curvilinear vaults, and single-volume interiors instead of French sectional elevations. The Parler lodge of Peter Parler (St. Vitus, Prague) set patterns that Bauhuetten lodges spread region-wide; Jakob Haylmann's St. Anne's at Annaberg (1499-1525) is the mining-town masterpiece.",
    vd: {
      shape: 'Single-volume hall interiors where nave and aisles reach equal height under one forest of vaults',
      line: 'Net and stellar vault ribs springing from slender bundled shafts; parabolic and ogee arch lines',
      composition: 'Whitespace ruled by ribs: vault fans organize ceilings while slender piers keep sightlines open',
      texture: 'Pale sandstone ribs against dark plaster fields, painted keystones, worn flagstone floors',
    },
    typ: {
      display: "Textualis blackletter cut in inscriptions and donors' tablets",
      body: 'Bauhuetten lodge marks and mason scripts in narrow book hand',
      notes: "Masons' marks scratched low on piers record workshop membership",
    },
    lit: {
      quality: 'Tall clerestory shafts dropping through the unified hall; candle glow on ribbed stone',
      temperature: 'cool-toned',
      shadow: 'Vault webbing floats in half-light; aisles sink into even grey shade',
    },
    ui: {
      background: 'Ashen stone grey with cold blue clerestory wash',
      surface: 'Ribbed-arc card headers like miniature vaults',
      components: 'Net-vault dividers, pier-like sidebars, keystone badges',
      motion: 'Ribs fan out on load; sections resolve with vault-stone fades',
    },
  },
  {
    slug: 'rhenish-romanesque',
    ctx: "The Salian and Hohenstaufen emperors built the Rhine's imperial face: Speyer Cathedral begun by Conrad II (1030) and groin-vaulted under Henry IV (c. 1082-1106), Mainz's St. Martin and Worms' St. Peter (1130-81). Twin choirs, monumental westworks, dwarf galleries over Lombard bands and clustered towers in red Buntsandstein give the group its look; Speyer's crypt entombs eight Salian rulers. Sculpted portals — Worms' magnificent portal with its 13th-century figures — taught doctrine at the door.",
    vd: {
      shape: 'Long blocky masses balanced between paired western and eastern choirs and tower clusters',
      line: 'Dwarf gallery arcades marching over Lombard bands; clustered-pier shaft lines rise unbroken',
      composition: 'Crossing towers anchor the skyline; westworks face the visitor with sculpted portals below',
      texture: 'Red Buntsandstein ashlar, dark patinated bronze doors, glazed roof tiles weathered to green',
    },
    typ: {
      display: 'Romanesque capitals and inscriptions in plain square capitals',
      body: 'Carolingian-minuscule charters in the imperial scriptoria',
      notes: 'Portal tympana and jambs carry apostle figures with tituli labels',
    },
    lit: {
      quality: 'Small high windows release narrow beams; bronze doors reflect the plaza light',
      temperature: 'warm-toned',
      shadow: 'Deep window splaying cuts hard shade; crypt stays candle-lit and cool',
    },
    ui: {
      background: 'Warm sandstone red-brown with bronze accents',
      surface: 'Coursed ashlar cards with dwarf-gallery crenellation trims',
      components: 'Round-arch modals, westwork-style mastheads, tympanum icons',
      motion: 'Processional scroll; portals swing open on section entry',
    },
  },
  {
    slug: 'romanesque-revival',
    ctx: "The 19th century's return to round-arched mass: Prussian Rundbogenstil — Karl Friedrich Schinkel's Werdersche Kirche, Berlin (1821-30) — welded Romanesque to state sobriety, while Boston's H. H. Richardson fused Auvergne models into Richardsonian Romanesque: Trinity Church (1872-77) and the Marshall Field Wholesale Store (1885-87). Brownstone ashlar, squat cushion-capital columns, deep round arches and short towers spread through American courthouses, stations and libraries into the 1890s.",
    vd: {
      shape: 'Heavy rusticated masses with short powerful towers and deep-set arched openings',
      line: 'Round arches stepping over squat columns; stringcourses band the facade in firm horizontals',
      composition: 'Fortress-like fronts organised by arch rhythm; corner towers balance wide roof planes',
      texture: 'Rough brownstone and granite ashlar, carved cushion capitals, copper roofs gone green',
    },
    typ: {
      display: 'Wide-spaced roman lettering incised in stone friezes',
      body: 'Engraved serif dedications and building-name tablets',
      notes: 'Carved founder initials and dates set into arch keystones',
    },
    lit: {
      quality: 'Gas-lamp warmth in deep arcades; overcast light flattening rusticated stone',
      temperature: 'warm-toned',
      shadow: 'Recessed arches hold permanent shade; window wells go almost black',
    },
    ui: {
      background: 'Deep brownstone brown with granite grey',
      surface: 'Rusticated-block cards with carved-capital corner details',
      components: 'Round-arch buttons, incised-letter headers, keystone dividers',
      motion: 'Weighty settles-in hover states; slow arcade-wipe transitions',
    },
  },
  {
    slug: 'pwa-moderne',
    ctx: "Depression-era civic Deco built with Public Works Administration funds (1933-43): schools, post offices, courthouses and campuses in stripped, fireproof concrete and steel. Timothy Pflueger's George Washington High School, San Francisco (1936) and his City College campus carried fluted pylons and tile murals; the Treasury Section commissioned painters — Diego Rivera's Pan American Unity (1940) among them — for school and federal walls. Federal money made dignity a public amenity.",
    vd: {
      shape: 'Monumental stripped volumes with vertical fluted pylons and stepped, set-back towers',
      line: 'Deco chevrons and sunburst grilles flattened into shallow relief; strong vertical window ribbons',
      composition: 'Symmetrical entrances crowned by relief sculpture; wings repeat the entrance bay in rhythm',
      texture: 'Board-formed concrete, glazed tile wainscots, cast aluminium doors and grilles',
    },
    typ: {
      display: 'Machine-age block capitals, often cast in metal over entries',
      body: 'Federal serif lettering on dedication plaques and rosters',
      notes: 'Relief eagles and seals frame carved founding dates',
    },
    lit: {
      quality: 'Bright floodlit facades at night; noon sun flaring on fluted concrete',
      temperature: 'neutral-toned',
      shadow: 'Flutes catch knife-edge shade; doorways recess into black reveals',
    },
    ui: {
      background: 'Concrete grey with muted Deco teal panels',
      surface: 'Fluted-stripe cards with tile-border trims',
      components: 'Pylon-crest headers, sunburst badges, bronze-relief buttons',
      motion: 'Stepped setback transitions; relief panels gleam on hover',
    },
  },
  {
    slug: 'neo-vernacular',
    ctx: "Architects retooling local building knowledge: Hassan Fathy's mud-brick New Gourna (Egypt, begun 1948) with Nubian vaults; Laurie Baker's cost-effective brick and jaali housing in Kerala (1960s-90s); Francis Kere's Gando Primary School, Burkina Faso (2001, Aga Khan Award 2004) with clay-brick vaults and passive airflow; Rural Studio's Hale County timber projects (Auburn, since 1993). Municipalities, NGOs and villagers fund it; the point is climate and craft fit, not style quotation.",
    vd: {
      shape: 'Simple deep-shaded volumes — vaulted, courtyard-edged, thick-walled — that answer local weather',
      line: 'Honest brick courses, jaali perforation grids, bamboo and timber laths left visible',
      composition: 'Buildings cluster around shade courtyards; roofs and overhangs stage the section',
      texture: 'Sun-dried mud brick, lime wash, handmade brick, thatch and corrugated sheets as found',
    },
    typ: {
      display: 'Locally painted sign-writing on plaster walls',
      body: 'Plain humanist sans or regional scripts for community signage',
      notes: 'Chalked diagrams and instructional text left on walls',
    },
    lit: {
      quality: 'Filtered and bounced — jaali light, deep-veranda shade, high small windows',
      temperature: 'warm-toned',
      shadow: 'Thick walls carve cool full-day shade; interiors glow reflected',
    },
    ui: {
      background: 'Sun-bleached earth tones with limewash white',
      surface: 'Brick-textured cards with woven-jaali overlays',
      components: 'Jaali-pattern icons, courtyard-shaped layouts, craft-annotated footnotes',
      motion: 'Breeze-slow hovers; sections load like pouring water into a basin',
    },
  },
  {
    slug: 'ryukyu-gusuku',
    ctx: "Stone castles of the Ryukyu Kingdom, raised 12th-15th centuries by aji lords on Okinawa's coral ridges. Sho Hashi, who unified the kingdom by 1429, made Shuri his seat; Zakimi and Nakagusuku were strengthened by the warlord Gosamaru mid-15th century. Coursed coral-limestone ramparts follow the terrain into layered courtyards with arched gates like Shureimon; Chinese tributary trade brought lacquer arts and feng-shui siting. UNESCO listed the gusuku sites in 2000; Shuri's Seiden burned in 2019.",
    vd: {
      shape: 'Layered courtyards of curving coral-limestone walls climbing ridgelines toward tiered timber halls',
      line: 'Stacked-block wall courses follow the slope; arched gateways frame procession lines',
      composition: 'Gates and plazas stage approach by degrees; walls hug contours rather than commanding grids',
      texture: 'Coral limestone weathered honey-grey, red tiled roofs, vermilion lacquer and white plaster',
    },
    typ: {
      display: "Chinese-style plaque calligraphy over gates — Shureimon's Land of Propriety tablet",
      body: 'Ryukyuan brush documents in kanji and kana',
      notes: 'Vermilion official seals on tributary trade papers',
    },
    lit: {
      quality: 'Bright subtropical haze over coral stone; lantern light in lacquered halls',
      temperature: 'warm-toned',
      shadow: 'Wall curves pool deep shade at their bases; gate tunnels stay cool and dark',
    },
    ui: {
      background: 'Coral-stone beige under hazy sky blue',
      surface: 'Stacked-stone cards with vermilion lacquer accents',
      components: 'Arch-gate modals, tiered-hall mastheads, seal-script badges',
      motion: 'Procession-slow reveals through arches; wave-sway parallax on scroll',
    },
  },
  {
    slug: 'lingnan-arcade-qilou',
    ctx: "Arcaded shophouses (qilou) lining Canton, Kaiping, Haikou and Quanzhou streets from the 1870s-1930s. Returned Overseas Chinese merchants from Southeast Asia financed rows whose upper floors cantilever over continuous walkways — rain- and sun-proof promenades for monsoon trade — mixing Neoclassical pilasters, Art Nouveau ironwork, tropical shutters and Lingnan brick friezes. Guangzhou's Enning Road rows and Kaiping's neighbouring diaolou towers (UNESCO 2007) belong to the same remittance economy.",
    vd: {
      shape: 'Narrow deep shophouses repeated into terraces; upper storeys cantilevered over the pavement',
      line: 'Pilastered facades stacked with carved friezes, arched openings and balcony ironwork',
      composition: 'Street reads as one continuous colonnade; shopfronts slide beneath an unbroken shadow line',
      texture: 'Painted brick and stucco, carved plaster panels, louvered shutters, glazed tile shopfronts',
    },
    typ: {
      display: 'Shop signs in bold brush or neon-outline Chinese and romanised mixes',
      body: 'Hand-painted price boards and ledger-hand invoices',
      notes: 'Column-side characters mark merchant guild affiliations',
    },
    lit: {
      quality: 'Harsh equatorial sun above, permanent walkway shade below; shop lamps at noon',
      temperature: 'warm-toned',
      shadow: 'The arcade casts a single hard-edged shadow band down the street',
    },
    ui: {
      background: 'Faded pastel stucco tones over warm brick',
      surface: 'Shophouse-facade cards with frieze top borders',
      components: 'Arcade-covering banners, hanging shop-sign tabs, balcony-rail dividers',
      motion: 'Awning-flip hovers; streetcar-smooth horizontal section slides',
    },
  },
  {
    slug: 'pilgrimage-church-architecture',
    ctx: "Churches along the roads to Santiago de Compostela and other relic shrines (11th-12th centuries), where crowds dictated form: barrel-vaulted naves with galleries, ambulatories and radiating chapels so pilgrims could circulate past relics without breaking Mass. Sainte-Foy at Conques, Saint-Sernin in Toulouse and the cathedral consecrated at Compostela in 1128 — with Master Mateo's Portico da Gloria (1188-1211) — are the type's monuments; tympana like Conques' Last Judgment taught through stone.",
    vd: {
      shape: 'Long cruciform naves with tribune galleries, an ambulatory ring and radiating chapel apses',
      line: "Transverse arches march down barrel vaults; pilaster strips divide bays for the crowds' progress",
      composition: 'Procession loops past the relic; portals stage tympanum sermons at eye level before entry',
      texture: 'Golden Sainte-Foy reliquary, worn stone paving, honeyed limestone and painted capitals',
    },
    typ: {
      display: 'Tympanum inscriptions in monumental romanesque capitals',
      body: 'Pilgrim-guide script and reliquary dedication lines',
      notes: 'Scallop-shell badges of the pilgrim roads recur as motifs',
    },
    lit: {
      quality: 'Oil-lamp glow on gold reliquary; dim clerestory light down the nave spine',
      temperature: 'warm-toned',
      shadow: 'Gallery arches layer shade; the ambulatory hides relic chapels in flicker',
    },
    ui: {
      background: 'Pilgrim-road parchment with limestone warmth',
      surface: 'Chapel-apse cards ringed like an ambulatory',
      components: 'Scallop-shell waymarks, tympanum banners, reliquary hero panels',
      motion: 'Processional left-to-right flow; apses bloom open one by one',
    },
  },
  {
    slug: 'chettinad-mansions',
    ctx: "Mansion compounds of the Nattukottai Chettiars of Sivaganga district, Tamil Nadu — bankers whose Burma, Ceylon and Malaya networks peaked under the British Raj, 1870-1930. In Karaikudi, Kanadukathan and Pallathur they fused Tamil courtyard plans with Burmese teak columns, Italian marble, Belgian mirrors and Athangudi's hand-cast floor tiles. Post-war nationalizations (Burma, 1960s) ended the trade; villages of marble-floored mansions now trade on heritage tourism and house museums.",
    vd: {
      shape: 'Deep succession of courtyards down an axial hall, room after room under one long tiled roof',
      line: 'Teak columns carved with European motifs; pilastered facades with parapet urns and arches',
      composition: 'Front door to inner shrine runs one visual axis; light wells punctuate the procession',
      texture: 'Hand-cast Athangudi floor tiles, polished teak, Italian marble, egg-plaster walls, chandelier glass',
    },
    typ: {
      display: 'Tamil inscriptions and family titles carved over teak doors',
      body: 'Ledger-hand account books of the banking houses',
      notes: 'Brass plaques record pious endowments and guild membership',
    },
    lit: {
      quality: 'Downshaft light through each courtyard; chandelier sparkle on marble by evening',
      temperature: 'warm-toned',
      shadow: 'Middle rooms sit in cool penumbra between lit courtyards',
    },
    ui: {
      background: 'Athangudi tile pastels over deep teak brown',
      surface: 'Patterned-tile cards framed by carved-wood borders',
      components: 'Courtyard-axial scroll, teak-column dividers, ledger-style data tables',
      motion: 'Slow processional scroll; tile-pattern shimmers on hover',
    },
  },
  {
    slug: 'sognefjord-stave-churches',
    ctx: "Norway's medieval pine stave churches cluster along the Sognefjord: Urnes (c. 1130-50, UNESCO 1979) preserves the Urnes-style portal of intertwined beasts and is the oldest surviving; Borgund (c. 1180) stands complete with dragon heads and layered shingled roofs; Kaupanger and Hopperstad stand nearby. Staves on timber sills over stone footings carry the whole frame; around 1,000 churches once existed, fewer than 30 survive, and 19th-century nationalism made them national icons.",
    vd: {
      shape: 'Tiered pyramidal roofs over a tight timber core; dragon-head gables climb to a central mast point',
      line: 'Urnes-carved vine-and-beast strapwork winds around portals; vertical staves articulate walls',
      composition: 'Steep roof tiers step upward in staggered gables; a narrow dark portal admits the nave',
      texture: 'Tar-black pine shingles and planks, silvered carved wood, iron pintles and locks',
    },
    typ: {
      display: 'Runic inscriptions and carved runic graffiti on portal frames',
      body: 'Hand-copied post-Reformation hymnals and parish books',
      notes: 'Carved animal-head terminals terminate every bargeboard',
    },
    lit: {
      quality: 'Low fjord light through small porthole windows; tar-black wood swallows daylight',
      temperature: 'cool-toned',
      shadow: 'Interiors are near-dark, candle-warm only; carvings read by touch and torch',
    },
    ui: {
      background: 'Tar black with fjord grey-blue',
      surface: 'Shingle-scale cards with carved-vine borders',
      components: 'Dragon-head icons, tiered-gable mastheads, stave-line dividers',
      motion: 'Slow mast-rise reveals; vine strapwork draws itself on hover',
    },
  },
  {
    slug: 'dogon-architecture',
    ctx: "Villages of the Dogon, who settled the Bandiagara Escarpment of Mali from the 15th century under pressure from Mandé empires and Islamization. Togu na men's houses rest on low carved pillars; cylindrical laterite-and-mud granaries with thatch cones store millet beneath the hogon's terrace house; Tellem cave burials honeycomb the cliffs above. Cosmology maps the village plan onto Amma and Lebe myths; UNESCO listed the Cliff of Bandiagara in 1989; dama funerals still gather mask dancers.",
    vd: {
      shape: 'Stacked cubic houses and cylindrical granaries climbing the escarpment in stepped terraces',
      line: 'Low togu na facades carried on carved caryatid pillars; ladder poles and jutting beam lines',
      composition: 'Village plan mirrors cosmology: forge, shrine, hogon house and granaries in ordered bands',
      texture: 'Laterite-red mud plaster, woven millet-stalk thatch, carved posts worn smooth by hands',
    },
    typ: {
      display: 'Symbolic relief signs on granary doors — seeds, stars, nommo figures',
      body: 'Divination grids and signs scratched in sand or dust',
      notes: 'Mask forms (kanaga, sirige) double as clan and cult marks',
    },
    lit: {
      quality: 'Sahel sunlight flaring on red walls; hearth glow under low togu na ceilings',
      temperature: 'warm-toned',
      shadow: 'Escarpment shadow sweeps the village at dusk; granary interiors stay near dark',
    },
    ui: {
      background: 'Laterite red under dry-season dust',
      surface: 'Mud-plaster cards with woven-thatch roofs as headers',
      components: 'Granary-door icon buttons, ladder-line dividers, mask-figure badges',
      motion: 'Terrace-step section reveals; slow dust-light drift on hover',
    },
  },
  {
    slug: 'khorezmian-conical-minarets',
    ctx: "Minaret craft of Khorezm on the Amu Darya delta: the 60 m Kutlug Timur minaret at Kunya-Urgench (11th-14th centuries, UNESCO 2005) and Islam Khoja's 57 m tower in Khiva (1908-10) taper from wide brick drums to slender cones, banded with glazed rings, ornamental brickwork and Kufic belts. Gurganj was the Khwarazmian capital until the Mongol destruction of 1221; the surviving towers anchored caravans and still give the oasis its skyline identity across Uzbekistan and Turkmenistan.",
    vd: {
      shape: 'Slender tapering brick cones rising from wide drums, like lighthouses over low mud-brick towns',
      line: 'Narrow vertical brick patterns, glazed ring-bands and Kufic inscription belts encircle the shaft',
      composition: 'A single dominant tower organises the flat oasis skyline; bazaars and domes trail below',
      texture: 'Baked brick in honey and rose tones, turquoise glaze flecks, wind-polished mortar',
    },
    typ: {
      display: 'Kufic inscription belts in glazed and relief brick',
      body: 'Endowment (waqf) texts in naskh on carved panels',
      notes: 'Master-builder dates woven into the brick ornament bands',
    },
    lit: {
      quality: 'Desert dawn and dusk rake the cone; muezzin-era oil lamps ringed the top platform',
      temperature: 'warm-toned',
      shadow: 'The tower casts a slow-moving needle shadow across the old city',
    },
    ui: {
      background: 'Desert sand gold under haze',
      surface: 'Brick-patterned cards with glazed-band accents',
      components: 'Taper-spire progress bars, Kufic-belt dividers, minaret mastheads',
      motion: 'Sun-shadow sweep across headers on load; slow cone-rise transitions',
    },
  },
  {
    slug: 'tata-somba-architecture',
    ctx: "Fortified earthen compounds (tata) of the Somba, or Betammaribe, people along the Atacora range on the Benin-Togo border, built and rebuilt against 18th-19th-century slave raiders. Ground floors stable animals and kitchens; upper terraces carry round thatched towers that serve as granaries, lookouts and refuge; banco walls rendered with laterite gravel shed the rains. Togo's Koutammakou landscape (UNESCO 2004) protects the sister tower houses; Benin's Natitingou region preserves the tata Somba.",
    vd: {
      shape: 'Stepped two-storey earth mounds with round turrets and granary towers sprouting from flat terraces',
      line: 'Curved turreted silhouettes; horizontal banco courses and drainage grooves score the walls',
      composition: 'Family life stacked vertically — cattle below, grain and people above, altars at the top',
      texture: 'Hand-smoothed banco in ochre and grey, laterite gravel render, thatch caps, polished treads',
    },
    typ: {
      display: 'Initiation symbols and protective signs moulded low on walls',
      body: 'Ancestor marks and talismans fixed beside entry doors',
      notes: 'Granary door panels carry carved seed and star signs',
    },
    lit: {
      quality: 'Hard Sahel sun bleaching the terraces; oil-lamp glow in windowless ground rooms',
      temperature: 'warm-toned',
      shadow: 'Turrets cast island shadows across flat roofs; interiors are cooling earth-dark',
    },
    ui: {
      background: 'Ochre earth with grey laterite speckle',
      surface: 'Banco-render cards with rounded turret corners',
      components: 'Turret-shaped badges, terrace-level nav steps, granary-lid icons',
      motion: 'Terrace-by-terrace page build-up; slow dust settle on hover',
    },
  },
  {
    slug: 'sienese-mannerism',
    ctx: "Siena negotiated Mannerism through its own: Baldassare Peruzzi, born in Siena in 1481, carried the city's drafting culture into Roman practice, while at home the Piccolomini — Pope Pius II raised the Logge del Papa (1462, Antonio Federighi) beside the cathedral — and the mercantile guilds favoured sinuous, restless classicism like the Loggia della Mercanzia's writhing carving. After Florence absorbed the Republic in 1555, Sienese workshops kept a decorative richness the Roman maniera never lost.",
    vd: {
      shape: 'Loggias and facades where classical orders stretch, knot and overwrite one another',
      line: 'Sinuous carved figures twist down piers; volutes and swagged garlands run against the grid',
      composition: 'Small urban stages — piazza loggias and family palazzi — composed as theatrical backdrops',
      texture: 'Cream travertine and terracotta, deep-cut foliage, polished marble columns',
    },
    typ: {
      display: 'Humanist capitals with Mannerist swashes on civic inscriptions',
      body: 'Chancery italic of the Biccherna treasury ledgers',
      notes: 'Wool-guild emblems and the Lupa she-wolf cap the inscriptions',
    },
    lit: {
      quality: 'Piazza glare bouncing into shaded loggia bays; candlelit contrapposto at night',
      temperature: 'warm-toned',
      shadow: 'Deep-cut carving holds its own shade; loggia arches band the light',
    },
    ui: {
      background: 'Siena ochre and brick with travertine cream',
      surface: 'Carved-stone cards with swagged corner garlands',
      components: 'Loggia-arch headers, twisted-volute icons, she-wolf badges',
      motion: 'Contrapposto sway on hover; panels tilt like theatrical flats',
    },
  },
  {
    slug: 'bam-buro-und-gro-wirtschaftsbauten',
    ctx: "West Germany's Wirtschaftswunder workhorse: the office and large commercial building type that reconstruction-era companies and ministries commissioned through the 1950s-60s. Steel-and-glass slabs on stone plinths, with transparent ground-floor foyers, became the rebuilt city's new face — Dusseldorf's Dreischeibenhaus (Hentrich & Petschnigg, 1957-60), Bonn's Langer Eugen (1966-69), Egon Eiermann's IBM tower in Stuttgart (1960-62) — precision engineering offered as civic confidence.",
    vd: {
      shape: 'Slab towers on plinth bases; rational bay grids stepped for light, air and street scale',
      line: 'Thin mullion lines and spandrel bands rule the facade; plinth stone banding grounds the mass',
      composition: 'Slabs set at angles for daylight; the plinth handles the street while the tower claims the skyline',
      texture: 'Anodised aluminium, single-pane glass, polished stone lobby floors, terrazzo stairs',
    },
    typ: {
      display: 'Company names in measured grotesque lettering on fascia bands',
      body: 'Formal German serif-and-sans mixes on brass lobby directories',
      notes: 'Floor-number glyphs repeat as facade-level markers',
    },
    lit: {
      quality: 'Glass walls admit even northern light; lobby uplighters gleam on stone after dark',
      temperature: 'neutral-toned',
      shadow: 'Mullions cast pencil shadows across open floors; plinths shade their foyers',
    },
    ui: {
      background: 'Cool glass grey with stone plinth beige',
      surface: 'Mullion-grid cards with aluminium edge trims',
      components: 'Slab-tower mastheads, bay-grid dividers, brass directory lists',
      motion: 'Elevator-smooth vertical transitions; facade bands slide on scroll',
    },
  },
  {
    slug: 'dong-drum-towers-and-wind-rain-bridges',
    ctx: "Village monuments of the Dong (Kam) people of Guizhou, Guangxi and Hunan: drum towers — pagoda-like stacks of eaves over an open firepit hall where elders gather and a drum signals assemblies — and wind-and-rain bridges, covered arcades spanning streams as bench and shelter. Chengyang's Yongji Bridge, Sanjiang County (1912-1924), and Zhaoxing's five clan towers show Dong carpenters building mortise-and-tenon without a single nail; 'Dong Villages' sit on China's UNESCO tentative list (2012).",
    vd: {
      shape: 'Multi-tiered square towers tapering upward over pavilions; long gallery bridges spanning the streams',
      line: 'Dovetail mortise-and-tenon lines, upturned eave corners, balustraded verandas along the galleries',
      composition: 'Towers anchor village centres by the pond; bridges stitch settlement to paddy fields',
      texture: 'Silver-grey fir, dark tile roofs, soot-blackened firepit timber, bamboo flooring',
    },
    typ: {
      display: 'Bridge-name boards and couplets in brush characters at each pavilion',
      body: 'Clan-rule notices and donor lists carved on interior beams',
      notes: 'Donor names and sums recorded beam by beam on bridge ribs',
    },
    lit: {
      quality: 'Open pavilion daylight; firepit glow inside the tower at dusk',
      temperature: 'warm-toned',
      shadow: 'Layered eaves shade the hall tiers; gallery benches sit in cool dimness',
    },
    ui: {
      background: 'Paddy-green wash over timber grey',
      surface: 'Carpentry-joint cards with eave-curve headers',
      components: 'Pagoda-tier mastheads, gallery-bench lists, drum-circle badges',
      motion: 'Eave-corner bounce on hover; bridge-length horizontal scroll',
    },
  },
  {
    slug: 'bukhara-wooden-doors',
    ctx: "The carved wooden doors (darvoza) of Bukhara's mosques, madrasas and houses — elm and karagach leaves cut by ustoz woodcarvers into girih stars, islimi vines and calligraphic cartouches in deep relief. Under the Manghit emirs (1756-1920) the ateliers furnished monuments like Bolo Haouz mosque's iwan (1712) and the Ark's gates; doors marked thresholds of learning and piety, patterns passing master to apprentice and feeding sister workshops from Khiva to the Ferghana Valley.",
    vd: {
      shape: 'Tall double-leaf panels squared into borders, medallions and corner cartouches',
      line: 'Layered relief carving: strapwork girih over scrolling islimi, edge beads finishing every field',
      composition: 'Door leaves mirror each other; a central knocker medallion anchors the symmetry',
      texture: 'Silvered elm grain under wax, hand-cut chip relief, worn brass knockers and ring pulls',
    },
    typ: {
      display: 'Cartouche inscriptions in carved naskh and thuluth',
      body: 'Guild stamps and master signatures in low relief',
      notes: 'Door lintels carry foundation dates and donor names',
    },
    lit: {
      quality: 'Courtyard glare on the outer faces; entry-hall half-light modelling the relief',
      temperature: 'warm-toned',
      shadow: 'Chip-carved voids go velvet black; threshold light draws a bright seam',
    },
    ui: {
      background: 'Warm elm brown with aged bronze accents',
      surface: 'Relief-carved cards with bead-frame borders',
      components: 'Cartouche labels, medallion-knocker buttons, vine-scroll dividers',
      motion: 'Double-leaf swing transitions; relief deepens on hover',
    },
  },
  {
    slug: 'musgum-earth-architecture',
    ctx: "Beehive dwellings (teleuk) of the Musgum people along the Logone River in Cameroon's Far North, toward Lake Chad. Builders raise each dome without formwork, coiling sun-dried earth by hand, then finish the shell with relief ribs — chevrons and zigzags — that double as stiffening, handholds and rain channels under a top cap. Family compounds cluster the domes like gourds; the type drew 20th-century structural study as compression-only design and still shelters households through the wet season.",
    vd: {
      shape: 'Smooth catenary domes and beehive huts in compound clusters, each with a capped top vent',
      line: 'Relief ribs spiral and zigzag down the shells; chevron bands ring the base like stitches',
      composition: 'Domes of varying heights cluster by kinship; tiny door portals face away from storm winds',
      texture: 'Hand-smoothed earth polished by palms, fingertip grooves, straw-flecked render, smoke patina',
    },
    typ: {
      display: 'Moulded geometric signs at door lintels',
      body: 'Decorated calabash gourds repeating the wall pattern language',
      notes: "Ribs read as craft signature — each builder's hand visible",
    },
    lit: {
      quality: 'Semi-arid white sun; interior glow only through the door and top vent',
      temperature: 'warm-toned',
      shadow: 'Rib shadows crawl as the sun crosses; interiors hold cool cellar dark',
    },
    ui: {
      background: 'Sun-bleached clay with dust haze',
      surface: 'Dome-curve cards with ribbed relief edges',
      components: 'Dome-shaped badges, rib-line dividers, vent-dot indicators',
      motion: 'Slow shell-grow entrance scaling; ripple from the door on tap',
    },
  },
  {
    slug: 'manierismo-lombardo',
    ctx: "Milan's Mannerism ran through reform and public argument: Archbishop Carlo Borromeo (1564-84) imposed liturgical rigour in his Instructions fabricae and employed Pellegrino Tibaldi (San Fedele, begun 1569); Galeazzo Alessi reshaped Santa Maria presso San Celso; Martino Bassi's Dispareri (1570) turned the Duomo's tiburio orders into civic debate. Under Spanish rule Milan wanted gravity — muscular stonework, dark nave drama, orthodox plans: maniera disciplined by the Counter-Reformation.",
    vd: {
      shape: 'Austere facades over theatrical interiors; giant-order pilasters spanning two storeys',
      line: 'Muscular rusticated lines and tiered giant orders; heavy volutes bridge mismatched storeys',
      composition: 'Long dark naves pull the eye toward lit, sculptural high altars; side chapels stack in depth',
      texture: 'Dappled lake-stone ashlar, white Carrara statuary, gilded stucco, black marble floors',
    },
    typ: {
      display: 'Latin dedication lettering in crisp roman caps on facades',
      body: 'Borromeo-era pastoral letters in printed italic roman',
      notes: 'Cardinal coats of arms carved into portal pediments',
    },
    lit: {
      quality: 'Chapel-side shafts pierce dim naves; gold altars catch whatever light enters',
      temperature: 'cool-toned',
      shadow: 'Giant pilasters stripe the nave in alternating dark bands',
    },
    ui: {
      background: 'Milan grey-stone with cold marble white',
      surface: 'Rusticated-block cards with volute corner bridges',
      components: 'Giant-order mastheads, chapel-niche cards, heraldic badges',
      motion: 'Grave, weighted transitions; altar glow rises on scroll',
    },
  },
  {
    slug: 'gothic-sereno',
    ctx: "A 2010s-20s European current rather than an academy term: designers rework Gothic structure — pointed arches, ribbed vaults, tracery — into calm, low-contrast interiors of pale stone, pale wood and tall light shafts. Peter Zumthor's Kolumba Museum, Cologne (2007), rising beside the ruined Gothic St. Kolumba church, set the register; church-conversion hotels like Mechelen's Martin's Patershof and 'serene gothic' moodboard tags on design platforms carried it through the 2020s interior wave.",
    vd: {
      shape: 'Tall pointed volumes emptied of clutter: single arches, clean vaults, slender clustered piers',
      line: 'Tracery reduced to quiet mullion lines; lancet and ogee curves drawn in one weight',
      composition: 'Vertical calm — one focal window or altar wall; everything else steps back',
      texture: 'Pale honed stone, lime-plaster walls, pale oak pews, linen and brushed brass',
    },
    typ: {
      display: 'Refined serif capitals echoing blackletter proportions without the density',
      body: 'Light humanist sans for captions; old-style numerals',
      notes: 'Tracery-derived line icons replace heavy ornament',
    },
    lit: {
      quality: 'Cool north light through tall lancets; candles kept for warmth, not gloom',
      temperature: 'cool-toned',
      shadow: 'Soft grey shadows pool under arches; never black, always legible',
    },
    ui: {
      background: 'Limestone pale grey with linen off-white',
      surface: 'Matte stone cards with hairline tracery rules',
      components: 'Lancet-arch modals, mullion-line dividers, quiet brass accents',
      motion: 'Slow, breath-like fades; light shafts drift across on scroll',
    },
  },
  {
    slug: 'liminal-spaces',
    ctx: "Born on 12 May 2019, when a 4chan /x/ thread captioned an anonymous photo of an empty yellow room: 'if you're not careful and you noclip out of reality...' The Backrooms text spread to Reddit (r/backrooms, r/LiminalSpace) and Tumblr, where photographers and 3D artists posted vacant malls, night hallways and drained pools. Pandemic-era emptiness fed the mood in 2020; Kane Pixels' found-footage YouTube series (2022) and an A24 film development made it a mainstream screen-horror vocabulary.",
    vd: {
      shape: 'Deep one-point-perspective voids: endless corridors, empty atriums, pools and parking decks at night',
      line: 'Fluorescent tube lines and tile grids run to a vanishing point; nothing breaks the receding plane',
      composition: 'Centred, head-height framing like security footage; no people, no exit signs, no focal event',
      texture: 'Worn commercial carpet, damp pool tiles, stippled ceilings, yellowed wallpaper sheen',
    },
    typ: {
      display: 'Institutional exit signage and mall-directory caps, always slightly wrong',
      body: 'Flat administrative sans like fire-safety notices and room numbers',
      notes: 'Timestamps and camera labels echo CCTV overlays',
    },
    lit: {
      quality: 'Flat buzzing fluorescence; sodium parking light; underwater pool glow',
      temperature: 'neutral-toned',
      shadow: 'Shadow arrives only as darker zones of the same haze — no source, no relief',
    },
    ui: {
      background: 'Underlit beige with a fluorescent green-grey cast',
      surface: 'Tile-grain cards with wet sheen at the edges',
      components: 'Directory-style nav, door-shaped buttons that lead nowhere, CCTV-framed media',
      motion: 'Looped idle drift as if walking without arriving; flicker at mains frequency',
    },
  },
  {
    slug: 'light-academia',
    ctx: "The sunlit branch of Dark Academia, codified on Tumblr and TikTok around 2021 as the 'academia' family bloomed: sun-flooded libraries, linen and cream wardrobes, Austen and Woolf paperbacks, study playlists and grainy photos of Cambridge courtyards in June. It kept the scholarly persona and thrifted fashion of its parent aesthetic while shedding the gothic dread; Pinterest boards, studytubers and slow-living accounts carried it through 2022-23 as the soft-focus study desk became a genre.",
    vd: {
      shape: 'Airy Georgian rooms and library stacks washed in window light; round tables, worn rugs, tall sashes',
      line: 'Soft ivory lines: sash-window glazing bars, rows of book spines, tailored piping on linen',
      composition: 'Morning-side framing — desks by windows, teacups mid-frame, nothing allowed to brood',
      texture: 'Linen weave, aged paper, cream wool knits, brass lamps, leather spines softened by sun',
    },
    typ: {
      display: 'Cream-on-cream engraved serifs with wedding-invitation manners',
      body: 'Typewriter and bookish serifs on oat-toned paper',
      notes: 'Pressed flowers and marginalia doodles as ornament',
    },
    lit: {
      quality: 'Diffused golden-hour daylight through muslin; no lamp drama, no night',
      temperature: 'warm-toned',
      shadow: 'Shadows stay honeyed and short; corners hold gentle cream shade',
    },
    ui: {
      background: 'Oat cream with weak-tea gold',
      surface: 'Paper-grain cards with linen-border trims',
      components: 'Library-card tabs, ribbon bookmarks, marginalia note fields',
      motion: 'Page-turn soft slides; dust motes float across on scroll',
    },
  },
  {
    slug: 'weirdcore',
    ctx: "A low-fidelity image genre that matured on imageboards and Tumblr through the mid-2010s and was named around 2017-2020, peaking on r/weirdcore (founded 2020) and TikTok in 2021. Amateurs edit found photos and early-3D renders with alien glyph text, duplicated eyes, skyboxes and clipping artefacts to evoke disorientation — creepy but nostalgic, kin to dreamcore and liminal spaces. No studio owns it: anonymous, template-shared, endlessly remixed making is the point.",
    vd: {
      shape: 'Flat amateur snapshots with pasted-in eyes, floating text and low-poly objects breaking the scene',
      line: 'JPEG artefact edges, hard lasso selections, MS-Paint outlines over soft blurry photos',
      composition: 'First-person emptiness — corridors, skies, carpets — with eyes where faces should be',
      texture: 'Compression mush, dithered gradients, CRT scanlines, nostalgic 2000s camera grain',
    },
    typ: {
      display: 'Alien glyph strings and garbled WordArt headlines',
      body: 'Default system fonts, lowercase and unbothered',
      notes: 'Text often half-nonsense: you have been here before',
    },
    lit: {
      quality: 'Overexposed flash, washed skies, monitor glow — light with no weather',
      temperature: 'neutral-toned',
      shadow: 'Shadows abandoned or misplaced — dropped where the edit wanted, not where light agrees',
    },
    ui: {
      background: 'Skybox blue over dead-grass green, compression-crushed',
      surface: 'Low-res photo cards with torn selection edges',
      components: 'Eye-sprite cursors, glitch text fields, skybox gradients, blinking artefact badges',
      motion: 'Stuttery frame-skips; elements jitter one pixel on hover',
    },
  },
]
