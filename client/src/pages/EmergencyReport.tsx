import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, MapPin, Send, Navigation, Loader2, Check, Radio, ArrowRight, ShieldCheck, Copy, MessageSquare, PhoneCall } from 'lucide-react';
import MapComponent from '../components/MapComponent';
import toast from 'react-hot-toast';
import { searchPlace, reverseGeocode, GeocodeResult } from '../utils/geocoding';

const EmergencyReport = () => {
  const navigate = useNavigate();
  const [submittedReport, setSubmittedReport] = useState<{ 
    requestId: string; 
    status: string; 
    phoneMasked?: string; 
    preferredLanguage?: string;
  } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [selectedPin, setSelectedPin] = useState<[number, number] | null>(null);
  const [suggestions, setSuggestions] = useState<GeocodeResult[]>([]);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchTimeoutRef = useRef<any>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    contactEmail: '',
    preferredLanguage: 'en' as 'en' | 'as' | 'hi' | 'bn' | 'br',
    location: '',
    people: 1,
    children: 0,
    elderly: 0,
    disabled: 0,
    categories: [] as string[],
    description: ''
  });

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const categoriesList = ['Rescue', 'Food', 'Drinking water', 'Medicine', 'Shelter', 'Medical assistance'];

  const toggleCategory = (cat: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(cat) 
        ? prev.categories.filter(c => c !== cat)
        : [...prev.categories, cat]
    }));
  };

  const handleLocationInputChange = (val: string) => {
    setFormData(prev => ({ ...prev, location: val }));
    setShowSuggestions(true);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!val || val.trim().length < 2 || val.startsWith('GPS:')) {
      setSuggestions([]);
      setIsSearchingLocation(false);
      return;
    }

    setIsSearchingLocation(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const results = await searchPlace(val);
        setSuggestions(results);
        if (results.length > 0) {
          const top = results[0];
          const lat = parseFloat(top.lat);
          const lng = parseFloat(top.lon);
          setSelectedPin([lat, lng]);
        }
      } catch (err) {
        console.error('Error during geocoding search:', err);
      } finally {
        setIsSearchingLocation(false);
      }
    }, 450);
  };

  const handleSelectSuggestion = (item: GeocodeResult) => {
    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lon);
    setSelectedPin([lat, lng]);
    setFormData(prev => ({ ...prev, location: item.display_name }));
    setSuggestions([]);
    setShowSuggestions(false);
    toast.success(`Pinned: ${item.display_name.split(',')[0]}`);
  };

  const handleMapClick = async (lat: number, lng: number) => {
    setSelectedPin([lat, lng]);
    const readableAddress = await reverseGeocode(lat, lng);
    if (readableAddress) {
      setFormData(prev => ({ ...prev, location: readableAddress }));
      toast.success(`Pinned: ${readableAddress.split(',')[0]}`);
    } else {
      setFormData(prev => ({ ...prev, location: `GPS: ${lat.toFixed(6)}, ${lng.toFixed(6)}` }));
    }
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setSelectedPin([latitude, longitude]);
        setIsLocating(false);
        toast.success("Current location found!");

        const readableAddress = await reverseGeocode(latitude, longitude);
        if (readableAddress) {
          setFormData(prev => ({ ...prev, location: readableAddress }));
        } else {
          setFormData(prev => ({ ...prev, location: `GPS: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}` }));
        }
      },
      () => {
        toast.error("Unable to retrieve your location. Please enter manually.");
        setIsLocating(false);
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Determine coordinates from pin, or parse GPS string, or fallback to Guwahati center
    let coordinates = [91.7362, 26.1445]; // [lng, lat]
    if (selectedPin) {
      coordinates = [selectedPin[1], selectedPin[0]]; // [lng, lat] for GeoJSON
    } else if (formData.location.startsWith('GPS:')) {
      const parts = formData.location.split('GPS:')[1].split(',');
      if (parts.length === 2) {
        coordinates = [parseFloat(parts[1].trim()), parseFloat(parts[0].trim())]; // [lng, lat]
      }
    }

    // Validate Indian phone number format
    const cleanedPhone = formData.contact.replace(/[\s\-\(\)\.]/g, '');
    const digitsOnly = cleanedPhone.replace(/^\+91/, '').replace(/^0/, '');
    if (!/^\d{10}$/.test(digitsOnly)) {
      toast.error('Please enter a valid 10-digit mobile number for SMS dispatch alerts.');
      return;
    }

    try {
      const payload = {
        name: formData.name,
        citizenName: formData.name || 'Citizen',
        contact: formData.contact,
        contactEmail: formData.contactEmail,
        preferredLanguage: formData.preferredLanguage,
        location: formData.location, // String address or "GPS: lat, lng"
        coordinates: {
          type: "Point",
          coordinates: coordinates
        },
        requestCategory: formData.categories.length > 0 ? formData.categories : ['Rescue'],
        numberOfPeople: formData.people,
        numberOfChildren: formData.children,
        numberOfElderly: formData.elderly,
        numberOfDisabled: formData.disabled,
        description: formData.description
      };

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (data.status === 'success' || data.success) {
        const generatedId = data.requestId || data.data?.requestID || data.data?.requestId || `FLD-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
        const last4 = digitsOnly.slice(-4);
        const maskedPhone = `+91 ******${last4}`;
        setSubmittedReport({
          requestId: generatedId,
          status: 'Submitted / Under Review',
          phoneMasked: maskedPhone,
          preferredLanguage: formData.preferredLanguage
        });
        toast.success(`Emergency registered: ${generatedId}`);
        setFormData({
          name: '', contact: '', contactEmail: '', preferredLanguage: formData.preferredLanguage, location: '', people: 1, children: 0, elderly: 0, disabled: 0, categories: [], description: ''
        });
        setSelectedPin(null);
        setSuggestions([]);
      } else {
        toast.error(data.message || data.error || 'Failed to submit report');
      }
    } catch (error) {
      console.error(error);
      toast.error('Network error. Failed to connect to server.');
    }
  };

  return (
    <div className="flex-grow py-8 sm:py-12 px-4 sm:px-6 lg:px-8 relative z-10 bg-[#0b0f19]">
      <div className="max-w-3xl mx-auto">
        <div className="bg-red-950/90 text-white rounded-t-2xl p-6 sm:p-8 text-center border border-red-600/60 border-b-0 shadow-2xl">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-red-600/20 border border-red-500/40 text-red-400 mb-3 animate-pulse">
            <AlertCircle className="w-10 h-10" />
          </div>
          <div className="text-[11px] font-mono tracking-widest text-red-400 font-bold uppercase mb-1">
            CRITICAL SOS INTAKE PORTAL
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">Emergency Assistance Request</h1>
          <p className="mt-2 text-red-200 text-sm max-w-xl mx-auto leading-relaxed">
            Requests are immediately parsed and routed to SDRF, NDRF, and nearest verified local disaster response squads.
          </p>
        </div>
        
        <div className="bg-[#0f172a] rounded-b-2xl shadow-2xl p-6 sm:p-8 border border-slate-800">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold mb-1.5">Full Name</label>
                <input 
                  type="text" required
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl focus:ring-1 focus:ring-red-500 focus:border-red-500 text-white placeholder-slate-500 text-sm transition-all"
                  placeholder="Citizen name"
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold mb-1.5">Contact Number</label>
                <input 
                  type="tel" required
                  value={formData.contact} onChange={e => setFormData({...formData, contact: e.target.value})}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl focus:ring-1 focus:ring-red-500 focus:border-red-500 text-white placeholder-slate-500 text-sm transition-all"
                  placeholder="10-digit phone"
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold mb-1.5">Email (Optional)</label>
                <input 
                  type="email"
                  value={formData.contactEmail || ''} onChange={e => setFormData({...formData, contactEmail: e.target.value})}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl focus:ring-1 focus:ring-red-500 focus:border-red-500 text-white placeholder-slate-500 text-sm transition-all"
                  placeholder="For dispatch alert"
                />
              </div>
            </div>

            {/* Multilingual SMS Dispatch Selector */}
            <div className="p-4 bg-slate-900/90 border border-slate-700/80 rounded-xl space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <label className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold flex items-center gap-2">
                  <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                  <span>SMS Notification Language / भाषा</span>
                </label>
                <span className="text-[10px] text-slate-400 font-mono">
                  Standard keypad mobile phones supported
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                {[
                  { code: 'en', label: 'English', sub: 'Standard SMS' },
                  { code: 'as', label: 'অসমীয়া', sub: 'Assamese' },
                  { code: 'hi', label: 'हिन्दी', sub: 'Hindi' },
                  { code: 'bn', label: 'বাংলা', sub: 'Bengali' },
                  { code: 'br', label: 'बड़ो / Bodo', sub: 'बर\' (Devanagari)' }
                ].map((item) => (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => setFormData({ ...formData, preferredLanguage: item.code as any })}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      formData.preferredLanguage === item.code
                        ? 'bg-cyan-950/60 border-cyan-400 text-white shadow-md shadow-cyan-950/40 ring-1 ring-cyan-500/50'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-extrabold text-sm">{item.label}</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">{item.sub}</div>
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed font-mono">
                ℹ️ Status updates regarding squad assignment and operation progress will be sent via SMS in this language. SMS delivery may be subject to carrier network conditions. If immediate danger exists, call 112 directly.
              </p>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">Incident Location Coordinates</label>
                {selectedPin && (
                  <span className="text-xs font-mono text-emerald-400 font-semibold flex items-center gap-1">
                    <Check size={14} /> Pinned: ({selectedPin[0].toFixed(4)}°, {selectedPin[1].toFixed(4)}°)
                  </span>
                )}
              </div>
              <div className="relative mb-3" ref={dropdownRef}>
                <MapPin className="absolute left-3.5 top-3 text-red-400 z-10" size={18} />
                <input 
                  type="text" required
                  value={formData.location}
                  onChange={e => handleLocationInputChange(e.target.value)}
                  onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
                  className="w-full pl-10 pr-28 py-2.5 bg-slate-900 border border-slate-700 rounded-xl focus:ring-1 focus:ring-red-500 focus:border-red-500 text-white placeholder-slate-500 text-sm transition-all"
                  placeholder="Type landmark / area or click directly on map..."
                />
                <button
                  type="button"
                  onClick={handleGetLocation}
                  disabled={isLocating}
                  className="absolute right-1.5 top-1.5 bg-red-600/20 hover:bg-red-600/40 text-red-300 border border-red-500/40 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 z-10"
                >
                  {isLocating ? <Loader2 size={14} className="animate-spin" /> : <Navigation size={14} />}
                  <span>{isLocating ? 'Locating' : 'Auto-GPS'}</span>
                </button>

                {/* Suggestions Dropdown */}
                {showSuggestions && (suggestions.length > 0 || isSearchingLocation) && (
                  <div className="absolute left-0 right-0 top-full mt-2 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden divide-y divide-slate-800 max-h-60 overflow-y-auto">
                    {isSearchingLocation && (
                      <div className="p-3 text-xs font-mono text-cyan-300 flex items-center gap-2">
                        <Loader2 size={14} className="animate-spin" />
                        <span>Searching coordinates...</span>
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
              <div className="h-64 rounded-xl overflow-hidden border border-slate-800 bg-[#0a0e17]">
                <MapComponent 
                  center={selectedPin || [26.1445, 91.7362]}
                  zoom={selectedPin ? 15 : 12}
                  selectedLocation={selectedPin}
                  onMapClick={handleMapClick}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold mb-2.5">Category of Emergency</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {categoriesList.map(cat => (
                  <button
                    type="button"
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    className={`px-3.5 py-2.5 rounded-xl border text-xs font-mono font-bold transition-all
                      ${formData.categories.includes(cat) 
                        ? 'bg-red-600 border-red-500 text-white shadow-md shadow-red-950' 
                        : 'bg-slate-900 border-slate-700/80 text-slate-300 hover:bg-slate-800 hover:text-white'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold mb-1">Total People</label>
                <input 
                  type="number" min="1" required
                  value={isNaN(formData.people) ? '' : formData.people} 
                  onChange={e => {
                    const val = e.target.value === '' ? 1 : parseInt(e.target.value, 10);
                    setFormData({...formData, people: isNaN(val) ? 1 : val});
                  }}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl focus:ring-1 focus:ring-red-500 focus:border-red-500 text-white font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold mb-1">Children</label>
                <input 
                  type="number" min="0"
                  value={isNaN(formData.children) ? '' : formData.children} 
                  onChange={e => {
                    const val = e.target.value === '' ? 0 : parseInt(e.target.value, 10);
                    setFormData({...formData, children: isNaN(val) ? 0 : val});
                  }}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl focus:ring-1 focus:ring-red-500 focus:border-red-500 text-white font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold mb-1">Elderly</label>
                <input 
                  type="number" min="0"
                  value={isNaN(formData.elderly) ? '' : formData.elderly} 
                  onChange={e => {
                    const val = e.target.value === '' ? 0 : parseInt(e.target.value, 10);
                    setFormData({...formData, elderly: isNaN(val) ? 0 : val});
                  }}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl focus:ring-1 focus:ring-red-500 focus:border-red-500 text-white font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold mb-1">Disabled</label>
                <input 
                  type="number" min="0"
                  value={isNaN(formData.disabled) ? '' : formData.disabled} 
                  onChange={e => {
                    const val = e.target.value === '' ? 0 : parseInt(e.target.value, 10);
                    setFormData({...formData, disabled: isNaN(val) ? 0 : val});
                  }}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl focus:ring-1 focus:ring-red-500 focus:border-red-500 text-white font-mono text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold mb-1">Situation Description</label>
              <textarea 
                rows={3}
                value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl focus:ring-1 focus:ring-red-500 focus:border-red-500 text-white placeholder-slate-500 text-sm transition-all"
                placeholder="Water level, medical urgencies, access road status..."
              ></textarea>
            </div>

            <button 
              type="submit"
              className="w-full bg-red-600 hover:bg-red-500 text-white font-extrabold py-4 px-4 rounded-xl transition-all shadow-xl shadow-red-950/80 hover:-translate-y-0.5 flex items-center justify-center gap-2.5 text-base tracking-wider uppercase font-mono"
            >
              <Send size={20} /> Transmit Emergency Dispatch SOS
            </button>
          </form>
        </div>
      </div>

      {/* Confirmation Modal */}
      {submittedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#0f172a] border border-cyan-500/50 rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 text-center relative">
            <div className="inline-flex items-center justify-center p-4 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
              <ShieldCheck className="w-12 h-12" />
            </div>

            <div>
              <div className="text-[11px] font-mono tracking-widest text-emerald-400 font-bold uppercase mb-1">
                DISASTER PROTOCOL ACTIVE
              </div>
              <h2 className="text-2xl font-black text-white">Emergency Report Submitted</h2>
              <p className="text-xs text-slate-300 mt-2">
                Your report has been received by the centralized flood command center and queued for team dispatch.
              </p>
            </div>

            <div className="bg-slate-900/90 border border-slate-700 p-4 rounded-xl space-y-2">
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">YOUR UNIQUE TRACKING IDENTIFIER</div>
              <div className="text-2xl sm:text-3xl font-black font-mono text-cyan-400 tracking-wider flex items-center justify-center gap-2">
                <span>{submittedReport.requestId}</span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(submittedReport.requestId);
                    toast.success('Request ID copied to clipboard!');
                  }}
                  className="p-1.5 text-slate-400 hover:text-cyan-400 rounded-lg hover:bg-slate-800 transition-colors"
                  title="Copy Request ID"
                >
                  <Copy className="w-5 h-5" />
                </button>
              </div>
              <div className="text-xs font-mono text-emerald-400 flex items-center justify-center gap-1.5 pt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Status: {submittedReport.status}</span>
              </div>
            </div>

            {submittedReport.phoneMasked && (
              <div className="bg-cyan-950/40 border border-cyan-700/50 p-3 rounded-xl flex items-center justify-between text-xs font-mono text-cyan-300">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>SMS Dispatched to: <strong className="text-white">{submittedReport.phoneMasked}</strong></span>
                </div>
                <span className="uppercase text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-900/80 text-cyan-200 border border-cyan-700">
                  {submittedReport.preferredLanguage?.toUpperCase() || 'EN'}
                </span>
              </div>
            )}

            <p className="text-xs text-amber-300/90 bg-amber-950/30 border border-amber-900/50 p-3 rounded-xl font-mono text-left">
              ⚠️ <strong>IMPORTANT:</strong> Please write down or save this Request ID. You can use it anytime on our public tracking portal to check live rescue squad dispatch and status updates.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate(`/track-emergency?id=${submittedReport.requestId}`)}
                className="flex-1 py-3 px-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-cyan-950 transition-all"
              >
                <Radio className="w-4 h-4 animate-pulse" />
                <span>Track This Emergency</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setSubmittedReport(null)}
                className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-mono text-xs transition-colors"
              >
                Close &amp; File Another
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmergencyReport;
