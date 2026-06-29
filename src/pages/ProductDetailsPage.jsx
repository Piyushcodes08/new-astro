import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { getAuth } from 'firebase/auth';
import { createLogger } from '../utils/logger';
import Header from '../components/sections/Header/Header';
import Footer from '../components/sections/Footer/Footer';

const logger = createLogger('ProductDetailsPage');
import { LuMinus, LuPlus, LuShoppingCart, LuPackage, LuShield, LuTruck } from 'react-icons/lu';
import { RiWhatsappFill } from 'react-icons/ri';
import { fallbackProducts } from '../components/sections/products/Products';

const parsePrice = (priceStr) => {
  if (!priceStr) return 0;
  return parseFloat(String(priceStr).replace(/[^\d.]/g, '')) || 0;
};

const getDiscount = (price, oldPrice) => {
  const p = parsePrice(price);
  const op = parsePrice(oldPrice);
  if (!p || !op || op <= p) return null;
  return Math.round(((op - p) / op) * 100);
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

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);

        const fallbackMatch = fallbackProducts.find(
          (p) =>
            String(p.id) === String(id) ||
            p.title.replace(/\s+/g, '-').toLowerCase() === String(id)
        );

        if (fallbackMatch) {
          setProduct({
            id: fallbackMatch.id || fallbackMatch.title.replace(/\s+/g, '-').toLowerCase(),
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
              (p) => p.title.replace(/\s+/g, '-').toLowerCase() === String(id)
            );

            if (fallbackTitleMatch) {
              setProduct({
                id: fallbackTitleMatch.title.replace(/\s+/g, '-').toLowerCase(),
                ...fallbackTitleMatch,
                images: fallbackTitleMatch.images || [fallbackTitleMatch.image],
              });
            }
          }
        }

        const querySnapshot = await getDocs(collection(db, 'products'));
        const dbProducts = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const allProds = dbProducts.length > 0 ? dbProducts : fallbackProducts;

        const filtered = allProds
          .filter((p) => {
            const prodId = p.id || p.title.replace(/\s+/g, '-').toLowerCase();
            return String(prodId) !== String(id);
          })
          .slice(0, 4);

        setRelatedProducts(filtered);
      } catch (err) {
        logger.error('Error fetching product details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  const increase = () => setQuantity((prev) => prev + 1);
  const decrease = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  const handleRazorpay = async () => {
    if (!product) return;
    setPaymentLoading(true);

    try {
      const priceNum = parsePrice(product.price);

      if (!priceNum) {
        alert('Product price is not available. Please contact us via WhatsApp.');
        setPaymentLoading(false);
        return;
      }

      // Step 1: Ensure Razorpay SDK is loaded (dynamically load if missing)
      const loadScript = (src) =>
        new Promise((resolve, reject) => {
          const existing = document.querySelector(`script[src="${src}"]`);
          if (existing) {
            existing.addEventListener('load', () => resolve(true));
            existing.addEventListener('error', () => reject(false));
            if (existing.readyState === 'complete') resolve(true);
            return;
          }
          const script = document.createElement('script');
          script.src = src;
          script.async = true;
          script.onload = () => resolve(true);
          script.onerror = () => reject(false);
          document.body.appendChild(script);
        });

      if (!window.Razorpay) {
        try {
          await loadScript('https://checkout.razorpay.com/v1/checkout.js');
        } catch (e) {
          logger.warn('Failed to load Razorpay SDK:', e);
          alert('Payment gateway failed to load. Please try again later or use WhatsApp to order.');
          setPaymentLoading(false);
          return;
        }
      }

      const totalAmount = priceNum * quantity;
      const amountInPaise = Math.round(totalAmount * 100);

      // Step 2: Create Razorpay order on backend (send paise)
      const orderResponse = await fetch('https://backend-7e8f.onrender.com/api/payment/razorpay/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: amountInPaise }),
      });

      if (!orderResponse.ok) throw new Error('Failed to create Razorpay order.');

      const { orderId } = await orderResponse.json();

      // Step 3: Configure Razorpay options
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
            // Step 4: Verify payment on backend
            const backendResponse = await fetch('https://backend-7e8f.onrender.com/api/payment/razorpay/success', {
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
            });

            if (!backendResponse.ok) throw new Error('Payment verification failed.');

            // Step 5: Log to Firestore
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
            } catch (firebaseErr) {
              logger.warn('Firestore log failed (non-critical):', firebaseErr);
            }

            alert(
              `✅ Payment Successful!\n\nOrder placed for:\n${product.title} × ${quantity}\nAmount: ₹${totalAmount.toLocaleString('en-IN')}\n\nYou will be contacted within 24 hours for delivery details.`
            );
          } catch (err) {
            logger.error('Payment handler error:', err);
            alert('Payment received! We will contact you shortly to confirm your order.');
          } finally {
            setPaymentLoading(false);
          }
        },
        prefill: {
          name: '',
          email: '',
          contact: '',
        },
        notes: {
          product_id: product.id,
          product_title: product.title,
          quantity: String(quantity),
        },
        theme: { color: '#bf0603' },
        modal: {
          ondismiss: () => setPaymentLoading(false),
        },
      };

      // Step 6: Open Razorpay
      const rzp = new window.Razorpay(options);

      rzp.on('payment.failed', (response) => {
        logger.error('Payment failed:', response.error);
        alert('Payment failed. Please try again or use WhatsApp to place your order.');
        setPaymentLoading(false);
      });

      rzp.open();
    } catch (err) {
      logger.error('Razorpay error:', err);
      alert('Unable to initiate payment. Please try WhatsApp ordering below.');
      setPaymentLoading(false);
    }
  };

  const handleWhatsApp = () => {
    if (!product) return;

    const msg = `🙏 Hare Krishna!\n\nI would like to order:\n*${product.title}*\nQuantity: ${quantity}\nPrice: ${product.price} × ${quantity}\n\nPlease guide me on payment and delivery. 🕉️`;

    window.open(`https://wa.me/919904229944?text=${encodeURIComponent(msg)}`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050204]">
        <div className="text-center space-y-4">
          <div className="w-11 h-11 border-brand-red border-[#bf0603] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-white/50 text-[11px] uppercase tracking-[0.3em] font-bold">
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
        <main className="min-h-screen flex items-center justify-center  text-white px-4">
          <div className="text-center space-y-5 max-w-md">
            <h1 className="title-batangas text-3xl sm:text-4xl uppercase">
              Product Not Found
            </h1>
            <p className="text-white/60 text-sm">
              The sacred item you seek could not be found.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center justify-center bg-[#bf0603] text-white px-6 py-2.5 rounded-full uppercase tracking-wider text-xs font-bold hover:bg-white hover:text-[#bf0603] transition-all"
            >
              Back to Sacred Shop
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const imagesList = product.images && product.images.length > 0 ? product.images : [product.image];
  const discount = getDiscount(product.price, product.oldPrice);
  const totalPrice = parsePrice(product.price) * quantity;

  return (
    <>
      <Header />

      <main className="min-h-screen relative z-10 text-white  pt-24 md:pt-[115px] pb-16 overflow-hidden">
        <div className="pointer-events-none fixed inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(191, 6, 3,0.15),transparent_55%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:72px_72px] opacity-15" />
        </div>

        <div className="relative z-10 max-w-[1080px] mx-auto px-4 sm:px-3.75 lg:px-6">
          <nav className="flex items-center gap-2 text-[11px] sm:text-xs text-white/45 mb-5 font-medium">
            <Link to="/" className="hover:text-[#bf0603] transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link to="/products" className="hover:text-[#bf0603] transition-colors ">
              Sacred Shop
            </Link>
            <span>/</span>
            <span className="text-white/75 truncate max-w-[190px]">
              {product.title}
            </span>
          </nav>

          <section className="rounded-[28px] border border-white/10 bg-linear-to-b from-white/[0.08] to-white/[0.03] backdrop-blur-[18px] shadow-[0_10px_40px_rgba(0,0,0,0.28)] overflow-hidden relative">
            <div className="absolute inset-0 bg-linear-to-br from-white/[0.06] to-transparent pointer-events-none z-0" />
            <div className="grid grid-cols-1 lg:grid-cols-2 relative z-10">
              <div className="p-3 sm:p-4 lg:p-5 border-b lg:border-b-0 lg:border-r border-white/10">
                <div className="lg:sticky lg:top-[100px] space-y-3">
                  <div className="relative aspect-[4/3] rounded-[24px] overflow-hidden bg-white flex items-center justify-center group">
                    <img
                      src={imagesList[activeImageIndex]}
                      alt={product.title}
                      className="max-w-full max-h-full object-contain p-4 sm:p-5 transition-transform duration-700 group-hover:scale-[1.035]"
                    />

                    {discount && (
                      <div className="absolute top-4 left-4 bg-linear-to-br from-[#ff3b3b] to-[#b30000] text-white text-[11px] font-black uppercase tracking-[0.12em] px-3.5 py-2 rounded-full shadow-[0_10px_25px_rgba(191, 6, 3,0.35)] z-20">
                        {discount}% OFF
                      </div>
                    )}

                    {imagesList.length > 1 && (
                      <>
                        <button
                          onClick={() =>
                            setActiveImageIndex((i) =>
                              i > 0 ? i - 1 : imagesList.length - 1
                            )
                          }
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-14.5 bg-black/55 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-[#bf0603] transition-all opacity-100 lg:opacity-0 group-hover:opacity-100"
                          aria-label="Previous image"
                        >
                          ‹
                        </button>

                        <button
                          onClick={() =>
                            setActiveImageIndex((i) =>
                              i < imagesList.length - 1 ? i + 1 : 0
                            )
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-14.5 bg-black/55 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-[#bf0603] transition-all opacity-100 lg:opacity-0 group-hover:opacity-100"
                          aria-label="Next image"
                        >
                          ›
                        </button>
                      </>
                    )}
                  </div>

                  {imagesList.length > 1 && (
                    <div className="flex gap-2 overflow-150-auto pb-1">
                      {imagesList.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveImageIndex(idx)}
                          className={`min-w-[58px] h-[58px] rounded-3xlxll overflow-hidden border transition-all flex items-center justify-center bg-white p-1.5 ${
                            activeImageIndex === idx
                              ? 'border-[#bf0603] shadow-[0_0_14px_rgba(191, 6, 3,0.4)] scale-[1.02]'
                              : 'border-white hover:border-[#bf0603]/50'
                          }`}
                        >
                          <img
                            src={img}
                            alt={`View ${idx + 1}`}
                            className="max-w-full max-h-full object-contain"
                          />
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { icon: <LuShield size={15} />, label: 'Authentic' },
                      { icon: <LuTruck size={15} />, label: 'Delivery' },
                      { icon: <LuPackage size={15} />, label: 'Packed' },
                    ].map(({ icon, label }) => (
                      <div
                        key={label}
                        className="rounded-3xlxll bg-black/25 border border-white/10 px-2 py-3 text-center"
                      >
                        <div className="text-[#bf0603] flex justify-center mb-1.5">
                          {icon}
                        </div>
                        <p className="text-white/55 text-[9px] font-bold uppercase tracking-wider">
                          {label}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-5 lg:p-7 xl:p-8">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="text-[9px] font-black uppercase tracking-[0.22em] text-[#bf0603] bg-[#bf0603]/10 border border-[#bf0603]/25 px-2.5 py-1 rounded-full">
                    Sacred Item
                  </span>
                  <span className="text-[9px] font-black uppercase tracking-[0.18em] text-emerald-400 bg-size-[72px_72px]merald-400/10 border border-emerald-400/25 px-2.5 py-1 rounded-full">
                    In Stock
                  </span>
                </div>

                <h1 className="title-batangas text-brand-redxl sm:text-4xl lg:text-5xl font-black text-white leading-[1.3] transition-colors duration-300 hover:text-[#ff4a4a]">
                  {product.title}
                </h1>

                <div className="mt-4 flex flex-wrap items-end gap-3">
                  <span className="font-batangas text-3xl sm:text-4xl font-black text-white leading-none">
                   ₹ {product.price}
                  </span>

                  {product.oldPrice && (
                    <span className="text-base sm:text-xl text-white/30 line-through font-semibold mb-1">
                     ₹ {product.oldPrice}
                    </span>
                  )}

                  {discount && (
                    <span className="mb-1 text-[10px] font-black text-emerald-400 bg-size-[72px_72px]merald-400/10 border border-emerald-400/20 px-2.5 py-1 rounded-full">
                      Save {discount}%
                    </span>
                  )}
                </div>

                <div className="my-5 h-150x bg-linear-to-r from-white/15 via-white/5 to-transparent" />

                <div className="space-y-3">
                  <div className="flex flex-wrap gap-1 bg-black/25 border border-white/10 rounded-3xlxll p-1 w-fit">
                    {['description', 'benefits', 'shipping'].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-3 sm:px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                          activeTab === tab
                            ? 'bg-linear-to-br from-[#ff3131] to-[#c30000] text-white shadow-[0_10px_25px_rgba(191, 6, 3,0.25)]'
                            : 'text-white/45 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>

                  <div className="min-h-[85px] rounded-3xlxll bg-linear-to-b from-white/[0.05] to-white/[0.02] backdrop-blur-[10px] border border-white/10 p-5 shadow-inner">
                    {activeTab === 'description' && (
                      <p className="subtitle-poppins text-white/65 text-[0.92rem] leading-[1.7]">
                        {product.desc || 'No product description available.'}
                      </p>
                    )}

                    {activeTab === 'benefits' && (
                      <ul className="space-y-2">
                        {[
                          'Natural, handpicked & energetically cleansed',
                          'Charged with Vedic mantras for maximum effect',
                          'Authentic spiritual grade quality',
                          'Suitable for daily wear & meditation',
                        ].map((item, index) => (
                          <li key={index} className="flex items-start gap-2 text-xs sm:text-sm text-white/70">
                            <span className="text-[#bf0603] mt-0.5">✦</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {activeTab === 'shipping' && (
                      <ul className="space-y-2">
                        {[
                          'Delivery within 5–7 business days across India',
                          'Carefully packed to prevent damage',
                          'Cash on delivery available in select areas',
                          'Free shipping on orders above ₹1,500',
                        ].map((item, index) => (
                          <li key={index} className="flex items-start gap-2 text-xs sm:text-sm text-white/70">
                            <span className="text-emerald-400 mt-0.5">✓</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                <div className="my-5 h-150x bg-linear-to-r from-white/15 via-white/5 to-transparent" />

                <div className="flex flex-wrap items-center gap-4">
                  <span className="text-[10px] font-black text-white/45 uppercase tracking-[0.25em]">
                    Quantity
                  </span>

                  <div className="flex items-center bg-black/30 border border-white/10 rounded-3xlxll p-1">
                    <button
                      onClick={decrease}
                      className="w-9 h-9 flex items-center justify-center rounded-lg text-white hover:bg-white/10 transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <LuMinus size={14} />
                    </button>

                    <span className="w-10 text-center text-sm font-black text-white">
                      {quantity}
                    </span>

                    <button
                      onClick={increase}
                      className="w-9 h-9 flex items-center justify-center rounded-lg text-white hover:bg-white/10 transition-colors"
                      aria-label="Increase quantity"
                    >
                      <LuPlus size={14} />
                    </button>
                  </div>

                  {quantity > 1 && (
                    <span className="text-xs text-white/45 font-medium">
                      Total:{' '}
                      <span className="text-white font-black">
                        ₹{totalPrice.toLocaleString('en-IN')}
                      </span>
                    </span>
                  )}
                </div>

                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleRazorpay}
                    disabled={paymentLoading}
                    id="razorpay-buy-btn"
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-3.75 rounded-[14px] font-black uppercase tracking-[0.1em] text-xs transition-all duration-300 bg-linear-to-br from-[#ff3131] to-[#c30000] text-white shadow-[0_10px_25px_rgba(191, 6, 3,0.25)] hover:shadow-[0_14px_30px_rgba(191, 6, 3,0.45)] hover:from-[#ff4f4f] hover:to-[#bf0603] hover:-translate-y-[2px] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {paymentLoading ? (
                      <>
                        <div className="w-4 h-4 border-brand-red border-white border-t-transparent rounded-full animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <LuShoppingCart size={16} />
                        Buy Now · ₹{(parsePrice(product.price) * quantity).toLocaleString('en-IN')}
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleWhatsApp}
                    id="whatsapp-order-btn"
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-3.75 rounded-3xlxll font-black uppercase tracking-[0.1em] text-xs transition-all duration-300 bg-[#25D366]/10 border border-[#25D366]/35 text-[#25D366] hover:bg-[#25D366]/20 hover:border-[#25D366]/70 hover:-translate-y-0.5"
                  >
                    <RiWhatsappFill size={18} />
                    WhatsApp Order
                  </button>
                </div>

                <p className="mt-3 text-[10px] text-white/35 text-center leading-relaxed">
                  🔒 Secure payment via Razorpay · UPI, Cards & Net Banking accepted
                </p>
              </div>
            </div>
          </section>

          {relatedProducts.length > 0 && (
            <section className="mt-16">
              <div className="text-center mb-8">
                <p className="text-[#bf0603] text-[10px] font-black uppercase tracking-[0.3em] mb-2">
                  Explore More
                </p>
                <h2 className="title-batangas text-3xl sm:text-4xl text-white uppercase tracking-wide">
                  You May Also Like
                </h2>
                <p className="text-white/45 text-xs mt-2">
                  More sacred items for your spiritual journey
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {relatedProducts.map((p, index) => {
                  const prodId = p.id || p.title.replace(/\s+/g, '-').toLowerCase();
                  const disc = getDiscount(p.price, p.oldPrice);

                  return (
                    <Link
                      key={index}
                      to={`/products/${prodId}`}
                      className="pc-card min-h-[auto] hover:-translate-y-0.5 group"
                    >
                      <div className="pc-image aspect-[4/3] bg-white relative flex items-center justify-center">
                        <img
                          src={p.image}
                          alt={p.title}
                          className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="pc-image-overlay pb-12!" />

                        {disc && (
                          <div className="pc-badge !text-[9px] px-2.5! py-1! top-3! left-3!">
                            {disc}% OFF
                          </div>
                        )}
                      </div>

                      <div className="pc-body p-4! gap-2!">
                        <h3 className="pc-title text-base! line-clamp-1 mb-0.5">
                          {p.title}
                        </h3>

                        <p className="pc-desc !text-[11px] line-clamp-2">
                          {p.desc}
                        </p>

                        <div className="pc-footer pt-3! mt-1!">
                          <div className="pc-price-block gap-0.5!">
                            <span className="pc-price text-lg!">
                             ₹ {p.price}
                            </span>
                            {p.oldPrice && (
                              <span className="pc-old-price !text-[10px]">
                               ₹ {p.oldPrice}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
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