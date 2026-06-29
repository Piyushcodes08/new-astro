import React from 'react';
import { Link } from 'react-router-dom';
import { LuShieldCheck, LuHeart, LuLightbulb, LuTrophy, LuArrowRight } from "react-icons/lu";
import Header from '../components/sections/Header/Header';
import Footer from '../components/sections/Footer/Footer';
import Button from '../components/ui/Button/Button';
import { aboutData } from '../data/pages/about';

const { hero, whoWeAre, services, ambition, values, cta } = aboutData;

const AboutPage = () => {
    const getIcon = (type) => {
        switch (type) {
            case 'shield': return <LuShieldCheck />;
            case 'heart': return <LuHeart />;
            case 'lightbulb': return <LuLightbulb />;
            case 'trophy': return <LuTrophy />;
            default: return <LuShieldCheck />;
        }
    };

    return (
        <>
            <Header />

            <main className="min-h-screen relative z-10 text-white overflow-hidden bg-transparent">
                {/* Refined Minimalist Premium Banner */}
                <section className="hero-section">
            
                    <div className="section-container">
                        <div className="relative z-10 max-w-4xl w-full mx-auto text-center">


                            {/* Bold White Title */}
                            <h1 className="title-batangas text-4xl sm:text-5xl md:text-7xl text-white font-black mb-6 leading-[1.1]">
                                {hero.title} <br /> <span className="text-brand-red">{hero.titleHighlight}</span>
                            </h1>

                            {/* Red Subtitle */}
                            <p className="subtitle-poppins text-lg md:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed font-medium">
                                {hero.subtitle}
                            </p>

                            {/* Red Dot Divider */}
                            <div className="mt-12 flex items-center justify-center gap-4">
                                <div className="h-px w-12 bg-linear-to-r from-transparent to-white/10"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-brand-red shadow-[0_0_15px_#bf0603]"></div>
                                <div className="h-px w-12 bg-linear-to-l from-transparent to-white/10"></div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 1. Who We Are */}
                <section className="no-full-height">
                    <div className="section-container">
                        <div className="grid md:grid-cols-2 gap-8 items-center">
                            <div className="rounded-xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_20px_80px_rgba(0,0,0,0.35)] flex items-center justify-center p-1.5 max-w-md">
                                <img
                                    src={whoWeAre.image}
                                    alt={whoWeAre.title}
                                    loading="lazy"
                                    className="w-full h-full object-cover rounded-lg"
                                />
                            </div>

                            <div className="space-y-8">
                                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 md:p-10 shadow-2xl relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-linear-to-br from-brand-red/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                                    <h2 className="title-batangas text-3xl md:text-4xl mb-4 text-white relative z-10">{whoWeAre.title}</h2>
                                    <p className="subtitle-poppins text-base text-white/70 leading-relaxed relative z-10">{whoWeAre.description}</p>
                                </div>

                                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 md:p-10 shadow-2xl relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-linear-to-br from-brand-red/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                                    <h2 className="title-batangas text-3xl md:text-4xl mb-4 text-white relative z-10">{whoWeAre.philosophyTitle}</h2>
                                    <p className="subtitle-poppins text-base text-white/70 leading-relaxed relative z-10">{whoWeAre.philosophyDescription}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 2. Services Grid */}
                 <section className="text-center">
                    <div className="bg-glow-container">
                        <div className="absolute top-[50%] right-0 w-[600px] h-[600px] bg-glow-red opacity-20"></div>
                    </div>
                    <div className="section-container">
                        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-xl px-[15px] md:px-[50px] py-8 md:py-16 shadow-2xl relative z-10">
                            <h2 className="title-batangas text-3xl md:text-6xl mb-8 text-white">
                                {services.title} <span className="text-brand-red">{services.titleHighlight}</span> {services.titleSuffix}
                            </h2>

                            <div className="grid md:grid-cols-3 gap-8">
                                {services.items.map((srv, idx) => (
                                    <Link
                                        key={idx}
                                        to={srv.link}
                                        className="bg-[#150a0a]/80 backdrop-blur-lg border border-white/10 rounded-md py-6 px-[15px] md:px-[50px] hover:scale-[1.05] hover:border-brand-red/40 shadow-xl hover:shadow-[0_20px_50px_rgba(191, 6, 3,0.25)] transition-all duration-500 block text-center group flex flex-col items-center justify-between min-h-[260px]"
                                    >
                                        <div className="w-full">
                                            <h3 className="title-batangas text-3xl mb-4 text-brand-red group-hover:scale-110 transition-transform duration-300">
                                                {srv.title}
                                            </h3>
                                            <p className="subtitle-poppins text-white/70 leading-relaxed mb-6 text-base">
                                                {srv.desc}
                                            </p>
                                        </div>
                                        <span className="inline-flex items-center gap-3 text-sm font-bold uppercase tracking-[0.2em] text-brand-red group-hover:text-white transition-colors duration-300">
                                            Explore
                                            <LuArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* 3. Ambition & Vision */}
                <section>
                    <div className="section-container">
                        <div className="grid md:grid-cols-2 gap-8">
                            {ambition.items.map((item, idx) => (
                                <div
                                    key={idx}
                                    className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg px-[15px] md:px-[50px] py-8 md:py-12 text-center shadow-[0_15px_50px_rgba(0,0,0,0.3)] hover:border-brand-red/30 transition-all duration-500"
                                >
                                    <h3 className="title-batangas text-3xl mb-4 text-brand-red">
                                        {item.title}
                                    </h3>
                                    <p className="subtitle-poppins text-white/80 leading-relaxed text-lg">
                                        {item.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 4. Core Values */}
                <section>
                    <div className="section-container">
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl px-[15px] md:px-[50px] py-10 md:py-16">
                            <h2 className="title-batangas text-3xl md:text-6xl text-center mb-10 text-white">
                                {values.title} <span className="text-brand-red">{values.titleHighlight}</span>
                            </h2>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                                {values.items.map((val, idx) => (
                                    <div
                                        key={idx}
                                        className="bg-white/5 border border-white/10 backdrop-blur-lg rounded-md px-[15px] md:px-[50px] py-[15px] text-center hover:border-brand-red/60 hover:bg-white/10 transition-all duration-500 flex flex-col items-center group"
                                    >
                                        <div className="text-6xl mb-8 text-white group-hover:scale-110 group-hover:text-brand-red transition-all duration-500">
                                            {getIcon(val.iconType)}
                                        </div>
                                        <h4 className="title-batangas text-2xl mb-4 text-white">
                                            {val.title}
                                        </h4>
                                        <p className="subtitle-poppins text-base text-white/70 leading-relaxed">
                                            {val.desc}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* 5. CTA */}
                <section>
                    <div className="section-container">
                        <div className="bg-linear-to-br from-brand-red/20 to-black border border-brand-red/30 rounded-xl px-[15px] md:px-[50px] py-10 md:py-16 text-center shadow-[0_30px_100px_rgba(191, 6, 3,0.25)] relative overflow-hidden group">
                            <div className="absolute inset-0 bg-glow-red opacity-0 group-hover:opacity-40 transition-opacity duration-1000"></div>
                            <div className="relative z-10">
                                <h2 className="title-batangas text-4xl md:text-7xl mb-8 text-white">
                                    {cta.title}
                                </h2>

                                <p className="subtitle-poppins text-white/90 text-xl mb-12 max-w-3xl mx-auto leading-relaxed">
                                    {cta.subtitle}
                                </p>

                                <Button to="/services" variant="primary" size="lg">
                                    {cta.buttonText}
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </>
    );
};

export default AboutPage;

