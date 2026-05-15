import { useEffect, useState } from 'react';
import { Users, Plus, Search, Pencil, Trash2 } from 'lucide-react';
import { getClients, createClient, updateClient, deleteClient } from '@/lib/supabaseApi';
import { useUIStore } from '@/stores/uiStore';
import type { Client, ClientStatus } from '@/types';
import { formatCurrency } from '@/lib/utils';

const STATUS_CFG: Record<ClientStatus, { label: string; bg: string; color: string }> = {
  active: { label: 'Activo', bg: '#DCFCE7', color: '#16A34A' },
  inactive: { label: 'Inactivo', bg: '#F4F4F5', color: '#71717A' },
  overdue: { label: 'Atrasado', bg: '#FEF2F2', color: '#DC2626' },
};

export default function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [form, setForm] = useState({ name: '', contactName: '', email: '', phone: '', address: '', rnc: '', monthlyRent: 0, licenseCount: 1, businessId: '', status: 'active' as ClientStatus, notes: '', lastPaymentDate: null as string | null });
  const { showToast } = useUIStore();

  const load = async () => { setLoading(true); const data = await getClients(); setClients(data); setLoading(false); };
  useEffect(() => { load(); }, []);

  const openEdit = (c: Client) => {
    setEditing(c);
    setForm({ name: c.name, contactName: c.contactName, email: c.email, phone: c.phone, address: c.address, rnc: c.rnc, monthlyRent: c.monthlyRent, licenseCount: c.licenseCount, businessId: c.businessId, status: c.status, notes: c.notes, lastPaymentDate: c.lastPaymentDate });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) { await updateClient(editing.id, form); showToast({ type: 'success', title: 'Cliente actualizado' }); }
      else { await createClient(form); showToast({ type: 'success', title: 'Cliente creado' }); }
      setShowModal(false); load();
    } catch (err) { showToast({ type: 'error', title: err instanceof Error ? err.message : 'Error' }); }
  };

  const handleDelete = async (c: Client) => {
    if (!confirm(`¿Eliminar cliente "${c.name}"?`)) return;
    await deleteClient(c.id);
    showToast({ type: 'success', title: 'Cliente eliminado' });
    load();
  };

  const filtered = clients.filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Clientes</h2>
          <p className="text-sm text-gray-400 mt-0.5">{clients.length} clientes registrados</p>
        </div>
        <button onClick={() => { setEditing(null); setForm({ name: '', contactName: '', email: '', phone: '', address: '', rnc: '', monthlyRent: 0, licenseCount: 1, businessId: '', status: 'active', notes: '', lastPaymentDate: null }); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold" style={{ background: 'linear-gradient(135deg, #16A34A, #22C55E)' }}>
          <Plus size={16} /> Nuevo Cliente
        </button>
      </div>

      <div className="relative mb-5">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar clientes..."
          className="w-full max-w-xs pl-9 pr-4 py-2 rounded-xl border text-sm outline-none" style={{ backgroundColor: '#F9FAFB', borderColor: '#E5E5E8' }} />
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-16 rounded-xl shimmer" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <Users size={40} className="mb-3 opacity-30" />
          <p className="text-sm">No hay clientes registrados</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(c => {
            const s = STATUS_CFG[c.status];
            return (
              <div key={c.id} className="bg-white rounded-xl p-4 border shadow-sm flex items-center gap-4" style={{ borderColor: '#E5E5E8' }}>
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0" style={{ background: 'linear-gradient(135deg, #16A34A, #22C55E)' }}>
                  {c.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{c.name}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: s.bg, color: s.color }}>{s.label}</span>
                  </div>
                  <div className="text-xs text-gray-400 flex gap-3">
                    {c.email && <span>{c.email}</span>}
                    {c.phone && <span>{c.phone}</span>}
                    <span className="text-green-600 font-medium">{formatCurrency(c.monthlyRent)}/mes</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => openEdit(c)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"><Pencil size={15} /></button>
                  <button onClick={() => handleDelete(c)} className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={15} /></button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl border max-h-[90vh] overflow-y-auto" style={{ borderColor: '#E5E5E8' }}>
            <h3 className="font-bold text-gray-900 mb-4">{editing ? 'Editar Cliente' : 'Nuevo Cliente'}</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-semibold text-gray-700 mb-1">Nombre *</label><input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required className="w-full px-3 py-2 rounded-xl border text-sm outline-none" style={{ backgroundColor: '#F9FAFB', borderColor: '#E5E5E8' }} /></div>
                <div><label className="block text-xs font-semibold text-gray-700 mb-1">Contacto</label><input value={form.contactName} onChange={e => setForm(f => ({ ...f, contactName: e.target.value }))} className="w-full px-3 py-2 rounded-xl border text-sm outline-none" style={{ backgroundColor: '#F9FAFB', borderColor: '#E5E5E8' }} /></div>
                <div><label className="block text-xs font-semibold text-gray-700 mb-1">Email</label><input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="w-full px-3 py-2 rounded-xl border text-sm outline-none" style={{ backgroundColor: '#F9FAFB', borderColor: '#E5E5E8' }} /></div>
                <div><label className="block text-xs font-semibold text-gray-700 mb-1">Teléfono</label><input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="w-full px-3 py-2 rounded-xl border text-sm outline-none" style={{ backgroundColor: '#F9FAFB', borderColor: '#E5E5E8' }} /></div>
                <div><label className="block text-xs font-semibold text-gray-700 mb-1">Renta Mensual ($)</label><input type="number" min="0" value={form.monthlyRent} onChange={e => setForm(f => ({ ...f, monthlyRent: Number(e.target.value) }))} className="w-full px-3 py-2 rounded-xl border text-sm outline-none" style={{ backgroundColor: '#F9FAFB', borderColor: '#E5E5E8' }} /></div>
                <div><label className="block text-xs font-semibold text-gray-700 mb-1">Estado</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as ClientStatus }))} className="w-full px-3 py-2 rounded-xl border text-sm outline-none" style={{ backgroundColor: '#F9FAFB', borderColor: '#E5E5E8' }}>
                    <option value="active">Activo</option><option value="inactive">Inactivo</option><option value="overdue">Atrasado</option>
                  </select>
                </div>
              </div>
              <div><label className="block text-xs font-semibold text-gray-700 mb-1">Notas</label><textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} className="w-full px-3 py-2 rounded-xl border text-sm outline-none resize-none" style={{ backgroundColor: '#F9FAFB', borderColor: '#E5E5E8' }} /></div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold" style={{ background: 'linear-gradient(135deg, #16A34A, #22C55E)' }}>{editing ? 'Guardar' : 'Crear'}</button>
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 bg-gray-100">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
