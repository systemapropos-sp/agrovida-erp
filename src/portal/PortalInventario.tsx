import { useState } from 'react';
import { Package, Plus, Search, AlertTriangle } from 'lucide-react';

const initialItems = [
  { id: '1', name: 'Semillas de Maíz', categoria: 'Granos', cantidad: 50, unidad: 'kg', minimo: 20, precio: 5.00 },
  { id: '2', name: 'Fertilizante NPK', categoria: 'Insumos', cantidad: 8, unidad: 'sacos', minimo: 10, precio: 25.00 },
  { id: '3', name: 'Herbicida Glifosato', categoria: 'Agroquímicos', cantidad: 15, unidad: 'litros', minimo: 5, precio: 12.00 },
  { id: '4', name: 'Balanceado Bovino', categoria: 'Alimentos', cantidad: 200, unidad: 'kg', minimo: 100, precio: 0.80 },
  { id: '5', name: 'Vacuna Aftosa', categoria: 'Veterinario', cantidad: 3, unidad: 'dosis', minimo: 10, precio: 8.00 },
];

export default function PortalInventario() {
  const [items] = useState(initialItems);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  const filtered = items.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    i.categoria.toLowerCase().includes(search.toLowerCase())
  );
  const lowStock = items.filter(i => i.cantidad <= i.minimo);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Inventario</h1>
          <p className="text-sm text-gray-500">{items.length} productos registrados</p>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
          style={{ background: 'linear-gradient(135deg, #16A34A, #22C55E)' }}>
          <Plus size={15} /> Agregar
        </button>
      </div>

      {lowStock.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Stock Bajo — {lowStock.length} producto(s)</p>
            <p className="text-xs text-amber-600 mt-0.5">{lowStock.map(i => i.name).join(', ')}</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar producto o categoría..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-green-400" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-gray-100 bg-gray-50">
              {['Producto', 'Categoría', 'Cantidad', 'Unidad', 'Mín.', 'Precio/u', 'Estado'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {filtered.map((item, i) => {
                const low = item.cantidad <= item.minimo;
                return (
                  <tr key={item.id} className={`border-b border-gray-50 hover:bg-gray-50 ${i % 2 === 0 ? '' : 'bg-gray-50/30'}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#DCFCE7' }}>
                          <Package size={13} style={{ color: '#16A34A' }} />
                        </div>
                        <span className="text-sm font-medium text-gray-800">{item.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">{item.categoria}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">{item.cantidad}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{item.unidad}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{item.minimo}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">${item.precio.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${low ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {low ? 'Stock Bajo' : 'Normal'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowAdd(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Agregar Producto</h3>
            <p className="text-sm text-gray-500 mb-4">Función de agregar productos — próximamente conectada a base de datos.</p>
            <button onClick={() => setShowAdd(false)}
              className="w-full py-2 rounded-xl text-sm font-semibold text-white" style={{ background: '#16A34A' }}>
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
