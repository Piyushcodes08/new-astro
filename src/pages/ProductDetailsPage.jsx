import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { getAuth } from 'firebase/auth';
import { createLogger } from '../utils/logger';
import Header from '../components/sections/Header/Header';
import Footer from '../components/sections/Footer/Footer';
import Button from '../components/ui/Button/Button';
import { LuMinus, LuPlus, LuShoppingCart, LuPackage, LuShield, LuTruck, LuStar, LuCheck } from 'react-icons/lu';
import { RiWhatsappFill } from 'react-icons/ri';
import { fallbackProducts } from '../components/sections/products/Products';

const logger = createLogger('ProductDetailsPage');

const parsePrice = (str) => parseFloat(String(str || '').replace(/[^\d.]/g, '')) || 0;
const getDiscount = (price, oldPrice) => {
  const p = parsePrice(price), op = parsePrice(oldPrice);
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
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    const onScroll = () => setPinned(window.scrollY > 300);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);
        const fallbackMatch = fallbackProducts.find(
          (p) => String(p.id) === String(id) || p.title.replace(/\s+/g, '-').toLowerCase() === String(id)
        );
        if (fallbackMatch) {
          setProduct({ id: fallbackMatch.id || fallbackMatch.title.replace(/\s+/g, '-').toLowerCase(), ...fallbackMatch, images: fallbackMatch.images || [fallbackMatch.image] });
        } else {
          const docRef = doc(db, 'products', id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setProduct({ id: docSnap.id, ...data, images: data.images || (data.image ? [data.image] : []) });
          } else {
            const fallbackTitleMatch = fallbackProducts.find((p) => p.title.replace(/\s+/g, '-').toLowerCase() === String(id));
            if (fallbackTitleMatch) setProduct({ id: fallbackTitleMatch.title.replace(/\s+/g, '-').toLowerCase(), ...fallbackTitleMatch, images: fallbackTitleMatch.images || [fallbackTitleMatch.image] });
          }
        }
        const qs = await getDocs(collection(db, 'products'));
        const dbProducts = qs.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        const allProds = dbProducts.length > 0 ? dbProducts : fallbackProducts;
        setRelatedProducts(allProds.filter((p) => { const pid = p.id || p.title.replace(/\s+/g, '-').toLowerCase(); return String(pid) !== String(id); }).slice(0, 4));
      } catch (err) { logger.error('Error fetching product details:', err); }
      finally { setLoading(false); }
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
      if (!priceNum) { alert('Product price is not available. Please contact us via WhatsApp.'); setPaymentLoading(false); return; }
      const loadScript = (src) => new Promise((resolve, reject) => {
        const existing = document.querySelector(`script[src="${src}"]`);
        if (existing) { existing.addEventListener('load', () => resolve(true)); existing.addEventListener('error', () => reject(false)); if (existing.readyState === 'complete') resolve(true); return; }
        const script = document.createElement('script');
        script.src = src; script.async = true;
        script.onload = () => resolve(true); script.onerror = () => reject(false);
        document.body.appendChild(script);
      });
      if (!window.Razorpay) {
        try { await loadScript('https://checkout.razorpay.com/v1/checkout.js'); }
        catch (e) { alert('Payment gateway failed to load. Please try WhatsApp ordering.'); setPaymentLoading(false); return; }
      }
      const totalAmount = priceNum * quantity;
      const amountInPaise = Math.round(totalAmount * 100);
      const orderResponse = await fetch('https://backend-7e8f.onrender.com/api/payment/razorpay/order', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ amount: amountInPaise }) });
      if (!orderResponse.ok) throw new Error('Failed to create Razorpay order.');
      const { orderId } = await orderResponse.json();
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY || '', amount: amountInPaise, currency: 'INR',
        name: 'Vahlaya Astro', description: `${product.title} × ${quantity}`, image: product.image, order_id: orderId,
        handler: async (response) => {
          try {
            const backendResponse = await fetch('https://backend-7e8f.onrender.com/api/payment/razorpay/success', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ paymentId: response.razorpay_payment_id, orderId: response.razorpay_order_id, signature: response.razorpay_signature, productId: product.id, productTitle: product.title, quantity, amount: amountInPaise }) });
            if (!backendResponse.ok) throw new Error('Payment verification failed.');
            try { const auth = getAuth(); const currentUser = auth.currentUser; await addDoc(collection(db, 'product_orders'), { userId: currentUser?.email || 'guest', productId: product.id, productTitle: product.title, quantity, amount: totalAmount, transactionId: response.razorpay_payment_id, status: 'paid', timestamp: new Date() }); } catch (e) { logger.warn('Firestore log failed:', e); }
            alert(`✅ Payment Successful!\n\n${product.title} × ${quantity}\nAmount: ₹${totalAmount.toLocaleString('en-IN')}\n\nWe will contact you within 24 hours for delivery.`);
          } catch (err) { logger.error('Payment handler error:', err); alert('Payment received! We will contact you shortly.'); }
          finally { setPaymentLoading(false); }
        },
        prefill: { name: '', email: '', contact: '' },
        theme: { color: '#bf0603' },
        modal: { ondismiss: () => setPaymentLoading(false) },
      };
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', () => { alert('Payment failed. Please try again or use WhatsApp.'); setPaymentLoading(false); });
      rzp.open();
    } catch (err) { logger.error('Razorpay error:', err); alert('Unable to initiate payment. Please try WhatsApp ordering.'); setPaymentLoading(false); }
  };

  const handleWhatsApp = () => {
    if (!product) return;
    const msg = `🙏 Hare Krishna!\n\nI would like to order:\n*${product.title}*\nQuantity: ${quantity}\nPrice: ₹${parsePrice(product.price) * quantity}\n\nPlease guide me on payment and delivery. 🕉️`;
    window.open(`https://wa.me/919904229944?text=${encodeURIComponent(msg)}`, '_blank');
  };

  // ── Loading state ──
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-10 h-10 border-2 border-[#bf0603] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-white/40 text-[11px] uppercase tracking-[0.3em] font-bold">Loading Product...</p>
      </div>
    </div>
  );

  // ── Not found state ──
  if (!product) return (
    <>
      <Header />
      <main className="min-h-screen flex items-center justify-center text-white px-4">
        <div className="text-center space-y-5 max-w-md">
          <div className="text-6xl">🔍</div>
          <h1 className="title-batangas text-4xl uppercase">Product Not Found</h1>
          <p className="text-white/50 text-sm">The sacred item you seek could not be found.</p>
          <Button to="/products" variant="primary" size="md">Back to Sacred Shop</Button>
        </div>
      </main>
      <Footer />
    </>
  );

  const imagesList = product.images?.length > 0 ? product.images : [product.image];
  const discount = getDiscount(product.price, product.oldPrice);
  const priceNum = parsePrice(product.price);
  const totalPrice = priceNum * quantity;

  const TABS = [
    { id: 'description', label: 'Description' },
    { id: 'benefits', label: 'Benefits' },
    { id: 'shipping', label: 'Shipping' },
  ];

  const BENEFITS = [
    'Natural, handpicked & energetically cleansed',
    'Charged with Vedic mantras for maximum effect',
    'Authentic spiritual grade quality',
    'Suitable for daily wear & meditation',
  ];

  const SHIPPING = [
    'Delivery within 5–7 business days across India',
    'Carefully packed to prevent damage in transit',
    'Cash on delivery available in select areas',
    'Free shipping on orders above ₹1,500',
  ];

  return (
    <>
      <Header />

      {/* ── Sticky bottom buy bar ── */}
      <div className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-400 ${pinned ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
        <div className="bg-[#0a0202]/95 backdrop-blur-2xl border-t border-[#bf0603]/20 px-4 py-3 shadow-[0_-8px_40px_rgba(191,6,3,0.15)]">
          <div className="max-w-[1080px] mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 bg-white rounded-xl p-1.5 shrink-0 shadow-md">
                <img src={imagesList[0]} alt={product.title} className="w-full h-full object-contain" />
              </div>
              <div className="min-w-0">
                <p className="text-white font-bold text-sm truncate">{product.title}</p>
                <p className="text-[#bf0603] font-black text-base">₹{totalPrice.toLocaleString('en-IN')}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={handleWhatsApp} className="flex items-center gap-1.5 text-[#25D366] text-[10px] font-black uppercase tracking-wider px-3 py-2.5 rounded-xl transition-all cursor-pointer" style={{background:'rgba(37,211,102,0.1)',border:'1px solid rgba(37,211,102,0.4)'}}>
                <RiWhatsappFill size={15} /> Order
              </button>
              <button onClick={handleRazorpay} disabled={paymentLoading} className="flex items-center gap-2 text-white text-[10px] font-black uppercase tracking-wider px-4 py-2.5 rounded-xl border-2 border-[#bf0603] hover:bg-white hover:text-[#bf0603] transition-all disabled:opacity-50 cursor-pointer" style={{background:'#bf0603'}}>
                <LuShoppingCart size={14} /> {paymentLoading ? 'Processing...' : 'Buy Now'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <main className="min-h-screen relative z-10 text-white pt-28 pb-28 overflow-hidden">
        {/* Ambient glows */}
        <div className="pointer-events-none fixed inset-0 z-0">
          <div className="absolute top-[-10%] left-[20%] w-[700px] h-[500px] rounded-full bg-[#bf0603] opacity-[0.07] blur-[160px]" />
          <div className="absolute bottom-[10%] right-[10%] w-[400px] h-[400px] rounded-full bg-amber-800 opacity-[0.04] blur-[120px]" />
        </div>

        <div className="relative z-10 max-w-[1100px] mx-auto px-4 lg:px-8">
          {/* Breadcrumb */}
          <nav aria-label="breadcrumb" className="flex items-center gap-2 text-[11px] text-white/30 mb-10 font-semibold uppercase tracking-wider">
            <Link to="/" className="hover:text-[#bf0603] transition-colors">Home</Link>
            <span className="text-white/15">/</span>
            <Link to="/products" className="hover:text-[#bf0603] transition-colors">Sacred Shop</Link>
            <span className="text-white/15">/</span>
            <span className="text-white/55 truncate max-w-[200px]">{product.title}</span>
          </nav>

         <div
  className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16 p-5 md:p-7 rounded-[2rem] text-white relative overflow-hidden"
  style={{
    background:
      "radial-gradient(circle at top left, rgba(191,6,3,0.28), transparent 34%), linear-gradient(145deg, #120303 0%, #070101 45%, #000000 100%)",
    border: "1px solid rgba(191,6,3,0.22)",
    boxShadow:
      "0 30px 90px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.06)",
  }}
>

            {/* ════ LEFT — Image gallery ════ */}
            <div className="lg:sticky lg:top-[96px] h-fit space-y-4">
              {/* Main image frame */}
              <div className="relative rounded-3xl overflow-hidden group" style={{background:'linear-gradient(145deg,#1a0808,#0d0303)',border:'1px solid rgba(191,6,3,0.22)',boxShadow:'0 24px 80px rgba(0,0,0,0.6),inset 0 1px 0 rgba(255,255,255,0.06)'}}>
                <div className="relative aspect-square bg-gradient-to-br from-white to-gray-50 m-4 rounded-2xl overflow-hidden">
                  <img src={imagesList[activeImageIndex]} alt={product.title}
                    className="w-full h-full object-contain p-8 transition-transform duration-700 group-hover:scale-[1.06]" />
                  {discount && (
                    <div className="absolute top-3 left-3 z-10">
                      <span className="text-white text-[9px] font-black uppercase tracking-[0.15em] px-3 py-1.5 rounded-full shadow-[0_6px_20px_rgba(191,6,3,0.5)]" style={{background:'linear-gradient(135deg,#ff3b3b,#8b0000)'}}>
                        {discount}% OFF
                      </span>
                    </div>
                  )}
                  {imagesList.length > 1 && (<>
                    <button onClick={() => setActiveImageIndex(i => i > 0 ? i - 1 : imagesList.length - 1)} className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-xl hover:bg-[#bf0603] transition-all opacity-0 group-hover:opacity-100 cursor-pointer" aria-label="Prev">‹</button>
                    <button onClick={() => setActiveImageIndex(i => i < imagesList.length - 1 ? i + 1 : 0)} className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-xl hover:bg-[#bf0603] transition-all opacity-0 group-hover:opacity-100 cursor-pointer" aria-label="Next">›</button>
                  </>)}
                </div>
                {imagesList.length > 1 && (
                  <div className="flex justify-center gap-1.5 pb-4">
                    {imagesList.map((_, idx) => (
                      <button key={idx} onClick={() => setActiveImageIndex(idx)} className={`rounded-full transition-all cursor-pointer ${activeImageIndex === idx ? 'w-5 h-1.5 bg-[#bf0603]' : 'w-1.5 h-1.5 bg-white/20 hover:bg-white/40'}`} aria-label={`Image ${idx+1}`} />
                    ))}
                  </div>
                )}
              </div>
              {/* Thumbnails */}
              {imagesList.length > 1 && (
                <div className="flex gap-2.5 overflow-x-auto pb-1">
                  {imagesList.map((img, idx) => (
                    <button key={idx} onClick={() => setActiveImageIndex(idx)} className="shrink-0 w-[72px] h-[72px] rounded-2xl overflow-hidden p-1.5 transition-all cursor-pointer" style={{background:'white',border:activeImageIndex===idx?'2px solid #bf0603':'2px solid transparent',opacity:activeImageIndex===idx?1:0.5,boxShadow:activeImageIndex===idx?'0 0 20px rgba(191,6,3,0.4)':'none'}}>
                      <img src={img} alt={`View ${idx+1}`} className="w-full h-full object-contain" />
                    </button>
                  ))}
                </div>
              )}
              {/* Trust badges */}
              <div className="grid grid-cols-3 gap-2.5">
                {[{icon:<LuShield size={18}/>,label:'Authentic',sub:'100% genuine'},{icon:<LuTruck size={18}/>,label:'Fast Delivery',sub:'5–7 days'},{icon:<LuPackage size={18}/>,label:'Safe Pack',sub:'Damage-free'}].map(({icon,label,sub})=>(
                  <div key={label} className="flex flex-col items-center gap-1.5 rounded-2xl py-4 px-2 text-center" style={{background:'linear-gradient(145deg,rgba(191,6,3,0.08),rgba(0,0,0,0.3))',border:'1px solid rgba(191,6,3,0.15)'}}>
                    <span className="text-[#bf0603]">{icon}</span>
                    <p className="text-white text-[10px] font-black uppercase tracking-wider leading-none">{label}</p>
                    <p className="text-white/35 text-[9px]">{sub}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ════ RIGHT — Product info ════ */}
            <div className="flex flex-col gap-7">
              {/* Tags */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#bf0603] px-3 py-1.5 rounded-full" style={{background:'rgba(191,6,3,0.12)',border:'1px solid rgba(191,6,3,0.3)'}}>🕉️ Sacred Item</span>
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-400 flex items-center gap-1 px-3 py-1.5 rounded-full" style={{background:'rgba(52,211,153,0.1)',border:'1px solid rgba(52,211,153,0.25)'}}><LuCheck size={9}/> In Stock</span>
              </div>
              {/* Title */}
              <h1 className="title-batangas text-4xl md:text-5xl xl:text-6xl font-black text-white leading-[1.08]" style={{textShadow:'0 2px 30px rgba(191,6,3,0.25)'}}>
                {product.title}
              </h1>
              {/* Stars */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-0.5">
                  {Array.from({length:5}).map((_,i)=><LuStar key={i} size={14} className="text-amber-400" style={{fill:'#fbbf24'}}/>)}
                </div>
                <span className="text-white/35 text-[11px] font-bold">4.9 · 120+ verified reviews</span>
              </div>
              {/* Price block */}
              <div className="rounded-2xl px-6 py-5 flex flex-wrap items-center gap-4" style={{background:'linear-gradient(135deg,rgba(191,6,3,0.1),rgba(0,0,0,0.4))',border:'1px solid rgba(191,6,3,0.2)'}}>
                <div>
                  <p className="text-white/35 text-[9px] uppercase tracking-widest font-bold mb-1">Price</p>
                  <span className="title-batangas text-5xl font-black text-white leading-none">₹{product.price?.toString().replace(/[^\d.]/g,'')||product.price}</span>
                </div>
                {product.oldPrice && (
                  <div>
                    <p className="text-white/25 text-[9px] uppercase tracking-widest font-bold mb-1">MRP</p>
                    <span className="text-xl text-white/30 line-through font-semibold">₹{product.oldPrice?.toString().replace(/[^\d.]/g,'')||product.oldPrice}</span>
                  </div>
                )}
                {discount && <span className="text-[10px] font-black text-emerald-400 px-3 py-1.5 rounded-full self-center" style={{background:'rgba(52,211,153,0.1)',border:'1px solid rgba(52,211,153,0.25)'}}>Save {discount}%</span>}
              </div>
              {/* Tabs */}
              <div>
                <div className="flex gap-1 p-1 rounded-2xl w-fit" style={{background:'rgba(0,0,0,0.4)',border:'1px solid rgba(255,255,255,0.08)'}}>
                  {TABS.map(tab=>(
                    <button key={tab.id} onClick={()=>setActiveTab(tab.id)}
                      className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all cursor-pointer ${activeTab===tab.id?'text-white shadow-[0_6px_20px_rgba(191,6,3,0.35)]':'text-white/35 hover:text-white/70 hover:bg-white/5'}`}
                      style={activeTab===tab.id?{background:'linear-gradient(135deg,#ff3131,#bf0603)'}:{}}>
                      {tab.label}
                    </button>
                  ))}
                </div>
                <div className="mt-3 rounded-2xl p-6 min-h-[110px]" style={{background:'linear-gradient(145deg,rgba(28,8,8,0.6),rgba(10,3,3,0.8))',border:'1px solid rgba(255,255,255,0.06)'}}>
                  {activeTab==='description'&&<p className="text-white/60 text-sm leading-[1.9]">{product.desc||'No description available.'}</p>}
                  {activeTab==='benefits'&&<ul className="space-y-3">{BENEFITS.map((item,i)=><li key={i} className="flex items-start gap-3 text-sm text-white/60"><span className="text-[#bf0603] text-base leading-none mt-0.5">✦</span><span>{item}</span></li>)}</ul>}
                  {activeTab==='shipping'&&<ul className="space-y-3">{SHIPPING.map((item,i)=><li key={i} className="flex items-start gap-3 text-sm text-white/60"><LuCheck size={14} className="text-emerald-400 shrink-0 mt-0.5"/><span>{item}</span></li>)}</ul>}
                </div>
              </div>
              {/* Divider */}
              <div className="h-px bg-gradient-to-r from-[#bf0603]/20 via-white/10 to-transparent" />
              {/* Quantity */}
              <div className="flex flex-wrap items-center gap-5">
                <span className="text-[11px] font-black text-white/35 uppercase tracking-[0.2em]">Qty</span>
                <div className="flex items-center gap-1 p-1 rounded-2xl" style={{background:'rgba(0,0,0,0.5)',border:'1px solid rgba(255,255,255,0.1)'}}>
                  <button onClick={decrease} className="w-10 h-10 flex items-center justify-center rounded-xl text-white hover:bg-[#bf0603] hover:shadow-[0_0_14px_rgba(191,6,3,0.4)] transition-all cursor-pointer" aria-label="Decrease"><LuMinus size={13}/></button>
                  <span className="w-12 text-center text-base font-black text-white tabular-nums">{quantity}</span>
                  <button onClick={increase} className="w-10 h-10 flex items-center justify-center rounded-xl text-white hover:bg-[#bf0603] hover:shadow-[0_0_14px_rgba(191,6,3,0.4)] transition-all cursor-pointer" aria-label="Increase"><LuPlus size={13}/></button>
                </div>
                {quantity>1&&<div className="flex flex-col"><span className="text-white/30 text-[9px] uppercase tracking-widest font-bold">Total</span><span className="text-white font-black text-lg leading-tight">₹{totalPrice.toLocaleString('en-IN')}</span></div>}
              </div>
              {/* CTA buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button onClick={handleRazorpay} disabled={paymentLoading}
                  className="flex-1 flex items-center justify-center gap-2.5 py-4 px-6 rounded-2xl font-black uppercase tracking-[0.12em] text-[11px] text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover:-translate-y-0.5 hover:bg-white hover:text-[#bf0603]"
                  style={{background:'linear-gradient(135deg,#ff3131,#bf0603)',border:'2px solid rgba(191,6,3,0.6)',boxShadow:'0 10px 30px rgba(191,6,3,0.35)'}}>
                  {paymentLoading?(<><div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"/>Processing...</>):(<><LuShoppingCart size={16}/>Buy Now · ₹{totalPrice.toLocaleString('en-IN')}</>)}
                </button>
                <button onClick={handleWhatsApp}
                  className="flex-1 flex items-center justify-center gap-2.5 py-4 px-6 rounded-2xl font-black uppercase tracking-[0.12em] text-[11px] text-[#25D366] transition-all hover:-translate-y-0.5 hover:bg-[#25D366]/15 cursor-pointer"
                  style={{background:'rgba(37,211,102,0.08)',border:'2px solid rgba(37,211,102,0.3)'}}>
                  <RiWhatsappFill size={18}/>WhatsApp Order
                </button>
              </div>
              <p className="text-[10px] text-white/20 text-center tracking-wide">🔒 Secured by Razorpay · UPI · Cards · Net Banking · COD available</p>
              {/* Delivery mini-grid */}
              <div className="grid grid-cols-2 gap-2">
                {[{emoji:'🚚',title:'5–7 Day Delivery',sub:'Pan India shipping'},{emoji:'↩️',title:'Easy Returns',sub:'Hassle-free policy'},{emoji:'🔒',title:'Secure Checkout',sub:'256-bit encryption'},{emoji:'🕉️',title:'Vedic Charged',sub:'Mantra energized'}].map(({emoji,title,sub})=>(
                  <div key={title} className="flex items-center gap-3 rounded-2xl px-4 py-3" style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.06)'}}>
                    <span className="text-xl shrink-0">{emoji}</span>
                    <div>
                      <p className="text-white/70 text-[11px] font-bold leading-tight">{title}</p>
                      <p className="text-white/30 text-[10px] leading-tight">{sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Related Products ── */}
          {relatedProducts.length > 0 && (
            <section className="mt-24">
              <div className="flex items-center gap-5 mb-8">
                <div>
                  <p className="text-[#bf0603] text-[10px] font-black uppercase tracking-[0.3em] mb-1">Explore More</p>
                  <h2 className="title-batangas text-3xl md:text-4xl text-white uppercase">You May Also Like</h2>
                </div>
                <div className="flex-1 h-px bg-gradient-to-r from-[#bf0603]/30 to-transparent" />
                <Button to="/products" variant="primary" size="sm" arrow>View All</Button>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {relatedProducts.map((p, index) => {
                  const prodId = p.id || p.title.replace(/\s+/g, '-').toLowerCase();
                  const disc = getDiscount(p.price, p.oldPrice);
                  return (
                    <Link key={index} to={`/products/${prodId}`} className="related-card group">
                      <div className="related-img-wrap">
                        <img src={p.image} alt={p.title} className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-[1.07]" />
                        {disc && <span className="rel-badge">{disc}% OFF</span>}
                      </div>
                      <div className="related-body">
                        <h3 className="related-title">{p.title}</h3>
                        <div className="flex items-baseline gap-2 mt-auto pt-2.5" style={{borderTop:'1px solid rgba(255,255,255,0.07)'}}>
                          <span className="title-batangas text-lg font-black text-white">₹{p.price?.toString().replace(/[^\d.]/g,'')||p.price}</span>
                          {p.oldPrice&&<span className="text-xs text-white/25 line-through">₹{p.oldPrice?.toString().replace(/[^\d.]/g,'')||p.oldPrice}</span>}
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

      <style>{`
        .related-card {
          display:flex;flex-direction:column;
          background:linear-gradient(145deg,rgba(28,8,8,0.9),rgba(12,3,3,0.95));
          border:1px solid rgba(191,6,3,0.15);border-radius:18px;overflow:hidden;
          text-decoration:none;color:white;
          box-shadow:0 4px 20px rgba(0,0,0,0.4);
          transition:transform 0.35s cubic-bezier(0.34,1.56,0.64,1),border-color 0.3s,box-shadow 0.3s;
        }
        .related-card:hover{transform:translateY(-6px) scale(1.01);border-color:rgba(191,6,3,0.5);box-shadow:0 20px 50px rgba(191,6,3,0.18),0 6px 24px rgba(0,0,0,0.5);}
        .related-img-wrap{aspect-ratio:1;background:linear-gradient(145deg,#fff,#f5f5f5);position:relative;overflow:hidden;margin:8px 8px 0 8px;border-radius:12px;}
        .rel-badge{position:absolute;top:8px;left:8px;background:linear-gradient(135deg,#ff3b3b,#8b0000);color:white;font-size:8px;font-weight:900;letter-spacing:0.12em;text-transform:uppercase;padding:3px 9px;border-radius:999px;box-shadow:0 4px 12px rgba(191,6,3,0.4);}
        .related-body{padding:12px 14px 14px;display:flex;flex-direction:column;flex:1;gap:5px;}
        .related-title{font-family:'Batangas',sans-serif;font-size:1rem;font-weight:700;color:white;line-height:1.3;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;transition:color 0.2s;}
        .related-card:hover .related-title{color:#ff6b6b;}
      `}</style>
    </>
  );
};

export default ProductDetailsPage;
