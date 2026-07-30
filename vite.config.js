import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react({
      // Enable automatic JSX runtime (already default)
      // Strip data-testid in production
      babel: {
        plugins: process.env.NODE_ENV === 'production'
          ? [['babel-plugin-jsx-remove-data-test-id', { attributes: 'data-testid' }]]
          : [],
      },
    }),
    tailwindcss(),
  ],
  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 1000,
    cssMinify: 'lightningcss',
    rollupOptions: {
      output: {
        // Granular manual chunk splitting for optimal caching
        manualChunks(id) {
          // Core React
          if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/')) {
            return 'react-vendor';
          }
          // Router
          if (id.includes('node_modules/react-router-dom') || id.includes('node_modules/react-router/')) {
            return 'router-vendor';
          }
          // Firebase - split analytics separately (small, frequently used)
          if (id.includes('node_modules/firebase/analytics')) {
            return 'firebase-analytics';
          }
          if (id.includes('node_modules/firebase/')) {
            return 'firebase-vendor';
          }
          // Animation libraries
          if (id.includes('node_modules/framer-motion')) {
            return 'framer-motion-vendor';
          }
          if (id.includes('node_modules/gsap')) {
            return 'gsap-vendor';
          }
          // 3D libraries
          if (id.includes('node_modules/three') || id.includes('node_modules/@react-three')) {
            return 'three-vendor';
          }
          // UI Libraries
          if (id.includes('node_modules/@emotion') || id.includes('node_modules/@mui')) {
            return 'mui-vendor';
          }
          if (id.includes('node_modules/swiper')) {
            return 'swiper-vendor';
          }
          // Utils
          if (id.includes('node_modules/axios')) {
            return 'axios-vendor';
          }
          if (id.includes('node_modules/date-fns')) {
            return 'datefns-vendor';
          }
          if (id.includes('node_modules/react-icons')) {
            return 'icons-vendor';
          }
          // Helmet
          if (id.includes('node_modules/react-helmet-async')) {
            return 'helmet-vendor';
          }
        },
      },
    },
    minify: 'oxc',
    sourcemap: false,
    cssCodeSplit: true,
    // Enable tree-shaking
    treeshake: {
      moduleSideEffects: false,
      propertyReadSideEffects: false,
      tryCatchDeoptimization: false,
    },
    // Reduce overhead
    reportCompressedSize: false,
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-dom/client',
      'react-router-dom',
      'react-helmet-async',
      'firebase/app',
      'firebase/firestore',
      'firebase/auth',
      'firebase/analytics',
      'firebase/storage',
    ],
  },
  server: {
    // Faster cold start in dev
    warmup: {
      clientFiles: ['./index.html', './src/main.jsx'],
    },
  },
})

