import { Link, useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import Aside from "./Aside";
import Footer from "../../components/sections/Footer/Footer";
import defaultCourseImage from '../../assets/images/pages/courses/courses.webp';
import basicsImg from '../../assets/images/pages/courses/basics.webp';
import geetaImg from '../../assets/images/pages/courses/geeta.webp';
import naradImg from '../../assets/images/pages/courses/narad.webp';
import foundationImg from '../../assets/images/pages/courses/foundation.webp';

const getFallbackImage = (courseName) => {
  if (!courseName) return defaultCourseImage;
  const name = courseName.toLowerCase();
  if (name.includes('basic')) return basicsImg;
  if (name.includes('geeta')) return geetaImg;
  if (name.includes('narad')) return naradImg;
  if (name.includes('foundation')) return foundationImg;
  return defaultCourseImage;
};

const ArrowIcon = ({ className = "h-4 w-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M5 12h14m-5-5 5 5-5 5" />
  </svg>
);

const BookIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20V4H6.5A2.5 2.5 0 0 0 4 6.5v13Z" />
  </svg>
);

const PlayIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
  </svg>
);

const EnrollCourse = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [groupedVideos, setGroupedVideos] = useState({});
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await fetchCourses(currentUser.email);
      } else {
        navigate("/login");
      }
    });
    return () => unsubscribe();
  }, [auth, navigate]);

  const fetchCourses = async (email) => {
    try {
      const docRef = doc(db, "subscriptions", email);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        const courseTypes = ["freeCourses", "paidCourses"];
        const coursesMetadata = {};

        for (const type of courseTypes) {
          const coursesSnap = await getDocs(collection(db, type));
          coursesSnap.forEach(courseDoc => {
            const courseData = courseDoc.data();
            const courseName = courseData.Title || courseData.title;
            if (courseName) {
              coursesMetadata[courseName] = courseData.imageUrl || courseData.image || courseData.thumbnail || courseData.courseImage || courseData.imgUrl || "";
            }
          });
        }

        const freeCourses = data.freecourses?.map((courseName) => ({
          name: courseName, type: "Free", enrolled: true,
          image: coursesMetadata[courseName] || getFallbackImage(courseName)
        })) || [];

        const paidCourses = data.DETAILS?.map((courseObj) => {
          const courseName = Object.keys(courseObj)[0];
          const details = courseObj[courseName];
          let daysLeft = 0, usedDays = 0, totalDays = 0;
          if (details.subscriptionDate && details.expiryDate) {
            const subDate = new Date(details.subscriptionDate);
            const expDate = new Date(details.expiryDate);
            const now = new Date();
            totalDays = Math.floor((expDate - subDate) / (1000 * 3600 * 24));
            usedDays = Math.max(0, Math.floor((now - subDate) / (1000 * 3600 * 24)));
            daysLeft = Math.max(0, totalDays - usedDays);
          }
          return { name: courseName, type: "Paid", enrolled: true, daysLeft, usedDays, image: coursesMetadata[courseName] || getFallbackImage(courseName) };
        }) || [];

        const allCourses = [...freeCourses, ...paidCourses];
        setCourses(allCourses);

        const allVideosGrouped = {};
        for (const course of allCourses) {
          const videosRef = collection(db, `videos_${course.name}`);
          const videosSnapshot = await getDocs(videosRef);
          if (!videosSnapshot.empty) {
            allVideosGrouped[course.name] = videosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          }
        }
        setGroupedVideos(allVideosGrouped);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching courses:", error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-2 border-[#e0d5c0] border-t-[#a07830] rounded-full animate-spin mx-auto" />
          <p className="text-[9px] font-bold uppercase tracking-[0.35em] text-[var(--dash-accent,#bf0603)]">Syncing your path...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col" style={{ backgroundColor: "var(--dash-bg, #f8fafc)" }}>
      <div className="flex flex-1 relative z-10 gap-0">
        <Aside />
        <main className="flex-1 min-w-0 py-6 px-4 sm:px-6 lg:px-10 overflow-x-hidden">
          <div className="max-w-5xl mx-auto space-y-8 pb-12 pt-4">

            {/* ── Page Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[rgba(0,0,0,0.08)]">
              <div>
                <div className="mb-2 flex items-center gap-3">
                  <span className="h-px w-7" style={{ background: "var(--dash-accent,#bf0603)" }} className="" />
                  <p className="text-[9px] font-bold uppercase tracking-[0.35em] text-[var(--dash-accent,#bf0603)]">Academic Journey</p>
                </div>
                <h1 className="font-serif text-2xl sm:text-3xl text-[#1c1a17]">
                  My Enrolled Courses
                </h1>
              </div>
              <Link
                to="/courses"
                className="inline-flex min-h-10 items-center gap-2 rounded border border-[rgba(212,175,104,0.4)] bg-[rgba(255,255,255,0.025)] px-5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#f0d99d] transition hover:-translate-y-0.5 hover:border-[rgba(212,175,104,0.7)] hover:bg-[rgba(212,175,104,0.08)]"
              >
                Browse Catalog <ArrowIcon className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* ── Empty State ── */}
            {courses.length === 0 ? (
              <div className="rounded border border-dashed border-[#d5c9b0] bg-white px-6 py-16 text-center">
                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded border border-[rgba(212,175,104,0.25)] bg-[rgba(212,175,104,0.06)] " style={{ color: "var(--dash-accent,#bf0603)" }}>
                  <BookIcon />
                </div>
                <h3 className="font-serif text-xl text-white mb-2">No Cosmic Paths Yet</h3>
                <p className="text-[#6b5a40] text-sm max-w-md mx-auto mb-8 leading-relaxed">
                  You are not enrolled in any courses yet. Start your cosmic journey by exploring our sacred teachings.
                </p>
                <Link to="/courses" className="inline-flex min-h-10 items-center rounded border border-[rgba(212,175,104,0.5)] bg-[rgba(255,255,255,0.025)] px-7 text-[10px] font-bold uppercase tracking-[0.2em] text-[#f0d99d] transition hover:bg-[rgba(212,175,104,0.1)]">
                  Browse Catalog
                </Link>
              </div>
            ) : (
              /* ── Courses Table ── */
              <div className="rounded border border-[#e0d5c0] overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.4)]">

                {/* Desktop Header */}
                <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-[#f5f0e6] border-b border-[rgba(0,0,0,0.08)]">
                  {["Course", "Type", "Status", "Access", "Action"].map((h, i) => (
                    <div key={h} className={`text-[9px] font-bold uppercase tracking-[0.25em] text-[#b08840] ${i === 0 ? "col-span-5" : i === 4 ? "col-span-2 text-right" : "col-span-1 text-center" + (i===3?" col-span-2":"")}`}>
                      {h}
                    </div>
                  ))}
                </div>

                <div className="divide-y divide-[#ede7db]">
                  {courses.map((course, index) => (
                    <div key={index}>
                      {/* Mobile Card */}
                      <div className="md:hidden p-4 flex items-start gap-4 hover:bg-[#faf6ee] transition-all group">
                        <div className="relative w-20 h-16 rounded overflow-hidden shrink-0 border border-[#e0d5c0]">
                          <img src={course.image} alt={course.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => { e.target.onerror = null; e.target.src = getFallbackImage(course.name); }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-serif text-[#1c1a17] leading-snug group-hover:text-[var(--dash-accent,#bf0603)] transition-colors line-clamp-2">{course.name}</h3>
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            <span className="px-2 py-0.5 rounded border border-[#c9a55a]/40 bg-[#fdf7ec] text-[#8a6520] text-[8px] font-bold uppercase tracking-widest">{course.type}</span>
                            <span className="px-2 py-0.5 rounded border border-[rgba(130,184,121,0.3)] bg-[rgba(130,184,121,0.07)] text-[#82b879] text-[8px] font-bold uppercase tracking-widest">Active</span>
                            <span className="text-[8px] font-bold text-[#7a6a52] uppercase">{course.type === "Paid" ? `${course.daysLeft} days left` : "Lifetime"}</span>
                          </div>
                          <button onClick={() => navigate(`/course/${encodeURIComponent(course.name)}`)}
                            className="mt-3 w-full py-2 rounded text-white" style={{ background: "var(--dash-accent,#bf0603)", borderColor: "var(--dash-accent,#bf0603)" }} className=" font-bold uppercase tracking-[0.15em] text-[9px] hover:bg-[rgba(212,175,104,0.1)] transition-all">
                            Continue
                          </button>
                        </div>
                      </div>

                      {/* Desktop Row */}
                      <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-5 items-center hover:bg-[#faf6ee] transition-all group">
                        <div className="col-span-5 flex items-center gap-4">
                          <div className="relative w-18 h-12 rounded overflow-hidden shrink-0 border border-[#e0d5c0]" style={{width:"72px",height:"48px"}}>
                            <img src={course.image} alt={course.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                              onError={(e) => { e.target.onerror = null; e.target.src = getFallbackImage(course.name); }} />
                          </div>
                          <div>
                            <h3 className="text-sm font-serif text-[#1c1a17] group-hover:text-[var(--dash-accent,#bf0603)] transition-colors">{course.name}</h3>
                            <p className="text-[9px] text-[#b08840] font-bold uppercase tracking-widest mt-0.5">Enrolled</p>
                          </div>
                        </div>
                        <div className="col-span-1 flex justify-center">
                          <span className="px-3 py-1 rounded border border-[#c9a55a]/40 bg-[#fdf7ec] text-[#8a6520] text-[9px] font-bold uppercase tracking-widest">{course.type}</span>
                        </div>
                        <div className="col-span-2 flex justify-center">
                          <span className="px-3 py-1 rounded border border-[rgba(130,184,121,0.3)] bg-[rgba(130,184,121,0.07)] text-[#82b879] text-[9px] font-bold uppercase tracking-widest">Active</span>
                        </div>
                        <div className="col-span-2 text-center">
                          {course.type === "Paid" ? (
                            <div>
                              <p className="text-sm font-serif text-[#1c1a17]">{course.daysLeft}</p>
                              <p className="text-[9px] text-[#7a6a52] uppercase tracking-widest font-bold">Days left</p>
                            </div>
                          ) : (
                            <div>
                              <p className="text-sm font-serif text-[#1c1a17]">Lifetime</p>
                              <p className="text-[9px] text-[#7a6a52] uppercase tracking-widest font-bold">Access</p>
                            </div>
                          )}
                        </div>
                        <div className="col-span-2 flex justify-end">
                          <button onClick={() => navigate(`/course/${encodeURIComponent(course.name)}`)}
                            className="group/btn inline-flex items-center gap-2 min-h-9 px-5 rounded text-white" style={{ background: "var(--dash-accent,#bf0603)", borderColor: "var(--dash-accent,#bf0603)" }} className=" font-bold uppercase tracking-[0.18em] text-[9px] hover:bg-[rgba(212,175,104,0.12)] hover:border-[rgba(212,175,104,0.7)] transition-all">
                            Continue <ArrowIcon className="h-3 w-3 transition-transform group-hover/btn:translate-x-0.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Recorded Sessions ── */}
            <div className="space-y-6 pt-4">
              <div className="flex items-center gap-3 pb-4 border-b border-[rgba(0,0,0,0.08)]">
                <div>
                  <div className="mb-1 flex items-center gap-3">
                    <span className="h-px w-7" style={{ background: "var(--dash-accent,#bf0603)" }} className="" />
                    <p className="text-[9px] font-bold uppercase tracking-[0.35em] text-[var(--dash-accent,#bf0603)]">Vault</p>
                  </div>
                  <h2 className="font-serif text-2xl" style={{ color: "var(--dash-accent, #bf0603)" }}>Recorded Sessions</h2>
                </div>
              </div>

              {Object.entries(groupedVideos).length === 0 ? (
                <div className="rounded border border-dashed border-[#e0d5c0] bg-white px-6 py-10 text-center">
                  <p className="text-[#9a8870] font-bold uppercase tracking-widest text-[9px]">No recorded sessions in the archive yet.</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {Object.entries(groupedVideos).map(([title, modules]) => (
                    <div key={title} className="rounded border border-[#e0d5c0] overflow-hidden">
                      {/* Module Header */}
                      <div className="flex items-center gap-3 px-5 py-4 bg-[#f5f0e6] border-b border-[rgba(0,0,0,0.08)]">
                        <span className="h-4 w-px bg-[#d4af68]" />
                        <p className="text-[9px] font-bold uppercase tracking-[0.3em] " style={{ color: "var(--dash-accent,#bf0603)" }}>{title}</p>
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 p-4">
                        {modules.map((module) => (
                          <div key={module.id}
                            onClick={() => navigate(`/course/${encodeURIComponent(title)}/video/${module.id}`)}
                            className="group relative flex items-center gap-4 p-4 rounded border border-[rgba(212,175,104,0.1)] bg-[#fffdf8] hover:border-[#c9a55a] hover:bg-gray-50 transition-all duration-300 cursor-pointer"
                          >
                            {/* Corner accents */}
                            <span className="pointer-events-none absolute left-1.5 top-1.5 h-3 w-3 border-l border-t border-[rgba(212,175,104,0.3)] opacity-0 group-hover:opacity-100 transition-opacity" />
                            <span className="pointer-events-none absolute bottom-1.5 right-1.5 h-3 w-3 border-b border-r border-[rgba(212,175,104,0.3)] opacity-0 group-hover:opacity-100 transition-opacity" />

                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded border border-[rgba(212,175,104,0.2)] bg-[rgba(212,175,104,0.06)] text-[#a07830] group-hover:border-[rgba(212,175,104,0.5)] group-hover:text-[var(--dash-accent,#bf0603)] transition-all">
                              <PlayIcon />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="font-serif text-sm text-[#1c1a17] leading-tight truncate group-hover:text-[var(--dash-accent,#bf0603)] transition-colors">
                                {module.description || module.title || "Sacred Lecture"}
                              </h4>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[8px] font-bold text-[#b08840] uppercase tracking-widest">Module {module['title-order'] || 0}</span>
                                <span className="h-px w-3 bg-[rgba(212,175,104,0.2)]" />
                                <span className="text-[8px] font-bold text-[rgba(255,255,255,0.25)] uppercase tracking-widest">Chapter {module.order || 0}</span>
                              </div>
                            </div>
                            <ArrowIcon className="h-4 w-4 text-[rgba(212,175,104,0.3)] group-hover:text-[var(--dash-accent,#bf0603)] shrink-0 transition-all group-hover:translate-x-0.5" />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default EnrollCourse;
