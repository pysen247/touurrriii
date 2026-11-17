/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Bell, 
  MapPin, 
  AlertTriangle, 
  CheckCircle, 
  User, 
  Compass, 
  X,
  Radio,
  Sun,
  Moon,
  Globe,
  Sparkles,
  Headphones,
  Mic,
  Database,
  Layers,
  Calendar,
  WifiOff,
  Briefcase,
  ShieldAlert,
  ChevronRight,
  LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LANGUAGES, LanguageCode } from '../utils/translations';
import { soundFx } from '../utils/audio';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  sosActive: boolean;
  triggerSOS: () => void;
  notifications: Array<{ id: string; type: string; message: string; time: string; read: boolean }>;
  markNotificationsRead: () => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string) => string;
  user?: any;
  onLogout?: () => void;
  onOpenLiveVoice?: () => void;
  onSwitchPersona?: (role: 'tourist' | 'government' | 'emergency' | 'admin') => void;
  onOpenDatabaseExplorer?: () => void;
}

export default function Navbar({ 
  currentTab, 
  setCurrentTab, 
  sosActive, 
  triggerSOS, 
  notifications,
  markNotificationsRead,
  darkMode,
  setDarkMode,
  language,
  setLanguage,
  t,
  user,
  onLogout,
  onOpenLiveVoice,
  onSwitchPersona,
  onOpenDatabaseExplorer
}: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showNotifSection, setShowNotifSection] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;
  const isHindi = language === 'hi';

  // Lock background scrolling and listen to ESC when 3-lines menu drawer is open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  const tabs = [
    { id: 'home', label: t('explore'), icon: Compass, desc: isHindi ? 'होम व एक्सप्लोर' : 'Home & Explore' },
    { id: 'dashboard', label: t('dashboard'), icon: Layers, desc: isHindi ? 'सुरक्षा डैशबोर्ड' : 'Safety Dashboard' },
    { id: 'authority', label: isHindi ? 'पुलिस कमांड' : 'Police Desk', badge: 'SOS', icon: ShieldAlert, desc: isHindi ? 'कंट्रोल रूम व ई-एफआईआर' : 'Control Room & E-FIR' },
    { id: 'map', label: t('map'), icon: MapPin, desc: isHindi ? 'लाइव रडार व जियोफेंस' : 'Live Radar & Geofence' },
    { id: 'planner', label: t('planner'), icon: Calendar, desc: isHindi ? 'एआई सुरक्षित योजना' : 'AI Safe Itinerary' },
    { id: 'guide', label: t('guide'), icon: Headphones, desc: isHindi ? 'स्मार्ट ऑडियो गाइड' : 'Multilingual Guide' },
    { id: 'recs', label: t('recs'), icon: Sparkles, desc: isHindi ? 'स्मार्ट सुझाव' : 'Smart AI Suggestions' },
    { id: 'aura', label: isHindi ? 'ऑरा सेंटिनल' : 'AURA™ Sentinel', badge: 'AI', icon: Radio, desc: isHindi ? 'सक्रिय रक्षा प्रणाली' : 'Predictive Safe-Shield' },
    { id: 'offline', label: isHindi ? 'ऑफलाइन हब' : 'Zero-Net Hub', icon: WifiOff, desc: isHindi ? 'बिना इंटरनेट मदद' : 'Zero-Net SOS Hub' },
    { id: 'extras', label: isHindi ? 'सेफ्टी सुइट' : 'Safety Suite', icon: Briefcase, desc: isHindi ? 'आपातकालीन टूलकिट' : 'Emergency Utilities' },
  ];

  const adminRoles = [
    { id: 'government', label: t('govtPortal'), icon: ShieldCheck },
    { id: 'emergency', label: t('rescueCommand'), icon: Radio },
    { id: 'admin', label: t('adminHub'), icon: Layers },
  ];

  return (
    <>
      <header className={`sticky top-0 z-40 w-full border-b transition-all duration-300 ${
        darkMode 
          ? 'border-slate-800/80 bg-slate-950/90 text-white' 
          : 'border-slate-200/80 bg-white/90 text-slate-800'
      } backdrop-blur-md`}>
        <div className="mx-auto flex h-14 sm:h-16 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8">
          
          {/* Modern Cyber-Shield Brand Logo (Returns to Home) */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              soundFx.playClick();
              setCurrentTab('home');
              setIsMenuOpen(false);
            }} 
            className="flex cursor-pointer items-center space-x-2 sm:space-x-3 transition-colors shrink-0"
            id="nav-logo-container"
            title="Return to Home Page"
          >
            <div className="relative flex h-8.5 w-8.5 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 p-0.5 shadow-md shadow-blue-500/25">
              <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-slate-950/80 backdrop-blur-xs">
                <ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5 text-cyan-400" />
              </div>
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
              </span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center space-x-1 sm:space-x-1.5">
                <span className={`font-sans text-base sm:text-lg font-black tracking-tight ${
                  darkMode ? 'text-white' : 'text-slate-900'
                }`}>
                  SafeTour <span className="bg-gradient-to-r from-blue-500 via-indigo-400 to-cyan-400 bg-clip-text text-transparent">AI</span>
                </span>
                <span className="hidden xs:inline-block rounded-full bg-blue-500/10 px-1.5 py-0.2 text-[9px] sm:text-[10px] font-bold text-cyan-400 border border-blue-500/20 uppercase tracking-widest">
                  v2.6
                </span>
              </div>
              <span className="hidden md:block text-[10px] font-semibold tracking-wider text-slate-400 -mt-0.5">
                {isHindi ? 'स्मार्ट पर्यटक सुरक्षा व रीयल-टाइम नेविगेशन' : 'Next-Gen Tourist Safety & Live Radar'}
              </span>
            </div>
          </motion.div>

          {/* Action Controls: strictly ONLY Live Voice AI, SOS Beacon, and 3-Lines Menu */}
          <div className="flex items-center space-x-2 sm:space-x-3" id="nav-action-controls">

            {/* 1. Gemini Live Voice Assistant Quick Trigger Button */}
            {onOpenLiveVoice && (
              <button
                onClick={() => {
                  soundFx.playClick();
                  onOpenLiveVoice();
                }}
                id="nav-live-voice-btn"
                title="Open Gemini Live Voice Assistant"
                className="relative group flex items-center space-x-1 sm:space-x-1.5 rounded-full bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 px-2.5 sm:px-3.5 py-1.5 text-xs font-bold text-white shadow-md shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-105 transition-all duration-200 shrink-0 cursor-pointer"
              >
                <div className="relative flex h-3.5 w-3.5 items-center justify-center">
                  <Mic className="h-3.5 w-3.5 text-cyan-200" />
                  <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-cyan-300 animate-ping" />
                </div>
                <span className="hidden sm:inline-block tracking-wide">
                  {isHindi ? 'लाइव वॉइस AI' : 'Live Voice AI'}
                </span>
                <span className="sm:hidden text-[10px] font-bold">Voice</span>
              </button>
            )}

            {/* 2. Quick SOS Trigger Button */}
            <button
              onClick={triggerSOS}
              id="nav-sos-trigger-btn"
              title="Trigger Emergency SOS Beacon"
              className={`flex items-center space-x-1 sm:space-x-1.5 rounded-full px-2.5 sm:px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg transition-all duration-200 active:scale-95 shrink-0 cursor-pointer ${
                sosActive 
                  ? 'animate-pulse bg-red-600 shadow-red-500/50 hover:bg-red-700' 
                  : 'bg-gradient-to-r from-red-500 via-rose-600 to-red-600 shadow-rose-500/30 hover:shadow-rose-500/50 hover:from-red-600'
              }`}
            >
              <Radio className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${sosActive ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{sosActive ? (isHindi ? 'एसओएस सक्रिय' : 'SOS Active') : (isHindi ? 'आपातकाल एसओएस' : 'SOS Beacon')}</span>
              <span className="sm:hidden">{sosActive ? 'Active' : 'SOS'}</span>
            </button>

            {/* 3. The 3 Lines Hamburger Menu Button (☰) */}
            <button
              onClick={() => {
                soundFx.playClick();
                setIsMenuOpen(!isMenuOpen);
              }}
              id="nav-three-lines-menu-btn"
              title="Open Navigation Menu (3 lines)"
              aria-label="Open Navigation Menu"
              className={`relative flex items-center space-x-1.5 rounded-xl border px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs font-bold transition-all duration-200 shrink-0 cursor-pointer ${
                isMenuOpen
                  ? 'border-cyan-500 bg-cyan-600/20 text-cyan-400 shadow-md shadow-cyan-500/20'
                  : darkMode
                    ? 'border-slate-800 bg-slate-900/90 text-slate-200 hover:bg-slate-800 hover:text-white hover:border-slate-700 shadow-sm'
                    : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50 hover:border-slate-300 shadow-sm'
              }`}
            >
              {/* 3 horizontal lines (or X if open) */}
              {isMenuOpen ? (
                <X className="h-4.5 w-4.5 text-cyan-400" />
              ) : (
                <div className="flex flex-col justify-between w-4.5 h-3.5 my-0.5">
                  <span className="block h-0.5 w-full bg-current rounded-full transition-all" />
                  <span className="block h-0.5 w-full bg-current rounded-full transition-all" />
                  <span className="block h-0.5 w-full bg-current rounded-full transition-all" />
                </div>
              )}
              <span className="hidden sm:inline font-bold tracking-wide">
                {isMenuOpen ? (isHindi ? 'बंद करें' : 'Close') : (isHindi ? 'मेनू' : 'Menu')}
              </span>

              {/* Notification indicator dot if unread alerts */}
              {unreadCount > 0 && !isMenuOpen && (
                <span className="flex h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
              )}
            </button>

          </div>
        </div>
      </header>

      {/* 3-LINES FULL NAVIGATION DRAWER & BACKDROP (Works on Desktop, Tablet & Mobile) */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Darkened backdrop overlay with blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => {
                soundFx.playClick();
                setIsMenuOpen(false);
              }}
              className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs"
              id="menu-drawer-backdrop"
            />

            {/* Slide-out Sidebar Drawer from the right */}
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 280 }}
              className={`fixed inset-y-0 right-0 z-50 w-full sm:w-[440px] md:w-[480px] shadow-2xl border-l flex flex-col overflow-hidden ${
                darkMode 
                  ? 'border-slate-800 bg-slate-950 text-slate-100' 
                  : 'border-slate-200 bg-white text-slate-800'
              }`}
              id="three-lines-menu-drawer"
            >
              {/* Drawer Top Bar */}
              <div className={`flex items-center justify-between px-5 py-4 border-b shrink-0 ${
                darkMode ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-slate-50'
              }`}>
                <div className="flex items-center space-x-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600/20 text-cyan-400 border border-blue-500/30">
                    <ShieldCheck className="h-4.5 w-4.5 text-cyan-400" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black tracking-tight flex items-center space-x-1.5">
                      <span>SafeTour AI</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-400 font-mono">
                        {isHindi ? 'नेविगेशन' : 'NAVIGATION'}
                      </span>
                    </h2>
                    <p className="text-[10px] text-slate-400 font-medium">
                      {isHindi ? 'सभी सेवाएं व सुरक्षा पोर्टल' : 'All Services & Portals'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    soundFx.playClick();
                    setIsMenuOpen(false);
                  }}
                  id="close-drawer-btn"
                  title="Close Menu"
                  className={`flex h-8.5 w-8.5 items-center justify-center rounded-xl border transition-colors cursor-pointer ${
                    darkMode 
                      ? 'border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white' 
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              {/* Scrollable Content inside Drawer */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">

                {/* Profile / Account Card */}
                <div className={`p-3.5 rounded-2xl border ${
                  darkMode ? 'border-slate-800 bg-slate-900/70' : 'border-slate-200 bg-slate-50/80'
                }`}>
                  {user ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <img 
                            src={user.profile?.avatarUrl || 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect width="80" height="80" rx="18" fill="#1e3a8a"/><text x="40" y="50" text-anchor="middle" fill="#ffffff" font-family="sans-serif" font-size="28" font-weight="700">ST</text></svg>')} 
                            className="h-10 w-10 rounded-full border border-blue-500/40 object-cover" 
                            alt="User avatar" 
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect width="80" height="80" rx="18" fill="#1e3a8a"/><text x="40" y="50" text-anchor="middle" fill="#ffffff" font-family="sans-serif" font-size="28" font-weight="700">ST</text></svg>');
                            }}
                          />
                          <div>
                            <div className="text-xs font-bold leading-tight">{user.profile?.name || 'Tourist User'}</div>
                            <div className="text-[10px] text-slate-400 truncate max-w-[170px]">{user.email}</div>
                            <span className="inline-block mt-0.5 rounded bg-blue-500/10 px-1.5 py-0.2 text-[9px] font-bold text-cyan-400 uppercase tracking-wider">
                              Role: {user.role}
                            </span>
                          </div>
                        </div>

                        {onLogout && (
                          <button
                            onClick={() => {
                              soundFx.playClick();
                              onLogout();
                              setIsMenuOpen(false);
                            }}
                            className="flex items-center space-x-1 text-[11px] font-semibold text-rose-400 hover:text-rose-300 px-2 py-1 rounded-lg hover:bg-rose-500/10 transition-colors"
                          >
                            <LogOut className="h-3.5 w-3.5" />
                            <span>{isHindi ? 'लॉगआउट' : 'Logout'}</span>
                          </button>
                        )}
                      </div>

                      {/* Quick Digital ID Pass Link */}
                      <button
                        onClick={() => {
                          soundFx.playClick();
                          setCurrentTab('profile');
                          setIsMenuOpen(false);
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-gradient-to-r from-blue-600/15 to-cyan-500/15 border border-cyan-500/30 text-xs font-bold text-cyan-400 hover:bg-cyan-500/20 transition-all cursor-pointer"
                      >
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-cyan-400" />
                          <span>{isHindi ? 'पर्यटक डिजिटल पास व पासपोर्ट' : 'Tourist Digital ID & Passport'}</span>
                        </div>
                        <ChevronRight className="h-3.5 w-3.5 text-cyan-400" />
                      </button>

                      {/* Persona Switcher for Evaluation */}
                      {onSwitchPersona && (
                        <div className="pt-1">
                          <div className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
                            {isHindi ? '⚡ रोल बदलें (मूल्यांकन)' : '⚡ Switch Persona (Evaluation)'}:
                          </div>
                          <div className="grid grid-cols-4 gap-1.5">
                            <button
                              onClick={() => { onSwitchPersona('tourist'); }}
                              className={`py-1 rounded-lg text-[10px] font-bold text-center transition-colors ${
                                user.role === 'tourist' 
                                  ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-500/40' 
                                  : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
                              }`}
                            >
                              👤 Tourist
                            </button>
                            <button
                              onClick={() => { onSwitchPersona('government'); }}
                              className={`py-1 rounded-lg text-[10px] font-bold text-center transition-colors ${
                                user.role === 'government' 
                                  ? 'bg-blue-500/25 text-blue-300 border border-blue-500/40' 
                                  : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
                              }`}
                            >
                              🏛️ Gov
                            </button>
                            <button
                              onClick={() => { onSwitchPersona('emergency'); }}
                              className={`py-1 rounded-lg text-[10px] font-bold text-center transition-colors ${
                                user.role === 'emergency' 
                                  ? 'bg-rose-500/25 text-rose-300 border border-rose-500/40' 
                                  : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
                              }`}
                            >
                              🚑 EMS
                            </button>
                            <button
                              onClick={() => { onSwitchPersona('admin'); }}
                              className={`py-1 rounded-lg text-[10px] font-bold text-center transition-colors ${
                                user.role === 'admin' 
                                  ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/40' 
                                  : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
                              }`}
                            >
                              🛡️ Root
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold">{isHindi ? 'अतिथि पर्यटक' : 'Guest Traveler'}</div>
                        <div className="text-[10px] text-slate-400">{isHindi ? 'सभी सुविधाओं के लिए साइन इन करें' : 'Sign in to access all safety features'}</div>
                      </div>
                      <button
                        onClick={() => {
                          soundFx.playClick();
                          setCurrentTab('home');
                          setIsMenuOpen(false);
                          const el = document.getElementById('auth-card-anchor');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xs font-bold shadow-md shadow-blue-500/25 hover:scale-105 transition-all cursor-pointer"
                      >
                        {isHindi ? 'साइन इन करें' : 'Sign In'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Quick Utilities Row: Theme Toggle, Notifications, JSON DB */}
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1 pb-1.5">
                    {isHindi ? 'त्वरित टूल्स व अलर्ट' : 'Quick Tools & Alerts'}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {/* Theme Toggle Button */}
                    <button
                      onClick={() => setDarkMode(!darkMode)}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all cursor-pointer ${
                        darkMode 
                          ? 'border-slate-800 bg-slate-900/80 text-slate-200 hover:bg-slate-850' 
                          : 'border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200/80'
                      }`}
                    >
                      {darkMode ? <Sun className="h-4 w-4 text-amber-400 mb-1" /> : <Moon className="h-4 w-4 text-indigo-600 mb-1" />}
                      <span className="text-[10px] font-bold">{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
                    </button>

                    {/* Notifications Button */}
                    <button
                      onClick={() => {
                        setShowNotifSection(!showNotifSection);
                        if (!showNotifSection) markNotificationsRead();
                      }}
                      className={`relative flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all cursor-pointer ${
                        showNotifSection
                          ? 'border-blue-500 bg-blue-600/15 text-blue-400'
                          : darkMode 
                            ? 'border-slate-800 bg-slate-900/80 text-slate-200 hover:bg-slate-850' 
                            : 'border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200/80'
                      }`}
                    >
                      <Bell className="h-4 w-4 text-cyan-400 mb-1" />
                      <span className="text-[10px] font-bold">{isHindi ? 'अलर्ट' : 'Alerts'}</span>
                      {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white">
                          {unreadCount}
                        </span>
                      )}
                    </button>

                    {/* JSON Database Button */}
                    <button
                      onClick={() => {
                        soundFx.playClick();
                        if (onOpenDatabaseExplorer) onOpenDatabaseExplorer();
                        setIsMenuOpen(false);
                      }}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all cursor-pointer ${
                        darkMode 
                          ? 'border-cyan-500/40 bg-cyan-950/40 text-cyan-300 hover:bg-cyan-900/50' 
                          : 'border-cyan-300 bg-cyan-50 text-cyan-800 hover:bg-cyan-100'
                      }`}
                    >
                      <Database className="h-4 w-4 text-cyan-400 mb-1" />
                      <span className="text-[10px] font-mono font-bold">{'{ }'} JSON DB</span>
                    </button>
                  </div>

                  {/* Expandable Notifications Box inside drawer */}
                  <AnimatePresence>
                    {showNotifSection && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className={`mt-2 p-3 rounded-xl border max-h-48 overflow-y-auto space-y-2 ${
                          darkMode ? 'border-slate-800 bg-slate-900/90' : 'border-slate-200 bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[11px] font-bold border-b border-slate-800/40 pb-1">
                          <span>{isHindi ? 'सुरक्षा अलर्ट' : 'Safety Alerts'}</span>
                          <span className="text-[9px] text-cyan-400">{notifications.length} Active</span>
                        </div>
                        {notifications.length === 0 ? (
                          <div className="py-2 text-center text-xs text-slate-400">
                            {isHindi ? 'कोई सक्रिय अलर्ट नहीं है।' : 'No active alerts.'}
                          </div>
                        ) : (
                          notifications.map(n => (
                            <div key={n.id} className="text-xs p-1.5 rounded-lg bg-slate-800/40 flex items-start space-x-2">
                              {n.type === 'emergency' ? (
                                <AlertTriangle className="h-3.5 w-3.5 text-rose-500 mt-0.5 shrink-0" />
                              ) : (
                                <CheckCircle className="h-3.5 w-3.5 text-cyan-400 mt-0.5 shrink-0" />
                              )}
                              <div className="flex-1 text-[11px] leading-snug">
                                <p>{n.message}</p>
                                <span className="text-[9px] text-slate-400">{n.time}</span>
                              </div>
                            </div>
                          ))
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Primary Navigation Sections (All 10 Tabs) */}
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1 pb-2 flex items-center justify-between">
                    <span>{isHindi ? 'सभी नेविगेशन विकल्प' : 'All Navigation Sections'}</span>
                    <span className="text-[9px] text-cyan-400 font-mono font-bold">10 MODULES</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {tabs.map((tab) => {
                      const isActive = currentTab === tab.id;
                      const Icon = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          id={`drawer-tab-${tab.id}`}
                          onClick={() => {
                            soundFx.playClick();
                            setCurrentTab(tab.id);
                            setIsMenuOpen(false);
                          }}
                          className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs font-bold transition-all cursor-pointer ${
                            isActive 
                              ? 'bg-gradient-to-r from-blue-600/20 to-cyan-500/20 text-cyan-400 border border-blue-500/40 shadow-sm' 
                              : darkMode 
                                ? 'text-slate-200 hover:bg-slate-900 border border-transparent' 
                                : 'text-slate-700 hover:bg-slate-100 border border-transparent'
                          }`}
                        >
                          <div className="flex items-center space-x-2.5 min-w-0">
                            <div className={`p-1.5 rounded-lg shrink-0 ${
                              isActive 
                                ? 'bg-cyan-500/20 text-cyan-400' 
                                : darkMode ? 'bg-slate-900 text-slate-400' : 'bg-slate-100 text-slate-600'
                            }`}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="leading-tight truncate">{tab.label}</div>
                              {tab.desc && <div className="text-[10px] font-normal text-slate-400 truncate">{tab.desc}</div>}
                            </div>
                          </div>
                          {tab.badge && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded font-mono font-bold bg-cyan-500/20 text-cyan-300 shrink-0 ml-1">
                              {tab.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Authority & Command Portals */}
                <div className={`border-t pt-3 ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1 pb-2">
                    {isHindi ? 'कमांड व आधिकारिक पोर्टल' : 'Command Portals & Operations'}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {adminRoles.map((role) => {
                      const Icon = role.icon;
                      const isActive = currentTab === role.id;
                      return (
                        <button
                          key={role.id}
                          id={`drawer-role-${role.id}`}
                          onClick={() => {
                            soundFx.playClick();
                            setCurrentTab(role.id);
                            setIsMenuOpen(false);
                          }}
                          className={`flex items-center space-x-2.5 rounded-xl px-3 py-2 text-left text-xs font-bold transition-colors cursor-pointer ${
                            isActive 
                              ? 'bg-cyan-600/20 text-cyan-400 border border-cyan-500/30' 
                              : darkMode 
                                ? 'text-slate-300 hover:bg-slate-900 border border-transparent' 
                                : 'text-slate-700 hover:bg-slate-100 border border-transparent'
                          }`}
                        >
                          <Icon className="h-4 w-4 text-cyan-400 shrink-0" />
                          <span className="truncate">{role.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Language Selection Grid */}
                <div className={`border-t pt-3 ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1 pb-2 flex items-center space-x-1.5">
                    <Globe className="h-3.5 w-3.5 text-cyan-400" />
                    <span>{t('selectLanguage') || 'Select Language / भाषा चुनें'}</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    {LANGUAGES.map(lang => (
                      <button
                        key={lang.code}
                        id={`drawer-lang-${lang.code}`}
                        onClick={() => {
                          soundFx.playClick();
                          setLanguage(lang.code);
                        }}
                        className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                          language === lang.code
                            ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                            : darkMode
                              ? 'border-slate-800 bg-slate-900/60 text-slate-300 hover:bg-slate-800'
                              : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <span className="text-sm">{lang.flag}</span>
                        <span className="text-[11px] truncate">{lang.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
