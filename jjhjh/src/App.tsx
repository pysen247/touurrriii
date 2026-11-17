/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Bot, 
  MapPin, 
  Navigation, 
  Plus, 
  Check, 
  Trash2, 
  AlertTriangle, 
  DollarSign, 
  TrendingUp, 
  Award, 
  Calendar, 
  Activity, 
  User, 
  AlertCircle, 
  Volume2, 
  Heart, 
  Languages, 
  Compass, 
  Search, 
  CheckSquare, 
  Cpu, 
  FolderLock, 
  Globe,
  PhoneCall, 
  Terminal,
  Eye,
  Sliders,
  Sparkles,
  QrCode,
  Smartphone,
  Shield,
  Hotel,
  Coffee,
  Building,
  Anchor,
  HelpCircle,
  ExternalLink,
  Scale,
  ArrowRightLeft,
  X,
  Lock,
  CheckCircle2,
  XCircle,
  Database
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Navbar from './components/Navbar';
import MapComponent from './components/MapComponent';
import ChatWidget from './components/ChatWidget';
import AppTutorialGuide from './components/AppTutorialGuide';
import InteractiveSafetySuite from './components/InteractiveSafetySuite';
import AuraStealthSentinel from './components/AuraStealthSentinel';
import OfflineSurvivalSuite from './components/OfflineSurvivalSuite';
import ToolTransitionHeader from './components/ToolTransitionHeader';
import TripItineraryCard from './components/TripItineraryCard';
import TripComparisonView from './components/TripComparisonView';
import PersistentSOSButton from './components/PersistentSOSButton';
import LiveVoiceModal from './components/LiveVoiceModal';
import PostTripFeedbackModal from './components/PostTripFeedbackModal';
import AuthLandingPortal from './components/AuthLandingPortal';
import TiltCard from './components/TiltCard';
import AuthorityDashboard from './components/AuthorityDashboard';
import DatabaseExplorerModal from './components/DatabaseExplorerModal';
import WeatherForecastWidget from './components/WeatherForecastWidget';
import { evaluateGeofence, SAMPLE_GEOFENCE_ZONES, GeofenceEvaluationResult } from './utils/geofenceData';
import { soundFx } from './utils/audio';

const DEFAULT_AVATAR_SVG =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><rect width='64' height='64' rx='16' fill='%230f172a'/><circle cx='32' cy='24' r='11' fill='%2338bdf8'/><path d='M14 54c0-10 8-16 18-16s18 6 18 16' fill='%2338bdf8'/></svg>";

const calculateHaversineKm = (a: { lat: number; lng: number }, b: { lat: number; lng: number }): string => {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const km = 2 * R * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return km < 10 ? `${km.toFixed(1)} km` : `${Math.round(km)} km`;
};

const TOOL_TITLES: Record<string, string> = {
  home: 'SafeTour AI • Safe Destination Radar',
  dashboard: 'Tourist Safety & Command Dashboard',
  authority: 'Bharat Safe Tourism • Police & Incident Command Desk (SIH 25002)',
  map: 'Smart Geofence & Incident Radar',
  planner: 'Gemini AI Travel Planner',
  guide: 'SafeTour Master Tutorial & User Guide',
  recs: 'Verified Recommendations & Safe Spots',
  aura: 'AURA™ Stealth Sentinel',
  offline: 'Zero-Net Offline Survival Hub',
  extras: 'Interactive AI Safety Suite',
  government: 'Government & Tourism Authority Portal',
  emergency: 'Rapid Emergency Dispatch Grid',
  admin: 'System Master Administration',
  profile: 'Tourist Identity & Digital Pass'
};

const DESTINATION_SUGGESTIONS = [
  { city: 'Jaipur', country: 'India', flag: '🇮🇳', safety: '97% Safe', days: '3', budget: '600', highlights: 'Hawa Mahal, Amber Fort, City Palace & Jal Mahal', category: 'Royal Forts & Palaces' },
  { city: 'Agra', country: 'India', flag: '🇮🇳', safety: '95% Safe', days: '2', budget: '450', highlights: 'Taj Mahal, Agra Fort, Mehtab Bagh & Fatehpur Sikri', category: 'Wonder of the World' },
  { city: 'New Delhi', country: 'India', flag: '🇮🇳', safety: '94% Monitored', days: '3', budget: '550', highlights: 'Red Fort, Qutub Minar, India Gate, Lotus Temple & Akshardham', category: 'Capital Heritage' },
  { city: 'Mumbai', country: 'India', flag: '🇮🇳', safety: '96% Safe', days: '3', budget: '700', highlights: 'Gateway of India, Marine Drive, Elephanta Caves & Colaba', category: 'Coastal Metropolis' },
  { city: 'Varanasi', country: 'India', flag: '🇮🇳', safety: '95% Safe', days: '3', budget: '400', highlights: 'Kashi Vishwanath Temple, Dashashwamedh Ghat Ganga Aarti & Assi Ghat', category: 'Spiritual Heritage' },
  { city: 'Goa', country: 'India', flag: '🇮🇳', safety: '98% Safe', days: '4', budget: '650', highlights: 'Baga Beach, Basilica of Bom Jesus, Fort Aguada & Dudhsagar Falls', category: 'Beaches & Heritage' },
  { city: 'Udaipur', country: 'India', flag: '🇮🇳', safety: '98% Safe', days: '3', budget: '600', highlights: 'City Palace Udaipur, Lake Pichola, Jag Mandir & Fateh Sagar Lake', category: 'City of Lakes' },
  { city: 'Amritsar', country: 'India', flag: '🇮🇳', safety: '99% Ultra-Safe', days: '2', budget: '350', highlights: 'Golden Temple (Sri Harmandir Sahib), Jallianwala Bagh & Wagah Border', category: 'Sacred Gurdwara' },
  { city: 'Kerala (Alleppey)', country: 'India', flag: '🇮🇳', safety: '98% Safe', days: '4', budget: '750', highlights: 'Alleppey Backwaters Houseboat, Kumarakom & Fort Kochi Nets', category: 'Serene Backwaters' },
  { city: 'Dharamshala & McLeodGanj', country: 'India', flag: '🇮🇳', safety: '99% Ultra-Safe', days: '3', budget: '450', highlights: 'Dalai Lama Temple, Bhagsu Waterfall, Triund Trek & Kangra Fort', category: 'Himalayan Sanctuary' },
  { city: 'Munnar & Wayanad', country: 'India', flag: '🇮🇳', safety: '98% Safe', days: '3', budget: '500', highlights: 'Tea Gardens, Anamudi Peak, Eravikulam Park & Banasura Sagar Dam', category: 'Hill Station & Nature' },
  { city: 'Ladakh (Leh & Nubra)', country: 'India', flag: '🇮🇳', safety: '98% Safe', days: '6', budget: '950', highlights: 'Pangong Lake, Khardung La Pass, Nubra Valley & Hemis Monastery', category: 'High Altitude Desert' },
  { city: 'Shimla & Manali', country: 'India', flag: '🇮🇳', safety: '97% Safe', days: '5', budget: '800', highlights: 'Mall Road Shimla, Solang Valley, Rohtang Pass & Hadimba Temple', category: 'Himalayan Retreat' },
  { city: 'Rishikesh & Haridwar', country: 'India', flag: '🇮🇳', safety: '99% Ultra-Safe', days: '3', budget: '400', highlights: 'Lakshman Jhula, Triveni Ghat Ganga Aarti & River Rafting', category: 'Yoga & Adventure' },
  { city: 'Ayodhya', country: 'India', flag: '🇮🇳', safety: '98% Safe', days: '2', budget: '350', highlights: 'Shri Ram Janmabhoomi Mandir, Hanuman Garhi & Saryu River Ghats', category: 'Holy Pilgrimage' },
  { city: 'Kedarnath & Badrinath', country: 'India', flag: '🇮🇳', safety: '96% Safe', days: '4', budget: '600', highlights: 'Kedarnath Jyotirlinga, Vasudhara Falls, Mana Village & Badrinath', category: 'Sacred Char Dham' },
  { city: 'Darjeeling & Gangtok', country: 'India', flag: '🇮🇳', safety: '98% Safe', days: '4', budget: '650', highlights: 'Tiger Hill Sunrise, Kanchenjunga Views, Toy Train & Nathula Pass', category: 'Eastern Himalayas' },
  { city: 'Srinagar (Kashmir)', country: 'India', flag: '🇮🇳', safety: '95% Monitored', days: '4', budget: '750', highlights: 'Dal Lake Shikara Ride, Mughal Gardens, Gulmarg Gondola & Pahalgam', category: 'Paradise on Earth' },
  { city: 'Madurai & Rameswaram', country: 'India', flag: '🇮🇳', safety: '98% Safe', days: '3', budget: '450', highlights: 'Meenakshi Amman Temple, Ramanathaswamy Temple & Pamban Bridge', category: 'Dravidian Temples' },
  { city: 'Mysuru (Mysore)', country: 'India', flag: '🇮🇳', safety: '98% Safe', days: '2', budget: '400', highlights: 'Mysore Palace (Amba Vilas), Chamundi Hill & Brindavan Gardens', category: 'Royal Heritage' },
  { city: 'Hampi', country: 'India', flag: '🇮🇳', safety: '96% Safe', days: '3', budget: '450', highlights: 'Virupaksha Temple, Stone Chariot & Vittala Temple Complex', category: 'Vijayanagara Ruins' },
  { city: 'Kevadia (Statue of Unity)', country: 'India', flag: '🇮🇳', safety: '99% Ultra-Safe', days: '2', budget: '500', highlights: 'Statue of Unity (182m), Narmada Dam & Valley of Flowers', category: 'Modern Landmark' },
  { city: 'Channapatna Craft Village', country: 'India', flag: '🇮🇳', safety: '99% Ultra-Safe', days: '1', budget: '200', highlights: 'Traditional Wooden Toy Artisans, Lacquerware Workshops & Rural Heritage', category: 'Craft Village' },
  { city: 'Puducherry', country: 'India', flag: '🇮🇳', safety: '97% Safe', days: '3', budget: '500', highlights: 'Promenade Beach, French Quarter & Auroville Matrimandir', category: 'French Heritage' },
  { city: 'Paris', country: 'France', flag: '🇫🇷', safety: '96% Safe', days: '3', budget: '1500', highlights: 'Eiffel Tower, Louvre, Seine Cruise & Montmartre', category: 'Romantic & Historic' },
  { city: 'Tokyo & Kyoto', country: 'Japan', flag: '🇯🇵', safety: '99% Ultra-Safe', days: '5', budget: '2200', highlights: 'Shibuya Crossing, Fushimi Inari Shrine, Senso-ji & Arashiyama', category: 'Futuristic & Culture' },
  { city: 'Dubai', country: 'UAE', flag: '🇦🇪', safety: '98% Ultra-Safe', days: '4', budget: '2500', highlights: 'Burj Khalifa, Dubai Mall, Palm Jumeirah & Desert Safari', category: 'Luxury & Adventure' },
  { city: 'Rome', country: 'Italy', flag: '🇮🇹', safety: '95% Safe', days: '3', budget: '1400', highlights: 'Colosseum, Vatican Museums, Trevi Fountain & Pantheon', category: 'Ancient World' },
  { city: 'London', country: 'UK', flag: '🇬🇧', safety: '96% Safe', days: '4', budget: '1800', highlights: 'Big Ben, London Eye, British Museum & Tower Bridge', category: 'Royal & Cosmopolitan' },
  { city: 'Singapore', country: 'Singapore', flag: '🇸🇬', safety: '99% Ultra-Safe', days: '3', budget: '1600', highlights: 'Marina Bay Sands, Gardens by the Bay, Jewel Changi & Sentosa', category: 'Garden City' },
  { city: 'Bali', country: 'Indonesia', flag: '🇮🇩', safety: '97% Safe', days: '5', budget: '1100', highlights: 'Ubud Rice Terraces, Uluwatu Temple, Nusa Penida & Seminyak', category: 'Tropical Island' },
  { city: 'Zurich & Interlaken', country: 'Switzerland', flag: '🇨🇭', safety: '99% Ultra-Safe', days: '4', budget: '2400', highlights: 'Jungfraujoch, Lake Zurich, Grindelwald & Matterhorn Views', category: 'Alpine Marvel' },
  { city: 'New York', country: 'USA', flag: '🇺🇸', safety: '92% Monitored', days: '4', budget: '2000', highlights: 'Times Square, Central Park, Broadway & Statue of Liberty', category: 'Metropolis & Arts' }
];
import { 
  UserProfile, 
  Booking, 
  SafetyZone, 
  SmartPOI, 
  ChatMessage, 
  SOSRequest, 
  ScamReport, 
  LostItemReport, 
  TripItinerary,
  ResolvedLocation
} from './types';
import { TRANSLATIONS, LANGUAGES, LanguageCode } from './utils/translations';

export default function App() {
  // Localization & Themes (Defaults to Dark Theme for immersion & eye comfort)
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('safetour_theme');
    return saved !== 'light'; // Default to true (dark theme)
  });
  const [language, setLanguage] = useState<LanguageCode>('en');
  const t = (key: string) => TRANSLATIONS[language]?.[key] || TRANSLATIONS['en']?.[key] || key;

  // Synchronize documentElement class and localStorage
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('safetour_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('safetour_theme', 'light');
    }
  }, [darkMode]);

  // Authentication States
  const [token, setToken] = useState<string | null>(localStorage.getItem('safetour_token'));
  const [user, setUser] = useState<any | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isDbLoading, setIsDbLoading] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  
  // Auth Form Fields
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Tab/Navigation State
  const [currentTab, setCurrentTab] = useState('home');
  const [isLiveVoiceOpen, setIsLiveVoiceOpen] = useState(false);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number }>({ lat: 26.9124, lng: 75.7873 }); // Default: Jaipur Heritage Hub

  // Problem Statement 25002: Real-time Geofencing & Dynamic Safety Score States
  const [currentSafetyScore, setCurrentSafetyScore] = useState<number>(88);
  const [activeGeofenceAlert, setActiveGeofenceAlert] = useState<GeofenceEvaluationResult | null>(null);
  const [showAdvisoryModal, setShowAdvisoryModal] = useState(false);

  // Digital ID Verification Modal State (Tourist Facing)
  const [digitalIdModalOpen, setDigitalIdModalOpen] = useState(false);
  const [verifyingIdStatus, setVerifyingIdStatus] = useState<any | null>(null);
  const [isVerifyingDigitalId, setIsVerifyingDigitalId] = useState(false);

  // Live Persistent Database Explorer Modal State
  const [showDatabaseModal, setShowDatabaseModal] = useState(false);

  // Check URL pathname or hash on initial mount for protected /dashboard route
  useEffect(() => {
    const path = window.location.pathname;
    const hash = window.location.hash;
    if (path === '/dashboard' || hash === '#dashboard' || hash === '#authority') {
      setCurrentTab('authority');
    }
  }, []);

  // Update browser URL sync when tab changes to /dashboard or authority
  useEffect(() => {
    if (currentTab === 'authority') {
      try {
        window.history.replaceState(null, '', '/dashboard');
      } catch (e) {}
    }
  }, [currentTab]);

  // Telemetry & Geofence evaluation engine
  const updateTouristLocation = async (lat: number, lng: number, locationName?: string) => {
    setUserCoords({ lat, lng });
    const geofenceResult = evaluateGeofence(lat, lng, currentSafetyScore);
    setCurrentSafetyScore(geofenceResult.dynamicSafetyScore);

    if (geofenceResult.riskLevel === 'high-risk' || geofenceResult.riskLevel === 'moderate') {
      setActiveGeofenceAlert(geofenceResult);
      soundFx.playWarning();
    } else {
      setActiveGeofenceAlert(null);
    }

    // Ping telemetry to backend
    try {
      const token = localStorage.getItem('safetour_token');
      await safeFetch('/api/tourist/location', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          lat,
          lng,
          touristId: user?.id,
          timestamp: new Date().toISOString()
        })
      });
    } catch (err) {
      console.warn('Location telemetry sync failed:', err);
    }
  };

  // Acquire live geolocation on mount for distance calculations
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          updateTouristLocation(pos.coords.latitude, pos.coords.longitude, 'Live Device GPS');
        },
        () => {
          // Fallback to Jaipur Pink City default coordinates
          updateTouristLocation(26.9124, 75.7873, 'Jaipur Pink City Heritage');
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      updateTouristLocation(26.9124, 75.7873, 'Jaipur Pink City Heritage');
    }
  }, []);

  // Database States loaded from server (PII default removed)
  const [profile, setProfile] = useState<UserProfile>({
    name: 'Traveler',
    email: '',
    nationality: '',
    passportNumber: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    medicalConditions: '',
    bloodType: '',
    preferredLanguages: [],
    savedTrips: [],
    achievements: [],
    qrPassCode: '',
    avatarUrl: ''
  });

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [sosRequests, setSosRequests] = useState<SOSRequest[]>([]);
  const [safetyZones, setSafetyZones] = useState<SafetyZone[]>([]);
  const [scams, setScams] = useState<ScamReport[]>([]);
  const [lostItems, setLostItems] = useState<LostItemReport[]>([]);
  const [trips, setTrips] = useState<TripItinerary[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<string>('');
  const [plannerViewMode, setPlannerViewMode] = useState<'single' | 'compare'>('single');
  const [compareTripIdA, setCompareTripIdA] = useState<string>('');
  const [compareTripIdB, setCompareTripIdB] = useState<string>('');
  const [feedbackModalTrip, setFeedbackModalTrip] = useState<TripItinerary | null>(null);

  // POIs (Indian Heritage Corridors + Global Hubs)
  const [pois, setPois] = useState<SmartPOI[]>([
    { id: 'p_jpr_1', name: 'Jaipur City Palace Tourist Police Kiosk', category: 'police', lat: 26.9258, lng: 75.8237, rating: 4.9, priceLevel: '$', distance: '3.8 km', safetyRating: 10.0, details: '24/7 Rajasthan Tourist Police desk with multilingual digital ID verification.' },
    { id: 'p_jpr_2', name: 'SMS Hospital Emergency & Trauma Wing', category: 'hospital', lat: 26.9061, lng: 75.8162, rating: 4.8, priceLevel: '$', distance: '2.9 km', safetyRating: 9.8, details: 'Government tertiary medical center with dedicated emergency ambulance dispatch.' },
    { id: 'p_jpr_3', name: 'Rambagh Heritage Safe-Stay Zone', category: 'hotel', lat: 26.8982, lng: 75.8081, rating: 4.9, priceLevel: '$$$', distance: '2.5 km', safetyRating: 9.9, details: 'Platinum SafeZone certified property with verified perimeter security.' },
    { id: 'p_jpr_4', name: 'Badi Chaupar Metro Hub', category: 'transit', lat: 26.9235, lng: 75.8266, rating: 4.7, priceLevel: '$', distance: '4.0 km', safetyRating: 9.4, details: 'CCTV-monitored Jaipur Metro underground corridor serving Hawa Mahal.' },
    { id: 'p_jpr_5', name: 'MI Road SBI Lobby Safe ATM', category: 'atm', lat: 26.9154, lng: 75.8126, rating: 4.5, priceLevel: '$', distance: '2.5 km', safetyRating: 9.5, details: '24-hour guarded bank branch ATM inside well-lit commercial zone.' },
    { id: 'p_jpr_6', name: 'Lassiwala Heritage Certified Kitchen', category: 'restaurant', lat: 26.9159, lng: 75.8141, rating: 4.8, priceLevel: '$', distance: '2.6 km', safetyRating: 9.6, details: 'FSSAI hygiene-certified heritage eatery with transparent QR billing.' },
    { id: 'p_del_1', name: 'Connaught Place Tourist Assistance Booth', category: 'police', lat: 28.6315, lng: 77.2167, rating: 4.8, priceLevel: '$', distance: '240 km', safetyRating: 9.8, details: 'Delhi Police Special Tourist Unit monitoring New Delhi heritage loop.' },
    { id: 'p1', name: 'Le Ritz Luxury Hotel', category: 'hotel', lat: 48.8681, lng: 2.3294, rating: 4.9, priceLevel: '$$$', distance: '6300 km', safetyRating: 9.8, details: 'Under 24/7 security watch. SafeZone platinum certified.' },
    { id: 'p2', name: 'Safe Haven Medical Emergency', category: 'hospital', lat: 48.8566, lng: 2.3522, rating: 4.7, priceLevel: '$$', distance: '6300 km', safetyRating: 10.0, details: 'Primary multilingual responder clinic.' },
    { id: 'p4', name: 'Champs-Élysées Transit Station', category: 'transit', lat: 48.8698, lng: 2.3075, rating: 4.5, priceLevel: '$', distance: '6300 km', safetyRating: 8.5, details: 'Metro line 1 connection. Watch for pickpockets during rush hours.' },
    { id: 'p6', name: 'EcoCharge EV Corridor Station', category: 'charging', lat: 26.9128, lng: 75.7920, rating: 4.6, priceLevel: '$$', distance: '0.5 km', safetyRating: 9.4, details: 'Illuminated solar EV charging bay near Jaipur Civil Lines.' }
  ]);

  const [mapFocusCoords, setMapFocusCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [poiCategoryFilter, setPoiCategoryFilter] = useState<string>('all');
  const [poiSearchQuery, setPoiSearchQuery] = useState<string>('');
  const [authorityOverviewStats, setAuthorityOverviewStats] = useState<{
    totalMonitoredTourists: number;
    activeSos: number;
    aiAnomalies: number;
    openEfir: number;
    resolvedCases: number;
    safeCorridorsActive: number;
    highRiskZonesMonitored: number;
  } | null>(null);
  const [advisoryTitle, setAdvisoryTitle] = useState('');
  const [advisoryZone, setAdvisoryZone] = useState('Jaipur Heritage Zone');
  const [profileSaving, setProfileSaving] = useState(false);

  // UI Global states
  const [sosActive, setSosActive] = useState(false);
  const [activeSosId, setActiveSosId] = useState<string | null>(null);
  const [notifications, setNotifications] = useState([
    { id: 'n1', type: 'weather', message: 'OUTDOOR ADVISORY: Check the 5-day forecast on your Dashboard before mountain or heritage travel.', time: 'Just Now', read: false },
    { id: 'n2', type: 'emergency', message: 'GEOFENCE RADAR ACTIVE: Real-time safety zone monitoring enabled across Jaipur, Delhi, and Agra.', time: '2 mins ago', read: false },
    { id: 'n3', type: 'booking', message: 'DIGITAL PASS READY: SHA-256 cryptographic tourist pass synced for offline verification.', time: '1 hour ago', read: false }
  ]);

  useEffect(() => {
    if (currentTab === 'government' || currentTab === 'emergency') {
      fetch('/api/authority/overview')
        .then(r => (r.ok ? r.json() : null))
        .then(data => {
          if (data?.stats) setAuthorityOverviewStats(data.stats);
        })
        .catch(() => {});
    }
  }, [currentTab, sosRequests.length]);

  // AI Chat Messages
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState(false);

  // AI Action States
  const [scamInput, setScamInput] = useState('');
  const [scamResult, setScamResult] = useState<any | null>(null);
  const [scamLoading, setScamLoading] = useState(false);

  const [landmarkInput, setLandmarkInput] = useState('');
  const [landmarkResult, setLandmarkResult] = useState<any | null>(null);
  const [landmarkLoading, setLandmarkLoading] = useState(false);

  const [translationText, setTranslationText] = useState('');
  const [translationLang, setTranslationLang] = useState('Spanish');
  const [translatedOutput, setTranslatedOutput] = useState('');
  const [translating, setTranslating] = useState(false);

  const [itineraryInput, setItineraryInput] = useState({ destination: 'Lonavala, Maharashtra, India', days: '3', budget: '500', interests: 'Explore Tiger Point, Bhushi Dam, Karla Caves & Rajmachi Fort safely' });
  const [itineraryLoading, setItineraryLoading] = useState(false);
  const [showDestSuggestions, setShowDestSuggestions] = useState(false);

  // Dynamic Google Places Location Search & Resolution States
  const [selectedResolvedLocation, setSelectedResolvedLocation] = useState<ResolvedLocation | null>({
    name: 'Lonavala',
    formattedAddress: 'Lonavala, Pune District, Maharashtra, India',
    placeId: 'place_lonavala_in',
    lat: 18.7557,
    lng: 73.4091,
    country: 'India',
    stateOrRegion: 'Maharashtra',
    type: 'hill_station',
    safetyRating: '99% Ultra-Safe',
    highlights: 'Bhushi Dam, Karla Caves, Tiger Point & Rajmachi Fort',
    category: 'Sahyadri Hill Station'
  });
  const [placeSearchResults, setPlaceSearchResults] = useState<ResolvedLocation[]>([]);
  const [isSearchingPlaces, setIsSearchingPlaces] = useState(false);
  const [placeSearchError, setPlaceSearchError] = useState<string | null>(null);
  const [isAmbiguousPlace, setIsAmbiguousPlace] = useState(false);

  // Dynamic Location Search Effect with Debounce
  useEffect(() => {
    if (!showDestSuggestions) return;
    const term = itineraryInput.destination.trim();

    const timer = setTimeout(async () => {
      setIsSearchingPlaces(true);
      setPlaceSearchError(null);
      try {
        const res = await safeFetch('/api/places/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: term, language })
        });
        if (res.ok) {
          const data = await res.json();
          setPlaceSearchResults(data.candidates || []);
          setIsAmbiguousPlace(!!data.isAmbiguous);

          // Handle Natural Language Extraction if present
          if (data.isNaturalLanguage && data.extractedIntent) {
            if (data.extractedIntent.days) {
              setItineraryInput(prev => ({ ...prev, days: String(data.extractedIntent.days) }));
            }
            if (data.extractedIntent.budget) {
              setItineraryInput(prev => ({ ...prev, budget: String(data.extractedIntent.budget) }));
            }
          }

          if (data.candidates && data.candidates.length === 1 && !data.isAmbiguous) {
            setSelectedResolvedLocation(data.candidates[0]);
          }
        } else {
          setPlaceSearchError(language === 'hi'
            ? "अभी स्थानों की खोज नहीं हो सकी। कृपया अपना इंटरनेट जांचें या पुनः प्रयास करें।"
            : "We couldn't search destinations right now. Please check your connection or try again.");
        }
      } catch (e) {
        console.error('Place search error:', e);
        setPlaceSearchError(language === 'hi'
          ? "स्थान खोज सेवा उपलब्ध नहीं है। कृपया पुनः प्रयास करें।"
          : "We couldn't search destinations right now. Please check your connection or try again.");
      } finally {
        setIsSearchingPlaces(false);
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [itineraryInput.destination, showDestSuggestions, language]);

  const handleSelectResolvedLocation = (loc: ResolvedLocation) => {
    soundFx.playClick();
    setSelectedResolvedLocation(loc);
    setItineraryInput(prev => ({
      ...prev,
      destination: loc.formattedAddress || loc.name,
      interests: loc.highlights ? `Explore ${loc.highlights} safely` : prev.interests
    }));
    setShowDestSuggestions(false);
    setIsAmbiguousPlace(false);
    setPlaceSearchError(null);
  };

  const filteredSuggestions = DESTINATION_SUGGESTIONS.filter(item => {
    if (!itineraryInput.destination.trim()) return true;
    const q = itineraryInput.destination.toLowerCase();
    return item.city.toLowerCase().includes(q) || 
           item.country.toLowerCase().includes(q) || 
           item.highlights.toLowerCase().includes(q) ||
           item.category.toLowerCase().includes(q);
  });

  // New Booking Form states
  const [newBookingData, setNewBookingData] = useState({ title: '', type: 'hotel', cost: '', details: '', date: '' });
  // Custom Alert message states
  const [globalBanner, setGlobalBanner] = useState<string | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Lost & Found Form states
  const [lostItemName, setLostItemName] = useState('');
  const [lostItemLoc, setLostItemLoc] = useState('');

  // Dispatcher tracking states
  const [sosNotes, setSosNotes] = useState<Record<string, string>>({});

  // Secure Proxy Safe Fetch Wrapper
  const safeFetch = async (url: string, options: RequestInit = {}) => {
    const currentToken = localStorage.getItem('safetour_token') || token || 'token_tourist';
    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${currentToken}`
    };
    return fetch(url, { ...options, headers });
  };

  // Fetch initial state from database proxy on server
  const fetchDatabase = async (currentToken = token || localStorage.getItem('safetour_token') || 'token_tourist') => {
    setIsDbLoading(true);
    try {
      const res = await fetch('/api/data/all', {
        headers: { 'Authorization': `Bearer ${currentToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data.profile || profile);
        setBookings(data.bookings || []);
        setSosRequests(data.sosRequests || []);
        setSafetyZones(data.safetyZones || []);
        setScams(data.scams || []);
        setLostItems(data.lostItems || []);
        setTrips(data.trips || []);
        
        // Auto-select first active trip
        if (data.trips && data.trips.length > 0) {
          if (!selectedTripId || !data.trips.some((t: any) => t.id === selectedTripId)) {
            setSelectedTripId(data.trips[0].id);
          }
        }
      }
    } catch (e) {
      console.error("Database loading failed, continuing with client states:", e);
      setGlobalError("⚠️ Connection failed. Unable to sync secure database.");
    } finally {
      setIsDbLoading(false);
    }
  };

  // Auth Initialization on Load
  useEffect(() => {
    const initAuth = async () => {
      const explicitLogout = localStorage.getItem('safetour_logged_out');
      let storedToken = localStorage.getItem('safetour_token');
      if (!storedToken && !explicitLogout) {
        storedToken = 'token_tourist';
        localStorage.setItem('safetour_token', 'token_tourist');
      }
      if (storedToken) {
        try {
          const res = await fetch('/api/auth/me', {
            headers: { 'Authorization': `Bearer ${storedToken}` }
          });
          if (res.ok) {
            const data = await res.json();
            setToken(storedToken);
            setUser(data);
            setProfile(data.profile);
            await fetchDatabase(storedToken);
          } else {
            localStorage.removeItem('safetour_token');
            setToken(null);
            setUser(null);
          }
        } catch (e) {
          console.error("Auth initialization failed:", e);
          localStorage.removeItem('safetour_token');
          setToken(null);
          setUser(null);
        }
      } else {
        setToken(null);
        setUser(null);
      }
      setIsAuthLoading(false);
    };
    initAuth();
  }, []);

  const handleQuickFill = (email: string, pass: string) => {
    soundFx.playClick();
    setAuthEmail(email);
    setAuthPassword(pass);
    setAuthMode('login');
    setAuthError(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: authEmail, password: authPassword })
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.removeItem('safetour_logged_out');
        localStorage.setItem('safetour_token', data.token);
        setToken(data.token);
        setUser(data.user);
        setProfile(data.user.profile);
        setAuthEmail('');
        setAuthPassword('');
        setGlobalBanner(`👋 WELCOME, ${data.user.profile.name.toUpperCase()}! ACCESS GRANTED TO ALL PLATFORM MODULES.`);
        await fetchDatabase(data.token);
      } else {
        const errorData = await res.json();
        setAuthError(errorData.error || 'Invalid credentials');
      }
    } catch (err) {
      setAuthError('Connection failed. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authName || !authEmail || !authPassword) {
      setAuthError('All fields are required');
      return;
    }
    setAuthLoading(true);
    setAuthError(null);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: authName, email: authEmail, password: authPassword })
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.removeItem('safetour_logged_out');
        localStorage.setItem('safetour_token', data.token);
        setToken(data.token);
        setUser(data.user);
        setProfile(data.user.profile);
        setAuthEmail('');
        setAuthPassword('');
        setAuthName('');
        setGlobalBanner(`✨ ACCOUNT CREATED. WELCOME TO SAFETOUR AI, ${data.user.profile.name.toUpperCase()}!`);
        await fetchDatabase(data.token);
      } else {
        const errorData = await res.json();
        setAuthError(errorData.error || 'Signup failed');
      }
    } catch (err) {
      setAuthError('Connection failed. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await safeFetch('/api/auth/logout', {
        method: 'POST'
      });
    } catch (e) {
      console.error(e);
    }
    localStorage.removeItem('safetour_token');
    localStorage.setItem('safetour_logged_out', 'true');
    setToken(null);
    setUser(null);
    setProfile({
      name: 'Traveler',
      email: '',
      nationality: '',
      passportNumber: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      medicalConditions: '',
      bloodType: '',
      preferredLanguages: [],
      savedTrips: [],
      achievements: [],
      qrPassCode: '',
      avatarUrl: ''
    });
    setBookings([]);
    setSosRequests([]);
    setLostItems([]);
    setTrips([]);
    setCurrentTab('home');
    setGlobalBanner("🔒 SIGNED OUT. ENTER YOUR REAL CREDENTIALS TO LOG IN AGAIN.");
  };

  const handleSwitchPersona = async (role: 'tourist' | 'government' | 'emergency' | 'admin') => {
    soundFx.playSuccess();
    const creds = {
      tourist: { email: 'tourist@safetour.com', password: 'password123', tab: 'dashboard' },
      government: { email: 'gov@safetour.com', password: 'password123', tab: 'authority' },
      emergency: { email: 'ems@safetour.com', password: 'password123', tab: 'authority' },
      admin: { email: 'admin@safetour.com', password: 'password123', tab: 'authority' },
    }[role];

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: creds.email, password: creds.password })
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.removeItem('safetour_logged_out');
        localStorage.setItem('safetour_token', data.token);
        setToken(data.token);
        setUser(data.user);
        setProfile(data.user.profile);
        await fetchDatabase(data.token);
        setCurrentTab(creds.tab);
        setGlobalBanner(`⚡ EVALUATOR ROLE SWITCH: Active as ${data.user.profile.name} (${data.user.role.toUpperCase()})`);
      }
    } catch (e) {
      console.error('Failed to switch persona:', e);
    }
  };

  // SIH 25002: Cryptographic Tamper-Proof Digital ID Audit verification
  const handleVerifyDigitalId = async () => {
    setIsVerifyingDigitalId(true);
    setDigitalIdModalOpen(true);
    try {
      const res = await safeFetch('/api/verify-id', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qrPassCode: profile.qrPassCode,
          digitalId: (user as any)?.digitalId || profile.qrPassCode,
          touristId: user?.id,
          name: profile.name,
          passportOrAadhaar: profile.passportNumber
        })
      });
      const data = await res.json();
      setVerifyingIdStatus(data);
    } catch (e) {
      setVerifyingIdStatus({ valid: false, error: 'Verification service unreachable' });
    } finally {
      setIsVerifyingDigitalId(false);
    }
  };

  const triggerSOS = async () => {
    if (sosActive) {
      if (activeSosId) {
        try {
          const res = await safeFetch(`/api/data/sos/${activeSosId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'Resolved', trackingNotes: 'Emergency resolved by user.' })
          });
          if (res.ok) {
            setSosActive(false);
            setActiveSosId(null);
            setGlobalBanner(null);
            fetchDatabase();
          } else {
            setGlobalError("⚠️ SOS cancellation failed. Please try again.");
          }
        } catch (e) {
          setGlobalError("⚠️ Connection failed. Unable to cancel SOS.");
        }
      } else {
        setSosActive(false);
        setGlobalBanner(null);
      }
      return;
    }

    setGlobalBanner("📡 Requesting device location coordinates...");
    
    const sendSOS = (lat: number, lng: number) => {
      let attempts = 0;

      const dispatchExternalLink = (href: string, newTab = true) => {
        const a = document.createElement('a');
        a.href = href;
        if (newTab) {
          a.target = '_blank';
          a.rel = 'noopener noreferrer';
        }
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      };

      // Helper to trigger SMS and Email fallback protocols when network/WhatsApp delivery is interrupted
      const executeSMSAndEmailFallback = () => {
        const contactPhone = profile.emergencyContactPhone || '112';
        const contactEmail = profile.emergencyContactEmail || '';
        const cleanPhone = contactPhone.replace(/[^0-9+]/g, '') || '112';
        const mapsLink = `https://maps.google.com/?q=${lat.toFixed(6)},${lng.toFixed(6)}`;
        const timestamp = new Date().toLocaleString();
        
        const emergencyPayload = `🚨 EMERGENCY SOS ALERT!
Tourist: ${profile.name || 'Tourist in Distress'}
GPS: ${mapsLink} (Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)})
Time: ${timestamp}
Immediate police/medical assistance required!`;

        const encodedPayload = encodeURIComponent(emergencyPayload);

        // 1. Cross-platform native SMS Gateway URL dispatch
        try {
          const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || ((navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));
          const smsUri = `sms:${cleanPhone}${isIOS ? '&body=' : '?body='}${encodedPayload}`;
          dispatchExternalLink(smsUri, false);
        } catch (smsErr) {
          console.warn('Direct SMS URL invocation failed:', smsErr);
        }

        // 2. Emergency mailto: fallback option if contact email exists
        if (contactEmail) {
          try {
            const mailtoUri = `mailto:${contactEmail}?subject=${encodeURIComponent(`🚨 EMERGENCY SOS - ${profile.name || 'Tourist'}`)}&body=${encodedPayload}`;
            dispatchExternalLink(mailtoUri, true);
          } catch (mailErr) {
            console.warn('Mailto fallback invocation failed:', mailErr);
          }
        }

        // 3. Inform server backend of fallback dispatch
        safeFetch('/api/data/sos/sms-fallback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lat,
            lng,
            contactPhone,
            channel: 'sms',
            dispatchMessage: emergencyPayload
          })
        }).catch(() => {});

        setGlobalBanner(`⚠️ Primary Gateway interrupted. Direct SMS & Email fallback prepared for ${contactPhone}.`);
      };

      const makePost = async () => {
        try {
          const res = await safeFetch('/api/data/sos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              touristName: profile.name,
              lat,
              lng,
              servicesRequired: ['Police', 'Ambulance']
            })
          });
          
          if (res.ok) {
            const data = await res.json();
            setSosActive(true);
            setActiveSosId(data.sos.id);
            setGlobalBanner("🚨 SOS ALERT BROADCASTED. POLICE, EMS AND REGISTERED CONTACTS NOTIFIED INSTANTLY.");
            setGlobalError(null);
            fetchDatabase();

            // Log emergency SMS dispatch payload on server and prepare WhatsApp share link
            const rawMessage = `🚨 EMERGENCY SOS! Tourist: ${profile.name}, GPS: https://maps.google.com/?q=${lat.toFixed(6)},${lng.toFixed(6)}. Immediate rescue needed!`;
            const cleanPhone = (profile.emergencyContactPhone || '').replace(/[^0-9+]/g, '');
            const waUrl = cleanPhone && cleanPhone.length >= 8 && cleanPhone !== '112'
              ? `https://api.whatsapp.com/send?phone=${cleanPhone.startsWith('+') ? cleanPhone.slice(1) : cleanPhone}&text=${encodeURIComponent(rawMessage)}`
              : `https://api.whatsapp.com/send?text=${encodeURIComponent(rawMessage)}`;

            try {
              dispatchExternalLink(waUrl, true);
            } catch {
              executeSMSAndEmailFallback();
            }
          } else {
            throw new Error("Primary SOS API failed");
          }
        } catch (e) {
          attempts++;
          if (attempts >= 2) {
            executeSMSAndEmailFallback();
          } else {
            setGlobalBanner(`🚨 SOS failed to send — retrying (Attempt ${attempts})...`);
            setTimeout(makePost, 2000);
          }
        }
      };
      makePost();
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          updateTouristLocation(latitude, longitude, 'SOS GPS Lock');
          sendSOS(latitude, longitude);
        },
        (error) => {
          let errorMsg = "Location access denied.";
          if (error.code === error.PERMISSION_DENIED) {
            errorMsg = "Location access denied by user.";
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            errorMsg = "Location position unavailable.";
          } else if (error.code === error.TIMEOUT) {
            errorMsg = "Location request timed out.";
          }
          setGlobalError(`⚠️ Geolocation note: ${errorMsg} Using active hub GPS (${userCoords.lat.toFixed(4)}, ${userCoords.lng.toFixed(4)}).`);
          sendSOS(userCoords.lat, userCoords.lng);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setGlobalError(`⚠️ Geolocation unsupported. Using active hub GPS (${userCoords.lat.toFixed(4)}, ${userCoords.lng.toFixed(4)}).`);
      sendSOS(userCoords.lat, userCoords.lng);
    }
  };

  const handleSendMessage = async (
    text: string, 
    options?: { role?: 'general' | 'complex' | 'fast'; groundingMode?: 'none' | 'maps' | 'search'; userLocation?: { lat: number; lng: number } | null }
  ) => {
    const role = options?.role || 'general';
    const groundingMode = options?.groundingMode || 'none';
    const loc = options?.userLocation || (selectedResolvedLocation ? { lat: selectedResolvedLocation.lat, lng: selectedResolvedLocation.lng } : null);

    const userMsg: ChatMessage = {
      id: 'usr_' + Date.now(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      role,
      groundingMode
    };
    setChatMessages(prev => [...prev, userMsg]);
    setChatLoading(true);
    setGlobalError(null);

    try {
      const res = await safeFetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: chatMessages,
          language: language,
          role,
          groundingMode,
          userLocation: loc
        })
      });
      if (res.ok) {
        const data = await res.json();
        const aiMsg: ChatMessage = {
          id: 'ai_' + Date.now(),
          sender: 'ai',
          text: data.text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          modelUsed: data.modelUsed,
          role: data.role,
          groundingMode: data.groundingMode,
          searchSources: data.searchSources,
          mapPlaces: data.mapPlaces,
          groundingChunks: data.groundingChunks
        };
        setChatMessages(prev => [...prev, aiMsg]);
      } else {
        const errData = await res.json().catch(() => ({}));
        setGlobalError(`💬 Chat assistance error: ${errData.error || 'Server issue'}`);
      }
    } catch (e) {
      console.error(e);
      setGlobalError("💬 Chat assistant unreachable. Please check connection.");
    } finally {
      setChatLoading(false);
    }
  };

  const handleTranslate = async () => {
    if (!translationText.trim()) return;
    setTranslating(true);
    setGlobalError(null);
    try {
      const res = await safeFetch('/api/gemini/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: translationText,
          to: translationLang
        })
      });
      if (res.ok) {
        const data = await res.json();
        setTranslatedOutput(data.translatedText);
      } else {
        const errData = await res.json().catch(() => ({}));
        setGlobalError(`🌐 Translation error: ${errData.error || 'Rate limit exceeded'}`);
      }
    } catch (e) {
      console.error(e);
      setGlobalError("🌐 Translation service offline. Try again shortly.");
    } finally {
      setTranslating(false);
    }
  };

  const handleScamDetection = async () => {
    if (!scamInput.trim()) return;
    setScamLoading(true);
    setGlobalError(null);
    try {
      const res = await safeFetch('/api/gemini/scam-detection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ situation: scamInput })
      });
      if (res.ok) {
        const data = await res.json();
        setScamResult(data);
      } else {
        const errData = await res.json().catch(() => ({}));
        setGlobalError(`⚠️ Scam detection error: ${errData.error || 'Request blocked'}`);
      }
    } catch (e) {
      console.error(e);
      setGlobalError("⚠️ Scam database verification failed. Check connection.");
    } finally {
      setScamLoading(false);
    }
  };

  const handleLandmarkRecognition = async () => {
    if (!landmarkInput.trim()) return;
    setLandmarkLoading(true);
    setGlobalError(null);
    try {
      const res = await safeFetch('/api/gemini/landmark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ landmarkName: landmarkInput })
      });
      if (res.ok) {
        const data = await res.json();
        setLandmarkResult(data);
      } else {
        const errData = await res.json().catch(() => ({}));
        setGlobalError(`🏛️ Landmark scanner error: ${errData.error || 'Recognition failed'}`);
      }
    } catch (e) {
      console.error(e);
      setGlobalError("🏛️ Landmark analyzer unreachable. Please retry.");
    } finally {
      setLandmarkLoading(false);
    }
  };

  const handleGenerateItinerary = async () => {
    setItineraryLoading(true);
    setGlobalError(null);
    try {
      // If location hasn't been resolved yet, attempt a fast resolution first
      let currentResolved = selectedResolvedLocation;
      if (!currentResolved || currentResolved.name.toLowerCase() !== itineraryInput.destination.toLowerCase()) {
        try {
          const searchRes = await safeFetch('/api/places/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: itineraryInput.destination, language })
          });
          if (searchRes.ok) {
            const sData = await searchRes.json();
            if (sData.candidates && sData.candidates.length > 0) {
              currentResolved = sData.candidates[0];
              setSelectedResolvedLocation(currentResolved);
            }
          }
        } catch (sErr) {
          console.warn('Pre-resolution search warning:', sErr);
        }
      }

      const res = await safeFetch('/api/gemini/plan-trip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          destination: itineraryInput.destination,
          resolvedLocation: currentResolved,
          days: itineraryInput.days,
          budget: itineraryInput.budget,
          interests: itineraryInput.interests,
          language 
        })
      });
      if (res.ok) {
        const generatedTrip = await res.json();
        
        // Save the generated trip itinerary into the database
        const saveRes = await safeFetch('/api/data/trips', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(generatedTrip)
        });
        if (saveRes.ok) {
          const savedData = await saveRes.json();
          if (savedData.trip && savedData.trip.id) {
            setSelectedTripId(savedData.trip.id);
          }
          await fetchDatabase();
          const targetName = (currentResolved?.name || itineraryInput.destination).toUpperCase();
          setGlobalBanner(language === 'hi' ? `✨ ${targetName} के लिए एआई यात्रा योजना तैयार की गई` : `✨ AI TRAVEL PLAN CREATED FOR ${targetName}`);
        } else {
          setGlobalError(language === 'hi' ? "⚠️ सर्वर पर जनरेट की गई यात्रा सहेजने में विफल।" : "⚠️ Failed to persist generated itinerary on server.");
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        setGlobalError(`✈️ Trip generator error: ${errData.error || 'Validation failed'}`);
      }
    } catch (e) {
      console.error(e);
      setGlobalError(language === 'hi' ? "✈️ यात्रा योजना सेवा ऑफ़लाइन है। कृपया पुनः प्रयास करें।" : "✈️ Trip planning service offline. Please try again.");
    } finally {
      setItineraryLoading(false);
    }
  };

  const handleAddBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBookingData.title || !newBookingData.cost) return;
    setGlobalError(null);
    try {
      const res = await safeFetch('/api/data/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newBookingData,
          cost: Number(newBookingData.cost)
        })
      });
      if (res.ok) {
        setNewBookingData({ title: '', type: 'hotel', cost: '', details: '', date: '' });
        await fetchDatabase();
        setGlobalBanner("🏨 NEW BOOKING ADDED TO SAFE PORTAL.");
      } else {
        const errData = await res.json().catch(() => ({}));
        setGlobalError(`🏨 Booking failed: ${errData.error || 'Server rejected request'}`);
      }
    } catch (e) {
      console.error(e);
      setGlobalError("🏨 Booking database synchronization failed.");
    }
  };

  const markNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const activeTrip = trips.find(t => t.id === selectedTripId) || trips[0];
  const totalExpenses = activeTrip ? activeTrip.expenses.reduce((sum, e) => sum + e.amount, 0) : 0;

  const renderAuthGuard = () => {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 w-full" id="auth-guard-container">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-8 shadow-xl space-y-6 text-slate-850 dark:text-slate-100"
        >
          <div className="text-center space-y-2">
            <div className="mx-auto h-12 w-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-400 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
              <FolderLock className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white">
              {authMode === 'login' ? 'Secure Account Sign In' : 'Create Secure Profile'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
              Access the next-generation SafeTour AI Smart Dashboard, interactive maps, predictive safety metrics, and emergency response portals.
            </p>
          </div>

          {authError && (
            <div className="bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-300 text-xs font-semibold p-3.5 rounded-xl flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={authMode === 'login' ? handleLogin : handleSignup} className="space-y-4">
            {authMode === 'signup' && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Full Name</label>
                <input
                  type="text"
                  required
                  value={authName}
                  onChange={(e) => setAuthName(e.target.value)}
                  placeholder="e.g. Harsh Kumar"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm text-slate-800 dark:text-slate-100 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-colors"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Email Address</label>
              <input
                type="email"
                required
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                placeholder="e.g. tourist@safetour.com"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm text-slate-800 dark:text-slate-100 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Password</label>
              <input
                type="password"
                required
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm text-slate-800 dark:text-slate-100 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold py-3 text-sm shadow hover:shadow-blue-500/20 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-1.5"
            >
              {authLoading ? (
                <div className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <span>{authMode === 'login' ? 'Sign In' : 'Register Profile'}</span>
              )}
            </button>
          </form>

          {/* Seed credentials indicator */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-2.5">
            <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-center">
              Testing Seed Credentials (Password: password123)
            </div>
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div 
                className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 p-2 rounded-lg text-center cursor-pointer hover:border-blue-500 transition-colors"
                onClick={() => { setAuthEmail('tourist@safetour.com'); setAuthPassword('password123'); setAuthMode('login'); }}
              >
                <div className="font-bold text-slate-700 dark:text-slate-200">Tourist Role</div>
                <div className="text-slate-500 dark:text-slate-400 font-mono">tourist@safetour.com</div>
              </div>
              <div 
                className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 p-2 rounded-lg text-center cursor-pointer hover:border-blue-500 transition-colors"
                onClick={() => { setAuthEmail('gov@safetour.com'); setAuthPassword('password123'); setAuthMode('login'); }}
              >
                <div className="font-bold text-slate-700 dark:text-slate-200">Government Role</div>
                <div className="text-slate-500 dark:text-slate-400 font-mono">gov@safetour.com</div>
              </div>
              <div 
                className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 p-2 rounded-lg text-center cursor-pointer hover:border-blue-500 transition-colors"
                onClick={() => { setAuthEmail('ems@safetour.com'); setAuthPassword('password123'); setAuthMode('login'); }}
              >
                <div className="font-bold text-slate-700 dark:text-slate-200">Emergency Role</div>
                <div className="text-slate-500 dark:text-slate-400 font-mono">ems@safetour.com</div>
              </div>
              <div 
                className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 p-2 rounded-lg text-center cursor-pointer hover:border-blue-500 transition-colors"
                onClick={() => { setAuthEmail('admin@safetour.com'); setAuthPassword('password123'); setAuthMode('login'); }}
              >
                <div className="font-bold text-slate-700 dark:text-slate-200">Admin Role</div>
                <div className="text-slate-500 dark:text-slate-400 font-mono">admin@safetour.com</div>
              </div>
            </div>
          </div>

          <div className="text-center text-xs text-slate-500 dark:text-slate-400 pt-1">
            {authMode === 'login' ? (
              <span>New to SafeTour? <button className="font-bold text-blue-600 dark:text-blue-400 hover:underline" onClick={() => { setAuthMode('signup'); setAuthError(null); }}>Create an account</button></span>
            ) : (
              <span>Already registered? <button className="font-bold text-blue-600 dark:text-blue-400 hover:underline" onClick={() => { setAuthMode('login'); setAuthError(null); }}>Sign In</button></span>
            )}
          </div>
        </motion.div>
      </div>
    );
  };

  return (
    <div className={`min-h-screen font-sans transition-colors duration-500 flex flex-col selection:bg-amber-500 selection:text-slate-950 relative overflow-x-hidden ${
      darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`} id="main-applet-root">
      
      {/* Background Ambient Glowing Orbs */}
      <div className="fixed top-0 left-1/4 -translate-x-1/2 -mt-20 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-1/4 translate-x-1/2 -mb-20 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none -z-10" />
      <div className="fixed top-1/2 right-10 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none -z-10" />

      {/* Dynamic Global Emergency Banner Alert */}
      {globalBanner && (
        <div className="bg-red-600 text-white font-bold text-center text-xs py-2 px-4 shadow-md flex items-center justify-center space-x-2 relative z-50 animate-pulse">
          <AlertCircle className="h-4 w-4 animate-bounce shrink-0" />
          <span className="truncate">{globalBanner}</span>
          <button onClick={() => setGlobalBanner(null)} className="ml-2 hover:opacity-80 font-bold px-1 text-sm">✕</button>
        </div>
      )}

      {/* Global Error Banner */}
      {globalError && (
        <div className="bg-amber-500 text-slate-950 font-bold text-center text-xs py-2 px-4 shadow-md flex items-center justify-center space-x-2 relative z-50">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span className="truncate">{globalError}</span>
          <button onClick={() => setGlobalError(null)} className="ml-2 hover:opacity-80 font-bold px-1 text-sm">✕</button>
        </div>
      )}

      {/* Main SaaS Platform Top Navigation Bar */}
      <Navbar 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab} 
        sosActive={sosActive}
        triggerSOS={triggerSOS}
        notifications={notifications}
        markNotificationsRead={markNotificationsRead}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        language={language}
        setLanguage={setLanguage}
        t={t}
        user={user}
        onLogout={handleLogout}
        onOpenLiveVoice={() => setIsLiveVoiceOpen(true)}
        onSwitchPersona={handleSwitchPersona}
        onOpenDatabaseExplorer={() => setShowDatabaseModal(true)}
      />

      {/* Core Dynamic Screen Content */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8" id="core-content-frame">
        
        {/* Active Tool Header Banner */}
        <ToolTransitionHeader toolId={currentTab} language={language} t={t} darkMode={darkMode} />

        {!token || !user ? (
          currentTab === 'home' ? (
            <AuthLandingPortal
              darkMode={darkMode}
              language={language}
              t={t}
              authMode={authMode}
              setAuthMode={setAuthMode}
              authEmail={authEmail}
              setAuthEmail={setAuthEmail}
              authPassword={authPassword}
              setAuthPassword={setAuthPassword}
              authName={authName}
              setAuthName={setAuthName}
              authError={authError}
              setAuthError={setAuthError}
              authLoading={authLoading}
              handleLogin={handleLogin}
              handleSignup={handleSignup}
              onQuickFill={handleQuickFill}
            />
          ) : (
            renderAuthGuard()
          )
        ) : isDbLoading ? (
          <div className="flex flex-col items-center justify-center py-20 w-full" id="db-loading-spinner">
            <div className="h-10 w-10 border-4 border-blue-500/20 border-t-blue-600 rounded-full animate-spin mb-4" />
            <p className="text-xs text-slate-400 font-mono">Synchronizing secured travel database...</p>
          </div>
        ) : (
          currentTab === 'home' ? (
              <div
                key="home"
                className="space-y-12"
                id="landing-tab-view"
              >
              {/* Premium Luxury Hero Banner */}
              <div className={`relative rounded-3xl overflow-hidden py-16 px-6 sm:px-12 lg:px-20 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-10 border transition-all duration-300 ${
                darkMode
                  ? 'border-indigo-500/30 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/60 text-white glow-indigo'
                  : 'border-slate-200 bg-gradient-to-br from-white via-slate-50 to-indigo-50/60 text-slate-900 shadow-xl'
              }`}>
                {/* Floating ambient radial graphics */}
                <div className="absolute top-0 right-0 -mt-16 -mr-16 w-96 h-96 rounded-full bg-gradient-to-br from-indigo-500/20 via-cyan-500/10 to-transparent blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-80 h-80 rounded-full bg-gradient-to-tr from-amber-500/15 via-emerald-500/10 to-transparent blur-3xl pointer-events-none" />

                <div className="max-w-2xl space-y-6 text-center md:text-left relative z-10">
                  <span className={`inline-flex items-center space-x-2 rounded-full px-4 py-1.5 text-xs font-bold border backdrop-blur-md shadow-sm ${
                    darkMode
                      ? 'border-amber-500/30 bg-amber-500/10 text-amber-300'
                      : 'border-amber-300 bg-amber-50 text-amber-900'
                  }`}>
                    <Cpu className="h-3.5 w-3.5 text-amber-500 animate-spin-slow" />
                    <span>{t('appTagline')}</span>
                  </span>

                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
                    {language === 'hi' ? 'सुरक्षित यात्रा करें' : 'Explore the World'} <br />
                    <span className="bg-gradient-to-r from-amber-400 via-orange-500 to-emerald-400 bg-clip-text text-transparent">
                      {language === 'hi' ? 'एआई सुरक्षा के साथ' : 'Safely with AI'}
                    </span>
                  </h1>

                  <p className={`text-sm sm:text-base leading-relaxed max-w-lg ${
                    darkMode ? 'text-slate-300' : 'text-slate-600'
                  }`}>
                    {language === 'hi' 
                      ? 'नवीनतम एआई-संचालित पर्यटन मंच। वास्तविक समय जीपीएस नेविगेशन, सुरक्षित क्षेत्र सत्यापन, और आपातकालीन बचाव सहायता।'
                      : 'Introducing a predictive AI-enabled travel platform. Verify safety heatmaps, trace secured routes, consult your voice copilot, and travel with real-time emergency responder synchronization.'
                    }
                  </p>
                  
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2">
                    <button 
                      onClick={() => {
                        soundFx.playClick();
                        setCurrentTab('planner');
                      }}
                      className="rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-600 px-7 py-3.5 text-sm font-extrabold text-white shadow-xl shadow-orange-500/25 hover:shadow-orange-500/40 transition-all hover:-translate-y-0.5 active:scale-95"
                    >
                      {t('planTrip')}
                    </button>
                    <button 
                      onClick={() => {
                        soundFx.playClick();
                        setCurrentTab('map');
                      }}
                      className={`rounded-xl border px-6 py-3.5 text-sm font-bold transition-all ${
                        darkMode
                          ? 'border-slate-700 bg-slate-900/80 text-slate-200 hover:bg-slate-800 hover:border-slate-600'
                          : 'border-slate-300 bg-white text-slate-800 hover:bg-slate-100'
                      }`}
                    >
                      {t('map')}
                    </button>
                  </div>
                </div>

                {/* Simulated Floating Device Interactive Mockup UI */}
                <div className={`w-full max-w-sm rounded-2xl border p-5 shadow-2xl relative z-10 transition-all ${
                  darkMode ? 'border-slate-800 bg-slate-950/90 text-white' : 'border-slate-200 bg-white/90 text-slate-900 shadow-xl'
                }`}>
                  <div className="absolute -top-4 -left-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 p-2.5 shadow-lg text-xs font-black">
                    🛡️ SafeZone Check: 9.8/10
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-800/40 pb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="font-mono text-[10px] text-slate-400">COMMAND CONTROL GPS</span>
                      </div>
                      <ShieldCheck className="h-4 w-4 text-emerald-400" />
                    </div>
                    
                    <div className="space-y-2">
                      <div className={`text-xs ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                        {language === 'hi'
                          ? '"जयपुर और वाराणसी के प्रमुख पर्यटन स्थलों का सुरक्षित मार्ग। पर्यटक पुलिस तैनात।"'
                          : '"Route generated from Jaipur Pink City & Varanasi Ghats is clear. Pickpockets avoided. Tourist police active."'
                        }
                      </div>
                      <div className={`rounded-xl p-2 text-[10px] font-mono ${
                        darkMode ? 'bg-slate-900 text-amber-400' : 'bg-slate-100 text-amber-700'
                      }`}>
                        GPS Active: {userCoords.lat.toFixed(4)}° N, {userCoords.lng.toFixed(4)}° E
                      </div>
                    </div>

                    {/* Simple live bar chart */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[9px] text-slate-400">
                        <span>Crowd Density</span>
                        <span>Low (12%)</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-800/40 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-400 rounded-full" style={{ width: '12%' }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dedicated Language Selector Card Section */}
              <div className={`rounded-3xl border p-6 sm:p-8 shadow-md space-y-4 transition-colors ${
                darkMode
                  ? 'border-slate-800 bg-slate-900/90 text-white'
                  : 'border-slate-200 bg-white text-slate-900'
              }`} id="language-selection-section">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-500/20 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <Globe className="h-5 w-5 text-amber-500 animate-spin" style={{ animationDuration: '20s' }} />
                      <h2 className="text-lg font-extrabold">
                        {language === 'hi' ? '🌐 भाषा चुनें / Select App Language' : '🌐 Select Preferred App Language'}
                      </h2>
                      <span className="rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-500 text-[10px] font-extrabold px-2.5 py-0.5">
                        Multilingual
                      </span>
                    </div>
                    <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      {language === 'hi'
                        ? 'अपनी पसंदीदा भाषा चुनें। सभी यात्रा विवरण, एआई योजनाएँ और सुरक्षा अलर्ट तुरंत उसी भाषा में अपडेट होंगे।'
                        : 'Choose your preferred language. All AI itineraries, safety notices, and navigation commands will switch instantly.'
                      }
                    </p>
                  </div>

                  <div className={`text-xs font-bold px-3 py-1.5 rounded-xl border shrink-0 ${
                    darkMode ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}>
                    Active: <span className="text-amber-500 font-extrabold">{LANGUAGES.find(l => l.code === language)?.flag} {LANGUAGES.find(l => l.code === language)?.label}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  {LANGUAGES.map((lang) => {
                    const isSelected = language === lang.code;
                    return (
                      <motion.button
                        key={lang.code}
                        type="button"
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => {
                          soundFx.playClick();
                          setLanguage(lang.code);
                        }}
                        className={`flex items-center justify-between p-4 rounded-2xl border transition-all text-left ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/25 ring-2 ring-blue-400'
                            : 'bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-500/50 hover:bg-blue-50/50 dark:hover:bg-slate-900'
                        }`}
                      >
                        <div className="flex items-center space-x-3.5">
                          <span className="text-3xl">{lang.flag}</span>
                          <div>
                            <div className="font-extrabold text-sm leading-tight">{lang.label}</div>
                            <div className={`text-[11px] font-medium ${isSelected ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'}`}>
                              {lang.code === 'en' ? 'Default English Navigation' : 'हिन्दी अनुवाद और सुरक्षा मार्गदर्शन'}
                            </div>
                          </div>
                        </div>

                        {isSelected ? (
                          <div className="h-7 w-7 rounded-full bg-white text-blue-600 flex items-center justify-center font-bold text-xs shadow-xs">
                            ✓
                          </div>
                        ) : (
                          <div className="h-7 w-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center font-bold text-xs group-hover:bg-blue-100 group-hover:text-blue-600">
                            →
                          </div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Statistics Counters Marquee */}
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {[
                  { value: '14,250+', label: 'Protected Tourists' },
                  { value: '98.9%', label: 'Safe Route Guarantee' },
                  { value: '112 / 911', label: 'Universal Integration' },
                  { value: '< 3 Mins', label: 'Average Emergency Dispatch' }
                ].map((stat, idx) => (
                  <div key={idx} className="rounded-2xl border border-slate-200/50 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 text-center shadow-sm dark:shadow-md">
                    <div className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 sm:text-3xl">{stat.value}</div>
                    <div className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* 3D Bento Grid Feature Highlight Section */}
              <div className="space-y-6">
                <div className="text-center max-w-xl mx-auto space-y-2">
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">Designed with Travel Safety First</h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                    A consolidated travel suite delivering predictive safety algorithms, instant translation engines, digital validation, and smart recommendations.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Card 1 */}
                  <TiltCard
                    darkMode={darkMode}
                    borderGlow="blue"
                    maxTilt={12}
                    scale={1.03}
                    glareOpacity={0.2}
                    className="p-6 space-y-4"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                      <Bot className="h-5 w-5" />
                    </div>
                    <h3 className="text-base font-bold text-slate-800 dark:text-white">AI Safety Companion</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      Consult your multilingual floating AI helper on attractions, laws, scams, or exchange rates via voice commands.
                    </p>
                  </TiltCard>

                  {/* Card 2 */}
                  <TiltCard
                    darkMode={darkMode}
                    borderGlow="cyan"
                    maxTilt={12}
                    scale={1.03}
                    glareOpacity={0.2}
                    className="p-6 space-y-4"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400">
                      <Navigation className="h-5 w-5" />
                    </div>
                    <h3 className="text-base font-bold text-slate-800 dark:text-white">Safe Route Planner</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      Generate optimal paths tailored to avoid crime hotspots, flooded zones, accidents, and rush-hour bottlenecks.
                    </p>
                  </TiltCard>

                  {/* Card 3 */}
                  <TiltCard
                    darkMode={darkMode}
                    borderGlow="rose"
                    maxTilt={12}
                    scale={1.03}
                    glareOpacity={0.2}
                    className="p-6 space-y-4"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
                      <AlertTriangle className="h-5 w-5" />
                    </div>
                    <h3 className="text-base font-bold text-slate-800 dark:text-white">Instant SOS Beacon</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      Transmit live GPS data to municipal first responders, EMS, and loved ones with a single high-priority tap.
                    </p>
                  </TiltCard>
                </div>
              </div>
            </div>
          ) : currentTab === 'authority' || (currentTab === 'dashboard' && user?.role && ['government', 'emergency', 'admin'].includes(user.role)) ? (
            <AuthorityDashboard
              currentUser={user}
              onSwitchPersona={handleSwitchPersona}
              onNavigateToTab={setCurrentTab}
              darkMode={darkMode}
              onOpenDatabaseExplorer={() => setShowDatabaseModal(true)}
            />
          ) : currentTab === 'dashboard' ? (
            <div
              key="dashboard"
              className="space-y-6"
              id="tourist-dashboard-tab-view"
            >
              {/* Evaluator Callout to Authority Incident Command Center */}
              <div className="rounded-2xl border border-blue-500/30 bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-slate-900/50 p-4 backdrop-blur-md flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                      Bharat Safe Tourism • SIH Problem Statement 25002
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30 font-semibold">
                        Authority Desk Available
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      Law Enforcement Command Room with live geofenced radar map, AI anomaly feed, and E-FIR filing.
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowDatabaseModal(true)}
                    className="px-3.5 py-2 rounded-xl bg-cyan-950/70 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-500/40 font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                    title="Inspect Live Persistent JSON Database (data/safetour_db.json)"
                  >
                    <Database className="h-4 w-4 text-cyan-400" />
                    <span>{'{ }'} Raw JSON DB</span>
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  </button>

                  <button
                    onClick={() => setCurrentTab('authority')}
                    className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <span>🚨 Open Police Command Desk</span>
                  </button>
                </div>
              </div>

              {/* Real-Time Geofence Alert Banner (Problem Statement 25002) */}
              {activeGeofenceAlert && (
                <div className={`p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-4 animate-in fade-in slide-in-from-top duration-300 ${
                  activeGeofenceAlert.riskLevel === 'high-risk'
                    ? 'border-rose-500/50 bg-rose-950/40 text-rose-200'
                    : 'border-amber-500/50 bg-amber-950/40 text-amber-200'
                }`}>
                  <div className="flex items-start gap-3">
                    <AlertTriangle className={`h-6 w-6 mt-0.5 shrink-0 ${
                      activeGeofenceAlert.riskLevel === 'high-risk' ? 'text-rose-400 animate-bounce' : 'text-amber-400'
                    }`} />
                    <div className="space-y-0.5">
                      <div className="font-extrabold text-sm flex items-center gap-2">
                        <span>{activeGeofenceAlert.alertTitle || 'Geofence Advisory Alert'}</span>
                        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-black/30">
                          Safety Score: {currentSafetyScore}/100
                        </span>
                      </div>
                      <p className="text-xs opacity-90">{activeGeofenceAlert.alertMessage}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowAdvisoryModal(true)}
                      className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-white transition-all cursor-pointer"
                    >
                      View Police Contacts & Advice
                    </button>
                    <button
                      onClick={triggerSOS}
                      className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white transition-all cursor-pointer shadow-md"
                    >
                      Instant SOS
                    </button>
                  </div>
                </div>
              )}

              {/* Interactive Geofence Zone Simulator & GPS Picker */}
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-cyan-500" />
                    <span className="text-xs font-bold text-slate-800 dark:text-white">
                      Simulate Tourist Location & Geofence (SIH Evaluator Sandbox):
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    Dynamic Safety Score: <b className="text-blue-500">{currentSafetyScore}/100</b> | Lat: {userCoords.lat.toFixed(4)}, Lng: {userCoords.lng.toFixed(4)}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                  {[
                    { name: 'Jaipur Amer Fort', lat: 26.9855, lng: 75.8513, label: '🟢 Amer Fort (Safe)' },
                    { name: 'Jaipur Johari Bazaar', lat: 26.9215, lng: 75.8260, label: '🟡 Johari Bazaar (Tout Risk)' },
                    { name: 'Delhi Connaught Place', lat: 28.6315, lng: 77.2167, label: '🟢 Connaught Pl (Safe)' },
                    { name: 'Delhi Paharganj Outer', lat: 28.6430, lng: 77.2150, label: '🔴 Paharganj (High-Risk)' },
                    { name: 'Agra Taj Ganj Perimeter', lat: 27.1700, lng: 78.0420, label: '🟡 Taj Ganj (Perimeter)' },
                    { name: 'Varanasi Ghat Corridor', lat: 25.3075, lng: 83.0100, label: '🟡 Dashashwamedh' }
                  ].map((loc, idx) => (
                    <button
                      key={idx}
                      onClick={() => updateTouristLocation(loc.lat, loc.lng, loc.name)}
                      className="px-2.5 py-2 rounded-xl text-left border text-[10px] font-bold transition-all hover:scale-[1.02] cursor-pointer bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:border-blue-500"
                    >
                      <div>{loc.label}</div>
                      <div className="text-[9px] text-slate-400 font-normal font-mono mt-0.5">
                        {loc.lat.toFixed(2)}, {loc.lng.toFixed(2)}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white">Tourist Smart Control Dashboard</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Manage bookings, monitor live weather advisories, and access your digital ID.</p>
                </div>
                
                {/* Active Trip Quick Selector */}
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Active Trip:</span>
                  <select 
                    value={selectedTripId}
                    onChange={(e) => setSelectedTripId(e.target.value)}
                    className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none focus:border-blue-500"
                  >
                    {trips.map(t => (
                      <option key={t.id} value={t.id}>{t.destination}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Main Dashboard Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Col 1: 5-Day Outdoor Travel Weather Forecast & Cryptographic ID */}
                <div className="space-y-6">
                  
                  <WeatherForecastWidget
                    userCoords={userCoords}
                    activeTripDestination={activeTrip?.destination}
                    language={language}
                  />

                  {/* Smart Passport Wallet & CRYPTOGRAPHIC DIGITAL ID CARD */}
                  <div className="rounded-2xl border border-slate-700/60 dark:border-slate-800 bg-gradient-to-tr from-slate-900 to-slate-950 p-5 shadow-xl text-white relative overflow-hidden">
                    <div className="absolute -bottom-8 -right-8 h-28 w-28 bg-blue-500/10 rounded-full blur-2xl" />
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                      <span className="text-[10px] font-mono tracking-widest text-slate-400">CRYPTOGRAPHIC DIGITAL ID</span>
                      <ShieldCheck className="h-4.5 w-4.5 text-cyan-400" />
                    </div>

                    <div className="flex items-center gap-3">
                      <img 
                        src={profile.avatarUrl || DEFAULT_AVATAR_SVG} 
                        onError={(e) => { (e.currentTarget as HTMLImageElement).src = DEFAULT_AVATAR_SVG; }}
                        alt="Tourist profile" 
                        className="h-12 w-12 rounded-xl object-cover border border-slate-700 shadow-inner"
                      />
                      <div>
                        <h4 className="text-sm font-bold leading-tight">{profile.name}</h4>
                        <span className="text-[10px] text-slate-400">{profile.nationality || 'Verified'} Passport Holder</span>
                      </div>
                    </div>

                    <div className="mt-4 space-y-1.5 font-mono text-[9px] text-slate-300">
                      <div>Passport: <span className="text-slate-100 font-bold">{profile.passportNumber || 'Not Linked'}</span></div>
                      <div>Medical Allergies: <span className="text-slate-100 font-bold">{profile.medicalConditions || 'None Declared'}</span></div>
                      <div>Digital Pass Hash: <span className="text-cyan-400 font-bold">{profile.qrPassCode || 'PENDING'}</span></div>
                    </div>

                    {/* QR Code & Verification Drawer */}
                    <div className="mt-4 pt-3.5 border-t border-slate-800 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                            <Check className="h-3 w-3" /> SHA-256 VERIFIED
                          </span>
                          <span className="text-[8px] text-slate-500">TAMPER-PROOF LEDGER SIGNATURE</span>
                        </div>
                        <QrCode className="h-7 w-7 text-white" />
                      </div>

                      <button
                        onClick={handleVerifyDigitalId}
                        disabled={isVerifyingDigitalId}
                        className="w-full py-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/40 text-[11px] font-bold text-cyan-300 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
                        {isVerifyingDigitalId ? 'Verifying...' : 'Audit & Verify Cryptographic ID'}
                      </button>
                    </div>
                  </div>

                </div>

                {/* Col 2: Saved Trip Timeline Ledger */}
                <div className="rounded-2xl border border-slate-200/50 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 shadow-sm dark:shadow-md space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                      Trip Timeline Itinerary
                    </h3>
                    <button
                      onClick={() => setCurrentTab('planner')}
                      className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                    >
                      Open Planner →
                    </button>
                  </div>

                  {activeTrip ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-[11px] bg-slate-50 dark:bg-slate-950/70 border border-slate-100 dark:border-slate-800 rounded-xl px-3 py-2">
                        <span className="font-bold text-slate-700 dark:text-slate-200 truncate">{activeTrip.destination}</span>
                        <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold shrink-0">
                          {activeTrip.checklist.filter(c => c.completed).length}/{activeTrip.checklist.length} ready
                        </span>
                      </div>
                      {activeTrip.timeline.slice(0, 4).map((item) => (
                        <div key={item.id} className="relative pl-5 border-l border-slate-200 dark:border-slate-800 pb-2 last:pb-0 last:border-0">
                          <span className="absolute -left-1.5 top-1 h-3 w-3 rounded-full bg-blue-500 border-2 border-white dark:border-slate-900 shadow-sm" />
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="text-blue-600 dark:text-blue-400 font-bold">{item.time}</span>
                            <span className="text-slate-400 dark:text-slate-500 font-bold tabular-nums">${item.cost}</span>
                          </div>
                          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">{item.activity}</h4>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-0.5">📍 {item.location}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-12 text-center space-y-3">
                      <p className="text-xs text-slate-400">No active itinerary generated yet.</p>
                      <button
                        onClick={() => setCurrentTab('planner')}
                        className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer"
                      >
                        Create AI Trip Itinerary
                      </button>
                    </div>
                  )}
                </div>

                {/* Col 3: Safe POIs & Interactive Wallet Ledger */}
                <div className="space-y-6">
                  
                  {/* Digital Wallet Ledger card */}
                  <div className="rounded-2xl border border-slate-200/50 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 shadow-sm dark:shadow-md">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">Safe Travel Budget Wallet</h3>
                    
                    {activeTrip ? (
                      <div className="space-y-4">
                        <div className="flex justify-between items-baseline">
                          <div>
                            <span className="text-2xl font-extrabold text-slate-800 dark:text-white">${totalExpenses}</span>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 ml-1">spent out of ${activeTrip.budget}</span>
                          </div>
                          <span className="rounded bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">Within Limit</span>
                        </div>

                        {/* Progress slider bar */}
                        <div className="space-y-1">
                          <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-600 dark:bg-blue-500 rounded-full" 
                              style={{ width: `${activeTrip.budget > 0 ? Math.min(100, (totalExpenses / activeTrip.budget) * 100) : 0}%` }} 
                            />
                          </div>
                        </div>

                        <div className="space-y-2 text-xs">
                          {activeTrip.expenses.slice(0, 2).map(e => (
                            <div key={e.id} className="flex justify-between text-xs border-b border-slate-50 dark:border-slate-800/80 pb-1.5 last:pb-0">
                              <span className="text-slate-500 dark:text-slate-400">{e.description} ({e.category})</span>
                              <span className="font-bold text-slate-700 dark:text-slate-300">${e.amount}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-6 text-xs text-slate-400">No active wallet tracker.</div>
                    )}
                  </div>

                  {/* Add Custom Booking Form */}
                  <div className="rounded-2xl border border-slate-200/50 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-4 shadow-sm dark:shadow-md">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-white mb-2">Register Safe-Stay Booking</h4>
                    <form onSubmit={handleAddBooking} className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="e.g. Louvre Lodge"
                          required
                          value={newBookingData.title}
                          onChange={(e) => setNewBookingData({ ...newBookingData, title: e.target.value })}
                          className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2 text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
                        />
                        <input
                          type="number"
                          placeholder="Cost ($)"
                          required
                          value={newBookingData.cost}
                          onChange={(e) => setNewBookingData({ ...newBookingData, cost: e.target.value })}
                          className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2 text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="Details (e.g. 24/7 security, breakfast)"
                        value={newBookingData.details}
                        onChange={(e) => setNewBookingData({ ...newBookingData, details: e.target.value })}
                        className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2 text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
                      />
                      <button 
                        type="submit" 
                        className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold py-1.5 text-xs transition-colors"
                      >
                        Add Booking Entry
                      </button>
                    </form>
                  </div>

                </div>

              </div>

              {/* Bookings Overview Ledger list */}
              <div className="rounded-2xl border border-slate-200/50 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 shadow-sm dark:shadow-md space-y-4">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white">Your Monitored Bookings</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {bookings.map(b => (
                    <div key={b.id} className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/60 p-3.5 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="rounded bg-blue-100 dark:bg-blue-950 px-2.5 py-0.5 text-[9px] font-bold text-blue-700 dark:text-blue-300 uppercase">{b.type}</span>
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300">${b.cost}</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-white">{b.title}</h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">{b.details}</p>
                      <div className="flex justify-between items-center text-[9px] border-t border-slate-100 dark:border-slate-800 pt-2 text-slate-400 dark:text-slate-500">
                        <span>Check: {b.date}</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                          <Check className="h-3 w-3" /> Verified Safe Stay
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : currentTab === 'map' ? (
            <div
              key="map"
              className="space-y-4"
              id="map-tab-view"
            >
              <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white">Smart Safe Route Map</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Simulate safely guided paths, verify active crime heatmaps, and discover protected points of interest.</p>
              </div>

              <MapComponent 
                safetyZones={safetyZones} 
                pois={pois} 
                sosActive={sosActive}
                sosCoords={(() => {
                  const openSos = sosRequests.find(s => s.status !== 'Resolved');
                  return openSos ? { lat: openSos.lat, lng: openSos.lng } : userCoords;
                })()}
                userCoords={userCoords}
                focusCoords={mapFocusCoords}
              />
            </div>
          ) : currentTab === 'planner' ? (
            <div key="planner" className="space-y-6" id="planner-tab-view">
              {/* Planner View Mode Switcher Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3.5 shadow-xs">
                <div className="flex items-center space-x-2.5">
                  <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                    <Compass className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                      {language === 'hi' ? 'स्मार्ट यात्रा योजना व तुलना केंद्र' : 'Smart Travel Planning & Comparison Hub'}
                      <span className="text-[10px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                        {trips.length} {language === 'hi' ? 'सहेजी गई यात्राएं' : 'Saved Trips'}
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {language === 'hi' 
                        ? 'नई यात्रा बनाएं या दो सहेजी गई यात्राओं की कुल बजट और सुरक्षा मैट्रिक्स की साथ-साथ तुलना करें।'
                        : 'Plan safe journeys with Gemini AI or compare two saved itineraries side-by-side on budget and safety.'}
                    </p>
                  </div>
                </div>

                {/* Switcher Buttons */}
                <div className="flex items-center bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
                  <button
                    onClick={() => {
                      soundFx.playClick();
                      setPlannerViewMode('single');
                    }}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      plannerViewMode === 'single'
                        ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{language === 'hi' ? '🗓️ यात्रा योजना व समय-सारणी' : 'Itinerary & Timeline'}</span>
                  </button>
                  <button
                    onClick={() => {
                      soundFx.playClick();
                      setPlannerViewMode('compare');
                    }}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      plannerViewMode === 'compare'
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Scale className="h-3.5 w-3.5" />
                    <span>{language === 'hi' ? '⚖️ साइड-बाय-साइड तुलना' : 'Side-by-Side Compare'}</span>
                    <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded-full font-mono font-black">
                      {trips.length}
                    </span>
                  </button>
                </div>
              </div>

              {plannerViewMode === 'compare' ? (
                <TripComparisonView
                  trips={trips}
                  initialTripIdA={compareTripIdA || selectedTripId || (trips[0] ? trips[0].id : '')}
                  initialTripIdB={compareTripIdB || (trips[1] ? trips[1].id : trips[0] ? trips[0].id : '')}
                  language={language}
                  darkMode={darkMode}
                  t={t}
                  onSelectTripToView={(id) => {
                    setSelectedTripId(id);
                    setPlannerViewMode('single');
                  }}
                  onOpenPlannerGenerator={() => setPlannerViewMode('single')}
                  safeFetch={safeFetch}
                />
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column: AI Generator Form */}
                  <div className="lg:col-span-1 space-y-6">
                    
                    <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 shadow-sm dark:shadow-md space-y-4">
                  <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <Bot className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <h3 className="font-sans font-bold text-sm text-slate-800 dark:text-white flex items-center gap-1">
                      Gemini AI Trip Planner
                      <Sparkles className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
                    </h3>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Provide your destination and budget. Gemini will generate a custom itinerary fully aligned with local safety parameters, safe neighborhoods, and budget considerations.
                  </p>

                  <div className="space-y-3 text-xs">
                    <div className="relative">
                      <div className="flex items-center justify-between mb-1">
                        <label className="font-bold text-slate-700 dark:text-slate-300 block">
                          {language === 'hi' ? 'गंतव्य स्थान / शहर / लैंडमार्क' : 'Destination City / Landmark / Region'}
                        </label>
                        <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1">
                          <Compass className="h-3 w-3" /> {language === 'hi' ? 'वैश्विक गूगल मैप्स खोज सक्रिय' : 'Global Maps Search Active'}
                        </span>
                      </div>
                      
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
                        <input
                          type="text"
                          value={itineraryInput.destination}
                          onFocus={() => setShowDestSuggestions(true)}
                          onChange={(e) => {
                            setItineraryInput({ ...itineraryInput, destination: e.target.value });
                            setShowDestSuggestions(true);
                          }}
                          placeholder={language === 'hi' 
                            ? "कोई भी स्थान खोजें (जैसे: पुणे, लोनावला, मनाली, पेरिस, तोक्यो, जयपुर)..." 
                            : "Search any location worldwide (e.g. Pune, Lonavala, Manali, Kyoto, Paris, Tokyo)..."}
                          className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 pl-9 pr-8 py-2.5 outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-100 transition-all shadow-inner"
                        />
                        {itineraryInput.destination && (
                          <button 
                            type="button"
                            onClick={() => {
                              setItineraryInput({ ...itineraryInput, destination: '' });
                              setSelectedResolvedLocation(null);
                              setShowDestSuggestions(true);
                            }}
                            className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-0.5 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-800"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Selected Location Geolocation Chip */}
                      {selectedResolvedLocation && (
                        <div className="mt-1.5 flex items-center justify-between bg-blue-50/80 dark:bg-blue-950/50 border border-blue-200/80 dark:border-blue-800 rounded-xl px-2.5 py-1 text-[10px] text-blue-900 dark:text-blue-200">
                          <div className="flex items-center space-x-1.5 truncate">
                            <span className="font-extrabold text-blue-700 dark:text-blue-300">📍 {selectedResolvedLocation.name}</span>
                            <span className="text-slate-500 dark:text-slate-400 font-medium truncate">({selectedResolvedLocation.formattedAddress})</span>
                          </div>
                          <span className="font-mono text-[9px] font-bold text-blue-800 dark:text-blue-200 bg-white dark:bg-slate-900 px-1.5 py-0.2 rounded border border-blue-200 dark:border-blue-700 flex-shrink-0">
                            {selectedResolvedLocation.lat.toFixed(2)}°, {selectedResolvedLocation.lng.toFixed(2)}°
                          </span>
                        </div>
                      )}

                      {/* Interactive Google Places & Gemini Location Resolution Dropdown */}
                      <AnimatePresence>
                        {showDestSuggestions && (
                          <motion.div
                            initial={{ opacity: 0, y: -8, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -8, scale: 0.98 }}
                            transition={{ duration: 0.25 }}
                            className="absolute left-0 right-0 top-full mt-1.5 z-50 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-3 shadow-2xl max-h-80 overflow-y-auto space-y-2"
                          >
                            <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-slate-800 px-1">
                              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                <Sparkles className="h-3 w-3 text-amber-500 animate-pulse" />
                                {isSearchingPlaces ? (
                                  <span className="text-blue-600 dark:text-blue-400 flex items-center gap-1">
                                    <span className="animate-spin text-xs">⏳</span> {language === 'hi' ? 'वैश्विक स्थानों की खोज की जा रही है...' : 'Searching worldwide locations...'}
                                  </span>
                                ) : (
                                  <span>{language === 'hi' ? `स्थान परिणाम (${placeSearchResults.length})` : `Location Candidates (${placeSearchResults.length})`}</span>
                                )}
                              </span>
                              <button
                                type="button"
                                onClick={() => setShowDestSuggestions(false)}
                                className="text-[10px] font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-2 py-0.5 rounded-md transition-colors"
                              >
                                {language === 'hi' ? 'बंद करें ✕' : 'Close ✕'}
                              </button>
                            </div>

                            {/* Ambiguous Location Notice */}
                            {isAmbiguousPlace && (
                              <div className="bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 rounded-xl p-2 text-[10px] text-amber-900 dark:text-amber-300 font-bold flex items-center gap-1.5">
                                <AlertTriangle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                                <span>{language === 'hi' ? 'कई स्थान इस खोज से मेल खाते हैं। कृपया अपना वांछित स्थान चुनें:' : 'Multiple geographic places match. Please tap your exact target:'}</span>
                              </div>
                            )}

                            {/* Error and Retry State */}
                            {placeSearchError && (
                              <div className="bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-xl p-2.5 text-xs text-rose-800 dark:text-rose-300 space-y-1.5">
                                <div className="font-bold flex items-center gap-1">
                                  <AlertCircle className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
                                  <span>{placeSearchError}</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setPlaceSearchError(null);
                                    setShowDestSuggestions(true);
                                  }}
                                  className="text-[10px] font-bold bg-rose-600 text-white px-2.5 py-1 rounded-lg hover:bg-rose-700 transition-colors shadow-xs"
                                >
                                  🔄 {language === 'hi' ? 'पुनः खोजें' : 'Retry Search'}
                                </button>
                              </div>
                            )}

                            {/* Live Places Search Results */}
                            {placeSearchResults.length > 0 ? (
                              <div className="space-y-1">
                                {placeSearchResults.map((loc, idx) => (
                                  <motion.button
                                    key={loc.placeId || `${loc.name}-${idx}`}
                                    type="button"
                                    whileHover={{ x: 3 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handleSelectResolvedLocation(loc)}
                                    className="w-full text-left p-2 rounded-xl transition-all flex items-start justify-between gap-2 group cursor-pointer hover:border-blue-200 dark:hover:border-blue-800 border border-transparent bg-slate-50/50 dark:bg-slate-950/60 hover:bg-blue-50/50 dark:hover:bg-slate-800"
                                  >
                                    <div className="space-y-0.5 min-w-0">
                                      <div className="flex items-center space-x-1.5 flex-wrap">
                                        <span className="font-bold text-slate-800 dark:text-slate-100 text-xs group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                          📍 {loc.name}
                                        </span>
                                        {loc.type && (
                                          <span className="text-[9px] font-extrabold text-blue-600 dark:text-blue-300 bg-blue-50 dark:bg-blue-950 px-1.5 py-0.2 rounded-md border border-blue-100 dark:border-blue-900">
                                            {loc.type.replace('_', ' ').toUpperCase()}
                                          </span>
                                        )}
                                        {loc.country && (
                                          <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400">
                                            • {loc.country}
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate pl-0.5 font-medium">
                                        {loc.formattedAddress}
                                      </p>
                                      {loc.highlights && (
                                        <p className="text-[9px] text-emerald-700 dark:text-emerald-400 truncate pl-0.5 font-semibold">
                                          ✨ {loc.highlights}
                                        </p>
                                      )}
                                    </div>

                                    <div className="text-right flex-shrink-0 space-y-0.5">
                                      <span className="inline-block text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800">
                                        🛡️ {loc.safetyRating || '98% Safe'}
                                      </span>
                                      <div className="text-[9px] font-mono text-slate-400 dark:text-slate-500">
                                        {loc.lat.toFixed(2)}°, {loc.lng.toFixed(2)}°
                                      </div>
                                    </div>
                                  </motion.button>
                                ))}
                              </div>
                            ) : (
                              /* Pre-indexed Popular Destinations Quick Picker Fallback */
                              !isSearchingPlaces && (
                                <div className="space-y-1.5 pt-1">
                                  <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-1">
                                    {language === 'hi' ? 'लोकप्रिय गंतव्य स्थल' : 'Featured Destinations'}
                                  </div>
                                  <div className="space-y-1">
                                    {filteredSuggestions.slice(0, 6).map((dest) => (
                                      <motion.button
                                        key={dest.city}
                                        type="button"
                                        whileHover={{ x: 3 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => {
                                          soundFx.playClick();
                                          const fallbackResolved: ResolvedLocation = {
                                            name: dest.city,
                                            formattedAddress: `${dest.city}, ${dest.country}`,
                                            placeId: `place_${dest.city.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
                                            lat: 26.9124,
                                            lng: 75.7873,
                                            country: dest.country,
                                            type: 'city',
                                            safetyRating: dest.safety,
                                            highlights: dest.highlights
                                          };
                                          handleSelectResolvedLocation(fallbackResolved);
                                          setItineraryInput({
                                            destination: `${dest.city}, ${dest.country}`,
                                            days: dest.days,
                                            budget: dest.budget,
                                            interests: `Explore ${dest.highlights}`
                                          });
                                        }}
                                        className="w-full text-left p-2 rounded-xl transition-all flex items-start justify-between gap-2 group cursor-pointer border border-transparent hover:border-blue-100 dark:hover:border-blue-900 bg-transparent hover:bg-blue-50/50 dark:hover:bg-slate-800"
                                      >
                                        <div className="space-y-0.5 min-w-0">
                                          <div className="flex items-center space-x-1.5 flex-wrap">
                                            <span className="text-sm">{dest.flag}</span>
                                            <span className="font-bold text-slate-800 dark:text-slate-100 text-xs group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                              {dest.city}, {dest.country}
                                            </span>
                                            <span className="text-[9px] font-bold text-blue-600 dark:text-blue-300 bg-blue-50 dark:bg-blue-950 px-1.5 py-0.2 rounded-md">
                                              {dest.category}
                                            </span>
                                          </div>
                                          <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate pl-0.5">
                                            📍 {dest.highlights}
                                          </p>
                                        </div>

                                        <div className="text-right flex-shrink-0 space-y-0.5">
                                          <span className="inline-block text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800">
                                            🛡️ {dest.safety}
                                          </span>
                                        </div>
                                      </motion.button>
                                    ))}
                                  </div>
                                </div>
                              )
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Duration (Days)</label>
                        <input
                          type="number"
                          value={itineraryInput.days}
                          onChange={(e) => setItineraryInput({ ...itineraryInput, days: e.target.value })}
                          className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2.5 text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Budget ($)</label>
                        <input
                          type="number"
                          value={itineraryInput.budget}
                          onChange={(e) => setItineraryInput({ ...itineraryInput, budget: e.target.value })}
                          className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2.5 text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Interests & Safety Directives</label>
                      <textarea
                        rows={3}
                        value={itineraryInput.interests}
                        onChange={(e) => setItineraryInput({ ...itineraryInput, interests: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2.5 text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 resize-none"
                      />
                    </div>

                    <button
                      onClick={handleGenerateItinerary}
                      disabled={itineraryLoading}
                      className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold py-3 text-xs shadow hover:shadow-md transition-all active:scale-95 disabled:opacity-50"
                    >
                      {itineraryLoading ? (language === 'hi' ? 'एआई यात्रा योजना बन रही है...' : 'Generating AI Itinerary...') : (language === 'hi' ? 'एआई से यात्रा योजना बनाएं' : 'Generate with Gemini AI')}
                    </button>
                  </div>
                </div>

                {/* Google Maps Live Destination Map Frame */}
                <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-4 shadow-sm dark:shadow-md space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-rose-500" />
                      <h4 className="font-bold text-xs text-slate-800 dark:text-white">
                        {language === 'hi' ? 'गूगल मैप्स लाइव गंतव्य मानचित्र' : 'Google Maps Live Destination Map'}
                      </h4>
                    </div>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activeTrip?.destination || itineraryInput.destination || 'Jaipur')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 bg-blue-50 dark:bg-blue-950/60 px-2 py-1 rounded-lg border border-blue-200/80 dark:border-blue-800"
                    >
                      <ExternalLink className="h-3 w-3" />
                      {language === 'hi' ? 'गूगल मैप्स खोलें' : 'Open Google Maps'}
                    </a>
                  </div>
                  <div className="relative h-48 w-full rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-inner bg-slate-100 dark:bg-slate-950">
                    <iframe
                      title="Google Maps Location Preview"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      loading="lazy"
                      allowFullScreen
                      src={`https://maps.google.com/maps?q=${encodeURIComponent(activeTrip?.destination || itineraryInput.destination || 'Jaipur')}&t=&z=12&ie=UTF8&iwloc=&output=embed`}
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 italic leading-snug">
                    {language === 'hi' 
                      ? '🗺️ सेफटूर एआई गूगल मैप्स का उपयोग करके दुनिया के किसी भी शहर या गांव की सटीक स्थिति और रास्ते दिखाता है।'
                      : '🗺️ SafeTour AI uses Google Maps grounding for every city, town, or village across the world.'}
                  </p>
                </div>

              </div>

              {/* Right Column: Interactive Plan Inspector */}
              <div className="lg:col-span-2 space-y-6">
                
                {activeTrip ? (
                  <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 shadow-sm dark:shadow-md space-y-6">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2 flex-wrap">
                          <h3 className="font-sans font-extrabold text-lg text-slate-800 dark:text-white">{activeTrip.destination}</h3>
                          {trips.length > 1 && (
                            <select
                              value={selectedTripId}
                              onChange={(e) => {
                                soundFx.playClick();
                                setSelectedTripId(e.target.value);
                              }}
                              className="text-[11px] font-bold rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-2 py-1 text-slate-700 dark:text-slate-200 outline-none hover:border-blue-300 dark:hover:border-blue-700"
                            >
                              {trips.map(t => (
                                <option key={t.id} value={t.id}>
                                  Switch: {t.destination.split(',')[0]} (${t.budget})
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                        <span className="text-xs text-slate-500 dark:text-slate-400 block">Scheduled: {activeTrip.startDate} to {activeTrip.endDate}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-xs text-slate-400 dark:text-slate-500 block">AI Calculated Budget:</span>
                          <span className="font-extrabold text-blue-600 dark:text-blue-400 text-base">${activeTrip.budget}</span>
                        </div>

                        {/* Direct Compare Trigger Button */}
                        <button
                          type="button"
                          onClick={() => {
                            soundFx.playClick();
                            setCompareTripIdA(activeTrip.id);
                            const otherTrip = trips.find(t => t.id !== activeTrip.id);
                            if (otherTrip) {
                              setCompareTripIdB(otherTrip.id);
                            }
                            setPlannerViewMode('compare');
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-xs hover:shadow transition-all"
                        >
                          <Scale className="h-3.5 w-3.5" />
                          <span>{language === 'hi' ? 'यात्रा तुलना करें' : 'Compare Side-by-Side'}</span>
                        </button>

                        {/* AI Post-Trip Feedback Trigger Button */}
                        <button
                          type="button"
                          onClick={() => {
                            soundFx.playClick();
                            setFeedbackModalTrip(activeTrip);
                          }}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-xs font-extrabold shadow-sm hover:shadow transition-all ring-1 ring-white/20"
                        >
                          <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                          <span>{activeTrip.feedback ? (language === 'hi' ? 'एआई फीडबैक देखें' : 'View AI Feedback') : (language === 'hi' ? 'एआई पोस्ट-ट्रिप फीडबैक' : 'AI Post-Trip Feedback')}</span>
                        </button>
                      </div>
                    </div>

                    {/* AI Post-Trip Feedback Stored Intel Card (If feedback exists) */}
                    {activeTrip.feedback && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-2xl border border-purple-200 dark:border-purple-900/60 bg-gradient-to-br from-purple-50/80 via-indigo-50/40 to-blue-50/80 dark:from-purple-950/40 dark:via-indigo-950/20 dark:to-slate-900/90 p-5 space-y-4 shadow-sm"
                      >
                        <div className="flex items-center justify-between flex-wrap gap-2 border-b border-purple-200/60 dark:border-purple-900/60 pb-3">
                          <div className="flex items-center space-x-2">
                            <span className="p-1.5 rounded-lg bg-purple-600 text-white shadow-xs">
                              <Sparkles className="h-4 w-4" />
                            </span>
                            <div>
                              <h4 className="text-xs font-black uppercase tracking-wider text-purple-900 dark:text-purple-300 flex items-center gap-1.5">
                                <span>AI Post-Trip Verified Feedback & Intelligence</span>
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                                  Saved in DB
                                </span>
                              </h4>
                              <span className="text-[10px] text-slate-500 dark:text-slate-400">
                                Logged on {new Date(activeTrip.feedback.submittedAt).toLocaleDateString()} • Tailoring future neural trip recommendations
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              soundFx.playClick();
                              setFeedbackModalTrip(activeTrip);
                            }}
                            className="text-xs font-bold text-purple-700 dark:text-purple-300 hover:text-purple-900 dark:hover:text-purple-100 underline decoration-purple-400"
                          >
                            Edit Review / Log More Incidents
                          </button>
                        </div>

                        {/* Rating Metrics Chips */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-purple-100 dark:border-purple-900/40 flex items-center justify-between">
                            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Overall Rating</span>
                            <div className="flex items-center space-x-1 text-amber-500 font-extrabold text-xs">
                              <span>⭐ {activeTrip.feedback.overallRating}/5</span>
                            </div>
                          </div>

                          <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-purple-100 dark:border-purple-900/40 flex items-center justify-between">
                            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Safety Level</span>
                            <div className="flex items-center space-x-1 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs">
                              <span>🛡️ {activeTrip.feedback.safetyRating}/5</span>
                            </div>
                          </div>

                          <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-purple-100 dark:border-purple-900/40 flex items-center justify-between">
                            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Budget Accuracy</span>
                            <div className="flex items-center space-x-1 text-blue-600 dark:text-blue-400 font-extrabold text-xs">
                              <span>💵 {activeTrip.feedback.budgetAccuracyRating}/5</span>
                            </div>
                          </div>
                        </div>

                        {/* Summary & Recommendations from AI */}
                        {activeTrip.feedback.aiAnalysis && (
                          <div className="space-y-2 p-3.5 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-purple-200/50 dark:border-purple-900/50 text-xs">
                            <div className="flex items-center gap-1.5 text-purple-900 dark:text-purple-300 font-extrabold text-[11px]">
                              <Bot className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                              <span>Gemini Neural Synthesis:</span>
                            </div>
                            <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                              {activeTrip.feedback.aiAnalysis.aiSummary}
                            </p>

                            {/* Future Recommendations Pill List */}
                            {activeTrip.feedback.aiAnalysis.futureRecommendations && activeTrip.feedback.aiAnalysis.futureRecommendations.length > 0 && (
                              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1">
                                <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider block">
                                  Future Recommendations for You:
                                </span>
                                <div className="space-y-1">
                                  {activeTrip.feedback.aiAnalysis.futureRecommendations.map((rec, i) => (
                                    <div key={i} className="flex items-start gap-1.5 text-[11px] text-slate-600 dark:text-slate-400">
                                      <span className="text-indigo-500 font-bold">•</span>
                                      <span>{rec}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Incident Badges if any occurred */}
                        {activeTrip.feedback.incidents && activeTrip.feedback.incidents.length > 0 && (
                          <div className="space-y-1.5">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-700 dark:text-rose-400 flex items-center gap-1">
                              <AlertCircle className="h-3.5 w-3.5 text-rose-500" />
                              <span>Logged Safety Incidents ({activeTrip.feedback.incidents.length}):</span>
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {activeTrip.feedback.incidents.map((inc) => (
                                <div key={inc.id} className="p-2.5 rounded-lg border border-rose-200/80 dark:border-rose-900/60 bg-rose-50/60 dark:bg-rose-950/40 text-xs space-y-1">
                                  <div className="flex items-center justify-between">
                                    <span className="font-extrabold text-[10px] uppercase text-rose-800 dark:text-rose-300">
                                      {inc.incidentType.replace(/_/g, ' ')}
                                    </span>
                                    <span className="text-[9px] font-black px-1.5 py-0.2 rounded-md bg-rose-200 dark:bg-rose-900 text-rose-900 dark:text-rose-100 uppercase">
                                      {inc.severity}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-slate-700 dark:text-slate-300 line-clamp-2">{inc.description}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}

                    {/* AI Safety Summary Card */}
                    {activeTrip.aiSummary && (
                      <div className="rounded-xl bg-blue-50/50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/60 p-4 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                        <div className="flex items-center gap-1.5 font-bold text-blue-800 dark:text-blue-300 mb-1">
                          <Bot className="h-4 w-4" />
                          <span>AI Safety Advisory Brief</span>
                        </div>
                        <p>{activeTrip.aiSummary}</p>
                      </div>
                    )}

                    {/* Day by Day schedule timeline with images, live coordinates & live distance */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                            <span>Day Schedule • Landmark Images, Live Location & GPS Distance</span>
                          </h4>
                          <p className="text-[11px] text-slate-400 dark:text-slate-500">Showing location photos, ticket details, historical background, and live distance from your current position</p>
                        </div>
                        <span className="text-[10px] font-extrabold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-200/80 dark:border-emerald-800 flex items-center gap-1 shadow-sm">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                          </span>
                          GPS Radar Active
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {activeTrip.timeline.map((time) => (
                          <TripItineraryCard
                            key={time.id}
                            time={time}
                            destination={activeTrip.destination}
                            userCoords={userCoords}
                            language={language}
                            t={t}
                            darkMode={darkMode}
                            onViewMap={(lat, lng, placeName) => {
                              soundFx.playClick();
                              setCurrentTab('map');
                              setGlobalBanner(`📍 Map centered on ${placeName} (${lat.toFixed(4)}°, ${lng.toFixed(4)}°)`);
                            }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Travel Checklist inside trip */}
                    <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-5">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Travel safety checklist</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {activeTrip.checklist.map(item => (
                          <div key={item.id} className="flex items-center space-x-2 bg-slate-50/50 dark:bg-slate-950/60 p-2.5 rounded-xl border border-slate-100/60 dark:border-slate-800/80">
                            <input
                              type="checkbox"
                              checked={item.completed}
                              onChange={async () => {
                                // Toggle complete in database and refresh state
                                const updatedChecklist = activeTrip.checklist.map(c => 
                                  c.id === item.id ? { ...c, completed: !c.completed } : c
                                );
                                await safeFetch(`/api/data/trips/${activeTrip.id}`, {
                                  method: 'PATCH',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ checklist: updatedChecklist })
                                });
                                fetchDatabase();
                              }}
                              className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-blue-600 focus:ring-blue-500 cursor-pointer"
                            />
                            <span className={`text-xs ${item.completed ? 'line-through text-slate-400 dark:text-slate-600' : 'text-slate-700 dark:text-slate-300'}`}>
                              {item.item}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                ) : (
                  <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-12 text-center text-slate-400 shadow-sm flex flex-col items-center justify-center space-y-4">
                    <Compass className="h-12 w-12 text-slate-300 dark:text-slate-700 animate-spin" style={{ animationDuration: '6s' }} />
                    <div>
                      <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">No Custom Itinerary Loaded</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1">Use the Gemini AI tool on the sidebar to create an optimized schedule based on live safe routing parameters.</p>
                    </div>
                  </div>
                )}

              </div>
            </div>
          )}
        </div>
      ) : currentTab === 'recs' ? (
            <div
              key="recs"
              className="space-y-6"
              id="recs-tab-view"
            >
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white">Smart Recommendation Engine</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Discover verified hotels, police booths, medical clinics, safe ATMs, and transit hubs sorted by distance from your GPS.</p>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={poiSearchQuery}
                    onChange={(e) => setPoiSearchQuery(e.target.value)}
                    placeholder="Search safe spots..."
                    className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Category Filter Controls */}
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { id: 'all', label: 'All Verified' },
                  { id: 'police', label: 'Police Kiosks' },
                  { id: 'hospital', label: 'Hospitals' },
                  { id: 'hotel', label: 'Safe Stays' },
                  { id: 'transit', label: 'Transit' },
                  { id: 'atm', label: 'Safe ATMs' },
                  { id: 'restaurant', label: 'Restaurants' },
                  { id: 'charging', label: 'EV Charging' }
                ].map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      soundFx.playClick();
                      setPoiCategoryFilter(cat.id);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                      poiCategoryFilter === cat.id
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-blue-400'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Recommendation Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {pois
                  .filter(poi => {
                    const matchCat = poiCategoryFilter === 'all' || poi.category === poiCategoryFilter;
                    const q = poiSearchQuery.trim().toLowerCase();
                    const matchQuery = !q || poi.name.toLowerCase().includes(q) || poi.details.toLowerCase().includes(q) || poi.category.toLowerCase().includes(q);
                    return matchCat && matchQuery;
                  })
                  .sort((a, b) => {
                    const da = Math.hypot(a.lat - userCoords.lat, a.lng - userCoords.lng);
                    const db = Math.hypot(b.lat - userCoords.lat, b.lng - userCoords.lng);
                    return da - db;
                  })
                  .map((poi) => {
                  let badgeCol = "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300";
                  let icon = "🏨";
                  if (poi.category === 'hospital') { badgeCol = "bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300"; icon = "🏥"; }
                  if (poi.category === 'police') { badgeCol = "bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300"; icon = "🚨"; }
                  if (poi.category === 'transit') { badgeCol = "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300"; icon = "🚇"; }
                  if (poi.category === 'atm') { badgeCol = "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300"; icon = "💵"; }
                  if (poi.category === 'restaurant') { badgeCol = "bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300"; icon = "🍽️"; }
                  if (poi.category === 'charging') { badgeCol = "bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300"; icon = "⚡"; }
                  const liveDist = calculateHaversineKm(userCoords, poi);
                  
                  return (
                    <div key={poi.id} className="rounded-2xl border border-slate-200/50 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 shadow-sm dark:shadow-md hover:shadow-md transition-shadow flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className={`rounded-xl px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${badgeCol}`}>
                            {icon} {poi.category}
                          </span>
                          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 tabular-nums">📍 {liveDist}</span>
                        </div>
                        
                        <h4 className="text-sm font-bold text-slate-800 dark:text-white leading-tight">{poi.name}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{poi.details}</p>
                      </div>

                      <div className="space-y-3">
                        <div className="border-t border-slate-100 dark:border-slate-800 pt-3 flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 tabular-nums">
                          <span>⭐ {poi.rating}</span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">🛡️ Safety: {poi.safetyRating}/10</span>
                          <span>Price: {poi.priceLevel}</span>
                        </div>
                        <button
                          onClick={() => {
                            soundFx.playClick();
                            setMapFocusCoords({ lat: poi.lat, lng: poi.lng });
                            setCurrentTab('map');
                          }}
                          className="w-full py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <MapPin className="h-3.5 w-3.5" />
                          Locate on Safety Radar Map
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : currentTab === 'aura' ? (
            <div
              key="aura"
              className="space-y-6"
              id="aura-tab-view"
            >
              <AuraStealthSentinel 
                darkMode={darkMode} 
                sosActive={sosActive} 
                triggerSOS={triggerSOS}
                language={language}
                t={t}
              />
            </div>
          ) : currentTab === 'offline' ? (
            <div
              key="offline"
              className="space-y-6"
              id="offline-tab-view"
            >
              <OfflineSurvivalSuite 
                userCoords={userCoords}
                darkMode={darkMode}
                t={t}
                language={language}
                trips={trips}
                bookings={bookings}
                safetyZones={safetyZones}
                profile={profile}
                onTriggerSOS={triggerSOS}
              />
            </div>
          ) : currentTab === 'extras' ? (
            <div
              key="extras"
              className="space-y-8"
              id="extras-tab-view"
            >
              {/* Interactive Telemetry, Direct Helplines, Scam Investigator & Off-grid Range Calculator */}
              <InteractiveSafetySuite darkMode={darkMode} t={t} language={language} userCoords={userCoords} />

              <div className="border-t border-slate-200/60 dark:border-slate-800 pt-6">
                <h3 className="text-xl font-extrabold text-slate-800 dark:text-white">Additional Neural Analysis Utilities</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Harness customized Gemini neural analysis for scams, landmark historical telemetry, and lost items recovery.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* 1. AI Scam Detector */}
                <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 shadow-sm dark:shadow-md space-y-4">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2.5">
                    <Shield className="h-4.5 w-4.5 text-blue-600 dark:text-blue-400" />
                    AI Scam Threat Detector
                  </h3>
                  
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Described a suspicious street solicitation, taxi fare, or ticket seller. Gemini will analyze the pattern for known global tourist scams.
                  </p>

                  <textarea
                    rows={3}
                    placeholder="e.g. A taxi driver at CDG exit told me the digital meter was broken and demanded a flat rate of €95 in cash immediately..."
                    value={scamInput}
                    onChange={(e) => setScamInput(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 outline-none focus:border-blue-500 resize-none"
                  />

                  <button
                    onClick={handleScamDetection}
                    disabled={scamLoading || !scamInput.trim()}
                    className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 text-xs disabled:opacity-50 transition-colors"
                  >
                    {scamLoading ? 'Analyzing threat pattern...' : 'Analyze with Gemini'}
                  </button>

                  {scamResult && (
                    <div className="mt-3 p-3.5 rounded-xl border border-rose-100 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/40 space-y-2 text-xs">
                      <div className="flex justify-between items-center border-b border-rose-200 dark:border-rose-900/80 pb-1.5">
                        <span className="font-bold text-rose-800 dark:text-rose-300">{scamResult.verdict}</span>
                        <span className="rounded bg-rose-100 dark:bg-rose-900/80 px-2 py-0.5 text-[10px] font-bold text-rose-800 dark:text-rose-200">{scamResult.scamProbability}% Threat</span>
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-[11px]">{scamResult.analysis}</p>
                      
                      <div className="space-y-1 pt-1.5">
                        <span className="font-bold text-rose-900 dark:text-rose-200 text-[10px] uppercase">Safety Defenses:</span>
                        {scamResult.countermeasures?.map((c: string, idx: number) => (
                          <div key={idx} className="text-[10px] text-slate-600 dark:text-slate-400 flex items-start gap-1 leading-normal">
                            <span className="text-rose-500 mt-0.5">▪</span>
                            <span>{c}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. AI Landmark recognizer */}
                <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 shadow-sm dark:shadow-md space-y-4">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2.5">
                    <Compass className="h-4.5 w-4.5 text-cyan-600 dark:text-cyan-400" />
                    AI Landmark & AR Recognizer
                  </h3>
                  
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Type a global tourist monument or landmark name. Gemini will output certified historical profiles, architects, and direct safety tips.
                  </p>

                  <input
                    type="text"
                    placeholder="e.g. Louvre Palace, Eiffel Tower"
                    value={landmarkInput}
                    onChange={(e) => setLandmarkInput(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 outline-none focus:border-blue-500"
                  />

                  <button
                    onClick={handleLandmarkRecognition}
                    disabled={landmarkLoading || !landmarkInput.trim()}
                    className="w-full rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2.5 text-xs disabled:opacity-50 transition-colors"
                  >
                    {landmarkLoading ? 'Querying historical records...' : 'Query Landmark Telemetry'}
                  </button>

                  {landmarkResult && (
                    <div className="mt-3 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-2 text-xs">
                      <div className="border-b border-slate-100 dark:border-slate-800 pb-1.5 font-bold text-slate-800 dark:text-white text-[13px]">
                        📍 {landmarkResult.name}
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">{landmarkResult.history}</p>
                      
                      <div className="text-[10px] space-y-1 pt-1 border-t border-slate-100 dark:border-slate-800">
                        <div><span className="font-bold text-slate-500 dark:text-slate-400">Architect:</span> <span className="text-slate-700 dark:text-slate-200">{landmarkResult.architect}</span></div>
                        <div><span className="font-bold text-slate-500 dark:text-slate-400">Trivia Fact:</span> <span className="text-slate-700 dark:text-slate-200">{landmarkResult.smartFact}</span></div>
                        <div className="mt-2 p-2 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-100 dark:border-amber-900">
                          <span className="font-bold">⚠️ Safety Tip:</span> {landmarkResult.safetyTip}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. AI Lost & Found Coordination */}
                <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 shadow-sm dark:shadow-md space-y-4">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2.5">
                    <CheckSquare className="h-4.5 w-4.5 text-teal-600 dark:text-teal-400" />
                    Smart Lost & Found Portal
                  </h3>
                  
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Lost a wallet, passport holder, or device? File a digital descriptor ledger to coordinate with regional police stations instantly.
                  </p>

                  <div className="space-y-2 text-xs">
                    <input
                      type="text"
                      placeholder="Item name (e.g. Leather Wallet)"
                      value={lostItemName}
                      onChange={(e) => setLostItemName(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900"
                    />
                    <input
                      type="text"
                      placeholder="Last seen location"
                      value={lostItemLoc}
                      onChange={(e) => setLostItemLoc(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900"
                    />
                    <button
                      onClick={async () => {
                        if (!lostItemName.trim()) return;
                        
                        try {
                          const res = await safeFetch('/api/data/lost-items', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              itemName: lostItemName,
                              lastSeenLocation: lostItemLoc || 'Unknown',
                              description: 'Registered via SafeTour AI interface.',
                              status: 'Lost',
                              contactInfo: profile.emergencyContactPhone || 'Emergency Services'
                            })
                          });
                          if (res.ok) {
                            setLostItemName('');
                            setLostItemLoc('');
                            await fetchDatabase();
                            setGlobalBanner("🎒 LOST ITEM REGISTERED AND FORWARDED TO TOURIST INFRASTRUCTURE COOP.");
                          } else {
                            const errData = await res.json().catch(() => ({}));
                            setGlobalError(`🎒 Lost & found registration error: ${errData.error || 'Server rejected'}`);
                          }
                        } catch (e) {
                          console.error(e);
                          setGlobalError("🎒 Lost & found registration unreachable.");
                        }
                      }}
                      className="w-full rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-bold py-2 text-xs shadow hover:shadow-teal-500/25 transition-all"
                    >
                      File Report
                    </button>
                  </div>

                  {/* Lost items tracker list */}
                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">Active Claims</span>
                    {lostItems.map(item => (
                      <div key={item.id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                        <div>
                          <div className="font-bold text-slate-800 dark:text-slate-200">{item.itemName}</div>
                          <span className="text-[9px] text-slate-400 dark:text-slate-500">📍 {item.lastSeenLocation}</span>
                        </div>
                        <span className="rounded-full bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 text-[9px] font-bold text-amber-700 dark:text-amber-300">{item.status}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          ) : currentTab === 'government' ? (
            <div
              key="government"
              className="space-y-6"
              id="government-tab-view"
            >
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white">Municipal Command & Government Portal</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Monitor live tourist telemetry, track active SOS beacons, and broadcast official public advisories.</p>
                </div>
                <button
                  onClick={() => setCurrentTab('authority')}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer flex items-center gap-1.5"
                >
                  <ShieldCheck className="h-4 w-4" />
                  Open Full Authority Command Desk
                </button>
              </div>

              {/* Live Analytical Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    label: 'Monitored Tourists',
                    value: String(authorityOverviewStats?.totalMonitoredTourists ?? 1),
                    trend: 'Live GPS heartbeat sync',
                    col: 'text-blue-600 dark:text-blue-400'
                  },
                  {
                    label: 'Open SOS Sessions',
                    value: String(sosRequests.filter(s => s.status !== 'Resolved').length),
                    trend: sosRequests.some(s => s.status !== 'Resolved') ? 'Dispatch active' : 'All clear',
                    col: 'text-red-500 dark:text-red-400'
                  },
                  {
                    label: 'Safe Corridors Active',
                    value: String(authorityOverviewStats?.safeCorridorsActive ?? safetyZones.filter(z => z.type === 'safe').length),
                    trend: `${authorityOverviewStats?.highRiskZonesMonitored ?? safetyZones.filter(z => z.type === 'danger').length} high-risk zones flagged`,
                    col: 'text-cyan-600 dark:text-cyan-400'
                  },
                  {
                    label: 'Open E-FIR Cases',
                    value: String(authorityOverviewStats?.openEfir ?? 0),
                    trend: `${authorityOverviewStats?.resolvedCases ?? 0} resolved in ledger`,
                    col: 'text-emerald-600 dark:text-emerald-400'
                  }
                ].map((c, idx) => (
                  <div key={idx} className="rounded-2xl border border-slate-200/50 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 shadow-sm dark:shadow-md space-y-1">
                    <span className="text-slate-400 dark:text-slate-500 font-bold text-[10px] uppercase tracking-wider">{c.label}</span>
                    <div className={`text-2xl font-black tabular-nums ${c.col}`}>{c.value}</div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-semibold">{c.trend}</span>
                  </div>
                ))}
              </div>

              {/* Public Safety Advisory Broadcaster */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 shadow-sm dark:shadow-md space-y-3">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white">Broadcast Tourist Safety Advisory</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    value={advisoryZone}
                    onChange={(e) => setAdvisoryZone(e.target.value)}
                    placeholder="Zone / Corridor (e.g. Jaipur Heritage Zone)"
                    className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-slate-800 dark:text-slate-100"
                  />
                  <input
                    type="text"
                    value={advisoryTitle}
                    onChange={(e) => setAdvisoryTitle(e.target.value)}
                    placeholder="Advisory notice (e.g. Heavy evening rain — carry flashlights)"
                    className="sm:col-span-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-slate-800 dark:text-slate-100"
                  />
                </div>
                <button
                  onClick={() => {
                    if (!advisoryTitle.trim()) return;
                    const msg = `AUTHORITY ADVISORY (${advisoryZone}): ${advisoryTitle.trim()}`;
                    setNotifications(prev => [{ id: 'adv_' + Date.now(), type: 'emergency', message: msg, time: 'Just Now', read: false }, ...prev]);
                    setGlobalBanner(`📢 ${msg}`);
                    setAdvisoryTitle('');
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold cursor-pointer"
                >
                  Publish Advisory to Tourist Alerts
                </button>
              </div>

              {/* Live SOS Alerts Queue */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 shadow-sm dark:shadow-md space-y-4">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white">SOS Beacons & Dispatch Queue ({sosRequests.length})</h3>
                <div className="space-y-3">
                  {sosRequests.map(sos => (
                    <div key={sos.id} className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/60 flex flex-wrap items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-xs text-slate-800 dark:text-white">{sos.touristName}</span>
                          <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                            sos.status === 'Resolved'
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                              : 'bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 animate-pulse'
                          }`}>
                            {sos.status}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">Coordinates: {sos.lat.toFixed(4)}° N, {sos.lng.toFixed(4)}° E</p>
                        <p className="text-[10px] text-cyan-700 dark:text-cyan-400 font-bold">📍 Notes: {sos.trackingNotes || 'Awaiting officer dispatch note'}</p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <select
                          value={sos.status}
                          onChange={async (e) => {
                            await safeFetch(`/api/data/sos/${sos.id}`, {
                              method: 'PATCH',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ status: e.target.value })
                            });
                            fetchDatabase();
                            setGlobalBanner(`🚨 INCIDENT ${sos.id.toUpperCase()} SET TO ${e.target.value.toUpperCase()}`);
                          }}
                          className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2 py-1 text-xs outline-none font-bold text-slate-700 dark:text-slate-200"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Dispatched">Dispatched</option>
                          <option value="On-Route">On-Route</option>
                          <option value="Resolved">Resolved</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : currentTab === 'emergency' ? (
            <div
              key="emergency"
              className="space-y-6"
              id="emergency-tab-view"
            >
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white">Rescue Command Desk (Police, Fire, EMS)</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Coordinated emergency response dashboard for dispatched units, squads, and triage centers.</p>
                </div>
                <button
                  onClick={() => setCurrentTab('map')}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 text-white text-xs font-bold cursor-pointer flex items-center gap-1.5"
                >
                  <MapPin className="h-3.5 w-3.5 text-rose-400" />
                  Track Beacons on Radar Map
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* dispatch card */}
                <div className="lg:col-span-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 shadow-sm dark:shadow-md space-y-4">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white">Rescue Priority Dispatch Log</h3>
                  
                  <div className="space-y-3">
                    {sosRequests.map(sos => (
                      <div key={sos.id} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">Beacon ID: {sos.id}</span>
                          <span className={`px-2.5 py-0.5 rounded text-[9px] font-black ${
                            sos.status === 'Resolved'
                              ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300'
                              : 'bg-red-100 dark:bg-red-950/80 text-red-800 dark:text-red-300'
                          }`}>{sos.status}</span>
                        </div>
                        <div className="text-[11px] text-slate-600 dark:text-slate-400 flex flex-wrap gap-x-4 gap-y-1">
                          <div>Tourist: <span className="font-bold text-slate-800 dark:text-slate-200">{sos.touristName}</span></div>
                          <div>Required: <span className="font-bold text-cyan-600 dark:text-cyan-400">{sos.servicesRequired.join(' & ')}</span></div>
                          <div className="font-mono">GPS: {sos.lat.toFixed(4)}, {sos.lng.toFixed(4)}</div>
                        </div>

                        <div className="text-[10px] text-slate-500 dark:text-slate-400 font-sans italic bg-slate-100/50 dark:bg-slate-900/70 p-2 rounded-lg border border-slate-200/40 dark:border-slate-800">
                          📍 Notes: {sos.trackingNotes || 'No dispatch notes recorded yet.'}
                        </div>

                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Add or edit dispatch notes..."
                            value={sosNotes[sos.id] ?? (sos.trackingNotes || '')}
                            onChange={(e) => setSosNotes({ ...sosNotes, [sos.id]: e.target.value })}
                            onKeyDown={async (e) => {
                              if (e.key === 'Enter') {
                                const typedVal = sosNotes[sos.id] ?? (sos.trackingNotes || '');
                                if (typedVal === sos.trackingNotes) return;
                                
                                const original = sos.trackingNotes || '';
                                let toAppend = typedVal;
                                if (original && typedVal.startsWith(original)) {
                                  toAppend = typedVal.slice(original.length).trim();
                                }
                                
                                const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                const newNotes = original
                                  ? (toAppend ? `${original} | [${timestamp}] ${toAppend}` : original)
                                  : `[${timestamp}] ${toAppend}`;
                                
                                await safeFetch(`/api/data/sos/${sos.id}`, {
                                  method: 'PATCH',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ trackingNotes: newNotes })
                                });
                                setSosNotes({ ...sosNotes, [sos.id]: newNotes });
                                fetchDatabase();
                              }
                            }}
                            className="flex-grow rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1.5 text-xs focus:outline-none text-slate-800 dark:text-slate-200"
                          />
                          <button
                            onClick={async () => {
                              const typedVal = sosNotes[sos.id] ?? (sos.trackingNotes || '');
                              if (typedVal === sos.trackingNotes) return;
                              
                              const original = sos.trackingNotes || '';
                              let toAppend = typedVal;
                              if (original && typedVal.startsWith(original)) {
                                toAppend = typedVal.slice(original.length).trim();
                              }
                              
                              const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                              const newNotes = original
                                ? (toAppend ? `${original} | [${timestamp}] ${toAppend}` : original)
                                : `[${timestamp}] ${toAppend}`;
                              
                              await safeFetch(`/api/data/sos/${sos.id}`, {
                                  method: 'PATCH',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ trackingNotes: newNotes })
                              });
                              setSosNotes({ ...sosNotes, [sos.id]: newNotes });
                              fetchDatabase();
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-3.5 rounded text-[10px] transition-colors cursor-pointer"
                          >
                            Update
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 shadow-sm dark:shadow-md space-y-4">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white">Live Triage Telemetry</h3>
                  <div className="space-y-3 text-xs">
                    <div className="p-3 bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-200 rounded-xl border border-blue-100 dark:border-blue-900">
                      <span className="font-bold text-base block tabular-nums">
                        {sosRequests.filter(s => s.status !== 'Resolved').length} Open Beacons
                      </span>
                      <span>Active SOS & AI anomaly triggers near {userCoords.lat.toFixed(2)}°N, {userCoords.lng.toFixed(2)}°E</span>
                    </div>
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 rounded-xl border border-emerald-100 dark:border-emerald-900">
                      <span className="font-bold text-base block tabular-nums">
                        {sosRequests.filter(s => s.status === 'Resolved').length}/{sosRequests.length} Resolved
                      </span>
                      <span>Verified incident resolution log synced with persistent server store.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : currentTab === 'admin' ? (
            <div
              key="admin"
              className="space-y-6"
              id="admin-tab-view"
            >
              <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white">Admin Control Panel</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Moderate user profiles, update destinations safety indices, and review scam logs.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Moderate Scams card */}
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 shadow-sm dark:shadow-md space-y-3">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white">Reported Tourist Scams</h3>
                  <div className="space-y-2">
                    {scams.map(scam => (
                      <div key={scam.id} className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 text-xs">
                        <div className="flex justify-between items-center font-bold">
                          <span className="text-slate-800 dark:text-white">{scam.title}</span>
                          <span className="text-[9px] uppercase text-rose-600 dark:text-rose-400">{scam.severity} Severity</span>
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">{scam.description}</p>
                        <span className="text-[9px] block text-slate-400 dark:text-slate-500 mt-1">📍 {scam.location}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Profile Editor */}
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 shadow-sm dark:shadow-md space-y-4">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white">Edit Tourist Profile Data</h3>
                  
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block text-slate-500 dark:text-slate-400 font-semibold mb-1">Tourist Name</label>
                      <input
                        type="text"
                        value={profile.name}
                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 dark:text-slate-400 font-semibold mb-1">Passport Number</label>
                      <input
                        type="text"
                        value={profile.passportNumber}
                        onChange={(e) => setProfile({ ...profile, passportNumber: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100"
                      />
                    </div>
                    <button
                      onClick={async () => {
                        await safeFetch('/api/data/profile', {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(profile)
                        });
                        setGlobalBanner("👤 USER PROFILE UPDATED SUCCESSFULLY.");
                      }}
                      className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 transition-colors"
                    >
                      Save Profile Changes
                    </button>
                  </div>
                </div>

              </div>
            </div>
          ) : currentTab === 'guide' ? (
            <div
              key="guide"
              id="guide-tab-view"
            >
              <AppTutorialGuide 
                onNavigateTab={(tab) => {
                  soundFx.playClick();
                  setCurrentTab(tab);
                }} 
                language={language} 
                t={t}
                darkMode={darkMode}
              />
            </div>
          ) : currentTab === 'profile' ? (
            <div
              key="profile"
              className="max-w-2xl mx-auto rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 shadow-xl space-y-6"
              id="profile-tab-view"
            >
              <div className="flex items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
                <img 
                  src={profile.avatarUrl || DEFAULT_AVATAR_SVG} 
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = DEFAULT_AVATAR_SVG; }}
                  alt="Tourist avatar" 
                  className="h-16 w-16 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shadow"
                />
                <div>
                  <h2 className="text-xl font-bold text-slate-800 dark:text-white">{profile.name}</h2>
                  <p className="text-xs text-slate-400 dark:text-slate-500">Digital Tourist ID Code: {profile.qrPassCode || 'PENDING'}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800/60">
                  <label className="text-slate-400 dark:text-slate-500 block font-semibold mb-1">Nationality</label>
                  <input
                    type="text"
                    value={profile.nationality}
                    onChange={(e) => setProfile({ ...profile, nationality: e.target.value })}
                    className="w-full bg-transparent font-bold text-slate-800 dark:text-slate-200 outline-none border-b border-transparent focus:border-blue-500"
                  />
                </div>
                <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800/60">
                  <label className="text-slate-400 dark:text-slate-500 block font-semibold mb-1">Passport / KYC Document</label>
                  <input
                    type="text"
                    value={profile.passportNumber}
                    onChange={(e) => setProfile({ ...profile, passportNumber: e.target.value })}
                    className="w-full bg-transparent font-bold text-slate-800 dark:text-slate-200 outline-none border-b border-transparent focus:border-blue-500"
                  />
                </div>
                <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800/60 space-y-1.5">
                  <label className="text-slate-400 dark:text-slate-500 block font-semibold">Emergency Contact Name & Phone</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={profile.emergencyContactName}
                      onChange={(e) => setProfile({ ...profile, emergencyContactName: e.target.value })}
                      placeholder="Contact Name"
                      className="w-1/2 bg-white dark:bg-slate-900 rounded-lg px-2 py-1 border border-slate-200 dark:border-slate-800 font-bold text-slate-800 dark:text-slate-200"
                    />
                    <input
                      type="text"
                      value={profile.emergencyContactPhone}
                      onChange={(e) => setProfile({ ...profile, emergencyContactPhone: e.target.value })}
                      placeholder="+91..."
                      className="w-1/2 bg-white dark:bg-slate-900 rounded-lg px-2 py-1 border border-slate-200 dark:border-slate-800 font-bold text-slate-800 dark:text-slate-200"
                    />
                  </div>
                </div>
                <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800/60 space-y-1.5">
                  <label className="text-slate-400 dark:text-slate-500 block font-semibold">Medical Records & Blood Type</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={profile.medicalConditions}
                      onChange={(e) => setProfile({ ...profile, medicalConditions: e.target.value })}
                      placeholder="Allergies / Conditions"
                      className="w-2/3 bg-white dark:bg-slate-900 rounded-lg px-2 py-1 border border-slate-200 dark:border-slate-800 font-bold text-rose-700 dark:text-rose-400"
                    />
                    <input
                      type="text"
                      value={profile.bloodType}
                      onChange={(e) => setProfile({ ...profile, bloodType: e.target.value })}
                      placeholder="Blood"
                      className="w-1/3 bg-white dark:bg-slate-900 rounded-lg px-2 py-1 border border-slate-200 dark:border-slate-800 font-bold text-rose-700 dark:text-rose-400"
                    />
                  </div>
                </div>
              </div>

              <button
                disabled={profileSaving}
                onClick={async () => {
                  setProfileSaving(true);
                  try {
                    const res = await safeFetch('/api/data/profile', {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(profile)
                    });
                    if (res.ok) {
                      setGlobalBanner("✅ PROFILE & EMERGENCY CONTACTS SAVED TO PERSISTENT LEDGER.");
                    } else {
                      setGlobalError("⚠️ Failed to update profile.");
                    }
                  } finally {
                    setProfileSaving(false);
                  }
                }}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {profileSaving ? 'Saving...' : 'Save Identity & Emergency Contacts'}
              </button>

              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Tourist Achievements</span>
                <div className="flex flex-wrap gap-2">
                  {profile.achievements.map((a, idx) => (
                    <span key={idx} className="rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 px-3 py-1 text-xs font-bold flex items-center gap-1">
                      🏆 {a}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : null
          )}
      </main>

      {/* Persistent Floating Emergency SOS Button across ALL tabs */}
      <PersistentSOSButton 
        onTriggerSOSModal={() => {}} 
        userCoords={userCoords}
        profile={profile}
        language={language}
        isSosGlobalActive={sosActive}
        onToggleGlobalSOS={() => {
          triggerSOS();
        }}
      />

      {/* Floating AI Travel Companion Widget chatbot with Google Maps & Search Grounding */}
      <ChatWidget 
        messages={chatMessages} 
        sendMessage={handleSendMessage} 
        loading={chatLoading}
        language={language}
        t={t}
        onOpenLiveVoice={() => setIsLiveVoiceOpen(true)}
        userLocation={userCoords}
        currentDestinationName={selectedResolvedLocation?.name || activeTrip?.destination || itineraryInput.destination || 'Jaipur'}
      />

      {/* Real-time Voice Modal powered by gemini-3.1-flash-live-preview (Live API) */}
      <LiveVoiceModal
        isOpen={isLiveVoiceOpen}
        onClose={() => setIsLiveVoiceOpen(false)}
        language={language}
      />

      {/* AI Post-Trip Feedback & Incident Logger Modal */}
      <AnimatePresence>
        {feedbackModalTrip && (
          <PostTripFeedbackModal
            trip={feedbackModalTrip}
            language={language}
            t={t}
            darkMode={darkMode}
            onClose={() => setFeedbackModalTrip(null)}
            onSubmitted={(updatedTrip) => {
              setFeedbackModalTrip(null);
              setGlobalBanner(`✨ AI Post-Trip feedback saved for ${updatedTrip.destination}! Future recommendations updated.`);
              fetchDatabase();
            }}
          />
        )}
      </AnimatePresence>

      {/* Geofence Safety Advisory & Local Police Contacts Modal (SIH 25002) */}
      {showAdvisoryModal && activeGeofenceAlert && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl border border-slate-700 bg-slate-900 text-white shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className={`h-5 w-5 ${
                  activeGeofenceAlert.riskLevel === 'high-risk' ? 'text-rose-400' : 'text-amber-400'
                }`} />
                <h3 className="text-base font-bold">
                  {activeGeofenceAlert.zone?.name || 'Geofence Advisory'}
                </h3>
              </div>
              <button 
                onClick={() => setShowAdvisoryModal(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1">
                <div className="text-slate-400 font-semibold">Active Risk Level:</div>
                <div className="font-extrabold text-sm uppercase tracking-wide flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-md ${
                    activeGeofenceAlert.riskLevel === 'high-risk'
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}>
                    {activeGeofenceAlert.riskLevel.toUpperCase()}
                  </span>
                  <span className="text-slate-400 text-xs">Safety Score: {currentSafetyScore}/100</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/30 text-amber-200 leading-relaxed">
                <p className="font-semibold mb-1">Safety Advisory:</p>
                <p>{activeGeofenceAlert.zone?.advisory || activeGeofenceAlert.alertMessage}</p>
              </div>

              <div className="space-y-1.5">
                <div className="font-bold text-slate-300">Local Verified Police & Emergency Contacts:</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-200">National Emergency</div>
                      <div className="text-slate-400 text-[10px]">Police, Fire, Medical</div>
                    </div>
                    <a href="tel:112" className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1">
                      <PhoneCall className="h-3 w-3" /> 112
                    </a>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-200">Tourist Infoline</div>
                      <div className="text-slate-400 text-[10px]">Ministry of Tourism</div>
                    </div>
                    <a href="tel:1363" className="px-2.5 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold flex items-center gap-1">
                      <PhoneCall className="h-3 w-3" /> 1363
                    </a>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-200">Women Safety Desk</div>
                      <div className="text-slate-400 text-[10px]">24/7 Helpline</div>
                    </div>
                    <a href="tel:1091" className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold flex items-center gap-1">
                      <PhoneCall className="h-3 w-3" /> 1091
                    </a>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-200">Traffic Assistance</div>
                      <div className="text-slate-400 text-[10px]">State Police Patrol</div>
                    </div>
                    <a href="tel:1095" className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center gap-1">
                      <PhoneCall className="h-3 w-3" /> 1095
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowAdvisoryModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
              >
                Acknowledge & Close
              </button>
              <button
                onClick={() => {
                  setShowAdvisoryModal(false);
                  triggerSOS();
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs cursor-pointer flex items-center gap-1.5 shadow-lg shadow-rose-600/30"
              >
                <AlertTriangle className="h-4 w-4" />
                Trigger Instant SOS
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cryptographic Digital ID Audit & Verification Modal (SIH 25002) */}
      {digitalIdModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl border border-slate-700 bg-slate-900 text-white shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-cyan-400" />
                <h3 className="text-base font-bold">Tamper-Proof Digital ID Audit</h3>
              </div>
              <button 
                onClick={() => setDigitalIdModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {isVerifyingDigitalId ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-3">
                <div className="h-8 w-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
                <p className="text-xs text-slate-400">Verifying SHA-256 HMAC cryptographic signature on ledger...</p>
              </div>
            ) : verifyingIdStatus ? (
              <div className="space-y-4">
                <div className={`p-4 rounded-2xl border ${
                  verifyingIdStatus.valid 
                    ? 'border-emerald-500/40 bg-emerald-950/30 text-emerald-200' 
                    : 'border-rose-500/40 bg-rose-950/30 text-rose-200'
                }`}>
                  <div className="flex items-center gap-2 font-bold text-sm">
                    {verifyingIdStatus.valid ? (
                      <>
                        <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                        <span>CRYPTOGRAPHIC SIGNATURE VALIDATED</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-5 w-5 text-rose-400" />
                        <span>TAMPER OR SIGNATURE MISMATCH DETECTED</span>
                      </>
                    )}
                  </div>
                  <p className="text-xs mt-1 opacity-90">{verifyingIdStatus.message}</p>
                </div>

                {verifyingIdStatus.record && (
                  <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 text-xs space-y-2 font-mono">
                    <div className="flex justify-between border-b border-slate-700 pb-1.5">
                      <span className="text-slate-400">Digital ID Hash:</span>
                      <span className="text-cyan-300 font-bold truncate max-w-[220px]">{verifyingIdStatus.record.digitalId}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-700 pb-1.5">
                      <span className="text-slate-400">Tourist Name:</span>
                      <span className="text-white font-bold">{verifyingIdStatus.record.touristName}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-700 pb-1.5">
                      <span className="text-slate-400">KYC Credential:</span>
                      <span className="text-white font-bold">{verifyingIdStatus.record.passportOrAadhaar}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-700 pb-1.5">
                      <span className="text-slate-400">Valid Trip ID:</span>
                      <span className="text-white font-bold">{verifyingIdStatus.record.tripId}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-700 pb-1.5">
                      <span className="text-slate-400">Time-bound Expiry:</span>
                      <span className="text-white font-bold">{new Date(verifyingIdStatus.record.expiresAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Audit Verifications:</span>
                      <span className="text-emerald-400 font-bold">{verifyingIdStatus.record.verifiedCount} audits logged</span>
                    </div>
                  </div>
                )}

                <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/20 text-[11px] text-cyan-200">
                  🛡️ <b>Smart India Hackathon Compliance (Problem 25002)</b>:
                  This tamper-proof digital ID is verified server-side with constant-time cryptographic equality checking, ensuring zero-knowledge privacy for tourist credentials with zero vulnerability to tampering or counterfeit passes.
                </div>
              </div>
            ) : null}

            <div className="pt-2 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setDigitalIdModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
              >
                Close Audit Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-slate-900 py-10 mt-12 text-slate-400" id="global-footer-frame">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1">
            <span className="font-sans text-lg font-bold text-white flex items-center justify-center sm:justify-start gap-1.5">
              <ShieldCheck className="h-5 w-5 text-cyan-400" />
              Bharat Safe Tourism
            </span>
            <p className="text-xs text-slate-400">Certified Smart Tourist Protection & Safety Platform © 2026</p>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs font-semibold">
            <button onClick={() => setCurrentTab('home')} className="hover:text-white transition-colors">Explore</button>
            <button onClick={() => setCurrentTab('planner')} className="hover:text-white transition-colors">AI Planner</button>
            <button onClick={() => setCurrentTab('map')} className="hover:text-white transition-colors">Safety Radar</button>
            <button onClick={() => setCurrentTab('offline')} className="hover:text-white transition-colors">Zero-Net Hub</button>
            <button onClick={() => setCurrentTab('profile')} className="hover:text-white transition-colors">Digital Pass</button>
            <button
              onClick={() => setShowDatabaseModal(true)}
              className="px-2.5 py-1 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-900 font-mono text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Open Live Persistent JSON Database"
            >
              <Database className="h-3.5 w-3.5 text-cyan-400" />
              <span>{'{ }'} Raw JSON DB</span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </button>
          </div>
        </div>
      </footer>

      {/* Live Persistent JSON Database Explorer Modal (data/safetour_db.json) */}
      <DatabaseExplorerModal
        isOpen={showDatabaseModal}
        onClose={() => setShowDatabaseModal(false)}
        darkMode={darkMode}
      />

    </div>
  );
}
