/**
 * AgroVida ERP — Create Super Admin
 * Run: node create-admin.cjs
 */
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function createAdmin() {
  const email = 'admin@agrovidapro.com';
  const password = 'Admin123';

  console.log('🌱 AgroVida ERP — Creating super admin...');
  console.log(`  Email: ${email}`);
  console.log(`  Username: smartboys`);
  console.log(`  Password: ${password}`);

  // Try to create the user
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name: 'Super Admin', role: 'super_admin', username: 'smartboys' },
  });

  if (error) {
    if (error.message.includes('already registered') || error.message.includes('already exists')) {
      console.log('✅ Admin user already exists — updating password...');
      // Try to list users to find the ID
      const { data: users } = await supabase.auth.admin.listUsers();
      const existing = users?.users?.find(u => u.email === email);
      if (existing) {
        await supabase.auth.admin.updateUserById(existing.id, {
          password,
          user_metadata: { name: 'Super Admin', role: 'super_admin', username: 'smartboys' }
        });
        console.log('✅ Admin password updated!');
      }
    } else {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }
  } else {
    console.log('✅ Admin created! ID:', data.user?.id);
  }

  console.log('\n🎉 Done! Login credentials:');
  console.log('   URL: https://agrovidapro.com');
  console.log('   Username: smartboys');
  console.log('   Password: Admin123');
  console.log('\n📧 Notifications will be sent to: systemapropos@gmail.com');
}

createAdmin().catch(console.error);
