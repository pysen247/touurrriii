/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Compass, 
  MapPin, 
  ShieldCheck, 
  Sparkles, 
  Radio, 
  WifiOff, 
  Bot, 
  Volume2, 
  PhoneCall, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  ArrowRight, 
  ArrowLeft,
  Zap, 
  Search, 
  Layers, 
  ShieldAlert, 
  Eye, 
  BookOpen, 
  ChevronRight, 
  ChevronLeft,
  ChevronDown, 
  Play, 
  Award,
  Terminal,
  Smartphone,
  Check,
  RotateCcw,
  ExternalLink,
  Camera,
  Globe,
  Circle,
  Phone,
  Clock,
  Navigation,
  UserCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { soundFx } from '../utils/audio';
import { LanguageCode } from '../utils/translations';

interface AppTutorialGuideProps {
  onNavigateTab: (tab: string) => void;
  language: LanguageCode;
  t: (key: string) => string;
  darkMode?: boolean;
}

interface GuideModule {
  id: string;
  tabTarget: string;
  icon: React.ElementType;
  color: string;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  steps: { title: string; desc: string; icon: React.ElementType }[];
  proTips: string[];
  quickActionLabel: string;
}

export default function AppTutorialGuide({ onNavigateTab, language, t, darkMode = false }: AppTutorialGuideProps) {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedModuleIndex, setSelectedModuleIndex] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  
  // Interactive Simulator State
  const [simSafetyZone, setSimSafetyZone] = useState<'safe' | 'caution' | 'danger'>('safe');
  const [simDecoyCallActive, setSimDecoyCallActive] = useState<boolean>(false);
  const [simDecoyCallAnswered, setSimDecoyCallAnswered] = useState<boolean>(false);
  const [simQuizAnswers, setSimQuizAnswers] = useState<Record<number, number>>({});
  const [simQuizSubmitted, setSimQuizSubmitted] = useState<boolean>(false);

  const isHindi = language === 'hi';

  const guideModules: GuideModule[] = [
    {
      id: 'getting-started',
      tabTarget: 'home',
      icon: Compass,
      color: 'blue',
      badge: isHindi ? 'गंतव्य रडार' : 'Destination Radar',
      title: isHindi ? '1. होम व सुरक्षित गंतव्य अन्वेषण' : '1. Explore & Live Destination Safety Radar',
      subtitle: isHindi ? '25+ प्रमुख गंतव्यों की लाइव सुरक्षा रेटिंग, पुलिस गश्त स्तर एवं जीपीएस दूरी' : 'Real-time safety ratings, police patrol index & live GPS distance for 25+ destinations',
      description: isHindi
        ? 'होम स्क्रीन से आप विश्व के प्रमुख पर्यटन स्थलों की लाइव सुरक्षा रेटिंग (95%-99%), भीड़ का स्तर, पुलिस निगरानी और मुख्य आकर्षण देख सकते हैं। यह आपको अपनी यात्रा के लिए सबसे सुरक्षित स्थान चुनने में मदद करता है।'
        : 'The home portal presents vetted safety scores, curated heritage itineraries, live GPS distances, and instant navigation links to Google Maps for 25+ iconic destinations across India and worldwide.',
      steps: [
        {
          title: isHindi ? 'गंतव्य खोजें या फिल्टर करें' : 'Search or Filter Destinations',
          desc: isHindi ? 'सर्च बार में शहर का नाम टाइप करें या लोकप्रिय कार्ड्स में से अपनी पसंद का शहर चुनें।' : 'Type any city name in the search bar or filter by categories like Spiritual, Nature, or Heritage.',
          icon: Search
        },
        {
          title: isHindi ? 'लाइव सुरक्षा इंडेक्स जांचें' : 'Inspect Live Safety Index',
          desc: isHindi ? 'प्रत्येक शहर पर 95%-99% सुरक्षा स्कोर, सीसीटीवी निगरानी स्तर और सेफगार्ड रेटिंग देखें।' : 'Check the 95%-99% safety score, monitoring level, crowd density, and certified safe tags.',
          icon: ShieldCheck
        },
        {
          title: isHindi ? 'गूगल मैप्स नेविगेशन व एआई योजना' : 'One-Tap AI Plan or Maps Navigation',
          desc: isHindi ? '"Plan with AI" पर क्लिक करके तुरंत एआई यात्रा योजना बनाएं या गूगल मैप्स पर लाइव रूट देखें।' : 'Click "Plan with AI" to generate a tailored itinerary or "Navigate Google Maps" for live turn-by-turn routes.',
          icon: ArrowRight
        }
      ],
      proTips: [
        isHindi ? '💡 प्रो टिप: लाइव जीपीएस दूरी देखने के लिए ब्राउज़र लोकेशन अनुमति दें ताकि आप जान सकें कि गंतव्य आपसे कितनी दूर है।' : '💡 Pro Tip: Grant browser geolocation to see real-time distance in km to every destination from where you are standing.',
        isHindi ? '💡 प्रो टिप: "Explore Radar Map" बटन दबाकर आप सीधे सभी गंतव्यों को इंटरएक्टिव मानचित्र पर देख सकते हैं।' : '💡 Pro Tip: Filter destinations by category to quickly find safe spiritual retreats or family-friendly destinations.'
      ],
      quickActionLabel: isHindi ? 'होम पेज पर जाएं' : 'Jump to Home & Explore'
    },
    {
      id: 'ai-planner',
      tabTarget: 'planner',
      icon: Sparkles,
      color: 'purple',
      badge: isHindi ? 'एआई योजनाकार' : 'Gemini AI Planner',
      title: isHindi ? '2. जेमिनी एआई स्मार्ट यात्रा योजनाकार व तुलना' : '2. Gemini AI Safe Travel Planner & Comparison',
      subtitle: isHindi ? 'सुरक्षित दिन-वार यात्रा कार्यक्रम, बजट प्रबंधन एवं दो यात्राओं की सीधी तुलना' : 'Custom daily schedules, budget estimates, and side-by-side trip comparison',
      description: isHindi
        ? 'जेमिनी एआई द्वारा संचालित यात्रा योजनाकार आपके बजट, दिनों और सुरक्षा प्राथमिकताओं के आधार पर दिन-वार सुरक्षित यात्रा मार्ग, सुबह/दोपहर/शाम का शेड्यूल, भोजन सुझाव, टिकट मूल्य और ऑडियो इतिहास तैयार करता है।'
        : 'Generate customized multi-day itineraries with morning/afternoon/evening schedules, safe transit recommendations, estimated budgets, ticket prices, and compare two trips side-by-side.',
      steps: [
        {
          title: isHindi ? 'यात्रा विवरण व बजट दर्ज करें' : 'Enter Destination & Budget',
          desc: isHindi ? 'गंतव्य शहर, यात्रा के दिन, अनुमानित बजट ($/₹) और अपनी रुचियां लिखें।' : 'Fill in destination, duration in days, budget, and specific interests or safety needs.',
          icon: FileText
        },
        {
          title: isHindi ? 'स्मार्ट एआई शेड्यूल बनाएं' : 'Click Generate Smart Itinerary',
          desc: isHindi ? 'जेमिनी एआई कुछ ही सेकंड में संपूर्ण दिन-वार सुरक्षित टाइमलाइन और ऑडियो गाइड तैयार करेगा।' : 'Gemini AI analyzes local safety data and outputs a comprehensive timeline with safe transit.',
          icon: Sparkles
        },
        {
          title: isHindi ? 'तुलना मोड (Compare Mode)' : 'Side-by-Side Trip Comparison',
          desc: isHindi ? '"Compare Mode" चालू करके दो अलग-अलग यात्राओं के बजट, सुरक्षा स्कोर और गति की सीधी तुलना करें।' : 'Toggle Compare Mode to evaluate 2 different trips on Cost, Pace, Safety Index, and Transit.',
          icon: Layers
        }
      ],
      proTips: [
        isHindi ? '💡 प्रो टिप: हर दिन के शेड्यूल में "Listen to History" बटन दबाकर आप उस स्मारक की ऐतिहासिक जानकारी ऑडियो में सुन सकते हैं।' : '💡 Pro Tip: Each generated day includes an audio player button to listen to landmark history on the spot.',
        isHindi ? '💡 प्रो टिप: "Download PDF / Itinerary" बटन से आप पूरी योजना को कभी भी ऑफलाइन पढ़ने के लिए सेव कर सकते हैं।' : '💡 Pro Tip: Use "Download Itinerary" to save the plan locally for offline viewing during flights.'
      ],
      quickActionLabel: isHindi ? 'एआई प्लानर खोलें' : 'Jump to AI Planner'
    },
    {
      id: 'geofence-radar',
      tabTarget: 'map',
      icon: MapPin,
      color: 'emerald',
      badge: isHindi ? 'लाइव मैप' : 'Geofence Radar',
      title: isHindi ? '3. स्मार्ट जियोफेंस व इंसीडेंट रडार मैप' : '3. Smart Geofence & Incident Radar Map',
      subtitle: isHindi ? 'सुरक्षा जोन (हरा/पीला/लाल), निकटतम प्रमाणित सेफ-स्पॉट्स एवं वास्तविक समय अलर्ट' : 'Color-coded security zones (Green/Yellow/Red), SafeSpots & live GPS breaches',
      description: isHindi
        ? 'इंटरएक्टिव मैप पर शहर के विभिन्न क्षेत्रों की सुरक्षा स्थिति 3 रंगों में प्रदर्शित होती है। साथ ही निकटतम प्रमाणित अस्पताल, पुलिस थाने, बैंक एटीएम और महिला सहायता केंद्र एक क्लिक में उपलब्ध हैं।'
        : 'Interactive radar mapping displaying real-time security zones (Green = Ultra Safe, Amber = Caution, Red = High Alert) alongside verified SafeSpots.',
      steps: [
        {
          title: isHindi ? 'सुरक्षा जोन की पहचान (3 रंग)' : 'Understand the 3 Zone Color Codes',
          desc: isHindi ? '🟢 हरा = 24/7 सुरक्षित व पुलिस गश्त; 🟡 पीला = भीड़भाड़/सतर्कता; 🔴 लाल = रात्रि में परहेज करें।' : '🟢 Green = 24/7 CCTV & police patrol; 🟡 Amber = caution / pickpockets; 🔴 Red = restricted after sunset.',
          icon: ShieldAlert
        },
        {
          title: isHindi ? 'प्रमाणित सेफ-स्पॉट्स (SafeSpots) खोजें' : 'Locate Verified SafeSpots',
          desc: isHindi ? 'अस्पताल, पुलिस बूथ, प्रमाणित एटीएम और महिला हेल्पडेस्क पर क्लिक करके सीधे कॉल या नेविगेट करें।' : 'Filter markers for Safe Haven Clinics, Tourist Police, Monitored ATMs, and EV Charging.',
          icon: MapPin
        },
        {
          title: isHindi ? 'स्वचालित जियोफेंस चेतावनी' : 'Automated Boundary Breach Alert',
          desc: isHindi ? 'यदि आप किसी संवेदनशील या प्रतिबंधित क्षेत्र में प्रवेश करते हैं, तो सिस्टम तुरंत अलर्ट ध्वनि बजाता है।' : 'The system automatically triggers audio and visual alerts if your GPS enters a caution zone.',
          icon: AlertTriangle
        }
      ],
      proTips: [
        isHindi ? '💡 प्रो टिप: मैप पर किसी भी मार्कर पर क्लिक करके उसका लाइव फोन नंबर और दिशा-निर्देश प्राप्त करें।' : '💡 Pro Tip: Click any SafeSpot marker on the radar to reveal direct emergency contacts and navigation.',
        isHindi ? '💡 प्रो टिप: "Center on My GPS" बटन दबाकर मैप को तुरंत अपनी वर्तमान स्थिति पर केंद्रित करें।' : '💡 Pro Tip: Use the GPS button in the map corner to track your real-time walking route.'
      ],
      quickActionLabel: isHindi ? 'लाइव मैप खोलें' : 'Jump to Radar Map'
    },
    {
      id: 'voice-copilot',
      tabTarget: 'home',
      icon: Bot,
      color: 'cyan',
      badge: isHindi ? 'वॉइस साथी' : 'Voice Copilot',
      title: isHindi ? '4. सेफटूर वॉइस एआई कोपायलट' : '4. SafeTour Interactive Voice AI Copilot',
      subtitle: isHindi ? 'हिंदी व अंग्रेजी में वॉइस प्रश्न पूछें, लाइव गूगल सर्च व मैप्स जानकारी' : 'Hands-free voice assistant with Google Search & Maps real-time grounding',
      description: isHindi
        ? 'स्क्रीन पर नीचे दाईं ओर मौजूद एआई चैट विजेट से आप हिंदी या अंग्रेजी में बात कर सकते हैं। स्थानीय कानूनों, टैक्सी के सही किराए, स्मारकों के खुलने के समय या सुरक्षा सलाह के बारे में तुरंत पूछें।'
        : 'The floating AI Copilot allows hands-free voice conversations in English and Hindi. Ask about monument history, taxi rates, cultural etiquette, or safety protocols with instant answers.',
      steps: [
        {
          title: isHindi ? 'चैट विजेट खोलें' : 'Open the Floating Copilot Widget',
          desc: isHindi ? 'स्क्रीन पर नीचे दाईं ओर चमकते हुए चैट आइकन पर क्लिक करें।' : 'Click the glowing assistant icon in the bottom right corner of any screen.',
          icon: Bot
        },
        {
          title: isHindi ? 'माइक दबाकर बोलें या टाइप करें' : 'Tap Mic or Type Your Question',
          desc: isHindi ? 'माइक बटन दबाकर बोलें (जैसे: "क्या रात में हवा महल जाना सुरक्षित है?")।' : 'Tap the microphone to speak naturally in Hindi or English, or type in the input box.',
          icon: Volume2
        },
        {
          title: isHindi ? 'सत्यापित उत्तर व गूगल मैप्स लिंक' : 'Receive Grounded Safety Answers',
          desc: isHindi ? 'एआई रीयल-टाइम डेटा और गूगल मैप्स के आधार पर सटीक और सुरक्षित सलाह देता है।' : 'Copilot synthesizes verified municipal advisories, exact opening hours, and safety tips.',
          icon: Sparkles
        }
      ],
      proTips: [
        isHindi ? '💡 प्रो टिप: आप वॉइस चैट में सुझाए गए टॉपिक्स (Suggested Topics) पर क्लिक करके तुरंत उत्तर पा सकते हैं।' : '💡 Pro Tip: Tap on one-click suggested topic pills for instant answers without typing.',
        isHindi ? '💡 प्रो टिप: खरीदारी करते समय दुकानदार द्वारा बताई गई कीमत की पुष्टि के लिए कोपायलट से उचित मूल्य पूछें।' : '💡 Pro Tip: Ask the Copilot "What is the official auto fare from airport to city center?" before boarding.'
      ],
      quickActionLabel: isHindi ? 'होम पर कोपायलट देखें' : 'Try AI Copilot'
    },
    {
      id: 'aura-sentinel',
      tabTarget: 'aura',
      icon: Eye,
      color: 'amber',
      badge: isHindi ? 'स्टेल्थ सुरक्षा' : 'AURA™ Sentinel',
      title: isHindi ? '5. ऑरा™ स्टेल्थ सेंटिनल (गुप्त सुरक्षा)' : '5. AURA™ Stealth Sentinel (Covert Protection)',
      subtitle: isHindi ? 'नकली कॉल, साइलेंट ड्युरेस पिन अलार्म एवं परिवेशी ध्वनि थ्रेट डिटेक्टर' : 'Decoy phone calls, silent duress PIN, ambient acoustic threat listener',
      description: isHindi
        ? 'असुरक्षित या संदिग्ध परिस्थिति में हमलावर या संदिग्ध व्यक्ति को शक हुए बिना अपनी सुरक्षा सुनिश्चित करें। इसमें नकली इनकमिंग कॉल, गुप्त साइलेंट एसओएस और परिवेशी ऑडियो निगरानी शामिल है।'
        : 'Designed for dangerous situations where overt phone usage could provoke attackers. Trigger covert decoy calls, silent duress codes, and live ambient threat alerts.',
      steps: [
        {
          title: isHindi ? 'नकली इनकमिंग कॉल सक्रिय करें' : 'Trigger Fake Decoy Call',
          desc: isHindi ? '"Trigger Decoy Call" दबाएं। आपका फोन असली कॉल की तरह बजेगा जिससे आप सुरक्षित बहाना बनाकर निकल सकें।' : 'Press "Trigger Decoy Call" to simulate an urgent incoming call from family/police with real audio conversation.',
          icon: PhoneCall
        },
        {
          title: isHindi ? 'साइलेंट ड्युरेस पिन अलार्म' : 'Silent Duress PIN Dispatch',
          desc: isHindi ? 'दबाव में गलत या विशेष पिन दर्ज करने पर स्क्रीन सामान्य दिखेगी परंतु बैकग्राउंड में पुलिस को जीपीएस चला जाएगा।' : 'Typing the duress PIN silently dispatches GPS coordinates to emergency responders while keeping the UI looking normal.',
          icon: Terminal
        },
        {
          title: isHindi ? 'परिवेशी ऑडियो थ्रेट डिटेक्शन' : 'Ambient Threat Frequency Monitor',
          desc: isHindi ? 'माइक्रोफोन द्वारा चिल्लाने, कांच टूटने या संकट की आवाजों को स्वचालित रूप से पहचान कर अलर्ट करता है।' : 'Uses Web Audio spectrum analysis to detect distress screams, breaking glass, or sudden loud impacts.',
          icon: Volume2
        }
      ],
      proTips: [
        isHindi ? '💡 प्रो टिप: रात में अकेले कैब में यात्रा करते समय या सुनसान सड़क पर चलते समय ऑरा सेंटिनल को चालू रखें।' : '💡 Pro Tip: Keep AURA™ active when boarding solo late-night cabs or walking poorly lit alleyways.',
        isHindi ? '💡 प्रो टिप: नकली कॉल में ऑडियो स्पीच भी चलती है ताकि बात करना 100% स्वाभाविक लगे।' : '💡 Pro Tip: The decoy call includes audible conversation scripts so your conversation sounds genuine.'
      ],
      quickActionLabel: isHindi ? 'ऑरा सेंटिनल खोलें' : 'Jump to AURA™ Sentinel'
    },
    {
      id: 'offline-hub',
      tabTarget: 'offline',
      icon: WifiOff,
      color: 'cyan',
      badge: isHindi ? 'बिना इंटरनेट' : 'Zero-Net Hub',
      title: isHindi ? '6. जीरो-नेट 100% ऑफलाइन सर्वाइवल हब' : '6. Zero-Net Offline Survival Hub (No Internet)',
      subtitle: isHindi ? 'मोर्स कोड एसओएस स्ट्रोब, 120dB लाउड सायरन, सचित्र फर्स्ट-एड व वाक्यांश' : 'Morse SOS beacon, 120dB distress siren, offline first-aid & phrasebook',
      description: isHindi
        ? 'दूरदराज के पहाड़ी इलाकों, घने जंगलों या मोबाइल नेटवर्क न होने की स्थिति में 100% काम करने वाले लाइफ-सेविंग टूल्स। स्क्रीन फ्लैशर, उच्च-ध्वनि सायरन और आवश्यक प्राथमिक उपचार।'
        : 'Engineered for remote Himalayan treks, dense forests, or network outages where zero cellular connection exists. Provides optical SOS, acoustic sirens, and offline first-aid.',
      steps: [
        {
          title: isHindi ? 'मोर्स कोड एसओएस स्ट्रोब' : 'Activate Morse Code Optical SOS',
          desc: isHindi ? 'अंतर्राष्ट्रीय एसओएस (... --- ...) पैटर्न में स्क्रीन को चमकाता है ताकि दूर से बचाव दल व हेलीकॉप्टर देख सकें।' : 'Flashes the display at maximum brightness in the international SOS pattern for rescue helicopters.',
          icon: Zap
        },
        {
          title: isHindi ? '120dB पैनिक सर्वाइवल सायरन' : 'Sound High-Decibel Acoustic Siren',
          desc: isHindi ? 'तेज आवाज में आपातकालीन अलार्म बजाकर हमलावरों को भगाएं और आसपास के लोगों का ध्यान आकर्षित करें।' : 'Generates multi-frequency piercing siren sounds through the Web Audio synthesizer to deter attackers.',
          icon: Volume2
        },
        {
          title: isHindi ? 'ऑफलाइन फर्स्ट-एड व सर्वाइवल वाक्यांश' : 'Offline First-Aid & Phrasebook',
          desc: isHindi ? 'सीपीआर, सांप के काटने, ब्लीडिंग रोकने की सचित्र विधियां और स्थानीय भाषा में आपातकालीन वाक्य।' : 'Access step-by-step CPR instructions, snakebite protocols, and local language survival phrases.',
          icon: BookOpen
        }
      ],
      proTips: [
        isHindi ? '💡 प्रो टिप: यह हब 100% ब्राउज़र में स्थानीय रूप से चलता है - इसमें इंटरनेट की 1% भी जरूरत नहीं है।' : '💡 Pro Tip: Zero-Net Hub runs 100% client-side with zero server latency or data dependency.',
        isHindi ? '💡 प्रो टिप: ट्रेकिंग पर जाने से पहले अपने फोन को चार्ज रखें और इस हब को बुकमार्क कर लें।' : '💡 Pro Tip: Keep the Survival Phrasebook handy when traveling through regional remote towns.'
      ],
      quickActionLabel: isHindi ? 'ऑफलाइन हब खोलें' : 'Jump to Offline Hub'
    },
    {
      id: 'safety-suite',
      tabTarget: 'extras',
      icon: ShieldAlert,
      color: 'rose',
      badge: isHindi ? 'सुरक्षा सुइट' : 'AI Safety Suite',
      title: isHindi ? '7. इंटरएक्टिव एआई सेफ्टी सुइट व स्कैम डिटेक्टर' : '7. Interactive AI Safety Suite & Scam Detector',
      subtitle: isHindi ? 'घोटाला पहचानक, लैंडमार्क सुरक्षा स्कैनर, त्वरित अनुवादक व गुमशुदगी पोर्टल' : 'Instant scam detector, landmark safety scanner, quick translator & lost items',
      description: isHindi
        ? 'पर्यटकों के साथ होने वाले ऑटो-मीटर घोटालों, फर्जी रत्न-आभूषणों, अनाधिकृत गाइडों और अधिक बिलिंग को एआई की मदद से तुरंत पहचानें और सुरक्षित रहें।'
        : 'AI-assisted protection tools to verify suspicious taxi rates, scan landmark safety protocols, translate unfamiliar regional signboards, and manage lost luggage items.',
      steps: [
        {
          title: isHindi ? 'संदिग्ध घोटाला (Scam) जांचें' : 'Verify Suspicious Scam or Overcharging',
          desc: isHindi ? 'दुकानदार या ड्राइवर की बात लिखें और एआई से जांचें कि क्या यह ज्ञात पर्यटक धोखाधड़ी है।' : 'Enter details of suspicious behavior to get a risk level, red flags, and recommended counter-actions.',
          icon: AlertTriangle
        },
        {
          title: isHindi ? 'लैंडमार्क सुरक्षा स्कैनर' : 'Scan Landmark Safety Protocols',
          desc: isHindi ? 'किसी भी ऐतिहासिक स्मारक का नाम लिखें और वहां के प्रवेश नियम, आधिकारिक टिकट काउंटर व सुरक्षा टिप्स पाएं।' : 'Get opening hours, dress codes, official ticket counters, and crowd safety tips for monuments.',
          icon: Camera
        },
        {
          title: isHindi ? 'त्वरित बहुभाषी अनुवादक' : 'Instant Multilingual Translator',
          desc: isHindi ? 'स्थानीय भाषा में बात करने या आपात स्थिति में तुरंत सटीक अनुवाद व उच्चारण प्राप्त करें।' : 'Translate phrases into Hindi, English, Spanish, French, German, or Japanese on the fly.',
          icon: Globe
        }
      ],
      proTips: [
        isHindi ? '💡 प्रो टिप: "Lost & Found" टैब से आप अपनी खोई हुई वस्तु की रिपोर्ट समय व जीपीएस के साथ दर्ज कर सकते हैं।' : '💡 Pro Tip: Log lost luggage with date, time, and coordinates for police dispatch tracking.',
        isHindi ? '💡 प्रो टिप: कभी भी अनधिकृत टिकट दलालों से टिकट न खरीदें - हमेशा ऐप में दिए गए आधिकारिक काउंटर का उपयोग करें।' : '💡 Pro Tip: Always check official ticket prices in the Landmark Scanner to avoid paying 5x to touts.'
      ],
      quickActionLabel: isHindi ? 'सेफ्टी सुइट खोलें' : 'Jump to Safety Suite'
    },
    {
      id: 'sos-dispatch',
      tabTarget: 'dashboard',
      icon: Radio,
      color: 'red',
      badge: isHindi ? 'आपातकाल' : 'Emergency SOS',
      title: isHindi ? '8. वन-टैप एसओएस व आपातकालीन सहायता' : '8. One-Tap Persistent SOS & Rapid Dispatch',
      subtitle: isHindi ? 'स्क्रीन पर हर समय उपलब्ध फ्लोटिंग एसओएस बटन, 112/100/108 डायरेक्ट डायलर' : 'Global floating SOS button, instant 112 helpline dialer, and live beacon tracking',
      description: isHindi
        ? 'किसी भी स्क्रीन पर नीचे लाल रंग का एसओएस बटन हमेशा उपलब्ध है। इसे दबाते ही आपकी सटीक जीपीएस स्थिति आपातकालीन सेवा (112) और निकटतम सहायता केंद्र को प्रेषित की जाती है।'
        : 'A persistent emergency beacon accessible from any view in the app. One tap locks GPS coordinates, sends emergency alerts to authorities, and connects to national emergency helplines.',
      steps: [
        {
          title: isHindi ? 'एसओएस बटन दबाएं' : 'Press the Red SOS Beacon',
          desc: isHindi ? 'नेवबार या फ्लोटिंग बटन से एसओएस दबाएं। गलत क्लिक से बचने के लिए 3-सेकंड का टाइमर शुरू होता है।' : 'Click the red SOS Beacon. A 3-second safeguard countdown begins to prevent accidental presses.',
          icon: Radio
        },
        {
          title: isHindi ? 'लाइव जीपीएस निर्देशांक लॉक' : 'Real-time GPS Coordinate Lock',
          desc: isHindi ? 'सिस्टम आपकी सटीक अक्षांश-देशांतर स्थिति को लॉक करके आपातकालीन नियंत्रण कक्ष को भेजता है।' : 'High-precision GPS coordinates are dispatched to national emergency responders (112/911).',
          icon: MapPin
        },
        {
          title: isHindi ? 'त्वरित हेल्पलाइन कॉलिंग' : 'Direct Helpline Connect',
          desc: isHindi ? 'पुलिस (100/112), एम्बुलेंस (108), और महिला हेल्पलाइन (1091) पर एक क्लिक में सीधे कॉल करें।' : 'One-tap dialers immediately bridge phone connections to police, medical ambulances, and women safety desks.',
          icon: Phone
        }
      ],
      proTips: [
        isHindi ? '💡 प्रो टिप: आप प्रोफाइल पेज पर अपने परिवार के 3 आपातकालीन संपर्क जोड़ सकते हैं - एसओएस पर उन्हें तुरंत एसएमएस जाएगा।' : '💡 Pro Tip: Configure up to 3 trusted emergency contacts in your Profile tab for automated distress pings.',
        isHindi ? '💡 प्रो टिप: यदि गलती से एसओएस दब जाए, तो 3 सेकंड के अंदर "Cancel" दबाकर इसे रोका जा सकता है।' : '💡 Pro Tip: Cancel the countdown within 3 seconds to avoid sending false alarms.'
      ],
      quickActionLabel: isHindi ? 'डैशबोर्ड पर एसओएस देखें' : 'View SOS Dashboard'
    }
  ];

  const filteredModules = guideModules.filter(m => {
    if (activeCategory === 'core' && !['getting-started', 'ai-planner', 'geofence-radar'].includes(m.id)) return false;
    if (activeCategory === 'stealth' && !['aura-sentinel', 'sos-dispatch'].includes(m.id)) return false;
    if (activeCategory === 'offline' && !['offline-hub', 'safety-suite', 'voice-copilot'].includes(m.id)) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return m.title.toLowerCase().includes(q) || m.subtitle.toLowerCase().includes(q) || m.description.toLowerCase().includes(q);
    }
    return true;
  });

  const currentModule = guideModules[selectedModuleIndex] || guideModules[0];

  const faqs = [
    {
      q: isHindi ? 'क्या सेफटूर एआई बिना इंटरनेट के काम करता है?' : 'Does SafeTour AI work without internet access?',
      a: isHindi 
        ? 'हाँ! हमारा "जीरो-नेट ऑफलाइन सर्वाइवल हब" 100% बिना इंटरनेट के चलता है। आप मोर्स कोड एसओएस, 120dB सायरन, फर्स्ट-एड गाइड और बहुभाषी वाक्यांशों का उपयोग बिना किसी डेटा कनेक्शन के कर सकते हैं।'
        : 'Yes! The Zero-Net Offline Survival Hub operates 100% locally in your browser. Optical Morse SOS, the 120dB acoustic siren, first-aid instructions, and survival phrases require zero internet or cell towers.'
    },
    {
      q: isHindi ? 'सुरक्षा रेटिंग (Safety Score) कैसे निर्धारित होती है?' : 'How is the destination Safety Score calculated?',
      a: isHindi
        ? 'सुरक्षा रेटिंग में वास्तविक समय पुलिस निगरानी स्तर, अपराध दर डेटाबेस, प्रमाणित अस्पतालों की निकटता, सीसीटीवी घनत्व और पर्यटकों की लाइव समीक्षाओं का एआई विश्लेषण शामिल होता है।'
        : 'Safety ratings aggregate real-time police patrol telemetry, certified hospital density, historical incident logs, verified tourist feedback, and lighting/infrastructure indexes.'
    },
    {
      q: isHindi ? 'ऑरा™ की नकली कॉल (Decoy Call) क्या है और यह कैसे काम करती है?' : 'What is AURA™ Decoy Call and how does it help?',
      a: isHindi
        ? 'जब आप किसी असहज स्थिति या संदिग्ध कैब में होते हैं, तो नकली कॉल दबाने पर आपका फोन एक वास्तविक इनकमिंग कॉल की तरह बजता है। इसमें परिवार या पुलिस अधिकारी की आवाज में बातचीत चलती है ताकि आप आसानी से वहां से निकल सकें।'
        : 'When trapped in uncomfortable situations or solo taxi rides, Decoy Call simulates an urgent incoming phone call with ringing and audio conversation, giving you a natural excuse to exit safely.'
    },
    {
      q: isHindi ? 'एसओएस (SOS) दबाने पर क्या होता है?' : 'What happens when I press the SOS button?',
      a: isHindi
        ? 'एसओएस दबाने पर 3 सेकंड का टाइमर चलता है, जिसके बाद आपकी सटीक जीपीएस स्थिति लॉक हो जाती है और राष्ट्रीय आपातकालीन सेवा (112/100/108) एवं आपके पंजीकृत आपातकालीन संपर्कों को अलर्ट भेजा जाता है।'
        : 'A 3-second safety countdown begins. Upon completion, high-precision GPS coordinates are transmitted to municipal first responders (112) and your saved emergency contacts.'
    }
  ];

  return (
    <div className={`mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-8 transition-colors duration-300 ${
      darkMode ? 'text-slate-100' : 'text-slate-900'
    }`} id="tutorial-guide-master-container">
      
      {/* Top Banner / Header */}
      <div className={`relative overflow-hidden rounded-3xl border p-6 sm:p-8 shadow-xl transition-all ${
        darkMode 
          ? 'border-slate-800/80 bg-slate-900/90 text-white' 
          : 'border-slate-200/80 bg-white text-slate-900'
      }`}>
        <div className="absolute -right-16 -top-16 h-60 w-60 rounded-full bg-gradient-to-br from-blue-500 via-indigo-500 to-cyan-400 opacity-20 blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-black text-cyan-400 border border-blue-500/20 uppercase tracking-widest">
              <BookOpen className="h-3.5 w-3.5" />
              <span>{isHindi ? 'विस्तृत यूजर गाइड व इंटरएक्टिव ट्यूटोरियल' : 'Master User Guide & Interactive Tutorial'}</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2.5">
              <span>{isHindi ? 'सेफटूर एआई कैसे उपयोग करें?' : 'Mastering SafeTour AI Platform'}</span>
            </h1>
            
            <p className={`text-sm leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              {isHindi 
                ? 'सभी 8 प्रमुख सुरक्षा उपकरणों, जेमिनी एआई प्लानर, ऑरा स्टेल्थ सेंटिनल, ऑफलाइन मोर्स कोड एवं 24/7 एसओएस प्रणाली का सचित्र विवरण और लाइव परीक्षण।'
                : 'Complete interactive walkthrough of all 8 core protection tools, Gemini AI itinerary planning, AURA™ stealth security, offline zero-net hub, and 24/7 emergency dispatch.'}
            </p>
          </div>

          {/* Quick Search and Progress Badge */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-3 min-w-[260px]">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isHindi ? 'गाइड में खोजें...' : 'Search guide modules...'}
                className={`w-full rounded-xl border pl-10 pr-4 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                  darkMode 
                    ? 'border-slate-800 bg-slate-950 text-white placeholder-slate-500' 
                    : 'border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400'
                }`}
              />
            </div>

            <div className={`flex items-center justify-between rounded-xl border px-3.5 py-2 text-xs font-bold ${
              darkMode ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200 bg-slate-50'
            }`}>
              <span className="text-slate-400">{isHindi ? 'मॉड्यूल प्रगति' : 'Module Progress'}:</span>
              <span className="text-cyan-400 font-extrabold">{selectedModuleIndex + 1} / {guideModules.length} ({Math.round(((selectedModuleIndex + 1) / guideModules.length) * 100)}%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Category Navigation Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none" id="guide-category-tabs">
        {[
          { id: 'all', label: isHindi ? 'सभी 8 मॉड्यूल' : 'All 8 Modules' },
          { id: 'core', label: isHindi ? 'मुख्य उपकरण (Home, AI, Map)' : 'Core Tools (Home, AI, Map)' },
          { id: 'stealth', label: isHindi ? 'स्टेल्थ व आपातकाल (AURA, SOS)' : 'Stealth & SOS' },
          { id: 'offline', label: isHindi ? 'ऑफलाइन व एआई सुइट' : 'Offline & AI Suite' },
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => {
              soundFx.playClick();
              setActiveCategory(cat.id);
            }}
            className={`whitespace-nowrap rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeCategory === cat.id
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : darkMode
                  ? 'border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800'
                  : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Main Interactive Guide Slider / Module Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Module Selection List */}
        <div className="lg:col-span-4 space-y-2.5">
          <div className="text-xs font-extrabold uppercase tracking-wider text-slate-400 px-1 mb-2">
            {isHindi ? 'मॉड्यूल सूची' : 'Interactive Modules'}
          </div>

          <div className="space-y-2 max-h-[620px] overflow-y-auto pr-1">
            {guideModules.map((module, idx) => {
              const isSelected = selectedModuleIndex === idx;
              const IconComp = module.icon;
              return (
                <motion.div
                  key={module.id}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => {
                    soundFx.playClick();
                    setSelectedModuleIndex(idx);
                  }}
                  className={`cursor-pointer rounded-2xl border p-3.5 transition-all duration-200 ${
                    isSelected
                      ? 'border-blue-500 bg-blue-600/10 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500'
                      : darkMode
                        ? 'border-slate-800/80 bg-slate-900/60 hover:bg-slate-900'
                        : 'border-slate-200/80 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center space-x-3">
                      <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl ${
                        isSelected 
                          ? 'bg-blue-600 text-white' 
                          : darkMode 
                            ? 'bg-slate-800 text-cyan-400' 
                            : 'bg-blue-50 text-blue-600'
                      }`}>
                        <IconComp className="h-4.5 w-4.5" />
                      </div>
                      <div className="text-left">
                        <div className="text-xs font-bold line-clamp-1">
                          {module.title}
                        </div>
                        <div className="text-[11px] text-slate-400 line-clamp-1">
                          {module.subtitle}
                        </div>
                      </div>
                    </div>
                    {isSelected ? (
                      <CheckCircle2 className="h-4 w-4 text-cyan-400 flex-shrink-0" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-slate-400 flex-shrink-0" />
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Detailed Module Card with Step-by-Step, Pro Tips & Actions */}
        <div className="lg:col-span-8 space-y-6">
          <motion.div
            key={currentModule.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`rounded-3xl border p-6 sm:p-8 shadow-xl transition-all ${
              darkMode 
                ? 'border-slate-800/80 bg-slate-900/90' 
                : 'border-slate-200/80 bg-white'
            }`}
          >
            {/* Header with Navigation Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5 mb-6 border-slate-800/20 dark:border-slate-800">
              <div className="flex items-center space-x-3.5">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/20">
                  <currentModule.icon className="h-6 w-6" />
                </div>
                <div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2.5 py-0.5 text-[10px] font-black text-cyan-400 border border-blue-500/20 uppercase tracking-widest mb-1">
                    {currentModule.badge}
                  </span>
                  <h2 className="text-lg sm:text-xl font-extrabold tracking-tight">
                    {currentModule.title}
                  </h2>
                </div>
              </div>

              {/* Prev / Next Slide Buttons */}
              <div className="flex items-center space-x-2">
                <button
                  disabled={selectedModuleIndex === 0}
                  onClick={() => {
                    soundFx.playClick();
                    setSelectedModuleIndex(prev => Math.max(0, prev - 1));
                  }}
                  className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-all ${
                    selectedModuleIndex === 0
                      ? 'opacity-40 cursor-not-allowed border-slate-800 bg-slate-900 text-slate-500'
                      : darkMode
                        ? 'border-slate-700 bg-slate-800 text-white hover:bg-slate-700'
                        : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-100'
                  }`}
                  title="Previous Module"
                >
                  <ChevronLeft className="h-4.5 w-4.5" />
                </button>
                <span className="text-xs font-bold text-slate-400 px-1">
                  {selectedModuleIndex + 1} / {guideModules.length}
                </span>
                <button
                  disabled={selectedModuleIndex === guideModules.length - 1}
                  onClick={() => {
                    soundFx.playClick();
                    setSelectedModuleIndex(prev => Math.min(guideModules.length - 1, prev + 1));
                  }}
                  className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-all ${
                    selectedModuleIndex === guideModules.length - 1
                      ? 'opacity-40 cursor-not-allowed border-slate-800 bg-slate-900 text-slate-500'
                      : darkMode
                        ? 'border-slate-700 bg-slate-800 text-white hover:bg-slate-700'
                        : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-100'
                  }`}
                  title="Next Module"
                >
                  <ChevronRight className="h-4.5 w-4.5" />
                </button>
              </div>
            </div>

            {/* Description Text */}
            <p className={`text-sm leading-relaxed mb-6 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              {currentModule.description}
            </p>

            {/* Step-by-Step Instructions */}
            <div className="space-y-3 mb-6">
              <div className="text-xs font-black uppercase tracking-wider text-slate-400">
                {isHindi ? 'चरण-दर-चरण उपयोग गाइड:' : 'Step-by-Step Instructions:'}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {currentModule.steps.map((step, sIdx) => {
                  const StepIcon = step.icon;
                  return (
                    <div 
                      key={sIdx}
                      className={`rounded-2xl border p-4 transition-all ${
                        darkMode 
                          ? 'border-slate-800/80 bg-slate-950/60' 
                          : 'border-slate-200/80 bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 mb-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-600 text-white text-xs font-black">
                          {sIdx + 1}
                        </span>
                        <StepIcon className="h-4 w-4 text-cyan-400" />
                      </div>
                      <h4 className="text-xs font-bold mb-1 line-clamp-1">{step.title}</h4>
                      <p className={`text-[11px] leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        {step.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pro Tips Section */}
            <div className={`rounded-2xl border p-4 mb-6 ${
              darkMode 
                ? 'border-cyan-500/20 bg-cyan-950/20 text-cyan-200' 
                : 'border-blue-200 bg-blue-50/70 text-blue-900'
            }`}>
              <div className="text-xs font-extrabold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-cyan-400" />
                <span>{isHindi ? 'विशेषज्ञ सुरक्षा सुझाव (Pro Tips):' : 'Expert Pro Tips:'}</span>
              </div>
              <ul className="space-y-1.5 text-xs">
                {currentModule.proTips.map((tip, tIdx) => (
                  <li key={tIdx} className="leading-relaxed">{tip}</li>
                ))}
              </ul>
            </div>

            {/* Direct Jump to Tool Button */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <span className="text-xs text-slate-400 font-medium">
                {isHindi ? 'इस टूल का लाइव उपयोग करना चाहते हैं?' : 'Want to try this tool live right now?'}
              </span>
              <button
                onClick={() => {
                  soundFx.playClick();
                  onNavigateTab(currentModule.tabTarget);
                }}
                className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-95 transition-all"
              >
                <span>{currentModule.quickActionLabel}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Interactive Feature Sandbox & Simulator Panel */}
      <div className={`rounded-3xl border p-6 sm:p-8 shadow-xl transition-all ${
        darkMode ? 'border-slate-800/80 bg-slate-900/90' : 'border-slate-200/80 bg-white'
      }`} id="guide-interactive-simulators">
        
        <div className="border-b pb-4 mb-6 border-slate-800/20 dark:border-slate-800 flex items-center justify-between">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/10 px-2.5 py-0.5 text-[10px] font-black text-cyan-400 border border-cyan-500/20 uppercase tracking-widest">
              <Zap className="h-3.5 w-3.5" />
              <span>{isHindi ? 'लाइव सिमुलेटर सैंडबॉक्स' : 'Interactive Readiness Sandbox'}</span>
            </div>
            <h3 className="text-lg sm:text-xl font-black">
              {isHindi ? 'सुरक्षा फीचर्स का लाइव टेस्ट करें' : 'Test Security Features in Real-time'}
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Simulator 1: Geofence Zone Tester */}
          <div className={`rounded-2xl border p-5 space-y-4 ${
            darkMode ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200 bg-slate-50'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="h-5 w-5 text-cyan-400" />
                <span className="font-bold text-xs">
                  {isHindi ? '1. जियोफेंस जोन टेस्ट' : '1. Geofence Zone Breach Simulator'}
                </span>
              </div>
              <span className="text-[10px] font-bold text-slate-400">Interactive</span>
            </div>

            <p className="text-xs text-slate-400">
              {isHindi 
                ? 'नीचे दिए गए सुरक्षा जोन्स पर क्लिक करके देखें कि सेफटूर एआई आपको कैसे अलर्ट करता है:'
                : 'Toggle between security zones below to test real-time telemetry and audio responses:'}
            </p>

            {/* Zone Selector Buttons */}
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => {
                  soundFx.playClick();
                  setSimSafetyZone('safe');
                }}
                className={`py-2 rounded-xl text-xs font-bold transition-all ${
                  simSafetyZone === 'safe'
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                    : darkMode ? 'bg-slate-900 text-slate-400' : 'bg-white text-slate-700 border border-slate-200'
                }`}
              >
                🟢 {isHindi ? 'सुरक्षित (Green)' : 'Green Zone'}
              </button>
              <button
                onClick={() => {
                  soundFx.playWarning();
                  setSimSafetyZone('caution');
                }}
                className={`py-2 rounded-xl text-xs font-bold transition-all ${
                  simSafetyZone === 'caution'
                    ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30'
                    : darkMode ? 'bg-slate-900 text-slate-400' : 'bg-white text-slate-700 border border-slate-200'
                }`}
              >
                🟡 {isHindi ? 'सतर्कता (Amber)' : 'Amber Zone'}
              </button>
              <button
                onClick={() => {
                  soundFx.playWarning();
                  setSimSafetyZone('danger');
                }}
                className={`py-2 rounded-xl text-xs font-bold transition-all ${
                  simSafetyZone === 'danger'
                    ? 'bg-red-600 text-white shadow-md shadow-red-500/30 animate-pulse'
                    : darkMode ? 'bg-slate-900 text-slate-400' : 'bg-white text-slate-700 border border-slate-200'
                }`}
              >
                🔴 {isHindi ? 'खतरा (Red)' : 'Red Alert'}
              </button>
            </div>

            {/* Live Feedback Window */}
            <div className={`rounded-xl p-3 border text-xs space-y-1 ${
              simSafetyZone === 'safe'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : simSafetyZone === 'caution'
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                  : 'bg-red-500/10 border-red-500/30 text-red-300'
            }`}>
              <div className="font-bold flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5" />
                <span>
                  {simSafetyZone === 'safe' && (isHindi ? 'सुरक्षित क्षेत्र: 24/7 पुलिस व सीसीटीवी गश्त सक्रिय।' : 'Safe Zone: 24/7 CCTV & Tourist Police Patrols Active.')}
                  {simSafetyZone === 'caution' && (isHindi ? 'सतर्कता क्षेत्र: भीड़भाड़ अधिक है, अपना सामान सुरक्षित रखें।' : 'Caution Zone: High crowd density & pickpocket alert.')}
                  {simSafetyZone === 'danger' && (isHindi ? 'उच्च चेतावनी: रात के समय इस क्षेत्र में अकेले न जाएं!' : 'High Alert: Avoid solo travel after sunset. Police notified.')}
                </span>
              </div>
              <div className="text-[11px] text-slate-400">
                {isHindi ? 'टेलीमेट्री रिस्पॉन्स समय: < 50ms • डिस्पैच स्टैंडबाय' : 'Telemetry Sync: < 50ms • Police Dispatch Standby'}
              </div>
            </div>
          </div>

          {/* Simulator 2: Decoy Call Simulator */}
          <div className={`rounded-2xl border p-5 space-y-4 ${
            darkMode ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200 bg-slate-50'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <PhoneCall className="h-5 w-5 text-amber-400" />
                <span className="font-bold text-xs">
                  {isHindi ? '2. ऑरा™ फेक इनकमिंग कॉल टेस्ट' : '2. AURA™ Decoy Call Simulator'}
                </span>
              </div>
              <span className="text-[10px] font-bold text-slate-400">Interactive</span>
            </div>

            <p className="text-xs text-slate-400">
              {isHindi
                ? 'देखें कि संदिग्ध कैब या सुनसान इलाके में फेक कॉल कैसे आपको सुरक्षित बाहर निकालती है:'
                : 'Experience how Decoy Call simulates an incoming phone call to help you excuse yourself:'}
            </p>

            {!simDecoyCallActive ? (
              <button
                onClick={() => {
                  soundFx.playWarning();
                  setSimDecoyCallActive(true);
                  setSimDecoyCallAnswered(false);
                }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-95 transition-all"
              >
                <PhoneCall className="h-4 w-4" />
                <span>{isHindi ? 'फेक कॉल शुरू करें (Trigger Test Call)' : 'Trigger Test Decoy Call'}</span>
              </button>
            ) : (
              <div className="rounded-2xl border border-amber-500/40 bg-slate-900 p-4 text-white text-center space-y-3 shadow-xl">
                {!simDecoyCallAnswered ? (
                  <>
                    <div className="flex justify-center">
                      <div className="h-12 w-12 rounded-full bg-amber-500/20 flex items-center justify-center animate-bounce">
                        <Phone className="h-6 w-6 text-amber-400" />
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-amber-400 uppercase tracking-widest">{isHindi ? 'आने वाली कॉल...' : 'Incoming Call...'}</div>
                      <div className="text-sm font-extrabold">{isHindi ? 'परिवार / पुलिस हेल्पलाइन' : 'Family / Police Support'}</div>
                    </div>
                    <div className="flex justify-center space-x-3 pt-1">
                      <button
                        onClick={() => {
                          soundFx.playClick();
                          setSimDecoyCallAnswered(true);
                        }}
                        className="px-4 py-1.5 rounded-xl bg-emerald-500 text-white text-xs font-bold flex items-center space-x-1 shadow-md hover:bg-emerald-600"
                      >
                        <Phone className="h-3.5 w-3.5" />
                        <span>{isHindi ? 'उठाएं (Answer)' : 'Answer'}</span>
                      </button>
                      <button
                        onClick={() => {
                          soundFx.playClick();
                          setSimDecoyCallActive(false);
                        }}
                        className="px-4 py-1.5 rounded-xl bg-red-600 text-white text-xs font-bold flex items-center space-x-1 shadow-md hover:bg-red-700"
                      >
                        <span>{isHindi ? 'काटें (Decline)' : 'Decline'}</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="space-y-2 py-1">
                    <div className="flex items-center justify-center space-x-2 text-emerald-400 text-xs font-bold">
                      <Volume2 className="h-4 w-4 animate-pulse" />
                      <span>{isHindi ? 'कॉल चालू है • ऑडियो स्पीच सक्रिय' : 'Call Connected • Audio Script Active'}</span>
                    </div>
                    <p className="text-[11px] text-slate-300 italic">
                      "{isHindi ? 'नमस्ते! हम 5 मिनट में आपकी लोकेशन पर पहुंच रहे हैं, गाड़ी में ही रहें।' : 'Hey! We are waiting at the corner near your cab, see you in 2 minutes.'}"
                    </p>
                    <button
                      onClick={() => setSimDecoyCallActive(false)}
                      className="px-4 py-1 rounded-xl bg-slate-800 text-xs text-slate-300 hover:text-white"
                    >
                      {isHindi ? 'कॉल समाप्त करें' : 'End Call Simulator'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Quick Knowledge Quiz */}
        <div className={`mt-6 rounded-2xl border p-5 ${
          darkMode ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200 bg-slate-50'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-purple-400" />
              <span className="font-bold text-xs">
                {isHindi ? 'पर्यटक सुरक्षा क्विज (Quick Readiness Check)' : 'Tourist Safety Readiness Check'}
              </span>
            </div>
            <span className="text-xs font-bold text-cyan-400">
              {simQuizSubmitted ? (isHindi ? 'प्रमाणित!' : 'Completed!') : (isHindi ? '3 प्रश्न' : '3 Questions')}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <p className="font-bold mb-1.5">{isHindi ? '1. दूरदराज पहाड़ में बिना इंटरनेट के क्या काम करेगा?' : '1. Which feature functions without any cellular network?'}</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 0, text: isHindi ? 'जीरो-नेट ऑफलाइन हब (Morse & Siren)' : 'Zero-Net Offline Hub (Morse & Siren)', correct: true },
                  { id: 1, text: isHindi ? 'गूगल सर्च लाइव' : 'Google Search Live', correct: false }
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setSimQuizAnswers(prev => ({ ...prev, 1: opt.id }))}
                    className={`px-3 py-1.5 rounded-xl border font-semibold transition-all ${
                      simQuizAnswers[1] === opt.id
                        ? opt.correct
                          ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
                          : 'border-red-500 bg-red-500/20 text-red-300'
                        : darkMode ? 'border-slate-800 bg-slate-900 text-slate-300' : 'border-slate-200 bg-white text-slate-700'
                    }`}
                  >
                    {opt.text}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="font-bold mb-1.5">{isHindi ? '2. पीला (Amber) जोन क्या दर्शाता है?' : '2. What does an Amber Geofence zone signify?'}</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 0, text: isHindi ? 'भीड़भाड़ व सतर्कता' : 'Caution & Pickpocket Awareness', correct: true },
                  { id: 1, text: isHindi ? 'पूर्ण सुरक्षित' : '100% Zero Risk', correct: false }
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setSimQuizAnswers(prev => ({ ...prev, 2: opt.id }))}
                    className={`px-3 py-1.5 rounded-xl border font-semibold transition-all ${
                      simQuizAnswers[2] === opt.id
                        ? opt.correct
                          ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
                          : 'border-red-500 bg-red-500/20 text-red-300'
                        : darkMode ? 'border-slate-800 bg-slate-900 text-slate-300' : 'border-slate-200 bg-white text-slate-700'
                    }`}
                  >
                    {opt.text}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Frequently Asked Questions (FAQ) Accordion */}
      <div className={`rounded-3xl border p-6 sm:p-8 shadow-xl transition-all ${
        darkMode ? 'border-slate-800/80 bg-slate-900/90' : 'border-slate-200/80 bg-white'
      }`} id="guide-faqs">
        <div className="flex items-center space-x-2.5 mb-6">
          <HelpCircle className="h-6 w-6 text-cyan-400" />
          <h3 className="text-lg sm:text-xl font-black">
            {isHindi ? 'अक्सर पूछे जाने वाले प्रश्न (FAQ)' : 'Frequently Asked Questions (FAQ)'}
          </h3>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = expandedFaq === idx;
            return (
              <div 
                key={idx}
                className={`rounded-2xl border transition-all ${
                  darkMode ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200 bg-slate-50'
                }`}
              >
                <button
                  onClick={() => {
                    soundFx.playClick();
                    setExpandedFaq(isOpen ? null : idx);
                  }}
                  className="flex w-full items-center justify-between p-4 text-left font-bold text-xs sm:text-sm"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-cyan-400' : ''}`} />
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden px-4 pb-4 text-xs leading-relaxed text-slate-400 border-t border-slate-800/20 dark:border-slate-800 pt-3"
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
