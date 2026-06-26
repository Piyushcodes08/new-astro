import React, { useEffect, useState } from "react";
import { db } from "../../firebaseConfig";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { Link } from "react-router-dom";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import Aside from "../pages/Aside";
import Header from "../../components/sections/Header/Header";

const EMIDetails = () => {
  const [userEmail, setUserEmail] = useState(null);
  const [payments, setPayments] = useState([]);

  const [currentUser, setCurrentUser] = useState(null);

  const [emiPlans, setEmiPlans] = useState([]);
  const [emiSchedules, setEmiSchedules] = useState({});
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY;
  const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID;

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [formData, setFormData] = useState({
    profilePic: "",
    fullName: "NA",
    fathersName: "NA",
    mothersName: "NA",
    dob: "NA",
    email: "NA",
  });
  const [paymentModal, setPaymentModal] = useState({
    isOpen: false,
    courseId: null,
    emiNumber: null,
    amount: null,
  });

  const loadPayPalScript = async () => {
    if (!document.querySelector("#paypal-sdk")) {
      const script = document.createElement("script");
      script.id = "paypal-sdk";
      script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=USD`;
      script.async = true;
      document.body.appendChild(script);
      return new Promise((resolve, reject) => {
        script.onload = resolve;
        script.onerror = reject;
      });
    }
  };

  // Call this function before rendering the PayPal button
  const openPaymentModal = async (courseId, emiNumber, amount) => {
    try {
      // await loadPayPalScript();
      setPaymentModal({
        isOpen: true,
        courseId,
        emiNumber,
        amount,
      });
    } catch (error) {
      alert("Failed to initialize PayPal. Please try again.");
    }
  };

  const closePaymentModal = () => {
    setPaymentModal({
      isOpen: false,
      courseId: null,
      emiNumber: null,
      amount: null,
    });
  };

  const fetchUSDConversionRate = async () => {
    try {
      const response = await fetch(
        "https://api.exchangerate-api.com/v4/latest/INR"
      ); // Replace with your preferred API
      const data = await response.json();
      return data.rates.USD || 0; // Return the USD rate
    } catch (error) {
      return 0; // Default to 0 on error
    }
  };

  const PaymentModal = () => {
    const [usdAmount, setUsdAmount] = useState(null); // State to store the USD amount
    const [error, setError] = useState(null);

    useEffect(() => {
      // Fetch USD conversion rate when the modal opens
      const fetchUSDConversionRate = async () => {
        try {
          const response = await fetch(
            "https://api.exchangerate-api.com/v4/latest/INR"
          );
          const data = await response.json();
          const conversionRate = data.rates.USD || 80; // Fallback rate
          setUsdAmount((paymentModal.amount * conversionRate).toFixed(2));
        } catch (err) {
          setError("Failed to fetch USD conversion rate.");
        }
      };

      fetchUSDConversionRate();
    }, [paymentModal.amount]);

    if (!paymentModal.isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-[0_0_40px_rgba(191, 6, 3,0.2)] p-8 w-full max-w-md relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-brand-red to-[#b0a102]"></div>

          <h3 className="text-2xl font-bold mb-2 text-white">
            Complete <span className="text-brand-red">Payment</span>
          </h3>

          <div className="bg-white/5 rounded-xl p-4 mb-6 border border-white/5">
            <p className="text-gray-300 mb-1 font-medium">
              Course: <span className="text-white">{paymentModal.courseId}</span>
            </p>
            <p className="text-gray-400 text-sm mb-3">
              EMI <span className="text-white font-bold">#{paymentModal.emiNumber}</span>
            </p>
            <div className="text-3xl font-bold text-brand-red">
              ₹{Number(paymentModal.amount).toLocaleString("en-IN")}
            </div>
          </div>

          {error && <p className="text-red-400 text-sm mb-4 bg-red-400/10 p-3 rounded-lg border border-red-400/20">{error}</p>}
          <div className="flex flex-col gap-4">
            <button
              onClick={() =>
                handlePayment(
                  paymentModal.courseId,
                  paymentModal.emiNumber,
                  paymentModal.amount,
                  "razorpay"
                )
              }
              className="bg-white text-black font-bold px-4 py-3 rounded-xl transition-all hover:bg-gray-200 flex justify-center items-center gap-2 uppercase tracking-wider shadow-[0_0_15px_rgba(255,255,255,0.2)]"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                "Pay with Razorpay"
              )}
            </button>
            {usdAmount ? (
              <div className="mt-2 relative z-10 paypal-button-container-dark">
                <PayPalScriptProvider
                  options={{
                    "client-id": PAYPAL_CLIENT_ID,
                    components: "buttons",
                    currency: "USD",
                  }}
                >
                  <PayPalButtons
                    style={{ layout: "vertical" }}
                    createOrder={(data, actions) => {
                      return actions.order.create({
                        purchase_units: [
                          {
                            amount: {
                              currency_code: "USD",
                              value: usdAmount, // Dynamically set
                            },
                          },
                        ],
                      });
                    }}
                    onApprove={async (data, actions) => {
                      try {
                        const details = await actions.order.capture();
                        const paymentId = details.id;

                        const userDetails = {
                          email: userEmail, // Replace with user's email
                          name: formData.fullName || "NA", // Replace with user's name
                        };

                        const backendResponse = await fetch(
                          "https://backend-7e8f.onrender.com/api/final/paypal/success",
                          {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              paymentId,
                              userDetails,
                              amount: paymentModal.amount,
                              courseId: paymentModal.courseId,
                            }),
                          }
                        );

                        if (!backendResponse.ok) {
                          const errorData = await backendResponse.json();
                          alert(`Error: ${errorData.error}`);
                          return;
                        }

                        // Add payment to Firestore
                        await addDoc(collection(db, "payments"), {
                          userId: userEmail,
                          courseId: paymentModal.courseId,
                          emiNumber: paymentModal.emiNumber,
                          amount: paymentModal.amount,
                          paymentId,
                          status: "paid",
                          timestamp: new Date(),
                        });

                        alert(
                          `Payment for EMI #${paymentModal.emiNumber} successful via PayPal!`
                        );
                        closePaymentModal();
                      } catch (error) {
                        alert(
                          "An error occurred during payment. Please try again."
                        );
                      }
                    }}
                    onError={(err) => {
                      alert(
                        "An error occurred during the PayPal payment process."
                      );
                    }}
                  />
                </PayPalScriptProvider>
              </div>
            ) : (
              <div className="flex justify-center items-center p-4">
                <div className="w-6 h-6 border-2 border-brand-red border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            <button
              onClick={closePaymentModal}
              className="mt-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-4 py-3 rounded-xl transition-all uppercase tracking-wider font-bold"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  //handlePaymentSuccess(paymentModal.courseId, paymentModal.emiNumber, paymentModal.amount, details.id);

  const handlePayment = async (courseId, emiNumber, amount, paymentMethod) => {
    try {
      const amountInPaise = Number(amount) * 100; // Amount for Razorpay

      if (paymentMethod === "razorpay") {
        setIsLoading(true);
        const options = {
          key: RAZORPAY_KEY,
          amount: amountInPaise,
          currency: "INR",
          name: "EMI Payment",
          description: `Pay EMI #${emiNumber} for course ${courseId}`,
          handler: async (response) => {
            try {
              // Handle payment success
              const paymentDetails = {
                paymentId: response.razorpay_payment_id,
                courseId,
                emiNumber,
                amount,
                userEmail: userEmail,
              };

              // Send payment details to the backend
              const res = await fetch(
                "https://backend-7e8f.onrender.com/api/final/success",
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(paymentDetails),
                }
              );

              if (!res.ok) {
                throw new Error("Failed to communicate with the backend.");
              }

              // Notify the user and admin via email (handled in backend)
              const result = await res.json();

              if (result.success) {
                handlePaymentSuccess(
                  courseId,
                  emiNumber,
                  amount,
                  response.razorpay_payment_id
                );
                alert("Payment successful! Emails have been sent.");
              } else {
                throw new Error(result.message || "Failed to send emails.");
              }
            } catch (err) {
              alert(
                "Payment was successful, but there was an issue processing the response."
              );
            } finally {
              setIsLoading(false);
            }
          },
          prefill: {
            name: formData.name,
            email: formData.email,
          },
          theme: { color: "#F37254" },
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
      }
    } catch (error) {
      alert("Payment failed. Check Contact for details.");
    }
    setIsLoading(false);
  };

  const handlePaymentSuccess = async (
    courseId,
    emiNumber,
    amount,
    paymentId
  ) => {
    try {
      await addDoc(collection(db, "payments"), {
        userId: userEmail,
        courseId,
        amount: Number(amount),
        status: "paid",
        timestamp: new Date(),
        paymentId,
      });

      alert(`Payment for EMI #${emiNumber} successful!`);
      closePaymentModal();
    } catch (error) {
      alert("Failed to record payment. Please try again.");
    }
  };

  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setUserEmail(currentUser.email);

        const fetchProfile = async () => {
          const userDocRef = doc(db, "students", currentUser.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();
            setFormData({
              profilePic: userData.profilePic || "",
              fullName: userData.fullName || "NA",
              fathersName: userData.fathersName || "NA",
              mothersName: userData.mothersName || "NA",
              dob: userData.dob || "NA",
              email: currentUser.email || "NA",
            });
          }
        };

        fetchProfile();
      } else {
        setUser(null);
        setUserEmail(null);
        setLoading(false);
      }
    });

    return () => unsubscribe(); // Cleanup on unmount
  }, []);

  useEffect(() => {
    if (!userEmail) {
      setLoading(false);
      return;
    }

    const paymentsQueryRef = query(
      collection(db, "payments"),
      where("userId", "==", userEmail)
    );

    const paymentsUnsubscribe = onSnapshot(paymentsQueryRef, (snapshot) => {
      const userPayments = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPayments(userPayments);
    });

    return () => paymentsUnsubscribe();
  }, [userEmail]);

  useEffect(() => {
    if (payments.length === 0) return;

    const plansUnsubscribe = onSnapshot(
      collection(db, "emiPlans"),
      (snapshot) => {
        const allEmiPlans = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setEmiPlans(allEmiPlans);
      }
    );

    return () => plansUnsubscribe();
  }, [payments]);

  useEffect(() => {
    if (payments.length === 0 || emiPlans.length === 0) return;

    const updatedSchedules = {};

    payments.forEach((payment) => {
      const { courseId, amount } = payment;
      const relevantPlan = emiPlans.find(
        (plan) =>
          plan.courseId === courseId && Number(plan.amount) === Number(amount)
      );

      if (!relevantPlan) return;

      const totalEMIs = parseInt(relevantPlan.duration || 0, 10);
      const sortedPayments = payments
        .filter((p) => p.courseId === courseId)
        .sort((a, b) => {
          const aDate = a.timestamp?.toDate?.() || new Date(a.timestamp);
          const bDate = b.timestamp?.toDate?.() || new Date(b.timestamp);
          return aDate - bDate;
        });

      const firstPaymentDate =
        sortedPayments[0]?.timestamp?.toDate?.() ||
        new Date(sortedPayments[0]?.timestamp) ||
        new Date();

      const schedule = [];

      for (let i = 0; i < totalEMIs; i++) {
        const emiDate = new Date(firstPaymentDate);
        emiDate.setMonth(emiDate.getMonth() + i);

        schedule.push({
          emiNumber: i + 1,
          date: emiDate,
          amount: relevantPlan.amount,
          status: i < sortedPayments.length ? "paid" : "unpaid",
        });
      }

      updatedSchedules[courseId] = schedule;
    });

    setEmiSchedules(updatedSchedules);
    setLoading(false);
  }, [payments, emiPlans]);

  return (
    <div className="admin-layout min-h-screen flex flex-col">
      <div id="top-sentinel" className="absolute top-0 left-0 w-full h-px pointer-events-none z-[-1]" />
      <Header />

      <div className="flex flex-1 relative z-10 pt-16 gap-0">
        <Aside />

        <main className="flex-1 min-w-0 py-6 px-[15px] md:px-10 bg-white overflow-x-hidden">
          <div className="max-w-7xl mx-auto space-y-10 pt-16 md:pt-6">

            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-slate-200 pb-8 md:pb-12 pt-6">
              <div>
                <h4 className="text-brand-red font-black uppercase tracking-[0.3em] text-[8px] md:text-[10px] mb-1 md:mb-2">Financial Overview</h4>
                <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight uppercase">
                  EMI <span className="text-brand-red">Details</span>
                </h1>
                <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mt-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Active for: <span className="text-slate-600 lowercase">{userEmail}</span>
                </p>
              </div>
            </div>

            {Object.keys(emiSchedules).length === 0 ? (
              <div className="bg-white rounded-4xl md:rounded-[2.5rem] p-10 md:p-20 text-center border border-slate-100 shadow-sm">
                <div className="text-4xl mb-6">💳</div>
                <h3 className="text-2xl font-black text-slate-900 mb-4 uppercase tracking-tight">No Active EMI Plans</h3>
                <p className="text-slate-500 font-medium mb-10 max-w-md mx-auto text-sm leading-relaxed">
                  You are not currently enrolled in any EMI plans. Check our premium courses for flexible payment options.
                </p>
                <Link 
                  to="/courses" 
                  className="inline-block bg-brand-red text-white px-10 py-4 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] hover:shadow-xl transition-all hover:-translate-y-1 active:scale-95"
                >
                  Browse Premium Courses
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-10 pb-20">
                {Object.keys(emiSchedules).map((courseId) => {
                  const schedule = emiSchedules[courseId] || [];
                  const unpaidEMIs = schedule.filter(emi => emi.status === "unpaid");
                  const totalUnpaid = unpaidEMIs.reduce((sum, emi) => sum + Number(emi.amount), 0);
                  const paidEMIs = schedule.filter(emi => emi.status === "paid");
                  const progress = (paidEMIs.length / schedule.length) * 100;

                  return (
                    <div key={courseId} className="bg-white rounded-4xl md:rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                      <div className="bg-slate-50/50 border-b border-slate-100 p-6 md:p-10">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                          <div className="flex-1">
                            <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight mb-4 uppercase leading-tight">
                              Course: <span className="text-brand-red">{courseId}</span>
                            </h3>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Payment Progress</span>
                              <div className="flex items-center gap-4 flex-1 max-w-xs">
                                <div className="h-2 bg-slate-200 rounded-full overflow-hidden flex-1 shadow-inner">
                                    <div className="h-full bg-brand-red transition-all duration-1000 shadow-[0_0_10px_rgba(191, 6, 3,0.3)]" style={{ width: `${progress}%` }}></div>
                                </div>
                                <span className="text-[10px] font-black text-slate-900">{Math.round(progress)}%</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-left md:text-right bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Total Remaining</p>
                            <h4 className="text-xl md:text-2xl font-black text-slate-900 tracking-tighter">₹{totalUnpaid.toLocaleString("en-IN")}</h4>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 md:p-10">
                        <div className="grid grid-cols-1 gap-4">
                          {schedule.map((emi, idx) => (
                            <div
                              key={idx}
                              className="flex flex-col md:flex-row justify-between items-start md:items-center p-5 md:p-6 bg-slate-50/30 border border-slate-50 rounded-3xl hover:bg-slate-50 transition-all duration-300 group"
                            >
                              <div className="flex items-center gap-5">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-[10px] shadow-sm transition-transform group-hover:scale-105 ${emi.status === 'paid' ? 'bg-emerald-50 text-emerald-500 border border-emerald-100' : 'bg-white text-slate-400 border border-slate-100'}`}>
                                  {emi.emiNumber.toString().padStart(2, '0')}
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-slate-900 font-black text-base md:text-lg tracking-tight uppercase">EMI Payment</span>
                                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                                    Due: <span className="text-slate-600">{emi.date.toLocaleDateString("en-IN")}</span>
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto mt-6 md:mt-0 pt-6 md:pt-0 border-t md:border-t-0 border-slate-100">
                                <span className="text-lg md:text-xl font-black text-slate-900 tracking-tighter">
                                  ₹{Number(emi.amount).toLocaleString("en-IN")}
                                </span>
                                {emi.status === "paid" ? (
                                  <div className="flex items-center gap-2 text-emerald-500 bg-emerald-50 px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest border border-emerald-100">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                    Paid
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => openPaymentModal(courseId, emi.emiNumber, emi.amount)}
                                    className="bg-slate-900 text-white px-8 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-brand-red transition-all shadow-lg hover:-translate-y-1 active:scale-95"
                                  >
                                    Pay Now
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <PaymentModal />
          </div>
        </main>
      </div>
    </div>
  );
};

export default EMIDetails;
