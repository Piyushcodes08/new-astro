import React, { useEffect, useMemo, useState } from "react";
import "./Testimonials.css";

const testimonialsData = [
  {
    id: 1,
    name: "Aarav Sharma",
    image:
    "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=848&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      quote:
      "Valay Patel explained my birth chart with remarkable clarity. His guidance helped me understand my career direction and make decisions with greater confidence.",
  },
  {
    id: 2,
    name: "Priya Mehta",
    image:
       "https://images.unsplash.com/photo-1607189200597-4d0923ef98c6?q=80&w=387&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    
    quote:
      "The consultation with Valay Patel was calm, detailed, and deeply insightful. He answered every question patiently and suggested practical remedies that were easy to follow.",
  },
  {
    id: 3,
    name: "Rohan Desai",
    image:
       "https://plus.unsplash.com/premium_photo-1722682239201-21c8173e776b?q=80&w=843&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    quote:
      "I consulted Valay Patel regarding my business and financial concerns. His astrological analysis was structured, honest, and relevant to my present circumstances.",
  },
  {
    id: 4,
    name: "Kavya Shah",
    image:
    "https://plus.unsplash.com/premium_photo-1682089810582-f7b200217b67?q=80&w=387&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
     
    quote:
      "Valay Sir helped me understand several repeating patterns in my personal life. The reading gave me clarity, emotional reassurance, and a more positive direction.",
  },
  {
    id: 5,
    name: "Dhruv Patel",
    image:
      "https://plus.unsplash.com/premium_photo-1682092603230-1ce7cf8ca451?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    quote:
      "The predictions were explained logically without creating fear or confusion. Valay Patel combines traditional astrological knowledge with a practical and balanced approach.",
  },
  {
    id: 6,
    name: "Neha Joshi",
    image:
      "https://plus.unsplash.com/premium_photo-1682098109069-0e49e3b42884?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    quote:
      "My marriage consultation was handled with great sensitivity and respect. Valay Patel carefully explained the compatibility factors and provided thoughtful guidance.",
  },
  {
    id: 7,
    name: "Kunal Verma",
    image:
      "https://images.unsplash.com/photo-1509933551745-514268e48884?q=80&w=387&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    quote:
      "I was impressed by the depth of the horoscope analysis. Valay Sir highlighted both my strengths and challenges while giving me practical steps for improvement.",
  },
  {
    id: 8,
    name: "Ananya Iyer",
    image:
      "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=500&h=500&q=85",
    quote:
      "The session felt personal and never generic. Valay Patel listened carefully, explained every planetary influence clearly, and gave me renewed confidence about the future.",
  },
  {
    id: 9,
    name: "Raj Malhotra",
    image:
      "https://plus.unsplash.com/premium_photo-1689977871600-e755257fb5f8?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    quote:
      "Valay Patel's career guidance helped me evaluate an important professional opportunity from a clearer perspective. His communication was professional and straightforward.",
  },
  {
    id: 10,
    name: "Ishita Kapoor",
    image:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=500&h=500&q=85",
    quote:
      "The consultation gave me peace of mind during a difficult phase. The remedies suggested by Valay Sir were simple, meaningful, and explained with proper reasoning.",
  },
  {
    id: 11,
    name: "Harsh Vyas",
    image:
      "https://images.unsplash.com/photo-1607227540760-62996d043bb9?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    quote:
      "Valay Patel made complex astrological concepts easy to understand. I left the session with a clearer understanding of my abilities, timing, and future priorities.",
  },
];

const getSeededValue = (seed) => {
  const value = Math.sin(seed * 999.91) * 10000;
  return value - Math.floor(value);
};

const createFloatingLayout = (totalItems) => {
  const leftCount = Math.ceil(totalItems / 2);
  const rightCount = totalItems - leftCount;

  return Array.from({ length: totalItems }, (_, index) => {
    const isLeft = index < leftCount;
    const sideIndex = isLeft ? index : totalItems - index - 1;
    const sideTotal = isLeft ? leftCount : rightCount;
    const randomX = getSeededValue(index + 3);
    const randomSize = getSeededValue(index + 17);
    const randomDuration = getSeededValue(index + 31);

    return {
      side: isLeft ? "left" : "right",
      top: sideTotal > 1 ? 10 + sideIndex * (76 / (sideTotal - 1)) : 50,
      horizontalOffset: 3 + randomX * 12,
      avatarSize: 58 + randomSize * 30,
      tabletLeft: totalItems > 1 ? 4 + index * (92 / (totalItems - 1)) : 50,
      duration: 5.8 + randomDuration * 2.8,
      delay: -(index * 0.42),
      floatX: 7 + randomX * 10,
      floatY: 7 + randomSize * 11,
    };
  });
};

const Testimonials = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  const floatingLayout = useMemo(
    () => createFloatingLayout(testimonialsData.length),
    []
  );

  const activeTestimonial = testimonialsData[activeIndex];

  const selectTestimonial = (index) => {
    if (index === activeIndex) return;
    setDirection(index > activeIndex ? 1 : -1);
    setActiveIndex(index);
  };

  const changeTestimonial = (step) => {
    setDirection(step);
    setActiveIndex(
      (current) =>
        (current + step + testimonialsData.length) % testimonialsData.length
    );
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "ArrowLeft") changeTestimonial(-1);
      if (event.key === "ArrowRight") changeTestimonial(1);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <section className="testimonials-section" aria-labelledby="testimonials-title">
      <div className="testimonials-glow testimonials-glow--left" aria-hidden="true" />
      <div className="testimonials-glow testimonials-glow--right" aria-hidden="true" />

      <header className="testimonials-header">
        <div className="testimonials-eyebrow-row">
          <span className="testimonials-eyebrow-line" />
          <span className="testimonials-eyebrow-text">Stories of transformation</span>
          <span className="testimonials-eyebrow-line" />
        </div>

        <h2 id="testimonials-title" className="title-batangas testimonials-title">
          Client <span>Testimonials</span>
        </h2>
      </header>

      <div className="testimonials-stage">

        {testimonialsData.map((testimonial, index) => {
          const position = floatingLayout[index];
          const isActive = index === activeIndex;
          const positionStyle = {
            "--avatar-top": `${position.top}%`,
            "--avatar-size": `${position.avatarSize}px`,
            "--tablet-left": `${position.tabletLeft}%`,
            "--float-duration": `${position.duration}s`,
            "--float-delay": `${position.delay}s`,
            "--float-x": `${position.floatX}px`,
            "--float-y": `${position.floatY}px`,
            ...(position.side === "left"
              ? { left: `${position.horizontalOffset}%` }
              : { right: `${position.horizontalOffset}%` }),
          };

          return (
            <button
              key={testimonial.id}
              type="button"
              style={positionStyle}
              className={`testimonial-avatar ${isActive ? "is-active" : ""}`}
              onClick={() => selectTestimonial(index)}
              aria-label={`Read testimonial from ${testimonial.name}`}
              aria-pressed={isActive}
            >
              <img src={testimonial.image} alt="" loading="lazy" draggable="false" />
              <span className="testimonial-avatar-ring" aria-hidden="true" />
            </button>
          );
        })}

        <article className="testimonial-featured">
          <span className="testimonial-corner testimonial-corner--tl" aria-hidden="true" />
          <span className="testimonial-corner testimonial-corner--tr" aria-hidden="true" />
          <span className="testimonial-corner testimonial-corner--bl" aria-hidden="true" />
          <span className="testimonial-corner testimonial-corner--br" aria-hidden="true" />

          <div
            key={activeTestimonial.id}
            className={`testimonial-featured-content ${
              direction > 0 ? "from-right" : "from-left"
            }`}
          >
            <div className="testimonial-featured-photo">
              <img
                src={activeTestimonial.image}
                alt={activeTestimonial.name}
                draggable="false"
              />
            </div>

            <div className="testimonial-stars" aria-label="5 out of 5 stars">
              <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
            </div>

            <span className="testimonial-quote-mark" aria-hidden="true">“</span>

            <blockquote>
              <p>{activeTestimonial.quote}</p>
            </blockquote>

            <div className="testimonial-ornament" aria-hidden="true">
              <span /><b>◆</b><span />
            </div>

            <div className="testimonial-author">
              <h3>{activeTestimonial.name}</h3>
              <p>Verified Vahlay Astro Client</p>
            </div>
          </div>
        </article>

        <div className="testimonials-navigation">
          <button
            type="button"
            className="testimonial-arrow"
            onClick={() => changeTestimonial(-1)}
            aria-label="Previous testimonial"
          >
            <span aria-hidden="true">←</span>
          </button>

          <div className="testimonial-counter" aria-live="polite">
            <span>{String(activeIndex + 1).padStart(2, "0")}</span>
            <span className="testimonial-counter-line" />
            <span>{String(testimonialsData.length).padStart(2, "0")}</span>
          </div>

          <button
            type="button"
            className="testimonial-arrow"
            onClick={() => changeTestimonial(1)}
            aria-label="Next testimonial"
          >
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;