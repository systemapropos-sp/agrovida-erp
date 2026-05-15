import { useAuthStore } from '@/stores/authStore';
import { TrendingUp, Package, Wheat, Beef, ShoppingCart, DollarSign } from 'lucide-react';

const stats = [
  { label: 'Ventas Hoy', value: '$0.00', icon: DollarSign, color: '#16A34A', bg: '#DCFCE7' },
  { label: 'Productos', value: '0', icon: Package, color: '#2563EB', bg: '#DBEAFE' },
  { label: 'Cultivos Activos', value: '0', icon: Wheat, color: '#D97706', bg: '#FEF3C7' },
  { label: 'Cabezas Ganado', value: '0', icon: Beef, color: '#7C3AED', bg: '#EDE9FE' },
  { label: 'Órdenes Hoy', value: '0', icon: ShoppingCart, color: '#0891B2', bg: '#CFFAFE' },
  { label: 'Crecimiento', value: '0%', icon: TrendingUp, color: '#16A34A', bg: '#DCFCE7' },
];

export default function PortalDashboard() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="rounded-2xl p-6 text-white" style={{ background: 'linear-gradient(135deg, #16A34A, #22C55E)' }}>
        <h1 className="text-2xl font-bold">¡Bienvenido, {user?.name || 'Usuario'}! 🌱</h1>
        <p className="text-green-100 mt-1 text-sm">{user?.businessName || 'Tu negocio'} — Panel de Control AgroVida ERP</p>
        <p className="text-green-200 mt-3 text-xs">
          {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: bg }}>
                <Icon size={18} style={{ color }} />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Nueva Venta', icon: ShoppingCart, href: '/portal/pos' },
            { label: 'Inventario', icon: Package, href: '/portal/inventario' },
            { label: 'Cultivos', icon: Wheat, href: '/portal/cultivos' },
            { label: 'Ganados', icon: Beef, href: '/portal/ganados' },
          ].map(({ label, icon: Icon, href }) => (
            <a key={href} href={href}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-100 hover:border-green-200 hover:bg-green-50 transition-all group">
              <Icon size={20} className="text-gray-400 group-hover:text-green-600" />
              <span className="text-xs font-medium text-gray-600 group-hover:text-green-700">{label}</span>
            </a>
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
        <p className="text-sm font-semibold text-blue-800">🚀 Sistema en construcción</p>
        <p className="text-xs text-blue-600 mt-1">Tu portal agrícola está activo. Las funciones se irán activando progresivamente. Navega por el menú para explorar las secciones disponibles.</p>
      </div>
    </div>
  );
}
