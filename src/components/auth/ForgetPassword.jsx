import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../firebaseConfig";
import { Link } from "react-router-dom";

const Forgetpassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      if (!email) {
        setError("Please enter a valid email address.");
        return;
      }
      await sendPasswordResetEmail(auth, email);
      setMessage("Password reset email sent! Please check your inbox.");
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      const errorMessage = err.message.includes("auth/user-not-found")
        ? "No user found with this email address."
        : "Error: " + err.message;
      setError(errorMessage);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-center min-h-screen bg-backgroundImage">
        <div className="bg-black bg-opacity-60 p-8 rounded-lg w-full max-w-md">
          <h2 className="text-3xl font-bold text-white mb-6">Reset Password</h2>

          <input
            type="email"
            placeholder="Enter Your Registered Email"
            value={email}
            onChange={handleChange}
            className="w-full py-2 mb-4 px-4 rounded-full bg-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500"
            aria-label="Email"
          />

          {error && (
            <p className="text-white bg-red-500 p-2 rounded mb-4 text-sm">
              {error}
            </p>
          )}

          {message && (
            <p className="text-white bg-green-500 p-2 rounded mb-4 text-sm">
              {message}
            </p>
          )}

          <button
            onClick={handleSubmit}
            className="w-full bg-red-500 text-white py-2 rounded-md hover:bg-red-700 transition duration-300"
          >
            Reset Password
          </button>

          <p className="text-center text-gray-300 mt-4">
            <Link to="/login" className="text-white underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Forgetpassword;
