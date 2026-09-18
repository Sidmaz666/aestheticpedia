/**
 * Patch 14-d — full-depth backfill for the 35 EXISTING entries in manifest-14d.json
 * (Architectural Styles tail: vernacular, regional revivals, imperial & housing typologies).
 * Fields per patch: ctx (cultural context), vd (visual DNA), typ (typography),
 * lit (lighting), ui (UI translation). Slugs match the manifest exactly.
 * Consumed by scripts/research/apply-patches.ts (non-destructive merge into existing entries).
 */

export const PATCHES: any[] = [
  {
    slug: "vietnamese-nguyen-architecture",
    ctx: "Court architecture of the Nguyen dynasty (1802-1945), whose emperors Gia Long and Minh Mang raised the Imperial City at Hue from 1804 to 1833 on Beijing-inspired axial plans built by Vietnamese guilds with timber halls, tiered tiled roofs and Perfume-River siting. Royal tombs of Minh Mang, Tu Duc and Khai Dinh line the hills; under Khai Dinh the craft mixed French concrete, glass and porcelain mosaic into the inherited canon.",
    vd: {
      shape: "Tiered timber halls on stone terraces; double-eaved tiled roofs sweeping upward at the hips along axial walled compounds",
      line: "Curved ridge lines, dragon and phoenix brackets, straight lacquered timber colonnades, crenelated low walls",
      composition: "Axial symmetrical grids ringed by moats; tomb landscapes staging lakes, honor courts and pavilion stairs",
      texture: "Glazed yellow-and-green tube tiles, red lacquer and gilding over dense wood, grey brick, inlaid porcelain and glass mosaic at Khai Dinh",
    },
    typ: {
      display: "Gilded Chinese-character plaques (chu Han) hung vertically on lacquered black ground",
      body: "Royal brush calligraphy transcribed by court scribes in chu Han and chu nom",
      notes: "Stelae in tomb stele-houses (bi dinh); vermilion seal-script chops over edict papers",
    },
    lit: {
      quality: "Soft humid river haze; lantern glow and incense smoke in dim timber interiors",
      temperature: "warm-toned",
      shadow: "Deep eave shadows cooled by courtyards; gilded surfaces catching candle points",
    },
    ui: {
      background: "Ivory citadel grey with jade tile glaze",
      surface: "Lacquered redwood panels with gilt borders",
      components: "Arch-shaped nav like Ngo Mon gates; plaque-style headers; seal-chop badges",
      motion: "Slow curtain lifts and lantern-fade transitions; gilt shimmer on scroll",
    },
  },
  {
    slug: "trullo",
    ctx: "Dry-stone dwellings of the Itria Valley, Puglia, most famously Alberobello, where Count Giangirolamo II of Conversano permitted a 17th-century settlement of mortarless houses that could be swiftly demolished to evade royal building taxes. Peasant stonemasons raised some 1,500 trulli of local limestone in cone-on-drum units; UNESCO-listed since 1996, the cones carry whitewashed apotropaic signs against misfortune.",
    vd: {
      shape: "Corbelled beehive cones on squat drum walls; whitewashed cylindrical masses studded with pinnacles",
      line: "Concentric rings of chiancarelle slabs stepping to a keystone; rectangular door and window apertures punched in white field",
      composition: "Clusters of single-cell units multiplied along sloped lanes; roofs as ornament field with chimneys, pinnacles and painted sigla",
      texture: "Rough coursed limestone blocks under limewash; roof slabs weathered silver-grey; packed-rubble cores",
    },
    typ: {
      display: "Hand-painted religious and apotropaic symbols on key stones",
      body: "Chalk-lettered house names and proverbs on whitewashed lintels",
      notes: "Trullo Sovrano plaques and UNESCO signage in Alberobello lanes",
    },
    lit: {
      quality: "Hard Adriatic sun over glaring white cones; lamplit hearth glow within the single room",
      temperature: "warm-toned",
      shadow: "Low doorways cast dark tunnels; cool grey-white interior shade contrast",
    },
    ui: {
      background: "Dazzling lime white with warm grey stone shadow",
      surface: "Chalky card texture with grain of hand-coursed masonry",
      components: "Cone-shaped cards, pinnacle bullet points, rounded portal buttons",
      motion: "Sun-scaling hover that brightens roofs; gentle whitewash bloom on load",
    },
  },
  {
    slug: "ethiopian-rock-hewn-churches",
    ctx: "Eleven churches excavated downward into the volcanic tuff of Lalibela in the Lasta highlands under the Zagwe king Gebre Mesqel Lalibela (c. 1181-1221), conceived as a new Jerusalem after Muslim conquests blocked pilgrimage routes. Monastic masons hollowed pits, trenches and tunnels while copying Aksumite architecture; Bete Medhane Alem remains the largest monolithic church on earth. UNESCO-listed in 1978 and still a living pilgrimage site.",
    vd: {
      shape: "Monolithic blocks sunk in 12-metre trenches; Greek-cross and basilica volumes read as inverse sculpture",
      line: "Aksumite-style string courses, stepped window frames and blind arcades cut in relief; trench walls plumb-struck",
      composition: "Northern, eastern and western groups linked by tunnels and covered passages around a river named Jordan",
      texture: "Red-brown volcanic tuff with chisel scatter, dusted by centuries of ritual soot and beeswax",
    },
    typ: {
      display: "Ge'ez (Ethiopic) script incised beside crosses and window mouldings",
      body: "Illuminated Gospel manuscripts on parchment chanted by deacons at lecterns",
      notes: "Processional crosses stamped with Ge'ez dedications carried in the trenches",
    },
    lit: {
      quality: "Dramatic shafts from trench edges onto the worship floor; oil lamps before painted cloths",
      temperature: "warm-toned",
      shadow: "All shade carved from rock; interiors lit like caves, gold crosses floating in darkness",
    },
    ui: {
      background: "Terracotta tuff red deepening to umber",
      surface: "Matrix-cut stone grain with ash-dust matte",
      components: "Cross-framed panels, trench-divided columns, kerub-painted dividers",
      motion: "Light-shaft sweeps descending across sections; slow scroll like tunnel descent",
    },
  },
  {
    slug: "mississippian-platform-mound",
    ctx: "Flat-topped earthen pyramids of the Mississippian world (c. 800-1600 CE), built basket-load by basket-load across the Mississippi valley and Southeast. At Cahokia, Monks Mound rose in four terraces to some 30 metres, carrying the great temple and residence of the paramount chief above a grand plaza; Moundville and Etowah repeated the formula. Mounds anchored maize-farming chiefdoms and their mortuary-ceremonial complexes.",
    vd: {
      shape: "Truncated pyramids of stacked earth terraces bearing thatched temple halls above sunken plazas",
      line: "Clean terrace edges aligned to cardinal directions; ramp causeways striking straight out to the plaza",
      composition: "Plaza-centered site plans; mounds ranked by height around open ground with woodhenges and ridge-top burials",
      texture: "Packed yellow-brown loess and basket-laid fill, patched and resurfaced in darker layers",
    },
    typ: {
      display: "Engraved shell gorgets with ritual figures and symbols",
      body: "Southeastern Ceremonial Complex iconography in copper, shell and repousse",
      notes: "Pictographic notation without alphabets; meaning carried in mound placement",
    },
    lit: {
      quality: "Open-sky floodplain light; fire glow on temple summits against dusk river mist",
      temperature: "warm-toned",
      shadow: "Terrace faces shading with the day; mound shadows measuring plaza hours",
    },
    ui: {
      background: "Floodplain ochre-gold with river-silt brown",
      surface: "Loam-grain fills with terrace banding",
      components: "Ziggurat-stack cards, plaza-wide galleries, ramp-style links",
      motion: "Terrace-by-terrace build-in on load; horizon drift between sections",
    },
  },
  {
    slug: "dutch-colonial-architecture",
    ctx: "Building tradition spread by the Dutch Republic and its VOC/WIC companies from about 1600: Cape Dutch farmsteads like Groot Constantia (granted 1685) with their gabled fronts, Hudson Valley homes such as the Bronck House (1663) with gambrel roofs and Dutch doors, and the Indies landhuizen of Batavia with high roofs and deep verandas against tropical heat. Each colony recut Dutch brick and timber with local materials and labour.",
    vd: {
      shape: "Broad gambrel and hipped roofs over generous brick boxes; Cape gables crowning symmetrical facades",
      line: "Curved ornamental gable profiles, layered cornices, mullioned sash windows, plank doors split as Dutch doors",
      composition: "Central-hall plans flanked by rooms; stoeps (porches) stretching along facades; winged farmstead layouts",
      texture: "Kiln-fired brick, limewash and plaster, thatch or shingle roofs, teak and local hardwood joinery",
    },
    typ: {
      display: "Carved gable datestones and house monograms over stoep doors",
      body: "VOC ledgers and notarial deeds in 17th-century Dutch book hand",
      notes: "Gevelstenen (gable stones) inscribed with house names and trades",
    },
    lit: {
      quality: "Low northern daylight in Europe; equatorial glare filtered through wide verandas in the tropics",
      temperature: "cool-toned",
      shadow: "Deep stoep and veranda shade banding the facade; soft gable shadow at noon",
    },
    ui: {
      background: "Delft-tile off-white with brick undertone",
      surface: "Plaster matte with carved gableline accents",
      components: "Gable-shaped headers, Dutch-door split menus, sash-grid image frames",
      motion: "Stoep-length horizontal pans; gentle shingle-tile stagger on hover",
    },
  },
  {
    slug: "khrushchyovka",
    ctx: "Mass prefab housing decreed after Khrushchev's 1955 attack on architectural excess and the 1957 housing reform: five-storey panel blocks like Vitaly Lagutenko's K-7 (1959) put separate flats within reach of millions, with 2.5-metre ceilings and no lift. Series 1-464 and 1-468 rolled out from state house-building combines; by the 1970s tens of millions of Soviet families had moved from communal flats into these blocks.",
    vd: {
      shape: "Long five-storey slabs in repeated bays, sometimes zig-zagged into courts; strictly modular box volumes",
      line: "Load-bearing panel seams reading as a grid; small punched windows in strict rhythm; no cornice or plinth play",
      composition: "Microdistrict layout of parallel blocks around schools, clinics and courtyards; entrances on short stair rhythm",
      texture: "Smeared grey precast concrete, tile-clad ground floors, flaking paint over panel joints",
    },
    typ: {
      display: "Enamel house numbers and street plates in utilitarian sans-serif",
      body: "Standardized notices in Soviet GOST-era type; narrow newspaper gothics for bulletins",
      notes: "Courtyard notice boards, pioneer-poster and kiosk lettering everywhere",
    },
    lit: {
      quality: "Flat overcast light on grey facades; stark fluorescent stairwells day and night",
      temperature: "cool-toned",
      shadow: "Weak ambient shadows; panel seams and window reveals drawing thin grey lines",
    },
    ui: {
      background: "Concrete panel grey with bleached sky band",
      surface: "Seamed panel texture with slight stain and repaint patina",
      components: "Grid-locked bays, numbered block cards, service-panel forms",
      motion: "Mechanical slide-ins in fixed rhythm; hover = panel highlight, no easing theatrics",
    },
  },
  {
    slug: "central-asian-muqarnas",
    ctx: "Honeycomb vaulting perfected in Timurid Samarkand: muqarnas tiers reconcile square rooms with domes and dress the portal arches from the Gur-e Amir (1404-05) to the Registan madrasas of Ulugh Beg (1417-20), Sher-Dor (1619-36) and Tilya-Kori (1646-60), where gilt muqarnas fills the interiors. Stalactite cells of brick and glazed tile descend from Nishapur and Fatimid prototypes through the Shah-i-Zinda necropolis facades.",
    vd: {
      shape: "Stacked niche-cells cascading in tiers from squinches, portal hoods and cornice bands",
      line: "Faceted rhombus cell grid; crisp arrises throwing geometric shadow; turquoise banding along tier edges",
      composition: "Honeycomb field framed by script bands and tile borders; tiers narrowing toward the keystone",
      texture: "Glazed cobalt, turquoise and white brick facets over raw terracotta backs; gilded papier-mache interiors",
    },
    typ: {
      display: "Banna'i brick lettering and thuluth tile bands across portal faces",
      body: "Naskh and thuluth Quranic bands running beneath muqarnas hoods",
      notes: "Timurid stamp seals and foundation texts naming patrons in tile",
    },
    lit: {
      quality: "Desert glare outside; tiered cells catch low sun so each cell holds its own gradient",
      temperature: "warm-toned",
      shadow: "Deep reciprocal niche shadows; stepped shading making masonry read like lace",
    },
    ui: {
      background: "Lapis-tile night blue over baked brick orange",
      surface: "Faceted tile glaze with grout-grid shimmer",
      components: "Honeycomb cell menus, portal-arch modals, tiered dropdowns",
      motion: "Cell-by-cell cascade reveals; tiered depth stacking on expand",
    },
  },
  {
    slug: "vesara-hoysala-style",
    ctx: "Temple idiom of the Hoysala kings (c. 1026-1343) ruling from Dwarasamudra: the Chennakesava temple at Belur (1117, under Vishnuvardhana), Hoysaleswara at Halebidu (1121) and Keshava at Somanathapura (1268) stand on star-shaped jagatis, carved from soapstone soft enough to hold jewellery-grade detail. Vesara hybridizes northern and southern temple grammar; UNESCO listed the Sacred Ensembles of the Hoysalas in 2023.",
    vd: {
      shape: "Multi-pointed stellate plans on raised platforms; pyramidal vimana towers; pillared mandapa halls",
      line: "Lathe-turned polished pillars, miniature tower pilasters, deeply incised scroll bands",
      composition: "Horizontal frieze registers of elephants, horsemen, makara and deities wrapping every wall angle",
      texture: "Chloritic schist polished to soap-gloss; stone taking filigree perforation and bead work",
    },
    typ: {
      display: "Old-Kannada inscriptions on plinths and pillar bases",
      body: "Donative grants in Halegannada (old Kannada) set in neat incised lines",
      notes: "Over 2,000 inscriptions across Hoysala temples record patrons and sculptors",
    },
    lit: {
      quality: "Bright Deccan sun raking across star plans so every facet gets its own light",
      temperature: "warm-toned",
      shadow: "Micron-fine relief shadows in friezes; oil-lamp warmth in garbhagriha gloom",
    },
    ui: {
      background: "Soapstone green-grey with saffron accent",
      surface: "Polished stone cards with frieze-banding borders",
      components: "Star-scalloped containers, pillar-list navigation, frieze strip dividers",
      motion: "Facet-by-facet light rotation on scroll; frieze strips auto-marching",
    },
  },
  {
    slug: "kashan-merchant-houses",
    ctx: "Courtyard mansions raised by Kashan's carpet and silk merchants under the Qajars: the Tabatabaei house (1880s) and Borujerdi house (1857), both by master builder Ustad Ali Maryam, pack reception (biruni), family (andaruni) and servant quarters around desert-cooling courtyards. Windcatcher towers (badgirs), mirrored reception rooms and sash windows of stained glass were paid for with the Persian carpet trade.",
    vd: {
      shape: "Inward-facing courtyard blocks with tall badgir windcatcher towers over flat desert roofs",
      line: "Pointed iwan arches framing reception halls; slender cypress-column colonnades; crisp stucco moulding lines",
      composition: "Concentric sequence of gate, court, iwan and private courts; mirrored talar alcoves as visual centers",
      texture: "Earthen plaster, cut brick, mirror mosaic, stained orosi glass, painted panels by court-trained artists",
    },
    typ: {
      display: "Calligraphic stucco panels in nasta'liq quoting Hafez and Saadi",
      body: "Bazaar merchants' correspondence and ledgers in nasta'liq with basmala headings",
      notes: "Mirror-cut inscriptions above talar openings; foundation texts naming patrons",
    },
    lit: {
      quality: "Blinding courtyard glare tamed by stained-glass sashes into coloured hall light",
      temperature: "warm-toned",
      shadow: "Blue-gold glass light pooling on carpets; deep badgir shade at noon",
    },
    ui: {
      background: "Desert-rose plaster with stained-glass jewel accents",
      surface: "Stucco matte panels with mirror-mosaic highlight strips",
      components: "Iwan-arch cards, courtyard grid gallery, badgir scroll indicators",
      motion: "Light-shifter colour wash on hover; calm fades between courtyard views",
    },
  },
  {
    slug: "ksar-architecture",
    ctx: "Fortified mudbrick and rammed-earth villages (ksour) of the pre-Saharan oases along trans-Saharan caravan routes: Ait Benhaddou on the Ounila road to Marrakech (UNESCO 1987), the M'zab towns of Algeria, Tamnougalt in the Draa valley. Collective granaries (agadirs), kin quarters and a mosque or marabout rise behind defensive gates; families re-plaster the earthen walls after each rain, keeping the fabric alive since medieval times.",
    vd: {
      shape: "Stacked earthen cubes climbing a hill inside corner towers; one-gate labyrinth of alleys",
      line: "Sharp corner abutments, pointed-arch gate openings, projecting palm-trunk spouts, crenellated parapet lines",
      composition: "Hierarchical clusters around agadir granary, mosque and the kasbah of the caid; alleys shaded by house bridges",
      texture: "Red-gold pise and mudbrick, limewash bloom, straw-flecked surfaces, palm-beam shadows",
    },
    typ: {
      display: "Carved door lintels with tribal marks; Arabic foundation plaques",
      body: "Hand-lettered souk signage and Quranic school slates",
      notes: "UNESCO boundary tablets; film-set notices (Ait Benhaddou served Gladiator and Lawrence of Arabia)",
    },
    lit: {
      quality: "Searing Saharan noon flattened to white; honeyed raking light at dawn and dusk",
      temperature: "warm-toned",
      shadow: "Palm-beam and eave shadows in hard bars; alley shade shifting hourly",
    },
    ui: {
      background: "Pise terracotta grading to sand ochre",
      surface: "Adobe grain with straw fleck and lime bloom",
      components: "Crenellated headers, gate-arch modals, granary-grid cards",
      motion: "Heat-shimmer accents on long sections; gates slide open between views",
    },
  },
  {
    slug: "brick-gothic",
    ctx: "Backsteingotik of the Hanseatic coast, 13th-15th centuries: cities on the stoneless North German plain fired monumental brick instead, led by Luebeck's Marienkirche (1250-1350) whose 38-metre brick vaults set the model for Stralsund, Wismar, Rostock, Gdansk and Torun. Merchant councils funded parish-hall churches and stepped-gable townhouses; glazed bricks lent green and violet accents to tower crowns and gable patterns.",
    vd: {
      shape: "Hall-church and basilica masses in flat brick, slender west towers, stepped and curved gables",
      line: "Strapped brick quoining, round-arched blind arcades (Blenden), thin glaze stripes along cornices",
      composition: "Rhythmic bay grid of pointed windows; stepped-gable skylines stacking church and town hall frontages",
      texture: "Red-brown clinker brick with black-glazed pattern courses; lime mortar joints weathered soft",
    },
    typ: {
      display: "Donor coats of arms and city seals on gables and portals",
      body: "Hanseatic mercantile ledgers in Low German blackletter book hand",
      notes: "Brass guild markers; bells cast with founder names; charters of the Hanseatic League",
    },
    lit: {
      quality: "Maritime haze bouncing low light across brick; candle and stained glow in tall naves",
      temperature: "cool-toned",
      shadow: "Cold grey gable shadows; vault shadows pooling behind thin brick ribs",
    },
    ui: {
      background: "Clinker red-brown with sea-fog grey",
      surface: "Brick-bond texture with glazed accent courses",
      components: "Pointed-arch cards, stepped-gable headers, Hanse seal badges",
      motion: "Bell-swing parallax on banners; mortar-join fade transitions",
    },
  },
  {
    slug: "manierismo-toscano",
    ctx: "Mannerist building campaigns under the Medici dukes: Michelangelo's Laurentian Library vestibule (1524-34) sank columns into walls and hung blind windows; Ammannati's Ponte Santa Trinita (1567-69) curved its arches elastically; Vasari's Uffizi (1560-74) tuned a court into a corridor; Buontalenti's Boboli Grotto dissolved architecture into fake stalactites. Florentine workshops stretched classical grammar into deliberate unease for ducal display.",
    vd: {
      shape: "Compressed, elongated facades; stair ramps and courts treated as instruments of tension rather than repose",
      line: "Banded rustication joints, sunk and blind colonnades, broken pediments, bulging bracket lines",
      composition: "Contrived symmetry where elements refuse their loads; windows in blank fields; axial surprise endings",
      texture: "Deep-channelled rusticated stone, polished pietra serena, shell-and-sponge stucco in grotto work",
    },
    typ: {
      display: "Cartouche inscriptions in choppy Roman capitals framing portals",
      body: "Grand-ducal court print mixing roman capitals with festival-book italics",
      notes: "Vasari's Lives marginalia culture; triumphal-entry ephemera lettering",
    },
    lit: {
      quality: "Sharp Tuscan sun carving rustication; grotto interiors lit by oil lamps through damp air",
      temperature: "warm-toned",
      shadow: "Intensified window-reveal shadows; deliberate spotlighting of strained ornamental members",
    },
    ui: {
      background: "Pietra serena grey-beige with dawn cream",
      surface: "Rusticated stone grain with cartouche corners",
      components: "Cartouche badges, broken-pediment headers, scroll-stretch dividers",
      motion: "Elastic ease curves on expand (arch stretch); slightly off-rhythm hovers",
    },
  },
  {
    slug: "moorish-revival",
    ctx: "Nineteenth-century romantic Islamophile style sparked by Washington Irving's Tales of the Alhambra (1832) and Owen Jones's Alhambra Court at the Crystal Palace (1854). Ludwig Forster's Leopoldstadter Tempel, Vienna (1858), launched the synagogue fashion taken up by Budapest's Dohany Street temple (1854-59) and New York's Central Synagogue (1872); later cinema palaces like Atlanta's Fox Theatre (1929) traded on the same horseshoe-arch fantasy.",
    vd: {
      shape: "Slender horseshoe-arched arcades, onion and ogee domes, minaret-like stair towers",
      line: "Polylobed and cusped arch outlines, ablaq two-tone banding, arabesque strapwork borders",
      composition: "Central-plan halls under domes; Alhambra-style mirador facades; tiled wainscots wrapping interiors",
      texture: "Polychrome zellige-style tiles, gilt stucco, marble wainscots, deep-cut plaster muqarnas imitations",
    },
    typ: {
      display: "Elaborate Arabic-style lettering in Hebrew, Latin or Cyrillic on facades and donor stones",
      body: "Prayer books and program leaflets in 19th-century ornamental display types",
      notes: "Synagogue dedication tablets; cinema palace marquee letters echoing Alhambra fantasy",
    },
    lit: {
      quality: "Jewelled rose windows and clerestories casting mosaic light; gas and early electric chandeliers",
      temperature: "warm-toned",
      shadow: "Cusped-arch lacework shadows; gilded ceiling glow against deep balcony shade",
    },
    ui: {
      background: "Alhambra rose-tile red with lapis accents",
      surface: "Zellige-pattern cards with gilt-stucco borders",
      components: "Cusped-arch modals, dome headers, arabesque dividers, minaret toasts",
      motion: "Tile-mosaic shimmer on hover; curtain-arch wipes between sections",
    },
  },
  {
    slug: "stick-style",
    ctx: "American transitional style of about 1860-1880, named by historian Vincent Scully: balloon-frame cottages whose applied stickwork suggested the frame beneath. Calvert Vaux's villas and his 1857 book Villas and Cottages seeded it; Cape May's Emlen Physick Estate (1879) shows the mature manner. Steam-driven millwork made carpenter-built ornament cheap, a middle-class seaside fashion before Queen Anne took over.",
    vd: {
      shape: "Steep-gabled, irregular boxy masses; porches and towers breaking the roofline",
      line: "Applied stickwork grids on walls, angled braces, raking vergeboards, trusses drawn across gables",
      composition: "Asymmetric facades balancing gables, bay windows and veranda runs; walls as visible frame diagrams",
      texture: "Planed lumber boards and battens, shingle gable fills, incised Eastlake detailing",
    },
    typ: {
      display: "Eastlake-incised house plaques and carved bargeboard monograms",
      body: "Victorian pattern-book typography in the Downing and successor catalogs",
      notes: "Palliser and Bicknell pattern books circulating stick designs mail-order",
    },
    lit: {
      quality: "Coastal summer light glancing off shingles; lace-curtain interior glow at dusk",
      temperature: "warm-toned",
      shadow: "Stickwork casting fine cage shadows across clapboard",
    },
    ui: {
      background: "Weathered clapboard cream with veranda green",
      surface: "Batten-board texture with incised corner ornaments",
      components: "Stickwork-outline cards, gable banners, truss dividers",
      motion: "Frame-by-frame assemble on load; porch-swing gentle hover sway",
    },
  },
  {
    slug: "nieuwe-bouwen",
    ctx: "Dutch functionalist modernism of the 1920s-30s: J.J.P. Oud's Kiefhoek housing (Rotterdam, 1925-30) and Weissenhof row, Johannes Duiker's Zonnestraal sanatorium (1926-28) and Open Air School (Amsterdam, 1927-30), and Brinkman & Van der Vlugt's Van Nelle Factory (Rotterdam, 1925-31; UNESCO 2014) fused De Stijl clarity with CIAM social program - daylight, air, hygiene and affordable flats as instruments of reform.",
    vd: {
      shape: "Pin-wheel and slab volumes on columns; cantilevered glass corners, roofscapes on pilotis",
      line: "Steel mullion grids, continuous window bands, primary-colour accent lines at parapets",
      composition: "Open plans flowing from court to roof terraces; ramps and stairs choreographed as circulation ribbons",
      texture: "White render, glass brick, polished concrete, tubular steel, teak plywood interiors",
    },
    typ: {
      display: "Van Nelle factory signage and De Stijl poster alphabets in plain sans",
      body: "Wendingen magazine pages in stylized hand lettering; brochures in geometric sans",
      notes: "Weissenhof 1927 exhibition catalogs; CIAM congress literature",
    },
    lit: {
      quality: "North-light glass-wall luminosity; sanatorium sun terraces as program, not luxury",
      temperature: "cool-toned",
      shadow: "Thin column shadows; pure geometry rendered as crisp tonal planes",
    },
    ui: {
      background: "Paper white with primary red-blue-yellow accents",
      surface: "Glass and steel plane cards with no bevel",
      components: "Ribbon-window bands, modular grid tiles, pilotis-style side rails",
      motion: "Mechanical ortho transitions; colour-block swaps on hover, minimal easing",
    },
  },
  {
    slug: "metabolism",
    ctx: "Japanese megastructure movement launched at the 1960 World Design Conference in Tokyo by Kiyonori Kikutake, Kisho Kurokawa, Fumihiko Maki and Masato Otaka, with Kenzo Tange's Tokyo Bay plan as backdrop. Growth and replaceability of building parts answered the postwar urban boom; built results ranged from Tange's Yamanashi towers (1964) to Kurokawa's Nakagin Capsule Tower (1972), whose capsules are now preserved in museums.",
    vd: {
      shape: "Cylindrical service cores with clipped-on modular pods; cantilevered megaframe platforms",
      line: "Round and square module outlines, bolted joint lines, exposed capsule seams",
      composition: "Vertical stacking of identical units around circulation spines; the city read as a growing organism",
      texture: "Cast concrete cores, moulded plastic capsule shells, brushed steel, exposed bolt heads",
    },
    typ: {
      display: "Katakana-heavy Expo signage and capsule numbering",
      body: "1960s Japanese periodicals (Shinkenchiku) in mixed gothic-mincho setting",
      notes: "Osaka Expo 70 pavilion graphics; the 1960 manifesto Metabolism: The Proposals for New Urbanism",
    },
    lit: {
      quality: "Neon city reflection on capsule windows; clinical core lighting at night",
      temperature: "cool-toned",
      shadow: "Module-to-module shadow gaps; night interiors glowing like cells",
    },
    ui: {
      background: "Deep harbour navy with capsule white",
      surface: "Moulded-plastic panel cards with visible bolts",
      components: "Pod-stack cards, core-spine navigation, capsule toggle switches",
      motion: "Modules dock and undock; springy growth animation on new items",
    },
  },
  {
    slug: "critical-regionalism",
    ctx: "Theory turned practice: Alexander Tzonis and Liane Lefaivre coined the term (1981) and Kenneth Frampton rallied it in Perspecta 20 (1983) as resistance to placeless modernization. Exemplars include Jorn Utzon's Bagsvaerd Church (1976), Geoffrey Bawa's Sri Lankan houses and Kandalama Hotel, Tadao Ando's Church of the Light (1989) and Renzo Piano's Tjibaou Cultural Centre (1998) - modern tectonics inflected by climate, craft and memory.",
    vd: {
      shape: "Simple universal volumes opened to courtyards, breezeways and framed landscape vistas",
      line: "Clean concrete and timber lines meeting handmade joint details; frame-to-vernacular junctions",
      composition: "Path-choreographed plans (Bawa's journeys), light-slot compositions, terrain-following sections",
      texture: "Fair-faced concrete, local stone and timber, terracotta tile, woven and thatched infill",
    },
    typ: {
      display: "Restrained sans letting site incisions and local scripts dominate",
      body: "Monograph books (GA Houses, Perspecta) pairing essays and plans",
      notes: "Frampton essay typography as canon; bilingual exhibition catalogs",
    },
    lit: {
      quality: "Site-tuned daylight: Ando's slotted beams, Bawa's dappled veranda filter",
      temperature: "warm-toned",
      shadow: "Calculated light slots on blank concrete walls; veranda half-shade as living room",
    },
    ui: {
      background: "Off-white gallery neutral with site-photo colour",
      surface: "Concrete and timber matte cards with restrained borders",
      components: "Plan-drawing figure frames, slot-light accent rules, terrain scroll",
      motion: "Slow deliberate easing; shadow-draw transitions following scroll position",
    },
  },
  {
    slug: "vernacular-revival",
    ctx: "Neo-vernacular building of the late 20th-21st century reviving local technique with new means: Wang Shu's Amateur Architecture Studio built the Ningbo History Museum (2008) from millions of reclaimed wa-pan tiles and bricks, Anna Heringer raised the METI mud-and-bamboo school in Bangladesh (2005), and MASS Design Group's Butaro Hospital (Rwanda, 2011) employed local masons and volcanic stone - a lineage running back through Lutyens' Surrey craft houses.",
    vd: {
      shape: "Regional roofscapes and wall masses re-drawn with contemporary openings and plans",
      line: "Craft joinery and brick bond lines set against crisp modern datum lines",
      composition: "Patchwork elevations from salvage (Ningbo); courtyards and verandas recycled from tradition",
      texture: "Raw rammed earth, recycled tile and brick, bamboo weave, local volcanic stone",
    },
    typ: {
      display: "Hand-incised project names; bilingual local-script signage",
      body: "Pritzker citation prose and journal essays in clean sans",
      notes: "Mason name boards at Butaro; bamboo-stamp marks on METI walls",
    },
    lit: {
      quality: "Climate-first daylight: high monsoon roofs throwing soft bounce light",
      temperature: "warm-toned",
      shadow: "Eave and screen shadows tuned to region; interior shade as comfort device",
    },
    ui: {
      background: "Earth-and-loam neutrals varying per region",
      surface: "Salvage-tile mosaic cards with raw edges",
      components: "Courtyard-style panels, craft-tag chips, region map blocks",
      motion: "Material-swap hover (tile reveals); earthy slow fades",
    },
  },
  {
    slug: "tulou-hakka-roundhouses",
    ctx: "Giant rammed-earth clan fortresses of the Hakka in Fujian's mountains, mostly 15th-20th century: Yongding's Chengqi Lou holds four concentric rings and 400 rooms, Zhencheng Lou (1912) shows the merchant variant, and the Tianluokeng cluster in Nanjing county shows the type ranged on ridgelines. One gate, earthen walls a metre or more thick over bamboo, ancestral hall at the centre; UNESCO listed 46 tulou in 2008.",
    vd: {
      shape: "Massive circular or square earthen rings, 3-5 storeys inward, pitched tile roofs descending to the court",
      line: "Concentric corridor and room-bond lines; single gate axis; ring balconies stacking floor lines",
      composition: "Radial organization around a central ancestral hall; outer defense, inner domesticity, layered privacy rings",
      texture: "Yellow-brown rammed earth shot with bamboo and straw, grey clay-tile roofs, timber galleries",
    },
    typ: {
      display: "Gate couplets and horizontal plaques naming the clan hall",
      body: "Family genealogy books (zu pu) and primers in the courtyard classrooms",
      notes: "Gate-stone inscriptions with building dates; Hakka migration mottos",
    },
    lit: {
      quality: "Mountain mist diffusing courtyard light; hearth and lantern warmth inside the rings",
      temperature: "warm-toned",
      shadow: "Deep ring-within-ring shade; stacked eave shadows spiraling the inner well",
    },
    ui: {
      background: "Rammed-earth tan with mountain-mist grey",
      surface: "Earth-grain cards ringed by tile-band borders",
      components: "Ring-navigation dials, radial family-tree cards, gate-arch entries",
      motion: "Concentric ripple reveals; rings rotate slightly on scroll",
    },
  },
  {
    slug: "kerala-architecture",
    ctx: "Monsoon-tuned building art of Kerala's Namboothiri, Nair and Syrian Christian communities: nalukettu tharavad houses (four blocks around a nadumuttam courtyard), padippura gatehouses, charupadi veranda benches and steep gabled roofs of teak, laterite and Mangalore tile. Temples like Guruvayur and Vadakkunnathan, mural-painted shrines and koothambalam theatres share the grammar; thachan carpenter guilds codified it in vaasthu tradition.",
    vd: {
      shape: "Low-spread gabled blocks around open courtyards; attic levels under sweeping monsoon roofs",
      line: "Slender turned-wood columns, carved bracket lines, crisp eave and ridge runs",
      composition: "Graded privacy from padippura to nadumuttam; murals framing sanctum axes",
      texture: "Polished red-oxide floors, teak grain, laterite block, clay tile, mural lime-plaster",
    },
    typ: {
      display: "Grantha-derived Malayalam inscriptions on temple walls and door frames",
      body: "Palm-leaf manuscripts and Malayalam almanac printing",
      notes: "Mural captions in Kerala script; horoscope scroll lettering at weddings",
    },
    lit: {
      quality: "Filtered monsoon light through deep eaves; nilavilakku bell-lamp glow in halls",
      temperature: "warm-toned",
      shadow: "Veranda half-light all day; murals emerging from sanctum gloom",
    },
    ui: {
      background: "Red-oxide floor tones with teak brown",
      surface: "Wood-grain panels with mural-border accents",
      components: "Courtyard-grid layouts, eave-curve headers, lamp-icon dividers",
      motion: "Monsoon-rain line accents; gentle veranda-swing hover",
    },
  },
  {
    slug: "javanese-joglo",
    ctx: "Noble house form of Java, Indonesia, built of teak by hereditary carpenter guilds: an open pendopo pavilion for guests stands before the enclosed dalem quarters, both carried on four saka guru columns whose tumpang sari stacked-beam crowns symbolize the sacred mountain. Priyayi families and the courts of Yogyakarta and Surakarta refined the type; cosmological proportions governed every measurement.",
    vd: {
      shape: "Wide hipped pendopo roofs floating on columns over terraced plinths; stepped tumpang sari crowns at the core",
      line: "Elaborately carved saka guru shafts, interlocking beam lines, empyak frieze runs",
      composition: "Hierarchical sequence pendopo-pringgitan-dalem; roof stack rising toward the house's sacred centre",
      texture: "Deep-patinated teak, gilded carving highlights, woven bamboo walls, stone-plinth terraces",
    },
    typ: {
      display: "Carved house-name plaques and wayang-inspired pendopo lintel lettering",
      body: "Serat court poetry in Javanese aksara on daluang paper",
      notes: "Batik sidomukti motifs framing wedding and ceremonial texts",
    },
    lit: {
      quality: "Pendopo daylight bouncing off white courtyard; oil-lamp wayang glow at night",
      temperature: "warm-toned",
      shadow: "Column-row shade bands across pendopo floors; roof darkness over carved crowns",
    },
    ui: {
      background: "Jati teak brown with ivory court cream",
      surface: "Carved-wood texture cards with gold-line borders",
      components: "Pendopo-open navigation, stacked-crown headers, batik dividers",
      motion: "Gamelan-tempo pulsing accents; pendopo-column parallax drift",
    },
  },
  {
    slug: "scottish-baronial",
    ctx: "Native tower-house idiom of Lowland Scotland (16th-17th c.) - corbelled round turrets, crow-stepped gables, bartizans and shot-holes at Crathes (1596), Castle Fraser and Craigievar (1626) - reborn as a national revival for Walter Scott's Abbotsford (1817-24), Queen Victoria and Prince Albert's Balmoral (1853-55) and David Bryce's banks and schools. Romantic Jacobitism and Highland imagery made it the established look of Scottish power.",
    vd: {
      shape: "L-plan tower masses with clustering corner turrets; steep roofs and finials over bartizans",
      line: "Crow-stepped gable zigzags, string courses, gun-loop slots turned ornament, corbel courses",
      composition: "Asymmetric tower groupings scaled to prospect; heraldic panels over doors; walled courtyards",
      texture: "Grey-speckled harl render over rubble stone, slate roofs, wrought-iron finials",
    },
    typ: {
      display: "Carved heraldic arms with Latin mottos over armorial doorpieces",
      body: "Scots chancery documents; Abbotsford-era romantic antiquarian print",
      notes: "Clan crest signage; Victorian tourist-guide lettering for Balmoral routes",
    },
    lit: {
      quality: "Cool northern daylight through narrow loops; hearth and horn-lamp glow in halls",
      temperature: "cool-toned",
      shadow: "Deep turret shadows hugging walls; short summer nights, long winter gloom",
    },
    ui: {
      background: "Harl stone cream with heather moor purple",
      surface: "Roughcast texture cards with armorial corner pieces",
      components: "Turret-corner frames, crow-step dividers, crest badges",
      motion: "Banner unfurl transitions; torch-flicker hover on accents",
    },
  },
  {
    slug: "swahili-coastal-architecture",
    ctx: "Stone towns of the Indian Ocean littoral built by Swahili merchant patricians from coral rag and lime: Kilwa Kisiwani's Great Mosque (11th-13th c.) and Husuni Kubwa palace, and Zanzibar's Stone Town, whose House of Wonders (1883, Sultan Barghash) was East Africa's first electrified building. Omani, Gujarati and African hands made mangrove-pole roofs, baraza benches and famous carved doors; Kilwa and Stone Town are UNESCO-listed.",
    vd: {
      shape: "Dense flat-roofed coral-rag blocks shading narrow streets; palaces and mosques as cubic landmarks",
      line: "Pointed and square door arches, deep-reveal window niches, plaster string courses",
      composition: "Carved door lintel as facade centrepiece; baraza benches stitching street walls; rooftop terrace grid",
      texture: "Coral rag under lime plaster, mangrove-pole ceilings, carved Indian teak doors, brass door studs",
    },
    typ: {
      display: "Kufic inscriptions on mihrabs and coral tomb pillars",
      body: "Merchant letters in Arabic-script Swahili; clove-trade ledgers",
      notes: "Door lintels bearing Quranic verses and owner names; Stone Town plaques",
    },
    lit: {
      quality: "Equatorial glare bouncing off lime walls; dhow-deck noon light and reef-tinted mornings",
      temperature: "warm-toned",
      shadow: "Street-canyon shade alternating with courtyard light wells; mangrove-pole ceiling shadows",
    },
    ui: {
      background: "Coral-lime white with ocean teal accents",
      surface: "Plastered-rag texture cards with carved-border motifs",
      components: "Door-carved panel headers, baraza bench menus, port-arcade galleries",
      motion: "Tide-like eased pans; dhow-sail parallax across coastal sections",
    },
  },
  {
    slug: "ancestral-puebloan-great-houses",
    ctx: "Chaco Canyon's great houses (c. 850-1150 CE), built by Ancestral Puebloans with core-and-veneer sandstone masonry: Pueblo Bonito's D-shaped mass held over 600 rooms in four storeys, with Chetro Ketl, engineered roads radiating outward, great kivas like Casa Rinconada and the Sun Dagger solar calendar on Fajada Butte completing the ritual geography. Turquoise, macaws and cacao tied Chaco into Mesoamerican exchange; Hopi and Zuni peoples count it ancestral.",
    vd: {
      shape: "Tiered D-shaped masonry terraces hugging canyon walls; round great-kiva volumes inset in plazas",
      line: "Banded masonry courses, T-shaped door apertures; engineered road lines radiating to the horizon",
      composition: "Plaza-centered room clusters with aligned wall axes across the canyon; kiva circles punctuating rectilinear grids",
      texture: "Pink-gold sandstone coursing, mud mortar, timber vigas hauled from distant forests, clay plaster patches",
    },
    typ: {
      display: "Petroglyph and pictograph iconography on cliff panels",
      body: "Tally and symbol marks on pottery and rock walls; kiva mural painting",
      notes: "Archaeoastronomy markers; Hopi and Zuni oral designation of room functions",
    },
    lit: {
      quality: "High-desert clarity under deep blue sky; kiva interiors lit by a roof-hatch shaft",
      temperature: "warm-toned",
      shadow: "Cliff shadows swallowing terraces afternoons; hatch-light spot on the kiva floor",
    },
    ui: {
      background: "Canyon sandstone rose with desert-sky blue",
      surface: "Banded-stone texture cards with sun-bleached matte",
      components: "Kiva-circle frames, road-line connectors, terrace-stack galleries",
      motion: "Sun-angle shadow sweep mirroring the Sun Dagger; slow canyon pan",
    },
  },
  {
    slug: "fijian-bure",
    ctx: "Village houses of indigenous Fiji built on raised stone or earth platforms (yavu): timber frames lashed with magimagi coconut-fibre sennit, walls of woven reed and bamboo, and steep thatch roofs built without a single nail. The chiefly bure levu and the taller spirit-house bure kalou crowned village plans around the rara green; the form persists in meeting houses, island resorts and the 1992 Great Council of Chiefs complex in Suva.",
    vd: {
      shape: "Low oval and rectangular huts with towering thatch ridges, doors barely waist-high",
      line: "Rafter and purlin pole lines crossing; lashings crossing every joint in visible diamonds",
      composition: "Village plan rings the rara green; the chief's bure raised highest on its yavu mound",
      texture: "Golden reed thatch, woven bamboo wall mats, polished coconut-wood posts",
    },
    typ: {
      display: "Masi (barkcloth) stencilled patterns marking ceremonial interiors",
      body: "Early Fijian printing in bold slab roman for chiefly correspondence",
      notes: "Meke dance costume motifs and masi patterns as civic decoration",
    },
    lit: {
      quality: "Ocean glare softened by thatch; a single doorway admitting a blade of light",
      temperature: "warm-toned",
      shadow: "Dim lashed-timber interiors; kava-ceremony glow beside the tanoa bowl",
    },
    ui: {
      background: "Pandanus cream with lagoon teal edge",
      surface: "Thatch-fibre texture cards on barkcloth mats",
      components: "Yavu-mound stepped frames, lashing-X dividers, thatch headers",
      motion: "Palm-sway gentle drifts; kava-bowl ripple on tap interactions",
    },
  },
  {
    slug: "goan-portuguese-architecture",
    ctx: "Portuguese Goa's layering from 1510: Old Goa's Baroque basilicas - the Basilica of Bom Jesus (1594-1605) housing St. Francis Xavier's relics and the vast Se Cathedral (1562-1619) - stand in laterite; after the Mandovi silted and epidemics emptied the city, the capital moved to Panjim, whose Fontainhas quarter keeps ochre and indigo houses with balcao verandas, oyster-shell window panes, sopo benches and azulejo name tiles.",
    vd: {
      shape: "Latin-cross basilica masses in laterite; low terraced townhouses with balcao porches",
      line: "Baroque pediment volutes, twisted-wood altarpiece carving, arched balcao colonnades, tiled ridge lines",
      composition: "Church squares orchestrating processional axes; street walls of colour-washed houses stepping to lanes",
      texture: "Laterite under limewash in ochre, indigo and bottle green; oyster-shell window translucency",
    },
    typ: {
      display: "Azulejo house-name tablets in blue-and-white script",
      body: "Konkani and Portuguese parish registers; 19th-century Indo-Portuguese printing",
      notes: "Street shrines and chapel date plaques; Fontainhas heritage trail markers",
    },
    lit: {
      quality: "Bright maritime light outside; soft pearlescent glow through shell-pane windows",
      temperature: "warm-toned",
      shadow: "Deep balcao veranda shade; high laterite church interiors in candle penumbra",
    },
    ui: {
      background: "Laterite red-brown with ochre-house yellow",
      surface: "Limewash cards with azulejo corner tiles",
      components: "Balcao bench menus, azulejo badges, chapel-arch frames",
      motion: "Monsoon-shower ripple transitions; shell-window light flicker on hover",
    },
  },
  {
    slug: "brezhnevka",
    ctx: "Successor to the khrushchevka under Leonid Brezhnev (1964-82): 9-16 storey panel and brick series like the Moscow II-68 and Leningrad 1-528 lines brought lifts, garbage chutes, bigger kitchens and 2.6-2.7 metre ceilings, assembled into microdistricts such as Chertanovo. Still standardized and prolific, brezhnevki were rated for 50 years of service and remain the everyday backdrop of post-Soviet city life.",
    vd: {
      shape: "Tall parallel slabs and point towers with service cores; rooftop lift-motor and parapet caps",
      line: "Window-band rhythms per section type; vertical stairwell slots; wider panel joint lines than khrushchevka",
      composition: "Microdistrict composition of schools, clinics, garages and green yards between slab ranks",
      texture: "Brick-toned ceramic tile cladding, grey panel fields, weathered paint, rusted balcony iron",
    },
    typ: {
      display: "Index-number plaques (series, quarter) and enamel street signage",
      body: "State press and instruction placards in orderly serif and gothic mixes",
      notes: "Metro, kiosk and laundry signage from late-Soviet design bureaus",
    },
    lit: {
      quality: "Low sun glinting off tiled facades; amber stairwell lamps and blue TV window glow",
      temperature: "cool-toned",
      shadow: "Slab-scale shadows crossing courtyards; night stair shafts glowing orange",
    },
    ui: {
      background: "Tile-apartment beige with evening amber",
      surface: "Ceramic tile gloss meeting painted panel matte",
      components: "Flat-iron grids, stairwell-slot progress bars, courtyard map modules",
      motion: "Elevator-damped slides; TV-static hover shimmer on panels",
    },
  },
  {
    slug: "gopuram-temple-gate",
    ctx: "Pyramidal gate towers of South Indian Dravidian temples, ascendant after Pandya rulers of the 12th-13th century raised them above the sanctum: Madurai's Meenakshi temple grew its famed gopurams under Nayak patronage in the 17th century, and Srirangam's Raja Gopuram (1987) rises 73 metres in 13 tiers. Thousands of stucco deities are repainted before each kumbhabhishekham consecration; kalasam finials cap every tier.",
    vd: {
      shape: "Truncated pyramid of stacked tiers narrowing to a barrel-vaulted shalai and kalasam finials",
      line: "Pilaster rows per tier, cornice bead lines, niche frames crowding every band",
      composition: "Deity sculpture grids aligned along the processional axis from street to sanctum",
      texture: "Chiselled granite base tiers, painted stucco flesh-tones, gold-leaf finial flash, dust film",
    },
    typ: {
      display: "Tamil donor and deity inscriptions on granite plinths",
      body: "Tamil palm-leaf texts and temple hymns (Tevaram) in script lines",
      notes: "Festival banners naming kumbhabhishekham years; prasadam stall boards",
    },
    lit: {
      quality: "Dawn rays striking east-facing towers; festival oil lamps and firecracker flash",
      temperature: "warm-toned",
      shadow: "Tier-on-tier recessed shade; sculpture hollows holding noon darkness",
    },
    ui: {
      background: "Temple-stone grey warmed by stucco coral",
      surface: "Carved-band texture cards with gilded finial accents",
      components: "Tier-stack progress towers, deity-grid galleries, gate-axis flows",
      motion: "Tier-build ascension on load; lamp-flame pulsing on active states",
    },
  },
  {
    slug: "shanxi-courtyard-compounds",
    ctx: "Fortified mansion clusters of Ming-Qing Shanxi merchant dynasties whose piaohao draft banks - Rishengchang of Pingyao (1823), the first in China - moved China's silver: the Qiao Family Compound at Qixian (from 1756), the Wang Family Compound at Lingshi, and the Chang and Cao estates. Grey-brick courtyards, watchtowers, screen walls and the famous three carvings of wood, brick and stone house the jinshang legend.",
    vd: {
      shape: "Nested rectilinear courtyards within walled perimeters crowned by watchtowers",
      line: "Grey-brick quoins, ridged tile rooflines, lattice window frets, carved tie-beam lines",
      composition: "Axis-driven sequence of gate, screen wall (yingbi), halls and side yards; hierarchy by family rank",
      texture: "Blued-grey brick, black tile, warm timber lattice, stone drum bases, red lantern paper",
    },
    typ: {
      display: "Wood-carved calligraphic plaques naming halls with virtue mottoes",
      body: "Account books of piaohao clerks; stele rubbing copybooks",
      notes: "Couplet strips flanking doors; bank-draft seal-script stamps",
    },
    lit: {
      quality: "North China plain light through lattice; red lantern and stove glow at dusk",
      temperature: "warm-toned",
      shadow: "Eave shadows laddering courtyard walls; lattice-cast dapple in inner rooms",
    },
    ui: {
      background: "Grey-brick neutral with cinnabar red accent",
      surface: "Lattice-frame cards with carved-plaque headers",
      components: "Courtyard-nested panels, seal-stamp buttons, couplet sidebars",
      motion: "Screen-wall slide reveals; lantern-light glow pulses on notices",
    },
  },
  {
    slug: "kalyan-minaret-style",
    ctx: "The prototype Central Asian minaret: the Kalyan ('Great') Minaret of Bukhara, raised in 1127 under the Qarakhanid ruler Arslan Khan - about 46 metres of tapering baked brick on a 9-metre base, dressed in bands of geometric brickwork under a muqarnas cornice and arched lantern. It survived Genghis Khan's 1220 sack and became the model for Vabkent (1197), Gijduvan and Karshi; the Po-i-Kalyan complex grew around it.",
    vd: {
      shape: "Great tapering brick cylinder on a massive base; lantern drum of arched openings above the shaft",
      line: "Basket-weave, herringbone and rosette brick bonds stacked as horizontal ornament bands",
      composition: "A single vertical ornament column dominating the skyline, paired with the mosque portal in ensemble",
      texture: "Baked brick in buff-orange with darker pattern courses; lime joints weathered to honey",
    },
    typ: {
      display: "Brick-laid Kufic foundation band naming Arslan Khan and master Bako",
      body: "Court annals and endowment (waqf) documents in Arabic-script Persian",
      notes: "UNESCO citation plaques; modern gilded signage of Po-i-Kalyan square",
    },
    lit: {
      quality: "Desert light rounding the shaft; dawn and dusk gilding each ornament band",
      temperature: "warm-toned",
      shadow: "Curving self-shadow down the cylinder; lantern-arch shadowplay at the top",
    },
    ui: {
      background: "Buff brick sand tones with silk-road blue",
      surface: "Bonded-brick texture cards with banding rules",
      components: "Tower-progress columns, band-rule dividers, arched-lantern toggles",
      motion: "Band-by-band vertical build-up; slow pivot rotation on detail views",
    },
  },
  {
    slug: "kerala-timber-roof-temples",
    ctx: "Kerala's temple idiom, distinct from the gopuram south: circular or square sreekovil sanctums capped by steep copper- or tile-roofed cones and pyramids, as at Vadakkunnathan (Thrissur), Guruvayur and the two-storeyed Tali temple of Kozhikode (14th c., under the Zamorin). Laterite walls, teak framing, koothambalam theatres and mural cycles suit the monsoon; Namboothiri grama settlements set the temple at the village heart.",
    vd: {
      shape: "Circular sreekovil cones and square pyramidal roofs; two-storey mandapas; low temple walls (nalambalam)",
      line: "Timber ridge and hip runs; eave brackets carved with foliage; roof ribs radiating over round walls",
      composition: "Sanctum circle within a rectangular nalambalam cloister; flagstaff (kodimaram) and koothambalam balancing axes",
      texture: "Copper-sheet roofing gone green-brown, laterite block, oiled teak, mural pigments on lime",
    },
    typ: {
      display: "Kerala-script (Vatteluttu-derived) inscriptions on stone and copper plates",
      body: "Manipravalam manuscripts; tantric manuals of temple ritual",
      notes: "Copper-plate grants (cheppeds) recording royal endowments",
    },
    lit: {
      quality: "Monsoon gloom pierced by oil lamps; copper roofs flaring at sunrise",
      temperature: "warm-toned",
      shadow: "Conical roof shadow pooling over cloister walks; murals glowing in half-light",
    },
    ui: {
      background: "Copper-green over laterite red-brown",
      surface: "Weathered metal-sheen cards with teak frames",
      components: "Conical-tier icons, cloister-ring nav, lamp-stand headers",
      motion: "Rain-streak vertical wipes; lamp-flame hover glow",
    },
  },
  {
    slug: "turf-roofed-farmhouse",
    ctx: "North Atlantic sod and turf roofing, vital where timber and slate were scarce: on the Faroes, the Roykstovan hall of Kirkjubogardur (Kirkjuboar, Streymoy) has stood since the 11th century - often called Europe's oldest inhabited wooden house - its roof of birch bark under living turf. Norwegian farmsteads kept the craft with grass-grown roofs over log walls; sheep graze Faroese roofs to keep the sod tight.",
    vd: {
      shape: "Low log or stone-walled halls swallowed to the eaves by thick green roof pillows",
      line: "Turf-cut block coursing on walls; roof profile a rounded living mound over the timber frame",
      composition: "Farmstead clustering around yard and byre; roofs merging with pasture and fell",
      texture: "Fibrous turf blocks, moss and flower tussocks, driftwood-grey timber, black-tarred cladding",
    },
    typ: {
      display: "Rune inscriptions on the Magnus Cathedral stones at Kirkjubour",
      body: "Faroese ballad manuscripts (Kvaedi) and parish registers",
      notes: "Heritage-farm signage; Faroese national-museum and open-air-museum captions",
    },
    lit: {
      quality: "Low silver daylight through fog; turf roofs steaming in rain, glowing green in sun",
      temperature: "cool-toned",
      shadow: "Soft moss-shadow on walls; hearth glow through smoke-hole and tiny panes",
    },
    ui: {
      background: "Peat brown with meadow-green roof band",
      surface: "Felted-turf texture cards in tarred timber frames",
      components: "Turf-cap headers, driftwood dividers, flock-dotted map chips",
      motion: "Grass-in-the-wind micro sway; raindrop ripple on card edges",
    },
  },
  {
    slug: "lombard-romanesque",
    ctx: "First Romanesque of the Po valley, carried by Comacine master masons: Modena Cathedral begun in 1099 to Lanfranco's design with Wiligelmo's sculpture, Milan's Sant'Ambrogio with its atrium and early rib vaults, San Michele at Pavia, San Zeno at Verona. Pilaster strips and hanging arcades - the Lombard band - travelled as far as Speyer and Catalonia; communes built them as civic-sacred statements in brick and stone.",
    vd: {
      shape: "Aisled basilicas with tall detached campanili; triple-apse east ends, gabled facades with open galleries",
      line: "Vertical lesene strips tied by hanging archetti pensili; round-arched portals with carved lintels",
      composition: "Facade galleries and rose grids; arcaded atrium forecourts; blind-arcade banding on apses",
      texture: "Terracotta brick and river-stone coursing, sandstone dressings, verdigris bronze doors",
    },
    typ: {
      display: "Roman-capital dedications (Wiligelmo's Modena verses) on lintels",
      body: "Chancery charters and notarial books in medieval Latin minuscule",
      notes: "Mason marks across piers; foundation inscription plaques; pilgrim-badge lettering",
    },
    lit: {
      quality: "Po-valley haze diffusing strong sun; atrium shade against blazing portal light",
      temperature: "warm-toned",
      shadow: "Archetti throwing repeated shadow scallops; crypt gloom under raised choirs",
    },
    ui: {
      background: "Terracotta and travertine warm neutrals",
      surface: "Arcaded-band texture cards with bronze accents",
      components: "Gallery-tier headers, campanile progress rails, portal-arch modals",
      motion: "Scallop-shadow cadence on scroll; bronze-door swing transitions",
    },
  },
  {
    slug: "byzantine-revival",
    ctx: "Nineteenth-century neo-Byzantium as national and imperial statement: John Francis Bentley's Westminster Cathedral, London (1895-1903), in banded red brick; Paul Abadie's Sacre-Coeur, Paris (1875-1914); Alexander Pomerantsev's Alexander Nevsky Cathedral, Sofia (1882-1912); the Church of the Savior on Spilled Blood, St. Petersburg (1883-1907). Pendentive domes, gold mosaic and polychromy recalled Justinian's church craft.",
    vd: {
      shape: "Centralized plans crowned by multiple domes on pendentives; low campaniles and apse clusters",
      line: "Round-arched orders, banded brick-and-stone coursing, roundels and inscription friezes",
      composition: "Hierarchical icon programs with Christ Pantocrator in the dome over a nave grid",
      texture: "Gold-ground mosaics, glazed brick bands, polished marble columns, bronze doors",
    },
    typ: {
      display: "Greek and Cyrillic tituli in uncial-derived capitals ringing domes",
      body: "Liturgy books in Church Slavonic and Greek; choir score printing",
      notes: "Donor mosaic inscriptions; consecration-medal lettering",
    },
    lit: {
      quality: "Mosaic gold multiplying candlelight; high drum windows dropping cool shafts",
      temperature: "warm-toned",
      shadow: "Half-dome shade framing the Pantocrator; incense-thickened light beams",
    },
    ui: {
      background: "Mosaic gold ochre with Byzantine violet",
      surface: "Tessera-glitter cards with banded-brick borders",
      components: "Roundel medallions, pendentive corner frames, choir-line dividers",
      motion: "Tessera-shimmer sweeps; censer-swing slow parallax",
    },
  },
  {
    slug: "napier-nz-deco",
    ctx: "After the 3 February 1931 Hawke's Bay earthquake (magnitude 7.8, 256 dead) levelled Napier, the town rebuilt itself within two years in Art Deco, Spanish Mission and Stripped Classical dress: Louis Hay, who had worked in Louis Sullivan's Chicago office, J.T. Watson's Municipal Theatre (1938) and E.A. Williams' Daily Telegraph Building (1933) still define the centre; the Art Deco Trust (from 1985) made Napier the self-styled Art Deco Capital.",
    vd: {
      shape: "Ziggurat-stepped shopfronts and low towers; corner parapets and glass-brick stairwells",
      line: "Zigzag marquee lines, speed-striped spandrels, fountain and sunburst motifs, fluted pilasters",
      composition: "Uniform street-wall rhythm on a replanned grid; the Marine Parade promenade as showcase frontage",
      texture: "Rendered concrete in pastel creams and greens, polished terrazzo, chrome and neon accents",
    },
    typ: {
      display: "Streamlined inline-shadow sans facias and theatre marquee alphabets",
      body: "1930s newspaper columns of the rebuilt press buildings; railway timetable posters",
      notes: "Art Deco Trust event signage; vintage car-rally placards each February",
    },
    lit: {
      quality: "Clear southern-hemisphere light off the bay; neon and chrome glow after dark",
      temperature: "warm-toned",
      shadow: "Crisp geometric parapet shadows stepping down facades; palm shade on the promenade",
    },
    ui: {
      background: "Pastel deco cream with fountain teal",
      surface: "Terrazzo-speckle cards with chrome-line borders",
      components: "Ziggurat step-ups, sunburst loaders, marquee banner headers",
      motion: "Sunburst fan-out reveals; gentle fountain-loop idle animation",
    },
  },
]
