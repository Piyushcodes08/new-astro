import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LuArrowRight, LuCalendar, LuStar, LuClock, LuUserPlus, LuRocket } from 'react-icons/lu';
import Header from '../components/sections/Header/Header';
import Footer from '../components/sections/Footer/Footer';
import { db } from '../firebaseConfig';
import { collection, getDocs, limit, query } from 'firebase/firestore';
import { consultingData } from '../data/pages/consulting';

const { hero, stats, services, process, testimonials: testimonialsContent, highlights, cta } = consultingData;

const ConsultingPage = () => {
    const [testimonials, setTestimonials] = useState([]);

    useEffect(() => {
        const fetchTestimonials = async () => {
            try {
                const q = query(collection(db, 'testimonials'), limit(3));
                const snap = await getDocs(q);
                const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
                setTestimonials(data);
            } catch (err) {
                console.error('Testimonials fetch error:', err);
            }
        };
        fetchTestimonials();
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'calendar': return <LuCalendar />;
            case 'user': return <LuUserPlus />;
            case 'clock': return <LuClock />;
            case 'rocket': return <LuRocket />;
            default: return <LuCalendar />;
        }
    };

    return (
        <>
            <Header />
            <main className="min-h-screen relative z-10 text-white overflow-hidden bg-transparent font-sans">
                {/* ── Hero Section ────────────────────────────────────────── */}
                <section className="hero-section relative">
                    <div className="bg-glow-container pointer-events-none">
                        <div className="absolute top-[20%] left-[10%] w-[500px] h-[500px] bg-brand-red/5 blur-[100px] rounded-full opacity-50"></div>
                    </div>

                    <div className="section-container relative">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="relative z-10 max-w-4xl mx-auto text-center"
                        >


                            <h1 className="title-batangas text-4xl md:text-6xl text-white font-black mb-6 leading-[1.1] tracking-tight uppercase">
                                {hero.title} <br /> <span className="text-brand-red">{hero.titleHighlight}</span>
                            </h1>

                            <p className="subtitle-poppins text-base md:text-lg text-white/50 max-w-2xl mx-auto leading-relaxed mb-10 italic">
                                {hero.subtitle}
                            </p>

                            <div className="flex flex-wrap gap-6 justify-center items-center">
                                <Link
                                    to="/appointment"
                                    className="px-10 py-4 rounded-full font-black uppercase tracking-[0.2em] text-white transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(221,39,39,0.4)] bg-brand-red flex items-center gap-3 text-xs"
                                >
                                    {hero.buttonText} <LuCalendar className="w-4 h-4" />
                                </Link>
                                <a
                                    href="#offerings"
                                    className="px-10 py-4 rounded-full font-black uppercase tracking-[0.2em] transition-all duration-500 hover:-translate-y-1 bg-white/5 border border-white/10 text-white hover:bg-white hover:text-black text-xs"
                                >
                                    {hero.secondaryButtonText}
                                </a>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* ── Stats Section ───────────────────────────────────────── */}
                <section className="no-full-height">
                    <div className="section-container py-0!">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {stats.map((s, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className="bg-[#0d0606] border border-[#fdfcf0]/10 rounded-lg py-6 px-[15px] md:px-[50px] text-center shadow-[0_10px_30px_rgba(0,0,0,0.3)] hover:border-brand-red/30 transition-all duration-500 group"
                                >
                                    <div className="title-batangas text-2xl md:text-4xl font-black text-brand-red mb-1 group-hover:scale-105 transition-transform duration-500">
                                        {s.num}
                                    </div>
                                    <div className="subtitle-poppins text-white/30 text-[8px] font-black uppercase tracking-[0.4em]">{s.label}</div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── Services Section ────────────────────────────────────── */}
                <section id="offerings">
                    <div className="section-container">
                        <div className="text-center mb-10">
                            <h2 className="title-batangas text-3xl md:text-6xl text-white mb-4 tracking-tight leading-none uppercase">
                                {services.title} <span className="text-brand-red">{services.titleHighlight}</span>
                            </h2>
                            <p className="subtitle-poppins text-white/40 max-w-3xl mx-auto text-sm md:text-base leading-relaxed italic">
                                {services.description}
                            </p>
                        </div>

                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                        >
                            {services.items.map((srv, i) => (
                                <motion.div key={i} variants={itemVariants} className="group h-full">
                                    <div className="relative bg-[#0d0606] border border-[#fdfcf0]/10 rounded-lg overflow-hidden h-full flex flex-col shadow-[0_15px_40px_rgba(0,0,0,0.4)] transition-all duration-500 hover:border-brand-red/40 hover:-translate-y-1 group/card">
                                        {/* Image Area */}
                                        <div className="relative w-full aspect-video overflow-hidden">
                                            <div className="absolute inset-0 bg-linear-to-t from-[#0d0606] via-transparent to-transparent z-10 opacity-70"></div>
                                            <img
                                                src={srv.img}
                                                alt={srv.title}
                                                className="w-full h-full object-cover transition-transform duration-[3s] group-hover/card:scale-110"
                                            />
                                            {/* Tag */}
                                            <div className="absolute top-5 right-5 z-20">
                                                <span className="px-3 py-1.5 rounded-sm bg-brand-red text-white text-[8px] font-black uppercase tracking-[0.2em] shadow-lg">
                                                    {srv.tag}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="p-5 flex flex-col flex-1 bg-[#dd2727]">
                                            <h3 className="title-batangas text-lg md:text-xl mb-4 text-white leading-[1.3] tracking-tight uppercase font-black">
                                                {srv.title}
                                            </h3>
                                            <p className="subtitle-poppins text-white text-sm md:text-base leading-relaxed mb-4 flex-1 italic">
                                                {srv.description}
                                            </p>
                                            <div className="mt-auto pt-6 border-t border-white/10 flex items-center justify-between">
                                                <Link
                                                    to="/appointment"
                                                    className="inline-flex items-center gap-3 font-black text-[9px] uppercase tracking-[0.3em] text-white hover:opacity-80 transition-all"
                                                >
                                                    Book Session <LuArrowRight className="w-4 h-4" />
                                                </Link>
                                                <div className="flex text-white/20 group-hover/card:text-white/40 transition-all duration-500 gap-0.5">
                                                    {[...Array(5)].map((_, idx) => <LuStar key={idx} size={10} fill="currentColor" />)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </section>

                {/* ── Process Section ─────────────────────────────────────── */}
                <section className="no-full-height">
                    <div className="section-container">
                        <div className="bg-[#0d0606] border border-white/5 rounded-xl px-[15px] md:px-[50px] py-10 md:py-16 relative overflow-hidden shadow-[0_30px_70px_rgba(0,0,0,0.5)]">
                            <div className="relative z-10 text-center mb-12 md:mb-20">
                                <h2 className="title-batangas text-3xl md:text-6xl text-white mb-4 tracking-tight uppercase leading-none font-black">
                                    {process.title} <span className="text-brand-red">{process.titleHighlight}</span>
                                </h2>
                                <p className="subtitle-poppins text-white/30 text-base md:text-lg font-medium tracking-wide max-w-3xl mx-auto italic">
                                    {process.subtitle}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 relative z-10">
                                {process.steps.map((step, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.1 }}
                                        className="text-center group"
                                    >
                                        <div className="relative mb-8 inline-block">
                                            <div className="w-16 h-16 md:w-20 md:h-20 bg-brand-red/5 border border-brand-red/20 rounded-lg flex items-center justify-center text-2xl md:text-3xl text-brand-red transition-all duration-500 group-hover:bg-brand-red group-hover:text-white">
                                                {getIcon(step.iconType)}
                                            </div>
                                            <div className="absolute -top-2 -right-2 w-8 h-8 md:w-10 md:h-10 bg-white text-black font-black flex items-center justify-center rounded-full text-[10px] shadow-xl z-20 transition-all duration-500">
                                                {step.step}
                                            </div>
                                        </div>
                                        <h3 className="title-batangas text-xl text-white mb-4 group-hover:text-brand-red transition-colors uppercase tracking-tight">{step.title}</h3>
                                        <p className="subtitle-poppins text-white/30 text-xs leading-relaxed italic">
                                            {step.desc}
                                        </p>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Testimonials ────────────────────────────────────────── */}
                {testimonials.length > 0 && (
                    <section>
                        <div className="section-container">
                            <div className="text-center mb-12 md:mb-20">
                                <h2 className="title-batangas text-3xl md:text-6xl text-white mb-4 tracking-tight uppercase leading-none font-black">
                                    {testimonialsContent.title} <span className="text-brand-red">{testimonialsContent.titleHighlight}</span>
                                </h2>
                                <p className="subtitle-poppins text-white/40 text-sm tracking-widest uppercase italic">{testimonialsContent.subtitle}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                                {testimonials.map((t, i) => (
                                    <motion.div
                                        key={t.id || i}
                                        initial={{ opacity: 0, y: 30 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.1 }}
                                        className="bg-[#0d0606] border border-[#fdfcf0]/10 rounded-lg px-[15px] md:px-[50px] py-8 flex flex-col hover:border-brand-red/30 transition-all duration-500 shadow-[0_20px_50px_rgba(0,0,0,0.4)] group relative"
                                    >
                                        <div className="text-6xl mb-8 text-brand-red/10 group-hover:text-brand-red/20 transition-all font-serif italic">"</div>
                                        <p className="subtitle-poppins text-white/70 italic leading-relaxed flex-1 text-base mb-12 font-medium">
                                            {t.review || t.message || t.text || 'Incredible experience! The insights were truly life-changing and provided exactly the clarity I was looking for.'}
                                        </p>
                                        <div className="flex items-center gap-4 mt-auto pt-8 border-t border-white/5">
                                            <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-black text-xl bg-brand-red shadow-xl">
                                                {(t.name || t.clientName || 'C')[0].toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="text-white font-black text-base tracking-tight uppercase">
                                                    {t.name || t.clientName || 'Happy Client'}
                                                </div>
                                                <div className="flex text-yellow-500/40 gap-1 mt-1">
                                                    {[...Array(5)].map((_, idx) => <LuStar key={idx} size={10} fill="currentColor" />)}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* ── Highlights Section ──────────────────────────────────── */}
                <section className="mb-24">
                    <div className="section-container">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1 }}
                            className="rounded-xl overflow-hidden relative border border-white/5 shadow-[0_30px_80px_rgba(0,0,0,0.6)] group min-h-[400px] md:min-h-[500px] flex items-center justify-center"
                        >
                            <img
                                src={hero.heroImage}
                                alt="Consulting"
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-[4s] group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-linear-to-t from-[#0a0505] via-[#0a0505]/40 to-transparent"></div>

                            <div className="relative z-10 text-center p-12 max-w-4xl mx-auto">
                                <h2 className="title-batangas text-4xl md:text-7xl text-white mb-8 drop-shadow-2xl uppercase tracking-tighter leading-none font-black">
                                    {highlights.title} <span className="text-brand-red">{highlights.titleHighlight}</span>
                                </h2>
                                <p className="subtitle-poppins text-white/80 max-w-2xl mx-auto mb-12 text-lg md:text-xl leading-relaxed font-medium italic">
                                    {highlights.subtitle}
                                </p>
                                <Link
                                    to="/appointment"
                                    className="px-12 py-4 rounded-full font-black uppercase tracking-[0.3em] transition-all duration-500 hover:-translate-y-1 bg-brand-red text-white shadow-3xl text-xs inline-block"
                                >
                                    {highlights.buttonText}
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* ── Final CTA Section ───────────────────────────────────── */}
                <section>
                    <div className="section-container">
                        <div className="rounded-xl px-[15px] md:px-[50px] py-10 md:py-20 text-center bg-linear-to-br from-brand-red/10 via-[#0d0606] to-black border border-white/5 relative overflow-hidden group shadow-[0_30px_100px_rgba(0,0,0,0.7)]">
                            <div className="relative z-10">
                                <h2 className="title-batangas text-4xl md:text-7xl text-white mb-8 leading-[0.9] tracking-tighter uppercase font-black">
                                    {cta.title} <br /> <span className="text-brand-red">{cta.titleHighlight}</span>
                                </h2>
                                <p className="subtitle-poppins text-white/50 text-xl md:text-2xl mb-16 max-w-4xl mx-auto leading-relaxed italic">
                                    {cta.subtitle}
                                </p>
                                <div className="flex flex-wrap gap-8 justify-center items-center">
                                    <Link
                                        to="/appointment"
                                        className="px-12 py-5 rounded-full font-black uppercase tracking-[0.2em] text-white transition-all duration-500 hover:-translate-y-1 bg-brand-red shadow-[0_20px_50px_rgba(221,39,39,0.4)] text-xs"
                                    >
                                        {cta.primaryButtonText}
                                    </Link>
                                    <Link
                                        to="/contact"
                                        className="px-12 py-5 rounded-full font-black uppercase tracking-[0.2em] transition-all duration-500 hover:-translate-y-1 bg-white/5 border border-white/10 text-white hover:bg-white hover:text-black text-xs"
                                    >
                                        {cta.secondaryButtonText}
                                    </Link>
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

export default ConsultingPage;

