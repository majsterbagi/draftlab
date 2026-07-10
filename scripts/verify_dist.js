import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');

function walkHtml(dir, relativeDir) {
    if (!fs.existsSync(dir)) return [];

    const files = [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const absolute = path.join(dir, entry.name);
        const relative = `${relativeDir}/${entry.name}`;

        if (entry.isDirectory()) {
            files.push(...walkHtml(absolute, relative));
        } else if (entry.name.endsWith('.html')) {
            files.push(relative.replace(/\\/g, '/'));
        }
    }
    return files;
}

const { SITE_DATA } = await import(
    pathToFileURL(path.join(ROOT, 'src/data/db.js')).href
);

const required = new Set(['index.html', 'about.html', 'api']);
for (const html of walkHtml(path.join(ROOT, 'apps'), 'apps')) {
    required.add(html);
}

for (const project of SITE_DATA?.projects ?? []) {
    const url = String(project.url ?? '').split(/[?#]/)[0].replace(/^\.\//, '');
    if (!url || url === '#') continue;

    if (url.endsWith('/')) {
        required.add(`${url}index.html`);
    } else if (url.endsWith('.html')) {
        required.add(url);
    }
}

const missing = [...required].filter(relative => !fs.existsSync(path.join(DIST, relative)));

if (missing.length > 0) {
    console.error('❌ FTP package is incomplete. Missing from dist/:');
    for (const file of missing) console.error(`   - ${file}`);
    process.exit(1);
}

console.log(`✅ FTP package is ready: dist/ (${required.size} required paths checked).`);
