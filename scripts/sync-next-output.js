const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, '..', 'apps', 'web', '.next');
const dest = path.join(__dirname, '..', '.next');

if (fs.existsSync(src)) {
  console.log(`[Build] Sincronizando saída Next.js: ${src} -> ${dest}...`);
  fs.cpSync(src, dest, { recursive: true });
  console.log('[Build] Sincronização concluída com sucesso!');
} else {
  console.warn(`[Build] Aviso: ${src} não encontrado para sincronização.`);
}
