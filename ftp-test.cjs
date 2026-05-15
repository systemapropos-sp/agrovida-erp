const ftp = require('basic-ftp');
const path = require('path');

async function deploy() {
  const client = new ftp.Client(60000);
  client.ftp.verbose = true;
  
  try {
    console.log('🔌 Connecting to FTP...');
    await client.access({
      host: '82.25.87.157',
      port: 21,
      user: 'u108221933.agrovidapro.com',
      password: 'Producers0587@',
      secure: false,
    });
    
    console.log('✅ FTP Connected!');
    console.log('📂 Listing remote root directory...');
    const list = await client.list('/');
    console.log('Root dirs:', list.map(f => f.name));
    
    console.log('\n📤 Uploading dist/ to /public_html...');
    await client.ensureDir('/public_html');
    await client.uploadFromDir(path.join(__dirname, 'dist'), '/public_html');
    console.log('✅ Deploy complete!');
    
  } catch (err) {
    console.error('❌ FTP Error:', err.message);
    if (err.code) console.error('   Code:', err.code);
  } finally {
    client.close();
  }
}

deploy();
