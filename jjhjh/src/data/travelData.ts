/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Comprehensive Real-World Global Emergency Helplines, Scams Database & Tourist Safety Intelligence
 */

export interface CountryEmergency {
  country: string;
  code: string;
  flag: string;
  police: string;
  ambulance: string;
  fire: string;
  generalEmergency: string;
  touristHelpline: string;
  embassySupport: string;
  languages: string[];
  safetyIndex: number; // 0-100
  travelAdvisory: 'Low Risk' | 'Exercise Caution' | 'High Risk';
  tip: string;
}

export interface RealScamInfo {
  id: string;
  title: string;
  location: string;
  category: 'taxi' | 'street' | 'hotel' | 'digital' | 'shopping' | 'photo';
  riskLevel: 'HIGH' | 'MEDIUM' | 'CRITICAL';
  description: string;
  howItWorks: string[];
  howToAvoid: string[];
  realExample: string;
}

export const GLOBAL_EMERGENCY_DATA: CountryEmergency[] = [
  {
    country: 'France (Paris & Riviera)',
    code: 'FR',
    flag: '🇫🇷',
    police: '17',
    ambulance: '15',
    fire: '18',
    generalEmergency: '112',
    touristHelpline: '+33 1 40 70 70 70',
    embassySupport: '+33 1 43 12 22 00 (US) / +33 1 44 51 31 00 (UK)',
    languages: ['French', 'English'],
    safetyIndex: 88,
    travelAdvisory: 'Low Risk',
    tip: 'In Paris, call 112 for multi-lingual dispatch. Watch out for pickpockets at Metro Line 1 and Eiffel Tower.'
  },
  {
    country: 'India (Delhi, Mumbai, Goa)',
    code: 'IN',
    flag: '🇮🇳',
    police: '100 / 112',
    ambulance: '102 / 108',
    fire: '101',
    generalEmergency: '112',
    touristHelpline: '1363 (24x7 Multi-lingual Tourist Infoline)',
    embassySupport: '+91 11 2419 8000',
    languages: ['Hindi', 'English'],
    safetyIndex: 82,
    travelAdvisory: 'Exercise Caution',
    tip: 'Use official prepaid taxi counters or Uber/Ola inside airport arrivals to prevent taxi fare overcharging.'
  },
  {
    country: 'United States',
    code: 'US',
    flag: '🇺🇸',
    police: '911',
    ambulance: '911',
    fire: '911',
    generalEmergency: '911',
    touristHelpline: '311 (Local Info)',
    embassySupport: '1-888-407-4747 (State Dept Hotline)',
    languages: ['English', 'Spanish'],
    safetyIndex: 85,
    travelAdvisory: 'Low Risk',
    tip: '911 connects automatically to local police, fire, and paramedic dispatch with precise GPS location pinning.'
  },
  {
    country: 'United Kingdom (London)',
    code: 'GB',
    flag: '🇬🇧',
    police: '999 (Non-emergency: 101)',
    ambulance: '999',
    fire: '999',
    generalEmergency: '999 / 112',
    touristHelpline: '+44 20 7222 1234',
    embassySupport: '+44 20 7499 9000',
    languages: ['English'],
    safetyIndex: 91,
    travelAdvisory: 'Low Risk',
    tip: 'Use official Black Cabs or licensed ride-hailing apps. Beware of phone snatchers on electric bikes in Central London.'
  },
  {
    country: 'Japan (Tokyo, Kyoto)',
    code: 'JP',
    flag: '🇯🇵',
    police: '110',
    ambulance: '119',
    fire: '119',
    generalEmergency: '110 / 119',
    touristHelpline: '050-3816-2720 (JNTO Japan Visitor Hotline)',
    embassySupport: '+81 3 3224 5000',
    languages: ['Japanese', 'English'],
    safetyIndex: 98,
    travelAdvisory: 'Low Risk',
    tip: 'Koban (Police Boxes) are located at almost every street intersection. Japan has one of the highest safety ratings globally.'
  },
  {
    country: 'United Arab Emirates (Dubai, Abu Dhabi)',
    code: 'AE',
    flag: '🇦🇪',
    police: '999',
    ambulance: '998',
    fire: '997',
    generalEmergency: '999',
    touristHelpline: '800 4438 (Dubai Tourist Police)',
    embassySupport: '+971 2 414 2200',
    languages: ['Arabic', 'English'],
    safetyIndex: 96,
    travelAdvisory: 'Low Risk',
    tip: 'Dubai Tourist Police offers 24/7 assistance via app or 800-4438 for lost items or disputes.'
  },
  {
    country: 'Italy (Rome, Milan, Venice)',
    code: 'IT',
    flag: '🇮🇹',
    police: '112 (Carabinieri: 112, Polizia: 113)',
    ambulance: '118',
    fire: '115',
    generalEmergency: '112',
    touristHelpline: '+39 06 49701',
    embassySupport: '+39 06 46741',
    languages: ['Italian', 'English'],
    safetyIndex: 86,
    travelAdvisory: 'Low Risk',
    tip: 'Watch out for friendship bracelet scams near the Colosseum and Duomo di Milano. Keep belongings zipped.'
  },
  {
    country: 'Thailand (Bangkok, Phuket)',
    code: 'TH',
    flag: '🇹🇭',
    police: '191',
    ambulance: '1669',
    fire: '199',
    generalEmergency: '1155 (Tourist Police)',
    touristHelpline: '1155 (24 Hours English Dispatch)',
    embassySupport: '+66 2 205 4000',
    languages: ['Thai', 'English'],
    safetyIndex: 84,
    travelAdvisory: 'Exercise Caution',
    tip: 'Always ensure Tuk-Tuk driver or Taxi driver agrees to use the meter ("Meter-Na-Khrap") before getting in.'
  },
  {
    country: 'Spain (Barcelona, Madrid)',
    code: 'ES',
    flag: '🇪🇸',
    police: '091 (National) / 092 (Local)',
    ambulance: '061',
    fire: '080',
    generalEmergency: '112',
    touristHelpline: '+34 902 102 112 (Foreign Tourist Attention Service)',
    embassySupport: '+34 91 587 2200',
    languages: ['Spanish', 'English'],
    safetyIndex: 89,
    travelAdvisory: 'Low Risk',
    tip: 'In Barcelona Las Ramblas and Sagrada Familia metro stops, keep backpacks in front of you.'
  },
  {
    country: 'Germany (Berlin, Munich)',
    code: 'DE',
    flag: '🇩🇪',
    police: '110',
    ambulance: '112',
    fire: '112',
    generalEmergency: '112',
    touristHelpline: '116 116 (Card Lock Hotline)',
    embassySupport: '+49 30 83050',
    languages: ['German', 'English'],
    safetyIndex: 93,
    travelAdvisory: 'Low Risk',
    tip: 'All public transport tickets must be stamped/validated (Entwerten) before boarding to avoid €60 fines.'
  }
];

export const REAL_SCAMS_DATABASE: RealScamInfo[] = [
  {
    id: 'scam-1',
    title: 'The Found Gold Ring Trick',
    location: 'Paris (Louvre, Seine Banks), Rome, London',
    category: 'street',
    riskLevel: 'HIGH',
    description: 'A stranger bends down in front of you, pretends to pick up a thick gold ring, and claims you dropped it.',
    howItWorks: [
      'Accomplice drops a cheap brass ring right at your feet.',
      'They pick it up, show it to you, and insist it looks valuable and belongs to you.',
      'When you deny it, they offer to sell it to you for €20-€50 "for good luck".',
      'While you pull out your wallet, an accomplice may pickpocket you.'
    ],
    howToAvoid: [
      'Firmly say "NO" and keep walking without stopping.',
      'Never open your wallet in front of aggressive street vendors.',
      'Keep hands in your pockets or on your zip-bag.'
    ],
    realExample: 'Common near Jardin des Tuileries in Paris. The ring is worth less than €0.10 made of polished brass.'
  },
  {
    id: 'scam-2',
    title: 'Broken Taxi Meter / Fixed Airport Rate Overcharge',
    location: 'Global (Airports, Train Stations)',
    category: 'taxi',
    riskLevel: 'CRITICAL',
    description: 'Unlicensed cab driver claims meter is broken or demands triple the legal rate after luggage is loaded.',
    howItWorks: [
      'Driver approaches you inside terminal before official taxi stand.',
      'Promises a quick ride, then demands €100+ cash mid-trip claiming "flat night rate" or "baggage surcharges".'
    ],
    howToAvoid: [
      'Only join the official queue marked "Taxi Officiel".',
      'In Paris, legal fixed rates are strictly set by law: CDG Airport to Right Bank €56, Left Bank €65.',
      'Use ride-hailing apps (Uber, Bolt, FreeNow) with prepaid credit card tracking.'
    ],
    realExample: 'In Paris CDG airport, illegal hustlers near exit gates charge tourists €150 for a €50 ride.'
  },
  {
    id: 'scam-3',
    title: 'The "Friendship Bracelet" & Rose Trap',
    location: 'Sacré-Cœur Paris, Milan Duomo, Rome Colosseum',
    category: 'street',
    riskLevel: 'HIGH',
    description: 'Vendors aggressively grab your wrist, tie a string bracelet around your finger/wrist, then demand money.',
    howItWorks: [
      'Vendor acts extremely friendly, saying "A free gift for you my friend!".',
      'Quickly ties tight knots on your wrist that are hard to take off.',
      'Immediately becomes loud and demanding €10-€20, drawing a crowd to embarrass you into paying.'
    ],
    howToAvoid: [
      'Keep your hands folded or inside pockets when approaching Sacré-Cœur stairs.',
      'Do not make eye contact or respond to strangers trying to touch your hand.',
      'If tied, walk away into a shop or towards police officer.'
    ],
    realExample: 'Very high density at Sacré-Cœur Basilica hill steps.'
  },
  {
    id: 'scam-4',
    title: 'Fake Plainclothes Police ID Inspection',
    location: 'Madrid, Barcelona, Prague, Rome',
    category: 'street',
    riskLevel: 'CRITICAL',
    description: 'Impostors dressed in normal clothes show fake badges, accusing you of holding counterfeit money or illegal goods.',
    howItWorks: [
      'They stop you on a quiet street showing a fake plastic badge.',
      'Demand to see your passport and search your wallet to "verify currency".',
      'Slight-of-hand steal cash bills while returning wallet.'
    ],
    howToAvoid: [
      'Real police officers in Europe rarely inspect tourist wallets for counterfeit money.',
      'Politely ask to walk to the nearest official Police Station (Commissariat / Police Box) before opening wallet.',
      'Call 112 on the spot.'
    ],
    realExample: 'Reported around tourist plazas in Southern & Eastern Europe.'
  },
  {
    id: 'scam-5',
    title: 'Deaf / Mute Charity Petition Distraction',
    location: 'Eiffel Tower Paris, Notre Dame, Berlin Alexanderplatz',
    category: 'digital',
    riskLevel: 'MEDIUM',
    description: 'Group of young people holding clipboards approach you asking for signatures for a fake international charity.',
    howItWorks: [
      'Clipboard is pushed close to your chest or face.',
      'While you read or sign, accomplices below clipboard level unzip your bag or pocket.'
    ],
    howToAvoid: [
      'Shake head "No", do not touch clipboard.',
      'Walk past without slowing down.'
    ],
    realExample: 'High occurrence around Champ de Mars lawn near Eiffel Tower.'
  }
];

export const LIVE_WEATHER_AQI = {
  location: 'Paris, Île-de-France',
  countryCode: 'FR',
  temperature: 23, // Celsius
  condition: 'Partly Cloudy & Pleasant',
  humidity: 58,
  windSpeedKmH: 14,
  uvIndex: 4,
  airQualityIndex: 34, // AQI Good
  aqiCategory: 'Good (Clean Air)',
  safetyImpact: 'Optimal for outdoor walking & sightseeing.',
  forecast: [
    { day: 'Today', temp: '23°C / 14°C', icon: 'partly-cloudy', safeHours: '6:00 AM - 10:30 PM' },
    { day: 'Tomorrow', temp: '25°C / 16°C', icon: 'sunny', safeHours: '6:00 AM - 11:00 PM' },
    { day: 'Thursday', temp: '21°C / 13°C', icon: 'rain', safeHours: '7:00 AM - 9:00 PM (Bring Umbrella)' },
    { day: 'Friday', temp: '24°C / 15°C', icon: 'sunny', safeHours: '6:00 AM - 11:30 PM' }
  ]
};

export const REAL_CURRENCY_RATES: Record<string, number> = {
  EUR: 1.0,
  USD: 1.09,
  INR: 91.20,
  GBP: 0.85,
  JPY: 162.40,
  CAD: 1.48,
  AUD: 1.64,
  AED: 4.00,
  CHF: 0.96,
  SGD: 1.46
};
