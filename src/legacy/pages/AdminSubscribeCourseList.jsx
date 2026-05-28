import React, { useState, useEffect } from "react";
import { db } from "../../firebaseConfig";
import {
  collection,
  getDocs,
  setDoc,
  doc,
  deleteDoc,
  getDoc,
} from "firebase/firestore";
import SideBar from "./Admin";
import Header from "../../components/sections/Header/Header";
import Footer from "../../components/sections/Footer/Footer";

const AdminEnrolledUsers = () => {
  const [courses, setCourses] = useState([]);
  const [freeCourses, setFreeCourses] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formVisible, setFormVisible] = useState(false);
  const [newSubscriber, setNewSubscriber] = useState({
    name: "",
    userId: "",
    course: "",
    courseType: "paid", // "paid" or "free"
    subscriptionDate: new Date().toISOString().split("T")[0],
    expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
      .toISOString()
      .split("T")[0],
  });
   const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    setCurrentPage(1); // Reset to first page when course filter changes
    fetchSubscribers(selectedCourse);
  }, [selectedCourse]);

  const fetchCourses = async () => {
    try {
      const paidSnapshot = await getDocs(collection(db, "paidCourses"));
      const paidList = paidSnapshot.docs.map((doc) => ({
        id: doc.id,
        title: doc.data().title,
      }));

      const freeSnapshot = await getDocs(collection(db, "freeCourses"));
      const freeList = freeSnapshot.docs.map((doc) => ({
        id: doc.id,
        title: doc.data().title,
      }));

      setCourses(paidList);
      setFreeCourses(freeList);
      setAllCourses([...paidList, ...freeList]);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching courses:", error);
      setLoading(false);
    }
  };

  const fetchSubscribers = async (courseId) => {
    setLoading(true);
    try {
      const subscriptionsRef = collection(db, "subscriptions");
      const snapshot = await getDocs(subscriptionsRef);
      const allSubs = [];

      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const email = docSnap.id;
        
        // Check if user is enrolled in the selected course or all courses
        let isEnrolled = false;
        let enrolledAs = "";

        // Check free courses
        if (data.freecourses && Array.isArray(data.freecourses)) {
          if (!courseId || data.freecourses.includes(courseId)) {
            isEnrolled = true;
            enrolledAs = "free";
          }
        }

        // Check paid courses (DETAILS can be array or object)
        if (data.DETAILS) {
          const details = data.DETAILS;
          if (Array.isArray(details)) {
            details.forEach(courseObj => {
              if (!courseId || Object.keys(courseObj).includes(courseId)) {
                isEnrolled = true;
                enrolledAs = "paid";
              }
            });
          } else if (typeof details === 'object') {
            Object.values(details).forEach(courseObj => {
              if (!courseId || Object.keys(courseObj).includes(courseId)) {
                isEnrolled = true;
                enrolledAs = enrolledAs === "free" ? "both" : "paid";
              }
            });
          }
        }

        if (isEnrolled) {
          allSubs.push({
            id: email,
            name: data.name || "Anonymous",
            userId: email,
            phone: data.phone || "N/A",
            courseType: enrolledAs,
            ...data
          });
        }
      });

      setSubscribers(allSubs);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching subscribers:", error);
      setLoading(false);
    }
  };

  const handleEnrollment = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    try {
      // 1. Check if user exists in subscriptions or users
      const subRef = doc(db, "subscriptions", newSubscriber.userId);
      const subSnap = await getDoc(subRef);
      
      const enrollmentData = {
        name: newSubscriber.name,
        phone: newSubscriber.phone || "",
        email: newSubscriber.userId,
      };

      if (subSnap.exists()) {
        const subData = subSnap.data();
        
        // Check for double enrollment
        if (newSubscriber.courseType === "free") {
          const freecourses = subData.freecourses || [];
          if (freecourses.includes(newSubscriber.course)) {
            setErrorMessage("User is already enrolled in this free course.");
            return;
          }
          await updateDoc(subRef, {
            freecourses: [...freecourses, newSubscriber.course],
            name: newSubscriber.name, // Keep name/phone updated
            phone: newSubscriber.phone || subData.phone
          });
        } else {
          // Paid course
          let details = subData.DETAILS || [];
          let alreadyEnrolled = false;
          
          if (Array.isArray(details)) {
            alreadyEnrolled = details.some(d => Object.keys(d)[0] === newSubscriber.course);
          } else if (typeof details === 'object') {
            alreadyEnrolled = Object.values(details).some(d => Object.keys(d)[0] === newSubscriber.course);
          }

          if (alreadyEnrolled) {
            setErrorMessage("User is already enrolled in this paid course.");
            return;
          }

          const newCourseEntry = {
            [newSubscriber.course]: {
              subscriptionDate: newSubscriber.subscriptionDate,
              expiryDate: newSubscriber.expiryDate,
              status: "active"
            }
          };

          if (Array.isArray(details)) {
            await updateDoc(subRef, {
              DETAILS: [...details, newCourseEntry],
              name: newSubscriber.name,
              phone: newSubscriber.phone || subData.phone
            });
          } else {
            // It's an object, let's keep it as is or convert?
            // Safer to just add a new key if it's that weird object-with-index-keys format
            const nextIndex = Object.keys(details).length;
            await updateDoc(subRef, {
              [`DETAILS.${nextIndex}`]: newCourseEntry,
              name: newSubscriber.name,
              phone: newSubscriber.phone || subData.phone
            });
          }
        }
      } else {
        // Create new subscription doc
        const newDoc = {
          name: newSubscriber.name,
          email: newSubscriber.userId,
          phone: newSubscriber.phone || "",
        };

        if (newSubscriber.courseType === "free") {
          newDoc.freecourses = [newSubscriber.course];
        } else {
          newDoc.DETAILS = [{
            [newSubscriber.course]: {
              subscriptionDate: newSubscriber.subscriptionDate,
              expiryDate: newSubscriber.expiryDate,
              status: "active"
            }
          }];
        }
        await setDoc(subRef, newDoc);
      }

      // 2. Also keep legacy subscribers_* collection for backward compatibility if needed
      const legacyRef = doc(db, `subscribers_${newSubscriber.course}`, newSubscriber.userId);
      await setDoc(legacyRef, {
        name: newSubscriber.name,
        phone: newSubscriber.phone || "",
        courseType: newSubscriber.courseType,
        subscriptionDate: newSubscriber.subscriptionDate || null,
        expiryDate: newSubscriber.expiryDate || null
      });

      setSuccessMessage("User enrolled successfully across all cosmic records!");
      setNewSubscriber({
        name: "",
        userId: "",
        course: "",
        courseType: "paid",
        subscriptionDate: new Date().toISOString().split("T")[0],
        expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split("T")[0],
      });
      
      fetchSubscribers(selectedCourse);
    } catch (error) {
      console.error("Error during enrollment:", error);
      setErrorMessage("Failed to enroll user. Please try again.");
    }
  };

  const handleDeleteCourse = async (userId, courseId) => {
    if (
      !window.confirm(
        "Are you sure you want to remove this user from the course?"
      )
    )
      return;

    try {
      // 1. Remove from legacy subscribers_CourseID collection
      await deleteDoc(doc(db, `subscribers_${courseId}`, userId));

      // 2. Remove from 'subscriptions' collection (main source of truth)
      const subRef = doc(db, "subscriptions", userId);
      const subSnap = await getDoc(subRef);
      
      if (subSnap.exists()) {
        const subData = subSnap.data();
        
        // Handle freecourses
        const freecourses = subData.freecourses || [];
        const updatedFree = freecourses.filter(id => id !== courseId);
        
        // Handle DETAILS (Paid courses) - handles both array and object formats
        let updatedDetails;
        const details = subData.DETAILS;
        
        if (Array.isArray(details)) {
          updatedDetails = details.filter(d => Object.keys(d)[0] !== courseId);
        } else if (typeof details === 'object' && details !== null) {
          // If it's the indexed object format, filter keys
          updatedDetails = {};
          let newIdx = 0;
          Object.values(details).forEach(courseObj => {
            if (Object.keys(courseObj)[0] !== courseId) {
              updatedDetails[newIdx] = courseObj;
              newIdx++;
            }
          });
        }

        await updateDoc(subRef, {
          freecourses: updatedFree,
          DETAILS: updatedDetails || []
        });
      }

      // 3. Update local state
      setSubscribers(subscribers.filter((sub) => sub.id !== userId));
      alert("User removed from course successfully across all celestial records.");
    } catch (error) {
      console.error("Error removing user from course:", error);
      alert("Failed to remove user completely. Please check Firebase connection.");
    }
  };

  // Pagination Calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentSubscribers = subscribers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(subscribers.length / itemsPerPage);

  const filteredSubscribers = subscribers; // Kept for reference but we use currentSubscribers for render

  return (
    <div className="admin-layout flex flex-col min-h-screen">
      <Header />
      
      <div className="flex flex-1 relative z-10 pt-16 gap-0">
        <SideBar />

        <main className="flex-1 min-w-0 py-10 px-[15px] md:px-[50px] bg-white">
          <div className="space-y-8">
            {/* Enrollment Form Section */}
            <div className="bg-white border border-slate-200 rounded-2xl p-8 md:p-10 shadow-sm relative overflow-hidden group">
              <div className="flex justify-between items-center mb-10 pb-6 border-b border-slate-100 pt-8">
                <h2 className="text-xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
                  <div className="w-1.5 h-6 bg-[#dd2727] rounded-full"></div>
                  Manual <span className="text-[#dd2727]">Enrollment</span>
                </h2>
                <button
                  onClick={() => setFormVisible(!formVisible)}
                  className="text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-[#dd2727] transition-colors"
                >
                  {formVisible ? "[ Hide Form ]" : "[ Show Form ]"}
                </button>
              </div>

              {formVisible && (
                <form onSubmit={handleEnrollment} className="space-y-6 max-w-2xl animate-in fade-in slide-in-from-top-4 duration-500">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Student Full Name</label>
                      <input
                        type="text"
                        required
                        placeholder="John Doe"
                        value={newSubscriber.name}
                        onChange={(e) => setNewSubscriber({ ...newSubscriber, name: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl px-5 py-3 text-slate-900 focus:outline-none focus:ring-4 focus:ring-[#dd2727]/5 focus:border-[#dd2727] transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">User ID / Email</label>
                      <input
                        type="text"
                        required
                        placeholder="user@example.com"
                        value={newSubscriber.userId}
                        onChange={(e) => setNewSubscriber({ ...newSubscriber, userId: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl px-5 py-3 text-slate-900 focus:outline-none focus:ring-4 focus:ring-[#dd2727]/5 focus:border-[#dd2727] transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Course Type</label>
                      <select
                        value={newSubscriber.courseType}
                        onChange={(e) => setNewSubscriber({ ...newSubscriber, courseType: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl px-5 py-3 text-slate-900 focus:outline-none focus:ring-4 focus:ring-[#dd2727]/5 focus:border-[#dd2727] transition-all appearance-none cursor-pointer shadow-sm"
                      >
                        <option value="paid" className="bg-white">Paid Subscription</option>
                        <option value="free" className="bg-white">Free Access</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Select Course</label>
                      <select
                        required
                        value={newSubscriber.course}
                        onChange={(e) => setNewSubscriber({ ...newSubscriber, course: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl px-5 py-3 text-slate-900 focus:outline-none focus:ring-4 focus:ring-[#dd2727]/5 focus:border-[#dd2727] transition-all appearance-none cursor-pointer shadow-sm"
                      >
                        <option value="" className="bg-white text-slate-400">Choose from library...</option>
                        {newSubscriber.courseType === "paid"
                          ? courses.map((c) => (
                              <option key={c.id} value={c.id} className="bg-white text-slate-900">
                                {c.title}
                              </option>
                            ))
                          : freeCourses.map((c) => (
                              <option key={c.id} value={c.id} className="bg-white text-slate-900">
                                {c.title}
                              </option>
                            ))}
                      </select>
                    </div>

                    {newSubscriber.courseType === "paid" && (
                      <>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Start Date</label>
                          <input
                            type="date"
                            value={newSubscriber.subscriptionDate}
                            onChange={(e) => setNewSubscriber({ ...newSubscriber, subscriptionDate: e.target.value })}
                            className="w-full bg-white border border-slate-200 rounded-xl px-5 py-3 text-slate-900 focus:outline-none focus:ring-4 focus:ring-[#dd2727]/5 focus:border-[#dd2727] transition-all shadow-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">End Date</label>
                          <input
                            type="date"
                            value={newSubscriber.expiryDate}
                            onChange={(e) => setNewSubscriber({ ...newSubscriber, expiryDate: e.target.value })}
                            className="w-full bg-white border border-slate-200 rounded-xl px-5 py-3 text-slate-900 focus:outline-none focus:ring-4 focus:ring-[#dd2727]/5 focus:border-[#dd2727] transition-all shadow-sm"
                          />
                        </div>
                      </>
                    )}
                  </div>

                  {errorMessage && <p className="text-red-500 text-sm font-medium">{errorMessage}</p>}
                  {successMessage && <p className="text-green-500 text-sm font-medium">{successMessage}</p>}

                  <button
                    type="submit"
                    className="w-full bg-[#dd2727] text-white py-4 rounded-xl font-extrabold uppercase tracking-widest hover:shadow-lg hover:shadow-red-500/20 transform hover:scale-[1.01] transition-all duration-300"
                  >
                    Confirm Enrollment
                  </button>
                </form>
              )}
            </div>

            {/* Enrolled Users Section */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-10 shadow-sm relative overflow-hidden group">
              <h2 className="text-xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3 mb-10">
                <div className="w-1.5 h-6 bg-[#b0a102] rounded-full"></div>
                Current <span className="text-[#b0a102]">Enrollments</span>
              </h2>

              <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-8">
                <div className="w-full md:w-1/2 lg:w-1/3">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Filter by Course</label>
                  <select
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#dd2727] transition-all appearance-none cursor-pointer"
                  >
                    <option value="" className="bg-white">All Courses</option>
                    {allCourses.map((c) => (
                      <option key={c.id} value={c.id} className="bg-white">
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col items-end gap-2">
                  {!selectedCourse && (
                    <p className="text-[10px] text-yellow-600 font-bold uppercase tracking-wider bg-yellow-50 px-3 py-1 rounded-full border border-yellow-200">
                      Select a course to enable delete
                    </p>
                  )}
                  <p className="text-sm font-medium tracking-wide">
                    TOTAL SUBSCRIBERS: <strong className="text-[#dd2727] text-lg ml-2">{filteredSubscribers.length}</strong>
                  </p>
                </div>
              </div>

              {/* Table */}
              <div className="hidden md:block overflow-hidden rounded-2xl border border-slate-100">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">User ID / Email</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Phone</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 bg-white">
                    {currentSubscribers.length > 0 ? (
                      currentSubscribers.map((sub) => (
                        <tr key={sub.id} className="hover:bg-slate-50 transition-colors group">
                          <td className="px-6 py-4 text-sm font-medium text-slate-900">{sub.name || "N/A"}</td>
                          <td className="px-6 py-4 text-sm text-slate-500">{sub.id}</td>
                          <td className="px-6 py-4 text-sm text-slate-500">{sub.phone || "N/A"}</td>
                          <td className="px-6 py-4 text-right">
                            <button
                              disabled={!selectedCourse}
                              onClick={() => selectedCourse && handleDeleteCourse(sub.id, selectedCourse)}
                              className={`p-2 rounded-lg transition-all ${
                                !selectedCourse 
                                  ? "opacity-20 grayscale cursor-not-allowed" 
                                  : "hover:bg-red-50 text-red-500"
                              }`}
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="px-6 py-12 text-center text-slate-400 italic font-medium">
                          No subscribers found for this selection.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-4">
                {currentSubscribers.length > 0 ? (
                  currentSubscribers.map((sub) => (
                    <div key={sub.id} className="bg-white border border-slate-100 rounded-2xl p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Name</p>
                          <p className="text-sm font-bold text-slate-900">{sub.name || "N/A"}</p>
                        </div>
                        <button
                          disabled={!selectedCourse}
                          onClick={() => selectedCourse && handleDeleteCourse(sub.id, selectedCourse)}
                          className={`p-2 rounded-lg ${!selectedCourse ? "opacity-20" : "bg-red-50 text-red-500"}`}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">User ID / Email</p>
                        <p className="text-sm text-slate-500 break-all">{sub.id}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Phone</p>
                        <p className="text-sm text-slate-500">{sub.phone || "N/A"}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center py-8 text-slate-400 italic">No subscribers found.</p>
                )}
              </div>

              {/* Pagination UI */}
              {subscribers.length > itemsPerPage && (
                <div className="mt-10 flex flex-col md:flex-row justify-between items-center gap-6 px-2 pt-6 border-t border-slate-50">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">
                    Showing <span className="text-slate-900">{indexOfFirstItem + 1}</span> to <span className="text-slate-900">{Math.min(indexOfLastItem, subscribers.length)}</span> of <span className="text-slate-900">{subscribers.length}</span> entries
                  </p>
                  
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className={`p-3 rounded-2xl border transition-all ${
                        currentPage === 1 
                          ? "bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed" 
                          : "bg-white text-slate-600 border-slate-200 hover:border-[#dd2727] hover:text-[#dd2727] hover:shadow-lg shadow-sm"
                      }`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                    </button>

                    <div className="flex items-center gap-2">
                      {[...Array(totalPages)].map((_, i) => (
                        <button
                          key={i + 1}
                          onClick={() => setCurrentPage(i + 1)}
                          className={`w-11 h-11 rounded-2xl text-xs font-black transition-all ${
                            currentPage === i + 1
                              ? "bg-[#dd2727] text-white shadow-[0_8px_20px_rgba(221,39,39,0.3)] scale-110"
                              : "bg-white text-slate-400 border border-slate-200 hover:border-[#dd2727]/30 hover:text-slate-900"
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className={`p-3 rounded-2xl border transition-all ${
                        currentPage === totalPages 
                          ? "bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed" 
                          : "bg-white text-slate-600 border-slate-200 hover:border-[#dd2727] hover:text-[#dd2727] hover:shadow-lg shadow-sm"
                      }`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                    </button>
                  </div>
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

export default AdminEnrolledUsers;

