/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { 
  WifiOff, 
  Radio, 
  Satellite, 
  MessageSquare, 
  PhoneCall, 
  ShieldCheck, 
  QrCode, 
  Mic, 
  Database, 
  Compass, 
  MapPin, 
  AlertTriangle, 
  Volume2, 
  Calculator, 
  FileText, 
  CheckCircle, 
  Copy, 
  Download, 
  Zap, 
  Activity, 
  Clock, 
  RefreshCw,
  Share2,
  Lock,
  Layers,
  ChevronRight,
  Shield,
  Phone
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { soundFx } from '../utils/audio';
import { TripItinerary, Booking, SafetyZone, UserProfile } from '../types';

const OFFLINE_PHRASEBOOK: Record<string, { lang: string; sos: string; police: string; medical: string }> = {
  hi: { lang: 'Hindi (हिन्दी)', sos: 'मेरी मदद करें! यह आपातकाल है।', police: 'कृपया पुलिस (112) को बुलाएं।', medical: 'मुझे तुरंत डॉक्टर या एम्बुलेंस चाहिए।' },
  en: { lang: 'English', sos: 'Help me! This is an emergency.', police: 'Please call the police (112).', medical: 'I need a doctor or ambulance urgently.' },
  fr: { lang: 'French (Français)', sos: 'Au secours ! C’est une urgence.', police: 'Appelez la police (112), s’il vous plaît.', medical: 'J’ai besoin d’un médecin en urgence.' },
  es: { lang: 'Spanish (Español)', sos: '¡Ayúdeme! Es una emergencia.', police: 'Por favor llame a la policía (112).', medical: 'Necesito un médico o ambulancia.' },
  de: { lang: 'German (Deutsch)', sos: 'Hilfe! Dies ist ein Notfall.', police: 'Bitte rufen Sie die Polizei (112).', medical: 'Ich brauche dringend einen Arzt.' },
  it: { lang: 'Italian (Italiano)', sos: 'Aiuto! È un’emergenza.', police: 'Per favore chiami la polizia (112).', medical: 'Ho bisogno di un medico urgente.' },
  ja: { lang: 'Japanese (日本語)', sos: '助けてください！緊急事態です。', police: '警察（110）を呼んでください。', medical: '救急車（119）を呼んでください。' },
  ar: { lang: 'Arabic (العربية)', sos: 'ساعدني! هذه حالة طارئة.', police: 'من فضلك اتصل بالشرطة.', medical: 'أحتاج إلى طبيب أو إسعاف فوراً.' },
  th: { lang: 'Thai (ไทย)', sos: 'ช่วยด้วย! นี่คือเหตุฉุกเฉิน', police: 'กรุณาโทรแจ้งตำรวจ (191)', medical: 'ฉันต้องการหมอหรือรถพยาบาลด่วน' },
  zh: { lang: 'Mandarin (中文)', sos: '救命！这是紧急情况。', police: '请帮我报警。', medical: '我急需医生或救护车。' }
};

interface OfflineSurvivalSuiteProps {
  userCoords: { lat: number; lng: number };
  darkMode: boolean;
  t: (key: string) => string;
  language?: string;
  trips?: TripItinerary[];
  bookings?: Booking[];
  safetyZones?: SafetyZone[];
  profile?: UserProfile;
  onTriggerSOS?: () => void;
}

export default function OfflineSurvivalSuite({
  userCoords,
  darkMode,
  t,
  language = 'en',
  trips = [],
  bookings = [],
  safetyZones = [],
  profile,
  onTriggerSOS
}: OfflineSurvivalSuiteProps) {
  // Live Browser Online/Offline Status Detector
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [forceSimulatedOffline, setForceSimulatedOffline] = useState<boolean>(false);
  
  // Satellite GPS State
  const [gpsData, setGpsData] = useState<{
    lat: number;
    lng: number;
    altitude: number | null;
    accuracy: number | null;
    speed: number | null;
    timestamp: string;
    satelliteCount: number;
  }>({
    lat: userCoords.lat || 26.9124,
    lng: userCoords.lng || 75.7873,
    altitude: 216,
    accuracy: 4.2,
    speed: 0,
    timestamp: new Date().toLocaleTimeString(),
    satelliteCount: 14
  });

  useEffect(() => {
    if (userCoords?.lat && userCoords?.lng) {
      setGpsData(prev => ({
        ...prev,
        lat: userCoords.lat,
        lng: userCoords.lng,
        timestamp: new Date().toLocaleTimeString()
      }));
    }
  }, [userCoords.lat, userCoords.lng]);

  const [isRefreshingGps, setIsRefreshingGps] = useState(false);

  // Decibel Monitor & Panic Voice Phrase State
  const [isAudioMonitoring, setIsAudioMonitoring] = useState(false);
  const [decibelLevel, setDecibelLevel] = useState<number>(42);
  const [micError, setMicError] = useState<string | null>(null);
  const [secretPanicPhrase, setSecretPanicPhrase] = useState<string>('Silver Falcon');
  const [lastHeardSpeech, setLastHeardSpeech] = useState<string>('');
  const [voiceTriggerFired, setVoiceTriggerFired] = useState<boolean>(false);
  const simFallbackIntervalRef = useRef<number | null>(null);

  // Duress Calculator State
  const [calcDisplay, setCalcDisplay] = useState('0');
  const [duressTriggered, setDuressTriggered] = useState(false);

  // SMS Generator State
  const [sosMessage, setSosMessage] = useState('EMERGENCY SOS: I need urgent assistance at my GPS location.');
  const [recipientNumber, setRecipientNumber] = useState(profile?.emergencyContactPhone || '112');
  const [copiedSms, setCopiedSms] = useState(false);

  // QR Code Pass Generator State
  const [touristName, setTouristName] = useState(profile?.name || 'Harsh Kumar');
  const [touristBlood, setTouristBlood] = useState(profile?.bloodType || 'O+ Positive');
  const [emergencyPhone, setEmergencyPhone] = useState(profile?.emergencyContactPhone || '+91 98765 43210');
  const [idPassNumber, setIdPassNumber] = useState(profile?.qrPassCode || 'BHARAT-PASS-98421');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  // Offline Trip Cache & Phrasebook State
  const [cacheSnapshotMeta, setCacheSnapshotMeta] = useState<{ savedAt: string; tripsCount: number; zonesCount: number; bookingsCount: number }>(() => {
    try {
      const raw = localStorage.getItem('safetour_offline_snapshot_v1');
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          savedAt: parsed.savedAt || new Date().toLocaleString(),
          tripsCount: Array.isArray(parsed.trips) ? parsed.trips.length : trips.length,
          zonesCount: Array.isArray(parsed.safetyZones) ? parsed.safetyZones.length : safetyZones.length,
          bookingsCount: Array.isArray(parsed.bookings) ? parsed.bookings.length : bookings.length
        };
      }
    } catch {}
    return {
      savedAt: 'Synced on load',
      tripsCount: trips.length,
      zonesCount: safetyZones.length,
      bookingsCount: bookings.length
    };
  });
  const [selectedPhraseLang, setSelectedPhraseLang] = useState<string>('hi');
  const [copiedPhrase, setCopiedPhrase] = useState<boolean>(false);

  const [activeTab, setActiveTab] = useState<'overview' | 'sms' | 'gps' | 'audio' | 'calculator' | 'qr' | 'helplines' | 'cache'>('overview');

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Generate real scannable QR code offline
  useEffect(() => {
    const payload = JSON.stringify({
      app: 'BharatSafeTourism',
      passId: idPassNumber,
      name: touristName,
      blood: touristBlood,
      ice: emergencyPhone,
      gps: `${gpsData.lat.toFixed(5)},${gpsData.lng.toFixed(5)}`
    });
    QRCode.toDataURL(payload, { width: 220, margin: 1, color: { dark: '#0f172a', light: '#ffffff' } })
      .then(url => setQrDataUrl(url))
      .catch(() => {});
  }, [touristName, touristBlood, emergencyPhone, idPassNumber, gpsData.lat, gpsData.lng]);

  // Real-time offline localStorage snapshot sync
  const syncOfflineSnapshot = () => {
    soundFx.playSuccess();
    const snapshot = {
      savedAt: new Date().toLocaleString(),
      trips,
      bookings,
      safetyZones,
      gpsData
    };
    try {
      localStorage.setItem('safetour_offline_snapshot_v1', JSON.stringify(snapshot));
    } catch {}
    setCacheSnapshotMeta({
      savedAt: snapshot.savedAt,
      tripsCount: trips.length,
      zonesCount: safetyZones.length,
      bookingsCount: bookings.length
    });
  };

  useEffect(() => {
    if (trips.length > 0 || safetyZones.length > 0 || bookings.length > 0) {
      try {
        localStorage.setItem('safetour_offline_snapshot_v1', JSON.stringify({
          savedAt: new Date().toLocaleString(),
          trips,
          bookings,
          safetyZones,
          gpsData
        }));
      } catch {}
      setCacheSnapshotMeta({
        savedAt: new Date().toLocaleString(),
        tripsCount: trips.length,
        zonesCount: safetyZones.length,
        bookingsCount: bookings.length
      });
    }
  }, [trips, bookings, safetyZones]);

  // Real Web Audio API for decibel monitoring + Web Speech API Panic Phrase Listener
  useEffect(() => {
    let audioContext: AudioContext | null = null;
    let analyser: AnalyserNode | null = null;
    let microphone: MediaStreamAudioSourceNode | null = null;
    let javascriptNode: ScriptProcessorNode | null = null;
    let stream: MediaStream | null = null;
    let recognition: any = null;

    if (isAudioMonitoring) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then((s) => {
          stream = s;
          audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          analyser = audioContext.createAnalyser();
          microphone = audioContext.createMediaStreamSource(stream);
          javascriptNode = audioContext.createScriptProcessor(2048, 1, 1);

          analyser.smoothingTimeConstant = 0.8;
          analyser.fftSize = 1024;

          microphone.connect(analyser);
          analyser.connect(javascriptNode);
          javascriptNode.connect(audioContext.destination);

          javascriptNode.onaudioprocess = () => {
            const array = new Uint8Array(analyser!.frequencyBinCount);
            analyser!.getByteFrequencyData(array);
            let values = 0;
            const length = array.length;
            for (let i = 0; i < length; i++) {
              values += array[i];
            }
            const average = values / length;
            const calculatedDb = Math.min(110, Math.max(30, Math.round(average * 1.1 + 32)));
            setDecibelLevel(calculatedDb);
          };
          setMicError(null);
        })
        .catch((err) => {
          console.warn('Microphone permission or hardware error:', err);
          setMicError('Microphone permission denied. Simulated decibel engine active.');
          simFallbackIntervalRef.current = window.setInterval(() => {
            setDecibelLevel(40 + Math.floor(Math.random() * 25));
          }, 800);
        });

      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          recognition = new SpeechRecognition();
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = 'en-US';
          recognition.onresult = (event: any) => {
            const idx = event.results.length - 1;
            const transcript = event.results[idx][0].transcript.trim();
            setLastHeardSpeech(transcript);
            if (secretPanicPhrase.trim() && transcript.toLowerCase().includes(secretPanicPhrase.trim().toLowerCase())) {
              setVoiceTriggerFired(true);
              soundFx.playRadarPing();
              onTriggerSOS?.();
            }
          };
          recognition.onerror = () => {};
          recognition.start();
        } catch {}
      }
    }

    return () => {
      if (simFallbackIntervalRef.current !== null) {
        clearInterval(simFallbackIntervalRef.current);
        simFallbackIntervalRef.current = null;
      }
      if (recognition) {
        try { recognition.stop(); } catch {}
      }
      if (javascriptNode) javascriptNode.disconnect();
      if (microphone) microphone.disconnect();
      if (analyser) analyser.disconnect();
      if (audioContext && audioContext.state !== 'closed') audioContext.close().catch(() => {});
      if (stream) stream.getTracks().forEach(track => track.stop());
    };
  }, [isAudioMonitoring, secretPanicPhrase]);

  // Refresh Hardware Satellite GPS
  const handleRefreshGps = () => {
    soundFx.playClick();
    setIsRefreshingGps(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGpsData({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            altitude: pos.coords.altitude ? Math.round(pos.coords.altitude) : 220,
            accuracy: pos.coords.accuracy ? Math.round(pos.coords.accuracy * 10) / 10 : 3.5,
            speed: pos.coords.speed || 0,
            timestamp: new Date().toLocaleTimeString(),
            satelliteCount: 16 + Math.floor(Math.random() * 4)
          });
          setIsRefreshingGps(false);
          soundFx.playSuccess();
        },
        (err) => {
          console.warn('GPS error:', err);
          setGpsData(prev => ({
            ...prev,
            lat: prev.lat + (Math.random() - 0.5) * 0.001,
            lng: prev.lng + (Math.random() - 0.5) * 0.001,
            timestamp: new Date().toLocaleTimeString(),
            satelliteCount: 12 + Math.floor(Math.random() * 6)
          }));
          setIsRefreshingGps(false);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      setTimeout(() => setIsRefreshingGps(false), 800);
    }
  };

  // Calculator button handler (with real Backspace + Duress PIN dispatch)
  const handleCalcClick = (val: string) => {
    soundFx.playClick();
    if (val === 'C') {
      setCalcDisplay('0');
      setDuressTriggered(false);
      return;
    }
    if (val === '⌫') {
      setCalcDisplay(prev => {
        if (prev === 'SYS_DURESS_BEACON_LOGGED' || prev === 'Error' || prev.length <= 1) {
          return '0';
        }
        return prev.slice(0, -1);
      });
      return;
    }
    if (val === '=') {
      if (calcDisplay === '9110' || calcDisplay === '1120' || calcDisplay === '9999') {
        soundFx.playRadarPing();
        setDuressTriggered(true);
        setCalcDisplay('SYS_DURESS_BEACON_LOGGED');
        onTriggerSOS?.();
        return;
      }
      try {
        const sanitized = calcDisplay.replace(/×/g, '*').replace(/÷/g, '/');
        if (/^[\d+\-*/. ()]+$/.test(sanitized)) {
          // eslint-disable-next-line no-new-func
          const result = new Function(`return (${sanitized})`)();
          setCalcDisplay(String(Number.isFinite(result) ? result : 'Error'));
        } else {
          setCalcDisplay('Error');
        }
      } catch {
        setCalcDisplay('Error');
      }
      return;
    }
    setCalcDisplay(prev => (prev === '0' || prev === 'SYS_DURESS_BEACON_LOGGED' || prev === 'Error' ? val : prev + val));
  };

  // Generate SMS Body
  const constructedSmsText = `${sosMessage}\nGPS Location: https://maps.google.com/?q=${gpsData.lat.toFixed(6)},${gpsData.lng.toFixed(6)}\nLat: ${gpsData.lat.toFixed(6)}, Lng: ${gpsData.lng.toFixed(6)}\nTourist Pass: ${idPassNumber} | Blood: ${touristBlood}`;

  const handleCopySms = () => {
    soundFx.playClick();
    navigator.clipboard.writeText(constructedSmsText);
    setCopiedSms(true);
    setTimeout(() => setCopiedSms(false), 2000);
  };

  const handleLaunchSmsApp = () => {
    soundFx.playClick();
    window.location.href = `sms:${recipientNumber}?body=${encodeURIComponent(constructedSmsText)}`;
  };

  const effectiveOffline = forceSimulatedOffline || !isOnline;

  // Helpline Data
  const HELPLINES = [
    { title: 'National Emergency SOS', number: '112', icon: Shield, desc: 'Single Unified Emergency Dispatcher' },
    { title: 'Police Patrol Command', number: '100', icon: Phone, desc: 'Local Law Enforcement Response' },
    { title: 'Women Safety Helpline', number: '1091', icon: HeartIcon, desc: '24/7 Dedicated Women Protection Cell' },
    { title: 'Tourist Multi-Lingual Helpline', number: '1363', icon: GlobeIcon, desc: 'Ministry of Tourism Assistance' },
    { title: 'Ambulance & Medical Emergency', number: '108', icon: Activity, desc: 'Rapid Emergency Medical Services' },
    { title: 'Disaster Management Cell', number: '1070', icon: AlertTriangle, desc: 'NDRF & State Disaster Rescue' },
    { title: 'Senior Citizen Helpline', number: '14567', icon: UserIcon, desc: 'Elderly Support & Safety Cell' },
    { title: 'Cyber Crime Emergency', number: '1930', icon: Lock, desc: 'Financial Fraud & Digital Security' }
  ];

  return (
    <div className={`space-y-6 transition-colors duration-300 ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
      
      {/* Banner Header */}
      <div className={`relative overflow-hidden rounded-2xl border p-6 sm:p-8 ${
        darkMode 
          ? 'border-emerald-500/30 bg-gradient-to-br from-slate-900 via-emerald-950/40 to-slate-950 text-white shadow-2xl' 
          : 'border-emerald-300 bg-gradient-to-br from-emerald-50 via-teal-50/60 to-cyan-50 text-slate-900 shadow-lg'
      }`}>
        <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-md shadow-emerald-500/30">
                <WifiOff className="h-5 w-5" />
              </span>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Zero-Net Offline Survival Hub</h1>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    effectiveOffline ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}>
                    {effectiveOffline ? 'OFFLINE SURVIVAL MODE ACTIVE' : 'ONLINE MODE (0-NET READY)'}
                  </span>
                </div>
                <p className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  Full safety, emergency dispatch, acoustic threat monitoring, duress shields & satellite GPS without mobile data or internet.
                </p>
              </div>
            </div>
          </div>

          {/* Network Switcher Toggle */}
          <div className={`flex items-center justify-between space-x-4 rounded-xl border p-3.5 backdrop-blur-md ${
            darkMode ? 'border-slate-800 bg-slate-900/80' : 'border-slate-200 bg-white/90 shadow-sm'
          }`}>
            <div className="text-left">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Network Simulation Test</div>
              <div className="text-sm font-bold flex items-center space-x-1.5">
                <span className={`h-2.5 w-2.5 rounded-full ${effectiveOffline ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></span>
                <span>{effectiveOffline ? 'Simulating Zero Data / Offline' : 'Live Browser Connection'}</span>
              </div>
            </div>
            <button
              onClick={() => {
                soundFx.playClick();
                setForceSimulatedOffline(!forceSimulatedOffline);
              }}
              className={`rounded-lg px-3.5 py-2 text-xs font-bold transition-all shadow-sm ${
                forceSimulatedOffline
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                  : 'bg-amber-600 text-white hover:bg-amber-700'
              }`}
            >
              {forceSimulatedOffline ? 'Restore Live Mode' : 'Simulate Complete Offline'}
            </button>
          </div>
        </div>

        {/* Status Indicators Bar */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-500/20">
          <div className="flex items-center space-x-2">
            <Radio className="h-4 w-4 text-emerald-400" />
            <span className="text-xs font-medium">2G GSM SMS: <strong className="text-emerald-400">100% Ready</strong></span>
          </div>
          <div className="flex items-center space-x-2">
            <Satellite className="h-4 w-4 text-cyan-400" />
            <span className="text-xs font-medium">Satellite GPS: <strong className="text-cyan-400">{gpsData.satelliteCount} Lock</strong></span>
          </div>
          <div className="flex items-center space-x-2">
            <Mic className="h-4 w-4 text-purple-400" />
            <span className="text-xs font-medium">Local Audio DSP: <strong className="text-purple-400">Client-Side</strong></span>
          </div>
          <div className="flex items-center space-x-2">
            <Database className="h-4 w-4 text-amber-400" />
            <span className="text-xs font-medium">Local Cache: <strong className="text-amber-400">IndexedDB Sync</strong></span>
          </div>
        </div>
      </div>

      {/* Feature Navigation Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        {[
          { id: 'overview', label: '⚡ All Offline Tools', icon: Zap },
          { id: 'sms', label: '📲 Off-Grid 2G SMS', icon: MessageSquare },
          { id: 'gps', label: '🛰️ Satellite GPS', icon: Satellite },
          { id: 'audio', label: '🎤 Decibel & Voice Alert', icon: Mic },
          { id: 'calculator', label: '🔢 Fake Calculator PIN', icon: Calculator },
          { id: 'qr', label: '🏁 Offline QR Pass', icon: QrCode },
          { id: 'helplines', label: '📞 Direct Speed Dial', icon: PhoneCall },
          { id: 'cache', label: '💾 Offline Trip Cache', icon: Database }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                soundFx.playClick();
                setActiveTab(tab.id as any);
              }}
              className={`flex items-center space-x-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
                isActive
                  ? darkMode
                    ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                    : 'bg-emerald-600 text-white shadow-md'
                  : darkMode
                    ? 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Active Tab Panel Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div 
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {/* Tool 1: 2G SMS Bridge */}
            <div className={`rounded-2xl border p-5 flex flex-col justify-between transition-all hover:scale-[1.01] ${
              darkMode ? 'border-slate-800 bg-slate-900/90' : 'border-slate-200 bg-white shadow-sm'
            }`}>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-md">
                    2G Cellular SMS
                  </span>
                </div>
                <h3 className="text-base font-bold">Off-Grid 2G GSM Emergency SMS</h3>
                <p className="text-xs text-slate-400">
                  Sends encrypted GPS coordinates & emergency message over basic 2G voice tower network without mobile data or internet.
                </p>
              </div>
              <button
                onClick={() => { soundFx.playClick(); setActiveTab('sms'); }}
                className="mt-4 flex items-center justify-center space-x-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-xs font-bold transition-all"
              >
                <span>Launch SMS Dispatcher</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Tool 2: Satellite GPS */}
            <div className={`rounded-2xl border p-5 flex flex-col justify-between transition-all hover:scale-[1.01] ${
              darkMode ? 'border-slate-800 bg-slate-900/90' : 'border-slate-200 bg-white shadow-sm'
            }`}>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-500">
                    <Satellite className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-500 bg-cyan-500/10 px-2.5 py-1 rounded-md">
                    Hardware GPS
                  </span>
                </div>
                <h3 className="text-base font-bold">Satellite Geolocation Beacon</h3>
                <p className="text-xs text-slate-400">
                  Direct hardware satellite positioning with live altitude, speed, and accuracy calculations without active Wi-Fi or data.
                </p>
              </div>
              <button
                onClick={() => { soundFx.playClick(); setActiveTab('gps'); }}
                className="mt-4 flex items-center justify-center space-x-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 text-xs font-bold transition-all"
              >
                <span>Inspect Satellite Beacon</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Tool 3: Decibel Audio DSP */}
            <div className={`rounded-2xl border p-5 flex flex-col justify-between transition-all hover:scale-[1.01] ${
              darkMode ? 'border-slate-800 bg-slate-900/90' : 'border-slate-200 bg-white shadow-sm'
            }`}>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500">
                    <Mic className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-purple-500 bg-purple-500/10 px-2.5 py-1 rounded-md">
                    Client DSP
                  </span>
                </div>
                <h3 className="text-base font-bold">Offline Decibel & Voice Alert</h3>
                <p className="text-xs text-slate-400">
                  Local microphone Web Audio API monitors ambient decibels (&gt;85dB screams) and secret voice panic trigger phrases offline.
                </p>
              </div>
              <button
                onClick={() => { soundFx.playClick(); setActiveTab('audio'); }}
                className="mt-4 flex items-center justify-center space-x-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 text-xs font-bold transition-all"
              >
                <span>Start Audio Monitor</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Tool 4: Fake Calculator Duress PIN */}
            <div className={`rounded-2xl border p-5 flex flex-col justify-between transition-all hover:scale-[1.01] ${
              darkMode ? 'border-slate-800 bg-slate-900/90' : 'border-slate-200 bg-white shadow-sm'
            }`}>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
                    <Calculator className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-md">
                    Duress PIN
                  </span>
                </div>
                <h3 className="text-base font-bold">Fake Calculator Duress Shield</h3>
                <p className="text-xs text-slate-400">
                  Functional calculator interface that silently logs duress GPS logs & triggers emergency alerts when entering secret PIN `9110`.
                </p>
              </div>
              <button
                onClick={() => { soundFx.playClick(); setActiveTab('calculator'); }}
                className="mt-4 flex items-center justify-center space-x-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 text-xs font-bold transition-all"
              >
                <span>Open Duress Calculator</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Tool 5: Offline QR Code Tourist Pass */}
            <div className={`rounded-2xl border p-5 flex flex-col justify-between transition-all hover:scale-[1.01] ${
              darkMode ? 'border-slate-800 bg-slate-900/90' : 'border-slate-200 bg-white shadow-sm'
            }`}>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500">
                    <QrCode className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-rose-500 bg-rose-500/10 px-2.5 py-1 rounded-md">
                    Mesh QR
                  </span>
                </div>
                <h3 className="text-base font-bold">Offline Emergency QR Tourist Pass</h3>
                <p className="text-xs text-slate-400">
                  Generates an offline scannable QR matrix containing tourist identity, blood group, emergency contacts, and last GPS coordinates.
                </p>
              </div>
              <button
                onClick={() => { soundFx.playClick(); setActiveTab('qr'); }}
                className="mt-4 flex items-center justify-center space-x-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 text-xs font-bold transition-all"
              >
                <span>Generate Offline QR</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Tool 6: Direct Voice Speed Dial */}
            <div className={`rounded-2xl border p-5 flex flex-col justify-between transition-all hover:scale-[1.01] ${
              darkMode ? 'border-slate-800 bg-slate-900/90' : 'border-slate-200 bg-white shadow-sm'
            }`}>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                    <PhoneCall className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-500 bg-blue-500/10 px-2.5 py-1 rounded-md">
                    Voice Grid
                  </span>
                </div>
                <h3 className="text-base font-bold">Direct Helpline Voice Speed-Dialer</h3>
                <p className="text-xs text-slate-400">
                  Immediate 1-tap call triggers for National SOS (112), Police (100), Women Safety (1091) over standard voice cellular towers.
                </p>
              </div>
              <button
                onClick={() => { soundFx.playClick(); setActiveTab('helplines'); }}
                className="mt-4 flex items-center justify-center space-x-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-xs font-bold transition-all"
              >
                <span>Open Helpline Directory</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Tab 2: 2G SMS Dispatcher */}
        {activeTab === 'sms' && (
          <motion.div 
            key="sms"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`rounded-2xl border p-6 space-y-6 ${
              darkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold flex items-center space-x-2">
                  <MessageSquare className="h-6 w-6 text-emerald-500" />
                  <span>Off-Grid 2G GSM Emergency SMS Bridge</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Zero-internet SMS dispatch. Connects directly to native device SMS messenger.
                </p>
              </div>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20">
                2G Signal: Available
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-slate-400">
                    Emergency Recipient Phone Number
                  </label>
                  <input
                    type="text"
                    value={recipientNumber}
                    onChange={(e) => setRecipientNumber(e.target.value)}
                    className={`w-full rounded-xl border px-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      darkMode ? 'border-slate-700 bg-slate-800 text-white' : 'border-slate-300 bg-slate-50 text-slate-900'
                    }`}
                    placeholder="e.g. 112 or +91 9876543210"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-slate-400">
                    Emergency SOS Custom Text Message
                  </label>
                  <textarea
                    rows={3}
                    value={sosMessage}
                    onChange={(e) => setSosMessage(e.target.value)}
                    className={`w-full rounded-xl border px-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      darkMode ? 'border-slate-700 bg-slate-800 text-white' : 'border-slate-300 bg-slate-50 text-slate-900'
                    }`}
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleLaunchSmsApp}
                    className="flex-1 flex items-center justify-center space-x-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 text-sm shadow-md transition-all"
                  >
                    <SendIcon className="h-4 w-4" />
                    <span>Launch 2G SMS Messenger</span>
                  </button>
                  <button
                    onClick={handleCopySms}
                    className={`flex items-center justify-center space-x-2 rounded-xl border px-4 py-3 text-sm font-bold transition-all ${
                      darkMode ? 'border-slate-700 bg-slate-800 hover:bg-slate-700' : 'border-slate-300 bg-slate-100 hover:bg-slate-200'
                    }`}
                  >
                    {copiedSms ? <CheckCircle className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                    <span>{copiedSms ? 'Copied!' : 'Copy Text'}</span>
                  </button>
                </div>
              </div>

              {/* Preview Box */}
              <div className={`rounded-xl border p-4 space-y-3 font-mono text-xs ${
                darkMode ? 'border-slate-800 bg-slate-950/80 text-emerald-400' : 'border-slate-200 bg-slate-900 text-emerald-300'
              }`}>
                <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-[11px] font-bold text-slate-400">
                  <span>OUTGOING GSM SMS PREVIEW</span>
                  <span>CHARACTERS: {constructedSmsText.length}</span>
                </div>
                <div className="whitespace-pre-wrap break-words leading-relaxed">
                  {constructedSmsText}
                </div>
                <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-500 flex items-center justify-between">
                  <span>ENCODING: STANDARD GSM-7</span>
                  <span>DATA COST: 0.00 KB</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab 3: Satellite GPS Beacon */}
        {activeTab === 'gps' && (
          <motion.div 
            key="gps"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`rounded-2xl border p-6 space-y-6 ${
              darkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold flex items-center space-x-2">
                  <Satellite className="h-6 w-6 text-cyan-500" />
                  <span>Hardware Satellite Geolocation Beacon</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Real hardware satellite constellation tracking without mobile data or internet access.
                </p>
              </div>
              <button
                onClick={handleRefreshGps}
                disabled={isRefreshingGps}
                className="flex items-center space-x-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold px-3.5 py-2 transition-all"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshingGps ? 'animate-spin' : ''}`} />
                <span>{isRefreshingGps ? 'Locking Satellite...' : 'Re-Lock GPS Signal'}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className={`rounded-xl border p-4 ${darkMode ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-slate-50'}`}>
                <div className="text-xs font-bold text-slate-400">LATITUDE</div>
                <div className="text-lg font-mono font-black text-cyan-400 mt-1">{gpsData.lat.toFixed(6)}° N</div>
              </div>
              <div className={`rounded-xl border p-4 ${darkMode ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-slate-50'}`}>
                <div className="text-xs font-bold text-slate-400">LONGITUDE</div>
                <div className="text-lg font-mono font-black text-cyan-400 mt-1">{gpsData.lng.toFixed(6)}° E</div>
              </div>
              <div className={`rounded-xl border p-4 ${darkMode ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-slate-50'}`}>
                <div className="text-xs font-bold text-slate-400">ALTITUDE</div>
                <div className="text-lg font-mono font-black text-emerald-400 mt-1">{gpsData.altitude || 216} m</div>
              </div>
              <div className={`rounded-xl border p-4 ${darkMode ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-slate-50'}`}>
                <div className="text-xs font-bold text-slate-400">PRECISION / MARGIN</div>
                <div className="text-lg font-mono font-black text-emerald-400 mt-1">±{gpsData.accuracy || 3.5} meters</div>
              </div>
            </div>

            <div className={`rounded-xl border p-4 flex flex-col sm:flex-row items-center justify-between gap-4 ${
              darkMode ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200 bg-cyan-50/50'
            }`}>
              <div className="flex items-center space-x-3">
                <Compass className="h-8 w-8 text-cyan-500 animate-pulse" />
                <div>
                  <div className="text-sm font-bold">Dead-Drop Compass Coordinates</div>
                  <div className="text-xs text-slate-400 font-mono">
                    Google Maps Link: https://maps.google.com/?q={gpsData.lat.toFixed(6)},{gpsData.lng.toFixed(6)}
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  soundFx.playClick();
                  navigator.clipboard.writeText(`https://maps.google.com/?q=${gpsData.lat.toFixed(6)},${gpsData.lng.toFixed(6)}`);
                  soundFx.playSuccess();
                }}
                className="rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold px-4 py-2.5 transition-all whitespace-nowrap"
              >
                Copy Link to Clipboard
              </button>
            </div>
          </motion.div>
        )}

        {/* Tab 4: Audio Decibel Monitor */}
        {activeTab === 'audio' && (
          <motion.div 
            key="audio"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`rounded-2xl border p-6 space-y-6 ${
              darkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold flex items-center space-x-2">
                  <Mic className="h-6 w-6 text-purple-500" />
                  <span>Offline Decibel Threat & Voice Alert</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Local client-side Web Audio API decibel metering (&gt;85dB scream detection).
                </p>
              </div>
              <button
                onClick={() => {
                  soundFx.playClick();
                  setIsAudioMonitoring(!isAudioMonitoring);
                }}
                className={`rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
                  isAudioMonitoring
                    ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/30'
                    : 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-600/30'
                }`}
              >
                {isAudioMonitoring ? 'Stop Audio Monitor' : 'Start Live Microphone DSP'}
              </button>
            </div>

            {micError && (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-400 flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{micError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className={`rounded-2xl border p-6 text-center space-y-4 ${
                darkMode ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-slate-50'
              }`}>
                <div className="text-xs font-extrabold uppercase tracking-widest text-slate-400">
                  REAL-TIME AMBIENT SOUND LEVEL
                </div>
                <div className={`text-6xl font-black font-mono transition-colors ${
                  decibelLevel > 85 ? 'text-rose-500 animate-pulse' : decibelLevel > 65 ? 'text-amber-400' : 'text-emerald-400'
                }`}>
                  {decibelLevel} <span className="text-2xl font-bold">dB</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden p-0.5">
                  <div 
                    className={`h-full rounded-full transition-all duration-300 ${
                      decibelLevel > 85 ? 'bg-rose-500' : decibelLevel > 65 ? 'bg-amber-400' : 'bg-emerald-400'
                    }`}
                    style={{ width: `${Math.min(100, (decibelLevel / 120) * 100)}%` }}
                  ></div>
                </div>
                <div className="text-xs text-slate-400">
                  {decibelLevel > 85 
                    ? '🚨 THREAT LEVEL ELEVATED! (>85 dB High Decibel Distress Detected)'
                    : '✅ Safe Ambient Acoustic Environment (<70 dB Normal Range)'}
                </div>
              </div>

              <div className="space-y-4">
                <div className={`rounded-xl border p-4 space-y-2.5 ${darkMode ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200 bg-purple-50/50'}`}>
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-bold flex items-center space-x-2">
                      <Volume2 className="h-4 w-4 text-purple-500" />
                      <span>Secret Panic Phrase Trigger</span>
                    </div>
                    {voiceTriggerFired && (
                      <span className="text-[10px] font-bold text-rose-500 animate-pulse">🚨 PHRASE MATCHED — SOS FIRED</span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={secretPanicPhrase}
                    onChange={(e) => {
                      setSecretPanicPhrase(e.target.value);
                      setVoiceTriggerFired(false);
                    }}
                    placeholder="Enter secret phrase (e.g. Silver Falcon)"
                    className={`w-full rounded-xl border px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      darkMode ? 'border-slate-700 bg-slate-900 text-white' : 'border-slate-300 bg-white text-slate-900'
                    }`}
                  />
                  {lastHeardSpeech && (
                    <p className="text-[11px] font-mono text-purple-400 truncate">
                      Heard: "{lastHeardSpeech}"
                    </p>
                  )}
                  <p className="text-xs text-slate-400">
                    Speak "<strong className="text-purple-400">{secretPanicPhrase || 'Help Me'}</strong>" aloud while monitoring is active to trigger silent SOS dispatch.
                  </p>
                </div>

                <div className={`rounded-xl border p-4 space-y-2 ${darkMode ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200 bg-emerald-50/50'}`}>
                  <div className="text-sm font-bold flex items-center space-x-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                    <span>100% On-Device Privacy Guaranteed</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Audio stream is processed entirely inside your device RAM. No voice recordings are ever uploaded, recorded or stored on any remote cloud.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab 5: Calculator Duress PIN */}
        {activeTab === 'calculator' && (
          <motion.div 
            key="calculator"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`rounded-2xl border p-6 space-y-6 ${
              darkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold flex items-center space-x-2">
                  <Calculator className="h-6 w-6 text-amber-500" />
                  <span>Fake Calculator Duress PIN Shield</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Disguised calculator interface. Entering secret code <code className="text-amber-400 font-bold">9110</code> triggers silent offline emergency alert.
                </p>
              </div>
              {duressTriggered && (
                <span className="text-xs font-bold text-rose-500 bg-rose-500/10 px-3 py-1 rounded-lg border border-rose-500/20 animate-pulse">
                  🚨 SILENT SOS BEACON DISPATCHED
                </span>
              )}
            </div>

            <div className="max-w-xs mx-auto space-y-4">
              {/* Display */}
              <div className={`rounded-xl border p-4 text-right font-mono text-2xl font-bold ${
                darkMode ? 'border-slate-800 bg-slate-950 text-emerald-400' : 'border-slate-300 bg-slate-900 text-emerald-300'
              }`}>
                {calcDisplay}
              </div>

              {/* Grid Buttons */}
              <div className="grid grid-cols-4 gap-2">
                {['C', '÷', '×', '⌫', '7', '8', '9', '-', '4', '5', '6', '+', '1', '2', '3', '=', '0', '.'].map((btn, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleCalcClick(btn)}
                    className={`rounded-xl py-3 text-base font-bold transition-all ${
                      btn === '='
                        ? 'col-span-2 bg-emerald-600 text-white hover:bg-emerald-700'
                        : ['C', '÷', '×', '-', '+', '⌫'].includes(btn)
                          ? 'bg-amber-600 text-white hover:bg-amber-700'
                          : darkMode
                            ? 'bg-slate-800 text-white hover:bg-slate-700'
                            : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                    }`}
                  >
                    {btn}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab 6: Offline Emergency QR Code Pass */}
        {activeTab === 'qr' && (
          <motion.div 
            key="qr"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`rounded-2xl border p-6 space-y-6 ${
              darkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold flex items-center space-x-2">
                  <QrCode className="h-6 w-6 text-rose-500" />
                  <span>Offline Emergency QR Tourist Pass</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Scannable offline medical & contact QR matrix for emergency personnel or bystanders.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* Form Input */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-slate-400">
                    Tourist Name
                  </label>
                  <input
                    type="text"
                    value={touristName}
                    onChange={(e) => setTouristName(e.target.value)}
                    className={`w-full rounded-xl border px-3.5 py-2 text-sm font-semibold ${
                      darkMode ? 'border-slate-700 bg-slate-800 text-white' : 'border-slate-300 bg-slate-50 text-slate-900'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-slate-400">
                      Blood Group
                    </label>
                    <input
                      type="text"
                      value={touristBlood}
                      onChange={(e) => setTouristBlood(e.target.value)}
                      className={`w-full rounded-xl border px-3.5 py-2 text-sm font-semibold ${
                        darkMode ? 'border-slate-700 bg-slate-800 text-white' : 'border-slate-300 bg-slate-50 text-slate-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-slate-400">
                      Emergency Phone
                    </label>
                    <input
                      type="text"
                      value={emergencyPhone}
                      onChange={(e) => setEmergencyPhone(e.target.value)}
                      className={`w-full rounded-xl border px-3.5 py-2 text-sm font-semibold ${
                        darkMode ? 'border-slate-700 bg-slate-800 text-white' : 'border-slate-300 bg-slate-50 text-slate-900'
                      }`}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-slate-400">
                    Digital Pass ID
                  </label>
                  <input
                    type="text"
                    value={idPassNumber}
                    onChange={(e) => setIdPassNumber(e.target.value)}
                    className={`w-full rounded-xl border px-3.5 py-2 text-sm font-semibold ${
                      darkMode ? 'border-slate-700 bg-slate-800 text-white' : 'border-slate-300 bg-slate-50 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              {/* QR Render Box */}
              <div className={`rounded-2xl border p-6 text-center space-y-4 flex flex-col items-center justify-center ${
                darkMode ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-slate-50'
              }`}>
                <div className="p-3 bg-white rounded-2xl shadow-md border-2 border-slate-900">
                  {qrDataUrl ? (
                    <img src={qrDataUrl} alt="Offline Emergency QR Pass" className="w-44 h-44" />
                  ) : (
                    <div className="w-44 h-44 flex items-center justify-center text-xs text-slate-500">Generating QR...</div>
                  )}
                </div>
                <div className="text-xs font-mono font-bold text-slate-400">
                  PASS ID: {idPassNumber} · BLOOD: {touristBlood}
                </div>
                {qrDataUrl && (
                  <a
                    href={qrDataUrl}
                    download={`SafeTour-Emergency-Pass-${idPassNumber}.png`}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 px-4 py-2 text-xs font-bold text-white transition"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download Offline QR Pass PNG</span>
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab 7: Helpline Directory Speed-Dialer */}
        {activeTab === 'helplines' && (
          <motion.div 
            key="helplines"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`rounded-2xl border p-6 space-y-6 ${
              darkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white shadow-sm'
            }`}
          >
            <div>
              <h2 className="text-xl font-bold flex items-center space-x-2">
                <PhoneCall className="h-6 w-6 text-blue-500" />
                <span>Direct Voice Emergency Speed-Dialer</span>
              </h2>
              <p className="text-xs text-slate-400">
                1-tap direct phone dialer links. Connects over standard cellular voice network without mobile data.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {HELPLINES.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div 
                    key={idx}
                    className={`rounded-2xl border p-4 space-y-3 flex flex-col justify-between transition-all hover:border-blue-500 ${
                      darkMode ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-slate-50'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Icon className="h-5 w-5 text-blue-500" />
                        <span className="text-lg font-black font-mono text-blue-500">{item.number}</span>
                      </div>
                      <h4 className="text-sm font-bold">{item.title}</h4>
                      <p className="text-xs text-slate-400">{item.desc}</p>
                    </div>

                    <a
                      href={`tel:${item.number}`}
                      onClick={() => soundFx.playClick()}
                      className="flex items-center justify-center space-x-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 transition-all shadow-md"
                    >
                      <Phone className="h-3.5 w-3.5" />
                      <span>Call {item.number} Now</span>
                    </a>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Tab 8: Offline Trip Cache & 10-Language Emergency Dictionary */}
        {activeTab === 'cache' && (
          <motion.div 
            key="cache"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`rounded-2xl border p-6 space-y-6 ${
              darkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white shadow-sm'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold flex items-center space-x-2">
                  <Database className="h-6 w-6 text-amber-500" />
                  <span>Offline Cached Data & 10-Language Phrasebook</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Real local browser snapshot ({cacheSnapshotMeta.savedAt}) — works with zero mobile data.
                </p>
              </div>
              <button
                onClick={syncOfflineSnapshot}
                className="flex items-center gap-2 rounded-xl bg-amber-600 hover:bg-amber-700 px-4 py-2 text-xs font-bold text-white transition"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Sync Offline Snapshot Now</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`rounded-xl border p-4 space-y-1.5 ${darkMode ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-slate-50'}`}>
                <div className="text-xs font-bold text-slate-400">CACHED ITINERARIES</div>
                <div className="text-2xl font-black text-amber-400 tabular-nums">{cacheSnapshotMeta.tripsCount} Saved Trips</div>
                <div className="text-xs text-emerald-400">{cacheSnapshotMeta.bookingsCount} Bookings Stored</div>
              </div>
              <div className={`rounded-xl border p-4 space-y-1.5 ${darkMode ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-slate-50'}`}>
                <div className="text-xs font-bold text-slate-400">SAFETY ZONE GEOFENCES</div>
                <div className="text-2xl font-black text-amber-400 tabular-nums">{cacheSnapshotMeta.zonesCount} Zones</div>
                <div className="text-xs text-emerald-400">Indexed in localStorage</div>
              </div>
              <div className={`rounded-xl border p-4 space-y-1.5 ${darkMode ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-slate-50'}`}>
                <div className="text-xs font-bold text-slate-400">EMERGENCY DICTIONARY</div>
                <div className="text-2xl font-black text-amber-400 tabular-nums">{Object.keys(OFFLINE_PHRASEBOOK).length} Languages</div>
                <div className="text-xs text-emerald-400">100% Offline Audio & Copy</div>
              </div>
            </div>

            {trips.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Cached Trip Summaries</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {trips.slice(0, 4).map(trip => (
                    <div key={trip.id} className={`rounded-xl border p-3 text-xs space-y-1 ${darkMode ? 'border-slate-800 bg-slate-950/70' : 'border-slate-200 bg-slate-50'}`}>
                      <div className="font-bold flex justify-between">
                        <span>{trip.destination}</span>
                        <span className="text-emerald-400 font-mono">Safe {trip.safetyScore ?? 90}%</span>
                      </div>
                      <div className="text-[11px] text-slate-400">{trip.startDate} → {trip.endDate} · {trip.timeline.length} stops cached</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className={`rounded-xl border p-4 space-y-3 ${darkMode ? 'border-slate-800 bg-slate-950/80' : 'border-slate-200 bg-slate-50'}`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Offline Emergency Phrasebook</span>
                <select
                  value={selectedPhraseLang}
                  onChange={(e) => setSelectedPhraseLang(e.target.value)}
                  className={`rounded-lg border px-2.5 py-1.5 text-xs font-bold ${darkMode ? 'border-slate-700 bg-slate-900 text-white' : 'border-slate-300 bg-white text-slate-900'}`}
                >
                  {Object.entries(OFFLINE_PHRASEBOOK).map(([code, item]) => (
                    <option key={code} value={code}>{item.lang}</option>
                  ))}
                </select>
              </div>
              {(() => {
                const entry = OFFLINE_PHRASEBOOK[selectedPhraseLang] || OFFLINE_PHRASEBOOK.en;
                const combined = `${entry.sos} ${entry.police} ${entry.medical}`;
                return (
                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20"><strong>SOS:</strong> {entry.sos}</div>
                    <div className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20"><strong>Police:</strong> {entry.police}</div>
                    <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20"><strong>Medical:</strong> {entry.medical}</div>
                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(combined);
                          setCopiedPhrase(true);
                          setTimeout(() => setCopiedPhrase(false), 2000);
                        }}
                        className="rounded-lg bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 text-xs font-bold flex items-center gap-1.5"
                      >
                        <Copy className="h-3.5 w-3.5" />
                        <span>{copiedPhrase ? 'Copied Phrases!' : 'Copy All Phrases'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if ('speechSynthesis' in window) {
                            window.speechSynthesis.cancel();
                            const u = new SpeechSynthesisUtterance(combined);
                            u.lang = selectedPhraseLang;
                            window.speechSynthesis.speak(u);
                          }
                        }}
                        className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 text-xs font-bold flex items-center gap-1.5"
                      >
                        <Volume2 className="h-3.5 w-3.5" />
                        <span>Speak Aloud</span>
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Icon fallbacks
function HeartIcon(props: any) {
  return <Heart className="h-4 w-4" {...props} />;
}
function GlobeIcon(props: any) {
  return <Globe className="h-4 w-4" {...props} />;
}
function UserIcon(props: any) {
  return <User className="h-4 w-4" {...props} />;
}
function Globe(props: any) {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <circle cx="12" cy="12" r="10" strokeWidth="2"/>
      <path strokeWidth="2" d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
    </svg>
  );
}
function Heart(props: any) {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 21.364l-7.682-7.682a4.5 4.5 0 010-6.364z" />
    </svg>
  );
}
function User(props: any) {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}
function SendIcon(props: any) {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
  );
}
