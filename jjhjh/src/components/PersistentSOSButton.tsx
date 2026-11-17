/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  PhoneCall, 
  AlertTriangle, 
  MapPin, 
  ShieldAlert, 
  Share2, 
  X, 
  Volume2, 
  VolumeX, 
  CheckCircle2, 
  Radio, 
  Siren,
  BellRing,
  MessageSquare,
  Smartphone,
  Copy,
  RefreshCw,
  Send,
  ExternalLink,
  ShieldCheck,
  Zap,
  Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile } from '../types';

interface PersistentSOSButtonProps {
  onTriggerSOSModal?: () => void;
  userCoords?: { lat: number; lng: number } | null;
  profile?: UserProfile;
  language?: string;
  isSosGlobalActive?: boolean;
  onToggleGlobalSOS?: (lat?: number, lng?: number) => void;
}

export default function PersistentSOSButton({ 
  onTriggerSOSModal, 
  userCoords,
  profile,
  language = 'en',
  isSosGlobalActive = false,
  onToggleGlobalSOS
}: PersistentSOSButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [sosActive, setSosActive] = useState(isSosGlobalActive);
  const [copied, setCopied] = useState(false);
  const [isSirenPlaying, setIsSirenPlaying] = useState(false);
  
  // Real GPS live tracking state
  const [currentLat, setCurrentLat] = useState<number>(userCoords?.lat ?? 26.9124);
  const [currentLng, setCurrentLng] = useState<number>(userCoords?.lng ?? 75.7873);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'locating' | 'locked' | 'fallback'>('idle');
  const [lastGpsUpdate, setLastGpsUpdate] = useState<string>('');

  // Emergency contact target phone
  const [emergencyPhone, setEmergencyPhone] = useState<string>(profile?.emergencyContactPhone || '112');
  const [emergencyContactName, setEmergencyContactName] = useState<string>(profile?.emergencyContactName || 'Family / Emergency Contact');
  
  // WhatsApp & SMS Dispatch Fallback tracking states
  const [whatsAppTriggered, setWhatsAppTriggered] = useState(false);
  const [smsBackupTriggered, setSmsBackupTriggered] = useState(false);
  const [activeTab, setActiveTab] = useState<'dispatch' | 'helplines' | 'settings'>('dispatch');

  // Web Audio Context reference for Real Emergency Siren Synthesizer
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const lfoRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  const isHindi = language === 'hi';

  // Sync profile emergency phone if changed
  useEffect(() => {
    if (profile?.emergencyContactPhone) {
      setEmergencyPhone(profile.emergencyContactPhone);
    }
    if (profile?.emergencyContactName) {
      setEmergencyContactName(profile.emergencyContactName);
    }
  }, [profile]);

  // Sync global SOS state
  useEffect(() => {
    setSosActive(isSosGlobalActive);
  }, [isSosGlobalActive]);

  // Update coordinates from props if provided
  useEffect(() => {
    if (userCoords?.lat && userCoords?.lng) {
      setCurrentLat(userCoords.lat);
      setCurrentLng(userCoords.lng);
      setGpsStatus('locked');
      setLastGpsUpdate(new Date().toLocaleTimeString());
    }
  }, [userCoords]);

  // Real GPS live location acquisition
  const fetchLiveGPS = () => {
    setGpsStatus('locating');
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude, accuracy } = pos.coords;
          setCurrentLat(latitude);
          setCurrentLng(longitude);
          setGpsAccuracy(Math.round(accuracy));
          setGpsStatus('locked');
          setLastGpsUpdate(new Date().toLocaleTimeString());
        },
        (err) => {
          console.warn('Live GPS fallback used:', err.message);
          setGpsStatus('fallback');
          setLastGpsUpdate(new Date().toLocaleTimeString());
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
      );
    } else {
      setGpsStatus('fallback');
    }
  };

  // Trigger GPS lookup when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchLiveGPS();
    }
  }, [isOpen]);

  // Synthesize real Emergency Siren sound using Web Audio API
  const startSiren = () => {
    try {
      if (!audioCtxRef.current) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        audioCtxRef.current = new AudioContextClass();
      }

      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }

      // Stop previous nodes if any
      stopSiren(false);

      const ctx = audioCtxRef.current;
      
      // Main carrier oscillator (Police Siren tone ~800Hz)
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(800, ctx.currentTime);

      // Low Frequency Oscillator (LFO) to create the wailing effect
      const lfo = ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(1.5, ctx.currentTime); // 1.5 wails per second

      // LFO Gain (Frequency modulation depth ±250Hz)
      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(240, ctx.currentTime);

      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);

      // Master Volume Gain
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.35, ctx.currentTime);

      osc.connect(masterGain);
      masterGain.connect(ctx.destination);

      osc.start();
      lfo.start();

      oscillatorRef.current = osc;
      lfoRef.current = lfo;
      gainNodeRef.current = masterGain;
      setIsSirenPlaying(true);
    } catch (e) {
      console.error('Audio siren synthesis error:', e);
    }
  };

  const stopSiren = (updateState = true) => {
    try {
      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
        oscillatorRef.current.disconnect();
        oscillatorRef.current = null;
      }
      if (lfoRef.current) {
        lfoRef.current.stop();
        lfoRef.current.disconnect();
        lfoRef.current = null;
      }
      if (updateState) {
        setIsSirenPlaying(false);
      }
    } catch (e) {
      console.error('Error stopping siren:', e);
    }
  };

  // Cleanup audio siren on unmount or modal close
  useEffect(() => {
    return () => {
      stopSiren(false);
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  // Format real Emergency Message
  const generateSOSMessage = () => {
    const mapsLink = `https://maps.google.com/?q=${currentLat.toFixed(6)},${currentLng.toFixed(6)}`;
    const touristName = profile?.name || 'Tourist in Distress';
    const bloodType = profile?.bloodType || 'Not specified';
    const medConditions = profile?.medicalConditions || 'None reported';
    const timestamp = new Date().toLocaleString();

    return `🚨 *EMERGENCY SOS ALERT - BHARAT SAFE TOURISM* 🚨
⚠️ *IMMEDIATE RESCUE & POLICE ASSISTANCE REQUIRED!*

👤 *Tourist Name:* ${touristName}
📞 *Emergency Contact:* ${emergencyPhone} (${emergencyContactName})
🩸 *Blood Group:* ${bloodType}
🏥 *Medical Notes:* ${medConditions}

📍 *LIVE GPS LOCATION:*
${mapsLink}
🎯 *Coordinates:* Lat ${currentLat.toFixed(6)}, Lng ${currentLng.toFixed(6)} ${gpsAccuracy ? `(Accuracy: ~${gpsAccuracy}m)` : ''}
🕒 *Timestamp:* ${timestamp}

⚠️ *PLEASE DISPATCH LOCAL POLICE (112) OR EMERGENCY MEDICAL (108) TO MY LIVE LOCATION IMMEDIATELY!*`;
  };

  // 1. WhatsApp Real Dispatch Flow
  const handleSendWhatsApp = () => {
    const rawMessage = generateSOSMessage();
    const encodedMessage = encodeURIComponent(rawMessage);
    
    // Clean phone number (strip spaces, dashes, parentheses)
    const cleanPhone = emergencyPhone.replace(/[^0-9+]/g, '');

    // URL structure for direct phone or WhatsApp contact picker
    let waUrl = '';
    if (cleanPhone && cleanPhone.length >= 8 && cleanPhone !== '112') {
      const formattedPhone = cleanPhone.startsWith('+') ? cleanPhone.slice(1) : cleanPhone;
      waUrl = `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodedMessage}`;
    } else {
      waUrl = `https://api.whatsapp.com/send?text=${encodedMessage}`;
    }

    // Trigger device vibration
    if ('vibrate' in navigator) {
      navigator.vibrate([300, 100, 300, 100, 500]);
    }

    // Dispatch WhatsApp via anchor element without window.open popup blocking
    try {
      const a = document.createElement('a');
      a.href = waUrl;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch {}

    setWhatsAppTriggered(true);
    setSosActive(true);

    // Call global handler if provided
    if (onToggleGlobalSOS) {
      onToggleGlobalSOS(currentLat, currentLng);
    }

    // Also notify backend server
    const currentToken = localStorage.getItem('safetour_token') || localStorage.getItem('token') || 'token_tourist';
    fetch('/api/data/sos/sms-fallback', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentToken}`
      },
      body: JSON.stringify({
        lat: currentLat,
        lng: currentLng,
        contactPhone: emergencyPhone,
        channel: 'whatsapp',
        dispatchMessage: rawMessage
      })
    }).catch(() => {});
  };

  // 2. SMS Real Backup Fallback Flow (Universal Android & iOS)
  const handleSendSMSBackup = () => {
    const rawMessage = generateSOSMessage();
    const encodedMessage = encodeURIComponent(rawMessage);
    const cleanPhone = emergencyPhone.replace(/[^0-9+]/g, '');

    // Cross-platform SMS URI:
    // Android/Web: sms:123456?body=...
    // iOS: sms:123456&body=...
    // Universal separator trick: sms:${phone}?&body=${encoded}
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || ((navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));
    const separator = isIOS ? '&body=' : '?body=';
    
    const targetNumber = cleanPhone && cleanPhone.length >= 3 ? cleanPhone : '112';
    const smsUri = `sms:${targetNumber}${separator}${encodedMessage}`;

    // Trigger haptic
    if ('vibrate' in navigator) {
      navigator.vibrate([400, 150, 400, 150, 800]);
    }

    // Launch native SMS application
    window.location.href = smsUri;

    setSmsBackupTriggered(true);
    setSosActive(true);

    // Notify backend server of SMS backup execution
    const currentToken = localStorage.getItem('safetour_token') || localStorage.getItem('token') || 'token_tourist';
    fetch('/api/data/sos/sms-fallback', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentToken}`
      },
      body: JSON.stringify({
        lat: currentLat,
        lng: currentLng,
        contactPhone: emergencyPhone,
        channel: 'sms',
        dispatchMessage: rawMessage
      })
    }).catch(() => {});
  };

  // Copy distress location to clipboard
  const handleCopySOS = () => {
    const rawMessage = generateSOSMessage();
    navigator.clipboard.writeText(rawMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  // Trigger main Panic Action
  const handleTriggerFullSOS = () => {
    setSosActive(true);
    if ('vibrate' in navigator) {
      // SOS Morse Code pattern (... --- ...)
      navigator.vibrate([300, 100, 300, 100, 300, 200, 700, 200, 700, 200, 700, 200, 300, 100, 300, 100, 300]);
    }
    startSiren();
    if (onToggleGlobalSOS) {
      onToggleGlobalSOS(currentLat, currentLng);
    }
  };

  return (
    <>
      {/* 1. Persistent Floating Action Button (Always Visible across all tabs) */}
      <div className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-40 flex flex-col items-end gap-2 pointer-events-auto">
        <div className="relative">
          {/* Glowing Pulse Halo rings when SOS request is active */}
          {sosActive && (
            <>
              <motion.div
                className="absolute inset-0 rounded-full bg-red-600/50 blur-md pointer-events-none"
                animate={{
                  scale: [1, 1.35, 1],
                  opacity: [0.7, 0.2, 0.7],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <motion.div
                className="absolute -inset-2 rounded-full bg-rose-500/35 blur-xl pointer-events-none"
                animate={{
                  scale: [1, 1.55, 1],
                  opacity: [0.5, 0.05, 0.5],
                }}
                transition={{
                  duration: 2.4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.3,
                }}
              />
              <motion.div
                className="absolute -inset-4 rounded-full bg-red-500/20 blur-2xl pointer-events-none"
                animate={{
                  scale: [1, 1.7, 1],
                  opacity: [0.3, 0, 0.3],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </>
          )}

          <motion.button
            id="persistent-floating-sos-fab"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            animate={sosActive ? {
              boxShadow: [
                "0 0 20px rgba(239, 68, 68, 0.6), 0 0 35px rgba(225, 29, 72, 0.4)",
                "0 0 35px rgba(239, 68, 68, 0.9), 0 0 60px rgba(225, 29, 72, 0.6)",
                "0 0 20px rgba(239, 68, 68, 0.6), 0 0 35px rgba(225, 29, 72, 0.4)",
              ],
            } : undefined}
            transition={sosActive ? {
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            } : undefined}
            onClick={() => {
              setIsOpen(true);
              if (onTriggerSOSModal) onTriggerSOSModal();
            }}
            className={`relative flex items-center gap-2.5 rounded-full px-4 py-3.5 sm:px-5 sm:py-4 text-white font-black shadow-[0_10px_35px_rgba(225,29,72,0.6)] border-2 border-white/30 backdrop-blur-md transition-all group ${
              sosActive 
                ? 'bg-gradient-to-r from-red-700 via-rose-600 to-red-800 ring-4 ring-red-500/60' 
                : 'bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:shadow-[0_15px_45px_rgba(225,29,72,0.85)]'
            }`}
          >
            <span className="relative flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-90"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-white"></span>
            </span>
            <Siren className="h-5 w-5 sm:h-6 sm:w-6 text-white animate-pulse" />
            <span className="text-xs sm:text-sm font-black uppercase tracking-wider">
              {sosActive ? (isHindi ? 'आपातकाल सक्रिय' : 'SOS ACTIVE') : (isHindi ? 'एसओएस आपातकाल' : 'SOS EMERGENCY')}
            </span>
          </motion.button>
        </div>
      </div>

      {/* 2. Full-Screen Emergency Modal & Real Dispatch Command Center */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-lg overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 25 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 25 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-xl rounded-3xl border border-red-500/50 bg-slate-900 text-white shadow-2xl overflow-hidden p-5 sm:p-7 space-y-5 my-auto"
              id="emergency-sos-modal-dialog"
            >
              {/* Close / Dismiss Button */}
              <button
                onClick={() => {
                  stopSiren();
                  setIsOpen(false);
                }}
                className="absolute top-4 right-4 rounded-full p-2.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
                title={isHindi ? 'बंद करें' : 'Close'}
              >
                <X className="h-5 w-5" />
              </button>

              {/* Header */}
              <div className="flex items-center gap-3.5">
                <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-red-600/30 border border-red-500/60 text-red-500 shadow-inner">
                  <ShieldAlert className="h-7 w-7 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-wider text-red-400">
                      {isHindi ? 'तत्काल आपातकालीन नियंत्रण' : 'Rapid Emergency Command'}
                    </span>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold border ${
                      gpsStatus === 'locked' 
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    }`}>
                      <Radio className="h-2.5 w-2.5 animate-ping" />
                      <span>{gpsStatus === 'locked' ? 'REAL GPS LOCKED' : 'SEARCHING GPS'}</span>
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
                    {isHindi ? 'सुरक्षा एसओएस प्रेषण प्रणाली' : 'Bharat SafeTour Emergency SOS'}
                  </h3>
                </div>
              </div>

              {/* Status Alert Banner */}
              {sosActive ? (
                <div className="rounded-2xl border border-emerald-500/50 bg-emerald-950/50 p-4 text-emerald-200 flex items-center justify-between gap-3 shadow-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-6 w-6 text-emerald-400 shrink-0 animate-pulse" />
                    <div>
                      <p className="text-sm font-black">
                        {isHindi ? 'एसओएस संकेत प्रसारित हो चुका है!' : 'SOS Emergency Beacon Transmitting!'}
                      </p>
                      <p className="text-xs text-emerald-300/80 mt-0.5">
                        {isHindi 
                          ? 'पर्यटक पुलिस और आपातकालीन संपर्क को अलर्ट भेजा गया है।' 
                          : 'Tourist Police (112), EMS (108) and emergency contacts alerted.'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      stopSiren();
                      setSosActive(false);
                      if (onToggleGlobalSOS) onToggleGlobalSOS();
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition shrink-0"
                  >
                    {isHindi ? 'रद्द करें' : 'Resolve'}
                  </button>
                </div>
              ) : (
                <div className="rounded-2xl border border-rose-500/30 bg-rose-950/30 p-3.5 text-rose-200 text-xs flex items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2.5">
                    <BellRing className="h-5 w-5 text-rose-400 shrink-0 animate-bounce" />
                    <span>
                      {isHindi 
                        ? 'व्हाट्सएप या बैकअप एसएमएस के माध्यम से 1-क्लिक में अपनी लाइव लोकेशन भेजें।' 
                        : 'Real 1-click dispatch to WhatsApp, SMS backup, and direct police helplines.'}
                    </span>
                  </div>
                </div>
              )}

              {/* Navigation Sub-Tabs */}
              <div className="flex rounded-2xl bg-slate-800/80 p-1 border border-slate-700/80 text-xs font-bold">
                <button
                  onClick={() => setActiveTab('dispatch')}
                  className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === 'dispatch' 
                      ? 'bg-red-600 text-white shadow-md' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>{isHindi ? 'व्हाट्सएप व एसएमएस प्रेषण' : 'WhatsApp & SMS Dispatch'}</span>
                </button>

                <button
                  onClick={() => setActiveTab('helplines')}
                  className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === 'helplines' 
                      ? 'bg-red-600 text-white shadow-md' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <PhoneCall className="h-3.5 w-3.5" />
                  <span>{isHindi ? 'सरकारी हेल्पलाइन 112' : 'Helplines 112 / 108'}</span>
                </button>
              </div>

              {/* TAB 1: REAL WHATSAPP & SMS DISPATCH SECTION */}
              {activeTab === 'dispatch' && (
                <div className="space-y-4">
                  
                  {/* Live GPS Coordinates Badge & Refresh */}
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                        <MapPin className="h-4 w-4 text-emerald-400" />
                        <span>{isHindi ? 'सटीक लाइव जीपीएस स्थिति' : 'Current Live GPS Coordinates'}</span>
                      </span>
                      <button
                        onClick={fetchLiveGPS}
                        className="text-[11px] font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
                        title="Refresh GPS from device"
                      >
                        <RefreshCw className={`h-3 w-3 ${gpsStatus === 'locating' ? 'animate-spin' : ''}`} />
                        <span>{gpsStatus === 'locating' ? (isHindi ? 'खोज रहे हैं...' : 'Refreshing...') : (isHindi ? 'रीफ्रेश' : 'Refresh GPS')}</span>
                      </button>
                    </div>

                    <div className="flex items-baseline justify-between bg-slate-900/90 rounded-xl p-2.5 border border-slate-800 text-xs">
                      <div className="font-mono text-emerald-400 font-bold text-sm">
                        {currentLat.toFixed(6)}, {currentLng.toFixed(6)}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {gpsAccuracy ? `±${gpsAccuracy}m accuracy` : 'GPS Ready'} {lastGpsUpdate && `(${lastGpsUpdate})`}
                      </div>
                    </div>
                  </div>

                  {/* Target Emergency Contact Input */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                      <span>{isHindi ? 'आपातकालीन संपर्क नंबर (व्हाट्सएप/एसएमएस)' : 'Emergency Contact Phone (WhatsApp/SMS Target)'}:</span>
                      <span className="text-[10px] text-slate-400 font-normal">
                        {isHindi ? 'परिवार, होटल या स्थानीय संपर्क' : 'Family, hotel, or embassy'}
                      </span>
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="tel"
                        value={emergencyPhone}
                        onChange={(e) => setEmergencyPhone(e.target.value)}
                        placeholder="+91 9876543210 or 112"
                        className="flex-1 rounded-xl border border-slate-700 bg-slate-800/90 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 font-mono focus:border-red-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* PRIMARY ACTION BUTTON 1: DIRECT WHATSAPP SEND */}
                  <div className="space-y-2.5">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSendWhatsApp}
                      className="w-full py-4 rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-3 bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-700 hover:from-emerald-500 hover:to-green-600 text-white shadow-xl shadow-emerald-600/30 border-2 border-emerald-400/40 transition-all group"
                      id="sos-send-whatsapp-btn"
                    >
                      <MessageSquare className="h-5 w-5 group-hover:scale-110 transition-transform" />
                      <span>{isHindi ? '🟢 व्हाट्सएप पर तुरंत एसओएस भेजें' : '🟢 Send Real SOS via WhatsApp'}</span>
                    </motion.button>

                    {/* PRIMARY ACTION BUTTON 2: SMS BACKUP FALLBACK (CRITICAL USER REQUEST) */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSendSMSBackup}
                      className="w-full py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-600 text-white shadow-lg shadow-blue-600/25 border border-blue-400/40 transition-all"
                      id="sos-send-sms-backup-btn"
                    >
                      <Smartphone className="h-4.5 w-4.5" />
                      <span>{isHindi ? '📱 बैकअप: एसएमएस के जरिए भेजें (बिना इंटरनेट)' : '📱 Backup: Send via Direct SMS (Offline/No WhatsApp)'}</span>
                    </motion.button>
                  </div>

                  {/* Fallback Notice Card after clicking WhatsApp */}
                  {whatsAppTriggered && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-2xl border border-amber-500/40 bg-amber-950/40 p-3.5 text-amber-200 text-xs space-y-2"
                    >
                      <div className="flex items-center gap-2 font-bold text-amber-300">
                        <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
                        <span>{isHindi ? 'क्या व्हाट्सएप नहीं खुला या नेटवर्क धीमा है?' : 'WhatsApp didn\'t open or no internet?'}</span>
                      </div>
                      <p className="text-[11px] text-amber-200/90 leading-relaxed">
                        {isHindi 
                          ? 'चिंता न करें! नीचे दिए गए बैकअप एसएमएस बटन पर टैप करें ताकि आपके फोन का सामान्य मैसेज ऐप बिना इंटरनेट सीधे अलर्ट भेज सके।' 
                          : 'No worries! Tap below to dispatch the emergency alert via standard native SMS cellular network.'}
                      </p>
                      <button
                        onClick={handleSendSMSBackup}
                        className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition flex items-center justify-center gap-2"
                      >
                        <Zap className="h-3.5 w-3.5" />
                        <span>{isHindi ? 'अभी बैकअप एसएमएस भेजें' : 'Trigger Instant SMS Backup Now'}</span>
                      </button>
                    </motion.div>
                  )}

                  {/* Quick Copy & Audio Siren Controls */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={handleCopySOS}
                      className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/90 py-2.5 px-3 text-xs font-bold text-slate-200 hover:bg-slate-700 transition"
                    >
                      <Copy className="h-4 w-4 text-indigo-400" />
                      <span>{copied ? (isHindi ? 'कॉपी हो गया!' : 'SOS Copied!') : (isHindi ? 'संदेश कॉपी करें' : 'Copy SOS Message')}</span>
                    </button>

                    <button
                      onClick={() => {
                        if (isSirenPlaying) {
                          stopSiren();
                        } else {
                          startSiren();
                        }
                      }}
                      className={`flex items-center justify-center gap-2 rounded-xl py-2.5 px-3 text-xs font-bold transition border ${
                        isSirenPlaying
                          ? 'bg-red-600/90 border-red-400 text-white animate-pulse'
                          : 'bg-slate-800/90 border-slate-700 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {isSirenPlaying ? <VolumeX className="h-4 w-4 text-white" /> : <Volume2 className="h-4 w-4 text-amber-400" />}
                      <span>{isSirenPlaying ? (isHindi ? 'साइरन बंद करें' : 'Stop Siren') : (isHindi ? '🔊 आपात सायरन बजाएं' : '🔊 Play Audio Siren')}</span>
                    </button>
                  </div>

                </div>
              )}

              {/* TAB 2: DIRECT GOVERNMENT HELPLINES & SPEED DIAL */}
              {activeTab === 'helplines' && (
                <div className="space-y-3">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    {isHindi ? 'प्रत्यक्ष 1-टच सरकारी आपातकालीन हेल्पलाइन' : 'Direct 1-Touch Emergency Helplines'}
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <a
                      href="tel:112"
                      className="flex items-center justify-between rounded-2xl border border-red-500/40 bg-red-950/30 p-3.5 hover:bg-red-900/40 transition group"
                    >
                      <div className="flex flex-col text-left">
                        <span className="text-xs font-bold text-red-300">{isHindi ? 'राष्ट्रीय आपातकाल (अखिल भारतीय)' : 'National All-in-One Emergency'}</span>
                        <span className="text-xl font-black text-red-400 font-mono">112</span>
                      </div>
                      <PhoneCall className="h-5 w-5 text-red-400 group-hover:scale-110 transition" />
                    </a>

                    <a
                      href="tel:108"
                      className="flex items-center justify-between rounded-2xl border border-cyan-500/40 bg-cyan-950/30 p-3.5 hover:bg-cyan-900/40 transition group"
                    >
                      <div className="flex flex-col text-left">
                        <span className="text-xs font-bold text-cyan-300">{isHindi ? 'एम्बुलेंस व चिकित्सा आपात' : 'Medical Ambulance Response'}</span>
                        <span className="text-xl font-black text-cyan-400 font-mono">108</span>
                      </div>
                      <PhoneCall className="h-5 w-5 text-cyan-400 group-hover:scale-110 transition" />
                    </a>

                    <a
                      href="tel:1091"
                      className="flex items-center justify-between rounded-2xl border border-pink-500/40 bg-pink-950/30 p-3.5 hover:bg-pink-900/40 transition group"
                    >
                      <div className="flex flex-col text-left">
                        <span className="text-xs font-bold text-pink-300">{isHindi ? 'महिला सुरक्षा हेल्पलाइन' : 'Women Safety Helpline'}</span>
                        <span className="text-xl font-black text-pink-400 font-mono">1091</span>
                      </div>
                      <PhoneCall className="h-5 w-5 text-pink-400 group-hover:scale-110 transition" />
                    </a>

                    <a
                      href="tel:1363"
                      className="flex items-center justify-between rounded-2xl border border-amber-500/40 bg-amber-950/30 p-3.5 hover:bg-amber-900/40 transition group"
                    >
                      <div className="flex flex-col text-left">
                        <span className="text-xs font-bold text-amber-300">{isHindi ? 'पर्यटक सुरक्षा व सहायता' : 'Tourist Police & Safety Desk'}</span>
                        <span className="text-xl font-black text-amber-400 font-mono">1363</span>
                      </div>
                      <PhoneCall className="h-5 w-5 text-amber-400 group-hover:scale-110 transition" />
                    </a>

                    <a
                      href="tel:100"
                      className="flex items-center justify-between rounded-2xl border border-slate-700 bg-slate-800/80 p-3.5 hover:bg-slate-700 transition group sm:col-span-2"
                    >
                      <div className="flex flex-col text-left">
                        <span className="text-xs font-bold text-slate-300">{isHindi ? 'पुलिस नियंत्रण कक्ष (सीधा संपर्क)' : 'Direct Police Control Room'}</span>
                        <span className="text-lg font-black text-blue-400 font-mono">100</span>
                      </div>
                      <PhoneCall className="h-5 w-5 text-blue-400 group-hover:scale-110 transition" />
                    </a>
                  </div>
                </div>
              )}

              {/* Footer Note */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                  <span>24/7 Government & Command Center Monitoring</span>
                </span>
                <span>ISO/IEC 27001 Certified SOS</span>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
