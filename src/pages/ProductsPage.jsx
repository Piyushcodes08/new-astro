import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Header from '../components/sections/Header/Header';
import Footer from '../components/sections/Footer/Footer';
import { fallbackProducts, ProductCard } from '../components/sections/products/Products';
import { useProducts } from '../hooks/useProducts';

const getProductCategory = (p) => {
    if (p.category) return p.category.toLowerCase();
    const title = (p.title || '').toLowerCase();
    if (title.includes('bracelet')) return 'bracelets';
    if (title.includes('ring')) return 'rings';
    if (title.includes('mala')) return 'malas';
    return 'others';
};

const ProductsPage = () => {
    const { products, loading } = useProducts();
    const [searchParams, setSearchParams] = useSearchParams();
    const categoryQuery = searchParams.get('category') || 'all';

    const displayProducts = products.length > 0 ? products : fallbackProducts;
    
    const filteredProducts = categoryQuery && categoryQuery !== 'all'
        ? displayProducts.filter(p => getProductCategory(p) === categoryQuery.toLowerCase())
        : displayProducts;

    return (
        <>
            <Header />
            <main className="min-h-screen relative z-10 text-white overflow-hidden bg-transparent">
                {/* Hero Banner */}
                <section className="hero-section pt-24 pb-12 animate-fade-in">
                    <div className="bg-glow-container pointer-events-none fixed inset-0 z-0">
                        <div className="absolute top-[20%] left-[10%] w-[600px] h-[600px] bg-[radial-gradient(circle_at_center,rgba(221,39,39,0.15),transparent_60%)] opacity-50 blur-[100px]"></div>
                        <div className="absolute top-[10%] right-[5%] w-[500px] h-[500px] bg-[radial-gradient(circle_at_center,rgba(255,185,70,0.08),transparent_60%)] opacity-30 blur-[100px]"></div>
                    </div>

                    <div className="section-container">
                        <div className="relative z-10 max-w-4xl w-full mx-auto text-center">
                            <h1 className="title-batangas text-5xl md:text-brand-redxl text-white font-black mb-6 leading-[1.1]">
                                Sacred <span className="text-[#dd2727]">Shop</span>
                            </h1>

                            <p className="subtitle-poppins text-lg md:text-xl text-white/75 max-w-2xl mx-auto leading-relaxed font-medium">
                                Handpicked spiritual products to elevate your energy and transform your life. Browse our exclusive collection.
                            </p>

                            {/* Category Selector Tabs */}
                            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                                {[
                                    { name: 'All Products', value: 'all' },
                                    { name: 'Bracelets', value: 'bracelets' },
                                    { name: 'Rings', value: 'rings' },
                                    { name: 'Malas', value: 'malas' }
                                ].map((tab) => {
                                    const isActive = categoryQuery === tab.value;
                                    return (
                                        <button
                                            key={tab.value}
                                            onClick={() => setSearchParams({ category: tab.value })}
                                            className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-350 cursor-pointer ${
                                                isActive
                                                    ? 'bg-[#dd2727] text-white shadow-[0_0_15px_rgba(221,39,39,0.45)] border border-[#dd2727]'
                                                    : 'bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 hover:border-white/20'
                                            }`}
                                        >
                                            {tab.name}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="mt-12 flex items-center justify-center gap-4">
                                <div className="h-[1px] w-12 bg-linear-to-r from-transparent to-[#dd2727]/50"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-[#dd2727] shadow-[0_0_15px_rgba(221,39,39,0.8)]"></div>
                                <div className="h-[1px] w-12 bg-linear-to-l from-transparent to-[#dd2727]/50"></div>
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
                                    <p className="text-[#dd2727] font-bold uppercase tracking-[0.3em]">Loading Sacred Items...</p>
                                </div>
                            ) : filteredProducts.length === 0 ? (
                                <div className="col-span-1 md:col-span-2 lg:col-span-3 py-20 text-center">
                                    <p className="text-white/40 text-[13px] uppercase tracking-[0.25em] font-bold mb-6">No Products Found In This Category</p>
                                    <button
                                        onClick={() => setSearchParams({ category: 'all' })}
                                        className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-6 py-2.5 rounded-full uppercase tracking-wider text-xs font-bold transition-all duration-300 cursor-pointer"
                                    >
                                        Show All Products
                                    </button>
                                </div>
                            ) : (
                                filteredProducts.map((p, index) => (
                                    <ProductCard key={`shop-product-${index}`} p={p} index={index} />
                                ))
                            )}
                        </div>
                    </div>
                </section>

                {/* Call to Action */}
                <section className="pb-24">
                    <div className="bg-glow-container pointer-events-none absolute inset-0 z-0">
                        <div className="absolute bottom-0 left-[20%] w-[600px] h-[600px] bg-[radial-gradient(circle_at_bottom,rgba(221,39,39,0.1),transparent_60%)] opacity-30 blur-[100px]"></div>
                    </div>
                    <div className="section-container relative z-10">
                        <div className="bg-linear-to-b from-white/[0.08] to-white/[0.02] backdrop-blur-[18px] border border-white/10 rounded-[28px] py-16 md:py-24 px-[15px] md:px-[50px] text-center shadow-[0_20px_60px_rgba(0,0,0,0.3)] relative overflow-hidden group">
                            <div className="absolute inset-0 bg-linear-to-br from-[#dd2727]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                            <div className="relative z-10">
                                <h2 className="title-batangas text-4xl md:text-6xl lg:text-brand-redxl mb-6 text-white font-black">Need Consultation?</h2>
                                <p className="subtitle-poppins text-white/65 text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">Not sure which product is right for you? Book a consultation with our experts.</p>
                                <Link to="/appointment" className="inline-block bg-linear-to-br from-[#ff3131] to-[#c30000] text-white px-8 py-4 rounded-[16px] font-black uppercase tracking-[0.12em] transition-all duration-300 hover:shadow-[0_14px_30px_rgba(221,39,39,0.45)] hover:from-[#ff4f4f] hover:to-[#dd2727] shadow-[0_10px_25px_rgba(221,39,39,0.25)] text-sm md:text-base hover:-translate-y-1">
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
