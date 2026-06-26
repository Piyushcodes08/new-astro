import React from 'react';
import Header from '../components/sections/Header/Header';
import Footer from '../components/sections/Footer/Footer';

const FAQPage = () => {
    const faqs = [
        {
            question: "What is Vedic Astrology?",
            answer: "Vedic Astrology, also known as Jyotish, is an ancient Indian science that explains planetary motions and positions with respect to time and their effect on humans and other entities on Earth."
        },
        {
            question: "How can astrology help me?",
            answer: "Astrology provides insights into your personality, strengths, and life path. It can guide you in making informed decisions regarding career, relationships, and personal growth."
        },
        {
            question: "Are consultations strictly confidential?",
            answer: "Yes, we maintain strict confidentiality for all our clients. Your personal information and consultation details are never shared with third parties."
        },
        {
            question: "How do I book an appointment?",
            answer: "You can book an appointment by visiting our Appointment page to schedule a session, or by reaching out to us via the Contact page for general inquiries."
        }
    ];

    return (
        <>
            <Header />
            <main className="min-h-screen relative z-10 text-white overflow-hidden bg-transparent">
                <section className="hero-section">
                    {/* Background Glows */}
                    <div className="bg-glow-container">
                        <div className="absolute top-[20%] left-[10%] w-[600px] h-[600px] bg-glow-red opacity-45"></div>
                        <div className="absolute bottom-[10%] right-[10%] w-[500px] h-[500px] bg-glow-gold opacity-20"></div>
                    </div>

                    <div className="section-container">
                        <div className="relative z-10 w-full flex flex-col items-center justify-center text-center px-[15px] md:px-[50px]">

                            <h1 className="title-batangas text-5xl md:text-7xl mb-6 text-white leading-tight">
                                Frequently Asked <br /> <span className="text-[#bf0603]">Questions</span>
                            </h1>
                            <p className="subtitle-poppins text-lg md:text-xl text-white/80 max-w-2xl mx-auto font-medium">
                                Find answers to the most common questions about our sacred astrological 
                                services and consultation processes.
                            </p>
                        </div>
                    </div>
                </section>

                <section>
                    <div className="section-container">
                        <div className="max-w-4xl mx-auto space-y-6">
                            {faqs.map((faq, index) => (
                                <div key={index} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-8 hover:bg-white/10 hover:border-[#bf0603]/40 shadow-[0_10px_40px_rgba(0,0,0,0.25)] transition-all duration-500 text-center">
                                    <h3 className="title-batangas text-2xl md:text-3xl mb-4 text-[#bf0603]">{faq.question}</h3>
                                    <p className="subtitle-poppins text-white/80 leading-relaxed text-lg">{faq.answer}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
};

export default FAQPage;

