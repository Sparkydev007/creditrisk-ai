import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api/auth': 'http://localhost:8081',
      '/api/customers': 'http://localhost:8081',
      '/api/applications': 'http://localhost:8082',
      '/api/risk': 'http://localhost:8083',
      '/api/decisions': 'http://localhost:8084',
      '/api/audit': 'http://localhost:8085',
    },
  },
  build: {
    outDir: 'dist',
  },
});
