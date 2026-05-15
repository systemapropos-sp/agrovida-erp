import { useEffect, useState } from 'react';
import { ClipboardList, CheckCircle, XCircle, Clock, Eye, Trash2, KeyRound, Copy } from 'lucide-react';
import { getRegistrations, updateRegistrationStatus, deleteRegistration, approveRegistration } from '@/lib/supabaseApi';
import { useUIStore } from '@/stores/uiStore';
import type { Registration } from '@/types';

const statusConfig = {
  pending: { label: 'Pendiente', color: '#D97706', bg: '#FFFBEB', border: '#FDE68A', icon: Clock },
  approved: { label: 'Aprobado', color: '#16A34A', bg: '#DCFCE7', border: '#BBF7D0', icon: CheckCircle },
  rejected: { label: 'Rechazado', color: '#DC2626', bg: '#FEF2F2', border: '#FECACA', icon: XCircle },
};

function generatePassword() {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#&';
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export default function Registrations() {
  const [regs, setRegs] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Registration | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [password, setPassword] = useState('');
  const [approving, setApproving] = useState(false);
  const [credentials, setCredentials] = useState<{ email: string; password: string } | null>(null);
  const [rejectMode, setRejectMode] = useState(false);
  const { showToast } = useUIStore();

  const load = async () => { setLoading(true); const data = await getRegistrations(); setRegs(data); setLoading(false); };
  useEffect(() => { load(); }, []);

  const openApproveModal = (reg: Registration) => {
    setSelected(reg);
    setAdminNotes('');
    setPassword(generatePassword());
    setRejectMode(false);
    setCredentials(null);
  };

  const openRejectModal = (reg: Registration) => {
    setSelected(reg);
    setAdminNotes('');
    setPassword('');
    setRejectMode(true);
    setCredentials(null);
  };

  const handleApprove = async () => {
    if (!selected) return;
    if (!password || password.length < 6) {
      showToast({ type: 'error', title: 'La contraseña debe tener al menos 6 caracteres' });
      return;
    }
    setApproving(true);
    try {
      await approveRegistration(selected, password, adminNotes);
      setCredentials({ email: selected.email, password });
      showToast({ type: 'success', title: '✅ Negocio aprobado y usuario creado' });
      load();
    } catch (err) {
      showToast({ type: 'error', title: err instanceof Error ? err.message : 'Error al aprobar' });
    } finally {
      setApproving(false);
    }
  };

  const handleReject = async () => {
    if (!selected) return;
    try {
      await updateRegistrationStatus(selected.id, 'rejected', adminNotes);
      showToast({ type: 'success', title: '❌ Solicitud rechazada' });
      setSelected(null); setAdminNotes('');
      load();
    } catch {
      showToast({ type: 'error', title: 'Error al rechazar' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta solicitud?')) return;
    await deleteRegistration(id);
    showToast({ type: 'success', title: 'Solicitud eliminada' });
    load();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast({ type: 'success', title: 'Copiado al portapapeles' });
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
            <span key={s} className="px-3 py-1 rounded-full text-xs font-medium"
              style={{ backgroundColor: statusConfig[s as Registration['status']].bg, color: statusConfig[s as Registration['status']].color, border: `1px solid ${statusConfig[s as Registration['status']].border}` }}>
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
          <p className="text-xs mt-1">Las solicitudes aparecerán cuando un negocio complete el formulario en /register</p>
        </div>
      ) : (
        <div className="space-y-3">
          {regs.map(reg => {
            const cfg = statusConfig[reg.status];
            const Icon = cfg.icon;
            return (
              <div key={reg.id} className="bg-white rounded-xl p-5 border shadow-sm" style={{ borderColor: '#E5E5E8' }}>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #16A34A, #22C55E)' }}>
                    <ClipboardList size={18} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-semibold text-gray-900">{reg.businessName}</h3>
                      <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full"
                        style={{ backgroundColor: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
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
                    {reg.adminNotes && <p className="mt-1 text-xs font-medium" style={{ color: '#15803D' }}>📝 Nota: {reg.adminNotes}</p>}
                    <p className="mt-1.5 text-xs text-gray-300">
                      {new Date(reg.createdAt).toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {reg.status === 'pending' && (
                      <>
                        <button onClick={() => openApproveModal(reg)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-all"
                          style={{ backgroundColor: '#16A34A' }}>
                          <CheckCircle size={13} /> Aprobar
                        </button>
                        <button onClick={() => openRejectModal(reg)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-all"
                          style={{ backgroundColor: '#DC2626' }}>
                          <XCircle size={13} /> Rechazar
                        </button>
                      </>
                    )}
                    <button onClick={() => handleDelete(reg.id)}
                      className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* APPROVE MODAL */}
      {selected && !rejectMode && !credentials && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl border" style={{ borderColor: '#E5E5E8' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #16A34A, #22C55E)' }}>
                <KeyRound size={18} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Aprobar y Crear Acceso</h3>
                <p className="text-xs text-gray-500">{selected.businessName} — {selected.email}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Contraseña de acceso para el cliente *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Contraseña..."
                    className="flex-1 px-3 py-2.5 rounded-xl border text-sm outline-none font-mono"
                    style={{ backgroundColor: '#F9FAFB', borderColor: '#E5E5E8' }}
                  />
                  <button
                    onClick={() => setPassword(generatePassword())}
                    className="px-3 py-2.5 rounded-xl text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-600 whitespace-nowrap">
                    Generar
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-1">Esta contraseña es del acceso del cliente. Guárdala para enviársela.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Nota Administrativa (opcional)</label>
                <textarea value={adminNotes} onChange={e => setAdminNotes(e.target.value)} rows={2}
                  placeholder="Plan asignado, notas internas..."
                  className="w-full px-3 py-2.5 rounded-xl border text-sm resize-none outline-none"
                  style={{ backgroundColor: '#F9FAFB', borderColor: '#E5E5E8' }} />
              </div>

              <div className="p-3 rounded-xl text-xs" style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0' }}>
                <p className="text-green-700 font-medium">Al aprobar se realizará:</p>
                <ul className="mt-1 text-green-600 space-y-0.5 list-disc list-inside">
                  <li>Negocio añadido a la lista de Negocios</li>
                  <li>Usuario creado con email: <strong>{selected.email}</strong></li>
                  <li>Solicitud marcada como Aprobada</li>
                </ul>
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button
                onClick={handleApprove}
                disabled={approving || !password}
                className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-50 transition-all"
                style={{ background: 'linear-gradient(135deg, #16A34A, #22C55E)' }}>
                {approving ? 'Creando...' : '✅ Aprobar y Crear Acceso'}
              </button>
              <button onClick={() => { setSelected(null); setPassword(''); }}
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECT MODAL */}
      {selected && rejectMode && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl border" style={{ borderColor: '#E5E5E8' }}>
            <h3 className="font-bold text-gray-900 mb-1">Rechazar Solicitud</h3>
            <p className="text-sm text-gray-500 mb-4">{selected.businessName}</p>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Motivo del rechazo (opcional)</label>
              <textarea value={adminNotes} onChange={e => setAdminNotes(e.target.value)} rows={3}
                placeholder="Motivo del rechazo..."
                className="w-full px-3 py-2.5 rounded-xl border text-sm resize-none outline-none"
                style={{ backgroundColor: '#F9FAFB', borderColor: '#E5E5E8' }} />
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={handleReject}
                className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold"
                style={{ backgroundColor: '#DC2626' }}>
                ❌ Confirmar Rechazo
              </button>
              <button onClick={() => { setSelected(null); setRejectMode(false); }}
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREDENTIALS MODAL — shown after successful approval */}
      {credentials && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border" style={{ borderColor: '#BBF7D0' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#DCFCE7' }}>
                <CheckCircle size={24} style={{ color: '#16A34A' }} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">¡Negocio Aprobado!</h3>
                <p className="text-xs text-gray-500">Credenciales de acceso generadas</p>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              El negocio ya aparece en la lista de <strong>Negocios</strong>. Comparte estas credenciales con el cliente:
            </p>

            <div className="space-y-3 mb-5">
              <div className="p-3 rounded-xl flex items-center justify-between" style={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB' }}>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Email de acceso</p>
                  <p className="text-sm font-mono font-semibold text-gray-900">{credentials.email}</p>
                </div>
                <button onClick={() => copyToClipboard(credentials.email)}
                  className="p-2 rounded-lg hover:bg-gray-200 text-gray-400">
                  <Copy size={14} />
                </button>
              </div>
              <div className="p-3 rounded-xl flex items-center justify-between" style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0' }}>
                <div>
                  <p className="text-xs text-green-600 mb-0.5">Contraseña asignada</p>
                  <p className="text-sm font-mono font-bold text-green-800 tracking-wider">{credentials.password}</p>
                </div>
                <button onClick={() => copyToClipboard(credentials.password)}
                  className="p-2 rounded-lg hover:bg-green-100 text-green-600">
                  <Copy size={14} />
                </button>
              </div>
            </div>

            <p className="text-xs text-amber-600 bg-amber-50 p-3 rounded-xl border border-amber-200 mb-4">
              ⚠️ <strong>Guarda esta contraseña ahora.</strong> No podrás verla de nuevo. Envíasela al cliente por WhatsApp o email.
            </p>

            <button
              onClick={() => { setCredentials(null); setSelected(null); setPassword(''); }}
              className="w-full py-3 rounded-xl text-white text-sm font-bold"
              style={{ background: 'linear-gradient(135deg, #16A34A, #22C55E)' }}>
              Entendido ✓
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
