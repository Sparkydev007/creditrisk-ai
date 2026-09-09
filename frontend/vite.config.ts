import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    build: {
      outDir: 'dist',
    },
    server: {
      port: 3000,
      // Route API traffic through the API gateway (matches production topology)
      proxy: {
        '/api': 'http://localhost:8080',
        '/actuator': 'http://localhost:8080',
      },
    },
  };
});
