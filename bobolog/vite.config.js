import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            strategies: 'injectManifest',
            srcDir: 'src',
            filename: 'sw.js',
            registerType: 'autoUpdate',
            injectManifest: {
                globPatterns: ['**/*.{js,css,html,svg,png}'],
                maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
            },
            manifest: {
                name: 'BoboLab — dziennik rodzica',
                short_name: 'BoboLab',
                description: 'Pastelowy dziennik rodzica: karmienia, sen, pieluchy, waga, szczepienia i wspomnienia.',
                lang: 'pl',
                display: 'standalone',
                start_url: './',
                scope: './',
                theme_color: '#C9EBDB',
                background_color: '#F4FAF6',
                icons: [
                    { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
                    { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
                    { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
                ],
            },
        }),
    ],
    base: './',
    server: {
        port: process.env.PORT ? Number(process.env.PORT) : 5180,
        strictPort: false,
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor:   ['react', 'react-dom'],
                    supabase: ['@supabase/supabase-js'],
                    recharts: ['recharts'],
                    tanstack: ['@tanstack/react-query'],
                }
            }
        }
    }
});
