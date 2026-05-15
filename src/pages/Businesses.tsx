import { useEffect, useState } from 'react';
import { Plus, Search, Building2, Pencil, Trash2, ExternalLink } from 'lucide-react';
import { useBusinessStore } from '@/stores/businessStore';
import { useUIStore } from '@/stores/uiStore';
import type { Business, BusinessStatus } from '@/types';
import { slugify, formatCurrency } from '@/lib/utils';
import { Link } from 'react-router-dom';

const STATUS_OPTIONS: { value: BusinessStatus | 'all'; label: string; color: string; bg: string }[] = [
  { value: 'all', label: 'Todos', color: '#52525B', bg: '#F4F4F5' },
  { value: 'active', label: 'Activo', color: '#16A34A', bg: '#DCFCE7' },
  { value: 'trial', label: 'Prueba', color: '#D97706', bg: '#FFFBEB' },
  { value: 'suspended', label: 'Suspendido', color: '#DC2626', bg: '#FEF2F2' },
  { value: 'cancelled', label: 'Cancelado', color: '#71717A', bg: '#F4F4F5' },
];

const emptyForm: Omit<Business, 'id' | 'createdAt' | 'updatedAt'> = {
  name: '', slug: '', domain: '', logoUrl: '', email: '', phone: '',
  monthlyAmount: 0, status: 'trial', trialEndsAt: null, notes: '',
};

export default function Businesses() {
  const { fetchBusinesses, businesses, createBusiness, updateBusiness, deleteBusiness, filters, setFilters, getFilteredBusinesses, isLoading } = useBusinessStore();
  const { showToast } = useUIStore();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Business | null>(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => { fetchBusinesses(); }, [fetchBusinesses]);
  const filtered = getFilteredBusinesses();

  const openCreate = () => { setEditing(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (b: Business) => { setEditing(b); setForm({ name: b.name, slug: b.slug, domain: b.domain, logoUrl: b.logoUrl, email: b.email, phone: b.phone, monthlyAmount: b.monthlyAmount, status: b.status, trialEndsAt: b.trialEndsAt, notes: b.notes }); setShowModal(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form, slug: form.slug || slugify(form.name) };
    try {
      if (editing) { await updateBusiness(editing.id, payload); showToast({ type: 'success', title: 'Negocio actualizado' }); }
      else { await createBusiness(payload); showToast({ type: 'success', title: 'Negocio creado' }); }
      setShowModal(false);
    } catch (err) { showToast({ type: 'error', title: err instanceof Error ? err.message : 'Error' }); }
  };

  const handleDelete = async (b: Business) => {
    if (!confirm(`¿Eliminar "${b.name}"?`)) return;
    await deleteBusiness(b.id);
    showToast({ type: 'success', title: 'Negocio eliminado' });
  };

  const cfg = (s: BusinessStatus) => STATUS_OPTIONS.find(o => o.value === s) || STATUS_OPTIONS[0];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Negocios</h2>
          <p className="text-sm text-gray-400 mt-0.5">{businesses.length} negocio{businesses.length !== 1 ? 's' : ''} registrado{businesses.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold" style={{ background: 'linear-gradient(135deg, #16A34A, #22C55E)' }}>
          <Plus size={16} /> Nuevo Negocio
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={filters.search} onChange={e => setFilters({ search: e.target.value })} placeholder="Buscar negocios..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border text-sm outline-none" style={{ backgroundColor: '#F9FAFB', borderColor: '#E5E5E8' }} />
        </div>
        <div className="flex gap-2">
          {STATUS_OPTIONS.map(o => (
            <button key={o.value} onClick={() => setFilters({ status: o.value as typeof filters.status })}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{ backgroundColor: filters.status === o.value ? o.bg : '#F9FAFB', color: filters.status === o.value ? o.color : '#9CA3AF', border: `1px solid ${filters.status === o.value ? o.color + '40' : '#E5E5E8'}` }}>
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-20 rounded-xl shimmer" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <Building2 size={40} className="mb-3 opacity-30" />
          <p className="text-sm">{businesses.length === 0 ? 'No hay negocios registrados' : 'Sin resultados para los filtros actuales'}</p>
          <button onClick={openCreate} className="mt-4 text-xs font-semibold text-green-600 hover:text-green-700">+ Crear primer negocio</button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(b => {
            const s = cfg(b.status);
            return (
              <div key={b.id} className="bg-white rounded-xl p-4 border shadow-sm flex items-center gap-4" style={{ borderColor: '#E5E5E8' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #16A34A, #22C55E)' }}>
                  {b.logoUrl ? <img src={b.logoUrl} alt="" className="w-full h-full rounded-xl object-cover" /> : <Building2 size={18} className="text-white" />}
                </div>
                <Link to={`/businesses/${b.id}`} className="flex-1 min-w-0 hover:opacity-80 transition-opacity">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-gray-900">{b.name}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: s.bg, color: s.color }}>{s.label}</span>
                  </div>
                  <div className="flex items-center gap-4 mt-0.5 text-xs text-gray-400">
                    {b.domain && <span className="flex items-center gap-1"><ExternalLink size={10} />{b.domain}</span>}
                    {b.email && <span>{b.email}</span>}
                    <span className="font-medium text-green-600">{formatCurrency(b.monthlyAmount)}/mes</span>
                  </div>
                </Link>
                <div className="flex items-center gap-2">
                  <button onClick={() => openEdit(b)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"><Pencil size={15} /></button>
                  <button onClick={() => handleDelete(b)} className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={15} /></button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl border max-h-[90vh] overflow-y-auto" style={{ borderColor: '#E5E5E8' }}>
            <h3 className="font-bold text-gray-900 mb-4">{editing ? 'Editar Negocio' : 'Nuevo Negocio'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Nombre *</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value, slug: slugify(e.target.value) }))} required
                    className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none" style={{ backgroundColor: '#F9FAFB', borderColor: '#E5E5E8' }} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Estado</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as BusinessStatus }))}
                    className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none" style={{ backgroundColor: '#F9FAFB', borderColor: '#E5E5E8' }}>
                    {STATUS_OPTIONS.filter(o => o.value !== 'all').map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Email</label>
                  <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none" style={{ backgroundColor: '#F9FAFB', borderColor: '#E5E5E8' }} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Teléfono</label>
                  <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none" style={{ backgroundColor: '#F9FAFB', borderColor: '#E5E5E8' }} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Dominio</label>
                  <input value={form.domain} onChange={e => setForm(f => ({ ...f, domain: e.target.value }))} placeholder="negocio.com"
                    className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none" style={{ backgroundColor: '#F9FAFB', borderColor: '#E5E5E8' }} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Monto Mensual ($)</label>
                  <input type="number" min="0" value={form.monthlyAmount} onChange={e => setForm(f => ({ ...f, monthlyAmount: Number(e.target.value) }))}
                    className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none" style={{ backgroundColor: '#F9FAFB', borderColor: '#E5E5E8' }} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Notas</label>
                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2}
                  className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none resize-none" style={{ backgroundColor: '#F9FAFB', borderColor: '#E5E5E8' }} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold" style={{ background: 'linear-gradient(135deg, #16A34A, #22C55E)' }}>
                  {editing ? 'Guardar Cambios' : 'Crear Negocio'}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
