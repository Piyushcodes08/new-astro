import React from 'react';
import { HiChevronLeft, HiChevronRight } from "react-icons/hi2";

const SliderHeader = ({ title, subTitle }) => {
  // Split title: all words except last are white, last word gets gold gradient
  const words = title ? title.trim().split(/\s+/) : [];
  const lastWord = words.pop();
  const firstPart = words.join(" ");

  return (
    <div className="flex flex-col items-center text-center gap-2 lg:pb-12 mx-auto max-w-4xl">
      <h2 className="section-title-theme">
        {firstPart && <>{firstPart} </>}
        <span>{lastWord}</span>
      </h2>
      <p className="subtitle-poppins font-medium text-center max-w-2xl" style={{ fontSize: "clamp(0.88rem, 1.35vw, 1rem)", color: "rgba(255, 246, 230, 0.66)", lineHeight: "1.78" }}>
        {subTitle}
      </p>
    </div>
  );
};

export default SliderHeader;
