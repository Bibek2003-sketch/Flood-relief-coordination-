import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';
import {
  Users,
  Building2,
  LifeBuoy,
  UserCheck,
  HeartPulse,
  Clock,
  ArrowRight,
  ShieldAlert,
  Phone,
  Mail,
  Lock,
  MapPin,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

type RegisterCategory = 'volunteer' | 'ngo' | 'rescue' | 'citizen';

const CATEGORIES = [
  {
    id: 'volunteer' as RegisterCategory,
    title: 'Join as Volunteer',
    shortTitle: 'Volunteer',
    badge: 'Aid Squad',
    desc: 'Community relief tasks, food & supplies distribution, triage assistance',
    icon: Users,
    endpoint: '/auth/register/volunteer',
    borderColor: 'border-cyan-500/40 bg-cyan-950/20 text-cyan-300'
  },
  {
    id: 'ngo' as RegisterCategory,
    title: 'Register Organization',
    shortTitle: 'NGO / Relief Org',
    badge: 'Logistics',
    desc: 'Supply warehousing, shelter operations, NGO relief coordination',
    icon: Building2,
    endpoint: '/auth/register/ngo',
    borderColor: 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300'
  },
  {
    id: 'rescue' as RegisterCategory,
    title: 'Join Rescue Team',
    shortTitle: 'Rescue Squad',
    badge: 'Field Extraction',
    desc: 'Tactical flood extraction squads, boat operators, NDRF/SDRF units',
    icon: LifeBuoy,
    endpoint: '/auth/register/rescue',
    borderColor: 'border-amber-500/40 bg-amber-950/20 text-amber-300'
  },
  {
    id: 'citizen' as RegisterCategory,
    title: 'Public Citizen Account',
    shortTitle: 'Citizen (Optional)',
    badge: 'Public SOS',
    desc: 'Optional account to manage personal requests. Victims DO NOT need an account to report emergency.',
    icon: UserCheck,
    endpoint: '/auth/register/citizen',
    borderColor: 'border-blue-500/40 bg-blue-950/20 text-blue-300'
  }
];

const Register = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<RegisterCategory>('volunteer');
  const [loading, setLoading] = useState(false);
  const [submittedPending, setSubmittedPending] = useState<{
    role: string;
    name: string;
    email: string;
    message: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    contactNumber: '',
    organization: '',
    location: '',
    skills: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGoogleSuccess = async (token: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          intent: activeTab,
          organization: formData.organization || (activeTab === 'ngo' ? 'Registered NGO' : undefined),
          contactNumber: formData.contactNumber,
          skills: formData.skills ? formData.skills.split(',').map(s => s.trim()) : undefined
        })
      });

      const data = await response.json();

      if (response.ok && (data.success || data.status === 'success')) {
        if (data.statusType === 'pending' || activeTab !== 'citizen') {
          setSubmittedPending({
            role: activeTab.toUpperCase(),
            name: `${data.user?.firstName || 'Applicant'} ${data.user?.lastName || ''}`.trim(),
            email: data.user?.email || '',
            message: data.message || 'Application submitted via Google. Your account is awaiting administrator approval.'
          });
          toast.success('Registration submitted for administrator review!');
        } else {
          toast.success('Citizen account created!');
          navigate('/login');
        }
      } else {
        toast.error(data.error || data.message || 'Google registration failed');
      }
    } catch (err) {
      toast.error('Network error during Google registration');
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      if (tokenResponse?.access_token) {
        handleGoogleSuccess(tokenResponse.access_token);
      }
    },
    onError: () => {
      toast.error('Google Sign-Up was cancelled or encountered an error');
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const currentCategory = CATEGORIES.find(c => c.id === activeTab)!;
    const skillsArray = formData.skills ? formData.skills.split(',').map(s => s.trim()).filter(Boolean) : [];

    const payload: any = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
      contactNumber: formData.contactNumber.trim()
    };

    if (activeTab === 'volunteer') {
      payload.location = formData.location.trim();
      payload.skills = skillsArray;
    } else if (activeTab === 'ngo') {
      payload.organization = formData.organization.trim();
      payload.address = formData.location.trim();
    } else if (activeTab === 'rescue') {
      payload.organization = formData.organization.trim() || 'Rescue Squad';
      payload.skills = skillsArray;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}${currentCategory.endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok && (data.success || data.status === 'success')) {
        if (activeTab === 'citizen') {
          toast.success('Citizen account registered successfully! You may now sign in.');
          navigate('/login');
        } else {
          setSubmittedPending({
            role: activeTab.toUpperCase(),
            name: `${formData.firstName} ${formData.lastName}`,
            email: formData.email,
            message: data.message || 'Your operational registration application has been submitted and is awaiting administrator approval.'
          });
          toast.success('Application submitted for administrator review!');
        }
      } else {
        toast.error(data.error || data.message || 'Registration failed');
      }
    } catch (err) {
      toast.error('Network error. Is the server running?');
    } finally {
      setLoading(false);
    }
  };

  const activeCategory = CATEGORIES.find(c => c.id === activeTab)!;

  // Render Confirmation Screen when pending application is submitted
  if (submittedPending) {
    return (
      <div className="flex-grow flex items-center justify-center p-4 sm:p-6 relative z-10 bg-[#0b0f19] min-h-[85vh]">
        <div className="bg-[#0f172a] p-8 sm:p-10 rounded-2xl shadow-2xl w-full max-w-lg border border-slate-800 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
            <Clock className="w-8 h-8 animate-pulse" />
          </div>

          <div>
            <div className="text-[10px] font-mono tracking-widest text-amber-400 uppercase font-bold mb-1">
              STATUS: AWAITING APPROVAL
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">Application Submitted</h2>
            <p className="text-slate-300 text-sm mt-2 leading-relaxed">
              Thank you, <strong className="text-white">{submittedPending.name}</strong>. Your application to join the platform as a <strong className="text-cyan-400">{submittedPending.role}</strong> has been received.
            </p>
          </div>

          <div className="p-4 bg-slate-900/90 rounded-xl border border-slate-800 text-xs font-mono text-left space-y-2 text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-500">Applicant Email:</span>
              <span className="text-white">{submittedPending.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Requested Operational Role:</span>
              <span className="text-cyan-400 font-bold">{submittedPending.role}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Access Status:</span>
              <span className="text-amber-400 font-bold">Pending Review</span>
            </div>
          </div>

          <p className="text-slate-400 text-xs leading-relaxed">
            For security and coordination compliance, operational disaster staff accounts must be authorized by an authorized administrator before access to dashboard dispatch tools is granted.
          </p>

          <div className="pt-2">
            <Link
              to="/login"
              className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono font-bold text-xs uppercase tracking-wider py-3.5 px-6 rounded-xl transition-all shadow-md shadow-cyan-950"
            >
              <span>Return to Staff &amp; Partner Login</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-grow flex items-center justify-center p-4 sm:p-6 relative z-10 bg-[#0b0f19] min-h-[85vh]">
      <div className="bg-[#0f172a] p-6 sm:p-10 rounded-2xl shadow-2xl w-full max-w-xl border border-slate-800 space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-1.5 pb-4 border-b border-slate-800">
          <div className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase font-bold">
            JOIN FLOODRELIEF OPERATIONS
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Onboarding &amp; Registration</h2>
          <p className="text-slate-400 text-xs max-w-md mx-auto">
            Apply to coordinate relief efforts as an operational team member or partner organization.
          </p>
        </div>

        {/* Prominent Emergency Victim Banner */}
        <div className="p-3.5 bg-red-950/20 border border-red-500/30 rounded-xl flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-red-200">
            <HeartPulse className="w-4 h-4 text-red-400 shrink-0 animate-pulse" />
            <div>
              <strong className="block font-bold">Need emergency flood assistance?</strong>
              <span className="text-[11px] text-red-300">Victims DO NOT need an account to report emergencies.</span>
            </div>
          </div>
          <Link
            to="/emergency"
            className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-mono font-bold text-[11px] rounded-lg transition-all whitespace-nowrap shadow-sm"
          >
            Report SOS &rarr;
          </Link>
        </div>

        {/* Category Tabs */}
        <div>
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold mb-2.5">
            Select Your Participation Type:
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isSelected = activeTab === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveTab(cat.id)}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                    isSelected
                      ? cat.borderColor + ' ring-2 ring-cyan-500/30 bg-slate-900 shadow-md'
                      : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-slate-500'}`} />
                    <span className="text-[9px] font-mono uppercase px-1 py-0.5 rounded bg-slate-800 text-slate-300">
                      {cat.badge}
                    </span>
                  </div>
                  <div>
                    <div className="text-xs font-bold font-mono tracking-tight text-white leading-tight">
                      {cat.shortTitle}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Category Explainer */}
        <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5 font-mono">
          <activeCategory.icon className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-white block">{activeCategory.title}</span>
            <span className="text-slate-400 text-[11px]">{activeCategory.desc}</span>
            {activeTab !== 'citizen' && (
              <span className="text-amber-400 text-[10px] block mt-1 font-semibold">
                * Requires administrator approval before dashboard access is activated.
              </span>
            )}
          </div>
        </div>

        {/* Google Quick Sign-Up */}
        <div className="space-y-2">
          <div className="flex flex-col items-center w-full">
            <button
              type="button"
              onClick={() => loginWithGoogle()}
              disabled={loading}
              className="w-full max-w-sm flex items-center justify-center gap-3 py-3 px-4 bg-slate-900 hover:bg-slate-800 text-slate-100 rounded-xl border border-slate-700/80 hover:border-slate-600 transition-all shadow-md text-sm font-medium font-sans disabled:opacity-50"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>
          </div>
          <div className="text-[10px] font-mono text-center text-slate-500">
            Sign up with Google as {activeCategory.title}
          </div>
        </div>

        <div className="flex items-center my-2">
          <div className="flex-grow border-t border-slate-800"></div>
          <span className="px-3 text-slate-500 text-[10px] font-mono uppercase tracking-wider">or register with details</span>
          <div className="flex-grow border-t border-slate-800"></div>
        </div>

        {/* Detailed Application Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="flex gap-3">
            <div className="w-1/2">
              <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold mb-1">First Name</label>
              <input
                name="firstName"
                type="text"
                required
                value={formData.firstName}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 text-white placeholder-slate-500 text-sm transition-all"
                placeholder="First"
              />
            </div>
            <div className="w-1/2">
              <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold mb-1">Last Name</label>
              <input
                name="lastName"
                type="text"
                required
                value={formData.lastName}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 text-white placeholder-slate-500 text-sm transition-all"
                placeholder="Last"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold mb-1">Email Address</label>
            <input
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 text-white placeholder-slate-500 text-sm font-mono transition-all"
              placeholder="operator@organization.org"
            />
          </div>

          {activeTab === 'ngo' && (
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold mb-1 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                Organization Name *
              </label>
              <input
                name="organization"
                type="text"
                required
                value={formData.organization}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 text-white placeholder-slate-500 text-sm transition-all"
                placeholder="e.g. Red Cross Flood Relief / Seva Trust"
              />
            </div>
          )}

          {activeTab === 'rescue' && (
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold mb-1 flex items-center gap-1.5">
                <LifeBuoy className="w-3.5 h-3.5 text-amber-400" />
                Rescue Squad / Agency Name
              </label>
              <input
                name="organization"
                type="text"
                value={formData.organization}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 text-white placeholder-slate-500 text-sm transition-all"
                placeholder="e.g. NDRF 1st Bn / Brahmaputra Water Rescue Unit"
              />
            </div>
          )}

          <div className="flex gap-3">
            <div className="w-1/2">
              <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold mb-1">Contact Phone</label>
              <input
                name="contactNumber"
                type="tel"
                value={formData.contactNumber}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 text-white placeholder-slate-500 text-sm font-mono transition-all"
                placeholder="+91 98765 43210"
              />
            </div>
            <div className="w-1/2">
              <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold mb-1">Location / District</label>
              <input
                name="location"
                type="text"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 text-white placeholder-slate-500 text-sm transition-all"
                placeholder="e.g. Guwahati / Silchar"
              />
            </div>
          </div>

          {(activeTab === 'volunteer' || activeTab === 'rescue') && (
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold mb-1">
                Skills / Capabilities (comma-separated)
              </label>
              <input
                name="skills"
                type="text"
                value={formData.skills}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 text-white placeholder-slate-500 text-sm transition-all"
                placeholder="e.g. First Aid, Boat Operation, Swimming, Driving"
              />
            </div>
          )}

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold mb-1">Password</label>
            <input
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 text-white placeholder-slate-500 text-sm transition-all"
              placeholder="Minimum 6 characters"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-md shadow-cyan-950 flex items-center justify-center gap-2 text-sm font-mono tracking-wider uppercase disabled:opacity-50"
          >
            {loading ? 'Submitting Application...' : (
              <>
                <span>Submit {activeCategory.title} Application</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center text-xs pt-4 border-t border-slate-800">
          <span className="text-slate-400">Already approved or have staff credentials? </span>
          <Link to="/login" className="font-bold text-cyan-400 hover:text-cyan-300 transition-colors font-mono ml-1">
            Staff &amp; Partner Login &rarr;
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Register;
