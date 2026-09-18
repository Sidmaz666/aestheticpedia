/**
 * Patch 14-a — full-depth backfill for 35 existing entries (manifest-14a.json, Art Movements slice).
 * Task 14-a. Contract: { slug, ctx, vd{shape,line,composition,texture},
 * typ{display,body,notes}, lit{quality,temperature,shadow}, ui{background,surface,components,motion} }.
 * ctx is interpretive cultural context (150-500 chars); vd/typ/lit/ui are era-specific
 * visual/typographic/lighting/UI translations. Slugs and order follow the manifest exactly.
 */
export const PATCHES: any[] = [
  {
    slug: "neue-sachlichkeit",
    ctx: "Named by Gustav Friedrich Hartlaub for his 1925 Kunsthalle Mannheim exhibition, Neue Sachlichkeit gathered Weimar painters — Otto Dix, George Grosz, Christian Schad — who replaced Expressionist vision with cold, forensic realism. The Verists dissected war cripples, profiteers and bourgeois salons; a quieter wing (Georg Schrimpf, Alexander Kanoldt) offered still, polished scenes. Republican museums and liberal journals championed it until the 1937 'degenerate art' purge ended it.",
    vd: {
      shape: "angular portraits, knife-edge suits, skull faces, hard-edged objects with photographic precision",
      line: "razor-sharp contours and etching-like cross-hatching that never blurs into atmosphere",
      composition: "stage-flat tableaux, frontal sitters, compressed rooms arranged like police lineups",
      texture: "smooth oil enamel surfaces, meticulous eggshell finish with zero visible gesture",
    },
    typ: {
      display: "stenciled grotesks and stark sans caps for exhibition cards; Grosz's own satirical lettering",
      body: "clean grotesk text faces of 1920s Berlin magazine presses, terse reportage columns",
      notes: "typography pairs with police-report titles, dates and case numbers; captions outshout decoration",
    },
    lit: {
      quality: "hard clinical daylight or cold electric light, flat and unforgiving",
      temperature: "cool",
      shadow: "precise geometric shadows, or none — figures sit in dead-even illumination",
    },
    ui: {
      background: "raw plaster off-white or municipal gray-green",
      surface: "matte enamel panels, brushed steel, glass",
      components: "index-card data tables, dossier lists, letterpress-ruled panels, monochrome toggles",
      motion: "abrupt mechanical cuts — hard snaps and instant swaps, no easing flourish",
    },
  },
  {
    slug: "cobra",
    ctx: "Founded in Paris in November 1948 by Christian Dotremont, Asger Jorn, Karel Appel, Constant and Corneille — the acronym spells Copenhagen, Brussels, Amsterdam. Rejecting Surrealist doctrine and geometric abstraction alike, the group (joined by Pierre Alechinsky) painted thick childlike beasts and flicker-figures from Danish folk art and children's drawings; Appel's 1949 Stedelijk Museum mural scandalized Amsterdam. Exhausted by infighting and Dotremont's illness, it dissolved in 1951.",
    vd: {
      shape: "swollen childlike beasts, mask-faces, scribbled birds with oversized fangs",
      line: "thick impasto contour gouged wet-into-wet, paint squeezed straight from the tube",
      composition: "allover jumble of edge-to-edge creatures, no horizon, figures cropped mid-snarl",
      texture: "encrusted oil slabs, palette-knife ridges, sand and tar dragged through pigment",
    },
    typ: {
      display: "rune-like hand-cut capitals; Jorn's vigorous brush lettering on Cobra journals",
      body: "plain newsprint serif for the 1948–51 Cobra magazine, mimeograph-drab and immediate",
      notes: "titles read like folk spells — dashes, joined initials and lowercase urgency",
    },
    lit: {
      quality: "raw daylight studio glare, or the gallery spot that flattens impasto into black ridges",
      temperature: "warm",
      shadow: "none — saturated reds and ochres press forward as their own darkness",
    },
    ui: {
      background: "chalky off-white roughcast wall",
      surface: "coarse canvas weave, newsprint, unpainted plywood",
      components: "hand-inked nav beasts, scribble icons, stamp-rough buttons, torn-paper frames",
      motion: "wobbly hand-drawn easing; strokes overshoot, then settle",
    },
  },
  {
    slug: "neo-dada",
    ctx: "New York, 1956–59: Robert Rauschenberg's Combines and Jasper Johns's flags and targets, shown at Leo Castelli's new gallery, answered Abstract Expressionist heroics with bedding, comic strips and encaustic facture. John Cage's New School classes supplied the theory, Duchamp's example the license. Critics reached for 'Neo-Dada' by 1958–59, distinguishing these witty object-laden works from Pierre Restany's Nouveau Réalisme then forming in Paris.",
    vd: {
      shape: "bed quilts, ladders, flags, targets and goat heads — found things keeping their own outline",
      line: "loose gestural sweeps colliding with stenciled letters and hard commercial edges",
      composition: "collaged allover fields where paint, silk-screen and junk share one shallow plane",
      texture: "encaustic wax, pillow fabric, spattered enamel, comic halftone and photo-transfer grain",
    },
    typ: {
      display: "stencil capitals and solvent-transfer lettering lifted from packaging and headlines",
      body: "typewriter monospace notes taped beside works, Cage-style lecture prose",
      notes: "words behave as objects — Johns's stenciled 'Flash', Rauschenberg's scrawled captions",
    },
    lit: {
      quality: "flat gallery wash, deliberate anti-drama — light that treats junk as fact",
      temperature: "neutral",
      shadow: "real-object shadows: a quilt's edge or a wheel actually casting, refusing illusion",
    },
    ui: {
      background: "newsprint gray, manila-envelope tan",
      surface: "collage laminate, torn poster stock, matte enamel chipboard",
      components: "taped-label buttons, postage-stamp chips, torn-edge panels, mixed-media toolbars",
      motion: "deadpan drift interrupted by sudden paste-down snaps",
    },
  },
  {
    slug: "post-internet-art",
    ctx: "Coined around 2006–08 by artist Marisa Olson and elaborated in Gene McHugh's 'Post Internet' blog (2009–10), the term names work by Oliver Laric, Artie Vierkant, Petra Cortright and peers for whom the web is ambient infrastructure, not a place. Objects — Vierkant's Image Objects, Laric's 'Versions' — cycle between file, 3D print and gallery; Rhizome and the New Museum, Tumblr and kunsthalle Instagram formed its circuit before the 2014 market embrace.",
    vd: {
      shape: "screen-cropped rectangles, polygon meshes, mirrored object stacks, chrome blobs",
      line: "vector-perfect edges set against JPEG mush and datamosh smears",
      composition: "flat render-space grids, drop-shadowed layers, screenshot collage with visible seams",
      texture: "matte pigment print, iridescent vinyl, powder-coated aluminum, low-res pixel sheen",
    },
    typ: {
      display: "default system sans — Arial/Helvetica stacks and browser UI chrome left visible",
      body: "monospace terminal text and Tumblr captions; no editorial serif anywhere",
      notes: "metadata, URLs and file extensions act as design elements, often the only copy",
    },
    lit: {
      quality: "even box-store illumination plus screen backlight glow, as if lit by the display itself",
      temperature: "cool",
      shadow: "synthetic drop shadows baked into images; physically almost shadowless",
    },
    ui: {
      background: "flat app-gray #EAEAEA or gradient mesh",
      surface: "glossy glass cards, iridescent gradient fills",
      components: "status bars, progress spinners, like-counts, carousels showing file names",
      motion: "buffering stutters, lazy-load fades, cursor-driven parallax",
    },
  },
  {
    slug: "shin-hanga",
    ctx: "Publisher Watanabe Shōzaburō launched shin-hanga around 1915 from his Tokyo print shop, reviving the ukiyo-e workshop system — artist, carver, printer, publisher — for a new era. Hashiguchi Goyō's beauties, Kawase Hasui's night landscapes and Itō Shinsui's portraits married Western single-point perspective to Edo woodblock craft. Sales went chiefly to Western collectors, especially after the 1923 earthquake; Hasui's prewar scenes earned him Living National Treasure status in 1956.",
    vd: {
      shape: "flat-patterned rain, umbrella arcs, bijin kimono silhouettes, crescent moon over indigo sky",
      line: "keyblock contours in sumi ink over soft color gradations (bokashi)",
      composition: "Western perspective and low horizon inside a cropped ukiyo-e frame",
      texture: "visible woodgrain impressions, mica dust, light embossing at the paper's edge",
    },
    typ: {
      display: "block-carved kanji signatures and publisher's round hanko seals",
      body: "vertical tategaki captions in minchō-style carved type on illustrated covers",
      notes: "artist seals replace signatures; red title cartouches frame designs like theater posters",
    },
    lit: {
      quality: "moonlight, lamplight and wet-street reflections rendered as flat luminous shapes",
      temperature: "warm",
      shadow: "soft bokashi pools of indigo and charcoal rather than cast geometry",
    },
    ui: {
      background: "washi cream with indigo night gradients",
      surface: "uncoated paper stock, subtle emboss, mica fleck",
      components: "seal-ink buttons, woodgrain dividers, vertical label columns, cartouche headers",
      motion: "slow cross-fades like ink absorbing into damp paper",
    },
  },
  {
    slug: "lingnan-school",
    ctx: "The 'Two Gaos and One Chen' — Gao Jianfu, Gao Qifeng and Chen Shuren — trained in Tokyo around Takeuchi Seiho's Nihonga studios and returned to Guangdong after the 1911 revolution proposing 'new national painting.' Gao Jianfu, a Tongmenghui member, painted revolution-tinged eagles and tigers; his Chunshui (Spring Sleep) Painting Academy in Guangzhou spread the method, and émigré masters later carried the style to Hong Kong, where the Lingnan name stuck.",
    vd: {
      shape: "plum blossoms, eagles, tigers, mist-folded peaks, birds wet-on-wet with soft edges",
      line: "boneless (mogu) washes punctuated by decisive calligraphic branch strokes",
      composition: "unpainted air and mist for depth; asymmetry anchored by one weighted element",
      texture: "powder-color speckle, water-spray bloom on xuan paper, fibrous wash edges",
    },
    typ: {
      display: "brush-written kaishu or xingshu titles with red square seals, seldom display fonts",
      body: "vertical column inscriptions in running script with date and dedication",
      notes: "colophon poetry balances the picture; seals register artist, school and collector",
    },
    lit: {
      quality: "diffused humid daylight — the misty Pearl River Delta light itself",
      temperature: "warm",
      shadow: "almost none; depth is built from graded ink, not cast shade",
    },
    ui: {
      background: "unbleached rice-paper ivory with pale wash gradients",
      surface: "sized xuan-paper softness, silk mount sheen",
      components: "scroll-style vertical cards, seal-red accents, brush-stroke dividers, misty hero panels",
      motion: "slow unroll-and-settle, washes blooming into place",
    },
  },
  {
    slug: "tanjore-painting",
    ctx: "At the Maratha court of Thanjavur under Serfoji II in the early 19th century, and before that under the Nayakas, temple painters evolved the palagai padam — a wood-plank icon of gesso relief, gold leaf and glass gems. Bala Krishna, Venkateshwara and local saints dominate, framed by arches of gilded appliqué. After the court declined, production continued as devotional commerce for temples and home puja; Mysore kept a sibling variant, and artisans still make it across Tamil Nadu.",
    vd: {
      shape: "symmetrical arched icon panels, frontal deity busts, candleflame halos of gesso",
      line: "fine incised outlines within the relief, beaded gesso borders around figures",
      composition: "rigid central hierarchy — deity huge and centered, attendants and shrine nested below",
      texture: "limestone-paste gesso bumps, burnished 22k gold leaf, embedded glass cabochons",
    },
    typ: {
      display: "Tamil or Telugu medallions naming the deity, sometimes Sanskrit invocations",
      body: "modern revival pieces carry brief Tamil captions below the frame line",
      notes: "lettering stays devotional and minimal — the icon, not text, is the headline",
    },
    lit: {
      quality: "lamp-lit glow; light meant for aarti flame, gold catching and returning it",
      temperature: "warm",
      shadow: "minimal modeled shade; the gesso relief itself supplies darkness at its edges",
    },
    ui: {
      background: "deep vermilion or shrine-maroon with gold framing",
      surface: "varnished teak panel, gilded relief, glass glints",
      components: "arched cards, bead-border buttons, framed icon slots, marigold-edge dividers",
      motion: "steady devotional hold, gentle gilt shimmer, lamp-flame flicker accents",
    },
  },
  {
    slug: "mughal-painting",
    ctx: "Humayun brought the Safavid masters Mir Sayyid Ali and Abd al-Samad to his Kabul exile in 1549; Akbar's imperial tasvir khana then produced the roughly 1,400-folio Hamzanama (c. 1562–77). Jahangir's studio under Abu'l Hasan and Ustad Mansur pushed exacting naturalism — Mansur's dodo and cranes — while Jesuit-gifted European prints seeded shading and depth. Muraqqa album culture made painting the dynasty's most personal art, page and margin inscribed together.",
    vd: {
      shape: "flat stacked rocks, sinuous cypress and chinar trees, courtly domes and garden terraces",
      line: "hairline ink contours, double-ruled frames, minutely hatched foliage",
      composition: "elevated tilted planes, figures in rows, tiny battlements stacked like stage flats",
      texture: "burnished wasli paper, gold dust, vellum-smooth mineral pigment layers",
    },
    typ: {
      display: "nastaʿlīq calligraphic cartouches, gold-ruled, with names inscribed above each figure",
      body: "marginal nastaʿlīq notes, seal stamps and album attribution lines",
      notes: "Jahangir-era pages pair image with poetic colophons and imperial seal impressions",
    },
    lit: {
      quality: "even, shadowless courtly daylight — luminance without weather",
      temperature: "warm",
      shadow: "flat tinted shading; muted olive cast shadows hinted but never modeled",
    },
    ui: {
      background: "aged wasli ivory, apricot and deep lapis folio edges",
      surface: "burnished paper, gold-ruled borders, mica glints",
      components: "cartouche headers, double-rule frames, seal badges, folio-carousel navigation",
      motion: "page-turn flips, slow zoom into painted detail",
    },
  },
  {
    slug: "naive-painting",
    ctx: "Henri Rousseau, a Paris toll-collector, showed at the Salon des Indépendants from 1886 without academy training; Picasso's 1908 banquet at the Bateau-Lavoir crowned him patron saint of the self-taught. Séraphine Louis, Camille Bombois and André Bauchant followed a similar path — gardeners, boxers, housekeepers painting jungle dreams and village festivals in literal perspective. Wilhelm Uhde's 1928 'Peintres du cœur sacré' show canonized them, and Dubuffet's art brut drew the logical line onward.",
    vd: {
      shape: "flat jungle leaves stacked like paper cutouts, stiff posed figures, wide almond eyes",
      line: "single-weight outlines, no foreshortening, every blade of grass drawn upright",
      composition: "stacked perspective, high horizon, scale decided by importance rather than distance",
      texture: "smooth enamel-like oil, tight even brushwork, dense botanical repetition",
    },
    typ: {
      display: "hand-lettered poster caps or plain vernacular shop-sign lettering",
      body: "simple storybook serif or straightforward sans, deliberately unpolished",
      notes: "captions tell the scene plainly, like folk tales; names and dates proudly stated",
    },
    lit: {
      quality: "flat noon daylight with no direction, everything equally visible",
      temperature: "warm",
      shadow: "rare and symbolic — a tree's dark shape, never modeled volume",
    },
    ui: {
      background: "garden green or storybook sky, unmodulated",
      surface: "smooth card stock, leaf-and-flower pattern, painted wood",
      components: "hand-drawn buttons, badge-style icons, fable-panel cards, wavy borders",
      motion: "gentle bobbing drift, pop-up storybook reveals",
    },
  },
  {
    slug: "polish-poster-school",
    ctx: "After Stalin's death, Poland's state film distributors and publishers commissioned posters as cultural advertising, and studios in Warsaw and Kraków — Henryk Tomaszewski's and Tadeusz Trepkowski's students above all — turned them into metaphor-laden art. Jan Lenica, Waldemar Świerzy, Franciszek Starowieyski and Andrzej Pągowski won Warsaw Biennale and 'Złote Grono' honors; state print runs hung in kiosks nationwide, making the poster Poland's democratic gallery into the 1980s.",
    vd: {
      shape: "torn-paper slashes and single iconic props — an eye, a glove, a flower — standing for plots",
      line: "confident brush and crayon strokes, screenprint crackle, scratchy inked hatching",
      composition: "one dominant metaphor centered on raw board space; credits reduced to whispers",
      texture: "screenprint dot grain, roller texture, visible poster-paper tooth",
    },
    typ: {
      display: "idiosyncratic hand lettering — each artist draws type fresh, Tomaszewski's wobbly caps",
      body: "small condensed credit lines in Polish, set barely legibly at the poster's foot",
      notes: "titles behave as image: letters drip, split, or hide inside the picture",
    },
    lit: {
      quality: "flat print-shop light; color specified in ink rather than illumination",
      temperature: "warm",
      shadow: "graphic only — painted shadow shapes with no cast-light logic",
    },
    ui: {
      background: "unbleached poster-board buff or moody ink wash",
      surface: "screenprint grain, creased paper folds, glossy varnish blocks",
      components: "poster-frame cards, hand-drawn icon buttons, ticket-stub tags, film-reel motifs",
      motion: "poster-flip transitions, ink spreading, cutout collage slides",
    },
  },
  {
    slug: "constructivist-sculpture",
    ctx: "From Vladimir Tatlin's corner counter-reliefs (shown in Petrograd, 1915) through the OBMOKhU exhibitions of 1919–22, sculptors Naum Gabo, Antoine Pevsner, Karl Ioganson and Konstantin Medunetsky built open structures from iron, glass and wire, publishing the Realist Manifesto in Moscow in 1920. Monuments of heroes gave way to towers and springs that claimed 'art into life'; Tatlin's Monument to the Third International projected the idea to architectural scale.",
    vd: {
      shape: "open rod-lattice volumes, taut floating planes, spiral towers, slung wire arcs",
      line: "tense real wire and steel — the drawn line made physical in space",
      composition: "transparency through space, no plinth mass, crisscross vectors balanced in air",
      texture: "matte iron, glass glint, waxed wood, machine-turned brass",
    },
    typ: {
      display: "bold constructivist sans and stencil caps — El Lissitzky-era geometric letterforms",
      body: "set grotesk manifestos in two languages, justified columns with red accents",
      notes: "diagrams and captions pose as engineering documents; numbers become ornament",
    },
    lit: {
      quality: "raking north-light studio glow to sharpen every wire's edge",
      temperature: "cool",
      shadow: "linear wire shadows cast as a second sculpture on the wall",
    },
    ui: {
      background: "graphite blackboard dark or blueprint blue",
      surface: "brushed steel, glass panels, matte enamel",
      components: "wire-frame icons, vector nodes, dieline panels, technical readouts",
      motion: "rotation on a fixed axis, pendulum arcs, precise mechanical easing",
    },
  },
  {
    slug: "kinetic-sculpture",
    ctx: "Naum Gabo's motorized Standing Wave (1920) and Duchamp's Rotary Glass Plates began it, but the movement crystallized at Galerie Denise René's 1955 Paris exhibition 'Le Mouvement' with Calder, Vasarely and Tinguely. Calder's mobiles — named by Duchamp in 1931 — hung from museum staircases; Tinguely's self-destructing Homage to New York (1960) burned itself before guests at MoMA; by the 1960s kinetic art spanned motor, magnet and wind power across Europe and Latin America.",
    vd: {
      shape: "balanced blade-wings, pendulum arcs, spinning vanes, wire-rope suspensions",
      line: "swept curves of motion blur, machine-turned circles, arc trajectories drawn in air",
      composition: "asymmetric equilibrium — weights and counterweights dictating the picture",
      texture: "painted sheet metal, polished chrome, motor-hum vibration, oxidized copper",
    },
    typ: {
      display: "mid-century grotesk specimen caps (the Univers/Helvetica era) on exhibition didactics",
      body: "clean sans panel text with technical specs — RPM, motor type, materials",
      notes: "labels read like machine nameplates; 'do not touch' instructions become part of the work",
    },
    lit: {
      quality: "gallery spots timed to catch moving vanes, strobe-adjacent shimmer",
      temperature: "neutral",
      shadow: "moving cast shadows — the rotation itself projected across walls and floor",
    },
    ui: {
      background: "gallery white or industrial gray",
      surface: "powder-coated metal, anodized aluminum, glass",
      components: "dial controls, RPM sliders, spinning loader rings, orbit-dot navigation",
      motion: "real loops — smooth rotations, pendulum swing, wind-driven jitter",
    },
  },
  {
    slug: "barbizon-school",
    ctx: "From the 1840s painters left Paris for the forest of Fontainebleau, lodging at the village of Barbizon and sketching the woods directly. Théodore Rousseau settled there by 1848, Jean-François Millet in 1849; with Diaz de la Peña, Troyon, Dupré and Daubigny they worked around the Auberge Ganne, aided by dealer-patrons like Alfred Sensier after Salon rejections. Their petitions helped win the forest artistic-reserve status in 1861, and the Impressionists learned from their example.",
    vd: {
      shape: "massed oaks, heavy cattle, bent gleaners, cloud-laden horizons low in the frame",
      line: "broad loaded-brush strokes, soft contours dissolving tree into sky",
      composition: "small figures swallowed by woods or field; a cattle path leading the eye home",
      texture: "wet daubs, palette-knife foliage, impasto bark against glazed evening sky",
    },
    typ: {
      display: "19th-century French salon serifs — engraved Didot-style caps for exhibition labels",
      body: "bookish old-style serif, letterpress catalogs, Sensier's memoir typography",
      notes: "titles read plainly ('The Gleaners'), like rural verse; no display drama",
    },
    lit: {
      quality: "low sun through the oak canopy, mist rising off wet pasture",
      temperature: "warm",
      shadow: "cool olive shadow pooling at tree bases, golden raking edges",
    },
    ui: {
      background: "dun field-tan fading into sage mist",
      surface: "weathered oak plank, coarse canvas, moss texture",
      components: "framed landscape cards, foliage-corner buttons, farmhouse-table icons, muted sliders",
      motion: "slow drifts like cloud shadow crossing a meadow",
    },
  },
  {
    slug: "tachisme",
    ctx: "Occupation-era scarcity had made oil precious: Fautrier painted his Otages series in a Châtenay studio under Nazi watch, and Wols soaked Paris canvases in alcohol-spread stains. Critics named the stain 'tachisme' around 1951–54, and Michel Tapié's 1952 manifesto Un Art Autre canonized Mathieu, Hartung, Soulages and Poliakoff as l'art informel. The galleries of Colette Allendy and Nina Dausset, and Mathieu's theatrical auctions, pitted Paris against New York Action Painting.",
    vd: {
      shape: "stains, blots and calligraphic slashes without boundary — the shape of a gesture",
      line: "speeding brush whips, incised scratches through wet paint, splatter tracks",
      composition: "allover field with one dense zone of action; edges left raw and breathing",
      texture: "matte gouache bloom, glossy enamel pools, sand-mixed pigment, cracked impasto",
    },
    typ: {
      display: "literary French serif mastheads for Un Art Autre-era catalogs; Mathieu's forked-pen flourishes",
      body: "dense essayistic serif columns by Tapié and Estienne, philosophical in tone",
      notes: "titles use existential vocabulary — signs, battles, hours — set small beside large stains",
    },
    lit: {
      quality: "a single hot spot on raw canvas, studio gloom gathering at the edges",
      temperature: "warm",
      shadow: "soft ambient darkness; the stained pigment itself reads as shadowed depth",
    },
    ui: {
      background: "raw canvas oat or ink-black void",
      surface: "gesso tooth, splatter-laminated glass, matte gouache",
      components: "ink-blot buttons, stroke dividers, white-space panels, gesture-cursor trails",
      motion: "sudden splashes and fading trails, brush-drag easing",
    },
  },
  {
    slug: "nouveau-realisme",
    ctx: "In Yves Klein's Paris apartment in October 1960, critic Pierre Restany signed a constitutive declaration with Arman, François Dufrêne, Raymond Hains, Martial Raysse, Daniel Spoerri, Jean Tinguely, Jacques de la Villeglé and Klein; César, Niki de Saint Phalle and Mimmo Rotella joined. The May 1961 Galerie J exhibition showed torn street posters (Villeglé), accumulations (Arman) and snare-pictures (Spoerri) under Restany's slogan of a poetic recycling of the real — 'forty degrees above Dada'.",
    vd: {
      shape: "torn poster fragments, compressed car slabs, stacked identical objects, labeled trash",
      line: "factory and street edges kept intact — cut, not drawn",
      composition: "accumulation grids, trapped-tabletop still lifes, allover city debris",
      texture: "peeled paper paste, crushed chrome, plastic-wrap gloss, found-surface wear",
    },
    typ: {
      display: "the posters' own typography torn mid-word; Restany's manifesto broadsides",
      body: "crisp French sans for catalog essays; manifestos printed as newsprint",
      notes: "wordplay reigns — réalisme/réalité puns; object labels double as poems",
    },
    lit: {
      quality: "storefront window daylight with neon reflections on compressed metal",
      temperature: "neutral",
      shadow: "factual object shadows — debris casting real depth, no pictorial softening",
    },
    ui: {
      background: "flyposter wall gray, scrap-metal silver",
      surface: "torn paper laminate, chrome, plastic",
      components: "rip-strip buttons, label-clip tags, accumulation grids, sticker badges",
      motion: "tear-and-paste reveals, sticker slap-ins, quick scrappy flicks",
    },
  },
  {
    slug: "transavantgarde",
    ctx: "Critic Achille Bonito Oliva coined la Transavanguardia in 1979 and staged it in the Venice Biennale's 'Aperto 80' with Harald Szeemann, crowning Sandro Chia, Francesco Clemente, Enzo Cucchi, Mimmo Paladino and Nicola De Maria. The return to painting — mythic animals, sketchy saints, Chia's swaggering artist-heroes — traveled via Sperone Westwater in New York and Anthony d'Offay in London, making Italian figurative work the emblem of 1980s postmodernism.",
    vd: {
      shape: "lumpy mythic animals, mask faces, rough fresco saints, lopsided altars",
      line: "restless contour redrawn over itself — sure lines doubled by shaky second passes",
      composition: "empty-stage picture planes; a single emblem floating in atmospheric space",
      texture: "thin scumbled pigment over chalky pale ground, dry-pastel drag, fresco-like matte",
    },
    typ: {
      display: "handwritten Italianate script and sketchbook annotations on elegant postmodern serif mastheads",
      body: "1980s editorial serif, the typography of Milan and Rome art journals",
      notes: "titles are poetic and elliptical; artist names set like couture labels",
    },
    lit: {
      quality: "warm Mediterranean afternoon light, painted rather than cast",
      temperature: "warm",
      shadow: "terracotta-tinted shadows, soft and unhurried",
    },
    ui: {
      background: "plaster cream with terracotta washes",
      surface: "fresco-grain panels, handmade paper, aged travertine",
      components: "sketch-icon buttons, sigla monograms, framed vignette cards, brush-script labels",
      motion: "unhurried fades with a hand-drawn wobble",
    },
  },
  {
    slug: "glitch-art",
    ctx: "Nam June Paik magnetized the TV picture as early as Magnet TV (1965), and astronaut John Glenn's 1962 slang gave the phenomenon its name. Cory Arcangel hacked Super Mario cartridges for Super Mario Clouds (2002); Rosa Menkman theorized a 'vernacular of file formats' and co-founded Chicago's GLI.TC/H festival in 2010. Datamoshed video, corrupted JPEGs and bent-circuit works by JODI, Phillip Stearns and Sabato Visconti turned error into signature.",
    vd: {
      shape: "rectilinear scanlines, pixel-blocked smears, RGB-split silhouettes, displaced macroblocks",
      line: "horizontal tear lines, bit-crushed diagonals, columns of dead pixels",
      composition: "compressed grid chaos, frame edges bleeding, one corrupted focal zone",
      texture: "CRT phosphor fuzz, dithered JPEG noise, datamosh smear, metallic banding",
    },
    typ: {
      display: "monospace system fonts, terminal type, ASCII-art headers, corrupted glyphs",
      body: "terminal logs and hexadecimal dumps, subtitle-file monospace",
      notes: "error messages and filenames serve as poetry — typography embraces the wrong",
    },
    lit: {
      quality: "screen-emitted light, glow in a darkened room, no source beyond the display",
      temperature: "cool",
      shadow: "phosphor afterglow and ghost trails instead of physical shadow",
    },
    ui: {
      background: "CRT black with scanline texture",
      surface: "glass screen sheen, static-noise film",
      components: "error-dialog buttons, broken-image placeholders, chromatic-aberration toggles, stalled progress bars",
      motion: "stutters, frame skips, tearing wipes, sudden reset flickers",
    },
  },
  {
    slug: "yoga",
    ctx: "Yōga — Western-style oil painting — arrived with the Meiji opening: Charles Wirgman taught Takahashi Yuichi in Tokyo, and Kuroda Seiki, trained under Raphael Collin in Paris, returned in 1893 with plein-air naturalism. Given the first government chair in oil painting at the Tokyo Fine Arts School in 1896, Kuroda founded the Hakubakai society; the state Bunten exhibitions and private associations carried the idiom, which coexisted — sometimes contentiously — with Nihonga.",
    vd: {
      shape: "single-point interiors, academic three-quarter portraits, coastal plein-air horizons",
      line: "soft academic contours; brush-modeled edges replacing ukiyo-e flatness",
      composition: "single-source naturalism, seated portrait diagonals, receding room perspective",
      texture: "oily glazes, visible canvas weave, impasto highlights like the European salons",
    },
    typ: {
      display: "vertical Japanese gō signatures beside Western oil signatures; Meiji gothic-and-serif poster mixes",
      body: "Meiji textbooks mixing vertical kanji-minchō columns with horizontal Western type",
      notes: "a bilingual era: artist names appear in both kanji and romaji, mirroring the movement itself",
    },
    lit: {
      quality: "north-window studio light or plein-air afternoon, Western-modeled",
      temperature: "warm",
      shadow: "brown-shadow chiaroscuro with warm reflected lights in drapery",
    },
    ui: {
      background: "atelier warm-white, faded academy beige",
      surface: "oil-canvas texture, dark wood frames, brass easel fittings",
      components: "gilded frame cards, palette swatches, exhibit-label plates, canvas-rail buttons",
      motion: "easel-up reveals, brushstroke wipe-ins, slow framed zooms",
    },
  },
  {
    slug: "new-ink-art",
    ctx: "After 1949 painters on Taiwan and in Hong Kong first rethought shuimo: Liu Guosong's Fifth Moon group (1956) agitated ink with collage and texture rubs. In the reform-era mainland, Gu Wenda built pseudo-characters from human hair, Xu Bing carved four thousand invented glyphs for Book from the Sky (1987–91), and Wang Dongling abstracted calligraphy. MoMA's 2013 'Ink Art: Past as Present' framed the movement globally, with Beijing's Ink Studio as market anchor.",
    vd: {
      shape: "fields of invented glyphs, torn-paper collage, splash-ink mountains, one monumental character",
      line: "calligraphic strokes stretched to abstraction — dry feibai flicks against soaked black floods",
      composition: "the scroll format honored or exploded; vast emptiness against one dense gesture",
      texture: "xuan-paper absorbency, ink blooms, acrylic-and-ink resist, collage newsprint",
    },
    typ: {
      display: "monumental calligraphy treated as image — seal script and wild cursive as composition",
      body: "classical inscription columns quoted from poetry, sometimes inverted or faked",
      notes: "the reliability of text is the theme: Xu Bing's unreadable book, Gu Wenda's pseudo-seals",
    },
    lit: {
      quality: "soft studio daylight on paper; ink value does the work of light",
      temperature: "neutral",
      shadow: "no physical shadow; tonal ink gradations imply depth instead",
    },
    ui: {
      background: "xuan-paper ivory fading to ink-wash charcoal",
      surface: "absorbent paper texture, silk scroll sheen, seal-red lacquer",
      components: "brush-stroke buttons, seal badges, vertical text columns, scroll-reveal panels",
      motion: "ink-diffusion fades, stroke-drawn path animations",
    },
  },
  {
    slug: "madhubani-painting",
    ctx: "In Mithila, women painted aripan floor diagrams and kohbar bridal-chamber walls for weddings and festivals; after the 1934 Bihar earthquake, colonial officer William Archer documented the murals. The 1966–68 drought pushed the All India Handicrafts Board — via Bhaskar Kulkarni — to bring painting onto paper for sale, lifting Sita Devi, Ganga Devi and Mahasundari Devi to national honors. Bharni, kachni, tantrik, godna and kohbar lineages remain distinct village styles.",
    vd: {
      shape: "double-line figures with bulging fish-shaped eyes, dense floral borders, kohbar lotus diagrams",
      line: "parallel twin contours filled with hatching; no shading and no empty gaps — every space filled",
      composition: "flat stacked registers; central deities ringed by bands of birds, fish and bamboo",
      texture: "homemade paper grain, cow-dung ground, vegetal pigment blotch, bamboo-twig line",
    },
    typ: {
      display: "village lettering — simple Devanagari captions naming deities and artist",
      body: "bilingual Hindi/English labels since the craft-market years; Maithili text stays oral",
      notes: "signatures are new — once anonymous women's work, names are now painted with pride",
    },
    lit: {
      quality: "courtyard daylight, even and bright, celebrating color over depth",
      temperature: "warm",
      shadow: "none — two-dimensional truth; outlines carry all form",
    },
    ui: {
      background: "mustard turmeric and sindoor red fields",
      surface: "handmade paper, mud-plaster wall texture, banana-leaf green",
      components: "border-band frames, fish-and-parrot icons, festival cards, vine-ribbon dividers",
      motion: "band-by-band reveals like unrolling a wedding scroll",
    },
  },
  {
    slug: "pattachitra",
    ctx: "Odisha's chitrakar painters serve the Jagannath temple at Puri: during the Anasara fortnight, when the deities are ritually hidden, painted patis stand in for them. In Raghurajpur — declared a heritage village in 2000 — families prepare a tamarind-seed gum and chalk ground on cloth, paint Dashavatara and Kanchi Avijana narratives in conch-shell white and hingula red, and seal the work in lacquer. Temple ritual and story-song keep the art in daily circulation.",
    vd: {
      shape: "rigid frontal deities with lotus-petal eyes, elaborate temple-frame borders, scroll-length registers",
      line: "fine red-brown outline, decorative double borders, repeated motif rows",
      composition: "iconic symmetry — a central Jagannath panel surrounded by narrative bands",
      texture: "chalk-gesso cloth, conch-white and hingula pigment, polished lacquer glaze",
    },
    typ: {
      display: "Odia script captions identifying the pata, sometimes Gita Govinda verses",
      body: "temple noticeboards and label cards in Odia; modern retail adds English subheads",
      notes: "text stays subordinate to image; palm-leaf variants incise letters with an iron stylus",
    },
    lit: {
      quality: "temple-lamp warmth and coastal daylight, flat and celebratory",
      temperature: "warm",
      shadow: "none; depth comes from border framing and stepped color",
    },
    ui: {
      background: "saffron-ocher with ritual red accents",
      surface: "lacquered cloth sheen, carved-stone motif edges",
      components: "temple-frame cards, Dashavatara icon rows, story-band carousels, conch-shell buttons",
      motion: "register-by-register storytelling slides, gentle gilt shimmer",
    },
  },
  {
    slug: "safavid-miniature",
    ctx: "Shah Tahmasp I's royal kitabkhana at Tabriz — headed from 1522 by Herat's master Bihzad — produced the Houghton Shahnameh (c. 1525–35) with painters Sultan Muhammad, Aqa Mirak and Mir Musavvir. Under Shah Abbas I in Isfahan, album (muraqqa) culture shifted taste toward Reza Abbasi's single elegant figures. Pigments — lapis, orpiment, gold dust, squirrel-hair brushwork — served dynastic chronicle, poetry and royal gift exchange with Ottoman and Mughal courts.",
    vd: {
      shape: "flame-shaped rocks, gold-leaf skies, mushrooming fantastical foliage, balletic court figures",
      line: "jeweler-fine contours, spiraling arabesque hatching, squirrel-hair hairlines",
      composition: "stacked tilted planes, carpet-like allover borders, figures ranked in shallow bands",
      texture: "burnished paper, gold-dust shimmer, crushed-lapis ultramarine depth",
    },
    typ: {
      display: "nastaʿlīq master calligraphy in cloud-shaped cartouches over gold-speckled margins",
      body: "Shahnameh verse columns ruled in gold, double borders framing each page",
      notes: "poetry and painting interlock — tazhib illumination flowers around the text block",
    },
    lit: {
      quality: "timeless luminous evenness, as if lit by its own gold",
      temperature: "warm",
      shadow: "flat tonal shading in violet-olive, never cast geometry",
    },
    ui: {
      background: "midnight lapis with gold-dust speckle",
      surface: "burnished paper, mica glint, lacquered binding leather",
      components: "cartouche headers, arabesque dividers, folio-page navigation, seal-red accent buttons",
      motion: "folio turns, arabesque line growths, slow burnish glints",
    },
  },
  {
    slug: "outsider-art",
    ctx: "Roger Cardinal coined 'Outsider Art' in 1972 for English readers, translating Jean Dubuffet's art brut, whose Collection de l'Art Brut opened in Lausanne in 1976. American cases: Henry Darger's Vivian Girls epic, found in his Chicago rooming house in 1972; Martín Ramírez's trains and tunnels from DeWitt State Hospital; Bill Traylor's Montgomery drawings; Judith Scott's wrapped bundles at Oakland's Creative Growth center. The Outsider Art Fair (New York, 1993) institutionalized the market.",
    vd: {
      shape: "Darger's heron-armed girl armies, Ramírez's tunnel trains, Traylor's blue-gray figures, Scott's cocoons",
      line: "relentless repeated contour, found-material marking, obsessive hatching",
      composition: "serial crowd scrolls; private cosmologies in flat stacked bands",
      texture: "cardboard brown, newsprint collage, yarn and thread wrapping, laundry-bluing stains",
    },
    typ: {
      display: "handwritten captions, invented scripts and phonetic spellings by the artists themselves",
      body: "typed asylum records and museum labels set against handwritten marginals",
      notes: "display respects private language — no imposed branding, archival restraint",
    },
    lit: {
      quality: "flat archival evenness, museum-case light on fragile paper",
      temperature: "neutral",
      shadow: "minimal and conservation-grade; the works keep their own flattened light",
    },
    ui: {
      background: "archival cream and folder tan",
      surface: "aged paper, cardboard, string and textile",
      components: "index-card entries, archival boxes, handwritten-note buttons, timeline scrollers",
      motion: "respectful slow pans, drawer-open reveals, page-turn flips",
    },
  },
  {
    slug: "pichiavo",
    ctx: "PichiAvo — the Valencian duo of Pichi and Avo, working together since 2007 — paint Greek gods as marble-white statues planted inside graffiti walls. Their 2015 appearance at Miami's Wynwood Walls launched a decade of murals from Valencia to Shanghai: Athena, Hermes and Apollo rendered with academic shading collide with spray tags, drips and chrome outlines. Their 'Gods & Myths' program stages a dialogue between classical canon and street-culture authorship.",
    vd: {
      shape: "draped Greek gods in contrapposto, chipped marble edges, missing limbs on plinths",
      line: "tight academic outlines colliding with fat-cap spray tags and paint drips",
      composition: "the god centered against a chaotic tag-field; a pedestal line anchors the chaos",
      texture: "faux-marble grain, concrete wall tooth, spray haze, metallic chrome flake",
    },
    typ: {
      display: "graffiti wildstyle and bubble letters beside clean classicized serif nameplates",
      body: "street-art typography — layered tags, stencils, marker scrawls",
      notes: "a bilingual sign system: gallery labels versus crew tags; gods named in Greek-letter graffiti",
    },
    lit: {
      quality: "harsh street daylight bouncing off whitewashed walls",
      temperature: "warm",
      shadow: "dramatic cast shade on drapery folds — academic modeling done in spray gradients",
    },
    ui: {
      background: "concrete gray with tag-color accents",
      surface: "raw cement, spray grain, marble dust",
      components: "statue-slot cards, tag-style buttons, mural-wall panels, laurel icons",
      motion: "spray-fade reveals, tag scribble-in strokes, drip animations",
    },
  },
  {
    slug: "taller-de-grafica-popular",
    ctx: "Leopoldo Méndez, Pablo O'Higgins and Luis Arenal founded the Taller de Gráfica Popular in Mexico City in 1937, extending José Guadalupe Posada's broadside tradition into anti-fascist graphics. The collective printed hojas volantes for unions, literacy campaigns and the Spanish Republic cause; members included Elizabeth Catlett, Mariana Yampolsky and Arturo García Bustos. Aligned with Cárdenas-era politics and selling prints cheaply, the TGP faded after 1960 and dissolved in 1973.",
    vd: {
      shape: "blocky figural groups, raised fists, marching workers, typeblock-tight border keys",
      line: "gouge-marked linocut contour, cross-hatched volume, high-contrast blacks",
      composition: "frieze-like rows of figures; the text panel locked into the image block",
      texture: "ink-stamped paper fiber, linoleum grain, press-uneven ink float",
    },
    typ: {
      display: "condensed woodtype and hand-cut headline caps carved into the same block as the image",
      body: "small sans caption lines, sometimes bilingual for international circulation",
      notes: "text and picture are cut together — slogans are structural, not captions",
    },
    lit: {
      quality: "flat print-room daylight; the image supplies its own dramatic contrast",
      temperature: "neutral",
      shadow: "pure black gouge shadow — no tonal gray, form carved out of darkness",
    },
    ui: {
      background: "newsprint cream and ink black only",
      surface: "rough print paper, ink texture, kraft wrap",
      components: "stamp-press buttons, slogan banners, poster-frame cards, red action flags",
      motion: "press-stamp snap-ins, bold sliding banners, sharp cuts",
    },
  },
  {
    slug: "direct-carving",
    ctx: "Taille directe rejected the Paris academic pipeline of plaster model handed off to stone-cutters. Brâncuși's Kiss (1908) demonstrated carving the block itself, informed by Romanian folk gates; Eric Gill and Jacob Epstein took it up in Britain, and Barbara Hepworth and Henry Moore theorized 'truth to material' — Moore's 1934 Unit One statement — insisting grain, fissure and hardness dictate the form. The carver's own hand replaces the copyist's.",
    vd: {
      shape: "egg-and-block forms emerging half-born from the stone, closed silent volumes",
      line: "visible chisel facets and rasped grain lines, left where the material resists",
      composition: "a single mass on a minimal plinth; figure and stone undivided",
      texture: "raw Hornton stone, polished alabaster flashes, oiled ebony grain",
    },
    typ: {
      display: "quiet gallery serif — Hepworth-era exhibition cards set in restrained Roman caps",
      body: "plain serif or sans didactics, stone-plain and unornamented",
      notes: "labels list material and year like geology — 'alabaster, 1932'; the medium is the headline",
    },
    lit: {
      quality: "raking north light that reads every chisel mark across the form",
      temperature: "neutral",
      shadow: "deep true shadow in the hollows — shadow treated as carved mass",
    },
    ui: {
      background: "limestone off-white, gallery stone",
      surface: "honed marble, chiseled texture, raw wood grain",
      components: "plinth cards, material-swatch buttons, monolith nav pillars, carved-letter labels",
      motion: "slow turntable rotations, weighty deliberate transitions",
    },
  },
  {
    slug: "assemblage",
    ctx: "From Picasso's Still Life with Chair Caning (1912) and Duchamp's Bicycle Wheel (1913) through Kurt Schwitters's Merz structures, Parisian modernism made found matter sculpture. Dubuffet's 1950s assemblages gave the term currency, and MoMA's 1961 'The Art of Assemblage' — curated by William Seitz — canonized it internationally, César's compressed cars and Arman's accumulations joining the French nouveau-réaliste wave.",
    vd: {
      shape: "real objects keeping factory silhouettes — chair seat, wheel, doll limb, tin",
      line: "object edges acting as drawing; string, wire and glue seams as contour",
      composition: "chance-ordered accumulation of stacked horizontals and collaged verticals",
      texture: "burlap weave, rust, oilcloth pattern, wood splinter, printed paper",
    },
    typ: {
      display: "cut-and-paste ransom-note lettering torn from newsprint and packaging",
      body: "typewriter labels and catalog cards, museum-dry prose",
      notes: "found words are part of the object — a heading may come off a biscuit tin",
    },
    lit: {
      quality: "flat frontal illumination that keeps every fragment equally factual",
      temperature: "neutral",
      shadow: "true small shadows between layers — the depth is literal, not painted",
    },
    ui: {
      background: "workbench brown-paper and workshop gray",
      surface: "collage laminate, jute, rusted tin",
      components: "pinned-object cards, scrap-tag buttons, drawer-grid layouts, glue-seam borders",
      motion: "drop-and-stick assembly animations, slight tilts settling into place",
    },
  },
  {
    slug: "trompe-l-il-revival",
    ctx: "After Andrea Pozzo's 1685–94 Sant'Ignazio vault in Rome codified illusionist ceiling painting, the device languished until 1970s–80s public-art programs revived it for blank walls: Richard Haas's Brooklyn Bridge Anchorage mural (1980) opened the era, John Pugh and Rainer Maria Latzke carried it worldwide, and percent-for-art ordinances made architectural illusion a civic commission across Europe's restored old towns.",
    vd: {
      shape: "painted arched windows, columns extending real walls, false balconies, brick that is not there",
      line: "linear-perspective rigor — every line converging on the building's true vanishing point",
      composition: "seamless wall-to-painting transition; soffits and cornices matching real architecture",
      texture: "matte mineral paint over lime plaster, aged to match the surrounding weathering",
    },
    typ: {
      display: "painted cartouches and signage lettered as part of the facade fiction",
      body: "donor plaques in small engraved-style serif; ghost signatures on 'stone'",
      notes: "signatures and dates are painted as if carved into the illusion's masonry",
    },
    lit: {
      quality: "light must match the real wall's sun angle — the whole trick depends on it",
      temperature: "warm",
      shadow: "architecturally correct cast shadows that sell the third dimension",
    },
    ui: {
      background: "plaster ochre and travertine tones",
      surface: "stucco texture, painted-stone grain",
      components: "faux-arch frames, window-illusion cards, fresco medallion buttons, cornice dividers",
      motion: "scroll parallax that deepens the illusion, subtle perspective shifts",
    },
  },
  {
    slug: "wiener-werkstatte",
    ctx: "Founded 19 May 1903 by Josef Hoffmann and Koloman Moser with financier Fritz Waerndorfer, the Wiener Werkstätte applied Arts & Crafts ideals in Vienna's Neustiftgasse workshops — metal, leather, bookbinding, fashion. Its square monogram stamped everything from Postsparkasse fittings to the black-and-white geometric couture of its fashion salon; the Stoclet Palace in Brussels (1905–11) was its Gesamtkunstwerk summit. Financially fragile, it closed in 1932.",
    vd: {
      shape: "squared grid forms, sphere-and-stem objects, stark monochrome fashion silhouettes",
      line: "rectilinear discipline — perpendicular rules, thin double outlines, no ornament curves",
      composition: "total design: wallpaper, glass, dress and spoon sharing one grid; centered symmetry",
      texture: "hammered silver, lacquered boxwood, fine leather, silk taffeta",
    },
    typ: {
      display: "geometric sans built on squares — the Werkstätte's own lettering anticipating Futura",
      body: "ruled sans captions with generous white space, order-form precision",
      notes: "monograms and maker's marks everywhere; every object signed like a manuscript",
    },
    lit: {
      quality: "crisp Viennese salon daylight, even and bright, flattering metal and lacquer",
      temperature: "warm",
      shadow: "clean geometric shadow, thin and architectural",
    },
    ui: {
      background: "ivory and black with gold-foil accents",
      surface: "lacquer, hammered metal, fine leather",
      components: "square-grid cards, monogram buttons, thin-rule dividers, ball-and-stem icons",
      motion: "crisp orthogonal transitions, symmetric crossfades, tidy snap easing",
    },
  },
  {
    slug: "hague-school",
    ctx: "Around Pulchri Studio in The Hague — Jozef Israëls, the Maris brothers, Anton Mauve, Hendrik Willem Mesdag, Johan Hendrik Weissenbruch and Johannes Bosboom — painted polders, dunes and Scheveningen fisherfolk in the 'Gray School' tonality. The Paris dealer Goupil & Cie (where Van Gogh's uncle was a partner) sold them internationally; Mesdag's Panorama (1881) was their monument, and Mauve taught the young Van Gogh.",
    vd: {
      shape: "low horizons, wind-bent trees, carts in sand, vast fat-cloud skies dominating small figures",
      line: "supple loaded-brush strokes, soft edges merging land and air",
      composition: "two-thirds sky, figures dwarfed on the dune line, church spires as anchors",
      texture: "moist gray-green glazes, grainy impasto in clouds, thin luminous distances",
    },
    typ: {
      display: "19th-century Dutch engraved serifs — exhibition catalogs and Pulchri invitation typography",
      body: "bookish old-style serif, letterpress captions in Dutch",
      notes: "titles plain and pastoral; signatures small, brush-written in a corner",
    },
    lit: {
      quality: "filtered Northern light through cloud — silvery, damp, enveloping",
      temperature: "cool",
      shadow: "gray-green tonal shadow, no hard edges; atmosphere swallows outline",
    },
    ui: {
      background: "pearl-gray sky gradient over dun sand",
      surface: "linen canvas weave, weathered wood, dune grass",
      components: "muted landscape cards, tide-line dividers, driftwood buttons, cloud-swatch headers",
      motion: "slow horizontal pans like drifting cloud, gentle mist fades",
    },
  },
  {
    slug: "magic-realism",
    ctx: "Franz Roh coined 'Magischer Realismus' in his 1925 book Nach-Expressionismus, describing postwar painting of uncanny stillness — Georg Schrimpf's placid women, Alexander Kanoldt's crystalline tables and hills — where precision alone renders the real dreamlike. Gustav Hartlaub's 1925 Mannheim exhibition Neue Sachlichkeit grouped them as the quiet counterpart to the verists Dix and Grosz; the term later migrated to Latin American literature and American precisionist painting.",
    vd: {
      shape: "smooth spherical fruits, ceramic-smooth hills, motionless figures frozen mid-silence",
      line: "airless hard-edged contours, seamless outline, no expressive mark anywhere",
      composition: "still-life symmetry on tilted tables; empty rooms with one impossible light source",
      texture: "glassy enamel smoothness, mineral matte eggshell, no impasto",
    },
    typ: {
      display: "restrained Weimar serif-sans mixes on quiet gallery cards; the book typography of Roh's essays",
      body: "calm modernist sans, essay-like labels; period Fraktur avoided",
      notes: "labels matter-of-fact, letting the image's uncanny quality do the talking",
    },
    lit: {
      quality: "windless crystal daylight — brighter than real, shadows too perfect",
      temperature: "warm",
      shadow: "unnaturally crisp polished shadows that fix objects like lacquered down",
    },
    ui: {
      background: "porcelain white with faint olive tint",
      surface: "glazed ceramic, polished enamel panels",
      components: "still-life icon cards, thin-outline buttons, quiet centered cards, museum-plinth nav",
      motion: "hovering near-stillness, slow perfect slides, hypnotic loops",
    },
  },
  {
    slug: "gutai",
    ctx: "Jirō Yoshihara founded Gutai in Ashiya in 1954 with Shōzō Shimamoto, Kazuo Shiraga, Saburō Murakami and Atsuko Tanaka. At the first Tokyo show (Ohara Kaikan, 1955) Shiraga wrestled mud and Murakami burst through paper screens; the open-air Ashiya exhibition that summer 'challenged the midsummer sun'. Yoshihara's manifesto ran in Geijutsu Shinchō (1956); Michel Tapié carried the group to Europe, and the Gutai Pinacotheca hosted international guests until Yoshihara's death closed it in 1972.",
    vd: {
      shape: "slashed and burst paper screens, mud troughs, electric-light rings, red vinyl cones",
      line: "body-imprinted tracks, pendulum swing trails, centrifugal fling lines",
      composition: "event over object — the installation is the picture; space treated as canvas",
      texture: "dried mud crust, whipped impasto ridges squeezed from bottles, glossy vinyl, oxidized tin",
    },
    typ: {
      display: "concrete-poem layouts from the Gutai journal — huge single kanji, stenciled roman GUTAI",
      body: "plain Japanese press text; announcements set like event flyers",
      notes: "Yoshihara demanded creation beyond imitation — typography likewise breaks the frame",
    },
    lit: {
      quality: "open-air sun or bare-bulb warehouse light, unfiltered",
      temperature: "warm",
      shadow: "actual event shadows — the body and object cast live evidence",
    },
    ui: {
      background: "raw concrete and daylight white",
      surface: "splashed canvas, tin sheet, mud-textured panels",
      components: "burst-hole buttons, footprint trails, light-ring loaders, slashed-frame cards",
      motion: "physics-driven splashes, fling-and-settle, sudden bursts",
    },
  },
  {
    slug: "social-practice-art",
    ctx: "Nicolas Bourriaud theorized the lineage in France: his 1996 'Traffic' exhibition at the CAPC Bordeaux and 1998 book Esthétique relationnelle framed Rirkrit Tiravanija's cooked meals, Philippe Parreno and Pierre Huyghe's collaborative films and Liam Gillick's discussion platforms as art whose material is human exchange. Later frameworks — Pablo Helguera's 2011 'Education for Socially Engaged Art', Creative Time's US commissions — broadened it to community co-creation.",
    vd: {
      shape: "occupiable structures — a dinner table, an open kitchen, a talk platform, a free school",
      line: "minimal architect lines, provisional tape-and-timber edges",
      composition: "people-complete: layouts anticipate bodies; conversation circles replace objects",
      texture: "plywood, plastic cups, paper, projector light, borrowed furniture",
    },
    typ: {
      display: "plain institutional sans — instructions, invitations and contracts as headline text",
      body: "usable documents: recipes, schedules, agreements, zines",
      notes: "typography is functional infrastructure — signage meant to be obeyed, filled in, or taken home",
    },
    lit: {
      quality: "ordinary functional light — office fluorescents, kitchen warmth, projector beam",
      temperature: "warm",
      shadow: "unremarkable real shadow; ambience kept social, not theatrical",
    },
    ui: {
      background: "institute white or community-hall warm gray",
      surface: "plywood, paper, photocopied zine stock",
      components: "sign-up forms, event calendars, chat threads, shared-document panels, RSVP buttons",
      motion: "live participation feeds, collaborative cursors, gentle presence indicators",
    },
  },
  {
    slug: "mingei",
    ctx: "Yanagi Sōetsu coined mingei ('arts of the people') in 1925–26 after encountering Korean Yi-dynasty pottery, praising the 'beauty of use' in anonymous objects. With potters Hamada Shōzō and Kawai Kanjirō, the Englishman Bernard Leach and weavers like Serizawa Keisuke, he opened the Nihon Mingeikan museum in Tokyo in 1936 and published the journal Kōgei; Shimaoka Tatsuzō and Tottori's Yoshida Shōya carried the ideal into living workshops.",
    vd: {
      shape: "well-used round-bellied pots, ash-glazed platters, indigo-dyed cloth squares",
      line: "potter's finger ridges, wax-resist brush lines, unforced asymmetric wobble",
      composition: "utilitarian groupings on plain wood shelves; nothing centered for show",
      texture: "speckled ash glaze, coarse clay tooth, kakishibu-browned wood, nubby cotton weave",
    },
    typ: {
      display: "hand-brushed kanji tags and woodblock-printed museum labels in the Mingeikan's modest style",
      body: "plain minchō body text for the movement's quiet journals",
      notes: "objects carry potter's seals humbly; anonymity itself is honored",
    },
    lit: {
      quality: "soft north light in an old farmhouse room, muted and domestic",
      temperature: "warm",
      shadow: "natural window shadow, unhurried and soft-edged",
    },
    ui: {
      background: "unbleached linen and persimmon brown",
      surface: "raw wood, ash-glaze ceramic, indigo cotton",
      components: "shelf-card layouts, seal-stamp buttons, woven dividers, pot-profile icons",
      motion: "settling, weighty ease like a pot placed on wood",
    },
  },
  {
    slug: "guangdong-style-ceramics-painting",
    ctx: "Under the Canton System (1757–1842), Guangzhou workshops painted overglaze enamels on white porcelain blanks shipped from Jingdezhen, exporting through the Thirteen Factories to Europe as 'Guangcai' — dense famille-rose palette with gold outlines. Nearby, the Shiwan kilns at Foshan fired dragon-kiln figures (Shiwan gongzai) for temple roofs and household shrines. Both traditions remain living heritage in Foshan and Guangzhou studios.",
    vd: {
      shape: "bordered oval medallions, wall-to-wall floral fills, roof-ridge warrior figures",
      line: "gold-outlined enamel contours, hair-fine brushwork in famille-rose pinks and greens",
      composition: "radial medallion symmetry; border-on-border framing with figural scenes centered",
      texture: "glassy enamel pools, raised gold outline, matte biscuit rims",
    },
    typ: {
      display: "red reign marks and auspicious character medallions (fu, shou) used as decoration",
      body: "historically bilingual export labels; museum cards note kiln and period",
      notes: "lettering is ornament — characters function as luck-symbols more than text",
    },
    lit: {
      quality: "showroom lamp glow maximizing enamel gloss and gold glitter",
      temperature: "warm",
      shadow: "deep vitreous shadows inside enamel pools; tiny carved shade on figures",
    },
    ui: {
      background: "porcelain white with vermilion and gilt frame accents",
      surface: "glazed ceramic gloss, gilded relief",
      components: "medallion cards, famille-rose swatches, kiln-progress bars, seal-mark buttons",
      motion: "porcelain-smooth rotations, gilded shimmers, medallion spins",
    },
  },
]
