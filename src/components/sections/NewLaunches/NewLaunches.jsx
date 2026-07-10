import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Link } from 'react-router-dom';
import { useProducts } from '../../../hooks/useProducts';
import { fallbackProducts } from '../products/Products';
import Button from '../../ui/Button/Button';
import SliderControls from '../../ui/Slider/SliderControls';
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

  // Use up to 6 products from Firestore if available, otherwise fallback.
  const displayProducts = useMemo(() => {
    return products.length > 0 
      ? products.slice(0, 6) 
      : fallbackProducts.slice(0, 6);
  }, [products]);

  const [currentIndex, setCurrentIndex] = useState(3);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [visibleItems, setVisibleItems] = useState(3);
  const touchStartRef = useRef(0);

  // Clone data for infinite loop carousel (similar to Products.jsx)
  const clonedData = useMemo(() => {
    if (displayProducts.length === 0) return [];
    return [
      ...displayProducts.slice(-3),
      ...displayProducts,
      ...displayProducts.slice(0, 3)
    ];
  }, [displayProducts]);

  const totalRealItems = displayProducts.length;

  useEffect(() => {
    setCurrentIndex(3);
  }, [totalRealItems]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) setVisibleItems(1);
      else if (window.innerWidth < 1024) setVisibleItems(2);
      else setVisibleItems(3);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const moveToIndex = useCallback((index, smooth = true) => {
    setIsTransitioning(smooth);
    setCurrentIndex(index);
  }, []);

  const nextSlide = useCallback(() => {
    moveToIndex(currentIndex + 1);
  }, [currentIndex, moveToIndex]);

  const prevSlide = useCallback(() => {
    moveToIndex(currentIndex - 1);
  }, [currentIndex, moveToIndex]);

  const getTranslateX = () => {
    const percentage = (100 / visibleItems) * currentIndex;
    return `translateX(-${percentage}%)`;
  };

  useEffect(() => {
    if (!isTransitioning) return;
    if (currentIndex >= totalRealItems + 3) {
      const timer = setTimeout(() => {
        setIsTransitioning(false);
        setCurrentIndex(3);
      }, 700);
      return () => clearTimeout(timer);
    }
    if (currentIndex <= 2) {
      const timer = setTimeout(() => {
        setIsTransitioning(false);
        setCurrentIndex(totalRealItems + 2);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, isTransitioning, totalRealItems]);

  const handleTouchStart = (e) => {
    touchStartRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStartRef.current - touchEnd;
    if (Math.abs(diff) > 50) {
      if (diff > 0) nextSlide();
      else prevSlide();
    }
  };

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

  if (totalRealItems === 0) return null;

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

        {/* Carousel Slider */}
        <div
          className="nl-slider-container"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="nl-track"
            style={{
              transform: getTranslateX(),
              transition: isTransitioning
                ? 'transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)'
                : 'none'
            }}
          >
            {clonedData.map((p, index) => (
              <div
                className="nl-slide"
                key={`${p.id || p.title}-${index}`}
                style={{ flex: `0 0 ${100 / visibleItems}%` }}
              >
                <LaunchCard p={p} />
              </div>
            ))}
          </div>
        </div>

        {/* Slider Controls */}
        <SliderControls
          onNext={nextSlide}
          onPrev={prevSlide}
          isPrevDisabled={false}
          isNextDisabled={false}
        />

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





