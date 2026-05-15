import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { AnimatePresence } from 'framer-motion';
import LoginPage from '@/pages/Login';
import RegisterPage from '@/pages/Register';
import Dashboard from '@/pages/Dashboard';
import Businesses from '@/pages/Businesses';
import BusinessDetail from '@/pages/BusinessDetail';
import Registrations from '@/pages/Registrations';
import Clients from '@/pages/Clients';
import Payments from '@/pages/Payments';
import Documents from '@/pages/Documents';
import Settings from '@/pages/Settings';
import AppLayout from '@/components/layout/AppLayout';
import ToastContainer from '@/components/layout/ToastContainer';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore();
  if (isLoading) return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: '#16A34A', borderTopColor: 'transparent' }} />
        <p className="text-sm text-gray-400">Cargando...</p>
      </div>
    </div>
  );
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const { isAuthenticated } = useAuthStore();
  return (
    <AnimatePresence mode="wait">
      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />} />
        <Route path="/registro" element={<RegisterPage />} />
        <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="businesses" element={<Businesses />} />
          <Route path="businesses/:id" element={<BusinessDetail />} />
          <Route path="registrations" element={<Registrations />} />
          <Route path="clients" element={<Clients />} />
          <Route path="payments" element={<Payments />} />
          <Route path="documents" element={<Documents />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  const { checkAuth } = useAuthStore();
  useEffect(() => { checkAuth(); }, [checkAuth]);
  return (
    <BrowserRouter>
      <AppRoutes />
      <ToastContainer />
    </BrowserRouter>
  );
}
