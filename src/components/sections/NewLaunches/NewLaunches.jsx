import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Link } from "react-router-dom";
import { useProducts } from "../../../hooks/useProducts";
import { fallbackProducts } from "../products/Products";
import Button from "../../ui/Button/Button";
import SliderControls from "../../ui/Slider/SliderControls";
import "./newLaunches.css";

const CLONE_COUNT = 3;

const numericPrice = (value) =>
  parseFloat(String(value ?? "").replace(/[^\d.]/g, ""));

const formatPrice = (value) => {
  const amount = numericPrice(value);
  if (!Number.isFinite(amount)) return value || "";
  return `₹${amount.toLocaleString("en-IN")}`;
};

const getDiscount = (price, oldPrice) => {
  const current = numericPrice(price);
  const original = numericPrice(oldPrice);
  if (!current || !original || original <= current) return null;
  return Math.round(((original - current) / original) * 100);
};

const getVisibleItems = () => {
  if (typeof window === "undefined") return 3;
  if (window.innerWidth < 640) return 1;
  if (window.innerWidth < 1024) return 2;
  return 3;
};

const LaunchCard = ({ product, position }) => {
  const productId =
    product.id || product.title.replace(/\s+/g, "-").toLowerCase();
  const productUrl = `/products/${productId}`;
  const discount = getDiscount(product.price, product.oldPrice);

  return (
    <article className="nl-card">
      <span className="nl-card-line nl-card-line--top" aria-hidden="true" />
      <span className="nl-card-line nl-card-line--bottom" aria-hidden="true" />

      <Link
        to={productUrl}
        className="nl-image-link"
        aria-label={`Explore ${product.title}`}
      >
        <div className="nl-image-wrap">
          <img
            src={product.image}
            alt={product.title}
            loading="lazy"
            className="nl-img"
          />
          <span className="nl-image-shade" aria-hidden="true" />
          <span className="nl-image-shine" aria-hidden="true" />

          <div className="nl-badge-container">
            <span className="nl-badge-new">New Arrival</span>
            {discount && (
              <span className="nl-badge-discount">Save {discount}%</span>
            )}
          </div>

          <span className="nl-quick-view">
            Discover <span aria-hidden="true">↗</span>
          </span>
        </div>
      </Link>

      <div className="nl-body">
        <div className="nl-meta">
          <span>Sacred Collection</span>
          <span className="nl-meta-number">
            {String((position % 6) + 1).padStart(2, "0")}
          </span>
        </div>

        <Link to={productUrl} className="nl-title-link">
          <h3 className="nl-title">{product.title}</h3>
        </Link>

        <p className="nl-desc">{product.desc}</p>

        <div className="nl-ornament" aria-hidden="true">
          <span />
          <b>◆</b>
          <span />
        </div>

        <div className="nl-footer">
          <div className="nl-price-block">
            <span className="nl-price">{formatPrice(product.price)}</span>
            {product.oldPrice && (
              <span className="nl-old-price">
                {formatPrice(product.oldPrice)}
              </span>
            )}
          </div>

          <Link to={productUrl} className="nl-btn">
            <span>Explore</span>
            <span className="nl-btn-arrow" aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </article>
  );
};

const NewLaunches = () => {
  const { products = [], loading } = useProducts();

  const displayProducts = useMemo(
    () =>
      products.length
        ? products.slice(0, 6)
        : fallbackProducts.slice(0, 6),
    [products]
  );

  const totalRealItems = displayProducts.length;
  const [currentIndex, setCurrentIndex] = useState(CLONE_COUNT);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [visibleItems, setVisibleItems] = useState(getVisibleItems);
  const touchStartRef = useRef(0);

  const clonedData = useMemo(() => {
    if (!totalRealItems) return [];
    return [
      ...displayProducts.slice(-CLONE_COUNT),
      ...displayProducts,
      ...displayProducts.slice(0, CLONE_COUNT),
    ];
  }, [displayProducts, totalRealItems]);

  useEffect(() => {
    setCurrentIndex(CLONE_COUNT);
    setIsTransitioning(false);
  }, [totalRealItems]);

  useEffect(() => {
    const handleResize = () => setVisibleItems(getVisibleItems());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const moveToIndex = useCallback((index) => {
    setIsTransitioning(true);
    setCurrentIndex(index);
  }, []);

  const nextSlide = useCallback(() => {
    if (!isTransitioning) moveToIndex(currentIndex + 1);
  }, [currentIndex, isTransitioning, moveToIndex]);

  const prevSlide = useCallback(() => {
    if (!isTransitioning) moveToIndex(currentIndex - 1);
  }, [currentIndex, isTransitioning, moveToIndex]);

  useEffect(() => {
    if (!isTransitioning) return undefined;

    const timer = window.setTimeout(() => {
      if (currentIndex >= totalRealItems + CLONE_COUNT) {
        setCurrentIndex(CLONE_COUNT);
      } else if (currentIndex < CLONE_COUNT) {
        setCurrentIndex(totalRealItems + currentIndex);
      }
      setIsTransitioning(false);
    }, 720);

    return () => window.clearTimeout(timer);
  }, [currentIndex, isTransitioning, totalRealItems]);

  const handleTouchStart = (event) => {
    touchStartRef.current = event.touches[0].clientX;
  };

  const handleTouchEnd = (event) => {
    const difference = touchStartRef.current - event.changedTouches[0].clientX;
    if (Math.abs(difference) < 45) return;
    difference > 0 ? nextSlide() : prevSlide();
  };

  if (loading) {
    return (
      <section className="new-launches-section nl-loading">
        <span className="nl-loading-mark" aria-hidden="true">✦</span>
        <span className="nl-loading-text">Unveiling sacred arrivals...</span>
      </section>
    );
  }

  if (!totalRealItems) return null;

  return (
    <section className="new-launches-section" aria-labelledby="new-launches-title">
      <div className="bg-glow-red" aria-hidden="true" />
      <div className="bg-glow-gold" aria-hidden="true" />

      <div className="section-container nl-inner">
        <header className="nl-header">
          <span className="nl-eyebrow">Freshly curated for you</span>
          <h2 id="new-launches-title" className="title-batangas nl-heading">
            New <span>Launches</span>
          </h2>
          <p className="subtitle-poppins nl-subtitle">
            Sacred instruments and crystals recently added to our collection,
            thoughtfully selected to invite harmony, intention, and positive energy.
          </p>

          <div className="nl-header-divider" aria-hidden="true">
            <span className="nl-dot-glow" />
          </div>
        </header>

        <div
          className="nl-slider-container"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="nl-track"
            style={{
              transform: `translate3d(-${
                (100 / visibleItems) * currentIndex
              }%, 0, 0)`,
              transition: isTransitioning
                ? "transform 0.72s cubic-bezier(0.22, 1, 0.36, 1)"
                : "none",
            }}
          >
            {clonedData.map((product, index) => (
              <div
                className="nl-slide"
                key={`${product.id || product.title}-${index}`}
                style={{ flex: `0 0 ${100 / visibleItems}%` }}
              >
                <LaunchCard product={product} position={index} />
              </div>
            ))}
          </div>
        </div>

        <div className="nl-controls-wrap">
          <SliderControls
            onNext={nextSlide}
            onPrev={prevSlide}
            isPrevDisabled={isTransitioning}
            isNextDisabled={isTransitioning}
          />
          <span className="nl-swipe-hint">Swipe to discover</span>
        </div>

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