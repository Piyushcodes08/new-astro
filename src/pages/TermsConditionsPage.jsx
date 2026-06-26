import React from 'react';
import Header from '../components/sections/Header/Header';
import Footer from '../components/sections/Footer/Footer';

const TermsConditionsPage = () => {
    return (
        <>
            <Header />
            <main className="min-h-screen relative z-10 text-white overflow-hidden bg-transparent">
                <section className="hero-section">
                    {/* Background Glows */}
                    <div className="bg-glow-container">
                        <div className="absolute top-[20%] left-[10%] w-[500px] h-[500px] bg-glow-red opacity-40"></div>
                        <div className="absolute bottom-[10%] right-[10%] w-[400px] h-[400px] bg-glow-gold opacity-20"></div>
                    </div>

                    <div className="section-container">
                        <div className="relative z-10 max-w-4xl mx-auto text-center">

                            <h1 className="title-batangas text-5xl md:text-7xl mb-6 text-white leading-tight">
                                Terms & <span className="text-[#bf0603]">Conditions</span>
                            </h1>
                            <p className="subtitle-poppins text-lg text-white/60 max-w-xl mx-auto">
                                Please review the sacred agreements that govern our astrological journey together.
                            </p>
                        </div>
                    </div>
                </section>

                <section>
                    <div className="section-container">
                        <div className="max-w-4xl mx-auto bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-10 md:p-16 shadow-[0_20px_80px_rgba(0,0,0,0.35)] text-center">
                            <div className="subtitle-poppins text-white/80 space-y-8 text-lg">
                                <p className="text-white/50 border-b border-white/10 pb-6">Last updated: April 2026</p>

                                <div>
                                    <h2 className="title-batangas text-2xl md:text-3xl text-white mb-4">1. Acceptance of Terms</h2>
                                    <p className="leading-relaxed">By accessing and using Vahlay Astro's website and services, you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you may not use our services.</p>
                                </div>

                                <div>
                                    <h2 className="title-batangas text-2xl md:text-3xl text-white mb-4">2. Nature of Services</h2>
                                    <p className="leading-relaxed">Astrology is an ancient art and science. The consultations, courses, and readings provided by Vahlay Astro are for guidance and self-reflection purposes. They should not replace professional medical, legal, or financial advice.</p>
                                </div>

                                <div>
                                    <h2 className="title-batangas text-2xl md:text-3xl text-white mb-4">3. Bookings and Cancellations</h2>
                                    <p className="leading-relaxed">Appointments must be booked in advance. Cancellations must be made at least 24 hours prior to the scheduled consultation time. We reserve the right to reschedule appointments in case of unforeseen circumstances.</p>
                                </div>

                                <div>
                                    <h2 className="title-batangas text-2xl md:text-3xl text-white mb-4">4. Intellectual Property</h2>
                                    <p className="leading-relaxed">All content on this website, including courses, articles, graphics, and logos, is the property of Vahlay Astro and is protected by copyright laws. Unauthorized use or distribution is prohibited.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
};

export default TermsConditionsPage;

