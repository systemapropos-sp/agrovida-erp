import { create } from 'zustand';
import type { User } from '@/types';
import * as api from '@/lib/supabaseApi';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (usernameOrEmail: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null, isAuthenticated: false, isLoading: true, error: null,
  login: async (usernameOrEmail, password) => {
    set({ isLoading: true, error: null });
    try {
      const { user } = await api.login(usernameOrEmail, password);
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Error desconocido', isLoading: false });
    }
  },
  logout: async () => { await api.logout(); set({ user: null, isAuthenticated: false, error: null }); },
  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const user = await api.getCurrentUser();
      set({ user, isAuthenticated: !!user, isLoading: false });
    } catch { set({ user: null, isAuthenticated: false, isLoading: false }); }
  },
}));
