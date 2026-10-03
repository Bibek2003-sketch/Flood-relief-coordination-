import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { PrivateRoute } from './components/PrivateRoute';
import Layout from './layouts/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';
import EmergencyReport from './pages/EmergencyReport';
import SheltersFinder from './pages/SheltersFinder';
import VolunteerRegistration from './pages/VolunteerRegistration';
import Donation from './pages/Donation';
import MedicalDashboard from './pages/MedicalDashboard';
import LogoOptions from './pages/LogoOptions';

const queryClient = new QueryClient();

function App() {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '477256145739-mo4vjua9jl9e8a7uvgk4n3k1v0l66onu.apps.googleusercontent.com';

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrowserRouter>
            <Toaster 
              position="top-right" 
              toastOptions={{ 
                style: { background: '#111827', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' } 
              }} 
            />
            <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="emergency" element={<EmergencyReport />} />
              <Route path="shelters" element={<SheltersFinder />} />
              <Route path="volunteer" element={<VolunteerRegistration />} />
              <Route path="donate" element={<Donation />} />
              <Route path="logos" element={<LogoOptions />} />
              
              {/* Protected routes */}
              <Route element={<PrivateRoute />}>
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="medical" element={<MedicalDashboard />} />
              </Route>
              
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
    </GoogleOAuthProvider>
  );
}

export default App;

