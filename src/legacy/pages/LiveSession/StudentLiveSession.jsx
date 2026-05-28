import React, { useState, useEffect } from "react";
import { db } from "../../../firebaseConfig";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import Header from "../../../components/sections/Header/Header";
import Aside from "../Aside";
import Footer from "../../../components/sections/Footer/Footer";

const StudentLiveSession = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const freeCoursesSnapshot = await getDocs(collection(db, "freeCourses"));
        const freeCourses = freeCoursesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          type: "free",
        }));

        const paidCoursesSnapshot = await getDocs(collection(db, "paidCourses"));
        const paidCourses = paidCoursesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          type: "paid",
        }));

        setCourses([...freeCourses, ...paidCourses]);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };

    fetchCourses();
  }, []);

  const fetchSessions = async (courseId) => {
    try {
      const db = getFirestore();
      const sessionsQuery = query(collection(db, "sessions"), where("courseId", "==", courseId));
      const sessionsSnapshot = await getDocs(sessionsQuery);
      const sessionsList = sessionsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setSessions(sessionsList);
    } catch (error) {
      console.error("Error fetching sessions:", error);
    }
  };

  const handleCourseChange = (e) => {
    const courseId = e.target.value;
    setSelectedCourse(courseId);
    fetchSessions(courseId);
  };

  return (
    <div className="student-layout">
      <div id="top-sentinel" className="absolute top-0 left-0 w-full h-px pointer-events-none z-[-1]" />
      <Header />
      <div className="flex flex-col md:flex-row min-h-screen pt-16 relative z-10 premium-container gap-0">
        <Aside />
        <main className="flex-1 p-4 md:p-8 py-10">
          <div className="max-w-4xl mx-auto space-y-8 pt-8">
            <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-[0_0_30px_rgba(221,39,39,0.1)]">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 uppercase tracking-tight">
                Cosmic <span className="text-[#dd2727]">Live Sessions</span>
              </h2>

              <div className="relative group">
                <select
                  value={selectedCourse}
                  onChange={handleCourseChange}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-[#dd2727] transition-all cursor-pointer"
                >
                  <option value="" className="bg-[#0a0a0a]">-- Select a Cosmic Course --</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id} className="bg-[#0a0a0a]">
                      {course.title} ({course.type === "free" ? "Free" : "Paid"})
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>

            {/* Sessions List */}
            <div className="space-y-6">
              {sessions.length > 0 ? (
                sessions.map((session) => (
                  <div
                    key={session.id}
                    className="group bg-white/5 border border-white/10 p-6 rounded-2xl hover:bg-white/10 transition-all flex flex-col md:flex-row justify-between items-center gap-6 shadow-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        <h3 className="text-xl font-bold text-white group-hover:text-[#dd2727] transition-colors">{session.title}</h3>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-400 font-medium">
                        <span className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          {session.date}
                        </span>
                        <span className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          {session.time}
                        </span>
                        <span className="flex items-center gap-2 uppercase tracking-widest text-[10px] text-[#b0a102]">
                          Room: {session.roomName}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveSession(session)}
                      className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-[#dd2727] to-[#b0a102] text-white rounded-xl font-bold uppercase tracking-widest hover:scale-105 transition-all shadow-[0_0_20px_rgba(221,39,39,0.3)]"
                    >
                      Join Now
                    </button>
                  </div>
                ))
              ) : selectedCourse ? (
                <div className="text-center py-12 bg-white/5 border border-white/10 rounded-2xl">
                  <p className="text-gray-500 font-medium italic">No live sessions scheduled for this course.</p>
                </div>
              ) : (
                <div className="text-center py-12 bg-white/5 border border-white/10 rounded-2xl">
                  <p className="text-gray-500 font-medium uppercase tracking-[0.2em] text-xs">Select a course to view available sessions</p>
                </div>
              )}
            </div>

            {/* Active Session */}
            {activeSession && (
              <div className="fixed inset-0 z-[10000] bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-6xl flex flex-col h-full max-h-[90vh] bg-black border border-white/10 rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(221,39,39,0.4)]">
                  <div className="flex justify-between items-center p-4 bg-white/5 border-b border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-red-500 animate-ping"></div>
                      <h3 className="text-sm font-bold text-white uppercase tracking-[0.2em]">{activeSession.title}</h3>
                    </div>
                    <button
                      onClick={() => setActiveSession(null)}
                      className="px-6 py-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl font-bold uppercase tracking-widest transition-all text-xs"
                    >
                      Leave Session
                    </button>
                  </div>
                  <iframe
                    src={`https://meet.jit.si/${activeSession.roomName}`}
                    className="w-full flex-grow border-0"
                    title="Live Cosmic Session"
                    allow="camera; microphone; fullscreen; display-capture"
                  ></iframe>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default StudentLiveSession;

