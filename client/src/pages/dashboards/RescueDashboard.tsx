import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import {
  LifeBuoy,
  MapPin,
  Users,
  CheckCircle2,
  Clock,
  Phone,
  AlertTriangle,
  Navigation,
  RefreshCw,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';

interface RescueEmergency {
  _id: string;
  requestID?: string;
  requestId?: string;
  citizenName: string;
  contact: string;
  location: string;
  numberOfPeople: number;
  numberOfChildren?: number;
  numberOfElderly?: number;
  numberOfDisabled?: number;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: string;
  requestCategory: string[];
  description?: string;
  notes?: string;
  coordinates?: {
    type: string;
    coordinates: number[];
  };
  createdAt: string;
}

const RescueDashboard: React.FC = () => {
  const { user, token } = useAuth();
  const [missions, setMissions] = useState<RescueEmergency[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMission, setSelectedMission] = useState<RescueEmergency | null>(null);

  const fetchMissions = async () => {
    try {
      setRefreshing(true);
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/rescue/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.data) {
        setMissions(data.data.emergencies || []);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load assigned rescue missions');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchMissions();
    }
  }, [token]);

  const handleUpdateStatus = async (missionId: string, nextStatus: string) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/rescue/missions/${missionId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: nextStatus })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Mission updated: ${nextStatus}`);
        fetchMissions();
        if (selectedMission && selectedMission._id === missionId) {
          setSelectedMission({ ...selectedMission, status: nextStatus });
        }
      } else {
        toast.error(data.message || 'Status update failed');
      }
    } catch (e) {
      toast.error('Network error updating status');
    }
  };

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case 'Critical':
        return <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse">CRITICAL DISPATCH</span>;
      case 'High':
        return <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">HIGH PRIORITY</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">STANDARD MISSION</span>;
    }
  };

  const getLifecycleControls = (mission: RescueEmergency) => {
    const current = (mission.status || '').toUpperCase();
    
    if (current === 'ASSIGNED') {
      return (
        <button
          onClick={() => handleUpdateStatus(mission._id, 'ACCEPTED')}
          className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all shadow-md"
        >
          <span>Acknowledge &amp; Accept Mission</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      );
    }

    if (current === 'ACCEPTED') {
      return (
        <button
          onClick={() => handleUpdateStatus(mission._id, 'ON_THE_WAY')}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all shadow-md"
        >
          <Navigation className="w-3.5 h-3.5 animate-pulse" />
          <span>Squad Dispatched (On The Way)</span>
        </button>
      );
    }

    if (current === 'ON_THE_WAY') {
      return (
        <button
          onClick={() => handleUpdateStatus(mission._id, 'RESCUE_IN_PROGRESS')}
          className="w-full py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all shadow-md"
        >
          <LifeBuoy className="w-3.5 h-3.5 animate-spin" />
          <span>Arrived On Site (Rescue In Progress)</span>
        </button>
      );
    }

    if (current === 'RESCUE_IN_PROGRESS') {
      return (
        <button
          onClick={() => handleUpdateStatus(mission._id, 'COMPLETED')}
          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all shadow-md"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Victims Extracted &amp; Mission Complete</span>
        </button>
      );
    }

    return (
      <div className="text-center py-2 text-xs font-mono text-emerald-400 bg-emerald-950/30 rounded-xl border border-emerald-500/20">
        ✓ Mission Successfully Resolved
      </div>
    );
  };

  const activeMissions = missions.filter(m => !['COMPLETED', 'RESOLVED', 'Completed', 'Resolved'].includes(m.status));
  const completedMissions = missions.filter(m => ['COMPLETED', 'RESOLVED', 'Completed', 'Resolved'].includes(m.status));

  return (
    <DashboardLayout
      title="Rescue Squad Mission Terminal"
      subtitle={`Unit Call-sign: ${user?.organization || `${user?.firstName} ${user?.lastName}`} | NDRF/SDRF Operations`}
      actionButton={
        <button
          onClick={fetchMissions}
          disabled={refreshing}
          className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-mono flex items-center gap-2 border border-slate-700 transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-amber-400' : ''}`} />
          <span>Refresh Missions</span>
        </button>
      }
    >
      {/* Top Mission Status Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#0f172a] p-5 rounded-2xl border border-amber-500/40 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-bold">Active Missions Assigned</div>
            <div className="text-3xl font-black font-mono text-white mt-1">{activeMissions.length}</div>
          </div>
          <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400">
            <LifeBuoy className="w-7 h-7" />
          </div>
        </div>

        <div className="bg-[#0f172a] p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-bold">Rescued / Completed</div>
            <div className="text-3xl font-black font-mono text-white mt-1">{completedMissions.length}</div>
          </div>
          <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
            <CheckCircle2 className="w-7 h-7" />
          </div>
        </div>

        <div className="bg-[#0f172a] p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 font-bold">Field Readiness Status</div>
            <div className="text-sm font-bold text-white mt-2 flex items-center gap-1.5 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>DEPLOYED ON DUTY</span>
            </div>
          </div>
          <div className="p-3 bg-cyan-500/10 rounded-xl text-cyan-400">
            <Navigation className="w-7 h-7" />
          </div>
        </div>
      </div>

      {/* Main Mission List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            <span>Assigned Emergency Extractions</span>
          </h2>
          <span className="text-xs font-mono text-slate-400">{activeMissions.length} Pending Squad Action</span>
        </div>

        {missions.length === 0 ? (
          <div className="bg-[#0f172a] p-10 rounded-2xl border border-slate-800 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <h3 className="text-lg font-bold text-white">No Assigned Extractions Currently</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Your rescue unit is on standby. When Central HQ assigns a flood distress call to your unit, it will appear here instantly with full coordinates.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {missions.map((mission) => {
              const reqId = mission.requestID || mission.requestId || mission._id.slice(-6).toUpperCase();
              const isResolved = ['COMPLETED', 'RESOLVED', 'Completed', 'Resolved'].includes(mission.status);

              return (
                <div
                  key={mission._id}
                  className={`bg-[#0f172a] rounded-2xl border p-5 space-y-4 transition-all shadow-xl ${
                    mission.priority === 'Critical'
                      ? 'border-red-500/40 ring-1 ring-red-500/20'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-[10px] font-mono text-cyan-400 font-bold tracking-wider">
                        MISSION ID: {reqId}
                      </div>
                      <div className="text-lg font-bold text-white mt-0.5">
                        {mission.citizenName}
                      </div>
                    </div>
                    {getPriorityBadge(mission.priority)}
                  </div>

                  <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 text-xs font-mono space-y-2">
                    <div className="flex items-start gap-2 text-slate-200">
                      <MapPin className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                      <span>{mission.location}</span>
                    </div>

                    <div className="flex items-center gap-4 text-slate-400 pt-1">
                      <div className="flex items-center gap-1.5 text-white font-semibold">
                        <Users className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{mission.numberOfPeople} affected</span>
                      </div>

                      {mission.contact && (
                        <a
                          href={`tel:${mission.contact}`}
                          className="flex items-center gap-1 text-cyan-400 hover:underline"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>{mission.contact}</span>
                        </a>
                      )}
                    </div>

                    {(mission.numberOfChildren || mission.numberOfElderly || mission.numberOfDisabled) ? (
                      <div className="text-[11px] text-amber-300/80 bg-amber-950/20 p-2 rounded-lg border border-amber-900/40">
                        Special care required: {mission.numberOfChildren || 0} children, {mission.numberOfElderly || 0} elderly, {mission.numberOfDisabled || 0} disabled persons.
                      </div>
                    ) : null}

                    {mission.description && (
                      <p className="text-[11px] text-slate-300 italic pt-1 border-t border-slate-800/80">
                        "{mission.description}"
                      </p>
                    )}
                  </div>

                  {/* Stage / Lifecycle Progression Controller */}
                  <div>
                    <div className="text-[10px] font-mono uppercase text-slate-400 mb-1.5 font-semibold">
                      Current Stage: <span className="text-cyan-400">{mission.status}</span>
                    </div>
                    {getLifecycleControls(mission)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default RescueDashboard;
