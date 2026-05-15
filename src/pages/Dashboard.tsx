import { useEffect, useState } from 'react';
import { Building2, TrendingUp, CreditCard, Users, AlertCircle, ClipboardList } from 'lucide-react';
import { getDashboardStats, getMonthlyRevenue, type DashboardStats, type MonthlyRevenue } from '@/lib/supabaseApi';
import { formatCurrency } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';

function StatCard({ icon: Icon, label, value, sub, color }: { icon: React.ElementType; label: string; value: string; sub?: string; color: string }) {
  return (
    <div className="bg-white rounded-xl p-5 border shadow-sm card-hover" style={{ borderColor: '#E5E5E8' }}>
      <div className="flex items-center justify-between mb-3">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: color + '15' }}>
          <Icon size={18} style={{ color }} />
        </div>
        {sub && <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: '#DCFCE7', color: '#15803D' }}>{sub}</span>}
      </div>
      <p className="text-2xl font-bold text-gray-900 mb-0.5">{value}</p>
      <p className="text-xs text-gray-400">{label}</p>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [revenue, setRevenue] = useState<MonthlyRevenue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getDashboardStats(), getMonthlyRevenue()])
      .then(([s, r]) => { setStats(s); setRevenue(r); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => <div key={i} className="h-28 rounded-xl shimmer" />)}
    </div>
  );

  return (
    <div className="space-y-6">
      {stats && stats.pendingRegistrations > 0 && (
        <Link to="/registrations" className="flex items-center gap-3 px-5 py-4 rounded-xl border text-sm font-medium hover:opacity-90 transition-opacity" style={{ backgroundColor: '#FFFBEB', borderColor: '#FDE68A', color: '#92400E' }}>
          <AlertCircle size={18} style={{ color: '#D97706' }} className="flex-shrink-0" />
          <span>Tienes <strong>{stats.pendingRegistrations} solicitud{stats.pendingRegistrations !== 1 ? 'es' : ''} de registro</strong> pendiente{stats.pendingRegistrations !== 1 ? 's' : ''} de aprobación</span>
          <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: '#FDE68A' }}>Ver</span>
        </Link>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard icon={Building2} label="Negocios Activos" value={String(stats?.totalActiveBusinesses ?? 0)} color="#16A34A" />
        <StatCard icon={Building2} label="En Prueba" value={String(stats?.trialBusinesses ?? 0)} color="#D97706" />
        <StatCard icon={TrendingUp} label="Ingresos Mensuales" value={formatCurrency(stats?.totalMonthlyRevenue ?? 0)} sub={stats?.revenueGrowth ? `+${stats.revenueGrowth}%` : undefined} color="#16A34A" />
        <StatCard icon={CreditCard} label="Pagos Pendientes" value={String(stats?.pendingPayments ?? 0)} color="#DC2626" />
        <StatCard icon={ClipboardList} label="Solicitudes Pendientes" value={String(stats?.pendingRegistrations ?? 0)} color="#D97706" />
      </div>

      <div className="bg-white rounded-xl p-6 border shadow-sm" style={{ borderColor: '#E5E5E8' }}>
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Ingresos — Últimos 12 Meses</h3>
        {revenue.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={revenue} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => [formatCurrency(v), 'Ingresos']} contentStyle={{ borderRadius: '8px', border: '1px solid #E5E5E8', fontSize: '12px' }} />
              <Bar dataKey="revenue" fill="#16A34A" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No hay datos de ingresos aún</div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { to: '/businesses', label: 'Negocios', icon: Building2, count: stats?.totalBusinesses },
          { to: '/registrations', label: 'Solicitudes', icon: ClipboardList, count: stats?.pendingRegistrations },
          { to: '/clients', label: 'Clientes', icon: Users, count: 0 },
          { to: '/payments', label: 'Pagos', icon: CreditCard, count: stats?.pendingPayments },
        ].map(item => (
          <Link key={item.to} to={item.to} className="bg-white rounded-xl p-4 border shadow-sm flex items-center gap-3 hover:border-green-300 transition-all card-hover" style={{ borderColor: '#E5E5E8' }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#DCFCE7' }}>
              <item.icon size={16} style={{ color: '#16A34A' }} />
            </div>
            <div>
              <p className="text-base font-bold text-gray-900">{item.count ?? 0}</p>
              <p className="text-xs text-gray-400">{item.label}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
