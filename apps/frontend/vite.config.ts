import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api/identity': {
        target: process.env['VITE_IDENTITY_API_URL'] ?? 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api\/identity/, ''),
      },
      '/api/core': {
        target: process.env['VITE_CORE_API_URL'] ?? 'http://localhost:3003',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api\/core/, ''),
      },
      '/api/ai': {
        target: process.env['VITE_AI_API_URL'] ?? 'http://localhost:3005',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api\/ai/, ''),
      },
    },
  },
});
