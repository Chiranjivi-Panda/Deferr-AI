import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Vite configuration for Last-Minute Life Saver
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // Tailwind v4 uses a Vite plugin instead of PostCSS
  ],
  server: {
    port: 5173,
    // Proxy API requests to the Express backend during development.
    // This means fetch('/api/health') in the browser automatically goes
    // to http://localhost:3001/api/health — no CORS issues!
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});
