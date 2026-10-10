import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useGoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';
import { getNormalizedUserRole, getRoleHomeDashboard } from '../components/ProtectedRoute';
import {
  Shield,
  Lock,
  Mail,
  ArrowRight,
  HeartPulse,
  AlertTriangle,
  Clock
} from 'lucide-react';
import logoImg from '../assets/logo.jpg';


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

  const handleGoogleSuccess = async (tokenString: string) => {
    setErrorAlert(null);
    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: tokenString })
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

  const loginWithGoogle = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      handleGoogleSuccess(tokenResponse.access_token);
    },
    onError: (error) => {
      console.warn('Google Sign-In response:', error);
      toast.error('Google Sign-In popup closed or origin unverified.');
    }
  });

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


  return (
    <div className="flex-grow flex items-center justify-center p-4 sm:p-6 relative z-10 bg-[#0b0f19] min-h-[85vh]">
      <div className="bg-[#0f172a] p-6 sm:p-10 rounded-2xl shadow-2xl w-full max-w-lg border border-slate-800 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="bg-slate-900 p-1.5 rounded-xl border border-slate-700/80 shadow-md w-11 h-11 shrink-0 flex items-center justify-center overflow-hidden">
              <img src={logoImg} alt="FloodRelief Logo" className="w-full h-full object-cover rounded-lg" />
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
            <button
              type="button"
              onClick={() => loginWithGoogle()}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-slate-900 hover:bg-slate-800 text-slate-100 rounded-xl border border-slate-700/80 hover:border-slate-600 transition-all shadow-md text-sm font-medium font-sans disabled:opacity-50"
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
              <span>Sign in with Google</span>
            </button>
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
              placeholder="e.g. officer@organization.org"
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
