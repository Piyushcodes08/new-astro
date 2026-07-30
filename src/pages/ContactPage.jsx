import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../components/sections/Header/Header';
import Footer from '../components/sections/Footer/Footer';
import Contact from '../components/sections/Contact/Contact';

const CallIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 3.08 4.18 2 2 0 0 1 5 2h3a2 2 0 0 1 2 1.72 12.6 12.6 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L9.11 9.11a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.6 12.6 0 0 0 2.81.7A2 2 0 0 1 22 16.92Z" />
  </svg>
);

const MailIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8">
    <path d="M3 6h18" />
    <path d="m3 6 9 7 9-7" />
    <path d="M21 18H3V6" />
  </svg>
);

const ContactPage = () => {
    const location = useLocation();

    useEffect(() => {
        if (location.hash) {
            const id = location.hash.replace('#', '');
            const element = document.getElementById(id);
            if (element) {
                setTimeout(() => {
                    element.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            }
        } else {
            window.scrollTo(0, 0);
        }
    }, [location]);

    return (
        <>
            <Header />
            <main className="min-h-screen relative z-10 text-white overflow-hidden bg-transparent">
                {/* Contact Hero Banner */}
                <section className="hero-section">
                

                    <div className="section-container">
                        <div className="relative z-10 max-w-4xl w-full mx-auto text-center">

                            {/* Bold White Title */}
                            <h1 className="title-batangas text-5xl md:text-7xl text-white font-black mb-6 leading-[1.1]">
                                Get in Touch <br /> with the <span className="text-[#bf0603]">Universe</span>
                            </h1>

                            {/* Red Subtitle */}
                            <p className="subtitle-poppins text-lg md:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed font-medium">
                                We are here to answer your questions and guide you on your cosmic journey.
                            </p>

                            {/* Red Dot Divider */}
                            <div className="mt-12 flex items-center justify-center gap-4">
                                <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-white/10"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-[#bf0603] shadow-[0_0_15px_#bf0603]"></div>
                                <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-white/10"></div>
                            </div>
                        </div>
                    </div>
                </section>

                <Contact />

                <section>
                    <div className="section-container">
                        <div className="grid md:grid-cols-2 gap-12 items-center bg-white/5 backdrop-blur-2xl border border-white/10 rounded-xl px-[15px] md:px-[50px] py-10 md:py-16 shadow-2xl relative overflow-hidden group">
                            <div>
                                <h2 className="title-batangas text-4xl md:text-5xl mb-8 text-white">Need immediate <span className="text-[#bf0603]">assistance?</span></h2>
                                <p className="subtitle-poppins text-white/80 mb-6 leading-relaxed text-lg">
                                    Our team is ready to help you schedule your consultation or answer any questions you might have about our services and courses.
                                </p>
                                <p className="subtitle-poppins text-white/80 leading-relaxed mb-8 text-lg">
                                    For urgent matters, please use our WhatsApp line or call our landline directly during business hours (9:00 AM - 6:00 PM IST).
                                </p>
                            </div>
                            <div className="space-y-6">
                                <a
                                     href="tel:+917949217538"
                                     className="flex flex-col sm:flex-row items-center gap-6 bg-white/5 backdrop-blur-lg px-[15px] md:px-[50px] py-6 md:py-8 rounded-lg border border-white/10 hover:border-[#bf0603]/60 hover:bg-white/10 transition-all duration-500 group text-center sm:text-left"
                                 >
                                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#bf0603]/40 to-orange-500/20 border border-[#bf0603]/30 flex items-center justify-center text-white text-3xl shadow-[0_0_20px_rgba(191, 6, 3,0.3)] group-hover:scale-110 transition-transform duration-500">
                                        <CallIcon aria-hidden="true" />
                                    </div>
                                    <div>
                                        <p className="subtitle-poppins text-sm text-white/50 mb-1 font-bold uppercase tracking-widest">Call Us Directly</p>
                                        <p className="title-batangas text-2xl text-white group-hover:text-[#bf0603] transition-colors">+91 79 4921 7538</p>
                                    </div>
                                </a>

                                <a
                                     href="mailto:contact@vahlayastro.com"
                                     className="flex flex-col sm:flex-row items-center gap-6 bg-white/5 backdrop-blur-lg px-[15px] md:px-[50px] py-6 md:py-8 rounded-lg border border-white/10 hover:border-[#bf0603]/60 hover:bg-white/10 transition-all duration-500 group text-center sm:text-left"
                                 >
                                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#bf0603]/40 to-orange-500/20 border border-[#bf0603]/30 flex items-center justify-center text-white text-3xl shadow-[0_0_20px_rgba(191, 6, 3,0.3)] group-hover:scale-110 transition-transform duration-500">
                                        <MailIcon aria-hidden="true" />
                                    </div>
                                    <div>
                                        <p className="subtitle-poppins text-sm text-white/50 mb-1 font-bold uppercase tracking-widest">Email Support</p>
                                        <p className="title-batangas text-2xl text-white group-hover:text-[#bf0603] transition-colors">contact@vahlayastro.com</p>
                                    </div>
                                </a>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
};

export default ContactPage;

