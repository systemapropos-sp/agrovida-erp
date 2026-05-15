import { useEffect } from 'react';
import { CreditCard, Search } from 'lucide-react';
import { usePaymentStore } from '@/stores/paymentStore';
import { formatCurrency } from '@/lib/utils';

const METHOD_LABELS: Record<string, string> = { stripe: 'Stripe', paypal: 'PayPal', cash: 'Efectivo', transfer: 'Transferencia' };
const STATUS_CFG: Record<string, { bg: string; color: string }> = {
  completed: { bg: '#DCFCE7', color: '#16A34A' }, pending: { bg: '#FFFBEB', color: '#D97706' },
  failed: { bg: '#FEF2F2', color: '#DC2626' }, refunded: { bg: '#F4F4F5', color: '#71717A' },
};

export default function Payments() {
  const { fetchPayments, payments, isLoading, filters, setFilters } = usePaymentStore();
  useEffect(() => { fetchPayments(); }, [fetchPayments]);

  const filtered = payments.filter(p => {
    const ms = filters.status === 'all' || p.status === filters.status;
    const mm = filters.method === 'all' || p.paymentMethod === filters.method;
    const mq = !filters.search || p.id.includes(filters.search) || p.amount.toString().includes(filters.search);
    return ms && mm && mq;
  });

  const totalFiltered = filtered.filter(p => p.status === 'completed').reduce((s, p) => s + p.amount, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Pagos</h2>
          <p className="text-sm text-gray-400 mt-0.5">{payments.length} pagos registrados · Total cobrado: <span className="text-green-600 font-semibold">{formatCurrency(totalFiltered)}</span></p>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={filters.search} onChange={e => setFilters({ search: e.target.value })} placeholder="Buscar pagos..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border text-sm outline-none" style={{ backgroundColor: '#F9FAFB', borderColor: '#E5E5E8' }} />
        </div>
        <select value={filters.status} onChange={e => setFilters({ status: e.target.value as typeof filters.status })}
          className="px-3 py-2 rounded-xl border text-sm outline-none" style={{ backgroundColor: '#F9FAFB', borderColor: '#E5E5E8' }}>
          <option value="all">Todos los estados</option>
          <option value="completed">Completado</option>
          <option value="pending">Pendiente</option>
          <option value="failed">Fallido</option>
        </select>
        <select value={filters.method} onChange={e => setFilters({ method: e.target.value as typeof filters.method })}
          className="px-3 py-2 rounded-xl border text-sm outline-none" style={{ backgroundColor: '#F9FAFB', borderColor: '#E5E5E8' }}>
          <option value="all">Todos los métodos</option>
          <option value="cash">Efectivo</option>
          <option value="transfer">Transferencia</option>
          <option value="stripe">Stripe</option>
          <option value="paypal">PayPal</option>
        </select>
      </div>

      {isLoading ? (
        <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-14 rounded-xl shimmer" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <CreditCard size={40} className="mb-3 opacity-30" />
          <p className="text-sm">No hay pagos registrados</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden" style={{ borderColor: '#E5E5E8' }}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b" style={{ borderColor: '#F0F0F1' }}>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">FECHA</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">MONTO</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">MÉTODO</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">PERIODO</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">ESTADO</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => {
                const sc = STATUS_CFG[p.status] || STATUS_CFG.completed;
                return (
                  <tr key={p.id} className="border-b last:border-0 hover:bg-gray-50" style={{ borderColor: '#F0F0F1' }}>
                    <td className="px-5 py-3 text-gray-700">{new Date(p.paymentDate).toLocaleDateString('es')}</td>
                    <td className="px-5 py-3 font-semibold text-gray-900">{formatCurrency(p.amount)}</td>
                    <td className="px-5 py-3 text-gray-500">{METHOD_LABELS[p.paymentMethod] || p.paymentMethod}</td>
                    <td className="px-5 py-3 text-gray-400 text-xs">{p.periodStart ? `${new Date(p.periodStart).toLocaleDateString('es')} — ${new Date(p.periodEnd).toLocaleDateString('es')}` : '—'}</td>
                    <td className="px-5 py-3">
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: sc.bg, color: sc.color }}>{p.status}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
