import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';

const icons = {
  success: CheckCircle, error: XCircle, warning: AlertTriangle, info: Info,
};
const colors = {
  success: { icon: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0', progress: '#16A34A' },
  error: { icon: '#DC2626', bg: '#FEF2F2', border: '#FECACA', progress: '#DC2626' },
  warning: { icon: '#D97706', bg: '#FFFBEB', border: '#FDE68A', progress: '#D97706' },
  info: { icon: '#3B82F6', bg: '#EFF6FF', border: '#BFDBFE', progress: '#3B82F6' },
};

export default function ToastContainer() {
  const { toasts, removeToast } = useUIStore();
  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {toasts.map(toast => {
          const Icon = icons[toast.type];
          const c = colors[toast.type];
          return (
            <motion.div key={toast.id} initial={{ opacity: 0, x: 50, scale: 0.9 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, x: 50, scale: 0.9 }}
              className="pointer-events-auto w-80 rounded-xl p-4 shadow-lg relative overflow-hidden"
              style={{ backgroundColor: c.bg, border: `1px solid ${c.border}` }}>
              <div className="flex items-start gap-3">
                <Icon size={18} style={{ color: c.icon, flexShrink: 0, marginTop: 1 }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{toast.title}</p>
                  {toast.description && <p className="text-xs mt-0.5 text-gray-600">{toast.description}</p>}
                </div>
                <button onClick={() => removeToast(toast.id)} className="text-gray-400 hover:text-gray-600 transition-colors"><X size={14} /></button>
              </div>
              <div className="absolute bottom-0 left-0 h-0.5 toast-progress" style={{ backgroundColor: c.progress }} />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
