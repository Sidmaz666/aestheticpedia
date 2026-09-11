/**
 * Aesthetic Atlas — WORLD CULTURAL TRADITIONS expansion matrix, WAVE 2.
 *
 * Purpose: close the remaining gaps in the cultural coverage map after wave 1:
 * Caucasus, Siberian & Arctic peoples, Uyghur / Turkic ornament, Taiwan
 * indigenous & Han craft, Madagascar, Somalia & Swahili coast deeper, San rock
 * art, Hausa/Sahel cities, Plains ledger art, Pennsylvania Dutch, Appalachian,
 * Louisiana Creole/Gullah, Amazonian design systems, Paraguay/Guaraní,
 * Southern Cone indigenous, Hungary, Andalusia, Basque country, Sorbia,
 * Assyrian & Circassian dress, Jewish diaspora crafts, Micronesia, Kanak.
 *
 * Every focus names real, documented traditions as anchors for discovery.
 * The LLM documents actual named aesthetics within each cluster — never invented.
 * Format: [category, domain, focus]
 */

export const CULTURAL_BATCHES_2: Array<[string, string, string]> = [
  // ===================== CAUCASUS & BLACK SEA =====================
  ['Textile & Craft', 'Caucasian Carpet & Flatweave Traditions', 'Kazak, Karabakh, Shirvan and Kuba rug groups of the eastern Caucasus, Azerbaijani kilim and zili weaving, Armenian carpet schools of Yerevan and Gyumri, Dagestani Avar pile weaving, Kaitag embroidery panels of Dagestan, Georgian khorjin saddlebag weaving, soumak wrapped-weft flatweave, Karabakh ojadak? keep listed anchors'],
  ['Religious & Sacred Art', 'Armenian Christian Visual Culture', 'Khachkar cross-stone carving schools of Lori and Vayots Dzor, Armenian illuminated manuscripts (Toros Roslin, Gladzor school), Geghard rock-cut monastery interiors, Etchmiadzin cathedral stonework, gavit narthex vaulting, Armenian glazed-tile revetment, embroidered church curtains, taraz national dress'],
  ['Regional & Cultural Tradition', 'Georgian Material & Feast Culture', 'Minankari cloisonne enamel, qvevri wine-vessel making and marani wine cellars, supra feast table layout and tamada toasting culture, chokha wool coat with khanjali dagger dress, Svaneti koshki stone tower houses, carved wooden balconies of old Tbilisi, berikaoba masked processional theater, Georgian icon and polyphonic festival dress'],
  ['Architectural Style', 'North Caucasian & Black Sea Vernacular', 'Svan and Khevsur fortified stone villages, Circassian (Adyghe) wattle-and-daub homesteads, Crimean Tatar Bakhchysarai fountain and house ornament, Pontic Greek stone houses of the Trabzon highlands, Laz and Georgian arch bridges, Abkhaz apatsha veranda houses'],

  // ===================== SIBERIA & ARCTIC RUSSIA =====================
  ['Regional & Cultural Tradition', 'Siberian Indigenous Material Culture', 'Sakha (Yakut) silver kettle-wear ornaments and khomus jews-harp culture, Evenki reindeer-gear beadwork and birchbark containers, Chukchi and Koryak carved bone and whale-festival dress, Nivkh bear-festival carved regalia, Nanai and Ulchi fish-skin robes with applique, Siberian shaman coats with metal pendants (ongon), Khanty fur mosaic'],
  ['Religious & Sacred Art', 'Buryat & Altai Buddhist-Shamanic Culture', 'Ivolga datsan monastery architecture of Buryatia, Buryat applique thangka and tantric brocade work, Altai Teleut and Telengit ceremonial ribbon trees, Burkhanism (Ak Jang) prayer flags and ritual dress of the Altai, Tuvan Buddhist revival temple ornament'],

  // ===================== CENTRAL ASIA & TURKIC PEOPLES =====================
  ['Textile & Craft', 'Uyghur Material & Textile Culture', 'Etles (Atlas) silk ikat of Hotan and Shache, doppa embroidered skullcaps by oasis region, Kashgar and Turpan courtyard houses with carved pomegranate columns, gold-beaded bridal hair ornaments, muqam ensemble dress and instrument inlay (rawap, dutar), Yengisar knife hilts, Kashgar coppersmith repousse'],
  ['Textile & Craft', 'Volga & Crimean Tatar Ornament', 'Kazan Tatar leather mosaic boots (ichigi) and gold-thread tambur embroidery, Crimean Tatar embroidered belts and fezzes, Bashkir felt carpets (palas) and honey craft, Mishar and Astrakhan Tatar dress codes, Tatar carved wooden window frames of Kazan'],
  ['Music & Sonic Culture', 'Tuvan & South Siberian Performance Culture', 'Tuvan khoomei throat-singing ensemble dress, igil and doshpuluur instrument inlay, khuresh wrestling festival dress, Khakas chatkhan zither carving, Altai kaichy storyteller regalia, Sor? keep listed anchors'],

  // ===================== SOUTH ASIA DEEPER =====================
  ['Textile & Craft', 'Parsi & Zoroastrian Visual Culture', 'Parsi gara Chinese-chain-stitch embroidery borders, sudreh shirt and kusti woven cord, Atash Bahram fire-temple architectural typology, Achaemenid and Sasanian relief-carving legacy at Persepolis and Naqsh-e Rostam, Nowruz haft-sin table arrangement, Navjote initiation dress, dokhma (Tower of Silence) stone documentation, Parsi kusti-weaving households of Navsari'],
  ['Regional & Cultural Tradition', 'Sikkim & Eastern Himalaya Visual Culture', 'Sikkimese monastery murals and masked cham dance dress, Lepcha weaving and archery culture, Sherpa Nyingma gompa interiors of Solu-Khumbu, Mustang walled-city murals of Lo Manthang, Bhutanese? see wave-1 Himalayan batch — keep Sikkim, Lepcha, Sherpa and Mustang anchors'],
  ['Textile & Craft', 'Assamese Silk & Eastern Northeast Craft', 'Mekhela chador weaving in pat and muga silks, gamosa ritual towel codes and endi weaving, Majuli satra mask-making (Bhaona), Tripuri bamboo craft, Bodo dokhona and aronai woven gifts, Karbi and Dimasa weaving'],

  // ===================== SOUTHEAST ASIA & TAIWAN =====================
  ['Regional & Cultural Tradition', 'Taiwanese Indigenous Material Culture', 'Paiwan hundred-pacer snake and noble-house motifs, Rukai and Paiwan slate-stone houses, Atayal facial tattoo and vertical-loom weaving culture, Bunun ear-shooting festival dress, Tao (Yami) plank boat carving and underground house, Amis festival regalia and bamboo craft, Puyuma youth-house culture, rattan backpack basketry'],
  ['Regional & Cultural Tradition', 'Taiwanese Han Craft & Temple Culture', 'Jiaozhi (koji) glazed temple ceramics, cut-porcelain mosaic temple facades, Penghu coral-stone courtyard houses, Lukang tinwork and lantern craft, Taiwanese boat-burning festival (Wang Yeh) fleet construction, Hokkien? keep listed anchors plus paper effigy workshops of Taipei'],
  ['Regional & Cultural Tradition', 'Malagasy Material Culture', 'Lamba silk weaving and arindrina burial shrouds, lamba hoany printed cloth sayings, valiha bamboo-tube zither inlay, zebu-horn working, famadihana rewrapping cloth culture, Hauts Plateaux brick houses with carved verandas, marquetry of Ambositra, Antaimoro paper making'],
  ['Regional & Cultural Tradition', 'Somali & Horn Nomad Visual Culture', 'Aqal portable tent lattice and mat weaving, guntiino and dirac dress codes, camel milking-vessel ornament, billao dagger craft, frankincense-trade material culture of the Horn, Somali dentalum? keep listed anchors plus alindi woven mats and Hargeisa bookshop print culture'],

  // ===================== AFRICA DEEPER =====================
  ['Regional & Cultural Tradition', 'San Rock Art & Kalahari Visual Culture', 'Drakensberg San rock paintings (eland and trance-dance imagery), Tsodilo Hills rock art of Botswana, ostrich-eggshell beadwork geometry, decorated hunting kits and quivers, Naro and Ju hoansi bead exchange codes, rock engravings of the Cederberg'],
  ['Regional & Cultural Tradition', 'Hausa & Sahelian City Craft', 'Kano city gates and indigo dye pits, Hausa leatherwork of the trans-Saharan trade, babban riga embroidered robes and rawani turban codes, Hausa wall-calligraphy of Zaria, Nupe carved doors and glass beads, Dakawa? keep listed anchors plus Sahel library manuscript binding'],
  ['Textile & Craft', 'Swahili Coast Craft & Maritime Culture', 'Lamu carved Lamu-style doors beyond wave-1 mentions, Swahili dhow building and sail stitching, kofia embroidered caps, Lamu chair carving and clock culture, Mombasa silver, Makonde mapiko initiation masks and body work, Zanzibari khanga? see wave-1 kanga batch — keep kofia, dhow, Lamu chair, Mombasa silver, Makonde anchors'],

  // ===================== NORTH AMERICA DEEPER =====================
  ['Regional & Cultural Tradition', 'Plains Ledger Art & Pictographic Records', 'Ledger art of Kiowa and Lakota artists, winter-count buffalo-hide pictographic records, painted tipi ownership designs, Ghost Dance shirt and drum painting, shield heraldry and vision-paint conventions, todays? keep listed anchors plus quilled? see wave-1 Plains batch — keep ledger, winter count, tipi, Ghost Dance anchors'],
  ['Regional & Cultural Tradition', 'Pennsylvania Dutch & Mid-Atlantic Folk Art', 'Fraktur illuminated birth and house-blessing certificates, hex signs and barn stars, Amish and Mennonite plain quilts and restrained wagon paint, sgraffito redware pottery, scherenschnitte papercuts, Moravian star craft and chalkware'],
  ['Regional & Cultural Tradition', 'Appalachian & Ozark Folk Craft', 'Overshot coverlet weaving patterns, mountain dulcimer and banjo inlay, white-oak basketry, face jugs and alkaline-glazed stoneware, carved walking sticks, log-cabin and star quilt patterns, frontier stone and log barn construction'],
  ['Regional & Cultural Tradition', 'Louisiana Creole & Gulf Coast Visual Culture', 'Mardi Gras Indians suit beading and Big Chief regalia, shotgun houses and Creole cottages, second-line parasols and sashes, Cajun pirogue boat decoration, New Orleans above-ground tomb culture, Gullah sweetgrass baskets and cast-net craft, Gulf Coast bingo? keep listed anchors'],

  // ===================== SOUTH AMERICA DEEPER =====================
  ['Textile & Craft', 'Amazonian Indigenous Design Systems', 'Kayapo beadwork and ceremonial headdresses, Yanomami body painting and basketry, Ashaninka kushma cotton dress, Tukano and Desana idiom-design baskets and stools, Huaorani achiote body codes, Marajoara? see wave-1 Mesoamerican batch — keep Kayapo, Yanomami, Ashaninka, Tukano anchors'],
  ['Textile & Craft', 'Paraguayan & Guarani Craft', 'Nanduti needle lace of Itagua, ao poi fine cotton weaving, poncho de sesenta listas, Ita pottery, Paraguayan filigrana silver, carved guampa mate horns, Guarani featherwork of the missions'],
  ['Regional & Cultural Tradition', 'Southern Cone Indigenous Visual Culture', 'Selknam (Ona) body paint and Hain ceremony masks, Yahgan bark-canoe and shell culture, Tehuelche quillang? keep boleadoras and silver tack of the rioplatense batch — use Aonikenk rock art of Patagonia, Selknam painted bark capes, Kawesqar basketry'],
  ['Regional & Cultural Tradition', 'Colombian Popular & Regional Visual Culture', 'Wayuu mochila crochet color systems and chinchorro hammocks, sombrero vueltiao of the Zenú, Barranquilla Carnival masks and marimonda dress, Mompox filigree, chiva? see global-south batch — keep Wayuu, vueltiao, marimonda, Mompox anchors'],

  // ===================== EUROPE DEEPER =====================
  ['Textile & Craft', 'Hungarian Embroidery & Folk Costume', 'Matyo rose embroidery of Mezokovesd, Kalocsa painted-and-stitched folk art, Paloc embroidery of northern Hungary, Kalotaszeg (Transylvanian) written-stitch embroidery, szur shepherd cloaks with felt applique, Hungarian Easter egg writing, Matyo costume rose-and-leaf dress codes'],
  ['Regional & Cultural Tradition', 'Andalusian Popular Visual Culture', 'Patio cordobes flower-filled courtyards, feria de abril caseta dress (traje de flamenca and peineta), Rocio pilgrimage cart and dress culture, feria? keep listed anchors plus Azahar? keep: Semana Santa processional regalia of Seville, capea? keep listed anchors'],
  ['Regional & Cultural Tradition', 'Basque & Cantabrian Maritime Culture', 'Trainera rowing-boat hull painting, txapela beret and herri kirol (rural sport) dress, carved baserri farmhouse lintels and balconies, txalaparta and tamborileros performance dress, Basque pelota court culture, Getaria fishing-town workwear'],
  ['Regional & Cultural Tradition', 'Sorbian & Lusatian Folk Culture', 'Sorbian wax-resist Easter egg decoration, Sorbian Tracht of Lower and Upper Lusatia, Easter Riders (Osterreiter) processional dress, Spreewald punt-boat decoration, Sorbian painted Easter well displays, Wendish wedding ribbon customs'],
  ['Textile & Craft', 'Icelandic & Faroese Wool Culture', 'Icelandic lopapeysa yoke sweaters, peysufot and skautbuningur national costume, Faroese chain-dance dress, Faroese bird-hunt and wool culture, Icelandic hide? keep: shawl knitting of Iceland (triangular horseshoe shawls), Faroese boat? keep listed anchors'],

  // ===================== MIDDLE EAST DEEPER =====================
  ['Textile & Craft', 'Assyrian & Syriac Christian Craft', 'Assyrian cross-stitch embroidery of the Hakkari and Urmia villages, Syriac liturgical vestment embroidery, carved lintels and doorposts of the Nineveh plains (Alqosh, Bartella), church banner and processional cross craft, Middle Eastern Christian icon painting of Tur Abdin'],
  ['Regional & Cultural Tradition', 'Circassian & Pontic Dress Culture', 'Adyghe cherkeska coat and gazyr cartridge holders, Circassian dance dress of the kafa and islamey, silver belt and fastener sets, Circassian horse tack and saddle craft, kite? keep listed anchors plus Circassian table and guest-house (khache) culture'],
  ['Textile & Craft', 'Jewish Diaspora Craft Cultures', 'Yemenite Jewish filigree silversmithing, Bukharan Jewish silk-ikat ateliers, Beta Israel pottery and basketry of Ethiopia, Cochin Jewish embroidered caps, Baghdadi diaspora furnishings of Bombay and Calcutta, sofer STA-M scribal lettering of Torah scrolls, Moroccan Jewish henna ceremony dress, Italian Jewish illuminated ketubot'],

  // ===================== OCEANIA DEEPER =====================
  ['Regional & Cultural Tradition', 'Micronesian Navigation & Material Culture', 'Marshallese stick charts (wave-navigation maps) and canoe-sail applique, Yap rai stone discs and village paths, Palauan bai meeting-house gable painting and storyboard carving, Chamorro latte-stone architecture and pandanus mat weaving, Chuukese love sticks, Kiribati coconut-fiber armor and armor helmets'],
  ['Regional & Cultural Tradition', 'Kanak & New Caledonian Visual Culture', 'Kanak fleche faitiere rooftop-finial carving, grande case chiefly hut assembly, carved doorway posts and courtyard arrangements, Jean-Marie Tjibaou Cultural Centre reinterpretation, Kanak tapa and woven grass craft, Melanesia? see wave-1 batch — keep Kanak anchors'],

  // ===================== GRAPHIC / TYPOGRAPHIC CULTURES WAVE 2 =====================
  ['Graphic Design', 'Comic & Cartoon Lettering Cultures', 'Japanese manga sound-effect lettering and panel rhythm, Franco-Belgian bande dessinee hand lettering (Pilote house style), Mexican moneros political-cartoon lettering, Indian hand-lettered comics (Amar Chitra Katha), Argentine and Brazilian humor-magazine lettering, Korean webtoon typesetting conventions'],
  ['Graphic Design', 'Film Title & Credit Lettering Cultures', 'Bollywood hand-painted title cards, anime title calligraphy of Tezuka-era and Ghibli lineages, Soviet animation title design (Soyuzmultfilm), lucha libre film poster lettering of Mexico, B-movie title painting of Ghana (mobile cinema), Japanese kaiju title typography'],
]
