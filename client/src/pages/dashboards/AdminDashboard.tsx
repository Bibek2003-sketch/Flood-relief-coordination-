import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import {
  Activity,
  AlertTriangle,
  LifeBuoy,
  Users,
  HeartHandshake,
  MapPin,
  Package,
  CheckCircle,
  XCircle,
  Clock,
  Shield,
  Search,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Filter
} from 'lucide-react';
import toast from 'react-hot-toast';
import { socket } from '../../utils/socket';

interface AdminStats {
  totalEmergencies: number;
  criticalEmergencies: number;
  pendingEmergencies: number;
  activeRescues: number;
  completedRescues: number;
  rescueTeamsCount: number;
  volunteersCount: number;
  ngosCount: number;
  reliefCampsCount: number;
  inventoryStats: {
    totalItems: number;
    totalQuantity: number;
    lowStockCount: number;
  };
}

interface Emergency {
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
  assignedTeam?: {
    _id: string;
    teamId?: string;
    name?: string;
    teamLeader?: string;
    numberOfMembers?: number;
    vehicleAssigned?: string;
    contactNumber?: string;
    currentLocation?: string;
    firstName?: string;
    lastName?: string;
    organization?: string;
    phone?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface RescueTeam {
  _id: string;
  teamId: string;
  name: string;
  teamLeader: string;
  numberOfMembers: number;
  contactNumber: string;
  currentLocation: string;
  skills: string[];
  vehicleAssigned: string;
  status: 'AVAILABLE' | 'ASSIGNED' | 'ON_MISSION' | 'MAINTENANCE';
  currentMission?: any;
}

const AdminDashboard: React.FC = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [emergencies, setEmergencies] = useState<Emergency[]>([]);
  const [rescueTeams, setRescueTeams] = useState<RescueTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected emergency for assignment or inspection
  const [selectedEmergency, setSelectedEmergency] = useState<Emergency | null>(null);
  const [assigningTeamId, setAssigningTeamId] = useState('');
  const [updatingPriority, setUpdatingPriority] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState('');

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      const headers = { Authorization: `Bearer ${token}` };
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

      const [statsRes, emergRes, teamsRes] = await Promise.all([
        fetch(`${baseUrl}/admin/stats`, { headers }),
        fetch(`${baseUrl}/admin/emergencies?status=${statusFilter}&priority=${priorityFilter}&search=${searchQuery}`, { headers }),
        fetch(`${baseUrl}/admin/rescue-teams?availableOnly=true`, { headers })
      ]);

      const [statsData, emergData, teamsData] = await Promise.all([
        statsRes.json(),
        emergRes.json(),
        teamsRes.json()
      ]);

      if (statsData.success) setStats(statsData.data);
      if (emergData.success) setEmergencies(emergData.data);
      if (teamsData.success) setRescueTeams(teamsData.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load command center telemetry');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchDashboardData();
    }
  }, [token, statusFilter, priorityFilter]);

  useEffect(() => {
    const handleLiveSync = () => {
      fetchDashboardData();
    };

    socket.on('rescue-team-updated', handleLiveSync);
    socket.on('emergency-status-changed', handleLiveSync);
    socket.on('request-updated', handleLiveSync);
    socket.on('new-request', handleLiveSync);

    return () => {
      socket.off('rescue-team-updated', handleLiveSync);
      socket.off('emergency-status-changed', handleLiveSync);
      socket.off('request-updated', handleLiveSync);
      socket.off('new-request', handleLiveSync);
    };
  }, []);

  const handleAssignTeam = async (emergencyId: string) => {
    if (!assigningTeamId) {
      toast.error('Please select a rescue team first');
      return;
    }
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/admin/emergencies/${emergencyId}/assign`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ assignedTeamId: assigningTeamId })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || 'Rescue team assigned!');
        setSelectedEmergency(null);
        setAssigningTeamId('');
        fetchDashboardData();
      } else {
        toast.error(data.message || 'Failed to assign team');
      }
    } catch (e) {
      toast.error('Network error during dispatch');
    }
  };

  const handleVerify = async (emergencyId: string, verified: boolean) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/admin/emergencies/${emergencyId}/verify`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ verified })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        fetchDashboardData();
      } else {
        toast.error(data.message);
      }
    } catch (e) {
      toast.error('Network error updating verification');
    }
  };

  const handleStatusChange = async (emergencyId: string, newStatus: string) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/admin/emergencies/${emergencyId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Emergency updated to ${newStatus}`);
        fetchDashboardData();
      } else {
        toast.error(data.message);
      }
    } catch (e) {
      toast.error('Network error updating status');
    }
  };

  const handlePriorityChange = async (emergencyId: string, newPriority: string) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/admin/emergencies/${emergencyId}/priority`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ priority: newPriority })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Priority set to ${newPriority}`);
        fetchDashboardData();
      } else {
        toast.error(data.message);
      }
    } catch (e) {
      toast.error('Network error updating priority');
    }
  };

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case 'Critical':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-500/20 text-red-400 border border-red-500/30">CRITICAL</span>;
      case 'High':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">HIGH</span>;
      case 'Medium':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">MEDIUM</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-700 text-slate-300">LOW</span>;
    }
  };

  const getStatusBadge = (s: string) => {
    switch (s) {
      case 'SUBMITTED':
      case 'Submitted':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-500/20 text-blue-400 border border-blue-500/30">SUBMITTED</span>;
      case 'UNDER_REVIEW':
      case 'Under Review':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-500/20 text-purple-400 border border-purple-500/30">UNDER REVIEW</span>;
      case 'VERIFIED':
      case 'Verified':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">VERIFIED</span>;
      case 'ASSIGNED':
      case 'Assigned':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/20 text-amber-400 border border-amber-500/30">ASSIGNED</span>;
      case 'RESCUE_IN_PROGRESS':
      case 'In Progress':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-orange-500/20 text-orange-400 border border-orange-500/30 animate-pulse">RESCUE IN PROGRESS</span>;
      case 'RESOLVED':
      case 'COMPLETED':
      case 'Completed':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-emerald-400 border border-emerald-500/40">RESOLVED</span>;
      case 'REJECTED':
      case 'Rejected':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-red-500/20 text-red-400">REJECTED</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-400">{s}</span>;
    }
  };

  return (
    <DashboardLayout
      title="Disaster Emergency Command Center"
      subtitle="Centralized Operations, Live SOS Dispatch & Cross-Agency Coordination"
      actionButton={
        <button
          onClick={fetchDashboardData}
          disabled={refreshing}
          className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-mono flex items-center gap-2 border border-slate-700 transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-cyan-400' : ''}`} />
          <span>Sync Telemetry</span>
        </button>
      }
    >
      {/* 10 Operational Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="bg-[#0f172a] p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-mono uppercase tracking-wider">Total Emergencies</span>
            <AlertTriangle className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black font-mono text-white mt-2">
            {stats?.totalEmergencies ?? '—'}
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-1">Live database total</div>
        </div>

        <div className="bg-[#0f172a] p-4 rounded-xl border border-red-950/60 flex flex-col justify-between">
          <div className="flex items-center justify-between text-red-400">
            <span className="text-[11px] font-mono uppercase tracking-wider">Critical SOS</span>
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
          </div>
          <div className="text-2xl font-black font-mono text-red-400 mt-2">
            {stats?.criticalEmergencies ?? '—'}
          </div>
          <div className="text-[10px] text-red-400/80 font-mono mt-1">Immediate life risk</div>
        </div>

        <div className="bg-[#0f172a] p-4 rounded-xl border border-amber-950/60 flex flex-col justify-between">
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-[11px] font-mono uppercase tracking-wider">Pending Review</span>
            <Clock className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black font-mono text-amber-400 mt-2">
            {stats?.pendingEmergencies ?? '—'}
          </div>
          <div className="text-[10px] text-amber-400/80 font-mono mt-1">Awaiting verification</div>
        </div>

        <div className="bg-[#0f172a] p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-cyan-400">
            <span className="text-[11px] font-mono uppercase tracking-wider">Active Rescues</span>
            <Activity className="w-4 h-4 animate-pulse" />
          </div>
          <div className="text-2xl font-black font-mono text-cyan-300 mt-2">
            {stats?.activeRescues ?? '—'}
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-1">Units on mission</div>
        </div>

        <div className="bg-[#0f172a] p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-[11px] font-mono uppercase tracking-wider">Resolved / Saved</span>
            <CheckCircle className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black font-mono text-emerald-400 mt-2">
            {stats?.completedRescues ?? '—'}
          </div>
          <div className="text-[10px] text-emerald-400/70 font-mono mt-1">Successful extractions</div>
        </div>

        <div className="bg-[#0f172a] p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-mono uppercase tracking-wider">Rescue Units</span>
            <LifeBuoy className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-black font-mono text-white mt-2">
            {stats?.rescueTeamsCount ?? '—'}
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-1">NDRF / SDRF teams</div>
        </div>

        <div className="bg-[#0f172a] p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-mono uppercase tracking-wider">Volunteers</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl font-black font-mono text-white mt-2">
            {stats?.volunteersCount ?? '—'}
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-1">Field aid personnel</div>
        </div>

        <div className="bg-[#0f172a] p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-mono uppercase tracking-wider">NGO Partners</span>
            <HeartHandshake className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-black font-mono text-white mt-2">
            {stats?.ngosCount ?? '—'}
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-1">Relief organizations</div>
        </div>

        <div className="bg-[#0f172a] p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-mono uppercase tracking-wider">Relief Camps</span>
            <MapPin className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl font-black font-mono text-white mt-2">
            {stats?.reliefCampsCount ?? '—'}
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-1">Shelters active</div>
        </div>

        <div className="bg-[#0f172a] p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-mono uppercase tracking-wider">Logistics Stock</span>
            <Package className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-xl font-black font-mono text-white mt-2">
            {stats?.inventoryStats?.totalQuantity ?? 0}
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-1">
            {stats?.inventoryStats?.lowStockCount ? `${stats.inventoryStats.lowStockCount} low stock alerts` : 'Supplies adequate'}
          </div>
        </div>
      </div>

      {/* Emergency Management Section */}
      <div className="bg-[#0f172a] rounded-2xl border border-slate-800 p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <span>SOS Emergency Dispatch Registry</span>
            </h2>
            <p className="text-xs text-slate-400">
              Verify, escalate priority, and assign quick rescue squads to incoming citizen distress signals.
            </p>
          </div>

          {/* Search & Filter Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search ID, name, location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') fetchDashboardData(); }}
                className="pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-slate-300 focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="VERIFIED">Verified</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="RESCUE_IN_PROGRESS">Rescue in Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="REJECTED">Rejected</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-slate-300 focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>

        {/* Emergencies Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 bg-slate-900/60 uppercase tracking-wider text-[11px]">
                <th className="py-3 px-3">Emergency ID</th>
                <th className="py-3 px-3">Priority</th>
                <th className="py-3 px-3">Type &amp; People</th>
                <th className="py-3 px-3">Location &amp; Citizen</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Assigned Squad</th>
                <th className="py-3 px-3 text-right">HQ Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {emergencies.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 text-xs">
                    No emergency requests match current filter parameters.
                  </td>
                </tr>
              ) : (
                emergencies.map((e) => {
                  const reqId = e.requestID || e.requestId || e._id.slice(-6).toUpperCase();
                  return (
                    <tr key={e._id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-3 font-bold text-cyan-400">
                        {reqId}
                      </td>

                      <td className="py-3 px-3">
                        {getPriorityBadge(e.priority)}
                      </td>

                      <td className="py-3 px-3">
                        <div className="text-white font-semibold">
                          {e.numberOfPeople} affected
                          {(e.numberOfElderly || e.numberOfChildren || e.numberOfDisabled) ? (
                            <span className="text-[10px] text-slate-400 block font-normal">
                              ({e.numberOfChildren || 0} kids, {e.numberOfElderly || 0} elderly, {e.numberOfDisabled || 0} disabled)
                            </span>
                          ) : null}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[150px]">
                          {e.requestCategory?.join(', ') || 'Rescue'}
                        </div>
                      </td>

                      <td className="py-3 px-3 max-w-[200px]">
                        <div className="text-slate-200 truncate">{e.location}</div>
                        <div className="text-[10px] text-slate-400">{e.citizenName} ({e.contact})</div>
                      </td>

                      <td className="py-3 px-3">
                        {getStatusBadge(e.status)}
                      </td>

                      <td className="py-3 px-3">
                        {e.assignedTeam ? (
                          <div className="text-white font-semibold flex items-center gap-1.5">
                            <Shield className="w-3.5 h-3.5 text-amber-400" />
                            <span>{e.assignedTeam.name || e.assignedTeam.organization || `${e.assignedTeam.firstName} ${e.assignedTeam.lastName}`}</span>
                          </div>
                        ) : (
                          <span className="text-slate-500 text-[11px] italic">Unassigned</span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedEmergency(e);
                              setAssigningTeamId(e.assignedTeam?._id || '');
                              setUpdatingPriority(e.priority);
                              setUpdatingStatus(e.status);
                            }}
                            className="px-2.5 py-1 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 rounded text-[11px] font-bold transition-all"
                          >
                            Manage / Dispatch
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Emergency Detail & Management Modal */}
      {selectedEmergency && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#0f172a] border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 text-left relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400">EMERGENCY CONTROLLER</span>
                <h3 className="text-lg font-bold text-white">
                  Incident {selectedEmergency.requestID || selectedEmergency.requestId || selectedEmergency._id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedEmergency(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4 text-xs font-mono bg-slate-900/80 p-4 rounded-xl border border-slate-800">
              <div>
                <span className="text-slate-400 block text-[10px]">CITIZEN CONTACT</span>
                <span className="text-white font-bold">{selectedEmergency.citizenName}</span>
                <span className="text-slate-400 block">{selectedEmergency.contact}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">INCIDENT LOCATION</span>
                <span className="text-white font-bold">{selectedEmergency.location}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">AFFECTED CITIZENS</span>
                <span className="text-white font-bold">{selectedEmergency.numberOfPeople} total</span>
                <span className="text-slate-400 block">
                  ({selectedEmergency.numberOfChildren || 0} kids, {selectedEmergency.numberOfElderly || 0} elderly, {selectedEmergency.numberOfDisabled || 0} disabled)
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">REQUEST CATEGORIES</span>
                <span className="text-cyan-400">{selectedEmergency.requestCategory?.join(', ')}</span>
              </div>
              {selectedEmergency.description && (
                <div className="col-span-2 pt-2 border-t border-slate-800">
                  <span className="text-slate-400 block text-[10px]">SITUATION NOTES</span>
                  <p className="text-slate-200 mt-0.5">{selectedEmergency.description}</p>
                </div>
              )}
            </div>

            {/* Verification Actions */}
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
              <span className="text-xs font-mono text-slate-300 font-semibold">Incident Verification:</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleVerify(selectedEmergency._id, true)}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold rounded-lg transition-all"
                >
                  Verify Incident
                </button>
                <button
                  type="button"
                  onClick={() => handleVerify(selectedEmergency._id, false)}
                  className="px-3 py-1 bg-red-600/30 hover:bg-red-600/50 text-red-300 border border-red-500/30 text-xs font-mono rounded-lg transition-all"
                >
                  Reject / False Alarm
                </button>
              </div>
            </div>

            {/* Currently Assigned Rescue Squad (if any) */}
            {selectedEmergency.assignedTeam && (
              <div className="p-3 bg-slate-900/80 rounded-xl border border-amber-500/30 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Shield className="w-4 h-4 text-amber-400" />
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 block font-semibold">Currently Assigned Unit</span>
                    <span className="text-white text-xs font-mono font-bold">
                      {selectedEmergency.assignedTeam.name || selectedEmergency.assignedTeam.organization || `${selectedEmergency.assignedTeam.firstName} ${selectedEmergency.assignedTeam.lastName}`}
                    </span>
                    {selectedEmergency.assignedTeam.teamLeader && (
                      <span className="text-slate-400 text-[10px] font-mono block">
                        Leader: {selectedEmergency.assignedTeam.teamLeader} {selectedEmergency.assignedTeam.contactNumber ? `• ${selectedEmergency.assignedTeam.contactNumber}` : ''}
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold uppercase">
                  {selectedEmergency.status === 'RESOLVED' ? 'MISSION COMPLETED' : 'ON MISSION'}
                </span>
              </div>
            )}

            {/* Assign Rescue Squad */}
            <div className="space-y-2">
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold flex items-center justify-between">
                <span>Dispatch / Reassign Rescue Team:</span>
                <span className="text-[10px] text-cyan-400 font-normal">
                  {rescueTeams.length} squad{rescueTeams.length === 1 ? '' : 's'} available
                </span>
              </label>

              {rescueTeams.length === 0 ? (
                <div className="flex gap-2">
                  <select
                    disabled
                    className="flex-1 px-3 py-2 bg-slate-900/60 border border-slate-800 rounded-xl text-xs font-mono text-slate-500 cursor-not-allowed"
                  >
                    <option value="">No rescue squads currently available</option>
                  </select>
                  <button
                    type="button"
                    disabled
                    className="px-4 py-2 bg-slate-800 text-slate-500 font-mono font-bold text-xs rounded-xl cursor-not-allowed"
                  >
                    No Squads Available
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <select
                      value={assigningTeamId}
                      onChange={(e) => setAssigningTeamId(e.target.value)}
                      className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                    >
                      <option value="">-- Choose Available Rescue Squad --</option>
                      {rescueTeams.map((team) => (
                        <option key={team._id} value={team._id}>
                          {team.name} • {team.numberOfMembers} members • Available
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => handleAssignTeam(selectedEmergency._id)}
                      disabled={!assigningTeamId}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-mono font-bold text-xs rounded-xl transition-all shadow-md flex items-center gap-1.5"
                    >
                      Confirm Dispatch
                    </button>
                  </div>

                  {/* Selected Squad Quick Intel */}
                  {(() => {
                    const chosen = rescueTeams.find((t) => t._id === assigningTeamId);
                    if (!chosen) return null;
                    return (
                      <div className="p-2.5 bg-cyan-950/20 rounded-xl border border-cyan-500/20 text-xs font-mono grid grid-cols-2 gap-2 text-slate-300">
                        <div>
                          <span className="text-[10px] text-cyan-400 block font-semibold">LEADER & CONTACT</span>
                          <span className="text-white font-semibold">{chosen.teamLeader}</span>
                          <span className="text-slate-400 block text-[10px]">{chosen.contactNumber}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-cyan-400 block font-semibold">EQUIPMENT & BASE</span>
                          <span className="text-white font-semibold">{chosen.vehicleAssigned}</span>
                          <span className="text-slate-400 block text-[10px]">{chosen.currentLocation}</span>
                        </div>
                        {chosen.skills && chosen.skills.length > 0 && (
                          <div className="col-span-2 pt-1 border-t border-slate-800">
                            <span className="text-[10px] text-cyan-400 block font-semibold">DEPLOYMENT CAPABILITIES</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {chosen.skills.map((s, idx) => (
                                <span key={idx} className="px-1.5 py-0.5 rounded bg-slate-850 text-cyan-300 border border-cyan-800/40 text-[10px]">
                                  {s}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* Change Priority & Lifecycle Status */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1">
                  Change Priority:
                </label>
                <select
                  value={updatingPriority}
                  onChange={(e) => {
                    setUpdatingPriority(e.target.value);
                    handlePriorityChange(selectedEmergency._id, e.target.value);
                  }}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1">
                  Lifecycle Status:
                </label>
                <select
                  value={updatingStatus}
                  onChange={(e) => {
                    setUpdatingStatus(e.target.value);
                    handleStatusChange(selectedEmergency._id, e.target.value);
                  }}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="SUBMITTED">Submitted</option>
                  <option value="UNDER_REVIEW">Under Review</option>
                  <option value="VERIFIED">Verified</option>
                  <option value="ASSIGNED">Assigned</option>
                  <option value="RESCUE_IN_PROGRESS">Rescue In Progress</option>
                  <option value="RESOLVED">Resolved / Completed</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedEmergency(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-mono transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminDashboard;
