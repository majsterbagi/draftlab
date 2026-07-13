import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base './' — build wgrywalny na hosting współdzielony (FTP), jak NEON QUIZ
export default defineConfig({
  plugins: [react()],
  base: './',
  server: { port: 5193, strictPort: true },
})
