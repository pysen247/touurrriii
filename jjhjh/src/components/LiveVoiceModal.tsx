/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Live Voice Conversation Modal powered by gemini-3.1-flash-live-preview (Live API)
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  PhoneOff, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  X, 
  Radio, 
  ShieldCheck, 
  Send, 
  Trash2, 
  AlertCircle,
  HelpCircle,
  Headphones,
  Sliders,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useGeminiLive, VoiceName } from '../hooks/useGeminiLive';
import { soundFx } from '../utils/audio';

interface LiveVoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  language?: string;
}

const AVAILABLE_VOICES: { id: VoiceName; label: string; description: string }[] = [
  { id: 'Zephyr', label: 'Zephyr (Default)', description: 'Warm, clear, and professional advisor' },
  { id: 'Kore', label: 'Kore', description: 'Calm, soothing, empathetic guide' },
  { id: 'Puck', label: 'Puck', description: 'Energetic, cheerful, and fast' },
  { id: 'Charon', label: 'Charon', description: 'Deep, authoritative, and steady' },
  { id: 'Fenrir', label: 'Fenrir', description: 'Confident, assertive, and direct' },
];

export default function LiveVoiceModal({ isOpen, onClose, language = 'en' }: LiveVoiceModalProps) {
  const {
    isConnected,
    isConnecting,
    isMuted,
    isModelSpeaking,
    selectedVoice,
    transcripts,
    inputVolume,
    outputVolume,
    errorMessage,
    connectSession,
    disconnectSession,
    sendTextMessage,
    setVoice,
    toggleMute,
    clearTranscripts,
  } = useGeminiLive('Zephyr');

  const [typedInput, setTypedInput] = useState('');
  const [showVoiceSelect, setShowVoiceSelect] = useState(false);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  const isHindi = language === 'hi';

  // Auto-scroll transcripts
  useEffect(() => {
    if (transcriptEndRef.current) {
      transcriptEndRef.current.scrollTop = transcriptEndRef.current.scrollHeight;
    }
  }, [transcripts]);

  // Disconnect when modal is closed
  useEffect(() => {
    if (!isOpen && isConnected) {
      disconnectSession();
    }
  }, [isOpen, isConnected, disconnectSession]);

  if (!isOpen) return null;

  const handleStartSession = () => {
    soundFx.playClick();
    connectSession(selectedVoice);
  };

  const handleEndSession = () => {
    soundFx.playClick();
    disconnectSession();
  };

  const handleSendText = () => {
    if (!typedInput.trim()) return;
    sendTextMessage(typedInput.trim());
    setTypedInput('');
  };

  const quickVoicePrompts = isHindi ? [
    "क्या इस क्षेत्र में रात को घूमना सुरक्षित है?",
    "भारत के आपातकालीन हेल्पलाइन नंबर बताएं",
    "आस-पास के मुख्य पर्यटक स्थलों की सुरक्षा रेटिंग क्या है?",
    "मुझे नजदीकी सुरक्षित अस्पताल या पुलिस स्टेशन का पता बताएं",
    "पर्यटक धोखाधड़ी और सामान्य स्कैम से कैसे बचें?"
  ] : [
    "Is it safe to walk around this neighborhood after dark?",
    "What are the emergency rescue helpline numbers in India?",
    "Check local tourist scams and how to avoid them",
    "Where is the nearest verified hospital and police station?",
    "Give me quick safety tips for local taxi rides"
  ];

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 sm:p-6 backdrop-blur-md"
        id="live-voice-modal-overlay"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative flex h-full max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-slate-700/80 bg-slate-900 text-white shadow-2xl"
          id="live-voice-modal-container"
        >
          {/* Top Bar */}
          <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/60 px-6 py-4">
            <div className="flex items-center space-x-3">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20">
                <Radio className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-base font-bold tracking-tight text-white sm:text-lg">
                    Real-time Voice Conversation
                  </h2>
                  <span className="inline-flex items-center rounded-full border border-cyan-500/40 bg-cyan-500/10 px-2.5 py-0.5 text-[11px] font-bold text-cyan-300">
                    <Sparkles className="mr-1 h-3 w-3 text-cyan-400" />
                    gemini-3.1-flash-live-preview
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Ultra-low latency live voice streaming via Gemini Live API (24kHz HD PCM)
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* Voice Selector Toggle */}
              <div className="relative">
                <button
                  onClick={() => setShowVoiceSelect(!showVoiceSelect)}
                  className="flex items-center space-x-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-semibold text-slate-200 transition-colors hover:bg-slate-700"
                  title="Change Gemini Live Voice"
                >
                  <Headphones className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Voice: {selectedVoice}</span>
                  <ChevronDown className="h-3 w-3 text-slate-400" />
                </button>

                {showVoiceSelect && (
                  <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-slate-700 bg-slate-850 p-2 shadow-2xl z-30">
                    <span className="block px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Select AI Voice
                    </span>
                    {AVAILABLE_VOICES.map((v) => (
                      <button
                        key={v.id}
                        onClick={() => {
                          setVoice(v.id);
                          setShowVoiceSelect(false);
                        }}
                        className={`flex w-full flex-col rounded-xl px-3 py-2 text-left transition-colors ${
                          selectedVoice === v.id
                            ? 'bg-cyan-500/20 text-cyan-200 font-bold border border-cyan-500/30'
                            : 'text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <span className="text-xs">{v.label}</span>
                        <span className="text-[10px] text-slate-400">{v.description}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Close Modal */}
              <button
                onClick={() => {
                  soundFx.playClick();
                  onClose();
                }}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-700/80 bg-slate-800/50 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Main Visualizer & Conversation Area */}
          <div className="flex flex-1 flex-col overflow-hidden md:flex-row">
            
            {/* Left Side: Audio Visualizer & Connection Hub */}
            <div className="flex flex-col items-center justify-between border-b border-slate-800 bg-slate-950/40 p-6 md:w-1/2 md:border-b-0 md:border-r">
              
              {/* Status Header */}
              <div className="w-full flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className={`flex h-2.5 w-2.5 rounded-full ${
                    isConnected ? 'bg-emerald-400 animate-ping' : isConnecting ? 'bg-amber-400 animate-pulse' : 'bg-slate-600'
                  }`} />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    {isConnected ? 'Session Active (Live Stream)' : isConnecting ? 'Connecting Live API...' : 'Ready to Connect'}
                  </span>
                </div>
                {isConnected && (
                  <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded-md border border-cyan-800/40">
                    16kHz in • 24kHz out
                  </span>
                )}
              </div>

              {/* Central Glowing Audio Waveform Ring */}
              <div className="my-6 relative flex items-center justify-center">
                {/* Background ambient glow */}
                <div 
                  className={`absolute h-48 w-48 rounded-full blur-3xl transition-all duration-300 ${
                    isModelSpeaking 
                      ? 'bg-cyan-500/30 scale-125' 
                      : inputVolume > 15 
                      ? 'bg-blue-500/30 scale-110' 
                      : isConnected 
                      ? 'bg-indigo-500/20 scale-100' 
                      : 'bg-slate-800/20 scale-75'
                  }`} 
                />

                {/* Outer Audio Reactive Wave Rings */}
                <div 
                  className="absolute h-44 w-44 rounded-full border border-cyan-500/30 transition-transform duration-75"
                  style={{
                    transform: `scale(${1 + (isModelSpeaking ? outputVolume : inputVolume) / 100 * 0.4})`,
                    opacity: isConnected ? 0.8 : 0.2
                  }}
                />
                <div 
                  className="absolute h-36 w-36 rounded-full border border-indigo-500/40 transition-transform duration-100"
                  style={{
                    transform: `scale(${1 + (isModelSpeaking ? outputVolume : inputVolume) / 100 * 0.25})`,
                    opacity: isConnected ? 0.9 : 0.3
                  }}
                />

                {/* Center Action Orb */}
                <div 
                  className={`relative flex h-28 w-28 items-center justify-center rounded-full shadow-2xl transition-all duration-300 ${
                    isModelSpeaking
                      ? 'bg-gradient-to-tr from-cyan-600 to-emerald-500 shadow-cyan-500/40 scale-105'
                      : inputVolume > 15
                      ? 'bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-blue-500/40 scale-105'
                      : isConnected
                      ? 'bg-gradient-to-tr from-slate-800 to-slate-700 shadow-indigo-500/20'
                      : 'bg-slate-800'
                  }`}
                >
                  {isModelSpeaking ? (
                    <Volume2 className="h-12 w-12 text-white animate-bounce" />
                  ) : isConnected && !isMuted ? (
                    <Mic className="h-12 w-12 text-white animate-pulse" />
                  ) : isMuted ? (
                    <MicOff className="h-12 w-12 text-rose-400" />
                  ) : (
                    <Headphones className="h-12 w-12 text-slate-400" />
                  )}
                </div>
              </div>

              {/* Status Hint */}
              <div className="text-center space-y-1 mb-4">
                <h3 className="text-sm font-bold text-slate-200">
                  {isModelSpeaking 
                    ? "Gemini Live is speaking..." 
                    : isConnected && !isMuted 
                    ? "Listening... Speak naturally in English, Hindi, or any language" 
                    : isConnected && isMuted 
                    ? "Microphone is Muted" 
                    : "Start voice session to converse in real-time"}
                </h3>
                <p className="text-xs text-slate-400 max-w-xs">
                  {isConnected 
                    ? "You can interrupt Gemini at any time just by speaking." 
                    : "Zero-lag bidirectional speech conversation powered by Gemini Live API."}
                </p>
              </div>

              {/* Error Message Notice */}
              {errorMessage && (
                <div className="mb-4 w-full rounded-2xl border border-rose-500/40 bg-rose-950/50 p-3 text-xs text-rose-200 flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-rose-400 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex w-full items-center justify-center space-x-3">
                {!isConnected ? (
                  <button
                    onClick={handleStartSession}
                    disabled={isConnecting}
                    className="flex flex-1 items-center justify-center space-x-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                  >
                    <Mic className="h-5 w-5" />
                    <span>{isConnecting ? 'Initializing Live API...' : 'Start Voice Conversation'}</span>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={toggleMute}
                      className={`flex items-center justify-center rounded-2xl px-4 py-3.5 text-sm font-bold transition-colors ${
                        isMuted 
                          ? 'bg-rose-600 text-white hover:bg-rose-700' 
                          : 'border border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700'
                      }`}
                      title={isMuted ? 'Unmute Mic' : 'Mute Mic'}
                    >
                      {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                    </button>

                    <button
                      onClick={handleEndSession}
                      className="flex flex-1 items-center justify-center space-x-2 rounded-2xl bg-rose-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-rose-600/25 transition-transform hover:scale-[1.02] active:scale-95 hover:bg-rose-700"
                    >
                      <PhoneOff className="h-5 w-5" />
                      <span>End Live Session</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Right Side: Real-time Transcript Stream & Quick Prompts */}
            <div className="flex flex-1 flex-col justify-between bg-slate-900/60 p-6 overflow-hidden">
              
              {/* Transcripts Log */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-cyan-400" />
                  Live Transcript Stream
                </span>
                {transcripts.length > 0 && (
                  <button
                    onClick={clearTranscripts}
                    className="flex items-center space-x-1 text-xs text-slate-400 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Clear</span>
                  </button>
                )}
              </div>

              <div 
                ref={transcriptEndRef}
                className="flex-1 space-y-3 overflow-y-auto pr-1 text-sm scrollbar-thin scrollbar-thumb-slate-700"
              >
                {transcripts.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-center p-6 text-slate-500">
                    <Headphones className="h-10 w-10 mb-2 opacity-40 text-cyan-400" />
                    <p className="font-semibold text-slate-400">No voice messages yet</p>
                    <p className="text-xs text-slate-500 mt-1 max-w-xs">
                      Press "Start Voice Conversation" and speak or tap one of the safety prompts below.
                    </p>
                  </div>
                ) : (
                  transcripts.map((t) => (
                    <div
                      key={t.id}
                      className={`flex flex-col ${
                        t.role === 'user' ? 'items-end' : 'items-start'
                      }`}
                    >
                      <div className="flex items-center space-x-1.5 mb-1 px-1">
                        <span className="text-[11px] font-bold text-slate-400">
                          {t.role === 'user' ? 'You' : `Gemini Live (${selectedVoice})`}
                        </span>
                        <span className="text-[10px] text-slate-500">{t.time}</span>
                      </div>
                      <div
                        className={`rounded-2xl px-4 py-2.5 max-w-[85%] text-xs leading-relaxed ${
                          t.role === 'user'
                            ? 'bg-blue-600 text-white rounded-br-none shadow-md shadow-blue-600/10'
                            : 'bg-slate-800 text-slate-100 rounded-bl-none border border-slate-700/80 shadow-md'
                        }`}
                      >
                        {t.text}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Quick Spoken Prompts Carousel */}
              <div className="mt-4 pt-3 border-t border-slate-800 space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Quick Safety Prompts (Tap to ask Gemini Live)
                </span>
                <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {quickVoicePrompts.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        soundFx.playClick();
                        if (!isConnected) {
                          connectSession();
                          setTimeout(() => sendTextMessage(prompt), 800);
                        } else {
                          sendTextMessage(prompt);
                        }
                      }}
                      className="whitespace-nowrap rounded-xl border border-slate-700/80 bg-slate-800/80 px-3 py-1.5 text-xs text-slate-300 transition-colors hover:border-cyan-500/50 hover:bg-slate-700 hover:text-white flex-shrink-0"
                    >
                      🗣️ {prompt}
                    </button>
                  ))}
                </div>

                {/* Fallback Text Input for Silent Environments */}
                <div className="flex items-center space-x-2 pt-2">
                  <input
                    type="text"
                    value={typedInput}
                    onChange={(e) => setTypedInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendText()}
                    placeholder={isHindi ? "या लाइव सत्र में टेक्स्ट टाइप करें..." : "Or type text into Live session..."}
                    className="flex-1 rounded-xl border border-slate-700 bg-slate-950/80 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                  />
                  <button
                    onClick={handleSendText}
                    disabled={!typedInput.trim()}
                    className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-600 text-white transition-colors hover:bg-cyan-500 disabled:opacity-40"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
