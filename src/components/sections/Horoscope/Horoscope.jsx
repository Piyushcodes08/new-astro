import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./Horoscope.css";
import { horoscopeData } from "../../../data/common/horoscope";
import zodiacWheel from "../../../assets/images/sections/horoscope/new_wheel_s5ozry.png";

export default function Horoscope({ onGetDetails }) {
  const [rotation, setRotation] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollContainerRef = useRef(null);
  const lastScrollTime = useRef(0);
  const wheelRef = useRef(null);
  const navigate = useNavigate();

  const COOLDOWN = 300;
  const zodiacs = horoscopeData;

  const [isInView, setIsInView] = useState(false);
  const activeIndexRef = useRef(activeIndex);

  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { threshold: 0.1 }
    );

    if (scrollContainerRef.current) {
      observer.observe(scrollContainerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const wheelEl = wheelRef.current;
    if (!wheelEl) return;

    const handleWheel = (e) => {
      const currentIndex = activeIndexRef.current;
      const isAtEnd = currentIndex === zodiacs.length - 1;
      const isAtStart = currentIndex === 0;

      // Allow normal scroll if at boundaries
      if (e.deltaY > 0 && isAtEnd) return;
      if (e.deltaY < 0 && isAtStart) return;

      // Stop page scroll and handle wheel rotation
      e.preventDefault();

      if (Date.now() - lastScrollTime.current < COOLDOWN) return;

      const delta = Math.abs(e.deltaY);
      if (delta < 15) return;

      const power = Math.min(Math.max(Math.floor(delta / 100), 1), 4);

      if (e.deltaY > 0) {
        const nextIndex = Math.min(currentIndex + power, zodiacs.length - 1);
        if (nextIndex !== currentIndex) {
          const actualSteps = nextIndex - currentIndex;
          setActiveIndex(nextIndex);
          setRotation((prev) => prev - actualSteps * 30);
          lastScrollTime.current = Date.now();
        }
      } else {
        const prevIndex = Math.max(currentIndex - power, 0);
        if (prevIndex !== currentIndex) {
          const actualSteps = currentIndex - prevIndex;
          setActiveIndex(prevIndex);
          setRotation((prev) => prev + actualSteps * 30);
          lastScrollTime.current = Date.now();
        }
      }
    };

    wheelEl.addEventListener("wheel", handleWheel, { passive: false });
    return () => wheelEl.removeEventListener("wheel", handleWheel);
  }, [zodiacs.length]);

  const currentZodiac = zodiacs[activeIndex];

  const traitsArray = currentZodiac?.traits
    ? currentZodiac.traits.split(", ").slice(0, 3)
    : [];

  const dateRanges = useMemo(() => ({
    Aries: "March 21 - April 19",
    Taurus: "April 20 - May 20",
    Gemini: "May 21 - June 20",
    Cancer: "June 21 - July 22",
    Leo: "July 23 - August 22",
    Virgo: "August 23 - September 22",
    Libra: "September 23 - October 22",
    Scorpio: "October 23 - November 21",
    Sagittarius: "November 22 - December 21",
    Capricorn: "December 22 - January 19",
    Aquarius: "January 20 - February 18",
    Pisces: "February 19 - March 20",
  }), []);

  const zodiacOrderText = useMemo(() => [
    "FIRST", "SECOND", "THIRD", "FOURTH", "FIFTH", "SIXTH",
    "SEVENTH", "EIGHTH", "NINTH", "TENTH", "ELEVENTH", "TWELFTH",
  ], []);

  // eslint-disable-next-line no-unused-vars
  const featureItems = useMemo(() => [
    { icon: "🎯", title: "PIONEER MINDSET", desc: "Always first. Always ahead." },
    { icon: "⚡", title: "FEARLESS SPIRIT", desc: "No fear. Only determination." },
    { icon: "🔥", title: "BOUNDLESS ENERGY", desc: "Driven by passion and purpose." },
    { icon: "🚩", title: "NATURAL LEADER", desc: "Born to inspire and lead." },
  ], []);

  const handleWheelClick = useCallback(() => {
    if (window.innerWidth >= 1180) return;
    const nextIndex = (activeIndex + 1) % zodiacs.length;
    setActiveIndex(nextIndex);
    setRotation((prev) => prev - 30);
  }, [activeIndex, zodiacs.length]);

  return (
    <section
      className={`horoscope-section ${isInView ? "in-view" : ""}`}
      ref={scrollContainerRef}
    >
      

      <div className="horoscope-container">
        {/* Common Section Header */}
        <div className="flex flex-col items-center text-center gap-2 mx-auto max-w-4xl relative z-20">
          <h2 className="title-batangas text-4xl md:text-5xl font-bold uppercase tracking-tight leading-tight text-white">
            Daily Cosmic Horoscope
          </h2>
          <p className="subtitle-poppins text-lg md:text-base font-medium text-white/70">
            Unlock the secrets of your celestial path with our daily zodiac insights.
          </p>

          {/* Scroll Indicator Design */}
          <div className="scroll-reveal-indicator">
            <span className="scroll-text">
              <span className="desktop-text">SCROLL TO REVEAL YOUR COSMIC INSIGHTS</span>
              <span className="mobile-text">TAP TO REVEAL YOUR COSMIC INSIGHTS</span>
            </span>
            <div className="mouse-icon desktop-only">
              <div className="wheel-dot"></div>
            </div>
          </div>
        </div>

        <div className="zodiac-main-layout">
          <div className="zodiac-side-panel left-aligned">
            <div className="zodiac-hero-info">
           

              <h1 className="hero-zodiac-name">{currentZodiac.name}</h1>

              <div className="title-divider"></div>

              <p className="zodiac-date-range">
                {dateRanges[currentZodiac.name]}
              </p>

              <div className="trait-badges">
                {traitsArray.map((trait, i) => (
                  <span key={i} className="trait-badge">
                    <span className="badge-icon">
                      {i === 0 ? "⚡" : i === 1 ? "🔥" : "🛡"}
                    </span>
                    {trait}
                  </span>
                ))}
              </div>

            </div>
          </div>

          <div className="zodiac-center-column">
            <div
              className="zodiac-wheel-wrapper"
              ref={wheelRef}
              onClick={handleWheelClick}
              style={{ cursor: window.innerWidth < 1180 ? 'pointer' : 'default' }}
            >
              <div className="wheel-orbit orbit-one"></div>
            
              <div className="wheel-outer-glow"></div>
              <div className="wheel-inner-glow"></div>

              <div
                className="zodiac-wheel-outer"
                style={{ transform: `rotate(${rotation}deg)` }}
              >
                <img
                  src={zodiacWheel}
                  alt="Zodiac Wheel"
                  loading="lazy"
                  decoding="async"
                  className="zodiac-wheel-image"
                />
              </div>

              <div className="zodiac-center-display">
                <div className="center-pulse"></div>
                <img
                  src={currentZodiac.icon}
                  alt={currentZodiac.name}
                  className="active-icon-large"
                />
              </div>
            </div>

            <div className="zodiac-navigation-indicator">
              <span className="sign-position">
                THE {zodiacOrderText[activeIndex]} SIGN OF THE ZODIAC
              </span>

              <div className="pagination-dots">
                <span className="current-page">
                  {String(activeIndex + 1).padStart(2, "0")}
                </span>
                <span className="separator">OF</span>
                <span className="total-pages">12</span>
              </div>
            </div>
          </div>

          <div className="zodiac-side-panel right-aligned">
            <div className="glass-detail-card" key={`desc-${activeIndex}`}>
              <div className="card-top-header">
                <div className="header-line"></div>
                <h3 className="section-label">{currentZodiac.name.toUpperCase()} TRAITS</h3>
                <div className="header-line"></div>
                <span className="header-diamond">✦</span>
              </div>

              <div className="key-traits-banners">
                {traitsArray.map((trait, i) => (
                  <div key={i} className="trait-banner-item">
                    <div className="trait-number-box">
                      <span className="trait-num">{String(i + 1).padStart(2, '0')}</span>
                    </div>
                    <div className="trait-content-box">
                      <span className="trait-text-main">{trait.toUpperCase()}</span>
                    </div>
                  </div>
                ))}
              </div>

              <button 
                className="premium-banner-btn" 
                onClick={() => {
                  if (onGetDetails) onGetDetails();
                  navigate(`/horoscope/${currentZodiac.name.toLowerCase()}`);
                }}
              >
                <span className="btn-text-content">
                  EXPLORE FULL {currentZodiac.name.toUpperCase()} READING
                </span>
                <span className="btn-icon-box">
                  <span className="arrow-icon">→</span>
                </span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}