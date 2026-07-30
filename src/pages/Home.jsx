import { lazy, Suspense } from 'react';
import Hero from '../components/sections/Hero/Hero';
import Header from '../components/sections/Header/Header';
import CourseSection from '../components/sections/Courses/CourseSection';

// Below-fold sections — lazy loaded
const ArticleSection = lazy(() => import('../components/sections/Article/ArticleSection'));
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
                <div className="section-content-visibility">
                  <Suspense fallback={<SectionPlaceholder />}>
                      <ArticleSection />
                  </Suspense>
                </div>
                <div className="section-content-visibility">
                  <Suspense fallback={<SectionPlaceholder />}>
                     <CourseSection />
                  </Suspense>
                </div>
                <div className="section-content-visibility">
                  <Suspense fallback={<SectionPlaceholder />}>
                      <About />
                  </Suspense>
                </div>
                <div className="section-content-visibility">
                  <Suspense fallback={<SectionPlaceholder />}>
                      <Products />
                  </Suspense>
                </div>
                <div className="section-content-visibility">
                  <Suspense fallback={<SectionPlaceholder />}>
                      <NewLaunches />
                  </Suspense>
                </div>
                <div className="section-content-visibility">
                  <Suspense fallback={<SectionPlaceholder />}>
                      <Numerology />
                  </Suspense>
                </div>
                <div className="section-content-visibility">
                  <Suspense fallback={<SectionPlaceholder />}>
                      <Horoscope />
                  </Suspense>
                </div>
                <div className="section-content-visibility">
                  <Suspense fallback={<SectionPlaceholder />}>
                      <Testimonials />
                  </Suspense>
                </div>
                <div className="section-content-visibility">
                  <Suspense fallback={<SectionPlaceholder />}>
                     <Gallery/>
                  </Suspense>
                </div>
                <div className="section-content-visibility">
                  <Suspense fallback={<SectionPlaceholder />}>
                      <Partners />
                  </Suspense>
                </div>
                <div className="section-content-visibility">
                  <Suspense fallback={<SectionPlaceholder />}>
                      <Contact />
                  </Suspense>
                </div>
            </main>
            <div className="section-content-visibility">
              <Suspense fallback={null}>
                  <Footer />
              </Suspense>
            </div>
        </>
    );
};

export default Home;

