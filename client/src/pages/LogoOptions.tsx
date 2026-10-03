import { 
  Shield, 
  LifeBuoy, 
  HeartHandshake, 
  Umbrella, 
  RadioTower, 
  Waves,
  Anchor,
  Droplets,
  Siren,
  Activity
} from 'lucide-react';

const LogoOptions = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">Select a Logo Design</h1>
        <p className="text-center text-gray-600 mb-12">Pick the number you like best, and I will apply it to the main navbar and footer!</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Option 1: LifeBuoy */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 flex flex-col items-center justify-center gap-4 hover:shadow-lg transition-shadow">
            <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Option 1: The Rescuer</span>
            <div className="flex items-center gap-2 group p-4 bg-primary-900 rounded-lg">
              <LifeBuoy className="h-8 w-8 text-orange-400 group-hover:rotate-12 transition-transform" />
              <span className="font-extrabold text-xl tracking-tight text-white">
                Flood<span className="text-orange-400">Relief</span>
              </span>
            </div>
          </div>

          {/* Option 2: HeartHandshake */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 flex flex-col items-center justify-center gap-4 hover:shadow-lg transition-shadow">
            <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Option 2: The Coordinator</span>
            <div className="flex items-center gap-2 group p-4 bg-white border border-gray-200 rounded-lg">
              <HeartHandshake className="h-8 w-8 text-emerald-500 group-hover:scale-110 transition-transform" />
              <span className="font-black text-xl tracking-tighter text-gray-900">
                FloodRelief
              </span>
            </div>
          </div>

          {/* Option 3: Umbrella */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 flex flex-col items-center justify-center gap-4 hover:shadow-lg transition-shadow">
            <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Option 3: The Guardian</span>
            <div className="flex items-center gap-2 group p-4 bg-gradient-to-r from-blue-900 to-indigo-900 rounded-lg">
              <Umbrella className="h-8 w-8 text-cyan-400 group-hover:-translate-y-1 transition-transform" />
              <span className="font-bold text-xl tracking-wider text-white">
                FLOODRELIEF
              </span>
            </div>
          </div>

          {/* Option 4: RadioTower */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 flex flex-col items-center justify-center gap-4 hover:shadow-lg transition-shadow">
            <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Option 4: The Alert Center</span>
            <div className="flex items-center gap-2 group p-4 bg-gray-900 rounded-lg">
              <RadioTower className="h-8 w-8 text-red-500 animate-pulse" />
              <span className="font-mono font-bold text-xl text-red-50">
                Flood_Relief
              </span>
            </div>
          </div>

          {/* Option 5: Waves */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 flex flex-col items-center justify-center gap-4 hover:shadow-lg transition-shadow">
            <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Option 5: The Watermark</span>
            <div className="flex items-center gap-2 group p-4 bg-blue-50 rounded-lg">
              <Waves className="h-8 w-8 text-blue-600" />
              <span className="font-serif italic font-bold text-xl text-blue-900">
                FloodRelief
              </span>
            </div>
          </div>

          {/* Option 6: Droplets */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 flex flex-col items-center justify-center gap-4 hover:shadow-lg transition-shadow">
            <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Option 6: The Source</span>
            <div className="flex items-center gap-2 group p-4 bg-white rounded-lg">
              <Droplets className="h-8 w-8 text-blue-400 group-hover:text-blue-500 transition-colors" />
              <span className="font-extrabold text-xl bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-cyan-400">
                FloodRelief
              </span>
            </div>
          </div>

          {/* Option 7: Shield (Current Enhanced) */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 flex flex-col items-center justify-center gap-4 hover:shadow-lg transition-shadow">
            <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Option 7: The Shield (Enhanced)</span>
            <div className="flex items-center gap-2 group p-4 bg-gradient-to-r from-primary-900 via-blue-900 to-primary-950 rounded-lg">
              <Shield className="h-8 w-8 text-blue-400 group-hover:text-blue-300 transition-colors" />
              <span className="font-extrabold text-xl tracking-tight text-white">
                FloodRelief
              </span>
            </div>
          </div>

          {/* Option 8: Activity */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 flex flex-col items-center justify-center gap-4 hover:shadow-lg transition-shadow">
            <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Option 8: The Lifeline</span>
            <div className="flex items-center gap-2 group p-4 bg-black rounded-lg">
              <Activity className="h-8 w-8 text-green-400" />
              <span className="font-bold text-xl text-white tracking-widest uppercase">
                FloodRelief
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LogoOptions;
