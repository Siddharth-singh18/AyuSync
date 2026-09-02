
import { BrowserRouter, Routes, Route, Navigate, Outlet, Link } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import PatientProfile from './pages/PatientProfile';
import FacilityReadiness from './pages/FacilityReadiness';
import { Activity, LogOut } from 'lucide-react';


// Protected Route Wrapper
const ProtectedRoute = () => {
  const token = localStorage.getItem('ayusync_token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-white shadow-sm">
        <div className="flex h-16 items-center px-4 md:px-6 container mx-auto">
          <div className="flex items-center gap-2 text-blue-600">
            <Activity size={24} />
            <h1 className="text-xl font-bold">AyuSync</h1>
          </div>
          <nav className="ml-8 flex gap-4 sm:gap-6">
            <Link className="text-sm font-medium hover:text-blue-600 transition-colors" to="/dashboard">Dashboard</Link>
            <Link className="text-sm font-medium hover:text-blue-600 transition-colors" to="/patients">Patients</Link>
            <Link className="text-sm font-medium hover:text-blue-600 transition-colors" to="/facilities">Facilities</Link>

          </nav>
          <div className="ml-auto">
            <button 
              onClick={() => {
                localStorage.removeItem('ayusync_token');
                localStorage.removeItem('ayusync_user');
                window.location.href = '/login';
              }}
              className="text-sm text-gray-500 hover:text-red-600 flex items-center gap-1 transition-colors"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </header>
      <main className="container mx-auto p-4 md:p-6 mt-4">
        <Outlet />
      </main>
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/patients" element={<Patients />} />
          <Route path="/patients/:id" element={<PatientProfile />} />
          <Route path="/facilities" element={<FacilityReadiness />} />
        </Route>
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
