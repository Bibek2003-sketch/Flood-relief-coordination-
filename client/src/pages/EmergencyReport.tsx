import { useState } from 'react';
import { AlertCircle, MapPin, Send, Navigation, Loader2 } from 'lucide-react';
import MapComponent from '../components/MapComponent';
import toast from 'react-hot-toast';

const EmergencyReport = () => {
  const [isLocating, setIsLocating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    location: '',
    people: 1,
    children: 0,
    elderly: 0,
    disabled: 0,
    categories: [] as string[],
    description: ''
  });

  const categoriesList = ['Rescue', 'Food', 'Drinking water', 'Medicine', 'Shelter', 'Medical assistance'];

  const toggleCategory = (cat: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(cat) 
        ? prev.categories.filter(c => c !== cat)
        : [...prev.categories, cat]
    }));
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setFormData(prev => ({ ...prev, location: `GPS: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}` }));
        setIsLocating(false);
        toast.success("Location found successfully!");
      },
      () => {
        toast.error("Unable to retrieve your location. Please enter manually.");
        setIsLocating(false);
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Parse the GPS string back to coordinates if present
    let coordinates = [0, 0];
    if (formData.location.startsWith('GPS:')) {
      const parts = formData.location.split('GPS:')[1].split(',');
      if (parts.length === 2) {
        coordinates = [parseFloat(parts[1].trim()), parseFloat(parts[0].trim())]; // [lng, lat] for GeoJSON
      }
    }

    try {
      const payload = {
        citizenName: formData.name,
        contact: formData.contact,
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
        toast.success('Emergency report submitted successfully! Help is on the way.');
        setFormData({
          name: '', contact: '', location: '', people: 1, children: 0, elderly: 0, disabled: 0, categories: [], description: ''
        });
      } else {
        toast.error(data.message || data.error || 'Failed to submit report');
      }
    } catch (error) {
      console.error(error);
      toast.error('Network error. Failed to connect to server.');
    }
  };

  return (
    <div className="flex-grow py-12 px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="max-w-3xl mx-auto">
        <div className="bg-red-600/40 backdrop-blur-xl text-white rounded-t-3xl p-8 text-center border border-white/20 border-b-0 shadow-[0_0_30px_rgba(220,38,38,0.3)]">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
          <h1 className="text-4xl font-extrabold tracking-tight">Report an Emergency</h1>
          <p className="mt-3 text-red-100 text-lg">Your request will be immediately routed to the nearest available rescue teams.</p>
        </div>
        
        <div className="bg-black/40 backdrop-blur-2xl rounded-b-3xl shadow-2xl p-8 border border-white/20">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">Full Name</label>
                <input 
                  type="text" required
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-red-500 focus:border-red-500 text-white placeholder-white/30 transition-all"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">Contact Number</label>
                <input 
                  type="tel" required
                  value={formData.contact} onChange={e => setFormData({...formData, contact: e.target.value})}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-red-500 focus:border-red-500 text-white placeholder-white/30 transition-all"
                  placeholder="10-digit number"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">Exact Location / Address</label>
              <div className="relative mb-4">
                <MapPin className="absolute left-4 top-3.5 text-white/50" size={20} />
                <input 
                  type="text" required
                  value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})}
                  className="w-full pl-12 pr-32 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-red-500 focus:border-red-500 text-white placeholder-white/30 transition-all"
                  placeholder="e.g. 1st Floor, Building A, Street name... or tap on map"
                />
                <button
                  type="button"
                  onClick={handleGetLocation}
                  disabled={isLocating}
                  className="absolute right-2 top-1.5 bg-red-500/20 hover:bg-red-500/40 text-red-200 border border-red-500/30 px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
                >
                  {isLocating ? <Loader2 size={16} className="animate-spin" /> : <Navigation size={16} />}
                  {isLocating ? 'Locating...' : 'Auto-GPS'}
                </button>
              </div>
              <div className="h-64 rounded-xl overflow-hidden border border-white/10">
                <MapComponent 
                  center={[26.1445, 91.7362]} // Default center (Guwahati)
                  zoom={12}
                  selectedLocation={
                    formData.location.startsWith('GPS:') 
                    ? [parseFloat(formData.location.split(':')[1].split(',')[0]), parseFloat(formData.location.split(',')[1])]
                    : null
                  }
                  onMapClick={(lat, lng) => {
                    setFormData(prev => ({ ...prev, location: `GPS: ${lat.toFixed(6)}, ${lng.toFixed(6)}` }));
                  }}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-3">What kind of help is needed?</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {categoriesList.map(cat => (
                  <button
                    type="button"
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    className={`px-4 py-3 rounded-xl border font-bold text-sm transition-all shadow-lg
                      ${formData.categories.includes(cat) 
                        ? 'bg-red-500/30 border-red-500/50 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]' 
                        : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">Total People</label>
                <input 
                  type="number" min="1" required
                  value={formData.people} onChange={e => setFormData({...formData, people: parseInt(e.target.value)})}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-red-500 focus:border-red-500 text-white transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">Children</label>
                <input 
                  type="number" min="0"
                  value={formData.children} onChange={e => setFormData({...formData, children: parseInt(e.target.value)})}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-red-500 focus:border-red-500 text-white transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">Elderly</label>
                <input 
                  type="number" min="0"
                  value={formData.elderly} onChange={e => setFormData({...formData, elderly: parseInt(e.target.value)})}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-red-500 focus:border-red-500 text-white transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">Disabled</label>
                <input 
                  type="number" min="0"
                  value={formData.disabled} onChange={e => setFormData({...formData, disabled: parseInt(e.target.value)})}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-red-500 focus:border-red-500 text-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">Additional Details</label>
              <textarea 
                rows={4}
                value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-red-500 focus:border-red-500 text-white placeholder-white/30 transition-all"
                placeholder="Any other crucial information..."
              ></textarea>
            </div>

            <button 
              type="submit"
              className="w-full bg-red-600/80 hover:bg-red-500 backdrop-blur-md border border-red-500/50 text-white font-extrabold py-5 px-4 rounded-xl transition-all shadow-[0_0_20px_rgba(220,38,38,0.4)] hover:shadow-[0_0_30px_rgba(220,38,38,0.6)] hover:-translate-y-1 flex items-center justify-center gap-3 text-xl"
            >
              <Send size={28} /> Submit Emergency Request
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EmergencyReport;
