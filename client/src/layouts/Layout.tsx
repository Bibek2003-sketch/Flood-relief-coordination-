import { Outlet, Link, useLocation } from 'react-router-dom';
import { Menu, X, User, HeartPulse } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ProfileDropdown } from '../components/ProfileDropdown';

const LayoutGlass = () => {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-indigo-950 to-emerald-950 text-white selection:bg-cyan-500/30">
      
      {/* Liquid Glass Navbar */}
      <nav className="sticky top-0 z-50 bg-white/5 backdrop-blur-2xl border-b border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-3 group">
                <div className="bg-white/10 backdrop-blur-md p-1.5 rounded-xl border border-white/20 shadow-[0_4px_16px_0_rgba(255,255,255,0.1)] group-hover:-translate-y-1 transition-all duration-300">
                  <img src="/logo.jpg" alt="FloodRelief Logo" className="h-9 w-9 object-cover rounded-lg" />
                </div>
                <span className="font-serif italic font-bold text-2xl tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-100 to-blue-200">
                  FloodRelief
                </span>
              </Link>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-2 lg:space-x-4">
              <Link 
                to="/emergency" 
                className="bg-red-500/20 hover:bg-red-500/40 backdrop-blur-lg border border-red-500/30 text-white px-5 py-2.5 rounded-xl font-bold transition-all duration-300 shadow-[0_0_15px_rgba(220,38,38,0.3)] hover:shadow-[0_0_25px_rgba(220,38,38,0.6)] hover:-translate-y-1 flex items-center gap-2 mr-4"
              >
                <HeartPulse size={20} className="animate-pulse text-red-400" />
                Report Emergency
              </Link>
              
              {[
                { name: 'Find Shelter', path: '/shelters' },
                { name: 'Volunteer', path: '/volunteer' },
                { name: 'Donate', path: '/donate' }
              ].map((link) => (
                <Link 
                  key={link.name}
                  to={link.path} 
                  className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                    isActive(link.path) 
                      ? 'bg-white/20 backdrop-blur-md border border-white/30 text-white shadow-[0_4px_12px_0_rgba(0,0,0,0.1)]' 
                      : 'text-white/70 hover:text-white hover:bg-white/10 border border-transparent'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              
              <div className="h-8 w-px bg-white/20 mx-2"></div>
              
              {user ? (
                <ProfileDropdown />
              ) : (
                <div className="flex items-center space-x-3 ml-2">
                  <Link 
                    to="/login" 
                    className="flex items-center gap-1 text-white/70 hover:text-white px-4 py-2.5 rounded-xl border border-white/10 hover:border-white/30 hover:bg-white/5 transition-all duration-300 font-medium"
                  >
                    Login
                  </Link>
                  <Link 
                    to="/register" 
                    className="flex items-center gap-2 bg-cyan-500/20 hover:bg-cyan-500/40 backdrop-blur-md border border-cyan-400/30 text-cyan-50 px-5 py-2.5 rounded-xl font-bold transition-all duration-300 hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] hover:-translate-y-1"
                  >
                    <User size={18} /> Register
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-white/80 hover:text-white p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/20 transition-all"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden overflow-hidden transition-all duration-500 ease-in-out ${isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="bg-slate-900/60 backdrop-blur-3xl px-4 pt-4 pb-6 space-y-3 border-t border-white/10">
            <Link 
              to="/emergency" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full bg-red-500/30 backdrop-blur-md border border-red-500/50 text-white px-4 py-3.5 rounded-xl font-bold shadow-[0_0_15px_rgba(220,38,38,0.3)] mb-4"
            >
              <HeartPulse size={18} className="animate-pulse" /> REPORT EMERGENCY
            </Link>
            
            {[
              { name: 'Find Shelter', path: '/shelters' },
              { name: 'Volunteer', path: '/volunteer' },
              { name: 'Donate', path: '/donate' }
            ].map((link) => (
              <Link 
                key={link.name}
                to={link.path} 
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-4 py-3 rounded-xl font-semibold transition-all ${
                  isActive(link.path)
                    ? 'bg-white/20 border border-white/30 text-white'
                    : 'text-white/70 hover:bg-white/10 hover:text-white border border-transparent'
                }`}
              >
                {link.name}
              </Link>
            ))}
            
            <div className="border-t border-white/10 my-4 pt-4">
              {user ? (
                <button 
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="block w-full text-center bg-red-500/10 border border-red-500/20 text-red-200 hover:bg-red-500/30 hover:text-white px-4 py-3 rounded-xl font-bold transition-all"
                >
                  Logout ({user.firstName})
                </button>
              ) : (
                <div className="flex flex-col gap-3">
                  <Link 
                    to="/login" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block text-center text-white/80 border border-white/20 hover:bg-white/10 hover:text-white px-4 py-3 rounded-xl font-semibold transition-all"
                  >
                    Login
                  </Link>
                  <Link 
                    to="/register" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block text-center bg-cyan-500/30 border border-cyan-400/50 text-white px-4 py-3 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(34,211,238,0.2)]"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow flex flex-col relative z-10">
        <Outlet />
      </main>

      {/* Footer Liquid Glass */}
      <footer className="bg-black/20 backdrop-blur-2xl border-t border-white/10 py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <div className="flex items-center gap-3 mb-6 group">
                <div className="bg-white/10 backdrop-blur-md p-1.5 rounded-xl border border-white/20 group-hover:-translate-y-1 transition-transform">
                  <img src="/logo.jpg" alt="FloodRelief Logo" className="h-7 w-7 object-cover rounded-lg" />
                </div>
                <span className="font-serif italic font-bold text-xl tracking-wide text-white/90">FloodRelief</span>
              </div>
              <p className="text-white/60 leading-relaxed">Coordinating Help.<br/>Saving Lives through technology.</p>
            </div>
            <div>
              <h3 className="text-white/90 font-bold mb-6 tracking-wider uppercase text-sm">Emergency Contacts</h3>
              <ul className="space-y-3 text-white/60">
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-cyan-400"></div> Disaster Management: <strong className="text-white">1070</strong></li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-red-400"></div> Ambulance: <strong className="text-white">108</strong></li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div> Police: <strong className="text-white">100</strong></li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-orange-400"></div> Fire: <strong className="text-white">101</strong></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white/90 font-bold mb-6 tracking-wider uppercase text-sm">Quick Links</h3>
              <ul className="space-y-3 text-white/60">
                <li><Link to="/about" className="hover:text-cyan-300 transition-colors">About Us</Link></li>
                <li><Link to="/contact" className="hover:text-cyan-300 transition-colors">Contact</Link></li>
                <li><Link to="/privacy" className="hover:text-cyan-300 transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 mt-12 pt-8 text-center text-white/40 text-sm">
            <p>&copy; {new Date().getFullYear()} FloodRelief Coordination Management System. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LayoutGlass;
