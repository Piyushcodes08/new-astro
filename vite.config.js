import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react({
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
        manualChunks(id) {
          // Core React — react, react-dom AND scheduler must stay together so
          // they share the same ReactCurrentDispatcher singleton at runtime.
          if (
            id.includes('node_modules/react/') ||
            id.includes('node_modules/react-dom/') ||
            id.includes('node_modules/scheduler/')
          ) {
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
    treeshake: {
      // Protect hook modules and Firebase config from being inlined/dropped.
      moduleSideEffects(id) {
        if (id.includes('/hooks/') || id.includes('firebaseConfig')) return true;
        return false;
      },
      propertyReadSideEffects: false,
      tryCatchDeoptimization: false,
    },
    reportCompressedSize: false,
    modulePreload: {
      resolveDependencies(chunk, deps) {
        return deps.filter(dep => {
          return !dep.includes('firebase-vendor') &&
                 !dep.includes('firebase-analytics') &&
                 !dep.includes('firebaseConfig');
        });
      },
    },
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
      'recharts',
      'gsap',
      'gsap/ScrollTrigger',
      'react/jsx-runtime',
      'react/jsx-dev-runtime',
      // scheduler holds the shared React dispatcher — co-bundle with react
      'scheduler',
    ],
    exclude: ['react-minimal-pie-chart'],
  },
  resolve: {
    // Force all packages (including deep node_modules) to use the same
    // React instance — prevents duplicate ReactCurrentDispatcher objects.
    dedupe: ['react', 'react-dom', 'react-router-dom', 'scheduler'],
  },
  server: {
    headers: {
      'Cache-Control': 'no-store',
    },
    warmup: {
      clientFiles: ['./index.html', './src/main.jsx'],
    },
  },
})
