import React from 'react';
import { HiChevronLeft, HiChevronRight } from "react-icons/hi2";

const SliderHeader = ({ title, subTitle, onNext, onPrev, isPrevDisabled, isNextDisabled }) => {
  return (
    <div className="flex flex-col items-center text-center gap-2 pb-12 mx-auto max-w-4xl">
      <h2 className="title-batangas text-4xl md:text-5xl font-bold uppercase tracking-tight leading-tight">
        {title}
      </h2>
      <p className="subtitle-poppins text-lg md:text-md font-medium text-white/70">
        {subTitle}
      </p>
    </div>
  );
};

export default SliderHeader;
