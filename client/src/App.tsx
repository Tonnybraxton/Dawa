import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import DashboardLayout from './components/layout/DashboardLayout';
import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import PatientDashboard from './pages/patient/Dashboard';
import PatientPrescriptions from './pages/patient/Prescriptions';
import Reminders from './pages/patient/Reminders';
import PharmacyLocator from './pages/patient/PharmacyLocator';
import InteractionChecker from './pages/patient/InteractionChecker';
import Profile from './pages/patient/Profile';
import DoctorDashboard from './pages/doctor/Dashboard';
import Prescribe from './pages/doctor/Prescribe';
import DoctorPatients from './pages/doctor/Patients';
import PrescriptionHistory from './pages/doctor/PrescriptionHistory';
import PharmacyDashboard from './pages/pharmacy/Dashboard';
import Inventory from './pages/pharmacy/Inventory';
import DispensingLog from './pages/pharmacy/Log';
import AdminAnalytics from './pages/admin/Analytics';
import AdminUsers from './pages/admin/Users';
import AdminDrugs from './pages/admin/Drugs';
import AuditLog from './pages/admin/AuditLog';
import CaregiverDashboard from './pages/caregiver/Dashboard';

function ProtectedRoute({ children, roles }: { children: React.ReactNode; roles?: string[] }) {
  const { user, loading } = useAuthStore();
  if (loading) return <div className="loading-page"><div className="spinner" /><p>Loading...</p></div>;
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to={`/${user.role === 'pharmacist' ? 'pharmacy' : user.role}`} />;
  return <DashboardLayout>{children}</DashboardLayout>;
}

function App() {
  const { loadUser, loading } = useAuthStore();
  useEffect(() => { loadUser(); }, []);

  if (loading) return <div className="loading-page" style={{minHeight:'100vh'}}><div className="spinner" /><p style={{marginTop:16, color:'var(--text-muted)'}}>Loading Dawa Track...</p></div>;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Patient */}
        <Route path="/patient" element={<ProtectedRoute roles={['patient']}><PatientDashboard /></ProtectedRoute>} />
        <Route path="/patient/prescriptions" element={<ProtectedRoute roles={['patient']}><PatientPrescriptions /></ProtectedRoute>} />
        <Route path="/patient/reminders" element={<ProtectedRoute roles={['patient']}><Reminders /></ProtectedRoute>} />
        <Route path="/patient/pharmacies" element={<ProtectedRoute roles={['patient']}><PharmacyLocator /></ProtectedRoute>} />
        <Route path="/patient/interactions" element={<ProtectedRoute roles={['patient']}><InteractionChecker /></ProtectedRoute>} />
        <Route path="/patient/profile" element={<ProtectedRoute roles={['patient']}><Profile /></ProtectedRoute>} />

        {/* Doctor */}
        <Route path="/doctor" element={<ProtectedRoute roles={['doctor']}><DoctorDashboard /></ProtectedRoute>} />
        <Route path="/doctor/prescribe" element={<ProtectedRoute roles={['doctor']}><Prescribe /></ProtectedRoute>} />
        <Route path="/doctor/patients" element={<ProtectedRoute roles={['doctor']}><DoctorPatients /></ProtectedRoute>} />
        <Route path="/doctor/prescriptions" element={<ProtectedRoute roles={['doctor']}><PrescriptionHistory /></ProtectedRoute>} />

        {/* Pharmacist */}
        <Route path="/pharmacy" element={<ProtectedRoute roles={['pharmacist']}><PharmacyDashboard /></ProtectedRoute>} />
        <Route path="/pharmacy/inventory" element={<ProtectedRoute roles={['pharmacist']}><Inventory /></ProtectedRoute>} />
        <Route path="/pharmacy/log" element={<ProtectedRoute roles={['pharmacist']}><DispensingLog /></ProtectedRoute>} />

        {/* Admin */}
        <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminAnalytics /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute roles={['admin']}><AdminUsers /></ProtectedRoute>} />
        <Route path="/admin/drugs" element={<ProtectedRoute roles={['admin']}><AdminDrugs /></ProtectedRoute>} />
        <Route path="/admin/audit" element={<ProtectedRoute roles={['admin']}><AuditLog /></ProtectedRoute>} />

        {/* Caregiver */}
        <Route path="/caregiver" element={<ProtectedRoute roles={['caregiver']}><CaregiverDashboard /></ProtectedRoute>} />
        <Route path="/caregiver/prescriptions" element={<ProtectedRoute roles={['caregiver']}><CaregiverDashboard /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
