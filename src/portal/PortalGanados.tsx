import { useState } from 'react';
import { Beef, Plus, Heart, AlertCircle } from 'lucide-react';

const ganados = [
  { id: '1', nombre: 'Lote Bovinos A', especie: 'Bovino', cantidad: 24, peso_avg: 380, estado: 'Saludable', color: '#16A34A' },
  { id: '2', nombre: 'Porcinos 1', especie: 'Porcino', cantidad: 12, peso_avg: 95, estado: 'En Tratamiento', color: '#D97706' },
  { id: '3', nombre: 'Aves Ponedoras', especie: 'Avícola', cantidad: 200, peso_avg: 2, estado: 'Saludable', color: '#16A34A' },
  { id: '4', nombre: 'Ovinos B', especie: 'Ovino', cantidad: 18, peso_avg: 55, estado: 'Saludable', color: '#16A34A' },
];

const events = [
  { id: 1, tipo: 'Vacunación', lote: 'Lote Bovinos A', fecha: '2025-05-10', desc: 'Vacuna aftosa aplicada' },
  { id: 2, tipo: 'Tratamiento', lote: 'Porcinos 1', fecha: '2025-05-12', desc: 'Antibiótico por infección respiratoria' },
  { id: 3, tipo: 'Pesaje', lote: 'Ovinos B', fecha: '2025-05-14', desc: 'Peso promedio: 55 kg' },
];

export default function PortalGanados() {
  const [showForm, setShowForm] = useState(false);
  const total = ganados.reduce((s, g) => s + g.cantidad, 0);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Ganados</h1>
          <p className="text-sm text-gray-500">{total} animales en {ganados.length} lotes</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
          style={{ background: 'linear-gradient(135deg, #16A34A, #22C55E)' }}>
          <Plus size={15} /> Nuevo Lote
        </button>
      </div>

      {/* Lotes grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {ganados.map(g => (
          <div key={g.id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#DCFCE7' }}>
                <Beef size={18} style={{ color: '#16A34A' }} />
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${g.estado === 'Saludable' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                {g.estado}
              </span>
            </div>
            <h3 className="font-semibold text-gray-900 text-sm">{g.nombre}</h3>
            <p className="text-xs text-gray-500 mt-0.5">{g.especie}</p>
            <div className="mt-3 flex items-center justify-between text-sm">
              <div>
                <p className="text-lg font-bold text-gray-900">{g.cantidad}</p>
                <p className="text-xs text-gray-500">animales</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-700">{g.peso_avg} kg</p>
                <p className="text-xs text-gray-500">peso prom.</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Events log */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700">Eventos Recientes</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {events.map(e => (
            <div key={e.id} className="flex items-center gap-3 p-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-green-50">
                {e.tipo === 'Tratamiento' ? <AlertCircle size={14} className="text-amber-500" /> : <Heart size={14} className="text-green-600" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800">{e.tipo} — {e.lote}</p>
                <p className="text-xs text-gray-500">{e.desc}</p>
              </div>
              <p className="text-xs text-gray-400 flex-shrink-0">{e.fecha}</p>
            </div>
          ))}
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Nuevo Lote</h3>
            <p className="text-sm text-gray-500 mb-4">Registro de lotes de ganado — próximamente conectado a base de datos.</p>
            <button onClick={() => setShowForm(false)}
              className="w-full py-2 rounded-xl text-sm font-semibold text-white" style={{ background: '#16A34A' }}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
}
