/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  X, 
  Sparkles, 
  Radio,
  MapPin,
  Globe,
  ExternalLink,
  Zap,
  Brain,
  Shield,
  Trash2,
  Compass,
  ChevronDown,
  Headphones,
  PhoneOff,
  Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ChatMessage, GroundingSource } from '../types';
import { useGeminiLive, VoiceName } from '../hooks/useGeminiLive';
import { soundFx } from '../utils/audio';

interface ChatWidgetProps {
  messages: ChatMessage[];
  sendMessage: (
    text: string, 
    options?: { 
      role?: 'general' | 'complex' | 'fast'; 
      groundingMode?: 'none' | 'maps' | 'search'; 
      userLocation?: { lat: number; lng: number } | null 
    }
  ) => Promise<void>;
  loading: boolean;
  language?: string;
  t?: (key: string) => string;
  onOpenLiveVoice?: () => void;
  userLocation?: { lat: number; lng: number } | null;
  currentDestinationName?: string;
}

const AVAILABLE_VOICES: { id: VoiceName; label: string; desc: string }[] = [
  { id: 'Zephyr', label: 'Zephyr', desc: 'Clear & Professional Guide' },
  { id: 'Kore', label: 'Kore', desc: 'Calm & Soothing Concierge' },
  { id: 'Puck', label: 'Puck', desc: 'Energetic & Fast' },
  { id: 'Charon', label: 'Charon', desc: 'Deep & Authoritative' },
  { id: 'Fenrir', label: 'Fenrir', desc: 'Direct & Assertive' },
];

export default function ChatWidget({ 
  messages, 
  sendMessage, 
  loading, 
  language = 'en', 
  t, 
  onOpenLiveVoice,
  userLocation,
  currentDestinationName
}: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeakingEnabled, setIsSpeakingEnabled] = useState(true);
  
  // Role & Grounding State
  const [selectedRole, setSelectedRole] = useState<'general' | 'complex' | 'fast'>('general');
  const [groundingMode, setGroundingMode] = useState<'none' | 'maps' | 'search'>('none');
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);

  // Live Voice Co-Pilot Integration within Chat Box
  const [isLiveModeActive, setIsLiveModeActive] = useState(false);
  const [showVoicePicker, setShowVoicePicker] = useState(false);

  // Hook for Gemini Live Real-time audio streaming
  const {
    isConnected: isLiveConnected,
    isConnecting: isLiveConnecting,
    isMuted: isLiveMuted,
    isModelSpeaking: isLiveModelSpeaking,
    selectedVoice,
    transcripts: liveTranscripts,
    inputVolume,
    outputVolume,
    errorMessage: liveErrorMessage,
    connectSession: startLiveSession,
    disconnectSession: stopLiveSession,
    sendTextMessage: sendLiveTextMessage,
    setVoice: setLiveVoice,
    toggleMute: toggleLiveMute,
    clearTranscripts: clearLiveTranscripts
  } = useGeminiLive('Zephyr');

  const scrollRef = useRef<HTMLDivElement>(null);
  const processedTranscriptsRef = useRef<Set<string>>(new Set());
  
  // Web Speech API components for quick transcription input
  const [recognition, setRecognition] = useState<any>(null);

  const isHindi = language === 'hi';

  useEffect(() => {
    // Scroll chat logs automatically to latest message
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, liveTranscripts, isOpen, loading, isLiveModeActive]);

  // Sync transcripts from Live Voice session directly into chat view
  useEffect(() => {
    if (liveTranscripts.length > 0) {
      const latest = liveTranscripts[liveTranscripts.length - 1];
      if (!processedTranscriptsRef.current.has(latest.id)) {
        processedTranscriptsRef.current.add(latest.id);
      }
    }
  }, [liveTranscripts]);

  useEffect(() => {
    // Initialize Web Speech Recognition fallback
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = isHindi ? 'hi-IN' : 'en-US';

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
        setIsListening(false);
      };

      rec.onerror = () => {
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      setRecognition(rec);
    }
  }, [language]);

  // Speak response out loud if enabled (for non-live text mode)
  const speakText = (text: string) => {
    if (!isSpeakingEnabled || isLiveConnected) return;
    try {
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/[*_#`\-]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = isHindi ? 'hi-IN' : 'en-US';

      if ('speechSynthesis' in window) {
        const voices = window.speechSynthesis.getVoices();
        if (isHindi) {
          const hiVoice = voices.find(v => v.lang === 'hi-IN' || v.lang.startsWith('hi') || v.lang.includes('IN'));
          if (hiVoice) utterance.voice = hiVoice;
        } else {
          const enVoice = voices.find(v => v.lang === 'en-US' || v.lang.startsWith('en'));
          if (enVoice) utterance.voice = enVoice;
        }
      }

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error("Speech Synthesis Error:", e);
    }
  };

  // Trigger speech when new model message arrives (in text mode)
  useEffect(() => {
    if (messages.length > 0 && !isLiveModeActive) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.sender === 'ai') {
        speakText(lastMsg.text);
      }
    }
  }, [messages, isLiveModeActive]);

  // Clean up live session when chat is closed
  useEffect(() => {
    if (!isOpen && isLiveConnected) {
      stopLiveSession();
      setIsLiveModeActive(false);
    }
  }, [isOpen, isLiveConnected, stopLiveSession]);

  const handleSend = async (overrideText?: string) => {
    const textToSend = (overrideText || inputValue).trim();
    if (!textToSend) return;
    if (!overrideText) setInputValue('');

    // If in Live Voice Mode, forward text directly to the live WebSocket stream
    if (isLiveConnected) {
      sendLiveTextMessage(textToSend);
      return;
    }
    
    if (loading) return;
    await sendMessage(textToSend, {
      role: selectedRole,
      groundingMode: groundingMode,
      userLocation: userLocation || null
    });
  };

  const toggleListening = () => {
    if (isLiveConnected) {
      toggleLiveMute();
      return;
    }

    if (!recognition) {
      sendMessage(isHindi ? "आपका ब्राउज़र वाक् पहचान (Speech Recognition) का समर्थन नहीं करता है — कृपया नीचे टाइप करें।" : "Speech recognition is not supported in this browser — please type your message below.", {
        role: selectedRole,
        groundingMode,
        userLocation: userLocation || null
      });
      return;
    }
    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.lang = isHindi ? 'hi-IN' : 'en-US';
      setIsListening(true);
      recognition.start();
    }
  };

  const handleToggleLiveCoPilot = () => {
    soundFx.playClick();
    if (isLiveConnected) {
      stopLiveSession();
      setIsLiveModeActive(false);
    } else {
      setIsLiveModeActive(true);
      startLiveSession(selectedVoice);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Role info helpers
  const roleConfig = {
    general: {
      name: isHindi ? 'सामान्य सलाहकार' : 'Travel Concierge',
      model: 'gemini-3.5-flash',
      icon: Shield,
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
      description: isHindi ? 'दैनिक मार्गदर्शन और सुरक्षा' : 'General travel & safety guide'
    },
    complex: {
      name: isHindi ? 'जटिल मार्ग विशेषज्ञ' : 'Deep Architect',
      model: 'gemini-3.1-pro-preview',
      icon: Brain,
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
      description: isHindi ? 'गहन बहु-शहर विश्लेषण और जोखिम मूल्यांकन' : 'Complex logistical routes & deep risk analysis'
    },
    fast: {
      name: isHindi ? 'त्वरित आपातकालीन सहाय' : 'Fast Triage',
      model: 'gemini-3.1-flash-lite',
      icon: Zap,
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
      description: isHindi ? 'अति-तीव्र आपातकालीन प्रतिक्रिया' : 'Ultra-fast emergency & transit triage'
    }
  };

  const activeRole = roleConfig[selectedRole];

  // Quick suggestions based on selected Grounding mode
  const quickPrompts = isLiveConnected
    ? [
        isHindi ? "क्या इस क्षेत्र में रात को घूमना सुरक्षित है?" : "Is it safe to explore this area right now?",
        isHindi ? "मुझे पास के मुख्य आकर्षण और सुरक्षा टिप्स बताएं" : "Tell me safety tips and landmarks near my location",
        isHindi ? "निकटतम पुलिस स्टेशन और अस्पताल कहां है?" : "Where is the nearest verified hospital and police desk?",
        isHindi ? "स्थानीय टैक्सी और परिवहन सुरक्षा के नियम बताएं" : "What should I know about local auto and cab safety?"
      ]
    : groundingMode === 'maps'
    ? [
        isHindi ? "पास के सत्यापित 24/7 चिकित्सा केंद्र व फार्मेसी खोजें" : "Find verified 24/7 medical centers & pharmacies on Google Maps",
        isHindi ? "उच्च रेटिंग वाले प्रमाणित स्थानीय रेस्तरां दिखाएं" : "Show highest-rated verified safe restaurants on Google Maps",
        isHindi ? "निकटतम पर्यटक पुलिस सहायता केंद्र और पता बताएं" : "Nearest tourist police station with verified address",
        isHindi ? "आसपास के सबसे सुरक्षित दर्शनीय स्थल दिखाएं" : "Safe cultural attractions with Google Maps links"
      ]
    : groundingMode === 'search'
    ? [
        isHindi ? "हालिया यात्रा चेतावनियां और मौसम की स्थिति क्या है?" : "What are the latest real-time travel alerts & weather warnings?",
        isHindi ? "स्थानीय सार्वजनिक परिवहन और स्ट्राइक अपडेट खोजें" : "Search live transit strike or disruption advisories",
        isHindi ? "वर्तमान पर्यटक वीज़ा और प्रवेश नियम क्या हैं?" : "What are current tourist visa & entry requirements?",
        isHindi ? "इस सप्ताह के प्रमुख स्थानीय सांस्कृतिक कार्यक्रम बताएं" : "Major verified local cultural festivals happening this week"
      ]
    : selectedRole === 'complex'
    ? [
        isHindi ? "बहु-शहर यात्रा के लिए विस्तृत सुरक्षा जोखिम मैट्रिक्स बनाएं" : "Create a multi-city risk matrix with contingency transit plans",
        isHindi ? "बजट दक्षता और आपातकालीन निधि की विस्तृत योजना बनाएं" : "Deep budget optimization & emergency reserve calculation",
        isHindi ? "अंतर्राष्ट्रीय सीमा व वीज़ा नियमों का विस्तृत विश्लेषण करें" : "Comprehensive customs, currency & visa regulatory analysis"
      ]
    : selectedRole === 'fast'
    ? [
        isHindi ? "तुरंत मुख्य आपातकालीन और हेल्पलाइन नंबर बताएं" : "Give immediate emergency rescue & tourist hotline numbers",
        isHindi ? "क्या वर्तमान में रात में बाहर निकलना सुरक्षित है?" : "Quick safety sanity check for night walking in this area",
        isHindi ? "सार्वजनिक टैक्सी सुरक्षा के त्वरित नियम" : "Fast checklist to verify official metered taxis"
      ]
    : [
        isHindi ? "स्थानीय कानूनों और सुरक्षा नियमों के बारे में बताएं" : "What key local laws and cultural norms should I know?",
        isHindi ? "उच्च सुरक्षा रेटिंग वाले मुख्य पर्यटन स्थल दिखाएं" : "Show top-rated attractions with high tourist safety indices",
        isHindi ? "पर्यटक ठगी और स्कैम से कैसे सुरक्षित रहें?" : "How do I spot and avoid local tourist scams?",
        isHindi ? "बजट फ्रेंडली सुरक्षित परिवहन के विकल्प बताएं" : "Recommend safe and budget-friendly transit options"
      ];

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end" id="floating-chat-container">
      
      {/* Expanding Assistant Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: 30 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="mb-4 w-[380px] sm:w-[460px] h-[640px] rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md shadow-2xl flex flex-col overflow-hidden text-slate-900 dark:text-slate-100"
            id="ai-travel-assistant-window"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 p-3.5 text-white flex items-center justify-between border-b border-white/10">
              <div className="flex items-center space-x-2.5">
                <div className="bg-blue-600/30 p-2 rounded-xl backdrop-blur-sm border border-blue-400/30">
                  <Bot className="h-5 w-5 text-blue-300" />
                </div>
                <div>
                  <h3 className="font-sans font-bold text-sm leading-tight flex items-center gap-1.5 text-white">
                    {isHindi ? 'सेफटूर एआई साथी + लाइव वॉयस' : 'SafeTour AI Chat & Live Voice'}
                    <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`h-1.5 w-1.5 rounded-full ${isLiveConnected ? 'bg-cyan-400 animate-ping' : 'bg-emerald-400 animate-pulse'}`} />
                    <span className="text-[10px] text-slate-300 font-mono">
                      {isLiveConnected
                        ? `Live Voice (${selectedVoice} • 24kHz HD)`
                        : groundingMode === 'maps' 
                        ? 'Google Maps Grounded' 
                        : groundingMode === 'search' 
                        ? 'Google Search Grounded' 
                        : activeRole.model}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-1">
                {/* Real-time Live Voice Co-Pilot Toggle directly in Chat */}
                <button
                  onClick={handleToggleLiveCoPilot}
                  title={isLiveConnected ? "Stop Live Voice Session" : "Start Real-time Gemini Live Voice"}
                  className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-all ${
                    isLiveConnected
                      ? 'bg-red-500/20 hover:bg-red-500/30 text-red-300 border-red-400/40 animate-pulse ring-2 ring-red-500/30'
                      : isLiveConnecting
                      ? 'bg-amber-500/20 text-amber-300 border-amber-400/40 animate-pulse'
                      : 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border-cyan-400/40 hover:scale-105'
                  }`}
                >
                  <Radio className={`h-3.5 w-3.5 ${isLiveConnected ? 'text-red-400 animate-pulse' : 'text-cyan-300'}`} />
                  <span>{isLiveConnected ? 'Live ON' : isLiveConnecting ? 'Connecting...' : 'Live Voice'}</span>
                </button>

                {/* Voice Picker when live is connected */}
                {isLiveConnected && (
                  <div className="relative">
                    <button
                      onClick={() => setShowVoicePicker(!showVoicePicker)}
                      className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-cyan-300 text-xs border border-slate-700"
                      title="Select Voice"
                    >
                      <Headphones className="h-3.5 w-3.5" />
                    </button>
                    {showVoicePicker && (
                      <div className="absolute right-0 top-full mt-2 w-48 rounded-xl bg-slate-900 border border-slate-700 p-1.5 shadow-xl z-50">
                        <span className="block px-2 py-1 text-[10px] font-bold text-slate-400 uppercase">Select Voice</span>
                        {AVAILABLE_VOICES.map((v) => (
                          <button
                            key={v.id}
                            onClick={() => {
                              setLiveVoice(v.id);
                              setShowVoicePicker(false);
                            }}
                            className={`w-full text-left px-2 py-1.5 rounded-lg text-xs flex items-center justify-between ${
                              selectedVoice === v.id ? 'bg-cyan-500/20 text-cyan-200 font-bold' : 'text-slate-300 hover:bg-slate-800'
                            }`}
                          >
                            <span>{v.label}</span>
                            <span className="text-[9px] text-slate-500">{v.id === 'Zephyr' ? 'Default' : ''}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Speech TTS Voice Toggle (When not in live mode) */}
                {!isLiveConnected && (
                  <button
                    onClick={() => {
                      setIsSpeakingEnabled(!isSpeakingEnabled);
                      if (isSpeakingEnabled) window.speechSynthesis.cancel();
                    }}
                    title={isSpeakingEnabled ? (isHindi ? "आवाज़ बंद करें" : "Mute AI Text-to-Speech") : (isHindi ? "आवाज़ चालू करें" : "Enable AI Text-to-Speech")}
                    className={`p-1.5 rounded-lg text-xs transition-colors ${
                      isSpeakingEnabled ? 'bg-blue-600/50 text-blue-200' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {isSpeakingEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                  </button>
                )}

                {/* Close Button */}
                <button
                  onClick={() => {
                    if (isLiveConnected) stopLiveSession();
                    setIsOpen(false);
                  }}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* LIVE VOICE ACTIVE BANNER & AUDIO WAVE ENGINE */}
            {isLiveConnected && (
              <div className="bg-slate-900 border-b border-cyan-500/30 p-3 flex items-center justify-between gap-3 text-white">
                <div className="flex items-center space-x-2.5">
                  <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-md">
                    <Activity className={`h-4 w-4 text-white ${isLiveModelSpeaking || inputVolume > 15 ? 'animate-bounce' : ''}`} />
                    <span 
                      className="absolute inset-0 rounded-xl bg-cyan-400/30 animate-ping pointer-events-none"
                      style={{ opacity: (isLiveModelSpeaking ? outputVolume : inputVolume) / 100 }}
                    />
                  </div>
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <span className="text-xs font-bold text-cyan-300">
                        {isLiveModelSpeaking 
                          ? (isHindi ? 'एआई बोल रहा है...' : 'AI Speaking (Live HD)...') 
                          : inputVolume > 15 
                          ? (isHindi ? 'आपकी आवाज़ सुनी जा रही है...' : 'Listening to your voice...') 
                          : (isHindi ? 'लाइव बातचीत तैयार है' : 'Live Voice Ready • Speak Naturally')}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Vol in: {inputVolume}% • Vol out: {outputVolume}%
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={toggleLiveMute}
                    className={`p-1.5 rounded-lg border text-xs font-bold transition-all ${
                      isLiveMuted 
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                    title={isLiveMuted ? "Unmute Mic" : "Mute Mic"}
                  >
                    {isLiveMuted ? <MicOff className="h-3.5 w-3.5 text-amber-400" /> : <Mic className="h-3.5 w-3.5 text-cyan-400" />}
                  </button>

                  <button
                    onClick={() => {
                      stopLiveSession();
                      setIsLiveModeActive(false);
                    }}
                    className="p-1.5 rounded-lg bg-red-600/80 hover:bg-red-600 text-white text-xs font-bold transition-all"
                    title="End Live Voice Call"
                  >
                    <PhoneOff className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Role & Grounding Selector Sub-Bar (When not in live mode) */}
            {!isLiveConnected && (
              <div className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-3 py-2 flex items-center justify-between gap-2 text-xs">
                {/* AI Reasoning Architecture Switcher */}
                <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar py-0.5">
                  {(['general', 'complex', 'fast'] as const).map((roleKey) => {
                    const r = roleConfig[roleKey];
                    const IconComponent = r.icon;
                    const isSelected = selectedRole === roleKey;
                    return (
                      <button
                        key={roleKey}
                        onClick={() => setSelectedRole(roleKey)}
                        className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg font-medium transition-all text-[11px] shrink-0 ${
                          isSelected
                            ? 'bg-slate-900 dark:bg-blue-600 text-white shadow-xs font-bold'
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                      >
                        <IconComponent className="h-3 w-3" />
                        <span>{r.name}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Google Maps / Search Grounding Controls */}
                <div className="flex items-center space-x-1 shrink-0">
                  <button
                    onClick={() => setGroundingMode(groundingMode === 'maps' ? 'none' : 'maps')}
                    title="Toggle Google Maps Grounding with verified places"
                    className={`flex items-center space-x-1 px-2 py-1 rounded-lg text-[11px] font-bold border transition-all ${
                      groundingMode === 'maps'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                    }`}
                  >
                    <MapPin className="h-3 w-3" />
                    <span>Maps</span>
                  </button>

                  <button
                    onClick={() => setGroundingMode(groundingMode === 'search' ? 'none' : 'search')}
                    title="Toggle Google Search Grounding with live web citations"
                    className={`flex items-center space-x-1 px-2 py-1 rounded-lg text-[11px] font-bold border transition-all ${
                      groundingMode === 'search'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950/40'
                    }`}
                  >
                    <Globe className="h-3 w-3" />
                    <span>Search</span>
                  </button>
                </div>
              </div>
            )}

            {/* Quick Prompts Carousel */}
            <div className="bg-slate-100/70 dark:bg-slate-900/90 border-b border-slate-200/80 dark:border-slate-800 px-3 py-1.5 overflow-x-auto flex items-center space-x-1.5 no-scrollbar">
              <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1 shrink-0">
                <Compass className="h-2.5 w-2.5 text-blue-500" />
                {isHindi ? 'त्वरित सुझाव:' : 'Quick Prompts:'}
              </span>
              {quickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(prompt)}
                  className="shrink-0 text-[11px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 px-2.5 py-0.5 rounded-full hover:bg-blue-50 dark:hover:bg-slate-700 hover:border-blue-300 hover:text-blue-700 dark:hover:text-blue-300 transition-colors shadow-2xs font-medium max-w-[200px] truncate"
                  title={prompt}
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Main Chat Messages Stream + Live Voice Transcripts */}
            <div 
              ref={scrollRef} 
              className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/50 dark:bg-slate-950/50"
              id="ai-chat-messages-container"
            >
              {/* If in live session and transcripts exist, show unified live flow */}
              {isLiveConnected && liveTranscripts.length > 0 && (
                <div className="rounded-2xl border border-cyan-500/20 bg-cyan-950/20 p-3 space-y-2 mb-3">
                  <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1">
                    <Radio className="h-3 w-3 animate-pulse" />
                    Active Live Stream Transcripts
                  </span>
                  <div className="space-y-2">
                    {liveTranscripts.map((item) => (
                      <div
                        key={item.id}
                        className={`flex ${item.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs shadow-xs ${
                            item.role === 'user'
                              ? 'bg-blue-600 text-white rounded-br-none'
                              : 'bg-slate-900 text-slate-100 border border-slate-800 rounded-bl-none'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 mb-0.5 text-[9px] opacity-70">
                            <span>{item.role === 'user' ? 'You (Spoken)' : `Gemini Live (${selectedVoice})`}</span>
                            <span>•</span>
                            <span>{item.time}</span>
                          </div>
                          <p className="leading-relaxed">{item.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Standard text messages */}
              {messages.length === 0 && (!isLiveConnected || liveTranscripts.length === 0) ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-3">
                  <div className="h-14 w-14 rounded-2xl bg-blue-50 dark:bg-slate-900 border border-blue-100 dark:border-slate-800 flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <Bot className="h-7 w-7" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-700 dark:text-slate-200 text-sm">
                      {isHindi ? 'नमस्ते! मैं आपका सेफटूर साथी हूँ।' : 'Hello! I am your SafeTour Copilot.'}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[280px]">
                      {isHindi 
                        ? 'मुझसे टेक्स्ट में पूछें, Google Maps स्थान खोजें या ऊपर "Live Voice" पर क्लिक करके सीधी बातचीत शुरू करें।' 
                        : 'Ask questions, ground queries with Google Maps, or toggle "Live Voice" for real-time natural spoken conversations.'}
                    </p>
                  </div>
                </div>
              ) : (
                messages.map((msg, index) => {
                  const isAi = msg.sender === 'ai';
                  return (
                    <div 
                      key={index} 
                      className={`flex ${isAi ? 'justify-start' : 'justify-end'}`}
                    >
                      <div 
                        className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed shadow-xs ${
                          isAi 
                            ? 'bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none' 
                            : 'bg-blue-600 text-white rounded-tr-none'
                        }`}
                      >
                        {/* AI Header Badge if grounded */}
                        {isAi && (
                          <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-slate-100 dark:border-slate-800 text-[10px] text-slate-400">
                            <span className="font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                              <Sparkles className="h-3 w-3 text-amber-500" />
                              {activeRole.name}
                            </span>
                            {(msg.groundingMode === 'maps' || (msg.mapPlaces && msg.mapPlaces.length > 0)) && (
                              <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                                <MapPin className="h-2.5 w-2.5" />
                                Google Maps
                              </span>
                            )}
                            {(msg.groundingMode === 'search' || (msg.searchSources && msg.searchSources.length > 0)) && (
                              <span className="inline-flex items-center gap-1 text-blue-700 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                                <Globe className="h-2.5 w-2.5" />
                                Google Search
                              </span>
                            )}
                          </div>
                        )}

                        <div className="whitespace-pre-wrap font-sans">{msg.text}</div>

                        {/* Google Maps Grounded Places Display */}
                        {msg.mapPlaces && msg.mapPlaces.length > 0 && (
                          <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1 uppercase tracking-wider">
                              <MapPin className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                              Google Maps Verified Places
                            </span>
                            <div className="space-y-1">
                              {msg.mapPlaces.map((place, pIdx) => (
                                <a
                                  key={pIdx}
                                  href={place.uri}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center justify-between p-1.5 rounded-lg bg-emerald-50/80 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-900 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/70 transition-colors"
                                >
                                  <div className="flex flex-col min-w-0 pr-1">
                                    <span className="font-bold truncate">{place.title}</span>
                                    {place.snippet && (
                                      <span className="text-[9px] text-emerald-700 dark:text-emerald-400 line-clamp-1 italic">"{place.snippet}"</span>
                                    )}
                                  </div>
                                  <ExternalLink className="h-3 w-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Google Search Grounded Citation Sources Display */}
                        {msg.searchSources && msg.searchSources.length > 0 && (
                          <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                            <span className="text-[10px] font-bold text-blue-700 dark:text-blue-400 flex items-center gap-1 uppercase tracking-wider">
                              <Globe className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                              Google Search Verified Sources
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {msg.searchSources.map((source, sIdx) => (
                                <a
                                  key={sIdx}
                                  href={source.uri}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-[10px] text-blue-800 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors"
                                >
                                  <span className="max-w-[160px] truncate">{source.title}</span>
                                  <ExternalLink className="h-2.5 w-2.5 text-blue-500" />
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                        <span className={`block mt-1 text-[9px] text-right ${isAi ? 'text-slate-400' : 'text-blue-200'}`}>
                          {msg.timestamp}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}

              {loading && !isLiveConnected && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 rounded-2xl p-3 text-xs rounded-tl-none shadow-sm flex items-center space-x-2">
                    <span className="h-2 w-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="h-2 w-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="h-2 w-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                    <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300 ml-1">
                      {groundingMode === 'maps'
                        ? (isHindi ? 'Google Maps से स्थान सत्यापित हो रहे हैं...' : 'Retrieving verified Google Maps data...')
                        : groundingMode === 'search'
                        ? (isHindi ? 'Google Search से तथ्य खोजे जा रहे हैं...' : 'Searching live web facts via Google Search...')
                        : (isHindi ? `${activeRole.name} विचार कर रहा है...` : `${activeRole.name} generating response...`)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Input Bar Footer */}
            <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center space-x-2">
              <button
                onClick={toggleListening}
                className={`p-2 rounded-xl transition-all ${
                  isLiveConnected
                    ? isLiveMuted 
                      ? 'bg-amber-500 text-white' 
                      : 'bg-cyan-600 text-white shadow-xs'
                    : isListening 
                    ? 'bg-red-500 text-white animate-pulse' 
                    : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}
                title={
                  isLiveConnected 
                    ? (isLiveMuted ? 'Unmute Live Mic' : 'Mute Live Mic')
                    : isListening 
                    ? (isHindi ? 'सुन रहे हैं...' : 'Listening... click to stop') 
                    : (isHindi ? 'आवाज़ से पूछें' : 'Record voice query')
                }
              >
                {isLiveConnected ? (
                  isLiveMuted ? <MicOff className="h-4.5 w-4.5" /> : <Mic className="h-4.5 w-4.5" />
                ) : isListening ? (
                  <MicOff className="h-4.5 w-4.5" />
                ) : (
                  <Mic className="h-4.5 w-4.5" />
                )}
              </button>

              <input
                type="text"
                placeholder={
                  isLiveConnected
                    ? (isHindi ? 'लाइव सत्र में टाइप करें या सीधे बोलें...' : 'Type into live voice stream or speak naturally...')
                    : isListening 
                    ? (isHindi ? 'सुन रहे हैं...' : 'Listening...') 
                    : groundingMode === 'maps'
                    ? (isHindi ? 'Google Maps स्थान पूछें (उदा. निकटतम अस्पताल)' : 'Ask with Google Maps (e.g. 24/7 pharmacies nearby)...')
                    : groundingMode === 'search'
                    ? (isHindi ? 'Google Search से पूछें (उदा. लाइव मौसम या नियम)' : 'Search live web facts & travel advisories...')
                    : (isHindi ? 'यात्रा संबंधी प्रश्न पूछें...' : `Ask ${activeRole.name}...`)
                }
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isListening}
                className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-2.5 px-3 text-xs text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-850 focus:outline-none transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />

              <button
                onClick={() => handleSend()}
                disabled={!inputValue.trim() || (loading && !isLiveConnected)}
                className="p-2.5 rounded-xl bg-blue-600 text-white transition-colors hover:bg-blue-700 disabled:opacity-40 shadow-xs"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating launcher trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        id="chat-widget-launcher-btn"
        className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 text-white shadow-2xl transition-all hover:scale-105 active:scale-95 shadow-blue-500/30 border border-white/20 relative"
      >
        <Bot className="h-7 w-7" />
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-cyan-500"></span>
        </span>
      </button>

    </div>
  );
}
