import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import GlobalBackground from './components/GlobalBackground';
import { HelmetProvider } from 'react-helmet-async';
import { CoursesProvider } from './context/CoursesContext';
import { ArticlesProvider } from './context/ArticlesContext';
import './App.css';

// Non-critical - defer these until after main content renders
const ChatBot = lazy(() => import('./components/ChatBot/ChatBot'));
const AnalyticsTracker = lazy(() => import('./components/AnalyticsTracker'));
const ScrollToTop = lazy(() => import('./components/ScrollToTop'));

const App = () => {
  return (
    <Router>
      <HelmetProvider>
        <CoursesProvider>
          <ArticlesProvider>
            <Suspense fallback={null}><ScrollToTop /></Suspense>
            <Suspense fallback={null}><AnalyticsTracker /></Suspense>
            <GlobalBackground />
            <AppRoutes />
            <Suspense fallback={null}><ChatBot /></Suspense>
          </ArticlesProvider>
        </CoursesProvider>

        {/* WhatsApp Floating Button */}
        <a
          href="https://wa.me/918849092183?text=Hello%2C%20I%20have%20a%20question%20about%20the%20course"
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-4 right-4 bg-green-500 text-white p-2.5 rounded-full shadow-2xl hover:bg-green-600 transition-all duration-300 hover:scale-110 z-9999 flex items-center justify-center group"
          aria-label="Contact on WhatsApp"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 32 32"
            className="h-6 w-6"
            fill="currentColor"
          >
            <path d="M16.001 3.001c-7.171 0-13 5.828-13 13 0 2.3.609 4.45 1.672 6.322L3 29l7.002-1.64a12.85 12.85 0 005.999 1.462c7.171 0 13-5.828 13-13s-5.829-13-13-13zm0 2c6.065 0 11 4.934 11 11s-4.935 11-11 11c-1.995 0-3.871-.527-5.513-1.446l-.393-.225-4.156.974.923-4.084-.23-.388C5.671 19.327 5 17.248 5 16.001c0-6.065 4.934-11 11-11zm-4.439 4.74c-.317-.007-.702.002-1.064.247-.305.207-.994.974-1.13 1.835-.136.861-.278 1.891.634 3.304s2.81 4.366 6.145 5.497c1.792.623 2.653.535 3.599.4.946-.134 1.73-.757 1.978-1.49.247-.733.247-1.34.175-1.49-.072-.15-.278-.217-.583-.38s-1.73-.853-2.001-.95c-.27-.097-.465-.144-.659.144-.195.289-.758.95-.93 1.144-.172.195-.343.217-.634.073-.291-.144-1.23-.453-2.342-1.448-.865-.772-1.448-1.726-1.614-2.017-.167-.289-.018-.446.126-.594.13-.13.29-.342.437-.512.145-.17.195-.29.291-.486.096-.195.048-.365-.024-.512s-.658-1.64-.899-2.242c-.216-.527-.437-.545-.634-.55z" />
          </svg>
          {/* Tooltip on hover */}
          <span className="absolute right-full mr-3 bg-black/80 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Chat with Guru Ji
          </span>
        </a>
      </HelmetProvider>
    </Router>
  );
};

export default App;
