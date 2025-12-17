import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        middlewareMode: false,
      },
      preview: {
        port: 3000,
        host: '0.0.0.0',
        allowedHosts: [
          'localhost',
          '127.0.0.1',
          '0.0.0.0',
          'nextgen-erp-ethiopia.onrender.com',
          'nextgen-erp-ethiopia.vercel.app',
        ]
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
