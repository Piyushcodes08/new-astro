import React, { useState, useEffect, useCallback } from "react";
import { db } from "../../firebaseConfig";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import SideBar from "./Admin";
import Header from "../../components/sections/Header/Header";
import Footer from "../../components/sections/Footer/Footer";

/* ─── helpers ─────────────────────────────────────────────────── */
const safeStr = (val) => {
  if (val === null || val === undefined) return "—";
  if (typeof val === "string") return val.trim() || "—";
  if (typeof val === "number") return String(val);
  if (val?.toDate) return val.toDate().toLocaleString("en-IN");
  if (val instanceof Date) return val.toLocaleString("en-IN");
  if (typeof val === "object") {
    // reconstruct dob from {day,month,year}
    if (val.day || val.month || val.year)
      return `${val.day || "?"}-${val.month || "?"}-${val.year || "?"}`;
    // reconstruct time from {hour,minute,period}
    if (val.hour !== undefined || val.minute !== undefined)
      return `${val.hour || "?"}:${val.minute || "?"} ${val.period || ""}`.trim();
    return "—";
  }
  return String(val);
};

const formatTimestamp = (raw) => {
  if (!raw) return "—";
  try {
    let d;
    if (raw?.toDate) d = raw.toDate();
    else if (raw instanceof Date) d = raw;
    else if (raw?.seconds) d = new Date(raw.seconds * 1000);
    else d = new Date(raw);
    return d.toLocaleString("en-IN", {
      day: "numeric", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch { return "—"; }
};

const genderColors = {
  male:   { bg: "bg-blue-50",   text: "text-blue-600",   border: "border-blue-100" },
  female: { bg: "bg-pink-50",   text: "text-pink-600",   border: "border-pink-100" },
  other:  { bg: "bg-violet-50", text: "text-violet-600", border: "border-violet-100" },
};
const getGenderStyle = (g = "") => genderColors[g.toLowerCase()] ?? { bg: "bg-slate-100", text: "text-slate-500", border: "border-slate-200" };

/* ─── icons ───────────────────────────────────────────────────── */
const Icon = ({ d, size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
    className={className}>
    <path d={d} />
  </svg>
);
const ICONS = {
  calendar: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  users:    "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75M9 11a4 4 0 100-8 4 4 0 000 8z",
  male:     "M12 2a6 6 0 100 12A6 6 0 0012 2zM19 3l-5 5M19 3h-4M19 3v4",
  female:   "M12 2a6 6 0 100 12A6 6 0 0012 2zM12 14v8M9 19h6",
  search:   "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
  trash:    "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16",
  close:    "M6 18L18 6M6 6l12 12",
  mail:     "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
  phone:    "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.948V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z",
  clock:    "M12 8v4l3 3M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  globe:    "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z",
  cake:     "M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-1.5-.454M9 6l3-3 3 3M12 3v4M6 21V12a1 1 0 011-1h10a1 1 0 011 1v9",
  info:     "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
};

/* ─── sub-components ──────────────────────────────────────────── */
const StatCard = ({ label, value, icon, gradient, textColor }) => (
  <div className={`relative overflow-hidden rounded-2xl p-6 shadow-sm border border-white/20 ${gradient}`}>
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-white/70 mb-1">{label}</p>
        <p className={`text-4xl font-black ${textColor}`}>{value}</p>
      </div>
      <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center text-white">
        <Icon d={icon} size={22} />
      </div>
    </div>
    {/* decorative circle */}
    <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full bg-white/5" />
  </div>
);

const FilterPill = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-5 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border transition-all duration-200 ${
      active
        ? "bg-[#bf0603] text-white border-[#bf0603] shadow-md shadow-[#bf0603]/20"
        : "bg-white text-slate-500 border-slate-200 hover:border-[#bf0603]/50 hover:text-[#bf0603]"
    }`}
  >
    {label}
  </button>
);

const SkeletonCard = () => (
  <div className="bg-white border border-slate-100 rounded-2xl p-6 animate-pulse">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-12 h-12 bg-slate-200 rounded-xl" />
      <div className="flex-1">
        <div className="h-4 bg-slate-200 rounded w-32 mb-2" />
        <div className="h-3 bg-slate-100 rounded w-16" />
      </div>
    </div>
    <div className="grid grid-cols-2 gap-2 mb-4">
      {[1,2,3,4].map(i => <div key={i} className="h-14 bg-slate-100 rounded-xl" />)}
    </div>
    <div className="h-8 bg-slate-100 rounded-xl" />
  </div>
);

/* ─── main component ──────────────────────────────────────────── */
const AdminAppointments = () => {
  const [appointments, setAppointments]           = useState([]);
  const [searchTerm, setSearchTerm]               = useState("");
  const [loading, setLoading]                     = useState(true);
  const [filterGender, setFilterGender]           = useState("all");
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [deleteConfirm, setDeleteConfirm]         = useState(null); // id to confirm

  const fetchAppointments = useCallback(async () => {
    try {
      const snapshot = await getDocs(collection(db, "appointments"));
      const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      list.sort((a, b) => {
        const tA = a.createdAt?.seconds || 0;
        const tB = b.createdAt?.seconds || 0;
        return tB - tA;
      });
      setAppointments(list);
    } catch (err) {
      console.error("Error fetching appointments:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAppointments();
  }, [fetchAppointments]);

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "appointments", id));
      setAppointments((prev) => prev.filter((a) => a.id !== id));
      if (selectedAppointment?.id === id) setSelectedAppointment(null);
    } catch (err) {
      console.error("Error deleting appointment:", err);
    } finally {
      setDeleteConfirm(null);
    }
  };

  const filtered = appointments.filter((a) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      `${a.firstName} ${a.lastName}`.toLowerCase().includes(term) ||
      safeStr(a.email).toLowerCase().includes(term) ||
      safeStr(a.phone).includes(term) ||
      safeStr(a.birthPlace).toLowerCase().includes(term);
    const matchesGender =
      filterGender === "all" || safeStr(a.gender).toLowerCase() === filterGender;
    return matchesSearch && matchesGender;
  });

  const stats = {
    total:  appointments.length,
    male:   appointments.filter((a) => safeStr(a.gender).toLowerCase() === "male").length,
    female: appointments.filter((a) => safeStr(a.gender).toLowerCase() === "female").length,
  };

  const initials = (apt) =>
    `${apt.firstName?.charAt(0) || ""}${apt.lastName?.charAt(0) || ""}`.toUpperCase() || "?";

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Header />

      <div className="flex flex-1 relative z-10 pt-16">
        <SideBar />

        <main className="flex-1 min-w-0 flex flex-col">

          {/* ── Hero banner ── */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-8 md:px-14 py-10 border-b border-slate-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1.5 h-7 rounded-full bg-[#bf0603]" />
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Admin Panel</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                  Appointment <span className="text-[#bf0603]">Bookings</span>
                </h1>
                <p className="text-slate-400 text-sm mt-1.5 font-medium">
                  Review, search, and manage all consultation requests
                </p>
              </div>

              {/* Search */}
              <div className="w-full md:w-80 relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <Icon d={ICONS.search} size={16} />
                </div>
                <input
                  type="text"
                  placeholder="Search name, email, phone…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-700/60 border border-slate-600 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:border-[#bf0603] focus:bg-slate-700 transition-all"
                />
              </div>
            </div>
          </div>

          {/* ── Content ── */}
          <div className="flex-1 px-6 md:px-14 py-8 space-y-8">

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <StatCard label="Total Bookings" value={stats.total}
                icon={ICONS.calendar} gradient="bg-gradient-to-br from-slate-800 to-slate-700"
                textColor="text-white" />
              <StatCard label="Male Clients" value={stats.male}
                icon={ICONS.male} gradient="bg-gradient-to-br from-blue-600 to-blue-500"
                textColor="text-white" />
              <StatCard label="Female Clients" value={stats.female}
                icon={ICONS.female} gradient="bg-gradient-to-br from-pink-600 to-rose-500"
                textColor="text-white" />
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Filter:</span>
              {["all", "male", "female", "other"].map((g) => (
                <FilterPill key={g} label={g} active={filterGender === g}
                  onClick={() => setFilterGender(g)} />
              ))}
              {searchTerm && (
                <span className="ml-auto text-xs text-slate-400 font-medium">
                  Showing <span className="font-bold text-slate-700">{filtered.length}</span> result{filtered.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>

            {/* ── Card list + detail panel ── */}
            <div className="flex gap-6 items-start">

              {/* Left: cards */}
              <div className={`min-w-0 transition-all duration-300 ${selectedAppointment ? "flex-1" : "w-full"}`}>
                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="text-center py-24 bg-white border border-slate-100 rounded-2xl shadow-sm">
                    <div className="w-16 h-16 mx-auto mb-4 bg-slate-50 rounded-2xl flex items-center justify-center">
                      <Icon d={ICONS.calendar} size={32} className="text-slate-300" />
                    </div>
                    <p className="text-slate-500 font-semibold mb-1">No appointments found</p>
                    <p className="text-slate-400 text-sm">Try adjusting your search or filter</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {filtered.map((apt) => {
                      const isSelected = selectedAppointment?.id === apt.id;
                      const gs = getGenderStyle(safeStr(apt.gender));
                      return (
                        <div
                          key={apt.id}
                          onClick={() => setSelectedAppointment(isSelected ? null : apt)}
                          className={`group relative bg-white rounded-2xl border cursor-pointer transition-all duration-250 overflow-hidden ${
                            isSelected
                              ? "border-[#bf0603] shadow-xl shadow-[#bf0603]/10 ring-2 ring-[#bf0603]/10"
                              : "border-slate-200 shadow-sm hover:shadow-lg hover:border-slate-300"
                          }`}
                        >
                          {/* top accent line */}
                          <div className={`h-1 w-full ${isSelected ? "bg-[#bf0603]" : "bg-transparent group-hover:bg-slate-200 transition-colors"}`} />

                          <div className="p-5 space-y-4">
                            {/* header row */}
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#bf0603] to-amber-600 flex items-center justify-center text-white font-black text-base shadow-md shrink-0">
                                  {initials(apt)}
                                </div>
                                <div>
                                  <p className={`font-bold text-[15px] leading-tight transition-colors ${isSelected ? "text-[#bf0603]" : "text-slate-900 group-hover:text-[#bf0603]"}`}>
                                    {safeStr(apt.firstName)} {safeStr(apt.lastName)}
                                  </p>
                                  <span className={`inline-block text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full mt-0.5 ${gs.bg} ${gs.text}`}>
                                    {safeStr(apt.gender)}
                                  </span>
                                </div>
                              </div>
                              <button
                                onClick={(e) => { e.stopPropagation(); setDeleteConfirm(apt.id); }}
                                className="shrink-0 w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all"
                              >
                                <Icon d={ICONS.trash} size={14} />
                              </button>
                            </div>

                            {/* info grid */}
                            <div className="grid grid-cols-2 gap-2">
                              {[
                                { icon: ICONS.mail,  label: "Email",      value: safeStr(apt.email) },
                                { icon: ICONS.phone, label: "Phone",      value: safeStr(apt.phone) },
                                { icon: ICONS.cake,  label: "Date of Birth", value: safeStr(apt.dob) },
                                { icon: ICONS.clock, label: "Birth Time", value: safeStr(apt.birthTime) },
                              ].map((item) => (
                                <div key={item.label} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                                  <div className="flex items-center gap-1.5 mb-1">
                                    <Icon d={item.icon} size={11} className="text-slate-400 shrink-0" />
                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{item.label}</p>
                                  </div>
                                  <p className="text-[12px] text-slate-700 font-semibold truncate">{item.value}</p>
                                </div>
                              ))}
                            </div>

                            {/* footer */}
                            <div className="flex items-center justify-between pt-1 border-t border-slate-50">
                              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
                                <Icon d={ICONS.clock} size={11} className="shrink-0" />
                                {formatTimestamp(apt.createdAt)}
                              </div>
                              <a
                                href={`mailto:${safeStr(apt.email)}`}
                                onClick={(e) => e.stopPropagation()}
                                className="flex items-center gap-1.5 bg-[#bf0603] text-white px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-red-700 hover:shadow-md transition-all"
                              >
                                <Icon d={ICONS.mail} size={11} />
                                Reply
                              </a>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Right: detail panel */}
              {selectedAppointment && (
                <aside className="w-[320px] shrink-0 sticky top-24 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
                  {/* panel header */}
                  <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-5 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#bf0603] to-amber-600 flex items-center justify-center text-white font-black text-sm shadow-md">
                        {initials(selectedAppointment)}
                      </div>
                      <div>
                        <p className="text-white font-bold text-sm leading-tight">
                          {safeStr(selectedAppointment.firstName)} {safeStr(selectedAppointment.lastName)}
                        </p>
                        <span className={`inline-block text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full mt-0.5 ${getGenderStyle(safeStr(selectedAppointment.gender)).bg} ${getGenderStyle(safeStr(selectedAppointment.gender)).text}`}>
                          {safeStr(selectedAppointment.gender)}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedAppointment(null)}
                      className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-white/70 hover:bg-white/20 hover:text-white transition-all"
                    >
                      <Icon d={ICONS.close} size={14} />
                    </button>
                  </div>

                  {/* fields */}
                  <div className="p-5 space-y-4">
                    {[
                      { icon: ICONS.mail,  label: "Email Address",  value: safeStr(selectedAppointment.email) },
                      { icon: ICONS.phone, label: "Phone Number",   value: safeStr(selectedAppointment.phone) },
                      { icon: ICONS.cake,  label: "Date of Birth",  value: safeStr(selectedAppointment.dob) },
                      { icon: ICONS.clock, label: "Birth Time",     value: safeStr(selectedAppointment.birthTime) },
                      { icon: ICONS.globe, label: "Birth Place",    value: safeStr(selectedAppointment.birthPlace) },
                      { icon: ICONS.calendar, label: "Submitted On", value: formatTimestamp(selectedAppointment.createdAt) },
                    ].map((item) => (
                      <div key={item.label} className="flex gap-3 items-start">
                        <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 shrink-0 mt-0.5">
                          <Icon d={item.icon} size={15} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{item.label}</p>
                          <p className="text-[13px] text-slate-800 font-semibold break-words">{item.value}</p>
                        </div>
                      </div>
                    ))}

                    {selectedAppointment.details && typeof selectedAppointment.details === "string" && (
                      <div className="rounded-xl bg-amber-50 border border-amber-100 p-4">
                        <div className="flex items-center gap-1.5 mb-2">
                          <Icon d={ICONS.info} size={13} className="text-amber-500" />
                          <p className="text-[9px] font-bold text-amber-600 uppercase tracking-widest">Consultation Notes</p>
                        </div>
                        <p className="text-[13px] text-amber-800 leading-relaxed italic">
                          "{selectedAppointment.details}"
                        </p>
                      </div>
                    )}
                  </div>

                  {/* actions */}
                  <div className="px-5 pb-5 flex gap-2">
                    <a
                      href={`mailto:${safeStr(selectedAppointment.email)}`}
                      className="flex-1 flex items-center justify-center gap-2 bg-[#bf0603] text-white py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-red-700 hover:shadow-lg transition-all"
                    >
                      <Icon d={ICONS.mail} size={14} /> Send Email
                    </a>
                    <button
                      onClick={() => setDeleteConfirm(selectedAppointment.id)}
                      className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-200 text-slate-400 hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all"
                    >
                      <Icon d={ICONS.trash} size={15} />
                    </button>
                  </div>
                </aside>
              )}
            </div>
          </div>
        </main>
      </div>

      <Footer />

      {/* ── Delete confirmation modal ── */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center animate-[fadeIn_0.2s_ease]">
            <div className="w-14 h-14 mx-auto mb-4 bg-red-50 rounded-2xl flex items-center justify-center">
              <Icon d={ICONS.trash} size={26} className="text-red-500" />
            </div>
            <h3 className="text-lg font-black text-slate-900 mb-1">Delete Appointment?</h3>
            <p className="text-slate-400 text-sm mb-6">This action cannot be undone. The appointment record will be permanently removed.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 shadow-md hover:shadow-lg transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAppointments;
