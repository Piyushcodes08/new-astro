import React from 'react';
import { Link } from 'react-router-dom';
import { LuArrowRight } from "react-icons/lu";
import { useCourses } from '../../../context/CoursesContext';
import './CourseSection.css';

/**
 * CourseGrid
 * This is the high-fidelity grid version used for the dedicated Courses Page.
 */
const CourseGrid = () => {
  const { slugMap, loading } = useCourses();
  const coursesData = React.useMemo(() => Object.values(slugMap), [slugMap]);

  if (loading) {
    return (
      <div className="py-20 flex items-center justify-center">
        <div className="text-brand-red text-xl font-bold animate-pulse uppercase tracking-[0.3em]">
          Unveiling Wisdom...
        </div>
      </div>
    );
  }

  return (
    <section className="course-grid-section">
      <div className="section-container">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 max-w-6xl mx-auto">
          {coursesData.map((course) => (
            <div
              key={course.id}
              className="course-card-simple group relative bg-[#150a0a]/45 backdrop-blur-3xl border border-white/10 rounded-lg overflow-hidden hover:border-brand-red/45 transition-all duration-700 shadow-2xl flex flex-col h-full hover:-translate-y-2"
            >
              {/* Image Area - No padding, no crop */}
              <div className="relative bg-[#080101] overflow-hidden">
                <img
                  src={course.imageUrl || course.bgImage}
                  alt={course.title}
                  className="w-full h-auto block object-contain transition-all duration-1000 group-hover:scale-[1.01]"
                  loading="lazy"
                />
              </div>

              {/* Content Area */}
              <div className="relative z-20 py-6 px-[15px] bg-linear-to-b from-[#120606]/95 to-[#090101] flex flex-col flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-red shadow-[0_0_8px_#dd2727]"></div>

                  <span className="text-[9px] uppercase tracking-[0.35em] text-brand-red font-bold">
                    Divine Mastery
                  </span>
                </div>

                <h3 className="title-batangas text-lg md:text-xl mb-3 text-white group-hover:text-brand-red transition-colors duration-300 leading-tight">
                  {course.title}
                </h3>

                <p className="subtitle-poppins text-white/55 text-[11px] leading-relaxed mb-6 line-clamp-2">
                  {course.description}
                </p>

                <div className="flex items-center justify-between mt-auto">
                  <Link
                    to={`/courses/${course.type === 'free' ? 'free' : 'paid'}/${course.slug}`}
                    className="inline-flex items-center gap-2 text-brand-red font-bold uppercase tracking-[0.2em] text-[9px] group/link py-1 hover:text-white transition-colors duration-300"
                  >
                    Enter Portal
                    <LuArrowRight className="w-4 h-4 transition-transform duration-300 group-hover/link:translate-x-1" />
                  </Link>

                  <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">
                    Vahlay Astro
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CourseGrid;