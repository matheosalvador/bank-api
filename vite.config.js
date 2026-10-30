import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    environmentOptions: {
      jsdom: {
        url: 'http://localhost:3000',
      },
    },
    exclude: ['**/bank-api rollback*/**', '**/Front/**'],
  },
});
