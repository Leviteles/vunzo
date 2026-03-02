import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    // Build vai para public/ na raiz — Express serve daqui
    outDir: './public',
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    proxy: {
      '/auth': 'http://localhost:3001',
      '/financial': 'http://localhost:3001',
      '/health': 'http://localhost:3001',
    },
  },
});
