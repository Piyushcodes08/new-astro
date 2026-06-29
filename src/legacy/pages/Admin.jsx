import React, { useState, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  IoIosArrowBack,
  IoIosPaper,
  IoIosCalendar,
  IoIosAddCircle,
  IoIosListBox,
  IoIosVideocam,
  IoIosPeople,
  IoIosCash,
  IoIosStats,
  IoIosCard,
  IoIosHelpCircle,
  IoIosContact,
  IoIosChatbubbles,
  IoIosCart,
  IoIosPlay,
  IoIosList
} from "react-icons/io";

const AdminSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const sidebarRef = useRef(null);
  const location = useLocation();

  // Menu items exactly matching old folder Admin.jsx (14 items)
  const menuGroups = [
    {
      group: "Content Management",
      items: [
        { title: "ADD ARTICLES",    path: "/admin/adminarticle",           icon: <IoIosPaper size={20} /> },
        { title: "ADD COURSE",      path: "/admin/addcourse",               icon: <IoIosAddCircle size={20} /> },
        { title: "ADD PRODUCT",     path: "/admin/addproduct",              icon: <IoIosCart size={20} /> },
        { title: "ADD MODULE",      path: "/admin/addmodule",               icon: <IoIosListBox size={20} /> },
        { title: "ADD LIVE SESSION",path: "/admin/addmeeting",              icon: <IoIosVideocam size={20} /> },
      ]
    },
    {
      group: "Users & Payments",
      items: [
        { title: "SUBSCRIBE LIST",  path: "/admin/adminsubscribecourselist",icon: <IoIosPeople size={20} /> },
        { title: "ADD EMI PLANS",   path: "/admin/addemi",                  icon: <IoIosCash size={20} /> },
        { title: "TRACK EMI PLANS", path: "/admin/emailuserlist",           icon: <IoIosStats size={20} /> },
        { title: "PAYMENT LIST",    path: "/admin/payment",                 icon: <IoIosCard size={20} /> },
      ]
    },
    {
      group: "Support",
      items: [
        { title: "COURSE INQUIRY",  path: "/admin/admininquiry",            icon: <IoIosHelpCircle size={20} /> },
        { title: "CONTACTUS INQUIRY",path: "/admin/admincontact",           icon: <IoIosContact size={20} /> },
        { title: "APPOINTMENTS",     path: "/admin/appointments",            icon: <IoIosCalendar size={20} /> },
        { title: "QUESTION & ANS",  path: "/admin/question-ans",            icon: <IoIosChatbubbles size={20} /> },
      ]
    },
    {
      group: "Operations",
      items: [
        { title: "COURSE ORDER",    path: "/admin/admincourseorder",        icon: <IoIosCart size={20} /> },
        { title: "VIDEO ORDER",     path: "/admin/vedio-order",             icon: <IoIosPlay size={20} /> },
      ]
    }
  ];


  return (
    <>
      {/* Toggle Button for Mobile */}
      {!isOpen && (
        <button
          className="lg:hidden fixed top-24 left-4 bg-white text-brand-red p-3 rounded-2xl shadow-lg z-100 transition-all border border-brand-red/10"
          onClick={() => setIsOpen(true)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
      )}

      {/* Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-2050 lg:hidden"
        ></div>
      )}

      {/* Sidebar - Premium Theme */}
      <aside
        ref={sidebarRef}
        className={`bg-linear-to-b from-brand-red to-[#b91c1c] h-screen lg:h-[calc(100vh-64px)] md:w-64 w-[300px] fixed lg:sticky top-0 lg:top-16 left-0 transition-all duration-500 ease-in-out z-2100 overflow-y-auto scrollbar-hide self-start ${
          isOpen ? "translate-x-0 shadow-[20px_0_60px_rgba(0,0,0,0.5)]" : "-translate-x-full lg:translate-x-0 lg:shadow-[10px_0_40px_rgba(191, 6, 3,0.15)]"
        }`}
      >
        <div className="pt-8 px-4 space-y-10 pb-12">
          {/* Header Section */}
          <div className="flex justify-between items-center px-2 pt-16 lg:pt-0">
            <div className="space-y-1">
              <h2 className="text-xl font-black text-white tracking-tighter">VAHLAY <span className="text-white/40 font-light">ADMIN</span></h2>
              <p className="text-[8px] text-white/60 font-bold uppercase tracking-[0.4em] leading-none">Management Console</p>
            </div>
 
            <button
              className="lg:hidden flex items-center gap-2 px-3 py-1 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-all border border-white/10"
              onClick={() => setIsOpen(false)}
            >
              <span className="text-[10px] font-bold uppercase tracking-widest">Close</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <nav className="space-y-8">
            {menuGroups.map((group, gIdx) => (
              <div key={gIdx} className="space-y-3">
                <h3 className="px-5 text-[9px] font-black text-white/40 uppercase tracking-[0.25em]">{group.group}</h3>
                <div className="space-y-1">
                  {group.items.map((item, index) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <Link
                        key={index}
                        to={item.path}
                        onClick={() => window.innerWidth < 1024 && setIsOpen(false)}
                        className={`flex items-center gap-4 px-5 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden ${
                          isActive 
                          ? "bg-white text-brand-red shadow-[0_10px_20px_rgba(0,0,0,0.1)] border border-white" 
                          : "text-white/70 hover:text-white hover:bg-white/10"
                        }`}
                      >
                        <span className={`transition-transform duration-500 ${isActive ? "scale-110" : "group-hover:scale-110"}`}>
                          {item.icon}
                        </span>
                        <span className={`text-[10px] font-black uppercase tracking-widest transition-all ${isActive ? "translate-x-1" : "group-hover:translate-x-1"}`}>
                          {item.title}
                        </span>
                        {isActive && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-brand-red rounded-r-full"></div>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;

