import { Map, Heart, Users, ShieldAlert, Phone, Compass, Activity, Radio, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { socket } from '../utils/socket';

const FLOOD_IMAGES = [
  'https://images.unsplash.com/photo-1460500063983-994d4c27756c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1547683905-f686c993aae5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
];

const Home = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [stats, setStats] = useState({
    activeIncidents: 12,
    rescueMissions: 84,
    openShelters: 24,
    volunteersCount: 350
  });

  const fetchOverview = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/requests/overview`);
      const data = await res.json();
      if (data.status === 'success' && data.data) {
        setStats(data.data);
      }
    } catch (err) {
      console.warn('Failed to load live overview metrics:', err);
    }
  };

  useEffect(() => {
    fetchOverview();

    const handleUpdate = () => {
      fetchOverview();
    };

    socket.on('new-request', handleUpdate);
    socket.on('emergency-status-changed', handleUpdate);
    socket.on('new-volunteer', handleUpdate);

    return () => {
      socket.off('new-request', handleUpdate);
      socket.off('emergency-status-changed', handleUpdate);
      socket.off('new-volunteer', handleUpdate);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % FLOOD_IMAGES.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col relative w-full overflow-hidden bg-[#0b0f19]">
      
      {/* Hero Section */}
      <div className="relative text-white py-20 px-4 sm:px-6 lg:px-8 flex flex-col justify-center min-h-[65vh] border-b border-slate-800 shadow-2xl z-20 overflow-hidden">
        {FLOOD_IMAGES.map((img, index) => (
          <div 
            key={img}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentImageIndex ? 'opacity-35' : 'opacity-0'}`}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-[#0b0f19]/90 via-[#0b0f19]/75 to-[#0b0f19] z-10"></div>
            <img 
              src={img} 
              alt="Disaster response area" 
              className="object-cover w-full h-full transform scale-105"
            />
          </div>
        ))}
        
        <div className="max-w-4xl mx-auto text-center relative z-20 mt-4 space-y-6">
          
          {/* Tactical Telemetry Ribbon */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 text-xs font-mono text-cyan-400 shadow-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>CENTRAL COMMAND ACTIVE</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-300">ASSAM DISASTER COORDINATION NETWORK</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white">
            Coordinating Help.<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-400">
              Saving Lives in Real-Time.
            </span>
          </h1>

          <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Mission-critical platform linking stranded flood victims with emergency rescue squads, verified relief shelters, and rapid supply chains.
          </p>
          
          {/* Command CTAs */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
            <Link 
              to="/emergency" 
              className="bg-red-600 hover:bg-red-500 text-white px-7 py-3.5 rounded-xl font-bold text-base shadow-xl shadow-red-950/80 border border-red-500 transition-all hover:scale-[1.02] flex items-center justify-center gap-2.5"
            >
              <ShieldAlert size={22} className="animate-pulse" />
              <span>REPORT EMERGENCY (SOS)</span>
            </Link>
            
            <Link 
              to="/shelters" 
              className="bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-slate-700 hover:border-cyan-500/60 px-7 py-3.5 rounded-xl font-bold text-base shadow-lg transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              <Compass size={20} />
              <span>FIND NEARBY SHELTERS</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Live Operational Metrics (Solid Dark High-Contrast Panels) */}
      <div className="relative z-30 mx-4 sm:mx-8 lg:mx-auto max-w-6xl -mt-10 mb-16 w-full">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-2">
          {[
            { label: 'Active Incidents', value: stats.activeIncidents.toString(), sub: 'Logged in EOC feed', color: 'text-red-400' },
            { label: 'Rescue Missions', value: stats.rescueMissions.toString(), sub: 'Active & resolved', color: 'text-emerald-400' },
            { label: 'Open Shelters', value: stats.openShelters.toString(), sub: 'Verified & operating', color: 'text-cyan-400' },
            { label: 'Volunteers on Standby', value: stats.volunteersCount.toString(), sub: 'Ready for dispatch', color: 'text-blue-400' }
          ].map((stat, idx) => (
            <div key={idx} className="bg-[#0f172a] p-5 rounded-2xl shadow-xl border border-slate-800 hover:border-slate-700 transition-all text-center">
              <div className={`text-3xl sm:text-4xl font-extrabold font-mono ${stat.color} mb-1`}>
                {stat.value}
              </div>
              <div className="text-xs text-white font-bold uppercase tracking-wider">{stat.label}</div>
              <div className="text-[11px] font-mono text-slate-500 mt-1">{stat.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Operations Services - Solid Command Cards */}
      <div className="py-12 relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-cyan-400 font-bold mb-2">
            <Radio size={14} /> OPERATIONS DIRECTORY
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">How Can We Coordinate?</h2>
          <div className="h-1 w-16 bg-cyan-500 mx-auto rounded-full mt-3"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Service 1 */}
          <div className="bg-[#0f172a] border border-slate-800 hover:border-cyan-500/50 p-7 rounded-2xl shadow-xl transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="w-14 h-14 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 rounded-xl flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                <Map size={28} />
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">Find Safe Shelter</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Locate nearest verified relief camps sorted by road distance, live capacity, medical facilities, and food provisions.
              </p>
            </div>
            <Link to="/shelters" className="inline-flex items-center gap-2 text-cyan-400 text-sm font-bold hover:text-cyan-300 transition-colors">
              Launch Shelter Finder &rarr;
            </Link>
          </div>

          {/* Service 2 */}
          <div className="bg-[#0f172a] border border-slate-800 hover:border-emerald-500/50 p-7 rounded-2xl shadow-xl transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                <Users size={28} />
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">Volunteer Deployment</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Register your skills, boat operation capability, medical expertise, or ground support availability to join the response grid.
              </p>
            </div>
            <Link to="/volunteer" className="inline-flex items-center gap-2 text-emerald-400 text-sm font-bold hover:text-emerald-300 transition-colors">
              Register as Volunteer &rarr;
            </Link>
          </div>

          {/* Service 3 */}
          <div className="bg-[#0f172a] border border-slate-800 hover:border-amber-500/50 p-7 rounded-2xl shadow-xl transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-xl flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                <Heart size={28} />
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">Relief Aid &amp; Supplies</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Channel direct monetary aid or supply drinking water, rations, blankets, and essential medications to verified relief centers.
              </p>
            </div>
            <Link to="/donate" className="inline-flex items-center gap-2 text-amber-400 text-sm font-bold hover:text-amber-300 transition-colors">
              Donate Relief Supplies &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* Emergency Hotlines Directory */}
      <div className="py-14 relative z-20 max-w-5xl mx-auto px-4 sm:px-6 w-full">
        <div className="bg-[#0f172a] border border-slate-800 p-8 rounded-2xl shadow-2xl text-center">
          <div className="inline-flex items-center justify-center p-3 bg-red-500/10 border border-red-500/30 rounded-xl mb-4 text-red-400">
            <Phone className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">Priority Disaster Hotlines</h2>
          <p className="text-slate-400 text-sm mb-8">Direct line connection to government and humanitarian emergency services</p>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
            {[
              { name: 'NDRF / SDRF Central', number: '1070', color: 'text-red-400' },
              { name: 'Ambulance & Trauma', number: '108', color: 'text-red-400' },
              { name: 'State Police SOS', number: '100', color: 'text-cyan-400' },
              { name: 'Fire & Water Rescue', number: '101', color: 'text-amber-400' }
            ].map((contact, idx) => (
              <a 
                key={idx} 
                href={`tel:${contact.number}`}
                className="bg-slate-900 p-4 rounded-xl border border-slate-800 hover:border-slate-700 transition-all hover:-translate-y-0.5 group block"
              >
                <div className="text-[11px] text-slate-400 font-mono uppercase tracking-wider mb-2">{contact.name}</div>
                <div className={`text-2xl sm:text-3xl font-extrabold font-mono ${contact.color} group-hover:underline flex items-center justify-between`}>
                  <span>{contact.number}</span>
                  <ExternalLink size={14} className="text-slate-500 group-hover:text-white" />
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};

export default Home;
