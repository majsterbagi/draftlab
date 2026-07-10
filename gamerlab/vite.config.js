import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base: './' — build działa także w podkatalogu na hostingu współdzielonym
export default defineConfig({
  base: './',
  plugins: [react()],
  server: { port: 5188 },
});
