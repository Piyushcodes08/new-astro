import React, { useState, useEffect, useRef, useCallback } from "react";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "../../../firebaseConfig";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import SliderHeader from "../../ui/Slider/SliderHeader";
import SliderControls from "../../ui/Slider/SliderControls";
import "./Testimonials.css";

// Fallback data — shown while loading or if no reviews are in Firebase
const fallbackTestimonials = [
  {
    id: "f1",
    rating: 5,
    quote: "The Essentials of Self-Discovery (Panchang and Basic Astrology) truly changed how I view astrology. Valay Sir's explanations were so relatable—it felt less like a class and more like a personal exploration.",
    name: "Nirav Deshmukh",
    title: "The Essentials of Self-Discovery",
  },
  {
    id: "f2",
    rating: 4,
    quote: "I joined mainly out of curiosity, but I ended up connecting with myself on a whole new level. The course gave me a beautiful foundation in astrology without ever feeling overwhelming.",
    name: "Malvi Vashi",
    title: "The Essentials of Self-Discovery",
  },
  {
    id: "f3",
    rating: 5,
    quote: "Taking this course was like being handed a mirror. It helped me understand cycles and energies that I had felt before but never really understood. Valay Sir's calm approach made it easy to grasp.",
    name: "Vishal Patel",
    title: "The Essentials of Self-Discovery",
  },
  {
    id: "f4",
    rating: 4,
    quote: "Valay Sir doesn't just teach—he guides. The knowledge shared was practical and meaningful. I now feel more aware of my days, my choices, and even my natural strengths.",
    name: "Viren Tailor",
    title: "Foundation of Vedic Astrology",
  },
  {
    id: "f5",
    rating: 5,
    quote: "Before this course I only knew astrology at a surface level. This helped me understand the deeper structure—the logic behind the planets, signs, and houses. Highly recommended!",
    name: "Nishant Tailor",
    title: "Foundation of Vedic Astrology",
  },
  {
    id: "f6",
    rating: 5,
    quote: "This course gave me the confidence to actually read and understand a birth chart. I've even started helping friends interpret their charts. Feels great to have that kind of knowledge!",
    name: "Jay Kantharia",
    title: "Foundation of Vedic Astrology",
  },
];

// Render fractional stars
const StarRating = ({ rating }) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(rating)) {
      stars.push(<FaStar key={i} className="text-yellow-400" />);
    } else if (i === Math.ceil(rating) && rating % 1 !== 0) {
      stars.push(<FaStarHalfAlt key={i} className="text-yellow-400" />);
    } else {
      stars.push(<FaRegStar key={i} className="text-yellow-400/40" />);
    }
  }
  return <div className="review-stars flex gap-1 justify-center mt-4">{stars}</div>;
};

const Testimonials = () => {
  const [testimonialsData, setTestimonialsData] = useState(fallbackTestimonials);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(3);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [visibleItems, setVisibleItems] = useState(3);
  const autoPlayRef = useRef(null);
  const touchStartRef = useRef(0);

  // Fetch real reviews from Firebase
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        // Try to fetch from a dedicated "Reviews" collection first
        const reviewsRef = collection(db, "Reviews");
        const q = query(reviewsRef, orderBy("createdAt", "desc"), limit(20));
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          const reviews = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setTestimonialsData(reviews);
        }
        // If empty, fallback data remains (already set in useState)
      } catch {
        // Collection may not exist yet — try Comments_Vahaly_Astro as backup
        try {
          const commentsRef = collection(db, "Comments_Vahaly_Astro");
          const q2 = query(commentsRef, limit(15));
          const snapshot2 = await getDocs(q2);

          if (!snapshot2.empty) {
            const reviews = snapshot2.docs.map((doc) => {
              const d = doc.data();
              return {
                id: doc.id,
                name: d.name || d.userName || "Anonymous",
                quote: d.comment || d.text || d.quote || "",
                title: d.courseName || d.title || "Vahlay Astro",
                rating: d.rating || 5,
              };
            });
            // Only use if comments have actual text
            if (reviews.some((r) => r.quote)) {
              setTestimonialsData(reviews);
            }
          }
        } catch {
          console.log("Using fallback testimonials.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  const clonedData = React.useMemo(() => {
    if (testimonialsData.length === 0) return [];
    const cloneCount = visibleItems;
    return [
      ...testimonialsData.slice(-cloneCount),
      ...testimonialsData,
      ...testimonialsData.slice(0, cloneCount),
    ];
  }, [testimonialsData, visibleItems]);

  const totalRealItems = testimonialsData.length;

  // Reset index when data or visible item count changes
  useEffect(() => {
    if (currentIndex !== visibleItems) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentIndex(visibleItems);
    }
  }, [totalRealItems, visibleItems, currentIndex]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) setVisibleItems(1);
      else if (window.innerWidth < 1200) setVisibleItems(2);
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

  // Infinite loop boundary jump
  useEffect(() => {
    if (!isTransitioning) return;
    const maxIndex = totalRealItems + visibleItems;
    const minIndex = visibleItems - 1;
    if (currentIndex >= maxIndex) {
      const timer = setTimeout(() => {
        setIsTransitioning(false);
        setCurrentIndex(visibleItems);
      }, 450);
      return () => clearTimeout(timer);
    }
    if (currentIndex <= minIndex) {
      const timer = setTimeout(() => {
        setIsTransitioning(false);
        setCurrentIndex(totalRealItems + minIndex);
      }, 450);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, isTransitioning, totalRealItems, visibleItems]);

  const stopAutoPlay = useCallback(() => {
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
  }, []);

  const startAutoPlay = useCallback(() => {
    stopAutoPlay();
    autoPlayRef.current = setInterval(nextSlide, 3500);
  }, [nextSlide, stopAutoPlay]);

  useEffect(() => {
    startAutoPlay();
    return () => stopAutoPlay();
  }, [startAutoPlay, stopAutoPlay]);

  const handleTouchStart = (e) => {
    touchStartRef.current = e.touches[0].clientX;
    stopAutoPlay();
  };

  const handleTouchEnd = (e) => {
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStartRef.current - touchEnd;
    if (Math.abs(diff) > 50) {
      if (diff > 0) nextSlide();
      else prevSlide();
    }
    startAutoPlay();
  };

  if (loading) {
    return (
      <section className="testimonial-section" id="testimonials">
        <div className="section-container">
          <div className="py-20 flex items-center justify-center">
            <div className="text-brand-red text-xl font-bold animate-pulse uppercase tracking-[0.3em]">
              Loading Reviews...
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="testimonial-section"
      id="testimonials"
      onMouseEnter={stopAutoPlay}
      onMouseLeave={startAutoPlay}
    >
      <div className="section-container">
        <SliderHeader
          title="Celestial Experiences"
          subTitle="Voices of those whose lives have been transformed by sacred cosmic insights."
          onNext={nextSlide}
          onPrev={prevSlide}
          isPrevDisabled={false}
          isNextDisabled={false}
        />

        <div
          className="testimonial-slider-container"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="testimonial-track"
            style={{
              transform: getTranslateX(),
              transition: isTransitioning
                ? "transform 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
                : "none",
            }}
          >
            {clonedData.map((item, index) => (
              <div
                className="testimonial-slide"
                key={`${item.id}-${index}`}
                style={{ flex: `0 0 ${100 / visibleItems}%`, maxWidth: `${100 / visibleItems}%` }}
              >
                <div className="testimonial-card">
                  <p className="testimonial-text">"{item.quote || item.text || item.comment}"</p>
                  <h3 className="testimonial-title">{item.name}</h3>
                  {item.title && (
                    <p className="text-white/50 text-xs uppercase tracking-widest mt-1 subtitle-poppins text-center">
                      {item.title}
                    </p>
                  )}
                  <StarRating rating={item.rating || 5} />
                </div>
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
      </div>
    </section>
  );
};

export default Testimonials;