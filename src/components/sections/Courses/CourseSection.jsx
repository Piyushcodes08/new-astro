import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  motion,
  useTransform,
  useScroll,
  useMotionValueEvent,
} from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useCourses } from "../../../context/CoursesContext";
import "./CourseSection.css";

const useViewportWidth = () => {
  const [width, setWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );

  useEffect(() => {
    const handleResize = () => {
      setWidth(window.innerWidth);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return width;
};

const CourseSection = () => {
  const { slugMap, loading } = useCourses();
  const coursesData = useMemo(() => Object.values(slugMap), [slugMap]);

  if (loading) {
    return (
      <div className="py-20 flex items-center justify-center course-section-container">
        <div className="course-section-loading">Unveiling Wisdom...</div>
      </div>
    );
  }

  if (coursesData.length === 0) {
    return null;
  }

  return (
    <section className="course-section">
      <div className="course-section-header">
     
        <h2 className="title-batangas course-section-title">
          Courses for Astrologer
        </h2>
      
        <p className="subtitle-poppins course-section-subtitle">
          It&apos;s not just a course — it&apos;s a life-changing journey into
          celestial wisdom.
        </p>
      </div>

      <HorizontalScrollCarousel items={coursesData} />
    </section>
  );
};

const HorizontalScrollCarousel = ({ items }) => {
  const targetRef = useRef(null);
  const viewportWidth = useViewportWidth();

  const [activeIndex, setActiveIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end end"],
  });

  const isMobile = viewportWidth < 640;
  const cardWidth = isMobile ? 300 : 340;
  const gap = isMobile ? 24 : 52;

  const totalWidth = items.length * cardWidth + (items.length - 1) * gap;

  const startX = viewportWidth / 2 - cardWidth / 2;
  const endX = viewportWidth / 2 - (totalWidth - cardWidth / 2);

  const x = useTransform(scrollYProgress, [0, 1], [startX, endX]);

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (!items.length) return;

    const nextIndex = Math.round(latest * (items.length - 1));
    const safeIndex = Math.min(Math.max(nextIndex, 0), items.length - 1);

    setActiveIndex(safeIndex);
  });

  return (
    <section
      ref={targetRef}
      className="relative h-[300vh] course-carousel-section"
    >
      <div
        className="sticky top-0 flex h-screen items-center overflow-hidden course-carousel-sticky"
        style={{ perspective: "1200px" }}
      >
        <motion.div
          style={{
            x,
            gap,
            transformStyle: "preserve-3d",
          }}
          className="flex px-4 course-carousel-track"
        >
          {items.map((course, index) => (
            <Card
              key={course.id || course.slug || index}
              course={course}
              index={index}
              activeIndex={activeIndex}
              hoveredIndex={hoveredIndex}
              setHoveredIndex={setHoveredIndex}
              scrollYProgress={scrollYProgress}
              itemsCount={items.length}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

const Card = ({
  course,
  index,
  activeIndex,
  hoveredIndex,
  setHoveredIndex,
  scrollYProgress,
  itemsCount,
}) => {
  const navigate = useNavigate();

  const bgImage = course.imageUrl || course.bgImage || "/placeholder-image.jpg";
  const courseType = course.type === "free" ? "free" : "paid";
  const courseUrl = `/courses/${courseType}/${course.slug}`;

  const isActive = activeIndex === index;
  const isHovered = hoveredIndex === index;
  const cardNum = String(index + 1).padStart(2, "0");

  const N = itemsCount;
  const centerProgress = N > 1 ? index / (N - 1) : 0.5;
  const step = N > 1 ? 0.7 / (N - 1) : 0.4;

  const rotateY = useTransform(
    scrollYProgress,
    [centerProgress - step, centerProgress, centerProgress + step],
    [-32, 0, 32]
  );

  const scale = useTransform(
    scrollYProgress,
    [centerProgress - step, centerProgress, centerProgress + step],
    [0.82, 1, 0.82]
  );

  const z = useTransform(
    scrollYProgress,
    [centerProgress - step, centerProgress, centerProgress + step],
    [-150, 0, -150]
  );

  const [isBtnHovered, setIsBtnHovered] = useState(false);

  const handleExplore = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(courseUrl);
  };

  return (
    <motion.article
      style={{
        rotateY,
        scale,
        z,
        zIndex: isHovered ? 100 : isActive ? 60 : 10,
        pointerEvents: "none",
        transformStyle: "preserve-3d",
      }}
      className={`course-card-shell ${isActive ? "is-active" : ""} ${
        isHovered ? "is-hovered" : ""
      }`}
    >
      <div className="course-card-frame" aria-hidden="true">
        <span className="course-card-corner course-card-corner--tl" />
        <span className="course-card-corner course-card-corner--tr" />
        <span className="course-card-corner course-card-corner--bl" />
        <span className="course-card-corner course-card-corner--br" />
      </div>

      <div className="course-card-visual">
        <img
          src={bgImage}
          alt={course.title}
          className="course-card-image"
          draggable={false}
        />
        <div className="course-card-image-vignette" />
        <span className="course-card-number">{cardNum}</span>
        <span className={`course-card-badge ${courseType}`}>
          {courseType === "free" ? "Complimentary" : "Premium"}
        </span>
      </div>

      <div
        className="course-card-content"
        style={{ pointerEvents: isActive || isHovered ? "auto" : "none" }}
        onMouseEnter={() => setHoveredIndex(index)}
        onMouseLeave={() => {
          setHoveredIndex(null);
          setIsBtnHovered(false);
        }}
      >
        <div className="course-card-eyebrow">
          <span className="course-card-eyebrow-line" />
          <span className="course-card-eyebrow-text">Vedic Wisdom</span>
          <span className="course-card-eyebrow-line" />
        </div>

        <h3 className="course-card-title">{course.title}</h3>

        <div className="course-card-divider" aria-hidden="true">
          <span className="course-card-divider-gem">◆</span>
        </div>

        <button
          type="button"
          className={`course-card-btn${isBtnHovered ? " is-btn-hovered" : ""}`}
          onMouseEnter={() => setIsBtnHovered(true)}
          onMouseLeave={() => setIsBtnHovered(false)}
          onClick={handleExplore}
        >
          <span className="course-card-btn-text">Explore Course</span>
          <span className="course-card-arrow" aria-hidden="true">
            →
          </span>
        </button>
      </div>
    </motion.article>
  );
};

export default CourseSection;
