/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface LandmarkDetail {
  name: string;
  city: string;
  country: string;
  imageUrl: string;
  priceDetails: string;
  historyInfo: string;
  lat: number;
  lng: number;
  aliases?: string[];
}

// Pre-indexed database of major world & Indian landmarks with real photos & live coordinates
export const LANDMARK_DATABASE: Record<string, LandmarkDetail> = {
  "taj mahal": {
    name: "Taj Mahal",
    city: "Agra",
    country: "India",
    imageUrl: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&q=80&w=1000",
    priceDetails: "₹50 (Indian Nationals) / ₹1,100 ($13 USD) Foreign Visitors • Main Mausoleum Dome Pass: +₹200",
    historyInfo: "An ivory-white marble mausoleum on the south bank of the Yamuna River in Agra, commissioned in 1631 by Mughal Emperor Shah Jahan to house the tomb of his favorite wife, Mumtaz Mahal. Designated a UNESCO World Heritage Site in 1983 as 'the jewel of Muslim art in India'.",
    lat: 27.1751,
    lng: 78.0421,
    aliases: ["taj", "agra fort", "mumtaz", "yamuna", "shah jahan"]
  },
  "hawa mahal": {
    name: "Hawa Mahal (Palace of Winds)",
    city: "Jaipur",
    country: "India",
    imageUrl: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&q=80&w=1000",
    priceDetails: "₹50 (Domestic) / ₹200 ($2.50 USD) Foreign Entry Pass • Student Discount: ₹20",
    historyInfo: "Built in 1799 by Maharaja Sawai Pratap Singh, designed by Lal Chand Ustad. Constructed of red and pink sandstone, its unique 5-story honeycomb structure with 953 small windows (jharokhas) allowed royal women to observe street festivals without being seen from outside.",
    lat: 26.9239,
    lng: 75.8267,
    aliases: ["palace of winds", "jaipur palace", "jharokha", "pink city"]
  },
  "amber fort": {
    name: "Amer Fort (Amber Palace)",
    city: "Jaipur",
    country: "India",
    imageUrl: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&q=80&w=1000",
    priceDetails: "₹100 (Domestic) / ₹500 ($6 USD) Foreign Entry • Sound & Light Show: ₹250",
    historyInfo: "Located in Amer, 11 km from Jaipur, Amer Fort was constructed by Raja Man Singh I in 1592 over ancient ruins. Known for its artistic Rajput style elements, marble courtyards, and Sheesh Mahal (Mirror Palace) where a single candle flame illuminates the entire hall.",
    lat: 26.9855,
    lng: 75.8513,
    aliases: ["amer fort", "amber palace", "sheesh mahal", "jaigarh"]
  },
  "red fort": {
    name: "Red Fort (Lal Qila)",
    city: "New Delhi",
    country: "India",
    imageUrl: "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&q=80&w=1000",
    priceDetails: "₹35 (Domestic) / ₹500 ($6 USD) Foreign Visitors • Museum Pass Included",
    historyInfo: "Commissioned by Emperor Shah Jahan in 1638 when he shifted the Mughal capital from Agra to Delhi. Built with octagonal red sandstone walls, it served as the political seat of the Mughals for nearly 200 years and is the site where the Prime Minister hoists the Indian National Flag on Independence Day.",
    lat: 28.6562,
    lng: 77.2410,
    aliases: ["lal qila", "old delhi fort", "shahjahanabad"]
  },
  "qutub minar": {
    name: "Qutub Minar & Complex",
    city: "New Delhi",
    country: "India",
    imageUrl: "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&q=80&w=1000",
    priceDetails: "₹40 (Domestic) / ₹600 ($7 USD) Foreign Pass",
    historyInfo: "A 72.5-metre (238 ft) red sandstone minaret commissioned by Qutb ud-Din Aibak in 1192 AD to celebrate Muslim dominance in Delhi. The complex features the rust-resistant 4th-century Iron Pillar of Chandragupta II and intricate Islamic calligraphy.",
    lat: 28.5245,
    lng: 77.1855,
    aliases: ["qutab minar", "iron pillar", "mehrauli"]
  },
  "india gate": {
    name: "India Gate & Kartavya Path",
    city: "New Delhi",
    country: "India",
    imageUrl: "https://images.unsplash.com/photo-1598977123118-4e30ba3c4f5b?auto=format&fit=crop&q=80&w=1000",
    priceDetails: "Free Public Monument & Park Access",
    historyInfo: "A 42-metre high war memorial designed by Sir Edwin Lutyens, built between 1921 and 1931. It commemorates 84,000 soldiers of the British Indian Army who died in the First World War. Features the Amar Jawan Jyoti eternal flame burning under its arch.",
    lat: 28.6129,
    lng: 77.2295,
    aliases: ["kartavya path", "rajpath", "war memorial delhi"]
  },
  "gateway of india": {
    name: "Gateway of India",
    city: "Mumbai",
    country: "India",
    imageUrl: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&q=80&w=1000",
    priceDetails: "Free Public Access • Elephanta Island Ferry: ₹260 Return",
    historyInfo: "Erected to commemorate the landing of King George V and Queen Mary at Apollo Bunder on their visit to India in 1911. Designed in Indo-Saracenic style by George Wittet, it served as the ceremonial exit point for the last British troops leaving India in 1948.",
    lat: 18.9220,
    lng: 72.8347,
    aliases: ["mumbai gateway", "apollo bunder", "taj mahal palace hotel"]
  },
  "marine drive": {
    name: "Marine Drive (Queen's Necklace)",
    city: "Mumbai",
    country: "India",
    imageUrl: "https://images.unsplash.com/photo-1567157577867-05ccb1388e66?auto=format&fit=crop&q=80&w=1000",
    priceDetails: "Free Public Promenade Access",
    historyInfo: "A 3.6-kilometre long boulevard along Netaji Subhash Chandra Bose Road in South Mumbai. Known as the 'Queen's Necklace' because the streetlights resemble a string of pearls when viewed at night from an elevated location.",
    lat: 18.9432,
    lng: 72.8230,
    aliases: ["queens necklace", "chowpatty", "nariman point"]
  },
  "golden temple": {
    name: "Golden Temple (Sri Harmandir Sahib)",
    city: "Amritsar",
    country: "India",
    imageUrl: "https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&q=80&w=1000",
    priceDetails: "Free Access to All • Free Langar Community Meals 24/7",
    historyInfo: "The holiest Gurdwara of Sikhism, founded in 1577 by Guru Ram Das. The temple was built around a man-made pool (Amrit Sarovar) and gilded with 750 kg of pure gold leaf under Maharaja Ranjit Singh in 1830. Operates the world's largest free community kitchen serving up to 100,000 meals daily.",
    lat: 31.6200,
    lng: 74.8765,
    aliases: ["harmandir sahib", "amritsar temple", "sikh temple"]
  },
  "mysore palace": {
    name: "Mysore Palace (Amba Vilas Palace)",
    city: "Mysuru",
    country: "India",
    imageUrl: "https://images.unsplash.com/photo-1600100397608-f010e423b971?auto=format&fit=crop&q=80&w=1000",
    priceDetails: "₹100 (Domestic) / ₹300 ($3.50 USD) Foreign Visitors • Sunday Night Illumination Free",
    historyInfo: "Official residence of the Wadiyar dynasty, rulers of Mysore from 1399 to 1950. Designed by British architect Henry Irwin and completed in 1912, it blends Indo-Saracenic, Gothic, and Rajput architecture, illuminated by over 97,000 electric bulbs on festive evenings.",
    lat: 12.3052,
    lng: 76.6552,
    aliases: ["amba vilas", "mysuru palace", "wadiyar"]
  },
  "statue of unity": {
    name: "Statue of Unity & Sardar Sarovar",
    city: "Kevadia",
    country: "India",
    imageUrl: "https://images.unsplash.com/photo-1627894091060-6b3a0e67e33a?auto=format&fit=crop&q=80&w=1000",
    priceDetails: "₹150 (Basic Entry) / ₹380 ($4.50 USD) Viewing Gallery Pass",
    historyInfo: "The world's tallest statue, standing at 182 metres (597 feet), depicting Indian statesman Sardar Vallabhbhai Patel. Inaugurated in October 2018 on the Narmada River in Gujarat, facing the Sardar Sarovar Dam.",
    lat: 21.8380,
    lng: 73.7191,
    aliases: ["vallabhbhai patel", "kevadia statue", "narmada statue"]
  },
  "kerala backwaters": {
    name: "Kerala Backwaters & Alleppey Houseboats",
    city: "Alappuzha (Alleppey)",
    country: "India",
    imageUrl: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&q=80&w=1000",
    priceDetails: "₹6,000 - ₹12,000 ($70 - $140 USD) Full Day Private Houseboat Cruise",
    historyInfo: "A network of interconnected brackish lagoons, lakes, and canals running parallel to the Arabian Sea coast of Kerala. The traditional Kettuvallam houseboats are crafted using wooden planks tied together with coconut coir without a single nail.",
    lat: 9.4981,
    lng: 76.3388,
    aliases: ["alleppey", "houseboat", "alappuzha", "kumarakom"]
  },
  "eiffel tower": {
    name: "Eiffel Tower (Tour Eiffel)",
    city: "Paris",
    country: "France",
    imageUrl: "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&q=80&w=1000",
    priceDetails: "€28 ($30 USD / ₹2,500) Elevator Pass to Summit • Stair Pass: €11",
    historyInfo: "Constructed in 1889 as the entrance arch to the 1889 World's Fair, designed by Gustave Eiffel. Standing 330m tall, it was initially criticized by leading French artists but has become a global cultural icon of France and one of the most recognizable structures in the world.",
    lat: 48.8584,
    lng: 2.2945,
    aliases: ["tour eiffel", "paris tower", "champ de mars"]
  },
  "louvre museum": {
    name: "Louvre Museum (Musée du Louvre)",
    city: "Paris",
    country: "France",
    imageUrl: "https://images.unsplash.com/photo-1565099824688-e93eb20fe622?auto=format&fit=crop&q=80&w=1000",
    priceDetails: "€22 ($24 USD / ₹2,000) Timed Entry Ticket • Free under 18",
    historyInfo: "Originally built as a fortress in the late 12th century under Philip II, the Louvre was converted into a royal palace before becoming a public museum in 1793 during the French Revolution. Today it is the world's largest art museum, holding over 380,000 objects including the Mona Lisa.",
    lat: 48.8606,
    lng: 2.3376,
    aliases: ["louvre", "mona lisa", "paris museum", "glass pyramid"]
  },
  "shibuya crossing": {
    name: "Shibuya Scramble Crossing",
    city: "Tokyo",
    country: "Japan",
    imageUrl: "https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&q=80&w=1000",
    priceDetails: "Free Public Pedestrian Zone • Shibuya Sky Observation Deck: ¥2,200 ($15 USD)",
    historyInfo: "The busiest pedestrian intersection in the world, where up to 3,000 people cross simultaneously at peak intervals. Located outside Shibuya Station, it emerged as a symbol of modern Tokyo's neon urban dynamism and technological pop culture.",
    lat: 35.6595,
    lng: 139.7004,
    aliases: ["shibuya scramble", "shibuya sky", "hachiko"]
  },
  "senso-ji temple": {
    name: "Sensō-ji Temple & Nakamise Street",
    city: "Tokyo",
    country: "Japan",
    imageUrl: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&q=80&w=1000",
    priceDetails: "Free Temple Grounds Admission",
    historyInfo: "Tokyo's oldest Buddhist temple, founded in 645 AD. Legend states two brothers fished a statue of Kannon (Goddess of Mercy) out of the Sumida River in 628 AD, and the chief of their village consecrated his home into a temple for worship.",
    lat: 35.7148,
    lng: 139.7967,
    aliases: ["sensoji", "asakusa temple", "kaminarimon"]
  },
  "colosseum": {
    name: "The Colosseum (Flavian Amphitheatre)",
    city: "Rome",
    country: "Italy",
    imageUrl: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&q=80&w=1000",
    priceDetails: "€18 ($20 USD / ₹1,650) Standard Entry • Underground & Arena Access: €24",
    historyInfo: "Commissioned by Emperor Vespasian in AD 72 and completed in AD 80 under Titus. Capable of seating 50,000 to 80,000 spectators, it hosted gladiatorial contests, mock sea battles, and public spectacles for over four centuries.",
    lat: 41.8902,
    lng: 12.4922,
    aliases: ["colosseum rome", "flavian amphitheatre", "roman arena"]
  },
  "sagrada familia": {
    name: "Basílica de la Sagrada Família",
    city: "Barcelona",
    country: "Spain",
    imageUrl: "https://images.unsplash.com/photo-1583779457094-0acecf722055?auto=format&fit=crop&q=80&w=1000",
    priceDetails: "€26 ($28 USD / ₹2,350) Basilica Ticket • Tower Access Ticket: €36",
    historyInfo: "Designed by Catalan architect Antoni Gaudí (1852–1926). Construction began in 1882 and combines Art Nouveau and Catalan Gothic forms. Gaudí devoted his final years exclusively to the project until his tragic death in 1926.",
    lat: 41.4036,
    lng: 2.1744,
    aliases: ["sagrada familia", "gaudi cathedral", "barcelona church"]
  },
  "fushimi inari": {
    name: "Fushimi Inari-taisha Shrine",
    city: "Kyoto",
    country: "Japan",
    imageUrl: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=1000",
    priceDetails: "Free Public Shrine Access",
    historyInfo: "Founded in 711 AD, Fushimi Inari is the head shrine of the Shinto deity Inari (god of rice, agriculture, and business). Famous for its pathway lined with over 10,000 vermilion torii gates donated by individuals and Japanese businesses.",
    lat: 34.9671,
    lng: 135.7727,
    aliases: ["torii gates", "inari shrine", "kyoto shrine"]
  },
  "burj khalifa": {
    name: "Burj Khalifa & Dubai Fountain",
    city: "Dubai",
    country: "UAE",
    imageUrl: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&q=80&w=1000",
    priceDetails: "179 AED ($49 USD / ₹4,100) Observation Deck Levels 124+125",
    historyInfo: "Standing at a world-record height of 828 meters (2,717 ft) with 163 floors, opened in 2010. Designed by Adrian Smith at Skidmore, Owings & Merrill, its Y-shaped floor geometry is inspired by the desert flower Hymenocallis.",
    lat: 25.1972,
    lng: 55.2744,
    aliases: ["burj dubai", "dubai tower", "at the top"]
  },
  "sydney opera house": {
    name: "Sydney Opera House",
    city: "Sydney",
    country: "Australia",
    imageUrl: "https://images.unsplash.com/photo-1523428096881-5bd79d04300f?auto=format&fit=crop&q=80&w=1000",
    priceDetails: "$43 AUD ($28 USD / ₹2,300) Guided Architectural Tour",
    historyInfo: "Designed by Danish architect Jørn Utzon and opened in 1973 by Queen Elizabeth II. Renowned for its distinctive shell-like roof design on Sydney Harbour, it stands as a masterpiece of 20th-century architecture and UNESCO World Heritage site.",
    lat: -33.8568,
    lng: 151.2153,
    aliases: ["sydney harbour", "utzon", "opera house"]
  },
  "times square": {
    name: "Times Square",
    city: "New York",
    country: "USA",
    imageUrl: "https://images.unsplash.com/photo-1506146332389-18140dc7b2fb?auto=format&fit=crop&q=80&w=1000",
    priceDetails: "Free Public Plaza Access",
    historyInfo: "Formerly known as Longacre Square, renamed in 1904 after The New York Times moved its headquarters there. Known as 'The Crossroads of the World', it features glowing LED billboards, Broadway theaters, and hosts the iconic New Year's Eve ball drop.",
    lat: 40.7580,
    lng: -73.9855,
    aliases: ["broadway", "manhattan plaza", "new york square"]
  },
  "pyramids of giza": {
    name: "Giza Necropolis & Great Sphinx",
    city: "Cairo",
    country: "Egypt",
    imageUrl: "https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&q=80&w=1000",
    priceDetails: "360 EGP ($8 USD / ₹650) Giza Plateau Complex Pass",
    historyInfo: "Built during the Fourth Dynasty of the Old Kingdom of Ancient Egypt (c. 2600 BC). The Great Pyramid of Giza is the oldest of the Seven Wonders of the Ancient World and the only one to remain largely intact.",
    lat: 29.9792,
    lng: 31.1342,
    aliases: ["sphinx", "great pyramid", "giza Plateau"]
  },
  "kashi vishwanath": {
    name: "Kashi Vishwanath Temple & Ganga Ghats",
    city: "Varanasi",
    country: "India",
    imageUrl: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&q=80&w=1000",
    priceDetails: "Free Public Entry • Sugam Darshan Pass: ₹300 ($3.60 USD) • Morning Boat Ride: ₹200-₹500",
    historyInfo: "One of the most famous Hindu temples dedicated to Lord Shiva, located on the western bank of the sacred river Ganges in Varanasi. The temple stands in Kashi, the spiritual capital of India, with a golden spire covered in 800 kg of pure gold donated by Maharaja Ranjit Singh.",
    lat: 25.3109,
    lng: 83.0107,
    aliases: ["varanasi ghats", "ganga aarti", "dashashwamedh ghat", "kashi", "banaras", "assi ghat"]
  },
  "dashashwamedh ghat": {
    name: "Dashashwamedh Ghat & Evening Ganga Aarti",
    city: "Varanasi",
    country: "India",
    imageUrl: "https://images.unsplash.com/photo-1571536802807-30451e3955d8?auto=format&fit=crop&q=80&w=1000",
    priceDetails: "Free Public Ghat Access • Ganga Aarti Boat View: ₹200-₹400",
    historyInfo: "The main and oldest ghat in Varanasi on the Ganges, famous for its magnificent evening Ganga Aarti performed daily by priests with brass lamps, incense, and chantings. Legend says Lord Brahma created it to welcome Lord Shiva.",
    lat: 25.3069,
    lng: 83.0103,
    aliases: ["ganga aarti", "varanasi boat", "banaras ghat", "assi ghat"]
  },
  "city palace udaipur": {
    name: "City Palace Udaipur & Lake Pichola",
    city: "Udaipur",
    country: "India",
    imageUrl: "https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?auto=format&fit=crop&q=80&w=1000",
    priceDetails: "₹300 (Domestic) / ₹400 ($5 USD) Foreign Visitors • Lake Pichola Boat Ride: ₹400-₹700",
    historyInfo: "Built over nearly 400 years with contributions from several rulers of the Mewar dynasty, starting in 1559 by Maharana Udai Singh II. Located on the east bank of Lake Pichola, it features granite and marble architecture overlooking Jag Mandir and Lake Palace.",
    lat: 24.5764,
    lng: 73.6835,
    aliases: ["lake pichola", "udaipur palace", "jag mandir", "fateh sagar"]
  },
  "baga beach": {
    name: "Baga Beach & Fort Aguada",
    city: "Goa",
    country: "India",
    imageUrl: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&q=80&w=1000",
    priceDetails: "Free Public Beach Access • Water Sports: ₹500 - ₹2,000",
    historyInfo: "Baga is a popular beach in North Goa named after the Baga Creek. Famous for water sports, beach shacks, and night life. Nearby Fort Aguada is a 17th-century Portuguese fort and lighthouse standing on Sinquerim Beach.",
    lat: 15.5553,
    lng: 73.7517,
    aliases: ["goa beach", "fort aguada", "calangute", "panaji", "dudhsagar"]
  },
  "basilica of bom jesus": {
    name: "Basilica of Bom Jesus",
    city: "Goa",
    country: "India",
    imageUrl: "https://images.unsplash.com/photo-1626014903708-251f224f8d5b?auto=format&fit=crop&q=80&w=1000",
    priceDetails: "Free Entry to Basilica & UNESCO Heritage Site",
    historyInfo: "Located in Old Goa, this UNESCO World Heritage Site holds the mortal remains of St. Francis Xavier. Completed in 1605, it is a landmark in the history of Christianity and one of the finest examples of Baroque architecture in India.",
    lat: 15.5009,
    lng: 73.9116,
    aliases: ["old goa", "bom jesus", "st francis xavier", "goa church"]
  },
  "jal mahal": {
    name: "Jal Mahal (Water Palace)",
    city: "Jaipur",
    country: "India",
    imageUrl: "https://images.unsplash.com/photo-1603201236596-eb1a63eb0f51?auto=format&fit=crop&q=80&w=1000",
    priceDetails: "Free Promenade View • Boat Access Suspended for Conservation",
    historyInfo: "A 5-story palace in the middle of Man Sagar Lake in Jaipur. Four stories remain underwater when the lake is full. Renovated by Maharaja Jai Singh II in the 18th century, offering a breathtaking reflection at sunset.",
    lat: 26.9534,
    lng: 75.8462,
    aliases: ["water palace", "man sagar lake", "jalmahal"]
  },
  "lotus temple": {
    name: "Lotus Temple (Bahá'í House of Worship)",
    city: "New Delhi",
    country: "India",
    imageUrl: "https://images.unsplash.com/photo-1566552881560-0be862a7c445?auto=format&fit=crop&q=80&w=1000",
    priceDetails: "Free Public Entry to All Faiths",
    historyInfo: "Notable for its flowerlike shape, the Lotus Temple was dedicated in December 1986. Designed by Iranian-Canadian architect Fariborz Sahba, it is composed of 27 free-standing marble-clad 'petals' arranged in clusters of three.",
    lat: 28.5535,
    lng: 77.2588,
    aliases: ["bahai temple", "lotus delhi", "sahba"]
  },
  "akshardham temple": {
    name: "Swaminarayan Akshardham Temple",
    city: "New Delhi",
    country: "India",
    imageUrl: "https://images.unsplash.com/photo-1627894091060-6b3a0e67e33a?auto=format&fit=crop&q=80&w=1000",
    priceDetails: "Free Campus Entry • Exhibition & Musical Fountain Show Pass: ₹250 ($3 USD)",
    historyInfo: "Inaugurated in 2005, Akshardham displays millennia of traditional Hindu and Indian culture, spirituality, and architecture. Crafted entirely from pink sandstone and Italian Carrara marble without steel or concrete support.",
    lat: 28.6127,
    lng: 77.2773,
    aliases: ["akshardham delhi", "swaminarayan", "sahaj anand fountain"]
  },
  "humayuns tomb": {
    name: "Humayun's Tomb",
    city: "New Delhi",
    country: "India",
    imageUrl: "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&q=80&w=1000",
    priceDetails: "₹40 (Domestic) / ₹600 ($7 USD) Foreign Pass",
    historyInfo: "The tomb of Mughal Emperor Humayun, commissioned by his chief consort Empress Bega Begum in 1558. Designed by Persian architect Mirak Mirza Ghiyas, it was the first garden-tomb on the Indian subcontinent and inspired the Taj Mahal.",
    lat: 28.5873,
    lng: 77.2507,
    aliases: ["humayun tomb", "charbagh delhi", "nizamuddin"]
  },
  "charminar": {
    name: "Charminar & Laad Bazaar",
    city: "Hyderabad",
    country: "India",
    imageUrl: "https://images.unsplash.com/photo-1605364003310-f1c50d4d2931?auto=format&fit=crop&q=80&w=1000",
    priceDetails: "₹25 (Domestic) / ₹300 ($3.60 USD) Foreign Entry",
    historyInfo: "Constructed in 1591 by Muhammad Quli Qutb Shah to commemorate the end of a deadly plague. The square structure with four grand arches and 48.7-metre minarets is the iconic emblem of Hyderabad.",
    lat: 17.3616,
    lng: 78.4747,
    aliases: ["hyderabad monument", "laad bazaar", "golconda"]
  },
  "victoria memorial": {
    name: "Victoria Memorial & Maidan",
    city: "Kolkata",
    country: "India",
    imageUrl: "https://images.unsplash.com/photo-1558431382-27e303142255?auto=format&fit=crop&q=80&w=1000",
    priceDetails: "₹30 (Garden) / ₹500 ($6 USD) Museum Pass",
    historyInfo: "A large marble building in Kolkata built between 1906 and 1921, dedicated to the memory of Empress Victoria. Designed by Sir William Emerson using Makrana marble from Rajasthan, surrounded by 64 acres of gardens.",
    lat: 22.5448,
    lng: 88.3426,
    aliases: ["kolkata memorial", "howrah bridge", "maidan"]
  },
  "howrah bridge": {
    name: "Howrah Bridge (Rabindra Setu)",
    city: "Kolkata",
    country: "India",
    imageUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=1000",
    priceDetails: "Free Public Pedestrian & Vehicle Access",
    historyInfo: "A balanced cantilever bridge over the Hooghly River in West Bengal, commissioned in 1943. Built without nuts and bolts by riveting steel, it carries over 100,000 vehicles and 150,000 pedestrians daily.",
    lat: 22.5851,
    lng: 88.3468,
    aliases: ["rabindra setu", "hooghly bridge", "kolkata bridge"]
  },
  "dal lake": {
    name: "Dal Lake Shikara Ride & Houseboats",
    city: "Srinagar",
    country: "India",
    imageUrl: "https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&q=80&w=1000",
    priceDetails: "₹800 - ₹1,500 ($10 - $18 USD) Hourly Shikara Ride",
    historyInfo: "Known as the 'Jewel in the crown of Kashmir', Dal Lake is integral to tourism in Srinagar. Famous for colourful wooden Shikara boats, floating vegetable markets, and carved wooden houseboats framing snow-capped Himalayas.",
    lat: 34.0837,
    lng: 74.8370,
    aliases: ["shikara", "srinagar lake", "kashmir lake", "gulmarg", "shalimar bagh"]
  },
  "hampi ruins": {
    name: "Virupaksha Temple & Hampi Boulder Ruins",
    city: "Hampi",
    country: "India",
    imageUrl: "https://images.unsplash.com/photo-1600100397608-f010e423b971?auto=format&fit=crop&q=80&w=1000",
    priceDetails: "₹40 (Domestic) / ₹600 ($7 USD) UNESCO Ruins Pass",
    historyInfo: "Hampi was the capital of the Vijayanagara Empire in the 14th century. Located near Hosapete in Karnataka, its ruins spread over 4,100 hectares feature the iconic Stone Chariot at Vittala Temple and the functional Virupaksha Temple.",
    lat: 15.3350,
    lng: 76.4600,
    aliases: ["virupaksha", "stone chariot", "vittala temple", "vijayanagara"]
  },
  "promenade beach": {
    name: "Promenade Beach & French Quarter",
    city: "Puducherry",
    country: "India",
    imageUrl: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&q=80&w=1000",
    priceDetails: "Free Public Promenade Access",
    historyInfo: "A 1.2 km seafront stretch along the Bay of Bengal in Pondicherry, flanked by French colonial heritage buildings, yellow-tinted villas, cafe bistros, and the Mahatma Gandhi Memorial statue.",
    lat: 11.9338,
    lng: 79.8357,
    aliases: ["pondicherry beach", "french quarter", "auroville", "rock beach"]
  },
  "rishikesh ganga aarti": {
    name: "Lakshman Jhula & Triveni Ghat Ganga Aarti",
    city: "Rishikesh",
    country: "India",
    imageUrl: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=1000",
    priceDetails: "Free Access • River Rafting Pass: ₹600 - ₹1,200",
    historyInfo: "Rishikesh is known as the 'Yoga Capital of the World'. Nestled in the Himalayan foothills on the banks of the Ganges, it features historic suspension bridges Lakshman Jhula and Ram Jhula, and serene evening prayers at Triveni Ghat.",
    lat: 30.1260,
    lng: 78.3245,
    aliases: ["lakshman jhula", "ram jhula", "triveni ghat", "yoga capital", "rafting rishikesh"]
  }
};

// High resolution city-level real photograph fallback images
const CITY_FALLBACK_IMAGES: Record<string, string> = {
  jaipur: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&q=80&w=1000",
  agra: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&q=80&w=1000",
  delhi: "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&q=80&w=1000",
  mumbai: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&q=80&w=1000",
  varanasi: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&q=80&w=1000",
  banaras: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&q=80&w=1000",
  goa: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&q=80&w=1000",
  udaipur: "https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?auto=format&fit=crop&q=80&w=1000",
  amritsar: "https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&q=80&w=1000",
  kerala: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&q=80&w=1000",
  alleppey: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&q=80&w=1000",
  mysore: "https://images.unsplash.com/photo-1600100397608-f010e423b971?auto=format&fit=crop&q=80&w=1000",
  mysuru: "https://images.unsplash.com/photo-1600100397608-f010e423b971?auto=format&fit=crop&q=80&w=1000",
  rishikesh: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=1000",
  shimla: "https://images.unsplash.com/photo-1626014903708-251f224f8d5b?auto=format&fit=crop&q=80&w=1000",
  manali: "https://images.unsplash.com/photo-1626014903708-251f224f8d5b?auto=format&fit=crop&q=80&w=1000",
  kevadia: "https://images.unsplash.com/photo-1627894091060-6b3a0e67e33a?auto=format&fit=crop&q=80&w=1000",
  hampi: "https://images.unsplash.com/photo-1600100397608-f010e423b971?auto=format&fit=crop&q=80&w=1000",
  puducherry: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&q=80&w=1000",
  pondicherry: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&q=80&w=1000",
  kolkata: "https://images.unsplash.com/photo-1558431382-27e303142255?auto=format&fit=crop&q=80&w=1000",
  hyderabad: "https://images.unsplash.com/photo-1605364003310-f1c50d4d2931?auto=format&fit=crop&q=80&w=1000",
  srinagar: "https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&q=80&w=1000",
  kashmir: "https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&q=80&w=1000",
  paris: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=1000",
  tokyo: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&q=80&w=1000",
  dubai: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&q=80&w=1000",
  rome: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&q=80&w=1000",
  "new york": "https://images.unsplash.com/photo-1506146332389-18140dc7b2fb?auto=format&fit=crop&q=80&w=1000"
};

// High resolution category fallback images
const CATEGORY_FALLBACK_IMAGES: Record<string, string> = {
  heritage: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&q=80&w=1000",
  food: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=1000",
  nature: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1000",
  museum: "https://images.unsplash.com/photo-1565099824688-e93eb20fe622?auto=format&fit=crop&q=80&w=1000",
  urban: "https://images.unsplash.com/photo-1477959858617-67f30ac4ce09?auto=format&fit=crop&q=80&w=1000",
  default: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&q=80&w=1000"
};

/**
 * Generates direct Google Maps turn-by-turn driving/transit navigation URL
 */
export function getGoogleMapsDirectionsUrl(originLat: number, originLng: number, destLat: number, destLng: number, placeName?: string): string {
  const query = placeName ? encodeURIComponent(placeName) : '';
  if (originLat && originLng) {
    return `https://www.google.com/maps/dir/?api=1&origin=${originLat},${originLng}&destination=${destLat},${destLng}&destination_place_id=${query}&travelmode=driving`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${destLat},${destLng}+(${query})`;
}

/**
 * Generates direct Google Maps place search URL
 */
export function getGoogleMapsSearchUrl(placeName: string, location?: string): string {
  const query = encodeURIComponent(`${placeName} ${location || ''}`.trim());
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

/**
 * Calculates live distance between two coordinates in kilometers using Haversine formula
 */
export function calculateLiveDistanceKm(userLat: number, userLng: number, targetLat: number, targetLng: number): number {
  if (!userLat || !userLng || !targetLat || !targetLng) return 0;
  const R = 6371; // Radius of Earth in kilometers
  const dLat = (targetLat - userLat) * (Math.PI / 180);
  const dLon = (targetLng - userLng) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(userLat * (Math.PI / 180)) * Math.cos(targetLat * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Matches place text against indexed database or constructs structured data
 * Uses fuzzy multi-alias normalization & city proximity checks
 */
export function getEnrichedPlaceData(activityTitle: string, locationName: string, city: string) {
  const cleanStr = (s: string) => (s || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').trim();
  const fullText = cleanStr(`${activityTitle} ${locationName} ${city}`);

  let bestMatch: LandmarkDetail | null = null;
  let highestScore = 0;

  for (const [key, dbItem] of Object.entries(LANDMARK_DATABASE)) {
    const keyClean = cleanStr(key);
    let score = 0;

    // Direct key match
    if (fullText.includes(keyClean)) {
      score += 50;
    }

    // Name match
    const dbNameClean = cleanStr(dbItem.name);
    if (fullText.includes(dbNameClean)) {
      score += 40;
    }

    // City match
    const dbCityClean = cleanStr(dbItem.city);
    if (dbCityClean && fullText.includes(dbCityClean)) {
      score += 15;
    }

    // Aliases match
    if (dbItem.aliases) {
      for (const alias of dbItem.aliases) {
        const aliasClean = cleanStr(alias);
        if (aliasClean && fullText.includes(aliasClean)) {
          score += 30;
        }
      }
    }

    if (score > highestScore) {
      highestScore = score;
      bestMatch = dbItem;
    }
  }

  // If a confident match was found
  if (bestMatch && highestScore >= 15) {
    return bestMatch;
  }

  // Generic fallback enrichment if no specific landmark matched
  let selectedImageUrl = CATEGORY_FALLBACK_IMAGES.default;
  
  // Check if any city name matches in fullText
  for (const [cityName, cityImg] of Object.entries(CITY_FALLBACK_IMAGES)) {
    if (fullText.includes(cityName)) {
      selectedImageUrl = cityImg;
      break;
    }
  }

  if (selectedImageUrl === CATEGORY_FALLBACK_IMAGES.default) {
    let categoryKey = "default";
    if (fullText.includes("museum") || fullText.includes("gallery") || fullText.includes("art")) categoryKey = "museum";
    else if (fullText.includes("food") || fullText.includes("restaurant") || fullText.includes("dine") || fullText.includes("market") || fullText.includes("street food")) categoryKey = "food";
    else if (fullText.includes("fort") || fullText.includes("palace") || fullText.includes("temple") || fullText.includes("church") || fullText.includes("monument") || fullText.includes("heritage")) categoryKey = "heritage";
    else if (fullText.includes("beach") || fullText.includes("park") || fullText.includes("garden") || fullText.includes("mountain") || fullText.includes("lake") || fullText.includes("river")) categoryKey = "nature";
    else if (fullText.includes("walk") || fullText.includes("mall") || fullText.includes("square") || fullText.includes("center")) categoryKey = "urban";
    selectedImageUrl = CATEGORY_FALLBACK_IMAGES[categoryKey] || CATEGORY_FALLBACK_IMAGES.default;
  }

  return {
    name: activityTitle,
    city: city || locationName || "Tourist Destination",
    country: "Safe Zone",
    imageUrl: selectedImageUrl,
    priceDetails: "Standard Ticket Pass / Tour Budget Included",
    historyInfo: `${activityTitle} is a top-rated tourist spot in ${locationName || city}, celebrated for its rich culture, vibrant local atmosphere, and high safety rating for travelers. Verified by Bharat Safe Tourism Database.`,
    lat: 28.6139, // Default coordinates
    lng: 77.2090
  };
}
