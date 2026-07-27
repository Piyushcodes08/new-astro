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
        <div className="bg-[#161412] border border-[rgba(212,175,104,0.2)] rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.7)] p-8 w-full max-w-md relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(212,175,104,0.5)] to-transparent" />
          {/* Corner accents */}
          <span className="pointer-events-none absolute left-2 top-2 h-4 w-4 border-l border-t border-[rgba(212,175,104,0.4)]" />
          <span className="pointer-events-none absolute bottom-2 right-2 h-4 w-4 border-b border-r border-[rgba(212,175,104,0.4)]" />

          <div className="mb-2 flex items-center gap-3">
            <span className="h-px w-7" style={{ background: "var(--dash-accent,#bf0603)" }} className="" />
            <p className="text-[9px] font-bold uppercase tracking-[0.35em] text-[var(--dash-accent,#bf0603)]">Secure Payment</p>
          </div>
          <h3 className="font-serif text-2xl text-[#1c1a17] mb-5">
            Complete Payment
          </h3>

          <div className="rounded border border-[#e0d5c0] bg-white p-5 mb-6">
            <p className="text-[8px] font-bold uppercase tracking-[0.25em] text-[#b08840] mb-1">Course</p>
            <p className="text-sm text-[#1c1a17] mb-3 font-serif">{paymentModal.courseId}</p>
            <p className="text-[8px] font-bold uppercase tracking-[0.25em] text-[#7a6a52] mb-1">
              EMI <span className="text-[var(--dash-accent,#bf0603)]">#{paymentModal.emiNumber}</span>
            </p>
            <p className="font-serif text-2xl text-[#1c1a17] mt-2">₹{Number(paymentModal.amount).toLocaleString("en-IN")}</p>
          </div>

          {error && (
            <p className="text-[rgba(255,100,100,0.8)] text-sm mb-4 rounded border border-[rgba(255,100,100,0.2)] bg-[rgba(255,100,100,0.05)] p-3">{error}</p>
          )}
          <div className="flex flex-col gap-3">
            <button
              onClick={() => handlePayment(paymentModal.courseId, paymentModal.emiNumber, paymentModal.amount, "razorpay")}
              className="flex min-h-11 items-center justify-center gap-2 rounded border border-[rgba(212,175,104,0.45)] bg-[rgba(255,255,255,0.025)] text-[10px] font-bold uppercase tracking-[0.2em] text-[#f0d99d] hover:bg-[rgba(212,175,104,0.12)] hover:border-[rgba(212,175,104,0.7)] transition-all"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 border-2 border-[rgba(212,175,104,0.3)] border-t-[var(--dash-accent,#bf0603)] rounded-full animate-spin" />
                  Processing...
                </>
              ) : "Pay with Razorpay"}
            </button>
            {usdAmount ? (
              <div className="mt-1 relative z-10">
                <PayPalScriptProvider options={{ "client-id": PAYPAL_CLIENT_ID, components: "buttons", currency: "USD" }}>
                  <PayPalButtons
                    style={{ layout: "vertical" }}
                    createOrder={(data, actions) => actions.order.create({ purchase_units: [{ amount: { currency_code: "USD", value: usdAmount } }] })}
                    onApprove={async (data, actions) => {
                      try {
                        const details = await actions.order.capture();
                        const paymentId = details.id;
                        const userDetails = { email: userEmail, name: formData.fullName || "NA" };
                        const backendResponse = await fetch("https://backend-7e8f.onrender.com/api/final/paypal/success", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ paymentId, userDetails, amount: paymentModal.amount, courseId: paymentModal.courseId }) });
                        if (!backendResponse.ok) { const errorData = await backendResponse.json(); alert(`Error: ${errorData.error}`); return; }
                        await addDoc(collection(db, "payments"), { userId: userEmail, courseId: paymentModal.courseId, emiNumber: paymentModal.emiNumber, amount: paymentModal.amount, paymentId, status: "paid", timestamp: new Date() });
                        alert(`Payment for EMI #${paymentModal.emiNumber} successful via PayPal!`);
                        closePaymentModal();
                      } catch (error) { alert("An error occurred during payment. Please try again."); }
                    }}
                    onError={() => alert("An error occurred during the PayPal payment process.")}
                  />
                </PayPalScriptProvider>
              </div>
            ) : (
              <div className="flex justify-center items-center p-4">
                <div className="h-5 w-5 border-2 border-[rgba(212,175,104,0.2)] border-t-[var(--dash-accent,#bf0603)] rounded-full animate-spin" />
              </div>
            )}
            <button
              onClick={closePaymentModal}
              className="flex min-h-10 items-center justify-center rounded border border-white/10 bg-white/[0.03] text-[10px] font-bold uppercase tracking-[0.2em] text-white/50 hover:border-white/20 hover:text-white/80 transition-all"
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
    <div className="flex min-h-screen flex-col" style={{ backgroundColor: "var(--dash-bg, #f8fafc)" }}>
      <div id="top-sentinel" className="absolute top-0 left-0 w-full h-px pointer-events-none z-[-1]" />

      <div className="flex flex-1 relative z-10 gap-0">
        <Aside />

        <main className="flex-1 min-w-0 py-6 px-4 sm:px-6 lg:px-10 overflow-x-hidden">
          <div className="max-w-4xl mx-auto space-y-8 pb-12 pt-4">

            {/* ── Page Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[rgba(0,0,0,0.08)]">
              <div>
                <div className="mb-2 flex items-center gap-3">
                  <span className="h-px w-7" style={{ background: "var(--dash-accent,#bf0603)" }} className="" />
                  <p className="text-[9px] font-bold uppercase tracking-[0.35em] text-[var(--dash-accent,#bf0603)]">Financial Overview</p>
                </div>
                <h1 className="font-serif text-2xl sm:text-3xl text-[#1c1a17]">
                  EMI <span className="" style={{ color: "var(--dash-accent,#bf0603)" }}>Details</span>
                </h1>
                <p className="mt-3 flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.25em] text-[#7a6a52]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#82b879] shadow-[0_0_0_4px_rgba(130,184,121,0.15)]" />
                  Active for: <span className="text-[#6b5a40] lowercase">{userEmail}</span>
                </p>
              </div>
            </div>

            {/* ── Empty State ── */}
            {Object.keys(emiSchedules).length === 0 ? (
              <div className="rounded border border-dashed border-[#d5c9b0] bg-white px-6 py-16 text-center">
                {/* Gold credit card icon */}
                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded border border-[rgba(212,175,104,0.25)] bg-[rgba(212,175,104,0.06)] " style={{ color: "var(--dash-accent,#bf0603)" }}>
                  <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <h3 className="font-serif text-xl text-[#1c1a17] mb-2">No Active EMI Plans</h3>
                <p className="text-[#6b5a40] text-sm max-w-sm mx-auto mb-8 leading-relaxed">
                  You are not currently enrolled in any EMI plans. Check our premium courses for flexible payment options.
                </p>
                <Link
                  to="/courses"
                  className="inline-flex min-h-10 items-center rounded border border-[rgba(212,175,104,0.5)] bg-[rgba(255,255,255,0.025)] px-7 text-[10px] font-bold uppercase tracking-[0.2em] text-[#f0d99d] transition hover:-translate-y-0.5 hover:bg-[rgba(212,175,104,0.1)]"
                >
                  Browse Premium Courses
                </Link>
              </div>
            ) : (
              /* ── EMI Schedule Cards ── */
              <div className="space-y-8 pb-10">
                {Object.keys(emiSchedules).map((courseId) => {
                  const schedule = emiSchedules[courseId] || [];
                  const unpaidEMIs = schedule.filter(emi => emi.status === "unpaid");
                  const totalUnpaid = unpaidEMIs.reduce((sum, emi) => sum + Number(emi.amount), 0);
                  const paidEMIs = schedule.filter(emi => emi.status === "paid");
                  const progress = (paidEMIs.length / schedule.length) * 100;

                  return (
                    <div key={courseId} className="rounded border border-[#e0d5c0] overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.4)]">
                      {/* Top gold line */}
                      <div className="h-px bg-gradient-to-r from-transparent via-[rgba(212,175,104,0.4)] to-transparent" />

                      {/* Course header */}
                      <div className="bg-[#f5f0e6] border-b border-[rgba(0,0,0,0.08)] px-6 py-6 md:px-8">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                          <div className="flex-1">
                            <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#b08840] mb-1">Course</p>
                            <h3 className="font-serif text-lg text-[#1c1a17] md:text-xl">{courseId}</h3>

                            {/* Progress bar */}
                            <div className="mt-4 flex items-center gap-4">
                              <p className="text-[8px] font-bold uppercase tracking-[0.25em] text-[#9a8870] shrink-0">Progress</p>
                              <div className="flex-1 max-w-xs">
                                <div className="h-1.5 bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-[#d4af68] transition-all duration-700"
                                    style={{ width: `${progress}%` }}
                                  />
                                </div>
                              </div>
                              <p className="text-[9px] font-bold text-[var(--dash-accent,#bf0603)] shrink-0">{Math.round(progress)}%</p>
                            </div>
                          </div>

                          {/* Remaining amount */}
                          <div className="rounded border border-[#e0d5c0] bg-[rgba(212,175,104,0.05)] px-6 py-4 text-center">
                            <p className="text-[8px] font-bold uppercase tracking-[0.25em] text-[#b08840] mb-1">Remaining</p>
                            <p className="font-serif text-xl text-[#1c1a17]">₹{totalUnpaid.toLocaleString("en-IN")}</p>
                          </div>
                        </div>
                      </div>

                      {/* EMI rows */}
                      <div className="divide-y divide-[#ede7db] p-4 space-y-0">
                        {schedule.map((emi, idx) => (
                          <div
                            key={idx}
                            className="flex flex-col md:flex-row justify-between items-start md:items-center py-4 px-2 gap-4 hover:bg-[#faf6ee] transition-colors group rounded"
                          >
                            <div className="flex items-center gap-4">
                              {/* EMI number badge */}
                              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded border text-[10px] font-bold transition-transform group-hover:scale-105 ${
                                emi.status === 'paid'
                                  ? 'border-[rgba(130,184,121,0.3)] bg-[rgba(130,184,121,0.08)] text-[#82b879]'
                                  : 'border-[#c9a55a]/30 bg-[#fdf7ec] text-[#a07830]'
                              }`}>
                                {String(emi.emiNumber).padStart(2, '0')}
                              </div>
                              <div>
                                <p className="text-sm font-serif text-[#1c1a17]">EMI Payment</p>
                                <p className="text-[8px] font-bold uppercase tracking-[0.25em] text-[#9a8870] mt-0.5">
                                  Due: <span className="text-[#6b5a40]">{emi.date.toLocaleDateString("en-IN")}</span>
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center justify-between md:justify-end gap-5 w-full md:w-auto mt-3 md:mt-0 pt-3 md:pt-0 border-t md:border-0 border-[rgba(212,175,104,0.08)]">
                              <p className="font-serif text-base text-[#1c1a17]">
                                ₹{Number(emi.amount).toLocaleString("en-IN")}
                              </p>
                              {emi.status === "paid" ? (
                                <span className="flex items-center gap-1.5 rounded border border-[rgba(130,184,121,0.3)] bg-[rgba(130,184,121,0.08)] px-4 py-2 text-[8px] font-bold uppercase tracking-widest text-[#82b879]">
                                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                                  </svg>
                                  Paid
                                </span>
                              ) : (
                                <button
                                  onClick={() => openPaymentModal(courseId, emi.emiNumber, emi.amount)}
                                  className="inline-flex min-h-9 items-center rounded border border-[rgba(212,175,104,0.45)] bg-[rgba(255,255,255,0.025)] px-5 text-[9px] font-bold uppercase tracking-[0.2em] text-[#f0d99d] hover:bg-[rgba(212,175,104,0.12)] hover:border-[rgba(212,175,104,0.7)] transition-all hover:-translate-y-0.5"
                                >
                                  Pay Now
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
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
