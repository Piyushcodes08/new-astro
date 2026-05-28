import React from 'react';
import { HiChevronLeft, HiChevronRight } from "react-icons/hi2";

const SliderControls = ({ onNext, onPrev, isPrevDisabled, isNextDisabled }) => {
  return (
    <div className="flex items-center justify-center gap-6 mt-12">
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
          background: 'rgba(255,255,255,0.05)',
          color: 'white',
          backdropFilter: 'blur(10px)',
          cursor: 'pointer'
        }}
      >
        <HiChevronLeft size={28} />
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
          background: 'rgba(255,255,255,0.05)',
          color: 'white',
          backdropFilter: 'blur(10px)',
          cursor: 'pointer'
        }}
      >
        <HiChevronRight size={28} />
      </button>
    </div>
  );
};

export default SliderControls;
