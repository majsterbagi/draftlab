import { defineConfig } from 'vite';
import { resolve } from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const ROOT = fileURLToPath(new URL('.', import.meta.url));

// Collect every HTML entry under apps/, including archived prototypes.
function getAppEntries() {
    const appsDir = resolve(ROOT, 'apps');
    const entries = {};

    function visit(dir, relativeDir) {
        if (!fs.existsSync(dir)) return;

        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
            const absolutePath = resolve(dir, entry.name);
            const relativePath = `${relativeDir}/${entry.name}`;

            if (entry.isDirectory()) {
                visit(absolutePath, relativePath);
            } else if (entry.name.endsWith('.html')) {
                const name = relativePath.replace(/\.html$/, '');
                entries[name] = absolutePath;
            }
        }
    }

    visit(appsDir, 'apps');
    return entries;
}

export default defineConfig({
    base: './',
    build: {
        emptyOutDir: true,
        rollupOptions: {
            input: {
                main: resolve(ROOT, 'index.html'),
                about: resolve(ROOT, 'about.html'),
                ...getAppEntries()
            }
        }
    },
    server: {
        open: true,
        port: process.env.PORT ? Number(process.env.PORT) : undefined
    }
});
