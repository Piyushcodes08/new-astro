import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/sections/Header/Header";
import { getAuth, onAuthStateChanged } from "firebase/auth"; // Firebase Authentication
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { app } from "../../firebaseConfig"; // Firebase configuration file

const db = getFirestore(app);
const auth = getAuth(app);

const OldUserAppointment = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dobDay: "",
    dobMonth: "",
    dobYear: "",
    birthHour: "",
    birthMinute: "",
    birthAMPM: "AM",
    birthPlace: "",
    email: "",
    phone: "",
    consultationDetails: "",
    availableDate: "",
    slot: "",
  });

  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(null);
  const [availableData, setAvailableData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/login");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const fetchAvailableData = async () => {
      try {
        const calendarSnapshot = await getDocs(collection(db, "Calendar"));

        const groupedData = calendarSnapshot.docs.reduce((acc, doc) => {
          const data = doc.data();
          const date = data.date;
          const timeSlot = data.timeSlot;

          if (!acc[date]) {
            acc[date] = [];
          }
          acc[date].push(timeSlot);

          return acc;
        }, {});

        const availableDataList = Object.entries(groupedData).map(([date, timeSlots]) => ({
          date,
          timeSlot: timeSlots,
        }));

        setAvailableData(availableDataList);
      } catch (error) {
        console.error("Error fetching available data:", error);
      }
    };

    fetchAvailableData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.lastName) newErrors.lastName = "Last Name is required";
    if (!formData.dobDay || formData.dobDay < 1 || formData.dobDay > 31) {
      newErrors.dobDay = "Invalid Day for Date of Birth";
    }
    if (!formData.dobMonth || formData.dobMonth < 1 || formData.dobMonth > 12) {
      newErrors.dobMonth = "Invalid Month for Date of Birth";
    }
    if (!formData.dobYear || formData.dobYear < 1900 || formData.dobYear > new Date().getFullYear()) {
      newErrors.dobYear = "Invalid Year for Date of Birth";
    }
    if (!formData.phone) newErrors.phone = "Phone Number is required";
    if (!/^\+?\d{10,15}$/.test(formData.phone)) newErrors.phone = "Invalid Phone Number";
    if (!formData.email) newErrors.email = "Email is required";
    if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid Email Format";
    if (!formData.consultationDetails) newErrors.consultationDetails = "Consultation Details are required";
    if (!formData.availableDate) newErrors.availableDate = "Available Date is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const formEndpoint = "https://api.web3forms.com/submit";
      const accessKey = "afc0705d-3423-48a7-a14d-e83d4ffd11e0";

      const formattedData = {
        ...formData,
        dob: `${formData.dobDay}-${formData.dobMonth}-${formData.dobYear}`,
        birthTime: `${formData.birthHour}:${formData.birthMinute} ${formData.birthAMPM}`,
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
        setSuccess(alert("Form submitted successfully! You will receive an email confirmation."));
        setFormData({
          firstName: "",
          lastName: "",
          dobDay: "",
          dobMonth: "",
          dobYear: "",
          birthHour: "",
          birthMinute: "",
          birthAMPM: "AM",
          birthPlace: "",
          email: "",
          phone: "",
          consultationDetails: "",
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
            Recurring <span className="text-[#dd2727]">Guidance</span>
          </h1>
          <p className="text-center text-gray-400 mb-12 text-sm font-medium uppercase tracking-widest">Continue your journey through the celestial realms</p>

          <form onSubmit={handleSubmit} className="space-y-12">
            {/* Name Fields */}
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
                    placeholder="First Name"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-[#dd2727] transition-all placeholder-gray-600"
                  />
                  {errors.firstName && <p className="text-[#dd2727] text-[10px] font-bold uppercase mt-1">{errors.firstName}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-2">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Last Name"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-[#dd2727] transition-all placeholder-gray-600"
                  />
                  {errors.lastName && <p className="text-[#dd2727] text-[10px] font-bold uppercase mt-1">{errors.lastName}</p>}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-2">Day</label>
                  <input
                    type="number"
                    name="dobDay"
                    value={formData.dobDay}
                    onChange={handleChange}
                    placeholder="DD"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-[#dd2727] transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-2">Month</label>
                  <input
                    type="number"
                    name="dobMonth"
                    value={formData.dobMonth}
                    onChange={handleChange}
                    placeholder="MM"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-[#dd2727] transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-2">Year</label>
                  <input
                    type="number"
                    name="dobYear"
                    value={formData.dobYear}
                    onChange={handleChange}
                    placeholder="YYYY"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-[#dd2727] transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-2">Hour</label>
                  <input
                    type="number"
                    name="birthHour"
                    value={formData.birthHour}
                    onChange={handleChange}
                    placeholder="HH"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-[#dd2727] transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-2">Minute</label>
                  <input
                    type="number"
                    name="birthMinute"
                    value={formData.birthMinute}
                    onChange={handleChange}
                    placeholder="MM"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-[#dd2727] transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-2">AM/PM</label>
                  <select
                    name="birthAMPM"
                    value={formData.birthAMPM}
                    onChange={handleChange}
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-[#dd2727] transition-all appearance-none cursor-pointer"
                  >
                    <option value="AM" className="bg-[#0a0a0a]">AM</option>
                    <option value="PM" className="bg-[#0a0a0a]">PM</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-2">Birth Place</label>
                <input
                  type="text"
                  name="birthPlace"
                  value={formData.birthPlace}
                  onChange={handleChange}
                  placeholder="Enter Birth Place"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-[#dd2727] transition-all placeholder-gray-600"
                />
              </div>
            </div>

            {/* Contact Details */}
            <div className="space-y-8 pt-8 border-t border-white/10">
              <h3 className="text-sm font-bold text-white uppercase tracking-[0.2em] flex items-center gap-2">
                <span className="w-2 h-2 bg-[#b0a102] rounded-full animate-pulse"></span>
                Celestial Channels
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-2">Phone</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Phone Number"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-[#dd2727] transition-all"
                  />
                  {errors.phone && <p className="text-[#dd2727] text-[10px] font-bold uppercase mt-1">{errors.phone}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email Address"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-[#dd2727] transition-all"
                  />
                  {errors.email && <p className="text-[#dd2727] text-[10px] font-bold uppercase mt-1">{errors.email}</p>}
                </div>
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

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-2">Consultation Intent</label>
                <textarea
                  name="consultationDetails"
                  value={formData.consultationDetails}
                  onChange={handleChange}
                  placeholder="What cosmic questions do you seek answers to?"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-[#dd2727] transition-all h-32 placeholder-gray-600"
                />
                {errors.consultationDetails && <p className="text-[#dd2727] text-[10px] font-bold uppercase mt-1">{errors.consultationDetails}</p>}
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

export default OldUserAppointment;

