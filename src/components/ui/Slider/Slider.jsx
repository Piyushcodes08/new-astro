import React, { useState, useEffect, useRef, useCallback } from 'react';
import SliderHeader from './SliderHeader';
import SliderCard from './SliderCard';
import SliderDots from './SliderDots';

const Slider = ({ items, title, subTitle }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const trackRef = useRef(null);
  const sliderRef = useRef(null);
  const touchStartRef = useRef({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.matchMedia("(max-width:767px)").matches);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const centerActive = useCallback((index) => {
    if (!trackRef.current || !sliderRef.current) return;
    
    const slider = sliderRef.current;
    const cards = Array.from(trackRef.current.children);
    const card = cards[index];
    
    if (!card) return;

    const axis = isMobile ? "top" : "left";
    const size = isMobile ? "clientHeight" : "clientWidth";
    const start = isMobile ? card.offsetTop : card.offsetLeft;
    
    slider.scrollTo({
      [axis]: start - (slider[size] / 2 - card[size] / 2),
      behavior: "smooth"
    });
  }, [isMobile]);

  const activate = useCallback((index, scroll = true) => {
    if (index === activeIndex) return;
    setActiveIndex(index);
    if (scroll) centerActive(index);
  }, [activeIndex, centerActive]);

  const go = useCallback((step) => {
    const nextIndex = Math.min(Math.max(activeIndex + step, 0), items.length - 1);
    activate(nextIndex, true);
  }, [activeIndex, items.length, activate]);

  // Center on active index changes or resize
  useEffect(() => {
    centerActive(activeIndex);
  }, [activeIndex, isMobile, centerActive]);

  // Listeners
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (["ArrowRight", "ArrowDown"].includes(e.key)) go(1);
      if (["ArrowLeft", "ArrowUp"].includes(e.key)) go(-1);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [go]);

  // Touch Handlers
  const handleTouchStart = (e) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    };
  };

  const handleTouchEnd = (e) => {
    const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
    const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
    
    const threshold = 60;
    const isScrollAxis = isMobile ? Math.abs(dy) > threshold : Math.abs(dx) > threshold;
    
    if (isScrollAxis) {
      const direction = (isMobile ? dy : dx) > 0 ? -1 : 1;
      go(direction);
    }
  };

  return (
    <div className="slider-wrapper">
      <div className="section-container">
        <SliderHeader 
          title={title} 
          subTitle={subTitle} 
          onNext={() => go(1)} 
          onPrev={() => go(-1)}
          isPrevDisabled={activeIndex === 0}
          isNextDisabled={activeIndex === items.length - 1}
        />

        <div className="slider" ref={sliderRef}>
          <div 
            className="track" 
            ref={trackRef}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {items.map((item, index) => (
              <SliderCard 
                key={item.id}
                course={item}
                isActive={index === activeIndex}
                onClick={() => activate(index, true)}
                onMouseEnter={() => {
                   if (window.matchMedia("(hover:hover)").matches) activate(index, true);
                }}
              />
            ))}
          </div>
        </div>

        <SliderDots 
          count={items.length} 
          activeIndex={activeIndex} 
          onDotClick={(i) => activate(i, true)}
          hidden={isMobile}
        />
      </div>
    </div>
  );
};

export default Slider;
