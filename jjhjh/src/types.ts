/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface UserProfile {
  name: string;
  email: string;
  nationality: string;
  passportNumber: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactEmail?: string;
  medicalConditions: string;
  bloodType: string;
  preferredLanguages: string[];
  savedTrips: string[];
  achievements: string[];
  avatarUrl?: string;
  qrPassCode?: string;
  digitalIdData?: TamperProofDigitalID;
  lastKnownLocation?: { lat: number; lng: number; timestamp: string; zoneName?: string; riskLevel?: string };
  currentSafetyScore?: number;
}

export interface Booking {
  id: string;
  title: string;
  type: 'hotel' | 'flight' | 'activity' | 'train';
  date: string;
  status: 'Confirmed' | 'Pending' | 'Cancelled';
  details: string;
  cost: number;
}

export interface ItineraryItem {
  id: string;
  time: string;
  activity: string;
  location: string;
  cost: number;
  notes?: string;
  imageUrl?: string;
  placeName?: string;
  priceDetails?: string;
  historyInfo?: string;
  lat?: number;
  lng?: number;
}

export interface ResolvedLocation {
  name: string;
  formattedAddress: string;
  placeId?: string;
  lat: number;
  lng: number;
  country: string;
  stateOrRegion?: string;
  type: 'city' | 'town' | 'village' | 'island' | 'region' | 'state' | 'country' | 'landmark' | 'attraction' | 'hill_station' | 'beach' | 'national_park' | 'geographic_place';
  safetyRating?: string;
  highlights?: string;
  category?: string;
}

export interface TripSafetyMetrics {
  overallScore: number; // 0 - 100
  safetyTier: 'Ultra-Safe' | 'High Protection' | 'Moderate Vigilance' | 'Heightened Caution';
  crimeRiskIndex: 'Minimal' | 'Low' | 'Moderate' | 'High';
  nightSafetyScore: number; // 0 - 10
  emergencyResponseMins: number; // Average dispatch in minutes
  scamAlertLevel: 'Low' | 'Medium' | 'High';
  crowdRisk: 'Low' | 'Moderate' | 'High';
  certifiedCheckpointsCount: number;
  healthSanitationScore: number; // 0 - 10
}

export interface SafetyIncident {
  id: string;
  tripId: string;
  destination: string;
  location?: string;
  incidentType: 'theft_or_pickpocket' | 'harassment' | 'scam_overcharging' | 'medical_or_injury' | 'transit_issue' | 'unsafe_neighborhood' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  timestamp: string;
  reportedToPolice: boolean;
}

export interface TripFeedback {
  id: string;
  tripId: string;
  userId: string;
  destination: string;
  overallRating: number; // 1 - 5
  safetyRating: number; // 1 - 5
  budgetAccuracyRating: number; // 1 - 5
  highlightsReview: string;
  safetyAdviceForOthers: string;
  incidents: SafetyIncident[];
  aiAnalysis?: {
    sentiment: 'positive' | 'neutral' | 'cautionary' | 'negative';
    safetyScoreAdjustment: number; // e.g. -5 to +5
    recommendedAdjustments: string[];
    futureRecommendations: string[];
    aiSummary: string;
  };
  submittedAt: string;
}

export interface TripItinerary {
  id: string;
  destination: string;
  resolvedLocation?: ResolvedLocation;
  startDate: string;
  endDate: string;
  budget: number;
  expenses: { id: string; category: string; amount: number; description: string; date: string }[];
  checklist: { id: string; item: string; completed: boolean }[];
  timeline: ItineraryItem[];
  aiSummary?: string;
  safetyScore?: number;
  safetyMetrics?: TripSafetyMetrics;
  feedback?: TripFeedback;
}

export interface SafetyZone {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: 'safe' | 'moderate' | 'danger';
  crimeIndex: number;
  trafficIndex: number;
  weatherAlert?: string;
  crowdDensity: 'Low' | 'Medium' | 'High';
  description: string;
}

export interface SmartPOI {
  id: string;
  name: string;
  category: 'hotel' | 'restaurant' | 'hospital' | 'police' | 'atm' | 'fuel' | 'charging' | 'transit' | 'toilet' | 'landmark';
  lat: number;
  lng: number;
  rating: number;
  priceLevel: '$' | '$$' | '$$$';
  distance: string; // e.g., "0.4 km"
  safetyRating: number; // 1-10 scale
  details: string;
}

export interface GroundingSource {
  title: string;
  uri: string;
  snippet?: string;
  sourceType?: 'web' | 'maps';
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  audioUrl?: string;
  modelUsed?: string;
  role?: 'general' | 'complex' | 'fast';
  groundingMode?: 'none' | 'maps' | 'search';
  searchSources?: GroundingSource[];
  mapPlaces?: GroundingSource[];
  groundingChunks?: any[];
}

export interface SOSRequest {
  id: string;
  userId?: string;
  touristName: string;
  digitalId?: string;
  caseId?: string;
  lat: number;
  lng: number;
  timestamp: string;
  status: 'Pending' | 'Dispatched' | 'On-Route' | 'Resolved';
  servicesRequired: ('Police' | 'Ambulance' | 'Fire')[];
  trackingNotes?: string;
  isAnomaly?: boolean;
  anomalyType?: string;
  anomalyTag?: string; // e.g. 'AI-Detected Anomaly'
  riskZoneName?: string;
  safetyScoreAtTrigger?: number;
}

export interface GeofenceZone {
  id: string;
  name: string;
  city: string;
  riskLevel: 'safe' | 'moderate' | 'high-risk';
  description: string;
  advisory: string;
  crimeRating: number; // 0 - 100
  policeStationContact: string;
  center: { lat: number; lng: number };
  coordinates: [number, number][]; // [lng, lat] GeoJSON ring
  polygonGeoJSON: any;
}

export interface EFIRIncident {
  caseId: string; // e.g. "EFIR-2026-8812"
  sosId?: string;
  touristId: string;
  touristName: string;
  digitalId: string;
  passportOrAadhaar?: string;
  nationality?: string;
  emergencyContactPhone?: string;
  title: string;
  description: string;
  incidentCategory: 'theft' | 'scam' | 'harassment' | 'medical' | 'missing' | 'geofence_distress' | 'other';
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'Open' | 'In Progress' | 'Resolved';
  locationName: string;
  lat: number;
  lng: number;
  assignedStation: string;
  assignedOfficer: string;
  timestamp: string;
  resolvedAt?: string;
  officerNotes?: string;
  evidenceLinks?: string[];
  isAnomaly?: boolean;
  anomalyType?: string;
}

export interface TamperProofDigitalID {
  digitalId: string; // Cryptographic ID code e.g. BST-ID-SHA256-7492A
  signatureHash: string; // Full SHA-256 HMAC cryptographic signature
  touristId: string;
  touristName: string;
  passportOrAadhaar: string;
  nationality: string;
  emergencyContactPhone: string;
  bloodType?: string;
  tripId: string;
  issuedAt: string;
  expiresAt: string; // Time-bound ID expiration
  isValid: boolean;
  qrPayload: string;
  verifiedCount?: number;
  lastVerifiedAt?: string;
}

export interface ActiveTouristTracker {
  id: string;
  name: string;
  email: string;
  digitalId: string;
  lat: number;
  lng: number;
  lastUpdated: string;
  status: 'normal' | 'moderate_zone' | 'high_risk_zone' | 'sos_active' | 'anomaly_flagged';
  currentZoneName?: string;
  zoneRiskLevel?: 'safe' | 'moderate' | 'high-risk';
  safetyScore: number;
  batteryLevel?: number;
  phone?: string;
  emergencyContact?: string;
  activeCaseId?: string;
}

export interface ScamReport {
  id: string;
  title: string;
  location: string;
  description: string;
  scamType: string;
  severity: 'low' | 'medium' | 'high';
  timestamp: string;
}

export interface LostItemReport {
  id: string;
  itemName: string;
  lastSeenLocation: string;
  description: string;
  status: 'Lost' | 'Found';
  contactInfo: string;
  timestamp: string;
}
