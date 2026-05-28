import { useRef, useState } from "react";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { LuMinus, LuPlus } from "react-icons/lu";
import { Link } from 'react-router-dom';
import SliderHeader from '../../ui/Slider/SliderHeader';
import { useProducts } from '../../../hooks/useProducts';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-coverflow';

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

export const ProductCard = ({ p, index }) => {
    const cardRef = useRef(null);
    const [quantity, setQuantity] = useState(1);
    const [isAdded, setIsAdded] = useState(false);

    // 3D Tilt Logic
    const handleMouseMove = (e) => {
        const card = cardRef.current;
        if (!card) return;

        const wrapper = e.currentTarget;
        const rect = wrapper.getBoundingClientRect();

        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -10;
        const rotateY = ((x - centerX) / centerX) * 10;

        card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
    };

    const handleMouseLeave = () => {
        const card = cardRef.current;
        if (!card) return;
        card.style.transform = "rotateX(0deg) rotateY(0deg) scale(1)";
    };

    // Actions Logic
    const handleBuy = () => {
        setIsAdded(true);
        setTimeout(() => {
            setIsAdded(false);
            setQuantity(1);
        }, 2000);
    };

    const increase = () => setQuantity((prev) => prev + 1);
    const decrease = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

    return (
        <div
            className="card-wrapper"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            <div className={`neon-card ${p.theme}`} ref={cardRef}>
                {/* Animations and decorations */}
                <div className="scan-line" aria-hidden="true" />
                <div className="corner corner-tl" aria-hidden="true" />
                <div className="corner corner-tr" aria-hidden="true" />
                <div className="corner corner-bl" aria-hidden="true" />
                <div className="corner corner-br" aria-hidden="true" />

                <div className="card-inner">
                    

                    <div className="card-image">
                        <div className="glow-orb" aria-hidden="true" />
                        <img src={p.image} alt={p.title} loading="lazy" />
                    </div>

                    <h3 className="card-title">{p.title}</h3>
                    <p className="card-desc flex-grow">{p.desc}</p>

                    <div className="card-bottom mb-4">
                        <div className="card-price">
                            {p.price}
                            <span>{p.oldPrice}</span>
                        </div>
                    </div>

                    {/* Quantity & Buy Button Row */}
                    <div className="flex items-center justify-between gap-3 pt-4 border-t border-white/10 mt-auto relative z-20 pointer-events-auto">
                        <div className="flex items-center bg-white/5 border border-white/10 rounded-lg p-1">
                            <button onClick={decrease} className="w-8 h-8 flex items-center justify-center rounded-md text-white hover:bg-white/10 transition-colors" aria-label="Decrease quantity">
                                <LuMinus size={16} />
                            </button>
                            <span className="w-8 text-center text-sm font-semibold text-white">{quantity}</span>
                            <button onClick={increase} className="w-8 h-8 flex items-center justify-center rounded-md text-white hover:bg-white/10 transition-colors" aria-label="Increase quantity">
                                <LuPlus size={16} />
                            </button>
                        </div>
                        <button
                            className={`flex-1 py-2.5 px-4 rounded-lg font-batangas text-sm font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center border border-red-500/50 shadow-[0_4px_15px_rgba(221,39,39,0.3)] hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(221,39,39,0.5)] ${isAdded ? 'bg-green-600 text-white !border-green-500 !shadow-[0_4px_15px_rgba(34,197,94,0.3)] !translate-y-0 cursor-default' : 'bg-gradient-to-br from-[#dd2727] to-[#b91c1c] text-white hover:from-[#ff3333] hover:to-[#dd2727]'}`}
                            onClick={handleBuy}
                            disabled={isAdded}
                        >
                            {isAdded ? "✓ ADDED" : "BUY NOW"}
                        </button>
                    </div>
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
                        breakpoints={{
                            320: { slidesPerView: 1, spaceBetween: 20 },
                            768: { slidesPerView: 2, spaceBetween: 30 },
                            1024: { slidesPerView: 3, spaceBetween: 40 },
                        }}
                        autoplay={{
                            delay: 3500,
                            disableOnInteraction: false,
                        }}
                        className="w-full px-4 md:px-12"
                    >
                        {displayProducts.map((p, index) => (
                            <SwiperSlide key={index} className="flex justify-center transition-all duration-300">
                                <ProductCard p={p} index={index} />
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>

                <div className="flex justify-center mt-8">
                    <Link 
                        to="/products" 
                        className="inline-block bg-[#dd2727] text-white px-8 py-3.5 rounded-full font-bold uppercase tracking-[0.2em] transition-all duration-500 hover:bg-white hover:text-[#dd2727] shadow-[0_10px_40px_rgba(221,39,39,0.4)] text-sm md:text-base"
                    >
                        View All Products
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default Products;
