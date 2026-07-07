
import React, { useState, useEffect } from "react";
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import SideBar from "./Admin";
import Header from "../../components/sections/Header/Header";
import Footer from "../../components/sections/Footer/Footer";

const AddMeeting = () => {
  const [sessionData, setSessionData] = useState({
    title: "",
    courseId: "",
    date: "",
    time: "",
    duration: "30",
  });
  const [meetings, setMeetings] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(true);

  useEffect(() => {
    fetchCourses();
    fetchMeetings();
  }, []);

  const fetchCourses = async () => {
    try {
      // Courses are stored in `freeCourses` and `paidCourses` collections
      const freeSnap = await getDocs(collection(db, "freeCourses"));
      const paidSnap = await getDocs(collection(db, "paidCourses"));
      const courseList = [
        ...freeSnap.docs.map(d => ({ id: d.id, ...d.data() })),
        ...paidSnap.docs.map(d => ({ id: d.id, ...d.data() })),
      ];
      setCourses(courseList);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  const fetchMeetings = async () => {
    try {
      const q = query(collection(db, "meetings"), orderBy("startDate", "desc"));
      const querySnapshot = await getDocs(q);
      const meetingList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMeetings(meetingList);
    } catch (error) {
      console.error("Error fetching meetings:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSessionData({ ...sessionData, [name]: value });
  };

  const scheduleMeeting = async () => {
    const { title, courseId, date, time, duration } = sessionData;

    if (!title || !courseId || !date || !time) {
      alert("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const startDate = `${date}T${time}:00`;
      const newMeeting = {
        subject: title,
        courseId: courseId,
        startDate: startDate,
        duration: parseInt(duration),
        createdAt: new Date().toISOString(),
        ringCentralMeeting: {
          roomUrl: "https://whereby.com/vahlay-astro", // Maintain compatibility with existing viewer logic
        }
      };

      await addDoc(collection(db, "meetings"), newMeeting);
      alert("Meeting scheduled successfully!");
      setSessionData({ title: "", courseId: "", date: "", time: "", duration: "30" });
      fetchMeetings();
    } catch (error) {
      console.error("Error scheduling meeting:", error);
      alert("Failed to schedule session.");
    } finally {
      setLoading(false);
    }
  };

  const deleteMeeting = async (id) => {
    if (window.confirm("Are you sure you want to delete this session?")) {
      try {
        await deleteDoc(doc(db, "meetings", id));
        fetchMeetings();
      } catch (error) {
        console.error("Error deleting meeting:", error);
      }
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("URL copied to clipboard!");
  };

  return (
    <div className="admin-layout">
      <div id="top-sentinel" className="absolute top-0 left-0 w-full h-px pointer-events-none z-[-1]" />
      <Header />
      <div className="flex flex-col md:flex-row min-h-screen pt-16 relative z-10 admin-fluid-container gap-0 pb-0">
        <SideBar />

        <main className="flex-1 min-w-0 py-10 px-[15px] md:px-[50px] bg-white">
          <div className="space-y-8">
            <div className="flex justify-between items-center pt-8">
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Live Session <span className="text-[#bf0603]">Management</span>
              </h2>
              <button
                onClick={() => setIsFormVisible(!isFormVisible)}
                className="bg-[#bf0603] text-white px-3 text-xs py-2 rounded-2xl uppercase tracking-widest hover:shadow-[0_0_30px_rgba(191, 6, 3,0.5)] transition-all"
              >
                {isFormVisible ? "X" : "schedule meeting"}
              </button>
            </div>

            {isFormVisible && (
              <div className="bg-white border border-slate-200 rounded-2xl p-8 md:p-10 shadow-xl shadow-slate-200/50 animate-in zoom-in-95 duration-500 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-40 h-40 bg-[#bf0603]/5 rounded-full blur-[100px]"></div>
                
                <h3 className="text-xl font-bold text-slate-900 mb-12 pb-6 border-b border-slate-100 flex items-center gap-3">
                  <div className="w-1.5 h-6 bg-[#bf0603] rounded-full"></div>
                  Schedule Live Session
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Course</label>
                    <select
                      className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 text-gray-900 focus:ring-2 focus:ring-[#bf0603] outline-none appearance-none cursor-pointer"
                      name="courseId"
                      value={sessionData.courseId}
                      onChange={handleInputChange}
                    >
                      <option value="">Select a course</option>
                      {courses.map(course => (
                        <option
                          key={course.id}
                          value={course.title || course.courseName || course.id}
                        >
                          {course.title || course.courseName || course.id}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Title</label>
                    <input
                      type="text"
                      name="title"
                      className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 text-gray-900 focus:ring-2 focus:ring-[#bf0603] outline-none transition-all placeholder:text-gray-400"
                      value={sessionData.title}
                      onChange={handleInputChange}
                      placeholder="Enter meeting title"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Date & Time</label>
                    <input
                      type="datetime-local"
                      className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 text-gray-900 focus:ring-2 focus:ring-[#bf0603] outline-none transition-all"
                      onChange={(e) => {
                        const val = e.target.value; // YYYY-MM-DDTHH:mm
                        if (val) {
                          const [d, t] = val.split('T');
                          setSessionData({ ...sessionData, date: d, time: t });
                        }
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Duration (minutes)</label>
                    <input
                      type="number"
                      name="duration"
                      className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 text-gray-900 focus:ring-2 focus:ring-[#bf0603] outline-none transition-all placeholder:text-gray-400"
                      value={sessionData.duration}
                      onChange={handleInputChange}
                      placeholder="30"
                    />
                  </div>
                </div>

                <div className="mt-12">
                  <button
                    onClick={scheduleMeeting}
                    disabled={loading}
                    className={`w-full bg-[#bf0603] text-white py-5 rounded-xl font-bold uppercase tracking-[0.2em] hover:shadow-[0_0_40px_rgba(191, 6, 3,0.5)] transition-all transform hover:scale-[1.01] active:scale-95 ${loading ? "cursor-not-allowed opacity-50" : ""}`}
                  >
                    {loading ? "Scheduling..." : "Schedule Meeting"}
                  </button>
                </div>
              </div>
            )}

            {/* Scheduled Meetings List */}
            <div className="space-y-8">
              <h3 className="text-xl font-bold text-slate-900 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-1.5 h-6 bg-[#b0a102] rounded-full"></span>
                  Scheduled Meetings ({meetings.length})
                </div>
              </h3>

              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <ul className="divide-y divide-slate-100">
                  {meetings.map((meeting) => (
                    <li
                      key={meeting.id}
                      className="p-8 flex flex-col md:flex-row justify-between items-start md:items-center hover:bg-slate-50 transition-all group gap-6"
                    >
                      <div className="flex items-center gap-6">
                        <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:border-[#bf0603]/30 transition-all">
                          <span className="text-[10px] font-bold text-slate-400 group-hover:text-[#bf0603] transition-all uppercase tracking-tighter">ID: {meeting.id.substring(0,4)}</span>
                        </div>
                        <div>
                          <span className="text-lg text-slate-900 font-bold tracking-tight group-hover:text-[#bf0603] transition-all uppercase">
                            {meeting.subject || "Untitled Session"}
                          </span>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                            Course: <span className="text-slate-700">{meeting.courseId}</span> • Duration: <span className="text-slate-700">{meeting.duration} mins</span>
                          </p>
                          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1.5">
                            <span>📅</span> {new Date(meeting.startDate).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-6 mt-4 md:mt-0">
                        <a
                          href={meeting.ringCentralMeeting?.roomUrl || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] font-bold uppercase tracking-widest text-[#b0a102] hover:text-white transition-all border-b border-transparent hover:border-[#b0a102]"
                        >
                          Join Room
                        </a>
                        <button
                          onClick={() => copyToClipboard(meeting.ringCentralMeeting?.roomUrl || "")}
                          className="text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-slate-800 transition-all"
                        >
                          Copy URL
                        </button>
                        <button
                          onClick={() => deleteMeeting(meeting.id)}
                          className="text-[10px] font-bold uppercase tracking-widest text-[#bf0603] hover:bg-red-50 px-4 py-2 rounded-lg transition-all"
                        >
                          Delete
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
                {meetings.length === 0 && (
                  <div className="py-20 text-center opacity-25">
                    <p className="text-[10px] font-bold uppercase tracking-[0.4em]">No meetings scheduled</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default AddMeeting;

