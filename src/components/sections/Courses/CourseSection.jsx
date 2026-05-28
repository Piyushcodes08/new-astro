import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCourses } from '../../../context/CoursesContext';
import './CourseSection.css';

const CourseSection = () => {
  const { slugMap, loading } = useCourses();
  const [activeCard, setActiveCard] = useState(0);

  const coursesData = React.useMemo(() => Object.values(slugMap), [slugMap]);

  if (loading) {
    return (
      <div className="py-20 flex items-center justify-center">
        <div className="text-brand-red text-xl font-bold animate-pulse uppercase tracking-[0.3em]">
          Aligning Stars...
        </div>
      </div>
    );
  }

  return (
    <section className="course-section-container">
      <div className="section-container">
        {/* Section Header */}
        <div className="flex flex-col gap-2 mb-12 text-center">
          <h2 className="title-batangas text-2xl sm:text-3xl md:text-5xl font-bold uppercase tracking-tight">
            Our Sacred Courses
          </h2>
          <p className="subtitle-poppins text-sm sm:text-base lg:text-lg text-white/60">
            Master ancient wisdom for modern living with our expertly crafted courses.
          </p>
        </div>

        <div className="slider-wrapper">
          <div className="slider">
            <div className="track">
              {coursesData.map((course, index) => (
                  <div
                    key={course.id}
                    className="project-card"
                    active={activeCard === index ? "true" : undefined}
                    onMouseEnter={() => setActiveCard(index)}
                    onClick={() => setActiveCard(index)}
                  >
                  <img
                    src={course.imageUrl || course.bgImage}
                    alt={course.title}
                    loading="eager"
                    className="project-card__bg"
                  />
                  <div className="project-card__content">
                    <h3 className="project-card__title">
                      {course.title}
                    </h3>

                    {activeCard === index && (
                      <div className="project-card__active-layout">
                        <img
                          src={course.imageUrl || course.bgImage}
                          alt={course.title}
                          loading="eager"
                          className="project-card__thumb"
                        />
                        <Link 
                          to={`/courses/${course.type === 'free' ? 'free' : 'paid'}/${course.slug}`}
                          className="project-card__btn-circle text-center flex flex-col items-center justify-center"
                        >
                          Enroll <br /> Now
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="dots">
              {coursesData.map((_, index) => (
                <div
                  key={index}
                  className={`dot ${activeCard === index ? 'active' : ''}`}
                  onClick={() => setActiveCard(index)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CourseSection;
