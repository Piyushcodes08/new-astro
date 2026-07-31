import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, collection, getDocs, updateDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import Aside from "./Aside";
import Footer from "../../components/sections/Footer/Footer";

import defaultCourseImage from "../../assets/images/pages/courses/courses.webp";
import basicsImg from "../../assets/images/pages/courses/basics.webp";
import geetaImg from "../../assets/images/pages/courses/geeta.webp";
import naradImg from "../../assets/images/pages/courses/narad.webp";
import foundationImg from "../../assets/images/pages/courses/foundation.webp";

const getFallbackImage = (courseName) => {
  if (!courseName) return defaultCourseImage;
  const name = courseName.toLowerCase();
  if (name.includes("basic")) return basicsImg;
  if (name.includes("geeta")) return geetaImg;
  if (name.includes("narad")) return naradImg;
  if (name.includes("foundation")) return foundationImg;
  return defaultCourseImage;
};

const TrashIcon = ({ className = "h-5 w-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const RestoreIcon = ({ className = "h-4 w-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const ArrowIcon = ({ className = "h-4 w-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M5 12h14m-5-5 5 5-5 5" />
  </svg>
);

export default function UserTrashCourses() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [trashedCourses, setTrashedCourses] = useState([]);
  const [actionLoading, setActionLoading] = useState(null);
  const navigate = useNavigate();
  const auth = getAuth();

  const fetchTrashedCourses = async (email) => {
    try {
      setLoading(true);
      const docRef = doc(db, "subscriptions", email);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        const courseTypes = ["freeCourses", "paidCourses"];
        const coursesMetadata = {};

        for (const type of courseTypes) {
          const coursesSnap = await getDocs(collection(db, type));
          coursesSnap.forEach((courseDoc) => {
            const courseData = courseDoc.data();
            const courseName = courseData.Title || courseData.title;
            if (courseName) {
              coursesMetadata[courseName] =
                courseData.imageUrl ||
                courseData.image ||
                courseData.thumbnail ||
                courseData.courseImage ||
                courseData.imgUrl ||
                "";
            }
          });
        }

        const freeTrashed =
          data.trashed_freecourses?.map((courseName) => ({
            name: courseName,
            type: "Free",
            image: coursesMetadata[courseName] || getFallbackImage(courseName),
          })) || [];

        const paidTrashed =
          data.trashed_DETAILS?.map((courseObj) => {
            const courseName = Object.keys(courseObj)[0];
            return {
              name: courseName,
              type: "Paid",
              detailsObj: courseObj,
              image: coursesMetadata[courseName] || getFallbackImage(courseName),
            };
          }) || [];

        setTrashedCourses([...freeTrashed, ...paidTrashed]);
      }
    } catch (error) {
      console.error("Error fetching trashed courses:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await fetchTrashedCourses(currentUser.email);
      } else {
        navigate("/login");
      }
    });
    return () => unsubscribe();
  }, [auth, navigate]);

  // Restore course back to active list
  const handleRestore = async (course) => {
    if (!user?.email) return;
    if (!window.confirm(`Restore "${course.name}" back to your enrolled courses?`)) return;

    setActionLoading(course.name);
    try {
      const docRef = doc(db, "subscriptions", user.email);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();

        if (course.type === "Free") {
          const currentFree = data.freecourses || [];
          const updatedFree = currentFree.includes(course.name)
            ? currentFree
            : [...currentFree, course.name];

          const currentTrashedFree = data.trashed_freecourses || [];
          const updatedTrashedFree = currentTrashedFree.filter((n) => n !== course.name);

          await updateDoc(docRef, {
            freecourses: updatedFree,
            trashed_freecourses: updatedTrashedFree,
          });
        } else {
          // Paid course
          const currentDetails = data.DETAILS || [];
          const targetDetail = course.detailsObj;

          const updatedDetails = targetDetail
            ? [
                ...currentDetails.filter(
                  (item) => !(item && typeof item === "object" && Object.keys(item)[0] === course.name)
                ),
                targetDetail,
              ]
            : currentDetails;

          const currentTrashedDetails = data.trashed_DETAILS || [];
          const updatedTrashedDetails = currentTrashedDetails.filter(
            (item) => !(item && typeof item === "object" && Object.keys(item)[0] === course.name)
          );

          await updateDoc(docRef, {
            DETAILS: updatedDetails,
            trashed_DETAILS: updatedTrashedDetails,
          });
        }

        setTrashedCourses((prev) => prev.filter((c) => c.name !== course.name));
      }
    } catch (err) {
      console.error("Error restoring course:", err);
      alert("Failed to restore course. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  // Delete course permanently
  const handleDeletePermanently = async (course) => {
    if (!user?.email) return;
    if (
      !window.confirm(
        `Permanently delete "${course.name}"? You will need to re-enroll to access it again.`
      )
    )
      return;

    setActionLoading(course.name);
    try {
      const docRef = doc(db, "subscriptions", user.email);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();

        if (course.type === "Free") {
          const currentTrashedFree = data.trashed_freecourses || [];
          const updatedTrashedFree = currentTrashedFree.filter((n) => n !== course.name);

          await updateDoc(docRef, {
            trashed_freecourses: updatedTrashedFree,
          });
        } else {
          const currentTrashedDetails = data.trashed_DETAILS || [];
          const updatedTrashedDetails = currentTrashedDetails.filter(
            (item) => !(item && typeof item === "object" && Object.keys(item)[0] === course.name)
          );

          await updateDoc(docRef, {
            trashed_DETAILS: updatedTrashedDetails,
          });
        }

        setTrashedCourses((prev) => prev.filter((c) => c.name !== course.name));
      }
    } catch (err) {
      console.error("Error permanently deleting course:", err);
      alert("Failed to delete course permanently. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-2 border-[#e0d5c0] border-t-[#bf0603] rounded-full animate-spin mx-auto" />
          <p className="text-[9px] font-bold uppercase tracking-[0.35em] text-[#bf0603]">
            Loading Trash...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex min-h-screen flex-col"
      style={{ backgroundColor: "var(--dash-bg, #f8fafc)" }}
    >
      <div className="flex flex-1 relative z-10 gap-0">
        <Aside />
        <main className="flex-1 min-w-0 py-6 pt-16 sm:pt-6 px-4 sm:px-6 lg:px-10 overflow-x-hidden">
          <div className="max-w-5xl mx-auto space-y-8 pb-12 pt-4">
            {/* ── Page Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[rgba(0,0,0,0.08)]">
              <div>
                <div className="mb-2 flex items-center gap-3">
                  <span
                    className="h-px w-7"
                    style={{ background: "var(--dash-accent,#bf0603)" }}
                  />
                  <p className="text-[9px] font-bold uppercase tracking-[0.35em] text-[#bf0603]">
                    Trash Vault
                  </p>
                </div>
                <h1 className="font-serif text-2xl sm:text-3xl text-[#1c1a17]">
                  Course Trash
                </h1>
              </div>
              <Link
                to="/enrolledcourse"
                className="inline-flex min-h-10 items-center gap-2 rounded border border-[rgba(212,175,104,0.4)] bg-[rgba(255,255,255,0.025)] px-5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#b08840] transition hover:-translate-y-0.5 hover:border-[rgba(212,175,104,0.7)]"
              >
                Back to Enrolled Courses <ArrowIcon className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* ── Empty Trash State ── */}
            {trashedCourses.length === 0 ? (
              <div className="rounded border border-dashed border-[#d5c9b0] bg-white px-6 py-16 text-center">
                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded border border-gray-200 bg-gray-50 text-gray-400">
                  <TrashIcon />
                </div>
                <h3 className="font-serif text-xl text-[#1c1a17] mb-2">Your Trash is Empty</h3>
                <p className="text-[#6b5a40] text-sm max-w-md mx-auto mb-8 leading-relaxed">
                  No trashed courses found. Any course you delete from your enrolled list will show up here.
                </p>
                <Link
                  to="/enrolledcourse"
                  className="inline-flex min-h-10 items-center rounded border border-[#bf0603] bg-[#bf0603] px-7 text-[10px] font-bold uppercase tracking-[0.2em] text-white transition hover:opacity-90"
                >
                  View Enrolled Courses
                </Link>
              </div>
            ) : (
              /* ── Trashed Courses Table ── */
              <div className="rounded border border-[#e0d5c0] overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.04)] bg-white">
                {/* Desktop Header */}
                <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-[#f5f0e6] border-b border-[rgba(0,0,0,0.08)]">
                  <div className="col-span-6 text-[9px] font-bold uppercase tracking-[0.25em] text-[#b08840]">
                    Course
                  </div>
                  <div className="col-span-2 text-center text-[9px] font-bold uppercase tracking-[0.25em] text-[#b08840]">
                    Type
                  </div>
                  <div className="col-span-4 text-right text-[9px] font-bold uppercase tracking-[0.25em] text-[#b08840]">
                    Actions
                  </div>
                </div>

                <div className="divide-y divide-[#ede7db]">
                  {trashedCourses.map((course, index) => (
                    <div key={index}>
                      {/* Mobile Card */}
                      <div className="md:hidden p-4 flex items-start gap-4 hover:bg-[#faf6ee] transition-all">
                        <div className="relative w-20 h-16 rounded overflow-hidden shrink-0 border border-[#e0d5c0]">
                          <img
                            src={course.image}
                            alt={course.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = getFallbackImage(course.name);
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-serif text-[#1c1a17] leading-snug line-clamp-2">
                            {course.name}
                          </h3>
                          <span className="inline-block px-2 py-0.5 mt-1.5 rounded border border-[#c9a55a]/40 bg-[#fdf7ec] text-[#8a6520] text-[8px] font-bold uppercase tracking-widest">
                            {course.type}
                          </span>

                          <div className="flex items-center gap-2 mt-3">
                            <button
                              onClick={() => handleRestore(course)}
                              disabled={actionLoading === course.name}
                              className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded bg-emerald-600 text-white font-bold uppercase tracking-[0.15em] text-[9px] hover:bg-emerald-700 transition-all"
                            >
                              <RestoreIcon className="h-3.5 w-3.5" /> Restore
                            </button>
                            <button
                              onClick={() => handleDeletePermanently(course)}
                              disabled={actionLoading === course.name}
                              className="px-3 py-2 rounded border border-red-200 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all text-[9px] font-bold uppercase tracking-[0.1em]"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Desktop Row */}
                      <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-5 items-center hover:bg-[#faf6ee] transition-all">
                        <div className="col-span-6 flex items-center gap-4">
                          <div
                            className="relative rounded overflow-hidden shrink-0 border border-[#e0d5c0]"
                            style={{ width: "72px", height: "48px" }}
                          >
                            <img
                              src={course.image}
                              alt={course.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = getFallbackImage(course.name);
                              }}
                            />
                          </div>
                          <div>
                            <h3 className="text-sm font-serif text-[#1c1a17]">
                              {course.name}
                            </h3>
                            <p className="text-[9px] text-red-600 font-bold uppercase tracking-widest mt-0.5">
                              Trashed
                            </p>
                          </div>
                        </div>

                        <div className="col-span-2 flex justify-center">
                          <span className="px-3 py-1 rounded border border-[#c9a55a]/40 bg-[#fdf7ec] text-[#8a6520] text-[9px] font-bold uppercase tracking-widest">
                            {course.type}
                          </span>
                        </div>

                        <div className="col-span-4 flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleRestore(course)}
                            disabled={actionLoading === course.name}
                            className="inline-flex items-center gap-1.5 min-h-9 px-4 rounded bg-emerald-600 text-white font-bold uppercase tracking-[0.18em] text-[9px] hover:bg-emerald-700 transition-all shadow-sm"
                          >
                            <RestoreIcon className="h-3.5 w-3.5" /> Restore
                          </button>
                          <button
                            onClick={() => handleDeletePermanently(course)}
                            disabled={actionLoading === course.name}
                            className="inline-flex items-center gap-1.5 min-h-9 px-4 rounded border border-red-200 bg-red-50 text-red-600 font-bold uppercase tracking-[0.18em] text-[9px] hover:bg-red-600 hover:text-white transition-all"
                          >
                            <TrashIcon className="h-3.5 w-3.5" /> Delete Permanently
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
