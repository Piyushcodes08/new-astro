import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/sections/Header/Header';
import Footer from '../components/sections/Footer/Footer';
import { useArticles } from '../context/ArticlesContext';
import '../components/sections/Article/ArticleSection.css';

const ArticlesPage = () => {
    const { slugMap, loading } = useArticles();
    const [searchQuery, setSearchQuery] = useState('');
    const [openCardId, setOpenCardId] = useState(null);

    const articlesData = useMemo(() => {
        return Object.values(slugMap).sort((a, b) => {
            let dateA = 0;
            let dateB = 0;
            if (a.createdAt && a.createdAt.seconds) {
                dateA = a.createdAt.seconds * 1000;
            } else if (a.rawDate) {
                dateA = new Date(a.rawDate).getTime();
            } else if (a.data) {
                dateA = new Date(a.data).getTime();
            }

            if (b.createdAt && b.createdAt.seconds) {
                dateB = b.createdAt.seconds * 1000;
            } else if (b.rawDate) {
                dateB = new Date(b.rawDate).getTime();
            } else if (b.data) {
                dateB = new Date(b.data).getTime();
            }
            return dateB - dateA;
        });
    }, [slugMap]);

    const [currentPage, setCurrentPage] = useState(1);
    const articlesPerPage = 8;

    const [sidebarPage, setSidebarPage] = useState(1);
    const sidebarArticlesPerPage = 10;

    // Filter articles based on search query
    const filteredArticles = useMemo(() => {
        if (!searchQuery.trim()) return articlesData;

        const query = searchQuery.toLowerCase();
        return articlesData.filter(article =>
            article.title?.toLowerCase().includes(query) ||
            article.description?.toLowerCase().includes(query)
        );
    }, [searchQuery, articlesData]);

    // Reset pagination when search query changes
    React.useEffect(() => {
        setCurrentPage(1);
        setSidebarPage(1);
    }, [searchQuery]);

    // Main Pagination Logic
    const indexOfLastArticle = currentPage * articlesPerPage;
    const indexOfFirstArticle = indexOfLastArticle - articlesPerPage;
    const currentArticles = filteredArticles.slice(indexOfFirstArticle, indexOfLastArticle);
    const totalPages = Math.ceil(filteredArticles.length / articlesPerPage);

    // Sidebar Pagination Logic
    const indexOfLastSidebar = sidebarPage * sidebarArticlesPerPage;
    const indexOfFirstSidebar = indexOfLastSidebar - sidebarArticlesPerPage;
    const sidebarArticles = filteredArticles.slice(indexOfFirstSidebar, indexOfLastSidebar);
    const totalSidebarPages = Math.ceil(filteredArticles.length / sidebarArticlesPerPage);

    const paginate = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-transparent backdrop-blur-sm">
                <div className="text-brand-red text-brand-redxl font-bold animate-pulse uppercase tracking-widest">
                    Consulting Stars...
                </div>
            </div>
        );
    }

    return (
        <>
            <Header />
            <main className="min-h-screen relative z-10 text-white overflow-hidden bg-transparent">
                {/* Articles Hero Banner */}
                <section className="hero-section">
                    {/* Background Glows */}
                    <div className="bg-glow-container">
                        <div className="absolute top-[20%] left-[10%] w-[600px] h-[600px] bg-glow-red opacity-50"></div>
                        <div className="absolute top-[10%] right-[15%] w-[500px] h-[500px] bg-glow-gold opacity-20"></div>
                    </div>

                    <div className="section-container">
                        <div className="relative z-10 max-w-7xl w-full mx-auto text-center">


                            {/* Bold White Title */}
                            <h1 className="title-batangas text-5xl md:text-7xl md:text-brand-redxl text-white font-black mb-8 leading-[1.1] tracking-tight">
                                Cosmic Insights <br /> & <span className="text-brand-red">Sacred Wisdom</span>
                            </h1>

                            {/* Red Subtitle */}
                            <p className="subtitle-poppins text-lg md:text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
                                Explore our collection of sacred articles and astrological guidance <br className="hidden md:block" />
                                to navigate your journey through the infinite stars.
                            </p>

                            {/* Red Dot Divider */}
                            <div className="mt-16 flex items-center justify-center gap-6">
                                <div className="h-1.5 w-16 bg-linear-to-r from-transparent to-white/10"></div>
                                <div className="w-3 h-3 rounded-full bg-brand-red shadow-[0_0_20px_#bf0603,0_0_40px_#bf0603]"></div>
                                <div className="h-1.5 w-16 bg-linear-to-l from-transparent to-white/10"></div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Main Content Area with Sidebar */}
                <section>
                    <div className="section-container">
                        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">

                            {/* Article Grid (Main Content) */}
                            <div className="w-full lg:flex-1 min-w-0">
                                {currentArticles.length > 0 ? (
                                    <>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-16 gap-x-8">
                                            {currentArticles.map((article, index) => {
                                                const uniqueId = article.id || index;
                                                const isOpen = openCardId === uniqueId;

                                                return (
                                                    <div key={uniqueId} className="flex flex-col items-center">
                                                        <div
                                                            className={`article-wrapper ${isOpen ? 'is-open' : ''}`}
                                                            onClick={() => setOpenCardId(prev => prev === uniqueId ? null : uniqueId)}
                                                        >
                                                            {/* Inner page content — revealed when cover opens */}
                                                            <div className="article-inner">
                                                                <h4 className="article-inner-title">{article.title}</h4>
                                                                {article.hindi && <h5 className="article-inner-hindi-title">{article.hindi}</h5>}
                                                                <div className="article-inner-meta">
                                                                    {article.author && <span className="article-inner-author">By {article.author}</span>}
                                                                    {(article.data || article.createdAt) && (
                                                                        <span className="article-inner-date">
                                                                            {article.data || (article.createdAt?.seconds ? new Date(article.createdAt.seconds * 1000).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "")}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <Link to={`/articles/${article.id || index}`} className="article-read-more" onClick={(e) => e.stopPropagation()}>Read More</Link>
                                                            </div>
                                                            {/* Cover — rotates open on hover/click */}
                                                            <div className="article-cover-container">
                                                                <div className="w-full aspect-video overflow-hidden">
                                                                    <img
                                                                        src={article.imageUrl || article.img}
                                                                        alt={article.title}
                                                                        className="w-full h-full object-cover"
                                                                        loading="lazy"
                                                                    />
                                                                </div>
                                                                <div className="article-cover-content">
                                                                    <h4 className="article-cover-title">{article.title}</h4>
                                                                    {article.author && <p className="article-cover-author">By {article.author}</p>}
                                                                    {(article.data || article.createdAt) && (
                                                                        <p className="article-cover-date">
                                                                            {article.data || (article.createdAt?.seconds ? new Date(article.createdAt.seconds * 1000).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "")}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Pagination Controls */}
                                        {totalPages > 1 && (
                                            <div className="mt-20 flex justify-center items-center gap-4">
                                                <button
                                                    onClick={() => paginate(currentPage - 1)}
                                                    disabled={currentPage === 1}
                                                    className={`w-12 h-12 rounded-full border border-white/10 flex items-center justify-center transition-all ${currentPage === 1 ? 'opacity-20 cursor-not-allowed' : 'hover:bg-white/10 hover:border-brand-red'}`}
                                                >
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                                                </button>

                                                <div className="flex gap-2">
                                                    {[...Array(totalPages)].map((_, i) => (
                                                        <button
                                                            key={i + 1}
                                                            onClick={() => paginate(i + 1)}
                                                            className={`w-12 h-12 rounded-full font-bold transition-all ${currentPage === i + 1 ? 'bg-brand-red text-white shadow-[0_0_20px_rgba(191, 6, 3,0.5)]' : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'}`}
                                                        >
                                                            {i + 1}
                                                        </button>
                                                    ))}
                                                </div>

                                                <button
                                                    onClick={() => paginate(currentPage + 1)}
                                                    disabled={currentPage === totalPages}
                                                    className={`w-12 h-12 rounded-full border border-white/10 flex items-center justify-center transition-all ${currentPage === totalPages ? 'opacity-20 cursor-not-allowed' : 'hover:bg-white/10 hover:border-brand-red'}`}
                                                >
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                                                </button>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="text-center py-24 bg-white/5 border border-white/10 rounded-lg backdrop-blur-2xl">
                                        <h3 className="title-batangas text-4xl mb-6 text-white">No Wisdom Found</h3>
                                        <p className="subtitle-poppins text-white/60 text-lg">Try searching with different celestial keywords.</p>
                                        <button
                                            onClick={() => setSearchQuery('')}
                                            className="mt-10 text-brand-red font-bold uppercase tracking-[0.3em] hover:text-white transition-all duration-300"
                                        >
                                            Clear Search
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Sidebar */}
                            <aside className="w-full lg:w-1/3 xl:w-[30%] shrink-0 space-y-12">

                                {/* Search Widget */}
                                <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-lg p-5 shadow-2xl">
                                    <h4 className="title-batangas text-xl mb-6 text-white border-b border-white/10 pb-4">Search Wisdom</h4>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="Search topics..."
                                            className="w-full bg-white/5 border border-white/10 rounded-full pl-5 pr-14 py-4 text-white placeholder-white/30 focus:outline-none focus:border-brand-red/50 subtitle-poppins text-sm transition-all"
                                        />
                                        <button
                                            onClick={() => setSearchQuery(searchQuery)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full bg-brand-red text-white hover:scale-110 transition-transform shadow-lg"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                                        </button>
                                    </div>
                                </div>

                                {/* Sacred Wisdom (Dynamic Articles List) */}
                                <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-lg p-5 shadow-2xl">
                                    <h4 className="title-batangas text-xl mb-6 text-white border-b border-white/10 pb-4">Sacred Wisdom</h4>
                                    <ul className="space-y-6 subtitle-poppins text-base">
                                        {sidebarArticles.map((article, i) => (
                                            <li key={article.id || i} className="group">
                                                <Link to={`/articles/${article.id}`} className="flex gap-4 text-white/60 hover:text-brand-red transition-all duration-300">
                                                    <span className="text-brand-red font-black text-xl group-hover:scale-125 transition-transform">•</span>
                                                    <span className="leading-relaxed group-hover:translate-x-2 transition-transform font-medium">{article.title}</span>
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>

                                    {/* Sidebar Pagination */}
                                    {totalSidebarPages > 1 && (
                                        <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
                                            <span className="text-white/40 text-xs font-medium uppercase tracking-wider">
                                                Page {sidebarPage} of {totalSidebarPages}
                                            </span>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => setSidebarPage(prev => Math.max(prev - 1, 1))}
                                                    disabled={sidebarPage === 1}
                                                    className={`p-2 rounded-lg border border-white/10 transition-all ${sidebarPage === 1 ? 'opacity-20 cursor-not-allowed' : 'hover:bg-brand-red hover:border-brand-red text-white'}`}
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                                                </button>
                                                <button
                                                    onClick={() => setSidebarPage(prev => Math.min(prev + 1, totalSidebarPages))}
                                                    disabled={sidebarPage === totalSidebarPages}
                                                    className={`p-2 rounded-lg border border-white/10 transition-all ${sidebarPage === totalSidebarPages ? 'opacity-20 cursor-not-allowed' : 'hover:bg-brand-red hover:border-brand-red text-white'}`}
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Premium CTA Sidebar Banner */}
                                <div className="relative rounded-lg overflow-hidden group shadow-[0_25px_60px_rgba(191, 6, 3,0.4)] transition-all duration-700 hover:-translate-y-0.5">
                                    <div className="absolute inset-0 bg-linear-to-br from-brand-red via-brand-red to-[#801313] opacity-100"></div>
                                    <div className="relative z-10 py-12 px-4 md:px-8 text-center">
                                        <h4 className="title-batangas text-4xl mb-6 text-white! leading-tight drop-shadow-2xl">
                                            Unlock Your <br /> Destiny
                                        </h4>
                                        <p className="subtitle-poppins text-base text-white/95 mb-10 leading-relaxed font-medium">
                                            Get a personalized cosmic consultation today and align with your true purpose.
                                        </p>
                                        <Link to="/consulting" className="inline-block w-full py-5 rounded bg-white text-brand-red font-bold uppercase tracking-[0.2em] text-sm hover:bg-black hover:text-white transition-all shadow-2xl hover:scale-105 active:scale-95 duration-500">
                                            Book Now
                                        </Link>
                                    </div>
                                    <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-white/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
                                </div>

                            </aside>
                        </div>
                    </div>
                </section>

                {/* Newsletter Section */}
                <section className="py-[50px]">
                    <div className="section-container">
                        <div className="relative bg-white/5 backdrop-blur-3xl border border-white/10 rounded-3xl p-8 md:p-16 overflow-hidden group shadow-[0_30px_100px_rgba(0,0,0,0.6)]">
                            {/* Decorative Glow */}
                            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-red/10 blur-[150px] -z-10 group-hover:bg-brand-red/20 transition-all duration-1000"></div>

                            <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8">
                                <div className="inline-block px-6 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-xl">
                                    <span className="text-white text-[10px] font-bold uppercase tracking-[0.4em]">Stay Connected</span>
                                </div>

                                <h2 className="title-batangas text-4xl md:text-6xl text-white leading-tight drop-shadow-2xl font-black uppercase">
                                    Never Miss a <br /> <span className="text-brand-red">Cosmic Update</span>
                                </h2>

                                <p className="subtitle-poppins text-base md:text-lg text-white/70 max-w-2xl mx-auto leading-relaxed">
                                    Subscribe to our newsletter to receive the latest astrological insights and exclusive offers directly in your inbox.
                                </p>

                                <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto pt-4">
                                    <input
                                        type="email"
                                        placeholder="Enter your email address"
                                        className="flex-1 bg-white/5 border border-white/10 rounded px-8 py-4 text-white placeholder-white/30 focus:outline-none focus:border-brand-red/50 subtitle-poppins text-sm transition-all"
                                    />
                                    <button className="bg-white text-black px-6 py-4 rounded font-black uppercase tracking-[0.2em] text-[10px] hover:bg-brand-red hover:text-white transition-all duration-500 shadow-2xl">
                                        Subscribe
                                    </button>
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

export default ArticlesPage;

