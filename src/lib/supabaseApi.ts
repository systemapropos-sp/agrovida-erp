import { supabase, supabaseAdmin } from './supabase';
import type { Business, Client, Payment, Document, ActivityLog, User, Registration } from '@/types';

// ── Mappers ────────────────────────────────────────────────
function mapBusiness(r: Record<string, unknown>): Business {
  return {
    id: r.id as string, name: (r.name as string) || '', slug: (r.slug as string) || '',
    domain: (r.domain as string) || '', logoUrl: (r.logo_url as string) || '',
    email: (r.email as string) || '', phone: (r.phone as string) || '',
    monthlyAmount: Number(r.monthly_amount) || 0,
    status: (r.status as Business['status']) || 'active',
    trialEndsAt: (r.trial_ends_at as string) || null,
    notes: (r.notes as string) || '',
    createdAt: (r.created_at as string) || new Date().toISOString(),
    updatedAt: (r.updated_at as string) || new Date().toISOString(),
  };
}

function mapRegistration(r: Record<string, unknown>): Registration {
  return {
    id: r.id as string,
    businessName: (r.business_name as string) || '',
    contactName: (r.contact_name as string) || '',
    email: (r.email as string) || '',
    phone: (r.phone as string) || '',
    address: (r.address as string) || '',
    businessType: (r.business_type as string) || '',
    description: (r.description as string) || '',
    status: (r.status as Registration['status']) || 'pending',
    adminNotes: (r.admin_notes as string) || '',
    createdAt: (r.created_at as string) || new Date().toISOString(),
    reviewedAt: (r.reviewed_at as string) || null,
  };
}

function mapClient(r: Record<string, unknown>): Client {
  return {
    id: r.id as string, businessId: (r.business_id as string) || '',
    name: (r.name as string) || '', contactName: (r.contact_name as string) || '',
    email: (r.email as string) || '', phone: (r.phone as string) || '',
    monthlyRent: Number(r.monthly_rent) || 0,
    status: (r.status as Client['status']) || 'active',
    licenseCount: Number(r.license_count) || 1,
    address: (r.address as string) || '', rnc: (r.rnc as string) || '',
    notes: (r.notes as string) || '',
    lastPaymentDate: (r.last_payment_date as string) || null,
    createdAt: (r.created_at as string) || new Date().toISOString(),
  };
}

function mapPayment(r: Record<string, unknown>): Payment {
  return {
    id: r.id as string, businessId: (r.business_id as string) || '',
    clientId: (r.client_id as string) || null,
    amount: Number(r.amount) || 0,
    paymentMethod: (r.payment_method as Payment['paymentMethod']) || 'cash',
    stripePaymentIntentId: (r.stripe_payment_intent_id as string) || null,
    paypalOrderId: (r.paypal_order_id as string) || null,
    status: (r.status as Payment['status']) || 'completed',
    paymentDate: (r.payment_date as string) || new Date().toISOString(),
    periodStart: (r.period_start as string) || '',
    periodEnd: (r.period_end as string) || '',
    receiptUrl: (r.receipt_url as string) || null,
    notes: (r.notes as string) || '',
    createdAt: (r.created_at as string) || new Date().toISOString(),
  };
}

function mapDocument(r: Record<string, unknown>): Document {
  return {
    id: r.id as string, businessId: (r.business_id as string) || '',
    name: (r.name as string) || '', filePath: (r.file_path as string) || '',
    fileType: (r.file_type as string) || '', fileSize: Number(r.file_size) || 0,
    category: (r.category as Document['category']) || 'general',
    uploadedAt: (r.uploaded_at as string) || new Date().toISOString(),
  };
}

function mapActivityLog(r: Record<string, unknown>): ActivityLog {
  return {
    id: r.id as string, businessId: (r.business_id as string) || '',
    action: (r.action as ActivityLog['action']) || 'note_added',
    details: (r.details as ActivityLog['details']) || { description: '' },
    createdAt: (r.created_at as string) || new Date().toISOString(),
  };
}

// ── AUTH ───────────────────────────────────────────────────
export async function login(usernameOrEmail: string, password: string): Promise<{ user: User; token: string }> {
  let email = usernameOrEmail;
  if (usernameOrEmail.toLowerCase() === 'smartboys') {
    email = import.meta.env.VITE_ADMIN_EMAIL || 'admin@agrovidapro.com';
  }
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message === 'Invalid login credentials' ? 'Credenciales inválidas' : error.message);
  const au = data.user;
  const isClient = (au.user_metadata?.role as string) === 'client';
  const user: User = {
    id: au.id, email: au.email || '',
    name: (au.user_metadata?.name as string) || (isClient ? 'Cliente' : 'Admin'),
    avatar: (au.user_metadata?.avatar as string) || '',
    role: isClient ? 'client' : 'super_admin',
    businessName: (au.user_metadata?.business_name as string) || '',
  };
  return { user, token: data.session?.access_token || '' };
}

export async function logout(): Promise<void> { await supabase.auth.signOut(); }

export async function getCurrentUser(): Promise<User | null> {
  const { data } = await supabase.auth.getSession();
  const session = data.session;
  if (!session) return null;
  const au = session.user;
  const isClient = (au.user_metadata?.role as string) === 'client';
  return {
    id: au.id, email: au.email || '',
    name: (au.user_metadata?.name as string) || (isClient ? 'Cliente' : 'Admin'),
    avatar: (au.user_metadata?.avatar as string) || '',
    role: isClient ? 'client' : 'super_admin',
    businessName: (au.user_metadata?.business_name as string) || '',
  };
}

// ── REGISTRATIONS (new registration workflow) ──────────────
export async function createRegistration(data: Omit<Registration, 'id' | 'createdAt' | 'status' | 'adminNotes' | 'reviewedAt'>): Promise<Registration> {
  // anon user has INSERT only — do NOT use .select() after insert to avoid 401
  const { error } = await supabase
    .from('av_registrations')
    .insert({
      business_name: data.businessName,
      contact_name: data.contactName,
      email: data.email,
      phone: data.phone,
      address: data.address,
      business_type: data.businessType,
      description: data.description,
      status: 'pending',
    });
  if (error) throw new Error(error.message);
  // Return constructed object — we don't need the DB row on the Register page
  return {
    id: '', businessName: data.businessName, contactName: data.contactName,
    email: data.email, phone: data.phone, address: data.address || '',
    businessType: data.businessType, description: data.description || '',
    status: 'pending', adminNotes: '', reviewedAt: null,
    createdAt: new Date().toISOString(),
  };
}

export async function getRegistrations(): Promise<Registration[]> {
  const { data, error } = await supabase.from('av_registrations').select('*').order('created_at', { ascending: false });
  if (error) { console.warn('[av:getRegistrations]', error.message); return []; }
  return (data || []).map(r => mapRegistration(r as Record<string, unknown>));
}

export async function getPendingRegistrationsCount(): Promise<number> {
  const { count } = await supabase.from('av_registrations').select('*', { count: 'exact', head: true }).eq('status', 'pending');
  return count || 0;
}

export async function updateRegistrationStatus(id: string, status: Registration['status'], adminNotes?: string): Promise<Registration> {
  const update: Record<string, unknown> = { status, reviewed_at: new Date().toISOString() };
  if (adminNotes !== undefined) update.admin_notes = adminNotes;
  const { data: row, error } = await supabase.from('av_registrations').update(update).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return mapRegistration(row as Record<string, unknown>);
}

export async function deleteRegistration(id: string): Promise<void> {
  const { error } = await supabase.from('av_registrations').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

/**
 * APPROVE REGISTRATION:
 * 1. Creates a Supabase Auth user (email + password) using service role
 * 2. Creates a business record in av_businesses
 * 3. Marks the registration as approved
 */
export async function approveRegistration(reg: Registration, password: string, adminNotes?: string): Promise<void> {
  // Step 1 — Create Supabase Auth user with service role (so no email confirmation required)
  const { error: userError } = await supabaseAdmin.auth.admin.createUser({
    email: reg.email,
    password,
    email_confirm: true,
    user_metadata: {
      name: reg.contactName,
      business_name: reg.businessName,
      role: 'client',
    },
  });
  // Ignore "already registered" — user might already exist
  if (userError && !userError.message.toLowerCase().includes('already registered') && !userError.message.toLowerCase().includes('already been registered')) {
    throw new Error(`Error creando usuario: ${userError.message}`);
  }

  // Step 2 — Create business record
  const baseSlug = reg.businessName.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  const slug = `${baseSlug}-${Date.now().toString(36)}`;
  const trialEndsAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  const notes = [
    `Registrado desde formulario público.`,
    `Contacto: ${reg.contactName}`,
    `Tipo: ${reg.businessType}`,
    reg.description ? `Descripción: ${reg.description}` : '',
    reg.address ? `Dirección: ${reg.address}` : '',
    adminNotes ? `Nota admin: ${adminNotes}` : '',
  ].filter(Boolean).join(' | ');

  const { error: bizError } = await supabaseAdmin.from('av_businesses').insert({
    name: reg.businessName,
    slug,
    email: reg.email,
    phone: reg.phone,
    status: 'trial',
    trial_ends_at: trialEndsAt,
    notes,
  });
  if (bizError) throw new Error(`Error creando negocio: ${bizError.message}`);

  // Step 3 — Mark registration as approved
  const update: Record<string, unknown> = {
    status: 'approved',
    reviewed_at: new Date().toISOString(),
  };
  if (adminNotes) update.admin_notes = adminNotes;
  await supabaseAdmin.from('av_registrations').update(update).eq('id', reg.id);
}

// ── BUSINESSES ─────────────────────────────────────────────
export async function getBusinesses(): Promise<Business[]> {
  const { data, error } = await supabase.from('av_businesses').select('*').order('created_at', { ascending: false });
  if (error) { console.warn('[av:getBusinesses]', error.message); return []; }
  return (data || []).map(r => mapBusiness(r as Record<string, unknown>));
}

export async function getBusinessById(id: string): Promise<Business | null> {
  const { data, error } = await supabase.from('av_businesses').select('*').eq('id', id).maybeSingle();
  if (error) { console.warn('[av:getBusinessById]', error.message); return null; }
  if (!data) return null;
  return mapBusiness(data as Record<string, unknown>);
}

export async function createBusiness(data: Omit<Business, 'id' | 'createdAt' | 'updatedAt'>): Promise<Business> {
  const { data: row, error } = await supabase.from('av_businesses').insert({
    name: data.name, slug: data.slug, domain: data.domain, logo_url: data.logoUrl,
    email: data.email, phone: data.phone, monthly_amount: data.monthlyAmount,
    status: data.status, trial_ends_at: data.trialEndsAt, notes: data.notes,
  }).select().single();
  if (error) throw new Error(error.message);
  return mapBusiness(row as Record<string, unknown>);
}

export async function updateBusiness(id: string, data: Partial<Business>): Promise<Business> {
  const update: Record<string, unknown> = {};
  if (data.name !== undefined) update.name = data.name;
  if (data.slug !== undefined) update.slug = data.slug;
  if (data.domain !== undefined) update.domain = data.domain;
  if (data.logoUrl !== undefined) update.logo_url = data.logoUrl;
  if (data.email !== undefined) update.email = data.email;
  if (data.phone !== undefined) update.phone = data.phone;
  if (data.monthlyAmount !== undefined) update.monthly_amount = data.monthlyAmount;
  if (data.status !== undefined) update.status = data.status;
  if (data.trialEndsAt !== undefined) update.trial_ends_at = data.trialEndsAt;
  if (data.notes !== undefined) update.notes = data.notes;
  const { data: row, error } = await supabase.from('av_businesses').update(update).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return mapBusiness(row as Record<string, unknown>);
}

export async function deleteBusiness(id: string): Promise<void> {
  const { error } = await supabase.from('av_businesses').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

// ── CLIENTS ────────────────────────────────────────────────
export async function getClients(): Promise<Client[]> {
  const { data, error } = await supabase.from('av_clients').select('*').order('created_at', { ascending: false });
  if (error) { console.warn('[av:getClients]', error.message); return []; }
  return (data || []).map(r => mapClient(r as Record<string, unknown>));
}

export async function getClientsByBusiness(businessId: string): Promise<Client[]> {
  const { data, error } = await supabase.from('av_clients').select('*').eq('business_id', businessId).order('created_at', { ascending: false });
  if (error) { console.warn('[av:getClientsByBusiness]', error.message); return []; }
  return (data || []).map(r => mapClient(r as Record<string, unknown>));
}

export async function createClient(data: Omit<Client, 'id' | 'createdAt'>): Promise<Client> {
  const { data: row, error } = await supabase.from('av_clients').insert({
    business_id: data.businessId, name: data.name, contact_name: data.contactName,
    email: data.email, phone: data.phone, monthly_rent: data.monthlyRent,
    status: data.status, license_count: data.licenseCount, address: data.address,
    rnc: data.rnc, notes: data.notes, last_payment_date: data.lastPaymentDate,
  }).select().single();
  if (error) throw new Error(error.message);
  return mapClient(row as Record<string, unknown>);
}

export async function updateClient(id: string, data: Partial<Client>): Promise<Client> {
  const update: Record<string, unknown> = {};
  if (data.name !== undefined) update.name = data.name;
  if (data.contactName !== undefined) update.contact_name = data.contactName;
  if (data.email !== undefined) update.email = data.email;
  if (data.phone !== undefined) update.phone = data.phone;
  if (data.monthlyRent !== undefined) update.monthly_rent = data.monthlyRent;
  if (data.status !== undefined) update.status = data.status;
  if (data.licenseCount !== undefined) update.license_count = data.licenseCount;
  if (data.address !== undefined) update.address = data.address;
  if (data.rnc !== undefined) update.rnc = data.rnc;
  if (data.notes !== undefined) update.notes = data.notes;
  if (data.lastPaymentDate !== undefined) update.last_payment_date = data.lastPaymentDate;
  const { data: row, error } = await supabase.from('av_clients').update(update).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return mapClient(row as Record<string, unknown>);
}

export async function deleteClient(id: string): Promise<void> {
  const { error } = await supabase.from('av_clients').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

// ── PAYMENTS ───────────────────────────────────────────────
export async function getPayments(): Promise<Payment[]> {
  const { data, error } = await supabase.from('av_payments').select('*').order('payment_date', { ascending: false });
  if (error) { console.warn('[av:getPayments]', error.message); return []; }
  return (data || []).map(r => mapPayment(r as Record<string, unknown>));
}

export async function getPaymentsByBusiness(businessId: string): Promise<Payment[]> {
  const { data, error } = await supabase.from('av_payments').select('*').eq('business_id', businessId).order('payment_date', { ascending: false });
  if (error) { console.warn('[av:getPaymentsByBusiness]', error.message); return []; }
  return (data || []).map(r => mapPayment(r as Record<string, unknown>));
}

export async function getPaymentsByClient(clientId: string): Promise<Payment[]> {
  const { data, error } = await supabase.from('av_payments').select('*').eq('client_id', clientId).order('payment_date', { ascending: false });
  if (error) { console.warn('[av:getPaymentsByClient]', error.message); return []; }
  return (data || []).map(r => mapPayment(r as Record<string, unknown>));
}

export async function createPayment(data: Omit<Payment, 'id' | 'createdAt'>): Promise<Payment> {
  const { data: row, error } = await supabase.from('av_payments').insert({
    business_id: data.businessId, client_id: data.clientId, amount: data.amount,
    payment_method: data.paymentMethod, stripe_payment_intent_id: data.stripePaymentIntentId,
    paypal_order_id: data.paypalOrderId, status: data.status, payment_date: data.paymentDate,
    period_start: data.periodStart, period_end: data.periodEnd, receipt_url: data.receiptUrl, notes: data.notes,
  }).select().single();
  if (error) throw new Error(error.message);
  if (data.clientId && data.status === 'completed') {
    await supabase.from('av_clients').update({ last_payment_date: data.paymentDate, status: 'active' }).eq('id', data.clientId);
  }
  return mapPayment(row as Record<string, unknown>);
}

// ── DOCUMENTS ──────────────────────────────────────────────
export async function getDocuments(): Promise<Document[]> {
  const { data, error } = await supabase.from('av_documents').select('*').order('uploaded_at', { ascending: false });
  if (error) { console.warn('[av:getDocuments]', error.message); return []; }
  return (data || []).map(r => mapDocument(r as Record<string, unknown>));
}

export async function getDocumentsByBusiness(businessId: string): Promise<Document[]> {
  const { data, error } = await supabase.from('av_documents').select('*').eq('business_id', businessId).order('uploaded_at', { ascending: false });
  if (error) { console.warn('[av:getDocumentsByBusiness]', error.message); return []; }
  return (data || []).map(r => mapDocument(r as Record<string, unknown>));
}

export async function deleteDocument(id: string): Promise<void> {
  const { error } = await supabase.from('av_documents').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

// ── ACTIVITY LOGS ──────────────────────────────────────────
export async function getActivityLogsByBusiness(businessId: string): Promise<ActivityLog[]> {
  const { data, error } = await supabase.from('av_activity_logs').select('*').eq('business_id', businessId).order('created_at', { ascending: false }).limit(50);
  if (error) { console.warn('[av:getActivityLogs]', error.message); return []; }
  return (data || []).map(r => mapActivityLog(r as Record<string, unknown>));
}

export async function addActivityLog(businessId: string, action: ActivityLog['action'], details: ActivityLog['details']): Promise<void> {
  await supabase.from('av_activity_logs').insert({ business_id: businessId, action, details });
}

// ── DASHBOARD STATS ────────────────────────────────────────
export interface DashboardStats {
  totalBusinesses: number; totalActiveBusinesses: number; trialBusinesses: number;
  suspendedBusinesses: number; cancelledBusinesses: number; totalMonthlyRevenue: number;
  pendingPayments: number; revenueGrowth: number; pendingRegistrations: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const [bizResult, payResult, regResult] = await Promise.all([
    supabase.from('av_businesses').select('status, monthly_amount'),
    supabase.from('av_payments').select('status, amount, payment_date').order('payment_date', { ascending: false }).limit(500),
    supabase.from('av_registrations').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
  ]);
  const businesses = bizResult.data || [];
  const payments = payResult.data || [];
  const now = new Date();
  const last30Start = new Date(now.getTime() - 30 * 86400_000);
  const prev30Start = new Date(now.getTime() - 60 * 86400_000);
  const last30Rev = payments.filter(p => p.status === 'completed' && new Date(p.payment_date) >= last30Start).reduce((s, p) => s + Number(p.amount), 0);
  const prev30Rev = payments.filter(p => p.status === 'completed' && new Date(p.payment_date) >= prev30Start && new Date(p.payment_date) < last30Start).reduce((s, p) => s + Number(p.amount), 0);
  return {
    totalBusinesses: businesses.length,
    totalActiveBusinesses: businesses.filter(b => b.status === 'active').length,
    trialBusinesses: businesses.filter(b => b.status === 'trial').length,
    suspendedBusinesses: businesses.filter(b => b.status === 'suspended').length,
    cancelledBusinesses: businesses.filter(b => b.status === 'cancelled').length,
    totalMonthlyRevenue: businesses.filter(b => b.status === 'active').reduce((s, b) => s + Number(b.monthly_amount), 0),
    pendingPayments: payments.filter(p => p.status === 'pending').length,
    revenueGrowth: prev30Rev > 0 ? Math.round(((last30Rev - prev30Rev) / prev30Rev) * 1000) / 10 : 0,
    pendingRegistrations: regResult.count || 0,
  };
}

export interface MonthlyRevenue { month: string; revenue: number; }
export async function getMonthlyRevenue(): Promise<MonthlyRevenue[]> {
  const { data } = await supabase.from('av_payments').select('amount, payment_date').eq('status', 'completed').order('payment_date', { ascending: true });
  const months = ['Jun','Jul','Ago','Sep','Oct','Nov','Dic','Ene','Feb','Mar','Abr','May'];
  const now = new Date();
  return months.map((month, i) => {
    const target = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
    const key = `${target.getFullYear()}-${String(target.getMonth() + 1).padStart(2, '0')}`;
    return { month, revenue: (data || []).filter(p => p.payment_date.startsWith(key)).reduce((s, p) => s + Number(p.amount), 0) };
  });
}

// ── SETTINGS ───────────────────────────────────────────────
export interface AppSettings {
  notifyPaymentReceived: boolean; notifyPaymentOverdue: boolean;
  notifyTrialExpiring: boolean; notifyNewRegistration: boolean;
}
const SETTINGS_KEY = 'av_app_settings';
const defaultSettings: AppSettings = { notifyPaymentReceived: true, notifyPaymentOverdue: true, notifyTrialExpiring: true, notifyNewRegistration: true };
export async function getSettings(): Promise<AppSettings> {
  try { return { ...defaultSettings, ...JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}') }; } catch { return { ...defaultSettings }; }
}
export async function updateSettings(settings: Partial<AppSettings>): Promise<AppSettings> {
  const updated = { ...(await getSettings()), ...settings };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
  return updated;
}
