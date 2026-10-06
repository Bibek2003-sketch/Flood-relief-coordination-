import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User as UserIcon, Edit2, X, Check } from 'lucide-react';
import { getUserAcronym } from '../utils/googleAuth';

export const ProfileDropdown = () => {
  const { user, logout, updateUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsEditing(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  const acronym = getUserAcronym(user.firstName, user.lastName);

  const handleSave = () => {
    // Ideally this should also call an API to update the backend
    updateUser({ ...user, ...formData });
    setIsEditing(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 text-slate-200 hover:text-white px-3 py-2 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-700/60 hover:border-cyan-500/40 transition-all shadow-sm"
      >
        <div className="w-7 h-7 rounded-lg bg-cyan-600/30 flex items-center justify-center text-xs font-mono font-bold text-cyan-300 border border-cyan-500/40">
          {acronym}
        </div>
        <span className="hidden sm:inline font-medium text-sm">{user.firstName || acronym}</span>
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-[#0f172a] rounded-2xl shadow-2xl z-50 text-slate-100 border border-slate-700/80 overflow-hidden divide-y divide-slate-800">
          <div className="p-4 bg-slate-900/80 flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center font-mono font-bold text-cyan-400">
                {acronym}
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">{isEditing ? 'Update Operator Profile' : `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Command Operator'}</h4>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                    {user.role || 'CITIZEN'}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">STATUS: ACTIVE</span>
                </div>
              </div>
            </div>
            {!isEditing ? (
              <button 
                onClick={() => setIsEditing(true)} 
                title="Edit Profile"
                className="text-slate-400 hover:text-cyan-400 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <Edit2 size={15} />
              </button>
            ) : (
              <button 
                onClick={() => setIsEditing(false)} 
                title="Cancel Edit"
                className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X size={15} />
              </button>
            )}
          </div>
          
          <div className="p-4 space-y-3.5 bg-[#0f172a]">
            {isEditing ? (
              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-medium">First Name</label>
                  <input 
                    type="text" 
                    value={formData.firstName}
                    onChange={e => setFormData({...formData, firstName: e.target.value})}
                    className="w-full mt-1 text-sm bg-slate-900/90 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-cyan-500 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-medium">Last Name</label>
                  <input 
                    type="text" 
                    value={formData.lastName}
                    onChange={e => setFormData({...formData, lastName: e.target.value})}
                    className="w-full mt-1 text-sm bg-slate-900/90 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-cyan-500 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-medium">Email Address</label>
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className="w-full mt-1 text-sm bg-slate-900/90 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-cyan-500 focus:outline-none transition-colors"
                  />
                </div>
                <button 
                  onClick={handleSave}
                  className="w-full mt-4 flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white py-2 rounded-lg text-sm font-bold transition-all shadow-md shadow-cyan-950"
                >
                  <Check size={16} /> Save Changes
                </button>
              </div>
            ) : (
              <div className="space-y-3 font-mono text-xs">
                <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-0.5">COMMUNICATIONS ID</span>
                  <span className="text-slate-200 break-all">{user.email}</span>
                </div>
                <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 flex justify-between items-center">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider">RESPONSE CLEARANCE</span>
                  <span className="text-emerald-400 font-semibold uppercase">{user.role || 'Citizen'}</span>
                </div>
              </div>
            )}
          </div>

          <div className="p-2 bg-slate-900/70 space-y-1">
            <Link
              to={user ? (
                (user.roleName || (typeof user.role === 'string' ? user.role : user.role?.name) || '').toLowerCase().includes('admin') ? '/admin/dashboard' :
                (user.roleName || (typeof user.role === 'string' ? user.role : user.role?.name) || '').toLowerCase().includes('rescue') ? '/rescue/dashboard' :
                (user.roleName || (typeof user.role === 'string' ? user.role : user.role?.name) || '').toLowerCase().includes('volunteer') ? '/volunteer/dashboard' :
                (user.roleName || (typeof user.role === 'string' ? user.role : user.role?.name) || '').toLowerCase().includes('ngo') ? '/ngo/dashboard' : '/dashboard'
              ) : '/'}
              onClick={() => setIsOpen(false)}
              className="w-full text-left px-3 py-2 text-xs font-semibold text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 rounded-lg flex items-center gap-2 transition-colors font-mono"
            >
              <UserIcon size={14} /> Open Operational Dashboard
            </Link>
            <button 
              onClick={() => {
                logout();
                setIsOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg flex items-center gap-2 transition-colors"
            >
              <LogOut size={14} /> Disconnect / Log Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

