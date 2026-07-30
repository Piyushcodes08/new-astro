import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { addDoc, collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

import { db } from '../firebaseConfig';
import { createLogger } from '../utils/logger';
import Header from '../components/sections/Header/Header';
import Footer from '../components/sections/Footer/Footer';
import Button from '../components/ui/Button/Button';
import { fallbackProducts } from '../components/sections/products/Products';

const WhatsappIcon = ({ className = 'w-4 h-4', ...props }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" {...props}>
    <path d="M12 2.04C6.47 2.04 2 6.52 2 12.06c0 2 .6 3.86 1.64 5.44L2 22l4.7-1.23A9.94 9.94 0 0 0 12 22.06c5.53 0 10-4.48 10-10 0-5.54-4.47-10.02-10-10.02Zm5.05 14.78c-.24.7-1.36 1.34-1.83 1.43-.47.08-1.06.13-2.14-.23-1.09-.36-2.04-1.13-3.24-2.22-1.2-1.09-1.99-2.42-2.23-3.51-.23-1.08-.03-1.58.29-1.7.24-.1.53-.14.8-.02.27.13.86.5 1.02.56.16.07.29.1.42-.02.12-.12.47-.56.59-.76.12-.2.24-.18.53-.06.28.11.9.34 1.37.74.48.4.58.67.65.98.07.31-.07.49-.16.64-.09.16-.2.35-.3.52-.12.17-.25.35-.1.6.15.26.66 1.03 1.43 1.67.97.81 1.79 1.03 2.08 1.15.29.11.47.09.64-.05.17-.15.73-.85.91-1.15.18-.3.37-.25.62-.15.24.1 1.54.73 1.8.86.26.13.42.2.48.31.05.11.05.67-.19 1.36Z" />
  </svg>
);

const ShoppingCartIcon = ({ className = 'w-4 h-4', ...props }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" {...props}>
    <path d="M6 6h15l-1.5 9H8.5L6 6Zm-2-2h2l2 12h10l2-12H4Zm5 16a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm10 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z" />
  </svg>
);

const StarIcon = ({ className = 'w-3.5 h-3.5', ...props }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" {...props}>
    <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
  </svg>
);

const CheckIcon = ({ className = 'w-3.5 h-3.5', ...props }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="m5 13 4 4L19 7" />
  </svg>
);

const MinusIcon = ({ className = 'w-3.5 h-3.5', ...props }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M5 12h14" />
  </svg>
);

const PlusIcon = ({ className = 'w-3.5 h-3.5', ...props }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 5v14" />
    <path d="M5 12h14" />
  </svg>
);

const ShieldIcon = ({ className = 'w-4 h-4', ...props }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 2 4 5v6c0 5.2 3.5 10.8 8 11 4.5-.2 8-5.8 8-11V5l-8-3Z" />
    <path d="M9.5 12.5 11 14l3.5-3.5" />
  </svg>
);

const PackageIcon = ({ className = 'w-4 h-4', ...props }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M5 8 12 4l7 4v10a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V8Z" />
    <path d="M12 4v16" />
    <path d="M5 8h14" />
  </svg>
);

const TruckIcon = ({ className = 'w-4 h-4', ...props }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M1 15h15" />
    <path d="M3 15V8a1 1 0 0 1 1-1h10v8H3Z" />
    <path d="M16 15h3l2 3v3H16v-6Z" />
    <circle cx="6.5" cy="19.5" r="1.5" />
    <circle cx="18.5" cy="19.5" r="1.5" />
  </svg>
);

const logger = createLogger('ProductDetailsPage');

const parsePrice = (value) =>
  parseFloat(String(value || '').replace(/[^\d.]/g, '')) || 0;

const getDiscount = (price, oldPrice) => {
  const current = parsePrice(price);
  const original = parsePrice(oldPrice);

  if (!current || !original || original <= current) return null;
  return Math.round(((original - current) / original) * 100);
};

const ProductDetailsPage = () => {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [pinned, setPinned] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);

  useEffect(() => {
    const onScroll = () => setPinned(window.scrollY > 420);

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);
        setActiveImageIndex(0);
        setQuantity(1);

        const fallbackMatch = fallbackProducts.find(
          (item) =>
            String(item.id) === String(id) ||
            item.title.replace(/\s+/g, '-').toLowerCase() === String(id)
        );

        if (fallbackMatch) {
          setProduct({
            id:
              fallbackMatch.id ||
              fallbackMatch.title.replace(/\s+/g, '-').toLowerCase(),
            ...fallbackMatch,
            images: fallbackMatch.images || [fallbackMatch.image],
          });
        } else {
          const docRef = doc(db, 'products', id);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data();

            setProduct({
              id: docSnap.id,
              ...data,
              images: data.images || (data.image ? [data.image] : []),
            });
          } else {
            const fallbackTitleMatch = fallbackProducts.find(
              (item) =>
                item.title.replace(/\s+/g, '-').toLowerCase() === String(id)
            );

            if (fallbackTitleMatch) {
              setProduct({
                id: fallbackTitleMatch.title
                  .replace(/\s+/g, '-')
                  .toLowerCase(),
                ...fallbackTitleMatch,
                images:
                  fallbackTitleMatch.images || [fallbackTitleMatch.image],
              });
            }
          }
        }

        const snapshot = await getDocs(collection(db, 'products'));
        const dbProducts = snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        }));

        const allProducts =
          dbProducts.length > 0 ? dbProducts : fallbackProducts;

        setRelatedProducts(
          allProducts
            .filter((item) => {
              const productId =
                item.id || item.title.replace(/\s+/g, '-').toLowerCase();

              return String(productId) !== String(id);
            })
            .slice(0, 4)
        );
      } catch (error) {
        logger.error('Error fetching product details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  const increase = () => setQuantity((current) => current + 1);

  const decrease = () =>
    setQuantity((current) => Math.max(1, current - 1));

  const handleRazorpay = async () => {
    if (!product) return;

    setPaymentLoading(true);

    try {
      const priceNumber = parsePrice(product.price);

      if (!priceNumber) {
        alert(
          'Product price is not available. Please contact us via WhatsApp.'
        );
        setPaymentLoading(false);
        return;
      }

      const loadScript = (src) =>
        new Promise((resolve, reject) => {
          const existing = document.querySelector(`script[src="${src}"]`);

          if (existing) {
            if (window.Razorpay) {
              resolve(true);
              return;
            }

            existing.addEventListener('load', () => resolve(true), {
              once: true,
            });

            existing.addEventListener(
              'error',
              () => reject(new Error('Script load failed')),
              { once: true }
            );

            return;
          }

          const script = document.createElement('script');
          script.src = src;
          script.async = true;
          script.onload = () => resolve(true);
          script.onerror = () =>
            reject(new Error('Script load failed'));

          document.body.appendChild(script);
        });

      if (!window.Razorpay) {
        try {
          await loadScript(
            'https://checkout.razorpay.com/v1/checkout.js'
          );
        } catch {
          alert(
            'Payment gateway failed to load. Please try WhatsApp ordering.'
          );
          setPaymentLoading(false);
          return;
        }
      }

      const totalAmount = priceNumber * quantity;
      const amountInPaise = Math.round(totalAmount * 100);

      const orderResponse = await fetch(
        'https://backend-7e8f.onrender.com/api/payment/razorpay/order',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: amountInPaise }),
        }
      );

      if (!orderResponse.ok) {
        throw new Error('Failed to create Razorpay order.');
      }

      const { orderId } = await orderResponse.json();

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY || '',
        amount: amountInPaise,
        currency: 'INR',
        name: 'Vahlaya Astro',
        description: `${product.title} × ${quantity}`,
        image: product.image,
        order_id: orderId,

        handler: async (response) => {
          try {
            const backendResponse = await fetch(
              'https://backend-7e8f.onrender.com/api/payment/razorpay/success',
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  paymentId: response.razorpay_payment_id,
                  orderId: response.razorpay_order_id,
                  signature: response.razorpay_signature,
                  productId: product.id,
                  productTitle: product.title,
                  quantity,
                  amount: amountInPaise,
                }),
              }
            );

            if (!backendResponse.ok) {
              throw new Error('Payment verification failed.');
            }

            try {
              const auth = getAuth();
              const currentUser = auth.currentUser;

              await addDoc(collection(db, 'product_orders'), {
                userId: currentUser?.email || 'guest',
                productId: product.id,
                productTitle: product.title,
                quantity,
                amount: totalAmount,
                transactionId: response.razorpay_payment_id,
                status: 'paid',
                timestamp: new Date(),
              });
            } catch (firestoreError) {
              logger.warn(
                'Firestore log failed:',
                firestoreError
              );
            }

            alert(
              `✅ Payment Successful!\n\n${product.title} × ${quantity}\nAmount: ₹${totalAmount.toLocaleString(
                'en-IN'
              )}\n\nWe will contact you within 24 hours for delivery.`
            );
          } catch (error) {
            logger.error('Payment handler error:', error);
            alert(
              'Payment received! We will contact you shortly.'
            );
          } finally {
            setPaymentLoading(false);
          }
        },

        prefill: {
          name: '',
          email: '',
          contact: '',
        },

        theme: {
          color: '#a91d0d',
        },

        modal: {
          ondismiss: () => setPaymentLoading(false),
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on('payment.failed', () => {
        alert(
          'Payment failed. Please try again or use WhatsApp.'
        );
        setPaymentLoading(false);
      });

      razorpay.open();
    } catch (error) {
      logger.error('Razorpay error:', error);
      alert(
        'Unable to initiate payment. Please try WhatsApp ordering.'
      );
      setPaymentLoading(false);
    }
  };

  const handleWhatsApp = () => {
    if (!product) return;

    const message = `🙏 Hare Krishna!\n\nI would like to order:\n*${product.title}*\nQuantity: ${quantity}\nPrice: ₹${
      parsePrice(product.price) * quantity
    }\n\nPlease guide me on payment and delivery. 🕉️`;

    window.open(
      `https://wa.me/919904229944?text=${encodeURIComponent(message)}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-transparent">
        <div className="space-y-4 text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-[#b99242] border-t-transparent" />
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-white/40">
            Loading Product...
          </p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <>
        <Header />

        <main className="flex min-h-screen items-center justify-center bg-[#050303] px-4 text-white">
          <div className="max-w-md space-y-5 text-center">
            <div className="text-6xl">🔍</div>

            <h1 className="font-serif text-4xl uppercase">
              Product Not Found
            </h1>

            <p className="text-sm text-white/50">
              The sacred item you seek could not be found.
            </p>

            <Button
              to="/products"
              variant="primary"
              size="md"
            >
              Back to Sacred Shop
            </Button>
          </div>
        </main>

        <Footer />
      </>
    );
  }

  const imagesList =
    product.images?.filter(Boolean).length > 0
      ? product.images.filter(Boolean)
      : [product.image].filter(Boolean);

  const discount = getDiscount(
    product.price,
    product.oldPrice
  );

  const priceNumber = parsePrice(product.price);
  const totalPrice = priceNumber * quantity;

  const savingsPerUnit = Math.max(
    0,
    parsePrice(product.oldPrice) -
      parsePrice(product.price)
  );

  const totalSavings = savingsPerUnit * quantity;

  const tabs = [
    { id: 'description', label: 'Description' },
    { id: 'benefits', label: 'Benefits' },
    { id: 'shipping', label: 'Shipping & Delivery' },
  ];

  const benefits = [
    'Natural, handpicked and energetically cleansed',
    'Charged with Vedic mantras for maximum effect',
    'Authentic spiritual-grade quality',
    'Suitable for daily use, rituals and meditation',
  ];

  const shipping = [
    'Delivery within 5–7 business days across India',
    'Carefully packed to prevent damage in transit',
    'Cash on delivery available in select areas',
    'Free shipping on orders above ₹1,500',
  ];

  return (
    <>
      <Header />

      {/* Sticky buy bar */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-500 ${
          pinned
            ? 'translate-y-0 opacity-100'
            : 'pointer-events-none translate-y-full opacity-0'
        }`}
      >
        <div className="border-t border-[#8f5b22]/30 bg-[#090403]/95 px-4 py-3 shadow-[0_-12px_50px_rgba(0,0,0,0.55)] backdrop-blur-2xl">
          <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-[#f7efe4] p-1">
                <img
                  src={imagesList[0]}
                  alt={product.title}
                  className="h-full w-full object-contain"
                />
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">
                  {product.title}
                </p>

                <p className="text-base font-bold text-[#e6c56a]">
                  ₹{totalPrice.toLocaleString('en-IN')}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={handleWhatsApp}
                className="hidden items-center gap-2 rounded-lg border border-[#25D366]/45 px-4 py-3 text-[10px] font-black uppercase tracking-[0.14em] text-[#41d68a] transition-all hover:bg-[#25D366]/15 sm:flex"
              >
                <WhatsappIcon />
                Order
              </button>

              <button
                type="button"
                onClick={handleRazorpay}
                disabled={paymentLoading}
                className="flex items-center gap-2 rounded-lg border border-[#ee7743]/55 bg-gradient-to-br from-[#c52f18] to-[#8f1a0c] px-5 py-3 text-[10px] font-black uppercase tracking-[0.14em] text-white shadow-[0_8px_28px_rgba(154,30,13,0.3)] transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ShoppingCartIcon />
                {paymentLoading
                  ? 'Processing...'
                  : 'Buy Now'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <main className="relative min-h-screen overflow-hidden bg-transparent pb-28 pt-24 text-white md:pt-28">
        {/* Cosmic particles */}
        <div className="pointer-events-none absolute inset-0 opacity-45 bg-[radial-gradient(circle_at_12%_20%,rgba(255,120,68,0.34)_0_1px,transparent_1.7px),radial-gradient(circle_at_87%_22%,rgba(255,181,73,0.28)_0_1px,transparent_1.6px),radial-gradient(circle_at_94%_44%,rgba(255,94,48,0.28)_0_1px,transparent_1.7px),radial-gradient(circle_at_8%_72%,rgba(255,107,52,0.22)_0_1px,transparent_1.8px)] [background-size:190px_190px,230px_230px,280px_280px,320px_320px]" />

        <div className="relative z-10 mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav
            aria-label="breadcrumb"
            className="mb-5 flex items-center gap-3 text-[10px] text-white/40 md:mb-6"
          >
            <Link
              to="/"
              className="text-white/45 transition-colors hover:text-[#d5ad52]"
              aria-label="Home"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-3 w-3"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M3 10.5 12 3l9 7.5" />
                <path d="M5.5 9.5V21h13V9.5" />
                <path d="M9.5 21v-6h5v6" />
              </svg>
            </Link>

            <span className="text-white/20">/</span>

            <Link
              to="/products"
              className="transition-colors hover:text-[#d5ad52]"
            >
              Products
            </Link>

            <span className="text-white/20">/</span>

            <span className="max-w-[220px] truncate text-white/60">
              {product.title}
            </span>
          </nav>

          <section className="grid gap-4 sm:gap-6 lg:gap-10 xl:gap-12" style={{display: 'grid', gridTemplateColumns: '1fr 1.2fr', gridAutoRows: 'max-content'}}>
            {/* LEFT SIDE - Image Gallery */}
            <div className="min-w-0">
              <div className="rounded-2xl border border-[#966027]/60 bg-gradient-to-br from-[#1a0a07]/95 to-[#080504]/95 p-2 shadow-[0_24px_60px_rgba(0,0,0,0.48),inset_0_1px_0_rgba(255,216,158,0.05),0_0_0_1px_rgba(91,31,16,0.2)]">
                {/* Main image */}
                <div className="group relative">
                  <div className="relative aspect-square overflow-hidden rounded-xl bg-[radial-gradient(circle_at_50%_45%,rgba(255,255,255,0.95),transparent_54%),linear-gradient(145deg,#f3eadf,#fff9f1_58%,#eadfd3)] p-3 shadow-[inset_0_0_30px_rgba(125,83,48,0.09)] sm:aspect-[1.15/1] sm:p-4 lg:aspect-[1.23/1]">
                    {imagesList[activeImageIndex] && (
                      <img
                        src={imagesList[activeImageIndex]}
                        alt={`${product.title} view ${
                          activeImageIndex + 1
                        }`}
                        className="h-full w-full object-contain transition-transform duration-700 group-hover:scale-[1.025]"
                      />
                    )}

                    {discount && (
                      <span className="absolute left-2.5 top-2.5 rounded-md border border-[#ff9770]/20 bg-gradient-to-br from-[#bd3423] to-[#8f160d] px-2.5 py-1.5 text-[9px] font-black leading-none tracking-[0.04em] text-white shadow-[0_5px_14px_rgba(99,10,5,0.32)]">
                        {discount}% OFF
                      </span>
                    )}
                  </div>
                </div>

                {/* Thumbnails */}
                <div className="flex items-center gap-2 pt-2">
                  {imagesList.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        setActiveImageIndex((current) =>
                          current > 0
                            ? current - 1
                            : imagesList.length - 1
                        )
                      }
                      className="inline-flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full border border-[#a56727]/50 bg-[#0d0806]/85 text-[#e8b758]/80 transition-all hover:border-[#d5a448]/85 hover:bg-[#6d2510]/45 hover:text-[#fff5d7]"
                      aria-label="Previous image"
                    >
                      <span className="text-lg leading-none">‹</span>
                    </button>
                  )}

                  <div className="flex min-w-0 flex-1 justify-center gap-2.5 overflow-x-auto px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {imagesList.map((image, index) => (
                      <button
                        type="button"
                        key={`${image}-${index}`}
                        onClick={() =>
                          setActiveImageIndex(index)
                        }
                        className={`h-12 w-[54px] shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-[#eee5d9] to-[#fffaf4] p-[3px] transition-all sm:h-[52px] sm:w-[58px] ${
                          activeImageIndex === index
                            ? '-translate-y-px border border-[#dca644]/90 opacity-100 shadow-[0_0_0_1px_rgba(220,166,68,0.22),0_5px_18px_rgba(84,36,14,0.42)]'
                            : 'border border-[#70461f]/40 opacity-70 hover:-translate-y-px hover:opacity-100'
                        }`}
                        aria-label={`Show image ${index + 1}`}
                      >
                        <img
                          src={image}
                          alt={`${product.title} thumbnail ${
                            index + 1
                          }`}
                          className="h-full w-full object-contain"
                        />
                      </button>
                    ))}
                  </div>

                  {imagesList.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        setActiveImageIndex((current) =>
                          current <
                          imagesList.length - 1
                            ? current + 1
                            : 0
                        )
                      }
                      className="inline-flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full border border-[#a56727]/50 bg-[#0d0806]/85 text-[#e8b758]/80 transition-all hover:border-[#d5a448]/85 hover:bg-[#6d2510]/45 hover:text-[#fff5d7]"
                      aria-label="Next image"
                    >
                      <span className="text-lg leading-none">›</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Trust cards */}
              <div className="mt-2.5 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {[
                  {
                    icon: <ShieldIcon />,
                    label: 'Authentic',
                    sub: '100% Genuine',
                  },
                  {
                    icon: <TruckIcon />,
                    label: 'Fast Delivery',
                    sub: '5–7 Days',
                  },
                  {
                    icon: <PackageIcon />,
                    label: 'Safe Pack',
                    sub: 'Damage-Free',
                  },
                  {
                    icon: <CheckIcon />,
                    label: 'Easy Returns',
                    sub: 'Hassle-Free',
                  },
                ].map(({ icon, label, sub }) => (
                  <div
                    key={label}
                    className="flex min-h-[66px] flex-col items-center justify-center gap-[5px] rounded-xl border border-[#74461f]/40 bg-gradient-to-br from-[#1c0c08]/85 to-[#080605]/95 px-1.5 py-2.5 text-center shadow-[inset_0_1px_0_rgba(255,224,168,0.025)]"
                  >
                    <span className="text-[#d9ad4b]">
                      {icon}
                    </span>

                    <p className="text-[10px] font-black uppercase leading-none tracking-[0.08em] text-white/85">
                      {label}
                    </p>

                    <p className="text-[8px] uppercase tracking-[0.04em] text-white/35">
                      {sub}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT SIDE - Product Details */}
            <div className="min-w-0 lg:pt-0.5">
              {/* Title */}
              <div className="flex items-start justify-between gap-5">
                <div>
                  <p className="mb-1.5 text-[9px] font-black uppercase tracking-[0.22em] text-[#d7ab4e]">
                    ✦ Premium Wellness
                  </p>

                  <h1 className="font-serif text-[2.2rem] leading-[0.98] text-[#f6efe6] sm:text-[2.65rem] lg:text-[2.75rem]">
                    {product.title}
                  </h1>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setWishlisted((current) => !current)
                  }
                  className={`inline-flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full border transition-all ${
                    wishlisted
                      ? 'border-[#e1aa4b]/90 bg-[#632511]/40 text-[#ffd782] shadow-[0_0_22px_rgba(197,98,35,0.22)]'
                      : 'border-[#a36427]/60 bg-[#0d0907]/85 text-[#f4dfb0]/90 shadow-[0_0_16px_rgba(153,73,26,0.14)] hover:border-[#e1aa4b]/90 hover:bg-[#632511]/40 hover:text-[#ffd782]'
                  }`}
                  aria-label={
                    wishlisted
                      ? 'Remove from wishlist'
                      : 'Add to wishlist'
                  }
                >
                  <span className="text-lg leading-none">
                    {wishlisted ? '♥' : '♡'}
                  </span>
                </button>
              </div>

              {/* Rating */}
              <div className="mb-4 mt-2.5 flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map(
                    (_, index) => (
                      <StarIcon
                        key={index}
                        className="fill-current text-[#f2bd36]"
                      />
                    )
                  )}
                </div>

                <span className="text-[10px] text-white/65">
                  4.9
                </span>

                <span className="text-white/20">|</span>

                <span className="text-[10px] text-white/40">
                  120+ verified reviews
                </span>
              </div>

              {/* Price */}
              <div className="rounded-xl border border-[#6e3d1f]/40 bg-gradient-to-br from-[#130b09]/80 to-[#080605]/95 px-4 py-3.5 shadow-[inset_0_1px_0_rgba(255,217,163,0.025)] sm:px-[18px]">
                <div className="flex flex-wrap items-end gap-x-10 gap-y-3">
                  <div>
                    <p className="mb-1 text-[8px] font-extrabold uppercase leading-none tracking-[0.08em] text-white/25">
                      Price
                    </p>

                    <p className="text-[2.35rem] font-semibold leading-none tracking-[-0.04em] text-[#f4f1ed]">
                      ₹
                      {priceNumber.toLocaleString(
                        'en-IN'
                      )}
                    </p>
                  </div>

                  {product.oldPrice && (
                    <div>
                      <p className="mb-1 text-[8px] font-extrabold uppercase leading-none tracking-[0.08em] text-white/25">
                        MRP
                      </p>

                      <p className="text-lg text-white/30 line-through">
                        ₹
                        {parsePrice(
                          product.oldPrice
                        ).toLocaleString('en-IN')}
                      </p>
                    </div>
                  )}

                  {discount && (
                    <span className="self-center rounded-full border border-[#f87952]/20 bg-gradient-to-br from-[#c12f1d] to-[#8c160c] px-[13px] py-[7px] text-[9px] font-extrabold text-[#fff1e7] shadow-[0_8px_20px_rgba(121,23,10,0.2)]">
                      Save {discount}%
                    </span>
                  )}
                </div>

                {totalSavings > 0 && (
                  <p className="mt-3 flex items-center gap-2 text-[10px] text-white/40">
                    <span className="text-[#d8ae4f]">
                      ◇
                    </span>
                    You save ₹
                    {totalSavings.toLocaleString(
                      'en-IN'
                    )}{' '}
                    on this order
                  </p>
                )}
              </div>

              {/* Tabs */}
              <div className="mt-3 overflow-hidden rounded-xl border border-[#6e3d1f]/40 bg-gradient-to-br from-[#130b09]/80 to-[#080605]/95 shadow-[inset_0_1px_0_rgba(255,217,163,0.025)]">
                <div className="grid grid-cols-3 border-b border-[#643e1f]/40">
                  {tabs.map((tab) => (
                    <button
                      type="button"
                      key={tab.id}
                      onClick={() =>
                        setActiveTab(tab.id)
                      }
                      className={`relative px-2 py-2.5 text-[8px] font-extrabold uppercase leading-[1.15] tracking-[0.075em] transition-colors after:absolute after:bottom-[-1px] after:left-[13%] after:right-[13%] after:h-px after:transition-all ${
                        activeTab === tab.id
                          ? 'text-[#d8ad55] after:bg-[#d2a34a] after:shadow-[0_0_10px_rgba(218,169,78,0.45)]'
                          : 'text-white/35 after:bg-transparent hover:text-[#d8ad55]'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="min-h-[136px] px-4 py-3.5 sm:px-5">
                  {activeTab === 'description' && (
                    <p className="mb-2.5 text-[11px] leading-[1.55] text-white/50">
                      {product.desc ||
                        'Crafted with carefully selected ingredients to support your daily wellness ritual and spiritual balance.'}
                    </p>
                  )}

                  {(activeTab === 'description' ||
                    activeTab === 'benefits') && (
                    <ul className="space-y-1.5">
                      {benefits.map((item) => (
                        <li
                          key={item}
                          className="flex items-start gap-2 text-[10px] leading-[1.45] text-white/55"
                        >
                          <span className="mt-px text-[#d8ae4f]">
                            ✦
                          </span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {activeTab === 'shipping' && (
                    <ul className="space-y-1.5">
                      {shipping.map((item) => (
                        <li
                          key={item}
                          className="flex items-start gap-2 text-[10px] leading-[1.45] text-white/55"
                        >
                          <CheckIcon
                            className="mt-px shrink-0 text-[#d8ae4f]"
                          />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Quantity + CTA */}
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex shrink-0 items-center gap-2.5">
                  <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-white/45">
                    Qty
                  </span>

                  <div className="grid h-[38px] min-w-[104px] grid-cols-[32px_40px_32px] items-center overflow-hidden rounded-lg border border-[#69472d]/50 bg-[#080706]/90 text-white/85">
                    <button
                      type="button"
                      onClick={decrease}
                      aria-label="Decrease quantity"
                      className="inline-flex h-full items-center justify-center text-white/70 transition-all hover:bg-[#6d3215]/20 hover:text-[#f4cc77]"
                    >
                      <MinusIcon />
                    </button>

                    <span className="text-center text-xs font-extrabold">
                      {quantity}
                    </span>

                    <button
                      type="button"
                      onClick={increase}
                      aria-label="Increase quantity"
                      className="inline-flex h-full items-center justify-center text-white/70 transition-all hover:bg-[#6d3215]/20 hover:text-[#f4cc77]"
                    >
                      <PlusIcon />
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRazorpay}
                  disabled={paymentLoading}
                  className="inline-flex min-h-[42px] flex-1 items-center justify-center gap-2 rounded-lg border border-[#f5764c]/60 bg-gradient-to-br from-[#c63620] to-[#9a1b0d] px-4 text-[9px] font-black uppercase tracking-[0.09em] text-white shadow-[inset_0_1px_0_rgba(255,222,192,0.11),0_10px_25px_rgba(127,28,11,0.2)] transition-all hover:-translate-y-px hover:shadow-[inset_0_1px_0_rgba(255,222,192,0.14),0_13px_30px_rgba(154,37,15,0.3)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {paymentLoading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <ShoppingCartIcon />
                      Buy Now · ₹
                      {totalPrice.toLocaleString(
                        'en-IN'
                      )}
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleWhatsApp}
                  className="inline-flex min-h-[42px] flex-1 items-center justify-center gap-2 rounded-lg border border-[#26bb6f]/50 bg-[#0f291e]/20 px-4 text-[9px] font-black uppercase tracking-[0.09em] text-[#44d68d] transition-all hover:-translate-y-px hover:bg-[#1a6e48]/20 hover:shadow-[0_12px_25px_rgba(10,86,53,0.13)]"
                >
                  <WhatsappIcon />
                  WhatsApp Order
                </button>
              </div>

              {/* Payment security */}
              <p className="mt-2.5 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[8px] text-white/30">
                <span className="flex items-center gap-1 text-[#d0a541]">
                  <span aria-hidden="true">🔒</span>
                  Secured by Razorpay
                </span>
                <span>•</span>
                <span>UPI</span>
                <span>•</span>
                <span>Cards</span>
                <span>•</span>
                <span>Net Banking</span>
                <span>•</span>
                <span>COD available</span>
              </p>

              {/* Shipping summary */}
              <div className="mt-4 grid overflow-hidden rounded-xl border border-[#6e3d1f]/40 bg-gradient-to-br from-[#130b09]/80 to-[#080605]/95 shadow-[inset_0_1px_0_rgba(255,217,163,0.025)] sm:grid-cols-[minmax(0,1.28fr)_minmax(215px,0.92fr)]">
                <div className="flex min-h-[82px] items-center gap-3 border-l border-[#b52d19]/75 px-4 py-[13px] shadow-[inset_5px_0_20px_rgba(121,19,10,0.07)]">
                  <span className="inline-flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full bg-[radial-gradient(circle,rgba(190,38,24,0.9),rgba(107,14,8,0.9))] text-[#fff1e9] shadow-[0_0_22px_rgba(184,35,20,0.28)]">
                      <TruckIcon />
                  </span>

                  <div>
                    <p className="text-[12px] font-semibold text-white/85">
                      Shipping & Delivery
                    </p>

                    <p className="mt-1 text-[9px] leading-[1.5] text-white/35">
                      We deliver across India with safe and reliable shipping partners you can trust.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col justify-center gap-2.5 border-t border-[#583923]/40 px-3.5 py-3 sm:border-l sm:border-t-0">
                  <div className="flex items-center gap-2.5 text-[#d6aa4d]">
                    <span className="text-base leading-none">
                      ◫
                    </span>

                    <div>
                      <p className="text-[9px] font-bold leading-[1.1] text-white/70">
                        Estimated Delivery
                      </p>

                      <span className="mt-0.5 block text-[8px] leading-[1.1] text-white/30">
                        5 – 7 Business Days
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 text-[#d6aa4d]">
                    <span className="text-base leading-none">
                      ◇
                    </span>

                    <div>
                      <p className="text-[9px] font-bold leading-[1.1] text-white/70">
                        Free Shipping
                      </p>

                      <span className="mt-0.5 block text-[8px] leading-[1.1] text-white/30">
                        On orders above ₹1,500
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Related products */}
          {relatedProducts.length > 0 && (
            <section className="mt-20 md:mt-24">
              <div className="mb-6 flex items-end gap-5">
                <div>
                  <p className="mb-1 text-[9px] font-black uppercase tracking-[0.3em] text-[#c99a3d]">
                    Explore More
                  </p>

                  <h2 className="font-serif text-2xl uppercase text-white md:text-3xl">
                    You May Also Like
                  </h2>
                </div>

                <div className="h-px flex-1 bg-gradient-to-r from-[#8f5b22]/45 to-transparent" />

                <Button
                  to="/products"
                  variant="primary"
                  size="sm"
                  arrow
                >
                  View All
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {relatedProducts.map(
                  (item, index) => {
                    const productId =
                      item.id ||
                      item.title
                        .replace(/\s+/g, '-')
                        .toLowerCase();

                    const itemDiscount =
                      getDiscount(
                        item.price,
                        item.oldPrice
                      );

                    return (
                      <Link
                        key={`${productId}-${index}`}
                        to={`/products/${productId}`}
                        className="group flex flex-col overflow-hidden rounded-2xl border border-[#714521]/30 bg-gradient-to-br from-[#180b08]/90 to-[#090605]/95 text-white shadow-[0_5px_24px_rgba(0,0,0,0.35)] transition-all duration-300 hover:-translate-y-1.5 hover:border-[#bb7c34]/50 hover:shadow-[0_18px_45px_rgba(0,0,0,0.44)]"
                      >
                        <div className="relative m-[7px] mb-0 aspect-square overflow-hidden rounded-xl bg-gradient-to-br from-[#eee5d8] to-[#fffaf4]">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="h-full w-full object-contain p-4 transition-transform duration-500 group-hover:scale-[1.06]"
                          />

                          {itemDiscount && (
                            <span className="absolute left-2 top-2 rounded-md bg-gradient-to-br from-[#be3522] to-[#8d160c] px-2 py-1 text-[8px] font-black text-white">
                              {itemDiscount}% OFF
                            </span>
                          )}
                        </div>

                        <div className="flex flex-1 flex-col gap-1.5 p-3.5">
                          <h3 className="max-h-[2.6em] overflow-hidden font-serif text-base font-bold leading-[1.3] text-white/90">
                            {item.title}
                          </h3>

                          <div className="mt-auto flex items-baseline gap-2 border-t border-white/[0.07] pt-2.5">
                            <span className="font-serif text-lg font-black text-white">
                              ₹
                              {parsePrice(
                                item.price
                              ).toLocaleString(
                                'en-IN'
                              )}
                            </span>

                            {item.oldPrice && (
                              <span className="text-xs text-white/25 line-through">
                                ₹
                                {parsePrice(
                                  item.oldPrice
                                ).toLocaleString(
                                  'en-IN'
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                    );
                  }
                )}
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
};

export default ProductDetailsPage;