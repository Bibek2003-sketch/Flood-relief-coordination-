import { useState, useEffect } from 'react';
import MapComponent from '../components/MapComponent';

const Dashboard = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [shelters, setShelters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const reqsRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/requests`);
        const sheltRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/shelters`);
        
        const reqsData = await reqsRes.json();
        const sheltData = await sheltRes.json();
        
        if (reqsData.status === 'success' || reqsData.success) setRequests(reqsData.data);
        if (sheltData.status === 'success' || sheltData.success) setShelters(sheltData.data);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto w-full relative z-10">
      <h1 className="text-4xl font-extrabold text-white mb-8 drop-shadow-md">Command Center Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-white/20 hover:bg-white/15 transition-all">
          <div className="text-sm font-medium text-white/70 mb-1 uppercase tracking-wide">Active Incidents</div>
          <div className="text-4xl font-bold text-cyan-300 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">0</div>
        </div>
        <div className="bg-red-500/20 backdrop-blur-md p-6 rounded-2xl shadow-[0_0_15px_rgba(239,68,68,0.3)] border border-red-500/30 hover:bg-red-500/30 transition-all">
          <div className="text-sm font-medium text-red-200 mb-1 uppercase tracking-wide">Total Requests</div>
          <div className="text-4xl font-bold text-red-400 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]">{loading ? '...' : requests.length}</div>
        </div>
        <div className="bg-emerald-500/20 backdrop-blur-md p-6 rounded-2xl shadow-[0_0_15px_rgba(16,185,129,0.3)] border border-emerald-500/30 hover:bg-emerald-500/30 transition-all">
          <div className="text-sm font-medium text-emerald-200 mb-1 uppercase tracking-wide">People Rescued</div>
          <div className="text-4xl font-bold text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]">0</div>
        </div>
        <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-white/20 hover:bg-white/15 transition-all">
          <div className="text-sm font-medium text-white/70 mb-1 uppercase tracking-wide">Active Shelters</div>
          <div className="text-4xl font-bold text-cyan-300 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">{loading ? '...' : shelters.length}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-black/40 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 min-h-[400px] flex items-center justify-center relative overflow-hidden z-0 p-2">
          {loading ? (
            <div className="text-white/50 animate-pulse">Loading Live Map...</div>
          ) : (
            <MapComponent 
              center={[26.1445, 91.7362]} 
              zoom={12} 
              requests={requests}
              incidents={[]} // Add real incidents later
              shelters={shelters}
            />
          )}
        </div>
        
        <div className="bg-black/40 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/10">
          <h3 className="font-bold text-xl mb-6 text-white border-b border-white/10 pb-4">Live Activity Feed</h3>
          <div className="space-y-6">
            <div className="border-l-4 border-red-500 pl-4 relative">
              <div className="absolute -left-[11px] top-1 w-4 h-4 bg-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.8)] border-2 border-black"></div>
              <p className="text-sm text-white/90">New critical rescue request in Ward 7</p>
              <span className="text-xs text-red-300/70 font-medium mt-1 block">2 mins ago</span>
            </div>
            <div className="border-l-4 border-emerald-500 pl-4 relative">
              <div className="absolute -left-[11px] top-1 w-4 h-4 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.8)] border-2 border-black"></div>
              <p className="text-sm text-white/90">Rescue Team Alpha completed mission. 5 people rescued.</p>
              <span className="text-xs text-emerald-300/70 font-medium mt-1 block">15 mins ago</span>
            </div>
            <div className="border-l-4 border-amber-500 pl-4 relative">
              <div className="absolute -left-[11px] top-1 w-4 h-4 bg-amber-500 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.8)] border-2 border-black"></div>
              <p className="text-sm text-white/90">Relief Camp #12 capacity reached 85%</p>
              <span className="text-xs text-amber-300/70 font-medium mt-1 block">1 hour ago</span>
            </div>
            <div className="border-l-4 border-cyan-500 pl-4 relative">
              <div className="absolute -left-[11px] top-1 w-4 h-4 bg-cyan-500 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.8)] border-2 border-black"></div>
              <p className="text-sm text-white/90">50 food kits distributed at Camp 03</p>
              <span className="text-xs text-cyan-300/70 font-medium mt-1 block">2 hours ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
