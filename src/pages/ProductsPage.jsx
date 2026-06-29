import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Header from '../components/sections/Header/Header';
import Footer from '../components/sections/Footer/Footer';
import Button from '../components/ui/Button/Button';
import { fallbackProducts } from '../components/sections/products/Products';
import { useProducts } from '../hooks/useProducts';

const getProductCategory = (p) => {
  if (p.category) return p.category.toLowerCase();
  // legacy fallback for products without category field
  const title = (p.title || '').toLowerCase();
  if (title.includes('bracelet') || title.includes('ring') || title.includes('jewel')) return 'astro-jewellery';
  if (title.includes('mala')) return 'malas-accessories';
  if (title.includes('puja') || title.includes('samagri')) return 'puja-samagri';
  if (title.includes('photo') || title.includes('statue') || title.includes('idol')) return 'photos-statues';
  if (title.includes('attar') || title.includes('oil') || title.includes('perfume')) return 'attar-oils-perfumes';
  return 'other-remedies';
};

const parsePrice = (str) => parseFloat(String(str || '').replace(/[^\d.]/g, '')) || 0;

const getDiscount = (price, oldPrice) => {
  const p = parsePrice(price);
  const op = parsePrice(oldPrice);
  if (!p || !op || op <= p) return null;
  return Math.round(((op - p) / op) * 100);
};

const CATEGORIES = [
  { name: 'All Sacred Products', value: 'all' },
  { name: 'Puja Samagri', value: 'puja-samagri' },
  { name: 'Astro Jewellery', value: 'astro-jewellery' },
  { name: 'Divine Photos & Statues', value: 'photos-statues' },
  { name: 'Attar, Oils & Perfumes', value: 'attar-oils-perfumes' },
  { name: 'Malas & Spiritual Accessories', value: 'malas-accessories' },
  { name: 'Other Remedies', value: 'other-remedies' },
];

const SORT_OPTIONS = [
  { label: 'Default filter', value: 'default' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
  { label: 'Discount', value: 'discount' },
];

/* ── Product Card for grid layout ── */
const ShopCard = ({ p }) => {
  const productId = p.id || p.title.replace(/\s+/g, '-').toLowerCase();
  const discount = getDiscount(p.price, p.oldPrice);
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <Link to={`/products/${productId}`} className="shop-card group" aria-label={p.title}>
      {/* Image */}
      <div className="shop-card-img-wrap">
        {!imgLoaded && <div className="shop-card-img-skeleton" />}
        <img
          src={p.image}
          alt={p.title}
          loading="lazy"
          className={`shop-card-img ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setImgLoaded(true)}
        />
        {discount && <span className="shop-card-badge">{discount}% OFF</span>}
        <div className="shop-card-overlay">
          <span className="shop-card-view-btn">View Details →</span>
        </div>
      </div>

      {/* Body */}
      <div className="shop-card-body">
        <h3 className="shop-card-title">{p.title}</h3>
        <p className="shop-card-desc">{p.desc}</p>
        <div className="shop-card-footer">
          <div className="shop-card-prices">
            <span className="shop-card-price">₹{p.price?.toString().replace(/[^\d.]/g, '') || p.price}</span>
            {p.oldPrice && (
              <span className="shop-card-old-price">₹{p.oldPrice?.toString().replace(/[^\d.]/g, '') || p.oldPrice}</span>
            )}
          </div>
          <span className="shop-card-btn">Buy Now</span>
        </div>
      </div>
    </Link>
  );
};

/* ── Skeleton loader ── */
const CardSkeleton = () => (
  <div className="shop-card-skeleton">
    <div className="shop-card-skeleton-img" />
    <div className="shop-card-skeleton-body">
      <div className="shop-card-skeleton-line w-3/4" />
      <div className="shop-card-skeleton-line w-full" />
      <div className="shop-card-skeleton-line w-2/3" />
      <div className="shop-card-skeleton-footer" />
    </div>
  </div>
);

const ProductsPage = () => {
  const { products, loading } = useProducts();
  const [searchParams, setSearchParams] = useSearchParams();
  const [sort, setSort] = useState('default');
  const [search, setSearch] = useState('');

  const categoryQuery = searchParams.get('category') || 'all';
  const displayProducts = products.length > 0 ? products : fallbackProducts;

  // Filter
  let filtered = categoryQuery !== 'all'
    ? displayProducts.filter(p => getProductCategory(p) === categoryQuery)
    : displayProducts;

  // Search
  if (search.trim()) {
    const q = search.toLowerCase();
    filtered = filtered.filter(p =>
      (p.title || '').toLowerCase().includes(q) ||
      (p.desc || '').toLowerCase().includes(q)
    );
  }

  // Sort
  if (sort === 'price-asc') {
    filtered = [...filtered].sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
  } else if (sort === 'price-desc') {
    filtered = [...filtered].sort((a, b) => parsePrice(b.price) - parsePrice(a.price));
  } else if (sort === 'discount') {
    filtered = [...filtered].sort((a, b) => (getDiscount(b.price, b.oldPrice) || 0) - (getDiscount(a.price, a.oldPrice) || 0));
  }

  return (
    <>
      <Header />
      <main className="min-h-screen relative z-10 text-white bg-transparent overflow-x-hidden">

        {/* ── Hero Banner ── */}
        <section className="hero-section">
          <div className="bg-glow-container">
            <div className="absolute top-[20%] left-[10%] w-[600px] h-[600px] bg-glow-red opacity-50" />
            <div className="absolute bottom-[10%] right-[10%] w-[500px] h-[500px] bg-glow-gold opacity-30" />
          </div>

          <div className="section-container">
            <div className="relative z-10 max-w-4xl mx-auto text-center">
              <h1 className="title-batangas text-5xl md:text-7xl mb-6 leading-[1.1] text-white">
                Sacred <span className="text-brand-red">Shop</span>
              </h1>
              <p className="subtitle-poppins text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
                Handpicked spiritual products energetically cleansed and charged with Vedic mantras.
              </p>

              {/* Stats strip */}
              <div className="flex flex-wrap items-center justify-center gap-8 md:gap-14">
                {[
                  { num: '100%', label: 'Authentic' },
                  { num: '5–7 Days', label: 'Delivery' },
                  { num: '500+', label: 'Happy Customers' },
                ].map(({ num, label }) => (
                  <div key={label} className="text-center">
                    <p className="title-batangas text-3xl text-brand-red">{num}</p>
                    <p className="subtitle-poppins text-white/50 text-xs uppercase tracking-widest font-bold mt-1">{label}</p>
                  </div>
                ))}
              </div>

              {/* Dot divider */}
              <div className="mt-12 flex items-center justify-center gap-4">
                <div className="h-px w-12 bg-gradient-to-r from-transparent to-white/20" />
                <div className="w-2.5 h-2.5 rounded-full bg-brand-red shadow-[0_0_18px_#bf0603]" />
                <div className="h-px w-12 bg-gradient-to-l from-transparent to-white/20" />
              </div>
            </div>
          </div>
        </section>

        {/* ── Filters + Search bar ── */}
        <section className="sticky  top-[64px] z-30 bg-black/70 backdrop-blur-xl border-b border-white/10 py-3">
          <div className="premium-container flex items-center gap-6">
            {/* Category tabs — scrollable, takes remaining space */}
            <div className="flex flex-wrap items-start gap-2 overflow-x-auto no-scrollbar flex-1 min-w-0">
              {CATEGORIES.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setSearchParams({ category: tab.value })}
                  className={`shrink-0 px-4 py-2 rounded text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition-all duration-250 cursor-pointer  ${
                    categoryQuery === tab.value
                      ? 'bg-[#bf0603] text-white shadow-[0_0_14px_rgba(191,6,3,0.5)]'
                      : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </div>

            {/* Search — fixed right, never scrolls */}
            <div className="relative shrink-0 w-40 hidden sm:block">
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 pr-8 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#bf0603] transition-colors"
              />
              <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-white/30 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-5-5m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Sort — fixed right, never scrolls */}
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              className="shrink-0 bg-white/5 border border-white/10 rounded px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-white/60 focus:outline-none focus:border-[#bf0603] cursor-pointer transition-colors appearance-none hidden sm:block"
            >
              {SORT_OPTIONS.map(o => (
                <option key={o.value} value={o.value} className="bg-black text-white">{o.label}</option>
              ))}
            </select>
          </div>
        </section>

        {/* ── Products Grid ── */}
        <section className="py-14 relative">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] rounded-full bg-[#bf0603] opacity-[0.04] blur-[100px]" />
            <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] rounded-full bg-amber-600 opacity-[0.03] blur-[100px]" />
          </div>
          <div className="premium-container relative z-10">

            {/* Results count */}
            {!loading && (
              <p className="text-white/30 text-[11px] uppercase tracking-widest font-bold my-6">
                {filtered.length} product{filtered.length !== 1 ? 's' : ''} found
              </p>
            )}

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)}
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-24 text-center">
                <div className="text-5xl mb-4">🔍</div>
                <p className="text-white/40 text-sm font-bold uppercase tracking-widest mb-6">
                  No products found
                </p>
                <button
                  onClick={() => { setSearchParams({ category: 'all' }); setSearch(''); }}
                  className="text-[#bf0603] text-xs font-black uppercase tracking-wider border border-[#bf0603]/40 px-5 py-2.5 rounded-full hover:bg-[#bf0603]/10 transition-all cursor-pointer"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filtered.map((p, i) => <ShopCard key={`product-${i}`} p={p} />)}
              </div>
            )}
          </div>
        </section>

        {/* ── Trust Badges ── */}
        <section className="py-10 border-t border-white/5">
          <div className="premium-container">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: '🔒', title: 'Secure Payment', desc: 'Razorpay & UPI accepted' },
                { icon: '🚚', title: 'Fast Delivery', desc: '5–7 business days' },
                { icon: '🕉️', title: 'Energetically Charged', desc: 'Vedic mantras & rituals' },
                { icon: '↩️', title: 'Easy Returns', desc: 'Hassle-free support' },
              ].map(({ icon, title, desc }) => (
                <div key={title} className="flex items-start gap-3 bg-white/[0.04] border border-white/8 rounded-2xl p-4">
                  <span className="text-2xl">{icon}</span>
                  <div>
                    <p className="text-white font-bold text-sm">{title}</p>
                    <p className="text-white/40 text-[11px] mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-16">
          <div className="premium-container">
            <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] backdrop-blur-xl py-16 px-6 md:px-16 text-center">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(191,6,3,0.15),transparent_70%)]" />
              <div className="relative z-10">
                <h2 className="title-batangas text-4xl md:text-5xl text-white mb-4">Not Sure What to Buy?</h2>
                <p className="subtitle-poppins text-white/55 text-base mb-8 max-w-lg mx-auto">
                  Book a consultation and our experts will guide you to the perfect product for your energy.
                </p>
                <Button to="/appointment" variant="primary" size="lg" arrow>
                  Book Free Consultation
                </Button>
              </div>
            </div>
          </div>
        </section>

      </main>
      <Footer />

      <style>{`
        /* ══════════════════════════════════════
           SHOP CARD — Premium Dark Glass
        ══════════════════════════════════════ */
        .shop-card {
          display: flex;
          flex-direction: column;
          background: #bf0603;
          border-radius: 6px;
          overflow: hidden;
          text-decoration: none;
          color: white;
          box-shadow: 0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06);
          transition: transform 0.35s cubic-bezier(0.34,1.56,0.64,1), border-color 0.3s ease, box-shadow 0.35s ease;
          position: relative;
        }
        .shop-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(191,6,3,0.06) 0%, transparent 60%);
          pointer-events: none;
          z-index: 0;
          border-radius: 20px;
        }
        .shop-card:hover {
          transform: translateY(-8px) scale(1.01);
          border-color: rgba(191,6,3,0.55);
          box-shadow: 0 24px 60px rgba(191,6,3,0.2), 0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1);
        }

        /* Image wrapper */
        .shop-card-img-wrap {
          position: relative;
          aspect-ratio: 4/3;
          background: linear-gradient(145deg, #fff 0%, #f5f5f5 100%);
          overflow: hidden;
          margin: 10px 10px 0 10px;
          border-radius: 6px;
          border: 1px solid rgba(255,255,255,0.08);
          z-index: 1;
        }
        .shop-card-img-skeleton {
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, #1a0a0a 25%, #2a1010 50%, #1a0a0a 75%);
          background-size: 200% 100%;
          animation: shimmer 1.4s infinite;
        }
        @keyframes shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
        .shop-card-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          padding: 12px;
          transition: transform 0.6s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s ease;
        }
        .shop-card:hover .shop-card-img { transform: scale(1.08); }

        /* Discount badge */
        .shop-card-badge {
          position: absolute;
          top: 10px;
          left: 10px;
          background: linear-gradient(135deg, #ff3b3b, #b30000);
          color: white;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          padding: 4px 10px;
          border-radius: 999px;
          z-index: 10;
          box-shadow: 0 4px 14px rgba(191,6,3,0.5);
        }

        /* Hover overlay on image */
        .shop-card-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.1) 60%, transparent 100%);
          display: flex;
          align-items: flex-end;
          justify-content: center;
          padding-bottom: 14px;
          opacity: 0;
          transition: opacity 0.3s ease;
          border-radius: 6px;
        }
        .shop-card:hover .shop-card-overlay { opacity: 1; }
        .shop-card-view-btn {
          background: white;
          color: #bf0603;
          font-size: 10px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.14em;
          padding: 8px 20px;
          border-radius: 999px;
          transform: translateY(10px);
          transition: transform 0.35s cubic-bezier(0.34,1.56,0.64,1);
          white-space: nowrap;
        }
        .shop-card:hover .shop-card-view-btn { transform: translateY(0); }

        /* Card body */
        .shop-card-body {
          padding: 14px 16px 16px 16px;
          display: flex;
          flex-direction: column;
          flex: 1;
          gap: 6px;
          position: relative;
          z-index: 1;
        }
        .shop-card-title {
          font-family: 'Batangas', sans-serif;
          font-size: 1.2rem;
          font-weight: 700;
          color: #fff;
          line-height: 1.25;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          transition: color 0.2s ease;
        }
        .shop-card:hover .shop-card-title { color: #ff6b6b; }
        .shop-card-desc {
          font-size: 0.78rem;
          color: rgba(255,255,255,0.45);
          line-height: 1.6;
          flex: 1;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        /* Footer */
        .shop-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          padding-top: 12px;
          border-top: 1px solid rgba(255,255,255,0.06);
          margin-top: auto;
        }
        .shop-card-prices { display: flex; flex-direction: column; gap: 2px; }
        .shop-card-price {
          font-family: 'Batangas', sans-serif;
          font-size: 1.4rem;
          font-weight: 800;
          color: #fff;
          line-height: 1;
        }
        .shop-card-old-price {
          font-size: 0.72rem;
          color: rgba(255,255,255,0.28);
          text-decoration: line-through;
        }

        /* Buy Now button on card */
        .shop-card-btn {
          background: #bf0603;
          color: white;
          font-size: 9px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          padding: 9px 16px;
          border-radius: 8px;
          white-space: nowrap;
          border: 2px solid #bf0603;
          transition: background 0.25s ease, color 0.25s ease, transform 0.2s ease, box-shadow 0.25s ease;
          box-shadow: 0 6px 16px rgba(191,6,3,0.3);
        }
        .shop-card:hover .shop-card-btn {
          background: #fff;
          color: #bf0603;
          transform: translateY(-2px);
          box-shadow: 0 10px 24px rgba(191,6,3,0.25);
        }

        /* ── Card Skeleton ── */
        .shop-card-skeleton {
          border-radius: 20px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.05);
          background: linear-gradient(145deg, rgba(30,10,10,0.7), rgba(15,5,5,0.9));
        }
        .shop-card-skeleton-img {
          aspect-ratio: 4/3;
          margin: 10px 10px 0 10px;
          border-radius: 12px;
          background: rgba(255,255,255,0.05);
          animation: pulse 1.5s ease-in-out infinite;
        }
        .shop-card-skeleton-body {
          padding: 14px 16px 16px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .shop-card-skeleton-line {
          height: 10px;
          border-radius: 999px;
          background: rgba(255,255,255,0.05);
          animation: pulse 1.5s ease-in-out infinite;
        }
        .shop-card-skeleton-footer {
          height: 38px;
          border-radius: 8px;
          background: rgba(255,255,255,0.05);
          margin-top: 4px;
          animation: pulse 1.5s ease-in-out infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.35; }
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </>
  );
};

export default ProductsPage;
