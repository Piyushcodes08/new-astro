import { lazy, Suspense } from 'react';
import Hero from '../components/sections/Hero/Hero';
import Header from '../components/sections/Header/Header';
import CourseSection from '../components/sections/Courses/CourseSection';


// Below-fold sections — lazy loaded
const ArticleSection = lazy(() => import('../components/sections/Article/ArticleSection'));
const About          = lazy(() => import('../components/sections/About/About'));
const Products       = lazy(() => import('../components/sections/products/Products'));
const Horoscope      = lazy(() => import('../components/sections/Horoscope/Horoscope'));
const Numerology     = lazy(() => import('../components/sections/Numerology/Numerology'));
const Testimonials   = lazy(() => import('../components/sections/Testimonials/Testimonials'));
const Gallery        = lazy(() => import('../components/sections/gallery/Gallery'));
const Partners       = lazy(() => import('../components/sections/Partners/Partners'));
const Contact        = lazy(() => import('../components/sections/Contact/Contact'));
const Footer         = lazy(() => import('../components/sections/Footer/Footer'));

// Minimal section placeholder while loading
const SectionPlaceholder = () => (
  <div style={{ minHeight: '200px' }} />
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
                <CourseSection />

                {/* Below-fold — lazy loaded */}
                <Suspense fallback={<SectionPlaceholder />}>
                    <ArticleSection />
                </Suspense>
                <Suspense fallback={<SectionPlaceholder />}>
                    <About />
                </Suspense>
                <Suspense fallback={<SectionPlaceholder />}>
                    <Products />
                </Suspense>
                  <Suspense fallback={<SectionPlaceholder />}>
                    <Numerology />
                </Suspense>
                <Suspense fallback={<SectionPlaceholder />}>
                    <Horoscope />
                </Suspense>
                <Suspense fallback={<SectionPlaceholder />}>
                    <Testimonials />
                </Suspense>
                 <Suspense fallback={<SectionPlaceholder />}>
                   <Gallery/>
                </Suspense>
                <Suspense fallback={<SectionPlaceholder />}>
                    <Partners />
                </Suspense>  
                <Suspense fallback={<SectionPlaceholder />}>
                    <Contact />
                </Suspense>
            </main>
            <Suspense fallback={null}>
                <Footer />
            </Suspense>
        </>
    );
};

export default Home;
