import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../../components/sections/Header/Header";

const SubmissionSuccess = () => {
  const location = useLocation(); // Retrieve data passed from the previous page
  const navigate = useNavigate();

  // Extract data from location state
  const { firstName, availableDate, isNewUser } = location.state || {};

  const handleExploreMore = () => {
    navigate("/home"); // Redirect to home page
  };

  return (
    <>
      <div id="top-sentinel" className="absolute top-0 left-0 w-full h-px pointer-events-none z-[-1]" />
      <Header />
      <div className="min-h-screen bg-gray-50/50 pt-28 pb-20 px-4 flex items-center justify-center relative z-10">
        <div className="admin-card p-10 md:p-16 w-full max-w-2xl text-center bg-white">
          
          {/* Success Icon */}
          <div className="w-24 h-24 bg-green-50 border-4 border-green-100 rounded-full flex items-center justify-center mx-auto mb-10 shadow-lg shadow-green-100">
            <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/>
            </svg>
          </div>

          <h4 className="text-[#dd2727] font-black uppercase tracking-[0.3em] text-[10px] mb-4">Cosmic Gateway</h4>
          <h1 className="text-4xl md:text-5xl font-black mb-6 text-slate-900 uppercase tracking-tight">
            Transmission <span className="text-[#dd2727]">Received</span>
          </h1>

          <div className="text-lg text-slate-600 mb-12 leading-relaxed space-y-4 max-w-lg mx-auto">
            {isNewUser && !availableDate ? (
              <p>
                Greetings, <span className="text-slate-900 font-black">{firstName}</span>.{" "}
                Your connection to the celestial network has been established. Our guides will reach out to you shortly to harmonize your schedule.
              </p>
            ) : (
              <p>
                Greetings, <span className="text-slate-900 font-black">{firstName}</span>.{" "}
                Your cosmic appointment is aligned for{" "}
                <span className="text-[#dd2727] font-black">{availableDate}</span>. Our agent will initiate contact then.
              </p>
            )}
          </div>

          <button
            onClick={handleExploreMore}
            className="bg-[#dd2727] text-white px-12 py-4 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] hover:shadow-xl hover:-translate-y-1 transition-all"
          >
            Explore More
          </button>
        </div>
      </div>
    </>
  );
};

export default SubmissionSuccess;

