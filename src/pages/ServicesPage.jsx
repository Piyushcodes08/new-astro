import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/sections/Header/Header';
import Footer from '../components/sections/Footer/Footer';
import { servicesData } from '../data/pages/services';

const { hero, offerings, portals, cta } = servicesData;

const ServicesPage = () => {
    return (
        <>
            <Header />
            <main className="min-h-screen relative z-10 text-white overflow-hidden bg-transparent">
                {/* ── Services Hero Banner ─────────────────────────────────── */}
                <section className="hero-section">
                    <div className="bg-glow-container">
                        <div className="absolute top-[20%] left-[10%] w-[600px] h-[600px] bg-glow-red opacity-50"></div>
                        <div className="absolute bottom-[10%] right-[10%] w-[500px] h-[500px] bg-glow-gold opacity-30"></div>
                    </div>

                    <div className="section-container">
                        <div className="relative z-10 max-w-4xl mx-auto text-center">


                            <h1 className="title-batangas text-5xl md:text-7xl mb-8 leading-[1.1] text-white">
                                {hero.title} <br /> <span className="text-brand-red">{hero.titleHighlight}</span> {hero.titleSuffix}
                            </h1>

                            <p className="subtitle-poppins text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
                                {hero.subtitle}
                            </p>

                            <div className="flex flex-wrap gap-4 justify-center">
                                <Link
                                    to="/appointment"
                                    className="inline-block bg-brand-red text-white px-10 py-4 rounded-full font-bold uppercase tracking-wider transition-all duration-500 hover:bg-white hover:text-brand-red hover:-translate-y-1 shadow-[0_10px_30px_rgba(221,39,39,0.3)]"
                                >
                                    {hero.primaryButtonText}
                                </Link>
                                <a
                                    href="#all-services"
                                    className="inline-block bg-white/5 backdrop-blur-md border border-white/15 text-white px-10 py-4 rounded-full font-bold uppercase tracking-wider transition-all duration-500 hover:bg-white hover:text-black hover:-translate-y-1"
                                >
                                    {hero.secondaryButtonText}
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Services Grid ────────────────────────────────────────── */}
                <section id="all-services">
                    <div className="section-container">
                        <div className="text-center mb-16">
                            <h2 className="title-batangas text-4xl md:text-6xl mb-6 text-white">
                                {offerings.title} <span className="text-brand-red">{offerings.titleHighlight}</span>
                            </h2>
                            <p className="subtitle-poppins text-white/70 max-w-2xl mx-auto text-lg leading-relaxed">
                                {offerings.subtitle}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {offerings.items.map((srv, i) => (
                                <Link 
                                    to="/appointment" 
                                    key={i} 
                                    className="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] overflow-hidden hover:-translate-y-2 hover:border-brand-red/50 shadow-2xl transition-all duration-500 block"
                                >
                                    <div className="w-full relative bg-[#080101]/40">
                                        <img 
                                            src={srv.img} 
                                            alt={srv.title} 
                                            className="w-full h-auto block transition-transform duration-700 group-hover:scale-105" 
                                        />
                                        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent"></div>
                                    </div>
                                    <div className="p-8">
                                        <h3 className="title-batangas text-2xl mb-4 text-brand-red">{srv.title}</h3>
                                        <p className="subtitle-poppins text-white/80 leading-relaxed text-sm mb-6">{srv.desc}</p>
                                        <span className="text-brand-red font-bold text-xs tracking-widest uppercase flex items-center gap-2 group-hover:translate-x-2 transition-transform">
                                            Schedule Consultation →
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── Key Portals ──────────────────────────────────────────── */}
                <section>
                    <div className="section-container">
                        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[3rem] px-[15px] md:px-[50px] shadow-2xl">
                            <div className="text-center mb-16">
                                <h2 className="title-batangas text-4xl md:text-5xl text-white">
                                    {portals.title} <span className="text-brand-red">{portals.titleHighlight}</span>
                                </h2>
                            </div>

                            <div className="grid md:grid-cols-3 gap-8">
                                {portals.items.map((item, idx) => (
                                    <Link
                                        key={idx}
                                        to={item.link}
                                        className="bg-black/40 rounded-4xl overflow-hidden border border-white/10 hover:border-brand-red/50 transition-all duration-500 group block"
                                    >
                                        <div className="aspect-16/10 overflow-hidden">
                                            <img
                                                src={item.img}
                                                alt={item.title}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                            />
                                        </div>
                                        <div className="p-8 text-center">
                                            <h3 className="title-batangas text-2xl text-brand-red mb-2">{item.title}</h3>
                                            <p className="subtitle-poppins text-white/60 text-sm mb-6">{item.desc}</p>
                                            <span className="inline-block px-8 py-2 rounded-full bg-brand-red/10 border border-brand-red/30 text-brand-red text-xs font-bold uppercase tracking-widest group-hover:bg-brand-red group-hover:text-white transition-all">
                                                Enter Portal
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Final CTA ───────────────────────────────────────────── */}
                <section className="no-full-height">
                    <div className="section-container">
                        <div className="bg-linear-to-br from-brand-red/20 to-black/60 border border-brand-red/30 rounded-[3rem] px-[15px] md:px-[50px] text-center shadow-2xl relative overflow-hidden group">
                            <div className="absolute inset-0 bg-glow-red opacity-0 group-hover:opacity-30 transition-opacity duration-1000"></div>
                            <div className="relative z-10">
                                <h2 className="title-batangas text-4xl md:text-7xl mb-8 text-white leading-tight">
                                    {cta.title} <br /> <span className="text-brand-red">{cta.titleHighlight}</span>
                                </h2>
                                <p className="subtitle-poppins text-white/90 text-xl mb-12 max-w-2xl mx-auto leading-relaxed">
                                    {cta.subtitle}
                                </p>
                                <Link 
                                    to="/appointment" 
                                    className="inline-block bg-brand-red text-white px-8 py-3.5 rounded-full font-bold uppercase tracking-[0.2em] transition-all duration-500 hover:bg-white hover:text-brand-red hover:-translate-y-2 shadow-[0_15px_50px_rgba(221,39,39,0.4)] text-sm md:text-base"
                                >
                                    {cta.buttonText}
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
};

export default ServicesPage;

