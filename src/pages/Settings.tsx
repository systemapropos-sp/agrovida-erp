import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Bell, Save, Sprout, ExternalLink } from 'lucide-react';
import { getSettings, updateSettings, type AppSettings } from '@/lib/supabaseApi';
import { useUIStore } from '@/stores/uiStore';

export default function Settings() {
  const [settings, setSettings] = useState<AppSettings>({ notifyPaymentReceived: true, notifyPaymentOverdue: true, notifyTrialExpiring: true, notifyNewRegistration: true });
  const [saving, setSaving] = useState(false);
  const { showToast } = useUIStore();

  useEffect(() => { getSettings().then(setSettings); }, []);

  const handleSave = async () => {
    setSaving(true);
    try { await updateSettings(settings); showToast({ type: 'success', title: 'Configuración guardada' }); }
    catch { showToast({ type: 'error', title: 'Error al guardar' }); }
    finally { setSaving(false); }
  };

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
    <button type="button" onClick={() => onChange(!checked)}
      className="w-11 h-6 rounded-full transition-colors flex-shrink-0"
      style={{ backgroundColor: checked ? '#16A34A' : '#E5E7EB' }}>
      <div className="w-5 h-5 rounded-full bg-white shadow transition-transform mx-0.5" style={{ transform: checked ? 'translateX(20px)' : 'translateX(0)' }} />
    </button>
  );

  return (
    <div className="max-w-2xl space-y-6">
      {/* Info Panel */}
      <div className="bg-white rounded-2xl p-6 border shadow-sm" style={{ borderColor: '#E5E5E8' }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #16A34A, #22C55E)' }}>
            <Sprout size={18} className="text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">AgroVida ERP</h3>
            <p className="text-xs text-gray-400">Sistema de Gestión Agrícola SaaS</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="p-3 rounded-xl" style={{ backgroundColor: '#F9FAFB' }}>
            <p className="text-xs text-gray-400 mb-0.5">Super Admin</p>
            <p className="font-medium text-gray-900">smartboys</p>
          </div>
          <div className="p-3 rounded-xl" style={{ backgroundColor: '#F9FAFB' }}>
            <p className="text-xs text-gray-400 mb-0.5">Dominio</p>
            <a href="https://agrovidapro.com" target="_blank" rel="noreferrer" className="font-medium text-green-600 flex items-center gap-1 hover:text-green-700">
              agrovidapro.com <ExternalLink size={12} />
            </a>
          </div>
          <div className="p-3 rounded-xl" style={{ backgroundColor: '#F9FAFB' }}>
            <p className="text-xs text-gray-400 mb-0.5">Email de Notificaciones</p>
            <p className="font-medium text-gray-900">systemapropos@gmail.com</p>
          </div>
          <div className="p-3 rounded-xl" style={{ backgroundColor: '#F9FAFB' }}>
            <p className="text-xs text-gray-400 mb-0.5">Versión</p>
            <p className="font-medium text-gray-900">1.0.0</p>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-2xl p-6 border shadow-sm" style={{ borderColor: '#E5E5E8' }}>
        <div className="flex items-center gap-2 mb-5">
          <Bell size={16} style={{ color: '#16A34A' }} />
          <h3 className="font-semibold text-gray-900">Notificaciones por Email</h3>
        </div>
        <div className="space-y-4">
          {[
            { key: 'notifyNewRegistration' as const, label: 'Nueva solicitud de registro', desc: 'Recibir email cuando un cliente se registre' },
            { key: 'notifyPaymentReceived' as const, label: 'Pago recibido', desc: 'Notificar cuando se registre un pago completado' },
            { key: 'notifyPaymentOverdue' as const, label: 'Pago atrasado', desc: 'Alerta cuando un cliente tenga pagos pendientes' },
            { key: 'notifyTrialExpiring' as const, label: 'Período de prueba por vencer', desc: 'Recordatorio 3 días antes de que expire la prueba' },
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between py-3 border-b last:border-0" style={{ borderColor: '#F0F0F1' }}>
              <div>
                <p className="text-sm font-medium text-gray-900">{item.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
              </div>
              <Toggle checked={settings[item.key]} onChange={v => setSettings(s => ({ ...s, [item.key]: v }))} />
            </div>
          ))}
        </div>
        <button onClick={handleSave} disabled={saving}
          className="mt-5 flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, #16A34A, #22C55E)' }}>
          <Save size={15} /> {saving ? 'Guardando...' : 'Guardar Configuración'}
        </button>
      </div>

      {/* Registration Info */}
      <div className="bg-white rounded-2xl p-6 border shadow-sm" style={{ borderColor: '#E5E5E8' }}>
        <div className="flex items-center gap-2 mb-4">
          <SettingsIcon size={16} style={{ color: '#16A34A' }} />
          <h3 className="font-semibold text-gray-900">Información del Sistema</h3>
        </div>
        <div className="space-y-3 text-sm">
          <div className="p-4 rounded-xl" style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0' }}>
            <p className="text-xs font-semibold text-green-800 mb-1">🌱 Flujo de Registro de Clientes</p>
            <ol className="text-xs text-green-700 space-y-1 list-decimal list-inside">
              <li>Cliente visita <strong>/registro</strong> y completa el formulario</li>
              <li>Se envía email de notificación a <strong>systemapropos@gmail.com</strong></li>
              <li>Admin revisa la solicitud en <strong>Solicitudes de Registro</strong></li>
              <li>Admin aprueba o rechaza con nota</li>
              <li>El cliente puede ser creado como negocio activo</li>
            </ol>
          </div>
          <p className="text-xs text-gray-400">Los datos se almacenan en Supabase con RLS habilitado. Las notificaciones requieren la Edge Function <code>send-notification</code> configurada.</p>
        </div>
      </div>
    </div>
  );
}
