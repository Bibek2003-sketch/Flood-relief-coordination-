import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Users, Send, MapPin, CheckCircle, Shield, ArrowRight, Loader2, Phone, Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const VolunteerRegistration = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [enrolledData, setEnrolledData] = useState<{ user: any; token: string; isPending?: boolean } | null>(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    contactNumber: '',
    location: '',
    skills: [] as string[]
  });

  const availableSkills = [
    'First aid',
    'Swimming',
    'Driving / 4x4',
    'Cooking',
    'Medical triage',
    'Boat operation',
    'Search & rescue',
    'Logistics & IT'
  ];

  const toggleSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.email) {
      toast.error('Please fill in required fields');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/volunteer/enroll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to submit volunteer application');
      }

      const isPending = data.status === 'pending' || !data.token;
      toast.success(data.message || 'Volunteer application submitted!');
      setEnrolledData({ user: data.user, token: data.token || '', isPending });
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Error submitting application');
    } finally {
      setLoading(false);
    }
  };

  const handleEnterDashboard = () => {
    if (enrolledData && enrolledData.token) {
      login(enrolledData.user, enrolledData.token);
      navigate('/volunteer/dashboard');
    } else {
      navigate('/login');
    }
  };

  if (enrolledData) {
    const isPending = (enrolledData as any).isPending;
    return (
      <div className="flex-grow flex items-center justify-center p-4 relative z-10 bg-[#0b0f19]">
        <div className="bg-[#0f172a] rounded-2xl shadow-2xl p-8 max-w-md w-full text-center border border-slate-800">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
            isPending
              ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
              : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
          }`}>
            <CheckCircle className="w-9 h-9" />
          </div>
          <div className={`text-[10px] font-mono tracking-widest font-bold uppercase mb-1 ${
            isPending ? 'text-amber-400' : 'text-emerald-400'
          }`}>
            {isPending ? 'ENLISTMENT APPLICATION PENDING' : 'DEPLOYMENT ENLISTMENT APPROVED'}
          </div>
          <h2 className="text-2xl font-extrabold text-white mb-2">
            {isPending ? 'Application Under Review' : 'Welcome to Response Squad'}
          </h2>
          <p className="text-slate-300 mb-6 text-sm leading-relaxed">
            {isPending ? (
              <>
                <strong className="text-white">{enrolledData.user.name || `${enrolledData.user.firstName} ${enrolledData.user.lastName}`}</strong>, your volunteer profile has been submitted and is awaiting administrator verification. Once approved, you can sign in via Staff &amp; Partner Login.
              </>
            ) : (
              <>
                <strong className="text-white">{enrolledData.user.name}</strong>, your volunteer profile is active in the EOC dispatch system. You can now accept community relief tasks.
              </>
            )}
          </p>

          <div className="space-y-3">
            {isPending ? (
              <Link
                to="/login"
                className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono font-bold text-xs uppercase tracking-wider py-3.5 px-6 rounded-xl transition-all shadow-md shadow-cyan-950"
              >
                <span>Go to Staff &amp; Partner Login</span>
                <ArrowRight size={16} />
              </Link>
            ) : (
              <button
                onClick={handleEnterDashboard}
                className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-mono font-bold py-3.5 px-6 rounded-xl transition-all text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-cyan-950"
              >
                <span>Enter Volunteer Dashboard</span>
                <ArrowRight size={16} />
              </button>
            )}

            <button
              onClick={() => {
                setEnrolledData(null);
                setFormData({
                  firstName: '',
                  lastName: '',
                  email: '',
                  password: '',
                  contactNumber: '',
                  location: '',
                  skills: []
                });
              }}
              className="w-full bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white font-mono py-2.5 px-4 rounded-xl text-xs transition-colors border border-slate-800"
            >
              Submit Another Application
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-grow py-8 sm:py-12 px-4 sm:px-6 lg:px-8 relative z-10 bg-[#0b0f19]">
      <div className="max-w-3xl mx-auto bg-[#0f172a] rounded-2xl shadow-2xl overflow-hidden border border-slate-800">
        <div className="bg-slate-900/90 p-6 sm:p-8 text-white text-center border-b border-slate-800">
          <div className="w-12 h-12 bg-cyan-500/10 border border-cyan-500/30 rounded-xl flex items-center justify-center mx-auto mb-3 text-cyan-400">
            <Users className="w-6 h-6" />
          </div>
          <div className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase font-bold mb-1">
            HUMANITARIAN SQUAD ENROLLMENT
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Volunteer Network Registration</h1>
          <p className="mt-1 text-slate-400 text-xs sm:text-sm">Enlist your technical, rescue, or relief assistance for immediate deployment.</p>
        </div>

        <div className="p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold mb-1.5">First Name *</label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="e.g. Rahul"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 text-white text-sm transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold mb-1.5">Last Name *</label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="e.g. Das"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 text-white text-sm transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold mb-1.5">Email Address *</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 text-slate-500" size={16} />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 text-white text-sm transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold mb-1.5">Contact Number *</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3 text-slate-500" size={16} />
                  <input
                    type="tel"
                    required
                    value={formData.contactNumber}
                    onChange={e => setFormData({ ...formData, contactNumber: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 text-white text-sm transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold mb-1.5">Deployable Location / Ward Area *</label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-3 text-cyan-400" size={18} />
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 text-white placeholder-slate-500 text-sm transition-all"
                    placeholder="e.g. Guwahati Ward 12, Pan Bazaar"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold mb-1.5">Dashboard Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 text-slate-500" size={16} />
                  <input
                    type="password"
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Min 6 characters (or auto-assigned)"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 text-white placeholder-slate-500 text-sm transition-all"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold mb-2.5">Capabilities &amp; Specializations</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {availableSkills.map(skill => {
                  const isChecked = formData.skills.includes(skill);
                  return (
                    <label
                      key={skill}
                      className={`flex items-center space-x-2.5 text-xs font-mono p-2.5 rounded-xl cursor-pointer border transition-all ${
                        isChecked
                          ? 'bg-cyan-950/60 border-cyan-500 text-cyan-300'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleSkill(skill)}
                        className="rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-cyan-500"
                      />
                      <span>{skill}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-3 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-mono font-bold py-3.5 px-4 rounded-xl transition-all shadow-md shadow-cyan-950 flex items-center justify-center gap-2 text-sm uppercase tracking-wider"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Enrolling Squad Member...</span>
                </>
              ) : (
                <>
                  <Send size={18} />
                  <span>Submit Volunteer Enlistment</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VolunteerRegistration;

