
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  initializeFirestore,
  getFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration using VITE_ prefixed environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Track whether this is a fresh app initialization
const existingApps = getApps();
const isNewApp = !existingApps.length;

// Initialize Firebase only if it hasn't been initialized already
const app = isNewApp ? initializeApp(firebaseConfig) : existingApps[0];

// ✅ FIX: Only call initializeFirestore on a brand-new app instance.
// If the app was already initialized (e.g. HMR / module re-evaluation),
// getFirestore() retrieves the existing Firestore instance safely.
const db = isNewApp
  ? initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
      }),
    })
  : getFirestore(app);

const auth = getAuth(app);
const storage = getStorage(app);

let _analytics = null;
export async function getAnalyticsInstance() {
  if (_analytics) return _analytics;
  if (typeof window === 'undefined') return null;
  try {
    const { getAnalytics, isSupported } = await import('firebase/analytics');
    if (!(await isSupported())) return null;
    _analytics = getAnalytics(app);
    return _analytics;
  } catch {
    return null;
  }
}

export { auth, db, storage, app };
