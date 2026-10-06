import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';
import { getNormalizedUserRole, getRoleHomeDashboard } from '../components/ProtectedRoute';
import {
  Shield,
  Lock,
  Mail,
  ArrowRight,
  HeartPulse,
  AlertTriangle,
  Clock,
  Sparkles,
  KeyRound
} from 'lucide-react';

const DEMO_PRESETS = [
  {
    label: 'Rescue Squad',
    email: 'rescue@floodrelief.demo',
    color: 'border-amber-500/30 bg-amber-950/30 text-amber-300 hover:border-amber-500/60'
  },
  {
    label: 'Volunteer',
    email: 'volunteer@floodrelief.demo',
    color: 'border-cyan-500/30 bg-cyan-950/30 text-cyan-300 hover:border-cyan-500/60'
  },
  {
    label: 'Relief NGO',
    email: 'ngo@floodrelief.demo',
    color: 'border-emerald-500/30 bg-emerald-950/30 text-emerald-300 hover:border-emerald-500/60'
  }
];

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorAlert, setErrorAlert] = useState<{ type: 'pending' | 'suspended' | 'rejected' | 'general'; message: string } | null>(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const handlePostLoginRedirect = (userObj: any) => {
    const normalizedRole = getNormalizedUserRole(userObj);
    const targetUrl = (location.state as any)?.from?.pathname || getRoleHomeDashboard(normalizedRole);
    navigate(targetUrl, { replace: true });
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setErrorAlert(null);
    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: credentialResponse.credential })
      });
      
      const data = await response.json();
      
      if (response.ok && (data.success || data.status === 'success')) {
        const userObj = data.user || data.data;
        toast.success(`Welcome, ${userObj.firstName || userObj.name || 'User'}!`);
        login(userObj, data.token);
        handlePostLoginRedirect(userObj);
      } else {
        const errMsg = data.error || data.message || 'Google authentication failed';
        if (errMsg.toLowerCase().includes('awaiting administrator approval') || errMsg.toLowerCase().includes('pending')) {
          setErrorAlert({ type: 'pending', message: errMsg });
        } else if (errMsg.toLowerCase().includes('suspended')) {
          setErrorAlert({ type: 'suspended', message: errMsg });
        } else {
          setErrorAlert({ type: 'general', message: errMsg });
        }
        toast.error(errMsg);
      }
    } catch (err: any) {
      setErrorAlert({ type: 'general', message: 'Network error communicating with authentication server.' });
      toast.error('Network error. Is backend server reachable?');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorAlert(null);
    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password
        })
      });

      const data = await response.json();

      if (response.ok && (data.success || data.status === 'success')) {
        const userObj = data.user || data.data;
        const canonicalRole = (userObj.role || userObj.roleName || 'staff').toUpperCase();
        toast.success(`Authenticated as ${canonicalRole}`);
        login(userObj, data.token);
        handlePostLoginRedirect(userObj);
      } else {
        const errMsg = data.error || data.message || 'Invalid email or password';
        
        if (errMsg.toLowerCase().includes('approval') || errMsg.toLowerCase().includes('pending')) {
          setErrorAlert({
            type: 'pending',
            message: 'Your account is awaiting administrator approval. You will gain access once verified by an operations admin.'
          });
        } else if (errMsg.toLowerCase().includes('suspended')) {
          setErrorAlert({
            type: 'suspended',
            message: 'Your account has been suspended. Please contact the administrator.'
          });
        } else if (errMsg.toLowerCase().includes('rejected')) {
          setErrorAlert({
            type: 'rejected',
            message: 'Your registration application has been rejected. Please contact support.'
          });
        } else {
          setErrorAlert({ type: 'general', message: errMsg });
        }
        toast.error(errMsg);
      }
    } catch (err: any) {
      setErrorAlert({ type: 'general', message: 'Network error. Please verify backend server is online.' });
      toast.error('Network error during authentication.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoPreset = (presetEmail: string) => {
    setEmail(presetEmail);
    setPassword('Password123!');
    setErrorAlert(null);
    toast.success(`Loaded credentials for ${presetEmail}`);
  };

  return (
    <div className="flex-grow flex items-center justify-center p-4 sm:p-6 relative z-10 bg-[#0b0f19] min-h-[85vh]">
      <div className="bg-[#0f172a] p-6 sm:p-10 rounded-2xl shadow-2xl w-full max-w-lg border border-slate-800 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-700/80 shadow-md">
              <img src="/logo.jpg" alt="FloodRelief Logo" className="h-8 w-8 object-cover rounded-lg" />
            </div>
            <div>
              <div className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase font-bold">
                OPERATIONAL COMMAND PORTAL
              </div>
              <h2 className="text-xl font-extrabold text-white tracking-tight">Staff &amp; Partner Login</h2>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-[11px] font-mono text-cyan-400">
            <Shield className="w-3.5 h-3.5 text-cyan-400" />
            <span>RBAC SECURED</span>
          </div>
        </div>

        {/* Public Citizen Notice & Shortcut */}
        <div className="p-3.5 bg-red-950/20 border border-red-500/30 rounded-xl flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-red-200">
            <HeartPulse className="w-4 h-4 text-red-400 shrink-0 animate-pulse" />
            <span>Need emergency assistance? Victims do NOT require an account.</span>
          </div>
          <Link
            to="/emergency"
            className="px-2.5 py-1.5 bg-red-600 hover:bg-red-500 text-white font-mono font-bold text-[11px] rounded-lg transition-all whitespace-nowrap shadow-sm"
          >
            Report SOS &rarr;
          </Link>
        </div>

        {/* Lifecycle Status Alerts */}
        {errorAlert && (
          <div className={`p-4 rounded-xl border text-xs font-mono flex items-start gap-3 ${
            errorAlert.type === 'pending'
              ? 'bg-amber-950/30 border-amber-500/40 text-amber-200'
              : errorAlert.type === 'suspended' || errorAlert.type === 'rejected'
              ? 'bg-red-950/30 border-red-500/40 text-red-200'
              : 'bg-red-500/10 border-red-500/30 text-red-300'
          }`}>
            {errorAlert.type === 'pending' ? (
              <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            )}
            <div>
              <div className="font-bold uppercase tracking-wider mb-0.5">
                {errorAlert.type === 'pending' ? 'ACCOUNT APPROVAL PENDING' : 'ACCESS RESTRICTED'}
              </div>
              <p className="leading-relaxed">{errorAlert.message}</p>
            </div>
          </div>
        )}

        {/* Google OAuth Login */}
        <div className="space-y-2">
          <div className="flex flex-col items-center w-full">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => {
                setErrorAlert({ type: 'general', message: 'Google Sign-In service unavailable.' });
                toast.error('Google Sign-In failed');
              }}
              useOneTap={false}
              theme="filled_black"
              shape="pill"
              text="signin_with"
              width="350"
            />
          </div>
          <div className="text-[10px] font-mono text-center text-slate-500">
            Your role and permissions are securely determined by your account.
          </div>
        </div>

        <div className="flex items-center my-2">
          <div className="flex-grow border-t border-slate-800"></div>
          <span className="px-3 text-slate-500 text-[10px] font-mono uppercase tracking-wider">or sign in with operational credentials</span>
          <div className="flex-grow border-t border-slate-800"></div>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              Staff / Organization Email
            </label>
            <input 
              type="email" 
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 text-white placeholder-slate-500 text-sm font-mono transition-all"
              placeholder="e.g. officer@floodrelief.demo"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              Password
            </label>
            <input 
              type="password" 
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 text-white placeholder-slate-500 text-sm transition-all"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-lg shadow-cyan-950 flex items-center justify-center gap-2 text-sm font-mono tracking-wider uppercase disabled:opacity-50"
          >
            {loading ? 'Authenticating Role...' : (
              <>
                <span>Sign In to Command Portal</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo Fast-Testing Tray */}
        <div className="pt-3 border-t border-slate-800/80">
          <div className="text-[11px] font-mono text-slate-400 mb-2 flex items-center gap-1.5">
            <KeyRound className="w-3 h-3 text-cyan-400" />
            <span>Demo Access — Limited Permissions:</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {DEMO_PRESETS.map((p) => (
              <button
                key={p.email}
                type="button"
                onClick={() => fillDemoPreset(p.email)}
                className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-mono font-medium text-left transition-all ${p.color}`}
              >
                <span className="block font-bold">{p.label}</span>
                <span className="text-[10px] text-slate-400 truncate block">{p.email}</span>
              </button>
            ))}
          </div>
          <div className="text-[10px] font-mono text-slate-500 text-center mt-2 leading-tight">
            Demo accounts have limited permissions. Administrator access is privately provisioned.
          </div>
        </div>

        {/* Footer Link to Register */}
        <div className="pt-2 flex items-center justify-between text-xs text-slate-400">
          <span>Apply to join relief operations?</span>
          <Link
            to="/register"
            className="font-bold text-cyan-400 hover:text-cyan-300 transition-colors font-mono"
          >
            Join FloodRelief &rarr;
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Login;
