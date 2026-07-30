import React, { lazy, Suspense, useEffect, useRef, useState } from 'react';
import Hero from '../components/sections/Hero/Hero';
import Header from '../components/sections/Header/Header';

// Below-fold sections — lazy loaded
const ArticleSection = lazy(() => import('../components/sections/Article/ArticleSection'));
const CourseSection  = lazy(() => import('../components/sections/Courses/CourseSection'));
const About          = lazy(() => import('../components/sections/About/About'));
const Products       = lazy(() => import('../components/sections/products/Products'));
const NewLaunches    = lazy(() => import('../components/sections/NewLaunches/NewLaunches'));
const Horoscope      = lazy(() => import('../components/sections/Horoscope/Horoscope'));
const Numerology     = lazy(() => import('../components/sections/Numerology/Numerology'));
const Testimonials   = lazy(() => import('../components/sections/Testimonials/Testimonials'));
const Gallery        = lazy(() => import('../components/sections/gallery/Gallery'));
const Partners       = lazy(() => import('../components/sections/Partners/Partners'));
const Contact        = lazy(() => import('../components/sections/Contact/Contact'));
const Footer         = lazy(() => import('../components/sections/Footer/Footer'));

// Minimal section placeholder while loading
const SectionPlaceholder = () => (
  <div className="section-content-visibility" />
);

const DeferredSection = ({ Component: SectionComponent, rootMargin = '600px', fallback = <SectionPlaceholder /> }) => {
  const [isReady, setIsReady] = useState(false);
  const placeholderRef = useRef(null);

  useEffect(() => {
    if (isReady || !placeholderRef.current) return;

    let observer = null;
    let timeoutId = null;

    const load = () => setIsReady(true);

    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            load();
            observer.disconnect();
          }
        },
        { rootMargin }
      );

      observer.observe(placeholderRef.current);
    } else {
      timeoutId = window.setTimeout(load, 2500);
    }

    return () => {
      if (observer) observer.disconnect();
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [isReady, rootMargin]);

  return (
    <div ref={placeholderRef} className="section-content-visibility">
      {isReady ? (
        <Suspense fallback={fallback}>
          {React.createElement(SectionComponent)}
        </Suspense>
      ) : (
        fallback
      )}
    </div>
  );
};

const Home = () => {
    return (
        <>
            {/* Sentinel for Header IntersectionObserver */}
            <div id="top-sentinel" className="absolute top-0 left-0 w-full h-px pointer-events-none z-[-1]" />

            {/* Critical above-fold — eager */}
            <Header />
            <main>
                <Hero />

                {/* Below-fold sections with content-visibility for better LCP */}
                <DeferredSection Component={ArticleSection} />
                <DeferredSection Component={CourseSection} />
                <DeferredSection Component={About} />
                <DeferredSection Component={Products} />
                <DeferredSection Component={NewLaunches} />
                <DeferredSection Component={Numerology} />
                <DeferredSection Component={Horoscope} />
                <DeferredSection Component={Testimonials} />
                <DeferredSection Component={Gallery} />
                <DeferredSection Component={Partners} />
                <DeferredSection Component={Contact} />
            </main>
            <DeferredSection Component={Footer} rootMargin="400px" fallback={null} />
        </>
    );
};

export default Home;

