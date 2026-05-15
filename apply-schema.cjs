/**
 * AgroVida ERP — Apply Supabase Schema
 * Run: node apply-schema.cjs
 */
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function applySchema() {
  console.log('🌱 AgroVida ERP — Applying database schema...');
  
  // Test connection
  const { error: testErr } = await supabase.from('av_businesses').select('count').limit(1).maybeSingle();
  if (!testErr) {
    console.log('✅ Tables already exist!');
    return;
  }

  console.log('📋 Please run the SQL in supabase_schema.sql manually in the Supabase SQL editor:');
  console.log('   https://bbrsyjiyricijhnjrbti.supabase.co/project/default/sql');
  console.log('\nOr create the tables manually:');
  
  // Try to create tables using RPC or individual inserts
  const tables = ['av_businesses', 'av_registrations', 'av_clients', 'av_payments', 'av_documents', 'av_activity_logs'];
  for (const table of tables) {
    const { error } = await supabase.from(table).select('count').limit(1);
    if (error && error.code === '42P01') {
      console.log(`  ❌ Table ${table} does not exist`);
    } else {
      console.log(`  ✅ Table ${table} exists`);
    }
  }
}

applySchema().catch(console.error);
