const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Arquivos raiz a sincronizar
const rootFiles = ['index.html', 'styles.css', 'script.js', 'favicon.svg', '_headers', '_redirects'];
rootFiles.forEach(file => {
  const src = path.join(__dirname, file);
  const dest = path.join(distDir, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
  }
});

// Sincronizar pasta public/
const publicSrc = path.join(__dirname, 'public');
const publicDest = path.join(distDir, 'public');
if (fs.existsSync(publicSrc)) {
  if (!fs.existsSync(publicDest)) {
    fs.mkdirSync(publicDest, { recursive: true });
  }
  const publicFiles = fs.readdirSync(publicSrc);
  publicFiles.forEach(file => {
    fs.copyFileSync(path.join(publicSrc, file), path.join(publicDest, file));
  });
}

console.log('Build completed successfully: all production files synchronized to dist/');