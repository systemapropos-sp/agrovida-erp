import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Building2, Users, CreditCard, FileText, Settings, LogOut, ClipboardList, Sprout, Bell } from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { to: '/businesses', icon: Building2, label: 'Negocios' },
  { to: '/registrations', icon: ClipboardList, label: 'Solicitudes' },
  { to: '/clients', icon: Users, label: 'Clientes' },
  { to: '/payments', icon: CreditCard, label: 'Pagos' },
  { to: '/documents', icon: FileText, label: 'Documentos' },
  { to: '/settings', icon: Settings, label: 'Configuración' },
];

export default function Sidebar() {
  const { sidebarCollapsed, sidebarHovered, setSidebarHovered, unreadCount } = useUIStore();
  const { logout, user } = useAuthStore();
  const navigate = useNavigate();
  const expanded = !sidebarCollapsed || sidebarHovered;

  const handleLogout = async () => { await logout(); navigate('/login'); };

  return (
    <div
      className="glass-sidebar h-full flex flex-col transition-all duration-300 relative z-30 border-r"
      style={{ width: expanded ? '220px' : '64px', borderColor: '#E5E5E8' }}
      onMouseEnter={() => setSidebarHovered(true)}
      onMouseLeave={() => setSidebarHovered(false)}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b" style={{ borderColor: '#E5E5E8', minHeight: '64px' }}>
        <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #16A34A, #22C55E)' }}>
          <Sprout size={16} className="text-white" />
        </div>
        {expanded && <span className="font-bold text-gray-900 text-sm whitespace-nowrap">AgroVida ERP</span>}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 overflow-hidden">
        {navItems.map(item => {
          const Icon = item.icon;
          return (
            <NavLink key={item.to} to={item.to} end={item.exact}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg text-sm font-medium transition-all duration-150 relative ${isActive ? 'text-green-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`
              }
              style={({ isActive }) => isActive ? { backgroundColor: '#DCFCE7', color: '#15803D' } : {}}
            >
              <div className="relative flex-shrink-0">
                <Icon size={18} />
                {item.to === '/registrations' && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full flex items-center justify-center text-[8px] font-bold text-white" style={{ backgroundColor: '#DC2626' }}>{unreadCount > 9 ? '9+' : unreadCount}</span>
                )}
              </div>
              {expanded && <span className="whitespace-nowrap truncate">{item.label}</span>}
              {expanded && item.to === '/registrations' && unreadCount > 0 && (
                <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white" style={{ backgroundColor: '#DC2626' }}>{unreadCount}</span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="border-t py-3 px-2" style={{ borderColor: '#E5E5E8' }}>
        {expanded && user && (
          <div className="flex items-center gap-2 px-2 py-2 mb-1">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: 'linear-gradient(135deg, #16A34A, #22C55E)' }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-gray-900 truncate">{user.name}</p>
              <p className="text-[10px] text-gray-400 truncate">{user.email}</p>
            </div>
          </div>
        )}
        <button onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors w-full">
          <LogOut size={16} className="flex-shrink-0" />
          {expanded && <span className="whitespace-nowrap">Cerrar Sesión</span>}
        </button>
      </div>
    </div>
  );
}
