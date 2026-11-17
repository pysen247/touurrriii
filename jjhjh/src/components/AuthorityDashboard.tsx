/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BHARAT SAFE TOURISM - AUTHORITY & POLICE COMMAND CENTER
 * Problem Statement 25002: Smart Tourist Safety Monitoring & Incident Response System
 * 
 * Features:
 * 1. Protected authority & police login gateway
 * 2. Live Leaflet radar map with active tourist pins, risk polygons, and incident heatmap overlay
 * 3. Real-time SOS alerts and AI-detected anomaly feed (inactivity & GPS jump outliers)
 * 4. Electronic First Information Report (E-FIR) generation with printable official summary
 * 5. Cryptographic SHA-256 Tamper-Proof Digital ID verification ledger
 * 6. 1-Click Hackathon Evaluator Simulation Panel for testing anomalies and dispatches
 */

import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Radio, 
  AlertTriangle, 
  FileText, 
  Search, 
  Filter, 
  MapPin, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Phone, 
  User, 
  BatteryCharging, 
  Layers, 
  Flame, 
  Check, 
  Printer, 
  Download, 
  Sparkles, 
  RefreshCw, 
  Eye, 
  ExternalLink,
  Lock,
  ChevronRight,
  Send,
  Building,
  Key,
  Database
} from 'lucide-react';
import { SAMPLE_GEOFENCE_ZONES } from '../utils/geofenceData';
import { GeofenceZone, ActiveTouristTracker, EFIRIncident } from '../types';

interface AuthorityDashboardProps {
  currentUser?: any;
  onSwitchPersona?: (role: 'tourist' | 'government' | 'emergency' | 'admin') => void;
  onNavigateToTab?: (tab: string) => void;
  darkMode?: boolean;
  onOpenDatabaseExplorer?: () => void;
}

export default function AuthorityDashboard({
  currentUser,
  onSwitchPersona,
  onNavigateToTab,
  darkMode = true,
  onOpenDatabaseExplorer
}: AuthorityDashboardProps) {
  // Authentication & Access state
  const isAuthorized = currentUser && ['government', 'emergency', 'admin'].includes(currentUser.role);
  
  // Authority Data States
  const [loading, setLoading] = useState(true);
  const [activeTourists, setActiveTourists] = useState<any[]>([]);
  const [sosAlerts, setSosAlerts] = useState<any[]>([]);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalMonitoredTourists: 6,
    activeSos: 1,
    aiAnomalies: 1,
    openEfir: 2,
    resolvedCases: 0,
    safeCorridorsActive: 2,
    highRiskZonesMonitored: 1
  });

  // Map and View States
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const polygonsLayerRef = useRef<L.LayerGroup | null>(null);
  const heatmapLayerRef = useRef<L.LayerGroup | null>(null);

  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showPolygons, setShowPolygons] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'high_risk' | 'sos' | 'low_battery' | 'anomaly'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTourist, setSelectedTourist] = useState<any | null>(null);
  const [activeCityView, setActiveCityView] = useState<'all' | 'jaipur' | 'delhi' | 'agra' | 'varanasi'>('all');

  // E-FIR Modal State
  const [showEfirModal, setShowEfirModal] = useState(false);
  const [selectedSosForEfir, setSelectedSosForEfir] = useState<any | null>(null);
  const [efirFormData, setEfirFormData] = useState({
    title: '',
    description: '',
    incidentCategory: 'theft',
    severity: 'High',
    assignedStation: 'Jaipur Manak Chowk Tourist Station',
    assignedOfficer: 'Inspector V. Rathore (Badge #742)',
    officerNotes: ''
  });
  const [filingEfir, setFilingEfir] = useState(false);
  const [generatedEfir, setGeneratedEfir] = useState<EFIRIncident | null>(null);
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Digital ID Verification Modal State
  const [verificationModalOpen, setVerificationModalOpen] = useState(false);
  const [verifyIdInput, setVerifyIdInput] = useState('');
  const [verificationResult, setVerificationResult] = useState<any | null>(null);
  const [verifyingId, setVerifyingId] = useState(false);

  // Anomaly Simulation Banner State
  const [actionNotification, setActionNotification] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  // Fetch Command Overview from persistent backend
  const fetchOverview = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/authority/overview');
      if (res.ok) {
        const data = await res.json();
        setActiveTourists(data.activeTourists || []);
        setSosAlerts(data.sosAlerts || []);
        setIncidents(data.incidents || []);
        if (data.stats) setStats(data.stats);
      }
    } catch (err) {
      console.error('Error fetching authority overview:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
    const interval = setInterval(fetchOverview, 15000); // Polling every 15s
    return () => clearInterval(interval);
  }, []);

  // Show notification helper
  const showBanner = (msg: string) => {
    setActionNotification(msg);
    setTimeout(() => setActionNotification(null), 5000);
  };

  // Initialize and Update Leaflet Map
  useEffect(() => {
    if (!isAuthorized || !mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      if ((mapContainerRef.current as any)._leaflet_id) {
        delete (mapContainerRef.current as any)._leaflet_id;
      }

      // Default center: Jaipur, Rajasthan
      const map = L.map(mapContainerRef.current, {
        center: [26.9124, 75.7873],
        zoom: 12,
        zoomControl: true,
        attributionControl: false
      });

      // CartoDB Voyager / Dark tiles
      const tileUrl = darkMode
        ? 'https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

      L.tileLayer(tileUrl, { maxZoom: 19 }).addTo(map);

      polygonsLayerRef.current = L.layerGroup().addTo(map);
      heatmapLayerRef.current = L.layerGroup().addTo(map);
      markersLayerRef.current = L.layerGroup().addTo(map);

      mapInstanceRef.current = map;

      setTimeout(() => map.invalidateSize(), 150);
      setTimeout(() => map.invalidateSize(), 500);
    }

    const map = mapInstanceRef.current;

    // Render Risk Polygons
    if (polygonsLayerRef.current) {
      polygonsLayerRef.current.clearLayers();
      if (showPolygons) {
        SAMPLE_GEOFENCE_ZONES.forEach(zone => {
          // Convert GeoJSON coordinates [lng, lat] to Leaflet [lat, lng]
          const latLngs = zone.coordinates.map(c => [c[1], c[0]] as [number, number]);
          
          let fillColor = '#10b981';
          let strokeColor = '#059669';
          if (zone.riskLevel === 'moderate') {
            fillColor = '#f59e0b';
            strokeColor = '#d97706';
          } else if (zone.riskLevel === 'high-risk') {
            fillColor = '#ef4444';
            strokeColor = '#dc2626';
          }

          const polygon = L.polygon(latLngs, {
            color: strokeColor,
            fillColor,
            fillOpacity: 0.22,
            weight: 2,
            dashArray: zone.riskLevel === 'high-risk' ? '5, 5' : undefined
          });

          polygon.bindPopup(`
            <div style="font-family: sans-serif; min-width: 220px;">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
                <b style="color: ${strokeColor}; font-size: 13px;">${zone.name}</b>
                <span style="background: ${fillColor}22; color: ${strokeColor}; border: 1px solid ${strokeColor}; border-radius: 4px; padding: 2px 6px; font-size: 10px; font-weight: bold;">
                  ${zone.riskLevel.toUpperCase()}
                </span>
              </div>
              <p style="font-size: 11px; color: #475569; margin: 4px 0 6px 0;">${zone.description}</p>
              <div style="font-size: 10px; color: #0284c7; background: #f0f9ff; padding: 6px; border-radius: 6px; border-left: 3px solid #0284c7;">
                <b>Advisory:</b> ${zone.advisory}
              </div>
              <div style="font-size: 10px; color: #64748b; margin-top: 6px;">
                <b>Station Contact:</b> ${zone.policeStationContact}
              </div>
            </div>
          `);

          polygonsLayerRef.current?.addLayer(polygon);
        });
      }
    }

    // Render Heatmap / Incident Density Overlay
    if (heatmapLayerRef.current) {
      heatmapLayerRef.current.clearLayers();
      if (showHeatmap) {
        // High density incident clusters
        const heatClusters = [
          { lat: 26.9215, lng: 75.8260, radius: 900, count: 8, label: 'Johari Bazaar Scam & Theft Surge' },
          { lat: 28.6430, lng: 77.2150, radius: 1100, count: 14, label: 'Paharganj High Transit Anomaly Zone' },
          { lat: 27.1700, lng: 78.0420, radius: 750, count: 6, label: 'Taj Ganj Aggressive Tout Hotspot' },
          { lat: 25.3075, lng: 83.0100, radius: 800, count: 7, label: 'Ghat Aarti Congestion Zone' }
        ];

        heatClusters.forEach(cluster => {
          const circle = L.circle([cluster.lat, cluster.lng], {
            radius: cluster.radius,
            color: '#ef4444',
            fillColor: '#dc2626',
            fillOpacity: 0.35,
            weight: 1.5
          });

          circle.bindPopup(`
            <div style="font-family: sans-serif; font-size: 11px;">
              <b style="color: #dc2626;">🔥 Incident Density Hotspot</b><br/>
              <b>${cluster.label}</b><br/>
              <span style="color: #64748b;">Historical Complaints / Month: <b>${cluster.count}</b></span>
            </div>
          `);

          heatmapLayerRef.current?.addLayer(circle);
        });
      }
    }

    // Render Tourist Pins
    if (markersLayerRef.current) {
      markersLayerRef.current.clearLayers();

      const filtered = getFilteredTourists();

      filtered.forEach(tourist => {
        const isSos = tourist.status === 'sos_active';
        const isAnomaly = tourist.status === 'anomaly_flagged';

        let markerColor = '#10b981'; // Green (Safe)
        let ringEffect = '';
        if (tourist.riskLevel === 'moderate') markerColor = '#f59e0b'; // Amber
        if (tourist.riskLevel === 'high-risk') markerColor = '#ef4444'; // Red
        if (isAnomaly) markerColor = '#a855f7'; // Purple (Anomaly)

        if (isSos) {
          markerColor = '#dc2626';
          ringEffect = 'box-shadow: 0 0 0 8px rgba(220, 38, 38, 0.4); animation: pulse 1.5s infinite;';
        } else if (isAnomaly) {
          ringEffect = 'box-shadow: 0 0 0 8px rgba(168, 85, 247, 0.4); animation: pulse 1.5s infinite;';
        }

        const iconHtml = `
          <div style="
            position: relative;
            width: 38px;
            height: 38px;
            border-radius: 50%;
            background: #0f172a;
            border: 3px solid ${markerColor};
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            color: white;
            font-weight: bold;
            cursor: pointer;
            ${ringEffect}
          ">
            <span>${isSos ? '🚨' : (isAnomaly ? '🤖' : '🛡️')}</span>
            <div style="
              position: absolute;
              bottom: -4px;
              right: -4px;
              width: 14px;
              height: 14px;
              border-radius: 50%;
              background: ${markerColor};
              border: 2px solid #0f172a;
            "></div>
          </div>
        `;

        const customIcon = L.divIcon({
          html: iconHtml,
          className: 'custom-tourist-pin',
          iconSize: [38, 38],
          iconAnchor: [19, 19]
        });

        const marker = L.marker([tourist.lat, tourist.lng], { icon: customIcon });

        marker.on('click', () => {
          setSelectedTourist(tourist);
        });

        marker.bindPopup(`
          <div style="font-family: sans-serif; min-width: 230px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
              <b style="font-size: 13px; color: #0f172a;">${tourist.name}</b>
              <span style="font-size: 11px; background: #e2e8f0; padding: 1px 6px; border-radius: 4px;">${tourist.nationality}</span>
            </div>
            <div style="font-size: 10px; font-family: monospace; color: #0284c7; margin-bottom: 6px;">
              ID: ${tourist.digitalId}
            </div>
            <div style="font-size: 11px; margin-bottom: 4px;">
              <b>Current Zone:</b> <span style="color: ${markerColor}; font-weight: bold;">${tourist.zoneName}</span>
            </div>
            <div style="font-size: 11px; margin-bottom: 4px;">
              <b>Safety Score:</b> <span style="font-weight: bold;">${tourist.safetyScore}/100</span>
            </div>
            <div style="font-size: 11px; margin-bottom: 8px;">
              <b>Battery:</b> ${tourist.batteryLevel || 85}% | <b>Status:</b> ${tourist.status.toUpperCase()}
            </div>
            <button id="verify-btn-${tourist.id}" style="
              width: 100%;
              background: #0284c7;
              color: white;
              border: none;
              border-radius: 6px;
              padding: 5px;
              font-size: 11px;
              font-weight: bold;
              cursor: pointer;
            ">
              🔍 Verify SHA-256 Digital Pass
            </button>
          </div>
        `);

        marker.on('popupopen', () => {
          const btn = document.getElementById(`verify-btn-${tourist.id}`);
          if (btn) {
            btn.onclick = () => {
              setVerifyIdInput(tourist.digitalId);
              handleVerifyId(tourist.digitalId);
            };
          }
        });

        markersLayerRef.current?.addLayer(marker);
      });
    }
  }, [activeTourists, showHeatmap, showPolygons, selectedFilter, searchQuery, isAuthorized, darkMode]);

  // Filter Active Tourists based on toolbar criteria
  const getFilteredTourists = () => {
    let list = [...activeTourists];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(t => 
        t.name.toLowerCase().includes(q) ||
        t.nationality.toLowerCase().includes(q) ||
        (t.digitalId && t.digitalId.toLowerCase().includes(q))
      );
    }

    if (selectedFilter === 'high_risk') {
      list = list.filter(t => t.riskLevel === 'high-risk' || t.riskLevel === 'moderate');
    } else if (selectedFilter === 'sos') {
      list = list.filter(t => t.status === 'sos_active');
    } else if (selectedFilter === 'low_battery') {
      list = list.filter(t => (t.batteryLevel || 100) < 25);
    } else if (selectedFilter === 'anomaly') {
      list = list.filter(t => t.status === 'anomaly_flagged');
    }

    return list;
  };

  // Pan to city
  const handleCityPan = (city: 'all' | 'jaipur' | 'delhi' | 'agra' | 'varanasi') => {
    setActiveCityView(city);
    if (!mapInstanceRef.current) return;

    if (city === 'jaipur') {
      mapInstanceRef.current.setView([26.9124, 75.7873], 13);
    } else if (city === 'delhi') {
      mapInstanceRef.current.setView([28.6315, 77.2167], 13);
    } else if (city === 'agra') {
      mapInstanceRef.current.setView([27.1700, 78.0420], 14);
    } else if (city === 'varanasi') {
      mapInstanceRef.current.setView([25.3075, 83.0100], 14);
    } else {
      mapInstanceRef.current.setView([26.9124, 75.7873], 6);
    }
  };

  // SOS Alert Status Update
  const handleUpdateSosStatus = async (sosId: string, status: 'Dispatched' | 'On-Route' | 'Resolved') => {
    try {
      const res = await fetch(`/api/data/sos/${sosId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          trackingNotes: `Status updated to ${status} by Authority Command Officer at ${new Date().toLocaleTimeString()}`
        })
      });

      if (res.ok) {
        showBanner(`✅ Incident ${sosId} set to ${status.toUpperCase()}`);
        fetchOverview();
      }
    } catch (err) {
      console.error('Failed to update SOS status:', err);
    }
  };

  // Open E-FIR Modal prefilled with selected SOS/tourist info
  const handleOpenEfirModal = (sosAlert?: any) => {
    setSelectedSosForEfir(sosAlert || null);
    setEfirFormData({
      title: sosAlert 
        ? (sosAlert.isAnomaly ? `AI Anomaly Report: ${sosAlert.trackingNotes}` : `Distress Beacon Triggered by ${sosAlert.touristName}`)
        : 'Tourist Incident Report',
      description: sosAlert 
        ? `Emergency beacon broadcasted at coordinates Lat: ${sosAlert.lat}, Lng: ${sosAlert.lng}. Risk Zone: ${sosAlert.riskZoneName || 'Monitored Sector'}. Services requested: ${(sosAlert.servicesRequired || ['Police']).join(', ')}.`
        : '',
      incidentCategory: sosAlert?.isAnomaly ? 'geofence_distress' : 'theft',
      severity: 'High',
      assignedStation: 'Jaipur Manak Chowk Tourist Station',
      assignedOfficer: 'Inspector V. Rathore (Badge #742)',
      officerNotes: 'Complainant location confirmed. Dispatched PCR response vehicle.'
    });
    setShowEfirModal(true);
  };

  // Submit Official E-FIR
  const handleSubmitEfir = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setFilingEfir(true);
      const payload = {
        sosId: selectedSosForEfir?.id,
        touristId: selectedSosForEfir?.userId || 'user_tourist',
        touristName: selectedSosForEfir?.touristName || 'Verified Tourist',
        digitalId: selectedSosForEfir?.digitalId || 'BST-ID-SHA256-49C2B81F90',
        passportOrAadhaar: 'IN-784920184',
        nationality: 'Indian',
        emergencyContactPhone: '+91-9876543210',
        title: efirFormData.title,
        description: efirFormData.description,
        incidentCategory: efirFormData.incidentCategory,
        severity: efirFormData.severity,
        status: 'Open',
        locationName: selectedSosForEfir?.riskZoneName || 'Johari Bazaar Corridor, Jaipur',
        lat: selectedSosForEfir?.lat || 26.9215,
        lng: selectedSosForEfir?.lng || 75.8260,
        assignedStation: efirFormData.assignedStation,
        assignedOfficer: efirFormData.assignedOfficer,
        officerNotes: efirFormData.officerNotes
      };

      const res = await fetch('/api/authority/efir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        setGeneratedEfir(data.incident);
        setShowEfirModal(false);
        setShowPrintModal(true);
        showBanner(`📜 Official E-FIR ${data.incident.caseId} recorded in persistent ledger!`);
        fetchOverview();
      }
    } catch (err) {
      console.error('Failed to file E-FIR:', err);
    } finally {
      setFilingEfir(false);
    }
  };

  // Cryptographic Digital ID Verification
  const handleVerifyId = async (idToVerify?: string) => {
    const target = idToVerify || verifyIdInput;
    if (!target) return;

    try {
      setVerifyingId(true);
      setVerificationModalOpen(true);
      const res = await fetch('/api/verify-id', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ digitalId: target.trim() })
      });

      if (res.ok) {
        const data = await res.json();
        setVerificationResult(data);
      } else {
        setVerificationResult({
          valid: false,
          status: 'error',
          message: 'Failed to complete cryptographic verification check.'
        });
      }
    } catch (err) {
      setVerificationResult({
        valid: false,
        status: 'error',
        message: 'Network error contacting verification authority.'
      });
    } finally {
      setVerifyingId(false);
    }
  };

  // Trigger Anomaly Simulation (for Hackathon Judges)
  const handleSimulateAnomaly = async (type: 'inactivity' | 'sudden_jump') => {
    try {
      setIsSimulating(true);
      const res = await fetch('/api/simulate-anomaly', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      });

      if (res.ok) {
        const data = await res.json();
        showBanner(`🚨 ${data.message}`);
        fetchOverview();
      }
    } catch (err) {
      console.error('Failed to simulate anomaly:', err);
    } finally {
      setIsSimulating(false);
    }
  };

  // Trigger full scan
  const handleRunAnomalyScan = async () => {
    try {
      setIsSimulating(true);
      const res = await fetch('/api/anomalies/check', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        showBanner(`🤖 AI Scan Complete: Scanned ${data.scannedCount} tourists, identified ${data.anomaliesFound} anomalies.`);
        fetchOverview();
      }
    } catch (err) {
      console.error('Scan error:', err);
    } finally {
      setIsSimulating(false);
    }
  };

  // --------------------------------------------------------------------------
  // UNAUTHORIZED / LOGIN VIEW
  // --------------------------------------------------------------------------
  if (!isAuthorized) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-2xl border border-slate-700 bg-slate-900/95 p-6 md:p-8 shadow-2xl backdrop-blur-xl text-white space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/30">
              <ShieldAlert className="h-8 w-8 text-white animate-pulse" />
            </div>
            <h2 className="text-2xl font-black tracking-tight">Authority & Police Command</h2>
            <p className="text-xs text-slate-400">
              Restricted Portal: Problem Statement 25002 Incident Response & Safety Monitoring System.
            </p>
          </div>

          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-200 flex items-start gap-2.5">
            <Lock className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <b>Access Restricted:</b> This command dashboard requires Law Enforcement, Emergency Dispatch, or Tourism Authority credentials.
            </div>
          </div>

          {/* 1-Click Quick Login Buttons for Evaluators/Judges */}
          <div className="space-y-2.5 pt-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              1-Click Instant Login (Hackathon Demo)
            </span>

            <button
              onClick={() => onSwitchPersona && onSwitchPersona('government')}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 transition-colors font-bold text-sm shadow-md cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Building className="h-4 w-4 text-blue-200" />
                <div className="text-left">
                  <div>Superintendent Dupont</div>
                  <div className="text-[10px] text-blue-200 font-normal">State Police HQ / Incident Commander</div>
                </div>
              </div>
              <ChevronRight className="h-4 w-4" />
            </button>

            <button
              onClick={() => onSwitchPersona && onSwitchPersona('emergency')}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors font-bold text-sm cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Radio className="h-4 w-4 text-emerald-400" />
                <div className="text-left">
                  <div>EMS Chief Martin</div>
                  <div className="text-[10px] text-slate-400 font-normal">Central Rescue & Triage Command</div>
                </div>
              </div>
              <ChevronRight className="h-4 w-4" />
            </button>

            <button
              onClick={() => onSwitchPersona && onSwitchPersona('admin')}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors font-bold text-sm cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Key className="h-4 w-4 text-purple-400" />
                <div className="text-left">
                  <div>SIH Central Administrator</div>
                  <div className="text-[10px] text-slate-400 font-normal">Full Ledger & Cryptographic Controller</div>
                </div>
              </div>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="text-center pt-2">
            <button
              onClick={() => onNavigateToTab && onNavigateToTab('home')}
              className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              ← Return to Tourist Portal
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // MAIN AUTHORITY COMMAND DASHBOARD VIEW
  // --------------------------------------------------------------------------
  return (
    <div className="space-y-6 pb-12" id="authority-dashboard-root">
      
      {/* Top Banner Alert (if triggered) */}
      {actionNotification && (
        <div className="rounded-xl border border-blue-500/40 bg-blue-950/80 p-3.5 text-xs text-blue-200 shadow-lg flex items-center justify-between backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <Radio className="h-4 w-4 text-blue-400 animate-pulse" />
            <span className="font-semibold">{actionNotification}</span>
          </div>
          <button 
            onClick={() => setActionNotification(null)}
            className="text-slate-400 hover:text-white text-xs cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
              Live Police Incident Command
            </span>
            <span className="text-xs text-slate-400 font-mono">SIH Problem Statement 25002</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Bharat Safe Tourism Command Desk
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time geofenced tourist tracking, rule-based AI anomaly alerts, E-FIR dispatch, and cryptographic digital ID audit ledger.
          </p>
        </div>

        {/* Header Right Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {onOpenDatabaseExplorer && (
            <button
              onClick={onOpenDatabaseExplorer}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-500/40 font-bold text-xs transition-all cursor-pointer shadow-sm"
              title="Inspect Live Persistent JSON Database (data/safetour_db.json)"
            >
              <Database className="h-4 w-4 text-cyan-400" />
              <span>{'{ }'} Raw JSON DB</span>
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            </button>
          )}

          <button
            onClick={() => handleOpenEfirModal()}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer"
          >
            <FileText className="h-4 w-4" />
            File Direct E-FIR
          </button>

          <button
            onClick={() => {
              setVerifyIdInput('BST-ID-SHA256-49C2B81F90');
              setVerificationModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs transition-all cursor-pointer"
          >
            <ShieldCheck className="h-4 w-4 text-cyan-400" />
            Verify Digital ID
          </button>

          <button
            onClick={fetchOverview}
            disabled={loading}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            title="Refresh Command Data"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Evaluator Demo Tool Ribbon (SIH Judges Testing Bar) */}
      <div className="rounded-2xl border border-purple-500/30 bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-slate-900/50 p-4 backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-400 animate-spin" />
            <span className="text-xs font-bold text-purple-200">
              Evaluator Simulation Tool (Feature 5: AI Anomaly & Feature 2: Real Geofencing):
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleSimulateAnomaly('inactivity')}
              disabled={isSimulating}
              className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
            >
              ⚡ Test Anomaly: Inactive in High-Risk Zone
            </button>

            <button
              onClick={() => handleSimulateAnomaly('sudden_jump')}
              disabled={isSimulating}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
            >
              ⚡ Test Anomaly: GPS Jump Outlier
            </button>

            <button
              onClick={handleRunAnomalyScan}
              disabled={isSimulating}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
            >
              🔍 Run Background AI Scan
            </button>
          </div>
        </div>
      </div>

      {/* Analytical KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-1 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Active Monitored Tourists</span>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400">{stats.totalMonitoredTourists}</div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">● GPS Heartbeats Active</span>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-1 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Emergency SOS Beacons</span>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400 flex items-center gap-2">
            {stats.activeSos}
            {stats.activeSos > 0 && <span className="h-2.5 w-2.5 rounded-full bg-rose-500 animate-ping" />}
          </div>
          <span className="text-[10px] text-rose-500 font-semibold">Requires immediate PCR unit</span>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-1 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">AI-Detected Anomalies</span>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400">{stats.aiAnomalies}</div>
          <span className="text-[10px] text-purple-400 font-semibold">Rule-based distress flags</span>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-1 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Open E-FIR Records</span>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400">{stats.openEfir}</div>
          <span className="text-[10px] text-slate-400 font-semibold">Under active investigation</span>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-1 shadow-sm col-span-2 lg:col-span-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Safe Corridors Active</span>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{stats.safeCorridorsActive}</div>
          <span className="text-[10px] text-slate-400 font-semibold">Turf.js Geofence Polygons</span>
        </div>
      </div>

      {/* Main Command Workspace: Map & Feed */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Left 7 Cols: Live Leaflet Radar Map with Overlays */}
        <div className="xl:col-span-7 space-y-3">
          
          {/* Map Controls Header */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <div className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-blue-500" />
              <span className="text-xs font-bold text-slate-800 dark:text-white">Live Geofence Radar</span>
            </div>

            {/* City Quick Zoom Tabs */}
            <div className="flex items-center gap-1">
              {[
                { id: 'all', label: 'All India' },
                { id: 'jaipur', label: 'Jaipur' },
                { id: 'delhi', label: 'Delhi' },
                { id: 'agra', label: 'Agra' },
                { id: 'varanasi', label: 'Varanasi' }
              ].map(city => (
                <button
                  key={city.id}
                  onClick={() => handleCityPan(city.id as any)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                    activeCityView === city.id
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {city.label}
                </button>
              ))}
            </div>

            {/* Toggles */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowHeatmap(!showHeatmap)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  showHeatmap 
                    ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30' 
                    : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Flame className="h-3.5 w-3.5" />
                Heatmap
              </button>

              <button
                onClick={() => setShowPolygons(!showPolygons)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  showPolygons 
                    ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' 
                    : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Layers className="h-3.5 w-3.5" />
                Polygons
              </button>
            </div>
          </div>

          {/* Leaflet Map Canvas */}
          <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm h-[480px] bg-slate-950">
            <div ref={mapContainerRef} className="w-full h-full" style={{ minHeight: '480px' }} />

            {/* Map Legend Overlay */}
            <div className="absolute bottom-3 left-3 z-[1000] rounded-xl border border-slate-800 bg-slate-900/90 p-2.5 text-[10px] text-white backdrop-blur-md space-y-1 shadow-lg pointer-events-none">
              <div className="font-bold border-b border-slate-800 pb-1 text-slate-300">Radar Legend</div>
              <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Safe Corridor</div>
              <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-500" /> Moderate Caution</div>
              <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-rose-500" /> High-Risk Zone</div>
              <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-purple-500" /> AI Anomaly Flagged</div>
            </div>
          </div>

          {/* Selected Tourist Mini Profile (if clicked on map) */}
          {selectedTourist && (
            <div className="p-4 rounded-2xl border border-blue-500/40 bg-blue-950/40 backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white text-sm">
                  {selectedTourist.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="text-sm font-bold text-white flex items-center gap-2">
                    {selectedTourist.name}
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {selectedTourist.nationality}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Digital ID: {selectedTourist.digitalId} | Phone: {selectedTourist.phone || '+91-9876543210'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleVerifyId(selectedTourist.digitalId)}
                  className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs cursor-pointer"
                >
                  Verify ID Hash
                </button>
                <button
                  onClick={() => setSelectedTourist(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right 5 Cols: Quick Filtered Feed (SOS & AI Anomalies & E-FIR) */}
        <div className="xl:col-span-5 space-y-4">
          
          {/* Quick Filters Toolbar */}
          <div className="space-y-2.5">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search tourist, passport, or digital ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'all', label: 'All Active' },
                { id: 'sos', label: '🚨 Active SOS' },
                { id: 'anomaly', label: '🤖 AI Anomalies' },
                { id: 'high_risk', label: '⚠️ In Risk Zones' },
                { id: 'low_battery', label: '🔋 Low Battery' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedFilter(tab.id as any)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    selectedFilter === tab.id
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Active Incident & SOS Alert Cards */}
          <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1">
            {sosAlerts.length === 0 ? (
              <div className="p-8 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 text-slate-500 text-xs">
                No active SOS alerts. Regional corridors operating under normal protocols.
              </div>
            ) : (
              sosAlerts.map(sos => {
                const isAnomaly = sos.isAnomaly;
                const isResolved = sos.status === 'Resolved';

                return (
                  <div
                    key={sos.id}
                    className={`rounded-2xl border p-4 transition-all space-y-3 ${
                      isAnomaly 
                        ? 'border-purple-500/40 bg-purple-950/20' 
                        : (isResolved 
                          ? 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 opacity-70' 
                          : 'border-rose-500/50 bg-rose-950/20 shadow-md')
                    }`}
                  >
                    {/* Card Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-slate-900 dark:text-white">
                            {sos.touristName}
                          </span>
                          
                          {/* Prominent Distinct Tag for AI-Detected Anomaly */}
                          {isAnomaly ? (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-purple-600 text-white shadow-sm flex items-center gap-1">
                              <Sparkles className="h-2.5 w-2.5" />
                              AI-Detected Anomaly
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-rose-600 text-white animate-pulse">
                              Manual SOS Beacon
                            </span>
                          )}
                        </div>

                        <div className="text-[10px] text-slate-400 font-mono">
                          ID: <span className="text-cyan-400">{sos.digitalId || 'BST-ID-VERIFIED'}</span> | Case: <span className="text-amber-400">{sos.caseId || 'PENDING-FIR'}</span>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase ${
                        sos.status === 'Resolved' 
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                          : (sos.status === 'Dispatched' 
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30')
                      }`}>
                        {sos.status}
                      </span>
                    </div>

                    {/* Incident Details & Notes */}
                    <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1 bg-black/10 dark:bg-black/20 p-2.5 rounded-xl">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">
                        {sos.trackingNotes}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-400">
                        <span>📍 GPS: {Number(sos.lat).toFixed(4)} N, {Number(sos.lng).toFixed(4)} E</span>
                        <span>🛡️ Zone: {sos.riskZoneName || 'Monitored Corridor'}</span>
                        <span>⏰ {new Date(sos.timestamp).toLocaleTimeString()}</span>
                      </div>
                    </div>

                    {/* Action Bar (Dispatch, In Progress, Resolve, File E-FIR) */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                      <div className="flex items-center gap-1.5">
                        {sos.status === 'Pending' && (
                          <button
                            onClick={() => handleUpdateSosStatus(sos.id, 'Dispatched')}
                            className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold cursor-pointer"
                          >
                            Dispatch PCR
                          </button>
                        )}

                        {sos.status === 'Dispatched' && (
                          <button
                            onClick={() => handleUpdateSosStatus(sos.id, 'On-Route')}
                            className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-[11px] font-bold cursor-pointer"
                          >
                            Mark On-Route
                          </button>
                        )}

                        {sos.status !== 'Resolved' && (
                          <button
                            onClick={() => handleUpdateSosStatus(sos.id, 'Resolved')}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold cursor-pointer"
                          >
                            Resolve
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleVerifyId(sos.digitalId)}
                          className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer underline"
                        >
                          Verify Hash
                        </button>

                        <button
                          onClick={() => handleOpenEfirModal(sos)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <FileText className="h-3 w-3 text-amber-400" />
                          File E-FIR
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Official Electronic First Information Report (E-FIR) Filing Modal */}
      {showEfirModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="max-w-2xl w-full rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl text-white space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <FileText className="h-5 w-5 text-amber-400" />
                <h3 className="text-lg font-black">Register Official E-FIR (Incident Command)</h3>
              </div>
              <button 
                onClick={() => setShowEfirModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitEfir} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Complainant Name</label>
                  <input
                    type="text"
                    readOnly
                    value={selectedSosForEfir?.touristName || 'Harsh Kumar'}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-200 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Cryptographic Digital ID</label>
                  <input
                    type="text"
                    readOnly
                    value={selectedSosForEfir?.digitalId || 'BST-ID-SHA256-49C2B81F90'}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-cyan-400 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Incident Category</label>
                  <select
                    value={efirFormData.incidentCategory}
                    onChange={(e) => setEfirFormData({ ...efirFormData, incidentCategory: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold"
                  >
                    <option value="theft">Theft / Snatching</option>
                    <option value="scam">Commercial Scam / Overcharging</option>
                    <option value="harassment">Aggressive Tout Harassment</option>
                    <option value="medical">Medical Emergency</option>
                    <option value="geofence_distress">Geofence Boundary Distress (AI Anomaly)</option>
                    <option value="missing">Missing Tourist Outlier</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Severity Tier</label>
                  <select
                    value={efirFormData.severity}
                    onChange={(e) => setEfirFormData({ ...efirFormData, severity: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold"
                  >
                    <option value="Critical">Critical Priority (PCR Immediate)</option>
                    <option value="High">High Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="Low">Low / Administrative</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1 text-xs">Incident Title / Allegation</label>
                <input
                  type="text"
                  required
                  value={efirFormData.title}
                  onChange={(e) => setEfirFormData({ ...efirFormData, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs outline-none focus:border-blue-500 font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1 text-xs">FIR Narrative & Location Description</label>
                <textarea
                  rows={3}
                  required
                  value={efirFormData.description}
                  onChange={(e) => setEfirFormData({ ...efirFormData, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Assigned Police Station</label>
                  <input
                    type="text"
                    value={efirFormData.assignedStation}
                    onChange={(e) => setEfirFormData({ ...efirFormData, assignedStation: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Investigating Officer Badge</label>
                  <input
                    type="text"
                    value={efirFormData.assignedOfficer}
                    onChange={(e) => setEfirFormData({ ...efirFormData, assignedOfficer: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-semibold"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowEfirModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={filingEfir}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {filingEfir ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  Register & Seal E-FIR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Printable / Downloadable E-FIR Summary Document */}
      {showPrintModal && generatedEfir && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="max-w-xl w-full rounded-2xl border border-slate-700 bg-white dark:bg-slate-900 p-6 md:p-8 shadow-2xl text-slate-900 dark:text-white space-y-6 max-h-[90vh] overflow-y-auto">
            
            {/* Printable Document Header */}
            <div className="border-b-2 border-slate-900 dark:border-slate-100 pb-4 text-center space-y-1">
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                GOVERNMENT OF INDIA • MINISTRY OF TOURISM & HOME AFFAIRS
              </div>
              <h2 className="text-xl font-black tracking-tight">
                ELECTRONIC FIRST INFORMATION REPORT (E-FIR)
              </h2>
              <div className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
                CASE IDENTIFIER: {generatedEfir.caseId}
              </div>
              <div className="text-[10px] text-slate-400">
                Logged into Bharat Safe Tourism Cryptographic Ledger • SIH 25002
              </div>
            </div>

            {/* Structured Receipt Info */}
            <div className="grid grid-cols-2 gap-3 text-xs border border-slate-200 dark:border-slate-800 p-4 rounded-xl bg-slate-50 dark:bg-slate-950 font-sans">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Complainant / Tourist</span>
                <b className="text-sm">{generatedEfir.touristName}</b>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Tamper-Proof Digital ID</span>
                <b className="font-mono text-cyan-600 dark:text-cyan-400">{generatedEfir.digitalId}</b>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Incident Class</span>
                <b className="uppercase">{generatedEfir.incidentCategory}</b>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Severity Rating</span>
                <b className="text-rose-600 dark:text-rose-400 uppercase">{generatedEfir.severity}</b>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Jurisdiction Station</span>
                <b>{generatedEfir.assignedStation}</b>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Investigating Officer</span>
                <b>{generatedEfir.assignedOfficer}</b>
              </div>
              <div className="col-span-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Incident Allegation & Narrative</span>
                <p className="mt-1 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {generatedEfir.description}
                </p>
              </div>
            </div>

            {/* Official Security Stamp & Actions */}
            <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-4">
              <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                <CheckCircle2 className="h-5 w-5" />
                <span>Digitally Sealed & Broadcasted to First Responders</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="h-4 w-4" />
                  Print
                </button>

                <button
                  onClick={() => setShowPrintModal(false)}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cryptographic SHA-256 Digital ID Verification Modal */}
      {verificationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="max-w-md w-full rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl text-white space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-cyan-400" />
                <h3 className="text-base font-black">Verify Cryptographic Digital ID</h3>
              </div>
              <button
                onClick={() => {
                  setVerificationModalOpen(false);
                  setVerificationResult(null);
                }}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Enter / Scan Digital ID or QR Hash</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={verifyIdInput}
                    onChange={(e) => setVerifyIdInput(e.target.value)}
                    placeholder="BST-ID-SHA256-..."
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-cyan-300 font-mono text-xs outline-none focus:border-cyan-500"
                  />
                  <button
                    onClick={() => handleVerifyId()}
                    disabled={verifyingId || !verifyIdInput.trim()}
                    className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 font-bold text-white transition-all cursor-pointer disabled:opacity-50"
                  >
                    {verifyingId ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Audit'}
                  </button>
                </div>
              </div>

              {verificationResult && (
                <div className={`p-4 rounded-xl border text-xs space-y-2 ${
                  verificationResult.valid 
                    ? 'border-emerald-500/40 bg-emerald-950/40 text-emerald-200' 
                    : 'border-rose-500/40 bg-rose-950/40 text-rose-200'
                }`}>
                  <div className="flex items-center gap-2 font-bold text-sm">
                    {verificationResult.valid ? (
                      <>
                        <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                        <span>VERIFIED TAMPER-PROOF ID</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-5 w-5 text-rose-400" />
                        <span>INVALID OR TAMPERED DIGITAL ID</span>
                      </>
                    )}
                  </div>
                  <p className="text-xs leading-relaxed">{verificationResult.message}</p>
                  
                  {verificationResult.record && (
                    <div className="pt-2 border-t border-emerald-500/20 text-[11px] space-y-1 font-mono">
                      <div>Tourist: <b>{verificationResult.record.touristName}</b></div>
                      <div>Document: <b>{verificationResult.record.passportOrAadhaar}</b></div>
                      <div>Trip ID: <b>{verificationResult.record.tripId}</b></div>
                      <div>Valid Until: <b>{new Date(verificationResult.record.expiresAt).toLocaleDateString()}</b></div>
                      <div>Audit Verifications: <b>{verificationResult.record.verifiedCount}</b></div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
