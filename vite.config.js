import { defineConfig } from 'vite';
import { resolve } from 'path';
import fs from 'fs';

// Helper to get all HTML files in apps/ directory
function getAppEntries() {
    const appsDir = resolve(__dirname, 'apps');
    const entries = {};

    if (fs.existsSync(appsDir)) {
        const files = fs.readdirSync(appsDir);
        files.forEach(file => {
            if (file.endsWith('.html')) {
                const name = `apps/${file.replace('.html', '')}`;
                entries[name] = resolve(appsDir, file);
            }
        });
    }
    return entries;
}

export default defineConfig({
    base: './',
    build: {
        emptyOutDir: true,
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                about: resolve(__dirname, 'about.html'),
                ...getAppEntries()
            }
        }
    },
    server: {
        open: true
    }
});
