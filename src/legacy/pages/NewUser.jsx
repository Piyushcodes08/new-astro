import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/sections/Header/Header";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { app } from "../../firebaseConfig";

const db = getFirestore(app);
const auth = getAuth(app);

const NewUser = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    gender: "",
    dob: { day: "", month: "", year: "" },
    birthTime: { hour: "", minute: "", period: "AM" },
    birthPlace: "",
    email: "",
    phone: "",
    countryCode: "",
    availableDate: "",

    slot: "",
  });

  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(null);
  const [availableData, setAvailableData] = useState([]);
  const navigate = useNavigate();

  // Redirect unauthenticated users to the login page
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/signup");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // Fetch available data for the calendar
  useEffect(() => {
    const fetchAvailableData = async () => {
      try {
        const calendarSnapshot = await getDocs(collection(db, "Calendar"));
        const groupedData = calendarSnapshot.docs.reduce((acc, doc) => {
          const data = doc.data();
          acc[data.date] = acc[data.date] || [];
          acc[data.date].push(data.timeSlot);
          return acc;
        }, {});
        const availableDataList = Object.entries(groupedData).map(([date, timeSlots]) => ({
          date,
          timeSlot: timeSlots,
        }));
        setAvailableData(availableDataList);
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };
    fetchAvailableData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const keys = name.split("."); // Split for nested fields like dob.day
      if (keys.length > 1) {
        return {
          ...prev,
          [keys[0]]: {
            ...prev[keys[0]],
            [keys[1]]: value,
          },
        };
      }
      return { ...prev, [name]: value };
    });
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const validationErrors = {};

    if (formData.dob.day < 1 || formData.dob.day > 31) {
      validationErrors["dob.day"] = "Day must be between 1 and 31.";
    }
    if (formData.dob.month < 1 || formData.dob.month > 12) {
      validationErrors["dob.month"] = "Month must be between 1 and 12.";
    }
    if (!formData.dob.year || formData.dob.year.length !== 4) {
      validationErrors["dob.year"] = "Please enter a valid 4-digit year.";
    }
    if (formData.birthTime.hour < 1 || formData.birthTime.hour > 12) {
      validationErrors["birthTime.hour"] = "Hour must be between 1 and 12.";
    }
    if (formData.birthTime.minute < 0 || formData.birthTime.minute > 59) {
      validationErrors["birthTime.minute"] = "Minutes must be between 0 and 59.";
    }
    if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(formData.email)) {
      validationErrors["email"] = "Invalid email address.";
    }
    if (!/^\d{7,15}$/.test(formData.phone)) {
      validationErrors["phone"] = "Phone number must be between 7 and 15 digits.";
    }
    if (!/^\+\d{1,4}$/.test(formData.countryCode)) {
      validationErrors["countryCode"] = "Invalid country code (e.g., +91).";
    }

    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      const formEndpoint = "https://api.web3forms.com/submit";
      const accessKey = "afc0705d-3423-48a7-a14d-e83d4ffd11e0"; // Replace with your actual W3Forms access key

      // Format dob and birthTime as strings
      const formattedData = {
        ...formData,
        dob: `${formData.dob.day}-${formData.dob.month}-${formData.dob.year}`, // e.g., "01-01-2000"
        birthTime: `${formData.birthTime.hour}:${formData.birthTime.minute} ${formData.birthTime.period}`, // e.g., "10:30 AM"
      };

      const data = {
        access_key: accessKey,
        ...formattedData,
      };

      const response = await fetch(formEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setSuccess("Form submitted successfully! You will receive an email confirmation.");
        setFormData({
          firstName: "",
          lastName: "",
          gender: "",
          dob: { day: "", month: "", year: "" },
          birthTime: { hour: "", minute: "", period: "AM" },
          birthPlace: "",
          email: "",
          phone: "",
          countryCode: "",
          availableDate: "",
          slot: "",
        });
      } else {
        throw new Error("Failed to submit the form.");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setErrors({ submit: "Failed to submit the form. Please try again later." });
    }
  };


  return (
    <>
      <div id="top-sentinel" className="absolute top-0 left-0 w-full h-px pointer-events-none z-[-1]" />
      <Header />
      <div className="min-h-screen bg-[#0a0a0a] text-white pt-[120px] pb-20 px-4 relative z-10">
        <div className="bg-black/60 backdrop-blur-xl border border-white/10 p-8 md:p-12 rounded-[2.5rem] w-full max-w-4xl mx-auto shadow-[0_0_50px_rgba(221,39,39,0.15)]">
          <h1 className="text-3xl md:text-5xl font-bold text-center mb-2 text-white uppercase tracking-tight">
            Book <span className="text-[#dd2727]">Consultation</span>
          </h1>
          <p className="text-center text-gray-400 mb-12 text-sm font-medium uppercase tracking-widest">Map your celestial journey with our expert astrologers</p>

          <form onSubmit={handleSubmit} className="space-y-12">
            {/* Personal Details */}
            <div className="space-y-8">
              <h3 className="text-sm font-bold text-white uppercase tracking-[0.2em] border-b border-white/10 pb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-[#dd2727] rounded-full animate-pulse"></span>
                Celestial Identity
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-2">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Enter first name"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-[#dd2727] transition-all placeholder-gray-600"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-2">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Enter last name"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-[#dd2727] transition-all placeholder-gray-600"
                    required
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-2">Gender Energy</label>
                <div className="flex flex-wrap gap-4">
                  {["Male", "Female", "Other"].map((g) => (
                    <label key={g} className="relative cursor-pointer group">
                      <input
                        type="radio"
                        name="gender"
                        value={g}
                        checked={formData.gender === g}
                        onChange={handleChange}
                        className="peer sr-only"
                      />
                      <div className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-bold uppercase tracking-widest text-gray-400 peer-checked:bg-[#dd2727]/20 peer-checked:border-[#dd2727] peer-checked:text-white transition-all group-hover:bg-white/10">
                        {g}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-2">Birth Day</label>
                  <input
                    type="number"
                    name="dob.day"
                    value={formData.dob.day}
                    onChange={handleChange}
                    placeholder="DD"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-[#dd2727] transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-2">Birth Month</label>
                  <input
                    type="number"
                    name="dob.month"
                    value={formData.dob.month}
                    onChange={handleChange}
                    placeholder="MM"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-[#dd2727] transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-2">Birth Year</label>
                  <input
                    type="number"
                    name="dob.year"
                    value={formData.dob.year}
                    onChange={handleChange}
                    placeholder="YYYY"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-[#dd2727] transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-2">Birth Hour</label>
                  <input
                    type="number"
                    name="birthTime.hour"
                    value={formData.birthTime.hour}
                    onChange={handleChange}
                    placeholder="HH"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-[#dd2727] transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-2">Birth Minute</label>
                  <input
                    type="number"
                    name="birthTime.minute"
                    value={formData.birthTime.minute}
                    onChange={handleChange}
                    placeholder="MM"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-[#dd2727] transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-2">Period</label>
                  <select
                    name="birthTime.period"
                    value={formData.birthTime.period}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-[#dd2727] transition-all appearance-none cursor-pointer"
                  >
                    <option value="AM" className="bg-[#0a0a0a]">AM</option>
                    <option value="PM" className="bg-[#0a0a0a]">PM</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-2">Earthly Birth Place</label>
                <input
                  type="text"
                  name="birthPlace"
                  value={formData.birthPlace}
                  onChange={handleChange}
                  placeholder="City, State, Country"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-[#dd2727] transition-all placeholder-gray-600"
                  required
                />
              </div>
            </div>

            {/* Contact Details */}
            <div className="space-y-8 pt-8 border-t border-white/10">
              <h3 className="text-sm font-bold text-white uppercase tracking-[0.2em] flex items-center gap-2">
                <span className="w-2 h-2 bg-[#b0a102] rounded-full animate-pulse"></span>
                Cosmic Communication
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-2">Country Code</label>
                  <input
                    type="text"
                    name="countryCode"
                    value={formData.countryCode}
                    onChange={handleChange}
                    placeholder="+91"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-[#dd2727] transition-all"
                    required
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-2">Phone Frequency</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-[#dd2727] transition-all"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-2">Aetheric Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="example@celestial.com"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-[#dd2727] transition-all"
                  required
                />
              </div>

              <div className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 space-y-8">
                <h4 className="text-xs font-bold text-[#dd2727] uppercase tracking-[0.2em]">Temporal Selection</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-2">Celestial Date</label>
                    <select
                      name="availableDate"
                      value={formData.availableDate}
                      onChange={handleChange}
                      className="w-full bg-[#0a0a0a] border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-[#dd2727] transition-all appearance-none cursor-pointer"
                      required
                    >
                      <option value="" disabled className="bg-[#0a0a0a]">Select a Date</option>
                      {availableData.map((item) => (
                        <option key={item.date} value={item.date} className="bg-[#0a0a0a]">{item.date}</option>
                      ))}
                    </select>
                  </div>

                  {formData.availableDate && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-2">Time Slot</label>
                      <select
                        name="slot"
                        value={formData.slot}
                        onChange={handleChange}
                        className="w-full bg-[#0a0a0a] border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-[#dd2727] transition-all appearance-none cursor-pointer"
                        required
                      >
                        <option value="" disabled className="bg-[#0a0a0a]">Select a Slot</option>
                        {availableData
                          .find((item) => item.date === formData.availableDate)
                          ?.timeSlot.map((slot) => (
                            <option key={slot} value={slot} className="bg-[#0a0a0a]">{slot}</option>
                          ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-6 bg-gradient-to-r from-[#dd2727] to-[#b0a102] text-white font-bold uppercase tracking-[0.3em] rounded-[1.5rem] hover:scale-[1.02] transition-all shadow-[0_0_30px_rgba(221,39,39,0.4)]"
            >
              Align Destinies
            </button>
          </form>

          {success && (
            <div className="mt-8 p-4 bg-green-500/10 border border-green-500/30 rounded-2xl text-green-400 text-center font-bold uppercase tracking-widest text-xs">
              {success}
            </div>
          )}
          {errors.submit && (
            <div className="mt-8 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-center font-bold uppercase tracking-widest text-xs">
              {errors.submit}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default NewUser;

