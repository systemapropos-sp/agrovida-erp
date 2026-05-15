-- AgroVida ERP — Supabase Schema
-- Run this in the Supabase SQL editor

-- ── BUSINESSES ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS av_businesses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  domain TEXT,
  logo_url TEXT,
  email TEXT,
  phone TEXT,
  monthly_amount NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'trial' CHECK (status IN ('active', 'trial', 'suspended', 'cancelled')),
  trial_ends_at TIMESTAMPTZ,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── REGISTRATIONS (client self-registration) ────────────────
CREATE TABLE IF NOT EXISTS av_registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT DEFAULT '',
  address TEXT DEFAULT '',
  business_type TEXT DEFAULT '',
  description TEXT DEFAULT '',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT DEFAULT '',
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── CLIENTS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS av_clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES av_businesses(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  contact_name TEXT DEFAULT '',
  email TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  address TEXT DEFAULT '',
  rnc TEXT DEFAULT '',
  monthly_rent NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'overdue')),
  license_count INTEGER DEFAULT 1,
  notes TEXT DEFAULT '',
  last_payment_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── PAYMENTS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS av_payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES av_businesses(id) ON DELETE CASCADE,
  client_id UUID REFERENCES av_clients(id) ON DELETE SET NULL,
  amount NUMERIC NOT NULL,
  payment_method TEXT DEFAULT 'cash' CHECK (payment_method IN ('stripe', 'paypal', 'cash', 'transfer')),
  stripe_payment_intent_id TEXT,
  paypal_order_id TEXT,
  status TEXT DEFAULT 'completed' CHECK (status IN ('completed', 'pending', 'failed', 'refunded')),
  payment_date TIMESTAMPTZ DEFAULT NOW(),
  period_start DATE,
  period_end DATE,
  receipt_url TEXT,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── DOCUMENTS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS av_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES av_businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT DEFAULT '',
  file_size INTEGER DEFAULT 0,
  category TEXT DEFAULT 'general' CHECK (category IN ('contract', 'invoice', 'receipt', 'logo', 'general')),
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── ACTIVITY LOGS ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS av_activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES av_businesses(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── UPDATED_AT TRIGGER ─────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_av_businesses_updated_at ON av_businesses;
CREATE TRIGGER update_av_businesses_updated_at
  BEFORE UPDATE ON av_businesses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── INDEXES ────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_av_businesses_status ON av_businesses(status);
CREATE INDEX IF NOT EXISTS idx_av_registrations_status ON av_registrations(status);
CREATE INDEX IF NOT EXISTS idx_av_registrations_created ON av_registrations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_av_clients_business ON av_clients(business_id);
CREATE INDEX IF NOT EXISTS idx_av_payments_business ON av_payments(business_id);
CREATE INDEX IF NOT EXISTS idx_av_payments_date ON av_payments(payment_date DESC);
CREATE INDEX IF NOT EXISTS idx_av_documents_business ON av_documents(business_id);
CREATE INDEX IF NOT EXISTS idx_av_activity_business ON av_activity_logs(business_id);

-- ── ROW LEVEL SECURITY ─────────────────────────────────────
ALTER TABLE av_businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE av_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE av_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE av_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE av_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE av_registrations ENABLE ROW LEVEL SECURITY;

-- Authenticated users (admin) can do everything — safe with IF NOT EXISTS
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='av_businesses' AND policyname='auth_all_av_businesses') THEN
    CREATE POLICY "auth_all_av_businesses" ON av_businesses FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='av_clients' AND policyname='auth_all_av_clients') THEN
    CREATE POLICY "auth_all_av_clients" ON av_clients FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='av_payments' AND policyname='auth_all_av_payments') THEN
    CREATE POLICY "auth_all_av_payments" ON av_payments FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='av_documents' AND policyname='auth_all_av_documents') THEN
    CREATE POLICY "auth_all_av_documents" ON av_documents FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='av_activity_logs' AND policyname='auth_all_av_activity') THEN
    CREATE POLICY "auth_all_av_activity" ON av_activity_logs FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='av_registrations' AND policyname='auth_all_av_registrations') THEN
    CREATE POLICY "auth_all_av_registrations" ON av_registrations FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;

-- Anonymous users can INSERT registrations (self-registration)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='av_registrations' AND policyname='anon_insert_av_registrations') THEN
    CREATE POLICY "anon_insert_av_registrations" ON av_registrations FOR INSERT TO anon WITH CHECK (true);
  END IF;
END $$;

-- ── STORAGE BUCKET ─────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public) VALUES ('logos', 'logos', true) ON CONFLICT DO NOTHING;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='logos_public_read') THEN
    CREATE POLICY "logos_public_read" ON storage.objects FOR SELECT TO public USING (bucket_id = 'logos');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='logos_auth_upload') THEN
    CREATE POLICY "logos_auth_upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'logos');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='logos_auth_delete') THEN
    CREATE POLICY "logos_auth_delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'logos');
  END IF;
END $$;
