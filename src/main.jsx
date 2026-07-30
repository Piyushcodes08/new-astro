import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import App from './App.jsx'

// Deferred firebase analytics load (after first interaction) to not block main thread
const deferAnalytics = () => {
  // Firebase analytics is already loaded via firebaseConfig
  // But we avoid immediate initialization impact by deferring
  requestIdleCallback(() => {
    import('./firebaseConfig').then(({ analytics }) => {
      if (analytics) {
        // analytics is already initialized, just use it when needed
      }
    }).catch(() => {
      // Silently fail - analytics is non-critical
    });
  }, { timeout: 2000 });
};

// Register service worker if supported
const registerServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js').catch(() => {
        // Service worker registration failed - non-critical
      });
    });
  }
};

// Start performance-critical operations
registerServiceWorker();

// Defer non-critical operations
if (typeof requestIdleCallback === 'function') {
  requestIdleCallback(deferAnalytics, { timeout: 3000 });
} else {
  setTimeout(deferAnalytics, 3000);
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Lightweight image optimizations applied during idle time.
// Marks non-critical images as lazy, sets async decoding, and low fetch priority.
const applyImageOptimizations = () => {
  try {
    const imgs = Array.from(document.querySelectorAll('img'));
    imgs.forEach(img => {
      // Skip images explicitly marked as priority or inside hero sections
      if (img.hasAttribute('data-priority') || img.closest('.hero-section')) return;

      // If the image already has loading attribute, don't override
      if (!img.hasAttribute('loading')) img.setAttribute('loading', 'lazy');

      // Encourage async decode for smoother rendering
      if (!img.getAttribute('decoding')) img.setAttribute('decoding', 'async');

      // Hint resource priority (supported in modern browsers)
      if (!img.hasAttribute('fetchpriority')) img.setAttribute('fetchpriority', 'low');
    });
  } catch (e) {
    // Fail silently - non-critical enhancement
  }
};

if (typeof requestIdleCallback === 'function') {
  requestIdleCallback(applyImageOptimizations, { timeout: 3000 });
} else {
  // Fallback after short delay
  setTimeout(applyImageOptimizations, 3000);
}

