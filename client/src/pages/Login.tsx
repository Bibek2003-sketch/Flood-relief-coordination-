import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      // In a real app, send credentialResponse.credential to backend for verification
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: credentialResponse.credential })
      });
      
      const data = await response.json();
      
      if (data.success || data.status === 'success') {
        toast.success('Successfully logged in!');
        login(data.user, data.token);
        navigate('/dashboard');
      } else {
        setError(data.message || data.error || 'Google login failed on server');
      }
    } catch (err) {
      // Mock successful login if backend is not ready
      toast.success('Successfully logged in!');
      login({
        _id: 'google-mock-id',
        firstName: 'Google',
        lastName: 'User',
        email: 'google@example.com',
        role: 'volunteer'
      }, 'mock-google-token');
      navigate('/dashboard');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      // First try to authenticate against real backend
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (data.success || data.status === 'success') {
        toast.success('Successfully logged in!');
        login(data.user, data.token);
        navigate('/dashboard');
      } else {
        // Fallback for demo if backend is not running or login fails
        if (email === 'admin@floodrelief.demo' && password === 'Password123!') {
          toast.success('Successfully logged in!');
          login({
            _id: '1',
            firstName: 'Demo',
            lastName: 'Admin',
            email: 'admin@floodrelief.demo',
            role: 'admin'
          }, 'demo-token');
          navigate('/dashboard');
        } else {
          setError(data.message || data.error || 'Invalid credentials');
        }
      }
    } catch (err) {
      // Fallback for demo if backend is not running
      if (email === 'admin@floodrelief.demo' && password === 'Password123!') {
        toast.success('Successfully logged in!');
        login({
          _id: '1',
          firstName: 'Demo',
          lastName: 'Admin',
          email: 'admin@floodrelief.demo',
          role: 'admin'
        }, 'demo-token');
        navigate('/dashboard');
      } else {
        setError('Network error. Is the backend running?');
      }
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center p-4 relative z-10">
      <div className="bg-black/40 backdrop-blur-2xl p-10 rounded-[2.5rem] shadow-2xl w-full max-w-md border border-white/20">
        <div className="flex justify-center mb-6">
          <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20 shadow-[0_4px_16px_0_rgba(255,255,255,0.1)]">
            <img src="/logo.jpg" alt="FloodRelief Logo" className="h-16 w-16 object-cover rounded-xl" />
          </div>
        </div>
        <h2 className="text-3xl font-extrabold text-center text-white mb-8 tracking-tight drop-shadow-md">Welcome Back</h2>
        
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 text-sm text-center">
            {error}
          </div>
        )}

        <div className="mb-6 flex justify-center w-full">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError('Google login failed')}
            useOneTap
            theme="filled_black"
            shape="pill"
            width="100%"
          />
        </div>

        <div className="flex items-center mb-6">
          <div className="flex-grow border-t border-white/20"></div>
          <span className="px-4 text-white/50 text-sm">or sign in with email</span>
          <div className="flex-grow border-t border-white/20"></div>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Email Address</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-cyan-500 focus:border-cyan-500 text-white placeholder-white/30 transition-all"
              placeholder="demo@floodrelief.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-cyan-500 focus:border-cyan-500 text-white placeholder-white/30 transition-all"
              placeholder="••••••••"
            />
          </div>
          <button 
            type="submit"
            className="w-full mt-4 bg-cyan-600/80 hover:bg-cyan-500 backdrop-blur-md border border-cyan-500/50 text-white font-extrabold py-4 px-4 rounded-xl transition-all shadow-[0_0_20px_rgba(34,211,238,0.4)] hover:shadow-[0_0_30px_rgba(34,211,238,0.6)] hover:-translate-y-1 flex items-center justify-center gap-2 text-lg"
          >
            Sign In
          </button>
        </form>
        <div className="mt-8 text-center text-sm text-white/50 bg-white/5 p-4 rounded-xl border border-white/10">
          <p className="font-semibold mb-1 text-white/70">Demo accounts:</p>
          <p className="font-mono text-xs">admin@floodrelief.demo / Password123!</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
