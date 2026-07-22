import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Horoscope.css";
import { horoscopeData, RASHIPHAL_SUMMARIES } from "../../../data/common/horoscope";
import zodiacWheel from "../../../assets/images/sections/horoscope/new_wheel_s5ozry.png";

const DATE_RANGES = {
  Aries: "March 21 â€” April 19",
  Taurus: "April 20 â€” May 20",
  Gemini: "May 21 â€” June 20",
  Cancer: "June 21 â€” July 22",
  Leo: "July 23 â€” August 22",
  Virgo: "August 23 â€” September 22",
  Libra: "September 23 â€” October 22",
  Scorpio: "October 23 â€” November 21",
  Sagittarius: "November 22 â€” December 21",
  Capricorn: "December 22 â€” January 19",
  Aquarius: "January 20 â€” February 18",
  Pisces: "February 19 â€” March 20",
};

const ZODIAC_ORDER = [
  "FIRST", "SECOND", "THIRD", "FOURTH", "FIFTH", "SIXTH",
  "SEVENTH", "EIGHTH", "NINTH", "TENTH", "ELEVENTH", "TWELFTH",
];

const TRAIT_ICONS = ["âœ¦", "â—†", "â—ˆ"];
const COOLDOWN = 420;

export default function Horoscope() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isInView, setIsInView] = useState(false);
  const sectionRef = useRef(null);
  const wheelRef = useRef(null);
  const activeIndexRef = useRef(0);
  const lastScrollTime = useRef(0);
  const touchStartY = useRef(null);
  const navigate = useNavigate();
  const zodiacs = horoscopeData;

  const currentZodiac = zodiacs[activeIndex] ?? zodiacs[0];
  const traitsArray = useMemo(
    () => currentZodiac?.traits?.split(/,\s*/).filter(Boolean).slice(0, 3) ?? [],
    [currentZodiac]
  );

  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { threshold: 0.16 }
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  const selectSign = useCallback((nextIndex) => {
    if (!zodiacs.length) return;
    const normalized = (nextIndex + zodiacs.length) % zodiacs.length;
    activeIndexRef.current = normalized;
    setActiveIndex(normalized);
  }, [zodiacs.length]);

  const changeSign = useCallback((direction, wrap = true) => {
    const current = activeIndexRef.current;
    const next = current + direction;
    selectSign(wrap ? next : Math.min(Math.max(next, 0), zodiacs.length - 1));
  }, [selectSign, zodiacs.length]);

  useEffect(() => {
    const wheel = wheelRef.current;
    if (!wheel) return undefined;

    const handleWheel = (event) => {
      const current = activeIndexRef.current;
      const direction = event.deltaY > 0 ? 1 : -1;
      const atBoundary =
        (direction > 0 && current === zodiacs.length - 1) ||
        (direction < 0 && current === 0);

      if (atBoundary || Math.abs(event.deltaY) < 12) return;
      event.preventDefault();
      if (Date.now() - lastScrollTime.current < COOLDOWN) return;

      lastScrollTime.current = Date.now();
      changeSign(direction, false);
    };

    wheel.addEventListener("wheel", handleWheel, { passive: false });
    return () => wheel.removeEventListener("wheel", handleWheel);
  }, [changeSign, zodiacs.length]);

  const handleKeyDown = (event) => {
    if (["ArrowRight", "ArrowDown"].includes(event.key)) {
      event.preventDefault();
      changeSign(1);
    }
    if (["ArrowLeft", "ArrowUp"].includes(event.key)) {
      event.preventDefault();
      changeSign(-1);
    }
  };

  const handleTouchStart = (event) => {
    touchStartY.current = event.touches[0]?.clientY ?? null;
  };

  const handleTouchEnd = (event) => {
    if (touchStartY.current === null) return;
    const endY = event.changedTouches[0]?.clientY ?? touchStartY.current;
    const distance = touchStartY.current - endY;
    touchStartY.current = null;
    if (Math.abs(distance) > 42) changeSign(distance > 0 ? 1 : -1);
  };


  if (!currentZodiac) return null;

  return (
    <section
      className={`horoscope-section ${isInView ? "in-view" : ""}`}
      ref={sectionRef}
      aria-labelledby="horoscope-title"
    >
      <div className="horoscope-ambient" aria-hidden="true">
        <span className="horoscope-orb orb-left" />
        <span className="horoscope-orb orb-right" />
        <span className="horoscope-stars" />
      </div>

      <div className="horoscope-container">
        <header className="horoscope-header">
          <span className="horoscope-kicker">CELESTIAL GUIDANCE</span>
          <h2 id="horoscope-title" className="section-title-theme">Daily Cosmic <span>Horoscope</span></h2>
          <p className="subtitle-poppins horoscope-subtitle">
            Unlock the secrets of your celestial path with thoughtfully curated daily zodiac insights.
          </p>
          <div className="scroll-reveal-indicator" aria-hidden="true">
            <span className="desktop-text">SCROLL OVER THE WHEEL TO EXPLORE</span>
            <span className="mobile-text">SWIPE OR USE THE ARROWS TO EXPLORE</span>
            <span className="mouse-icon"><span className="wheel-dot" /></span>
          </div>
        </header>

        <div className="zodiac-main-layout">
          <article className="zodiac-side-panel zodiac-identity lg:block hidden" key={`identity-${activeIndex}`}>
            <span className="zodiac-index">{String(activeIndex + 1).padStart(2, "0")}</span>
            <p className="zodiac-eyebrow">The {ZODIAC_ORDER[activeIndex]} Zodiac Sign</p>
            <h3 className="hero-zodiac-name">{currentZodiac.name}</h3>
            <div className="title-divider"><span>âœ¦</span></div>
           
            
          </article>

          <div className="zodiac-center-column">
            <div
              ref={wheelRef}
              className="zodiac-wheel-wrapper"
              role="group"
              aria-label={`Zodiac selector. Currently showing ${currentZodiac.name}`}
              tabIndex={0}
              onKeyDown={handleKeyDown}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <span className="wheel-orbit orbit-one" aria-hidden="true" />
              <span className="wheel-orbit orbit-two" aria-hidden="true" />
              <span className="wheel-outer-glow" aria-hidden="true" />
              <div
                className="zodiac-wheel-outer"
                style={{ transform: `rotate(${-activeIndex * 30}deg)` }}
              >
                <img src={zodiacWheel} alt="" className="zodiac-wheel-image" draggable="false" />
              </div>
              <div className="zodiac-center-display">
                <span className="center-pulse" aria-hidden="true" />
                <img
                  key={currentZodiac.name}
                  src={currentZodiac.icon}
                  alt={`${currentZodiac.name} symbol`}
                  className="active-icon-large"
                />
              </div>
            </div>

            <div className="zodiac-controls">
              <button type="button" onClick={() => changeSign(-1)} aria-label="Previous zodiac sign">â†</button>
              <div className="zodiac-pagination" aria-live="polite">
                <strong>{String(activeIndex + 1).padStart(2, "0")}</strong>
                <span />
                <small>12</small>
              </div>
              <button type="button" onClick={() => changeSign(1)} aria-label="Next zodiac sign">â†’</button>
            </div>
          </div>

          <article className="zodiac-side-panel glass-detail-card" key={`details-${activeIndex}`}>
            <div className="card-top-header">
              <span>PERSONALITY PROFILE</span>
              <h3>{currentZodiac.name} Traits</h3>
            </div>
           
            <div className="rashiphal-summary">
              <p lang="hi">{RASHIPHAL_SUMMARIES[currentZodiac.name].hi}</p>
              <p>{RASHIPHAL_SUMMARIES[currentZodiac.name].en}</p>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}