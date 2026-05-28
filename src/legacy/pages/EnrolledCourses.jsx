
import { Link, useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  doc,
  getDoc,
  collection,
  getDocs,
} from "firebase/firestore";
import { db } from "../../firebaseConfig";
import Aside from "./Aside";
import Header from "../../components/sections/Header/Header";
import Footer from "../../components/sections/Footer/Footer";
import { PieChart, Pie, Cell } from "recharts";
import defaultCourseImage from '../../assets/images/pages/courses/courses.webp'
import basicsImg from '../../assets/images/pages/courses/basics.webp'
import geetaImg from '../../assets/images/pages/courses/geeta.webp'
import naradImg from '../../assets/images/pages/courses/narad.webp'
import foundationImg from '../../assets/images/pages/courses/foundation.webp'

const getFallbackImage = (courseName) => {
    if (!courseName) return defaultCourseImage;
    const name = courseName.toLowerCase();
    if (name.includes('basic')) return basicsImg;
    if (name.includes('geeta')) return geetaImg;
    if (name.includes('narad')) return naradImg;
    if (name.includes('foundation')) return foundationImg;
    return defaultCourseImage;
};

const MiniPieChart = ({ usedDays, daysLeft }) => {
  const data = [
    { name: "Used", value: usedDays },
    { name: "Left", value: daysLeft },
  ];
  const COLORS = ["#f1f5f9", "#dd2727"];

  return (
    <PieChart width={40} height={40}>
      <Pie
        data={data}
        innerRadius={12}
        outerRadius={20}
        paddingAngle={0}
        dataKey="value"
        stroke="none"
      >
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
      </Pie>
    </PieChart>
  );
};

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
          name: courseName,
          type: "Free",
          enrolled: true,
          image: coursesMetadata[courseName] || getFallbackImage(courseName)
        })) || [];

        const paidCourses = data.DETAILS?.map((courseObj) => {
          const courseName = Object.keys(courseObj)[0];
          const details = courseObj[courseName];

          let daysLeft = 0;
          let usedDays = 0;
          let totalDays = 0;

          if (details.subscriptionDate && details.expiryDate) {
            const subDate = new Date(details.subscriptionDate);
            const expDate = new Date(details.expiryDate);
            const now = new Date();
            const totalTime = expDate.getTime() - subDate.getTime();
            totalDays = Math.floor(totalTime / (1000 * 3600 * 24));
            const usedTime = now.getTime() - subDate.getTime();
            usedDays = usedTime > 0 ? Math.floor(usedTime / (1000 * 3600 * 24)) : 0;
            const rawDaysLeft = totalDays - usedDays;
            daysLeft = rawDaysLeft < 0 ? 0 : rawDaysLeft;
          }

          return {
            name: courseName,
            type: "Paid",
            enrolled: true,
            daysLeft,
            usedDays,
            image: coursesMetadata[courseName] || getFallbackImage(courseName)
          };
        }) || [];

        const allCourses = [...freeCourses, ...paidCourses];
        setCourses(allCourses);

        const allVideosGrouped = {};
        for (const course of allCourses) {
          const videosRef = collection(db, `videos_${course.name}`);
          const videosSnapshot = await getDocs(videosRef);
          if (!videosSnapshot.empty) {
            allVideosGrouped[course.name] = videosSnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
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
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-brand-red border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300 font-medium tracking-wider animate-pulse uppercase">Syncing Cosmic Path...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-layout min-h-screen flex flex-col bg-slate-50">
      <Header />

      <div className="flex flex-1 relative z-10 pt-16 gap-0">
        <Aside />

        <main className="flex-1 min-w-0 py-[50px] px-[15px] md:px-[50px] bg-white overflow-x-hidden">
          <div className="max-w-7xl mx-auto space-y-10 pt-6">

            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
              <div>
                <h4 className="text-brand-red font-black uppercase tracking-[0.3em] text-[10px] mb-1">Academic Journey</h4>
                <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight uppercase">
                  My Enrolled <span className="text-brand-red">Courses</span>
                </h1>
              </div>
              <Link
                to="/courses"
                className="w-full sm:w-auto text-center bg-slate-900 text-white px-6 py-3 rounded-lg font-bold uppercase tracking-widest text-[10px] hover:bg-brand-red transition-all"
              >
                Browse Catalog
              </Link>
            </div>

            {courses.length === 0 ? (
              <div className="bg-slate-50 p-12 text-center rounded-xl border border-slate-100">
                <div className="text-4xl mb-6 opacity-40">🔭</div>
                <h3 className="text-2xl font-black text-slate-900 mb-4 uppercase tracking-tight">No Cosmic Paths Yet</h3>
                <p className="text-slate-500 font-medium mb-8 max-w-md mx-auto leading-relaxed">
                  You are not enrolled in any courses yet. Start your cosmic journey by exploring our sacred teachings.
                </p>
                <Link to="/courses" className="bg-brand-red text-white px-10 py-4 rounded-lg font-black uppercase tracking-widest text-[10px] hover:shadow-xl transition-all">
                  Browse Catalog
                </Link>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">

                {/* Desktop Table Header — hidden on mobile */}
                <div className="hidden md:grid grid-cols-12 gap-4 px-8 py-5 bg-slate-50/50 border-b border-slate-100">
                  <div className="col-span-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Course</div>
                  <div className="col-span-2 text-center text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Type</div>
                  <div className="col-span-2 text-center text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</div>
                  <div className="col-span-1 text-center text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Access</div>
                  <div className="col-span-2 text-right text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Action</div>
                </div>

                <div className="divide-y divide-slate-100">
                  {courses.map((course, index) => (
                    <div key={index}>

                      {/* Mobile Card */}
                      <div className="md:hidden p-4 flex items-start gap-4 hover:bg-slate-50/50 transition-all group">
                        <div className="w-20 h-16 rounded-lg overflow-hidden shrink-0 shadow border border-slate-100">
                          <img
                            src={course.image}
                            alt={course.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => { e.target.onerror = null; e.target.src = getFallbackImage(course.name); }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight leading-snug group-hover:text-brand-red transition-colors line-clamp-2">
                            {course.name}
                          </h3>
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[9px] font-black uppercase tracking-widest">
                              {course.type}
                            </span>
                            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-widest">
                              Active
                            </span>
                            {course.type === "Paid" ? (
                              <span className="text-[9px] font-black text-slate-500 uppercase">{course.daysLeft} days left</span>
                            ) : (
                              <span className="text-[9px] font-black text-slate-500 uppercase">Lifetime</span>
                            )}
                          </div>
                          <button
                            onClick={() => navigate(`/course/${encodeURIComponent(course.name)}`)}
                            className="mt-3 w-full py-2.5 bg-slate-900 text-white rounded-lg font-black uppercase tracking-[0.15em] text-[10px] hover:bg-brand-red transition-all"
                          >
                            Continue
                          </button>
                        </div>
                      </div>

                      {/* Desktop Row */}
                      <div className="hidden md:grid grid-cols-12 gap-4 px-8 py-7 items-center hover:bg-slate-50/30 transition-all group">
                        <div className="col-span-5 flex items-center gap-5">
                          <div className="w-20 h-14 rounded-xl overflow-hidden shrink-0 shadow border border-slate-100">
                            <img
                              src={course.image}
                              alt={course.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                              onError={(e) => { e.target.onerror = null; e.target.src = getFallbackImage(course.name); }}
                            />
                          </div>
                          <div>
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight group-hover:text-brand-red transition-colors">{course.name}</h3>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Student Enrolled</p>
                          </div>
                        </div>
                        <div className="col-span-2 flex justify-center">
                          <span className="px-4 py-1.5 rounded-full bg-slate-100 text-slate-600 text-[9px] font-black uppercase tracking-widest">{course.type}</span>
                        </div>
                        <div className="col-span-2 flex justify-center">
                          <span className="px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-widest">Active</span>
                        </div>
                        <div className="col-span-1 text-center">
                          {course.type === "Paid" ? (
                            <div className="flex flex-col">
                              <span className="text-xs font-black text-slate-900 uppercase tracking-tight">{course.daysLeft} Days</span>
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Remaining</span>
                            </div>
                          ) : (
                            <div className="flex flex-col">
                              <span className="text-xs font-black text-slate-900 uppercase tracking-tight">Lifetime</span>
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Access</span>
                            </div>
                          )}
                        </div>
                        <div className="col-span-2 flex justify-end">
                          <button
                            onClick={() => navigate(`/course/${encodeURIComponent(course.name)}`)}
                            className="px-8 py-3 bg-slate-900 text-white rounded-lg font-black uppercase tracking-[0.2em] text-[10px] hover:bg-brand-red transition-all shadow-lg hover:shadow-xl"
                          >
                            Continue
                          </button>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recorded Sessions */}
            <div className="space-y-8 pt-6">
              <div className="flex items-center gap-4">
                <div>
                  <h4 className="text-brand-red font-black uppercase tracking-[0.3em] text-[10px] mb-1">Vault</h4>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tight">
                    Recorded <span className="text-brand-red">Sessions</span>
                  </h2>
                </div>
                <div className="hidden md:block flex-1 h-px bg-slate-100 ml-4"></div>
              </div>

              {Object.entries(groupedVideos).length === 0 ? (
                <div className="bg-slate-50 p-12 text-center rounded-xl border border-dashed border-slate-200">
                  <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">No recorded sessions found in the archive yet.</p>
                </div>
              ) : (
                <div className="space-y-10">
                  {Object.entries(groupedVideos).map(([title, modules]) => (
                    <div key={title} className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-1 h-4 bg-brand-red rounded-full"></div>
                        <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.4em]">{title}</h3>
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {modules.map((module) => (
                          <div
                            key={module.id}
                            className="bg-white p-4 sm:p-6 rounded-xl border border-slate-100 shadow-sm group hover:border-brand-red hover:shadow-xl transition-all cursor-pointer flex items-center justify-between gap-4"
                            onClick={() => navigate(`/course/${encodeURIComponent(title)}/video/${module.id}`)}
                          >
                            <div className="flex items-center gap-4 min-w-0">
                              <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-brand-red group-hover:text-white transition-all duration-500 shrink-0">
                                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <div className="min-w-0">
                                <h4 className="font-black text-slate-900 tracking-tight leading-tight mb-1 truncate text-sm sm:text-base">
                                  {module.description || module.title || "Sacred Lecture"}
                                </h4>
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-[9px] font-black text-brand-red uppercase tracking-widest bg-red-50 px-2 py-0.5 rounded-md">
                                    Module {module['title-order'] || 0}
                                  </span>
                                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                    Chapter {module.order || 0}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="text-slate-200 group-hover:text-brand-red transition-colors shrink-0">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
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

