import { create } from 'zustand';
import type { Payment, PaymentFilters } from '@/types';
import * as api from '@/lib/supabaseApi';

interface PaymentState {
  payments: Payment[]; filters: PaymentFilters; isLoading: boolean; error: string | null;
  fetchPayments: () => Promise<void>;
  createPayment: (data: Omit<Payment, 'id' | 'createdAt'>) => Promise<void>;
  setFilters: (f: Partial<PaymentFilters>) => void;
}

export const usePaymentStore = create<PaymentState>((set) => ({
  payments: [], filters: { status: 'all', method: 'all', search: '', dateRange: null }, isLoading: false, error: null,
  fetchPayments: async () => {
    set({ isLoading: true, error: null });
    try { const payments = await api.getPayments(); set({ payments, isLoading: false }); }
    catch (err) { set({ error: err instanceof Error ? err.message : 'Error', isLoading: false }); }
  },
  createPayment: async (data) => {
    set({ isLoading: true, error: null });
    try { const p = await api.createPayment(data); set(s => ({ payments: [p, ...s.payments], isLoading: false })); }
    catch (err) { set({ error: err instanceof Error ? err.message : 'Error', isLoading: false }); throw err; }
  },
  setFilters: (f) => set(s => ({ filters: { ...s.filters, ...f } })),
}));
