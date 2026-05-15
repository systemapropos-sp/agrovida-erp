import { useEffect, useState } from 'react';
import { ClipboardList, CheckCircle, XCircle, Clock, Eye, Trash2 } from 'lucide-react';
import { getRegistrations, updateRegistrationStatus, deleteRegistration } from '@/lib/supabaseApi';
import { useUIStore } from '@/stores/uiStore';
import type { Registration } from '@/types';

const statusConfig = {
  pending: { label: 'Pendiente', color: '#D97706', bg: '#FFFBEB', border: '#FDE68A', icon: Clock },
  approved: { label: 'Aprobado', color: '#16A34A', bg: '#DCFCE7', border: '#BBF7D0', icon: CheckCircle },
  rejected: { label: 'Rechazado', color: '#DC2626', bg: '#FEF2F2', border: '#FECACA', icon: XCircle },
};

export default function Registrations() {
  const [regs, setRegs] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Registration | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const { showToast } = useUIStore();

  const load = async () => { setLoading(true); const data = await getRegistrations(); setRegs(data); setLoading(false); };
  useEffect(() => { load(); }, []);

  const handleAction = async (id: string, status: Registration['status']) => {
    try {
      await updateRegistrationStatus(id, status, adminNotes);
      showToast({ type: 'success', title: status === 'approved' ? '✅ Solicitud aprobada' : '❌ Solicitud rechazada' });
      setSelected(null); setAdminNotes('');
      load();
    } catch (err) {
      showToast({ type: 'error', title: 'Error al actualizar' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta solicitud?')) return;
    await deleteRegistration(id);
    showToast({ type: 'success', title: 'Solicitud eliminada' });
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Solicitudes de Registro</h2>
          <p className="text-sm text-gray-400 mt-0.5">Negocios que solicitaron acceso al sistema</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          {['pending', 'approved', 'rejected'].map(s => (
            <span key={s} className="px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: statusConfig[s as Registration['status']].bg, color: statusConfig[s as Registration['status']].color, border: `1px solid ${statusConfig[s as Registration['status']].border}` }}>
              {regs.filter(r => r.status === s).length} {statusConfig[s as Registration['status']].label}
            </span>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-20 rounded-xl shimmer" />)}</div>
      ) : regs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <ClipboardList size={40} className="mb-3 opacity-30" />
          <p className="text-sm">No hay solicitudes registradas</p>
          <p className="text-xs mt-1">Las solicitudes aparecerán cuando un negocio complete el formulario en /registro</p>
        </div>
      ) : (
        <div className="space-y-3">
          {regs.map(reg => {
            const cfg = statusConfig[reg.status];
            const Icon = cfg.icon;
            return (
              <div key={reg.id} className="bg-white rounded-xl p-5 border shadow-sm" style={{ borderColor: '#E5E5E8' }}>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #16A34A, #22C55E)' }}>
                    <ClipboardList size={18} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-semibold text-gray-900">{reg.businessName}</h3>
                      <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full" style={{ backgroundColor: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                        <Icon size={11} /> {cfg.label}
                      </span>
                      <span className="text-xs text-gray-400">{reg.businessType}</span>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                      <span>👤 {reg.contactName}</span>
                      <span>📧 {reg.email}</span>
                      <span>📞 {reg.phone}</span>
                      {reg.address && <span>📍 {reg.address}</span>}
                    </div>
                    {reg.description && <p className="mt-2 text-xs text-gray-400 italic">"{reg.description}"</p>}
                    {reg.adminNotes && <p className="mt-1 text-xs font-medium" style={{ color: '#15803D' }}>📝 Nota admin: {reg.adminNotes}</p>}
                    <p className="mt-1.5 text-xs text-gray-300">Enviado: {new Date(reg.createdAt).toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {reg.status === 'pending' && (
                      <>
                        <button onClick={() => { setSelected(reg); setAdminNotes(''); }}
                          className="p-2 rounded-lg hover:bg-green-50 text-green-600 transition-colors" title="Revisar">
                          <Eye size={16} />
                        </button>
                        <button onClick={() => handleAction(reg.id, 'approved')}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium text-white" style={{ backgroundColor: '#16A34A' }}>
                          Aprobar
                        </button>
                        <button onClick={() => handleAction(reg.id, 'rejected')}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium text-white" style={{ backgroundColor: '#DC2626' }}>
                          Rechazar
                        </button>
                      </>
                    )}
                    <button onClick={() => handleDelete(reg.id)} className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Review Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl border" style={{ borderColor: '#E5E5E8' }}>
            <h3 className="font-bold text-gray-900 mb-1">Revisar Solicitud</h3>
            <p className="text-sm text-gray-500 mb-4">{selected.businessName}</p>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Nota Administrativa (opcional)</label>
              <textarea value={adminNotes} onChange={e => setAdminNotes(e.target.value)} rows={3} placeholder="Motivo de aprobación/rechazo..."
                className="w-full px-3 py-2.5 rounded-xl border text-sm resize-none outline-none" style={{ backgroundColor: '#F9FAFB', borderColor: '#E5E5E8' }} />
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => handleAction(selected.id, 'approved')}
                className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold" style={{ backgroundColor: '#16A34A' }}>
                ✅ Aprobar
              </button>
              <button onClick={() => handleAction(selected.id, 'rejected')}
                className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold" style={{ backgroundColor: '#DC2626' }}>
                ❌ Rechazar
              </button>
              <button onClick={() => setSelected(null)} className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
