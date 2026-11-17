/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Globe, 
  ShieldCheck, 
  MapPin, 
  Bot, 
  Sparkles, 
  Radio, 
  ShieldAlert, 
  Building, 
  Settings, 
  Presentation, 
  User,
  Compass,
  Zap,
  BookOpen,
  WifiOff
} from 'lucide-react';

interface ToolHeaderProps {
  toolId: string;
  language?: string;
  t?: (key: string) => string;
  darkMode?: boolean;
}

const TOOL_CONFIGS_HI: Record<string, {
  name: string;
  subtitle: string;
  category: string;
  badgeText: string;
}> = {
  home: {
    name: "सेफटूर एआई • सुरक्षित गंतव्य रडार",
    subtitle: "अगली पीढ़ी की स्मार्ट पर्यटक सुरक्षा, रीयल-टाइम सुरक्षा रेटिंग व नेविगेशन नेटवर्क",
    category: "मुख्य प्लेटफ़ॉर्म",
    badgeText: "स्मार्ट टूरिस्ट सेफगार्ड सक्रिय"
  },
  dashboard: {
    name: "पर्यटक सुरक्षा एवं कमांड डैशबोर्ड",
    subtitle: "लाइव सुरक्षा रेटिंग, वास्तविक समय आपातकालीन निगरानी व डिजिटल सत्यापन",
    category: "सुरक्षा संचालन",
    badgeText: "लाइव टेलीमेट्री सिंक"
  },
  map: {
    name: "स्मार्ट जियोफेंस व इंसिडेंट मैप",
    subtitle: "वास्तविक समय घटना रडार, सुरक्षित क्षेत्र व पुलिस स्टेशन रिस्पॉन्स",
    category: "भौगोलिक रडार",
    badgeText: "लाइव जीपीएस सक्रिय"
  },
  planner: {
    name: "जेमिनी एआई स्मार्ट यात्रा योजनाकार",
    subtitle: "स्वचालित यात्रा कार्यक्रम - वास्तविक स्थल, प्रवेश टिकट, इतिहास व लाइव दूरी",
    category: "एआई यात्रा बुद्धिमत्ता",
    badgeText: "जेमिनी एआई इंजन सक्रिय"
  },
  guide: {
    name: "सेफटूर एआई मास्टर यूजर गाइड व ट्यूटोरियल",
    subtitle: "सभी 10+ सुरक्षा फीचर्स का सचित्र विवरण, लाइव सिमुलेटर एवं इंटरएक्टिव ट्रेनिंग",
    category: "उपयोगकर्ता मार्गदर्शन",
    badgeText: "विस्तृत ट्यूटोरियल व सिमुलेटर"
  },
  poster: {
    name: "अकादमिक रिसर्च प्रोजेक्ट पोस्टर",
    subtitle: "कॉलेज एवं यूनिवर्सिटी प्रेजेंटेशन के लिए एचडी पोस्टर डाउनलोड केंद्र",
    category: "प्रोजेक्ट केंद्र",
    badgeText: "उच्च गुणवत्ता पोस्टर"
  },
  recs: {
    name: "एआई सत्यापित स्थल एवं सुझाव",
    subtitle: "प्रमाणित सुरक्षित स्थान, सत्यापित होटल, खान-पान एवं ठगी-मुक्त गाइड",
    category: "स्मार्ट खोज",
    badgeText: "सेफ़ज़ोन सत्यापित"
  },
  aura: {
    name: "ऑरा™ स्टील्थ न्यूरल सेन्टिनेल",
    subtitle: "बैकग्राउंड खतरा पहचान, नकली कॉल, साइलेंट ड्युरेस अलार्म व स्वायत्त सुरक्षा",
    category: "स्वायत्त रक्षा",
    badgeText: "पैसिव स्टील्थ शील्ड चालू"
  },
  offline: {
    name: "जीरो-नेट ऑफलाइन सर्वाइवल हब",
    subtitle: "बिना इंटरनेट के मोर्स कोड एसओएस, 120dB सायरन, फर्स्ट-एड एवं सर्वाइवल वाक्यांश",
    category: "ऑफलाइन सर्वाइवल",
    badgeText: "100% जीरो-नेट रेडी"
  },
  extras: {
    name: "इंटरएक्टिव एआई सुरक्षा टूलकिट",
    subtitle: "रियल-टाइम अनुवादक, स्कैम व ओवरचार्ज डिटेक्टर, लैंडमार्क स्कैनर व खोया-पाया केंद्र",
    category: "उपयोगिता हब",
    badgeText: "मल्टी-टूल टूलकिट सक्रिय"
  },
  government: {
    name: "सरकारी एवं पर्यटन प्राधिकरण पोर्टल",
    subtitle: "क्षेत्रीय सुरक्षा रेटिंग, बुनियादी ढांचा निर्देश व सार्वजनिक सुरक्षा निर्देश",
    category: "सरकारी कमांड",
    badgeText: "आधिकारिक सुरक्षा निगरानी"
  },
  emergency: {
    name: "आपातकालीन डिस्पैच एवं त्वरित बचाव कमान",
    subtitle: "पुलिस एवं मेडिकल डिस्पैच यूनिट, लाइव जीपीएस बीकन व एसओएस मॉनिटर",
    category: "प्रथम प्रतिक्रियाकर्ता",
    badgeText: "24/7 आपातकालीन बचाव नेटवर्क"
  },
  admin: {
    name: "सिस्टम मास्टर प्रशासन कंसोल",
    subtitle: "ग्लोबल उपयोगकर्ता सत्यापन, प्लेटफ़ॉर्म टेलीमेट्री व डेटाबेस नियंत्रण",
    category: "सिस्टम संचालन",
    badgeText: "मास्टर रूट एक्सेस"
  },
  presentation: {
    name: "सेफटूर एआई आर्किटेक्चर एवं फीचर्स",
    subtitle: "इंटरएक्टिव तकनीकी अवलोकन, सिस्टम आरेख व क्षमताएं",
    category: "सिस्टम ओवरव्यू",
    badgeText: "इंटरएक्टिव डेक"
  },
  profile: {
    name: "पर्यटक पहचान एवं डिजिटल पास केंद्र",
    subtitle: "सत्यापित क्यूआर पास, पासपोर्ट मेटाडेटा, आपातकालीन संपर्क व चिकित्सा निर्देश",
    category: "डिजिटल क्रेडेंशियल",
    badgeText: "डिजिटल आईडी सक्रिय"
  }
};

const TOOL_CONFIGS: Record<string, {
  name: string;
  subtitle: string;
  category: string;
  icon: any;
  gradient: string;
  accentBg: string;
  badgeText: string;
}> = {
  home: {
    name: "SafeTour AI • Explore & Safety Radar",
    subtitle: "Next-Gen Smart Tourist Protection, Real-time Advisory & Emergency Mesh",
    category: "Main Platform",
    icon: Globe,
    gradient: "from-blue-600 via-indigo-600 to-cyan-400",
    accentBg: "bg-blue-500/10 text-cyan-400 border-blue-500/20",
    badgeText: "Smart Tourist Safeguard Active"
  },
  dashboard: {
    name: "Tourist Safety & Command Dashboard",
    subtitle: "Live Security Ratings, Real-Time Emergency Monitoring & Digital Verification",
    category: "Security Operations",
    icon: ShieldCheck,
    gradient: "from-blue-600 via-indigo-600 to-cyan-500",
    accentBg: "bg-blue-500/10 text-cyan-400 border-blue-500/20",
    badgeText: "Live Telemetry Synchronized"
  },
  map: {
    name: "Smart Geofence & Incident Heatmap",
    subtitle: "Real-time Incident Radar, Safe Haven Zones & Police Station Dispatch Coordinates",
    category: "Geospatial Radar",
    icon: MapPin,
    gradient: "from-emerald-600 via-teal-600 to-cyan-500",
    accentBg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    badgeText: "GPS Coordinates Active"
  },
  planner: {
    name: "Gemini AI Smart Itinerary Planner & Comparison",
    subtitle: "Automated Tour Schedules with Entry Prices, History, Budget & Side-by-Side Comparison",
    category: "AI Travel Intelligence",
    icon: Bot,
    gradient: "from-purple-600 via-indigo-600 to-cyan-400",
    accentBg: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    badgeText: "Gemini AI Engine Active"
  },
  guide: {
    name: "SafeTour AI Master User Guide & Interactive Tutorial",
    subtitle: "Comprehensive step-by-step documentation, live feature simulators & readiness sandbox",
    category: "Master Guide",
    icon: BookOpen,
    gradient: "from-cyan-500 via-blue-600 to-indigo-600",
    accentBg: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    badgeText: "Full Feature Deep Dive & Sandbox"
  },
  poster: {
    name: "Academic Research Project Poster",
    subtitle: "University Computer Science Presentation Poster Download Center",
    category: "Research Center",
    icon: Sparkles,
    gradient: "from-blue-600 via-indigo-600 to-violet-600",
    accentBg: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    badgeText: "HD Quality Poster"
  },
  recs: {
    name: "AI Verified Places & Safety Recommendations",
    subtitle: "Curated Safe Venues, Verified Hotels, Certified Dining & Scam-Free Guides",
    category: "Smart Discovery",
    icon: Sparkles,
    gradient: "from-amber-500 via-orange-500 to-cyan-500",
    accentBg: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    badgeText: "SafeZone Verified"
  },
  aura: {
    name: "AURA™ Stealth Neural Sentinel",
    subtitle: "Background Threat Perception, Decoy Calls, Silent Duress PIN & Anomaly Detection",
    category: "Autonomous Defense",
    icon: Radio,
    gradient: "from-cyan-500 via-blue-600 to-violet-600",
    accentBg: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    badgeText: "Passive Stealth Shield ON"
  },
  offline: {
    name: "Zero-Net Offline Survival Hub (100% Client-Side)",
    subtitle: "Optical Morse Code SOS, 120dB Acoustic Siren, First-Aid Guide & Phrasebook",
    category: "Zero-Net Offline",
    icon: WifiOff,
    gradient: "from-teal-500 via-cyan-600 to-blue-600",
    accentBg: "bg-teal-500/10 text-teal-400 border-teal-500/20",
    badgeText: "100% Zero-Net Ready"
  },
  extras: {
    name: "Interactive AI Safety Suite & Utilities",
    subtitle: "Real-time Audio Translator, Scam Detector, Landmark Scanner & Lost Item Portal",
    category: "Utility Hub",
    icon: ShieldAlert,
    gradient: "from-violet-600 via-indigo-600 to-cyan-500",
    accentBg: "bg-violet-500/10 text-violet-400 border-violet-500/20",
    badgeText: "Multi-Tool Toolkit Active"
  },
  government: {
    name: "Government & Tourism Authority Portal",
    subtitle: "Regional Safety Ratings, Infrastructure Advisories & Public Security Directives",
    category: "Government Command",
    icon: Building,
    gradient: "from-amber-600 via-indigo-600 to-cyan-500",
    accentBg: "bg-indigo-500/10 text-cyan-400 border-indigo-500/20",
    badgeText: "Official Security Oversight"
  },
  emergency: {
    name: "Emergency Dispatch & Rapid Rescue Command",
    subtitle: "Police & Medical Dispatch Units, Live GPS Beacon Triangulation & SOS Monitor",
    category: "First Responders",
    icon: Zap,
    gradient: "from-red-600 via-rose-600 to-orange-500",
    accentBg: "bg-red-500/10 text-red-400 border-red-500/20",
    badgeText: "24/7 First Responder Grid"
  },
  admin: {
    name: "System Master Administration Console",
    subtitle: "Global User Verification, Platform Telemetry, Database Diagnostics & Access Control",
    category: "System Operations",
    icon: Settings,
    gradient: "from-slate-800 via-indigo-950 to-blue-900",
    accentBg: "bg-slate-500/10 text-slate-300 border-slate-700",
    badgeText: "Master Root Access"
  },
  presentation: {
    name: "SafeTour AI Architecture & Features",
    subtitle: "Interactive Technical Overview, System Diagrams & Enterprise Capabilities",
    category: "System Overview",
    icon: Presentation,
    gradient: "from-blue-700 via-cyan-600 to-indigo-600",
    accentBg: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    badgeText: "Interactive Deck"
  },
  profile: {
    name: "Tourist Identity & Digital Pass Center",
    subtitle: "Verified QR Pass, Passport Metadata, Emergency Contacts & Medical Directives",
    category: "Digital Credentials",
    icon: User,
    gradient: "from-teal-600 via-cyan-600 to-blue-700",
    accentBg: "bg-teal-500/10 text-teal-400 border-teal-500/20",
    badgeText: "Digital ID Active"
  }
};

export default function ToolTransitionHeader({ toolId, language = 'en', darkMode = false }: ToolHeaderProps) {
  const isHindi = language === 'hi';
  const baseConfig = TOOL_CONFIGS[toolId] || TOOL_CONFIGS.home;
  const hiConfig = TOOL_CONFIGS_HI[toolId] || TOOL_CONFIGS_HI.home;

  const config = {
    ...baseConfig,
    name: isHindi ? hiConfig.name : baseConfig.name,
    subtitle: isHindi ? hiConfig.subtitle : baseConfig.subtitle,
    category: isHindi ? hiConfig.category : baseConfig.category,
    badgeText: isHindi ? hiConfig.badgeText : baseConfig.badgeText,
  };

  const IconComponent = config.icon;

  return (
    <div
      className={`relative overflow-hidden rounded-3xl border p-5 shadow-lg mb-6 transition-all duration-300 ${
        darkMode
          ? 'border-slate-800/80 bg-slate-900/90 text-white'
          : 'border-slate-200/80 bg-white text-slate-900'
      }`}
    >
      {/* Background colorful glowing gradient wave */}
      <div className={`absolute -right-12 -top-12 h-44 w-44 rounded-full bg-gradient-to-br ${config.gradient} opacity-20 blur-2xl pointer-events-none`} />
      <div className={`absolute -left-12 -bottom-12 h-44 w-44 rounded-full bg-gradient-to-tr ${config.gradient} opacity-15 blur-2xl pointer-events-none`} />

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start space-x-3.5">
          {/* Icon Badge */}
          <div 
            className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${config.gradient} text-white shadow-lg shadow-blue-500/20`}
          >
            <IconComponent className="h-6 w-6" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center space-x-2 flex-wrap">
              <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${config.accentBg}`}>
                <Zap className="h-2.5 w-2.5" />
                {config.category}
              </span>
              <span className="text-[10px] font-bold text-slate-400">
                • {config.badgeText}
              </span>
            </div>

            <h2 className="font-sans text-lg sm:text-xl font-extrabold tracking-tight flex items-center gap-2">
              <span className={`bg-gradient-to-r ${config.gradient} bg-clip-text text-transparent`}>
                {config.name}
              </span>
            </h2>

            <p className={`text-xs font-medium max-w-2xl leading-relaxed ${
              darkMode ? 'text-slate-300' : 'text-slate-500'
            }`}>
              {config.subtitle}
            </p>
          </div>
        </div>

        {/* Live Active Indicator */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 border-slate-800/20 pt-3 sm:pt-0">
          <div className="flex items-center space-x-1.5 bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-full border border-emerald-500/30 shadow-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-bold tracking-wide">
              {isHindi ? 'सक्रिय एवं लाइव' : 'ACTIVE & LIVE'}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono mt-1 hidden sm:block">
            SafeTour AI v2.6 • Real-time Protection
          </span>
        </div>
      </div>
    </div>
  );
}
