import React, { useState, useEffect } from "react";
import { db } from "../../firebaseConfig";
import { doc, setDoc, updateDoc, arrayUnion, getDoc, collection, getDocs } from "firebase/firestore";
import { useNavigate, useParams } from "react-router-dom";
import ReCAPTCHA from 'react-google-recaptcha';
import Select from 'react-select';
import { auth } from "../../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import Header from "../../components/sections/Header/Header";
import Footer from "../../components/sections/Footer/Footer";

const EnrollPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const { courseId } = useParams();
  const [selectedCourse, setSelectedCourse] = useState(courseId || "");
  const [courses, setCourses] = useState([]);
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setEmail(user.email || "");
        setName(user.displayName || "");

        // Check if user is already enrolled to prevent double-asking
        try {
          const userRef = doc(db, "subscriptions", user.email);
          const docSnap = await getDoc(userRef);

          if (docSnap.exists()) {
            const userData = docSnap.data();

            // Pre-fill phone if we have it
            if (userData.phone && !phone) {
              setPhone(userData.phone);
            }

            // Check enrollment in freecourses or DETAILS
            const isEnrolledFree = userData.freecourses && userData.freecourses.includes(selectedCourse);
            const isEnrolledPaid = userData.DETAILS && userData.DETAILS.some(d => Object.keys(d)[0] === selectedCourse);

            if ((isEnrolledFree || isEnrolledPaid) && selectedCourse) {
              console.log("User already enrolled, redirecting to course...");
              navigate(`/course/${encodeURIComponent(selectedCourse)}`);
            }
          }
        } catch (err) {
          console.error("Error checking enrollment status:", err);
        }
      }
    });
    return () => unsubscribe();
  }, [selectedCourse, navigate]);

  useEffect(() => {
    if (courseId) {
      setSelectedCourse(courseId);
    }
  }, [courseId]);

  const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const freeCoursesCollection = collection(db, 'freeCourses');
        console.log(freeCoursesCollection)
        const freeCoursesSnapshot = await getDocs(freeCoursesCollection);
        const freeCourses = freeCoursesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCourses([...freeCourses]);
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };
    fetchCourses();

  }, []);

  const handleRecaptchaChange = (value) => {
    setRecaptchaToken(value);
  };

  const handleEnroll = async (e) => {
    e.preventDefault();
    if (!name || !email || !phone || !selectedCourse) {
      alert("Please fill out all fields.");
      return;
    }
    if (recaptchaSiteKey && !recaptchaToken) {
      alert("Please verify the reCAPTCHA.");
      return;
    }
    const userRef = doc(db, "subscriptions", email);


    try {
      const docSnap = await getDoc(userRef);

      if (docSnap.exists()) {
        const userData = docSnap.data();
        if (userData.freecourses && userData.freecourses.includes(selectedCourse)) {
          alert("You are already enrolled in this course.");
          navigate("/dashboard");
          return;
        }
        await updateDoc(userRef, {
          freecourses: arrayUnion(selectedCourse),
        });
      } else {
        await setDoc(userRef, {
          freecourses: [selectedCourse],
          name,
          email,
          phone,
        });
      }
      alert("You have successfully enrolled!");
      navigate("/enrolledcourse");
    } catch (error) {
      console.error("Error adding document: ", error);
      alert("There was an error processing your enrollment. Please try again.");
    }
  };

  const customSelectStyles = {
    control: (provided, state) => ({
      ...provided,
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderColor: state.isFocused ? '#bf0603' : 'rgba(255, 255, 255, 0.1)',
      borderRadius: '0.75rem',
      padding: '0.25rem',
      boxShadow: state.isFocused ? '0 0 0 2px rgba(191, 6, 3, 0.3)' : 'none',
      '&:hover': {
        borderColor: '#bf0603'
      },
      cursor: 'pointer',
      opacity: 1
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: '#0a0a0a',
      borderRadius: '0.75rem',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      overflow: 'hidden',
      zIndex: 50
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#bf0603' : state.isFocused ? 'rgba(191, 6, 3, 0.2)' : 'transparent',
      color: 'white',
      cursor: 'pointer',
      '&:active': {
        backgroundColor: '#bf0603'
      }
    }),
    singleValue: (provided) => ({
      ...provided,
      color: 'white'
    }),
    input: (provided) => ({
      ...provided,
      color: 'white'
    }),
    placeholder: (provided) => ({
      ...provided,
      color: '#9ca3af'
    })
  };

  const courseOptions = courses.map(c => ({ value: c.id, label: c.id }));
  const selectedOption = courseOptions.find(opt => opt.value === selectedCourse) || null;

  return (
    <>
      <Header />
      <div id="top-sentinel" className="h-0 w-full pt-[70px]"></div>
      <div className="min-h-screen flex items-center justify-center py-12 px-4 relative z-10">
        <div className="bg-black/60 backdrop-blur-xl border border-white/10 p-8 rounded-3xl w-full max-w-lg shadow-[0_0_40px_rgba(191, 6, 3,0.2)]">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-white">
            Enroll for <span className="text-brand-red">Free</span>
          </h2>
          <p className="text-center mb-8 text-gray-300">
            Join our course and begin your journey into the world of astrology!
          </p>
          <form onSubmit={handleEnroll} className="space-y-6">
            <div className="flex flex-col">
              <label htmlFor="name" className="text-sm font-medium text-gray-300 mb-2 uppercase tracking-wider">Name</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent transition-all"
                required
              />
            </div>

            <div className="flex flex-col">
              <label htmlFor="email" className="text-sm font-medium text-gray-300 mb-2 uppercase tracking-wider">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent transition-all"
                required
              />
            </div>

            <div className="flex flex-col">
              <label htmlFor="phone" className="text-sm font-medium text-gray-300 mb-2 uppercase tracking-wider">Phone</label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter phone number with country code"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent transition-all"
                required
              />
            </div>

            <div className="flex flex-col">
              <label htmlFor="course" className="text-sm font-medium text-gray-300 mb-2 uppercase tracking-wider">Course</label>
              <Select
                id="course"
                value={selectedOption}
                onChange={(option) => setSelectedCourse(option ? option.value : '')}
                options={courseOptions}
                styles={customSelectStyles}
                placeholder="Select a course"
                className="react-select-container"
                classNamePrefix="react-select"
                isClearable={!courseId}
                required
              />
            </div>

            {recaptchaSiteKey ? (
              <div className="flex justify-center mt-4">
                <ReCAPTCHA
                  sitekey={recaptchaSiteKey}
                  onChange={handleRecaptchaChange}
                  theme="dark"
                />
              </div>
            ) : (
              <p className="text-yellow-400 text-sm text-center font-medium bg-yellow-400/10 py-2 px-4 rounded-lg">
                ReCAPTCHA configuration is missing. You can proceed without it for now.
              </p>
            )}

            <button
              type="submit"
              className="w-full py-4 mt-4 bg-linear-to-r from-brand-red to-[#b0a102] text-white font-bold uppercase tracking-[0.2em] rounded-xl hover:shadow-[0_0_20px_rgba(191, 6, 3,0.5)] transform hover:scale-[1.02] transition-all duration-300"
            >
              Enroll Now
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default EnrollPage;

