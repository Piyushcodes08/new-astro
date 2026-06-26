import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/sections/Header/Header';
import Footer from '../components/sections/Footer/Footer';
import Testimonials from '../components/sections/Testimonials/Testimonials';

const TestimonialsPage = () => {
    return (
        <>
            <Header />
            <main className="min-h-screen relative z-10 text-white overflow-hidden bg-transparent">
                {/* Premium Transparent Cosmic Background */}
                <div className="absolute inset-0 -z-10 bg-gradient-to-br from-black via-[#1a0f0f]/90 to-[#2b0b0b]/95"></div>

                {/* Glow Effects */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#bf0603]/20 blur-[180px] rounded-full pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-orange-400/10 blur-[180px] rounded-full pointer-events-none"></div>

                <section className="hero-banner hero-section">
                    <div className="section-container !pb-0">
                        <div className="relative w-full text-center px-[15px] md:px-[50px]">
                            <h1 className="title-batangas text-4xl md:text-6xl mb-6 text-white">Client Success Stories</h1>
                            <p className="subtitle-poppins text-lg text-white/80 max-w-2xl mx-auto">
                                Read about the transformative experiences our clients have had through our astrological guidance.
                            </p>
                        </div>
                    </div>
                </section>

                <Testimonials />

                <section>
                    <div className="section-container">
                        <div className="bg-gradient-to-r from-[#bf0603]/90 to-orange-500/80 backdrop-blur-xl border border-white/10 rounded-xl p-8 md:p-16 max-w-4xl mx-auto shadow-[0_15px_60px_rgba(191, 6, 3,0.35)] text-center">
                            <h2 className="title-batangas text-4xl mb-6 text-white">Become Our Next Success Story</h2>
                            <p className="subtitle-poppins text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed text-base md:text-lg">
                                Every journey of a thousand miles begins with a single step. Let the stars illuminate your path and help you discover your true potential.
                            </p>
                            <Link to="/contact" className="inline-block bg-white/10 backdrop-blur-lg border border-white/20 text-white px-8 py-3 rounded-full font-bold uppercase tracking-wider transition-all duration-500 hover:bg-white hover:text-[#bf0603] text-sm md:text-base">
                                Schedule Your Reading
                            </Link>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
};

export default TestimonialsPage;

