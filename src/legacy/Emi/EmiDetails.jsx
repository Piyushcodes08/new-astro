
import React, { useEffect, useState } from "react";
import { db } from "../../firebaseConfig";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
} from "firebase/firestore";
import { useParams, Link } from "react-router-dom";
import Admin from "../pages/Admin"
import Header from "../../components/sections/Header/Header"



/**
 * Helper to group an array of payments by "courseId".
 * Example Output:
 * {
 *   'course1': [paymentDoc, paymentDoc],
 *   'course2': [paymentDoc]
 * }
 */


function groupPaymentsByCourse(paymentsArray) {
  return paymentsArray.reduce((acc, payment) => {
    const { courseId } = payment;
    if (!acc[courseId]) acc[courseId] = [];
    acc[courseId].push(payment);
    return acc;
  }, {});
}

const AdminEMITracking = () => {
  const { email } = useParams(); // Get user email from route params

  const [paymentsByCourse, setPaymentsByCourse] = useState({});
  const [emiPlans, setEmiPlans] = useState([]);
  const [emiSchedules, setEmiSchedules] = useState({});
  const [loading, setLoading] = useState(true);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // 1. Fetch all payments for this user
  useEffect(() => {
    if (!email) {
      setLoading(false);
      return;
    }

    const paymentsQueryRef = query(
      collection(db, "payments"),
      where("userId", "==", email)
    );

    const unsubPayments = onSnapshot(paymentsQueryRef, (snapshot) => {
      const allPayments = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      const grouped = groupPaymentsByCourse(allPayments);
      setPaymentsByCourse(grouped);
      setLoading(false);
    });

    return () => unsubPayments();
  }, [email]);

  // 2. Fetch EMI plans
  useEffect(() => {
    const unsubPlans = onSnapshot(collection(db, "emiPlans"), (snapshot) => {
      const plans = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setEmiPlans(plans);
    });

    return () => unsubPlans();
  }, []);

  // 3. Generate EMI schedules
  useEffect(() => {
    const updatedSchedules = {};

    Object.keys(paymentsByCourse).forEach((courseId) => {
      const userPayments = paymentsByCourse[courseId] || [];

      // Prefer planId-based lookup (most reliable)
      const firstPaymentWithPlanId = userPayments.find(p => p.planId);
      let plan = null;

      if (firstPaymentWithPlanId?.planId) {
        // Use direct planId match — most reliable
        plan = emiPlans.find(p => p.id === firstPaymentWithPlanId.planId);
      }

      // Fallback: match by courseId + amount
      if (!plan) {
        plan = emiPlans.find(
          (p) =>
            p.courseId === courseId &&
            Number(p.amount) === Number(userPayments[0]?.amount)
        );
      }

      // Fallback 2: match by amount alone across all plans
      if (!plan) {
        plan = emiPlans.find(
          (p) => Number(p.amount) === Number(userPayments[0]?.amount)
        );
      }

      if (!plan) {
        // No plan found — still store payments so they show in payment history
        updatedSchedules[courseId] = { payments: userPayments, schedule: [], plan: null };
        return;
      }

      const totalEMIs = parseInt(plan.duration || 0, 10);
      const sortedPayments = [...userPayments].sort((a, b) => {
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
          amount: plan.amount,
          status: i < sortedPayments.length ? "paid" : "unpaid",
        });
      }

      updatedSchedules[courseId] = { payments: sortedPayments, schedule, plan };
    });

    setEmiSchedules(updatedSchedules);
  }, [paymentsByCourse, emiPlans]);



  const sendReminder = async (courseId, emiNumber, emiDate, amount) => {
    try {
      const courseName = emiPlans.find(p => p.courseId === courseId)?.courseName || courseId;
      const plan = emiPlans.find(p =>
        p.courseId === courseId && Number(p.amount) === Number(amount)
      );

      if (!plan) {
        alert('Plan not found for this course and amount');
        return;
      }

      const encodedEmail = encodeURIComponent(email);

      const isLocal = window.location.hostname === "localhost";
      const baseUrl = isLocal ? "http://localhost:5173" : "https://vahlayastro.com";
      const paymentLink = `${baseUrl}/pay/${courseId}/${emiNumber}/${plan.id}/${encodedEmail}`;

      const reminderMessage = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Payment Reminder - ${courseName}</title>
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333333;">
                <div style="max-width: 600px; margin: 20px auto; padding: 30px; border: 1px solid #eeeeee; border-radius: 10px;">
                    
               <h2 style="color: #F37254; font-size: 22px; margin-bottom: 25px;">Friendly Reminder: EMI Payment Due</h2>
            
                    <p>Dear Student,</p>
            
                    <p>This is a reminder that your EMI payment for <strong>${courseName}</strong> is due soon.</p>
            
                    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0;">
                        <h3 style="color: #2c3e50; margin-top: 0;">Payment Details:</h3>
                        <ul style="list-style: none; padding: 0;">
                            <li style="margin-bottom: 8px;">📅 Due Date: ${emiDate.toLocaleDateString()}</li>
                            <li style="margin-bottom: 8px;">💰 Amount Due: ₹${amount}</li>
                            <li style="margin-bottom: 8px;">📚 Course: ${courseName}</li>
                            <li style="margin-bottom: 8px;">🔢 EMI Number: ${emiNumber}</li>
                        </ul>
                    </div>
            
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${paymentLink}" 
                           style="background-color: #F37254; color: white; padding: 12px 30px; 
                                  border-radius: 5px; text-decoration: none; font-weight: bold;
                                  display: inline-block; font-size: 16px;">
                            Pay Now Securely
                        </a>
                    </div>
            
                    <p style="margin-bottom: 25px;">
                        <strong>Need help?</strong><br>
                        For payment assistance or queries, contact us at:<br>
                        📞 +91 79492 17538<br>
                        📧 contact@vahlayastro.com
                    </p>
            
                    <div style="border-top: 1px solid #eeeeee; padding-top: 20px; font-size: 12px; color: #666666;">
                        <p>This is an automated reminder</p>
                        <p>Vahlay Astro Consulting Pvt. Ltd.<br>
                           C 515, Dev Aurum Commercial Complex, Prahlad Nagar, Ahmedabad, Gujarat 380015<br>
                           </p>
                       
                    </div>
                </div>
            </body>
            </html>
          `;
      const reminder = `Reminder: Your EMI No${emiNumber} for course (${courseId}) is due on ${emiDate.toLocaleDateString()}. Please pay to avoid penalties.`;

      // Send notification to user
      await addDoc(collection(db, "notifications"), {
        userId: email,
        message: reminder,
        timestamp: new Date(),
        status: "unread",
        type: "payment-reminder"
      });

      // Send email via backend
      const response = await fetch('https://backend-7e8f.onrender.com/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientEmail: email,
          subject: `Reminder: EMI #${emiNumber} Payment Due for ${courseName}`,
          message: reminderMessage
        }),
      });


      if (response.ok) {
        alert(`Email reminder sent for EMI #${emiNumber} of ${courseId}`);
      } else {
        alert('Failed to send email reminder.');
      }
    } catch (error) {
      console.error('Failed to send reminder:', error);
    }
  };


  // ====================== RENDER ======================

  return (
    <div className="admin-layout flex flex-col min-h-screen">
      <Header />
      <div id="top-sentinel" className="absolute top-0 left-0 w-full h-px pointer-events-none z-[-1]" />
      <div className="flex flex-1 relative z-10 pt-16 gap-0">
        <Admin />

        <main className="flex-1 min-w-0 p-4 md:p-10 py-10 bg-white admin-fluid-container">
          {loading ? (
            <div className="flex justify-center p-20">
              <div className="w-10 h-10 border-4 border-brand-red border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : !email ? (
            <div className="max-w-4xl mx-auto p-10 text-center bg-slate-50 rounded-2xl border border-slate-100">
               <p className="text-slate-400 font-medium italic">No user email provided in the route.</p>
            </div>
          ) : Object.keys(paymentsByCourse).length === 0 ? (
            <div className="max-w-4xl mx-auto p-10 text-center bg-slate-50 rounded-2xl border border-slate-100">
               <p className="text-slate-400 font-medium italic">No payment records found for <span className="text-brand-red font-bold">{email}</span> in the cosmic database.</p>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-10 pt-8">
              <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
              <div className="w-full">
                <div className="flex items-center gap-4 mb-4">
                   <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-white font-bold shadow-md">
                      {email?.charAt(0).toUpperCase()}
                   </div>
                   <div>
                      <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                        EMI <span className="text-brand-red">Tracking</span>
                      </h2>
                      <p className="text-slate-400 text-sm font-medium">{email}</p>
                   </div>
                </div>
              </div>
            </header>

          {Object.keys(emiSchedules).map((courseId) => {
            const entry = emiSchedules[courseId] || {};
            const schedule = entry.schedule || [];
            const userPayments = entry.payments || paymentsByCourse[courseId] || [];
            const plan = entry.plan;

            const paidEMIs = userPayments.length;
            const totalEMIs = schedule.length;
            const remainingEMIs = totalEMIs - paidEMIs;
            const courseName = plan?.courseId || courseId;

            return (
              <div
                key={courseId}
                className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-8 mb-8"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-6">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{courseName}</h3>
                    {plan && <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-bold">{plan.duration} month plan &bull; ₹{plan.amount}/installment</p>}
                  </div>
                  <div className="flex gap-4">
                    <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total</p>
                       <p className="text-sm font-black text-slate-900">{totalEMIs} EMIs</p>
                    </div>
                    <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Paid</p>
                       <p className="text-sm font-black text-green-600">{paidEMIs}</p>
                    </div>
                    {totalEMIs > 0 && (
                      <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Remaining</p>
                         <p className="text-sm font-black text-brand-red">{remainingEMIs}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* EMI Schedule — only if a plan was matched */}
                {schedule.length > 0 && (
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-3">
                      <div className="w-1 h-4 bg-slate-900 rounded-full"></div>
                      EMI Schedule
                    </h4>
                    <div className="space-y-3">
                      {schedule.map((emi) => (
                        <div
                          key={emi.emiNumber}
                          className="flex justify-between items-center p-4 bg-slate-50 border border-slate-100 rounded-2xl group hover:bg-white hover:border-brand-red/20 transition-all"
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${emi.status === "paid" ? "bg-green-100 text-green-600" : "bg-slate-200 text-slate-500"}`}>
                               {emi.emiNumber}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900">EMI #{emi.emiNumber}</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Due: {emi.date.toLocaleDateString()}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-6">
                             <p className="text-sm font-black text-slate-900">₹{emi.amount}</p>
                             {emi.status === "paid" ? (
                              <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-1.5 rounded-full border border-green-100">
                                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                                <span className="text-[10px] font-black uppercase tracking-widest">Paid</span>
                              </div>
                            ) : (
                              <button
                                onClick={() =>
                                  sendReminder(courseId, emi.emiNumber, emi.date, emi.amount)
                                }
                                className="bg-brand-red text-white px-5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:shadow-lg transition-all"
                              >
                                Send Reminder
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* No plan matched — show info */}
                {!plan && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5">
                    <p className="text-yellow-700 text-sm font-bold">⚠️ No matching EMI plan found for this course. Payments are shown below for reference.</p>
                  </div>
                )}

                {/* Payment History */}
                <div className="pt-6 border-t border-slate-100">
                  <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-3">
                    <div className="w-1 h-4 bg-[#b0a102] rounded-full"></div>
                    Payment History
                  </h4>
                  {userPayments.length === 0 ? (
                    <div className="bg-slate-50 p-6 rounded-2xl text-center">
                       <p className="text-slate-400 text-sm italic">No payments recorded yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {userPayments.map((payment, idx) => {
                        const paidDate = payment.timestamp?.toDate
                          ? payment.timestamp.toDate()
                          : payment.timestamp
                          ? new Date(payment.timestamp)
                          : null;
                        return (
                          <div key={payment.id} className="flex justify-between items-center p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                            <div className="flex items-center gap-4">
                               <div className="w-8 h-8 bg-[#b0a102]/10 text-[#b0a102] rounded-lg flex items-center justify-center font-bold text-xs">
                                  {idx + 1}
                               </div>
                               <div>
                                  <p className="text-sm font-bold text-slate-900">EMI #{idx + 1}</p>
                                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                                    {paidDate ? `Paid on ${paidDate.toLocaleDateString()}` : 'Date unavailable'}
                                  </p>
                                  {payment.transactionId && (
                                    <p className="text-[9px] text-slate-300 mt-0.5 font-mono">{payment.transactionId}</p>
                                  )}
                               </div>
                            </div>
                            <p className="text-sm font-black text-slate-900">₹{payment.amount}</p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
            </div>
          )}
        </main>
    </div>
  </div>
  );
};

export default AdminEMITracking;

