/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BHARAT SAFE TOURISM - LIVE PERSISTENT JSON DATABASE EXPLORER
 * Directly inspects, audits, tests, and downloads 'data/safetour_db.json'
 */

import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Download, 
  RefreshCw, 
  Copy, 
  Check, 
  X, 
  FileText, 
  ShieldCheck, 
  AlertTriangle, 
  Users, 
  MapPin, 
  Search, 
  Zap, 
  HardDrive, 
  CheckCircle2, 
  Terminal,
  Clock,
  ExternalLink
} from 'lucide-react';
import { soundFx } from '../utils/audio';

interface DatabaseExplorerModalProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode?: boolean;
}

export default function DatabaseExplorerModal({
  isOpen,
  onClose,
  darkMode = true
}: DatabaseExplorerModalProps) {
  const [loading, setLoading] = useState(true);
  const [dbData, setDbData] = useState<any | null>(null);
  const [fileMeta, setFileMeta] = useState<{
    filePath: string;
    fileSizeBytes: number;
    fileSizeKb: string;
    lastModified: string;
    summary: any;
  } | null>(null);
  const [activeTab, setActiveTab] = useState<'raw' | 'tourists' | 'sos' | 'incidents' | 'digital_ids'>('raw');
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);
  const [testWriting, setTestWriting] = useState(false);
  const [writeFeedback, setWriteFeedback] = useState<string | null>(null);

  const fetchLiveDatabase = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/database/raw');
      if (res.ok) {
        const json = await res.json();
        setDbData(json.data);
        setFileMeta({
          filePath: json.filePath,
          fileSizeBytes: json.fileSizeBytes,
          fileSizeKb: json.fileSizeKb,
          lastModified: json.lastModified,
          summary: json.summary
        });
      }
    } catch (err) {
      console.error('Failed to fetch raw database:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchLiveDatabase();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopyJson = () => {
    if (!dbData) return;
    let textToCopy = '';
    if (activeTab === 'raw') {
      textToCopy = JSON.stringify(dbData, null, 2);
    } else if (activeTab === 'tourists') {
      textToCopy = JSON.stringify(dbData.tourists || {}, null, 2);
    } else if (activeTab === 'sos') {
      textToCopy = JSON.stringify(dbData.sos_alerts || [], null, 2);
    } else if (activeTab === 'incidents') {
      textToCopy = JSON.stringify(dbData.incidents || [], null, 2);
    } else if (activeTab === 'digital_ids') {
      textToCopy = JSON.stringify(dbData.digital_ids || {}, null, 2);
    }
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    soundFx.playSuccess();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTestWrite = async () => {
    try {
      setTestWriting(true);
      setWriteFeedback(null);
      soundFx.playClick();
      const res = await fetch('/api/database/test-write', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: `Audit write triggered at ${new Date().toLocaleTimeString()}` })
      });
      const data = await res.json();
      if (data.success) {
        setWriteFeedback(`✅ Verified real disk write to ${data.filePath} (${data.fileSizeKb} KB) at ${new Date(data.lastModified).toLocaleTimeString()}`);
        soundFx.playSuccess();
        // Refresh local view immediately
        await fetchLiveDatabase();
      } else {
        setWriteFeedback(`❌ Write failed: ${data.error}`);
      }
    } catch (err: any) {
      setWriteFeedback(`❌ Network error: ${err.message}`);
    } finally {
      setTestWriting(false);
      setTimeout(() => setWriteFeedback(null), 6000);
    }
  };

  const touristsList = Object.values(dbData?.tourists || {});
  const filteredTourists = touristsList.filter((t: any) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.profile?.name?.toLowerCase().includes(q) ||
      t.email?.toLowerCase().includes(q) ||
      t.profile?.passportNumber?.toLowerCase().includes(q) ||
      t.profile?.nationality?.toLowerCase().includes(q)
    );
  });

  const sosList = dbData?.sos_alerts || [];
  const filteredSos = sosList.filter((s: any) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.touristName?.toLowerCase().includes(q) ||
      s.caseId?.toLowerCase().includes(q) ||
      s.trackingNotes?.toLowerCase().includes(q) ||
      s.status?.toLowerCase().includes(q)
    );
  });

  const incidentList = dbData?.incidents || [];
  const filteredIncidents = incidentList.filter((inc: any) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      inc.caseId?.toLowerCase().includes(q) ||
      inc.title?.toLowerCase().includes(q) ||
      inc.touristName?.toLowerCase().includes(q) ||
      inc.assignedStation?.toLowerCase().includes(q) ||
      inc.assignedOfficer?.toLowerCase().includes(q)
    );
  });

  const digitalIdList = Object.values(dbData?.digital_ids || {});
  const filteredDigitalIds = digitalIdList.filter((d: any) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      d.digitalId?.toLowerCase().includes(q) ||
      d.touristName?.toLowerCase().includes(q) ||
      d.passportOrAadhaar?.toLowerCase().includes(q) ||
      d.tripId?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="w-full max-w-5xl h-[92vh] flex flex-col rounded-3xl border border-slate-700 bg-slate-900 text-white shadow-2xl overflow-hidden">
        
        {/* Top Header Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/80 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold tracking-tight">Live Persistent JSON Database</h2>
                <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  REAL ON-DISK FILE
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400 font-mono mt-0.5">
                <span className="text-cyan-300 font-semibold">{fileMeta?.filePath || 'data/safetour_db.json'}</span>
                <span>•</span>
                <span>{fileMeta?.fileSizeKb ? `${fileMeta.fileSizeKb} KB` : '...'}</span>
                <span>•</span>
                <span className="text-slate-500 text-[11px]">
                  Saved: {fileMeta?.lastModified ? new Date(fileMeta.lastModified).toLocaleTimeString() : '...'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchLiveDatabase}
              disabled={loading}
              title="Refresh live data from server"
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              onClick={handleTestWrite}
              disabled={testWriting}
              title="Performs real disk write test to data/safetour_db.json"
              className="px-3 py-1.5 rounded-xl bg-cyan-600/30 hover:bg-cyan-600/40 border border-cyan-500/40 text-xs font-bold text-cyan-300 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Zap className={`h-3.5 w-3.5 text-cyan-400 ${testWriting ? 'animate-bounce' : ''}`} />
              <span className="hidden sm:inline">Test Real Disk Write</span>
            </button>

            <a
              href="/api/database/download"
              download="safetour_db.json"
              title="Download raw safetour_db.json directly"
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download .json</span>
            </a>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer ml-1"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Real Write Feedback Banner */}
        {writeFeedback && (
          <div className="px-5 py-2.5 bg-cyan-950/80 border-b border-cyan-500/30 text-xs text-cyan-200 flex items-center justify-between gap-3 animate-in slide-in-from-top duration-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" />
              <span>{writeFeedback}</span>
            </div>
            <button onClick={() => setWriteFeedback(null)} className="text-cyan-400 hover:text-white text-xs">
              ✕
            </button>
          </div>
        )}

        {/* Database Metric Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 p-3 sm:px-5 sm:py-3 bg-slate-900/60 border-b border-slate-800 text-xs shrink-0">
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="text-[10px] text-slate-400 uppercase font-mono">Tourists & Users</div>
            <div className="text-lg font-black text-cyan-400 mt-0.5">{fileMeta?.summary?.totalTourists ?? 0}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="text-[10px] text-slate-400 uppercase font-mono">Active SOS Alerts</div>
            <div className="text-lg font-black text-rose-400 mt-0.5">{fileMeta?.summary?.totalSosAlerts ?? 0}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="text-[10px] text-slate-400 uppercase font-mono">E-FIR Incident Cases</div>
            <div className="text-lg font-black text-amber-400 mt-0.5">{fileMeta?.summary?.totalIncidents ?? 0}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="text-[10px] text-slate-400 uppercase font-mono">Digital IDs (SHA-256)</div>
            <div className="text-lg font-black text-emerald-400 mt-0.5">{fileMeta?.summary?.totalDigitalIds ?? 0}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 col-span-2 sm:col-span-1">
            <div className="text-[10px] text-slate-400 uppercase font-mono">File Size on Disk</div>
            <div className="text-lg font-black text-slate-200 mt-0.5">{fileMeta?.fileSizeKb ?? '0'} KB</div>
          </div>
        </div>

        {/* Filter Navigation & Search Bar */}
        <div className="px-4 sm:px-5 py-2.5 border-b border-slate-800 bg-slate-950/40 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {[
              { id: 'raw', label: '📦 Raw JSON', count: null },
              { id: 'tourists', label: '👥 Tourists', count: touristsList.length },
              { id: 'sos', label: '🚨 SOS Records', count: sosList.length },
              { id: 'incidents', label: '⚖️ E-FIR Cases', count: incidentList.length },
              { id: 'digital_ids', label: '🛡️ Digital IDs', count: digitalIdList.length },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  soundFx.playClick();
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                    : 'bg-slate-800/70 hover:bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== null && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    activeTab === tab.id ? 'bg-cyan-800 text-white' : 'bg-slate-700 text-slate-300'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-60">
              <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search across JSON records..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-800/90 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            <button
              onClick={handleCopyJson}
              title="Copy active view JSON to clipboard"
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-300 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy JSON</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Content Viewer Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 bg-slate-950/60 font-mono text-xs">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center space-y-3">
              <div className="h-8 w-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
              <p className="text-slate-400 text-xs font-sans">Reading data/safetour_db.json from server...</p>
            </div>
          ) : activeTab === 'raw' ? (
            /* RAW JSON VIEW */
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-sans pb-1 border-b border-slate-800">
                <span>Direct contents of <code className="text-cyan-400">data/safetour_db.json</code></span>
                <span>{JSON.stringify(dbData || {}).length} characters</span>
              </div>
              <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 text-cyan-300 text-[11px] leading-relaxed overflow-x-auto selection:bg-cyan-900 selection:text-white">
                {JSON.stringify(dbData, null, 2)}
              </pre>
            </div>
          ) : activeTab === 'tourists' ? (
            /* TOURISTS COLLECTION VIEW */
            <div className="space-y-3 font-sans">
              <div className="text-xs text-slate-400">
                Found {filteredTourists.length} tourist records in database:
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredTourists.map((tourist: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-bold text-sm text-white flex items-center gap-2">
                          {tourist.profile?.name || tourist.email}
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30">
                            {tourist.role}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400">{tourist.email}</div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-emerald-400">
                          Safety: {tourist.safetyScore ?? 88}/100
                        </span>
                        <div className="text-[10px] text-slate-500 font-mono">
                          Battery: {tourist.batteryLevel ?? 85}%
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] font-mono p-2.5 rounded-xl bg-slate-950 border border-slate-800/70 text-slate-300">
                      <div>Passport/Doc: <span className="text-white font-bold">{tourist.profile?.passportNumber || 'N/A'}</span></div>
                      <div>Nationality: <span className="text-white font-bold">{tourist.profile?.nationality || 'N/A'}</span></div>
                      <div>Emergency: <span className="text-white font-bold">{tourist.profile?.emergencyContactPhone || 'N/A'}</span></div>
                      <div>Digital Pass: <span className="text-cyan-400 font-bold">{tourist.profile?.qrPassCode || 'N/A'}</span></div>
                    </div>

                    {tourist.previousLocation && (
                      <div className="text-[10px] font-mono text-slate-400 flex items-center justify-between border-t border-slate-800 pt-2">
                        <span>Last Lat/Lng: {tourist.previousLocation.lat?.toFixed(4)}, {tourist.previousLocation.lng?.toFixed(4)}</span>
                        <span>{new Date(tourist.previousLocation.timestamp).toLocaleTimeString()}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : activeTab === 'sos' ? (
            /* SOS ALERTS VIEW */
            <div className="space-y-3 font-sans">
              <div className="text-xs text-slate-400">
                Found {filteredSos.length} SOS emergencies logged in persistent ledger:
              </div>
              <div className="space-y-2.5">
                {filteredSos.map((sos: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className={`h-4 w-4 ${sos.isAnomaly ? 'text-amber-400' : 'text-rose-400'}`} />
                        <span className="font-bold text-sm text-white">{sos.touristName}</span>
                        <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300">
                          {sos.caseId || sos.id}
                        </span>
                        {sos.isAnomaly && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                            AI-ANOMALY
                          </span>
                        )}
                      </div>
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                        sos.status === 'Resolved' ? 'bg-emerald-500/20 text-emerald-400' :
                        sos.status === 'On-Route' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-rose-500/20 text-rose-400'
                      }`}>
                        {sos.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                      {sos.trackingNotes}
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-400 font-mono">
                      <span>Services: {(sos.servicesRequired || []).join(', ')}</span>
                      <span>Coordinates: {sos.lat?.toFixed(4)}, {sos.lng?.toFixed(4)} ({sos.riskZoneName || 'General'})</span>
                      <span>Triggered: {new Date(sos.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : activeTab === 'incidents' ? (
            /* E-FIR INCIDENTS VIEW */
            <div className="space-y-3 font-sans">
              <div className="text-xs text-slate-400">
                Found {filteredIncidents.length} official E-FIR records:
              </div>
              <div className="space-y-2.5">
                {filteredIncidents.map((inc: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-cyan-400" />
                        <span className="font-extrabold text-sm text-white">{inc.caseId}</span>
                        <span className="text-xs text-slate-300 font-semibold">• {inc.title}</span>
                      </div>
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                        inc.status === 'Resolved' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {inc.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                      {inc.description}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-400 font-mono pt-1">
                      <div>Station: <span className="text-white">{inc.assignedStation}</span></div>
                      <div>Officer: <span className="text-white">{inc.assignedOfficer}</span></div>
                      <div>Complainant: <span className="text-white">{inc.touristName} ({inc.nationality})</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : activeTab === 'digital_ids' ? (
            /* CRYPTOGRAPHIC DIGITAL IDS LEDGER VIEW */
            <div className="space-y-3 font-sans">
              <div className="text-xs text-slate-400">
                Found {filteredDigitalIds.length} Cryptographic Digital ID records verified on ledger:
              </div>
              <div className="space-y-2.5">
                {filteredDigitalIds.map((did: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 font-mono">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-emerald-400" />
                        <span className="font-bold text-xs text-cyan-300">{did.digitalId}</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        {did.isValid ? 'VALID TAMPER-PROOF PASS' : 'REVOKED'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                      <div>Tourist: <span className="text-white font-bold">{did.touristName}</span></div>
                      <div>Document: <span className="text-white font-bold">{did.passportOrAadhaar}</span></div>
                      <div>Trip: <span className="text-white font-bold">{did.tripId}</span></div>
                      <div>Audited: <span className="text-emerald-400 font-bold">{did.verifiedCount} times</span></div>
                    </div>

                    <div className="text-[10px] text-slate-400 bg-slate-950 p-2 rounded-xl border border-slate-800/80 break-all">
                      <span className="text-slate-500">SHA-256 HMAC Signature: </span>
                      <span className="text-emerald-300">{did.signatureHash}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer info bar */}
        <div className="p-3 sm:px-5 border-t border-slate-800 bg-slate-950 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <HardDrive className="h-3.5 w-3.5 text-slate-500" />
            <span>Server File Engine: <b>Node.js FileSystem + JSON Store</b></span>
          </div>
          <div className="text-[11px] text-slate-500">
            Path: <code className="text-slate-400">/data/safetour_db.json</code>
          </div>
        </div>
      </div>
    </div>
  );
}
