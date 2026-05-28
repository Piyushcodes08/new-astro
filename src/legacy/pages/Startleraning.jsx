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

  console.log(meetings)
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
      <div className="bg-red-100 p-4 rounded-lg shadow-md w-72 h-auto">
        <h3 className="text-lg font-semibold text-center text-red-600 mb-2">
          Subscription Validity
        </h3>
        {typeof validityPercentage === "string" &&
          validityPercentage === "Lifetime Access" ? (
          <p className="text-center text-xl text-red-700">Lifetime Access</p>
        ) : validityPercentage === "0" ? (
          <p className="text-center text-xl text-red-700">Expired</p>
        ) : (
          <div>
            <PieChart
              data={[
                {
                  title: "Remaining",
                  value: parseInt(validityPercentage) || 0,
                  color: "#FF5252",
                },
                {
                  title: "Expired",
                  value: 100 - (parseInt(validityPercentage) || 0),
                  color: "#fcfafa",
                },
              ]}
              lineWidth={20}
              rounded
              animate
            />
            <p className="text-center mt-2 text-red-700">
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
        console.log(subscriptionData)
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
  console.log(meetings)
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
   *  NO DATA
   * -----------------------
   */
  if (!videos.length && !studyMaterials.length) {
    return (
      <div className="text-center mt-10 text-red-500">
        No data found for <strong>{courseName}</strong>.
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

        <main className="flex-1 min-w-0 py-10 px-[15px] md:px-[50px] bg-white">
          <div className="max-w-7xl mx-auto pt-8">

            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200 pb-8 mb-10">
              <div>
                <h4 className="text-[#dd2727] font-black uppercase tracking-[0.3em] text-[10px] mb-2">Academic Portal</h4>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">
                  <span className="text-[#dd2727]">{courseName}</span>
                </h1>
              </div>
            </div>

            {/* Live Session Marquee */}
            {meetings.length > 0 && (
              <Link to={`/${courseName}/meetings`} className="block mb-8">
                <div className="bg-gradient-to-r from-[#dd2727] to-[#f43f5e] p-5 rounded-2xl text-white shadow-lg shadow-red-200 flex items-center justify-between hover:scale-[1.01] transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                      <span className="w-3 h-3 rounded-full bg-white animate-ping"></span>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Live Session Active</p>
                      <h4 className="font-bold text-lg">Join the sacred live session for {courseName}</h4>
                    </div>
                  </div>
                  <div className="bg-white text-[#dd2727] px-6 py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] hidden md:block">Join Room</div>
                </div>
              </Link>
            )}






            {/* Upcoming EMI Payments */}
            {upcomingEMIs.length > 0 && (
              <div className="mb-8 admin-card border-l-4 border-l-amber-500 bg-amber-50/30 p-8">
                <h3 className="text-sm font-black text-amber-800 uppercase tracking-widest mb-6 flex items-center gap-3">
                  <span>⚠</span> Upcoming EMI Payments
                </h3>
                <div className="space-y-4">
                  {upcomingEMIs.map((emi, index) => (
                    <div key={index} className="flex flex-col md:flex-row justify-between items-start md:items-center p-5 bg-white border border-amber-100 rounded-2xl gap-6">
                      <div>
                        <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest mb-1">EMI #{emi.emiNumber}</p>
                        <h4 className="font-bold text-slate-800">Payment for {emi.courseId}</h4>
                        <p className="text-xs text-slate-500 mt-1">Due: <span className="font-bold text-slate-700">{emi.dueDate.toLocaleDateString()}</span></p>
                      </div>
                      <div className="flex items-center gap-6">
                        <div>
                          <p className={`text-xs font-black uppercase tracking-widest ${emi.daysRemaining <= 3 ? "text-red-600" : "text-amber-600"}`}>{emi.daysRemaining} days left</p>
                          <p className="text-xl font-black text-slate-900">₹{emi.amountDue}</p>
                        </div>
                        <Link to="/finalize" className="bg-amber-500 text-white px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-amber-600 transition-all">Pay Now</Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Top Row: Validity, Progress, Modules, Study Materials */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              {/* Subscription Status Card */}
              <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col items-center justify-between text-center min-h-[280px]">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6">Subscription</h3>
                <div className="flex-1 flex flex-col items-center justify-center">
                  {validityPercentage === "Lifetime Access" ? (
                    <>
                      <div className="text-4xl mb-4">♾️</div>
                      <p className="text-sm font-black text-slate-900 uppercase tracking-widest">Lifetime Access</p>
                    </>
                  ) : (validityPercentage === "0" || !validityPercentage) ? (
                    <>
                      <div className="text-4xl mb-4">⌛</div>
                      <p className="text-xl font-black text-red-600 uppercase tracking-widest">Expired</p>
                    </>
                  ) : (
                    <>
                      <div className="relative w-28 h-28">
                        <PieChart
                          data={[{ value: parseInt(validityPercentage), color: "#dd2727" }]}
                          totalValue={100}
                          lineWidth={15}
                          label={({ dataEntry }) => `${dataEntry.value}%`}
                          labelStyle={{ fontSize: '18px', fontWeight: '900', fill: '#0f172a' }}
                          labelPosition={0}
                          background="#f1f5f9"
                          rounded
                          animate
                        />
                      </div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-6">Validity Remaining</p>
                    </>
                  )}
                </div>
              </div>

              {/* Course Progress Card */}
              <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col items-center justify-between text-center min-h-[280px] hover:border-red-100 transition-all">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6">Course Progress</h3>
                <div className="flex-1 flex flex-col items-center justify-center">
                  <div className="relative w-28 h-28">
                    <PieChart
                      data={[{ value: watchedPercentage, color: "#dd2727" }]}
                      totalValue={100}
                      lineWidth={15}
                      label={({ dataEntry }) => `${dataEntry.value}%`}
                      labelStyle={{ fontSize: '18px', fontWeight: '900', fill: '#0f172a' }}
                      labelPosition={0}
                      background="#f1f5f9"
                      rounded
                      animate
                    />
                  </div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-6">
                    {watchedVideos.length}/{totalVideos} Videos Watched
                  </p>
                </div>
              </div>

              {/* Curriculum Card */}
              <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col items-center justify-between text-center min-h-[280px]">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6">Curriculum</h3>
                <div className="flex-1 flex flex-col items-center justify-center">
                  <div className="relative w-28 h-28">
                    <PieChart
                      data={[{ value: modulesCoveredPercentage, color: "#dd2727" }]}
                      totalValue={100}
                      lineWidth={15}
                      label={({ dataEntry }) => `${dataEntry.value}%`}
                      labelStyle={{ fontSize: '18px', fontWeight: '900', fill: '#0f172a' }}
                      labelPosition={0}
                      background="#f1f5f9"
                      rounded
                      animate
                    />
                  </div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-6">
                    {modulesCovered}/{totalModules} Modules Covered
                  </p>
                </div>
              </div>

              {/* Study Materials Card */}
              <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col items-center justify-between text-center min-h-[280px]">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6">Study Materials</h3>
                <div className="flex-1 w-full flex flex-col justify-center">
                  {studyMaterials.length > 0 ? (
                    <div className="space-y-3 max-h-[160px] overflow-y-auto custom-scrollbar pr-1 w-full">
                      {studyMaterials.map((material) => (
                        <div key={material.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between gap-3">
                          <p className="text-[10px] font-bold text-slate-700 truncate text-left flex-1">{material.title}</p>
                          <a
                            href={material.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-slate-900 text-white rounded-lg hover:bg-[#dd2727] transition-all"
                            title="Download"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                          </a>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center opacity-30">
                      <div className="text-4xl mb-4">📚</div>
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] italic">No Materials Yet</p>
                    </div>
                  )}
                </div>
              </div>
            </div>


            {/* COURSE VIDEOS */}
            <div className="mt-10 mb-10">
              <div className="flex items-center gap-4 mb-8">
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Course <span className="text-[#dd2727]">Videos</span></h2>
                <div className="flex-1 h-px bg-slate-200"></div>
              </div>
              {Object.keys(groupedVideos).reverse().map((title, index) => {
                // Initialize navigation refs
                if (!swiperNavRefs.current[index]) {
                  swiperNavRefs.current[index] = {
                    prev: React.createRef(),
                    next: React.createRef(),
                  };
                }

                const { prev, next } = swiperNavRefs.current[index];

                return (
                  <div key={index} className="mb-10 p-6 bg-black/20 border border-white/10 rounded-2xl">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                      <span className="w-2 h-8 bg-[#dd2727] rounded-full inline-block"></span>
                      {title}
                    </h3>

                    {/* Swiper Container */}
                    <div className="relative group px-8">
                      {/* Left Nav */}
                      <div className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button ref={prev}>
                          <FaChevronLeft className="text-white w-10 h-10 bg-black/50 border border-white/20 rounded-full p-2 backdrop-blur hover:bg-[#dd2727] transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)]" />
                        </button>
                      </div>

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
                        className="w-full pb-10"
                      >
                        {groupedVideos[title].map((video) => (
                          <SwiperSlide key={video.id} className="h-auto">
                            <div className="bg-white/5 border border-white/10 shadow-lg rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_10px_30px_rgba(221,39,39,0.15)] hover:border-white/20 h-full flex flex-col group/card">
                              <Link to={`/course/${courseName}/video/${video.id}`} className="flex flex-col h-full">
                                <div className="relative w-full aspect-video bg-black overflow-hidden border-b border-white/10">
                                  <video
                                    src={video.url}
                                    className="w-full h-full object-cover opacity-80 group-hover/card:opacity-100 transition-opacity"
                                    controlsList="nodownload"
                                    onEnded={() => handleMarkAsWatched(video.id)}
                                    muted
                                  />
                                  {/* Play icon overlay */}
                                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity bg-black/40 backdrop-blur-sm">
                                    <div className="w-12 h-12 rounded-full bg-[#dd2727]/80 flex items-center justify-center shadow-[0_0_20px_rgba(221,39,39,0.5)]">
                                      <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[12px] border-l-white border-b-[8px] border-b-transparent ml-1"></div>
                                    </div>
                                  </div>
                                </div>
                                <div className="p-4 flex-1 flex flex-col">
                                  <p className="text-white font-bold text-sm line-clamp-2 group-hover/card:text-[#dd2727] transition-colors">
                                    {video.description}
                                  </p>
                                  {watchedVideos.includes(video.id) && (
                                    <span className="mt-auto pt-3 inline-flex items-center text-xs font-bold text-green-400 uppercase tracking-wider">
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

                      {/* Right Nav */}
                      <div className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button ref={next}>
                          <FaChevronRight className="text-white w-10 h-10 bg-black/50 border border-white/20 rounded-full p-2 backdrop-blur hover:bg-[#dd2727] transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)]" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>



            {/* Q&A SECTION */}
            <div className="mt-10 mb-8 admin-card p-10 bg-white">
              <div className="flex items-center gap-4 mb-8">
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Cosmic <span className="text-[#dd2727]">Q&A</span></h2>
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

