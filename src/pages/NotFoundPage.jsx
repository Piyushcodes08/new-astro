import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/sections/Header/Header';
import Footer from '../components/sections/Footer/Footer';

const NotFoundPage = () => {
    return (
        <>
            <Header />
            <main className="min-h-screen relative z-10 text-white overflow-hidden bg-transparent flex items-center justify-center pt-24">
                {/* Premium Transparent Cosmic Background - removed for global particles */}

                {/* Glow Effects */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#dd2727]/10 blur-[200px] rounded-full pointer-events-none"></div>

                <section className="max-w-[1170px] mx-auto px-[15px] md:px-[50px] py-16 text-center relative z-10">
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[3rem] p-16 md:p-24 shadow-[0_20px_80px_rgba(0,0,0,0.35)]">
                        <h1 className="title-batangas text-[8rem] md:text-[12rem] leading-none mb-6 text-[#dd2727] drop-shadow-[0_0_40px_rgba(221,39,39,0.5)]">
                            404
                        </h1>
                        <h2 className="title-batangas text-4xl md:text-5xl mb-8 text-white">
                            Lost in the Cosmos
                        </h2>
                        <p className="subtitle-poppins text-white/80 max-w-lg mx-auto mb-12 text-xl leading-relaxed">
                            The celestial body you are looking for has moved out of orbit or doesn't exist. Let's guide you back to familiar stars.
                        </p>
                        <Link
                            to="/"
                            className="inline-block bg-white/10 backdrop-blur-lg border border-white/20 text-white px-12 py-5 rounded-full font-bold uppercase tracking-wider transition-all duration-500 hover:bg-white hover:text-[#dd2727] shadow-[0_10px_30px_rgba(0,0,0,0.2)]"
                        >
                            Return Home
                        </Link>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
};

export default NotFoundPage;

