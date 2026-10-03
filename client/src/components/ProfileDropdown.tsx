import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User as UserIcon, Edit2, X, Check } from 'lucide-react';

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

  const handleSave = () => {
    // Ideally this should also call an API to update the backend
    updateUser({ ...user, ...formData });
    setIsEditing(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-emerald-100 hover:text-white px-3 py-2 rounded-md border border-transparent hover:border-emerald-400/30 transition-all"
      >
        <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center text-xs font-bold text-white shadow-sm border border-emerald-500">
          {(user?.firstName?.charAt(0) || '')}{(user?.lastName?.charAt(0) || '')}
        </div>
        <span className="hidden sm:inline font-medium">{user?.firstName || 'User'}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl z-50 text-gray-800 border border-gray-100 overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-start">
            <div>
              <h4 className="font-bold text-gray-900">{isEditing ? 'Edit Profile' : 'User Profile'}</h4>
              <p className="text-xs text-gray-500 uppercase tracking-wide mt-1 font-semibold text-emerald-600">{user.role}</p>
            </div>
            {!isEditing && (
              <button onClick={() => setIsEditing(true)} className="text-gray-400 hover:text-emerald-600 transition-colors">
                <Edit2 size={16} />
              </button>
            )}
            {isEditing && (
              <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={16} />
              </button>
            )}
          </div>
          
          <div className="p-4 space-y-3">
            {isEditing ? (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">First Name</label>
                  <input 
                    type="text" 
                    value={formData.firstName}
                    onChange={e => setFormData({...formData, firstName: e.target.value})}
                    className="w-full text-sm border-b-2 border-gray-200 focus:border-emerald-500 focus:outline-none py-1 transition-colors bg-transparent"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Last Name</label>
                  <input 
                    type="text" 
                    value={formData.lastName}
                    onChange={e => setFormData({...formData, lastName: e.target.value})}
                    className="w-full text-sm border-b-2 border-gray-200 focus:border-emerald-500 focus:outline-none py-1 transition-colors bg-transparent"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Email</label>
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className="w-full text-sm border-b-2 border-gray-200 focus:border-emerald-500 focus:outline-none py-1 transition-colors bg-transparent"
                  />
                </div>
                <button 
                  onClick={handleSave}
                  className="w-full mt-4 flex items-center justify-center gap-2 bg-emerald-600 text-white py-2 rounded-lg text-sm font-bold hover:bg-emerald-700 transition-colors shadow-md hover:shadow-lg"
                >
                  <Check size={16} /> Save Changes
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide block mb-1">Name</span>
                  <span className="text-sm font-bold text-gray-900">{user.firstName} {user.lastName}</span>
                </div>
                <div>
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide block mb-1">Email</span>
                  <span className="text-sm font-medium text-gray-800">{user.email}</span>
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-gray-100 bg-gray-50/50">
            <button 
              onClick={() => {
                logout();
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-3.5 text-sm font-bold text-red-600 hover:bg-red-50 hover:text-red-700 flex items-center gap-2 transition-colors"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

