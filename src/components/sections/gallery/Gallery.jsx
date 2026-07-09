import { useLayoutEffect, useRef, useState, useEffect, useCallback } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./gallery.css";
import { db } from "../../../firebaseConfig";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";

gsap.registerPlugin(ScrollTrigger);

// ── Site's own fallback images ──
const FALLBACK_IMAGES = [
  {
    image: "https://i.ibb.co/sm8mdMP/pic16.jpg",
    title: "Sacred Ritual Ceremony",
    description: "A powerful spiritual gathering where ancient Vedic rituals are performed to invoke divine blessings and positive cosmic energy.",
  },
  {
    image: "https://i.ibb.co/Gnq2gJb/pic2.jpg",
    title: "Astrological Consultation",
    description: "Personal guidance sessions where our experts interpret planetary alignments to help navigate life's most important decisions.",
  },
  {
    image: "https://i.ibb.co/vDpCDSY/pic13.jpg",
    title: "Meditation & Healing",
    description: "Tranquil moments of deep meditation and energy healing, restoring balance between mind, body, and spirit.",
  },
  {
    image: "https://i.ibb.co/f0Yt9bM/pic4.jpg",
    title: "Spiritual Workshop",
    description: "Interactive workshops where seekers learn the foundations of astrology, numerology, and spiritual self-discovery.",
  },
  {
    image: "https://i.ibb.co/g4hxBfz/pic5.jpg",
    title: "Temple Blessings",
    description: "Sacred visits to revered temples, connecting with centuries of spiritual tradition and divine grace.",
  },
  {
    image: "https://i.ibb.co/FgdgX20/pic10.jpg",
    title: "Community Gathering",
    description: "Warm community events where like-minded souls come together to share wisdom, faith, and spiritual growth.",
  },
  {
    image: "https://i.ibb.co/kDjJwhB/pic7.jpg",
    title: "Yantra & Mantra Session",
    description: "Focused sessions on sacred yantras and mantras, harnessing vibrational energy for protection and prosperity.",
  },
  {
    image: "https://i.ibb.co/9n7mHQt/pic8.jpg",
    title: "Festive Celebrations",
    description: "Joyful celebrations of auspicious festivals, honoring the cosmic cycles that shape our spiritual journey.",
  },
];

// ── Scroll-driven text slides ──
const TEXT_SLIDES = [
  {
    title: "Our Spiritual Gallery",
    desc: "Witness the divine moments, sacred ceremonies and spiritual gatherings that define Vahlay Astro's journey.",
  },
  {
    title: "Sacred Rituals",
    desc: "Ancient Vedic rituals performed to invoke divine blessings and harness positive cosmic energy for all seekers.",
  },
  {
    title: "Spiritual Union",
    desc: "A community bound by faith, wisdom and the eternal pursuit of cosmic truth through sacred astrology.",
  },
  {
    title: "Cosmic Journey",
    desc: "Every image tells a story of transformation, healing and the beautiful interplay between the stars and our souls.",
  },
];

// ── Fibonacci sphere position calculator ──
function getSpherePos(index, total, radius) {
  const phi   = Math.acos(1 - (2 * (index + 0.5)) / total);
  const theta = Math.PI * (1 + Math.sqrt(5)) * index;
  const x = radius * Math.cos(theta) * Math.sin(phi);
  const y = radius * Math.sin(theta) * Math.sin(phi);
  const z = radius * Math.cos(phi);
  const rotY = Math.atan2(x, z) * (180 / Math.PI);
  const rotX = Math.asin(-y / radius) * (180 / Math.PI);
  return { x, y, z, rotY, rotX };
}

const Gallery = () => {
  const sectionRef      = useRef(null);
  const sphereRef       = useRef(null);
  const titleRef        = useRef(null);
  const descRef         = useRef(null);
  const currentSlideRef = useRef(0);

  const [photos, setPhotos]         = useState([]);
  const [isReady, setIsReady]       = useState(false);
  const [lightbox, setLightbox]     = useState(null); // { image, title, description }
  const [showLightbox, setShowLightbox] = useState(false);

  const getRadius = useCallback(() => {
    if (window.innerWidth < 768)  return 175;
    if (window.innerWidth < 1100) return 270;
    return 355;
  }, []);

  const [radius, setRadius] = useState(getRadius);

  // ── Fetch latest 8 images from Firestore ──
  useEffect(() => {
    (async () => {
      try {
        const q    = query(collection(db, "gallery"), orderBy("createdAt", "desc"), limit(8));
        const snap = await getDocs(q);
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setPhotos(data.length > 0 ? data : FALLBACK_IMAGES);
      } catch {
        setPhotos(FALLBACK_IMAGES);
      } finally {
        setIsReady(true);
      }
    })();
  }, []);

  // ── Handle resize ──
  useEffect(() => {
    const onResize = () => setRadius(getRadius());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [getRadius]);

  // ── Duplicate photos to fill sphere (min 20 cards) ──
  const sphereItems = (() => {
    if (!photos.length) return [];
    const needed = Math.max(20, photos.length);
    const result = [];
    while (result.length < needed) result.push(...photos);
    return result.slice(0, needed);
  })();

  const openLightbox = useCallback((item) => {
    setLightbox(item);
    setShowLightbox(true);
  }, []);

  const closeLightbox = useCallback(() => {
    setShowLightbox(false);
    setTimeout(() => setLightbox(null), 320);
  }, []);

  // Close on Escape key
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") closeLightbox(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeLightbox]);

  // ── GSAP ScrollTrigger sphere animation ──
  useLayoutEffect(() => {
    if (!isReady || !sphereItems.length) return;

    const section = sectionRef.current;
    const sphere  = sphereRef.current;
    if (!section || !sphere) return;

    const ctx = gsap.context(() => {
      gsap.set(sphere, { rotateX: -15, rotateY: 0 });

      gsap.to(sphere, {
        rotateY: 720,
        rotateX: 40,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
          onUpdate(self) {
            animateText(self.progress);
            highlightCards(sphere, self.progress, sphereItems.length);
          },
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [isReady, radius, sphereItems.length]);

  function animateText(progress) {
    const nextSlide = Math.min(
      Math.floor(progress * TEXT_SLIDES.length),
      TEXT_SLIDES.length - 1
    );
    if (nextSlide === currentSlideRef.current) return;
    currentSlideRef.current = nextSlide;

    gsap.to([titleRef.current, descRef.current], {
      opacity: 0, y: 10, duration: 0.18,
      onComplete() {
        if (titleRef.current) titleRef.current.textContent = TEXT_SLIDES[nextSlide].title;
        if (descRef.current)  descRef.current.textContent  = TEXT_SLIDES[nextSlide].desc;
        gsap.fromTo(
          [titleRef.current, descRef.current],
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.38, stagger: 0.06 }
        );
      },
    });
  }

  function highlightCards(sphere, progress, total) {
    const focusIndex = Math.round(progress * (total - 1));
    sphere.querySelectorAll(".gallery-photo-card").forEach((card, i) => {
      card.classList.toggle("card-active", Math.abs(i - focusIndex) <= 2);
    });
  }

  return (
    <>
      <section ref={sectionRef} className="gallery-container" id="gallery">
        <div className="gallery-sticky">


          {/* ── Left Text Panel — site-standard style ── */}
          <div className="gallery-text-panel">
            {/* Eyebrow — matches site section label style */}
            <div className="gallery-eyebrow-row">
              <span className="gallery-eyebrow-line" />
              <span className="gallery-eyebrow-text">Sacred Collection</span>
            </div>

            {/* Main title — uses title-batangas font class like all other sections */}
            <h2
              ref={titleRef}
              className="title-batangas gallery-main-title"
            >
              {TEXT_SLIDES[0].title}
            </h2>

            {/* Description — matches subtitle-poppins style */}
            <p
              ref={descRef}
              className="subtitle-poppins gallery-desc"
            >
              {TEXT_SLIDES[0].desc}
            </p>

            {/* Scroll indicator */}
            <div className="gallery-scroll-indicator">
              <div className="gallery-scroll-line-wrap">
                <div className="gallery-scroll-line-fill" />
              </div>
              <span className="gallery-scroll-indicator-text">Scroll to explore</span>
            </div>
          </div>

          {/* ── 3D Sphere ── */}
          <div className="gallery-scene">
            <div ref={sphereRef} className="gallery-sphere">
              {sphereItems.map((item, i) => {
                const { x, y, z, rotY, rotX } = getSpherePos(i, sphereItems.length, radius);
                // Map index back to a real photo for the lightbox
                const sourcePhoto = photos[i % photos.length];
                return (
                  <div
                    key={`card-${i}`}
                    className="gallery-photo-card"
                    style={{
                      transform: `translate3d(${x}px,${y}px,${z}px) rotateY(${rotY}deg) rotateX(${rotX}deg)`,
                    }}
                    onClick={() => openLightbox(sourcePhoto)}
                    role="button"
                    tabIndex={0}
                    aria-label={`View ${sourcePhoto?.title || "gallery image"}`}
                    onKeyDown={(e) => e.key === "Enter" && openLightbox(sourcePhoto)}
                  >
                    <img
                      src={item.image}
                      alt={item.title || `Gallery ${i + 1}`}
                      loading="lazy"
                      draggable="false"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom-right decorative count badge */}
          <div className="gallery-badge">
            <span className="gallery-badge-count">
              {String(photos.length).padStart(2, "0")}
            </span>
            <span className="gallery-badge-label">Sacred Moments</span>
          </div>

        </div>
      </section>

      {/* ── Lightbox Modal ── */}
      {lightbox && (
        <div
          className={`gallery-lightbox-overlay ${showLightbox ? "show" : ""}`}
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
          aria-label={lightbox.title}
        >
          <div
            className="gallery-lightbox"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="gallery-lightbox-close"
              onClick={closeLightbox}
              aria-label="Close"
            >
              &times;
            </button>

            <div className="gallery-lightbox-img">
              <img src={lightbox.image} alt={lightbox.title} />
            </div>

            <div className="gallery-lightbox-info">
              <span className="gallery-lightbox-tag">Vahlay Astro</span>
              <h3 className="title-batangas gallery-lightbox-title">
                {lightbox.title}
              </h3>
              <p className="subtitle-poppins gallery-lightbox-desc">
                {lightbox.description || "Sacred moments captured from Vahlay Astro's spiritual journey."}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Gallery;