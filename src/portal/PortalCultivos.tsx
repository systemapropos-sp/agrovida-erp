import { useState } from 'react';
import { Wheat, Plus, Calendar, MapPin, Droplets, TrendingUp } from 'lucide-react';

const cultivos = [
  { id: '1', nombre: 'Maíz Amarillo', area: '3.5 ha', etapa: 'Crecimiento', siembra: '2025-03-01', cosecha: '2025-07-01', humedad: 65, progreso: 60 },
  { id: '2', nombre: 'Frijol Negro', area: '1.2 ha', etapa: 'Floración', siembra: '2025-04-10', cosecha: '2025-07-20', humedad: 72, progreso: 45 },
  { id: '3', nombre: 'Tomate Cherry', area: '0.8 ha', etapa: 'Cosecha', siembra: '2025-02-15', cosecha: '2025-05-30', humedad: 80, progreso: 95 },
];

const etapaColor: Record<string, string> = {
  'Preparación': '#6B7280', 'Siembra': '#2563EB', 'Germinación': '#7C3AED',
  'Crecimiento': '#16A34A', 'Floración': '#D97706', 'Cosecha': '#DC2626', 'Completado': '#059669',
};

export default function PortalCultivos() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Cultivos</h1>
          <p className="text-sm text-gray-500">Gestión de lotes y cultivos activos</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
          style={{ background: 'linear-gradient(135deg, #16A34A, #22C55E)' }}>
          <Plus size={15} /> Nuevo Cultivo
        </button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Cultivos Activos', value: cultivos.length, icon: Wheat, color: '#16A34A', bg: '#DCFCE7' },
          { label: 'Área Total', value: '5.5 ha', icon: MapPin, color: '#2563EB', bg: '#DBEAFE' },
          { label: 'En Cosecha', value: cultivos.filter(c => c.etapa === 'Cosecha').length, icon: TrendingUp, color: '#D97706', bg: '#FEF3C7' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mx-auto mb-2" style={{ background: bg }}>
              <Icon size={16} style={{ color }} />
            </div>
            <p className="text-xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Cultivos list */}
      <div className="space-y-3">
        {cultivos.map(c => (
          <div key={c.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-gray-900">{c.nombre}</h3>
                <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><MapPin size={11} />{c.area}</span>
                  <span className="flex items-center gap-1"><Calendar size={11} />Cosecha: {c.cosecha}</span>
                  <span className="flex items-center gap-1"><Droplets size={11} />{c.humedad}% humedad</span>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold text-white" style={{ background: etapaColor[c.etapa] || '#6B7280' }}>
                {c.etapa}
              </span>
            </div>
            {/* Progress bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Progreso del ciclo</span>
                <span>{c.progreso}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${c.progreso}%`, background: 'linear-gradient(90deg, #16A34A, #22C55E)' }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Nuevo Cultivo</h3>
            <p className="text-sm text-gray-500 mb-4">Formulario de registro de cultivos — próximamente conectado a base de datos.</p>
            <button onClick={() => setShowForm(false)}
              className="w-full py-2 rounded-xl text-sm font-semibold text-white" style={{ background: '#16A34A' }}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
}
