import React from "react";
import { Link } from 'react-router-dom';
import { useProducts } from '../../../hooks/useProducts';
import { fallbackProducts } from '../products/Products';
import Button from '../../ui/Button/Button';
import "./newLaunches.css";

// Helper to compute discount %
const getDiscount = (price, oldPrice) => {
  if (!price || !oldPrice) return null;
  const p = parseFloat(String(price).replace(/[^\d.]/g, ''));
  const op = parseFloat(String(oldPrice).replace(/[^\d.]/g, ''));
  if (!p || !op || op <= p) return null;
  return Math.round(((op - p) / op) * 100);
};

const LaunchCard = ({ p }) => {
  const productId = p.id || p.title.replace(/\s+/g, '-').toLowerCase();
  const discount = getDiscount(p.price, p.oldPrice);

  return (
    <div className="nl-card">
      {/* Badge container to align badges side by side */}
      <div className="nl-badge-container">
        <span className="nl-badge-new">NEW</span>
        {discount && (
          <span className="nl-badge-discount">{discount}% OFF</span>
        )}
      </div>

      {/* Image Container */}
      <Link to={`/products/${productId}`} className="nl-image-link" tabIndex={-1}>
        <div className="nl-image-wrap">
          <img src={p.image} alt={p.title} loading="lazy" className="nl-img" />
          <div className="nl-image-overlay">
            <span className="nl-quick-view">Quick View →</span>
          </div>
        </div>
      </Link>

      {/* Card Content */}
      <div className="nl-body">
        <Link to={`/products/${productId}`} className="nl-title-link">
          <h3 className="nl-title">{p.title}</h3>
        </Link>
        <p className="nl-desc">{p.desc}</p>

        <div className="nl-footer">
          <div className="nl-price-block">
            <span className="nl-price">₹ {p.price}</span>
            {p.oldPrice && <span className="nl-old-price">₹ {p.oldPrice}</span>}
          </div>
          <Link
            to={`/products/${productId}`}
            className="nl-btn"
            id={`launch-card-${productId}`}
          >
            Explore Now
          </Link>
        </div>
      </div>
    </div>
  );
};

const NewLaunches = () => {
  const { products, loading } = useProducts();
  
  // Use products from Firestore if available, otherwise fallback.
  // We take the first 3 items (since they are ordered by createdAt desc, representing the latest additions).
  const latestProducts = products.length > 0 
    ? products.slice(0, 3) 
    : fallbackProducts.slice(0, 3);

  if (loading) {
    return (
      <section className="new-launches-section">
        <div className="section-container">
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-12 h-12 border-4 border-brand-red border-t-transparent rounded-full animate-spin mb-4" />
            <div className="text-brand-cream text-lg font-bold uppercase tracking-widest animate-pulse">
              Unveiling New Sacred Energy...
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (latestProducts.length === 0) return null;

  return (
    <section className="new-launches-section">
      {/* Background glow effects for premium look */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute top-[10%] left-[15%] w-[450px] h-[450px] rounded-full bg-glow-red opacity-30" />
        <div className="absolute bottom-[20%] right-[10%] w-[400px] h-[400px] rounded-full bg-glow-gold opacity-20" />
      </div>

      <div className="section-container relative z-10">
        {/* Title Header */}
        <div className="nl-header">
          <div className="nl-header-text">
            <h2 className="title-batangas text-4xl md:text-5xl mb-4 leading-tight">
              New <span className="text-brand-red">Launches</span>
            </h2>
            <p className="subtitle-poppins text-white/70 text-sm md:text-base max-w-xl">
              Sacred instruments and crystals recently added to our collection, energetically charged to manifest positivity in your life.
            </p>
          </div>
          <div className="nl-header-divider">
            <span className="nl-dot-glow" />
          </div>
        </div>

        {/* Products Grid */}
        <div className="nl-grid">
          {latestProducts.map((p, index) => (
            <LaunchCard p={p} key={`${p.id || p.title}-${index}`} />
          ))}
        </div>

        {/* View All Button */}
        <div className="nl-action-container">
          <Button to="/products" variant="primary" size="md" arrow>
            Explore Full Catalog
          </Button>
        </div>
      </div>
    </section>
  );
};

export default NewLaunches;
