import { Outlet, Link, useLocation } from 'react-router-dom';
import { Menu, X, User, HeartPulse, Radio, PhoneCall, ShieldAlert } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ProfileDropdown } from '../components/ProfileDropdown';
import { getUserAcronym } from '../utils/googleAuth';

const Layout = () => {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0f19] text-slate-100 selection:bg-cyan-500/30">
      
      {/* Tactical Command Center Navbar */}
      <nav className="sticky top-0 z-50 bg-[#0b0f19]/90 backdrop-blur-xl border-b border-slate-800/90 shadow-[0_4px_24px_rgba(0,0,0,0.6)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            
            {/* Brand Logo & Live Telemetry Badge */}
            <div className="flex items-center gap-4">
              <Link to="/" className="flex items-center gap-3 group">
                <div className="bg-slate-900 p-1.5 rounded-xl border border-slate-700/80 shadow-md group-hover:border-cyan-500/50 transition-all duration-300">
                  <img src="/logo.jpg" alt="FloodRelief Logo" className="h-9 w-9 object-cover rounded-lg" />
                </div>
                <div className="flex flex-col">
                  <span className="font-serif italic font-bold text-2xl tracking-tight text-white group-hover:text-cyan-300 transition-colors">
                    FloodRelief
                  </span>
                  <span className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase font-semibold">
                    DISASTER RESPONSE NETWORK
                  </span>
                </div>
              </Link>

              {/* Status Telemetry Pill */}
              <div className="hidden xl:flex items-center gap-2 ml-4 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-[11px] font-mono text-slate-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>TELEMETRY: <strong className="text-emerald-400 font-semibold">ONLINE</strong></span>
                <span className="text-slate-600">|</span>
                <span className="text-slate-400">REGION: <strong>ASSAM EOC</strong></span>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
              <Link 
                to="/emergency" 
                className="bg-red-600 hover:bg-red-500 text-white px-4 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 shadow-lg shadow-red-950/80 border border-red-500/80 flex items-center gap-2 mr-3 group hover:scale-[1.02]"
              >
                <HeartPulse size={18} className="animate-pulse text-red-200 group-hover:scale-110 transition-transform" />
                <span>REPORT EMERGENCY</span>
              </Link>
              
              {[
                { name: 'Track SOS', path: '/track-emergency' },
                { name: 'Find Shelters', path: '/shelters' },
                { name: 'Join Volunteer', path: '/volunteer' },
                { name: 'Donate Supplies', path: '/donate' }
              ].map((link) => (
                <Link 
                  key={link.name}
                  to={link.path} 
                  className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive(link.path) 
                      ? 'bg-slate-800/90 border border-slate-700 text-cyan-400 shadow-sm' 
                      : 'text-slate-300 hover:text-white hover:bg-slate-850 hover:bg-slate-900/60 border border-transparent'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              
              <div className="h-6 w-px bg-slate-800 mx-2"></div>
              
              {user ? (
                <ProfileDropdown />
              ) : (
                <div className="flex items-center space-x-2.5 ml-1">
                  <Link 
                    to="/login" 
                    className="text-slate-300 hover:text-white px-3.5 py-2 rounded-xl border border-slate-700/60 hover:border-slate-600 hover:bg-slate-850 transition-all text-xs font-mono font-medium whitespace-nowrap"
                  >
                    Staff &amp; Partner Login
                  </Link>
                  <Link 
                    to="/register" 
                    className="flex items-center gap-1.5 bg-cyan-600 hover:bg-cyan-500 border border-cyan-500 text-white px-3.5 py-2 rounded-xl font-bold text-xs font-mono transition-all duration-200 shadow-md shadow-cyan-950 whitespace-nowrap"
                  >
                    <User size={14} /> Join
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-slate-300 hover:text-white p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-all"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="bg-[#0f172a] px-4 pt-3 pb-6 space-y-2 border-t border-slate-800 shadow-2xl">
            <Link 
              to="/emergency" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full bg-red-600 hover:bg-red-500 text-white px-4 py-3 rounded-xl font-bold shadow-lg shadow-red-950 mb-3 text-sm tracking-wide"
            >
              <HeartPulse size={18} className="animate-pulse" /> REPORT EMERGENCY
            </Link>
            
            {[
              { name: 'Track SOS Status', path: '/track-emergency' },
              { name: 'Find Shelters', path: '/shelters' },
              { name: 'Join Volunteer Network', path: '/volunteer' },
              { name: 'Donate Supplies & Funds', path: '/donate' }
            ].map((link) => (
              <Link 
                key={link.name}
                to={link.path} 
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive(link.path)
                    ? 'bg-slate-800 border border-slate-700 text-cyan-400'
                    : 'text-slate-300 hover:bg-slate-850 hover:text-white border border-transparent'
                }`}
              >
                {link.name}
              </Link>
            ))}
            
            <div className="border-t border-slate-800 my-3 pt-3">
              {user ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 px-2 py-1">
                    <div className="w-8 h-8 rounded-lg bg-cyan-600/30 border border-cyan-500/40 flex items-center justify-center text-xs font-mono font-bold text-cyan-300">
                      {getUserAcronym(user.firstName, user.lastName)}
                    </div>
                    <div>
                      <span className="font-semibold text-white text-sm block">{user.firstName} {user.lastName}</span>
                      <span className="text-[11px] font-mono text-cyan-400 uppercase">{user.role || 'Citizen'}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="block w-full text-center bg-red-500/10 border border-red-500/30 text-red-300 hover:bg-red-500/20 px-4 py-2.5 rounded-xl font-bold text-sm transition-all"
                  >
                    Disconnect / Logout
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2 pt-1">
                  <Link 
                    to="/login" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block text-center text-slate-300 border border-slate-800 hover:bg-slate-850 hover:text-white px-4 py-2.5 rounded-xl font-semibold text-xs font-mono transition-all"
                  >
                    Staff &amp; Partner Login
                  </Link>
                  <Link 
                    to="/register" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block text-center bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2.5 rounded-xl font-bold text-xs font-mono transition-all shadow-md shadow-cyan-950"
                  >
                    Join FloodRelief
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Command Operations Canvas */}
      <main className="flex-grow flex flex-col relative z-10">
        <Outlet />
      </main>

      {/* Modern Disaster Response Agency Footer */}
      <footer className="bg-[#090d16] border-t border-slate-800/80 py-12 relative z-10 text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            
            {/* Col 1: Identity & Mission */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4 group">
                <div className="bg-slate-900 p-1.5 rounded-xl border border-slate-800 shadow-md">
                  <img src="/logo.jpg" alt="FloodRelief Logo" className="h-8 w-8 object-cover rounded-lg" />
                </div>
                <div>
                  <span className="font-serif italic font-bold text-xl tracking-tight text-white">FloodRelief</span>
                  <span className="text-[10px] font-mono tracking-widest text-cyan-400 block uppercase font-semibold">EMERGENCY COMMAND PLATFORM</span>
                </div>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed max-w-md mb-6">
                Real-time disaster relief coordination engine connecting stranded citizens, verified emergency shelters, volunteer squads, and government emergency management agencies.
              </p>
              
              <div className="inline-flex items-center gap-3 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>CENTRAL DISPATCH: ACTIVE (24/7)</span>
              </div>
            </div>

            {/* Col 2: Emergency Hotlines */}
            <div>
              <h3 className="text-white font-bold mb-4 tracking-wider uppercase text-xs font-mono flex items-center gap-2">
                <ShieldAlert size={14} className="text-red-400" /> Emergency Hotlines
              </h3>
              <ul className="space-y-2.5 text-sm font-mono">
                <li className="flex justify-between items-center p-2 rounded-lg bg-slate-900/60 border border-slate-800/80">
                  <span className="text-slate-400 text-xs">NDRF / SDRF</span>
                  <a href="tel:1070" className="text-red-400 font-bold hover:underline">1070</a>
                </li>
                <li className="flex justify-between items-center p-2 rounded-lg bg-slate-900/60 border border-slate-800/80">
                  <span className="text-slate-400 text-xs">Medical Ambulance</span>
                  <a href="tel:108" className="text-red-400 font-bold hover:underline">108</a>
                </li>
                <li className="flex justify-between items-center p-2 rounded-lg bg-slate-900/60 border border-slate-800/80">
                  <span className="text-slate-400 text-xs">State Police SOS</span>
                  <a href="tel:100" className="text-cyan-400 font-bold hover:underline">100</a>
                </li>
                <li className="flex justify-between items-center p-2 rounded-lg bg-slate-900/60 border border-slate-800/80">
                  <span className="text-slate-400 text-xs">Fire & Rescue</span>
                  <a href="tel:101" className="text-amber-400 font-bold hover:underline">101</a>
                </li>
              </ul>
            </div>

            {/* Col 3: Operations & Links */}
            <div>
              <h3 className="text-white font-bold mb-4 tracking-wider uppercase text-xs font-mono flex items-center gap-2">
                <Radio size={14} className="text-cyan-400" /> Command Links
              </h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/dashboard" className="hover:text-cyan-400 transition-colors">Operations Dashboard</Link></li>
                <li><Link to="/shelters" className="hover:text-cyan-400 transition-colors">Shelter Locator & Capacity</Link></li>
                <li><Link to="/emergency" className="text-red-400 hover:text-red-300 font-medium transition-colors">Submit Emergency SOS</Link></li>
                <li><Link to="/volunteer" className="hover:text-cyan-400 transition-colors">Volunteer Deployment</Link></li>
                <li><Link to="/donate" className="hover:text-cyan-400 transition-colors">Relief Supply Donations</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-mono text-slate-500">
            <p>&copy; {new Date().getFullYear()} FloodRelief Coordination Management System. Open Public Safety Infrastructure.</p>
            <div className="flex gap-4">
              <span className="text-slate-400">STATUS: ALL NODES OPERATIONAL</span>
              <span>•</span>
              <span className="text-slate-400">LATENCY: &lt; 40ms</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
