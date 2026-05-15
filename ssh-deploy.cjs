/**
 * AgroVida ERP — SSH/SFTP Deploy
 * Uses main Hostinger SSH account
 */
const { NodeSSH } = require('node-ssh');
const path = require('path');
const fs = require('fs');

const ssh = new NodeSSH();

const config = {
  host: '82.25.87.157',
  port: 65002,
  username: 'u108221933',
  password: 'Producers0587@',
};

const localDir = path.join(__dirname, 'dist');
const remoteDir = '/home/u108221933/domains/agrovidapro.com/public_html';

async function deploy() {
  console.log('🚀 AgroVida ERP — Deploying via SSH...');
  console.log(`   Local:  ${localDir}`);
  console.log(`   Remote: ${config.host}:${config.port} → ${remoteDir}`);
  
  try {
    await ssh.connect(config);
    console.log('✅ SSH Connected!');
    
    // Ensure remote directory exists
    await ssh.execCommand(`mkdir -p ${remoteDir}`);
    console.log('📂 Remote directory ready');
    
    // Upload all files from dist/
    const files = getAllFiles(localDir);
    console.log(`📤 Uploading ${files.length} files...`);
    
    let uploaded = 0;
    for (const file of files) {
      const relativePath = path.relative(localDir, file);
      const remotePath = `${remoteDir}/${relativePath.replace(/\\/g, '/')}`;
      const remoteParent = path.dirname(remotePath);
      
      await ssh.execCommand(`mkdir -p ${remoteParent}`);
      await ssh.putFile(file, remotePath);
      uploaded++;
      if (uploaded % 5 === 0 || uploaded === files.length) {
        process.stdout.write(`\r   ${uploaded}/${files.length} files uploaded`);
      }
    }
    
    console.log('\n✅ Deploy complete!');
    console.log('🌐 Live at: https://agrovidapro.com');
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    ssh.dispose();
  }
}

function getAllFiles(dir, files = []) {
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    if (fs.statSync(fullPath).isDirectory()) {
      getAllFiles(fullPath, files);
    } else {
      files.push(fullPath);
    }
  }
  return files;
}

deploy();
