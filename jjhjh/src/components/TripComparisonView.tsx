import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Scale, 
  ArrowRightLeft, 
  DollarSign, 
  ShieldCheck, 
  AlertTriangle, 
  Clock, 
  Sparkles, 
  Bot, 
  MapPin, 
  CheckCircle2, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  ShieldAlert, 
  ExternalLink,
  Zap,
  Building2,
  Navigation,
  Activity,
  Layers,
  Award
} from 'lucide-react';
import { TripItinerary, TripSafetyMetrics } from '../types';
import { soundFx } from '../utils/audio';

interface TripComparisonViewProps {
  trips: TripItinerary[];
  initialTripIdA?: string;
  initialTripIdB?: string;
  language: string;
  darkMode: boolean;
  t: (key: string) => string;
  onSelectTripToView?: (tripId: string) => void;
  onOpenPlannerGenerator?: () => void;
  safeFetch: (url: string, options?: RequestInit) => Promise<Response>;
}

export const TripComparisonView: React.FC<TripComparisonViewProps> = ({
  trips,
  initialTripIdA,
  initialTripIdB,
  language,
  darkMode,
  t,
  onSelectTripToView,
  onOpenPlannerGenerator,
  safeFetch
}) => {
  const isHindi = language === 'hi';

  // Ensure we have at least 2 trips selected
  const [selectedIdA, setSelectedIdA] = useState<string>(
    initialTripIdA || (trips[0] ? trips[0].id : '')
  );
  const [selectedIdB, setSelectedIdB] = useState<string>(
    initialTripIdB || (trips[1] ? trips[1].id : trips[0] ? trips[0].id : '')
  );

  const [comparisonData, setComparisonData] = useState<any | null>(null);
  const [loadingComparison, setLoadingComparison] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'matrix' | 'timeline' | 'aiReport'>('matrix');

  // Find trip objects
  const tripA = trips.find(t => t.id === selectedIdA) || trips[0];
  const tripB = trips.find(t => t.id === selectedIdB) || (trips[1] || trips[0]);

  // If trip IDs change or don't match, auto adjust
  useEffect(() => {
    if (trips.length > 0) {
      if (!selectedIdA || !trips.some(t => t.id === selectedIdA)) {
        setSelectedIdA(trips[0].id);
      }
      if (!selectedIdB || !trips.some(t => t.id === selectedIdB)) {
        setSelectedIdB(trips.length > 1 ? trips[1].id : trips[0].id);
      }
    }
  }, [trips]);

  // Fetch or compute comparison when trips change
  useEffect(() => {
    if (!tripA || !tripB) return;

    let isMounted = true;
    const fetchComparison = async () => {
      setLoadingComparison(true);
      try {
        const res = await safeFetch('/api/gemini/compare-trips', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tripA,
            tripB,
            language
          })
        });
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setComparisonData(data);
          }
        }
      } catch (err) {
        console.error('Failed to fetch trip comparison:', err);
      } finally {
        if (isMounted) {
          setLoadingComparison(false);
        }
      }
    };

    fetchComparison();

    return () => {
      isMounted = false;
    };
  }, [tripA?.id, tripB?.id, language]);

  const handleSwap = () => {
    soundFx.playClick();
    const temp = selectedIdA;
    setSelectedIdA(selectedIdB);
    setSelectedIdB(temp);
  };

  if (!tripA || !tripB || trips.length === 0) {
    return (
      <div className="rounded-3xl border border-slate-200/80 bg-white dark:bg-slate-900 p-12 text-center shadow-sm space-y-4">
        <Scale className="h-12 w-12 text-blue-500 mx-auto animate-bounce" />
        <h3 className="text-base font-bold text-slate-800 dark:text-white">
          {isHindi ? 'तुलना के लिए कोई सहेजी गई यात्रा उपलब्ध नहीं है' : 'No Saved Itineraries Available to Compare'}
        </h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          {isHindi 
            ? 'तुलना करने के लिए कृपया कम से कम 2 यात्रा योजनाएं बनाएं।'
            : 'Generate at least two travel itineraries with the Gemini AI Planner to perform real-time side-by-side budget & safety comparisons.'}
        </p>
        {onOpenPlannerGenerator && (
          <button
            onClick={onOpenPlannerGenerator}
            className="rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow hover:bg-blue-700 transition-all"
          >
            {isHindi ? '➕ नई यात्रा योजना बनाएं' : '➕ Generate New Itinerary'}
          </button>
        )}
      </div>
    );
  }

  // Calculate local fallbacks for deltas
  const startA = new Date(tripA.startDate || Date.now()).getTime();
  const endA = new Date(tripA.endDate || Date.now() + 86400000 * 3).getTime();
  const daysA = Math.max(1, Math.round((endA - startA) / (1000 * 60 * 60 * 24)));

  const startB = new Date(tripB.startDate || Date.now()).getTime();
  const endB = new Date(tripB.endDate || Date.now() + 86400000 * 3).getTime();
  const daysB = Math.max(1, Math.round((endB - startB) / (1000 * 60 * 60 * 24)));

  const budgetA = tripA.budget || 1000;
  const budgetB = tripB.budget || 1000;
  const dailyA = Math.round(budgetA / daysA);
  const dailyB = Math.round(budgetB / daysB);

  const budgetDiff = budgetB - budgetA;
  const budgetPercent = budgetA > 0 ? Math.round(((budgetB - budgetA) / budgetA) * 100) : 0;

  const metricsA: TripSafetyMetrics = comparisonData?.metricsA || tripA.safetyMetrics || {
    overallScore: tripA.safetyScore || 90,
    safetyTier: 'High Protection',
    crimeRiskIndex: 'Low',
    nightSafetyScore: 8.4,
    emergencyResponseMins: 4.8,
    scamAlertLevel: 'Low',
    crowdRisk: 'Moderate',
    certifiedCheckpointsCount: 20,
    healthSanitationScore: 9.2
  };

  const metricsB: TripSafetyMetrics = comparisonData?.metricsB || tripB.safetyMetrics || {
    overallScore: tripB.safetyScore || 95,
    safetyTier: 'Ultra-Safe',
    crimeRiskIndex: 'Minimal',
    nightSafetyScore: 9.4,
    emergencyResponseMins: 3.5,
    scamAlertLevel: 'Low',
    crowdRisk: 'Low',
    certifiedCheckpointsCount: 30,
    healthSanitationScore: 9.8
  };

  const safetyScoreDiff = metricsB.overallScore - metricsA.overallScore;

  const totalExpensesA = (tripA.expenses || []).reduce((sum, e) => sum + e.amount, 0);
  const totalExpensesB = (tripB.expenses || []).reduce((sum, e) => sum + e.amount, 0);

  const checklistDoneA = (tripA.checklist || []).filter(c => c.completed).length;
  const checklistTotalA = (tripA.checklist || []).length || 1;
  const checklistPctA = Math.round((checklistDoneA / checklistTotalA) * 100);

  const checklistDoneB = (tripB.checklist || []).filter(c => c.completed).length;
  const checklistTotalB = (tripB.checklist || []).length || 1;
  const checklistPctB = Math.round((checklistDoneB / checklistTotalB) * 100);

  return (
    <div className="space-y-6" id="side-by-side-trip-comparison-root">
      
      {/* Top Header & Trip Selector Bar */}
      <div className={`rounded-3xl border p-6 shadow-sm transition-all ${
        darkMode ? 'border-slate-800 bg-slate-900/90 text-white' : 'border-slate-200/80 bg-white text-slate-900'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-5 border-slate-100 dark:border-slate-800">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="h-9 w-9 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                <Scale className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-black tracking-tight">
                {isHindi ? 'यात्रा योजना तुलना (साइड-बाय-साइड)' : 'Side-by-Side Itinerary Comparison'}
              </h2>
              <span className="rounded-full bg-blue-50 dark:bg-blue-900/40 border border-blue-200/80 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-[10px] font-extrabold px-2.5 py-0.5">
                {trips.length} {isHindi ? 'सहेजी गई यात्राएं' : 'Saved Itineraries'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isHindi 
                ? 'दो यात्रा योजनाओं के कुल बजट, दैनिक व्यय, सुरक्षा स्कोर और आपातकालीन प्रतिक्रिया समय की तुलना करें।'
                : 'Directly analyze budget variance, daily spend velocity, crime risks, and emergency response readiness across saved trips.'}
            </p>
          </div>

          {/* Preset comparison quick switcher */}
          <div className="flex items-center gap-2 flex-wrap">
            {trips.slice(0, 3).map((t, idx) => (
              <button
                key={t.id}
                onClick={() => {
                  soundFx.playClick();
                  if (idx === 0) {
                    setSelectedIdA(t.id);
                  } else {
                    setSelectedIdB(t.id);
                  }
                }}
                className={`text-[10px] font-bold px-3 py-1.5 rounded-xl border transition-all truncate max-w-[140px] ${
                  selectedIdA === t.id
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : selectedIdB === t.id
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-400'
                }`}
              >
                {selectedIdA === t.id ? 'Trip A: ' : selectedIdB === t.id ? 'Trip B: ' : ''}{t.destination.split(',')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Dual Trip Pickers with Swap Action */}
        <div className="grid grid-cols-1 md:grid-cols-11 gap-3 items-center pt-5">
          
          {/* Trip A Picker Card */}
          <div className="md:col-span-5 rounded-2xl border border-blue-200/80 bg-blue-50/40 dark:bg-blue-950/30 dark:border-blue-900/60 p-4 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-extrabold uppercase tracking-wider text-blue-700 dark:text-blue-400">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
                {isHindi ? 'प्राथमिक यात्रा (ट्रिप A)' : 'Primary Itinerary (Trip A)'}
              </span>
              <span className="bg-white dark:bg-slate-900 px-2 py-0.5 rounded-md border border-blue-200 text-blue-600 font-mono">
                ${tripA.budget}
              </span>
            </div>
            
            <select
              value={selectedIdA}
              onChange={(e) => {
                soundFx.playClick();
                setSelectedIdA(e.target.value);
              }}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-xs font-bold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 shadow-inner"
            >
              {trips.map(t => (
                <option key={t.id} value={t.id}>
                  📍 {t.destination} (${t.budget} • {t.startDate})
                </option>
              ))}
            </select>
          </div>

          {/* Swap Button */}
          <div className="md:col-span-1 flex justify-center">
            <motion.button
              type="button"
              whileHover={{ scale: 1.15, rotate: 180 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleSwap}
              title="Swap Trip A and Trip B"
              className="h-11 w-11 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/25 hover:shadow-indigo-500/40 transition-shadow"
            >
              <ArrowRightLeft className="h-5 w-5" />
            </motion.button>
          </div>

          {/* Trip B Picker Card */}
          <div className="md:col-span-5 rounded-2xl border border-indigo-200/80 bg-indigo-50/40 dark:bg-indigo-950/30 dark:border-indigo-900/60 p-4 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-extrabold uppercase tracking-wider text-indigo-700 dark:text-indigo-400">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
                {isHindi ? 'तुलनात्मक यात्रा (ट्रिप B)' : 'Comparative Itinerary (Trip B)'}
              </span>
              <span className="bg-white dark:bg-slate-900 px-2 py-0.5 rounded-md border border-indigo-200 text-indigo-600 font-mono">
                ${tripB.budget}
              </span>
            </div>

            <select
              value={selectedIdB}
              onChange={(e) => {
                soundFx.playClick();
                setSelectedIdB(e.target.value);
              }}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-xs font-bold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner"
            >
              {trips.map(t => (
                <option key={t.id} value={t.id}>
                  📍 {t.destination} (${t.budget} • {t.startDate})
                </option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* Primary Key Delta Indicator Highlight Strip */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* 1. Total Budget Delta */}
        <div className={`rounded-2xl border p-5 shadow-sm space-y-3 ${
          darkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-200/80 bg-white'
        }`}>
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span className="flex items-center gap-1.5">
              <DollarSign className="h-4 w-4 text-emerald-500" />
              {isHindi ? 'कुल बजट अंतर' : 'Total Budget Delta'}
            </span>
            <span className="text-[10px] font-mono text-slate-400">USD</span>
          </div>

          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              {budgetDiff >= 0 ? `+$${budgetDiff}` : `-$${Math.abs(budgetDiff)}`}
            </div>
            <span className={`inline-flex items-center gap-0.5 text-xs font-extrabold px-2.5 py-1 rounded-full border ${
              budgetDiff < 0 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300' 
                : budgetDiff > 0
                ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300'
                : 'bg-slate-50 text-slate-700 border-slate-200'
            }`}>
              {budgetDiff < 0 ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
              {budgetPercent > 0 ? `+${budgetPercent}%` : `${budgetPercent}%`}
            </span>
          </div>

          <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
            Trip A: <span className="font-bold text-blue-600">${budgetA}</span> vs Trip B: <span className="font-bold text-indigo-600">${budgetB}</span>
          </div>
        </div>

        {/* 2. Daily Spend Velocity */}
        <div className={`rounded-2xl border p-5 shadow-sm space-y-3 ${
          darkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-200/80 bg-white'
        }`}>
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-blue-500" />
              {isHindi ? 'दैनिक बजट गति' : 'Daily Spend Velocity'}
            </span>
            <span className="text-[10px] text-slate-400">/ Day</span>
          </div>

          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              ${dailyA} <span className="text-xs font-normal text-slate-400">vs</span> ${dailyB}
            </div>
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
              {dailyB - dailyA > 0 ? `+$${dailyB - dailyA}/d` : `-$${Math.abs(dailyB - dailyA)}/d`}
            </span>
          </div>

          <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
            {daysA} {isHindi ? 'दिन' : 'days'} ({tripA.destination.split(',')[0]}) vs {daysB} {isHindi ? 'दिन' : 'days'} ({tripB.destination.split(',')[0]})
          </div>
        </div>

        {/* 3. Overall Safety Index Delta */}
        <div className={`rounded-2xl border p-5 shadow-sm space-y-3 ${
          darkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-200/80 bg-white'
        }`}>
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              {isHindi ? 'सुरक्षा सूचकांक अंतर' : 'Safety Score Delta'}
            </span>
            <span className="text-[10px] text-emerald-600 font-bold">100 Max</span>
          </div>

          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              {metricsA.overallScore}% <span className="text-xs font-normal text-slate-400">vs</span> {metricsB.overallScore}%
            </div>
            <span className={`inline-flex items-center gap-0.5 text-xs font-extrabold px-2.5 py-1 rounded-full border ${
              safetyScoreDiff > 0 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300' 
                : safetyScoreDiff < 0
                ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300'
                : 'bg-blue-50 text-blue-700 border-blue-200'
            }`}>
              {safetyScoreDiff > 0 ? `+${safetyScoreDiff}% B` : safetyScoreDiff < 0 ? `+${Math.abs(safetyScoreDiff)}% A` : 'Equal'}
            </span>
          </div>

          <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
            Tier: <span className="font-bold text-blue-600">{metricsA.safetyTier}</span> vs <span className="font-bold text-indigo-600">{metricsB.safetyTier}</span>
          </div>
        </div>

        {/* 4. Emergency Response Proximity */}
        <div className={`rounded-2xl border p-5 shadow-sm space-y-3 ${
          darkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-200/80 bg-white'
        }`}>
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-cyan-500" />
              {isHindi ? 'आपातकालीन सहायता समय' : 'Emergency Response'}
            </span>
            <span className="text-[10px] text-slate-400">Dispatch</span>
          </div>

          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              {metricsA.emergencyResponseMins}m <span className="text-xs font-normal text-slate-400">vs</span> {metricsB.emergencyResponseMins}m
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md border border-emerald-200/60">
              {metricsB.emergencyResponseMins < metricsA.emergencyResponseMins ? `${(metricsA.emergencyResponseMins - metricsB.emergencyResponseMins).toFixed(1)}m faster B` : `${(metricsB.emergencyResponseMins - metricsA.emergencyResponseMins).toFixed(1)}m faster A`}
            </span>
          </div>

          <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
            Checkpoints: <span className="font-bold text-blue-600">{metricsA.certifiedCheckpointsCount} POIs</span> vs <span className="font-bold text-indigo-600">{metricsB.certifiedCheckpointsCount} POIs</span>
          </div>
        </div>

      </div>

      {/* Sub-Tabs: Matrix Overview vs Day-by-Day vs AI Gemini Assessment */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              soundFx.playClick();
              setActiveSubTab('matrix');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
              activeSubTab === 'matrix'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            {isHindi ? '📊 बजट और सुरक्षा मैट्रिक्स' : '📊 Budget & Safety Matrix'}
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              setActiveSubTab('timeline');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
              activeSubTab === 'timeline'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Calendar className="h-3.5 w-3.5" />
            {isHindi ? '🗓️ दैनिक गतिविधि तुलना' : '🗓️ Side-by-Side Timeline'}
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              setActiveSubTab('aiReport');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
              activeSubTab === 'aiReport'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-orange-500/20'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 animate-pulse" />
            {isHindi ? '🤖 जेमिनी एआई तुलना रिपोर्ट' : '🤖 Gemini AI Synthesis'}
          </button>
        </div>

        {loadingComparison && (
          <span className="text-[10px] text-blue-600 font-bold flex items-center gap-1.5 animate-pulse">
            <span className="h-2 w-2 rounded-full bg-blue-600 animate-ping" />
            {isHindi ? 'विश्लेषण अपडेट हो रहा है...' : 'AI Analyzing Itineraries...'}
          </span>
        )}
      </div>

      {/* Main SubTab Contents */}
      {activeSubTab === 'matrix' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* COLUMN A: Trip A Comprehensive Spec */}
          <div className={`rounded-3xl border p-6 space-y-6 transition-all ${
            darkMode ? 'border-blue-900/60 bg-slate-900/90' : 'border-blue-200/90 bg-white shadow-sm'
          }`}>
            <div className="flex items-start justify-between border-b pb-4 border-slate-100 dark:border-slate-800">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-md border border-blue-200/60">
                  TRIP A • {tripA.destination.split(',')[0]}
                </span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white pt-1">
                  {tripA.destination}
                </h3>
                <p className="text-xs text-slate-500">
                  📅 {tripA.startDate} → {tripA.endDate} ({daysA} {isHindi ? 'दिन' : 'days'})
                </p>
              </div>

              <div className="text-right space-y-1">
                <span className="text-2xl font-black text-blue-600">${tripA.budget}</span>
                <span className="text-[10px] text-slate-400 block">${dailyA}/day planned</span>
              </div>
            </div>

            {/* Safety Score Meter */}
            <div className="space-y-2 rounded-2xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 p-4">
              <div className="flex justify-between items-center text-xs">
                <span className="font-extrabold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  {isHindi ? 'सुरक्षा रेटिंग स्तर' : 'Safety Protection Tier'}
                </span>
                <span className="font-mono font-extrabold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-200 text-xs">
                  {metricsA.overallScore}% ({metricsA.safetyTier})
                </span>
              </div>
              <div className="h-2.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-500" 
                  style={{ width: `${metricsA.overallScore}%` }} 
                />
              </div>
            </div>

            {/* Detailed Metrics Table */}
            <div className="space-y-2 text-xs">
              <div className="font-extrabold text-[10px] uppercase tracking-wider text-slate-400 pb-1">
                {isHindi ? 'सुरक्षा एवं वित्तीय विवरण' : 'Safety & Financial Breakdown'}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-xl border border-slate-100 dark:border-slate-800 p-3 bg-slate-50/60 dark:bg-slate-800/40">
                  <span className="text-[10px] text-slate-400 block">Crime Risk Index</span>
                  <span className="font-extrabold text-slate-800 dark:text-slate-100 mt-0.5 inline-block">
                    🛡️ {metricsA.crimeRiskIndex}
                  </span>
                </div>
                <div className="rounded-xl border border-slate-100 dark:border-slate-800 p-3 bg-slate-50/60 dark:bg-slate-800/40">
                  <span className="text-[10px] text-slate-400 block">Night Safety Rating</span>
                  <span className="font-extrabold text-slate-800 dark:text-slate-100 mt-0.5 inline-block">
                    🌙 {metricsA.nightSafetyScore} / 10
                  </span>
                </div>
                <div className="rounded-xl border border-slate-100 dark:border-slate-800 p-3 bg-slate-50/60 dark:bg-slate-800/40">
                  <span className="text-[10px] text-slate-400 block">Scam & Fraud Alert</span>
                  <span className="font-extrabold text-slate-800 dark:text-slate-100 mt-0.5 inline-block">
                    ⚠️ {metricsA.scamAlertLevel} Risk
                  </span>
                </div>
                <div className="rounded-xl border border-slate-100 dark:border-slate-800 p-3 bg-slate-50/60 dark:bg-slate-800/40">
                  <span className="text-[10px] text-slate-400 block">Safe POIs & Kiosks</span>
                  <span className="font-extrabold text-slate-800 dark:text-slate-100 mt-0.5 inline-block">
                    🏥 {metricsA.certifiedCheckpointsCount} Verified Sites
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <div className="flex justify-between items-center text-[11px] mb-1">
                  <span className="text-slate-500">Expenses Logged:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">${totalExpensesA} / ${tripA.budget}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full" 
                    style={{ width: `${Math.min(100, (totalExpensesA / (tripA.budget || 1)) * 100)}%` }} 
                  />
                </div>
              </div>

              <div className="flex justify-between items-center text-[11px] pt-1">
                <span className="text-slate-500">Safety Checklist Ready:</span>
                <span className="font-bold text-emerald-600">{checklistDoneA}/{checklistTotalA} ({checklistPctA}%)</span>
              </div>
            </div>

            {/* AI Summary note for Trip A */}
            {tripA.aiSummary && (
              <div className="rounded-2xl border border-blue-100 dark:border-blue-900 bg-blue-50/30 dark:bg-blue-950/20 p-3.5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                <div className="font-extrabold text-blue-800 dark:text-blue-300 flex items-center gap-1 mb-1">
                  <Bot className="h-3.5 w-3.5" />
                  <span>Trip A AI Advisory Brief</span>
                </div>
                <p>{tripA.aiSummary}</p>
              </div>
            )}
          </div>

          {/* COLUMN B: Trip B Comprehensive Spec */}
          <div className={`rounded-3xl border p-6 space-y-6 transition-all ${
            darkMode ? 'border-indigo-900/60 bg-slate-900/90' : 'border-indigo-200/90 bg-white shadow-sm'
          }`}>
            <div className="flex items-start justify-between border-b pb-4 border-slate-100 dark:border-slate-800">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-md border border-indigo-200/60">
                  TRIP B • {tripB.destination.split(',')[0]}
                </span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white pt-1">
                  {tripB.destination}
                </h3>
                <p className="text-xs text-slate-500">
                  📅 {tripB.startDate} → {tripB.endDate} ({daysB} {isHindi ? 'दिन' : 'days'})
                </p>
              </div>

              <div className="text-right space-y-1">
                <span className="text-2xl font-black text-indigo-600">${tripB.budget}</span>
                <span className="text-[10px] text-slate-400 block">${dailyB}/day planned</span>
              </div>
            </div>

            {/* Safety Score Meter */}
            <div className="space-y-2 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 p-4">
              <div className="flex justify-between items-center text-xs">
                <span className="font-extrabold text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  {isHindi ? 'सुरक्षा रेटिंग स्तर' : 'Safety Protection Tier'}
                </span>
                <span className="font-mono font-extrabold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-200 text-xs">
                  {metricsB.overallScore}% ({metricsB.safetyTier})
                </span>
              </div>
              <div className="h-2.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-500" 
                  style={{ width: `${metricsB.overallScore}%` }} 
                />
              </div>
            </div>

            {/* Detailed Metrics Table */}
            <div className="space-y-2 text-xs">
              <div className="font-extrabold text-[10px] uppercase tracking-wider text-slate-400 pb-1">
                {isHindi ? 'सुरक्षा एवं वित्तीय विवरण' : 'Safety & Financial Breakdown'}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-xl border border-slate-100 dark:border-slate-800 p-3 bg-slate-50/60 dark:bg-slate-800/40">
                  <span className="text-[10px] text-slate-400 block">Crime Risk Index</span>
                  <span className="font-extrabold text-slate-800 dark:text-slate-100 mt-0.5 inline-block">
                    🛡️ {metricsB.crimeRiskIndex}
                  </span>
                </div>
                <div className="rounded-xl border border-slate-100 dark:border-slate-800 p-3 bg-slate-50/60 dark:bg-slate-800/40">
                  <span className="text-[10px] text-slate-400 block">Night Safety Rating</span>
                  <span className="font-extrabold text-slate-800 dark:text-slate-100 mt-0.5 inline-block">
                    🌙 {metricsB.nightSafetyScore} / 10
                  </span>
                </div>
                <div className="rounded-xl border border-slate-100 dark:border-slate-800 p-3 bg-slate-50/60 dark:bg-slate-800/40">
                  <span className="text-[10px] text-slate-400 block">Scam & Fraud Alert</span>
                  <span className="font-extrabold text-slate-800 dark:text-slate-100 mt-0.5 inline-block">
                    ⚠️ {metricsB.scamAlertLevel} Risk
                  </span>
                </div>
                <div className="rounded-xl border border-slate-100 dark:border-slate-800 p-3 bg-slate-50/60 dark:bg-slate-800/40">
                  <span className="text-[10px] text-slate-400 block">Safe POIs & Kiosks</span>
                  <span className="font-extrabold text-slate-800 dark:text-slate-100 mt-0.5 inline-block">
                    🏥 {metricsB.certifiedCheckpointsCount} Verified Sites
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <div className="flex justify-between items-center text-[11px] mb-1">
                  <span className="text-slate-500">Expenses Logged:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">${totalExpensesB} / ${tripB.budget}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-500 rounded-full" 
                    style={{ width: `${Math.min(100, (totalExpensesB / (tripB.budget || 1)) * 100)}%` }} 
                  />
                </div>
              </div>

              <div className="flex justify-between items-center text-[11px] pt-1">
                <span className="text-slate-500">Safety Checklist Ready:</span>
                <span className="font-bold text-emerald-600">{checklistDoneB}/{checklistTotalB} ({checklistPctB}%)</span>
              </div>
            </div>

            {/* AI Summary note for Trip B */}
            {tripB.aiSummary && (
              <div className="rounded-2xl border border-indigo-100 dark:border-indigo-900 bg-indigo-50/30 dark:bg-indigo-950/20 p-3.5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                <div className="font-extrabold text-indigo-800 dark:text-indigo-300 flex items-center gap-1 mb-1">
                  <Bot className="h-3.5 w-3.5" />
                  <span>Trip B AI Advisory Brief</span>
                </div>
                <p>{tripB.aiSummary}</p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* Day-by-Day Timeline Side-by-Side View */}
      {activeSubTab === 'timeline' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Trip A Timeline */}
          <div className={`rounded-3xl border p-6 space-y-4 ${
            darkMode ? 'border-slate-800 bg-slate-900/90' : 'border-slate-200/80 bg-white shadow-sm'
          }`}>
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <h4 className="text-sm font-black text-blue-600 flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                <span>{tripA.destination.split(',')[0]} Schedule</span>
              </h4>
              <span className="text-xs font-bold text-slate-400">{tripA.timeline.length} Activities</span>
            </div>

            <div className="space-y-3">
              {tripA.timeline.map((item, idx) => (
                <div key={item.id || idx} className="rounded-2xl border border-slate-100 dark:border-slate-800 p-3.5 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/80 px-2 py-0.5 rounded-md">
                      {item.time}
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-200">
                      ${item.cost}
                    </span>
                  </div>
                  <h5 className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                    {item.activity}
                  </h5>
                  <p className="text-[10px] text-slate-500 flex items-center gap-1">
                    📍 {item.location}
                  </p>
                  {item.notes && (
                    <div className="text-[10px] text-emerald-700 dark:text-emerald-300 bg-emerald-50/60 dark:bg-emerald-950/40 p-2 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
                      🛡️ {item.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Trip B Timeline */}
          <div className={`rounded-3xl border p-6 space-y-4 ${
            darkMode ? 'border-slate-800 bg-slate-900/90' : 'border-slate-200/80 bg-white shadow-sm'
          }`}>
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <h4 className="text-sm font-black text-indigo-600 flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                <span>{tripB.destination.split(',')[0]} Schedule</span>
              </h4>
              <span className="text-xs font-bold text-slate-400">{tripB.timeline.length} Activities</span>
            </div>

            <div className="space-y-3">
              {tripB.timeline.map((item, idx) => (
                <div key={item.id || idx} className="rounded-2xl border border-slate-100 dark:border-slate-800 p-3.5 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/80 px-2 py-0.5 rounded-md">
                      {item.time}
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-200">
                      ${item.cost}
                    </span>
                  </div>
                  <h5 className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                    {item.activity}
                  </h5>
                  <p className="text-[10px] text-slate-500 flex items-center gap-1">
                    📍 {item.location}
                  </p>
                  {item.notes && (
                    <div className="text-[10px] text-emerald-700 dark:text-emerald-300 bg-emerald-50/60 dark:bg-emerald-950/40 p-2 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
                      🛡️ {item.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* AI Comparative Report View */}
      {activeSubTab === 'aiReport' && (
        <div className={`rounded-3xl border p-6 space-y-6 ${
          darkMode ? 'border-slate-800 bg-slate-900/90 text-white' : 'border-slate-200/80 bg-white shadow-sm'
        }`}>
          <div className="flex items-center space-x-2.5 border-b pb-4 border-slate-100 dark:border-slate-800">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow">
              <Sparkles className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                {isHindi ? 'जेमिनी एआई तुलनात्मक सुरक्षा व बजट रिपोर्ट' : 'Gemini AI Comparative Safety & Budget Intelligence'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {isHindi ? 'भू-स्थानिक सुरक्षा और बजट अनुकूलन का विश्लेषणात्मक अवलोकन' : 'Deep synthesized assessment across crime indices, expenditure velocity, and traveler profiles'}
              </p>
            </div>
          </div>

          {comparisonData?.aiAnalysis ? (
            <div className="space-y-6">
              
              {/* Executive Summary */}
              <div className="rounded-2xl border border-amber-200/80 bg-amber-50/40 dark:bg-amber-950/20 dark:border-amber-900/50 p-4 text-xs text-slate-800 dark:text-slate-200 leading-relaxed space-y-1">
                <span className="font-black text-amber-800 dark:text-amber-300 uppercase text-[10px] tracking-wider block">
                  {isHindi ? 'कार्यकारी सारांश' : 'Executive Overview'}
                </span>
                <p>{comparisonData.aiAnalysis.overallSummary}</p>
              </div>

              {/* Budget vs Safety Winner Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Budget Winner */}
                <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/30 dark:bg-emerald-950/20 dark:border-emerald-900/50 p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs font-black text-emerald-800 dark:text-emerald-300">
                    <span className="flex items-center gap-1.5">
                      <DollarSign className="h-4 w-4" />
                      {isHindi ? 'किफायती बजट विजेता' : 'Cost Efficiency Winner'}
                    </span>
                    <span className="bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 text-[10px] px-2.5 py-0.5 rounded-full font-bold">
                      {comparisonData.aiAnalysis.budgetWinner === 'tripA' ? tripA.destination.split(',')[0] : tripB.destination.split(',')[0]}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {comparisonData.aiAnalysis.budgetAnalysis}
                  </p>
                </div>

                {/* Safety Winner */}
                <div className="rounded-2xl border border-blue-200/80 bg-blue-50/30 dark:bg-blue-950/20 dark:border-blue-900/50 p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs font-black text-blue-800 dark:text-blue-300">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="h-4 w-4" />
                      {isHindi ? 'उच्चतम सुरक्षा विजेता' : 'Superior Safety Winner'}
                    </span>
                    <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-[10px] px-2.5 py-0.5 rounded-full font-bold">
                      {comparisonData.aiAnalysis.safetyWinner === 'tripA' ? tripA.destination.split(',')[0] : tripB.destination.split(',')[0]}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {comparisonData.aiAnalysis.safetyAnalysis}
                  </p>
                </div>

              </div>

              {/* Traveler Profiles Recommendation */}
              {comparisonData.aiAnalysis.bestForProfiles && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-slate-100 dark:border-slate-800 p-4 bg-slate-50/60 dark:bg-slate-800/40 space-y-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600">
                      Best For {tripA.destination.split(',')[0]}
                    </span>
                    <p className="text-xs text-slate-700 dark:text-slate-200 font-medium">
                      {comparisonData.aiAnalysis.bestForProfiles.tripA}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-100 dark:border-slate-800 p-4 bg-slate-50/60 dark:bg-slate-800/40 space-y-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600">
                      Best For {tripB.destination.split(',')[0]}
                    </span>
                    <p className="text-xs text-slate-700 dark:text-slate-200 font-medium">
                      {comparisonData.aiAnalysis.bestForProfiles.tripB}
                    </p>
                  </div>
                </div>
              )}

              {/* Key Trade-offs List */}
              {comparisonData.aiAnalysis.keyTradeoffs && comparisonData.aiAnalysis.keyTradeoffs.length > 0 && (
                <div className="space-y-2 border-t pt-4 border-slate-100 dark:border-slate-800">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                    {isHindi ? 'मुख्य रणनीतिक अंतर एवं ट्रेड-ऑफ़' : 'Key Strategic Trade-Offs'}
                  </h4>
                  <div className="space-y-1.5">
                    {comparisonData.aiAnalysis.keyTradeoffs.map((item: string, idx: number) => (
                      <div key={idx} className="flex items-start space-x-2 text-xs text-slate-600 dark:text-slate-300">
                        <span className="text-blue-500 font-bold mt-0.5">•</span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actionable Safety Tips */}
              {comparisonData.aiAnalysis.actionableSafetyTips && comparisonData.aiAnalysis.actionableSafetyTips.length > 0 && (
                <div className="space-y-2 border-t pt-4 border-slate-100 dark:border-slate-800">
                  <h4 className="text-xs font-black uppercase tracking-wider text-emerald-600">
                    {isHindi ? 'कार्रवाई योग्य सुरक्षा युक्तियां' : 'Actionable Safety Guidelines'}
                  </h4>
                  <div className="space-y-1.5">
                    {comparisonData.aiAnalysis.actionableSafetyTips.map((tip: string, idx: number) => (
                      <div key={idx} className="flex items-start space-x-2 text-xs text-slate-700 dark:text-slate-200 bg-emerald-50/40 dark:bg-emerald-950/20 p-2 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-400">
              <Bot className="h-8 w-8 mx-auto mb-2 text-slate-300 animate-pulse" />
              Loading comparative analysis from Gemini AI...
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default TripComparisonView;
