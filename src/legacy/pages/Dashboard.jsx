import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";

import Aside from "./Aside";
import Header from "../../components/sections/Header/Header";
import Footer from "../../components/sections/Footer/Footer";
import { db } from "../../firebaseConfig";

import defaultCourseImage from "../../assets/images/pages/courses/courses.webp";
import basicsImg from "../../assets/images/pages/courses/basics.webp";
import geetaImg from "../../assets/images/pages/courses/geeta.webp";
import naradImg from "../../assets/images/pages/courses/narad.webp";
import foundationImg from "../../assets/images/pages/courses/foundation.webp";

const getFallbackImage = (courseName = "") => {
  const name = courseName.toLowerCase();
  if (name.includes("basic")) return basicsImg;
  if (name.includes("geeta")) return geetaImg;
  if (name.includes("narad")) return naradImg;
  if (name.includes("foundation")) return foundationImg;
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

export default function Dashboard() {
  const auth = getAuth();
  const [courses, setCourses] = useState([]);
  const [totalEnrolled, setTotalEnrolled] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    let active = true;

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!active) return;
      setUser(currentUser);
      setError("");

      if (!currentUser?.email) {
        setCourses([]);
        setTotalEnrolled(0);
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const [subscriptionSnap, freeCoursesSnap, paidCoursesSnap] = await Promise.all([
          getDoc(doc(db, "subscriptions", currentUser.email)),
          getDocs(collection(db, "freeCourses")),
          getDocs(collection(db, "paidCourses")),
        ]);

        if (!active) return;

        if (!subscriptionSnap.exists()) {
          setCourses([]);
          setTotalEnrolled(0);
          return;
        }

        const metadata = {};
        [freeCoursesSnap, paidCoursesSnap].forEach((snapshot) => {
          snapshot.forEach((courseDoc) => {
            const data = courseDoc.data();
            const title = data.Title || data.title;
            if (title) {
              metadata[title] =
                data.imageUrl || data.image || data.thumbnail || data.courseImage || data.imgUrl || "";
            }
          });
        });

        const subscription = subscriptionSnap.data();
        const paidCourseNames = Array.isArray(subscription.DETAILS)
          ? subscription.DETAILS.flatMap((item) =>
              item && typeof item === "object" ? Object.keys(item) : []
            )
          : [];

        const enrolledNames = [
          ...(Array.isArray(subscription.freecourses) ? subscription.freecourses : []),
          ...paidCourseNames,
        ].filter(Boolean);

        const uniqueNames = [...new Set(enrolledNames)];
        setTotalEnrolled(uniqueNames.length);
        setCourses(
          uniqueNames.slice(0, 3).map((name) => ({
            name,
            image: metadata[name] || getFallbackImage(name),
          }))
        );
      } catch (fetchError) {
        console.error("Dashboard data error:", fetchError);
        if (active) {
          setError("We could not load your learning journey. Please refresh and try again.");
          setCourses([]);
          setTotalEnrolled(0);
        }
      } finally {
        if (active) setLoading(false);
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const firstName = user?.displayName?.trim().split(/\s+/)[0] || "Seeker";

  return (
    <div className="admin-layout flex min-h-screen flex-col bg-[#f4efe7] text-[#221512]">
      <div id="top-sentinel" className="pointer-events-none absolute left-0 top-0 -z-10 h-px w-full" />
      <Header />

      <div className="relative z-10 flex flex-1 gap-0 pt-16">
        <Aside />

        <main className="min-w-0 flex-1 overflow-x-hidden bg-[#f4efe7] px-4 py-6 sm:px-6 lg:px-10 xl:px-14">
          <div className="mx-auto max-w-[1440px] space-y-8 pb-10 pt-3 md:space-y-10 md:pt-6">
            <section className="relative isolate overflow-hidden rounded-[28px] border border-[#d6b56f]/25 bg-[#160909] px-6 py-10 shadow-[0_30px_90px_rgba(52,15,13,0.22)] sm:px-10 md:rounded-[36px] md:px-14 md:py-14 lg:px-16">
              <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_80%_10%,rgba(168,83,45,0.28),transparent_34%),radial-gradient(circle_at_8%_90%,rgba(117,16,23,0.42),transparent_36%),linear-gradient(135deg,#130808_0%,#260d0e_52%,#110807_100%)]" />
              <div className="absolute -right-24 -top-28 -z-10 h-80 w-80 rounded-full border border-[#e5c27b]/10" />
              <div className="absolute -right-10 -top-16 -z-10 h-56 w-56 rounded-full border border-[#e5c27b]/10" />
              <div className="absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-[#d6b56f]/65 to-transparent" />

              <div className="grid items-end gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
                <div className="max-w-3xl">
                  <div className="mb-6 flex items-center gap-3">
                    <span className="h-px w-9 bg-[#d7b66f]" />
                    <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-[#e0c17e] sm:text-xs">
                      Your celestial learning space
                    </p>
                  </div>

                  <h1 className="font-serif text-4xl leading-[1.05] text-[#fff8eb] sm:text-5xl md:text-6xl lg:text-[68px]">
                    Welcome back,
                    <span className="mt-1 block italic text-[#d9b66c]">{firstName}.</span>
                  </h1>

                  <p className="mt-6 max-w-2xl text-sm leading-7 text-[#d8ccc0] sm:text-base">
                    Continue your path of self-discovery, revisit your lessons and deepen your understanding of timeless astrological wisdom.
                  </p>

                  <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <Link
                      to="/enrolledcourse"
                      className="group inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-[#d5b36b] px-7 text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#24110d] transition duration-300 hover:-translate-y-0.5 hover:bg-[#ecd08d] hover:shadow-[0_14px_35px_rgba(213,179,107,0.22)] focus:outline-none focus:ring-2 focus:ring-[#f0d99f] focus:ring-offset-2 focus:ring-offset-[#160909]"
                    >
                      Resume learning <ArrowIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                    <Link
                      to="/courses"
                      className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#d9b970]/35 bg-white/[0.04] px-7 text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#fff8eb] backdrop-blur-sm transition duration-300 hover:-translate-y-0.5 hover:border-[#d9b970]/70 hover:bg-white/[0.08] focus:outline-none focus:ring-2 focus:ring-[#d9b970]"
                    >
                      Explore courses
                    </Link>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
                  <div className="rounded-2xl border border-[#d8b971]/20 bg-white/[0.055] p-5 backdrop-blur-md">
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full border border-[#d8b971]/30 bg-[#d8b971]/10 text-[#e4c57f]">
                      <BookIcon />
                    </div>
                    <p className="font-serif text-3xl text-[#fff7e9]">{loading ? "—" : String(totalEnrolled).padStart(2, "0")}</p>
                    <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.24em] text-[#bbaa99]">Enrolled courses</p>
                  </div>
                  <div className="rounded-2xl border border-[#d8b971]/20 bg-white/[0.055] p-5 backdrop-blur-md">
                    <div className="mb-4 flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#82b879] shadow-[0_0_0_5px_rgba(130,184,121,0.12)]" />
                      <span className="text-[9px] font-bold uppercase tracking-[0.22em] text-[#bbaa99]">Connection active</span>
                    </div>
                    <p className="font-serif text-xl text-[#fff7e9]">Your journey awaits</p>
                    <p className="mt-2 text-xs leading-5 text-[#bbaa99]">Return anytime and continue from your enrolled course.</p>
                  </div>
                </div>
              </div>
            </section>

            <section aria-labelledby="recent-enrollments-title">
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <div className="mb-2 flex items-center gap-3">
                    <span className="h-px w-8 bg-[#8e302d]" />
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.3em] text-[#8e302d]">Continue your path</p>
                  </div>
                  <h2 id="recent-enrollments-title" className="font-serif text-3xl text-[#281714] sm:text-4xl">
                    Recent enrollments
                  </h2>
                </div>
                <Link
                  to="/enrolledcourse"
                  className="group inline-flex w-fit items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.22em] text-[#6f5b53] transition hover:text-[#8e302d] focus:outline-none focus:ring-2 focus:ring-[#8e302d]/30"
                >
                  View all <ArrowIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>

              {error && (
                <div role="alert" className="mb-5 rounded-2xl border border-[#a43c37]/20 bg-[#fff8f2] px-5 py-4 text-sm text-[#8b302c]">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {loading ? (
                  [1, 2, 3].map((item) => (
                    <div key={item} className="overflow-hidden rounded-[24px] border border-[#cfbfae]/60 bg-[#fbf8f2]">
                      <div className="aspect-[16/10] animate-pulse bg-[#e8dfd3]" />
                      <div className="space-y-3 p-6">
                        <div className="h-3 w-20 animate-pulse rounded bg-[#e8dfd3]" />
                        <div className="h-5 w-4/5 animate-pulse rounded bg-[#e8dfd3]" />
                      </div>
                    </div>
                  ))
                ) : courses.length > 0 ? (
                  courses.map((course, index) => (
                    <Link
                      to={`/course/${encodeURIComponent(course.name)}`}
                      key={course.name}
                      className="group relative overflow-hidden rounded-[24px] border border-[#cdbca8]/70 bg-[#fffdf8] shadow-[0_12px_40px_rgba(66,37,29,0.07)] transition duration-500 hover:-translate-y-1.5 hover:border-[#b3894c]/70 hover:shadow-[0_24px_60px_rgba(66,37,29,0.14)] focus:outline-none focus:ring-2 focus:ring-[#9b433d]/40"
                    >
                      <div className="relative aspect-[16/10] overflow-hidden bg-[#20100e]">
                        <img
                          src={course.image}
                          alt=""
                          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                          loading="lazy"
                          decoding="async"
                          onError={(event) => {
                            event.currentTarget.onerror = null;
                            event.currentTarget.src = getFallbackImage(course.name);
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#160909]/80 via-transparent to-transparent" />
                        <span className="absolute left-5 top-5 rounded-full border border-white/20 bg-[#160909]/65 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.22em] text-[#f4ddb0] backdrop-blur-md">
                          Course {String(index + 1).padStart(2, "0")}
                        </span>
                      </div>
                      <div className="flex min-h-[132px] items-center justify-between gap-5 p-6">
                        <div>
                          <p className="mb-2 text-[9px] font-extrabold uppercase tracking-[0.24em] text-[#9a443d]">Continue learning</p>
                          <h3 className="line-clamp-2 font-serif text-xl leading-snug text-[#2a1815] transition group-hover:text-[#852a28]">
                            {course.name}
                          </h3>
                        </div>
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#cbb89d] text-[#7f302c] transition duration-300 group-hover:border-[#8e302d] group-hover:bg-[#8e302d] group-hover:text-white">
                          <ArrowIcon />
                        </span>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="col-span-full rounded-[28px] border border-dashed border-[#bda98f] bg-[#fbf8f2] px-6 py-14 text-center sm:py-20">
                    <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-[#c6ae88] bg-[#f4ead9] text-[#8c3a34]">
                      <BookIcon />
                    </div>
                    <h3 className="font-serif text-2xl text-[#2a1815]">Begin your first course</h3>
                    <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#78665e]">
                      Your enrolled courses will appear here, ready for you whenever you return.
                    </p>
                    <Link
                      to="/courses"
                      className="mt-7 inline-flex min-h-11 items-center justify-center rounded-full bg-[#7f2928] px-7 text-[10px] font-extrabold uppercase tracking-[0.2em] text-white transition hover:-translate-y-0.5 hover:bg-[#651e1f] focus:outline-none focus:ring-2 focus:ring-[#7f2928]/40"
                    >
                      Explore courses
                    </Link>
                  </div>
                )}
              </div>
            </section>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}