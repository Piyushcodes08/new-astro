import { useState } from "react";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import { Link } from 'react-router-dom';
import SliderHeader from '../../ui/Slider/SliderHeader';
import { useProducts } from '../../../hooks/useProducts';

import 'swiper/css';
import 'swiper/css/navigation';
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
    const [swiperInstance, setSwiperInstance] = useState(null);
    const { products, loading } = useProducts();
    const displayProducts = products.length > 0 ? products : fallbackProducts;

    return (
        <section className="products-section">
            <div className="section-container">
                <SliderHeader
                    title="Our Sacred Products"
                    subTitle="Handpicked spiritual products to elevate your energy and transform your life."
                />

                <div className="w-full relative pb-4 pt-4">
                    <Swiper
                        modules={[Navigation, Autoplay]}
                        onSwiper={setSwiperInstance}
                        grabCursor={true}
                        navigation={true}
                        loop={true}
                        breakpoints={{
                            320: { slidesPerView: 1, spaceBetween: 20 },
                            640: { slidesPerView: 2, spaceBetween: 24 },
                            1024: { slidesPerView: 3, spaceBetween: 32 },
                        }}
                        autoplay={{ delay: 3800, disableOnInteraction: false }}
                        className="w-full px-2 md:px-8 pb-8!"
                    >
                        {displayProducts.map((p, index) => (
                            <SwiperSlide key={index} className="flex justify-center py-3">
                                <ProductCard p={p} />
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>

                <div className="flex justify-center mt-10">
                    <Link
                        to="/products"
                        className="inline-flex items-center gap-2 bg-linear-to-br from-[#ff3131] to-[#c30000] text-white px-4 py-4 rounded-full font-black uppercase tracking-[0.12em] transition-all duration-300 hover:shadow-[0_14px_30px_rgba(221,39,39,0.45)] hover:from-[#ff4f4f] hover:to-brand-red shadow-[0_10px_25px_rgba(221,39,39,0.25)] text-sm hover:-translate-y-1"
                    >
                        View All Products
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default Products;
