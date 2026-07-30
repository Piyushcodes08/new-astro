import React from 'react';

const ArrowLeft = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
    <path d="M15 18l-6-6 6-6" />
  </svg>
);

const ArrowRight = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
    <path d="M9 6l6 6-6 6" />
  </svg>
);

const SliderControls = ({ onNext, onPrev, isPrevDisabled, isNextDisabled }) => {
  return (
    <div className="flex items-center justify-center gap-6 mt-4 lg:mt-12">
      <button 
        className="nav-btn flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95" 
        onClick={onPrev} 
        disabled={isPrevDisabled} 
        aria-label="Previous"
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          border: '1px solid rgba(255,255,255,0.2)',
          background: '#bf0603',
          color: 'white',
          backdropFilter: 'blur(10px)',
          cursor: 'pointer'
        }}
      >
        <ArrowLeft />
      </button>
      <button 
        className="nav-btn flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95" 
        onClick={onNext} 
        disabled={isNextDisabled} 
        aria-label="Next"
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          border: '1px solid rgba(255,255,255,0.2)',
           background: '#bf0603',
          color: 'white',
          backdropFilter: 'blur(10px)',
          cursor: 'pointer'
        }}
      >
        <ArrowRight />
      </button>
    </div>
  );
};

export default SliderControls;
