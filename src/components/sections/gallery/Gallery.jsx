import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import { db } from "../../../firebaseConfig";
import "./gallery.css";

gsap.registerPlugin(ScrollTrigger);

const TEXT_SLIDES = [
  {
    title: "Our Spiritual Gallery",
    desc: "Witness the divine moments, sacred ceremonies, and spiritual gatherings that define Vahlay Astro's journey.",
  },
  {
    title: "Sacred Rituals",
    desc: "Ancient Vedic rituals performed to invoke divine blessings and channel positive cosmic energy for every seeker.",
  },
  {
    title: "Spiritual Union",
    desc: "A community united by faith, wisdom, and the eternal pursuit of cosmic truth through sacred astrology.",
  },
  {
    title: "Cosmic Journey",
    desc: "Every image tells a story of transformation, healing, and the beautiful relationship between the stars and our souls.",
  },
];

const FALLBACK_IMAGES = [
  {
    id: "fallback-1",
    title: "Sacred Gathering",
    description: "A moment of spiritual connection and shared wisdom.",
    image: "https://images.unsplash.com/photo-1604608672516-f1b9b1d37076?auto=format&fit=crop&w=900&q=82",
  },
  {
    id: "fallback-2",
    title: "Vedic Ritual",
    description: "Traditional offerings prepared with devotion and intention.",
    image: "https://images.unsplash.com/photo-1567591370504-80142dc2c55e?auto=format&fit=crop&w=900&q=82",
  },
  {
    id: "fallback-3",
    title: "Temple Light",
    description: "Sacred light illuminating a timeless spiritual path.",
    image: "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=900&q=82",
  },
  {
    id: "fallback-4",
    title: "Divine Wisdom",
    description: "A quiet moment of reflection, faith, and inner clarity.",
    image: "https://images.unsplash.com/photo-1606293926075-69a00dbfde81?auto=format&fit=crop&w=900&q=82",
  },
  {
    id: "fallback-5",
    title: "Cosmic Devotion",
    description: "Devotion expressed through traditional ceremony and prayer.",
    image: "https://images.unsplash.com/photo-1591017403286-fd8493524e1e?auto=format&fit=crop&w=900&q=82",
  },
  {
    id: "fallback-6",
    title: "Spiritual Journey",
    description: "A timeless journey toward harmony, purpose, and self-discovery.",
    image: "https://images.unsplash.com/photo-1514222134-b57cbb8ce073?auto=format&fit=crop&w=900&q=82",
  },
];

const getRadiusForViewport = () => {
  if (typeof window === "undefined") return 175;
  if (window.innerWidth < 520) return 95;
  if (window.innerWidth < 768) return 175;
  if (window.innerWidth < 1100) return 215;
  return 265;
};

const getSpherePosition = (index, total, radius) => {
  const phi = Math.acos(1 - (2 * (index + 0.5)) / total);
  const theta = Math.PI * (1 + Math.sqrt(5)) * index;
  const x = radius * Math.cos(theta) * Math.sin(phi);
  const y = radius * Math.sin(theta) * Math.sin(phi);
  const z = radius * Math.cos(phi);

  return {
    x,
    y,
    z,
    rotateY: Math.atan2(x, z) * (180 / Math.PI),
    rotateX: Math.asin(-y / radius) * (180 / Math.PI),
  };
};

const Gallery = () => {
  const sectionRef = useRef(null);
  const sphereRef = useRef(null);
  const titleRef = useRef(null);
  const descRef = useRef(null);
  const progressRef = useRef(null);
  const currentSlideRef = useRef(0);
  const closeTimerRef = useRef(null);

  const [photos, setPhotos] = useState([]);
  const [isReady, setIsReady] = useState(false);
  const [radius, setRadius] = useState(getRadiusForViewport);
  const [lightbox, setLightbox] = useState(null);
  const [showLightbox, setShowLightbox] = useState(false);

  useEffect(() => {
    let active = true;

    const fetchGallery = async () => {
      try {
        const galleryQuery = query(
          collection(db, "gallery"),
          orderBy("createdAt", "desc"),
          limit(20)
        );
        const snapshot = await getDocs(galleryQuery);
        const items = snapshot.docs
          .map((document) => ({ id: document.id, ...document.data() }))
          .filter((item) => item.image);

        if (active) setPhotos(items.length ? items : FALLBACK_IMAGES);
      } catch {
        if (active) setPhotos(FALLBACK_IMAGES);
      } finally {
        if (active) setIsReady(true);
      }
    };

    fetchGallery();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let frameId;
    const handleResize = () => {
      window.cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(() => {
        setRadius(getRadiusForViewport());
        ScrollTrigger.refresh();
      });
    };

    window.addEventListener("resize", handleResize, { passive: true });
    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const sphereItems = useMemo(() => {
    if (!photos.length) return [];
    const minimumCards = radius <= 172 ? 16 : 20;
    const targetLength = Math.max(minimumCards, photos.length);
    return Array.from(
      { length: targetLength },
      (_, index) => photos[index % photos.length]
    );
  }, [photos, radius]);

  const openLightbox = useCallback((item) => {
    window.clearTimeout(closeTimerRef.current);
    setLightbox(item);
    requestAnimationFrame(() => setShowLightbox(true));
  }, []);

  const closeLightbox = useCallback(() => {
    setShowLightbox(false);
    window.clearTimeout(closeTimerRef.current);
    closeTimerRef.current = window.setTimeout(() => setLightbox(null), 360);
  }, []);

  useEffect(() => {
    if (!lightbox) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") closeLightbox();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [lightbox, closeLightbox]);

  useEffect(
    () => () => window.clearTimeout(closeTimerRef.current),
    []
  );

  useLayoutEffect(() => {
    if (!isReady || !sphereItems.length) return undefined;

    const section = sectionRef.current;
    const sphere = sphereRef.current;
    if (!section || !sphere) return undefined;

    currentSlideRef.current = 0;

    const context = gsap.context(() => {
      gsap.set(sphere, {
        rotateX: -13,
        rotateY: -18,
        transformPerspective: 1400,
      });

      gsap.set(progressRef.current, { scaleX: 0, transformOrigin: "left center" });

      gsap.to(sphere, {
        rotateY: 442,
        rotateX: 30,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          scrub: 2.95,
          invalidateOnRefresh: true,
          fastScrollEnd: true,
          onUpdate: ({ progress }) => {
            updateText(progress);
            updateFocusedCards(sphere, progress, sphereItems.length);
            gsap.set(progressRef.current, { scaleX: progress });
          },
        },
      });
    }, section);

    return () => context.revert();
  }, [isReady, radius, sphereItems.length]);

  const updateText = (progress) => {
    const nextSlide = Math.min(
      Math.floor(progress * TEXT_SLIDES.length),
      TEXT_SLIDES.length - 1
    );
    if (nextSlide === currentSlideRef.current) return;

    currentSlideRef.current = nextSlide;
    const elements = [titleRef.current, descRef.current].filter(Boolean);

    gsap.killTweensOf(elements);
    gsap.to(elements, {
      opacity: 0,
      y: 14,
      duration: 0.2,
      ease: "power2.in",
      onComplete: () => {
        if (titleRef.current) {
          const titleWords = TEXT_SLIDES[nextSlide].title.split(" ");
          const highlightedWord = titleWords.pop();
          const highlight = document.createElement("span");
          highlight.textContent = highlightedWord;
          titleRef.current.replaceChildren(
            document.createTextNode(`${titleWords.join(" ")} `),
            highlight
          );
        }
        if (descRef.current) descRef.current.textContent = TEXT_SLIDES[nextSlide].desc;

        gsap.fromTo(
          elements,
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 0.52, stagger: 0.07, ease: "power3.out" }
        );
      },
    });
  };

  const updateFocusedCards = (sphere, progress, total) => {
    const focusIndex = Math.round(progress * (total - 1));
    sphere.querySelectorAll(".gallery-photo-card").forEach((card, index) => {
      card.classList.toggle("card-active", Math.abs(index - focusIndex) <= 1);
    });
  };

  return (
    <>
      <section ref={sectionRef} className="gallery-container" id="gallery">
        <div className="gallery-sticky">
   

          <div className="gallery-text-panel">
            <div className="gallery-eyebrow-row">
           
              <span className="gallery-eyebrow-text">Sacred Collection</span>
            </div>

            <h2 ref={titleRef} className="title-batangas gallery-main-title">
              Our Spiritual <span>Gallery</span>
            </h2>

            <p ref={descRef} className="subtitle-poppins gallery-desc">
              {TEXT_SLIDES[0].desc}
            </p>

            <div className="gallery-scroll-indicator" aria-hidden="true">
              <div className="gallery-scroll-line-wrap">
                <div ref={progressRef} className="gallery-scroll-line-fill" />
              </div>
              <span className="gallery-scroll-indicator-text">Scroll to explore</span>
            </div>
          </div>

          <div className="gallery-scene">
            <div ref={sphereRef} className="gallery-sphere">
              {sphereItems.map((item, index) => {
                const position = getSpherePosition(index, sphereItems.length, radius);
                return (
                  <button
                    type="button"
                    key={`${item.id || "gallery"}-${index}`}
                    className="gallery-photo-card"
                    style={{
                      transform: `translate3d(${position.x}px, ${position.y}px, ${position.z}px) rotateY(${position.rotateY}deg) rotateX(${position.rotateX}deg)`,
                    }}
                    onClick={() => openLightbox(item)}
                    aria-label={`View ${item.title || "gallery image"}`}
                  >
                    <img
                      src={item.image}
                      alt={item.title || `Gallery moment ${index + 1}`}
                      loading={index < 6 ? "eager" : "lazy"}
                      draggable="false"
                    />
                    <span className="gallery-card-shine" aria-hidden="true" />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="gallery-badge" aria-hidden="true">
            <span className="gallery-badge-count">{String(photos.length).padStart(2, "0")}</span>
            <span className="gallery-badge-label">Sacred Moments</span>
          </div>
        </div>
      </section>

      {lightbox && (
        <div
          className={`gallery-lightbox-overlay ${showLightbox ? "show" : ""}`}
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
          aria-label={lightbox.title || "Gallery image"}
        >
          <div className="gallery-lightbox" onClick={(event) => event.stopPropagation()}>
            <button type="button" className="gallery-lightbox-close" onClick={closeLightbox} aria-label="Close gallery image">
              <span aria-hidden="true">×</span>
            </button>

            <div className="gallery-lightbox-img">
              <img src={lightbox.image} alt={lightbox.title || "Gallery moment"} />
            </div>

            <div className="gallery-lightbox-info">
              <span className="gallery-lightbox-tag">Vahlay Astro · Sacred Gallery</span>
              <h3 className="title-batangas gallery-lightbox-title">{lightbox.title || "Sacred Moment"}</h3>
              <p className="subtitle-poppins gallery-lightbox-desc">
                {lightbox.description || "A sacred moment captured from Vahlay Astro's spiritual journey."}
              </p>
              <div className="gallery-lightbox-ornament" aria-hidden="true"><span /><b>◆</b><span /></div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Gallery;