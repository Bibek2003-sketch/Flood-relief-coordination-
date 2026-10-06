import { useState, useEffect } from 'react';
import { Activity, Stethoscope, Plus, HeartPulse, RefreshCw, X, ShieldAlert, Navigation, Phone, CheckCircle2, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { socket } from '../utils/socket';

interface MedicalCampUnit {
  _id: string;
  name: string;
  address: string;
  doctors: number;
  triageBeds: number;
  response: string;
  status: string;
  type: string;
}

interface CriticalEvacuation {
  _id: string;
  requestID?: string;
  requestId?: string;
  citizenName: string;
  name?: string;
  contact: string;
  location: string;
  numberOfPeople: number;
  priority: string;
  status: string;
  requestCategory: string[];
  description?: string;
  details?: string;
  assignedTeam?: any;
  createdAt: string;
}

interface MedicalStats {
  activeCamps: number;
  doctorsParamedics: number;
  criticalEvacuations: number;
}

const MedicalDashboard = () => {
  const [stats, setStats] = useState<MedicalStats>({
    activeCamps: 8,
    doctorsParamedics: 45,
    criticalEvacuations: 12
  });
  const [camps, setCamps] = useState<MedicalCampUnit[]>([]);
  const [evacuations, setEvacuations] = useState<CriticalEvacuation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dispatchingId, setDispatchingId] = useState<string | null>(null);

  // Deploy Camp Modal state
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [deployLoading, setDeployLoading] = useState(false);
  const [campForm, setCampForm] = useState({
    name: '',
    address: '',
    doctorsAvailable: 4,
    capacity: 25,
    operatingHours: '24/7',
    emergencyStatus: 'Normal'
  });

  const fetchMedicalData = async () => {
    try {
      setRefreshing(true);
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

      const [statsRes, campsRes, evacRes] = await Promise.all([
        fetch(`${baseUrl}/medical/stats`),
        fetch(`${baseUrl}/medical/camps`),
        fetch(`${baseUrl}/medical/evacuations`)
      ]);

      const [statsData, campsData, evacData] = await Promise.all([
        statsRes.json(),
        campsRes.json(),
        evacRes.json()
      ]);

      if (statsData.success) setStats(statsData.data);
      if (campsData.success) setCamps(campsData.data);
      if (evacData.success) setEvacuations(evacData.data);
    } catch (err) {
      console.warn('Failed to fetch medical operations telemetry:', err);
      toast.error('Failed to sync medical operations telemetry');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMedicalData();

    const handleUpdate = () => {
      fetchMedicalData();
    };

    socket.on('emergency-status-changed', handleUpdate);
    socket.on('new-request', handleUpdate);
    socket.on('medical-camp-deployed', handleUpdate);

    return () => {
      socket.off('emergency-status-changed', handleUpdate);
      socket.off('new-request', handleUpdate);
      socket.off('medical-camp-deployed', handleUpdate);
    };
  }, []);

  const handleDispatchBoat = async (id: string, citizenName: string) => {
    try {
      setDispatchingId(id);
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/medical/evacuations/${id}/dispatch`, {
        method: 'POST'
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Rescue boat dispatched for ${citizenName}!`);
        fetchMedicalData();
      } else {
        toast.error(data.message || 'Dispatch command failed');
      }
    } catch (err) {
      toast.error('Network error executing boat dispatch');
    } finally {
      setDispatchingId(null);
    }
  };

  const handleDeployCamp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campForm.name || !campForm.address) {
      toast.error('Camp name and address are required');
      return;
    }

    try {
      setDeployLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/medical/camps`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campForm)
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        setShowDeployModal(false);
        setCampForm({
          name: '',
          address: '',
          doctorsAvailable: 4,
          capacity: 25,
          operatingHours: '24/7',
          emergencyStatus: 'Normal'
        });
        fetchMedicalData();
      } else {
        toast.error(data.message || 'Failed to deploy medical unit');
      }
    } catch (err) {
      toast.error('Error contacting EOC Medical Command');
    } finally {
      setDeployLoading(false);
    }
  };

  return (
    <div className="flex-grow bg-[#0b0f19] p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
      
      {/* Operations Header */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse"></span>
            <span className="text-xs font-mono uppercase tracking-widest text-red-400 font-bold">
              TRIAGE &amp; CASUALTY EVACUATION DESK
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
            <HeartPulse className="text-red-400" /> Medical Command Operations
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchMedicalData}
            disabled={refreshing}
            className="p-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-700 transition-colors"
            title="Refresh Medical Telemetry"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin text-cyan-400' : ''} />
          </button>
          
          <button 
            onClick={() => setShowDeployModal(true)}
            className="bg-cyan-600 hover:bg-cyan-500 text-white font-mono font-bold py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider flex items-center gap-2 shadow-md shadow-cyan-950 transition-all"
          >
            <Plus size={16} /> Deploy Medical Camp
          </button>
        </div>
      </div>
      
      {/* Telemetry Metric Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#0f172a] p-5 rounded-2xl shadow-xl border border-slate-800">
          <div className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold mb-1">Active Medical Camps</div>
          <div className="text-3xl font-extrabold font-mono text-cyan-400">{stats.activeCamps}</div>
          <div className="text-[11px] font-mono text-slate-500 mt-1">Operational in Guwahati Metro</div>
        </div>
        <div className="bg-[#0f172a] p-5 rounded-2xl shadow-xl border border-slate-800">
          <div className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold mb-1">Doctors &amp; Paramedics Deployed</div>
          <div className="text-3xl font-extrabold font-mono text-emerald-400">{stats.doctorsParamedics}</div>
          <div className="text-[11px] font-mono text-slate-500 mt-1">SDRF Medical Wing + Red Cross</div>
        </div>
        <div className="bg-[#0f172a] p-5 rounded-2xl shadow-xl border border-slate-800 border-l-4 border-l-red-500">
          <div className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold mb-1">Critical Triage Requests</div>
          <div className="text-3xl font-extrabold font-mono text-red-400">{stats.criticalEvacuations}</div>
          <div className="text-[11px] font-mono text-slate-500 mt-1">Immediate Boat Evacuation Needed</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Camps */}
        <div className="bg-[#0f172a] rounded-2xl shadow-xl border border-slate-800 overflow-hidden flex flex-col justify-between">
          <div>
            <div className="bg-slate-900 px-5 py-3.5 border-b border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2 font-mono uppercase tracking-wider">
                <Stethoscope size={18} className="text-cyan-400" /> Active Medical Field Units
              </h3>
              <span className="text-[11px] font-mono bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/30">
                {camps.length} UNITS LOGGED
              </span>
            </div>
            
            <div className="divide-y divide-slate-800/80 max-h-[500px] overflow-y-auto">
              {camps.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs font-mono">
                  No medical units currently recorded. Use the "Deploy Medical Camp" button to set up emergency triage stations.
                </div>
              ) : (
                camps.map((camp) => (
                  <div key={camp._id} className="p-5 hover:bg-slate-900/40 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-bold text-sm text-white">{camp.name}</h4>
                        <p className="text-xs text-slate-400 font-mono mt-0.5">{camp.address}</p>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold border ${
                        camp.status === 'HIGH ALERT'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      }`}>
                        {camp.status}
                      </span>
                    </div>
                    <div className="mt-3 flex gap-4 text-xs font-mono text-slate-300 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                      <div><strong className="text-slate-400">Doctors:</strong> {camp.doctors}</div>
                      <div><strong className="text-slate-400">Triage Beds:</strong> {camp.triageBeds}</div>
                      <div><strong className="text-slate-400">Response:</strong> {camp.response}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Emergency Medical Requests */}
        <div className="bg-[#0f172a] rounded-2xl shadow-xl border border-slate-800 overflow-hidden flex flex-col justify-between">
          <div>
            <div className="bg-slate-900 px-5 py-3.5 border-b border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2 font-mono uppercase tracking-wider">
                <Activity size={18} className="text-red-400" /> Critical Patient Evacuations
              </h3>
              <span className="text-[11px] font-mono bg-red-500/10 text-red-400 px-2 py-0.5 rounded border border-red-500/30">
                {evacuations.length} CASUALTIES
              </span>
            </div>

            <div className="divide-y divide-slate-800/80 max-h-[500px] overflow-y-auto">
              {evacuations.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs font-mono">
                  No active critical casualty evacuations reported in the sector.
                </div>
              ) : (
                evacuations.map((req) => (
                  <div key={req._id} className="p-5 hover:bg-slate-900/40 transition-colors">
                    <div className="flex justify-between items-start mb-1.5">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 px-1.5 py-0.5 rounded border border-cyan-800">
                            {req.requestID || req.requestId || 'REQ-EMERG'}
                          </span>
                          <h4 className="font-bold text-sm text-white">
                            {req.citizenName || req.name || 'Emergency Casualty'}
                          </h4>
                        </div>
                        <p className="text-xs text-red-400 font-mono font-bold mt-1">
                          PRIORITY: {req.priority?.toUpperCase()} • {req.numberOfPeople} AFFECTED
                        </p>
                      </div>

                      {req.status === 'ASSIGNED' || req.status === 'RESCUE_IN_PROGRESS' ? (
                        <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 px-3 py-1.5 text-xs font-mono font-bold rounded-lg">
                          BOAT EN ROUTE
                        </span>
                      ) : (
                        <button
                          onClick={() => handleDispatchBoat(req._id, req.citizenName || req.name || 'Victim')}
                          disabled={dispatchingId === req._id}
                          className="bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white px-3 py-1.5 text-xs font-mono font-bold rounded-lg transition-all shadow-md shadow-red-950 flex items-center gap-1.5"
                        >
                          {dispatchingId === req._id ? (
                            <>
                              <Loader2 size={14} className="animate-spin" />
                              <span>Dispatching...</span>
                            </>
                          ) : (
                            <span>Dispatch Boat</span>
                          )}
                        </button>
                      )}
                    </div>

                    <p className="text-xs text-slate-300 mt-2">
                      {req.description || req.details || 'Patient trapped in waterlogged building requiring emergency evacuation and first-aid triage.'}
                    </p>

                    <div className="mt-2.5 text-[11px] font-mono text-slate-400 flex flex-wrap justify-between gap-2 bg-slate-900/50 p-2 rounded-lg border border-slate-800">
                      <span className="flex items-center gap-1">
                        <Navigation size={12} className="text-cyan-400" />
                        <span>{req.location}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone size={12} className="text-emerald-400" />
                        <span>{req.contact}</span>
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Deploy Medical Camp Modal */}
      {showDeployModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#0f172a] rounded-2xl border border-slate-700 shadow-2xl max-w-md w-full p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Stethoscope size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Deploy Medical Field Unit</h3>
                  <p className="text-[11px] font-mono text-cyan-400">EMERGENCY OPERATIONS CENTER</p>
                </div>
              </div>
              <button
                onClick={() => setShowDeployModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleDeployCamp} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold mb-1">Station / Tent Name *</label>
                <input
                  type="text"
                  required
                  value={campForm.name}
                  onChange={e => setCampForm({ ...campForm, name: e.target.value })}
                  placeholder="e.g. Field Trauma Station Beta-4"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 text-white text-xs transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold mb-1">Location Address *</label>
                <input
                  type="text"
                  required
                  value={campForm.address}
                  onChange={e => setCampForm({ ...campForm, address: e.target.value })}
                  placeholder="e.g. Dispur High School Grounds, Guwahati"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 text-white text-xs transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold mb-1">Doctors Deployed</label>
                  <input
                    type="number"
                    min="1"
                    value={campForm.doctorsAvailable}
                    onChange={e => setCampForm({ ...campForm, doctorsAvailable: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 text-white text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold mb-1">Triage Beds</label>
                  <input
                    type="number"
                    min="1"
                    value={campForm.capacity}
                    onChange={e => setCampForm({ ...campForm, capacity: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 text-white text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold mb-1">Operating Hours</label>
                  <input
                    type="text"
                    value={campForm.operatingHours}
                    onChange={e => setCampForm({ ...campForm, operatingHours: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 text-white text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold mb-1">Status Alert</label>
                  <select
                    value={campForm.emergencyStatus}
                    onChange={e => setCampForm({ ...campForm, emergencyStatus: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 text-white text-xs font-mono"
                  >
                    <option value="Normal">Normal</option>
                    <option value="High Alert">High Alert</option>
                    <option value="Overwhelmed">Overwhelmed</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeployModal(false)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-mono font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={deployLoading}
                  className="flex-1 py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-cyan-950"
                >
                  {deployLoading ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                  <span>Confirm Deploy</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default MedicalDashboard;

