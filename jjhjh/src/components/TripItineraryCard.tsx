/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Compass, Ticket, Info, ShieldCheck, ExternalLink, Navigation, Volume2, VolumeX } from 'lucide-react';
import { 
  getEnrichedPlaceData, 
  calculateLiveDistanceKm, 
  getGoogleMapsDirectionsUrl, 
  getGoogleMapsSearchUrl 
} from '../utils/landmarkData';
import { ItineraryItem } from '../types';

interface ItineraryCardProps {
  key?: React.Key;
  time: ItineraryItem;
  destination: string;
  userCoords: { lat: number; lng: number };
  onViewMap?: (lat: number, lng: number, placeName: string) => void;
  language?: string;
  t?: (key: string) => string;
  darkMode?: boolean;
}

export default function TripItineraryCard({
  time,
  destination,
  userCoords,
  onViewMap,
  language = 'en',
  t,
  darkMode = false
}: ItineraryCardProps) {
  const [showHistory, setShowHistory] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const isHindi = language === 'hi';

  // Enrich data using pre-indexed landmark database or intelligent fallbacks
  const placeData = getEnrichedPlaceData(time.activity, time.location, destination);

  const imageUrl = time.imageUrl || placeData.imageUrl;
  const placeName = time.placeName || placeData.name || time.activity;
  const priceDetails = time.priceDetails || placeData.priceDetails;
  const historyInfo = time.historyInfo || placeData.historyInfo;
  const lat = time.lat || placeData.lat;
  const lng = time.lng || placeData.lng;

  // Calculate live distance in KM from current user coordinates
  const distanceKm = calculateLiveDistanceKm(userCoords.lat, userCoords.lng, lat, lng);

  const handleToggleAudio = () => {
    if (!('speechSynthesis' in window)) {
      setShowHistory(true);
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
    } else {
      window.speechSynthesis.cancel();
      const textToSpeak = `${placeName}. Located in ${time.location}. ${historyInfo}. Safety Advice: ${time.notes || 'Stay in designated safe zones.'}`;
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      if (isHindi) utterance.lang = 'hi-IN';
      
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);

      setIsPlayingAudio(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.3 }}
      className="group relative overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-all duration-300"
    >
      {/* Sleek Non-Image Header Banner */}
      <div className="bg-slate-900 dark:bg-slate-950 p-4 text-white space-y-2 border-b border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          {/* Schedule Time Badge */}
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-800 dark:bg-slate-900 px-3 py-1 text-xs font-mono font-bold text-amber-400 border border-slate-700 dark:border-slate-800 shadow-sm">
            ⏰ {time.time}
          </span>

          {/* Live Distance from Current User Location */}
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-950/90 px-3 py-1 text-xs font-extrabold text-emerald-300 border border-emerald-500/40 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <Navigation className="h-3 w-3 text-emerald-400" />
            <span>{distanceKm > 0 ? (isHindi ? `${distanceKm} किमी दूर` : `${distanceKm} km away`) : (isHindi ? 'लाइव जीपीएस सिंक' : 'Live GPS Synchronized')}</span>
          </span>
        </div>

        {/* Title & Category Info */}
        <div className="pt-1">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-cyan-300 bg-cyan-950/90 px-2 py-0.5 rounded-md border border-cyan-800">
              {isHindi ? 'सुरक्षित पर्यटन स्थल' : 'SAFE TOUR SPOT'}
            </span>
            <span className="text-xs font-bold text-slate-300">• {isHindi ? 'लागत' : 'Cost'}: ${time.cost}</span>
          </div>
          <h4 className="text-base sm:text-lg font-black text-white leading-tight mt-1">
            {time.activity}
          </h4>
        </div>
      </div>

      {/* Card Body Details */}
      <div className="p-4 space-y-3 bg-white dark:bg-slate-900">
        
        {/* Live Location Coordinates & Address Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="space-y-0.5">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
              <MapPin className="h-3.5 w-3.5 text-rose-500 flex-shrink-0" />
              <span>{time.location}</span>
            </div>
            <div className="text-[10px] font-mono text-slate-400 pl-5">
              GPS: {lat.toFixed(4)}° N, {lng.toFixed(4)}° E
            </div>
          </div>

          <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
            <button
              type="button"
              onClick={handleToggleAudio}
              className={`inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-[11px] font-extrabold transition-all flex-shrink-0 ${
                isPlayingAudio 
                  ? 'bg-amber-500 text-white animate-pulse shadow-md shadow-amber-500/20' 
                  : 'bg-amber-50 dark:bg-amber-950/30 hover:bg-amber-100 dark:hover:bg-amber-900/40 text-amber-800 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60'
              }`}
              title="Listen to AI Audio Guide / voice narration for this landmark"
            >
              {isPlayingAudio ? (
                <>
                  <VolumeX className="h-3 w-3 text-white" />
                  <span>{isHindi ? 'ऑडियो रोकें' : 'Stop Voice Tour'}</span>
                </>
              ) : (
                <>
                  <Volume2 className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                  <span>{isHindi ? '🔊 एआई ऑडियो गाइड' : '🔊 AI Audio Guide'}</span>
                </>
              )}
            </button>

            {onViewMap && (
              <motion.button
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => onViewMap(lat, lng, placeName)}
                className="inline-flex items-center gap-1 rounded-xl bg-blue-50 dark:bg-blue-950/40 px-2.5 py-1.5 text-[11px] font-extrabold text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 border border-blue-200/80 dark:border-blue-800/60 transition-colors flex-shrink-0"
              >
                <Compass className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                <span>{isHindi ? 'मैप में देखें' : 'Map View'}</span>
              </motion.button>
            )}

            <a
              href={getGoogleMapsDirectionsUrl(userCoords.lat, userCoords.lng, lat, lng, placeName)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 text-[11px] font-extrabold text-white shadow-sm transition-all flex-shrink-0"
            >
              <Navigation className="h-3 w-3 text-white" />
              <span>{isHindi ? 'गूगल मैप्स नेविगेट करें' : 'Navigate Google Maps'}</span>
              <ExternalLink className="h-2.5 w-2.5 opacity-80" />
            </a>
          </div>
        </div>

        {/* Live Distance Info Box */}
        <div className="flex items-center justify-between bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-100/90 dark:border-emerald-900/50 rounded-xl p-2.5 text-xs text-emerald-900 dark:text-emerald-300">
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="font-bold text-[11px]">{isHindi ? `लाइव जीपीएस से वास्तविक दूरी (${userCoords.lat.toFixed(2)}°, ${userCoords.lng.toFixed(2)}°):` : `Real Distance from Live GPS (${userCoords.lat.toFixed(2)}°, ${userCoords.lng.toFixed(2)}°):`}</span>
          </div>
          <span className="font-mono font-extrabold text-emerald-800 dark:text-emerald-300 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800 shadow-xs">
            📍 {distanceKm} {isHindi ? 'किमी' : 'km'}
          </span>
        </div>

        {/* Entry Ticket & Pricing Info */}
        <div className="flex items-start space-x-2 bg-amber-50/60 dark:bg-amber-950/30 border border-amber-100/80 dark:border-amber-900/50 rounded-xl p-2.5 text-xs text-slate-800 dark:text-slate-200">
          <Ticket className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-extrabold text-[11px] text-amber-900 dark:text-amber-300 uppercase tracking-wider block">{isHindi ? 'प्रवेश व टिकट दरें' : 'Entry & Ticket Pricing'}</span>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-snug">{priceDetails}</p>
          </div>
        </div>

        {/* Historical Context Toggle Drawer */}
        <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 p-2.5 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
              <Info className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              <span>{isHindi ? 'ऐतिहासिक महत्व एवं इतिहास' : 'Historical Significance & Background'}</span>
            </div>
            <button
              type="button"
              onClick={() => setShowHistory(!showHistory)}
              className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
            >
              {showHistory ? (isHindi ? 'विवरण छिपाएं' : 'Hide Details') : (isHindi ? 'इतिहास देखें' : 'Show History')}
            </button>
          </div>

          <AnimatePresence>
            {showHistory && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed pt-1 border-t border-slate-200/60 dark:border-slate-700 space-y-1"
              >
                <p>{historyInfo}</p>
                <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 block pt-1">
                  🏛️ {isHindi ? 'सेफटूर एआई ग्लोबल लैंडमार्क रजिस्ट्री द्वारा सत्यापित' : 'Verified by SafeTour AI Global Landmark Registry'}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Safety Directives / Notes */}
        {time.notes && (
          <div className="flex items-start space-x-2 bg-blue-50/40 dark:bg-blue-950/30 border border-blue-100/60 dark:border-blue-900/50 rounded-xl p-2.5 text-xs text-slate-700 dark:text-slate-300">
            <ShieldCheck className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-extrabold text-[10px] text-blue-900 dark:text-blue-300 uppercase tracking-wider block">{isHindi ? 'सुरक्षा निर्देश' : 'Safety Directive'}</span>
              <p className="text-xs text-slate-600 dark:text-slate-400">{time.notes}</p>
            </div>
          </div>
        )}

      </div>
    </motion.div>
  );
}
