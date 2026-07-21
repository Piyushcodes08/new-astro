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
import pyriteImage from "../../../assets/images/products/pyritr.webp";
import chakraImage from "../../../assets/images/products/7bracelate.webp";
import nazarImage from "../../../assets/images/products/Nazarbatu.webp";
import jadeImage from "../../../assets/images/products/green.webp";
import rudrakshaImage from "../../../assets/images/products/rudraksh.webp";
import roseQuartzImage from "../../../assets/images/products/Rose Quartz Bracelet.webp";
import "./products.css";

export const fallbackProducts = [
  {
    theme: "gold",
    title: "Pyrite Bracelet",
    desc: "Attract wealth, confidence, and positive energy with this premium Pyrite crystal bracelet.",
    price: "₹999",
    oldPrice: "₹1499",
    image: pyriteImage,
  },
  {
    theme: "purple",
    title: "7 Chakra Bracelet",
    desc: "Balance your chakras and improve spiritual harmony with natural healing stones.",
    price: "₹799",
    oldPrice: "₹1199",
    image: chakraImage,
  },
  {
    theme: "cyan",
    title: "Nazar Suraksha Bracelet",
    desc: "Designed to protect against negative energy and the evil eye with spiritual power.",
    price: "₹699",
    oldPrice: "₹999",
    image: nazarImage,
  },
  {
    theme: "green",
    title: "Green Jade Ring",
    desc: "An elegant jade ring crafted for prosperity, peace, and emotional balance.",
    price: "₹1299",
    oldPrice: "₹1799",
    image: jadeImage,
  },
  {
    theme: "orange",
    title: "Rudraksha Mala",
    desc: "Authentic spiritual Rudraksha mala for meditation, peace, and divine connection.",
    price: "₹1499",
    oldPrice: "₹2199",
    image: rudrakshaImage,
  },
  {
    theme: "pink",
    title: "Rose Quartz Bracelet",
    desc: "Enhance love, self-confidence, and emotional healing with Rose Quartz crystals.",
    price: "₹899",
    oldPrice: "₹1399",
    image: roseQuartzImage,
  },
];

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

export const ProductCard = ({ product }) => {
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

const getVisibleItems = () => {
  if (typeof window === "undefined") return 3;
  if (window.innerWidth < 640) return 1;
  if (window.innerWidth < 1024) return 2;
  return 3;
};

const Products = () => {
  const { products = [], loading } = useProducts();
  const displayProducts = products.length ? products : fallbackProducts;

  const cloneCount = 3;
  const [currentIndex, setCurrentIndex] = useState(cloneCount);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [visibleItems, setVisibleItems] = useState(getVisibleItems);
  const touchStartRef = useRef(0);

  const totalRealItems = displayProducts.length;

  const clonedData = useMemo(() => {
    if (!totalRealItems) return [];

    return [
      ...displayProducts.slice(-cloneCount),
      ...displayProducts,
      ...displayProducts.slice(0, cloneCount),
    ];
  }, [displayProducts, totalRealItems]);

  useEffect(() => {
    setCurrentIndex(cloneCount);
    setIsTransitioning(false);
  }, [totalRealItems]);

  useEffect(() => {
    const handleResize = () => setVisibleItems(getVisibleItems());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
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
      if (currentIndex >= totalRealItems + cloneCount) {
        setIsTransitioning(false);
        setCurrentIndex(cloneCount);
      } else if (currentIndex < cloneCount) {
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