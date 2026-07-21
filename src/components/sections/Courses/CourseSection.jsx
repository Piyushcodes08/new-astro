import React, { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useCourses } from "../../../context/CoursesContext";
import "./CourseSection.css";

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.14,
      delayChildren: 0.08,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 42, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.72, ease: [0.22, 1, 0.36, 1] },
  },
};

const CourseSection = () => {
  const { slugMap, loading } = useCourses();
  const courses = useMemo(() => Object.values(slugMap).slice(0, 2), [slugMap]);
  const reduceMotion = useReducedMotion();

  if (loading) {
    return (
      <section className="course-section course-section--state">
        <span className="course-section-loading">Unveiling Wisdom...</span>
      </section>
    );
  }

  if (!courses.length) return null;

  return (
    <section className="course-section" aria-labelledby="course-section-title">
      <div className="course-section-glow course-section-glow--one" />
      <div className="course-section-glow course-section-glow--two" />

      <div className="course-section-inner">
        <motion.header
          className="course-section-header"
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="course-section-kicker">
            <span />
            <p>Ancient knowledge · Modern guidance</p>
            <span />
          </div>

          <h2 id="course-section-title" className="title-batangas course-section-title">
            Courses for astrologer
          </h2>

          <p className="subtitle-poppins course-section-subtitle">
            More than a course—an immersive journey into celestial wisdom,
            self-discovery, and timeless Vedic knowledge.
          </p>
        </motion.header>

        <motion.div
          className="course-grid"
          variants={reduceMotion ? undefined : containerVariants}
          initial={reduceMotion ? false : "hidden"}
          whileInView={reduceMotion ? undefined : "visible"}
          viewport={{ once: true, amount: 0.18 }}
        >
          {courses.map((course, index) => (
            <CourseCard
              key={course.id || course.slug || index}
              course={course}
              index={index}
              reduceMotion={reduceMotion}
            />
          ))}
        </motion.div>

        {courses.length > 1 && (
          <div className="course-mobile-hint" aria-hidden="true">
            <span className="course-mobile-hint-line" />
            <span>Swipe to explore</span>
            <span className="course-mobile-hint-arrow">→</span>
          </div>
        )}
      </div>
    </section>
  );
};

const CourseCard = ({ course, index, reduceMotion }) => {
  const navigate = useNavigate();
  const image = course.imageUrl || course.bgImage || "/placeholder-image.jpg";
  const courseType = course.type === "free" ? "free" : "paid";
  const courseUrl = `/courses/${courseType}/${course.slug}`;

  return (
    <motion.article
      className="course-card"
      variants={reduceMotion ? undefined : cardVariants}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <button
        type="button"
        className="course-card-clickable"
        onClick={() => navigate(courseUrl)}
        aria-label={`Explore ${course.title}`}
      >
        <div className="course-card-media">
          <motion.img
            src={image}
            alt={course.title}
            className="course-card-image"
            draggable={false}
            whileHover={reduceMotion ? undefined : { scale: 1.055 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          />
          <div className="course-card-overlay" />
          <div className="course-card-shine" />

          <span className="course-card-number">0{index + 1}</span>
          <span className={`course-card-badge course-card-badge--${courseType}`}>
            {courseType === "free" ? "free course" : "paid course"}
          </span>

          <div className="course-card-copy">
            <div className="course-card-category">
              <span />
              Vedic Wisdom
            </div>
            <h3>{course.title}</h3>
            <div className="course-card-footer">
              <span className="course-card-cta">Explore Course</span>
              <span className="course-card-arrow" aria-hidden="true">↗</span>
            </div>
          </div>
        </div>

        <span className="course-card-border" aria-hidden="true" />
        <span className="course-card-corner course-card-corner--tl" aria-hidden="true" />
        <span className="course-card-corner course-card-corner--br" aria-hidden="true" />
      </button>
    </motion.article>
  );
};

export default CourseSection;