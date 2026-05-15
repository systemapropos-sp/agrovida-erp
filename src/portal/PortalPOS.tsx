import { useState } from 'react';
import { ShoppingCart, Plus, Trash2, DollarSign, Search } from 'lucide-react';

interface CartItem { id: string; name: string; price: number; qty: number; }

const sampleProducts = [
  { id: '1', name: 'Maíz (50 kg)', price: 45.00, category: 'Granos' },
  { id: '2', name: 'Frijoles Negros (25 kg)', price: 38.00, category: 'Legumbres' },
  { id: '3', name: 'Leche Entera (1L)', price: 1.50, category: 'Lácteos' },
  { id: '4', name: 'Queso Fresco (kg)', price: 8.00, category: 'Lácteos' },
  { id: '5', name: 'Huevos (docena)', price: 3.50, category: 'Aves' },
  { id: '6', name: 'Tomates (kg)', price: 2.00, category: 'Vegetales' },
  { id: '7', name: 'Pimientos (kg)', price: 3.00, category: 'Vegetales' },
  { id: '8', name: 'Plátano (racimo)', price: 5.00, category: 'Frutas' },
];

export default function PortalPOS() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState('');
  const [paid, setPaid] = useState(false);

  const filtered = sampleProducts.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

  const addItem = (p: typeof sampleProducts[0]) => {
    setCart(c => {
      const ex = c.find(i => i.id === p.id);
      if (ex) return c.map(i => i.id === p.id ? { ...i, qty: i.qty + 1 } : i);
      return [...c, { id: p.id, name: p.name, price: p.price, qty: 1 }];
    });
  };

  const removeItem = (id: string) => setCart(c => c.filter(i => i.id !== id));
  const updateQty = (id: string, qty: number) => {
    if (qty <= 0) return removeItem(id);
    setCart(c => c.map(i => i.id === id ? { ...i, qty } : i));
  };

  const handleSale = () => { setPaid(true); setTimeout(() => { setCart([]); setPaid(false); }, 2500); };

  return (
    <div className="h-full flex flex-col lg:flex-row gap-4">
      {/* Products */}
      <div className="flex-1 flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900 mb-3">Punto de Venta</h2>
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar producto..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-green-400" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {filtered.map(p => (
            <button key={p.id} onClick={() => addItem(p)}
              className="text-left p-3 rounded-xl border border-gray-100 hover:border-green-300 hover:bg-green-50 transition-all">
              <p className="text-xs font-semibold text-gray-800 leading-tight">{p.name}</p>
              <p className="text-xs text-gray-400 mt-0.5">{p.category}</p>
              <p className="text-sm font-bold mt-1" style={{ color: '#16A34A' }}>${p.price.toFixed(2)}</p>
              <div className="mt-2 flex items-center gap-1 text-xs text-green-600 font-medium">
                <Plus size={12} /> Agregar
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Cart */}
      <div className="w-full lg:w-80 flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center gap-2">
          <ShoppingCart size={16} className="text-green-600" />
          <h3 className="font-bold text-gray-900">Carrito ({cart.length})</h3>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {cart.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <ShoppingCart size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-xs">Agrega productos al carrito</p>
            </div>
          )}
          {cart.map(item => (
            <div key={item.id} className="flex items-center gap-2 p-2 rounded-xl bg-gray-50">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-800 truncate">{item.name}</p>
                <p className="text-xs text-green-600">${item.price.toFixed(2)}</p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => updateQty(item.id, item.qty - 1)} className="w-6 h-6 rounded-lg bg-gray-200 text-gray-700 text-xs font-bold flex items-center justify-center hover:bg-gray-300">-</button>
                <span className="text-xs font-bold w-5 text-center">{item.qty}</span>
                <button onClick={() => updateQty(item.id, item.qty + 1)} className="w-6 h-6 rounded-lg text-white text-xs font-bold flex items-center justify-center" style={{ background: '#16A34A' }}>+</button>
              </div>
              <button onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-600"><Trash2 size={13} /></button>
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-gray-100">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-semibold text-gray-600">Total</span>
            <span className="text-xl font-bold text-gray-900">${total.toFixed(2)}</span>
          </div>
          {paid ? (
            <div className="w-full py-3 rounded-xl text-center text-sm font-bold text-white bg-blue-500">✅ ¡Venta Registrada!</div>
          ) : (
            <button onClick={handleSale} disabled={cart.length === 0}
              className="w-full py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-opacity disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg, #16A34A, #22C55E)' }}>
              <DollarSign size={15} /> Cobrar ${total.toFixed(2)}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
