
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

  useEffect(() => {
    fetchCourses();
    fetchMeetings();
  }, []);

  const fetchCourses = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "courses"));
      const courseList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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
    <div className="admin-layout bg-gray-50">
      <Header />
      <div className="flex flex-col md:flex-row min-h-screen pt-16 relative z-10 gap-0">
        <SideBar />

        <main className="flex-1 min-w-0 py-10 px-[15px] md:px-[50px] bg-white admin-fluid-container">
          <div className="space-y-8">

            {/* Scheduler Form */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8 pt-8 relative overflow-hidden mt-8">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#dd2727]/5 rounded-full blur-3xl"></div>
              <div className="flex items-center justify-center gap-3 mb-8">
                <span className="text-3xl">📅</span>
                <h2 className="text-2xl font-bold text-[#dd2727]">Schedule RingCentral Meeting</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Course</label>
                  <select
                    className="w-full border border-gray-300 rounded px-4 py-2 text-gray-700 focus:outline-none focus:border-[#dd2727]"
                    name="courseId"
                    value={sessionData.courseId}
                    onChange={handleInputChange}
                  >
                    <option value="">Select a course</option>
                    {courses.map(course => (
                      <option key={course.id} value={course.courseName}>{course.courseName}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    name="title"
                    className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-[#dd2727]"
                    value={sessionData.title}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Date</label>
                    <input
                      type="datetime-local"
                      className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-[#dd2727]"
                      onChange={(e) => {
                        const val = e.target.value; // YYYY-MM-DDTHH:mm
                        if (val) {
                          const [d, t] = val.split('T');
                          setSessionData({ ...sessionData, date: d, time: t });
                        }
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Duration (mins)</label>
                    <input
                      type="number"
                      name="duration"
                      className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-[#dd2727]"
                      value={sessionData.duration}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <button
                  onClick={scheduleMeeting}
                  disabled={loading}
                  className="w-full bg-[#dd2727] text-white py-3 rounded font-bold text-lg hover:bg-[#c41e1e] transition-colors"
                >
                  {loading ? "Scheduling..." : "Schedule Meeting"}
                </button>
              </div>
            </div>

            {/* Scheduled Meetings List */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-800">Scheduled Meetings</h3>

              {meetings.length === 0 ? (
                <p className="text-gray-500 italic">No meetings scheduled.</p>
              ) : (
                <div className="space-y-4">
                  {meetings.map((meeting) => (
                    <div key={meeting.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm relative">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <h4 className="text-lg font-bold text-[#dd2727]">{meeting.subject}</h4>
                          <p className="text-gray-700 font-semibold">{meeting.courseId}</p>
                          <p className="text-gray-500 text-sm flex items-center gap-2">
                            <span className="text-lg">🕒</span>
                            {new Date(meeting.startDate).toLocaleString()}
                          </p>
                          <div className="flex gap-3 text-sm mt-3">
                            <a
                              href={meeting.ringCentralMeeting?.roomUrl || "#"}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              Join
                            </a>
                            <button
                              onClick={() => copyToClipboard(meeting.ringCentralMeeting?.roomUrl || "")}
                              className="text-blue-600 hover:underline"
                            >
                              Copy URL
                            </button>
                            <button
                              onClick={() => deleteMeeting(meeting.id)}
                              className="text-[#dd2727] hover:underline"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                        <div className="bg-red-50 text-[#dd2727] px-3 py-1 rounded text-xs font-bold border border-red-100">
                          {meeting.duration} mins
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default AddMeeting;

