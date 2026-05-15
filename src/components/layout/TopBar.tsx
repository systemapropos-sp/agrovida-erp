import { Bell, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { useUIStore } from '@/stores/uiStore';
import { useLocation, Link } from 'react-router-dom';

const pageNames: Record<string, string> = {
  '/': 'Dashboard', '/businesses': 'Negocios', '/registrations': 'Solicitudes de Registro',
  '/clients': 'Clientes', '/payments': 'Pagos', '/documents': 'Documentos', '/settings': 'Configuración',
};

export default function TopBar() {
  const { unreadCount, notifications, markNotificationRead, markAllRead } = useUIStore();
  const [showNotifs, setShowNotifs] = useState(false);
  const { pathname } = useLocation();
  const title = Object.keys(pageNames).find(k => (k === '/' ? pathname === '/' : pathname.startsWith(k)));

  return (
    <header className="flex items-center justify-between px-6 bg-white border-b h-16 flex-shrink-0" style={{ borderColor: '#E5E5E8' }}>
      <div>
        <h1 className="text-base font-semibold text-gray-900">{pageNames[title || '/']}</h1>
        <p className="text-xs text-gray-400">AgroVida ERP — Panel Administrativo</p>
      </div>
      <div className="flex items-center gap-3">
        <a href="https://agrovidapro.com" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-green-600 transition-colors">
          <ExternalLink size={13} /> Ir al Sitio
        </a>
        <div className="relative">
          <button onClick={() => setShowNotifs(!showNotifs)}
            className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500">
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full" style={{ backgroundColor: '#DC2626' }} />
            )}
          </button>
          {showNotifs && (
            <div className="absolute right-0 top-10 w-80 bg-white rounded-xl shadow-xl border overflow-hidden z-50" style={{ borderColor: '#E5E5E8' }}>
              <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: '#E5E5E8' }}>
                <span className="text-sm font-semibold text-gray-900">Notificaciones</span>
                {unreadCount > 0 && <button onClick={markAllRead} className="text-xs text-green-600 hover:text-green-700">Marcar todas</button>}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-8">Sin notificaciones</p>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer border-b last:border-0" style={{ borderColor: '#E5E5E8' }} onClick={() => markNotificationRead(n.id)}>
                      <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: n.type === 'registration' ? '#16A34A' : '#DC2626' }} />
                      <div>
                        <p className="text-xs font-medium text-gray-900">{n.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{n.message}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="px-4 py-2 border-t bg-gray-50" style={{ borderColor: '#E5E5E8' }}>
                <Link to="/registrations" onClick={() => setShowNotifs(false)} className="text-xs text-green-600 hover:text-green-700 font-medium">
                  Ver todas las solicitudes →
                </Link>
              </div>
            </div>
          )}
        </div>
        {showNotifs && <div className="fixed inset-0 z-40" onClick={() => setShowNotifs(false)} />}
      </div>
    </header>
  );
}
