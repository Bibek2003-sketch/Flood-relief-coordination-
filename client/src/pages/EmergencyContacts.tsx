import React from 'react';
import { Phone, PhoneCall, ShieldAlert, HeartPulse, ExternalLink, Radio, MapPin, LifeBuoy, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

const NATIONAL_HOTLINES = [
  {
    name: 'NDRF Central Disaster Helpline',
    agency: 'National Disaster Response Force',
    number: '1070',
    altNumber: '011-24363260',
    desc: 'National 24/7 central control room for catastrophic flood inundation and boat rescues.',
    color: 'border-red-500/40 bg-red-950/20 text-red-400',
    badge: 'PRIORITY 1'
  },
  {
    name: 'State Disaster Emergency (SDRF / SEOC)',
    agency: 'State Emergency Operation Centre',
    number: '1079',
    altNumber: '0361-2237221',
    desc: 'State-level deployment coordination for regional quick response teams and relief logistics.',
    color: 'border-amber-500/40 bg-amber-950/20 text-amber-400',
    badge: 'STATE EOC'
  },
  {
    name: 'Emergency Medical & Ambulance',
    agency: 'National Ambulance Grid',
    number: '108',
    altNumber: '102',
    desc: 'Rapid medical evacuation, trauma response, pregnant mother assistance, and patient dispatch.',
    color: 'border-rose-500/40 bg-rose-950/20 text-rose-400',
    badge: 'MEDICAL SOS'
  },
  {
    name: 'Police Rapid Distress Control',
    agency: 'Emergency Response Support System (ERSS)',
    number: '112',
    altNumber: '100',
    desc: 'Unified emergency response for law, public safety, and immediate flood distress relays.',
    color: 'border-cyan-500/40 bg-cyan-950/20 text-cyan-400',
    badge: 'UNIFIED 112'
  },
  {
    name: 'Fire & Water Rescue Brigade',
    agency: 'State Fire & Emergency Services',
    number: '101',
    altNumber: '0361-2735933',
    desc: 'Heavy pump de-watering, swift-water extraction, inflatable boat deployment.',
    color: 'border-orange-500/40 bg-orange-950/20 text-orange-400',
    badge: 'WATER RESCUE'
  },
  {
    name: 'Central Water Commission (CWC) Flood Cell',
    agency: 'Ministry of Jal Shakti',
    number: '1800-180-1551',
    altNumber: '011-26105593',
    desc: 'Real-time river gauge forecasts, dam release warnings, and embankment rupture alerts.',
    color: 'border-blue-500/40 bg-blue-950/20 text-blue-400',
    badge: 'HYDROLOGICAL'
  }
];

const DISTRICT_CONTROL_ROOMS = [
  { district: 'Kamrup Metropolitan (Guwahati)', phone: '0361-2733052', officer: 'District Disaster Management Authority (DDMA)' },
  { district: 'Kamrup Rural (Amingaon)', phone: '0361-2684404', officer: 'Control Room Officer' },
  { district: 'Dibrugarh EOC', phone: '0373-2312940', officer: 'Upper Assam Flood Operations' },
  { district: 'Silchar (Cachar DDMA)', phone: '03842-245865', officer: 'Barak Valley Relief Cell' },
  { district: 'Nagaon Flood Cell', phone: '03672-233185', officer: 'Central Assam Operations Desk' },
  { district: 'Jorhat District EOC', phone: '0376-2320020', officer: 'Brahmaputra Flood Unit' },
  { district: 'Barpeta DDMA Helpline', phone: '03665-252125', officer: 'Lower Assam Response Desk' },
  { district: 'Dhemaji Inundation Desk', phone: '03753-224424', officer: 'Flash Flood Monitoring' }
];

export const EmergencyContacts: React.FC = () => {
  return (
    <div className="min-h-[85vh] py-10 px-4 sm:px-6 lg:px-8 bg-[#0b0f19] text-white">
      <div className="max-w-6xl mx-auto space-y-10">

        {/* Header Banner */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono font-bold tracking-wider uppercase">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                <span>24/7 PRIORITY DISASTER DIRECTORY</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
                Emergency Hotlines &amp; Command Contacts
              </h1>
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                Direct telecommunication lines to official disaster management cells, swift water extraction units, and district control rooms. Tap any number to call immediately.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <Link
                to="/emergency"
                className="px-5 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-mono font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-red-950 transition-all hover:scale-[1.02]"
              >
                <ShieldAlert className="w-4 h-4 animate-pulse" />
                <span>Submit Digital SOS</span>
              </Link>
              <Link
                to="/shelters"
                className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-400 font-mono font-bold text-xs flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
              >
                <MapPin className="w-4 h-4" />
                <span>Locate Safe Camps</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Priority 1 National Hotlines Grid */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-cyan-400 font-bold">
            <Radio className="w-4 h-4" />
            <span>CENTRAL RESCUE &amp; MEDICAL LINES</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {NATIONAL_HOTLINES.map((h, idx) => (
              <div
                key={idx}
                className="bg-[#0f172a] border border-slate-800 hover:border-slate-700 rounded-2xl p-6 shadow-xl flex flex-col justify-between transition-all group hover:-translate-y-0.5"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${h.color}`}>
                      {h.badge}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">{h.agency}</span>
                  </div>

                  <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {h.name}
                  </h3>

                  <p className="text-slate-400 text-xs leading-relaxed">
                    {h.desc}
                  </p>
                </div>

                <div className="pt-5 mt-4 border-t border-slate-800/80 flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="text-[10px] font-mono text-slate-500 uppercase">Toll-Free Dial</div>
                    <a
                      href={`tel:${h.number}`}
                      className="text-2xl font-black font-mono text-white hover:text-cyan-400 flex items-center gap-1.5 transition-colors"
                    >
                      <PhoneCall className="w-4 h-4 text-emerald-400" />
                      <span>{h.number}</span>
                    </a>
                  </div>

                  {h.altNumber && (
                    <div className="text-right space-y-0.5">
                      <div className="text-[10px] font-mono text-slate-500 uppercase">Direct Desk</div>
                      <a
                        href={`tel:${h.altNumber.replace(/-/g, '')}`}
                        className="text-xs font-mono text-cyan-400 hover:underline block"
                      >
                        {h.altNumber}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* District Disaster Emergency Operation Centers (DEOCs) */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold">
            <MapPin className="w-4 h-4" />
            <span>DISTRICT EMERGENCY OPERATION CENTRES (DEOC)</span>
          </div>

          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {DISTRICT_CONTROL_ROOMS.map((room, idx) => (
                <div
                  key={idx}
                  className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="text-xs font-bold text-white mb-1">{room.district}</div>
                    <div className="text-[11px] font-mono text-slate-400">{room.officer}</div>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-800/80">
                    <a
                      href={`tel:${room.phone.replace(/-/g, '')}`}
                      className="text-sm font-mono font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5"
                    >
                      <Phone className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{room.phone}</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Guidance Notice */}
        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl flex items-start gap-3.5 text-xs text-slate-400">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-slate-300">Public Protocol Notice:</span>
            <p className="leading-relaxed">
              If cellular networks are jammed during high flood conditions, prioritize sending SMS coordinates to local control rooms, or use the online <Link to="/emergency" className="text-cyan-400 underline">Emergency SOS Form</Link> which automatically registers exact GPS coordinates directly into the emergency dispatch feed.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default EmergencyContacts;

