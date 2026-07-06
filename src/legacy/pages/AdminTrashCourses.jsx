import React, { useState, useEffect } from "react";
import { db } from "../../firebaseConfig";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import SideBar from "./Admin";
import Header from "../../components/sections/Header/Header";
import Footer from "../../components/sections/Footer/Footer";

const AdminTrashCourses = () => {
  const [trashedCourses, setTrashedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchTrashedCourses();
  }, []);

  const fetchTrashedCourses = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, "trash_courses"));
      const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      // Sort by deleted time — latest first
      list.sort((a, b) => {
        const tA = a._deletedAt?.seconds || 0;
        const tB = b._deletedAt?.seconds || 0;
        return tB - tA;
      });
      setTrashedCourses(list);
    } catch (err) {
      console.error("Error fetching trash:", err);
    } finally {
      setLoading(false);
    }
  };

  // Restore course back to its original collection
  const handleRestore = async (course) => {
    if (!window.confirm(`Restore "${course.title}"?`)) return;
    setActionLoading(course.id);
    try {
      const { _originalCollection, _originalId, _deletedAt, ...originalData } = course;
      const targetCollection = _originalCollection || (course.type === "free" ? "freeCourses" : "paidCourses");
      const docId = _originalId || course.id;

      // Write back to original collection
      await setDoc(doc(db, targetCollection, docId), {
        ...originalData,
        restoredAt: serverTimestamp(),
      });

      // Remove from trash
      await deleteDoc(doc(db, "trash_courses", course.id));

      alert(`"${course.title}" restored successfully!`);
      fetchTrashedCourses();
    } catch (err) {
      console.error("Error restoring course:", err);
      alert("Failed to restore. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  // Permanently delete from trash
  const handlePermanentDelete = async (course) => {
    if (!window.confirm(`Permanently delete "${course.title}"? This cannot be undone.`)) return;
    setActionLoading(course.id);
    try {
      await deleteDoc(doc(db, "trash_courses", course.id));
      setTrashedCourses((prev) => prev.filter((c) => c.id !== course.id));
      alert("Permanently deleted.");
    } catch (err) {
      console.error("Error permanently deleting:", err);
      alert("Failed to delete. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (ts) => {
    if (!ts) return "Unknown";
    try {
      return ts.toDate().toLocaleString("en-IN", {
        day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
      });
    } catch {
      return "Unknown";
    }
  };

  return (
    <div className="admin-layout flex flex-col min-h-screen">
      <Header />
      <div className="flex flex-1 relative z-10 pt-16 gap-0">
        <SideBar />

        <main className="flex-1 min-w-0 py-10 px-[15px] md:px-[50px] bg-white">
          <div className="space-y-8">

            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pt-8">
              <div>
                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  Course <span className="text-[#bf0603]">Trash</span>
                </h2>
                <p className="text-slate-400 text-sm mt-1 font-medium">
                  Deleted courses — restore or permanently remove them
                </p>
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400 bg-slate-100 px-4 py-2 rounded-full">
                {trashedCourses.length} item{trashedCourses.length !== 1 ? "s" : ""} in trash
              </span>
            </header>

            {/* Content */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-44 bg-slate-50 border border-slate-100 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : trashedCourses.length === 0 ? (
              <div className="text-center py-24 bg-slate-50 border border-slate-100 rounded-2xl">
                <div className="text-5xl mb-4">🗑️</div>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Trash is empty</p>
                <p className="text-slate-300 text-xs mt-2">Deleted courses will appear here</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {trashedCourses.map((course) => (
                  <div
                    key={course.id}
                    className="group bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-[#bf0603]/30 transition-all duration-300 shadow-sm hover:shadow-xl"
                  >
                    <div className="flex items-start gap-4 p-6">
                      {/* Thumbnail */}
                      <div className="w-16 h-16 rounded-xl overflow-hidden border border-slate-100 bg-slate-50 shrink-0">
                        {course.imageUrl ? (
                          <img src={course.imageUrl} alt={course.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl">📚</div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="text-base font-bold text-slate-900 truncate group-hover:text-[#bf0603] transition-colors">
                            {course.title}
                          </h3>
                          <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                            course._originalCollection === "paidCourses"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-emerald-100 text-emerald-700"
                          }`}>
                            {course._originalCollection === "paidCourses" ? "Paid" : "Free"}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mb-1 truncate">{course.Subtitle}</p>
                        <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">
                          🗑 Deleted: {formatDate(course._deletedAt)}
                        </p>
                        {course._originalCollection === "paidCourses" && course.price && (
                          <p className="text-[10px] text-slate-400 mt-0.5">Price: ₹{course.price}</p>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 px-6 pb-5">
                      <button
                        onClick={() => handleRestore(course)}
                        disabled={actionLoading === course.id}
                        className="flex items-center gap-1.5 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl hover:bg-emerald-700 transition-all disabled:opacity-50 cursor-pointer shadow-md hover:shadow-lg"
                      >
                        {actionLoading === course.id ? (
                          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : "↩ Restore"}
                      </button>
                      <button
                        onClick={() => handlePermanentDelete(course)}
                        disabled={actionLoading === course.id}
                        className="flex items-center gap-1.5 bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl hover:bg-red-600 hover:text-white transition-all disabled:opacity-50 cursor-pointer border border-slate-200"
                      >
                        🗑 Delete Forever
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default AdminTrashCourses;
