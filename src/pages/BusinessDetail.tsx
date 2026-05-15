import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, CreditCard, FileText, Activity } from 'lucide-react';
import { getBusinessById, getPaymentsByBusiness, getDocumentsByBusiness, getActivityLogsByBusiness } from '@/lib/supabaseApi';
import type { Business, Payment, Document, ActivityLog } from '@/types';
import { formatCurrency } from '@/lib/utils';

export default function BusinessDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [business, setBusiness] = useState<Business | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [activity, setActivity] = useState<ActivityLog[]>([]);
  const [tab, setTab] = useState<'payments' | 'documents' | 'activity'>('payments');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      getBusinessById(id),
      getPaymentsByBusiness(id),
      getDocumentsByBusiness(id),
      getActivityLogsByBusiness(id),
    ]).then(([b, p, d, a]) => {
      setBusiness(b); setPayments(p); setDocuments(d); setActivity(a);
    }).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="h-64 rounded-2xl shimmer" />;
  if (!business) return <div className="text-center py-20 text-gray-400">Negocio no encontrado</div>;

  const statusColors: Record<string, { bg: string; color: string }> = {
    active: { bg: '#DCFCE7', color: '#16A34A' }, trial: { bg: '#FFFBEB', color: '#D97706' },
    suspended: { bg: '#FEF2F2', color: '#DC2626' }, cancelled: { bg: '#F4F4F5', color: '#71717A' },
  };
  const s = statusColors[business.status] || statusColors.active;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/businesses')} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
          <ArrowLeft size={18} />
        </button>
        <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #16A34A, #22C55E)' }}>
          {business.logoUrl ? <img src={business.logoUrl} alt="" className="w-full h-full rounded-xl object-cover" /> : <Building2 size={20} className="text-white" />}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-900">{business.name}</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: s.bg, color: s.color }}>{business.status}</span>
          </div>
          <p className="text-sm text-gray-400">{business.domain} · {business.email}</p>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold" style={{ color: '#16A34A' }}>{formatCurrency(business.monthlyAmount)}/mes</p>
          <p className="text-xs text-gray-400">Ingreso mensual</p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Pagos Registrados', value: payments.length, icon: CreditCard },
          { label: 'Documentos', value: documents.length, icon: FileText },
          { label: 'Actividades', value: activity.length, icon: Activity },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-xl p-4 border shadow-sm" style={{ borderColor: '#E5E5E8' }}>
            <div className="flex items-center gap-2 mb-2">
              <stat.icon size={16} style={{ color: '#16A34A' }} />
              <span className="text-xs text-gray-400">{stat.label}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden" style={{ borderColor: '#E5E5E8' }}>
        <div className="flex border-b" style={{ borderColor: '#E5E5E8' }}>
          {(['payments', 'documents', 'activity'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className="px-5 py-3 text-sm font-medium transition-colors"
              style={{ color: tab === t ? '#16A34A' : '#9CA3AF', borderBottom: tab === t ? '2px solid #16A34A' : '2px solid transparent' }}>
              {t === 'payments' ? 'Pagos' : t === 'documents' ? 'Documentos' : 'Actividad'}
            </button>
          ))}
        </div>
        <div className="p-5">
          {tab === 'payments' && (
            payments.length === 0 ? <p className="text-sm text-gray-400 text-center py-8">Sin pagos registrados</p> :
            <div className="space-y-2">
              {payments.map(p => (
                <div key={p.id} className="flex items-center justify-between py-3 border-b last:border-0" style={{ borderColor: '#F0F0F1' }}>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{formatCurrency(p.amount)}</p>
                    <p className="text-xs text-gray-400">{new Date(p.paymentDate).toLocaleDateString('es')} · {p.paymentMethod}</p>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: p.status === 'completed' ? '#DCFCE7' : '#FEF2F2', color: p.status === 'completed' ? '#16A34A' : '#DC2626' }}>
                    {p.status}
                  </span>
                </div>
              ))}
            </div>
          )}
          {tab === 'documents' && (
            documents.length === 0 ? <p className="text-sm text-gray-400 text-center py-8">Sin documentos</p> :
            <div className="space-y-2">
              {documents.map(d => (
                <div key={d.id} className="flex items-center gap-3 py-2">
                  <FileText size={16} style={{ color: '#9CA3AF' }} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{d.name}</p>
                    <p className="text-xs text-gray-400">{d.category} · {(d.fileSize / 1024).toFixed(0)} KB</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          {tab === 'activity' && (
            activity.length === 0 ? <p className="text-sm text-gray-400 text-center py-8">Sin actividad registrada</p> :
            <div className="space-y-3">
              {activity.map(a => (
                <div key={a.id} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: '#16A34A' }} />
                  <div>
                    <p className="text-sm text-gray-900">{a.details.description}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{new Date(a.createdAt).toLocaleDateString('es')}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {business.notes && (
        <div className="bg-white rounded-xl p-4 border shadow-sm" style={{ borderColor: '#E5E5E8' }}>
          <p className="text-xs font-semibold text-gray-500 mb-1">NOTAS</p>
          <p className="text-sm text-gray-700">{business.notes}</p>
        </div>
      )}
    </div>
  );
}
