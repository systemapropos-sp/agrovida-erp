import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { Sprout, Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function LoginPage() {
  const { login, isLoading, error } = useAuthStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(username, password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-50 relative overflow-hidden">
      {/* Floating blobs */}
      <div className="absolute top-20 left-10 w-64 h-64 rounded-full opacity-10 animate-float1" style={{ background: 'radial-gradient(circle, #16A34A, transparent)' }} />
      <div className="absolute bottom-20 right-10 w-80 h-80 rounded-full opacity-8 animate-float2" style={{ background: 'radial-gradient(circle, #22C55E, transparent)' }} />

      <div className="w-full max-w-sm mx-4 relative z-10">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border p-8" style={{ borderColor: '#E5E7EB' }}>
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3 shadow-md" style={{ background: 'linear-gradient(135deg, #16A34A, #22C55E)' }}>
              <Sprout size={28} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">AgroVida ERP</h1>
            <p className="text-sm text-gray-500 mt-1">Panel de Administración</p>
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl text-sm font-medium text-red-700 animate-shake" style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Usuario o Email</label>
              <input type="text" value={username} onChange={e => setUsername(e.target.value)} required
                placeholder="smartboys o admin@agrovidapro.com"
                className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all"
                style={{ backgroundColor: '#F9FAFB', borderColor: username ? '#16A34A' : '#E5E7EB' }}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Contraseña</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all pr-10"
                  style={{ backgroundColor: '#F9FAFB', borderColor: password ? '#16A34A' : '#E5E7EB' }}
                />
                <button type="button" tabIndex={-1} onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={isLoading || !username || !password}
              className="w-full py-2.5 rounded-xl text-white text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg, #16A34A, #22C55E)' }}>
              {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-400">¿Eres un negocio nuevo?{' '}
              <Link to="/registro" className="text-green-600 font-semibold hover:text-green-700">Regístrate aquí</Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          © 2024 AgroVida · <a href="https://agrovidapro.com" className="hover:text-green-600">agrovidapro.com</a>
        </p>
      </div>
    </div>
  );
}
