import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Link } from "react-router-dom";
import SliderHeader from "../../ui/Slider/SliderHeader";
import SliderControls from "../../ui/Slider/SliderControls";
import Button from "../../ui/Button/Button";
import { useProducts } from "../../../hooks/useProducts";
import { fallbackProducts, formatPrice, getDiscount } from "./productData";
import "./products.css";

// ─── ProductCard ─────────────────────────────────────────────────────────────
const ProductCard = ({ product }) => {
  const productId =
    product.id || product.title.replace(/\s+/g, "-").toLowerCase();
  const productUrl = `/products/${productId}`;
  const discount = getDiscount(product.price, product.oldPrice);

  return (
    <article className={`pc-card pc-card--${product.theme || "gold"}`}>
      <span className="pc-corner pc-corner--tl" aria-hidden="true" />
      <span className="pc-corner pc-corner--br" aria-hidden="true" />

      <Link
        to={productUrl}
        className="pc-image-link"
        aria-label={`View ${product.title}`}
      >
        <div className="pc-image">
          <img src={product.image} alt={product.title} loading="lazy" />
          <div className="pc-image-vignette" />
          <div className="pc-image-shine" />

          {discount && <span className="pc-badge">Save {discount}%</span>}

          <span className="pc-view-label">
            View details <span aria-hidden="true">↗</span>
          </span>
        </div>
      </Link>

      <div className="pc-body">
        <div className="pc-kicker">
          <span />
          Sacred Collection
        </div>

        <Link to={productUrl} className="pc-title-link">
          <h3 className="pc-title">{product.title}</h3>
        </Link>

        <p className="pc-desc">{product.desc}</p>

        <div className="pc-footer">
          <div className="pc-price-block">
            <span className="pc-price">{formatPrice(product.price)}</span>
            {product.oldPrice && (
              <span className="pc-old-price">
                {formatPrice(product.oldPrice)}
              </span>
            )}
          </div>

          <Link to={productUrl} className="pc-btn">
            <span>Buy now</span>
            <span className="pc-btn-arrow" aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </article>
  );
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const CLONE_COUNT = 3;

const getVisibleItems = () => {
  if (typeof window === "undefined") return 1;
  if (window.innerWidth < 1024) return 1;
  return 3;
};

// ─── Products (default export — component only) ───────────────────────────────
const Products = () => {
  const { products = [], loading } = useProducts();
  const displayProducts = products.length ? products : fallbackProducts;

  const [currentIndex, setCurrentIndex] = useState(CLONE_COUNT);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [visibleItems, setVisibleItems] = useState(1);
  const touchStartRef = useRef(0);

  const totalRealItems = displayProducts.length;

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
    const syncVisibleItems = () => {
      const nextVisibleItems = getVisibleItems();
      setVisibleItems((prev) => {
        if (prev !== nextVisibleItems) {
          setCurrentIndex(CLONE_COUNT);
          setIsTransitioning(false);
        }
        return nextVisibleItems;
      });
    };

    syncVisibleItems();
    window.addEventListener("resize", syncVisibleItems);
    return () => window.removeEventListener("resize", syncVisibleItems);
  }, []);

  const moveToIndex = useCallback((index, smooth = true) => {
    setIsTransitioning(smooth);
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
        setIsTransitioning(false);
        setCurrentIndex(CLONE_COUNT);
      } else if (currentIndex < CLONE_COUNT) {
        setIsTransitioning(false);
        setCurrentIndex(totalRealItems + currentIndex);
      } else {
        setIsTransitioning(false);
      }
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
      <section className="products-section products-section--loading">
        <span className="products-loading-text">Curating sacred pieces...</span>
      </section>
    );
  }

  if (!totalRealItems) return null;

  return (
    <section className="products-section">
      <div className="products-orb products-orb--left" aria-hidden="true" />
      <div className="products-orb products-orb--right" aria-hidden="true" />

      <div className="section-container products-inner">
        <div className="products-heading-wrap">
          <span className="products-eyebrow">Curated for your spiritual path</span>
          <SliderHeader
            title="Our Sacred Products"
            subTitle="Handpicked spiritual products to elevate your energy and transform your life."
          />
        </div>

        <div
          className="product-slider-container"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="product-track"
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
                className="product-slide"
                key={`${product.id || product.title}-${index}`}
                style={{ flex: `0 0 ${100 / visibleItems}%` }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>

        <div className="products-navigation">
          <SliderControls
            onNext={nextSlide}
            onPrev={prevSlide}
            isPrevDisabled={isTransitioning}
            isNextDisabled={isTransitioning}
          />
          <span className="products-swipe-hint">Swipe to explore</span>
        </div>

        <div className="products-view-all">
          <Button to="/products" variant="primary" size="md" arrow>
            View All Products
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Products;