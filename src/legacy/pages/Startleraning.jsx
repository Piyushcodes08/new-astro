import React, { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
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
  const navigate = useNavigate();

  const [videos, setVideos] = useState([]);
  const [studyMaterials, setStudyMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [watchedVideos, setWatchedVideos] = useState([]);
  const [validityPercentage, setValidityPercentage] = useState("0");
  const [totalVideos, setTotalVideos] = useState(0);
  const [userEmail, setUserEmail] = useState(null);
  const [activeVideo, setActiveVideo] = useState(null);
  const [meetingUrl, setMeetingUrl] = useState("");
  const [meetings, setMeetings] = useState([]);
  const [iframeUrl, setIframeUrl] = useState('');
  const [showIframe, setShowIframe] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [courseType, setCourseType] = useState(null);
  const [groupedVideos, setGroupedVideos] = useState({});
  const [resolvedCourseId, setResolvedCourseId] = useState(courseName || "");
  const [upcomingEMIs, setUpcomingEMIs] = useState([]);
  const swiperNavRefs = useRef([]);


  const [formData, setFormData] = useState({
    profilePic: "",
    email: "NA",
  });

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
      setStudyMaterials([]);

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
        setTotalVideos(fetchedVideos.length);

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

        // Fetch Study Materials using dbCourseId
        const materialsRef = collection(db, `materials_${dbCourseId}`);
        const materialsSnapshot = await getDocs(materialsRef);
        const fetchedMaterials = materialsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setStudyMaterials(fetchedMaterials);

        // Check subscription details if user is logged in
        if (userEmail) {
          console.log("Fetching subscription for:", userEmail);
          const userSubscriptionRef = doc(db, "subscriptions", userEmail);
          const subscriptionSnapshot = await getDoc(userSubscriptionRef);

          if (subscriptionSnapshot.exists()) {
            const subscriptionData = subscriptionSnapshot.data();
            console.log("Subscription Data Found:", subscriptionData);

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


  useEffect(() => {
    const fetchMeetings = async () => {
      if (!resolvedCourseId) return;
      try {
        const snap = await getDocs(collection(db, 'meetings'));
        const allMeetings = snap.docs.map(d => ({ id: d.id, ...d.data() }));

        // Filter meeting by resolvedCourseId
        const courseMeeting = allMeetings.find(
          (m) => m.courseId === resolvedCourseId || m.courseId === courseName
        );

        if (courseMeeting && courseMeeting.viewerRoomUrl) {
          setMeetingUrl(courseMeeting.viewerRoomUrl);
        }
      } catch (err) {
        console.error('Error fetching meetings:', err);
      }
    };

    fetchMeetings();
  }, [resolvedCourseId, courseName]);

  const handleOpenPopup = (url) => {
    setIframeUrl(url);
    setShowIframe(true);
    setIsFullscreen(false);
    localStorage.setItem('liveMeeting', JSON.stringify({ url, isFullscreen: false }));
  };

  const handleClosePopup = () => {
    setShowIframe(false);
    setIframeUrl('');
    setIsFullscreen(false);
    localStorage.removeItem('liveMeeting');
  };

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
   *  MODULES COVERED
   * -----------------------
   */
  const calculateModulesCovered = () => {
    if (courseType === "free") return 0;
    if (!groupedVideos || !watchedVideos) return 0;

    let modulesCovered = 0;
    const moduleTitles = Object.keys(groupedVideos);

    moduleTitles.forEach((title) => {
      const videosInModule = groupedVideos[title];
      const totalVideosInModule = videosInModule.length;
      const watchedVideosInModule = videosInModule.filter((video) =>
        watchedVideos.includes(video.id)
      ).length;
      if (watchedVideosInModule === totalVideosInModule) {
        modulesCovered++;
      }
    });

    return modulesCovered;
  };

  const modulesCovered = calculateModulesCovered();
  const totalModules = Object.keys(groupedVideos).length;
  const modulesCoveredPercentage =
    totalModules > 0 ? Math.round((modulesCovered / totalModules) * 100) : 0;

  /**
   * -----------------------
   *  COURSE PROGRESS (VIDEOS)
   * -----------------------
   */
  const calculateWatchedPercentage = () => {
    if (courseType === "free") return 0;
    if (totalVideos === 0) return 0;
    return Math.round((watchedVideos.length / totalVideos) * 100);
  };
  const watchedPercentage = calculateWatchedPercentage();

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
        setUser(currentUser);
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
   *  JOIN LIVE SESSION
   * -----------------------
   */
  const handleRedirect = () => {
    if (meetings.length > 0) {
      const latestMeeting = meetings[meetings.length - 1];
      const url = latestMeeting.viewerRoomUrl || latestMeeting.ringCentralMeeting?.viewerRoomUrl;
      if (url && url.startsWith("http")) {
        setIframeUrl(url);
        setShowIframe(true);
      } else {
        alert("Valid meeting URL not found.");
      }
    } else {
      alert("No meeting found for this course.");
    }
  };




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
                <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">
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
                  // Initialize navigation refs
                  if (!swiperNavRefs.current[index]) {
                    swiperNavRefs.current[index] = {
                      prev: React.createRef(),
                      next: React.createRef(),
                    };
                  }

                  const { prev, next } = swiperNavRefs.current[index];

                  return (
                    <div key={index} className="mb-10 bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
                      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-50 border-b border-slate-200 px-6 py-5">
                        <div className="flex items-center gap-3">
                          <span className="w-1.5 h-10 bg-slate-900 rounded-full"></span>
                          <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{title}</h3>
                        </div>
                        <div className="flex items-center gap-3">
                          <button ref={prev} className="text-slate-900 w-11 h-11 bg-white border border-slate-200 rounded-full hover:bg-slate-100 transition-all shadow-sm">
                            <FaChevronLeft className="w-5 h-5" />
                          </button>
                          <button ref={next} className="text-slate-900 w-11 h-11 bg-white border border-slate-200 rounded-full hover:bg-slate-100 transition-all shadow-sm">
                            <FaChevronRight className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      <div className="px-4 py-6">
                        <Swiper
                          modules={[Navigation, Pagination]}
                          navigation={{
                            prevEl: prev.current,
                            nextEl: next.current,
                          }}
                          onBeforeInit={(swiper) => {
                            swiper.params.navigation.prevEl = prev.current;
                            swiper.params.navigation.nextEl = next.current;
                          }}
                          pagination={{ clickable: true, dynamicBullets: true }}
                          spaceBetween={20}
                          slidesPerView={1}
                          breakpoints={{
                            640: { slidesPerView: 2 },
                            1024: { slidesPerView: 3 },
                            1280: { slidesPerView: 4 },
                          }}
                          className="w-full"
                        >
                          {groupedVideos[title].map((video) => (
                            <SwiperSlide key={video.id} className="h-auto">
                              <div className="bg-slate-50 border border-slate-200 rounded overflow-hidden transition-all duration-300  h-full flex flex-col">
                                <Link to={`/course/${courseName}/video/${video.id}`} className="flex flex-col h-full">
                                  <div className="relative w-full aspect-video bg-black overflow-hidden">
                                    <video
                                      src={video.url}
                                      className="w-full h-full object-cover"
                                      controlsList="nodownload"
                                      onEnded={() => handleMarkAsWatched(video.id)}
                                      muted
                                    />
                                  </div>
                                  <div className="p-4 flex-1 flex flex-col">
                                    <p className="text-slate-900 font-bold text-sm line-clamp-2">
                                      {video.description}
                                    </p>
                                    {watchedVideos.includes(video.id) && (
                                      <span className="mt-auto pt-3 inline-flex items-center text-xs font-bold text-slate-700 uppercase tracking-wider">
                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                        Watched
                                      </span>
                                    )}
                                  </div>
                                </Link>
                              </div>
                            </SwiperSlide>
                          ))}
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
            <div className="mt-10 mb-8 p-10 bg-white border border-slate-200 rounded-3xl shadow-sm">
              <div className="flex items-center gap-4 mb-8">
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Cosmic Q&A</h2>
                <div className="flex-1 h-px bg-slate-100"></div>
              </div>
              <QandASection courseName={courseName} />
            </div>

          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default PersonalCourse;

