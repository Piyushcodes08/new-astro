import React, { useState, useEffect } from "react";
import { db } from "../../firebaseConfig";
import {
  collection,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
import { Link } from "react-router-dom";
import Admin from "../pages/Admin";
import Header from "../../components/sections/Header/Header";

// Custom dropdown component for course selection
const CourseDropdown = ({ courses, selectedCourse, setSelectedCourse }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedTitle =
    courses.find((course) => course.id === selectedCourse)?.title ||
    "Select a course";

  return (
    <div className="relative mb-8 w-full max-w-xl mx-auto">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 flex items-center justify-between group hover:bg-slate-50 transition-all text-slate-900 font-bold uppercase tracking-widest text-sm shadow-sm"
      >
        <span>{selectedTitle}</span>
        <svg className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg>
      </button>
      {isOpen && (
        <ul className="absolute mt-2 w-full bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {courses.map((course) => (
            <li
              key={course.id}
              onClick={() => {
                setSelectedCourse(course.id);
                setIsOpen(false);
              }}
              className="px-6 py-4 cursor-pointer hover:bg-slate-50 text-slate-700 text-sm font-medium transition-colors border-b border-slate-100 last:border-0"
            >
              {course.title}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const AdminPanel = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [emiPlans, setEmiPlans] = useState([]);
  const [newPlan, setNewPlan] = useState({ duration: "", amount: "" });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentSection, setCurrentSection] = useState(false);

  useEffect(() => {
    // Fetch courses from `paidCourses`
    const unsubscribeCourses = onSnapshot(
      collection(db, "paidCourses"),
      (snapshot) => {
        const fetchedCourses = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCourses(fetchedCourses);
      }
    );

    return () => unsubscribeCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      // Fetch EMI plans for the selected course
      const plansQuery = query(
        collection(db, "emiPlans"),
        where("courseId", "==", selectedCourse)
      );
      const unsubscribePlans = onSnapshot(plansQuery, (snapshot) => {
        const fetchedPlans = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setEmiPlans(fetchedPlans);
      });

      return () => unsubscribePlans();
    }
  }, [selectedCourse]);

  const addEmiPlan = async () => {
    if (!selectedCourse || !newPlan.duration || !newPlan.amount) {
      alert("Please select a course and fill in the EMI details.");
      return;
    }

    await addDoc(collection(db, "emiPlans"), {
      ...newPlan,
      courseId: selectedCourse,
    });

    setNewPlan({ duration: "", amount: "" });
    alert("EMI plan added successfully!");
  };

  const deleteEmiPlan = async (id) => {
    await deleteDoc(doc(db, "emiPlans", id));
    alert("EMI plan deleted successfully!");
  };

  return (
    <div className="admin-layout min-h-screen flex flex-col">
      <div id="top-sentinel" className="absolute top-0 left-0 w-full h-px pointer-events-none z-[-1]" />
      <Header />
      <div className="flex flex-1 relative z-10 pt-16 gap-0">
        {/* Sidebar - Always visible on desktop and mobile */}
        <Admin />

        <main className="flex-1 min-w-0 p-4 md:p-10 py-10 bg-white">
          <div className="max-w-4xl mx-auto space-y-10 pt-8">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
              <div>
                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  Manage <span className="text-brand-red">EMI Plans</span>
                </h2>
                <p className="text-slate-400 text-sm mt-1 font-medium">Create and manage installment structures for paid courses</p>
              </div>
            </header>

        {/* Course Selection using the custom dropdown */}
        <CourseDropdown
          courses={courses}
          selectedCourse={selectedCourse}
          setSelectedCourse={setSelectedCourse}
        />

        {/* Add EMI Plan */}
        {selectedCourse && (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
            <h3 className="text-lg font-bold uppercase tracking-widest text-brand-red mb-8 flex items-center gap-3">
              <div className="w-1.5 h-6 bg-brand-red rounded-full"></div>
              Add New Plan
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Duration</label>
                <input
                  type="text"
                  placeholder="e.g., 3 Months"
                  value={newPlan.duration}
                  onChange={(e) =>
                    setNewPlan({ ...newPlan, duration: e.target.value })
                  }
                  className="w-full bg-gray-50 border border-slate-200 rounded-xl px-5 py-4 text-slate-900 focus:ring-4 focus:ring-brand-red/5 focus:border-brand-red outline-none transition-all placeholder:text-slate-300"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Installment Amount</label>
                <input
                  type="number"
                  placeholder="e.g., 5000"
                  value={newPlan.amount}
                  onChange={(e) =>
                    setNewPlan({ ...newPlan, amount: e.target.value })
                  }
                  className="w-full bg-gray-50 border border-slate-200 rounded-xl px-5 py-4 text-slate-900 focus:ring-4 focus:ring-brand-red/5 focus:border-brand-red outline-none transition-all placeholder:text-slate-300"
                />
              </div>
            </div>
            <button
              onClick={addEmiPlan}
              className="w-full bg-brand-red text-white py-5 rounded-xl font-bold uppercase tracking-widest hover:shadow-lg hover:shadow-red-500/20 transition-all transform hover:scale-[1.01] active:scale-95"
            >
              Add EMI Plan
            </button>
          </div>
        )}

        {/* List EMI Plans */}
        {selectedCourse && emiPlans.length > 0 && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold uppercase tracking-widest text-[#b0a102] flex items-center gap-3">
              <div className="w-1.5 h-6 bg-[#b0a102] rounded-full"></div>
              Active EMI Plans
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {emiPlans.map((plan) => (
                <div
                  key={plan.id}
                  className="bg-white border border-slate-200 rounded-2xl p-6 flex justify-between items-center shadow-sm hover:border-[#b0a102]/30 transition-all group"
                >
                  <div>
                    <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Plan Structure</p>
                    <p className="text-lg font-extrabold text-slate-900 group-hover:text-[#b0a102] transition-colors">
                      {plan.duration} Months
                    </p>
                    <p className="text-sm font-bold text-slate-500 mt-1">₹{plan.amount}</p>
                  </div>
                  <button
                    onClick={() => deleteEmiPlan(plan.id)}
                    className="p-3 bg-slate-50 text-red-500 rounded-xl hover:bg-red-600 hover:text-white transition-all border border-slate-100 shadow-sm"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
    </div>
  </div>
  );
};

export default AdminPanel;
