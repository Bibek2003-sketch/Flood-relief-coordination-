import { useState, useEffect } from 'react';
import { Map, Search, Tent, Users, Phone, MapPin } from 'lucide-react';
import MapComponent from '../components/MapComponent';

const SheltersFinder = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [shelters, setShelters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShelters = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/shelters`);
        const data = await response.json();
        if (data.status === 'success' || data.success) {
          // Map backend format to frontend format slightly for compatibility
          const formatted = data.data.map((s: any) => ({
            id: s._id,
            name: s.name,
            address: s.address,
            distance: 'N/A', // We could calculate this from user's location if we wanted
            capacity: s.capacity,
            currentOccupancy: s.currentOccupancy,
            status: s.operatingStatus,
            facilities: Object.keys(s.facilities).filter(k => s.facilities[k]),
            coordinates: s.coordinates
          }));
          setShelters(formatted);
        }
      } catch (error) {
        console.error('Failed to fetch shelters:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchShelters();
  }, []);
  
  const filteredShelters = shelters.filter(shelter => 
    shelter.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shelter.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-grow flex flex-col md:flex-row h-full">
      {/* Sidebar List */}
      <div className="w-full md:w-1/3 lg:w-1/4 bg-black/40 backdrop-blur-xl border-r border-white/10 overflow-y-auto h-[calc(100vh-80px)] flex flex-col shadow-2xl relative z-10">
        <div className="p-4 border-b border-white/10 bg-black/40 backdrop-blur-md sticky top-0 z-20">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-cyan-300">
            <Tent /> Find Nearby Shelters
          </h2>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-white/50" size={20} />
            <input 
              type="text" 
              placeholder="Search by name or location..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-md focus:ring-cyan-500 focus:border-cyan-500 text-white placeholder-white/50 transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading && (
            <div className="text-center py-8 text-cyan-300 font-medium animate-pulse">
              Loading shelters from database...
            </div>
          )}
          {!loading && filteredShelters.map(shelter => {
            const percentage = Math.round((shelter.currentOccupancy / shelter.capacity) * 100);
            const isFull = percentage >= 100;

            return (
              <div key={shelter.id} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 shadow-sm hover:shadow-[0_0_20px_rgba(34,211,238,0.2)] hover:border-cyan-500/50 transition-all cursor-pointer group">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-white group-hover:text-cyan-300 transition-colors">{shelter.name}</h3>
                  <span className={`px-2 py-1 text-xs font-bold rounded ${isFull ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'}`}>
                    {shelter.status}
                  </span>
                </div>
                
                <p className="text-sm text-white/60 flex items-center gap-1 mb-1">
                  <MapPin size={14} className="text-cyan-400" /> {shelter.address} ({shelter.distance})
                </p>
                
                <div className="mt-4">
                  <div className="flex justify-between text-xs font-medium text-white/50 mb-1">
                    <span className="flex items-center gap-1"><Users size={12} /> {shelter.currentOccupancy} / {shelter.capacity}</span>
                    <span className={isFull ? 'text-red-400' : 'text-emerald-400'}>{percentage}%</span>
                  </div>
                  <div className="w-full bg-black/40 rounded-full h-2 overflow-hidden border border-white/5">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${isFull ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]' : percentage > 80 ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.8)]' : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]'}`} 
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {shelter.facilities.map(facility => (
                    <span key={facility} className="bg-cyan-500/10 text-cyan-200 text-xs px-2 py-1 rounded border border-cyan-500/20">
                      {facility}
                    </span>
                  ))}
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <button className="bg-cyan-500/20 text-cyan-100 border border-cyan-500/30 hover:bg-cyan-500/40 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-1 transition-colors">
                    <Map size={14} /> Directions
                  </button>
                  <button className="bg-white/5 text-white/80 border border-white/10 hover:bg-white/10 hover:text-white py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-1 transition-colors">
                    <Phone size={14} /> Contact
                  </button>
                </div>
              </div>
            );
          })}
          
          {filteredShelters.length === 0 && (
            <div className="text-center py-8 text-white/50 font-medium">
              No shelters found matching your search.
            </div>
          )}
        </div>
      </div>

      {/* Map View */}
      <div className="flex-1 relative h-[50vh] md:h-[calc(100vh-80px)] z-0">
        <MapComponent 
          center={[26.1445, 91.7362]} 
          zoom={12} 
          shelters={filteredShelters}
        />
      </div>
    </div>
  );
};

export default SheltersFinder;
