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
      <div className="min-h-screen bg-[#f0ece4] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-2 border-[#e0d5c0] border-t-[#a07830] rounded-full animate-spin mx-auto" />
          <p className="text-[9px] font-bold uppercase tracking-[0.35em] text-[#a07830]">Loading course...</p>
        </div>
      </div>
    );
  }



  /**
   * -----------------------
   *  RENDER COMPONENT
   * -----------------------
   */
  return (
    <div className="flex min-h-screen flex-col bg-[#f0ece4]">
      <div id="top-sentinel" className="absolute top-0 left-0 w-full h-px pointer-events-none z-[-1]" />
      <Header />

      <div className="flex flex-1 relative z-10 pt-16 gap-0">
        <Aside />

        <main className="flex-1 min-w-0 py-6 px-4 md:px-10 overflow-x-hidden bg-[#f0ece4]">
          <div className="max-w-6xl mx-auto pt-4 space-y-8 pb-12">

            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#e0d5c0]">
              <div>
                <div className="mb-2 flex items-center gap-3">
                  <span className="h-px w-7 bg-[rgba(212,175,104,0.6)]" />
                  <p className="text-[9px] font-bold uppercase tracking-[0.35em] text-[#a07830]">Academic Portal</p>
                </div>
                <h1 className="font-serif text-2xl text-[#1c1a17]">{courseName}</h1>
              </div>
            </div>

            {/* Live Session Banner */}
            {meetings.length > 0 && (
              <Link to={`/${courseName}/meetings`} className="block">
                <div className="relative rounded border border-[rgba(130,184,121,0.25)] bg-[#0d1a0e] p-5 hover:border-[rgba(130,184,121,0.45)] transition-all group overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(130,184,121,0.4)] to-transparent" />
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="relative flex h-10 w-10 items-center justify-center rounded border border-[rgba(130,184,121,0.3)] bg-[rgba(130,184,121,0.08)]">
                        <span className="h-3 w-3 rounded-full bg-[#82b879] animate-ping absolute" />
                        <span className="h-2 w-2 rounded-full bg-[#82b879]" />
                      </div>
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-[#82b879]">Live Session Active</p>
                        <h4 className="font-serif text-base text-[#1c1a17]">Join the live session for {courseName}</h4>
                      </div>
                    </div>
                    <div className="rounded border border-[rgba(130,184,121,0.4)] bg-[rgba(130,184,121,0.08)] px-5 py-2.5 text-[9px] font-bold uppercase tracking-widest text-[#82b879] group-hover:bg-[rgba(130,184,121,0.15)] transition-all">
                      Join Room
                    </div>
                  </div>
                </div>
              </Link>
            )}




            {/* Upcoming EMI Payments */}
            {upcomingEMIs.length > 0 && (
              <div className="rounded border border-[#e0d5c0] bg-white overflow-hidden">
                <div className="flex items-center gap-3 px-5 py-4 bg-[#f5f0e6] border-b border-[#e0d5c0]">
                  <span className="h-px w-7 bg-[rgba(212,175,104,0.6)]" />
                  <h3 className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#d4af68]">Upcoming Payments</h3>
                </div>
                <div className="space-y-3 p-4">
                  {upcomingEMIs.map((emi, index) => (
                    <div key={index} className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 rounded border border-[#e5ddd0] bg-white gap-4 hover:border-[rgba(212,175,104,0.25)] transition-colors">
                      <div>
                        <p className="text-[8px] font-bold text-[#b08840] uppercase tracking-widest mb-1">EMI #{emi.emiNumber}</p>
                        <h4 className="font-serif text-sm text-[#1c1a17]">Payment for {emi.courseId}</h4>
                        <p className="text-[10px] text-[#7a6a52] mt-1">Due: <span className="font-bold text-[rgba(255,255,255,0.6)]">{emi.dueDate.toLocaleDateString()}</span></p>
                      </div>
                      <div className="flex items-center gap-5">
                        <div>
                          <p className={`text-[9px] font-bold uppercase tracking-widest ${emi.daysRemaining <= 3 ? "text-[rgba(255,180,100,0.8)]" : "text-[#7a6a52]"}`}>{emi.daysRemaining} days left</p>
                          <p className="font-serif text-lg text-[#1c1a17]">₹{emi.amountDue}</p>
                        </div>
                        <Link to="/finalize" className="inline-flex min-h-9 items-center rounded border border-[rgba(212,175,104,0.4)] bg-[rgba(255,255,255,0.025)] px-5 text-[9px] font-bold uppercase tracking-[0.2em] text-[#f0d99d] hover:bg-[rgba(212,175,104,0.1)] transition-all">
                          Pay Now
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}



            {/* COURSE VIDEOS */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-[#e0d5c0]">
                <div>
                  <div className="mb-1 flex items-center gap-3">
                    <span className="h-px w-7 bg-[rgba(212,175,104,0.6)]" />
                    <p className="text-[9px] font-bold uppercase tracking-[0.35em] text-[#a07830]">Course Content</p>
                  </div>
                  <h2 className="font-serif text-2xl text-[#1c1a17]">Course Videos</h2>
                </div>
              </div>
              {videos.length > 0 ? (
                Object.keys(groupedVideos).reverse().map((title, index) => {
                  return (
                   <div
  key={index}
  className="mb-8 overflow-hidden rounded-xl border border-[#e0d5c0] bg-[#161412] shadow-[0_10px_40px_rgba(0,0,0,0.4)]"
>
  {/* Section Header */}
  <div className="relative flex flex-col gap-4 overflow-hidden border-b border-[#e0d5c0] bg-[#110f0d] px-5 py-5 sm:px-7 md:flex-row md:items-center md:justify-between">
    <div className="pointer-events-none absolute -right-12 -top-20 h-48 w-48 rounded-full bg-[rgba(212,175,104,0.04)] blur-2xl" />

    <div className="relative flex min-w-0 items-center gap-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded border border-[rgba(212,175,104,0.25)] bg-[rgba(212,175,104,0.06)] text-[#d4af68]">
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7"
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      </div>
      <div className="min-w-0">
        <p className="mb-1 text-[9px] font-bold uppercase tracking-[0.28em] text-[#a07830]">Course Chapter</p>
        <h3 className="truncate font-serif text-lg text-[#1c1a17] md:text-xl">{title}</h3>
      </div>
    </div>

    {/* Navigation */}
    <div className="relative flex items-center gap-2 self-end md:self-auto">
      <button type="button" aria-label={`Previous videos in ${title}`}
        className={`swiper-prev-${index} flex h-10 w-10 items-center justify-center rounded border border-[rgba(212,175,104,0.25)] bg-[rgba(255,255,255,0.025)] text-[#a07830] transition-all duration-300 hover:border-[rgba(212,175,104,0.6)] hover:bg-[rgba(212,175,104,0.1)] hover:text-[#d4af68]`}>
        <FaChevronLeft className="h-3.5 w-3.5" />
      </button>
      <button type="button" aria-label={`Next videos in ${title}`}
        className={`swiper-next-${index} flex h-10 w-10 items-center justify-center rounded border border-[rgba(212,175,104,0.25)] bg-[rgba(255,255,255,0.025)] text-[#a07830] transition-all duration-300 hover:border-[rgba(212,175,104,0.6)] hover:bg-[rgba(212,175,104,0.1)] hover:text-[#d4af68]`}>
        <FaChevronRight className="h-3.5 w-3.5" />
      </button>
    </div>
  </div>

  {/* Videos Slider */}
  <div className="px-4 pb-8 pt-5 sm:px-6">
    <Swiper
      modules={[Navigation, Pagination]}
      navigation={{ prevEl: `.swiper-prev-${index}`, nextEl: `.swiper-next-${index}` }}
      pagination={{ clickable: true, dynamicBullets: true }}
      spaceBetween={16}
      slidesPerView={1}
      breakpoints={{ 640: { slidesPerView: 2, spaceBetween: 14 }, 1024: { slidesPerView: 3, spaceBetween: 16 }, 1280: { slidesPerView: 4, spaceBetween: 16 } }}
      className="w-full !pb-10"
    >
      {groupedVideos[title].map((video, videoIndex) => {
        const isWatched = watchedVideos.includes(video.id);
        return (
          <SwiperSlide key={video.id} className="h-auto">
            <article className="group flex h-full flex-col overflow-hidden rounded border border-[#e0d8cc] bg-white transition-all duration-500 hover:border-[#c9a55a] hover:shadow-[0_8px_24px_rgba(0,0,0,0.10)]">
              <Link to={`/course/${courseName}/video/${video.id}`} className="flex h-full flex-col">
                {/* Thumbnail */}
                <div className="relative aspect-video w-full overflow-hidden bg-[#0c0b09]">
                  {video.thumbnailUrl ? (
                    <img src={video.thumbnailUrl} alt={video.description || "Video thumbnail"}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  ) : (
                    <video src={video.url} className="h-full w-full object-cover" controlsList="nodownload"
                      onEnded={() => handleMarkAsWatched(video.id)} muted />
                  )}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#1e1b17]/80 via-transparent to-black/10" />
                  <span className="absolute left-3 top-3 rounded border border-[rgba(212,175,104,0.3)] bg-black/60 px-2 py-1 text-[8px] font-bold uppercase tracking-[0.18em] text-[#d4af68] backdrop-blur-sm">
                    Lesson {String(videoIndex + 1).padStart(2, "0")}
                  </span>
                  {isWatched && (
                    <span className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded border border-[rgba(130,184,121,0.4)] bg-[rgba(130,184,121,0.15)] px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.15em] text-[#82b879]">
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                      </svg>
                      Done
                    </span>
                  )}
                </div>
                {/* Card content */}
                <div className="flex flex-1 flex-col p-3">
                  <p className="line-clamp-2 font-serif text-sm leading-snug text-[#1c1a17] transition-colors group-hover:text-[#d4af68]">
                    {video.description || `Lesson ${videoIndex + 1}`}
                  </p>
                  <div className="mt-auto flex items-center justify-between border-t border-[rgba(212,175,104,0.1)] pt-3 mt-3">
                    <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-[#b08840]">
                      {isWatched ? "Completed" : "Start lesson"}
                    </span>
                    <span className="flex h-7 w-7 items-center justify-center rounded border border-[rgba(212,175,104,0.2)] text-[#b08840] transition-all duration-300 group-hover:border-[rgba(212,175,104,0.5)] group-hover:bg-[rgba(212,175,104,0.08)] group-hover:text-[#d4af68]">
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
                <div className="rounded border border-dashed border-[#d5c9b0] bg-white p-8 md:p-12 text-center max-w-2xl mx-auto space-y-5">
                  <div className="mx-auto w-16 h-16 rounded border border-[rgba(212,175,104,0.2)] bg-[rgba(212,175,104,0.06)] flex items-center justify-center text-[#d4af68]">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-serif text-xl text-[#1c1a17] mb-2">Wisdom Teachings Preparing</h3>
                    <p className="text-[#6b5a40] text-sm leading-relaxed">
                      We are preparing high-quality lessons for <span className="text-[#d4af68]">{courseName}</span>. They will be available very soon.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                    <Link to="/dashboard" className="inline-flex min-h-10 items-center justify-center rounded border border-[rgba(212,175,104,0.4)] bg-[rgba(255,255,255,0.025)] px-6 text-[9px] font-bold uppercase tracking-[0.2em] text-[#f0d99d] hover:bg-[rgba(212,175,104,0.1)] transition-all">
                      Back to Dashboard
                    </Link>
                    <Link to="/enrolledcourse" className="inline-flex min-h-10 items-center justify-center rounded border border-white/10 bg-white/[0.03] px-6 text-[9px] font-bold uppercase tracking-[0.2em] text-white/50 hover:text-white/80 hover:border-white/20 transition-all">
                      My Courses
                    </Link>
                  </div>
                </div>
              )}
            </div>



            {/* Q&A SECTION */}
            <section className="relative overflow-hidden rounded-xl border border-[#e0d5c0] bg-[#161412] shadow-[0_10px_40px_rgba(0,0,0,0.4)]">
  <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[rgba(212,175,104,0.04)] blur-3xl" />
  <div className="pointer-events-none absolute -bottom-24 -left-20 h-56 w-56 rounded-full bg-[rgba(212,175,104,0.03)] blur-3xl" />

  {/* Section header */}
  <div className="relative border-b border-[#e0d5c0] bg-[#110f0d] px-6 py-6 md:px-8 md:py-7">
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded border border-[rgba(212,175,104,0.25)] bg-[rgba(212,175,104,0.06)] text-[#d4af68]">
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
              d="M8.625 9.75a3.375 3.375 0 117.5 0 3.375 3.375 0 01-7.5 0zM3.375 19.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
          </svg>
        </div>
        <div>
          <p className="mb-1 text-[9px] font-bold uppercase tracking-[0.28em] text-[#a07830]">Community</p>
          <h3 className="font-serif text-lg text-[#1c1a17]">Questions & Answers</h3>
        </div>
      </div>
    </div>
  </div>

  <div className="relative z-10 p-6 md:p-8">
    <QandASection courseName={resolvedCourseId} />
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
