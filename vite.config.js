import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Vite 8 (rolldown) requires manualChunks as a function
        manualChunks(id) {
          if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/')) {
            return 'react-vendor';
          }
          if (id.includes('node_modules/react-router-dom') || id.includes('node_modules/react-router/')) {
            return 'router-vendor';
          }
          if (id.includes('node_modules/firebase/analytics')) {
            return 'firebase-analytics';
          }
          if (id.includes('node_modules/firebase/')) {
            return 'firebase-vendor';
          }
          if (id.includes('node_modules/react-helmet-async')) {
            return 'helmet-vendor';
          }
          if (id.includes('node_modules/framer-motion')) {
            return 'framer-motion-vendor';
          }
        },
      },
    },
    minify: 'oxc',
    sourcemap: false,
    cssCodeSplit: true,
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },
})

