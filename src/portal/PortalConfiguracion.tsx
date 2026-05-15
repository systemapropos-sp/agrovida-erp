import { useAuthStore } from '@/stores/authStore';
import { Settings, User, Bell, Shield, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PortalConfiguracion() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const handleLogout = async () => { await logout(); navigate('/login'); };

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Configuración</h1>
        <p className="text-sm text-gray-500">Gestiona tu cuenta y preferencias</p>
      </div>

      {/* Profile */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center gap-2">
          <User size={16} className="text-green-600" />
          <h2 className="text-sm font-semibold text-gray-700">Perfil</h2>
        </div>
        <div className="p-5">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold text-white" style={{ background: 'linear-gradient(135deg, #16A34A, #22C55E)' }}>
              {user?.name?.[0]?.toUpperCase() || 'A'}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{user?.name}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
              {user?.businessName && <p className="text-xs text-green-600 mt-0.5">{user.businessName}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500">Nombre</label>
              <input defaultValue={user?.name} className="w-full mt-1 px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-green-400" disabled />
            </div>
            <div>
              <label className="text-xs text-gray-500">Email</label>
              <input defaultValue={user?.email} className="w-full mt-1 px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-green-400" disabled />
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center gap-2">
          <Bell size={16} className="text-green-600" />
          <h2 className="text-sm font-semibold text-gray-700">Notificaciones</h2>
        </div>
        <div className="p-5 space-y-3">
          {['Alertas de stock bajo', 'Eventos de cultivos', 'Recordatorios de vacunación'].map(label => (
            <div key={label} className="flex items-center justify-between">
              <span className="text-sm text-gray-700">{label}</span>
              <div className="w-10 h-5 rounded-full bg-green-500 relative cursor-pointer">
                <div className="w-4 h-4 bg-white rounded-full absolute top-0.5 right-0.5 shadow" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Security */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center gap-2">
          <Shield size={16} className="text-green-600" />
          <h2 className="text-sm font-semibold text-gray-700">Seguridad</h2>
        </div>
        <div className="p-5">
          <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">Cambiar contraseña →</button>
        </div>
      </div>

      {/* Logout */}
      <button onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold text-red-600 border border-red-200 hover:bg-red-50 transition-colors">
        <LogOut size={15} /> Cerrar Sesión
      </button>
    </div>
  );
}
