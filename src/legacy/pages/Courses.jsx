import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebaseConfig"; // Firebase config file
import { useCourses } from "../../context/CoursesContext";
import { db } from "../../firebaseConfig";
import { getDoc, doc } from "firebase/firestore";
import { Helmet } from "react-helmet-async";
import Header from "../../components/sections/Header/Header";
import Footer from "../../components/sections/Footer/Footer";

const HeroSection = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { slugMap, loading } = useCourses();

  const courses = Object.values(slugMap);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleCourseClick = async (course) => {
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      const subscriptionSnap = await getDoc(doc(db, "subscriptions", user.email));
      const subscriptionData = subscriptionSnap.exists() ? subscriptionSnap.data() : null;

      const isEnrolled = course.type === "free"
        ? subscriptionData?.freecourses?.includes(course.title)
        : subscriptionData?.DETAILS?.some(
          (details) =>
            details[course.title]?.status === "active" &&
            new Date(details[course.title]?.expiryDate) > new Date()
        );

      if (isEnrolled) {
        navigate("/enrolledcourse");
      } else {
        navigate(`/courses/${course.type}/${course.slug}`);
      }
    } catch (error) {
      console.error("Error checking subscription status:", error);
      alert("An error occurred. Please try again later.");
    }
  };

  const getMetaTags = () => {
    return (
      <Helmet>
        <title>Astrology Courses - Vahlay Astro</title>
        <meta name="description" content="Master the cosmic arts with Vahlay Astro's sacred teachings." />
      </Helmet>
    );
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-[#fffcf8] flex items-center justify-center">
        <div className="text-brand-red font-black uppercase tracking-[0.3em] animate-pulse">Aligning Stars...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#fffcf8]">
      {getMetaTags()}
      <Header />
      
      <main className="grow pt-24">
        {/* Hero Banner Section */}
        <div className="relative overflow-hidden bg-white border-b border-red-50">
          <div className="absolute inset-0 opacity-5">
             <img src="/src/assets/images/pages/home/bgimage.webp" alt="" className="w-full h-full object-cover grayscale" />
          </div>
          <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-20 py-24 flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2 space-y-8 text-center lg:text-left">
              <div className="inline-block px-4 py-1.5 bg-red-50 rounded-full">
                <span className="text-brand-red text-[10px] font-black uppercase tracking-[0.3em]">Sacred Knowledge Catalog</span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-black text-slate-900 tracking-tight leading-none uppercase">
                Align Your Life with <br />
                <span className="text-brand-red">Vahlay Astro</span>
              </h1>
              <p className="text-xl text-slate-600 font-medium max-w-lg leading-relaxed">
                It’s Not Just A Course, It’s A Life-Changing Experience! Discover your cosmic potential today.
              </p>
            </div>
            <div className="lg:w-1/2 relative flex justify-center">
              <div className="absolute inset-0 bg-red-100 rounded-full blur-[100px] opacity-30"></div>
              <img
                src="https://res.cloudinary.com/dzdnwpocf/image/upload/v1753466298/wheel_no6cpe.png"
                alt="Astrology Wheel"
                className="relative w-80 h-80 lg:w-[450px] lg:h-[450px] object-contain animate-slowspin drop-shadow-2xl"
              />
            </div>
          </div>
        </div>

        {/* Courses Grid Section */}
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-24">
          <div className="flex flex-col items-center mb-16 space-y-4">
              <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tight">Our <span className="text-brand-red">Teachings</span></h2>
              <div className="w-24 h-1.5 bg-brand-red rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-12">
            {courses.map((course, index) => (
              <div
                key={index}
                className="group relative bg-white border-2 border-red-600 shadow-[0_20px_50px_rgba(191, 6, 3,0.1)] rounded-[2.5rem] hover:shadow-[0_30px_70px_rgba(191, 6, 3,0.2)] hover:scale-[1.02] transform transition-all duration-500 cursor-pointer flex flex-col h-full overflow-hidden"
                onClick={() => handleCourseClick(course)}
              >
                {/* Header Image Container */}
                <div className="relative p-10 bg-[#fffcf8]">
                  <div className="absolute top-8 left-8 z-20">
                    <img
                      src="/src/assets/images/common/logos/vahlay_astro.png"
                      alt="logo"
                      className="w-16 h-16 bg-white object-contain rounded-full shadow-xl border border-red-50"
                    />
                  </div>

                  {/* Main Course Image - FULLY VISIBLE, NO CUT */}
                  <div className="relative rounded-2xl border-8 border-orange-100 bg-white h-72 flex items-center justify-center p-6 shadow-inner">
                    <img
                      src={course.imageUrl}
                      alt={course.title}
                      className="w-full h-full object-contain transition-all duration-1000 group-hover:scale-105"
                    />
                  </div>
                </div>

                {/* Course Details */}
                <div className="px-10 pb-12 flex flex-col flex-1 items-center text-center">
                  <div className="mb-8 flex-1">
                      <h3 className="text-3xl font-black text-red-600 uppercase tracking-tight mb-4">
                        {course.title}
                      </h3>
                      <p className="text-slate-500 text-base font-medium leading-relaxed max-w-sm mx-auto">
                        {course.Subtitle || "Unlock the secrets of the cosmic alignment and master your destiny."}
                      </p>
                  </div>
                  
                  <div className="w-full">
                      <button
                        className="w-full text-center text-white bg-red-600 font-black py-5 rounded-xl hover:bg-red-700 shadow-[0_15px_30px_rgba(191, 6, 3,0.2)] transition-all uppercase tracking-[0.3em] text-xs flex items-center justify-center gap-3 group/btn"
                      >
                        Begin Your Journey
                        <span className="group-hover:translate-x-2 transition-transform">→</span>
                      </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default HeroSection;


