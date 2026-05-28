import React, { useEffect, useState } from "react";
import { db } from "../../firebaseConfig";
import {
  collection,
  onSnapshot,
  query,
  where,
  addDoc,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useNavigate, useLocation } from "react-router-dom";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import Header from "../../components/sections/Header/Header";


const PayPalButtonWrapper = ({ amountInUSD, formData, selectedPlan, onSuccess, onError, onCancel }) => (
  <PayPalScriptProvider
    options={{
      "client-id": import.meta.env.VITE_PAYPAL_CLIENT_ID,
      currency: "USD",
    }}
  >
    <PayPalButtons
      style={{ layout: "horizontal" }}
      createOrder={(data, actions) => {
        return actions.order.create({
          purchase_units: [
            {
              amount: {
                currency_code: "USD",
                value: amountInUSD,
              },
            },
          ],
        });
      }}
      onApprove={async (data, actions) => {
        try {
          const details = await actions.order.capture();
          onSuccess(details);
        } catch (error) {
          onError(error);
        }
      }}
      onCancel={onCancel}
      onError={onError}
    />
  </PayPalScriptProvider>
);




const UserEmi = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [emiPlans, setEmiPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const [showPayPalButtons, setShowPayPalButtons] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY;
  const location = useLocation(); // Get data from previous page

  const { name, email, phone, courseId } = location.state || {}; // Get user data



  useEffect(() => {
    const auth = getAuth();
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user.email);
        setFormData((prev) => ({ ...prev, email: user.email }));

        const userCoursesQuery = query(
          collection(db, "subscriptions"),
          where("email", "==", user.email)
        );

        const unsubscribeCourses = onSnapshot(userCoursesQuery, (snapshot) => {
          if (!snapshot.empty) {
            const userCourses = snapshot.docs[0].data().DETAILS || [];
            setCourses(userCourses.map((course) => Object.keys(course)[0]));
          }
        });

        return () => unsubscribeCourses();
      } else {
        setCurrentUser(null);
      }
    });

    return () => unsubscribeAuth();
  }, []);

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
    const unsubscribeCourses = onSnapshot(collection(db, "paidCourses"), (snapshot) => {
      setCourses(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribeCourses();
  }, []);

  useEffect(() => {
    if (!selectedCourse) {
      setEmiPlans([]);
      return;
    }



    const unsubscribePlans = onSnapshot(
      query(collection(db, "emiPlans"), where("courseId", "==", selectedCourse)),
      (snapshot) => {
        setEmiPlans(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      }
    );

    return () => unsubscribePlans();
  }, [selectedCourse]);

  useEffect(() => {
    if (location.state) {
      const { name, email, phone, courseId } = location.state;
      setFormData((prev) => ({
        ...prev,
        name: name || prev.name,
        email: email || prev.email,
        phone: phone || prev.phone,
      }));
      setSelectedCourse(courseId || prev.selectedCourse);
    }
  }, [location.state]);

  useEffect(() => {
    if (!courseId) return;

    // Fetch EMI plans for the selected course
    const unsubscribePlans = onSnapshot(
      query(collection(db, "emiPlans"), where("courseId", "==", courseId)),
      (snapshot) => {
        setEmiPlans(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      }
    );

    return () => unsubscribePlans();
  }, [courseId]);



  const updateFirebaseSubscription = async () => {
    const subscriptionDate = new Date();
    const expiryDate = new Date();
    expiryDate.setFullYear(subscriptionDate.getFullYear() + 1);

    try {
      const subscriptionRef = doc(db, "subscriptions", formData.email.trim());
      const subscriptionSnap = await getDoc(subscriptionRef);

      if (subscriptionSnap.exists()) {
        const currentData = subscriptionSnap.data();
        const updatedCourses = currentData.DETAILS || [];

        const courseExists = updatedCourses.some(
          (course) => course[selectedCourse]
        );
        if (!courseExists) {
          updatedCourses.push({
            [selectedCourse]: {
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
              [selectedCourse]: {
                subscriptionDate: subscriptionDate.toISOString(),
                expiryDate: expiryDate.toISOString(),
                status: "active",
              },
            },
          ],
        });
      }
    } catch (error) {
      console.error("Error:");
    }
  };



  const handleRazorpayPayment = async () => {

    setIsLoading(true);

    if (!selectedPlan) {
      setErrorMessage("Please select an EMI plan before proceeding.");
      return;
    }

    try {
      const amountInPaise = selectedPlan.amount * 100;

      // Step 1: Create an order in the backend
      const orderResponse = await fetch("https://backend-7e8f.onrender.com/api/emi/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: selectedPlan.amount }),
      });

      if (!orderResponse.ok) {
        throw new Error("Failed to create Razorpay order.");
      }

      const { orderId } = await orderResponse.json();

      // Step 2: Ensure Razorpay SDK is loaded
      if (!window.Razorpay) {
        throw new Error("Razorpay SDK is not loaded. Please refresh the page and try again.");
      }

      // Step 3: Configure Razorpay options
      const options = {
        key: RAZORPAY_KEY, // Replace with your Razorpay API key
        amount: amountInPaise,
        currency: "INR",
        name: "EMI Payment",
        description: `Pay EMI for duration: ${selectedPlan.duration}`,
        order_id: orderId,
        handler: async (response) => {
          try {

            // Step 4: Send payment details to the backend for verification
            const backendResponse = await fetch("https://backend-7e8f.onrender.com/api/emi/razorpay/success", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id || orderId,
                signature: response.razorpay_signature,
                userDetails: formData,
                planId: selectedPlan.id,
                amount: selectedPlan.amount,
              }),
            });

            if (backendResponse.ok) {
              const transactionId = response.razorpay_payment_id;

              // Step 5: Update Firebase with payment details
              await addDoc(collection(db, "payments"), {
                userId: currentUser, // Assuming currentUser is retrieved from your auth context
                planId: selectedPlan.id,
                courseId: selectedCourse, // Assuming this is defined in your logic
                amount: selectedPlan.amount,
                transactionId,
                status: "paid",
                timestamp: new Date(),
              });

              // Step 6: Update subscription logic in Firebase
              await updateFirebaseSubscription(); // Replace with your actual subscription update function

              // Step 7: Navigate to the dashboard or show success
              setPaymentStatus("success");
              alert("Payment successful! Thank you.");
              navigate("/dashboard");
            } else {
              // Handle backend verification failure
              const errorData = await backendResponse.json();
              alert(`Payment verification failed: ${errorData.error || "Unknown error"}. Please contact support.`);
            }
          } catch (error) {
            alert("Payment verification failed due to a network or server error. Please contact support.");
          }
          finally {
            setIsLoading(false);
          }
        },
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone,
        },
        theme: { color: "#F37254" },
      };

      // Step 8: Open Razorpay payment popup
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      setErrorMessage(error.message || "Payment failed. Please try again.");
    }
    setIsLoading(false)
  };




  // convert ruppess into dollar 



  const fetchUSDConversionRate = async () => {
    try {
      const response = await fetch("https://api.exchangerate-api.com/v4/latest/INR"); // Replace with your preferred API
      const data = await response.json();
      return data.rates.USD || 0; // Return the USD rate
    } catch (error) {
      return 0; // Default to 0 on error
    }
  };





  const handlePayPalPayment = async () => {
    if (!selectedPlan) {
      setErrorMessage("Please select an EMI plan before proceeding.");
      return;
    }

    try {
      const conversionRate = await fetchUSDConversionRate();
      const amountInUSD = (selectedPlan.amount * conversionRate).toFixed(2); // Convert INR to USD

      const orderResponse = await fetch("https://backend-7e8f.onrender.com/api/emi/paypal/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amountInUSD }), // Send USD amount
      });

      if (!orderResponse.ok) {
        throw new Error("Failed to create PayPal order.");
      }

      setFormData((prevData) => ({ ...prevData, amountInUSD }));
      setShowPayPalButtons(true);
    } catch (error) {
      setErrorMessage("Failed to initialize PayPal. Please try again.");
    }
  };


  return (
    <>
      <div id="top-sentinel" className="absolute top-0 left-0 w-full h-px pointer-events-none z-[-1]" />
      <Header />
      <div className="min-h-screen bg-[#0a0a0a] text-white pt-[120px] pb-20 px-4 relative z-10">
        <div className="bg-black/60 backdrop-blur-xl border border-white/10 p-8 md:p-12 rounded-[2.5rem] w-full max-w-2xl mx-auto shadow-[0_0_50px_rgba(221,39,39,0.15)]">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-2 text-white uppercase tracking-tight">
            Cosmic <span className="text-[#dd2727]">EMI Verification</span>
          </h2>
          <p className="text-center text-gray-400 mb-10 text-sm font-medium uppercase tracking-widest">Confirm your details to proceed with the celestial payment plan.</p>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] ml-2">Celestial Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-[#dd2727] transition-all"
                  placeholder="Enter your name"
                  required
                  readOnly
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] ml-2">Cosmic Email</label>
                <input
                  type="text"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-[#dd2727] transition-all"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] ml-2">Contact Frequency</label>
                <input
                  type="text"
                  value={formData.phone}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-gray-400 cursor-not-allowed"
                  readOnly
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] ml-2">Selected Course</label>
                <div className="relative">
                  <select
                    value={selectedCourse}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white appearance-none cursor-not-allowed"
                    disabled
                  >
                    <option value="">{selectedCourse ? selectedCourse : "Awaiting selection..."}</option>
                  </select>
                </div>
              </div>
            </div>

            {selectedCourse && (
              <div className="mt-10 pt-8 border-t border-white/10">
                <h3 className="text-sm font-bold text-white uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                  <span className="w-2 h-2 bg-[#dd2727] rounded-full animate-pulse"></span>
                  Divine Installment Plans
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  {emiPlans.map((plan) => (
                    <div
                      key={plan.id}
                      className={`relative group p-6 rounded-2xl cursor-pointer transition-all border ${
                        selectedPlan?.id === plan.id
                          ? "bg-[#dd2727]/10 border-[#dd2727] shadow-[0_0_20px_rgba(221,39,39,0.2)]"
                          : "bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10"
                      }`}
                      onClick={() => setSelectedPlan(plan)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-bold text-white text-lg">{plan.duration} Months</h4>
                          <p className="text-xs text-gray-400 uppercase tracking-widest mt-1">Celestial Installment</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-white">₹{plan.amount}</p>
                        </div>
                      </div>
                      {selectedPlan?.id === plan.id && (
                        <div className="absolute -top-2 -right-2 bg-[#dd2727] text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg uppercase tracking-widest">Selected</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-10 space-y-4">
              <button
                onClick={handleRazorpayPayment}
                disabled={!selectedPlan || !formData.name || !formData.phone || isLoading}
                className={`w-full py-5 rounded-2xl font-bold uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 ${
                  selectedPlan && formData.name && formData.phone && !isLoading
                    ? "bg-gradient-to-r from-[#dd2727] to-[#b0a102] text-white hover:scale-[1.02] shadow-[0_0_25px_rgba(221,39,39,0.3)]"
                    : "bg-white/10 text-gray-500 cursor-not-allowed border border-white/5"
                }`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg>
                    Processing...
                  </>
                ) : (
                  "Pay with Razorpay"
                )}
              </button>

              <button
                onClick={async () => {
                  const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID;
                  if (!PAYPAL_CLIENT_ID) {
                    alert("PayPal Client ID is missing. Please set it in the .env file.");
                    return;
                  }
                  try {
                    const conversionRate = await fetchUSDConversionRate();
                    const amountInUSD = (selectedPlan.amount * conversionRate).toFixed(2);
                    if (!amountInUSD || amountInUSD <= 0) {
                      alert("Invalid amount for payment. Please try again.");
                      return;
                    }
                    const paypalScriptUrl = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=USD`;
                    await new Promise((resolve, reject) => {
                      const script = document.createElement("script");
                      script.src = paypalScriptUrl;
                      script.onload = resolve;
                      script.onerror = reject;
                      document.body.appendChild(script);
                    });

                    window.paypal.Buttons({
                      createOrder: (data, actions) => {
                        return actions.order.create({
                          purchase_units: [{ amount: { currency_code: "USD", value: amountInUSD } }],
                        });
                      },
                      onApprove: async (data, actions) => {
                        try {
                          const details = await actions.order.capture();
                          const transactionId = details.id;
                          const backendResponse = await fetch("https://backend-7e8f.onrender.com/api/emi/paypal/success", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              paymentId: details.id,
                              userDetails: formData,
                              courseId: selectedCourse,
                              amount: selectedPlan.amount
                            }),
                          });

                          if (backendResponse.ok) {
                            await addDoc(collection(db, "payments"), {
                              userId: currentUser,
                              courseId: selectedCourse,
                              planId: selectedPlan.id,
                              amount: selectedPlan.amount,
                              transactionId,
                              status: "paid",
                              timestamp: new Date(),
                            });
                            await updateFirebaseSubscription();
                            alert("Payment successful! Thank you.");
                            navigate("/dashboard");
                          }
                        } catch (error) {
                          alert("An error occurred during the payment process.");
                        }
                      },
                      onCancel: () => alert("Payment was cancelled."),
                      onError: (err) => alert("An error occurred during the payment process."),
                    }).render("#paypal-button-container");
                  } catch (error) {
                    alert("An error occurred while initializing PayPal.");
                  }
                }}
                disabled={!selectedPlan || !formData.name || !formData.phone}
                className={`w-full py-5 rounded-2xl font-bold uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 ${
                  selectedPlan && formData.name && formData.phone
                    ? "bg-[#0070ba] text-white hover:scale-[1.02] shadow-[0_0_25px_rgba(0,112,186,0.3)]"
                    : "bg-white/10 text-gray-500 cursor-not-allowed border border-white/5"
                }`}
              >
                Pay with PayPal
              </button>

              <div id="paypal-button-container" className="mt-4 empty:hidden"></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserEmi;























