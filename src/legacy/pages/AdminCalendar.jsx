import React, { useState, useEffect } from "react";
import SideBar from "./Admin";
import Header from "../../components/sections/Header/Header";
import Footer from "../../components/sections/Footer/Footer";
import { db } from "../../firebaseConfig";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

import { Link } from "react-router-dom";

const AdminCalendar = () => {
  // ORIGINAL LOGIC: State from old folder
  const [calendarEntries, setCalendarEntries] = useState([]);
  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCalendarEntries();
  }, []);

  const fetchCalendarEntries = async () => {
    setIsLoading(true);
    try {
      const data = await getDocs(collection(db, "Calendar"));
      const entries = data.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      setCalendarEntries(entries);
    } catch (error) {
      console.error("Error fetching calendar entries:", error);
    }
    setIsLoading(false);
  };

  const handleAddCalendarEntry = async () => {
    if (!date || !timeSlot) return;
    try {
      const newEntry = { date, timeSlot };
      await addDoc(collection(db, "Calendar"), newEntry);
      fetchCalendarEntries();
      setDate("");
      setTimeSlot("");
    } catch (error) {
      console.error("Error adding calendar entry:", error);
    }
  };

  const handleDeleteCalendarEntry = async (id) => {
    if (!window.confirm("Are you sure you want to delete this slot?")) return;
    try {
      await deleteDoc(doc(db, "Calendar", id));
      fetchCalendarEntries();
    } catch (error) {
      console.error("Error deleting calendar entry:", error);
    }
  };

  return (
    <div className="admin-layout">
      <div id="top-sentinel" className="absolute top-0 left-0 w-full h-px pointer-events-none z-[-1]" />
      <Header />
      <div className="flex flex-col md:flex-row min-h-screen pt-16 relative z-10 admin-fluid-container gap-0">
        <SideBar />

        <main className="flex-1 min-w-0 py-10 px-[15px] md:px-[50px] bg-white">
          <div className="space-y-8">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pt-8">
              <div>
                {/* ORIGINAL TITLE: Manage Calendar */}
                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  Manage <span className="text-[#dd2727]">Calendar</span>
                </h2>
                <p className="text-slate-400 text-sm mt-1 font-medium">Update celestial availability slots</p>
              </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              {/* Add Entry Form */}
              <div className="lg:col-span-1">
                <div className="bg-white border border-slate-200 rounded-2xl p-10 shadow-xl shadow-slate-200/50 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#dd2727]/5 rounded-full blur-3xl"></div>
                  <h3 className="text-xl font-bold text-slate-900 mb-8 uppercase tracking-widest flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-[#dd2727] rounded-full"></div>
                    New Appointment
                  </h3>
                  
                  <form className="space-y-6 relative z-10">
                    <div className="space-y-2">
                      {/* ORIGINAL LABEL: Select Date */}
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Select Date</label>
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 text-gray-900 focus:ring-2 focus:ring-[#dd2727] outline-none transition-all"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      {/* ORIGINAL LABEL: Select Time Slot */}
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Select Time Slot</label>
                      <input
                        type="time"
                        value={timeSlot}
                        onChange={(e) => setTimeSlot(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 text-gray-900 focus:ring-2 focus:ring-[#dd2727] outline-none transition-all"
                      />
                    </div>

                    {/* ORIGINAL BUTTON: Add Calendar Entry */}
                    <button
                      onClick={handleAddCalendarEntry}
                      type="button"
                      className="w-full bg-[#dd2727] text-white py-5 rounded-xl font-bold uppercase tracking-widest hover:shadow-lg hover:shadow-red-500/30 transition-all transform hover:scale-[1.02] active:scale-95 mt-4"
                    >
                      Add Entry
                    </button>
                  </form>
                </div>
              </div>

              {/* Entries List */}
              <div className="lg:col-span-2">
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                    <span className="w-1.5 h-6 bg-[#b0a102] rounded-full"></span>
                    Scheduled Transmissions
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {isLoading ? (
                      Array(4).fill(0).map((_, i) => (
                        <div key={i} className="h-32 bg-white/5 border border-white/5 rounded-[2.5rem] animate-pulse"></div>
                      ))
                    ) : calendarEntries.length > 0 ? (
                      calendarEntries.map((entry) => (
                        <div
                          key={entry.id}
                          className="group bg-white border border-slate-200 rounded-2xl p-8 hover:border-[#dd2727]/30 transition-all duration-500 shadow-sm hover:shadow-xl relative overflow-hidden"
                        >
                          <div className="absolute top-0 right-0 w-24 h-24 bg-[#b0a102]/5 rounded-full blur-2xl group-hover:bg-[#b0a102]/10 transition-all"></div>
                          <div className="flex justify-between items-center relative z-10">
                            <div className="space-y-1">
                              <p className="text-xl font-bold text-slate-900 group-hover:text-[#dd2727] transition-colors">{entry.date}</p>
                              <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#dd2727]"></span>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{entry.timeSlot}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleDeleteCalendarEntry(entry.id)}
                              className="p-4 bg-slate-50 text-slate-400 hover:bg-red-600 hover:text-white rounded-xl transition-all border border-slate-100"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-full py-20 text-center bg-white/5 border border-white/5 rounded-[3rem] border-dashed">
                        <p className="text-gray-500 font-bold uppercase tracking-widest">No slots defined in the cosmos</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default AdminCalendar;

