import { useState, useEffect, useRef } from 'react';
import { 
  Map, Search, Tent, Users, Phone, MapPin, 
  Navigation, Loader2, Check, ExternalLink, 
  ShieldCheck, Filter, Compass, AlertTriangle 
} from 'lucide-react';
import MapComponent from '../components/MapComponent';
import { searchPlace, reverseGeocode, calculateDistanceKm, GeocodeResult } from '../utils/geocoding';
import toast from 'react-hot-toast';

interface ShelterItem {
  id: string;
  name: string;
  address: string;
  contactPerson: string;
  contactNumber: string;
  capacity: number;
  currentOccupancy: number;
  status: 'Open' | 'Full' | 'Closed' | 'Maintenance';
  facilities: string[];
  coordinates: {
    type: string;
    coordinates: [number, number]; // [lng, lat]
  };
  distanceKm?: number;
  lat: number;
  lng: number;
}

const SheltersFinder = () => {
  const [shelters, setShelters] = useState<ShelterItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Flood location state
  const [floodAddress, setFloodAddress] = useState('');
  const [floodCoords, setFloodCoords] = useState<[number, number] | null>(null); // [lat, lng]
  const [isLocating, setIsLocating] = useState(false);
  const [isSearchingPlace, setIsSearchingPlace] = useState(false);
  const [suggestions, setSuggestions] = useState<GeocodeResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Filters and selected shelter
  const [searchFilter, setSearchFilter] = useState('');
  const [filterOpenOnly, setFilterOpenOnly] = useState(false);
  const [filterMedicalOnly, setFilterMedicalOnly] = useState(false);
  const [selectedShelterId, setSelectedShelterId] = useState<string | null>(null);

  const searchTimeoutRef = useRef<any>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch real shelters from backend
  useEffect(() => {
    const fetchShelters = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/shelters`);
        const data = await response.json();
        if (data.status === 'success' || data.success) {
          const formatted: ShelterItem[] = data.data.map((s: any) => {
            const [lng, lat] = s.coordinates?.coordinates || [91.7362, 26.1445];
            const facilityKeys = s.facilities ? Object.keys(s.facilities).filter(k => s.facilities[k]) : [];
            return {
              id: s._id,
              name: s.name,
              address: s.address,
              contactPerson: s.contactPerson || 'Camp Officer',
              contactNumber: s.contactNumber || '+91 99999 99999',
              capacity: s.capacity || 500,
              currentOccupancy: s.currentOccupancy || 0,
              status: s.operatingStatus || 'Open',
              facilities: facilityKeys,
              coordinates: s.coordinates,
              lat,
              lng
            };
          });
          setShelters(formatted);
        }
      } catch (error) {
        console.error('Failed to fetch shelters:', error);
        toast.error('Could not load shelters from server');
      } finally {
        setLoading(false);
      }
    };

    fetchShelters();
  }, []);

  // Handle typing place of flood occurrence
  const handleFloodInputChange = (val: string) => {
    setFloodAddress(val);
    setShowSuggestions(true);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!val || val.trim().length < 2) {
      setSuggestions([]);
      setIsSearchingPlace(false);
      return;
    }

    setIsSearchingPlace(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const results = await searchPlace(val);
        setSuggestions(results);
        if (results.length > 0) {
          const top = results[0];
          const lat = parseFloat(top.lat);
          const lng = parseFloat(top.lon);
          setFloodCoords([lat, lng]);
        }
      } catch (err) {
        console.error('Geocoding search failed:', err);
      } finally {
        setIsSearchingPlace(false);
      }
    }, 450);
  };

  // Select place from suggestions
  const handleSelectSuggestion = (item: GeocodeResult) => {
    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lon);
    setFloodCoords([lat, lng]);
    setFloodAddress(item.display_name.split(',').slice(0, 3).join(', '));
    setSuggestions([]);
    setShowSuggestions(false);
    toast.success(`Flood point set: ${item.display_name.split(',')[0]}`);
  };

  // Handle Map Click to set Flood Occurrence Location
  const handleMapClick = async (lat: number, lng: number) => {
    setFloodCoords([lat, lng]);
    const addr = await reverseGeocode(lat, lng);
    if (addr) {
      const shortAddr = addr.split(',').slice(0, 3).join(', ');
      setFloodAddress(shortAddr);
      toast.success(`Flood point set: ${shortAddr.split(',')[0]}`);
    } else {
      setFloodAddress(`Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
      toast.success(`Flood point set at [${lat.toFixed(4)}, ${lng.toFixed(4)}]`);
    }
  };

  // One-click Auto-GPS
  const handleGetLiveLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setFloodCoords([latitude, longitude]);
        setIsLocating(false);
        toast.success('Your live location has been detected!');

        const addr = await reverseGeocode(latitude, longitude);
        if (addr) {
          setFloodAddress(addr.split(',').slice(0, 3).join(', '));
        } else {
          setFloodAddress(`Current Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
        }
      },
      () => {
        setIsLocating(false);
        toast.error('Unable to retrieve device GPS. Please type place name.');
      }
    );
  };

  // Calculate distances from flood location & sort by nearest distance
  const processedShelters = shelters.map(s => {
    if (floodCoords) {
      const dist = calculateDistanceKm(floodCoords[0], floodCoords[1], s.lat, s.lng);
      return { ...s, distanceKm: dist };
    }
    return { ...s, distanceKm: undefined };
  });

  // Filter shelters
  const filteredShelters = processedShelters.filter(s => {
    const matchesSearch = 
      s.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      s.address.toLowerCase().includes(searchFilter.toLowerCase());

    const matchesOpen = filterOpenOnly ? (s.status === 'Open' && s.currentOccupancy < s.capacity) : true;
    const matchesMedical = filterMedicalOnly ? s.facilities.includes('medicalSupport') : true;

    return matchesSearch && matchesOpen && matchesMedical;
  });

  // Sort: If flood location is set, sort ascending by distanceKm!
  const sortedShelters = [...filteredShelters].sort((a, b) => {
    if (floodCoords && a.distanceKm !== undefined && b.distanceKm !== undefined) {
      return a.distanceKm - b.distanceKm;
    }
    return 0;
  });

  const selectedShelter = shelters.find(s => s.id === selectedShelterId);
  const selectedShelterCoords: [number, number] | null = selectedShelter ? [selectedShelter.lat, selectedShelter.lng] : null;

  return (
    <div className="flex-grow flex flex-col lg:flex-row h-full relative z-10 bg-[#0b0f19]">
      
      {/* Sidebar Controls & Sorted List */}
      <div className="w-full lg:w-[480px] xl:w-[520px] bg-[#0c1220] border-r border-slate-800 flex flex-col h-[calc(100vh-80px)] shadow-2xl relative z-20">
        
        {/* Flood Location Selection Card */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-900/90 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-extrabold text-white flex items-center gap-2">
              <Compass className="text-cyan-400" size={22} /> 
              Shelter Tactical Locator
            </h2>
            <span className="text-[11px] font-mono bg-cyan-500/10 text-cyan-400 font-bold px-2.5 py-1 rounded-full border border-cyan-500/30">
              {shelters.length} CAMPS VERIFIED
            </span>
          </div>

          {/* Place of Flood Occurrence Input */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300 font-bold flex items-center gap-1.5">
                <AlertTriangle size={14} className="text-amber-400" />
                Select Place of Flood Occurrence:
              </span>
              {floodCoords && (
                <button 
                  onClick={() => { setFloodCoords(null); setFloodAddress(''); }}
                  className="text-slate-400 hover:text-white underline text-[11px] font-mono"
                >
                  Reset Point
                </button>
              )}
            </div>

            <div className="relative" ref={dropdownRef}>
              <MapPin className="absolute left-3.5 top-3 text-red-400 z-10" size={17} />
              <input 
                type="text" 
                placeholder="Type area (e.g. Jalukbari, Dispur, Silchar)..." 
                value={floodAddress}
                onChange={(e) => handleFloodInputChange(e.target.value)}
                onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
                className="w-full pl-10 pr-24 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 text-white placeholder-slate-500 text-xs sm:text-sm transition-all"
              />
              <button
                type="button"
                onClick={handleGetLiveLocation}
                disabled={isLocating}
                className="absolute right-1.5 top-1.5 bg-cyan-600/20 hover:bg-cyan-600/40 text-cyan-300 border border-cyan-500/40 px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 z-10"
              >
                {isLocating ? <Loader2 size={13} className="animate-spin" /> : <Navigation size={13} />}
                <span>{isLocating ? 'Locating' : 'My GPS'}</span>
              </button>

              {/* Suggestions Dropdown */}
              {showSuggestions && (suggestions.length > 0 || isSearchingPlace) && (
                <div className="absolute left-0 right-0 top-full mt-2 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden divide-y divide-slate-800 max-h-56 overflow-y-auto">
                  {isSearchingPlace && (
                    <div className="p-3 text-xs font-mono text-cyan-300 flex items-center gap-2">
                      <Loader2 size={14} className="animate-spin" />
                      <span>Locating "{floodAddress}"...</span>
                    </div>
                  )}
                  {suggestions.map((item) => (
                    <button
                      key={item.place_id}
                      type="button"
                      onClick={() => handleSelectSuggestion(item)}
                      className="w-full text-left p-3 hover:bg-slate-800 transition-colors flex items-start gap-2.5 text-xs text-slate-200 group"
                    >
                      <MapPin size={15} className="text-cyan-400 mt-0.5 shrink-0 group-hover:scale-110 transition-transform" />
                      <div>
                        <p className="font-bold text-white leading-tight">
                          {item.display_name.split(',')[0]}
                        </p>
                        <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5 font-mono">
                          {item.display_name.split(',').slice(1).join(',')}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <p className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
              <span>TIP: Click directly anywhere on the map to set flood point.</span>
            </p>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[130px]">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
              <input 
                type="text" 
                placeholder="Filter shelter roster..." 
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none"
              />
            </div>
            
            <button 
              onClick={() => setFilterOpenOnly(!filterOpenOnly)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all border flex items-center gap-1 ${
                filterOpenOnly 
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300' 
                  : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              <Check size={12} className={filterOpenOnly ? 'opacity-100' : 'opacity-0'} />
              Open Only
            </button>

            <button 
              onClick={() => setFilterMedicalOnly(!filterMedicalOnly)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all border flex items-center gap-1 ${
                filterMedicalOnly 
                  ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300' 
                  : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              <Check size={12} className={filterMedicalOnly ? 'opacity-100' : 'opacity-0'} />
              Medical Unit
            </button>
          </div>

          {floodCoords && (
            <div className="flex items-center justify-between text-xs bg-slate-950 border border-cyan-500/40 px-3 py-2 rounded-xl text-cyan-300">
              <span className="font-semibold flex items-center gap-1.5">
                <ShieldCheck size={16} className="text-cyan-400" />
                Sorted by road proximity to incident point
              </span>
              <span className="text-[11px] font-mono text-cyan-400">
                {floodCoords[0].toFixed(3)}°N, {floodCoords[1].toFixed(3)}°E
              </span>
            </div>
          )}
        </div>

        {/* Shelters List sorted by distance */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 custom-scrollbar bg-[#0c1220]">
          {loading && (
            <div className="text-center py-12 text-cyan-400 font-mono text-sm animate-pulse flex flex-col items-center gap-3">
              <Loader2 size={32} className="animate-spin text-cyan-400" />
              <span>COMMUNICATING WITH DISASTER DATABASE...</span>
            </div>
          )}

          {!loading && sortedShelters.map((shelter, idx) => {
            const percentage = Math.round((shelter.currentOccupancy / shelter.capacity) * 100);
            const isFull = shelter.status === 'Full' || percentage >= 100;
            const isSelected = shelter.id === selectedShelterId;
            const spotsLeft = Math.max(0, shelter.capacity - shelter.currentOccupancy);

            return (
              <div 
                key={shelter.id} 
                onClick={() => setSelectedShelterId(shelter.id)}
                className={`p-4 rounded-xl transition-all cursor-pointer relative overflow-hidden border ${
                  isSelected 
                    ? 'bg-[#0f172a] border-cyan-400 ring-1 ring-cyan-400 shadow-xl shadow-cyan-950/40' 
                    : 'bg-[#0f172a] border-slate-800 hover:border-slate-700 shadow-sm'
                }`}
              >
                {/* Distance Badge & Rank */}
                <div className="flex justify-between items-start gap-2 mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      {idx === 0 && floodCoords && (
                        <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                          #1 NEAREST SHELTER
                        </span>
                      )}
                      {shelter.distanceKm !== undefined && (
                        <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-xs font-mono font-bold px-2 py-0.5 rounded flex items-center gap-1">
                          <MapPin size={12} className="text-cyan-400" />
                          {shelter.distanceKm} km away
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-base text-white hover:text-cyan-300 transition-colors leading-snug">
                      {shelter.name}
                    </h3>
                  </div>

                  <span className={`px-2 py-0.5 text-xs font-mono font-bold rounded shrink-0 border ${
                    isFull 
                      ? 'bg-red-500/10 text-red-400 border-red-500/30' 
                      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  }`}>
                    {isFull ? 'FULL' : 'OPEN'}
                  </span>
                </div>
                
                <p className="text-xs text-slate-400 flex items-center gap-1.5 mb-3">
                  <MapPin size={13} className="text-slate-500 shrink-0" /> 
                  <span className="truncate">{shelter.address}</span>
                </p>
                
                {/* Capacity Progress Bar */}
                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 mb-3 font-mono text-xs">
                  <div className="flex justify-between font-medium mb-1.5">
                    <span className="text-slate-400">
                      LOAD: <strong className="text-white">{shelter.currentOccupancy}</strong> / {shelter.capacity}
                    </span>
                    <span className={isFull ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>
                      {isFull ? 'CAPACITY EXHAUSTED' : `${spotsLeft} BEDS FREE`}
                    </span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                    <div 
                      className={`h-full rounded-full transition-all duration-700 ${
                        isFull 
                          ? 'bg-red-500' 
                          : percentage > 80 
                            ? 'bg-amber-500' 
                            : 'bg-emerald-500'
                      }`} 
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Facilities Badges */}
                <div className="flex flex-wrap gap-1.5 mb-3.5">
                  {shelter.facilities.map((fac) => (
                    <span key={fac} className="bg-slate-900 text-cyan-300 text-[11px] px-2 py-0.5 rounded border border-slate-800 font-mono">
                      {fac === 'medicalSupport' ? 'Medical Clinic' : fac === 'womenFriendly' ? 'Women Center' : fac === 'childFriendly' ? 'Pediatric Care' : fac}
                    </span>
                  ))}
                </div>

                {/* Quick Action Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-xs">
                  <a 
                    href={`https://www.google.com/maps/dir/?api=1${floodCoords ? `&origin=${floodCoords[0]},${floodCoords[1]}` : ''}&destination=${shelter.lat},${shelter.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 py-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all"
                  >
                    <ExternalLink size={13} /> DIRECTIONS
                  </a>
                  
                  <a 
                    href={`tel:${shelter.contactNumber}`}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 py-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Phone size={13} className="text-emerald-400" /> CALL CAMP
                  </a>
                </div>
              </div>
            );
          })}
          
          {!loading && sortedShelters.length === 0 && (
            <div className="text-center py-12 text-slate-500 space-y-2 font-mono text-xs">
              <Tent size={36} className="mx-auto text-slate-600" />
              <p className="font-bold text-slate-400">NO SHELTERS FOUND IN QUERY</p>
              <p className="text-slate-500">Adjust search filter or expand coordinates.</p>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Map View */}
      <div className="flex-1 relative h-[50vh] lg:h-[calc(100vh-80px)] z-0 bg-[#0a0e17]">
        <MapComponent 
          center={floodCoords || selectedShelterCoords || [26.1524, 91.6622]} 
          zoom={floodCoords || selectedShelterCoords ? 14 : 12} 
          shelters={sortedShelters}
          floodLocation={floodCoords}
          selectedShelterLocation={selectedShelterCoords}
          onMapClick={handleMapClick}
          onShelterClick={(s: any) => setSelectedShelterId(s._id || s.id)}
        />

        {/* Floating Map Legend */}
        <div className="absolute top-4 right-4 z-10 bg-[#0f172a]/95 backdrop-blur-md border border-slate-700/80 p-3.5 rounded-xl shadow-2xl text-xs text-white space-y-2 pointer-events-auto font-mono">
          <div className="font-bold text-slate-300 pb-1.5 border-b border-slate-800 uppercase tracking-wider text-[11px]">
            GIS MAP LAYERS
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 rounded-full bg-red-500 border border-white/30 shadow-sm"></div>
            <span className="text-slate-300">Flood Occurrence Point</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 border border-white/30 shadow-sm"></div>
            <span className="text-slate-300">Open Relief Shelter</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 rounded-full bg-red-600 border border-white/30 shadow-sm"></div>
            <span className="text-slate-300">Capacity Full Camp</span>
          </div>
          {floodCoords && selectedShelterCoords && (
            <div className="flex items-center gap-2 pt-1 border-t border-slate-800 text-cyan-300 font-semibold">
              <div className="w-4 h-0.5 border-t-2 border-dashed border-cyan-400"></div>
              <span>Proximity Vector</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SheltersFinder;
