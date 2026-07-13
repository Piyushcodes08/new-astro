import React, { useMemo, useState } from "react";
import "./Testimonials.css";

const testimonialsData = [
  {
    id: 1,
    name: "Tom Hawck",
 
    image:
      "https://images.unsplash.com/photo-1514222709107-a180c68d72b4?auto=format&fit=crop&w=500&q=80",
    quote:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.",
  },
  {
    id: 2,
    name: "Harry John",
   
    image:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=687&q=80",
    quote:
      "The team understood our requirements perfectly and delivered a highly professional solution with excellent attention to detail.",
  },
  {
    id: 3,
    name: "Larry Will",

    image:
      "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=687&q=80",
    quote:
      "Working with this team was a smooth and rewarding experience. Their communication and execution were exceptional.",
  },
  {
    id: 4,
    name: "Augustine",
  
    image:
      "https://images.unsplash.com/photo-1463453091185-61582044d556?auto=format&fit=crop&w=1170&q=80",
    quote:
      "They transformed our ideas into a polished digital experience that exceeded our expectations and impressed our customers.",
  },
  {
    id: 5,
    name: "Jack Danny",
  
    image:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=500&q=80",
    quote:
      "The quality of work, timely delivery and ongoing support made the entire project successful from start to finish.",
  },
  {
    id: 6,
    name: "Luich Harry",
  
    image:
      "https://images.unsplash.com/photo-1504439904031-93ded9f93e4e?auto=format&fit=crop&w=500&q=80",
    quote:
      "A reliable and creative team that consistently delivers premium results while maintaining clear and professional communication.",
  },
  {
    id: 7,
    name: "Alisha Angela",

    image:
      "https://images.unsplash.com/photo-1474176857210-7287d38d27c6?auto=format&fit=crop&w=500&q=80",
    quote:
      "Their strategic approach and technical expertise helped us improve our platform and provide a much better customer experience.",
  },
  {
    id: 8,
    name: "Lofy Sthamam",
 
    image:
      "https://images.unsplash.com/photo-1592621385612-4d7129426394?auto=format&fit=crop&w=500&q=80",
    quote:
      "Every stage of the project was handled professionally. The final result was modern, responsive and visually impressive.",
  },
  {
    id: 9,
    name: "Angela Baby",
   
    image:
      "https://images.unsplash.com/photo-1557053910-d9eadeed1c58?auto=format&fit=crop&w=500&q=80",
    quote:
      "We appreciated their commitment, creativity and ability to understand the exact experience we wanted for our audience.",
  },
  {
    id: 10,
    name: "Hanry Harry",

    image:
      "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=500&q=80",
    quote:
      "The final website performs beautifully across devices and represents our brand with a premium and professional appearance.",
  },
  {
    id: 11,
    name: "Dlang Dhal",
   
    image:
      "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?auto=format&fit=crop&w=500&q=80",
    quote:
      "Their technical knowledge, responsiveness and dedication made them an excellent long-term technology partner for our business.",
  },
];

/**
 * Generates consistent pseudo-random values.
 * This prevents avatar positions from changing on every render.
 */
const getSeededValue = (seed) => {
  const value = Math.sin(seed * 999.91) * 10000;
  return value - Math.floor(value);
};

const createFloatingLayout = (totalItems) => {
  const leftCount = Math.ceil(totalItems / 2);
  const rightCount = totalItems - leftCount;

  return Array.from({ length: totalItems }, (_, index) => {
    const isLeftSide = index < leftCount;

    const sideIndex = isLeftSide
      ? index
      : totalItems - index - 1;

    const sideTotal = isLeftSide ? leftCount : rightCount;

    const randomX = getSeededValue(index + 3);
    const randomSize = getSeededValue(index + 17);
    const randomDuration = getSeededValue(index + 31);

    const top =
      sideTotal > 1
        ? 8 + sideIndex * (72 / (sideTotal - 1))
        : 50;

    const horizontalOffset = 4 + randomX * 14;
    const avatarSize = 72 + randomSize * 42;

    const tabletLeft =
      totalItems > 1
        ? 5 + index * (90 / (totalItems - 1))
        : 50;

    return {
      side: isLeftSide ? "left" : "right",
      top,
      horizontalOffset,
      avatarSize,
      tabletLeft,
      animationDuration: 5.5 + randomDuration * 3,
      animationDelay: -(index * 0.45),
      floatX: 8 + randomX * 12,
      floatY: 8 + randomSize * 14,
    };
  });
};

const Testimonials = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const floatingLayout = useMemo(
    () => createFloatingLayout(testimonialsData.length),
    []
  );

  const changeTestimonial = (direction) => {
    setActiveIndex((currentIndex) => {
      const nextIndex = currentIndex + direction;

      if (nextIndex < 0) {
        return testimonialsData.length - 1;
      }

      if (nextIndex >= testimonialsData.length) {
        return 0;
      }

      return nextIndex;
    });
  };

  const selectTestimonial = (index) => {
    if (index !== activeIndex) {
      setActiveIndex(index);
    }
  };

  return (
    <section
      className="testimonials-section"
      aria-label="Client testimonials"
    >
      <div className="testimonials-background" aria-hidden="true" />
      <div className="testimonials-overlay" aria-hidden="true" />

      <div className="testimonials-wrapper">
        <div className="testimonials-quote-row">
          {testimonialsData.map((testimonial, index) => {
            const isActive = activeIndex === index;
            const position = floatingLayout[index];

            const positionStyle = {
              "--testimonial-top": `${position.top}%`,
              "--testimonial-size": `${position.avatarSize}px`,
              "--tablet-left": `${position.tabletLeft}%`,
              "--animation-duration": `${position.animationDuration}s`,
              "--animation-delay": `${position.animationDelay}s`,
              "--float-x": `${position.floatX}px`,
              "--float-y": `${position.floatY}px`,
              ...(position.side === "left"
                ? {
                    left: `${position.horizontalOffset}%`,
                    right: "auto",
                  }
                : {
                    right: `${position.horizontalOffset}%`,
                    left: "auto",
                  }),
            };

            return (
              <article
                key={testimonial.id}
                style={positionStyle}
                className={`testimonial-column ${
                  isActive ? "testimonial-active testimonial-show" : ""
                }`}
                onClick={() => selectTestimonial(index)}
                onKeyDown={(event) => {
                  if (
                    !isActive &&
                    (event.key === "Enter" || event.key === " ")
                  ) {
                    event.preventDefault();
                    selectTestimonial(index);
                  }
                }}
                role={!isActive ? "button" : undefined}
                tabIndex={!isActive ? 0 : -1}
                aria-label={
                  !isActive
                    ? `View testimonial from ${testimonial.name}`
                    : undefined
                }
              >
                <div className="testimonial-col-inner">
                  <div className="testimonial-author-meta">
                    <div className="testimonial-image-cover">
                      <img
                        src={testimonial.image}
                        alt={testimonial.name}
                        loading={isActive ? "eager" : "lazy"}
                        draggable="false"
                      />
                    </div>

                    <div className="testimonial-author-info">
                      <div className="testimonial-author-name">
                        <h3>{testimonial.name}</h3>
                      </div>

                      <div className="testimonial-author-status">
                        <p>{testimonial.title}</p>
                      </div>
                    </div>
                  </div>

                  <div className="testimonial-quote-wrapper">
                    <span
                      className="testimonial-quote-symbol testimonial-quote-left"
                      aria-hidden="true"
                    >
                      ❛
                    </span>

                    <div className="testimonial-text-inner">
                      <p>{testimonial.quote}</p>
                    </div>

                    <span
                      className="testimonial-quote-symbol testimonial-quote-right"
                      aria-hidden="true"
                    >
                      ❜
                    </span>
                  </div>
                </div>
              </article>
            );
          })}

          <div className="testimonials-arrows">
            <button
              type="button"
              className="testimonial-arrow testimonial-left-arrow"
              onClick={() => changeTestimonial(-1)}
              aria-label="Previous testimonial"
            >
              <span aria-hidden="true">‹</span>
            </button>

            <button
              type="button"
              className="testimonial-arrow testimonial-right-arrow"
              onClick={() => changeTestimonial(1)}
              aria-label="Next testimonial"
            >
              <span aria-hidden="true">›</span>
            </button>
          </div>

          <div className="testimonial-counter">
            <span>{String(activeIndex + 1).padStart(2, "0")}</span>
            <span className="testimonial-counter-line" />
            <span>{String(testimonialsData.length).padStart(2, "0")}</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;