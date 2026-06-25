import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import {
    IoIosContact,
    IoIosLogOut
} from "react-icons/io";

const Aside = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [formData, setFormData] = useState({
        profilePic: "",
        fullName: "Student",
    });

    const navigate = useNavigate();
    const location = useLocation();
    const db = getFirestore();
    const auth = getAuth();
    const sidebarRef = useRef();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                sidebarOpen &&
                sidebarRef.current &&
                !sidebarRef.current.contains(event.target) &&
                window.innerWidth < 1024
            ) {
                setSidebarOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [sidebarOpen]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                const userDocRef = doc(db, "students", currentUser.uid);
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    setFormData({
                        profilePic: userData.profilePic || "",
                        fullName: userData.fullName || "Student",
                    });
                }
            } else {
                navigate("/login");
            }
        });
        return () => unsubscribe();
    }, [db, auth, navigate]);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate("/");
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    const menuItems = [
        { title: "My Profile", path: "/profile", icon: IoIosContact },
        { title: "Enrolled Courses", path: "/enrolledcourse", icon: IoIosContact },
        { title: "Add Courses", path: "/courses", icon: IoIosContact },
        { title: "Payments", path: "/finalize", icon: IoIosContact },
    ];

  return (
    <>
      {/* Mobile Toggle Button - Sleek Premium Red Floating Button */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden fixed top-24 left-6 w-14 h-14 bg-[#dd2727] text-white rounded-xl shadow-[0_10px_30px_rgba(221,39,39,0.3)] z-[100] border border-white/10 flex items-center justify-center transform hover:scale-110 active:scale-95 transition-all duration-300 group"
        >
          <div className="flex flex-col gap-1.5 items-center justify-center">
            <span className="w-6 h-0.5 bg-white rounded-full transition-all group-hover:w-4" />
            <span className="w-6 h-0.5 bg-white rounded-full" />
            <span className="w-4 h-0.5 bg-white rounded-full transition-all group-hover:w-6" />
          </div>
        </button>
      )}

      {/* Mobile Overlay - Darker Glassmorphism */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/70 backdrop-blur-md z-[2050] lg:hidden animate-in fade-in duration-500"
        ></div>
      )}

      <aside
        ref={sidebarRef}
        className={`fixed lg:sticky top-0 lg:top-16 left-0 w-64 bg-[#dd2727] transition-all duration-700 cubic-bezier(0.4, 0, 0.2, 1) transform z-[2100] flex flex-col h-screen lg:h-[calc(100vh-64px)] overflow-hidden self-start border-r border-white/10
        ${sidebarOpen ? "translate-x-0 shadow-[40px_0_100px_rgba(0,0,0,0.6)]" : "-translate-x-full lg:translate-x-0 lg:shadow-none"}`}
      >
        {/* Close Button for Mobile - Elegant Top Bar */}
        <div className="lg:hidden flex items-center justify-between p-6 pb-0 pt-20">
            <span className="text-white/40 text-[9px] font-black uppercase tracking-[0.4em]">Student Portal</span>
            <button
                onClick={() => setSidebarOpen(false)}
                className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-lg text-white hover:bg-white/20 transition-all border border-white/10 group"
            >
                <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </div>

        {/* Profile Section - Premium Centered Look */}
        <div className="flex flex-col items-center flex-shrink-0 text-center px-6 pt-8 pb-6">
          <div className="relative group">
            <div className="absolute -inset-2 bg-white/20 rounded-full blur opacity-0 group-hover:opacity-100 transition duration-1000"></div>
            <div className="relative w-24 h-24 rounded-full border-4 border-white/30 overflow-hidden shadow-2xl mb-4 bg-white/5 flex items-center justify-center">
              {formData.profilePic ? (
                <img
                  src={formData.profilePic}
                  alt="Profile"
                  className="w-full h-full object-cover transition-transform duration-1000"
                />
              ) : (
                <IoIosContact size={40} className="text-white/30" />
              )}
            </div>
          </div>
          <h2 className="text-white text-xl font-black tracking-tight uppercase px-2 leading-tight">{formData.fullName}</h2>
          <div className="flex items-center gap-2 mt-2">
            <div className="w-1 h-1 rounded-full bg-white animate-pulse"></div>
            <p className="text-[9px] text-white/50 uppercase tracking-[0.4em] font-black">Sacred Seeker</p>
          </div>
        </div>

        {/* Navigation Menu - Clean & Classic */}
        <nav className="flex-1 overflow-y-auto custom-scrollbar px-6 space-y-3 pb-8 mt-6">
          {menuItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={index}
                onClick={() => {
                  navigate(item.path);
                  if (window.innerWidth < 1024) setSidebarOpen(false);
                }}
                className={`w-full text-left flex items-center gap-3 px-5 py-3 rounded transition-all duration-300 font-semibold uppercase text-[10px] tracking-[0.2em]
                ${isActive
                  ? "bg-white text-[#dd2727] shadow-lg"
                  : "bg-white/10 text-white/90 hover:bg-white/15 hover:translate-x-0.5"}`}
              >
                <span>{item.title}</span>
              </button>
            );
          })}
        </nav>

        {/* Logout Section - Fixed at Bottom */}
        <div className="border-t border-white/10 bg-black/10 mt-auto flex-shrink-0">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-4 px-6 py-4 rounded-lg font-black text-white bg-white/5 hover:bg-white/10 border border-white/5 transition-all uppercase tracking-[0.3em] text-[9px] group"
          >
            <IoIosLogOut size={18} className="group-hover:translate-x-1 transition-transform" />
            Logout Session
          </button>
        </div>
      </aside>
    </>
  );
};

export default Aside;

