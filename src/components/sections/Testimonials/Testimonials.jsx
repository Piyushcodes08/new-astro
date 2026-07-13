import React, { useEffect, useMemo, useState } from "react";
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
} from "firebase/firestore";
import { FaRegStar, FaStar, FaStarHalfAlt } from "react-icons/fa";
import { db } from "../../../firebaseConfig";
import "./Testimonials.css";

const fallbackTestimonials = [
  {
    id: "f1",
    rating: 5,
    quote:
      "The Essentials of Self-Discovery truly changed how I view astrology. Vahlay Sir's explanations were relatable and easy to understand.",
    name: "Nirav Deshmukh",
    title: "The Essentials of Self-Discovery",
  },
  {
    id: "f2",
    rating: 4,
    quote:
      "I joined mainly out of curiosity, but I ended up connecting with myself on a whole new level. The course gave me a beautiful foundation in astrology.",
    name: "Malvi Vashi",
    title: "The Essentials of Self-Discovery",
  },
  {
    id: "f3",
    rating: 5,
    quote:
      "Taking this course was like being handed a mirror. It helped me understand cycles and energies that I had felt before but never understood.",
    name: "Vishal Patel",
    title: "The Essentials of Self-Discovery",
  },
  {
    id: "f4",
    rating: 4,
    quote:
      "Vahlay Sir doesn't just teach—he guides. The knowledge shared was practical and meaningful. I now feel more aware of my natural strengths.",
    name: "Viren Tailor",
    title: "Foundation of Vedic Astrology",
  },
  {
    id: "f5",
    rating: 5,
    quote:
      "Before this course, I only knew astrology at a surface level. This helped me understand the deeper logic behind planets, signs, and houses.",
    name: "Nishant Tailor",
    title: "Foundation of Vedic Astrology",
  },
  {
    id: "f6",
    rating: 5,
    quote:
      "This course gave me the confidence to read and understand a birth chart. I have even started helping friends interpret their charts.",
    name: "Jay Kantharia",
    title: "Foundation of Vedic Astrology",
  },
];

const normalizeReview = (document) => {
  const data = document.data();

  const ratingValue = Number(data.rating);
  const normalizedRating = Number.isFinite(ratingValue)
    ? Math.min(5, Math.max(0, ratingValue))
    : 5;

  return {
    id: document.id,
    name:
      data.name ||
      data.userName ||
      data.fullName ||
      data.displayName ||
      "Vahlay Astro Student",

    quote:
      data.quote ||
      data.comment ||
      data.text ||
      data.message ||
      data.review ||
      "",

    title:
      data.courseName ||
      data.course ||
      data.title ||
      data.designation ||
      "Vahlay Astro",

    rating: normalizedRating,

    image:
      data.image ||
      data.photoURL ||
      data.avatar ||
      data.profileImage ||
      "",
  };
};

const getInitials = (name = "") => {
  const words = name.trim().split(/\s+/).filter(Boolean);

  if (!words.length) return "VA";

  return words
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
};

const StarRating = ({ rating = 5 }) => {
  const numericRating = Number(rating);
  const safeRating = Number.isFinite(numericRating)
    ? Math.min(5, Math.max(0, numericRating))
    : 5;

  return (
    <div
      className="testimonial-stars"
      aria-label={`${safeRating} out of 5 stars`}
    >
      {Array.from({ length: 5 }, (_, index) => {
        const starPosition = index + 1;

        if (safeRating >= starPosition) {
          return <FaStar key={starPosition} aria-hidden="true" />;
        }

        if (safeRating >= starPosition - 0.5) {
          return <FaStarHalfAlt key={starPosition} aria-hidden="true" />;
        }

        return <FaRegStar key={starPosition} aria-hidden="true" />;
      })}
    </div>
  );
};

const Testimonials = () => {
  const [testimonialsData, setTestimonialsData] =
    useState(fallbackTestimonials);

  const [maximumItems, setMaximumItems] = useState(10);

  useEffect(() => {
    const handleResize = () => {
      setMaximumItems(window.innerWidth < 640 ? 8 : 10);
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    let componentMounted = true;

    const fetchReviews = async () => {
      const reviewSources = [
        async () => {
          const reviewsQuery = query(
            collection(db, "Reviews"),
            orderBy("createdAt", "desc"),
            limit(12)
          );

          return getDocs(reviewsQuery);
        },

        async () => {
          const commentsQuery = query(
            collection(db, "Comments_Vahaly_Astro"),
            limit(12)
          );

          return getDocs(commentsQuery);
        },
      ];

      for (const getReviewSnapshot of reviewSources) {
        try {
          const snapshot = await getReviewSnapshot();

          const reviews = snapshot.docs
            .map(normalizeReview)
            .filter((review) => review.quote.trim().length > 0);

          if (reviews.length > 0) {
            if (componentMounted) {
              setTestimonialsData(reviews);
            }

            return;
          }
        } catch (error) {
          console.warn("Unable to load testimonial source:", error);
        }
      }
    };

    fetchReviews();

    return () => {
      componentMounted = false;
    };
  }, []);

  const wheelTestimonials = useMemo(() => {
    return testimonialsData
      .filter((testimonial) => {
        return (
          testimonial &&
          (testimonial.quote ||
            testimonial.text ||
            testimonial.comment)
        );
      })
      .slice(0, maximumItems);
  }, [testimonialsData, maximumItems]);

  const totalItems = wheelTestimonials.length;

  const spokeCount = Math.max(4, Math.ceil(totalItems / 2));

  const rotationDuration = Math.max(48, totalItems * 6);

  const desktopCardSize =
    totalItems >= 10
      ? "112px"
      : totalItems >= 8
      ? "126px"
      : "148px";

  if (!totalItems) {
    return null;
  }

  return (
    <section className="testimonial-section" id="testimonials">
      <div className="section-container testimonial-section-container">
        <div
          className="testimonial-wheel-stage"
          style={{
            "--total-items": totalItems,
            "--rotation-duration": `${rotationDuration}s`,
            "--desktop-card-size": desktopCardSize,
          }}
        >
          <div className="testimonial-wheel-rotor">
            <div className="testimonial-outer-ring" />
            <div className="testimonial-middle-ring" />

            <div className="testimonial-spokes" aria-hidden="true">
              {Array.from({ length: spokeCount }, (_, index) => {
                const angle = (180 / spokeCount) * index;

                return (
                  <span
                    key={`spoke-${index}`}
                    className="testimonial-spoke"
                    style={{
                      "--spoke-angle": `${angle}deg`,
                    }}
                  />
                );
              })}
            </div>

            {wheelTestimonials.map((item, index) => {
              const itemAngle = (360 / totalItems) * index;

              const quote =
                item.quote ||
                item.text ||
                item.comment ||
                "A wonderful learning experience.";

              return (
                <article
                  className="testimonial-orbit-item"
                  key={item.id || `${item.name}-${index}`}
                  style={{
                    "--item-angle": `${itemAngle}deg`,
                    "--item-negative-angle": `${-itemAngle}deg`,
                  }}
                >
                  <div className="testimonial-item-upright">
                    <div className="testimonial-item-counter">
                      <button
                        type="button"
                        className="testimonial-orbit-card"
                        aria-label={`Read testimonial from ${item.name}`}
                      >
                        <span className="testimonial-card-face testimonial-card-front">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="testimonial-avatar-image"
                              loading="lazy"
                            />
                          ) : (
                            <span className="testimonial-avatar-initials">
                              {getInitials(item.name)}
                            </span>
                          )}

                          <strong className="testimonial-person-name">
                            {item.name}
                          </strong>

                          {item.title && (
                            <span className="testimonial-course-name">
                              {item.title}
                            </span>
                          )}

                          <span className="testimonial-tap-label">
                            View story
                          </span>
                        </span>

                        <span className="testimonial-card-face testimonial-card-back">
                          <span className="testimonial-quote-mark">
                            “
                          </span>

                          <StarRating rating={item.rating || 5} />

                          <span className="testimonial-review-text">
                            {quote}
                          </span>

                          <strong className="testimonial-review-author">
                            {item.name}
                          </strong>
                        </span>
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="testimonial-wheel-center">
            <span className="testimonial-center-eyebrow">
              Real Stories
            </span>

            <h2 className="title-batangas">
              Celestial
              <span>Experiences</span>
            </h2>

            <div className="testimonial-center-divider">
              <span />
              <i>✦</i>
              <span />
            </div>

            <p>Hover or tap a circle to explore their journey.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;