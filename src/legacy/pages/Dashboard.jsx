import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";

import Aside from "./Aside";
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

// Helper: get text color (dark vs light) based on bg
const isLight = (hex = "#ffffff") => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 128;
};

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
      if (!currentUser?.email) { setCourses([]); setTotalEnrolled(0); setLoading(false); return; }
      setLoading(true);
      try {
        const [subscriptionSnap, freeSnap, paidSnap] = await Promise.all([
          getDoc(doc(db, "subscriptions", currentUser.email)),
          getDocs(collection(db, "freeCourses")),
          getDocs(collection(db, "paidCourses")),
        ]);
        if (!active) return;
        if (!subscriptionSnap.exists()) { setCourses([]); setTotalEnrolled(0); return; }
        const meta = {};
        [freeSnap, paidSnap].forEach(snap => snap.forEach(d => {
          const data = d.data();
          const title = data.Title || data.title;
          if (title) meta[title] = data.imageUrl || data.image || data.thumbnail || data.courseImage || data.imgUrl || "";
        }));
        const sub = subscriptionSnap.data();
        const paidNames = Array.isArray(sub.DETAILS)
          ? sub.DETAILS.flatMap(item => item && typeof item === "object" ? Object.keys(item) : []) : [];
        const names = [...new Set([...(Array.isArray(sub.freecourses) ? sub.freecourses : []), ...paidNames].filter(Boolean))];
        setTotalEnrolled(names.length);
        setCourses(names.slice(0, 3).map(name => ({ name, image: meta[name] || getFallbackImage(name) })));
      } catch (e) {
        if (active) { setError("Could not load your courses. Please refresh."); setCourses([]); setTotalEnrolled(0); }
      } finally {
        if (active) setLoading(false);
      }
    });
    return () => { active = false; unsubscribe(); };
  }, []);

  const firstName = user?.displayName?.trim().split(/\s+/)[0] || "Seeker";

  return (
    <div className="flex min-h-screen flex-col" style={{ backgroundColor: "var(--dash-bg, #f8fafc)" }}>
      <div className="relative z-10 flex flex-1 gap-0">
        <Aside />

        <main className="min-w-0 flex-1 overflow-x-hidden px-4 py-6 sm:px-6 lg:px-10
                         pt-16 sm:pt-6">
          <div className="mx-auto max-w-5xl space-y-6 pb-12 pt-2 sm:pt-4">

            {/* ── Hero Banner — uses sidebar accent color ── */}
            <section
              className="relative overflow-hidden rounded-xl shadow-[0_4px_28px_rgba(0,0,0,0.14)]"
              style={{ background: "var(--dash-sidebar-bg, #bf0603)", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full border border-white/10" />
              <div className="absolute top-0 left-0 right-0 h-px bg-white/20" />

              <div className="grid items-center gap-8 px-6 py-8 sm:px-10 md:py-10 lg:grid-cols-[1fr_250px]">
                {/* Greeting */}
                <div>
                  <div className="mb-4 flex items-center gap-3">
                    <span className="h-px w-8 bg-white/40" />
                    <p className="text-[9px] font-bold uppercase tracking-[0.35em] text-white/70">Your celestial learning space</p>
                  </div>
                  <h1 className="font-serif text-white leading-tight" style={{ fontSize: "clamp(1.7rem, 3vw, 2.4rem)" }}>
                    Welcome back,
                    <span className="mt-1 block italic text-white/80">{firstName}.</span>
                  </h1>
                  <p className="mt-4 max-w-lg text-sm leading-7 text-white/65">
                    Continue your path of self-discovery and deepen your understanding of timeless astrological wisdom.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link to="/enrolledcourse"
                      className="group inline-flex min-h-10 items-center gap-2 rounded px-5 text-[10px] font-bold uppercase tracking-[0.22em] text-white transition hover:-translate-y-0.5"
                      style={{ background: "rgba(255,255,255,0.22)", border: "1px solid rgba(255,255,255,0.38)" }}
                    >
                      Resume learning <ArrowIcon className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </Link>
                    <Link to="/courses"
                      className="inline-flex min-h-10 items-center rounded px-5 text-[10px] font-bold uppercase tracking-[0.22em] text-white/75 transition hover:text-white"
                      style={{ background: "rgba(0,0,0,0.12)", border: "1px solid rgba(255,255,255,0.18)" }}
                    >
                      Explore courses
                    </Link>
                  </div>
                </div>

                {/* Stat cards */}
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
                  <div className="rounded p-4" style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)" }}>
                    <div className="mb-3 flex h-9 w-9 items-center justify-center rounded text-white" style={{ background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.3)" }}>
                      <BookIcon />
                    </div>
                    <p className="font-serif text-3xl text-white">{loading ? "—" : String(totalEnrolled).padStart(2, "0")}</p>
                    <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.24em] text-white/60">Enrolled courses</p>
                  </div>
                  <div className="rounded p-4" style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)" }}>
                    <div className="mb-3 flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-green-300 shadow-[0_0_0_4px_rgba(134,239,172,0.2)]" />
                      <span className="text-[9px] font-bold uppercase tracking-widest text-white/60">Active</span>
                    </div>
                    <p className="font-serif text-sm text-white leading-snug">Your journey<br />awaits</p>
                    <p className="mt-2 text-[11px] leading-5 text-white/55">Pick up where you left off.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* ── Recent Enrollments ── */}
            <section aria-labelledby="recent-enrollments-title">
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <div className="mb-1.5 flex items-center gap-3">
                    <span className="h-px w-7" style={{ background: "var(--dash-accent, #bf0603)" }} />
                    <p className="text-[9px] font-bold uppercase tracking-[0.3em]" style={{ color: "var(--dash-accent, #bf0603)" }}>Continue your path</p>
                  </div>
                  <h2 id="recent-enrollments-title" className="font-serif text-2xl sm:text-3xl" style={{ color: "var(--dash-accent, #bf0603)" }}>
                    Recent Enrollments
                  </h2>
                </div>
                <Link to="/enrolledcourse"
                  className="group inline-flex w-fit items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] transition"
                  style={{ color: "var(--dash-accent, #bf0603)" }}
                >
                  View all <ArrowIcon className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>

              {error && (
                <div role="alert" className="mb-5 rounded border px-5 py-4 text-sm" style={{ borderColor: "var(--dash-accent, #bf0603)", color: "var(--dash-accent, #bf0603)", background: "rgba(0,0,0,0.03)" }}>
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {loading ? (
                  [1, 2, 3].map(i => (
                    <div key={i} className="overflow-hidden rounded-lg border" style={{ background: "var(--dash-card, #ffffff)", borderColor: "rgba(0,0,0,0.08)" }}>
                      <div className="aspect-16/10 animate-pulse" style={{ background: "rgba(0,0,0,0.06)" }} />
                      <div className="space-y-3 p-5">
                        <div className="h-2.5 w-16 animate-pulse rounded" style={{ background: "rgba(0,0,0,0.06)" }} />
                        <div className="h-4 w-4/5 animate-pulse rounded" style={{ background: "rgba(0,0,0,0.06)" }} />
                      </div>
                    </div>
                  ))
                ) : courses.length > 0 ? (
                  courses.map((course, index) => (
                    <Link
                      to={`/course/${encodeURIComponent(course.name)}`}
                      key={course.name}
                      className="group relative overflow-hidden rounded-lg transition duration-300 hover:-translate-y-1 focus:outline-none"
                      style={{ background: "var(--dash-card, #ffffff)", border: "1px solid rgba(0,0,0,0.09)", boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}
                      onMouseEnter={e => e.currentTarget.style.boxShadow = "0 8px 28px rgba(0,0,0,0.14)"}
                      onMouseLeave={e => e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.07)"}
                    >
                      {/* Top accent bar */}
                      <div className="h-1 w-full" style={{ background: "var(--dash-accent, #bf0603)" }} />

                      {/* Image */}
                      <div className="relative aspect-16/10 overflow-hidden" style={{ background: "rgba(0,0,0,0.06)" }}>
                        <img
                          src={course.image} alt=""
                          className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
                          loading="lazy" decoding="async"
                          onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = getFallbackImage(course.name); }}
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent" />
                        <span
                          className="absolute left-3 top-3 rounded px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.25em] text-white backdrop-blur-sm"
                          style={{ background: "var(--dash-accent, #bf0603)" }}
                        >
                          Course {String(index + 1).padStart(2, "0")}
                        </span>
                      </div>

                      {/* Card body */}
                      <div className="flex items-center justify-between gap-4 p-4">
                        <div className="min-w-0">
                          <p className="mb-1 text-[8px] font-bold uppercase tracking-[0.28em]" style={{ color: "var(--dash-accent, #bf0603)" }}>
                            Continue learning
                          </p>
                          <h3 className="line-clamp-2 font-serif text-base leading-snug text-gray-800 transition group-hover:opacity-80">
                            {course.name}
                          </h3>
                        </div>
                        <span
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded border text-white transition duration-300"
                          style={{ background: "var(--dash-accent, #bf0603)", borderColor: "var(--dash-accent, #bf0603)" }}
                        >
                          <ArrowIcon className="h-4 w-4" />
                        </span>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="col-span-full rounded-lg border border-dashed px-6 py-14 text-center" style={{ background: "var(--dash-card, #ffffff)", borderColor: "rgba(0,0,0,0.12)" }}>
                    <div
                      className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-lg text-white"
                      style={{ background: "var(--dash-accent, #bf0603)" }}
                    >
                      <BookIcon />
                    </div>
                    <h3 className="font-serif text-xl text-gray-800">Begin your first course</h3>
                    <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-gray-500">
                      Your enrolled courses will appear here, ready for you whenever you return.
                    </p>
                    <Link to="/courses"
                      className="mt-7 inline-flex min-h-11 items-center justify-center rounded px-7 text-[10px] font-bold uppercase tracking-[0.2em] text-white transition hover:opacity-90"
                      style={{ background: "var(--dash-accent, #bf0603)" }}
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
