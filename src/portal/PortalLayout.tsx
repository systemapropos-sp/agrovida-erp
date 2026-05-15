import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Sprout, LayoutDashboard, ShoppingCart, Package, Wheat, Beef, BarChart3, Settings, LogOut, Menu, X, ChevronRight } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import ToastContainer from '@/components/layout/ToastContainer';

const navItems = [
  { to: '/portal', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/portal/pos', icon: ShoppingCart, label: 'Ventas / POS' },
  { to: '/portal/inventario', icon: Package, label: 'Inventario' },
  { to: '/portal/cultivos', icon: Wheat, label: 'Cultivos' },
  { to: '/portal/ganados', icon: Beef, label: 'Ganados' },
  { to: '/portal/reportes', icon: BarChart3, label: 'Reportes' },
  { to: '/portal/configuracion', icon: Settings, label: 'Configuración' },
];

export default function PortalLayout() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => { await logout(); navigate('/login'); };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile overlay */}
      {open && <div className="fixed inset-0 bg-black/30 z-20 lg:hidden" onClick={() => setOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white border-r flex flex-col transition-transform lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`} style={{ borderColor: '#E5E7EB' }}>
        {/* Logo */}
        <div className="flex items-center gap-3 p-5 border-b" style={{ borderColor: '#E5E7EB' }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #16A34A, #22C55E)' }}>
            <Sprout size={17} className="text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-gray-900 truncate">AgroVida ERP</p>
            <p className="text-xs text-gray-400 truncate">{user?.businessName || user?.name}</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          {navItems.map(({ to, icon: Icon, label, end }) => (
            <NavLink key={to} to={to} end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${isActive
                  ? 'text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
              style={({ isActive }) => isActive ? { background: 'linear-gradient(135deg, #16A34A, #22C55E)' } : {}}
              onClick={() => setOpen(false)}>
              <Icon size={17} />
              <span className="flex-1">{label}</span>
              <ChevronRight size={14} className="opacity-0 group-hover:opacity-40" />
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        <div className="p-3 border-t" style={{ borderColor: '#E5E7EB' }}>
          <div className="flex items-center gap-3 px-3 py-2 mb-1">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ background: 'linear-gradient(135deg, #16A34A, #22C55E)' }}>
              {user?.name?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-red-600 hover:bg-red-50 transition-colors">
            <LogOut size={15} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile topbar */}
        <header className="lg:hidden flex items-center gap-3 h-14 px-4 bg-white border-b flex-shrink-0" style={{ borderColor: '#E5E7EB' }}>
          <button onClick={() => setOpen(true)} className="p-1.5 rounded-lg hover:bg-gray-100">
            <Menu size={20} className="text-gray-600" />
          </button>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #16A34A, #22C55E)' }}>
            <Sprout size={14} className="text-white" />
          </div>
          <p className="text-sm font-bold text-gray-900">AgroVida ERP</p>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>

      <ToastContainer />
    </div>
  );
}
