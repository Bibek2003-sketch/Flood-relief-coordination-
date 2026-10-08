import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Radio, Shield, CheckCircle2, Clock, AlertTriangle, ArrowLeft, PhoneCall, MapPin, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import socket from '../utils/socket';

interface Step {
  key: string;
  label: string;
  description?: string;
  completed?: boolean;
  done?: boolean;
  current: boolean;
}

interface TrackData {
  requestId: string;
  status: string;
  priority: string;
  categories: string[];
  numberOfPeople: number;
  locationArea: string;
  createdAt: string;
  updatedAt: string;
  assignedTeamName?: string;
  steps: Step[];
  timeline?: Array<{
    status: string;
    title?: string;
    note?: string;
    timestamp: string;
    updatedByName?: string;
  }>;
}

const TrackEmergency: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [requestIdInput, setRequestIdInput] = useState(searchParams.get('id') || '');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<TrackData | null>(null);
  const [searched, setSearched] = useState(false);

  const fetchStatus = useCallback(async (idToQuery: string, showLoading = true) => {
    if (!idToQuery.trim()) {
      if (showLoading) toast.error('Please enter a Request ID (e.g. FLD-2026-10452)');
      return;
    }

    if (showLoading) setLoading(true);
    else setRefreshing(true);
    setSearched(true);

    try {
      const formatted = idToQuery.trim();
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/requests/track/${formatted}`);
      const json = await res.json();

      if (json.success && json.data) {
        setData(prev => {
          if (prev && prev.status !== json.data.status) {
            toast.success(`Status updated: ${json.data.status}`, { icon: '🔄' });
          }
          return json.data;
        });
      } else {
        if (showLoading) {
          setData(null);
          toast.error(json.message || 'Emergency request ID not found. Verify your ID.');
        }
      }
    } catch (err) {
      if (showLoading) {
        setData(null);
        toast.error('Network error checking emergency status.');
      }
    } finally {
      if (showLoading) setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const initialId = searchParams.get('id');
    if (initialId) {
      setRequestIdInput(initialId);
      fetchStatus(initialId, true);
    }
  }, [searchParams, fetchStatus]);

  // Real-time listener: moves to the next step immediately when admin updates status!
  useEffect(() => {
    const activeId = data?.requestId || requestIdInput;
    if (!activeId) return;

    // 1. Polling interval every 3 seconds for instant updates
    const interval = setInterval(() => {
      fetchStatus(activeId, false);
    }, 3000);

    // 2. Real-time WebSocket event
    const handleStatusUpdate = (ev: any) => {
      fetchStatus(activeId, false);
    };

    socket.on('emergency-status-changed', handleStatusUpdate);
    socket.on('request-updated', handleStatusUpdate);

    return () => {
      clearInterval(interval);
      socket.off('emergency-status-changed', handleStatusUpdate);
      socket.off('request-updated', handleStatusUpdate);
    };
  }, [data?.requestId, requestIdInput, fetchStatus]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStatus(requestIdInput, true);
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'Critical':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-red-500/20 text-red-400 border border-red-500/30">CRITICAL</span>;
      case 'High':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">HIGH PRIORITY</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">NORMAL PRIORITY</span>;
    }
  };

  return (
    <div className="min-h-[85vh] bg-[#0b0f19] text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Navigation & Header */}
        <div className="flex items-center justify-between">
          <Link
            to="/emergency"
            className="inline-flex items-center gap-2 text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Submit New Emergency Report</span>
          </Link>
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-[11px] font-mono text-cyan-400">
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>PUBLIC STATUS FEED</span>
          </div>
        </div>

        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 bg-slate-900 border border-slate-800 rounded-2xl shadow-lg mb-2">
            <Radio className="w-8 h-8 text-cyan-400 animate-pulse" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Track Emergency Request</h1>
          <p className="text-sm text-slate-400 max-w-lg mx-auto">
            Check live progress and deployment status for your reported flood distress signal using your unique tracking code.
          </p>
        </div>

        {/* Search Input Box */}
        <div className="bg-[#0f172a] p-6 rounded-2xl border border-slate-800 shadow-xl">
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={requestIdInput}
                onChange={(e) => setRequestIdInput(e.target.value.toUpperCase())}
                placeholder="Enter Request ID e.g. FLD-2026-10452"
                className="w-full pl-11 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm font-mono tracking-wider focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 uppercase"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-mono font-bold rounded-xl text-sm transition-all shadow-md shadow-cyan-950 flex items-center justify-center gap-2 whitespace-nowrap"
            >
              {loading ? 'Searching...' : 'Track Status'}
            </button>
          </form>
          <div className="mt-3 flex items-center gap-2 text-xs text-slate-400 font-mono">
            <Shield className="w-3.5 h-3.5 text-slate-500" />
            <span>Protected Privacy: No caller phone numbers or exact private residential addresses are shown here.</span>
          </div>
        </div>

        {/* Results Timeline Container */}
        {data && (
          <div className="bg-[#0f172a] rounded-2xl border border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6 animate-fadeIn">
            
            {/* Top metadata cards */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">REQUEST IDENTIFIER</span>
                <div className="text-2xl font-black font-mono text-cyan-400 mt-0.5">{data.requestId}</div>
                <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Reported: {new Date(data.createdAt).toLocaleString()}</span>
                </div>
              </div>

              <div className="flex flex-col sm:items-end gap-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">INCIDENT SEVERITY</span>
                <div>{getPriorityBadge(data.priority)}</div>
                <div className="text-xs text-slate-300 font-mono flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{data.locationArea}</span>
                </div>
              </div>
            </div>

            {/* Stepper Timeline */}
            <div>
              <h2 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold mb-4">
                Operational Lifecycle Timeline
              </h2>

              <div className="relative pl-6 sm:pl-8 space-y-6 before:content-[''] before:absolute before:left-2.5 sm:before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                {data.steps.map((step, idx) => {
                  const isDone = Boolean(step.completed || step.done);
                  return (
                    <div key={step.key} className="relative flex items-start gap-4">
                      {/* Step Circle Indicator */}
                      <div
                        className={`absolute -left-6 sm:-left-8 top-0.5 w-6 h-6 rounded-full flex items-center justify-center text-xs transition-all ${
                          isDone
                            ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                            : step.current
                            ? 'bg-cyan-500 text-slate-950 font-bold ring-4 ring-cyan-500/20 animate-pulse'
                            : 'bg-slate-900 border border-slate-700 text-slate-600'
                        }`}
                      >
                        {isDone ? (
                          <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                        ) : (
                          <span>{idx + 1}</span>
                        )}
                      </div>

                      {/* Step Content */}
                      <div className="flex-1">
                        <div
                          className={`text-sm font-bold font-mono tracking-wide ${
                            step.current
                              ? 'text-cyan-400 font-extrabold'
                              : isDone
                              ? 'text-slate-200'
                              : 'text-slate-500'
                          }`}
                        >
                          {step.label}
                        </div>

                        {step.description && (
                          <div className="text-xs text-slate-400 mt-0.5 font-mono">
                            {step.description}
                          </div>
                        )}

                        {step.current && (
                          <div className="mt-1 text-xs text-cyan-300/90 bg-cyan-950/50 border border-cyan-900/80 p-2 rounded-lg inline-block font-mono">
                            ⚡ Current Active Stage
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Historical Timestamped Activity Log */}
            {data.timeline && data.timeline.length > 0 && (
              <div className="pt-4 border-t border-slate-800 space-y-3">
                <div className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Verified Operational Dispatch Log</span>
                </div>
                <div className="space-y-2 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                  {data.timeline.map((event, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs border-b border-slate-800/60 pb-2 last:border-0 last:pb-0">
                      <div>
                        <span className="font-bold text-white font-mono">{event.title || event.status}</span>
                        {event.note && <span className="text-slate-400 block text-[11px] mt-0.5">{event.note}</span>}
                      </div>
                      <div className="text-[10px] font-mono text-cyan-400/80 shrink-0">
                        {new Date(event.timestamp).toLocaleString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Assigned Details */}
            {data.assignedTeamName && (
              <div className="pt-4 border-t border-slate-800 bg-slate-900/70 p-4 rounded-xl border">
                <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">DISPATCHED RESCUE SQUAD</div>
                <div className="text-sm font-bold text-white mt-1 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-amber-400" />
                  <span>{data.assignedTeamName}</span>
                </div>
              </div>
            )}

            {/* Help Hotline footer */}
            <div className="p-4 bg-red-950/20 border border-red-500/30 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
                <div className="text-xs text-red-200">
                  <span className="font-bold">Life threatening immediate danger?</span> Call Emergency NDRF / SDRF Control immediately.
                </div>
              </div>
              <a
                href="tel:1070"
                className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 shrink-0 transition-all"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Dial 1070</span>
              </a>
            </div>

          </div>
        )}

        {searched && !loading && !data && (
          <div className="bg-[#0f172a] p-8 rounded-2xl border border-slate-800 text-center space-y-3">
            <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto" />
            <h3 className="text-lg font-bold text-white">No Record Found</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Please double check the ID entered. Format is typically <span className="font-mono text-cyan-400">FLD-YYYY-XXXXX</span>. If you recently submitted, please allow a few moments for the database to sync.
            </p>
          </div>
        )}

      </div>
    </div>
  );
};

export default TrackEmergency;
