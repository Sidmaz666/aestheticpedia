/**
 * Aesthetic Atlas — Domain taxonomy & research queue.
 * Each tuple = one LLM research batch: [category, domain, focus].
 * The pipeline processes these continuously; the audit phase appends more.
 */

export const DOMAIN_BATCHES: Array<[string, string, string]> = [
  // ===== ART MOVEMENTS =====
  ['Art Movement', 'European 19th-century art movements', 'Romanticism, Realism, Barbizon, Pre-Raphaelites, Macchiaioli, Symbolism, Les Nabis, Aestheticism, Historicism and their documented variants'],
  ['Art Movement', 'European early 20th-century avant-gardes', 'Fauvism, Expressionism (Die Brücke, Der Blaue Reiter), Cubism and its phases, Orphism, Futurism, Vorticism, Dada, De Stijl, Purism, and related documented -isms'],
  ['Art Movement', 'Interwar art movements 1918-1945', 'Surrealism, Constructivism, Suprematism, Neue Sachlichkeit, Magic Realism, Precisionism, Socialist Realism, Art Concret, Abstraction-Création'],
  ['Art Movement', 'Postwar art movements 1945-1970', 'Art Informel, Tachisme, CoBrA, Gutai, Abstract Expressionism, Color Field, Neo-Dada, Nouveau Réalisme, Fluxus, Op Art, Minimalism, Arte Povera'],
  ['Art Movement', 'Contemporary art movements 1970-2000', 'Conceptual Art, Land Art, Photorealism, Neo-Expressionism, Transavantgarde, Young British Artists, Street art evolution, Pictures Generation'],
  ['Art Movement', '21st-century art tendencies', 'Post-internet art, New Media Art, Metamodernism in art, Social practice art, Bio art, Digital/virtual art movements, Afrofuturist art'],
  ['Art Movement', 'Japanese art movements and schools', 'Nihonga, Yōga, Mingei, Sōsaku-hanga, Shin-hanga, Gutai, Mono-ha, Superflat, Ryōkyūan arts, Ukiyo-e schools (Utagawa, Katsukawa)'],
  ['Art Movement', 'Chinese painting and art traditions', 'Literati painting (wenrenhua), Shanghai School, Lingnan School, New Ink Art, Cynical Realism, Political Pop, Guangdong-style ceramics painting'],
  ['Art Movement', 'Korean art traditions and movements', 'Minhwa folk painting, True View (Jingyeong) landscape, Dansaekhwa monochrome, Korean Munjado letter paintings, contemporary Korean art movements'],
  ['Art Movement', 'Indian and South Asian art movements', 'Bengal School, Progressive Artists Group, Madhubani, Kalighat painting, Tanjore painting, Pattachitra, Company painting, Contemporary Indian art'],
  ['Art Movement', 'Islamic art traditions', 'Arabesque, Aniconism and calligraphic arts, Ottoman miniature, Safavid miniature, Mughal painting, Illuminated manuscripts, Zellige and girih patterns'],
  ['Art Movement', 'African and diaspora art movements', 'Négritude visual culture, Harlem Renaissance, Black Arts Movement, Nsukka school, Sudanese Kriatalism, contemporary African art movements'],
  ['Art Movement', 'Latin American art movements', 'Mexican Muralism, Indigenism, Constructive Universalism (Joaquín Torres-García), Anthropophagy, Tropicalism, Conceptualism in Latin America'],
  ['Art Movement', 'Eastern European and Russian art movements', 'Peredvizhniki Wanderers, Mir Iskusstva, Rayonism, Suprematism, Constructivism, Ukrainian Boichukism, Prague Group, Romanian Neo-Byzantine'],
  ['Art Movement', 'Outsider, visionary and naïve art', 'Art Brut, Outsider Art, Visionary environments, Naïve painting, Sunday painters, Neuve Invention'],
  ['Art Movement', 'Printmaking traditions worldwide', 'Ukiyo-e, Sōsaku-hanga, Linocut movement, Taller de Gráfica Popular, Polish poster school (graphic), WPA printmaking, Contemporary risograph scene'],
  ['Art Movement', 'Sculpture movements and traditions', 'Direct carving, Constructivist sculpture, Land art earthworks, Kinetic sculpture, Assemblage, New Genus public sculpture traditions'],
  ['Art Movement', 'Photorealism and hyperrealist lineages', 'Photorealism, Hyperrealism, Magic realism in painting, Trompe-l\'œil revival, Contemporary realism academies'],
  ['Art Movement', 'Decorative art movements', 'Arts and Crafts, Art Nouveau (national variants: Jugendstil, Stile Liberty, Modernisme, Sezession), Wiener Werkstätte, Art Deco, Streamline'],
  ['Art Movement', 'Golden Age illustration and painting schools', 'Brandywine School, Golden Age of Illustration, Hague School, Düsseldorf school of painting, Pont-Aven school, Norwich school'],

  // ===== ARCHITECTURE =====
  ['Architectural Style', 'Gothic architecture substyles', 'Early/High Gothic, Rayonnant, Flamboyant, Brick Gothic, English Perpendicular & Decorated, Sondergotik, Gothic Sereno'],
  ['Architectural Style', 'Romanesque regional variants', 'Ottonian, Lombard, Norman, Pisan, Rhenish, Mozarabic, Pilgrimage church architecture'],
  ['Architectural Style', 'Renaissance and Mannerist architecture', 'Quattrocento, High Renaissance, Mannerism, Palladianism, French Renaissance, Elizabethan prodigy houses'],
  ['Architectural Style', 'Baroque and Rococo architecture variants', 'Roman Baroque, French Baroque, Churrigueresque, Ukrainian/Elizabethan Baroque, Bavarian Rococo, Late Baroque'],
  ['Architectural Style', 'Revival architecture styles A', 'Gothic Revival, Neoclassical, Greek Revival, Egyptian Revival, Moorish Revival, Byzantine Revival, Romanesque Revival'],
  ['Architectural Style', 'Revival architecture styles B', 'Tudor Revival, Colonial Revival, Spanish Colonial Revival, Mission Revival, Beaux-Arts, Italianate, Second Empire, Queen Anne'],
  ['Architectural Style', 'Victorian and Edwardian architecture', 'Victorian Italianate, Stick, Shingle, Richardsonian Romanesque, Painted Ladies era, Edwardian Baroque, Queen Anne (Victorian)'],
  ['Architectural Style', 'Arts & Crafts to Prairie School', 'Arts and Crafts architecture, American Craftsman, Prairie School, Usonian, Bungalow/Craftsman, Garden City movement'],
  ['Architectural Style', 'Art Deco architecture worldwide', 'Zigzag Moderne, Streamline Moderne, Tropical Deco (Miami), Bombay Deco, Shanghai Deco, Napier NZ Deco, P&W (PWA Moderne)'],
  ['Architectural Style', 'Classical modernism in architecture', 'International Style, Bauhaus architecture, Nieuwe Bouwen, Functionalism, BAM (Büro- und Großwirtschaftsbauten), Organic architecture'],
  ['Architectural Style', 'Mid-century and pop architecture', 'Googie, Populuxe, Tiki architecture, Mid-century modern houses, Case Study Houses, Space Age architecture'],
  ['Architectural Style', 'Brutalism and structuralism', 'New Brutalism, British Brutalism, Soviet Modernism, Yugoslav brutalism/spomeniks, Metabolism, Structuralism (Team X)'],
  ['Architectural Style', 'Postmodern and deconstructivist architecture', 'Postmodern architecture, Deconstructivism, Critical Regionalism, High-tech architecture, Late Modernism'],
  ['Architectural Style', 'Contemporary architecture currents', 'Parametricism, Blobitecture, Sustainable/green architecture, Adaptive reuse aesthetics, Vernacular revival, Biophilic design'],
  ['Architectural Style', 'Islamic architecture traditions', 'Persian/Iranian (Seljuk, Safavid), Mughal, Ottoman, Moorish/Andalusi, Fatimid, Timurid, Mamluk, Indo-Islamic (Deccani, Bengal)'],
  ['Architectural Style', 'Chinese traditional architecture', 'Imperial palace style, Siheyuan courtyard, Huizhou merchant houses, Tulou Hakka roundhouses, Lingnan gardens, Tibetan monastery architecture'],
  ['Architectural Style', 'Japanese traditional architecture', 'Shinden-zukuri, Shoin-zukuri, Sukiya-zukuri, shrine architecture (shinmei-zukuri etc.), castle architecture, Machiya townhouses, Minka farmhouses'],
  ['Architectural Style', 'Korean and Southeast Asian traditional architecture', 'Hanok, Vietnamese Nguyễn architecture, Thai temple architecture, Balinese architecture, Javanese joglo, Filipino bahay na bato'],
  ['Architectural Style', 'South Asian regional architecture', 'Dravidian temple, Nagara temple, Kerala architecture, Chettinad mansions, Rajput palaces, Himalayan architecture, Colonial Indo-Saracenic'],
  ['Architectural Style', 'European vernacular architecture', 'Alpine chalet, Trullo, Cycladic architecture, Fachwerk timber framing, Scottish baronial, Dacha, Sognefjord stave churches, Galician horreo'],
  ['Architectural Style', 'African architecture traditions', 'Sahelian mud architecture (Djenné), Ethiopian rock-hewn churches, Great Zimbabwe, Swahili coastal architecture, Ndebele painted houses, Berber ksour'],
  ['Architectural Style', 'Pre-Columbian Americas architecture', 'Maya, Aztec (Mexica), Inca, Teotihuacan, Olmec, Mississippian platform mounds, Ancestral Puebloan (Chacoan)'],
  ['Architectural Style', 'Pacific and Oceania architecture', 'Polynesian meeting houses (wharenui), Fijian bure, Hawaiian heiau, Micronesian navigation houses, Papuan longhouses'],
  ['Architectural Style', 'Colonial architecture worldwide', 'Dutch colonial & Cape Dutch, Portuguese colonial (Goa, Brazil), Spanish colonial, French colonial, British colonial, Caribbean Georgian'],
  ['Architectural Style', 'Soviet and Eastern Bloc architecture', 'Stalinist Empire style, Constructivist monuments, Khrushchyovka, Brezhnevka, Socialist modernism, Soviet mosaics in architecture'],
  ['Architectural Style', 'Religious building typologies', 'Basilica plan, centrally-planned church, Stave church, Mosque typologies, Pagoda, Gopuram temple gates, Meetinghouse'],

  // ===== INTERIOR DESIGN =====
  ['Interior Design', 'Classic interior period styles', 'Georgian interior, Victorian interior, Empire style, Biedermeier, Louis XVI interior, Arts & Crafts interior, Aesthetic Movement interior'],
  ['Interior Design', 'Modern interior design movements', 'Bauhaus interior, Mid-century modern interior, Memphis Milano interiors, High-tech interiors, Organic modernism (Noguchi)'],
  ['Interior Design', 'Contemporary micro interior styles A', 'Japandi, Grandmillennial, Cluttercore, Dark Academia interiors, Light Academia interiors, Coastal grandmother, Quiet luxury interiors'],
  ['Interior Design', 'Contemporary micro interior styles B', 'Maximalist eclectic, Organic modern, New American farmhouse, Wabi-sabi interiors, Biophilic interiors, Cottagecore interiors, Cheugy-era millennial decor'],
  ['Interior Design', 'Regional living traditions', 'Scandinavian, Mediterranean, Moroccan riad, Japanese washitsu & tatami rooms, Indian haveli interiors, Andalusian patio, Indonesian limasan'],
  ['Interior Design', 'Hospitality space design cultures', 'American diner, Japanese kissaten, Izakaya, Hong Kong cha chaan teng, Parisian café, Viennese coffeehouse, British pub, Soviet café culture'],
  ['Interior Design', 'Commercial space design eras', 'Department store architecture, Konbini design, Vintage retail (general store, bazaar), American roadside (dinners, motels, googie stands), Airport design eras'],

  // ===== FURNITURE & PRODUCT =====
  ['Furniture & Product Design', 'Furniture design periods', 'Thonet bentwood, Shaker furniture, Windsor chairs, Art Deco furniture, Mid-century Danish modern, Postmodern furniture, Shaker revival'],
  ['Furniture & Product Design', 'Product design movements', 'Braun/Dieter Rams functionalism, Space Age product design, Memphis Milano products, Japanese industrial minimalism, Italian design (Alessi era), Asian electronics design'],
  ['Furniture & Product Design', 'Utilitarian and industrial design', 'Soviet industrial design, Military surplus aesthetics, Laboratory equipment design, Medical device design, Tool aesthetics (Japanese woodworking tools)'],
  ['Furniture & Product Design', 'Lighting design eras', 'Tiffany lamps, Art Deco lighting, Mid-century lighting (Arco, PH lamp), Memphis lighting, Industrial pendant lighting, Neon sign culture'],
  ['Furniture & Product Design', 'Automotive design eras and cultures', 'Streamline automotive, Tailfin era, JDM tuning culture, Kustom Kulture (lead sled, lowrider), Rat rod, Euro stance culture, Kei car culture, Classic rally liveries'],
  ['Furniture & Product Design', 'Consumer product aesthetics by era', 'Walkman era design, Transparent electronics (iMac G3, Nintendo clear), Braun era electronics, Nokia era mobile design, Retro-futuristic appliances'],

  // ===== GRAPHIC DESIGN =====
  ['Graphic Design', 'Foundational graphic design movements', 'Swiss International Style, Bauhaus graphics, De Stijl graphics, New Wave typography, Grunge typography (Ray Gun era), Postmodern graphic design'],
  ['Graphic Design', 'National poster traditions', 'Polish School of Posters, Swiss poster, Japanese poster design, Cuban poster art (ICAP), Soviet propaganda posters, French poster (Chéret, Mucha) tradition'],
  ['Graphic Design', 'Editorial and magazine design eras', 'New Journalism era magazines, Vogue eras, Pentagram-era editorial, Swiss magazine design, Zine culture, Independent magazine boom'],
  ['Graphic Design', 'Record sleeve and music packaging', 'Blue Note jazz covers, Psychedelic rock posters, Punk record sleeves, Factory Records design, Hip-hop album art eras, EDM packaging, Shrink-wrapped CD era'],
  ['Graphic Design', 'Advertising design eras', 'Victorian trade cards, Mad Men era advertising, 1980s TV graphics, 1990s grunge advertising, Contemporary minimal advertising, Bubble-era Japanese ads'],
  ['Graphic Design', 'Vernacular and signage design', 'Neon signage cultures, Painted ghost signs, Hand-painted shop signs (worldwide), American motel signage, Bangkok/Asia street signage, Borderland vernacular'],
  ['Graphic Design', 'Packaging design eras and cultures', 'Victorian packaging, Mid-century grocery packaging, Japanese packaging design, Soviet candy wrappers, Vintage cosmetics packaging, Craft beer label design'],
  ['Graphic Design', 'Counterculture graphic design', 'Psychedelia (Fillmore posters), Punk DIY graphics, Rave flyer culture, Riot grrrl zine graphics, Protest graphics, Crust/DIY tape covers'],
  ['Graphic Design', 'Corporate identity design eras', 'IBM/Paul Rand era identity, 1970s corporate identity (Vignelli), 1990s dot-com branding, Flat corporate rebrands, Tech startup branding era'],
  ['Graphic Design', 'Information and instructional design', 'Isotype, Massimo Vignelli NYC transit, Airport wayfinding (Frutiger), Olympic design systems, Infographic golden age, Subway map traditions'],

  // ===== TYPOGRAPHY =====
  ['Typography & Lettering', 'Type classification traditions', 'Old Style, Transitional, Didone, Slab serif, Grotesque, Humanist sans, Geometric sans, Neo-grotesque history'],
  ['Typography & Lettering', 'Historical lettering styles', 'Blackletter variants (Textura, Fraktur, Rotunda, Schwabacher), Roman square capitals, Carolingian minuscule, Humanist minuscule, Victorian display'],
  ['Typography & Lettering', 'Script and display lettering', 'Copperplate script, Brush lettering, Neon lettering, Wood type poster lettering, Casino/lounge lettering, Chalkboard lettering, Airbrush lettering'],
  ['Typography & Lettering', 'Calligraphy traditions', 'Arabic calligraphy styles (Kufic, Naskh, Thuluth, Diwani, Nastaliq), Chinese calligraphy scripts (Kaishu, Xingshu, Caoshu), Japanese calligraphy (Shodō), Western Gothic calligraphy revival'],
  ['Typography & Lettering', 'Digital era typography', 'Pixel fonts, Bitmap typography, Web 2.0 typography, Corporate sans era (Helvetica now), Variable fonts, Glitch typography, ASCII art text'],
  ['Typography & Lettering', 'National typography cultures', 'German Fraktur culture, Swiss typography culture, Japanese minchō & gothic type, Korean hangul typography, Devanagari typography, Thai typography'],

  // ===== FASHION =====
  ['Fashion & Dress', 'Fashion by decade 1900s-1940s', 'Belle Époque silhouette, 1910s Orientalism, 1920s flapper, 1930s bias-cut glamour, 1940s wartime utility fashion, New Look 1947'],
  ['Fashion & Dress', 'Fashion by decade 1950s-1970s', '1950s Dior/rockabilly, 1960s mod/psychedelic, 1970s disco/bohemian, Hippie dress, Glam rock, Greaser style'],
  ['Fashion & Dress', 'Fashion by decade 1980s-2000s', '1980s power dressing, Y2K fashion, McBling, 1990s grunge/minimalism, Cyber raver fashion, Fruits/Harajuku export, Chav/trackie aesthetics'],
  ['Fashion & Dress', 'Fashion by decade 2010s-2020s', 'Indie sleaze, Normcore, Gorpcore, Coquette, Balletcore, Blockcore, Mob wife, Clean girl, Quiet luxury, Y2K revival'],
  ['Fashion & Dress', 'Couture and designer movements', 'Deconstructionism (Margiela), Antwerp Six aesthetic, Japanese avant-garde (Yohji/Comme), Minimalist couture, Maximalist couture, Avant-gardeexperimental fashion'],
  ['Fashion & Dress', 'Streetwear cultures', 'Sneakerhead culture, Skatewear, Hypebeast era, Vintage sportswear culture, Workwear-into-streetwear, UK drill fashion, Seoul street style'],
  ['Fashion & Dress', 'Punk fashion variants', 'Original UK punk, Hardcore punk, Anarcho-punk, Oi!, Post-punk fashion, Pop punk 90s, Crust punk, Deathrock fashion'],
  ['Fashion & Dress', 'Goth fashion variants', 'Traditional/Batcave goth, Romantic goth, Victorian goth, Cyber goth, Pastel goth, Mall goth, Nu goth, Gothic Lolita crossover'],
  ['Fashion & Dress', 'Music scene fashion styles', 'Metal fashion (variants: trad, black, power, folk), Emo & Scene fashion, Raver/kandi culture, Indie sleaze, Ska two-tone fashion, Rockabilly/psychobilly'],
  ['Fashion & Dress', 'Class-signifier dress styles', 'Ivy/preppy, Old money aesthetic, Sloane Ranger, French girl style, English countryside dress, Quiet luxury dress, Bourgeois bohemian'],
  ['Fashion & Dress', 'Workwear and utilitarian dress', 'French chore wear, American heritage workwear (Carhartt culture), Denim history (selvedge culture), Chef whites, Coverall/boiler suit culture, Railroad denim'],
  ['Fashion & Dress', 'Japanese street fashion movements', 'Lolita variants (Sweet, Gothic, Classic, Ouji), Decora, Gyaru variants (Ganguro, Hime, Onee), Mori kei, Dolly kei, Visual kei, Fairy kei, Yamanba, Jirai kei'],
  ['Fashion & Dress', 'Korean and Chinese contemporary fashion', 'K-fashion (Hongdae style, Seongsu style), East Asian athleisure, Hanbok modernization, C-pop idol fashion, China Chic (Guochao)'],
  ['Fashion & Dress', 'South Asian dress traditions', 'Saree draping traditions, Sherwani & wedding wear, Kurta/kurti styles, Bandhgala, Lungi culture, Assamese Mekhela Chador, Banarasi brocade tradition'],
  ['Fashion & Dress', 'African dress traditions', 'Ankara/wax print culture, Agbada & Aso-oke, Kente cloth dress, Kaftan traditions, Maasai shúkà dress, Somali dirac, Xhosa umbhaco'],
  ['Fashion & Dress', 'Middle Eastern and North African dress', 'Thobe traditions, Abaya styles, Kaftan (Moroccan), Bedouin dress, Palestinian tatreez embroidery dress, Kurdish dress traditions'],
  ['Fashion & Dress', 'Indigenous and diaspora dress traditions', 'Hanbok, Áo dài, Barong tagalog & Baro\'t saya, Guayabera culture, Plains ribbon shirts (documented contexts), Inuit parka (atakku/qarliik) traditions'],
  ['Fashion & Dress', 'Bridal and wedding dress traditions', 'White wedding dress history, Red wedding traditions (China), Indian bridal wear, Japanese shiromuku & uchikake, Scottish tartan weddings, Vegas chapel kitsch'],
  ['Fashion & Dress', 'Sportswear and athletic aesthetics', 'Track suit culture (variants: UK casual, Chav, Gosha-era), Tennis whites culture, Cycling kit design, Football terrace fashion (casuals), Vintage gym (bodybuilding 70s)'],
  ['Fashion & Dress', 'Military-inspired fashion', 'M65 field jacket culture, Bomber jacket history, Camo in civilian dress, Khaki & safari style, Naval peacoat culture, Aviator style'],
  ['Fashion & Dress', 'Festival and costume cultures', 'Burning Man fashion, Carnival costumes (Trinidad, Rio, Venice), Cosplay cultures, Halloween costume eras, Matsuri happi & festival dress, Ren Faire culture'],

  // ===== TEXTILE & CRAFT =====
  ['Textile & Craft', 'Textile resist and dye techniques', 'Shibori, Batik, Ikat (single & double), Bandhani, Tie-dye history, Adire eleko, Plangi/tritik traditions'],
  ['Textile & Craft', 'Fabric traditions', 'Tweed (Harris), Chambray, Velvet history, Corduroy, Brocade, Damask, Denim, Tartan weaving culture'],
  ['Textile & Craft', 'Ceramics traditions', 'Korean celadon (Goryeo), Japanese Raku & Bizen, Delftware, Talavera Poblana, Jingdezhen blue-white, Majolica, Wedgwood jasperware'],
  ['Textile & Craft', 'Glass and metal craft traditions', 'Murano glass, Venetian mirror craft, Cloisonné, Damascene metalwork (Toledo), Pewter traditions, Cut crystal (Waterford), Carnival glass'],
  ['Textile & Craft', 'Wood and paper crafts', 'Bentwood furniture craft, Japanese joinery traditions, Origami, Kirigami, Papier-mâché traditions, Marquetry, Intarsia'],
  ['Textile & Craft', 'Jewelry traditions', 'Victorian jet mourning jewelry, Filigree traditions, Navajo & Zuni turquoise silverwork, Celtic metalwork revival, Signet ring culture, Charm jewelry eras'],
  ['Textile & Craft', 'Rug and carpet traditions', 'Persian carpet regional styles (Tabriz, Kashan, Heriz), Kilim flatweave, Navajo weaving, Scandinavian rya, Aubusson, Hooked rugs'],
  ['Textile & Craft', 'Embroidery traditions', 'Crewel work, Japanese sashiko, Kantha, Palestinian tatreez, Ukrainian vyshyvanka embroidery, Chinese suzhou embroidery, Bayesian? use: cross-stitch samplers'],
  ['Textile & Craft', 'Basketry and fiber arts', 'Native American basketry traditions, Japanese bamboo craft, Willow weaving, Macramé eras, Contemporary fiber art movement'],

  // ===== SUBCULTURES =====
  ['Subculture Style', 'Classic youth subcultures 1950s-1970s', 'Teddy Boy, Mod, Rocker, Greaser, Hippie, Skinhead (traditional/reggae era), suedehead, Rude boy, Beatnik'],
  ['Subculture Style', 'Post-punk and 1980s subcultures', 'New Romantics, Blitz kids, Goth progenitors (Batcave), Casuals, B-Boy culture, Metalheads 80s, Skate 80s (powell peralta era)'],
  ['Subculture Style', '1990s subcultures', 'Acid house & rave, Grunge generation, Cyberdelic, Straight edge, Trip-hop lounge culture, Rollerblading culture'],
  ['Subculture Style', '2000s-2020s subcultures', 'Scene kids, E-boys/e-girls, Mall goth revival, Soft grunge tumblr era, VSCO girl, Alt TikTok, Dark academia community, Y2K revivalists'],
  ['Subculture Style', 'Metal subculture visual families', 'Traditional metal (denim & patches), Black metal (corpse paint, frostbitten), Death metal (gore art), Power metal (fantasy), Folk metal, Doom (incense & bell-bottoms), Metalcore 2000s'],
  ['Subculture Style', 'Board and wheels cultures', 'Skate culture graphics (Z-Boys, Powell era, 90s big pants), Surf culture (longboard revival, hotdogging), BMX culture, Roller derby revival, Longboarding'],
  ['Subculture Style', 'Club and dance cultures', 'Ballroom/voguing houses, Disco culture, Chicago house, Berlin techno minimalism, Drum & bass/Jungle culture, Reggaeton perreo aesthetics, Kiki scene'],
  ['Subculture Style', 'Motorcycle cultures', 'Café racer (Ton-Up boys), Chopper culture (Easy Rider era), Outlaw MC iconography, Scooterboy/mod scooter culture, Custom bagger, Brat style Japan'],
  ['Subculture Style', 'Historical youth movements', 'Zazous, Swing Kids, Wandervogel, Flappers (subculture framing), Teddy Girls, Bodgies & Widgies, La Sape (Sapeurs), Vegan straight edge'],
  ['Subculture Style', 'Rave and electronic music cultures', 'Acid house smiley culture, Madchester, Goa trance, Hardcore/gabber, Eurodance, UK garage, Dubstep era, Festival glitter culture'],
  ['Subculture Style', 'Fandom and fan cultures', 'Cosplay communities, K-pop fandom aesthetics (photocard culture), Anime convention culture, Trek/X fandoms history? use: Sci-fi fandom (fanzine era), Renaissance faire community, Historical reenactment cultures'],

  // ===== INTERNET AESTHETICS =====
  ['Internet Aesthetic', 'Vaporwave family and -wave aesthetics', 'Vaporwave, Future funk, Mallsoft, Synthwave, Dariacore, Signalwave, Broken transmission, Barber beats, Hardvapour, Laborwave'],
  ['Internet Aesthetic', '-core internet aesthetics', 'Cottagecore, Goblincore, Fairycore, Angelcore, Lovecore, Clowncore, Kidcore, Oceanic/mermaidcore, Crowcore, Mushroomcore'],
  ['Internet Aesthetic', 'Academia family aesthetics', 'Dark academia, Light academia, Romantic academia, Darkest academia, Scholarly variations & related library aesthetics'],
  ['Internet Aesthetic', '-punk internet aesthetics', 'Cyberpunk (internet framing), Solarpunk, Cottagepunk? use: Meadowpunk, Technopunk variants, Stonepunk, Icepunk, Nowpunk — documented community -punk labels'],
  ['Internet Aesthetic', 'Weird and uncanny internet aesthetics', 'Weirdcore, Dreamcore, Nostalgiacore, Liminal spaces, Backrooms imagery, Trauma aesthetics (documented community labels), Unheimlich imagery'],
  ['Internet Aesthetic', 'Nostalgia internet aesthetics', 'Y2K revival, Frutiger Aero, Frutiger Metro, McBling revival, 2014 tumblr soft grunge, Vintage web nostalgia, Kidcore-adjacent 90s nostalgia'],
  ['Internet Aesthetic', 'Cute internet aesthetics', 'Kawaii internet culture, Yami kawaii, Yume kawaii, Angelcore crossover, Cutecore, Sanrio-adjacent digital aesthetics'],
  ['Internet Aesthetic', 'TikTok and Pinterest micro-aesthetics', 'That girl, Clean girl, Coastal granddaughter? correct to: coastal grandmother, Mob wife, Tomato girl, Blokecore, Girlblogger, Nihilist core? use: brainrot visual culture'],
  ['Internet Aesthetic', 'Image-sharing era visual languages', 'VSCO filter era, Instagram aesthetic shifts, BeReal rawness, Polaroid-look digital filters, Film-look presets culture'],
  ['Internet Aesthetic', 'Forum and chat visual cultures', 'Geocities personal pages, MSN/MySpace glitter graphics, Forum signature culture, Discord aesthetic, Sock? no — ASCII emoticon culture, Emoji dialects'],
  ['Internet Aesthetic', 'Dark internet aesthetics', 'Analog horror visuals, Creepypasta imagery, Cryptid internet aesthetics, Void memes, Cursed images, Weird Facebook deep-fried memes'],
  ['Internet Aesthetic', 'E-girl/boy and alt internet fashion', 'E-girl makeup & fashion, E-boy style, Soft grunge internet, Cyber y2kalt, Grunge revival internet, Doomer imagery'],

  // ===== WEB & UI =====
  ['Web & UI Design', 'Web 1.0 era aesthetics', 'GeoCities personal homepage, 88x31 button culture, Guestbooks & webrings, Under construction GIFs, Table-based layouts, WordArt titles'],
  ['Web & UI Design', 'Web 2.0 era aesthetics', 'Glossy buttons & reflections, Aqua interface, Beta badges, Rounded gradient badges, Bubble 2.0 logos, Skeuomorphic iOS era'],
  ['Web & UI Design', 'Flat and post-flat UI eras', 'Flat design (Metro/Windows 8), Material Design, Neumorphism, Glassmorphism, Claymorphism, Corporate Memphis illustration'],
  ['Web & UI Design', 'Brutalist and experimental web', 'Web brutalism, Anti-design websites, Net art aesthetics, Y2K web revival, Neocities DIY scene, Creative coding visuals'],
  ['Web & UI Design', 'Corporate design system era', 'IBM Carbon, Google Material, Atlassian design systems, SaaS dashboard look, Duolingo-era gamification visuals'],
  ['Web & UI Design', 'Operating system UI eras', 'Windows 95/98, Mac OS Classic platinum, BeOS, Amiga Workbench, Windows XP Luna, Mac OS X Aqua, Ubuntu human era'],
  ['Web & UI Design', 'Game UI and menu design eras', 'PS1 memory card menus, PS2 boot era, Xbox blade dashboard, Wii channel aesthetics, RPG menu design ( JRPG windows), Modern diegetic game UI'],
  ['Web & UI Design', 'Terminal and computing aesthetics', 'Green phosphor terminal, Amber CRT, BBS ASCII culture, Code editor themes (gruvbox, synthwave 84), Unix sysadmin aesthetics, Cyberdeck culture'],

  // ===== GAMES =====
  ['Game & Pixel Aesthetic', 'Pixel art traditions', '8-bit NES era, 16-bit SNES/Genesis era, Isometric pixel art, Modern indie pixel (Celeste era), Pixel art game UI traditions'],
  ['Game & Pixel Aesthetic', 'Console-era 3D aesthetics', 'PS1 low-poly & warping textures, N64 fog & gouraud shading, Dreamcast era, PS2 era realism attempts, Early 360/PS3 era'],
  ['Game & Pixel Aesthetic', 'Game art direction movements', 'Boomer shooter visuals, Immersive sim aesthetics, Cozy game aesthetics (Animal Crossing), Souls-like gothic, Cel-shaded games, Low-poly flat-shaded indie'],
  ['Game & Pixel Aesthetic', 'Trading card and tabletop art', 'MTG art eras (Ice Age to modern), Yu-Gi-Oh card art style, Pokémon art style eras, D&D art evolution, Warhammer miniature art styles'],
  ['Game & Pixel Aesthetic', 'Fantasy and sci-fi game visuals', 'Western RPG visuals (Baldur\'s era), JRPG aesthetics (FF era styles), BioShock deco-dystopia, Fallout atompunk, Deus Ex cyberpunk, Halo-era military sci-fi'],
  ['Game & Pixel Aesthetic', 'Arcade and coin-op aesthetics', 'Cabinet art (80s airbrush), Attract mode aesthetics, Rhythm game visuals (DDR), Fighting game stages 90s, Pinball backglass art'],

  // ===== FILM =====
  ['Film & Cinema', 'Classic film movements', 'German Expressionism, French Impressionist cinema, Soviet Montage, Poetic Realism, Italian Neorealism, Film Noir'],
  ['Film & Cinema', 'New Wave movements worldwide', 'French New Wave, Japanese New Wave, Czech New Wave, New Hollywood, Brazilian Cinema Novo, Iranian New Wave, Hong Kong New Wave'],
  ['Film & Cinema', 'Genre visual languages', 'Spaghetti Western, Giallo, Wuxia, Sword & sandal, Blaxploitation visual culture, Pinky violence, J-horror, K-horror'],
  ['Film & Cinema', 'Horror film visual families', 'Universal monster era, Hammer horror, Folk horror, Slasher 80s, Body horror, Analog horror (film framing), Found footage'],
  ['Film & Cinema', 'Cinematography and color grading styles', 'Technicolor three-strip, CinemaScope era, Bleach bypass, Teal-orange digital era, Film emulation LUTs, Day for night, Eastmancolor'],
  ['Film & Cinema', 'Director-visual languages (established)', 'Symmetrical whimsy (Anderson-associated), Malick-style natural light lyricism? Careful: document as community-recognized visual languages: e.g. "Wes Anderson symmetry" as documented internet framing'],
  ['Film & Cinema', 'Sci-fi cinema design families', 'Used future (Star Wars), White clean future (2001), Cassette futurism (Alien terminals), Cyberpunk rain city (Blade Runner), Analog space (Apollo-era film), Retro-futurism in film'],
  ['Film & Cinema', 'Animation film aesthetics (features)', 'Disney renaissance style, Ghibli-associated warmth (as documented visual language), Don Bluth era, European auteur animation (Tartakovsky? no — use: Michael Dudok de Wit lineage), Laika craft aesthetic'],
  ['Film & Cinema', 'Music video visual eras', 'MTV golden era, Hype Williams fisheye era, 90s hip-hop video luxury, Indie sleaze music video, Digital-era maximalism'],

  // ===== PHOTOGRAPHY =====
  ['Photography', 'Pictorialism to straight photography', 'Pictorialism, Photo-Secession, Straight photography, Group f/64, New Objectivity photography'],
  ['Photography', 'Documentary and street traditions', 'Farm Security Administration documentary, Magnum humanist tradition, New Topographics, Düsseldorf School, Street photography (Cartier-Bresson lineage), Vernacular photography'],
  ['Photography', 'Fashion photography eras', 'Studio glamour 40s-50s, Swinging London 60s, Society/fashion 70s-80s excess, Grunge fashion photography (Corinne Day era), Digital clean era'],
  ['Photography', 'Analog process aesthetics', 'Polaroid instant culture, Lomography, Cross-processing, Expired film culture, Holga/toy camera aesthetic, Cyanotype revival, Tintype revival'],
  ['Photography', 'Contemporary photography looks', 'Direct flash aesthetic, Editorial minimalism, Film-look digital presets, Moody earth-tone presets, Overexposed pastel look'],
  ['Photography', 'Scientific and technical photography', 'Macro/microscopy imaging aesthetics, Astrophotography, Aerial photography traditions, Scientific illustration photography, X-ray & scan aesthetics'],
  ['Photography', 'Amateur and family photo cultures', '90s point-and-shoot flash, Disposable camera culture, Studio family portraits (Asian immigrant studio tradition), Olan Mills style, Vacation slide culture'],

  // ===== ILLUSTRATION & COMICS =====
  ['Illustration & Comics', 'Golden Age illustration traditions', 'Brandywine school, Golden Age storybook illustration, Poster art 1890s-1910s, Pulp magazine illustration, Aviation art, advertisement illustration golden age'],
  ['Illustration & Comics', 'Comics national traditions', 'Bande Dessinée (Franco-Belgian), Ligne claire, American comic book eras (Silver, Bronze), British comics tradition, Manhua, Manga export styles'],
  ['Illustration & Comics', 'Manga visual families', 'Shōjo (70s-90s evolution), Shōnen action style, Gekiga, Iyashikei healing visuals, Shōwa retro manga style, Moe style evolution'],
  ['Illustration & Comics', 'Editorial illustration movements', 'New Yorker tradition, Conceptual editorial (90s-2000s), Op-ed digital era, US illustration regional traditions? use: Texan? no — drop'],
  ['Illustration & Comics', 'Sci-fi and fantasy illustration', 'Airbrush sci-fi (70s-80s covers), Sword & sorcery (Frazetta lineage), Space art (Chesley Bonestell lineage), Fantasy Trading card art, Cyberpunk illustration'],
  ['Illustration & Comics', 'Vector and digital illustration eras', 'Corporate Memphis/Alegria, Flat vector infographic era, Isometric tech illustration, Cute flat stickers culture, Procreate indie style'],
  ['Illustration & Comics', 'Natural history and scientific illustration', 'Audubon tradition, Botanical illustration, Ernst Haeckel Kunstformen, Ornithology plates, Anatomical illustration, Dinosaur art (paleoart) eras'],
  ['Illustration & Comics', 'Cartooning and humor traditions', 'New Yorker cartoon style, British comic strip tradition, MAD magazine style, Gag panel traditions, Webcomic aesthetics (xkcd, homestuck eras)'],

  // ===== ANIMATION =====
  ['Animation & Cartoon', 'Classic cartoon eras', 'Rubber hose animation, Golden age (Warner/Fleischer), UPA Cartoon Modern, TV-era limited animation, Saturday morning era'],
  ['Animation & Cartoon', 'Anime visual eras', '60s astro-boy era cel, 80s OVA shine, 90s cel anime, Early digital anime 2000s, Modern sakuga web-gen, Retro anime revival (vaporwave-adjacent)'],
  ['Animation & Cartoon', 'Craft and stop-motion animation', 'Claymation (Aardman), Czech puppet animation, Papercut animation (Lotte Reiniger lineage), Sand animation, Quay Brothers aesthetic'],
  ['Animation & Cartoon', 'Motion graphics and title design', 'Saul Bass title era, MTV liquid motion 90s, Broadcast design 2000s, Kinetic typography, Modern 3D motion (Squid game titles etc.)'],
  ['Animation & Cartoon', 'Children\'s TV animation styles', 'Nicktoons era, Cartoon Network power era, PBS educational styles, Anime-influenced western TV (Avatar), Indie animated webseries era'],

  // ===== MUSIC & SONIC =====
  ['Music & Sonic Culture', 'Album art and band visual identities', 'Progressive rock gatefold art, Post-punk minimal covers, Metal album art (Pushead lineage), Shoegaze blur covers, Indie collage covers'],
  ['Music & Sonic Culture', 'City pop and Japanese retro', 'City pop visual culture, Shōwa kayō aesthetics, Japanese idle? use: idol culture visuals (80s), Future funk offshoot, Tokyo lounge culture'],
  ['Music & Sonic Culture', 'Electronic dance visual cultures', 'Warehouse party flyers, Trance utopian visuals, Big beat cartoon aggression, EDM festival maximalism, Hyperpop digital maximalism'],
  ['Music & Sonic Culture', 'Jazz era aesthetics', 'Harlem Renaissance visual culture, Blue Note minimal jazz covers, Lounge/exotica 60s, Smooth jazz 80s visual, Bebop hipster culture'],
  ['Music & Sonic Culture', 'Hip-hop visual cultures', 'Golden era 90s hip-hop visuals, Southern trap visual language, Bling era, UK drill visuals, Boom bap nostalgia, 90s street basketball culture'],
  ['Music & Sonic Culture', 'Folk and world music visuals', 'Americana craft visual culture, Afrobeats Lagos visuals, Reggae sound system culture, Balkan brass culture, Flamenco tablao aesthetics, K-pop visual eras'],
  ['Music & Sonic Culture', 'Music equipment object aesthetics', 'Boombox culture, Cassette tape culture, Walkman era, Vinyl revival aesthetics, Modular synth culture, Guitar pedal aesthetics, PA/sound system culture'],
  ['Music & Sonic Culture', 'Classical concert traditions', 'Grand Romantic concert hall aesthetic, Baroque performance practice visuals, Opera staging traditions (Regietheater), Ballet design traditions, Classical album covers (DG yellow)'],

  // ===== LITERATURE =====
  ['Literature & Writing', 'Literary movement aesthetics', 'Romanticism (literary), Decadent movement, Symbolism (literary), Beat Generation, Magical realism, Existentialism book culture, Gothic literature tradition'],
  ['Literature & Writing', 'Pulp and genre fiction visuals', 'Pulp magazine covers (hardboiled, sci-fi), Romance cover art eras, Noir paperbacks, Sword & sorcery covers, Science fiction golden age covers, Gothic romance gothics'],
  ['Literature & Writing', 'Book design traditions', 'Penguin Classics tri-band, Golden Cockerel private press, Modern library bindings, Mass market paperback era, Art book design, Poetry small press'],
  ['Literature & Writing', 'Writing culture aesthetics', 'Typewriter culture, Moleskine journaling culture, Fountain pen culture, Zine poetry culture, Writing retreat aesthetics, Booktok visual culture'],
  ['Literature & Writing', 'Poetry visual traditions', 'Concrete poetry, Visual poetry movements, Verse calligram tradition, Haiga (haiku painting), Spoken word flyer culture'],

  // ===== REGIONAL & CULTURAL =====
  ['Regional & Cultural Tradition', 'Japanese aesthetic concepts', 'Wabi-sabi, Shibui, Iki, Yūgen, Mono no aware, Kanso, Seijaku, Kire (cutting beauty), Mitate'],
  ['Regional & Cultural Tradition', 'Japanese daily life aesthetics', 'Kissaten coffee shops, Sento bathhouses, Konbini visual culture, Depachika food halls, Pachinko parlor aesthetics, Showa apartment life, Danchi aesthetics'],
  ['Regional & Cultural Tradition', 'Chinese visual cultural traditions', 'Ink wash painting, Blue-white porcelain, Cloisonné (jingtailan), Scholar\'s rocks, Chinese knots, Papercutting (jianzhi), Peony & auspicious motif systems'],
  ['Regional & Cultural Tradition', 'Korean visual cultural traditions', 'Dancheong painting, Hanji paper craft, Bojagi wrapping cloth, Mother-of-pearl lacquer (najeon chilgi), Korean temple food presentation'],
  ['Regional & Cultural Tradition', 'Southeast Asian visual traditions', 'Indonesian batik (dup check), Thai temple murals, Khmer silken? use: ikat (Balinese endek), Filipino jeepney art, Vietnamese lacquerware (son mài), Myanmar thanaka & htamein culture'],
  ['Regional & Cultural Tradition', 'South Asian visual culture', 'Indian truck art, Bollywood poster art, Rangoli & kolam, Meenakari enamel, Madhubani (dup check), Rajasthani miniature, Chikankari'],
  ['Regional & Cultural Tradition', 'Middle Eastern and North African visual culture', 'Zellige tilework, Moucharabieh screens, Persian carpet (dup check), Fez pottery, Arabesque metalwork (dup check), Oushak? use: Cairene mashrabiya, Dallah coffee culture'],
  ['Regional & Cultural Tradition', 'West African visual culture', 'Nollywood poster art, Ghanaian kente (dup check), Yoruba adire (dup check), Bogolanfini mudcloth, Asafo flags, Benin bronzes tradition, Fon appliqué'],
  ['Regional & Cultural Tradition', 'East and Horn of Africa traditions', 'Habesha kemis & tilet, Ethiopian church painting, Harari basketry, Somali alol? use: carved wooden headrests, Swahili carved doors'],
  ['Regional & Cultural Tradition', 'Southern African traditions', 'Ndebele house painting, Zulu beadwork (izincu), Basotho blanket culture, San rock art tradition, Shweshwe fabric'],
  ['Regional & Cultural Tradition', 'Latin American popular visual culture', 'Alebrijes, Talavera poblana (dup check), Huichol yarn painting, Molas (Guna), Retablos (Peruvian & Mexican), Lotería imagery, Papel picado'],
  ['Regional & Cultural Tradition', 'Andean and Amazonian traditions', 'Andean textile traditions (Pollera, awayo), Chullo knitting, Ayacucho retablos (dup), Shipibo kené patterns, Tigua painting'],
  ['Regional & Cultural Tradition', 'Caribbean visual culture', 'Junkanoo costumes, Steelpan culture, Trinidad carnival (dup check), Haitian sequin flags (drapo Vodou), Cuban rumba? use: rumba dress traditions, Barbados Crop Over'],
  ['Regional & Cultural Tradition', 'Polynesian and Pacific traditions', 'Tatau (Samoan tattoo), Whakairo (Māori carving), Kapa (Hawaiian barkcloth), Tapa cloth traditions, Lei culture, Tivaevae (Cook Islands quilting)'],
  ['Regional & Cultural Tradition', 'Indigenous North American art traditions', 'Pueblo pottery (San Ildefonso etc.), Northwest Coast formline art, Navajo weaving, Plains quillwork & beadwork, Iroquois raised beadwork, Inupiaq baleen baskets'],
  ['Regional & Cultural Tradition', 'Arctic and Sámi traditions', 'Inuit printmaking (Kinngait), Duodji (Sámi craft), Inuit carving traditions, Greenland tupilaq carving, Sámi gákti dress'],
  ['Regional & Cultural Tradition', 'European folk art traditions', 'Rosemaling, Wycinanki papercutting, Petrykivka painting, Polish Łowicz traditions, Alpine Bauernmalerei, Dala horse culture, Hungarian kalocsá embroidery'],
  ['Regional & Cultural Tradition', 'Mediterranean daily aesthetics', 'Azulejo tile culture, Sicilian cart painting (carretto siciliano), Greek island whitewash & blue, Italian herbal? use: Mediterranean courtyard culture, Portuguese calçada paving'],
  ['Regional & Cultural Tradition', 'Celtic and Insular traditions', 'Insular manuscript art (Book of Kells), Celtic knotwork revival, Tartan & clan culture, Welsh lovespoon tradition, Cornish? use: Irish daily? drop — use: Celtic Revival decorative arts'],
  ['Regional & Cultural Tradition', 'Slavic and Balkan traditions', 'Vyshyvanka culture (dup check), Slavic folk costume traditions, Pisanki egg decorating, Russian lubok prints, Balkan opanci & folk dress, Matryoshka culture'],
  ['Regional & Cultural Tradition', 'Nordic daily life aesthetics', 'Hygge interior culture, Lagom Swedish everyday, Friluftsliv outdoor culture, Nordic folk costume traditions, Finnish design everyday (Marimekko culture)'],
  ['Regional & Cultural Tradition', 'Oceanic and maritime vernacular', 'Luzzu boat eyes (Malta), Cornish? use: Breton maritime culture (marinière), Dutch barge culture, Chesapeake skipjack culture, Pacific fishing village aesthetics'],

  // ===== RELIGIOUS & SACRED =====
  ['Religious & Sacred Art', 'Byzantine and Orthodox traditions', 'Icon painting tradition, Mosaic (Ravenna), Khachkar Armenian cross-stones, Romanian painted monasteries, Russian icon schools, Church fresco programs'],
  ['Religious & Sacred Art', 'Islamic sacred arts', 'Calligraphic art (dup check), Muqarnas vaulting, Mosque lamp traditions, Quran illumination, Mihrab design traditions'],
  ['Religious & Sacred Art', 'Buddhist visual traditions', 'Thangka painting, Zen dry gardens, Sand mandala, Tibetan butter sculpture, Thai Buddha image styles, Japanese temple gardens, Bodhi tree veneration aesthetics'],
  ['Religious & Sacred Art', 'Hindu and South Asian sacred arts', 'Kolam (dup check), Tantric diagrams (yantra), Temple gopuram sculpture programs, Patachitra scrolls, Rangoli (dup check) — dedupe risk OK'],
  ['Religious & Sacred Art', 'Christian liturgical arts', 'Stained glass tradition, Illuminated manuscripts (dup check), Retablo altarpieces, Orthodox? dup, wayside shrines, Lenten veils, Renaissance altarpiece traditions'],
  ['Religious & Sacred Art', 'Jewish visual culture', 'Ketubah illumination, Jewish papercutting, Hanukkiah design traditions, Torah mantle embroidery, Bezalel school'],
  ['Religious & Sacred Art', 'Sacred and ritual spaces', 'Shinto shrine precincts, Cathedral nave light, Zen temple compounds, Mandala architecture (Borobudur), Sacred groves aesthetics, Pilgrimage route cultures (Camino)'],

  // ===== HISTORICAL PERIODS =====
  ['Historical Period Style', 'Ancient aesthetics', 'Egyptian Old Kingdom canonical style, Amarna style, Aegean (Minoan/Mycenaean), Etruscan, Scythian animal style, Han dynasty lacquer aesthetic'],
  ['Historical Period Style', 'Classical and late antiquity', 'Greek classical ideal, Hellenistic baroque, Roman verism? use: Roman imperial style, Late antique mosaics, Romano-Egyptian mummy portraits'],
  ['Historical Period Style', 'Medieval European aesthetics', 'Insular art (dup check), Ottonian, Romanesque (dup check), High Gothic (dup check), International Gothic, medieval manuscript illumination programs'],
  ['Historical Period Style', 'Medieval non-European aesthetics', 'Tang dynasty splendor, Heian court aesthetics, Abbasid golden age, Timbuktu manuscript culture, Khmer Empire arts'],
  ['Historical Period Style', 'Early modern court styles', 'Elizabethan court style, Louis XIV Versailles, Mughal court ateliers (dup check), Safavid court (dup check), Ottoman tulip era, Edo Genroku culture'],
  ['Historical Period Style', '18th-19th century period styles', 'Rococo (dup check), Neoclassical (dup check), Empire, Regency, Biedermeier, Second Empire, Aesthetic Movement (dup check), Arts & Crafts (dup check)'],
  ['Historical Period Style', 'Belle Époque and fin de siècle', 'Belle Époque, Fin de siècle decadence, La Belle Époque poster culture (dup check), Gibson Girl era, Haussmann Paris aesthetics'],
  ['Historical Period Style', 'Interwar design cultures', 'Machine Age, Streamline (dup check), Utility scheme (WWII Britain), Bauhaus (dup check), Weimar culture, Art Deco (dup check)'],
  ['Historical Period Style', 'Postwar optimism aesthetics', 'Atomic Age, Space Age (dup check), Populuxe (dup check), Googie (dup check), Festival of Britain aesthetic, Italian la dolce vita era'],

  // ===== TECHNOLOGY & RETROFUTURISM =====
  ['Technology & Retrofuturism', '-punk speculative families', 'Steampunk, Dieselpunk, Atompunk, Clockpunk, Biopunk, Solarpunk, Cyberpunk (canon), Nanopunk, Steampunk variants (Westpunk? no) — documented ones'],
  ['Technology & Retrofuturism', 'Obscure retrofuturisms', 'Cassette futurism, Formicapunk, Raygun Gothic, Retro-futurism (umbrella), Used future, Jet Age futurism, Exotic retro-futurism (Brazilian/Indian visions)'],
  ['Technology & Retrofuturism', 'Analog technology object aesthetics', 'CRT monitor glow, Tape reel computing, Punch card era, Analog synthesizer aesthetics, CB radio culture, Shortwave radio aesthetics'],
  ['Technology & Retrofuturism', 'Space program design', 'NASA Graphics Standards era, Apollo-era NASA design, Soyuz/Soviet space design, Space Shuttle era, Mission patch design, Retro space toys'],
  ['Technology & Retrofuturism', 'Laboratory and scientific aesthetics', 'Mid-century laboratory design, Medical illustration aesthetics, Chemistry set era, Natural history museum dioramas, Observatory interiors'],
  ['Technology & Retrofuturism', 'Military and aviation design', 'Camo pattern evolution, Cockpit/avionics aesthetics, Aircraft nose art, Naval hull design? use: dazzle camouflage, Military vehicle design eras'],
  ['Technology & Retrofuturism', 'Computing history aesthetics', 'Mainframe room aesthetics, Home computer era (8-bit micros), Dot matrix print culture, Early internet dial-up culture, Hacker aesthetics (documented), Y2K tech futurism'],

  // ===== SCI-FI & FANTASY =====
  ['Science Fiction & Fantasy', 'Fantasy visual families', 'High fantasy (Tolkien lineage), Dark fantasy, Swords & sorcery (dup check), Fairy tale illustration tradition, Sword & planet, Mythpunk (documented label)'],
  ['Science Fiction & Fantasy', 'Science fiction design families', 'Biomechanical (Giger lineage), Used future (dup check), Solarpunk (dup check), Post-apocalyptic wasteland, Clockwork/cogpunk (dup check), Afrofuturism, Indigenous futurism'],
  ['Science Fiction & Fantasy', 'Mythological revival aesthetics', 'Norse revival, Greek Revival (dup check), Arthurian revival, Celtic Revival (dup check), Egyptian Revival (dup check) — dedupe ok'],
  ['Science Fiction & Fantasy', 'Folklore and fairy aesthetics', 'Victorian fairy painting, Kindertoten? no — use: Flower fairies (Cicely Mary Barker) tradition, Folk horror aesthetics, Arthur Rackham lineage, Forest folklore aesthetics'],

  // ===== NATURE =====
  ['Nature & Landscape', 'Landscape mood aesthetics', 'Alpine, Desert (Sonoran), Mossy temperate rainforest, Autumnal deciduous, Prairie grassland, Tundra, Mangrove, Bamboo grove'],
  ['Nature & Landscape', 'Weather and sky aesthetics', 'Storm chasing visuals, Fog & mist, Golden hour, Blue hour, Monsoon, Aurora, Cumulus summer sky, Petrichor mood'],
  ['Nature & Landscape', 'Garden and botanical aesthetics', 'English cottage garden, Japanese stroll garden (dup check), Dutch tulip field, French formal garden, Desert xeriscape, Victorian fernery/orangery, Botanical greenhouse'],
  ['Nature & Landscape', 'Celestial and cosmic aesthetics', 'Star chart cartography, Deep space telescope imagery, Planetarium aesthetics, Celestial art nouveau? use: Zodiac illustration traditions, Cosmic horror sublime'],
  ['Nature & Landscape', 'Ocean and water aesthetics', 'Deep sea bioluminescence, Tidepool, Open ocean blue, River stone & current, Wetland reeds, Coral reef, Lighthouse coastal culture'],

  // ===== MATERIALS =====
  ['Material & Surface', 'Material aesthetics', 'Concrete (béton brut), Chrome, Brushed steel, Velvet, Raw silk, Aged brass patina, Marble (Carrara), Rattan & cane, Terrazzo, Cork'],
  ['Material & Surface', 'Surface finish aesthetics', 'Oxidized/patinated metals, Frosted glass, Mirror polish, Hammered metal, Grain & knot wood, Matte ceramic glaze, Iridescent/anodized finishes'],
  ['Material & Surface', 'Paper and print material aesthetics', 'Letterpress debossing, Risograph texture, Newsprint, Deckled edge, Marbled endpapers, Vellum, Blueprint/Cyanotype paper'],
  ['Material & Surface', 'Digital and synthetic surfaces', 'Holographic foil, Chrome gradients (Y2K), Liquid metal, Glass morphism surfaces (dup check), Plastic sheen 90s, Vaporwave gradient (dup check), Clay render 3D aesthetic'],

  // ===== COLOR & LIGHT =====
  ['Color & Light', 'Color scheme aesthetics', 'Monochrome, Earth tones, Pastel palettes, Neon-on-black, Jewel tones, Sepia, High-contrast B&W, Duotone, Ombré'],
  ['Color & Light', 'Lighting condition aesthetics', 'Chiaroscuro, Candlelight, Fluorescent, Neon signage light, Moonlight, Workshop lamp? use: Tungsten interior, Volumetric light rays, Underwater caustics'],
  ['Color & Light', 'Color in cultural systems', 'Liturgical color traditions, Nail? no — use: Japanese traditional color system, Pantone culture, Color therapy? careful — use: Bauhaus color theory (Itten/Albers), Fauve color freedom'],

  // ===== MOOD =====
  ['Mood & Atmosphere', 'Emotional atmosphere aesthetics', 'Cozy (hygge-adjacent), Melancholic, Ethereal, Eerie, Serene, Romantic, Mysterious, Whimsical, Contemplative, Sublime'],
  ['Mood & Atmosphere', 'Uncanny and liminal moods', 'Liminal space (dup check), Backrooms (dup check), Eerie nostalgia, Empty pool aesthetics, Fog-bound stillness, Abandoned space (urbex)'],
  ['Mood & Atmosphere', 'Playful and maximal moods', 'Kitsch, Camp, Maximalism, Whimsigoth, More-is-more clutter, Toy-like joy, Surreal playfulness'],
  ['Mood & Atmosphere', 'Elegance archetypes', 'Opulence, Understated luxury, Refined minimalism, Decadence, Aristocratic restraint? use: Quiet luxury (dup check), Postmodern elegance'],

  // ===== FOOD & HOSPITALITY =====
  ['Food & Hospitality', 'Culinary presentation aesthetics', 'Kaiseki, Smörgåsbord, Meze spread, Afternoon tea, Bento, Nouvelle cuisine plating, Rustic farmhouse table, Tasting menu minimalism'],
  ['Food & Hospitality', 'Café and bar design cultures', 'Speakeasy revival, Third-wave coffee minimalism, Tiki bar, Irish pub, Standing bar (Spain), Kissaten (dup check), Wine bar culture, Cocktail lounge mid-century'],
  ['Food & Hospitality', 'Market and street food visuals', 'Wet market aesthetics, Food cart culture (NYC, Bangkok), Night market (Taiwan), Farmers market, De Correct? no — use: Street food stall signage (Asia)'],

  // ===== PERFORMANCE & FESTIVAL =====
  ['Performance & Festival', 'Stage and theatre design eras', 'Proscenium grand drape era, Expressionist stagecraft, Minimalist stage design, Immersive theatre aesthetics, Kabuki stage conventions, West End/Broadway spectacle'],
  ['Performance & Festival', 'Circus and spectacle traditions', 'Classic circus (ring & big top), Cirque nouveau aesthetics, Sideshow & freak show (historical framing), Vaudeville, Peking opera visual conventions, Carnival midway'],
  ['Performance & Festival', 'Dance forms\' visual cultures', 'Ballet (Romantic tutu era, Soviet school), Flamenco, Kathakali, Hula (documented contexts), Breaking culture (dup check), Ballroom (dup check), Folk dance costume traditions'],
  ['Performance & Festival', 'Festival and celebration aesthetics', 'Matsuri, Day of the Dead (Día de Muertos) visual culture, Songkran, Holi color festival, Christmas market, Fourth of July Americana, Lunar New Year visual culture'],

  // ===== SPORTS & LEISURE =====
  ['Sports & Leisure', 'Sports visual cultures', 'Cycling heritage (wool jerseys), Sumo stable aesthetics, Tennis club culture, Boxing gym aesthetics, Bowling alley retro, Pool hall culture, Golf heritage'],
  ['Sports & Leisure', 'Tabletop and hobby cultures', 'Warhammer miniature painting, D&D table culture, Board game café aesthetics, Model railway cultures, Scale modeling (Tamiya culture)'],
  ['Sports & Leisure', 'Toy and collectible aesthetics', 'Designer vinyl toys, Gashapon culture, Kewpie dolls, Tin robots, Model kit box art, Funko-era collectible homogenization, Plush culture'],

  // ===== TRANSPORT =====
  ['Transport & Machinery', 'Railway design cultures', 'Orient Express luxury, Shinkansen design culture, British Rail corporate era, Steam locomotive romance, Metro design systems (Moscow, Paris), Heritage railway'],
  ['Transport & Machinery', 'Aviation design eras', 'Golden age airliveries (70s psych), Prop era airlines, Concorde era, Military aviation heritage, Space tourism? careful — use: Private aviation aesthetics'],
  ['Transport & Machinery', 'Maritime design cultures', 'Ocean liner grandeur (Queen Mary era), Junk rig aesthetics, Venice gondola craft, Canal barge culture, Naval signal flag culture'],
  ['Transport & Machinery', 'Cycling and micromobility', 'Dutch city cycling culture, Vintage road racing (Fausto Coppi era), BMX (dup check), Cargo bike culture, Fixed gear messenger culture, Moped culture (Mods)'],

  // ===== MICRO-AESTHETICS =====
  ['Micro-aesthetic', 'Obscure documented micro-aesthetics A', 'Lesser-known documented styles: Dark naturalism, Royalcore, Princesscore, Forestpunk, Dreamy academia, Cottagewave, Hedgecore, Mythic naturalism'],
  ['Micro-aesthetic', 'Obscure documented micro-aesthetics B', 'Seapunk, Witch house visuals, Chiptune aesthetics, Nintendocore visuals, Doomer chic, Vaporwave-adjacent micro-labels, Stone-washed 90s revival labels'],
  ['Micro-aesthetic', 'Obscure documented micro-aesthetics C', 'Monochromatic niche labels: All-white gallery aesthetic, Officecore, Liminal office, Waiting room aesthetics, Elevator music lounge, Vintage infomercial look'],
  ['Micro-aesthetic', 'Sensory and material micro-aesthetics', 'Squishy/sensory toys aesthetics, Slime culture, Kinetic sand visuals, ASMR visual languages, Soap cutting videos aesthetics, Paint mixing visuals'],

  // ===== HYBRIDS =====
  ['Hybrid & Experimental', 'Documented hybrid styles', 'Japandi, Witch house (music-visual hybrid), Folk horror revival aesthetics, Lumerian? no; use: documented community hybrids: Yume kawaii crossover, Industrial organic fusion, Neo-vernacular revivals'],
  ['Hybrid & Experimental', 'East-meets-west documented fusions', 'Japonisme, Chinoiserie, Indo-Saracenic (dup check), Orientalism (critical framing), Euro-Asian food visual cultures, Zen-infused western design (documented)'],
  ['Hybrid & Experimental', 'Documented revival movements', 'Mid-century revival, Y2K revival (dup), Cottagecore-revival of? use: Victorian revival, Craft beer neo-vernacular, Vinyl revival, Analog photography revival (dup check), Neo-Brutalism (web)'],
]

export const CATEGORIES = [...new Set(DOMAIN_BATCHES.map((d) => d[0]))].sort()
