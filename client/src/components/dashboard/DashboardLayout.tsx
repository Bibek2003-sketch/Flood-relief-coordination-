import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getNormalizedUserRole } from '../ProtectedRoute';
import {
  Shield,
  Activity,
  LifeBuoy,
  Users,
  HeartHandshake,
  LogOut,
  Bell,
  Menu,
  X,
  MapPin,
  Home,
  AlertTriangle,
  Radio
} from 'lucide-react';
import toast from 'react-hot-toast';
import logoImg from '../../assets/logo.jpg';

interface DashboardLayoutProps {
  children?: React.ReactNode;
  title: string;
  subtitle?: string;
  actionButton?: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  title,
  subtitle,
  actionButton
}) => {
  const { user, logout, token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const role = getNormalizedUserRole(user);

  useEffect(() => {
    // Fetch notifications unread count if authenticated
    if (token) {
      fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.success && typeof data.unreadCount === 'number') {
            setUnreadNotifications(data.unreadCount);
          }
        })
        .catch(() => {});
    }
  }, [token]);

  const handleLogout = () => {
    logout();
    toast.success('Session terminated successfully');
    navigate('/login');
  };

  const getRoleBadge = () => {
    switch (role) {
      case 'admin':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
            HQ COMMANDER
          </span>
        );
      case 'rescue':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
            RESCUE SQUAD
          </span>
        );
      case 'volunteer':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
            VOLUNTEER FORCE
          </span>
        );
      case 'ngo':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            NGO PARTNER
          </span>
        );
      default:
        return null;
    }
  };

  const getNavLinks = () => {
    switch (role) {
      case 'admin':
        return [
          { name: 'Disaster HQ Overview', path: '/admin/dashboard', icon: Activity },
          { name: 'SOS Emergencies', path: '/admin/emergencies', icon: AlertTriangle },
          { name: 'Field Rescue Teams', path: '/admin/rescue-teams', icon: LifeBuoy },
          { name: 'Volunteer Force', path: '/admin/volunteers', icon: Users },
          { name: 'NGO Logistics', path: '/admin/ngos', icon: HeartHandshake },
          { name: 'Relief Shelters', path: '/shelters', icon: MapPin },
        ];
      case 'rescue':
        return [
          { name: 'Assigned Missions', path: '/rescue/dashboard', icon: LifeBuoy },
          { name: 'Relief Shelters', path: '/shelters', icon: MapPin },
        ];
      case 'volunteer':
        return [
          { name: 'Volunteer Task Board', path: '/volunteer/dashboard', icon: Users },
          { name: 'Relief Camps', path: '/shelters', icon: MapPin },
        ];
      case 'ngo':
        return [
          { name: 'Resource Inventory', path: '/ngo/dashboard', icon: HeartHandshake },
          { name: 'Relief Camp Network', path: '/shelters', icon: MapPin },
        ];
      default:
        return [
          { name: 'Home Portal', path: '/', icon: Home },
        ];
    }
  };

  const navLinks = getNavLinks();

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col md:flex-row">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex md:w-64 flex-col bg-[#0f172a] border-r border-slate-800 shrink-0">
        <div className="p-5 border-b border-slate-800 flex items-center gap-3">
          <div className="bg-slate-900 p-1.5 rounded-xl border border-slate-700/80 shadow-md w-11 h-11 shrink-0 flex items-center justify-center overflow-hidden">
            <img src={logoImg} alt="FloodRelief" className="w-full h-full object-cover rounded-lg" />
          </div>
          <div>
            <div className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase font-bold">
              COMMAND CENTER
            </div>
            <div className="text-base font-extrabold text-white tracking-tight">
              FloodRelief OS
            </div>
          </div>
        </div>

        {/* User Identity Panel */}
        <div className="p-4 mx-3 my-3 bg-slate-900/90 rounded-xl border border-slate-800">
          <div className="text-xs font-semibold text-white truncate">
            {user?.firstName} {user?.lastName}
          </div>
          <div className="text-[11px] font-mono text-slate-400 truncate mt-0.5">
            {user?.organization || user?.email}
          </div>
          <div className="mt-2.5 flex items-center justify-between">
            {getRoleBadge()}
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-cyan-600/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer with Logout & Public Link */}
        <div className="p-3 border-t border-slate-800 space-y-1">
          <Link
            to="/"
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-all"
          >
            <Home className="w-4 h-4 text-slate-500" />
            <span>Public Front Portal</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all font-mono"
          >
            <LogOut className="w-4 h-4 text-red-400" />
            <span>Sign Out Session</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-[#0f172a] border-b border-slate-800 flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-xs font-mono font-bold tracking-wider text-slate-300 uppercase">
                OPS FEED ACTIVE
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200">
                <Bell className="w-4 h-4" />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unreadNotifications}
                  </span>
                )}
              </div>
            </div>

            <div className="md:hidden">
              <button
                onClick={handleLogout}
                className="p-2 text-red-400 hover:text-red-300 rounded-lg"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Mobile Nav Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#0f172a] border-b border-slate-800 px-4 py-3 space-y-1">
            <div className="p-3 mb-2 bg-slate-900 rounded-xl border border-slate-800">
              <div className="text-xs font-bold text-white">{user?.firstName} {user?.lastName}</div>
              <div className="text-[11px] font-mono text-slate-400">{user?.organization || user?.email}</div>
              <div className="mt-2">{getRoleBadge()}</div>
            </div>
            {navLinks.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-slate-300 hover:bg-slate-800"
                >
                  <Icon className="w-4 h-4 text-cyan-400" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
            <div className="pt-2 border-t border-slate-800">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}

        {/* Dashboard Page Body */}
        <main className="flex-1 overflow-y-auto p-2.5 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
            {/* Header Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-800">
              <div>
                <h1 className="text-2xl font-black text-white tracking-tight">{title}</h1>
                {subtitle && <p className="text-xs sm:text-sm text-slate-400 mt-0.5">{subtitle}</p>}
              </div>
              {actionButton && <div>{actionButton}</div>}
            </div>

            {/* Injected Content */}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
