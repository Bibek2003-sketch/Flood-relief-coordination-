import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import {
  Users,
  MapPin,
  CheckCircle2,
  Clock,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  RefreshCw,
  Tag,
  Package,
  Heart,
  Shield,
  ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Task {
  _id: string;
  title: string;
  description: string;
  taskType: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  location: string;
  status: string;
  assignedVolunteer?: string;
  assignedVolunteerName?: string;
  createdAt: string;
}

const VolunteerDashboard: React.FC = () => {
  const { user, token } = useAuth();
  const [availableTasks, setAvailableTasks] = useState<Task[]>([]);
  const [myTasks, setMyTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean>(user?.isAvailable ?? true);

  const fetchTasks = async () => {
    try {
      setRefreshing(true);
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/volunteer/tasks`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.data) {
        setAvailableTasks(data.data.availableTasks || []);
        setMyTasks(data.data.myTasks || []);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load volunteer tasks');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchTasks();
    }
  }, [token]);

  const handleToggleAvailability = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/volunteer/availability`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ isAvailable: !isAvailable })
      });
      const data = await res.json();
      if (data.success) {
        setIsAvailable(data.isAvailable);
        toast.success(data.message);
      }
    } catch (e) {
      toast.error('Failed to update availability status');
    }
  };

  const handleAcceptTask = async (taskId: string) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/volunteer/tasks/${taskId}/accept`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Task claimed! Thank you for helping.');
        fetchTasks();
      } else {
        toast.error(data.message || 'Failed to claim task');
      }
    } catch (e) {
      toast.error('Network error claiming task');
    }
  };

  const handleDeclineTask = async (taskId: string) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/volunteer/tasks/${taskId}/decline`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Task released back to volunteer pool');
        fetchTasks();
      } else {
        toast.error(data.message);
      }
    } catch (e) {
      toast.error('Network error declining task');
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/volunteer/tasks/${taskId}/complete`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        fetchTasks();
      } else {
        toast.error(data.message);
      }
    } catch (e) {
      toast.error('Network error completing task');
    }
  };

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case 'Critical':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-500/20 text-red-400 border border-red-500/30">CRITICAL</span>;
      case 'High':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">HIGH</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">NORMAL</span>;
    }
  };

  return (
    <DashboardLayout
      title="Volunteer Assistance Hub"
      subtitle={`Volunteer: ${user?.firstName} ${user?.lastName} | Community Disaster Relief Network`}
      actionButton={
        <button
          onClick={fetchTasks}
          disabled={refreshing}
          className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-mono flex items-center gap-2 border border-slate-700 transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-cyan-400' : ''}`} />
          <span>Refresh Tasks</span>
        </button>
      }
    >
      {/* Availability Status & Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Availability Toggle */}
        <div className="bg-[#0f172a] p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold">Duty Status</div>
            <div className="text-base font-bold text-white mt-1 flex items-center gap-2 font-mono">
              <span className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`}></span>
              <span>{isAvailable ? 'AVAILABLE FOR AID' : 'OFF DUTY'}</span>
            </div>
          </div>
          <button
            onClick={handleToggleAvailability}
            className="text-cyan-400 hover:text-cyan-300 p-1"
            title="Toggle availability status"
          >
            {isAvailable ? (
              <ToggleRight className="w-9 h-9 text-emerald-400" />
            ) : (
              <ToggleLeft className="w-9 h-9 text-slate-500" />
            )}
          </button>
        </div>

        {/* My Tasks In Progress */}
        <div className="bg-[#0f172a] p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 font-bold">My Active Tasks</div>
            <div className="text-3xl font-black font-mono text-white mt-1">{myTasks.filter(t => t.status !== 'COMPLETED').length}</div>
          </div>
          <div className="p-3 bg-cyan-500/10 rounded-xl text-cyan-400">
            <Users className="w-7 h-7" />
          </div>
        </div>

        {/* Available Tasks Pool */}
        <div className="bg-[#0f172a] p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-bold">Tasks in Community Pool</div>
            <div className="text-3xl font-black font-mono text-white mt-1">{availableTasks.length}</div>
          </div>
          <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400">
            <Package className="w-7 h-7" />
          </div>
        </div>
      </div>

      {/* Active Tasks Claimed By Me */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-cyan-400" />
            <span>My Active Assignments ({myTasks.filter(t => t.status !== 'COMPLETED').length})</span>
          </h2>
        </div>

        {myTasks.filter(t => t.status !== 'COMPLETED').length === 0 ? (
          <div className="bg-[#0f172a] p-8 rounded-2xl border border-slate-800 text-center space-y-2">
            <Heart className="w-10 h-10 text-cyan-400 mx-auto" />
            <h3 className="text-base font-bold text-white">No Active Tasks Claimed</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Select any open task from the community task board below to assist affected communities.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myTasks.filter(t => t.status !== 'COMPLETED').map((task) => (
              <div key={task._id} className="bg-[#0f172a] rounded-2xl border border-cyan-500/40 p-5 space-y-3 shadow-xl">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                      {task.taskType}
                    </span>
                    <h3 className="text-base font-bold text-white mt-1.5">{task.title}</h3>
                  </div>
                  {getPriorityBadge(task.priority)}
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{task.description}</p>

                <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                  <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>{task.location}</span>
                </div>

                <div className="pt-2 border-t border-slate-800 flex gap-2">
                  <button
                    onClick={() => handleCompleteTask(task._id)}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all shadow-md"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Mark Completed</span>
                  </button>
                  <button
                    onClick={() => handleDeclineTask(task._id)}
                    className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-mono transition-colors"
                  >
                    Release Task
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Available Tasks In Pool */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-amber-400" />
            <span>Available Community Tasks Pool ({availableTasks.length})</span>
          </h2>
        </div>

        {availableTasks.length === 0 ? (
          <div className="bg-[#0f172a] p-8 rounded-2xl border border-slate-800 text-center text-xs text-slate-400">
            No unclaimed tasks available right now. Check back shortly as new relief logistics are organized.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableTasks.map((task) => (
              <div key={task._id} className="bg-[#0f172a] rounded-2xl border border-slate-800 p-5 space-y-3 flex flex-col justify-between hover:border-slate-700 transition-all">
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                      {task.taskType}
                    </span>
                    {getPriorityBadge(task.priority)}
                  </div>
                  <h3 className="text-sm font-bold text-white">{task.title}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2">{task.description}</p>
                  <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span className="truncate">{task.location}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleAcceptTask(task._id)}
                  className="w-full mt-3 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all shadow-md"
                >
                  <span>Accept This Task</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default VolunteerDashboard;
