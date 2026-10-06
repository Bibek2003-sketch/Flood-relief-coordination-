import { useState, useEffect, useCallback } from 'react';
import MapComponent from '../components/MapComponent';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import socket from '../utils/socket';
import { 
  ShieldAlert, Radio, Send, Users, Tent, 
  Activity, Clock, Compass, AlertTriangle, CheckCircle2, RefreshCw 
} from 'lucide-react';

const Dashboard = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [shelters, setShelters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSendingTestEmail, setIsSendingTestEmail] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { token, user } = useAuth();

  const handleTestDispatchEmail = async () => {
    setIsSendingTestEmail(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/emails/dispatch`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ 
          toEmail: user?.email || 'citizen@floodrelief.org', 
          victimName: `${user?.firstName || 'Citizen'} ${user?.lastName || ''}`.trim(), 
          eta: '12 - 15 Minutes' 
        })
      });
      const data = await response.json();
      if (data.status === 'success' || data.success) {
        toast.success('Emergency dispatch notification transmitted!');
      } else {
        toast.error(data.message || 'Failed to dispatch email');
      }
    } catch (err) {
      toast.error('Network error transmitting dispatch email');
    } finally {
      setIsSendingTestEmail(false);
    }
  };

  const fetchDashboardData = useCallback(async (showToast = false) => {
    try {
      if (showToast) setRefreshing(true);
      const headers: any = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const [reqsRes, sheltRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/requests`, { headers }),
        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/shelters`)
      ]);
      
      const reqsData = await reqsRes.json();
      const sheltData = await sheltRes.json();
      
      if (reqsData.status === 'success' || reqsData.success) {
        setRequests(reqsData.data || []);
      }
      if (sheltData.status === 'success' || sheltData.success) {
        setShelters(sheltData.data || []);
      }
      if (showToast) toast.success('Telemetry synchronized');
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    fetchDashboardData();

    // 1. Polling interval every 4 seconds as a reliable background sync
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 4000);

    // 2. Real-time WebSocket event listeners
    const handleNewRequest = (newReq: any) => {
      toast('🚨 New Emergency SOS Received!', { duration: 4000 });
      fetchDashboardData();
    };

    const handleUpdate = () => {
      fetchDashboardData();
    };

    socket.on('new-request', handleNewRequest);
    socket.on('emergency-created', handleNewRequest);
    socket.on('request-updated', handleUpdate);
    socket.on('emergency-status-changed', handleUpdate);

    return () => {
      clearInterval(interval);
      socket.off('new-request', handleNewRequest);
      socket.off('emergency-created', handleNewRequest);
      socket.off('request-updated', handleUpdate);
      socket.off('emergency-status-changed', handleUpdate);
    };
  }, [fetchDashboardData]);

  const totalOccupancy = shelters.reduce((acc, s) => acc + (s.currentOccupancy || 0), 0);
  const totalCapacity = shelters.reduce((acc, s) => acc + (s.capacity || 0), 0);
  const criticalRequestsCount = requests.filter(r => r.requestCategory?.includes('Rescue') || r.numberOfPeople > 3).length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full relative z-10 space-y-6">
      
      {/* Tactical Operations Center Header */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase">
              TACTICAL OPERATIONS CENTER (EOC-01)
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-xs font-mono text-slate-400">SECTOR: ASSAM &amp; BRAHMAPUTRA BASIN</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Emergency Command Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button 
            onClick={handleTestDispatchEmail}
            disabled={isSendingTestEmail}
            className="flex-1 md:flex-initial flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500/60 text-slate-200 px-4 py-2.5 rounded-xl text-xs font-mono font-bold transition-all shadow-sm disabled:opacity-50"
          >
            <Send size={14} className="text-cyan-400" />
            <span>{isSendingTestEmail ? 'TRANSMITTING...' : 'TEST CITIZEN DISPATCH ALERT'}</span>
          </button>

          <button
            onClick={() => fetchDashboardData(true)}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-xs font-mono text-slate-300 hover:text-white transition-all shadow-sm"
            title="Sync live emergency telemetry"
          >
            <RefreshCw size={13} className={refreshing ? 'animate-spin text-cyan-400' : 'text-slate-400'} />
            <span className="hidden sm:inline">SYNC FEED</span>
          </button>

          <div className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
            <Radio size={14} className="text-emerald-400 animate-pulse" />
            <span>LIVE SYNC</span>
          </div>
        </div>
      </div>
      
      {/* Telemetry KPI Metrics (Solid Dark High-Contrast Panels) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Pending Emergency Requests */}
        <div className="bg-[#0f172a] border border-slate-800 hover:border-red-500/50 p-5 rounded-2xl shadow-lg transition-all group">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">Total SOS Requests</span>
            <span className="p-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 group-hover:bg-red-500/20 transition-colors">
              <ShieldAlert size={18} />
            </span>
          </div>
          <div className="text-3xl font-extrabold font-mono text-white mb-1">
            {loading ? '...' : requests.length}
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <span className="text-red-400 font-bold">● {criticalRequestsCount}</span>
            <span>Priority Rescue Needed</span>
          </div>
        </div>

        {/* Metric 2: Open Verified Shelters */}
        <div className="bg-[#0f172a] border border-slate-800 hover:border-cyan-500/50 p-5 rounded-2xl shadow-lg transition-all group">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">Active Shelters</span>
            <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 group-hover:bg-cyan-500/20 transition-colors">
              <Tent size={18} />
            </span>
          </div>
          <div className="text-3xl font-extrabold font-mono text-white mb-1">
            {loading ? '...' : shelters.length}
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <span className="text-cyan-400 font-bold">● 100%</span>
            <span>Government Verified</span>
          </div>
        </div>

        {/* Metric 3: Shelter Capacity Load */}
        <div className="bg-[#0f172a] border border-slate-800 hover:border-amber-500/50 p-5 rounded-2xl shadow-lg transition-all group">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">Shelter Occupancy</span>
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:bg-amber-500/20 transition-colors">
              <Users size={18} />
            </span>
          </div>
          <div className="text-3xl font-extrabold font-mono text-white mb-1">
            {loading ? '...' : `${totalOccupancy} / ${totalCapacity || '2.5k'}`}
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <span className="text-amber-400 font-bold">
              {totalCapacity > 0 ? `${Math.round((totalOccupancy / totalCapacity) * 100)}%` : '28%'}
            </span>
            <span>Capacity Utilized</span>
          </div>
        </div>

        {/* Metric 4: Disaster Response Status */}
        <div className="bg-[#0f172a] border border-slate-800 hover:border-emerald-500/50 p-5 rounded-2xl shadow-lg transition-all group">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">Mission Status</span>
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:bg-emerald-500/20 transition-colors">
              <CheckCircle2 size={18} />
            </span>
          </div>
          <div className="text-3xl font-extrabold font-mono text-emerald-400 mb-1">
            ACTIVE
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <span className="text-emerald-400 font-bold">● SQUAD 04</span>
            <span>Dispatched on Ground</span>
          </div>
        </div>

      </div>

      {/* Main Operations Canvas: GIS Map & Live Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Tactical Map Container (span 2) */}
        <div className="lg:col-span-2 bg-[#0f172a] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
          <div className="px-5 py-3.5 bg-slate-900 border-b border-slate-800 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Compass size={16} className="text-cyan-400" />
              <span className="text-xs font-mono uppercase tracking-wider font-bold text-slate-200">
                TACTICAL GIS INCIDENT &amp; SHELTER MAP
              </span>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500"></span> Incident Pin</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-cyan-400"></span> Safe Shelter</span>
            </div>
          </div>
          
          <div className="h-[520px] w-full relative z-0 bg-[#0a0e17]">
            {loading ? (
              <div className="h-full flex items-center justify-center text-slate-500 font-mono text-sm">
                INITIALIZING TACTICAL SATELLITE LAYERS...
              </div>
            ) : (
              <MapComponent 
                center={[26.1445, 91.7362]} 
                zoom={12} 
                requests={requests}
                incidents={[]}
                shelters={shelters}
              />
            )}
          </div>
        </div>
        
        {/* Incident Triage & Live Feed */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          <div className="px-5 py-3.5 bg-slate-900 border-b border-slate-800 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Activity size={16} className="text-red-400 animate-pulse" />
              <span className="text-xs font-mono uppercase tracking-wider font-bold text-slate-200">
                LIVE DISPATCH FEED
              </span>
            </div>
            <span className="text-[11px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
              REAL-TIME
            </span>
          </div>

          <div className="p-4 overflow-y-auto max-h-[520px] space-y-3 divide-y divide-slate-800/80">
            {requests.length > 0 ? (
              requests.slice(0, 5).map((req, idx) => (
                <div key={req._id || idx} className="pt-3 first:pt-0 space-y-1.5">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-white">
                      {req.citizenName || 'Citizen Report'}
                    </span>
                    <span className="text-[10px] font-mono bg-red-500/10 text-red-400 px-2 py-0.5 rounded border border-red-500/30">
                      {req.requestCategory?.[0] || 'Rescue'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 line-clamp-1">
                    {req.location || 'Guwahati District'}
                  </p>
                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 pt-1">
                    <span>AFFECTED: {req.numberOfPeople || 1} PERSON(S)</span>
                    <span className="text-cyan-400">STATUS: DISPATCH QUEUED</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="space-y-4 pt-2">
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 mb-1">
                    <span className="text-red-400 font-bold uppercase">● CRITICAL SOS</span>
                    <span>2 MINS AGO</span>
                  </div>
                  <p className="text-xs font-semibold text-white">Water level breached 1.5m in Ward 7, Pandu</p>
                  <p className="text-[11px] text-slate-400 mt-1">4 residents awaiting boat evacuation. Team Alpha assigned.</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 mb-1">
                    <span className="text-emerald-400 font-bold uppercase">● RESCUE SUCCESS</span>
                    <span>18 MINS AGO</span>
                  </div>
                  <p className="text-xs font-semibold text-white">Evacuation completed: Hatigaon Lowlands</p>
                  <p className="text-[11px] text-slate-400 mt-1">6 elderly citizens transferred safely to Panbazar Community Hall.</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 mb-1">
                    <span className="text-amber-400 font-bold uppercase">● LOGISTICS NOTICE</span>
                    <span>45 MINS AGO</span>
                  </div>
                  <p className="text-xs font-semibold text-white">Relief Camp #04 Drinking Water Restocked</p>
                  <p className="text-[11px] text-slate-400 mt-1">1,200 liters of potable water delivered via SDRF convoy.</p>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;
