/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  User, 
  KeyRound, 
  Eye, 
  EyeOff, 
  Sparkles, 
  MapPin, 
  Compass, 
  Radio, 
  Activity, 
  Smartphone, 
  WifiOff, 
  Globe, 
  AlertTriangle, 
  CheckCircle2, 
  Cpu, 
  Zap, 
  ShieldAlert, 
  PhoneCall, 
  Clock, 
  Users, 
  ArrowRight,
  ChevronRight,
  TrendingUp,
  FileCheck,
  Award,
  Layers,
  HeartPulse,
  Flame,
  Search,
  Sparkle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import TiltCard from './TiltCard';
import { LanguageCode } from '../utils/translations';
import { soundFx } from '../utils/audio';

interface AuthLandingPortalProps {
  darkMode: boolean;
  language: LanguageCode;
  t: (key: string) => string;
  authMode: 'login' | 'signup';
  setAuthMode: (mode: 'login' | 'signup') => void;
  authEmail: string;
  setAuthEmail: (v: string) => void;
  authPassword: string;
  setAuthPassword: (v: string) => void;
  authName: string;
  setAuthName: (v: string) => void;
  authError: string | null;
  setAuthError: (v: string | null) => void;
  authLoading: boolean;
  handleLogin: (e: React.FormEvent) => void;
  handleSignup: (e: React.FormEvent) => void;
  onQuickFill: (email: string, pass: string) => void;
}

export default function AuthLandingPortal({
  darkMode,
  language,
  t,
  authMode,
  setAuthMode,
  authEmail,
  setAuthEmail,
  authPassword,
  setAuthPassword,
  authName,
  setAuthName,
  authError,
  setAuthError,
  authLoading,
  handleLogin,
  handleSignup,
  onQuickFill
}: AuthLandingPortalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [selectedNationality, setSelectedNationality] = useState('India');
  const [activeFeatureTab, setActiveFeatureTab] = useState<'radar' | 'planner' | 'sentinel' | 'offline' | 'voice' | 'telemetry'>('radar');

  // Interactive Live Score Simulator State
  const [simCity, setSimCity] = useState('Lonavala, Maharashtra');
  const [simResult, setSimResult] = useState<{ score: number; tier: string; response: string; crime: string; certs: number }>({
    score: 99,
    tier: 'Ultra-Safe Destination',
    response: '3.2 mins',
    crime: 'Minimal',
    certs: 24
  });

  // Interactive Quick Scam Simulator
  const [scamQuery, setScamQuery] = useState('');
  const [scamVerdict, setScamVerdict] = useState<string | null>(null);

  const isHindi = language === 'hi';

  const handleSimCityChange = (city: string) => {
    soundFx.playClick();
    setSimCity(city);
    if (city.includes('Lonavala') || city.includes('Tokyo') || city.includes('Mysuru')) {
      setSimResult({ score: 99, tier: 'Ultra-Safe Verified', response: '3.0 mins', crime: 'Minimal', certs: 32 });
    } else if (city.includes('Paris') || city.includes('Rome')) {
      setSimResult({ score: 91, tier: 'High Protection Zone', response: '4.5 mins', crime: 'Moderate Pickpocket Risk', certs: 26 });
    } else if (city.includes('New York') || city.includes('London')) {
      setSimResult({ score: 94, tier: 'Monitored Metropolis', response: '3.8 mins', crime: 'Low-Moderate', certs: 40 });
    } else {
      setSimResult({ score: 96, tier: 'Safe Tourist Corridor', response: '4.0 mins', crime: 'Low', certs: 20 });
    }
  };

  const handleTestScam = () => {
    soundFx.playClick();
    if (!scamQuery.trim()) return;
    const q = scamQuery.toLowerCase();
    if (q.includes('meter') || q.includes('taxi') || q.includes('cab')) {
      setScamVerdict(isHindi ? "⚠️ उच्च जोखिम: मीटर बंद होने का दावा आम टैक्सी धोखाधड़ी है। केवल अधिकृत प्रीपेड या ऐप आधारित कैब का उपयोग करें।" : "⚠️ HIGH ALERT: Claiming the meter is broken is a classic fare fraud. Always demand official prepaid counter receipt or metered ride.");
    } else if (q.includes('ring') || q.includes('gold') || q.includes('drop')) {
      setScamVerdict(isHindi ? "⚠️ उच्च जोखिम: सोने की अंगूठी गिराने का झांसा। यह ध्यान भटकाकर जेब काटने की ट्रिक है।" : "⚠️ HIGH RISK: The 'Gold Ring Drop' is a known distraction scam used by pickpockets near heritage monuments.");
    } else if (q.includes('temple') || q.includes('guide') || q.includes('gem') || q.includes('closed')) {
      setScamVerdict(isHindi ? "⚠️ मध्यम जोखिम: 'स्मारक आज बंद है' का झूठा दावा करके नकली दुकानों पर ले जाना। मुख्य प्रवेश द्वार पर आधिकारिक काउंटर से पुष्टि करें।" : "⚠️ MEDIUM ALERT: False claims that a monument is closed are designed to redirect you to commission-based souvenir shops.");
    } else {
      setScamVerdict(isHindi ? "✅ सुरक्षित सुझाव: लेन-देन के लिए प्रमाणित क्यूआर कोड या आधिकारिक डिजिटल पेमेंट का उपयोग करें।" : "✅ SAFETY ADVICE: Verify vendor accreditation and always request digital itemized receipt.");
    }
  };

  const scrollToLogin = () => {
    soundFx.playClick();
    const el = document.getElementById('auth-card-anchor');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-16 pb-16" id="auth-landing-portal">
      
      {/* 1. TOP HERO SECTION WITH REAL CREDENTIALS LOGIN BOX */}
      <section className="relative pt-4" id="auth-card-anchor">
        <div className={`relative rounded-3xl overflow-hidden border p-6 sm:p-10 lg:p-12 shadow-2xl transition-all duration-300 ${
          darkMode 
            ? 'border-blue-500/25 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/60 text-white' 
            : 'border-slate-200 bg-gradient-to-br from-white via-slate-50 to-blue-50/50 text-slate-900 shadow-xl'
        }`}>
          
          {/* Subtle Ambient Radial Glows */}
          <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center relative z-10">
            
            {/* Left Column: Brand Hero Pitch & Real Credentials Notice */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className="inline-flex items-center space-x-2 rounded-full px-4 py-1.5 text-xs font-extrabold border backdrop-blur-md shadow-sm border-cyan-500/30 bg-cyan-500/10 text-cyan-400">
                <ShieldCheck className="h-4 w-4 text-cyan-400" />
                <span>{isHindi ? 'सुरक्षित प्रमाणीकरण प्रवेश द्वार' : 'Secure Authenticated Access Portal'}</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                {isHindi ? 'स्मार्ट एआई सुरक्षित यात्रा' : 'Next-Generation'}{' '}
                <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
                  {isHindi ? 'प्लेटफॉर्म में प्रवेश करें' : 'AI Tourist Safety Platform'}
                </span>
              </h1>

              <p className={`text-sm sm:text-base leading-relaxed max-w-xl ${
                darkMode ? 'text-slate-300' : 'text-slate-600'
              }`}>
                {isHindi 
                  ? 'रियल-टाइम जीपीएस जियोफेंसिंग, जेमिनी एआई रूट प्लानिंग, साइलेंट एसओएस रेस्क्यू बीकन, और ऑफलाइन सर्वाइवल टूल्स का उपयोग करने के लिए अपने वास्तविक क्रेडेंशियल्स से साइन इन करें।'
                  : 'Sign in with your real credentials to unlock live GPS geofencing, Gemini multi-modal safe route generation, covert distress beacons, and zero-connectivity survival matrices.'}
              </p>

              {/* Real Platform Capabilities Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                <div className={`p-3 rounded-2xl border ${darkMode ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-white/80'} shadow-sm`}>
                  <div className="flex items-center space-x-2 text-cyan-400 font-bold text-xs">
                    <Radio className="h-4 w-4" />
                    <span>{isHindi ? 'लाइव रडार' : 'Live Radar'}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">{isHindi ? 'सक्रिय जियोफेंस व सेफजोन' : 'Real-time hazard zones'}</p>
                </div>

                <div className={`p-3 rounded-2xl border ${darkMode ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-white/80'} shadow-sm`}>
                  <div className="flex items-center space-x-2 text-blue-400 font-bold text-xs">
                    <Sparkles className="h-4 w-4" />
                    <span>{isHindi ? 'जेमिनी प्लानर' : 'AI Planner'}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">{isHindi ? 'बजट व सुरक्षा युक्त यात्रा' : 'Smart cost & route AI'}</p>
                </div>

                <div className={`p-3 rounded-2xl border ${darkMode ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-white/80'} shadow-sm col-span-2 sm:col-span-1`}>
                  <div className="flex items-center space-x-2 text-rose-400 font-bold text-xs">
                    <ShieldAlert className="h-4 w-4" />
                    <span>{isHindi ? 'गुप्त एसओएस' : 'Covert SOS'}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">{isHindi ? 'त्वरित पुलिस व एम्बुलेंस' : 'Instant 112 dispatch'}</p>
                </div>
              </div>

              {/* Security & Token Guarantee Strip */}
              <div className={`flex flex-wrap items-center gap-4 text-[11px] font-semibold pt-2 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                <div className="flex items-center space-x-1.5">
                  <Lock className="h-3.5 w-3.5 text-emerald-400" />
                  <span>{isHindi ? '256-बिट टोकन सुरक्षित' : '256-Bit Encrypted Token'}</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <FileCheck className="h-3.5 w-3.5 text-cyan-400" />
                  <span>{isHindi ? 'शून्य डेटा लीक नीति' : 'Zero PII Leak Guarantee'}</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Activity className="h-3.5 w-3.5 text-amber-400" />
                  <span>{isHindi ? '99.9% अपटाइम' : 'Continuous Sentinel Ready'}</span>
                </div>
              </div>

            </div>

            {/* Right Column: Real Credentials Authentication Form Card */}
            <div className="lg:col-span-5">
              <motion.div 
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className={`rounded-3xl border p-6 sm:p-8 shadow-2xl relative backdrop-blur-md transition-all ${
                  darkMode 
                    ? 'border-slate-800 bg-slate-950/95 text-white' 
                    : 'border-slate-200 bg-white/95 text-slate-900 shadow-xl'
                }`}
                id="real-auth-form-card"
              >
                
                {/* Form Mode Toggle Header */}
                <div className="flex items-center justify-between mb-6 border-b pb-4 border-slate-100 dark:border-slate-800">
                  <div>
                    <h2 className="text-xl font-extrabold tracking-tight">
                      {authMode === 'login' 
                        ? (isHindi ? 'साइन इन करें' : 'Tourist Sign In') 
                        : (isHindi ? 'नया खाता बनाएं' : 'Create Account')}
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {authMode === 'login'
                        ? (isHindi ? 'प्रमाणित क्रेडेंशियल्स दर्ज करें' : 'Enter your registered credentials')
                        : (isHindi ? 'नया सुरक्षित पर्यटन खाता पंजीकृत करें' : 'Register your safe travel profile')}
                    </p>
                  </div>
                  
                  <div className="flex rounded-xl p-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => { soundFx.playClick(); setAuthMode('login'); setAuthError(null); }}
                      className={`px-3 py-1.5 rounded-lg transition-all ${
                        authMode === 'login' 
                          ? 'bg-blue-600 text-white shadow-sm' 
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {isHindi ? 'लॉगिन' : 'Sign In'}
                    </button>
                    <button
                      type="button"
                      onClick={() => { soundFx.playClick(); setAuthMode('signup'); setAuthError(null); }}
                      className={`px-3 py-1.5 rounded-lg transition-all ${
                        authMode === 'signup' 
                          ? 'bg-blue-600 text-white shadow-sm' 
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {isHindi ? 'रजिस्टर' : 'Sign Up'}
                    </button>
                  </div>
                </div>

                {/* Error Banner */}
                {authError && (
                  <motion.div 
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-5 rounded-2xl bg-rose-500/10 border border-rose-500/30 p-3.5 text-xs text-rose-400 flex items-start space-x-2.5 font-medium"
                  >
                    <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                    <span className="flex-1">{authError}</span>
                  </motion.div>
                )}

                {/* Real Authentication Form */}
                <form 
                  onSubmit={authMode === 'login' ? handleLogin : handleSignup} 
                  className="space-y-4"
                  id="real-login-form"
                >
                  {/* Name field (for Signup) */}
                  {authMode === 'signup' && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-1.5"
                    >
                      <label className="text-xs font-bold text-slate-400 flex items-center space-x-1.5">
                        <User className="h-3.5 w-3.5 text-cyan-400" />
                        <span>{isHindi ? 'पूरा नाम (Full Name)' : 'Full Name'}</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={authName}
                        onChange={(e) => setAuthName(e.target.value)}
                        placeholder={isHindi ? 'उदा. Harsh Kumar' : 'e.g. Harsh Kumar'}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100 focus:border-cyan-400 focus:outline-none transition-colors"
                      />
                    </motion.div>
                  )}

                  {/* Email Input */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 flex items-center space-x-1.5">
                      <Mail className="h-3.5 w-3.5 text-cyan-400" />
                      <span>{isHindi ? 'ईमेल पता (Email Address)' : 'Email Address'}</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      placeholder="tourist@safetour.com"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100 focus:border-cyan-400 focus:outline-none transition-colors"
                    />
                  </div>

                  {/* Password Input */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-400 flex items-center space-x-1.5">
                        <KeyRound className="h-3.5 w-3.5 text-cyan-400" />
                        <span>{isHindi ? 'पासवर्ड (Password)' : 'Password'}</span>
                      </label>
                      {authMode === 'login' && (
                        <button
                          type="button"
                          onClick={() => {
                            setAuthEmail('tourist@safetour.com');
                            setAuthPassword('password123');
                          }}
                          className="text-[11px] font-bold text-cyan-400 hover:underline"
                        >
                          {isHindi ? 'डेमो भरें' : 'Autofill Demo'}
                        </button>
                      )}
                    </div>
                    
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={authPassword}
                        onChange={(e) => setAuthPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-4 py-2.5 pr-11 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100 focus:border-cyan-400 focus:outline-none transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full mt-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white font-extrabold py-3.5 text-sm shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center space-x-2"
                  >
                    {authLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        <span>{isHindi ? 'सत्यापित हो रहा है...' : 'Authenticating...'}</span>
                      </div>
                    ) : (
                      <>
                        <ShieldCheck className="h-4 w-4" />
                        <span>
                          {authMode === 'login' 
                            ? (isHindi ? 'प्लेटफॉर्म में सुरक्षित प्रवेश करें' : 'Sign In & Access Platform') 
                            : (isHindi ? 'खाता पंजीकृत करें और प्रारंभ करें' : 'Create Account & Access')}
                        </span>
                      </>
                    )}
                  </button>
                </form>

                {/* Instant 1-Click Evaluation / Seed Accounts Helper */}
                <div className="mt-6 border-t border-slate-100 dark:border-slate-800/80 pt-4 space-y-2.5">
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 text-center">
                    {isHindi ? '⚡ त्वरित मूल्यांकन के लिए 1-क्लिक टेस्ट खाते' : '⚡ 1-Click Evaluation Seed Accounts (Password: password123)'}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div 
                      onClick={() => onQuickFill('tourist@safetour.com', 'password123')}
                      className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 hover:border-cyan-400 cursor-pointer transition-all hover:scale-[1.02]"
                      title="Click to fill tourist credentials"
                    >
                      <div className="font-extrabold text-cyan-400 flex items-center space-x-1">
                        <User className="h-3 w-3" />
                        <span>Harsh Kumar</span>
                      </div>
                      <div className="text-slate-400 font-mono text-[9px] truncate">tourist@safetour.com</div>
                      <span className="text-[9px] text-slate-500">Tourist Role</span>
                    </div>

                    <div 
                      onClick={() => onQuickFill('gov@safetour.com', 'password123')}
                      className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 hover:border-blue-400 cursor-pointer transition-all hover:scale-[1.02]"
                      title="Click to fill government credentials"
                    >
                      <div className="font-extrabold text-blue-400 flex items-center space-x-1">
                        <ShieldCheck className="h-3 w-3" />
                        <span>Agent Dupont</span>
                      </div>
                      <div className="text-slate-400 font-mono text-[9px] truncate">gov@safetour.com</div>
                      <span className="text-[9px] text-slate-500">Gov Command</span>
                    </div>

                    <div 
                      onClick={() => onQuickFill('ems@safetour.com', 'password123')}
                      className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 hover:border-rose-400 cursor-pointer transition-all hover:scale-[1.02]"
                      title="Click to fill emergency responder credentials"
                    >
                      <div className="font-extrabold text-rose-400 flex items-center space-x-1">
                        <PhoneCall className="h-3 w-3" />
                        <span>EMS Chief Martin</span>
                      </div>
                      <div className="text-slate-400 font-mono text-[9px] truncate">ems@safetour.com</div>
                      <span className="text-[9px] text-slate-500">Rescue Dispatch</span>
                    </div>

                    <div 
                      onClick={() => onQuickFill('admin@safetour.com', 'password123')}
                      className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 hover:border-emerald-400 cursor-pointer transition-all hover:scale-[1.02]"
                      title="Click to fill admin credentials"
                    >
                      <div className="font-extrabold text-emerald-400 flex items-center space-x-1">
                        <Cpu className="h-3 w-3" />
                        <span>SysAdmin Root</span>
                      </div>
                      <div className="text-slate-400 font-mono text-[9px] truncate">admin@safetour.com</div>
                      <span className="text-[9px] text-slate-500">Platform Admin</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 text-center text-xs text-slate-400">
                  {authMode === 'login' ? (
                    <span>
                      {isHindi ? 'नया खाता बनाना चाहते हैं? ' : 'New to SafeTour AI? '}
                      <button 
                        type="button" 
                        onClick={() => { setAuthMode('signup'); setAuthError(null); }}
                        className="font-extrabold text-cyan-400 hover:underline"
                      >
                        {isHindi ? 'रजिस्टर करें' : 'Create an account'}
                      </button>
                    </span>
                  ) : (
                    <span>
                      {isHindi ? 'पहले से खाता मौजूद है? ' : 'Already registered? '}
                      <button 
                        type="button" 
                        onClick={() => { setAuthMode('login'); setAuthError(null); }}
                        className="font-extrabold text-cyan-400 hover:underline"
                      >
                        {isHindi ? 'साइन इन करें' : 'Sign In'}
                      </button>
                    </span>
                  )}
                </div>

              </motion.div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. EXTENSIVE APP FEATURES SHOWCASE (Interactive 3D Bento-Style Highlight Cards) */}
      <section className="space-y-10" id="app-features-showcase">
        
        {/* Section Heading Banner */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-2 rounded-full px-4 py-1.5 text-xs font-extrabold border border-blue-500/30 bg-blue-500/10 text-cyan-400">
            <Zap className="h-3.5 w-3.5 text-cyan-400" />
            <span>{isHindi ? 'एआई सुरक्षा उपकरण व 3D विशेषताएं' : 'Interactive 3D Feature Suite & Architecture'}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            {isHindi ? 'हमारे ऐप की शक्तिशाली विशेषताएं' : 'Comprehensive Safety Features Built For Travelers'}
          </h2>
          <p className="text-sm sm:text-base text-slate-400">
            {isHindi 
              ? 'साइन इन करने के बाद आपको निम्नलिखित सभी उन्नत टूल्स और लाइव मॉनिटरिंग सिस्टम का पूर्ण एक्सेस मिलेगा:' 
              : 'Hover over each 3D bento card to explore real-time telemetry, AI predictive routing, covert defense, and offline protocols:'}
          </p>
        </div>

        {/* 4-Pillar Quick Bento Highlights with 3D Tilt */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <TiltCard
            darkMode={darkMode}
            borderGlow="cyan"
            maxTilt={12}
            scale={1.03}
            glareOpacity={0.25}
            className="p-5"
          >
            <div className="space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-inner">
                <Radio className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs font-extrabold uppercase tracking-wider text-cyan-400">01 • Radar</div>
                <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">Live Geofence</div>
                <div className="text-[11px] text-slate-400 mt-1">360° dynamic hazard perimeter sweep</div>
              </div>
            </div>
          </TiltCard>

          <TiltCard
            darkMode={darkMode}
            borderGlow="blue"
            maxTilt={12}
            scale={1.03}
            glareOpacity={0.25}
            className="p-5"
          >
            <div className="space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-inner">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs font-extrabold uppercase tracking-wider text-blue-400">02 • Planner</div>
                <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">Gemini AI Engine</div>
                <div className="text-[11px] text-slate-400 mt-1">Multi-day itinerary & crowd avoidance</div>
              </div>
            </div>
          </TiltCard>

          <TiltCard
            darkMode={darkMode}
            borderGlow="rose"
            maxTilt={12}
            scale={1.03}
            glareOpacity={0.25}
            className="p-5"
          >
            <div className="space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-inner">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs font-extrabold uppercase tracking-wider text-rose-400">03 • Covert</div>
                <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">Stealth Sentinel</div>
                <div className="text-[11px] text-slate-400 mt-1">Decoy black screen & 1-tap silent SOS</div>
              </div>
            </div>
          </TiltCard>

          <TiltCard
            darkMode={darkMode}
            borderGlow="amber"
            maxTilt={12}
            scale={1.03}
            glareOpacity={0.25}
            className="p-5"
          >
            <div className="space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-inner">
                <WifiOff className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs font-extrabold uppercase tracking-wider text-amber-400">04 • Survival</div>
                <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">Zero-Net Offline</div>
                <div className="text-[11px] text-slate-400 mt-1">100% off-grid emergency direct-dial</div>
              </div>
            </div>
          </TiltCard>
        </div>

        {/* Feature 1: Live Geofencing & Smart Incident Radar (3D Interactive Bento Card) */}
        <TiltCard
          darkMode={darkMode}
          borderGlow="cyan"
          maxTilt={8}
          scale={1.01}
          glareOpacity={0.15}
          id="feature-geofence-3d"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-6 sm:p-10">
            
            <div className="lg:col-span-6 space-y-5">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Radio className="h-3.5 w-3.5" />
                <span>Feature 01 • Smart Radar & Geofence</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                {isHindi ? 'स्मार्ट जियोफेंसिंग और लाइव इंसिडेंट रडार' : 'AI-Predictive Geofencing & Incident Heatmaps'}
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                {isHindi
                  ? 'यह मॉड्यूल पर्यटक के वर्तमान स्थान के चारों ओर 360-डिग्री सुरक्षा परिधि बनाता है। क्राउड डेंसिटी, अपराध आंकड़े, और प्रमाणित पुलिस बूथ की लाइव मैपिंग करता है।'
                  : 'Traces dynamic multi-tier safety zones (Safe, Moderate, Heightened Vigilance). Automatically monitors safe corridors, verified emergency hospitals, and alerts tourists if they stray near unverified zones.'}
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className={`p-3.5 rounded-2xl border backdrop-blur-md transition-transform hover:scale-105 duration-200 ${darkMode ? 'border-slate-800 bg-slate-950/80' : 'border-slate-100 bg-slate-50'}`}>
                  <div className="text-cyan-400 font-extrabold text-base">99.2%</div>
                  <div className="text-xs font-semibold text-slate-300 mt-0.5">{isHindi ? 'सुरक्षित मार्ग सटीकता' : 'Safe Route Accuracy'}</div>
                  <div className="text-[10px] text-slate-500">{isHindi ? 'म्युनिसिपल डेटा सिंक' : 'Real-time city audit'}</div>
                </div>
                <div className={`p-3.5 rounded-2xl border backdrop-blur-md transition-transform hover:scale-105 duration-200 ${darkMode ? 'border-slate-800 bg-slate-950/80' : 'border-slate-100 bg-slate-50'}`}>
                  <div className="text-emerald-400 font-extrabold text-base">&lt; 3.5 min</div>
                  <div className="text-xs font-semibold text-slate-300 mt-0.5">{isHindi ? 'औसत आपातकालीन रिस्पांस' : 'Avg Emergency Dispatch'}</div>
                  <div className="text-[10px] text-slate-500">{isHindi ? 'निकटतम पुलिस/अस्पताल' : 'First responders synced'}</div>
                </div>
              </div>

              <button 
                onClick={scrollToLogin}
                className="inline-flex items-center space-x-2 text-xs font-extrabold text-cyan-400 hover:text-cyan-300 pt-2 group"
              >
                <span>{isHindi ? 'साइन इन करके रडार मैप खोलें' : 'Sign in to open Live Radar Map'}</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Visual Graphic Representation */}
            <div className="lg:col-span-6">
              <div className={`rounded-2xl border p-5 relative overflow-hidden shadow-2xl backdrop-blur-xl ${
                darkMode ? 'border-slate-800/80 bg-slate-950/90' : 'border-slate-200 bg-slate-100'
              }`}>
                {/* Visual Header */}
                <div className="flex items-center justify-between border-b pb-3 border-slate-800 mb-4 text-xs font-bold">
                  <div className="flex items-center space-x-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-cyan-400 animate-ping" />
                    <span className="text-cyan-400">RADAR SWEEP ACTIVE • 1500m PERIMETER</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px]">ULTRA-SAFE ZONE</span>
                </div>

                {/* Radar Mock Map Visual */}
                <div className="relative h-64 rounded-xl overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center">
                  <img 
                    src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=800" 
                    alt="Geofence Radar Interface" 
                    className="absolute inset-0 w-full h-full object-cover opacity-40 filter contrast-125"
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Radar Circles */}
                  <div className="absolute w-44 h-44 rounded-full border border-cyan-400/40 animate-pulse pointer-events-none" />
                  <div className="absolute w-28 h-28 rounded-full border border-cyan-400/60 pointer-events-none" />
                  <div className="absolute w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center">
                    <div className="h-3 w-3 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400" />
                  </div>

                  {/* Marker POI Badges */}
                  <div className="absolute top-4 left-6 bg-slate-950/90 border border-cyan-400/40 rounded-lg p-2 text-[10px] shadow-lg flex items-center space-x-2">
                    <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
                    <div>
                      <div className="font-bold text-white">Central Police Kiosk #14</div>
                      <div className="text-slate-400">0.2 km • 24/7 Verified</div>
                    </div>
                  </div>

                  <div className="absolute bottom-4 right-6 bg-slate-950/90 border border-emerald-400/40 rounded-lg p-2 text-[10px] shadow-lg flex items-center space-x-2">
                    <HeartPulse className="h-3.5 w-3.5 text-emerald-400" />
                    <div>
                      <div className="font-bold text-white">Safe Haven Clinic</div>
                      <div className="text-slate-400">0.4 km • Trauma Unit</div>
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
                  <span>GPS: 28.6139° N, 77.2090° E</span>
                  <span className="text-cyan-400 font-bold">12 Verified Checkpoints Nearby</span>
                </div>
              </div>
            </div>

          </div>
        </TiltCard>

        {/* Feature 2: Gemini Multi-Modal Travel & Route Planner (3D Interactive Bento Card) */}
        <TiltCard
          darkMode={darkMode}
          borderGlow="blue"
          maxTilt={8}
          scale={1.01}
          glareOpacity={0.15}
          id="feature-planner-3d"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-6 sm:p-10">
            
            {/* Visual Media Graphic on Left */}
            <div className="lg:col-span-6 order-2 lg:order-1">
              <div className={`rounded-2xl border p-5 relative overflow-hidden shadow-2xl backdrop-blur-xl ${
                darkMode ? 'border-slate-800/80 bg-slate-950/90' : 'border-slate-200 bg-slate-100'
              }`}>
                <div className="relative h-64 rounded-xl overflow-hidden border border-slate-800">
                  <img 
                    src="https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&q=80&w=800" 
                    alt="Travel Planner Scenic Destination" 
                    className="absolute inset-0 w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                  
                  {/* Floating AI Plan Card */}
                  <div className="absolute bottom-3 left-3 right-3 bg-slate-950/95 border border-slate-800 rounded-xl p-3.5 text-xs text-white backdrop-blur-md">
                    <div className="flex items-center justify-between">
                      <div className="font-extrabold text-cyan-400 flex items-center space-x-1.5">
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>AI Safe Itinerary • 3-Day Plan</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">Safety 98/100</span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-1 line-clamp-2">
                      Optimized route avoids peak crowd hours at heritage monument gates, provides safe dining checkpoints and metro corridors.
                    </p>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[10px]">
                  <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                    <div className="text-slate-400">Budget Limit</div>
                    <div className="font-bold text-white">$500 (Balanced)</div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                    <div className="text-slate-400">Night Score</div>
                    <div className="font-bold text-emerald-400">9.4 / 10</div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                    <div className="text-slate-400">Scam Index</div>
                    <div className="font-bold text-cyan-400">Ultra-Low</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 space-y-5 order-1 lg:order-2">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Feature 02 • Gemini AI Travel Engine</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                {isHindi ? 'जेमिनी एआई मल्टी-मॉडल ट्रैवल प्लानर' : 'Gemini AI Intelligent Itinerary & Route Optimizer'}
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                {isHindi
                  ? 'केवल अपना गंतव्य और बजट दर्ज करें। जेमिनी एआई सुरक्षित समय सारणी, बजट विभाजन, ऐतिहासिक तथ्यों, और धोखाधड़ी से बचने के उपायों के साथ पूर्ण यात्रा योजना तैयार करता है।'
                  : 'Automatically computes day-by-day itineraries, itemized ticket costs, safest transit corridors, and tourist scams to avoid. Compare multiple travel options side-by-side.'}
              </p>

              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" />
                  <span>{isHindi ? 'ऐतिहासिक स्मारकों का लाइव सुरक्षा विश्लेषण' : 'Comprehensive heritage safety assessment'}</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" />
                  <span>{isHindi ? 'बजट व्यय और चेकलिस्ट ऑटोमेशन' : 'Integrated expense tracker and packing checklist'}</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" />
                  <span>{isHindi ? 'पीडीएफ निर्यात व डिजिटल यात्रा पास' : 'Instant PDF travel plan download & QR pass'}</span>
                </li>
              </ul>

              <button 
                onClick={scrollToLogin}
                className="inline-flex items-center space-x-2 text-xs font-extrabold text-blue-400 hover:text-blue-300 pt-2 group"
              >
                <span>{isHindi ? 'साइन इन करके यात्रा प्लानर बनाएं' : 'Sign in to generate Travel Itinerary'}</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

          </div>
        </TiltCard>

        {/* Feature 3: AURA Stealth Sentinel & Covert SOS (3D Interactive Bento Card) */}
        <TiltCard
          darkMode={darkMode}
          borderGlow="rose"
          maxTilt={8}
          scale={1.01}
          glareOpacity={0.15}
          id="feature-stealth-3d"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-6 sm:p-10">
            
            <div className="lg:col-span-6 space-y-5">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <ShieldAlert className="h-3.5 w-3.5" />
                <span>Feature 03 • Covert Defense & Distress SOS</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                {isHindi ? 'ऑरा™ स्टील्थ सेंटिनल व गुप्त आपातकालीन एसओएस' : 'AURA™ Stealth Sentinel & Covert Distress SOS'}
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                {isHindi
                  ? 'असुरक्षित स्थितियों में बिना किसी का ध्यान आकर्षित किए डार्क-स्क्रीन मोड, नकली इनकमिंग कॉल (Decoy Call), और तुरंत पुलिस व एम्बुलेंस को जीपीएस निर्देशांक भेजने की सुविधा।'
                  : 'Provides a zero-light black decoy screen, simulated fake incoming calls to safely exit uncomfortable situations, and emergency 1-tap SOS broadcasting to local authorities and emergency contacts.'}
              </p>

              <div className="flex flex-wrap gap-2 pt-1">
                <span className="px-3 py-1 rounded-xl bg-slate-800 text-[11px] font-bold text-slate-300 border border-slate-700">
                  📱 Fake Incoming Call Decoy
                </span>
                <span className="px-3 py-1 rounded-xl bg-slate-800 text-[11px] font-bold text-slate-300 border border-slate-700">
                  🚨 112 / 100 Dispatch Relay
                </span>
                <span className="px-3 py-1 rounded-xl bg-slate-800 text-[11px] font-bold text-slate-300 border border-slate-700">
                  🛰️ SMS Fallback Gateway
                </span>
              </div>

              <button 
                onClick={scrollToLogin}
                className="inline-flex items-center space-x-2 text-xs font-extrabold text-rose-400 hover:text-rose-300 pt-2 group"
              >
                <span>{isHindi ? 'साइन इन करके स्टील्थ मोड सक्रिय करें' : 'Sign in to access Stealth Sentinel'}</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Visual Graphic Representation */}
            <div className="lg:col-span-6">
              <div className={`rounded-2xl border p-5 relative overflow-hidden shadow-2xl backdrop-blur-xl ${
                darkMode ? 'border-slate-800/80 bg-slate-950/90' : 'border-slate-200 bg-slate-100'
              }`}>
                <div className="relative h-64 rounded-xl overflow-hidden bg-slate-950 border border-rose-500/30 p-4 flex flex-col justify-between">
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="h-3 w-3 rounded-full bg-rose-500 animate-pulse" />
                      <span className="text-xs font-extrabold text-rose-400">EMERGENCY DISPATCH READY</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">ENCRYPTED PACKET</span>
                  </div>

                  <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-2 my-auto">
                    <div className="flex items-center justify-between text-xs font-bold text-white">
                      <span>Live Responder Squad #14</span>
                      <span className="text-cyan-400 font-mono">ETA: 3 mins</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-rose-500 to-cyan-400 h-full w-3/4 animate-pulse" />
                    </div>
                    <div className="text-[11px] text-slate-400">
                      GPS coordinates and medical blood group transmitted to command unit.
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-800 pt-2">
                    <span>Decoy Call Trigger: Active</span>
                    <span className="text-rose-400 font-bold">1-Tap Silent SOS Enabled</span>
                  </div>

                </div>
              </div>
            </div>

          </div>
        </TiltCard>

        {/* Feature 4: Offline Survival Suite & Emergency Helplines (3D Interactive Bento Card) */}
        <TiltCard
          darkMode={darkMode}
          borderGlow="amber"
          maxTilt={8}
          scale={1.01}
          glareOpacity={0.15}
          id="feature-offline-3d"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-6 sm:p-10">
            
            <div className="lg:col-span-6 order-2 lg:order-1">
              <div className={`rounded-2xl border p-5 relative overflow-hidden shadow-2xl backdrop-blur-xl ${
                darkMode ? 'border-slate-800/80 bg-slate-950/90' : 'border-slate-200 bg-slate-100'
              }`}>
                <div className="h-64 rounded-xl bg-slate-900/90 border border-slate-800 p-4 flex flex-col justify-between">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold text-amber-400 flex items-center space-x-1.5">
                      <WifiOff className="h-4 w-4" />
                      <span>ZERO-NET SURVIVAL PROTOCOL</span>
                    </span>
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[10px]">CACHE LOADED</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 my-auto">
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs">
                      <div className="font-bold text-white flex items-center space-x-1">
                        <PhoneCall className="h-3.5 w-3.5 text-rose-400" />
                        <span>Police & Fire</span>
                      </div>
                      <div className="text-cyan-400 font-mono text-sm mt-1">112 / 100</div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs">
                      <div className="font-bold text-white flex items-center space-x-1">
                        <HeartPulse className="h-3.5 w-3.5 text-emerald-400" />
                        <span>Ambulance</span>
                      </div>
                      <div className="text-emerald-400 font-mono text-sm mt-1">108 / 102</div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs">
                      <div className="font-bold text-white flex items-center space-x-1">
                        <ShieldCheck className="h-3.5 w-3.5 text-blue-400" />
                        <span>Women Helpline</span>
                      </div>
                      <div className="text-blue-400 font-mono text-sm mt-1">1091 / 181</div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs">
                      <div className="font-bold text-white flex items-center space-x-1">
                        <Globe className="h-3.5 w-3.5 text-amber-400" />
                        <span>Tourist Help</span>
                      </div>
                      <div className="text-amber-400 font-mono text-sm mt-1">1363 (Toll Free)</div>
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-400 text-center">
                    All emergency cards and triage instructions operate 100% without internet.
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 space-y-5 order-1 lg:order-2">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <WifiOff className="h-3.5 w-3.5" />
                <span>Feature 04 • Zero-Net Offline Hub</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                {isHindi ? 'ऑफलाइन सर्वाइवल सुइट व आपातकालीन हेल्पलाइन' : 'Zero-Connectivity Offline Survival Suite'}
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                {isHindi
                  ? 'पहाड़ों, जंगलों या सुदूर क्षेत्रों में जब इंटरनेट कनेक्टिविटी उपलब्ध नहीं होती, तब भी यह सुइट पूर्ण प्राथमिक चिकित्सा निर्देश, कम्पास, आपातकालीन नंबर, और ऑफलाइन अनुवाद प्रदान करता है।'
                  : 'Maintains critical survival guides, direct dialers, offline translation phrases, battery preservation protocols, and coordinate broadcasting without requiring active mobile data.'}
              </p>

              <button 
                onClick={scrollToLogin}
                className="inline-flex items-center space-x-2 text-xs font-extrabold text-amber-400 hover:text-amber-300 pt-2 group"
              >
                <span>{isHindi ? 'साइन इन करके ऑफलाइन सुइट खोलें' : 'Sign in to access Zero-Net Hub'}</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

          </div>
        </TiltCard>

        {/* 3. INTERACTIVE 3D MINI-SANDBOXES (Live on First Page!) */}
        <div className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h3 className="text-2xl font-black">
              {isHindi ? 'इंटरएक्टिव 3D सुरक्षा सैंडबॉक्स' : 'Interactive 3D Safety Prediction Engine'}
            </h3>
            <p className="text-xs text-slate-400">
              {isHindi 
                ? 'साइन इन करने से पहले देखें कि हमारा एआई सिस्टम गंतव्य सुरक्षा और धोखाधड़ी का विश्लेषण कैसे करता है:' 
                : 'Experience real-time interactive sandboxes with 3D hover response before logging in:'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Interactive Widget 1: City Safety Score Simulator (3D Tilt) */}
            <TiltCard
              darkMode={darkMode}
              borderGlow="indigo"
              maxTilt={10}
              scale={1.02}
              glareOpacity={0.2}
              className="p-6"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-extrabold text-cyan-400 flex items-center space-x-1.5">
                  <Activity className="h-4 w-4" />
                  <span>{isHindi ? 'गंतव्य सुरक्षा प्रेडिक्टर' : 'Destination Safety Score'}</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">LIVE PREDICTION</span>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {['Lonavala, Maharashtra', 'Tokyo & Kyoto', 'Paris, France', 'Mysuru, India', 'New York, USA'].map((c) => (
                  <button
                    key={c}
                    onClick={() => handleSimCityChange(c)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                      simCity === c 
                        ? 'bg-blue-600 text-white shadow-sm' 
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 shadow-inner">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-slate-400">{simCity}</div>
                    <div className="text-lg font-black text-white">{simResult.tier}</div>
                  </div>
                  <div className="text-3xl font-black text-cyan-400">{simResult.score}%</div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-[10px] border-t border-slate-800 pt-2">
                  <div>
                    <div className="text-slate-500">Dispatch ETA</div>
                    <div className="font-bold text-white">{simResult.response}</div>
                  </div>
                  <div>
                    <div className="text-slate-500">Crime Index</div>
                    <div className="font-bold text-emerald-400">{simResult.crime}</div>
                  </div>
                  <div>
                    <div className="text-slate-500">Checkpoints</div>
                    <div className="font-bold text-cyan-400">{simResult.certs} Active</div>
                  </div>
                </div>
              </div>
            </TiltCard>

            {/* Interactive Widget 2: Quick Scam Investigator Preview (3D Tilt) */}
            <TiltCard
              darkMode={darkMode}
              borderGlow="emerald"
              maxTilt={10}
              scale={1.02}
              glareOpacity={0.2}
              className="p-6"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-extrabold text-amber-400 flex items-center space-x-1.5">
                  <ShieldCheck className="h-4 w-4" />
                  <span>{isHindi ? 'त्वरित धोखाधड़ी विश्लेषक' : 'Quick Scam Detector'}</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">NEURAL SCANNER</span>
              </div>

              <div className="space-y-3">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={scamQuery}
                    onChange={(e) => setScamQuery(e.target.value)}
                    placeholder={isHindi ? "उदा. Taxi driver says meter is broken..." : "e.g. Taxi driver says meter is broken..."}
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-xs text-white focus:outline-none focus:border-amber-400"
                    onKeyDown={(e) => e.key === 'Enter' && handleTestScam()}
                  />
                  <button
                    onClick={handleTestScam}
                    className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400"
                  >
                    Scan
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 text-[10px]">
                  <span className="text-slate-400">Try sample:</span>
                  <button onClick={() => { setScamQuery('Taxi driver wants cash flat rate'); }} className="text-cyan-400 hover:underline">Taxi meter</button>
                  <span className="text-slate-600">•</span>
                  <button onClick={() => { setScamQuery('Someone dropped gold ring in front of me'); }} className="text-cyan-400 hover:underline">Gold ring</button>
                  <span className="text-slate-600">•</span>
                  <button onClick={() => { setScamQuery('Stranger says monument is closed today'); }} className="text-cyan-400 hover:underline">Closed monument</button>
                </div>

                {scamVerdict && (
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 leading-relaxed animate-fadeIn shadow-inner">
                    {scamVerdict}
                  </div>
                )}
              </div>
            </TiltCard>

          </div>

          {/* Bottom Call to Action */}
          <div className="mt-8 text-center border-t border-slate-800/80 pt-6">
            <button
              onClick={scrollToLogin}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white font-extrabold text-sm shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-105 transition-all"
            >
              {isHindi ? '🚀 ऊपर जाकर अभी साइन इन करें और सभी सुविधाएं अनलॉक करें' : '🚀 Sign In Above To Unlock All App Features'}
            </button>
          </div>

        </div>

      </section>

    </div>
  );
}
