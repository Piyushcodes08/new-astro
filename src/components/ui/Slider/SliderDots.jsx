import React from 'react';

const SliderDots = ({ count, activeIndex, onDotClick, hidden }) => {
  if (hidden) return null;
  
  return (
    <div className="dots">
      {Array.from({ length: count }).map((_, i) => (
        <span 
          key={i} 
          className={`dot ${i === activeIndex ? 'active' : ''}`} 
          onClick={() => onDotClick(i)}
        />
      ))}
    </div>
  );
};

export default SliderDots;
