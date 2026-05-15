import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { useUIStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';
import { useEffect } from 'react';

export default function AppLayout() {
  const { generateNotifications } = useUIStore();
  const { isAuthenticated } = useAuthStore();
  useEffect(() => { if (isAuthenticated) generateNotifications(); }, [isAuthenticated, generateNotifications]);
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-auto p-6 animate-fade-slide-up">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
