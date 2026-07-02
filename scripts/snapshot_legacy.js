// scripts/snapshot_legacy.js
// Tworzy statyczny snapshot zbudowanej strony (dist/) w public/legacy/.
// Dzięki temu stara wersja strony i wszystkich aplikacji jest dostępna
// pod adresem /legacy/ obok nowej wersji.
//
// Użycie:  node scripts/snapshot_legacy.js
// (uruchamiaj po `npm run build` wykonanym na starej wersji kodu)

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const LEGACY = path.join(ROOT, 'public', 'legacy');

if (!fs.existsSync(DIST)) {
    console.error('❌ Brak folderu dist/. Najpierw uruchom: npm run build');
    process.exit(1);
}

// Wyczyść poprzedni snapshot
fs.rmSync(LEGACY, { recursive: true, force: true });

// Kopiuj dist -> public/legacy (z pominięciem zagnieżdżonego legacy/)
function copyDir(src, dest) {
    fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
        if (entry.name === 'legacy' || entry.name === '.DS_Store') continue;
        const s = path.join(src, entry.name);
        const d = path.join(dest, entry.name);
        if (entry.isDirectory()) copyDir(s, d);
        else fs.copyFileSync(s, d);
    }
}
copyDir(DIST, LEGACY);

// Wstrzyknij pływający przycisk "wróć do nowej wersji" do każdego HTML
function injectBanner(file) {
    const rel = path.relative(LEGACY, file);
    const depth = rel.split(path.sep).length; // index.html = 1, apps/x.html = 2
    const backHref = '../'.repeat(depth) + 'index.html';

    const banner = `
<!-- LEGACY SNAPSHOT BANNER -->
<a href="${backHref}" style="position:fixed;bottom:16px;left:16px;z-index:2147483647;display:flex;align-items:center;gap:8px;padding:10px 16px;background:#0b0c0e;color:#00ff9d;border:1px solid #00ff9d;border-radius:8px;font-family:'JetBrains Mono',monospace;font-size:12px;font-weight:bold;text-decoration:none;box-shadow:0 4px 20px rgba(0,0,0,.6);opacity:.92" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=.92">
  <span style="width:8px;height:8px;border-radius:50%;background:#00ff9d;display:inline-block"></span>
  WERSJA ARCHIWALNA &mdash; wr&oacute;&cacute; do nowej
</a>
</body>`;

    let html = fs.readFileSync(file, 'utf8');
    if (html.includes('LEGACY SNAPSHOT BANNER')) return;
    html = html.replace(/<\/body>/i, banner);
    fs.writeFileSync(file, html);
}

function walk(dir, cb) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(p, cb);
        else if (entry.name.endsWith('.html')) cb(p);
    }
}

let count = 0;
walk(LEGACY, f => { injectBanner(f); count++; });

console.log(`✅ Snapshot legacy utworzony: public/legacy/ (${count} stron HTML)`);
