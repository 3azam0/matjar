import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;

          if (
            id.includes('/react/') ||
            id.includes('/react-dom/') ||
            id.includes('/react-router') ||
            id.includes('/scheduler/')
          ) {
            return 'vendor-react';
          }

          if (id.includes('/@supabase/') || id.includes('/ra-supabase')) {
            return 'vendor-supabase';
          }

          if (id.includes('/@mui/icons-material/')) {
            return 'vendor-mui-icons';
          }

          if (id.includes('/@mui/') || id.includes('/@emotion/')) {
            return 'vendor-mui';
          }

          if (
            id.includes('/react-admin/') ||
            id.includes('/ra-core/') ||
            id.includes('/ra-ui-materialui/') ||
            id.includes('/ra-i18n-polyglot/') ||
            id.includes('/ra-language-arabic/')
          ) {
            return 'vendor-react-admin';
          }

          if (id.includes('/@tanstack/')) {
            return 'vendor-query';
          }

          return 'vendor';
        },
      },
    },
  },
  optimizeDeps: {
    include: ['tslib', 'ra-core', 'react-admin'],
  },
})
