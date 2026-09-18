/**
 * Patch 14-i — culturalContext backfill for 60 EXISTING verified entries (manifest-14i.json).
 * Task 14-i. These entries already carry visualDNA/typography/sources; only ctx (cultural
 * context prose, 150-500 chars) is supplied here. Contract: { slug, ctx }.
 * Slugs and order follow the manifest exactly. No DB writes performed by this file.
 */
export const PATCHES: any[] = [
  {
    slug: "prairie-school",
    ctx: "Developed in Chicago and its Oak Park suburbs around 1900 by Frank Lloyd Wright, William Gray Purcell, George Elmslie and Walter Burley Griffin out of Louis Sullivan's Chicago office practice. Its long horizontals answered the flat Illinois prairie and a democratic middle-class ideal of home; Wright's 1901 Ladies' Home Journal plans ('A Home in a Prairie Town') spread the model nationally, while commissions from Midwest merchants kept the studios busy into the 1910s.",
  },
  {
    slug: "forbidden-city-architecture",
    ctx: "Built 1406-1420 on Emperor Yongle's order in Beijing by a huge conscripted workforce under master carpenter Kuai Xiang, on the site of Kublai Khan's Yuan palaces. Nanmu timber was rafted from Sichuan forests, glazed tiles fired near the capital, 'golden bricks' kilned in Suzhou. Home to 24 Ming and Qing emperors, its axial halls, vermilion walls and yellow roofs encoded cosmic hierarchy; the compound stayed closed to commoners until it opened as the Palace Museum in 1925.",
  },
  {
    slug: "analytic-cubism",
    ctx: "Forged in Paris 1908-1912 when Picasso, working at the Bateau-Lavoir, and Braque, back from L'Estaque, reduced scenes to near-monochrome faceted planes. Matisse's quip to a 1908 Salon jury that everything was 'little cubes' named the tendency. Fed by Cezanne's 1907 memorial retrospective and African masks, the two traded coded canvases like climbers roped together until dealer Daniel-Henry Kahnweiler bought their output almost exclusively into a market still hostile to the new style.",
  },
  {
    slug: "golden-age-of-illustration",
    ctx: "Powered by the American magazine boom, photomechanical reproduction and a mass reading public, roughly the 1880s-1920s. Howard Pyle taught at Wilmington and Chadds Ford from 1900, training N.C. Wyeth, Violet Oakley and Maxfield Parrish for Harper's, Scribner's and The Saturday Evening Post, while in Britain Randolph Caldecott and Aubrey Beardsley shaped book and periodical art. Star illustrators like J.C. Leyendecker could move a magazine's sales with a single cover.",
  },
  {
    slug: "high-gothic",
    ctx: "The mature Gothic of Ile-de-France, c. 1194-1230, launched by the rebuilding of Chartres cathedral after the 1194 fire and carried to Bourges, Reims and Amiens (begun 1220 under Robert de Luzarches). Bishops and chapters financed unprecedented vault heights through relic cults and pilgrimage traffic; walls dissolved into glass as Marian devotion, Capetian royal power and the engineering inheritance of Suger's Saint-Denis converged. Amiens' 42-meter nave set the exported proportional canon.",
  },
  {
    slug: "palladianism",
    ctx: "Andrea Palladio, a Vicenza stonemason turned architect, built villas for Venetian Republic patricians in the 1550s-60s (the Villa Rotonda, c. 1567) and codified them in I quattro libri dell'architettura (1570). Inigo Jones imported the style to the Stuart court (Queen's House, Greenwich, 1616-35); Lord Burlington, Colen Campbell and Georgian pattern books spread it across Britain and its colonies, and Thomas Jefferson's Monticello made it the architectural language of the American republic.",
  },
  {
    slug: "roman-baroque",
    ctx: "Rome's Counter-Reformation popes - Urban VIII (Barberini), Innocent X (Pamphili), Alexander VII (Chigi) - hired Bernini and Borromini to turn the city into a theater for Jubilee pilgrims. Bernini's Baldacchino (1624-33) and St. Peter's colonnade (1656-67) staged papal majesty; Borromini's San Carlo alle Quattro Fontane (1638-41) dissolved architecture into undulating geometry. The two masters' rivalry shaped a theatrical urbanism imitated across Catholic Europe.",
  },
  {
    slug: "neoclassical",
    ctx: "Born in Rome in the 1750s as Grand Tour artists reacted against Rococo, fed by the excavations of Pompeii and Herculaneum (from 1748) and Winckelmann's writings on Greek 'noble simplicity'. Soufflot's Pantheon (1758-90), Robert Adam's interiors, Piranesi's engravings and Schinkel's Berlin made antique form the language of Enlightenment reform and new republics: Jefferson modeled the Virginia State Capitol on the Maison Carree, and Latrobe's US Capitol institutionalized the style in Washington.",
  },
  {
    slug: "american-craftsman",
    ctx: "Carried to America by Gustav Stickley, whose The Craftsman magazine (1901-16) and Syracuse workshops translated Ruskin and Morris into a practical style for the middle class. In Pasadena, Charles and Henry Greene built Japanese-inflected timber houses like the Gamble House (1908-09), while the Roycrofters of East Aurora and countless plan-book publishers sold homes with built-in furniture as an ethical alternative to factory-made Victorian clutter.",
  },
  {
    slug: "bungalow-craftsman",
    ctx: "The 'bangla' house type of Bengal reached America via British colonial veranda houses and California's Arts and Crafts scene, peaking 1905-1930. Streetcar suburbs of Los Angeles, Pasadena and Seattle filled with one-and-a-half-story homes with deep porches and built-in cabinetry, sold through plan books, women's magazines and Sears, Roebuck kit homes. Affordability made the bungalow the first truly mass middle-class house type on the Pacific Coast.",
  },
  {
    slug: "queen-anne-victorian",
    ctx: "Named loosely for early 18th-century England, the style was actually launched in 1870s London by Richard Norman Shaw's red-brick, white-trimmed houses for the new professional class. Exported to America, it was taken up by firms such as McKim, Mead and White and multiplied through millwork catalogs into asymmetrical, towered, veranda-wrapped houses. San Francisco's rebuilding after the 1906 earthquake produced the rowhouse 'Painted Ladies', fixing it as the signature of the Victorian suburb.",
  },
  {
    slug: "basilica-plan",
    ctx: "Romans used the aisled, apsed basilica as law court and exchange - Trajan's Basilica Ulpia (c. 112) was the grandest. After Constantine's toleration of Christianity (313) the type was adopted for church assembly: Old St. Peter's (c. 320s) established the formula of entrance court, nave, side aisles and apse altar. The plan suited processional liturgy and big congregations, and it remained the default church layout of the Latin West from Ravenna through Romanesque parish churches.",
  },
  {
    slug: "victorian-interior",
    ctx: "British industrial wealth put machine-made carpets, wallpapers and furniture within reach of a vast new middle class, and parlors filled with layered pattern, heavy drapery and eclecticism - Gothic, Turkish and Louis XIV at once. Reformers from A.W.N. Pugin to William Morris attacked the excess while themselves supplying taste through Morris and Co.'s wallpapers; gas lighting darkened palettes further. The parlor stood as a moral showcase of respectability, later mocked as respectable clutter.",
  },
  {
    slug: "new-american-farmhouse",
    ctx: "A 2010s-2020s American interior look popularized by Chip and Joanna Gaines' HGTV show Fixer Upper (2013-18), filmed in Waco, Texas, and amplified by Pinterest, Instagram and the Magnolia retail brand. Shiplap walls, apron-front sinks, barn doors and matte black hardware met open plans and stainless appliances, selling rural nostalgia to suburban buyers. It became the defining mass-market style of the pandemic-era housing boom despite design-world complaints about its formula.",
  },
  {
    slug: "parisian-cafe",
    ctx: "Since Cafe Procope opened in 1686 - the haunt of Voltaire and Diderot - the Paris cafe has doubled as salon, office and political club. Haussmann's new boulevards (1850s-70s) gave it the sidewalk terrace; zinc bar tops and mirrored walls standardized the interior. After World War I the Saint-Germain-des-Pres institutions Cafe de Flore and Les Deux Magots housed Sartre, Beauvoir and Picasso. The cafe remains an everyday institution where one coffee rents a table for hours.",
  },
  {
    slug: "asian-electronics-design",
    ctx: "Postwar Japanese firms built a design culture around compactness and user intimacy: Sony's 1979 Walkman turned personal technology into a lifestyle object, later theorized by Kenya Hara and Naoto Fukasawa at Muji, whose anonymous 'supernormal' products drew on Zen restraint and the notion of ma. South Korea's Samsung, pushed toward design-led quality by the 1993 Frankfurt Declaration, and China's Xiaomi carried the minimalist hardware language across the region into a global standard.",
  },
  {
    slug: "scandinavian-design",
    ctx: "Forged around the interwar welfare-state idea that beautiful everyday objects belong to everyone - the 1930 Stockholm Exhibition and Aalto's Paimio Sanatorium furniture gave it a program. The 'Design in Scandinavia' touring exhibition (1954-57) and Milan Triennale prizes made Arne Jacobsen, Hans Wegner and Tapio Wirkkala international names, while IKEA (founded 1943 by Ingvar Kamprad in Almhult) democratized the look globally: light birch, honest joinery, egalitarian comfort.",
  },
  {
    slug: "cyberpunk",
    ctx: "Coalesced in the early 1980s around Bruce Sterling and William Gibson: Neuromancer (1984) swept the Hugo, Nebula and Philip K. Dick awards and coined 'cyberspace', while Blade Runner (1982) supplied the rain-slick neon megacity look, partly borrowed from Hong Kong's Kowloon Walled City. Writers of Sterling's Mirrorshades anthology (1986) fused punk street attitude with corporate paranoia; fanzines, RPGs and game studios spread the style as a critique of Reagan-era technology.",
  },
  {
    slug: "pre-raphaelites",
    ctx: "Founded in September 1848 in London by John Everett Millais, William Holman Hunt and Dante Gabriel Rossetti, students barely twenty at the Royal Academy Schools. They signed canvases 'PRB' from the 1849 exhibitions, provoked press outrage, and were defended in letters to The Times by John Ruskin in 1851. Rejecting post-Raphael academic formula, they painted medieval legend, Shakespeare and Keats with jewel-colored literalism, catalyzing Victorian medievalism and the Arts and Crafts movement.",
  },
  {
    slug: "fauvism",
    ctx: "Named when critic Louis Vauxcelles saw Andre Derain and Maurice de Vlaminck's canvases beside a Renaissance-style bust at the 1905 Salon d'Automne - 'Donatello chez les fauves'. Matisse and Derain had spent the summer of 1905 painting Collioure in unmixed color after absorbing Signac's Divisionism; Paris dealers Ambroise Vollard and Daniel-Henry Kahnweiler bought the work within two years, and by 1908 most of the Fauves had already moved on to calmer experiments.",
  },
  {
    slug: "synthetic-cubism",
    ctx: "From 1912 Picasso and Braque stopped analyzing space and began building it: Braque's first papier colle (May 1912) pasted real wood-grain wallpaper into a drawing, and newspapers, sheet music and stenciled letters entered the picture as flat signs. Juan Gris systematized the method; Picasso's sheet-metal Guitar (1912) carried it into construction. Collage collapsed the border between high art and everyday printed matter and handed Dada, Constructivism and modern graphic design its basic grammar.",
  },
  {
    slug: "conceptual-art",
    ctx: "Took shape 1966-72 as artists dematerialized the object: Sol LeWitt's 'Paragraphs on Conceptual Art' (Artforum, 1967) declared the idea the machine of the work, while Joseph Kosuth's One and Three Chairs (1965), Lawrence Weiner's Statements (1968) and Seth Siegelaub's Xerox Book (1968) turned language and documentation into media. Reacting against Greenbergian formalism and painting's commodity status, it flowed out of Fluxus and Happenings and rewired art schools, museums and markets worldwide.",
  },
  {
    slug: "literati-painting",
    ctx: "The wenrenhua tradition of scholar-official amateurs - Su Shi, Mi Fu and their Song circle - rejected court polish for ink monochrome and calligraphic brushwork, painting bamboo, orchids and misted mountains as moral self-portraits. Colophons and collector seals made each scroll a social document passed among friends. Yuan loyalists Ni Zan and Huang Gongwang turned retirement into style, and Dong Qichang's late-Ming theory canonized the lineage that defines Chinese ink painting.",
  },
  {
    slug: "progressive-artists-group",
    ctx: "Founded in Bombay weeks after Independence in August 1947 by F.N. Souza, K.H. Ara, S.H. Raza and M.F. Husain, showing at the Bombay Art Society Salon in 1948. Rejecting both Bengal School nationalism and the Salon's conservatism, the group welded European modernism - Picasso, Cubism, Expressionism - to Indian street life and myth; Akbar Padamsee and Tyeb Mehta followed its path to international biennales and made Bombay the capital of modern Indian art.",
  },
  {
    slug: "harlem-renaissance",
    ctx: "Flowed from the Great Migration that filled Harlem with Southern Black families and the Caribbean diaspora in the 1910s-20s. Alain Locke's The New Negro (1925) supplied the manifesto; the NAACP's Crisis and the Urban League's Opportunity ran prizes; the 135th Street NYPL branch with Arturo Schomburg's collection and Charles Alston's 306 West 141st Street studio anchored the arts, where Aaron Douglas, James Van Der Zee and Augusta Savage worked, supported by patrons like Charlotte Mason.",
  },
  {
    slug: "arabesque",
    ctx: "Islamic ornament was codified early: ninth-century Abbasid Samarra produced beveled stucco styles that spread west, and Ottoman ateliers refined scrolling vines into infinite interlace. Beside calligraphy, in an aesthetic wary of figural imagery, its endless repetition was read as a sign of divine infinity - fixed on the Alhambra's stuccoes, Persian carpets and Iznik tiles. Raphael's Vatican Loggia (1519) imitations fed a European 'arabesque' fashion in prints and wallpaper.",
  },
  {
    slug: "hyperrealism",
    ctx: "Emerged in the early 2000s as an intensification of 1970s Photorealism (the term New York's Louis K. Meisel Gallery coined in 1969): artists used photography as raw material to fabricate a reality more saturated than the camera's. Ron Mueck's sculptures (Dead Dad, in the Royal Academy's 1997 Sensation exhibition) and the figures of Carole Feuerman and Evan Penny pushed illusionism into the round, and European galleries and biennales made the genre a global fairground spectacle.",
  },
  {
    slug: "early-gothic",
    ctx: "Began when Abbot Suger rebuilt the choir of the royal abbey of Saint-Denis (consecrated 1144) with rib vaults and stained glass meant to lift the mind toward light. Sens, Noyon and Laon followed, and Notre-Dame de Paris (begun 1163 under Bishop Maurice de Sully) scaled the system up. Within the Capetian royal domain, six-part ribbed vaults, pointed arches and early flying buttresses made cathedrals monuments of the king's Paris; the vocabulary spread from England to Spain within a generation.",
  },
  {
    slug: "pisan-romanesque",
    ctx: "Pisa's maritime republic built the Piazza dei Miracoli in banded grey and white marble: the Duomo begun 1064 by Buscheto, partly funded with Palermo war spoils; the circular Baptistery from 1153; and the campanile from 1173 (Bonanno Pisano) whose settling soil made it the Leaning Tower. Bichrome striping, blind arcading and inlaid bacini ceramic bowls - an Islamic Mediterranean borrowing - defined the style, exported across coastal Tuscany as Pisan naval power peaked.",
  },
  {
    slug: "french-baroque",
    ctx: "Under Louis XIV, French classicism absorbed the Italian Baroque and disciplined it: Le Vau, Le Brun and Le Notre's Vaux-le-Vicomte (1656-61) so outshone the king's chateaux that Finance Minister Fouquet was arrested and the team conscripted for Versailles from 1661 - Hardouin-Mansart's Galerie des Glaces (1678-84) turned display into state doctrine. The Academie royale d'architecture (1671) and Gobelins workshops theorized and manufactured a grandeur serving absolutist image-making.",
  },
  {
    slug: "gothic-revival",
    ctx: "Began as antiquarian fancy - Horace Walpole's Strawberry Hill (from 1749), Beckford's Fonthill Abbey - and became a moral crusade with A.W.N. Pugin, whose Contrasts (1836) blamed classicism for modern ills and who designed the Houses of Parliament interiors after the 1835 fire. The Cambridge Camden Society (1839) policed church design, and Ruskin's Stones of Venice (1851-53) made Gothic the ideal of honest craft. Parliament became a monument of Victorian identity carried across the empire.",
  },
  {
    slug: "colonial-revival",
    ctx: "Nostalgia for colonial America peaked at Philadelphia's 1876 Centennial Exhibition; McKim, Mead and White's H.A.C. Taylor house in Newport (1882-86) was the landmark. Colonial Williamsburg's reconstruction (Rockefeller-funded from 1926) turned the style into national pedagogy, with the DAR (founded 1890) and antiquarians like Wallace Nutting supplying reproduction furniture. As immigration surged, white columns and symmetry served old-stock self-definition - the default 'historic' American look.",
  },
  {
    slug: "organic-architecture",
    ctx: "Articulated by Frank Lloyd Wright out of Louis Sullivan's 'form follows function' inheritance: buildings should grow from site, materials and client life. Wright's Taliesin and Fallingwater (1935-37, for Pittsburgh merchant Edgar Kaufmann, cantilevered over a Bear Run waterfall) were its stone manifesto, and his Usonian houses proposed affordable site-born homes for democratic America. Heirs from Alvar Aalto to Bruce Goff carried site-specific building toward today's sustainable mainstream.",
  },
  {
    slug: "googie",
    ctx: "Named after Googie's coffee shop on the Sunset Strip (1949, designed by John Lautner) once Douglas Haskell's 1952 House and Home essay attacked it. Serving car culture, firms like Armet and Davis gave Los Angeles its Denny's and Norms restaurants (1957), with upswept roofs, boomerangs and starbursts readable at forty miles per hour; programmatic buildings like the Tail o' the Pup pushed it further. Demolished wholesale by the 1970s, it became a Los Angeles Conservancy preservation cause.",
  },
  {
    slug: "sustainable-green-architecture",
    ctx: "Crystallized from the 1973 oil-crisis passive-solar movement, the Brundtland Report's 1987 definition of sustainability and the Rio Earth Summit (1992). Britain's BREEAM (1990) was the first rating method; the US Green Building Council launched LEED in 2000, making certification a developer currency. Foster's Swiss Re 'Gherkin' (2004) and Renzo Piano's California Academy of Sciences (2008) showcased the aesthetic, and Cradle to Cradle (2002) reframed materials as nutrient cycles.",
  },
  {
    slug: "dravidian-temple",
    ctx: "South India's temple architecture matured under the Pallavas, whose Mahabalipuram Shore Temple (c. 700-728) fixed the stone vimana, and the Cholas, under whom Rajaraja I completed the Brihadisvara at Thanjavur (1010) with a 66-meter granite tower. Later Nayak dynasties at Madurai raised ever-taller gopurams as city gates, and temples grew into tax-rich economic cities administering land, banking and festivals, with Agamic ritual dictating plan, orientation and iconography of every elevation.",
  },
  {
    slug: "inca-ashlar-masonry",
    ctx: "Inca masons fitted irregular polygonal blocks - some over 100 tons, dragged from quarries like those of Ollantaytambo - without mortar, using earthen ramps, stone hammers and abrasion by thousands of mit'a corvee laborers. The walls of the Qorikancha sun temple, the Sacsayhuaman fortress and Machu Picchu (c. 1450) resisted Andean earthquakes so well that Spanish colonials built churches directly on Inca foundations: after the 1650 quake, colonial Cusco's rubble fell while Inca courses stood.",
  },
  {
    slug: "spanish-colonial-architecture",
    ctx: "Spread through the Americas and the Philippines under Philip II's Laws of the Indies (1573), mandating the grid town around a plaza mayor. Missions from Junipero Serra's San Diego de Alcala (1769) up the California chain fused adobe, tile and fortress walls; in Mexico, indigenous masons transformed imported Baroque into the ultrabarroco of Santa Prisca at Taxco (1758) and Zacatecas Cathedral. The Manila galleon carried the style across the Pacific - the first transoceanic colonial architecture.",
  },
  {
    slug: "mosque-typology",
    ctx: "Begun with the Prophet's courtyard house in Medina (622), the mosque crystallized as a hypostyle hall with qibla wall, mihrab and minbar; Damascus's Umayyad Great Mosque (715) fixed the imperial formula. Seljuk Persia added the four-iwan court, and Ottoman architects, climaxing with Sinan's Suleymaniye (1557), developed the central-dome type. Minarets, ablution courts and waqf endowments varied from Mali to Java, making the mosque the world's most widely distributed building type.",
  },
  {
    slug: "georgian-interior",
    ctx: "Under the Hanoverian kings (1714-1830), Palladian proportions, sash windows and paneled walls ordered rooms for Britain's merchant ascendency. Kent's Holkham Hall (from 1734) set the antique tone; Robert Adam's interiors at Syon House and Osterley (1760s-70s) broke it into delicate color and stucco, matched by Chippendale's Director (1754) and Hepplewhite and Sheraton cabinet books. Grand Tour marbles and hierarchical room sequences made the Georgian interior the model for Federal America.",
  },
  {
    slug: "quiet-luxury-interiors",
    ctx: "The interiors analogue of 'stealth wealth' fashion: no logos, but unmistakable cost. Antwerp dealer Axel Vervoordt's wabi-sabi rooms (including his 2013 apartment for Kanye West) and Vincent Van Duysen's tactile Belgian minimalism supplied the vocabulary - lime plaster, boucle, travertine, hidden technology. TV's Succession (2018-23) made the look shorthand for billionaire taste, and pandemic-era clients pushed it to the dominant high-end residential brief.",
  },
  {
    slug: "american-diner",
    ctx: "Started when Walter Scott's night lunch wagon began serving Providence newspaper workers in 1872; wagon builders like the Worcester Lunch Car Company (1906-57) and Jerry O'Mahony industrialized the type, and the 1930s streamlined stainless diner - prefabricated and shipped whole - met the new highways. For shift workers, travelers and teenagers it offered coffee, pie and 24-hour refuge on Route 66 and Main Street; postwar chrome diners became roadside icons, then preservation causes.",
  },
  {
    slug: "scandinavian-hygge",
    ctx: "Hygge - a Danish and Norwegian word in use since the eighteenth century - names a national practice of candles, coffee, wool and togetherness against dark winters. Meik Wiking's Happiness Research Institute in Copenhagen globalized it with The Little Book of Hygge (2016), sparking a book-and-goods boom in which Danish candle-burning statistics became trivia. Retailers from HAY to IKEA styling translated the ethos into the warm-minimal wood-and-wool interior that anchors Nordic brand identity.",
  },
  {
    slug: "thonet-bentwood",
    ctx: "Cabinetmaker Michael Thonet perfected steam-bending solid beech in Vienna after leaving Boppard on the Rhine; his Gebruder Thonet firm's Chair No. 14 (1859) needed only six parts, thirty screws and ten nuts, shipping 36 chairs packed into a cubic meter. A gold medal at the 1867 Paris World's Fair made the 'coffeehouse chair' the seat of Viennese cafe culture, over 50 million were sold by 1930, and Le Corbusier praised it as an ancestor of machine-age design.",
  },
  {
    slug: "tiffany-lamps",
    ctx: "Louis Comfort Tiffany's New York studios patented Favrile glass (1894) and, with the electrification of American homes, cast light as jewelry: leaded shades like the Wisteria (c. 1902) imitated garden flora in layered opalescent glass. Much of the design came from Clara Driscoll, head of the Women's Glass Cutting Department, whose letters published in the 2000s revealed her authorship. Tiffany's 1893 Columbian Exposition chapel spread the fame, and the Morse Museum now holds the collection.",
  },
  {
    slug: "industrial-pendant-lighting",
    ctx: "Descends from factory high-bays: after Edison's 1879 lamp and the Pearl Street Station (1882), workshops hung enameled Benjamin shades, wire cages and porcelain sockets on long pendants to light machines. Artists colonizing SoHo's cast-iron lofts in the 1960s-70s kept the fixtures as found poetry, and the 2000s gastro-pub and third-wave coffee build-out turned salvaged factory lighting into a retail idiom - Edison bulbs, pulley cords, cage guards - mass-produced for every loft-styled home.",
  },
  {
    slug: "lunar-new-year-visual-traditions",
    ctx: "Rooted in the lunisolar calendar's springtide renewal: Song-era households hung peach-wood charms that became red chunlian couplets, and legend made Tang emperor Taizong's generals Qin Shubao and Yuchi Gong the door gods. Song-era gunpowder firecrackers scared off the Nian beast; elders gave yasuiqian coins in red, evolving into hongbao. Yuanxiao lantern festival closes the season, and emigration carried the red-and-gold code to Chinatowns from San Francisco to Yokohama, beside Tet and Seollal.",
  },
  {
    slug: "mid-century-modern",
    ctx: "Postwar optimism plus new materials: Charles and Ray Eames's molded-plywood work led to their LCW chairs and, with Eero Saarinen, the MoMA 'Organic Design' competition (1940); George Nelson directed design at Herman Miller from 1945 alongside Florence Knoll's office. Arts and Architecture's Case Study Houses (1945-66) built the indoor-outdoor Los Angeles dream Julius Shulman photographed, Eichler tracts mass-marketed it, and IKEA's catalogs cemented the style as the century's domestic shorthand.",
  },
  {
    slug: "vaporwave",
    ctx: "Born on the internet 2010-12: Daniel Lopatin's Chuck Person's Eccojams Vol. 1 (2010) and Vektroid's Floral Shoppe as Macintosh Plus (2011) chopped and slowed 1980s tracks on Bandcamp while Tumblr codified the look - Greek statues, Windows 95, katakana, dead malls, checkerboard floors. Part nostalgia, part satire of consumer capitalism's elevator music, it seeded mallsoft and future funk and remains a touchstone of internet-native aesthetics.",
  },
  {
    slug: "cottagecore",
    ctx: "Grew from Tumblr's 2018 tag, after 'grandmacore' and 'goblincore', romanticizing baking, gardening, linen dresses and Beatrix Potter pastoral fantasy. COVID-19 lockdowns of 2020 detonated it on TikTok and Pinterest - sourdough, indoor gardens, A-frame rentals - as urban users escaped to a countryside imagined through Anne of Green Gables and The Great British Bake Off. Critics read it as both queer escapism and settler nostalgia; commercialization followed fast.",
  },
  {
    slug: "bauhaus",
    ctx: "Walter Gropius merged the Weimar academies of fine art and craft into the Staatliches Bauhaus in 1919; Johannes Itten's Vorkurs taught material intuition, rationalized by Moholy-Nagy. The Dessau building (1926), Marcel Breuer's tubular-steel Wassily chair (1925-26) and Wagenfeld's lamp (1923-24) defined functional beauty for industry. Nazi pressure closed the school; Mies van der Rohe ran the Berlin remnant until 1933, and Moholy's New Bauhaus (Chicago, 1937) carried the pedagogy to America.",
  },
  {
    slug: "y2k-fashion",
    ctx: "The millennium turn's pop wardrobe: low-rise jeans tracing back to Alexander McQueen's 'bumster' trousers (1996), velour Juicy Couture tracksuits worn by Paris Hilton and Britney Spears, butterfly clips, Von Dutch trucker caps and metallics broadcast on MTV's TRL (1998-2003) and the Spice Girls' Union Jack dress at the 1997 Brit Awards. Tech optimism - the Nokia 3310, the Y2K bug scare - shaped its chrome shine, and TikTok's 2020s revival turned Y2K thrift into a global resale economy.",
  },
  {
    slug: "dark-academia",
    ctx: "Took its name on Tumblr around 2014, building from Donna Tartt's The Secret History (1992) and Dead Poets Society (1989): tweed, Latin, candlelit libraries and Collegiate Gothic quadrangles shot through with Byronic melancholy. The COVID-19 lockdown of 2020 detonated it on TikTok, where students filmed study-with-me videos in blazers against Oxford and Ivy iconography; fashion houses and online 'classical learning' channels commercialized the mood into the decade's dominant scholarly aesthetic.",
  },
  {
    slug: "gothic-architecture",
    ctx: "Began in the Capetian royal domain: Abbot Suger's Saint-Denis choir (1144) and Notre-Dame de Paris (begun 1163) fused pointed arches, rib vaults and flying buttresses to dissolve wall into stained glass. Chartres (after 1194), Amiens (1220) and Beauvais's ill-fated 48.5-meter choir pushed toward light and height, as Marian pilgrimage and scholastic order - Erwin Panofsky argued in 1951 - shaped space. Masons' lodges carried the system across Europe within decades.",
  },
  {
    slug: "punk-fashion",
    ctx: "Forged on two coasts: Richard Hell's torn shirts and spiked hair at CBGB (1975) invented the look, while Vivienne Westwood and Malcolm McLaren's 430 King's Road shop SEX (1974) sold bondage trousers and safety-pinned clothing to the circle McLaren managed as the Sex Pistols. Sid Vicious's padlock necklace and Mark Perry's photocopied Sniffin' Glue zine made DIY destruction a political uniform - anti-fashion for a generation with no stake in 1970s Britain's stalled economy.",
  },
  {
    slug: "synthwave",
    ctx: "Started as French internet nostalgia: Kavinsky's '1986' (2006) and David Grellier's College project, riding the Justice boom (2007), led to 'Nightcall' in the film Drive (2011), which mainstreamed the neon-grid, chrome-sunset style. Variants named after the 1986 arcade game OutRun ('outrun') drew on Miami Vice (1984-89); VHS filters, Testarossa dashes and Carpenter Brut's darksynth built an album-art economy, and Stranger Things (2016) pushed the look global.",
  },
  {
    slug: "symbolism",
    ctx: "Named by Jean Moreas's manifesto in Le Figaro (September 18, 1886), the movement answered realism and positivism with Baudelairean correspondences: Gustave Moreau's mythic Salomes, Odilon Redon's charcoal 'noirs' and Puvis de Chavannes's pale murals supplied its imagery. Fernand Khnopff carried it to Brussels, and the Salons de la Rose et Croix mounted by Josephin Peladan (1892-97) gave it a Paris stage, while Mallarme's poetry taught painters to treat subject as suggestion.",
  },
  {
    slug: "der-blaue-reiter",
    ctx: "Split from Munich's Neue Kunstlervereinigung in 1911 after Kandinsky's improvisation was rejected; he and Franz Marc published the almanac Der Blaue Reiter (1912), its title honoring Kandinsky's rider motif. Their exhibitions paired them with Picasso, Delaunay, Bavarian glass painting and African sculpture - among the first to show European abstraction and non-Western art as equals. The war ended the group (Marc died at Verdun, 1916), and the work resurfaced after the 1937 confiscations.",
  },
  {
    slug: "color-field",
    ctx: "Named by critic Clement Greenberg in 'American-Type Painting' (1955) for the Rothko, Newman and Still wing of the New York School, against Action Painting. Rothko's hovering fields aimed at tragedy, reaching devotional scale in Houston's Rothko Chapel (1971); Newman's zips, like Vir Heroicus Sublimis (1950-51), put the viewer inside the sublime. Morris Louis and Kenneth Noland, after seeing Helen Frankenthaler's Mountains and Sea (1952), developed stain painting and fixed the mural-scale format.",
  },
  {
    slug: "photorealism",
    ctx: "Named by New York dealer Louis K. Meisel in 1969 for painters who projected 35mm slides and reproduced them with airbrush and oil: Chuck Close's gridded Big Self-Portrait (1967-68), Richard Estes's diner-window reflections, Robert Bechtle's Oakland driveways and Audrey Flack's vanitas still lifes. Exhibited at Documenta 5 (1972), it staked a deadpan position as Minimalism emptied painting of illusion, and its eye for the camera's alienation of American everyday life runs on in hyperrealism.",
  },
]
