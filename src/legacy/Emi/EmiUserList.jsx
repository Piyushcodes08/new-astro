
import React, { useEffect, useState } from "react";
import { db } from "../../firebaseConfig";
import { collection, onSnapshot } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import Admin from "../pages/Admin";
import Header from "../../components/sections/Header/Header";
const AdminEMIUsers = () => {
  const [emiUsers, setEmiUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "payments"), (snapshot) => {
      const usersMap = new Map();

      snapshot.docs.forEach((doc) => {
        const paymentData = doc.data();
        if (paymentData.userId) {
          if (!usersMap.has(paymentData.userId)) {
            usersMap.set(paymentData.userId, {
              email: paymentData.userId,
              payments: [],
            });
          }
          usersMap.get(paymentData.userId).payments.push(paymentData);
        }
      });

      setEmiUsers(Array.from(usersMap.values()));
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="admin-layout min-h-screen flex flex-col">
      <div id="top-sentinel" className="absolute top-0 left-0 w-full h-px pointer-events-none z-[-1]" />
      <Header />
      <div className="flex flex-1 relative z-10 pt-16 gap-0">
        {/* Sidebar - Always visible on desktop and mobile */}
        <Admin />

        <main className="flex-1 min-w-0 p-4 md:p-10 py-10 bg-white">
          <div className="max-w-6xl mx-auto space-y-10 pt-8">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
              <div>
                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  EMI Enrolled <span className="text-brand-red">Users</span>
                </h2>
                <p className="text-slate-400 text-sm mt-1 font-medium">Monitor active installment plans and user payment history</p>
              </div>
            </header>

            {loading ? (
              <div className="flex justify-center p-20">
                <div className="w-10 h-10 border-4 border-brand-red border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <>
                <div className="hidden md:block overflow-hidden rounded-2xl border border-slate-100 shadow-sm">
                  <table className="w-full text-left border-collapse bg-white">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Email Address</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                          Total Payments
                        </th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {emiUsers.length > 0 ? (
                        emiUsers.map((user, index) => (
                          <tr
                            key={index}
                            className="hover:bg-slate-50 transition-all group border-b border-slate-50 last:border-0"
                          >
                            <td className="px-6 py-5 text-sm font-medium text-slate-700 wrap-break-word">{user.email}</td>
                            <td className="px-6 py-5 text-sm font-bold text-brand-red">{user.payments.length}</td>
                            <td className="px-6 py-5 text-right">
                              <button
                                onClick={() =>
                                  navigate(`/admin/emailuserlist/${user.email}`)
                                }
                                className="bg-brand-red text-white px-6 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest hover:shadow-lg transition-all"
                              >
                                View Details
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="3" className="text-center py-20 text-slate-400 font-medium italic bg-slate-50/50">
                            No users found in the cosmic payment database.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="block md:hidden space-y-4">
                  {emiUsers.length > 0 ? (
                    emiUsers.map((user, index) => (
                      <div
                        key={index}
                        className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4"
                      >
                        <div>
                          <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">User Account</p>
                          <p className="text-sm font-bold text-slate-900 break-all">
                            {user.email}
                          </p>
                        </div>
                        <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl">
                          <p className="text-xs font-bold text-slate-500 uppercase">Payments</p>
                          <p className="text-sm font-black text-brand-red">{user.payments.length}</p>
                        </div>
                        <button
                          onClick={() => navigate(`/admin/emailuserlist/${user.email}`)}
                          className="bg-brand-red text-white py-4 rounded-xl font-bold uppercase tracking-widest text-[10px] w-full shadow-md"
                        >
                          View Details
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-center py-12 text-slate-400 italic">No users found.</p>
                  )}
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminEMIUsers;