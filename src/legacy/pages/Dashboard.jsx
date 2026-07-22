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
    <div className="flex min-h-screen flex-col bg-[#0c0b09] text-white">
      <div id="top-sentinel" className="pointer-events-none absolute left-0 top-0 -z-10 h-px w-full" />
      <Header />

      <div className="relative z-10 flex flex-1 gap-0 pt-16">
        <Aside />

        {/* ── Main Content ── */}
        <main className="min-w-0 flex-1 overflow-x-hidden px-4 py-6 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-5xl space-y-8 pb-12 pt-4">

            {/* ── Hero Welcome Banner ── */}
            <section className="relative isolate overflow-hidden rounded-2xl border border-[rgba(212,175,104,0.2)] bg-[#161412] shadow-[0_20px_70px_rgba(0,0,0,0.5)]">
              {/* Background radial glows */}
              <div className="pointer-events-none absolute inset-0 -z-10"
                style={{ background: "radial-gradient(circle at 80% 10%, rgba(140,60,30,0.22) 0%, transparent 40%), radial-gradient(circle at 5% 90%, rgba(100,12,18,0.3) 0%, transparent 38%), linear-gradient(135deg, #130808 0%, #1e0a0a 50%, #110707 100%)" }}
              />
              {/* Top gold line */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(212,175,104,0.5)] to-transparent" />
              {/* Bottom gold line */}
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(212,175,104,0.3)] to-transparent" />
              {/* Decorative rings */}
              <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full border border-[rgba(212,175,104,0.08)]" />
              <div className="pointer-events-none absolute -right-8 -top-8 h-44 w-44 rounded-full border border-[rgba(212,175,104,0.06)]" />

              <div className="grid items-center gap-8 px-6 py-8 sm:px-10 md:px-12 md:py-10 lg:grid-cols-[1fr_260px]">

                {/* Left: Greeting */}
                <div>
                  {/* Kicker */}
                  <div className="mb-5 flex items-center gap-3">
                    <span className="h-px w-8 bg-[rgba(212,175,104,0.7)]" />
                    <p className="text-[9px] font-bold uppercase tracking-[0.35em] text-[#d4af68]">
                      Your celestial learning space
                    </p>
                  </div>

                  {/* Title — reduced from 68px */}
                  <h1 className="font-serif leading-[1.08] text-[#fff8eb]" style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)" }}>
                    Welcome back,
                    <span className="mt-1 block italic text-[#d4af68]">{firstName}.</span>
                  </h1>

                  <p className="mt-4 max-w-xl text-sm leading-7 text-[rgba(255,255,255,0.5)]">
                    Continue your path of self-discovery, revisit your lessons and deepen your understanding of timeless astrological wisdom.
                  </p>

                  {/* CTA Buttons */}
                  <div className="mt-7 flex flex-wrap gap-3">
                    <Link
                      to="/enrolledcourse"
                      className="group inline-flex min-h-11 items-center gap-2.5 rounded border border-[rgba(212,175,104,0.55)] bg-[rgba(255,255,255,0.025)] px-6 text-[10px] font-extrabold uppercase tracking-[0.22em] text-[#f0d99d] transition duration-300 hover:-translate-y-0.5 hover:bg-[rgba(212,175,104,0.12)] hover:border-[rgba(212,175,104,0.8)] focus:outline-none focus:ring-2 focus:ring-[rgba(212,175,104,0.4)]"
                    >
                      Resume learning <ArrowIcon className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </Link>
                    <Link
                      to="/courses"
                      className="inline-flex min-h-11 items-center gap-2.5 rounded border border-white/10 bg-white/[0.03] px-6 text-[10px] font-extrabold uppercase tracking-[0.22em] text-white/60 transition duration-300 hover:-translate-y-0.5 hover:border-white/20 hover:text-white/90 focus:outline-none focus:ring-2 focus:ring-white/20"
                    >
                      Explore courses
                    </Link>
                  </div>
                </div>

                {/* Right: Stat Cards */}
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
                  {/* Enrolled count */}
                  <div className="rounded border border-[rgba(212,175,104,0.15)] bg-[rgba(255,255,255,0.03)] p-5 backdrop-blur-sm">
                    <div className="mb-3 flex h-9 w-9 items-center justify-center rounded border border-[rgba(212,175,104,0.25)] bg-[rgba(212,175,104,0.08)] text-[#d4af68]">
                      <BookIcon />
                    </div>
                    <p className="font-serif text-3xl text-[#fff7e9]">{loading ? "—" : String(totalEnrolled).padStart(2, "0")}</p>
                    <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.24em] text-[rgba(255,255,255,0.35)]">Enrolled courses</p>
                  </div>

                  {/* Status card */}
                  <div className="rounded border border-[rgba(212,175,104,0.15)] bg-[rgba(255,255,255,0.03)] p-5 backdrop-blur-sm">
                    <div className="mb-3 flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#82b879] shadow-[0_0_0_4px_rgba(130,184,121,0.15)]" />
                      <span className="text-[9px] font-bold uppercase tracking-[0.22em] text-[rgba(255,255,255,0.35)]">Active</span>
                    </div>
                    <p className="font-serif text-base text-[#fff7e9] leading-snug">Your journey<br/>awaits</p>
                    <p className="mt-2 text-[11px] leading-5 text-[rgba(255,255,255,0.35)]">Return anytime and pick up where you left off.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* ── Recent Enrollments ── */}
            <section aria-labelledby="recent-enrollments-title">
              {/* Section header */}
              <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <div className="mb-2 flex items-center gap-3">
                    <span className="h-px w-7 bg-[rgba(212,175,104,0.6)]" />
                    <p className="text-[9px] font-extrabold uppercase tracking-[0.3em] text-[#d4af68]">Continue your path</p>
                  </div>
                  <h2 id="recent-enrollments-title" className="font-serif text-2xl text-white sm:text-3xl">
                    Recent Enrollments
                  </h2>
                </div>
                <Link
                  to="/enrolledcourse"
                  className="group inline-flex w-fit items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.22em] text-[rgba(255,255,255,0.4)] transition hover:text-[#d4af68] focus:outline-none"
                >
                  View all <ArrowIcon className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>

              {/* Error */}
              {error && (
                <div role="alert" className="mb-5 rounded border border-[rgba(212,175,104,0.2)] bg-[rgba(212,175,104,0.05)] px-5 py-4 text-sm text-[#d4af68]">
                  {error}
                </div>
              )}

              {/* Cards Grid */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {loading ? (
                  [1, 2, 3].map((item) => (
                    <div key={item} className="overflow-hidden rounded border border-[rgba(212,175,104,0.12)] bg-[#1e1b17]">
                      <div className="aspect-[16/10] animate-pulse bg-[#252118]" />
                      <div className="space-y-3 p-5">
                        <div className="h-2.5 w-16 animate-pulse rounded bg-[#252118]" />
                        <div className="h-4 w-4/5 animate-pulse rounded bg-[#252118]" />
                      </div>
                    </div>
                  ))
                ) : courses.length > 0 ? (
                  courses.map((course, index) => (
                    <Link
                      to={`/course/${encodeURIComponent(course.name)}`}
                      key={course.name}
                      className="group relative overflow-hidden rounded border border-[rgba(212,175,104,0.15)] bg-[#1e1b17] shadow-[0_10px_35px_rgba(0,0,0,0.4)] transition duration-500 hover:-translate-y-1 hover:border-[rgba(212,175,104,0.4)] hover:shadow-[0_20px_55px_rgba(0,0,0,0.55)] focus:outline-none focus:ring-2 focus:ring-[rgba(212,175,104,0.3)]"
                    >
                      {/* Corner accents */}
                      <span className="pointer-events-none absolute left-2 top-2 z-20 h-4 w-4 border-l border-t border-[rgba(212,175,104,0.4)]" aria-hidden="true" />
                      <span className="pointer-events-none absolute bottom-2 right-2 z-20 h-4 w-4 border-b border-r border-[rgba(212,175,104,0.4)]" aria-hidden="true" />

                      {/* Image */}
                      <div className="relative aspect-[16/10] overflow-hidden bg-[#110f0d]">
                        <img
                          src={course.image}
                          alt=""
                          className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
                          loading="lazy"
                          decoding="async"
                          onError={(event) => {
                            event.currentTarget.onerror = null;
                            event.currentTarget.src = getFallbackImage(course.name);
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#1e1b17]/90 via-[#1e1b17]/20 to-transparent" />
                        <span className="absolute left-4 top-4 rounded-sm border border-[rgba(212,175,104,0.3)] bg-black/50 px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.25em] text-[#d4af68] backdrop-blur-sm">
                          Course {String(index + 1).padStart(2, "0")}
                        </span>
                      </div>

                      {/* Card body */}
                      <div className="flex items-center justify-between gap-4 p-5">
                        <div className="min-w-0">
                          <p className="mb-1.5 text-[8px] font-extrabold uppercase tracking-[0.28em] text-[rgba(212,175,104,0.7)]">Continue learning</p>
                          <h3 className="line-clamp-2 font-serif text-base leading-snug text-[#fff8eb] transition group-hover:text-[#d4af68]">
                            {course.name}
                          </h3>
                        </div>
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded border border-[rgba(212,175,104,0.25)] text-[rgba(212,175,104,0.6)] transition duration-300 group-hover:border-[rgba(212,175,104,0.7)] group-hover:bg-[rgba(212,175,104,0.1)] group-hover:text-[#d4af68]">
                          <ArrowIcon className="h-4 w-4" />
                        </span>
                      </div>
                    </Link>
                  ))
                ) : (
                  /* Empty state */
                  <div className="col-span-full rounded border border-dashed border-[rgba(212,175,104,0.2)] bg-[#131110] px-6 py-14 text-center sm:py-20">
                    <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded border border-[rgba(212,175,104,0.25)] bg-[rgba(212,175,104,0.06)] text-[#d4af68]">
                      <BookIcon />
                    </div>
                    <h3 className="font-serif text-xl text-white">Begin your first course</h3>
                    <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[rgba(255,255,255,0.4)]">
                      Your enrolled courses will appear here, ready for you whenever you return.
                    </p>
                    <Link
                      to="/courses"
                      className="mt-7 inline-flex min-h-11 items-center justify-center rounded border border-[rgba(212,175,104,0.5)] bg-[rgba(255,255,255,0.025)] px-7 text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#f0d99d] transition hover:-translate-y-0.5 hover:bg-[rgba(212,175,104,0.1)] focus:outline-none focus:ring-2 focus:ring-[rgba(212,175,104,0.3)]"
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
