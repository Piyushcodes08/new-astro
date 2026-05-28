import React from 'react';
import Header from '../components/sections/Header/Header';
import Footer from '../components/sections/Footer/Footer';

const PrivacyPolicyPage = () => {
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
                                Privacy <span className="text-[#dd2727]">Policy</span>
                            </h1>
                            <p className="subtitle-poppins text-lg text-white/60 max-w-xl mx-auto">
                                Your sacred data is handled with the utmost respect and cosmic integrity.
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
                                    <h2 className="title-batangas text-2xl md:text-3xl text-white mb-4">1. Information We Collect</h2>
                                    <p className="leading-relaxed">We collect information that you provide directly to us when you use our services, book an appointment, or contact us for support. This may include your name, email address, phone number, birth details (for astrological purposes), and any other information you choose to provide.</p>
                                </div>

                                <div>
                                    <h2 className="title-batangas text-2xl md:text-3xl text-white mb-4">2. How We Use Your Information</h2>
                                    <p className="leading-relaxed">We use the information we collect to provide, maintain, and improve our services. Specifically, your birth details are used solely for the purpose of generating astrological charts and providing consultations.</p>
                                </div>

                                <div>
                                    <h2 className="title-batangas text-2xl md:text-3xl text-white mb-4">3. Data Security</h2>
                                    <p className="leading-relaxed">We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction.</p>
                                </div>

                                <div>
                                    <h2 className="title-batangas text-2xl md:text-3xl text-white mb-4">4. Contact Us</h2>
                                    <p className="leading-relaxed">If you have any questions about this Privacy Policy, please contact us at <strong className="text-[#dd2727]">contact@vahlayastro.com</strong>.</p>
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

export default PrivacyPolicyPage;

