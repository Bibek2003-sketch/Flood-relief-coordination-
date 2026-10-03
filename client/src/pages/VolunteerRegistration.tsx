import { useState } from 'react';
import { Users, Send, MapPin, CheckCircle } from 'lucide-react';

const VolunteerRegistration = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="flex-grow flex items-center justify-center p-4 relative z-10">
        <div className="bg-black/40 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 max-w-md text-center border border-white/20">
          <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
          <h2 className="text-3xl font-bold text-white mb-2">Registration Successful</h2>
          <p className="text-white/70 mb-8 text-lg">Thank you for volunteering. Our coordinators will review your application and assign you to a relief team shortly.</p>
          <button onClick={() => setSubmitted(false)} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-8 rounded-xl shadow-[0_0_15px_rgba(34,211,238,0.3)] transition-all">
            Return to Form
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-grow py-12 px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="max-w-3xl mx-auto bg-black/40 backdrop-blur-2xl rounded-3xl shadow-2xl overflow-hidden border border-white/20">
        <div className="bg-cyan-600/30 backdrop-blur-md p-8 text-white text-center border-b border-white/10">
          <Users className="w-16 h-16 mx-auto mb-4 text-cyan-300 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]" />
          <h1 className="text-4xl font-extrabold tracking-tight">Volunteer Registration</h1>
          <p className="mt-3 text-cyan-100 text-lg">Join our disaster response team to help affected communities.</p>
        </div>
        
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">First Name</label>
                <input type="text" required className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-cyan-500 focus:border-cyan-500 text-white transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">Last Name</label>
                <input type="text" required className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-cyan-500 focus:border-cyan-500 text-white transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">Email Address</label>
                <input type="email" required className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-cyan-500 focus:border-cyan-500 text-white transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">Phone Number</label>
                <input type="tel" required className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-cyan-500 focus:border-cyan-500 text-white transition-all" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">Location / Ward Area</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-3.5 text-white/50" size={20} />
                <input type="text" required className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-cyan-500 focus:border-cyan-500 text-white placeholder-white/30 transition-all" placeholder="Where can you deploy quickly?" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-3">Skills (Select all that apply)</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {['First aid', 'Swimming', 'Driving', 'Cooking', 'Medical support', 'Logistics', 'Search and rescue', 'IT support'].map(skill => (
                  <label key={skill} className="flex items-center space-x-3 text-sm text-white/80 bg-white/5 border border-white/10 p-3 rounded-xl cursor-pointer hover:bg-white/10 transition-colors">
                    <input type="checkbox" className="rounded border-white/20 bg-black/50 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-0" />
                    <span>{skill}</span>
                  </label>
                ))}
              </div>
            </div>

            <button type="submit" className="w-full mt-4 bg-cyan-600/80 hover:bg-cyan-500 backdrop-blur-md border border-cyan-500/50 text-white font-extrabold py-4 px-4 rounded-xl transition-all shadow-[0_0_20px_rgba(34,211,238,0.4)] hover:shadow-[0_0_30px_rgba(34,211,238,0.6)] hover:-translate-y-1 flex items-center justify-center gap-2 text-lg">
              <Send size={24} /> Submit Application
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VolunteerRegistration;
