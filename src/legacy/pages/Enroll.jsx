
import React, { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../firebaseConfig";
import { useNavigate } from "react-router-dom";
import { doc, setDoc, updateDoc, getDoc, collection, getDocs, addDoc } from "firebase/firestore";
import { isValidPhoneNumber } from "libphonenumber-js";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import ReCAPTCHA from "react-google-recaptcha";
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";
import countryData from "./Countrycode.json";
import Select from "react-select";
import PhoneInput from "./PhoneInput"; // Import the component
import { parsePhoneNumberFromString } from "libphonenumber-js";
import InquiryHandler from "./Inquiryhandler"; // Import the new component
import PaymentGuide from "./PaymentGuide";
import Header from "../../components/sections/Header/Header";
import Footer from "../../components/sections/Footer/Footer";




const Enrollment = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    countryCode: "+91",
    phone: "",
    course: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [recaptchaValue, setRecaptchaValue] = useState(null);
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [usd, setUsd] = useState()
  const [currentUser, setCurrentUser] = useState()
  const [isLoading, setIsLoading] = useState(false); // Loading state for async operations

  const [countryCode, setCountryCode] = useState("+91"); // Default India
  const [countryList, setCountryList] = useState([]);

  const [selectedCountry, setSelectedCountry] = useState("+91"); // Default India


  const { courseType, courseId } = useParams();
  const [searchTerm, setSearchTerm] = useState("");
  const sortedCountries = countryData.sort((a, b) =>
    a.name.localeCompare(b.name)
  );


  const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;






  const handlePhoneChange = (e) => {
    let inputPhone = e.target.value;
    const phoneNumber = parsePhoneNumberFromString(inputPhone, selectedCountry);
    if (phoneNumber && phoneNumber.isValid()) {
      setFormData({ ...formData, phone: phoneNumber.number });
    } else {
      setFormData({ ...formData, phone: inputPhone }); // Allow partial entry
    }
  };


  useEffect(() => {
    if (courseId && courseType) {
      setFormData((prev) => ({
        ...prev,
        course: courseId, // ✅ Auto-set the course ID
      }));
    }
  }, [courseId, courseType]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/login");
      }
    });
    return () => unsubscribe();
  }, [navigate]);


  useEffect(() => {
    const auth = getAuth();
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user.email);
        setFormData((prev) => ({
          ...prev,
          email: user.email,
          name: user.displayName || prev.name
        }));

        // Check if user is already enrolled to prevent double-asking
        try {
          const userRef = doc(db, "subscriptions", user.email);
          const docSnap = await getDoc(userRef);

          if (docSnap.exists()) {
            const userData = docSnap.data();

            // Pre-fill phone if we have it
            if (userData.phone && !formData.phone) {
              setFormData(prev => ({ ...prev, phone: userData.phone }));
            }

            // Check enrollment in DETAILS
            const isEnrolledPaid = userData.DETAILS && userData.DETAILS.some(d => Object.keys(d)[0] === formData.course);

            if (isEnrolledPaid && formData.course) {
              console.log("User already enrolled in paid course, redirecting...");
              navigate(`/course/${encodeURIComponent(formData.course)}`);
            }
          }
        } catch (err) {
          console.error("Error checking enrollment status:", err);
        }
      } else {
        setCurrentUser(null);
      }
    });

    return () => unsubscribeAuth();
  }, [formData.course, navigate]);


  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const paidCoursesCollection = collection(db, "paidCourses");
        const paidCoursesSnapshot = await getDocs(paidCoursesCollection);
        const paidCourses = paidCoursesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCourses(paidCourses);
      } catch (error) {
      }
    };
    fetchCourses();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateForm = () => {
    const { name, email, phone, course } = formData;
    if (!name || !email || !phone || !course) {
      return "All fields are required!";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "Invalid email address!";
    }

    return "";
  };

  const updateFirebaseSubscription = async (formData) => {
    const subscriptionDate = new Date();
    const expiryDate = new Date();
    expiryDate.setFullYear(subscriptionDate.getFullYear() + 1);

    try {
      const subscriptionRef = doc(db, "subscriptions", formData.email.trim());
      const subscriptionSnap = await getDoc(subscriptionRef);

      if (subscriptionSnap.exists()) {
        const currentData = subscriptionSnap.data();
        const updatedCourses = currentData.DETAILS || [];

        const courseExists = updatedCourses.some((course) => course[formData.course]);
        if (!courseExists) {
          updatedCourses.push({
            [formData.course]: {
              subscriptionDate: subscriptionDate.toISOString(),
              expiryDate: expiryDate.toISOString(),
              status: "active",
            },
          });

          await updateDoc(subscriptionRef, { DETAILS: updatedCourses });
        }
      } else {
        await setDoc(subscriptionRef, {
          DETAILS: [
            {
              [formData.course]: {
                subscriptionDate: subscriptionDate.toISOString(),
                expiryDate: expiryDate.toISOString(),
                status: "active",
              },
            },
          ],
        });
      }

    } catch (error) {
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (recaptchaSiteKey && !recaptchaValue) {
      setErrorMessage("Please complete the reCAPTCHA!");
      alert("Please Complete Recaptcha")
      return;
    }

    const validationError = validateForm();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }
    try {
      // Fetch exchange rate
      const exchangeRateResponse = await fetch(
        "https://api.exchangerate-api.com/v4/latest/INR"
      );
      const exchangeRateData = await exchangeRateResponse.json(); // Correctly parse JSON
      const exchangeRate = exchangeRateData.rates.USD;

      // Find the selected course
      const selectedCourse = courses.find(
        (course) => course.id === formData.course
      );

      if (!selectedCourse) {
        setErrorMessage("Selected course not found. Please select a valid course.");
        return null;
      }

      // Convert course price to USD
      const priceInUSD = (selectedCourse.price * exchangeRate).toFixed(2);
      setUsd(priceInUSD)

    }
    catch (error) {

    }

    setErrorMessage("");
    setSuccessMessage(" Proceed with payment.");


  };

  const handleRazorpay = async () => {
    setIsLoading(true); // Start loading
    try {
      const selectedCourse = courses.find((course) => course.id === formData.course);
      if (!selectedCourse) {
        setErrorMessage("Selected course not found. Please select a valid course.");
        setIsLoading(false);
        return;
      }

      const amountInPaise = selectedCourse.price * 100;

      // Create Razorpay order
      const orderResponse = await fetch("https://backend-7e8f.onrender.com/api/payment/razorpay/order", {

        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: selectedCourse.price }),
      });

      if (!orderResponse.ok) {
        throw new Error("Failed to create Razorpay order.");
      }

      const { orderId } = await orderResponse.json();

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY,
        amount: amountInPaise,
        currency: "INR",
        name: "Astrology Course",
        description: "Enroll in our course",
        order_id: orderId,
        handler: async (response) => {
          const transactionId = response.razorpay_payment_id; // Razorpay payment ID
          const { razorpay_order_id, razorpay_signature } = response;

          try {
            // Verify payment on backend
            const backendResponse = await fetch("https://backend-7e8f.onrender.com/api/payment/razorpay/success", {


              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                paymentId: transactionId,
                orderId: razorpay_order_id,
                signature: razorpay_signature,
                userDetails: formData,
                courseId: selectedCourse.id,
                amount: amountInPaise,
              }),
            });

            if (!backendResponse.ok) {
              throw new Error("Payment verification failed.");
            }

            // Save payment details to Firebase
            try {
              await addDoc(collection(db, "payments"), {
                userId: currentUser,
                courseId: selectedCourse.id,

                amount: selectedCourse.price,
                transactionId,
                status: "paid",
                timestamp: new Date(),
              });
            } catch (firebaseError) {
              console.error("Error saving payment:");
            }

            // Update subscription in Firebase
            try {
              await updateFirebaseSubscription(formData);
            } catch (subscriptionError) {
              console.error("Error updating subscription:");
            }

            alert("Payment successful");

            setSuccessMessage("Payment successful! Redirecting...");
            navigate("/dashboard", { replace: true });
          } catch (error) {
            setErrorMessage("Payment verification failed. Please try again.");
          } finally {
            setIsLoading(false);
          }
        },
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone,
        },
        theme: { color: "#FF6347" },
      };

      const rzp = new window.Razorpay(options);

      rzp.on('payment.failed', (response) => {
        setErrorMessage("Payment failed. Please try again.");
        setIsLoading(false);
      });

      rzp.open();
    } catch (error) {
      setErrorMessage("Failed to initiate payment. Please try again.");
    } finally {
      setIsLoading(false);
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

  const courseOptions = courses.map(c => ({ value: c.id, label: `${c.title} - ₹${c.price}` }));
  const selectedOption = courseOptions.find(opt => opt.value === formData.course) || null;

  return (
    <>
      <Header />
      <div id="top-sentinel" className="h-0 w-full pt-[70px]"></div>

      <div className="min-h-screen flex flex-col justify-center items-center py-[50px] px-4 relative z-10">
        <div className="bg-black/60 backdrop-blur-xl border border-white/10 p-8 rounded-xl w-full max-w-lg shadow-[0_0_40px_rgba(191, 6, 3,0.2)]">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-4 text-white">Enroll in a <span className="text-brand-red">Course</span></h1>
          <p className="text-center mb-8 text-gray-300">
            Join our course and explore the wonders of astrology.
          </p>

          {errorMessage && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-4 rounded-lg mb-6 text-center backdrop-blur-sm">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="bg-green-500/20 border border-green-500/50 text-green-200 p-4 rounded-lg mb-6 text-center backdrop-blur-sm">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {successMessage && <InquiryHandler formData={formData} />}

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-300 mb-2 uppercase tracking-wider">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your name"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent transition-all"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-300 mb-2 uppercase tracking-wider">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent transition-all"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-300 mb-2 uppercase tracking-wider">Country Code</label>
              <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 mb-4">
                <PhoneInput selectedCountry={selectedCountry} setSelectedCountry={setSelectedCountry} />
              </div>
              <label className="text-sm font-medium text-gray-300 mb-2 uppercase tracking-wider">Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handlePhoneChange}
                placeholder="Enter Phone Number"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent transition-all"
                required
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-300 mb-2 uppercase tracking-wider">Course</label>
              <Select
                name="course"
                value={selectedOption}
                onChange={(option) => setFormData({ ...formData, course: option ? option.value : '' })}
                options={courseOptions}
                styles={customSelectStyles}
                placeholder="Select a course"
                className="react-select-container"
                classNamePrefix="react-select"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-300 mb-2 uppercase tracking-wider">Price</label>
              <input
                type="text"
                name="price"
                value={
                  courses.find((course) => course.id === formData.course)?.price
                    ? `₹${courses.find((course) => course.id === formData.course).price}`
                    : "Loading..."
                }
                readOnly
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-gray-400 cursor-not-allowed"
              />
            </div>

            <div className="flex justify-center mt-4">
              {recaptchaSiteKey ? (
                <ReCAPTCHA
                  sitekey={recaptchaSiteKey}
                  onChange={(value) => setRecaptchaValue(value)}
                  theme="dark"
                />
              ) : (
                <p className="text-yellow-400 text-sm text-center font-medium bg-yellow-400/10 py-2 px-4 rounded-lg w-full">ReCAPTCHA configuration is missing. You can proceed without it for now.</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-4 mt-4 bg-linear-to-r from-brand-red to-[#b0a102] text-white font-bold uppercase tracking-[0.2em] rounded-lg hover:shadow-[0_0_20px_rgba(191, 6, 3,0.5)] transform hover:scale-[1.02] transition-all duration-300"
            >
              Proceed to Payment
            </button>
          </form>

          {successMessage && (
            <div className="mt-8 border-t border-white/10 pt-8">
              <h2 className="text-xl font-bold text-white text-center mb-6">Make Payment</h2>
              <div className="space-y-4">
                <button
                  onClick={handleRazorpay}
                  disabled={isLoading}
                  className="w-full py-4 bg-linear-to-r from-blue-600 to-blue-800 text-white font-bold uppercase tracking-wider rounded-lg hover:shadow-[0_0_20px_rgba(37,99,235,0.5)] transform hover:scale-[1.02] transition-all duration-300 flex justify-center items-center"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    "Pay with Razorpay"
                  )}
                </button>

                <div className="mt-4">
                  <button
                    onClick={async () => {
                      const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID;

                      if (!PAYPAL_CLIENT_ID) {
                        alert("PayPal Client ID is missing. Please set it in the .env file.");
                        return;
                      }

                      const paypalScriptUrl = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=USD`;

                      try {
                        await new Promise((resolve, reject) => {
                          const script = document.createElement("script");
                          script.src = paypalScriptUrl;
                          script.onload = resolve;
                          script.onerror = reject;
                          document.body.appendChild(script);
                        });

                        const selectedCourse = courses.find((course) => course.id === formData.course);
                        if (!selectedCourse) {
                          alert("Selected course not found. Please select a valid course.");
                          return;
                        }

                        window.paypal
                          .Buttons({
                            createOrder: (data, actions) => {
                              const priceInUSD = usd;
                              if (!priceInUSD) {
                                throw new Error("Payment amount not set. Please try again.");
                              }
                              return actions.order.create({
                                purchase_units: [
                                  {
                                    amount: {
                                      value: priceInUSD,
                                    },
                                  },
                                ],
                              });
                            },
                            onApprove: async (data, actions) => {
                              try {
                                const details = await actions.order.capture();
                                alert(`Transaction completed by ${details.payer.name.given_name}`);

                                const backendResponse = await fetch(
                                  "https://backend-7e8f.onrender.com/api/payment/paypal/success",
                                  {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({
                                      paymentId: details.id,
                                      userDetails: formData,
                                      courseId: selectedCourse.id,
                                      amount: selectedCourse.price,
                                    }),
                                  }
                                );

                                if (!backendResponse.ok) {
                                  const errorData = await backendResponse.json();
                                  alert(`Payment processed but failed on the server: ${errorData.error}`);
                                  return;
                                }

                                await addDoc(collection(db, "payments"), {
                                  userId: currentUser,
                                  courseId: selectedCourse.id,
                                  amount: selectedCourse.price,
                                  transactionId: details.id,
                                  status: "paid",
                                  timestamp: new Date(),
                                });

                                await updateFirebaseSubscription(formData);

                                navigate("/dashboard");
                              } catch (error) {
                                alert("An error occurred during the payment process. Please try again.");
                              }
                            },
                            onCancel: () => {
                              alert("Payment was cancelled. Please try again.");
                            },
                            onError: (err) => {
                              alert("An error occurred during the payment process. Please try again.");
                            },
                          })
                          .render("#paypal-button-container");
                      } catch (error) {
                        alert("An error occurred while initializing PayPal. Please try again.");
                      }
                    }}
                    className="w-full py-4 bg-[#0079C1] text-white font-bold uppercase tracking-wider rounded-lg hover:shadow-[0_0_20px_rgba(0,121,193,0.5)] transform hover:scale-[1.02] transition-all duration-300"
                  >
                    Pay with PayPal
                  </button>
                  <div id="paypal-button-container" className="mt-4"></div>

                  <Link
                    to="/payemi"
                    state={{
                      name: formData.name,
                      email: formData.email,
                      phone: `${selectedCountry} ${formData.phone}`,
                      courseId: formData.course
                    }}
                    className="block mt-4"
                  >
                    <button className="w-full py-4 bg-linear-to-r from-purple-600 to-purple-800 text-white font-bold uppercase tracking-wider rounded-lg hover:shadow-[0_0_20px_rgba(147,51,234,0.5)] transform hover:scale-[1.02] transition-all duration-300">
                      Pay with Installment
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="w-full max-w-5xl mt-12 bg-black/60 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-[0_0_40px_rgba(191, 6, 3,0.2)]">
          <PaymentGuide />
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Enrollment;


