import { useState } from 'react';
import { Sprout, CheckCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createRegistration } from '@/lib/supabaseApi';
import { sendRegistrationNotification } from '@/lib/supabase';

const BUSINESS_TYPES = ['Cultivos / Granja', 'Ganadería', 'Acuicultura', 'Agroindustria', 'Exportadora', 'Cooperativa', 'Distribuidora Agrícola', 'Otro'];

export default function RegisterPage() {
  const [form, setForm] = useState({ businessName: '', contactName: '', email: '', phone: '', address: '', businessType: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await createRegistration(form);
      await sendRegistrationNotification({ businessName: form.businessName, contactName: form.contactName, email: form.email, phone: form.phone, businessType: form.businessType });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar solicitud');
    } finally { setLoading(false); }
  };

  if (success) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50">
      <div className="max-w-md w-full mx-4 bg-white rounded-2xl shadow-xl border p-10 text-center" style={{ borderColor: '#E5E7EB' }}>
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#DCFCE7' }}>
          <CheckCircle size={32} style={{ color: '#16A34A' }} />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">¡Solicitud Enviada!</h2>
        <p className="text-gray-500 text-sm mb-6">Hemos recibido tu solicitud de registro para <strong>{form.businessName}</strong>. Nuestro equipo la revisará y te notificará por email a <strong>{form.email}</strong> en las próximas 24-48 horas.</p>
        <div className="p-4 rounded-xl mb-6" style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0' }}>
          <p className="text-xs text-green-700 font-medium">✅ Tu solicitud ha sido registrada con estado <strong>Pendiente de Aprobación</strong></p>
        </div>
        <Link to="/login" className="inline-flex items-center gap-2 text-sm font-semibold text-green-600 hover:text-green-700">
          <ArrowLeft size={16} /> Volver al inicio
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 py-8 px-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3 shadow-md" style={{ background: 'linear-gradient(135deg, #16A34A, #22C55E)' }}>
            <Sprout size={22} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Solicitud de Registro</h1>
          <p className="text-sm text-gray-500 mt-1 text-center">Completa el formulario y nuestro equipo revisará tu solicitud</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border p-8" style={{ borderColor: '#E5E7EB' }}>
          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl text-sm text-red-700" style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA' }}>{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Nombre del Negocio *</label>
                <input name="businessName" value={form.businessName} onChange={handleChange} required placeholder="AgroFarm S.A."
                  className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none" style={{ backgroundColor: '#F9FAFB', borderColor: '#E5E7EB' }} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Nombre de Contacto *</label>
                <input name="contactName" value={form.contactName} onChange={handleChange} required placeholder="Juan Pérez"
                  className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none" style={{ backgroundColor: '#F9FAFB', borderColor: '#E5E7EB' }} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Email *</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="info@negocio.com"
                  className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none" style={{ backgroundColor: '#F9FAFB', borderColor: '#E5E7EB' }} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Teléfono *</label>
                <input name="phone" value={form.phone} onChange={handleChange} required placeholder="+1 809-000-0000"
                  className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none" style={{ backgroundColor: '#F9FAFB', borderColor: '#E5E7EB' }} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Tipo de Negocio *</label>
              <select name="businessType" value={form.businessType} onChange={handleChange} required
                className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none" style={{ backgroundColor: '#F9FAFB', borderColor: '#E5E7EB' }}>
                <option value="">Seleccionar...</option>
                {BUSINESS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Dirección</label>
              <input name="address" value={form.address} onChange={handleChange} placeholder="Ciudad, País"
                className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none" style={{ backgroundColor: '#F9FAFB', borderColor: '#E5E7EB' }} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Descripción del Negocio</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={3} placeholder="Describe brevemente tu negocio y qué necesitas del sistema..."
                className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none resize-none" style={{ backgroundColor: '#F9FAFB', borderColor: '#E5E7EB' }} />
            </div>

            <div className="p-3 rounded-xl text-xs text-green-700" style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0' }}>
              🌱 Al enviar esta solicitud, nuestro equipo revisará tu información y te contactará para aprobar el acceso al sistema AgroVida ERP.
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl text-white text-sm font-bold transition-all disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #16A34A, #22C55E)' }}>
              {loading ? 'Enviando solicitud...' : 'Enviar Solicitud de Registro'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-xs text-gray-400">¿Ya tienes acceso? <Link to="/login" className="text-green-600 font-semibold hover:text-green-700">Inicia sesión</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
