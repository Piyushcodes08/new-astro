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
                        fullName: userData.fullName || currentUser.displayName || "Student",
                    });
                } else {
                    setFormData({
                        profilePic: "",
                        fullName: currentUser.displayName || "Student",
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
      {/* Mobile Toggle Button */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden fixed top-24 left-4 w-12 h-12 border border-[rgba(212,175,104,0.35)] bg-[#1e1b17] text-[#d4af68] rounded shadow-[0_8px_24px_rgba(0,0,0,0.5)] z-[100] flex items-center justify-center transition-all duration-300 hover:border-[rgba(212,175,104,0.7)] hover:bg-[#220808]"
        >
          <div className="flex flex-col gap-1.5 items-center justify-center">
            <span className="w-5 h-px bg-current rounded-full" />
            <span className="w-5 h-px bg-current rounded-full" />
            <span className="w-3 h-px bg-current rounded-full" />
          </div>
        </button>
      )}

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[2050] lg:hidden"
        />
      )}

      <aside
        ref={sidebarRef}
        className={`fixed lg:sticky top-0 lg:top-16 left-0 w-60 bg-[#161412] border-r border-[rgba(212,175,104,0.12)] transition-transform duration-500 z-[2100] flex flex-col h-screen lg:h-[calc(100vh-64px)] overflow-hidden self-start
        ${sidebarOpen ? "translate-x-0 shadow-[30px_0_80px_rgba(0,0,0,0.7)]" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* Top gold accent line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(212,175,104,0.4)] to-transparent" />

        {/* Mobile close bar */}
        <div className="lg:hidden flex items-center justify-between px-5 pb-0 pt-20">
          <span className="text-[rgba(255,255,255,0.3)] text-[8px] font-black uppercase tracking-[0.4em]">Student Portal</span>
          <button
            onClick={() => setSidebarOpen(false)}
            className="w-9 h-9 flex items-center justify-center border border-[rgba(212,175,104,0.2)] rounded text-[rgba(255,255,255,0.5)] hover:border-[rgba(212,175,104,0.5)] hover:text-[#d4af68] transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Profile Section */}
        <div className="flex flex-col items-center text-center px-5 pt-8 pb-6 border-b border-[rgba(212,175,104,0.08)]">
          <div className="relative mb-4">
            <div className="w-20 h-20 rounded border-2 border-[rgba(212,175,104,0.3)] overflow-hidden bg-[#1e1b17] flex items-center justify-center shadow-[0_8px_24px_rgba(0,0,0,0.5)]">
              {formData.profilePic ? (
                <img src={formData.profilePic} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <IoIosContact size={36} className="text-[rgba(212,175,104,0.4)]" />
              )}
            </div>
            {/* Gold corner accents */}
            <span className="absolute top-0 left-0 h-3 w-3 border-l border-t border-[rgba(212,175,104,0.6)]" />
            <span className="absolute bottom-0 right-0 h-3 w-3 border-r border-b border-[rgba(212,175,104,0.6)]" />
          </div>
          <h2 className="font-serif text-base text-[#fff8eb] tracking-wide">{formData.fullName}</h2>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#d4af68] opacity-70" />
            <p className="text-[8px] text-[rgba(255,255,255,0.3)] uppercase tracking-[0.4em] font-bold">Sacred Seeker</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto custom-scrollbar px-4 space-y-1.5 py-5">
          {menuItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={index}
                onClick={() => {
                  navigate(item.path);
                  if (window.innerWidth < 1024) setSidebarOpen(false);
                }}
                className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded transition-all duration-300 font-bold uppercase text-[9px] tracking-[0.2em]
                ${isActive
                  ? "bg-[rgba(212,175,104,0.12)] border border-[rgba(212,175,104,0.35)] text-[#d4af68]"
                  : "border border-transparent text-[rgba(255,255,255,0.45)] hover:bg-[rgba(212,175,104,0.06)] hover:border-[rgba(212,175,104,0.15)] hover:text-[rgba(212,175,104,0.8)]"}`}
              >
                <span>{item.title}</span>
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="border-t border-[rgba(212,175,104,0.08)] flex-shrink-0 p-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded border border-[rgba(255,255,255,0.07)] text-[rgba(255,255,255,0.35)] hover:border-[rgba(212,175,104,0.25)] hover:text-[rgba(212,175,104,0.7)] transition-all uppercase tracking-[0.25em] text-[9px] font-bold group"
          >
            <IoIosLogOut size={15} className="group-hover:translate-x-0.5 transition-transform" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Aside;

