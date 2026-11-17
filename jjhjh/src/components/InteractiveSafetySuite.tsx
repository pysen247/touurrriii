/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  PhoneCall, 
  ShieldCheck, 
  AlertTriangle, 
  Smartphone, 
  Radio, 
  WifiOff, 
  Globe2, 
  DollarSign, 
  SunMedium, 
  Wind, 
  Sparkles, 
  Compass, 
  Copy, 
  Check, 
  ExternalLink,
  ShieldAlert,
  Search,
  Zap,
  ArrowRight,
  Info,
  MapPin,
  Lock,
  RotateCcw,
  Share2,
  ArrowRightLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  GLOBAL_EMERGENCY_DATA, 
  REAL_SCAMS_DATABASE, 
  LIVE_WEATHER_AQI, 
  REAL_CURRENCY_RATES,
  CountryEmergency,
  RealScamInfo
} from '../data/travelData';
import { soundFx } from '../utils/audio';

interface InteractiveSafetySuiteProps {
  darkMode: boolean;
  t: (key: string) => string;
  language?: string;
  userCoords?: { lat: number; lng: number };
}

export default function InteractiveSafetySuite({
  darkMode,
  t,
  language = 'en',
  userCoords
}: InteractiveSafetySuiteProps) {
  const isHindi = language === 'hi';
  // Country Hotline Selector
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>('IN');
  const selectedCountry = GLOBAL_EMERGENCY_DATA.find(c => c.code === selectedCountryCode) || GLOBAL_EMERGENCY_DATA[0];

  // Live GPS coordinates for Emergency Gateway
  const activeLat = userCoords?.lat || 26.9124;
  const activeLng = userCoords?.lng || 75.7873;

  // Live Weather & AQI state
  const [liveWeather, setLiveWeather] = useState<{
    temperature: number;
    location: string;
    condition: string;
    airQualityIndex: number;
    aqiCategory: string;
    humidity: number;
    windSpeedKmH: number;
    safetyImpact: string;
  }>({
    temperature: LIVE_WEATHER_AQI.temperature,
    location: `GPS ${activeLat.toFixed(2)}°N, ${activeLng.toFixed(2)}°E`,
    condition: LIVE_WEATHER_AQI.condition,
    airQualityIndex: LIVE_WEATHER_AQI.airQualityIndex,
    aqiCategory: LIVE_WEATHER_AQI.aqiCategory,
    humidity: LIVE_WEATHER_AQI.humidity,
    windSpeedKmH: LIVE_WEATHER_AQI.windSpeedKmH,
    safetyImpact: LIVE_WEATHER_AQI.safetyImpact
  });

  useEffect(() => {
    fetch(`/api/weather/forecast?lat=${encodeURIComponent(activeLat)}&lng=${encodeURIComponent(activeLng)}`)
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        if (data?.current) {
          setLiveWeather({
            temperature: data.current.temperature,
            location: data.location || `${activeLat.toFixed(2)}°N, ${activeLng.toFixed(2)}°E`,
            condition: data.current.condition,
            airQualityIndex: data.current.airQualityIndex,
            aqiCategory: data.current.aqiCategory,
            humidity: data.current.humidity,
            windSpeedKmH: data.current.windSpeedKmH,
            safetyImpact: data.current.safetyImpact
          });
        }
      })
      .catch(() => {});
  }, [activeLat, activeLng]);

  // SMS / Off-Grid Range Calculator State
  const [userSignalDistance, setUserSignalDistance] = useState<number>(12); // km from tower
  const [copiedSms, setCopiedSms] = useState(false);

  // Scam Investigator State
  const [scamSearch, setScamSearch] = useState('');
  const [selectedScam, setSelectedScam] = useState<RealScamInfo | null>(REAL_SCAMS_DATABASE[0]);
  const [customText, setCustomText] = useState('');
  const [analyzingText, setAnalyzingText] = useState(false);
  const [scamAnalysisResult, setScamAnalysisResult] = useState<{
    riskScore: number;
    riskLevel: 'SAFE' | 'SUSPICIOUS' | 'DANGEROUS SCAM';
    reasons: string[];
    action: string;
  } | null>(null);

  // Live FX Converter State
  const [amount, setAmount] = useState<number>(100);
  const [fromCurrency, setFromCurrency] = useState<string>('USD');
  const [toCurrency, setToCurrency] = useState<string>('INR');
  const [fxRates, setFxRates] = useState<Record<string, number>>(REAL_CURRENCY_RATES);
  const [fxSource, setFxSource] = useState<string>('baseline');

  useEffect(() => {
    fetch('/api/fx/rates')
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        if (data?.rates) {
          setFxRates(data.rates);
          setFxSource(data.source || 'live');
        }
      })
      .catch(() => {});
  }, []);

  const convertedAmount = ((amount * (fxRates[toCurrency] || 1)) / (fxRates[fromCurrency] || 1)).toFixed(2);

  // Calculate SMS & Tower Feasibility
  const getTowerSignalStatus = (km: number) => {
    if (km <= 5) return { status: 'Strong 4G/5G Coverage', color: 'text-emerald-500', bar: 'bg-emerald-500', width: '95%', desc: 'Full internet, GPS & SMS operational.' };
    if (km <= 18) return { status: 'Medium 3G/2G GSM Range', color: 'text-blue-500', bar: 'bg-blue-500', width: '70%', desc: 'SMS text message & emergency voice calls fully functional without high-speed data.' };
    if (km <= 35) return { status: 'Rural 2G Cellular Tower Limit (35 km max)', color: 'text-amber-500', bar: 'bg-amber-500', width: '40%', desc: 'SMS text message can still transmit under line-of-sight! Internet will be offline.' };
    return { status: 'Out of Terrestrial Cell Range (>35 km)', color: 'text-red-500', bar: 'bg-red-500', width: '15%', desc: 'Cell towers unreachable. Switch to Satellite Emergency SOS (Apple/Garmin) or Mesh Beacon.' };
  };

  const signalInfo = getTowerSignalStatus(userSignalDistance);

  const runOfflineScamHeuristic = (input: string) => {
    const textLower = input.toLowerCase();
    let score = 15;
    const reasons: string[] = [];

    if (textLower.includes('gold') || textLower.includes('ring') || textLower.includes('dropped')) {
      score += 60;
      reasons.push('Matches "Found Gold Ring" street distraction scam pattern.');
    }
    if (textLower.includes('taxi') || textLower.includes('broken meter') || textLower.includes('flat rate')) {
      score += 65;
      reasons.push('Detects illegal unmetered taxi overcharge pattern.');
    }
    if (textLower.includes('friend') || textLower.includes('bracelet') || textLower.includes('free gift')) {
      score += 70;
      reasons.push('Matches aggressive "Friendship Bracelet" extortion trap.');
    }
    if (textLower.includes('police') || textLower.includes('badge') || textLower.includes('wallet') || textLower.includes('passport')) {
      score += 75;
      reasons.push('Detects plainclothes fake police wallet inspection threat.');
    }
    if (textLower.includes('http') || textLower.includes('bit.ly') || textLower.includes('click') || textLower.includes('fine')) {
      score += 50;
      reasons.push('Contains unverified phishing link pretending to be official fine or ticket.');
    }

    if (score < 30) {
      return {
        riskScore: Math.min(score, 25),
        riskLevel: 'SAFE' as const,
        reasons: ['No obvious extortion or distraction patterns recognized.'],
        action: 'Standard interaction. Always maintain basic situational awareness.'
      };
    }
    if (score < 60) {
      return {
        riskScore: score,
        riskLevel: 'SUSPICIOUS' as const,
        reasons: reasons.length ? reasons : ['Contains pushy or unexpected requests for money/attention.'],
        action: 'Exercise caution. Do not hand over cash, passport, or open your wallet.'
      };
    }
    return {
      riskScore: Math.min(score, 98),
      riskLevel: 'DANGEROUS SCAM' as const,
      reasons: reasons.length ? reasons : ['High correlation with documented tourist fraud techniques.'],
      action: 'Walk away immediately. If threatened, approach a uniformed officer or call 112.'
    };
  };

  const handleAnalyzeCustomText = async () => {
    if (!customText.trim()) return;
    soundFx.playClick();
    setAnalyzingText(true);
    setScamAnalysisResult(null);

    try {
      const token = localStorage.getItem('safetour_token') || 'token_tourist';
      const res = await fetch('/api/gemini/scam-detection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ description: customText.trim() })
      });
      if (res.ok) {
        const data = await res.json();
        const prob = Number(data.scamProbability ?? 50);
        const riskLevel = prob >= 65 ? 'DANGEROUS SCAM' : prob >= 35 ? 'SUSPICIOUS' : 'SAFE';
        setScamAnalysisResult({
          riskScore: prob,
          riskLevel,
          reasons: Array.isArray(data.countermeasures) && data.countermeasures.length ? data.countermeasures : [data.analysis || 'Analyzed by Scam Defense AI'],
          action: data.analysis || 'Follow standard safety precautions.'
        });
        soundFx.playSuccess();
        setAnalyzingText(false);
        return;
      }
    } catch {
      // Fallback to local offline rule analyzer
    }

    setScamAnalysisResult(runOfflineScamHeuristic(customText));
    soundFx.playSuccess();
    setAnalyzingText(false);
  };

  const filteredScams = REAL_SCAMS_DATABASE.filter(s => 
    s.title.toLowerCase().includes(scamSearch.toLowerCase()) || 
    s.location.toLowerCase().includes(scamSearch.toLowerCase()) || 
    s.category.toLowerCase().includes(scamSearch.toLowerCase())
  );

  return (
    <div className="space-y-8" id="interactive-safety-suite-root">
      
      {/* 1. GLOBAL EMERGENCY HELPLINES (Real Direct Hotline & One-Touch Dialing) */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-3xl border p-6 sm:p-8 shadow-xl transition-all ${
          darkMode 
            ? 'border-slate-800 bg-slate-900/90 text-white backdrop-blur-xl' 
            : 'border-slate-200/80 bg-white text-slate-900 shadow-slate-200/50'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200/30">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-3 w-3 rounded-full bg-red-500 animate-ping" />
              <span className="text-xs font-bold uppercase tracking-wider text-red-500">Live Global Helplines</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight mt-1">Country Emergency Direct Dispatch</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Official police, ambulance, fire, and embassy hotlines with 1-click speed dialer.
            </p>
          </div>

          {/* Country Selector Dropdown */}
          <div className="flex items-center gap-2">
            <Globe2 className="h-5 w-5 text-blue-500 shrink-0" />
            <select
              value={selectedCountryCode}
              onChange={(e) => {
                soundFx.playClick();
                setSelectedCountryCode(e.target.value);
              }}
              className={`rounded-2xl border px-4 py-2.5 text-sm font-bold shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                darkMode 
                  ? 'border-slate-700 bg-slate-800 text-white' 
                  : 'border-slate-300 bg-slate-50 text-slate-800'
              }`}
            >
              {GLOBAL_EMERGENCY_DATA.map(c => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.country}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Selected Country Hotline Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          
          {/* General Emergency 112/911 */}
          <motion.a
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            href={`tel:${selectedCountry.generalEmergency.split(' ')[0]}`}
            onClick={() => soundFx.playClick()}
            className="rounded-2xl border border-red-500/30 bg-gradient-to-br from-red-500/10 to-rose-500/5 p-4 flex flex-col justify-between group hover:border-red-500 transition-all shadow-md"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase text-red-500 tracking-wider">Universal Dispatch</span>
                <PhoneCall className="h-4 w-4 text-red-500 group-hover:animate-bounce" />
              </div>
              <div className="text-3xl font-black text-red-600 dark:text-red-400 mt-2">
                {selectedCountry.generalEmergency}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Multi-lingual emergency center</p>
            </div>
            <div className="mt-4 pt-2 border-t border-red-500/20 text-[11px] font-bold text-red-600 dark:text-red-300 flex items-center justify-between">
              <span>Tap to Call</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </motion.a>

          {/* Police Hotline */}
          <motion.a
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            href={`tel:${selectedCountry.police.split(' ')[0]}`}
            onClick={() => soundFx.playClick()}
            className="rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-cyan-500/5 p-4 flex flex-col justify-between group hover:border-blue-500 transition-all shadow-md"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase text-blue-500 tracking-wider">Police Dispatch</span>
                <ShieldCheck className="h-4 w-4 text-blue-500" />
              </div>
              <div className="text-3xl font-black text-blue-600 dark:text-blue-400 mt-2">
                {selectedCountry.police}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Law enforcement & safety</p>
            </div>
            <div className="mt-4 pt-2 border-t border-blue-500/20 text-[11px] font-bold text-blue-600 dark:text-blue-300 flex items-center justify-between">
              <span>Tap to Call Police</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </motion.a>

          {/* Tourist Assistance Line */}
          <motion.a
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            href={`tel:${selectedCountry.touristHelpline.replace(/\s+/g, '')}`}
            onClick={() => soundFx.playClick()}
            className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-teal-500/5 p-4 flex flex-col justify-between group hover:border-emerald-500 transition-all shadow-md"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase text-emerald-500 tracking-wider">Tourist Helpline</span>
                <Globe2 className="h-4 w-4 text-emerald-500" />
              </div>
              <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">
                {selectedCountry.touristHelpline}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">24x7 Visitor guidance & lost items</p>
            </div>
            <div className="mt-4 pt-2 border-t border-emerald-500/20 text-[11px] font-bold text-emerald-600 dark:text-emerald-300 flex items-center justify-between">
              <span>Tap to Call Tourist Line</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </motion.a>

          {/* Medical Ambulance */}
          <motion.a
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            href={`tel:${selectedCountry.ambulance.split(' ')[0]}`}
            onClick={() => soundFx.playClick()}
            className="rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-indigo-500/5 p-4 flex flex-col justify-between group hover:border-purple-500 transition-all shadow-md"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase text-purple-500 tracking-wider">Medical / Ambulance</span>
                <Zap className="h-4 w-4 text-purple-500" />
              </div>
              <div className="text-3xl font-black text-purple-600 dark:text-purple-400 mt-2">
                {selectedCountry.ambulance}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Paramedic & hospital dispatch</p>
            </div>
            <div className="mt-4 pt-2 border-t border-purple-500/20 text-[11px] font-bold text-purple-600 dark:text-purple-300 flex items-center justify-between">
              <span>Tap to Call Paramedic</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </motion.a>

        </div>

        {/* Advisory Tip Banner */}
        <div className="mt-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs flex items-start gap-3 text-amber-900 dark:text-amber-200">
          <Info className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Official Safety Advisory ({selectedCountry.country}): </span>
            {selectedCountry.tip}
          </div>
        </div>
      </motion.div>

      {/* 2. OFFLINE SOS CELLULAR SMS RANGE CALCULATOR */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-3xl border p-6 sm:p-8 shadow-xl transition-all ${
          darkMode 
            ? 'border-slate-800 bg-slate-900/90 text-white backdrop-blur-xl' 
            : 'border-slate-200/80 bg-white text-slate-900 shadow-slate-200/50'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200/30">
          <div>
            <div className="flex items-center gap-2">
              <Radio className="h-4 w-4 text-cyan-500 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-500">Cell Tower & Off-Grid Telemetry</span>
            </div>
            <h3 className="text-xl font-bold tracking-tight mt-1">No Internet? Offline SMS Tower Range Calculator</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Standard SMS text messages do NOT require mobile internet (4G/5G). They transmit over 2G/GSM control channels up to 35 km away from a cell tower.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-2 rounded-2xl border border-slate-200 dark:border-slate-700">
            <WifiOff className="h-4 w-4 text-amber-500" />
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400">Offline Cellular Active</span>
          </div>
        </div>

        {/* Interactive Slider Stage */}
        <div className="mt-6 space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-slate-600 dark:text-slate-300">Distance to Nearest Mobile Tower:</span>
              <span className="text-blue-600 dark:text-blue-400 text-sm font-black">{userSignalDistance} kilometers</span>
            </div>
            <input 
              type="range"
              min="1"
              max="50"
              value={userSignalDistance}
              onChange={(e) => {
                soundFx.playClick();
                setUserSignalDistance(Number(e.target.value));
              }}
              className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-[10px] font-bold text-slate-400">
              <span>1 km (City)</span>
              <span>15 km (Suburbs)</span>
              <span>35 km (Max 2G GSM Limit)</span>
              <span>50 km (Remote Wilderness)</span>
            </div>
          </div>

          {/* Live Dynamic Telemetry Box */}
          <div className="rounded-2xl border border-slate-200/50 bg-slate-50 dark:bg-slate-800/50 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className={`text-sm font-black ${signalInfo.color} flex items-center gap-1.5`}>
                <Smartphone className="h-4 w-4" />
                {signalInfo.status}
              </span>
              <span className="text-[11px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 px-2.5 py-0.5 rounded-full">
                Telemetry Calculated
              </span>
            </div>

            <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: signalInfo.width }}
                transition={{ duration: 0.4 }}
                className={`h-full ${signalInfo.bar}`}
              />
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              {signalInfo.desc}
            </p>
          </div>

          {/* Quick Offline SOS WhatsApp & SMS Dispatch Tool */}
          <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4 flex flex-col space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400">Emergency GPS SOS Message & Dispatch Gateway</span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Live GPS payload ready for 1-touch broadcast to WhatsApp, SMS, or clipboard:</p>
              </div>
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    soundFx.playSuccess();
                    const text = `🚨 EMERGENCY SOS! GPS: ${activeLat.toFixed(4)}, ${activeLng.toFixed(4)}. Immediate police/medical rescue required! SafeTour ID: #ST-8849`;
                    navigator.clipboard.writeText(text);
                    setCopiedSms(true);
                    setTimeout(() => setCopiedSms(false), 2000);
                  }}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-bold text-slate-200 hover:bg-slate-700 transition shadow-xs"
                >
                  {copiedSms ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 text-slate-300" />}
                  <span>{copiedSms ? 'Copied!' : 'Copy'}</span>
                </motion.button>
              </div>
            </div>

            <code className="block p-2.5 rounded-xl bg-slate-900 text-emerald-400 font-mono text-[11px] border border-slate-800">
              🚨 EMERGENCY SOS! GPS: {activeLat.toFixed(4)}, {activeLng.toFixed(4)}. Need immediate police/rescue help. SafeTour ID: #ST-8849
            </code>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`🚨 EMERGENCY SOS ALERT! I need immediate rescue assistance. GPS: https://maps.google.com/?q=${activeLat.toFixed(6)},${activeLng.toFixed(6)} (Lat: ${activeLat.toFixed(6)}, Lng: ${activeLng.toFixed(6)}). Please send police 112 / ambulance 108!`)}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => soundFx.playSuccess()}
                className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 px-3 transition shadow-sm"
              >
                <Share2 className="h-4 w-4" />
                <span>Send via WhatsApp</span>
              </a>

              <a
                href={`sms:112?&body=${encodeURIComponent(`🚨 EMERGENCY SOS! Immediate rescue needed. GPS: https://maps.google.com/?q=${activeLat.toFixed(6)},${activeLng.toFixed(6)}. Please dispatch police / medical aid.`)}`}
                onClick={() => soundFx.playSuccess()}
                className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 px-3 transition shadow-sm"
              >
                <Smartphone className="h-4 w-4" />
                <span>Backup: Send Direct SMS</span>
              </a>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 3. AI SCAM INVESTIGATOR & REAL-TIME THREAT DETECTOR */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-3xl border p-6 sm:p-8 shadow-xl transition-all ${
          darkMode 
            ? 'border-slate-800 bg-slate-900/90 text-white backdrop-blur-xl' 
            : 'border-slate-200/80 bg-white text-slate-900 shadow-slate-200/50'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200/30">
          <div>
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-amber-500 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-amber-500">AI Fraud Defense Engine</span>
            </div>
            <h3 className="text-xl font-bold tracking-tight mt-1">Real-Time Tourist Scam Investigator</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Select a verified scam from our database or paste a suspicious situation/text to calculate threat scores.
            </p>
          </div>

          <div className="relative min-w-[220px]">
            <input 
              type="text"
              placeholder="Filter scams (Taxi, Gold Ring...)"
              value={scamSearch}
              onChange={(e) => setScamSearch(e.target.value)}
              className={`w-full rounded-xl border pl-8 pr-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                darkMode ? 'border-slate-700 bg-slate-800 text-white' : 'border-slate-200 bg-slate-50 text-slate-800'
              }`}
            />
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
          </div>
        </div>

        {/* Grid layout for Scam Inspector */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          
          {/* List of Verified Scams */}
          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
            <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Documented Street Traps</span>
            {filteredScams.map((scam) => {
              const isSelected = selectedScam?.id === scam.id;
              return (
                <motion.div
                  key={scam.id}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => {
                    soundFx.playClick();
                    setSelectedScam(scam);
                  }}
                  className={`cursor-pointer rounded-2xl border p-3.5 transition-all ${
                    isSelected 
                      ? 'border-amber-500 bg-amber-500/10 shadow-md' 
                      : darkMode
                        ? 'border-slate-800 bg-slate-800/40 hover:bg-slate-800'
                        : 'border-slate-200/70 bg-slate-50 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{scam.title}</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      scam.riskLevel === 'CRITICAL' ? 'bg-red-500 text-white' : 'bg-amber-500 text-white'
                    }`}>
                      {scam.riskLevel}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-amber-500 shrink-0" />
                    <span className="truncate">{scam.location}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Scam Deep Analysis Card */}
          <div className="lg:col-span-2 rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 p-5 space-y-4">
            {selectedScam ? (
              <>
                <div className="flex items-start justify-between border-b border-slate-200/40 dark:border-slate-700 pb-3">
                  <div>
                    <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                      Verified Case Study • {selectedScam.category.toUpperCase()}
                    </span>
                    <h4 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">{selectedScam.title}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Hotspots: {selectedScam.location}</p>
                  </div>
                  <span className="text-xs font-black bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 px-3 py-1 rounded-full border border-red-300 dark:border-red-800">
                    Risk: {selectedScam.riskLevel}
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="font-bold text-slate-700 dark:text-slate-300">How the scam works:</span>
                    <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400 mt-1">
                      {selectedScam.howItWorks.map((step, idx) => (
                        <li key={idx}>{step}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-3 text-emerald-950 dark:text-emerald-200">
                    <span className="font-bold flex items-center gap-1 text-emerald-700 dark:text-emerald-400 mb-1">
                      <ShieldCheck className="h-4 w-4" />
                      Protocol to avoid this scam:
                    </span>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-700 dark:text-slate-300">
                      {selectedScam.howToAvoid.map((avoid, idx) => (
                        <li key={idx}>{avoid}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </>
            ) : null}

            {/* Custom Interactive Text Tester */}
            <div className="border-t border-slate-200/50 dark:border-slate-700 pt-4 space-y-2">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5 text-blue-500" />
                Test your own situation or suspicious message:
              </span>
              <div className="flex gap-2">
                <input 
                  type="text"
                  placeholder="e.g. 'Taxi driver claims meter is broken and wants 100 Euro cash'"
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  className={`flex-1 rounded-xl border px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    darkMode ? 'border-slate-700 bg-slate-800 text-white' : 'border-slate-200 bg-white text-slate-800'
                  }`}
                />
                <button
                  onClick={handleAnalyzeCustomText}
                  disabled={analyzingText}
                  className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {analyzingText ? 'Analyzing...' : 'Scan Threat'}
                </button>
              </div>

              {scamAnalysisResult && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`mt-3 rounded-2xl border p-4 text-xs ${
                    scamAnalysisResult.riskLevel === 'SAFE'
                      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-950 dark:text-emerald-200'
                      : scamAnalysisResult.riskLevel === 'SUSPICIOUS'
                        ? 'border-amber-500/30 bg-amber-500/10 text-amber-950 dark:text-amber-200'
                        : 'border-red-500/30 bg-red-500/10 text-red-950 dark:text-red-200'
                  }`}
                >
                  <div className="flex justify-between items-center font-bold text-sm">
                    <span>AI Threat Diagnosis: {scamAnalysisResult.riskLevel}</span>
                    <span>Score: {scamAnalysisResult.riskScore}/100</span>
                  </div>
                  <p className="mt-1 font-semibold">{scamAnalysisResult.action}</p>
                </motion.div>
              )}
            </div>
          </div>

        </div>
      </motion.div>

      {/* 4. LIVE WEATHER, AQI & REAL CURRENCY CONVERTER */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Live Weather Widget */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-3xl border p-6 shadow-xl ${
            darkMode ? 'border-slate-800 bg-slate-900/90 text-white' : 'border-slate-200/80 bg-white text-slate-900'
          }`}
        >
          <div className="flex items-center justify-between border-b border-slate-200/30 pb-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-500">Real Telemetry</span>
              <h4 className="text-lg font-bold">Weather & Air Quality Index</h4>
            </div>
            <SunMedium className="h-6 w-6 text-amber-500 animate-spin-slow" />
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div>
              <div className="text-4xl font-black text-slate-900 dark:text-white tabular-nums">
                {liveWeather.temperature}°C
              </div>
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
                {liveWeather.location} · {liveWeather.condition}
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-2.5 py-1 rounded-full border border-emerald-300 dark:border-emerald-800 tabular-nums">
                AQI {liveWeather.airQualityIndex} ({liveWeather.aqiCategory})
              </span>
              <p className="text-[10px] text-slate-400 mt-1 tabular-nums">Humidity {liveWeather.humidity}% · Wind {liveWeather.windSpeedKmH} km/h</p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200/30 text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
            <Wind className="h-4 w-4 text-blue-500 shrink-0" />
            <span><strong>Impact:</strong> {liveWeather.safetyImpact}</span>
          </div>
        </motion.div>

        {/* Real Currency FX Converter */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-3xl border p-6 shadow-xl ${
            darkMode ? 'border-slate-800 bg-slate-900/90 text-white' : 'border-slate-200/80 bg-white text-slate-900'
          }`}
        >
          <div className="flex items-center justify-between border-b border-slate-200/30 pb-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500">
                Exchange Rates · {fxSource === 'open.er-api.com' ? 'Live' : 'Reference'}
              </span>
              <h4 className="text-lg font-bold">FX Scam Protection Converter</h4>
            </div>
            <DollarSign className="h-6 w-6 text-emerald-500" />
          </div>

          <div className="mt-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-end">
              <div className="sm:col-span-4">
                <label className="text-[10px] font-bold uppercase text-slate-400">Amount</label>
                <input 
                  type="number"
                  min={0}
                  value={amount}
                  onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
                  className={`w-full rounded-xl border p-2 text-sm font-bold tabular-nums focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    darkMode ? 'border-slate-700 bg-slate-800 text-white' : 'border-slate-200 bg-slate-50 text-slate-900'
                  }`}
                />
              </div>

              <div className="sm:col-span-3">
                <label className="text-[10px] font-bold uppercase text-slate-400">From</label>
                <select
                  value={fromCurrency}
                  onChange={(e) => setFromCurrency(e.target.value)}
                  className={`w-full rounded-xl border p-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    darkMode ? 'border-slate-700 bg-slate-800 text-white' : 'border-slate-200 bg-slate-50 text-slate-900'
                  }`}
                >
                  {Object.keys(fxRates).map(curr => (
                    <option key={curr} value={curr}>{curr}</option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2 flex justify-center">
                <button
                  type="button"
                  title="Swap currencies"
                  onClick={() => {
                    const prevFrom = fromCurrency;
                    setFromCurrency(toCurrency);
                    setToCurrency(prevFrom);
                  }}
                  className={`w-full rounded-xl border p-2 flex items-center justify-center transition ${
                    darkMode ? 'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700' : 'border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <ArrowRightLeft className="h-4 w-4" />
                </button>
              </div>

              <div className="sm:col-span-3">
                <label className="text-[10px] font-bold uppercase text-slate-400">To</label>
                <select
                  value={toCurrency}
                  onChange={(e) => setToCurrency(e.target.value)}
                  className={`w-full rounded-xl border p-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    darkMode ? 'border-slate-700 bg-slate-800 text-white' : 'border-slate-200 bg-slate-50 text-slate-900'
                  }`}
                >
                  {Object.keys(fxRates).map(curr => (
                    <option key={curr} value={curr}>{curr}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Converted Value ({toCurrency}):</span>
              <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                {convertedAmount} {toCurrency}
              </span>
            </div>
          </div>
        </motion.div>

      </div>

      {/* 5. LIVE GOOGLE MAPS & SEARCH GROUNDING INTELLIGENCE WORKBENCH */}
      <GroundingIntelligenceSection darkMode={darkMode} language={language} isHindi={isHindi} />

    </div>
  );
}

// Sub-component for Google Maps Grounding & Google Search Grounding with gemini-3.5-flash
function GroundingIntelligenceSection({ darkMode, language, isHindi }: { darkMode: boolean; language: string; isHindi: boolean }) {
  const [activeGroundingType, setActiveGroundingType] = useState<'maps' | 'search'>('maps');
  const [queryText, setQueryText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [groundingResult, setGroundingResult] = useState<{
    text: string;
    sources: Array<{ title: string; uri: string; snippet?: string; sourceType?: 'maps' | 'web' }>;
    type: 'maps' | 'search';
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const sampleQueries = {
    maps: [
      isHindi ? "जयपुर में सत्यापित 24/7 आपातकालीन फार्मेसी व अस्पताल" : "Verified 24/7 emergency pharmacies & hospitals in Jaipur with Google Maps links",
      isHindi ? "पेरिस में एफिल टॉवर के पास सुरक्षित स्थानीय पारिवारिक रेस्तरां" : "Safe authentic family restaurants near Eiffel Tower with Google Maps reviews",
      isHindi ? "टोक्यो स्टेशन के पास मुख्य पुलिस बूथ और पर्यटक सूचना केंद्र" : "Police boxes (Koban) and tourist help desks near Tokyo Station",
      isHindi ? "गोवा में बच्चों के अनुकूल सबसे सुरक्षित समुद्र तट" : "Safest family-friendly beaches in South Goa with directions"
    ],
    search: [
      isHindi ? "यूरोप में वर्तमान ट्रेन हड़ताल और सार्वजनिक परिवहन अपडेट" : "Current transit & train strike updates across Western Europe this month",
      isHindi ? "हालिया वीज़ा नियम और प्रवेश औपचारिकताएं" : "Latest Schengen & tourist entry visa requirements updates",
      isHindi ? "तटीय क्षेत्रों में वर्तमान मौसम और चक्रवात चेतावनी" : "Live weather advisory and monsoon flash flood alerts",
      isHindi ? "स्थानीय मुद्रा विनिमय पर नवीनतम पर्यटक ठगी चेतावनियां" : "Recent tourist scam alerts and official police warnings"
    ]
  };

  const handleExecuteGrounding = async (q?: string) => {
    const term = (q || queryText).trim();
    if (!term) return;
    if (q) setQueryText(q);
    setIsLoading(true);
    setErrorMsg(null);
    setGroundingResult(null);

    try {
      const currentToken = localStorage.getItem('safetour_token') || localStorage.getItem('token') || 'token_tourist';
      const res = await fetch('/api/gemini/grounding', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentToken}`
        },
        body: JSON.stringify({
          query: term,
          type: activeGroundingType,
          language
        })
      });

      if (res.ok) {
        const data = await res.json();
        setGroundingResult({
          text: data.text,
          sources: data.sources || [],
          type: data.type
        });
      } else {
        const err = await res.json().catch(() => ({}));
        setErrorMsg(err.error || 'Grounding service encountered a problem');
      }
    } catch (e: any) {
      setErrorMsg('Network error connecting to Grounding intelligence service.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-3xl border p-6 sm:p-8 shadow-xl ${
        darkMode ? 'border-slate-800 bg-slate-900/90 text-white' : 'border-slate-200/80 bg-white text-slate-900'
      }`}
      id="grounding-intelligence-workbench"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/40 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-500 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-900">
              gemini-3.5-flash Grounded
            </span>
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-900">
              Verified Real-Time Data
            </span>
          </div>
          <h3 className="text-xl font-black mt-1 flex items-center gap-2">
            {isHindi ? 'लाइव गूगल मैप्स व सर्च ग्राउंडिंग केंद्र' : 'Live Google Maps & Search Grounding Hub'}
            <Sparkles className="h-4 w-4 text-amber-500" />
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {isHindi 
              ? 'Google Maps और Google Search टूल्स की सहायता से वास्तविक समय के स्थान, पते और सत्यापित जानकारी प्राप्त करें।' 
              : 'Direct integration with Google Maps and Google Search grounding tools for verified places, links, and real-time facts.'}
          </p>
        </div>

        {/* Mode Selector */}
        <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => {
              setActiveGroundingType('maps');
              setGroundingResult(null);
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeGroundingType === 'maps'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <MapPin className="h-3.5 w-3.5" />
            <span>Google Maps Grounding</span>
          </button>
          <button
            onClick={() => {
              setActiveGroundingType('search');
              setGroundingResult(null);
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeGroundingType === 'search'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Globe2 className="h-3.5 w-3.5" />
            <span>Google Search Grounding</span>
          </button>
        </div>
      </div>

      {/* Query Input Section */}
      <div className="mt-5 space-y-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleExecuteGrounding();
            }}
            placeholder={
              activeGroundingType === 'maps'
                ? (isHindi ? 'Google Maps से स्थान पूछें (उदा. 24/7 सत्यापित अस्पताल, सुरक्षित होटल)...' : 'Query Google Maps Grounding (e.g. 24/7 verified hospitals in Kyoto, safe street food)...')
                : (isHindi ? 'Google Search से वास्तविक समय तथ्य पूछें (उदा. स्ट्राइक अलर्ट, मौसम चेतावनियां)...' : 'Query Google Search Grounding (e.g. real-time transit strikes in Europe, tourist entry rules)...')
            }
            className={`flex-1 rounded-2xl border px-4 py-3 text-xs font-medium focus:outline-none focus:ring-2 ${
              activeGroundingType === 'maps' ? 'focus:ring-emerald-500' : 'focus:ring-blue-500'
            } ${
              darkMode ? 'border-slate-700 bg-slate-800 text-white' : 'border-slate-200 bg-slate-50 text-slate-900'
            }`}
          />
          <button
            onClick={() => handleExecuteGrounding()}
            disabled={isLoading || !queryText.trim()}
            className={`px-6 py-3 rounded-2xl font-bold text-xs text-white transition-all shadow-md flex items-center gap-2 disabled:opacity-50 ${
              activeGroundingType === 'maps' 
                ? 'bg-emerald-600 hover:bg-emerald-700' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isLoading ? (
              <>
                <span className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Grounded Query...</span>
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                <span>{activeGroundingType === 'maps' ? 'Ground with Maps' : 'Ground with Search'}</span>
              </>
            )}
          </button>
        </div>

        {/* Suggested Queries */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {isHindi ? 'सुझाए गए प्रश्न (क्लिक करें):' : 'Instant Grounded Prompts:'}
          </span>
          <div className="flex flex-wrap gap-2">
            {sampleQueries[activeGroundingType].map((sq, idx) => (
              <button
                key={idx}
                onClick={() => handleExecuteGrounding(sq)}
                className={`text-[11px] font-medium px-3 py-1.5 rounded-xl border transition-all text-left ${
                  darkMode 
                    ? 'border-slate-700/80 bg-slate-800/60 text-slate-300 hover:border-slate-500 hover:text-white' 
                    : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:text-blue-700'
                }`}
              >
                {sq}
              </button>
            ))}
          </div>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Grounding Results Display */}
        {groundingResult && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-4 rounded-2xl border p-5 space-y-4 ${
              groundingResult.type === 'maps'
                ? 'border-emerald-500/30 bg-emerald-50/40 dark:bg-emerald-950/20'
                : 'border-blue-500/30 bg-blue-50/40 dark:bg-blue-950/20'
            }`}
          >
            <div className="flex items-center justify-between border-b border-slate-200/40 dark:border-slate-800 pb-2">
              <span className="text-xs font-bold flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
                {groundingResult.type === 'maps' ? (
                  <>
                    <MapPin className="h-4 w-4 text-emerald-600" />
                    <span>Google Maps Grounded Analysis (gemini-3.5-flash)</span>
                  </>
                ) : (
                  <>
                    <Globe2 className="h-4 w-4 text-blue-600" />
                    <span>Google Search Grounded Analysis (gemini-3.5-flash)</span>
                  </>
                )}
              </span>
              <span className="text-[10px] font-mono text-slate-500">Live Verified</span>
            </div>

            {/* Answer Text */}
            <div className="text-xs leading-relaxed whitespace-pre-wrap text-slate-800 dark:text-slate-200">
              {groundingResult.text}
            </div>

            {/* Grounding Sources (Google Maps places or Search web links) */}
            {groundingResult.sources && groundingResult.sources.length > 0 && (
              <div className="border-t border-slate-200/50 dark:border-slate-800 pt-3 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                  {groundingResult.type === 'maps' ? 'Verified Google Maps Place Links & Sources:' : 'Verified Web Citation Sources:'}
                </span>

                {groundingResult.type === 'maps' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {groundingResult.sources.map((s, sIdx) => (
                      <a
                        key={sIdx}
                        href={s.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700 text-xs text-slate-800 dark:text-slate-200 hover:border-emerald-500 hover:shadow transition-all group"
                      >
                        <div className="flex flex-col min-w-0 pr-2">
                          <span className="font-bold truncate text-emerald-700 dark:text-emerald-300">{s.title}</span>
                          {s.snippet && (
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 italic">"{s.snippet}"</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 shrink-0 bg-emerald-50 dark:bg-emerald-950 px-2 py-1 rounded-lg">
                          <span>Map</span>
                          <ExternalLink className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </a>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {groundingResult.sources.map((s, sIdx) => (
                      <a
                        key={sIdx}
                        href={s.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-800 text-[11px] font-semibold text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors shadow-xs"
                      >
                        <Globe2 className="h-3 w-3 text-blue-500" />
                        <span className="max-w-[220px] truncate">{s.title}</span>
                        <ExternalLink className="h-3 w-3 text-blue-400" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
