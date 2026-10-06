import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import Layout from './layouts/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';
import EmergencyReport from './pages/EmergencyReport';
import TrackEmergency from './pages/TrackEmergency';
import SheltersFinder from './pages/SheltersFinder';
import VolunteerRegistration from './pages/VolunteerRegistration';
import Donation from './pages/Donation';
import MedicalDashboard from './pages/MedicalDashboard';
import LogoOptions from './pages/LogoOptions';

// Role Dashboards
import AdminDashboard from './pages/dashboards/AdminDashboard';
import RescueDashboard from './pages/dashboards/RescueDashboard';
import VolunteerDashboard from './pages/dashboards/VolunteerDashboard';
import NgoDashboard from './pages/dashboards/NgoDashboard';

const queryClient = new QueryClient();

function App() {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '262394297962-70j0pthf0ieh04l4nvocmdmt3v980agt.apps.googleusercontent.com';

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrowserRouter
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true,
            }}
          >
            <Toaster 
              position="top-right" 
              toastOptions={{ 
                style: { background: '#0f172a', color: '#fff', border: '1px solid #1e293b' } 
              }} 
            />
            <Routes>
              {/* Public Citizen & Shared Layout Routes */}
              <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="login" element={<Login />} />
                <Route path="register" element={<Register />} />
                <Route path="emergency" element={<EmergencyReport />} />
                <Route path="report-emergency" element={<EmergencyReport />} />
                <Route path="track-emergency" element={<TrackEmergency />} />
                <Route path="shelters" element={<SheltersFinder />} />
                <Route path="find-shelter" element={<SheltersFinder />} />
                <Route path="emergency-contacts" element={<Home />} />
                <Route path="volunteer" element={<VolunteerRegistration />} />
                <Route path="donate" element={<Donation />} />
                <Route path="logos" element={<LogoOptions />} />
                
                {/* Legacy General Dashboard Route */}
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="medical" element={<MedicalDashboard />} />

                <Route path="*" element={<NotFound />} />
              </Route>

              {/* Admin Protected Routes */}
              <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/emergencies" element={<AdminDashboard />} />
                <Route path="/admin/rescue-teams" element={<AdminDashboard />} />
                <Route path="/admin/volunteers" element={<AdminDashboard />} />
                <Route path="/admin/ngos" element={<AdminDashboard />} />
                <Route path="/admin/shelters" element={<SheltersFinder />} />
              </Route>

              {/* Rescue Team Protected Routes */}
              <Route element={<ProtectedRoute allowedRoles={['rescue']} />}>
                <Route path="/rescue/dashboard" element={<RescueDashboard />} />
                <Route path="/rescue/tasks" element={<RescueDashboard />} />
                <Route path="/rescue/map" element={<RescueDashboard />} />
              </Route>

              {/* Volunteer Protected Routes */}
              <Route element={<ProtectedRoute allowedRoles={['volunteer']} />}>
                <Route path="/volunteer/dashboard" element={<VolunteerDashboard />} />
                <Route path="/volunteer/tasks" element={<VolunteerDashboard />} />
              </Route>

              {/* NGO Protected Routes */}
              <Route element={<ProtectedRoute allowedRoles={['ngo']} />}>
                <Route path="/ngo/dashboard" element={<NgoDashboard />} />
                <Route path="/ngo/resources" element={<NgoDashboard />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
