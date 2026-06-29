import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Link } from 'react-router-dom';
import SliderHeader from '../../ui/Slider/SliderHeader';
import SliderControls from '../../ui/Slider/SliderControls';
import Button from '../../ui/Button/Button';
import { useProducts } from '../../../hooks/useProducts';
import "./products.css";


export const fallbackProducts = [
  {
    theme: "gold",
    title: "Pyrite Bracelet",
    desc: "Attract wealth, confidence, and positive energy with this premium Pyrite crystal bracelet.",
    price: "₹999",
    oldPrice: "₹1499",
    image: "src/assets/images/products/pyritr.webp",
  },
  {
    theme: "purple",
    title: "7 Chakra Bracelet",
    desc: "Balance your chakras and improve spiritual harmony with natural healing stones.",
    price: "₹799",
    oldPrice: "₹1199",
    image: "src/assets/images/products/7bracelate.webp",
  },
  {
    theme: "cyan",
    title: "Nazar Suraksha Bracelet",
    desc: "Designed to protect against negative energy and evil eye with spiritual power.",
    price: "₹699",
    oldPrice: "₹999",
    image: "src/assets/images/products/Nazarbatu.webp",
  },
  {
    theme: "green",
    title: "Green Jade Ring",
    desc: "Elegant jade ring crafted for prosperity, peace, and emotional balance.",
    price: "₹1299",
    oldPrice: "₹1799",
    image: "src/assets/images/products/green.webp",
  },
  {
    theme: "orange",
    title: "Rudraksha Mala",
    desc: "Authentic spiritual Rudraksha mala for meditation, peace, and divine connection.",
    price: "₹1499",
    oldPrice: "₹2199",
    image: "src/assets/images/products/rudraksh.webp",
  },
  {
    theme: "pink",
    title: "Rose Quartz Bracelet",
    desc: "Enhance love, self-confidence, and emotional healing with Rose Quartz crystals.",
    price: "₹899",
    oldPrice: "₹1399",
    image: "src/assets/images/products/Rose Quartz Bracelet.webp",
  },
];

// Helper to compute discount %
const getDiscount = (price, oldPrice) => {
  if (!price || !oldPrice) return null;
  const p = parseFloat(String(price).replace(/[^\d.]/g, ''));
  const op = parseFloat(String(oldPrice).replace(/[^\d.]/g, ''));
  if (!p || !op || op <= p) return null;
  return Math.round(((op - p) / op) * 100);
};

export const ProductCard = ({ p }) => {
  const productId = p.id || p.title.replace(/\s+/g, '-').toLowerCase();
  const discount = getDiscount(p.price, p.oldPrice);

  return (
    <div className="pc-card">
      {/* Discount Badge */}
      {discount && (
        <div className="pc-badge">{discount}% OFF</div>
      )}

      {/* Image Area */}
      <Link to={`/products/${productId}`} className="pc-image-link" tabIndex={-1}>
        <div className="pc-image">
          <img src={p.image} alt={p.title} loading="lazy" />
          <div className="pc-image-overlay" />
        </div>
      </Link>

      {/* Card Content */}
      <div className="pc-body">
        <Link to={`/products/${productId}`} className="pc-title-link">
          <h3 className="pc-title">{p.title}</h3>
        </Link>
        <p className="pc-desc">{p.desc}</p>

        <div className="pc-footer">
          <div className="pc-price-block">
            <span className="pc-price">₹ {p.price}</span>
            {p.oldPrice && <span className="pc-old-price">₹ {p.oldPrice}</span>}
          </div>
          <Link
            to={`/products/${productId}`}
            className="pc-btn"
            id={`product-card-${productId}`}
          >
            Buy Now
          </Link>
        </div>
      </div>
    </div>
  );
};

const Products = () => {
  const { products, loading } = useProducts();
  const displayProducts = products.length > 0 ? products : fallbackProducts;

  const [currentIndex, setCurrentIndex] = useState(3);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [visibleItems, setVisibleItems] = useState(3);
  const touchStartRef = useRef(0);

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

  // Autoplay removed: slider will not auto-advance.

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
      <section className="products-section">
        <div className="section-container">
          <div className="py-20 flex items-center justify-center">
            <div className="text-brand-red text-xl font-bold animate-pulse uppercase tracking-[0.3em]">
              Loading Products...
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (totalRealItems === 0) return null;

  return (
    <section className="products-section">
      <div className="section-container">
        <SliderHeader
          title="Our Sacred Products"
          subTitle="Handpicked spiritual products to elevate your energy and transform your life."
        />

        <div
          className="product-slider-container"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="product-track"
            style={{
              transform: getTranslateX(),
              transition: isTransitioning
                ? 'transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)'
                : 'none'
            }}
          >
            {clonedData.map((p, index) => (
              <div
                className="product-slide"
                key={`${p.id || p.title}-${index}`}
                style={{ flex: `0 0 ${100 / visibleItems}%` }}
              >
                <ProductCard p={p} />
              </div>
            ))}
          </div>
        </div>

        <SliderControls
          onNext={nextSlide}
          onPrev={prevSlide}
          isPrevDisabled={false}
          isNextDisabled={false}
        />

        <div className="flex justify-center mt-10">
          <Button to="/products" variant="primary" size="md" arrow>
            View All Products
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Products;
