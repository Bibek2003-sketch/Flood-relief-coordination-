import { Map, Heart, Users, ShieldAlert, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

const FLOOD_IMAGES = [
  'https://images.unsplash.com/photo-1460500063983-994d4c27756c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1547683905-f686c993aae5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
];

const HomeGlass = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % FLOOD_IMAGES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col relative w-full overflow-hidden">
      
      {/* Decorative background gradients to make the glass pop */}
      <div className="absolute top-[30%] left-[-10%] w-96 h-96 bg-cyan-600 rounded-full mix-blend-screen filter blur-[120px] opacity-40 animate-pulse pointer-events-none"></div>
      <div className="absolute top-[60%] right-[-10%] w-[30rem] h-[30rem] bg-indigo-600 rounded-full mix-blend-screen filter blur-[150px] opacity-40 pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[20%] w-[40rem] h-[40rem] bg-emerald-600 rounded-full mix-blend-screen filter blur-[150px] opacity-30 pointer-events-none"></div>

      {/* Emergency Status Banner - Glass version */}
      <div className="bg-red-500/20 backdrop-blur-xl border-b border-red-500/30 text-red-50 py-3 px-4 text-center text-sm font-bold tracking-wide shadow-[0_0_20px_rgba(239,68,68,0.2)]">
        CRITICAL ALERT: Severe flooding reported in Assam region. Evacuation orders in effect for low-lying areas.
      </div>

      {/* Hero Section */}
      <div className="relative text-white py-24 px-4 overflow-hidden flex flex-col justify-center min-h-[60vh] rounded-b-[4rem] border-b border-white/10 shadow-2xl z-20">
        {FLOOD_IMAGES.map((img, index) => (
          <div 
            key={img}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentImageIndex ? 'opacity-100' : 'opacity-0'}`}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/60 to-slate-900/90 z-10 backdrop-blur-[2px]"></div>
            <img 
              src={img} 
              alt="Flood situation" 
              className="object-cover w-full h-full transform scale-105"
            />
          </div>
        ))}
        
        <div className="max-w-4xl mx-auto text-center relative z-20 mt-10">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tighter drop-shadow-2xl">
            Coordinating Help.<br/>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-300">Saving Lives.</span>
          </h1>
          <p className="text-xl md:text-2xl text-white/80 mb-12 max-w-2xl mx-auto font-light leading-relaxed">
            A centralized platform for disaster response. Connecting affected citizens with rescue teams and relief resources in real-time.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Link to="/emergency" className="bg-red-500/80 hover:bg-red-500 backdrop-blur-md border border-red-400/50 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-[0_0_30px_rgba(239,68,68,0.4)] transition-all hover:scale-105 flex items-center justify-center gap-3">
              <ShieldAlert size={28} /> Report Emergency
            </Link>
            <Link to="/register" className="bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/30 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl transition-all hover:scale-105">
              Join Network / Register
            </Link>
          </div>
        </div>
      </div>

      {/* Live Situation Overview (Stats) - Glass Panels */}
      <div className="relative z-30 mx-4 sm:mx-8 lg:mx-auto max-w-6xl -mt-12 mb-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 px-2">
          {[
            { label: 'Active Incidents', value: '12', glow: 'shadow-blue-500/20' },
            { label: 'Rescue Missions', value: '84', glow: 'shadow-red-500/20' },
            { label: 'Open Shelters', value: '24', glow: 'shadow-emerald-500/20' },
            { label: 'Active Volunteers', value: '350+', glow: 'shadow-purple-500/20' }
          ].map((stat, idx) => (
            <div key={idx} className={`bg-white/5 backdrop-blur-2xl p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.4)] border border-white/10 text-center transform transition-all duration-300 hover:-translate-y-2 hover:bg-white/10 ${stat.glow}`}>
              <div className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-white/50 mb-2 drop-shadow-md">
                {stat.value}
              </div>
              <div className="text-xs sm:text-sm text-white/60 font-bold uppercase tracking-widest">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions / Services - Glass Cards */}
      <div className="py-20 relative z-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4 drop-shadow-lg">How Can We Help?</h2>
            <div className="h-1.5 w-24 bg-gradient-to-r from-cyan-400 to-blue-500 mx-auto rounded-full shadow-[0_0_15px_rgba(34,211,238,0.5)]"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="group bg-white/5 backdrop-blur-2xl p-8 rounded-[2.5rem] shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] border border-white/10 hover:border-cyan-400/50 transition-all duration-500 hover:-translate-y-4 hover:bg-white/10 relative overflow-hidden">
              <div className="absolute -top-20 -right-20 w-48 h-48 bg-cyan-500 rounded-full filter blur-[80px] opacity-0 group-hover:opacity-40 transition-opacity duration-700"></div>
              <div className="w-20 h-20 bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 rounded-3xl flex items-center justify-center mb-8 shadow-lg transform group-hover:scale-110 transition-transform duration-500">
                <Map size={36} />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">Find Safe Shelter</h3>
              <p className="text-white/60 mb-10 leading-relaxed text-lg">Locate nearby relief camps with available capacity, food, and medical facilities instantly.</p>
              <Link to="/shelters" className="inline-flex items-center gap-2 text-cyan-400 font-bold hover:text-cyan-300 transition-colors group/link text-lg">
                View Map <span className="transform group-hover/link:translate-x-2 transition-transform">&rarr;</span>
              </Link>
            </div>

            {/* Card 2 */}
            <div className="group bg-white/5 backdrop-blur-2xl p-8 rounded-[2.5rem] shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] border border-white/10 hover:border-emerald-400/50 transition-all duration-500 hover:-translate-y-4 hover:bg-white/10 relative overflow-hidden">
              <div className="absolute -top-20 -right-20 w-48 h-48 bg-emerald-500 rounded-full filter blur-[80px] opacity-0 group-hover:opacity-40 transition-opacity duration-700"></div>
              <div className="w-20 h-20 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 rounded-3xl flex items-center justify-center mb-8 shadow-lg transform group-hover:scale-110 transition-transform duration-500">
                <Users size={36} />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">Join as Volunteer</h3>
              <p className="text-white/60 mb-10 leading-relaxed text-lg">Register your skills and availability to help with rescue operations or relief distribution.</p>
              <Link to="/register" className="inline-flex items-center gap-2 text-emerald-400 font-bold hover:text-emerald-300 transition-colors group/link text-lg">
                Register Now <span className="transform group-hover/link:translate-x-2 transition-transform">&rarr;</span>
              </Link>
            </div>

            {/* Card 3 */}
            <div className="group bg-white/5 backdrop-blur-2xl p-8 rounded-[2.5rem] shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] border border-white/10 hover:border-amber-400/50 transition-all duration-500 hover:-translate-y-4 hover:bg-white/10 relative overflow-hidden">
              <div className="absolute -top-20 -right-20 w-48 h-48 bg-amber-500 rounded-full filter blur-[80px] opacity-0 group-hover:opacity-40 transition-opacity duration-700"></div>
              <div className="w-20 h-20 bg-amber-500/20 border border-amber-400/30 text-amber-300 rounded-3xl flex items-center justify-center mb-8 shadow-lg transform group-hover:scale-110 transition-transform duration-500">
                <Heart size={36} />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">Donate to the Cause</h3>
              <p className="text-white/60 mb-10 leading-relaxed text-lg">Provide critical monetary support or essential materials to help affected communities.</p>
              <Link to="/donate" className="inline-flex items-center gap-2 text-amber-400 font-bold hover:text-amber-300 transition-colors group/link text-lg">
                Make a Donation <span className="transform group-hover/link:translate-x-2 transition-transform">&rarr;</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Contacts Section - Frosted Glass Box */}
      <div className="py-24 relative z-20">
        <div className="max-w-5xl mx-auto px-4">
          <div className="bg-white/5 backdrop-blur-3xl p-12 rounded-[3rem] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCI+PHBhdGggZD0iTTAgMGgyNHYyNEgweiIgZmlsbD0ibm9uZSIvPjxnIGZpbGw9IiNmZmYiIG9wYWNpdHk9Ii4wNSI+PHBhdGggZD0iTTAgMGgxMnYxMkgweiIvPjxwYXRoIGQ9Ik0xMiAxMmgxMnYxMkgxMnoiLz48L2c+PC9zdmc+')] opacity-10"></div>
            
            <div className="inline-flex items-center justify-center p-5 bg-red-500/20 border border-red-500/30 rounded-3xl mb-8 shadow-[0_0_30px_rgba(239,68,68,0.3)]">
              <Phone className="w-12 h-12 text-red-400" />
            </div>
            <h2 className="text-4xl font-extrabold text-white mb-16 tracking-tight">Important Emergency Numbers</h2>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-left">
              {[
                { name: 'NDRF / SDRF', number: '1070' },
                { name: 'Ambulance', number: '108' },
                { name: 'Police', number: '100' },
                { name: 'Fire', number: '101' }
              ].map((contact, idx) => (
                <div key={idx} className="bg-black/20 backdrop-blur-md p-6 rounded-3xl border border-white/5 hover:border-white/20 transition-all hover:-translate-y-1">
                  <div className="text-xs text-white/50 font-bold uppercase tracking-widest mb-3">{contact.name}</div>
                  <div className="text-3xl font-black text-white">{contact.number}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeGlass;
