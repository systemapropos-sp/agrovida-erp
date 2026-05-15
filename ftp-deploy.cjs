const FtpDeploy = require('ftp-deploy');
const path = require('path');
const ftp = new FtpDeploy();
ftp.deploy({
  user: 'u108221933.agrovidapro.com', password: 'Producers0587@', host: '82.25.87.157', port: 21,
  localRoot: path.join(__dirname, 'dist'), remoteRoot: '/public_html',
  include: ['*', '**/*'], deleteRemote: false, forcePasv: true,
}).then(r => console.log('✅ Deployed:', r)).catch(console.error);
