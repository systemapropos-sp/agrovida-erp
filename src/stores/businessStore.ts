import { create } from 'zustand';
import type { Business, BusinessFilters } from '@/types';
import * as api from '@/lib/supabaseApi';

interface BusinessState {
  businesses: Business[]; selectedBusiness: Business | null;
  filters: BusinessFilters; isLoading: boolean; error: string | null;
  fetchBusinesses: () => Promise<void>;
  createBusiness: (data: Omit<Business, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateBusiness: (id: string, data: Partial<Business>) => Promise<void>;
  deleteBusiness: (id: string) => Promise<void>;
  setSelectedBusiness: (b: Business | null) => void;
  setFilters: (f: Partial<BusinessFilters>) => void;
  getFilteredBusinesses: () => Business[];
}

export const useBusinessStore = create<BusinessState>((set, get) => ({
  businesses: [], selectedBusiness: null, filters: { status: 'all', search: '' }, isLoading: false, error: null,
  fetchBusinesses: async () => {
    set({ isLoading: true, error: null });
    try { const businesses = await api.getBusinesses(); set({ businesses, isLoading: false }); }
    catch (err) { set({ error: err instanceof Error ? err.message : 'Error', isLoading: false }); }
  },
  createBusiness: async (data) => {
    set({ isLoading: true, error: null });
    try { const b = await api.createBusiness(data); set(s => ({ businesses: [b, ...s.businesses], isLoading: false })); }
    catch (err) { set({ error: err instanceof Error ? err.message : 'Error', isLoading: false }); throw err; }
  },
  updateBusiness: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await api.updateBusiness(id, data);
      set(s => ({ businesses: s.businesses.map(b => b.id === id ? updated : b), selectedBusiness: s.selectedBusiness?.id === id ? updated : s.selectedBusiness, isLoading: false }));
    } catch (err) { set({ error: err instanceof Error ? err.message : 'Error', isLoading: false }); }
  },
  deleteBusiness: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await api.deleteBusiness(id);
      set(s => ({ businesses: s.businesses.filter(b => b.id !== id), selectedBusiness: s.selectedBusiness?.id === id ? null : s.selectedBusiness, isLoading: false }));
    } catch (err) { set({ error: err instanceof Error ? err.message : 'Error', isLoading: false }); }
  },
  setSelectedBusiness: (b) => set({ selectedBusiness: b }),
  setFilters: (f) => set(s => ({ filters: { ...s.filters, ...f } })),
  getFilteredBusinesses: () => {
    const { businesses, filters } = get();
    return businesses.filter(b => {
      const ms = filters.status === 'all' || b.status === filters.status;
      const sl = filters.search.toLowerCase();
      const mq = !filters.search || b.name.toLowerCase().includes(sl) || b.domain.toLowerCase().includes(sl) || b.email.toLowerCase().includes(sl);
      return ms && mq;
    });
  },
}));
