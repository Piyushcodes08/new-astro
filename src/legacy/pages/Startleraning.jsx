import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { PieChart } from "react-minimal-pie-chart";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "../../firebaseConfig";
import QandASection from "./QuestionAndAns"; // Your Q&A section component
import '@whereby.com/browser-sdk/embed';
import Draggable from 'react-draggable';
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation, Pagination } from "swiper/modules";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import Aside from '../pages/Aside'
import Header from "../../components/sections/Header/Header";
import Footer from "../../components/sections/Footer/Footer";

const PersonalCourse = () => {
  const { courseName } = useParams();

  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [watchedVideos, setWatchedVideos] = useState([]);
  const [validityPercentage, setValidityPercentage] = useState("0");
  const [userEmail, setUserEmail] = useState(null);
  const [meetings, setMeetings] = useState([]);
  const [courseType, setCourseType] = useState(null);
  const [groupedVideos, setGroupedVideos] = useState({});
  const [resolvedCourseId, setResolvedCourseId] = useState(courseName || "");
  const [upcomingEMIs, setUpcomingEMIs] = useState([]);

  const auth = getAuth();

  /**
   * -----------------------
   *  FETCH COURSE DATA
   * -----------------------
   */
  useEffect(() => {
    const fetchCourseData = async () => {
      setLoading(true);
      setVideos([]);

      try {
        // Resolve real database ID first!
        let dbCourseId = courseName;
        let cType = null;

        // Try to match in freeCourses
        const freeCoursesRef = collection(db, "freeCourses");
        const freeSnap = await getDocs(freeCoursesRef);
        const normalizedSearch = courseName.toLowerCase().replace(/[^a-z0-9]/g, "");

        let foundFree = freeSnap.docs.find(doc =>
          doc.id.toLowerCase().replace(/[^a-z0-9]/g, "") === normalizedSearch ||
          (doc.data().title || doc.data().Title || "").toLowerCase().replace(/[^a-z0-9]/g, "") === normalizedSearch
        );

        if (foundFree) {
          dbCourseId = foundFree.id;
          cType = "free";
        } else {
          // Try to match in paidCourses
          const paidCoursesRef = collection(db, "paidCourses");
          const paidSnap = await getDocs(paidCoursesRef);
          let foundPaid = paidSnap.docs.find(doc =>
            doc.id.toLowerCase().replace(/[^a-z0-9]/g, "") === normalizedSearch ||
            (doc.data().title || doc.data().Title || "").toLowerCase().replace(/[^a-z0-9]/g, "") === normalizedSearch ||
            ((normalizedSearch.includes("bhagwad") || normalizedSearch.includes("bhadvad") || normalizedSearch.includes("bhagavad")) &&
              (doc.id.toLowerCase().includes("geeta") || doc.id.toLowerCase().includes("gita")))
          );

          if (foundPaid) {
            dbCourseId = foundPaid.id;
            cType = "paid";
          }
        }

        setResolvedCourseId(dbCourseId);
        setCourseType(cType);

        // Fetch Videos using dbCourseId
        const videosRef = collection(db, `videos_${dbCourseId}`);
        const videosSnapshot = await getDocs(videosRef);
        const fetchedVideos = videosSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setVideos(fetchedVideos);

        // Group videos by `title` and sort them by `title-order` and `order`
        const grouped = {};
        const titleOrders = {};
        fetchedVideos.forEach((video) => {
          const title = video.title.trim();
          const titleOrder = video["title-order"] || 999;
          const videoOrder = video.order || 999;

          if (!grouped[title]) {
            grouped[title] = [];
            titleOrders[title] = titleOrder;
          }
          grouped[title].push({ ...video, videoOrder });
        });

        const sortedGroups = Object.keys(grouped)
          .sort((a, b) => titleOrders[a] - titleOrders[b])
          .reduce((acc, key) => {
            acc[key] = grouped[key].sort((a, b) => a.videoOrder - b.videoOrder);
            return acc;
          }, {});
        setGroupedVideos(sortedGroups);


        // Check subscription details if user is logged in
        if (userEmail) {
          console.log("Fetching subscription for:", userEmail);
          const userSubscriptionRef = doc(db, "subscriptions", userEmail);
          const subscriptionSnapshot = await getDoc(userSubscriptionRef);

          if (subscriptionSnapshot.exists()) {
            const subscriptionData = subscriptionSnapshot.data();
            // console.log("Subscription Data Found:", subscriptionData);

            if (cType === "free") {
              if (subscriptionData.freecourses?.includes(dbCourseId)) {
                setWatchedVideos([]);
                setValidityPercentage("Lifetime Access");
              }
            } else if (subscriptionData.DETAILS) {
              const courseDetails = subscriptionData.DETAILS.find(
                (detail) => Object.keys(detail)[0] === dbCourseId
              );

              if (courseDetails) {
                console.log("Course Details Found:", courseDetails);
                const courseInfo = courseDetails[dbCourseId];

                if (courseInfo.isFree) {
                  setValidityPercentage("Lifetime Access");
                } else {
                  let daysLeft = 0;
                  let totalDays = 0;

                  if (courseInfo.subscriptionDate && courseInfo.expiryDate) {
                    const subDate = new Date(courseInfo.subscriptionDate);
                    const expDate = new Date(courseInfo.expiryDate);
                    const now = new Date();

                    totalDays = Math.floor((expDate - subDate) / (1000 * 3600 * 24));
                    const remainingTime = expDate - now;
                    daysLeft = Math.ceil(remainingTime / (1000 * 3600 * 24));
                    daysLeft = daysLeft < 0 ? 0 : daysLeft;
                  }

                  if (totalDays > 0) {
                    const validityPercent = Math.max(0, Math.floor((daysLeft / totalDays) * 100));
                    setValidityPercentage(validityPercent.toString());
                  } else {
                    setValidityPercentage("0");
                  }
                }
                setWatchedVideos(courseInfo.watchedVideos || []);
              } else {
                console.warn("Course details NOT found in DETAILS array for:", dbCourseId);
              }
            }
          } else {
            console.warn("Subscription document does NOT exist for:", userEmail);
          }
        }
      } catch (error) {
        console.error("Error fetching course data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [courseName, userEmail]);


  /**
   * -----------------------
   *  FETCH EMI DETAILS
   * -----------------------
   */
  useEffect(() => {
    const fetchEMIDetails = async () => {
      if (!userEmail) return;

      try {
        const paymentsRef = collection(db, "payments");
        const q1 = query(paymentsRef, where("userId", "==", userEmail));
        const querySnapshot = await getDocs(q1);

        const emiDetails = [];

        for (const paymentDoc of querySnapshot.docs) {
          const paymentData = paymentDoc.data();

          // Get EMI plan details
          const emiPlanRef = doc(db, "emiPlans", paymentData.planId);
          const emiPlanSnap = await getDoc(emiPlanRef);

          if (emiPlanSnap.exists()) {
            const emiPlan = emiPlanSnap.data();
            const totalEMIs = emiPlan.duration;

            // Find latest paid EMI number
            const paidEMIs = await getDocs(
              query(
                collection(db, "payments"),
                where("userId", "==", userEmail),
                where("planId", "==", paymentData.planId),
                where("status", "==", "paid")
              )
            );

            const nextEMINumber = paidEMIs.size + 1;

            if (nextEMINumber <= totalEMIs) {
              // Calculate due date (example: monthly payments)
              const lastPaymentDate =
                paymentData.timestamp?.toDate() || new Date();
              const dueDate = new Date(lastPaymentDate);
              dueDate.setMonth(dueDate.getMonth() + (nextEMINumber - 1));

              // Calculate days remaining
              const today = new Date();
              const timeDiff = dueDate.getTime() - today.getTime();
              const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));

              emiDetails.push({
                courseId: paymentData.courseId,
                emiNumber: nextEMINumber,
                dueDate,
                daysRemaining: daysRemaining > 0 ? daysRemaining : 0,
                amountDue: emiPlan.amount,
                planId: paymentData.planId,
              });
            }
          }
        }

        // Sort by days remaining ascending
        setUpcomingEMIs(emiDetails.sort((a, b) => a.daysRemaining - b.daysRemaining));
      } catch (error) {
        console.error("Error fetching EMI details:", error);
      }
    };

    fetchEMIDetails();
  }, [userEmail]);

  /**
   * -----------------------
   *  SUBSCRIPTION VALIDITY
   * -----------------------
   */
  const SubscriptionValidity = () => {
    if (courseType === "free") {
      // For free courses, no subscription validity chart
      return null;
    }

    return (
      <div className="bg-slate-50 p-4 rounded-3xl shadow-sm w-72 h-auto border border-slate-200">
        <h3 className="text-lg font-semibold text-center text-slate-900 mb-2">
          Subscription Validity
        </h3>
        {typeof validityPercentage === "string" &&
          validityPercentage === "Lifetime Access" ? (
          <p className="text-center text-xl text-slate-900">Lifetime Access</p>
        ) : validityPercentage === "0" ? (
          <p className="text-center text-xl text-slate-900">Expired</p>
        ) : (
          <div>
            <PieChart
              data={[
                {
                  title: "Remaining",
                  value: parseInt(validityPercentage) || 0,
                  color: "#0f172a",
                },
                {
                  title: "Expired",
                  value: 100 - (parseInt(validityPercentage) || 0),
                  color: "#e2e8f0",
                },
              ]}
              lineWidth={20}
              rounded
              animate
            />
            <p className="text-center mt-2 text-slate-700">
              {validityPercentage || 0}% Validity Remaining
            </p>
          </div>
        )}
      </div>
    );
  };

  /**
   * -----------------------
   *  REAL-TIME WATCHED VIDEOS
   * -----------------------
   */
  useEffect(() => {
    if (!userEmail || courseType === "free" || !resolvedCourseId) return;

    const userSubscriptionRef = doc(db, "subscriptions", userEmail);
    const unsubscribe = onSnapshot(userSubscriptionRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const subscriptionData = docSnapshot.data();
        const courseDetails = subscriptionData.DETAILS.find(

          (detail) => Object.keys(detail)[0] === resolvedCourseId

        );
        if (courseDetails) {
          const watchedVideosList = courseDetails[resolvedCourseId].watchedVideos || [];
          setWatchedVideos(watchedVideosList);
        }
      }
    });
    return () => unsubscribe();
  }, [resolvedCourseId, userEmail, courseType]);

  /**
   * -----------------------
   *  MARK VIDEO AS WATCHED
   * -----------------------
   */
  const handleMarkAsWatched = async (videoId) => {
    if (!userEmail || courseType === "free" || !resolvedCourseId) return;

    try {
      const userSubscriptionRef = doc(db, "subscriptions", userEmail);
      const subscriptionSnapshot = await getDoc(userSubscriptionRef);

      if (subscriptionSnapshot.exists()) {
        const subscriptionData = subscriptionSnapshot.data();
        const courseDetails = subscriptionData.DETAILS.find(
          (detail) => Object.keys(detail)[0] === resolvedCourseId
        );
        if (courseDetails) {
          const updatedWatchedVideos = courseDetails[resolvedCourseId].watchedVideos || [];
          if (!updatedWatchedVideos.includes(videoId)) {
            updatedWatchedVideos.push(videoId);

            const updatedDetails = subscriptionData.DETAILS.map((detail) => {
              const courseKey = Object.keys(detail)[0];
              if (courseKey === resolvedCourseId) {
                return {
                  [courseKey]: {
                    ...detail[courseKey],
                    watchedVideos: updatedWatchedVideos,
                  },
                };
              }
              return detail;
            });

            await updateDoc(userSubscriptionRef, { DETAILS: updatedDetails });
            setWatchedVideos(updatedWatchedVideos);
          }
        }
      }
    } catch (error) {
      console.error("Error updating watched videos:", error);
    }
  };

  /**
   * -----------------------
   *  TRACK LOGGED-IN USER
   * -----------------------
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUserEmail(currentUser.email);
      }
    });
    return () => unsubscribe();
  }, [auth]);

  /**
   * -----------------------
   *  FETCH LATEST MEETING
   * -----------------------
   */
  useEffect(() => {
    const fetchMeetings = async () => {
      if (!resolvedCourseId) return;
      try {
        const meetingsRef = collection(db, 'meetings');
        const q = query(meetingsRef, where('courseId', '==', resolvedCourseId));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const meetingDocs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setMeetings(meetingDocs);
        } else {
          setMeetings([]);
        }
      } catch (err) {
        console.error('Error fetching meetings:', err);
      }
    };

    if (resolvedCourseId) {
      fetchMeetings();
    }
  }, [resolvedCourseId]);

  /**
   * -----------------------
   *  LOADING STATE
   * -----------------------
   */
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-red-500"></div>
      </div>
    );
  }



  /**
   * -----------------------
   *  RENDER COMPONENT
   * -----------------------
   */
  return (
    <div className="admin-layout min-h-screen flex flex-col">
      <div id="top-sentinel" className="absolute top-0 left-0 w-full h-px pointer-events-none z-[-1]" />
      <Header />

      <div className="flex flex-1 relative z-10 pt-16 gap-0">
        <Aside />

        <main className="flex-1 min-w-0 py-10 px-4 md:px-10 bg-slate-100">
          <div className="max-w-7xl mx-auto pt-8 space-y-10">

            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200 pb-8 mb-10">
              <div>
                <h4 className="text-slate-500 font-black uppercase tracking-[0.3em] text-[10px] mb-2">Academic Portal</h4>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">
                  <span className="text-slate-900">{courseName}</span>
                </h1>
              </div>
            </div>

            {/* Live Session Marquee */}
            {meetings.length > 0 && (
              <Link to={`/${courseName}/meetings`} className="block mb-8">
                <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm hover:shadow-md transition-all">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center">
                        <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Live Session Active</p>
                        <h4 className="font-bold text-lg text-slate-900">Join the live session for {courseName}</h4>
                      </div>
                    </div>
                    <div className="bg-slate-900 text-white px-5 py-2.5 rounded-2xl font-black uppercase tracking-widest text-[10px]">Join Room</div>
                  </div>
                </div>
              </Link>
            )}






            {/* Upcoming EMI Payments */}
            {upcomingEMIs.length > 0 && (
              <div className="mb-8 bg-white border border-slate-200 p-8 rounded-3xl shadow-sm">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6">Upcoming Payments</h3>
                <div className="space-y-4">
                  {upcomingEMIs.map((emi, index) => (
                    <div key={index} className="flex flex-col md:flex-row justify-between items-start md:items-center p-5 bg-slate-50 border border-slate-200 rounded-3xl gap-6">
                      <div>
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">EMI #{emi.emiNumber}</p>
                        <h4 className="font-bold text-slate-800">Payment for {emi.courseId}</h4>
                        <p className="text-xs text-slate-500 mt-1">Due: <span className="font-bold text-slate-700">{emi.dueDate.toLocaleDateString()}</span></p>
                      </div>
                      <div className="flex items-center gap-6">
                        <div>
                          <p className={`text-xs font-black uppercase tracking-widest ${emi.daysRemaining <= 3 ? "text-slate-700" : "text-slate-500"}`}>{emi.daysRemaining} days left</p>
                          <p className="text-xl font-black text-slate-900">₹{emi.amountDue}</p>
                        </div>
                        <Link to="/finalize" className="bg-slate-900 text-white px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-800 transition-all">Pay Now</Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}



            {/* COURSE VIDEOS */}
            <div className="mt-10 mb-10">
              <div className="flex items-center gap-4 mb-8">
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Course Videos</h2>
                <div className="flex-1 h-px bg-slate-200"></div>
              </div>
              {videos.length > 0 ? (
                Object.keys(groupedVideos).reverse().map((title, index) => {
                  return (
                   <div
  key={index}
  className="mb-10 overflow-hidden rounded-xl border border-[#dbc9a3]/80 bg-[#fffdf8] shadow-[0_24px_70px_-35px_rgba(50,40,25,0.45)]"
>
  {/* Section Header */}
  <div className="relative flex flex-col gap-5 overflow-hidden border-b border-[#e8ddc7] bg-[#f8f2e7] px-5 py-5 sm:px-7 md:flex-row md:items-center md:justify-between">
    {/* Decorative background */}
    <div className="pointer-events-none absolute -right-12 -top-20 h-48 w-48 rounded-full bg-[#c3a25d]/10 blur-2xl" />

    <div className="relative flex min-w-0 items-center gap-4">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#d5bd89] bg-[#fffaf0] shadow-sm">
        <svg
          className="h-5 w-5 text-[#96712d]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.7"
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      </div>

      <div className="min-w-0">
        <p className="mb-1 text-[9px] font-bold uppercase tracking-[0.28em] text-[#a17b32]">
          Course Chapter
        </p>

        <h3 className="truncate font-serif text-xl font-semibold text-[#29251f] md:text-2xl">
          {title}
        </h3>
      </div>
    </div>

    {/* Navigation */}
    <div className="relative flex items-center gap-2 self-end md:self-auto">
      <button
        type="button"
        aria-label={`Previous videos in ${title}`}
        className={`swiper-prev-${index} flex h-11 w-11 items-center justify-center rounded-full border border-[#d8c49b] bg-[#fffdf8] text-[#66573c] shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[#27382f] hover:bg-[#27382f] hover:text-white`}
      >
        <FaChevronLeft className="h-4 w-4" />
      </button>

      <button
        type="button"
        aria-label={`Next videos in ${title}`}
        className={`swiper-next-${index} flex h-11 w-11 items-center justify-center rounded-full border border-[#d8c49b] bg-[#fffdf8] text-[#66573c] shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[#27382f] hover:bg-[#27382f] hover:text-white`}
      >
        <FaChevronRight className="h-4 w-4" />
      </button>
    </div>
  </div>

  {/* Videos Slider */}
  <div className="px-4 pb-8 pt-6 sm:px-6">
    <Swiper
      modules={[Navigation, Pagination]}
      navigation={{
        prevEl: `.swiper-prev-${index}`,
        nextEl: `.swiper-next-${index}`,
      }}
      pagination={{
        clickable: true,
        dynamicBullets: true,
      }}
      spaceBetween={20}
      slidesPerView={1}
      breakpoints={{
        640: {
          slidesPerView: 2,
          spaceBetween: 18,
        },
        1024: {
          slidesPerView: 3,
          spaceBetween: 20,
        },
        1280: {
          slidesPerView: 4,
          spaceBetween: 22,
        },
      }}
      className="w-full !pb-10"
    >
      {groupedVideos[title].map((video, videoIndex) => {
        const isWatched = watchedVideos.includes(video.id);

        return (
          <SwiperSlide key={video.id} className="h-auto">
            <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-[#e4d9c4] bg-[#faf6ee] transition-all duration-500  hover:border-[#cdb57e] hover:shadow-[0_20px_45px_-25px_rgba(47,38,24,0.55)]">
              <Link
                to={`/course/${courseName}/video/${video.id}`}
                className="flex h-full flex-col"
              >
                {/* Thumbnail */}
                <div className="relative aspect-video w-full overflow-hidden bg-[#1e2924]">
                  {video.thumbnailUrl ? (
                    <img
                      src={video.thumbnailUrl}
                      alt={video.description || "Video thumbnail"}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <video
                      src={video.url}
                      className="h-full w-full object-cover"
                      controlsList="nodownload"
                      onEnded={() => handleMarkAsWatched(video.id)}
                      muted
                    />
                  )}

                  {/* Premium overlay */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#17231e]/70 via-transparent to-black/5" />

                  {/* Lesson number */}
                  <span className="absolute left-3 top-3 rounded-full border border-white/20 bg-[#19251f]/75 px-2 py-1 text-[8px] font-bold uppercase tracking-[0.18em] text-[#f5dfac] backdrop-blur-md">
                    Lesson {String(videoIndex + 1).padStart(2, "0")}
                  </span>

              

                  {isWatched && (
                    <span className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-[#72876d] px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.15em] text-white shadow-md">
                      <svg
                        className="h-3.5 w-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2.5"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Completed
                    </span>
                  )}
                </div>

                {/* Card content */}
                <div className="flex flex-1 flex-col p-2">
                  <p className="line-clamp-2 font-serif text-[15px] font-semibold leading-6 text-[#302b23] transition-colors group-hover:text-[#876522]">
                    {video.description || `Lesson ${videoIndex + 1}`}
                  </p>

                  <div className="mt-auto flex items-center justify-between border-t border-[#e8dfcf] pt-4">
                    <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#8e8069]">
                      {isWatched ? "Completed" : "Start lesson"}
                    </span>

                    <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#d8c49b] text-[#96712d] transition-all duration-300 group-hover:border-[#27382f] group-hover:bg-[#27382f] group-hover:text-white">
                      <FaChevronRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              </Link>
            </article>
          </SwiperSlide>
        );
      })}
    </Swiper>
  </div>
</div>
                  );
                })
              ) : (
                <div className="bg-white border border-slate-200 rounded-3xl p-8 md:p-12 text-center max-w-2xl mx-auto shadow-sm my-10 space-y-6">
                  <div className="mx-auto w-20 h-20 rounded-full bg-red-50 flex items-center justify-center text-[#bf0603] animate-pulse">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Wisdom Teachings Preparing</h3>
                    <p className="text-slate-500 text-sm md:text-base leading-relaxed">
                      We are currently preparing and curating the high-quality lessons and materials for <strong className="text-slate-900">{courseName}</strong>.
                      They will be uploaded by our spiritual guides very soon.
                    </p>
                  </div>
                  <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
                    <Link to="/dashboard" className="bg-slate-900 text-white px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-800 transition-all shadow-sm">
                      Back to Dashboard
                    </Link>
                    <Link to="/enrolledcourse" className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all shadow-sm">
                      My Courses
                    </Link>
                  </div>
                </div>
              )}
            </div>



            {/* Q&A SECTION */}
            <section className="relative mb-10 mt-12 overflow-hidden rounded-[30px] border border-[#dccba9]/80 bg-[#fffdf8] shadow-[0_28px_75px_-40px_rgba(50,40,25,0.55)]">
  {/* Decorative background */}
  <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[#c6a45d]/10 blur-3xl" />
  <div className="pointer-events-none absolute -bottom-28 -left-24 h-64 w-64 rounded-full bg-[#26352e]/5 blur-3xl" />

  {/* Section header */}
  <div className="relative border-b border-[#e8ddc8] bg-[#f8f2e7] px-6 py-7 md:px-10 md:py-9">
    <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-4">
        {/* Premium icon */}
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-[#d5bd89] bg-[#fffaf0] text-[#96712d] shadow-sm">
          <svg
            className="h-7 w-7"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M8.625 9.75a3.375 3.375 0 116.75 0c0 2.25-3.375 2.25-3.375 4.5m0 3h.008M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="h-px w-6 bg-[#aa8435]" />

            <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#9a772d]">
              Student Guidance
            </p>
          </div>

          <h2 className="font-serif text-3xl font-semibold tracking-tight text-[#29251f] md:text-4xl">
            Cosmic Q&amp;A
          </h2>
        </div>
      </div>

      {/* Header information */}
      <div className="max-w-md md:text-right">
        <p className="text-sm leading-6 text-[#746a59]">
          Ask thoughtful questions, explore course concepts and receive
          guidance throughout your learning journey.
        </p>
      </div>
    </div>
  </div>

  {/* Q&A content */}
  <div className="relative px-5 py-7 sm:px-7 md:px-10 md:py-10">
    {/* Inner premium frame */}
    <div className="rounded-2xl border border-[#e7ddca] bg-[#faf7f0] p-4 shadow-inner sm:p-6 md:p-8">
      <QandASection courseName={courseName} />
    </div>
  </div>

  {/* Bottom decorative line */}
  <div className="relative flex items-center justify-center pb-7">
    <div className="h-px w-16 bg-[#d2b777]" />

    <span className="mx-3 h-1.5 w-1.5 rotate-45 bg-[#aa8435]" />

    <div className="h-px w-16 bg-[#d2b777]" />
  </div>
</section>

          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default PersonalCourse;

