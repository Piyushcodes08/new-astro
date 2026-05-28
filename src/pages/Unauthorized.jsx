import React from "react";
import { Link } from "react-router-dom";

const Unauthorized = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-white text-center px-[15px] md:px-[50px]">
      <h1 className="text-5xl font-bold text-red-500 mb-4">403</h1>
      <h2 className="text-2xl font-semibold mb-4">Unauthorized Access</h2>
      <p className="text-white/70 mb-8">You do not have permission to access this page.</p>
      <Link to="/" className="px-8 py-3 bg-red-500 text-white rounded-full font-bold hover:bg-red-600 transition">
        Go Home
      </Link>
    </div>
  );
};

export default Unauthorized;

