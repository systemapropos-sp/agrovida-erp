import { BarChart3, TrendingUp, Download } from 'lucide-react';

export default function PortalReportes() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Reportes</h1>
          <p className="text-sm text-gray-500">Análisis de tu operación agrícola</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50">
          <Download size={15} /> Exportar
        </button>
      </div>

      {/* Quick reports */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { title: 'Ventas del Mes', value: '$0.00', change: '0%', color: '#16A34A' },
          { title: 'Gastos del Mes', value: '$0.00', change: '0%', color: '#DC2626' },
          { title: 'Utilidad Neta', value: '$0.00', change: '0%', color: '#2563EB' },
        ].map(({ title, value, change, color }) => (
          <div key={title} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500 mb-1">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp size={12} style={{ color }} />
              <span className="text-xs font-medium" style={{ color }}>{change} vs mes anterior</span>
            </div>
          </div>
        ))}
      </div>

      {/* Placeholder chart */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 size={18} className="text-green-600" />
          <h2 className="text-sm font-semibold text-gray-700">Ventas Mensuales</h2>
        </div>
        <div className="h-48 flex items-end justify-around gap-2">
          {['Ene','Feb','Mar','Abr','May','Jun'].map((m, i) => (
            <div key={m} className="flex flex-col items-center gap-1 flex-1">
              <div className="w-full rounded-t-lg" style={{ height: `${(i + 1) * 12 + 20}px`, background: 'linear-gradient(180deg, #22C55E, #16A34A)', opacity: 0.3 + i * 0.1 }} />
              <span className="text-xs text-gray-500">{m}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-center text-gray-400 mt-3">Conecta a Supabase para ver datos reales</p>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
        <p className="text-sm font-semibold text-blue-800">📊 Módulo de Reportes Avanzados</p>
        <p className="text-xs text-blue-600 mt-1">Los reportes detallados de cultivos, ganados, ventas e inventario estarán disponibles conforme el sistema se conecta a tu base de datos.</p>
      </div>
    </div>
  );
}
