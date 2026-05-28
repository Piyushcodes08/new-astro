import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/sections/Header/Header';
import Footer from '../components/sections/Footer/Footer';
import { fallbackProducts, ProductCard } from '../components/sections/products/Products';
import { useProducts } from '../hooks/useProducts';

const ProductsPage = () => {
    const { products, loading } = useProducts();
    const displayProducts = products.length > 0 ? products : fallbackProducts;

    return (
        <>
            <Header />
            <main className="min-h-screen relative z-10 text-white overflow-hidden bg-transparent">
                {/* Hero Banner */}
                <section className="hero-section pt-24 pb-12">
                    <div className="bg-glow-container">
                        <div className="absolute top-[20%] left-[10%] w-[600px] h-[600px] bg-glow-red opacity-50"></div>
                        <div className="absolute top-[10%] right-[5%] w-[500px] h-[500px] bg-glow-gold opacity-20"></div>
                    </div>

                    <div className="section-container">
                        <div className="relative z-10 max-w-4xl w-full mx-auto text-center">
                            <h1 className="title-batangas text-5xl md:text-7xl text-white font-black mb-6 leading-[1.1]">
                                Sacred <span className="text-brand-red">Shop</span>
                            </h1>

                            <p className="subtitle-poppins text-lg md:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed font-medium">
                                Handpicked spiritual products to elevate your energy and transform your life. Browse our exclusive collection.
                            </p>

                            <div className="mt-12 flex items-center justify-center gap-4">
                                <div className="h-px w-12 bg-gradient-to-r from-transparent to-white/10"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-brand-red shadow-[0_0_15px_#dd2727]"></div>
                                <div className="h-px w-12 bg-gradient-to-l from-transparent to-white/10"></div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Products Grid */}
                <section className="pb-24">
                    <div className="section-container">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12 mx-auto justify-items-center">
                            {loading ? (
                                <div className="col-span-1 md:col-span-2 lg:col-span-3 py-20 text-center animate-pulse">
                                    <p className="text-brand-red font-bold uppercase tracking-[0.3em]">Summoning Artifacts...</p>
                                </div>
                            ) : (
                                displayProducts.map((p, index) => (
                                    <ProductCard key={`shop-product-${index}`} p={p} index={index} />
                                ))
                            )}
                        </div>
                    </div>
                </section>

                {/* Call to Action */}
                <section className="pb-24">
                    <div className="bg-glow-container">
                        <div className="absolute bottom-0 left-[20%] w-[600px] h-[600px] bg-glow-red opacity-30"></div>
                    </div>
                    <div className="section-container">
                        <div className="bg-gradient-to-br from-brand-red/20 to-black border border-brand-red/30 rounded-xl py-16 md:py-24 px-[15px] md:px-[50px] text-center shadow-[0_30px_100px_rgba(221,39,39,0.25)] relative overflow-hidden group">
                            <div className="absolute inset-0 bg-glow-red opacity-0 group-hover:opacity-40 transition-opacity duration-1000"></div>
                            <div className="relative z-10">
                                <h2 className="title-batangas text-4xl md:text-7xl mb-8 text-white">Need Consultation?</h2>
                                <p className="subtitle-poppins text-white/90 text-xl mb-12 max-w-2xl mx-auto leading-relaxed">Not sure which product is right for you? Book a consultation with our experts.</p>
                                <Link to="/appointment" className="inline-block bg-brand-red text-white px-8 py-3.5 rounded-full font-bold uppercase tracking-[0.2em] transition-all duration-500 hover:bg-white hover:text-brand-red shadow-[0_10px_40px_rgba(221,39,39,0.4)] text-sm md:text-base">
                                    Book Appointment
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

export default ProductsPage;
