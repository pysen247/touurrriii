/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Star, 
  ShieldAlert, 
  ShieldCheck, 
  Plus, 
  Trash2, 
  Send, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Lightbulb, 
  Compass, 
  MessageSquare, 
  ChevronDown, 
  ChevronUp, 
  ThumbsUp, 
  Info,
  Calendar,
  DollarSign
} from 'lucide-react';
import { TripItinerary, TripFeedback, SafetyIncident } from '../types';
import { soundFx } from '../utils/audio';

interface PostTripFeedbackModalProps {
  trip: TripItinerary;
  language?: string;
  t?: (key: string) => string;
  darkMode?: boolean;
  onClose: () => void;
  onSubmitted: (updatedTrip: TripItinerary) => void;
}

export default function PostTripFeedbackModal({
  trip,
  language = 'en',
  t,
  darkMode = false,
  onClose,
  onSubmitted
}: PostTripFeedbackModalProps) {
  const isHindi = language === 'hi';

  const existingFeedback = trip.feedback;

  // Form states
  const [overallRating, setOverallRating] = useState<number>(existingFeedback?.overallRating || 5);
  const [safetyRating, setSafetyRating] = useState<number>(existingFeedback?.safetyRating || 5);
  const [budgetAccuracyRating, setBudgetAccuracyRating] = useState<number>(existingFeedback?.budgetAccuracyRating || 5);
  const [highlightsReview, setHighlightsReview] = useState<string>(existingFeedback?.highlightsReview || '');
  const [safetyAdviceForOthers, setSafetyAdviceForOthers] = useState<string>(existingFeedback?.safetyAdviceForOthers || '');
  
  // Incident logging
  const [incidents, setIncidents] = useState<Partial<SafetyIncident>[]>(
    existingFeedback?.incidents || []
  );

  // New incident temp form
  const [showIncidentForm, setShowIncidentForm] = useState<boolean>(false);
  const [newIncidentType, setNewIncidentType] = useState<SafetyIncident['incidentType']>('theft_or_pickpocket');
  const [newIncidentSeverity, setNewIncidentSeverity] = useState<SafetyIncident['severity']>('medium');
  const [newIncidentLocation, setNewIncidentLocation] = useState<string>('');
  const [newIncidentDesc, setNewIncidentDesc] = useState<string>('');
  const [newIncidentReported, setNewIncidentReported] = useState<boolean>(false);

  // Submission / Loading state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successAnalysis, setSuccessAnalysis] = useState<TripFeedback['aiAnalysis'] | null>(
    existingFeedback?.aiAnalysis || null
  );

  const handleAddIncident = () => {
    if (!newIncidentDesc.trim()) {
      setErrorMessage(isHindi ? 'कृपया घटना का विवरण लिखें।' : 'Please enter a description for the incident.');
      return;
    }
    soundFx.playClick();
    const newInc: Partial<SafetyIncident> = {
      id: `inc_${Date.now()}`,
      tripId: trip.id,
      destination: trip.destination,
      location: newIncidentLocation.trim() || trip.destination,
      incidentType: newIncidentType,
      severity: newIncidentSeverity,
      description: newIncidentDesc.trim(),
      timestamp: new Date().toISOString(),
      reportedToPolice: newIncidentReported
    };

    setIncidents([...incidents, newInc]);
    // Reset temporary form
    setNewIncidentDesc('');
    setNewIncidentLocation('');
    setNewIncidentReported(false);
    setShowIncidentForm(false);
    setErrorMessage(null);
  };

  const handleRemoveIncident = (index: number) => {
    soundFx.playClick();
    setIncidents(incidents.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    soundFx.playClick();
    setIsSubmitting(true);
    setErrorMessage(null);

    const token = localStorage.getItem('safetour_token');

    try {
      const response = await fetch(`/api/data/trips/${trip.id}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          destination: trip.destination,
          budget: trip.budget,
          overallRating,
          safetyRating,
          budgetAccuracyRating,
          highlightsReview,
          safetyAdviceForOthers,
          incidents
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit post-trip feedback');
      }

      soundFx.playClick();
      setSuccessAnalysis(data.feedback.aiAnalysis);
      onSubmitted(data.trip);
    } catch (err: any) {
      console.error('Error submitting feedback:', err);
      setErrorMessage(err.message || 'An error occurred while analyzing and saving your post-trip review.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-3xl my-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden text-slate-800 dark:text-slate-100 max-h-[90vh] flex flex-col"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-white/10 backdrop-blur-md">
              <Sparkles className="h-5 w-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-base font-extrabold leading-tight">
                {isHindi ? 'एआई पोस्ट-ट्रिप फीडबैक एवं सुरक्षा रिपोर्ट' : 'AI Post-Trip Feedback & Safety Intel'}
              </h3>
              <p className="text-xs text-blue-100/90 font-medium">
                {trip.destination} • {trip.startDate} - {trip.endDate}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* If successfully analyzed and already reviewed */}
          {successAnalysis && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/40 space-y-3"
            >
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-extrabold text-xs uppercase tracking-wider">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span>{isHindi ? 'एआई न्यूरल फीडबैक विश्लेषण सहेजा गया' : 'Neural Feedback Analysis Stored in Database'}</span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                {successAnalysis.aiSummary}
              </p>

              {/* Recommended Adjustments */}
              {successAnalysis.recommendedAdjustments && successAnalysis.recommendedAdjustments.length > 0 && (
                <div className="space-y-1 pt-1">
                  <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block">
                    🛡️ {isHindi ? 'भविष्य के यात्रियों के लिए सुरक्षा समायोजन:' : 'Safety Adjustments for Future Visitors:'}
                  </span>
                  <ul className="text-xs space-y-1 pl-4 list-disc text-slate-600 dark:text-slate-400">
                    {successAnalysis.recommendedAdjustments.map((adj, i) => (
                      <li key={i}>{adj}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Future Smart Recommendations */}
              {successAnalysis.futureRecommendations && successAnalysis.futureRecommendations.length > 0 && (
                <div className="space-y-1 pt-1">
                  <span className="text-[11px] font-bold text-blue-700 dark:text-blue-400 block">
                    ✨ {isHindi ? 'आपकी अगली यात्रा हेतु स्मार्ट सिफारिशें:' : 'Smart Recommendations for Your Next Journey:'}
                  </span>
                  <ul className="text-xs space-y-1 pl-4 list-disc text-slate-600 dark:text-slate-400">
                    {successAnalysis.futureRecommendations.map((rec, i) => (
                      <li key={i}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          )}

          {errorMessage && (
            <div className="p-3 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 1. Trip Ratings */}
            <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 p-4 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                <span>{isHindi ? 'यात्रा अनुभव एवं सुरक्षा रेटिंग' : 'Trip Performance & Safety Ratings'}</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Overall Rating */}
                <div className="space-y-1.5 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200/70 dark:border-slate-800">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    {isHindi ? 'समग्र यात्रा संतुष्टि' : 'Overall Satisfaction'}
                  </label>
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => { soundFx.playClick(); setOverallRating(star); }}
                        className="p-1 text-slate-300 hover:text-amber-400 transition-colors"
                      >
                        <Star className={`h-5 w-5 ${star <= overallRating ? 'text-amber-400 fill-amber-400' : 'text-slate-300 dark:text-slate-700'}`} />
                      </button>
                    ))}
                    <span className="text-xs font-extrabold text-amber-500 ml-1.5">{overallRating}/5</span>
                  </div>
                </div>

                {/* Safety Experience Rating */}
                <div className="space-y-1.5 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200/70 dark:border-slate-800">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    {isHindi ? 'सुरक्षा व सतर्कता स्तर' : 'Perceived Safety Level'}
                  </label>
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => { soundFx.playClick(); setSafetyRating(star); }}
                        className="p-1 text-slate-300 hover:text-emerald-500 transition-colors"
                      >
                        <ShieldCheck className={`h-5 w-5 ${star <= safetyRating ? 'text-emerald-500 fill-emerald-500/20' : 'text-slate-300 dark:text-slate-700'}`} />
                      </button>
                    ))}
                    <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 ml-1.5">{safetyRating}/5</span>
                  </div>
                </div>

                {/* Budget Accuracy */}
                <div className="space-y-1.5 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200/70 dark:border-slate-800">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    {isHindi ? 'बजट सटीकता' : 'Budget Accuracy'}
                  </label>
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => { soundFx.playClick(); setBudgetAccuracyRating(star); }}
                        className="p-1 text-slate-300 hover:text-blue-500 transition-colors"
                      >
                        <DollarSign className={`h-5 w-5 ${star <= budgetAccuracyRating ? 'text-blue-500 font-black' : 'text-slate-300 dark:text-slate-700'}`} />
                      </button>
                    ))}
                    <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400 ml-1.5">{budgetAccuracyRating}/5</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Text Reviews */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <ThumbsUp className="h-3.5 w-3.5 text-blue-500" />
                  <span>{isHindi ? 'प्रमुख आकर्षण व सकारात्मक अनुभव' : 'Trip Highlights & Positive Experiences'}</span>
                </label>
                <textarea
                  rows={3}
                  value={highlightsReview}
                  onChange={(e) => setHighlightsReview(e.target.value)}
                  placeholder={isHindi ? 'जैसे: हवा महल का दृश्य अद्भुत था, स्थानीय लोग बहुत मददगार थे...' : 'e.g. Amber Fort morning tour was exceptionally well-organized, clean safe dining along the heritage corridor...'}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 outline-none focus:border-blue-500 transition-all resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
                  <span>{isHindi ? 'अन्य पर्यटकों के लिए सुरक्षा सुझाव' : 'Safety Advice & Tips for Future Tourists'}</span>
                </label>
                <textarea
                  rows={3}
                  value={safetyAdviceForOthers}
                  onChange={(e) => setSafetyAdviceForOthers(e.target.value)}
                  placeholder={isHindi ? 'जैसे: मुख्य बाजार में टैक्सी मीटर चालू करने को कहें, शाम 9 बजे के बाद सुनसान गलियों से बचें...' : 'e.g. Always negotiate taxi fares beforehand or use registered booths; keep phones securely zipped near crowded train terminals...'}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 outline-none focus:border-blue-500 transition-all resize-none"
                />
              </div>
            </div>

            {/* 3. Safety Incidents Log Section */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/40 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <ShieldAlert className="h-4 w-4 text-rose-500" />
                    <span>{isHindi ? 'सुरक्षा घटनाएं एवं विसंगतियां लॉग करें' : 'Log Safety Incidents & Hazard Reports'}</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {isHindi ? 'यदि कोई चोरी, धोखाधड़ी या परेशानी हुई तो दर्ज करें। यह डेटा भविष्य की एआई यात्रा योजनाओं को सुरक्षित बनाता है।' : 'Did you encounter pickpockets, scams, medical emergencies, or suspicious zones? This feeds our neural risk engine.'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    setShowIncidentForm(!showIncidentForm);
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 dark:hover:bg-rose-900 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>{isHindi ? 'घटना जोड़ें' : 'Add Incident'}</span>
                </button>
              </div>

              {/* Logged incidents list */}
              {incidents.length > 0 ? (
                <div className="space-y-2 pt-1">
                  {incidents.map((inc, index) => (
                    <div
                      key={inc.id || index}
                      className="p-3 rounded-xl border border-rose-100 dark:border-rose-900/50 bg-white dark:bg-slate-900 flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-extrabold text-[10px] uppercase px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300">
                            {inc.incidentType?.replace(/_/g, ' ')}
                          </span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${
                            inc.severity === 'critical' ? 'bg-red-600 text-white' :
                            inc.severity === 'high' ? 'bg-orange-500 text-white' :
                            'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                          }`}>
                            {inc.severity?.toUpperCase()} SEVERITY
                          </span>
                          {inc.location && (
                            <span className="text-[11px] text-slate-500 dark:text-slate-400">
                              📍 {inc.location}
                            </span>
                          )}
                          {inc.reportedToPolice && (
                            <span className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950 px-1.5 py-0.2 rounded-md">
                              👮 Reported to Police
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                          {inc.description}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveIncident(index)}
                        className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                        title="Remove"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-[11px] text-slate-400">
                  {isHindi ? 'कोई प्रतिकूल सुरक्षा घटना दर्ज नहीं की गई (यात्रा सुरक्षित रही)' : 'No safety incidents reported for this trip (Safe Journey).'}
                </div>
              )}

              {/* Add Incident Form Drawer */}
              <AnimatePresence>
                {showIncidentForm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 space-y-3 mt-2"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                          {isHindi ? 'घटना का प्रकार' : 'Incident Category'}
                        </label>
                        <select
                          value={newIncidentType}
                          onChange={(e) => setNewIncidentType(e.target.value as any)}
                          className="w-full text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                        >
                          <option value="theft_or_pickpocket">Pickpocket / Theft</option>
                          <option value="scam_overcharging">Scam / Fare Overcharging</option>
                          <option value="harassment">Street Harassment / Unsolicited Touting</option>
                          <option value="medical_or_injury">Medical Emergency / Injury</option>
                          <option value="transit_issue">Transit Delay / Stranded Route</option>
                          <option value="unsafe_neighborhood">Unlit / Hostile Neighborhood</option>
                          <option value="other">Other Safety Concern</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                          {isHindi ? 'गंभीरता स्तर' : 'Severity Level'}
                        </label>
                        <select
                          value={newIncidentSeverity}
                          onChange={(e) => setNewIncidentSeverity(e.target.value as any)}
                          className="w-full text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                        >
                          <option value="low">Low (Minor nuisance, resolved quickly)</option>
                          <option value="medium">Medium (Moderate financial loss or delay)</option>
                          <option value="high">High (Threatening situation / Major theft)</option>
                          <option value="critical">Critical (Physical danger / Police required)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        {isHindi ? 'स्थान / लैंडमार्क' : 'Specific Location / Landmark'}
                      </label>
                      <input
                        type="text"
                        value={newIncidentLocation}
                        onChange={(e) => setNewIncidentLocation(e.target.value)}
                        placeholder="e.g. Metro exit stairs near Central Market, Gate 4"
                        className="w-full text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        {isHindi ? 'घटना का विस्तृत विवरण' : 'Incident Details & Description'}
                      </label>
                      <textarea
                        rows={2}
                        value={newIncidentDesc}
                        onChange={(e) => setNewIncidentDesc(e.target.value)}
                        placeholder="Describe what happened, how it was resolved, or what other tourists should watch out for..."
                        className="w-full text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 resize-none"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="flex items-center space-x-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newIncidentReported}
                          onChange={(e) => setNewIncidentReported(e.target.checked)}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span>{isHindi ? 'स्थानीय पुलिस / हेल्पडेस्क में रिपोर्ट किया गया' : 'Reported to Local Police or Help Desk'}</span>
                      </label>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setShowIncidentForm(false)}
                          className="px-3 py-1.5 rounded-lg text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleAddIncident}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs"
                        >
                          Add to Report
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {isHindi ? 'बंद करें' : 'Close'}
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-extrabold text-xs shadow-md hover:shadow-lg transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Sparkles className="h-4 w-4 animate-spin text-amber-300" />
                    <span>{isHindi ? 'एआई विश्लेषण चल रहा है...' : 'AI Analyzing & Saving to DB...'}</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>{existingFeedback ? (isHindi ? 'फीडबैक अपडेट करें' : 'Update & Re-Analyze Feedback') : (isHindi ? 'एआई पोस्ट-ट्रिप फीडबैक जमा करें' : 'Submit AI Post-Trip Feedback')}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
