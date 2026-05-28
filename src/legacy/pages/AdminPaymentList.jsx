import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import Admin from "./Admin";
import Header from "../../components/sections/Header/Header";


const PaymentsList = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "payments"));
        const paymentsData = [];
        let total = 0;

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const timestamp = data.timestamp?.toDate?.() || data.timestamp;
          const payment = {
            id: doc.id,
            amount: data.amount,
            courseId: data.courseId,
            paymentId: data.paymentId,
            status: data.status,
            timestamp: timestamp ? new Date(timestamp).toLocaleString() : "Invalid Date",
            userId: data.userId,
          };

          paymentsData.push(payment);
          total += Number(data.amount || 0);
        });

        setPayments(paymentsData);
        setTotalAmount(total);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching payments:", error);
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  return (
    <div className="admin-layout flex flex-col min-h-screen">
      <div id="top-sentinel" className="absolute top-0 left-0 w-full h-px pointer-events-none z-[-1]" />
      <Header />
      <div className="flex flex-1 relative z-10 pt-16 gap-0">
        <Admin />

        <main className="flex-1 min-w-0 py-10 px-[15px] md:px-[50px] bg-white">
          <div className="space-y-8">
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pt-8">
            <div>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Payment <span className="text-[#dd2727]">Transactions</span>
              </h2>
              <p className="text-slate-400 text-sm mt-1 font-medium">Audit and track your cosmic revenue</p>
            </div>
            
            <div className="bg-white border border-slate-200 rounded-2xl p-6 flex items-center gap-4 shadow-sm">
              <div className="bg-[#b0a102]/10 p-4 rounded-xl text-[#b0a102]">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Total Revenue</p>
                <p className="text-2xl font-bold text-slate-900">₹{totalAmount.toLocaleString("en-IN")}</p>
              </div>
            </div>
          </header>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            {loading ? (
              <div className="p-20 space-y-4">
                {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-12 bg-slate-50 rounded-xl animate-pulse"></div>)}
              </div>
            ) : payments.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-500">No payment records found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-400">Order Details</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-400">User ID</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-400">Amount</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-400">Status</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-400 text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {payments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-slate-50 transition-colors group border-b border-slate-100 last:border-0">
                        <td className="px-6 py-5">
                          <p className="font-bold text-slate-900 group-hover:text-[#dd2727] transition-colors">{payment.courseId}</p>
                          <p className="text-[10px] text-slate-400 font-mono mt-1 uppercase">ID: {payment.paymentId}</p>
                        </td>
                        <td className="px-6 py-5 text-sm text-slate-500">{payment.userId}</td>
                        <td className="px-6 py-5 font-bold text-[#b0a102]">₹{payment.amount}</td>
                        <td className="px-6 py-5">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${payment.status === 'success' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                            {payment.status}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right text-xs text-slate-400">{payment.timestamp}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
        </main>
      </div>
    </div>
  );
};

export default PaymentsList;

