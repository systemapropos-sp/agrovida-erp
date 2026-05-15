import { create } from 'zustand';
import type { Toast } from '@/types';
import { supabase } from '@/lib/supabase';

interface Notification {
  id: string; title: string; message: string; read: boolean;
  createdAt: string; type: 'payment' | 'alert' | 'info' | 'registration';
}

const DISMISSED_KEY = 'av_dismissed_notifications';
function getDismissedIds(): Set<string> {
  try { const raw = localStorage.getItem(DISMISSED_KEY); return new Set(raw ? JSON.parse(raw) : []); } catch { return new Set(); }
}
function saveDismissedId(id: string): void {
  try { const s = getDismissedIds(); s.add(id); localStorage.setItem(DISMISSED_KEY, JSON.stringify([...s].slice(-200))); } catch { /* ignore */ }
}

interface UIState {
  sidebarCollapsed: boolean; sidebarHovered: boolean; toasts: Toast[];
  notifications: Notification[]; unreadCount: number; notificationsLoaded: boolean;
  toggleSidebar: () => void; setSidebarHovered: (v: boolean) => void;
  showToast: (t: Omit<Toast, 'id'>) => void; removeToast: (id: string) => void;
  generateNotifications: () => Promise<void>;
  markNotificationRead: (id: string) => void; markAllRead: () => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  sidebarCollapsed: true, sidebarHovered: false, toasts: [],
  notifications: [], unreadCount: 0, notificationsLoaded: false,

  toggleSidebar: () => set(s => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setSidebarHovered: (v) => set({ sidebarHovered: v }),

  showToast: (toast) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    set(s => ({ toasts: [...s.toasts, { ...toast, id }] }));
    setTimeout(() => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })), 4000);
  },
  removeToast: (id) => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })),

  generateNotifications: async () => {
    if (get().notificationsLoaded) return;
    try {
      const dismissed = getDismissedIds();
      const notifs: Notification[] = [];

      // Pending registrations
      const { data: regs } = await supabase.from('av_registrations').select('id, business_name, created_at').eq('status', 'pending').order('created_at', { ascending: false }).limit(5);
      (regs || []).forEach(r => {
        notifs.push({ id: `reg-${r.id}`, title: `Nueva solicitud: ${r.business_name}`, message: `Requiere aprobación`, read: false, createdAt: r.created_at, type: 'registration' });
      });

      // Overdue clients
      const { data: clients } = await supabase.from('av_clients').select('id, name, monthly_rent, last_payment_date, created_at').eq('status', 'overdue').limit(5);
      (clients || []).forEach(c => {
        notifs.push({ id: `ovd-${c.id}`, title: `Pago atrasado: ${c.name}`, message: `Renta $${Number(c.monthly_rent).toLocaleString()}/mes`, read: false, createdAt: c.last_payment_date || c.created_at, type: 'alert' });
      });

      notifs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      const final = notifs.filter(n => !dismissed.has(n.id)).slice(0, 15);
      set({ notifications: final, unreadCount: final.length, notificationsLoaded: true });
    } catch {
      set({ notifications: [], unreadCount: 0, notificationsLoaded: true });
    }
  },

  markNotificationRead: (id) => {
    saveDismissedId(id);
    set(s => ({ notifications: s.notifications.filter(n => n.id !== id), unreadCount: Math.max(0, s.unreadCount - 1) }));
  },
  markAllRead: () => {
    get().notifications.forEach(n => saveDismissedId(n.id));
    set({ notifications: [], unreadCount: 0 });
  },
}));
