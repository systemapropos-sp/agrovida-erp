/**
 * AgroVida ERP — Apply Schema via Management API (PAT)
 * Run: node run-schema.cjs
 */
const https = require('https');
const fs = require('fs');
const path = require('path');

// Set PAT in env or replace here: SUPABASE_PAT=your_personal_access_token
const PAT = process.env.SUPABASE_PAT || 'YOUR_SUPABASE_PAT_HERE';
const PROJECT_REF = 'bbrsyjiyricijhnjrbti';

function runQuery(query) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ query });
    const opts = {
      hostname: 'api.supabase.com',
      port: 443,
      path: `/v1/projects/${PROJECT_REF}/database/query`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PAT}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      }
    };
    const req = https.request(opts, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function splitSQL(sql) {
  const stmts = [];
  let current = '';
  let dollarDepth = 0;
  for (let i = 0; i < sql.length; i++) {
    const ch = sql[i];
    if (sql.substring(i, i + 2) === '$$') {
      dollarDepth = dollarDepth === 0 ? 1 : 0;
      current += '$$';
      i++;
    } else if (ch === ';' && dollarDepth === 0) {
      current += ';';
      if (current.trim()) stmts.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  if (current.trim()) stmts.push(current.trim());
  return stmts;
}

function safeParseJSON(str) {
  try { return JSON.parse(str); } catch { return null; }
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  console.log('🌱 AgroVida ERP — Aplicando schema en Supabase...\n');
  console.log(`   Project: ${PROJECT_REF}.supabase.co\n`);

  // Test connection
  const test = await runQuery('SELECT 1 as test');
  if (test.status < 200 || test.status >= 300) {
    console.error('❌ Error de conexión:', test.status, test.body.substring(0, 200));
    return;
  }
  console.log('✅ Conexión con Management API establecida!\n');

  const sql = fs.readFileSync(path.join(__dirname, 'supabase_schema.sql'), 'utf8');

  // Try full schema first
  console.log('📤 Ejecutando schema completo...');
  const res = await runQuery(sql);

  if (res.status >= 200 && res.status < 300) {
    console.log('✅ Schema aplicado en un solo paso!\n');
  } else {
    const parsed = safeParseJSON(res.body);
    console.log(`⚠️  Schema completo falló (${res.status}): ${parsed?.message || res.body.substring(0, 100)}`);
    console.log('\n📋 Ejecutando declaración por declaración...\n');

    const statements = splitSQL(sql);
    let ok = 0, fail = 0;

    for (const stmt of statements) {
      const trimmed = stmt.trim();
      if (!trimmed || trimmed.startsWith('--') || trimmed.startsWith('/*')) continue;

      const r = await runQuery(trimmed);
      const preview = trimmed.replace(/\s+/g, ' ').substring(0, 60);

      if (r.status >= 200 && r.status < 300) {
        console.log(`  ✅ ${preview}`);
        ok++;
      } else {
        const p = safeParseJSON(r.body);
        const msg = p?.message || r.body.substring(0, 80);
        if (msg && (msg.includes('already exists') || msg.includes('duplicate') || msg.includes('ya existe'))) {
          console.log(`  ⚠️  ${preview.substring(0, 50)} (ya existe)`);
          ok++;
        } else {
          console.log(`  ❌ ${preview.substring(0, 50)}`);
          if (msg) console.log(`       → ${msg.substring(0, 100)}`);
          fail++;
        }
      }
      await sleep(100);
    }
    console.log(`\n📊 Resultado: ${ok} ✅  ${fail} ❌`);
  }

  // Verify tables
  console.log('\n🔍 Verificando tablas av_* en Supabase...');
  const verify = await runQuery(
    "SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename LIKE 'av_%' ORDER BY tablename"
  );

  if (verify.status >= 200 && verify.status < 300) {
    const rows = safeParseJSON(verify.body) || [];
    console.log(`\n📋 Tablas creadas (${rows.length}):`);
    rows.forEach(r => console.log(`  ✅ ${r.tablename}`));

    if (rows.length >= 6) {
      console.log('\n🎉 ¡AgroVida ERP está completamente configurado!');
      console.log('   🌐 https://agrovidapro.com');
      console.log('   🔑 Login: admin@agrovidapro.com / Admin123');
    } else {
      console.log('\n⚠️  Faltan tablas. Ejecuta el SQL manualmente en:');
      console.log(`   https://supabase.com/dashboard/project/${PROJECT_REF}/sql/new`);
    }
  }
}

main().catch(console.error);
