import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { createUserWithEmailAndPassword, sendEmailVerification, updateProfile } from "firebase/auth";
import { auth } from "../../firebaseConfig";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import Header from "../sections/Header/Header";

const SignUp = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordScore, setPasswordScore] = useState(0);
  const [error, setError] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo");

  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    setLoading(true);
    setError("");
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      alert(`Welcome, ${user.displayName}!`);
      navigate(redirectTo || '/');
    } catch (error) {
      setError("Failed to log in with Google. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handlePasswordChange = (password) => {
    setPassword(password);
    // Simple score: length based
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    setPasswordScore(Math.min(score, 4));
  };

  const handleSignUp = async () => {
    setError("");

    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!username.trim()) {
      setError("Username is required.");
      return;
    }

    if (passwordScore < 3) {
      setError("Password is too weak. Please choose a stronger password.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!acceptedTerms) {
      setError("You must accept the Terms of Service and Privacy Policy to continue.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: username });
      await sendEmailVerification(user);

      alert("Sign-up successful! Please check your email for verification.");
      navigate(redirectTo ? `/login?redirectTo=${encodeURIComponent(redirectTo)}` : "/login");
    } catch (error) {
      setError("Failed to sign up. " + error.message);
    }
  };

  return (
    <>
      <Header />
      <div id="top-sentinel" className="h-0 w-full pt-[70px]"></div>
      <div className="flex items-center justify-center min-h-screen bg-backgroundImage">
      <div className="bg-black bg-opacity-60 p-8 rounded-lg w-full max-w-md">
        <h2 className="text-3xl font-bold text-white mb-6">Sign Up</h2>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full py-2 mb-4 px-4 rounded-full bg-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500"
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full py-2 mb-4 px-4 rounded-full bg-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500"
        />

        <div className="relative mb-4">
          <span
            className="absolute inset-y-0 left-0 flex items-center pl-3 text-white cursor-pointer"
            onClick={togglePasswordVisibility}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => handlePasswordChange(e.target.value)}
            className="w-full py-2 pl-10 pr-3 rounded-full bg-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        <div className="flex items-center mb-4">
          <div className="flex-1 bg-gray-300 h-2 rounded">
            <div
              className={`h-full rounded ${passwordScore >= 3 ? "bg-green-500" : "bg-red-500"}`}
              style={{ width: `${(passwordScore + 1) * 20}%` }}
            ></div>
          </div>
          <span className="ml-2 text-green-500 text-sm">
            {["Weak", "Fair", "Good", "Strong", "Very Strong"][passwordScore]}
          </span>
        </div>

        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full py-2 mb-4 px-4 rounded-full bg-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500"
        />

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <div className="mb-4">
          <label className="flex items-center text-gray-300">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={() => setAcceptedTerms(!acceptedTerms)}
              className="form-checkbox h-4 w-4 text-red-500"
            />
            <span className="ml-2">
              I agree to the <Link to="/terms" className="underline text-white">Terms of Service</Link> and <Link to="/privacy-policy" className="underline text-white">Privacy Policy</Link>.
            </span>
          </label>
        </div>

        <button
          onClick={handleSignUp}
          className="w-full py-2 mt-4 bg-red-500 text-white font-semibold rounded-full hover:bg-red-600"
          disabled={!acceptedTerms}
        >
          Sign Up
        </button>

        <button
          onClick={handleGoogleLogin}
          className={`w-full py-2 mt-4 font-semibold rounded-full ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-red-500 hover:bg-red-600 text-white"}`}
          disabled={loading}
        >
          {loading ? "Logging In..." : "Sign In with Google"}
        </button>

        <p className="text-center text-gray-300 mt-4">
          Already have an account? <Link to={redirectTo ? `/login?redirectTo=${encodeURIComponent(redirectTo)}` : "/login"} className="text-white underline">Login</Link>
        </p>
      </div>
    </div>
    </>
  );
};

export default SignUp;
