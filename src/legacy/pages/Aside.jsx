import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import { IoIosContact, IoIosLogOut } from "react-icons/io";

// ── Preset themes ────────────────────────────────────────────────
const PRESETS = [
  {
    key: "admin",
    label: "Admin Red",
    dot: "#bf0603",
    colors: {
      sidebarBg:    "#bf0603",
      sidebarText:  "#ffffff",
      sidebarActive:"#ffffff",
      accent:       "#bf0603",
      pageBg:       "#f8fafc",
      cardBg:       "#ffffff",
    },
  },
  {
    key: "gold-dark",
    label: "Gold Dark",
    dot: "#d4af68",
    colors: {
      sidebarBg:    "#161412",
      sidebarText:  "#d4af68",
      sidebarActive:"#d4af68",
      accent:       "#d4af68",
      pageBg:       "#0c0b09",
      cardBg:       "#1e1b17",
    },
  },
  {
    key: "light",
    label: "Classic Light",
    dot: "#a07830",
    colors: {
      sidebarBg:    "#161412",
      sidebarText:  "#d4af68",
      sidebarActive:"#d4af68",
      accent:       "#a07830",
      pageBg:       "#f0ece4",
      cardBg:       "#ffffff",
    },
  },
  {
    key: "ocean",
    label: "Ocean Blue",
    dot: "#3b82f6",
    colors: {
      sidebarBg:    "#0f172a",
      sidebarText:  "#93c5fd",
      sidebarActive:"#3b82f6",
      accent:       "#3b82f6",
      pageBg:       "#f0f4ff",
      cardBg:       "#ffffff",
    },
  },
  {
    key: "forest",
    label: "Forest Green",
    dot: "#22c55e",
    colors: {
      sidebarBg:    "#052e16",
      sidebarText:  "#86efac",
      sidebarActive:"#22c55e",
      accent:       "#22c55e",
      pageBg:       "#f0fdf4",
      cardBg:       "#ffffff",
    },
  },
  {
    key: "purple",
    label: "Royal Purple",
    dot: "#a855f7",
    colors: {
      sidebarBg:    "#1e1033",
      sidebarText:  "#d8b4fe",
      sidebarActive:"#a855f7",
      accent:       "#a855f7",
      pageBg:       "#faf5ff",
      cardBg:       "#ffffff",
    },
  },
];

const DEFAULT_COLORS = PRESETS[0].colors; // Admin Red (matches admin panel)

const COLOR_FIELDS = [
  { key: "sidebarBg",    label: "Sidebar Background" },
  { key: "sidebarText",  label: "Sidebar Text" },
  { key: "sidebarActive",label: "Sidebar Active" },
  { key: "accent",       label: "Accent / Button Color" },
  { key: "pageBg",       label: "Page Background" },
  { key: "cardBg",       label: "Card Background" },
];

const loadSavedColors = () => {
  try {
    const saved = localStorage.getItem("dash-colors");
    return saved ? JSON.parse(saved) : DEFAULT_COLORS;
  } catch {
    return DEFAULT_COLORS;
  }
};

const applyColors = (colors) => {
  const root = document.documentElement;
  root.style.setProperty("--dash-sidebar-bg",     colors.sidebarBg);
  root.style.setProperty("--dash-sidebar-text",   colors.sidebarText);
  root.style.setProperty("--dash-sidebar-active", colors.sidebarActive);
  root.style.setProperty("--dash-accent",         colors.accent);
  root.style.setProperty("--dash-bg",             colors.pageBg);
  root.style.setProperty("--dash-card",           colors.cardBg);
};

// ── Component ─────────────────────────────────────────────────────
const Aside = () => {
  const [sidebarOpen,  setSidebarOpen]  = useState(false);
  const [panelOpen,    setPanelOpen]    = useState(false);
  const [draft,        setDraft]        = useState(loadSavedColors);
  const [applied,      setApplied]      = useState(loadSavedColors);
  const [formData,     setFormData]     = useState({ profilePic: "", fullName: "Student" });

  const navigate    = useNavigate();
  const location    = useLocation();
  const db          = getFirestore();
  const auth        = getAuth();
  const sidebarRef  = useRef();

  // Apply saved colors on mount
  useEffect(() => { applyColors(applied); }, []);

  // Close sidebar on outside click (mobile)
  useEffect(() => {
    const handler = (e) => {
      if (sidebarOpen && sidebarRef.current && !sidebarRef.current.contains(e.target) && window.innerWidth < 1024)
        setSidebarOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [sidebarOpen]);

  // Auth + profile
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const snap = await getDoc(doc(db, "students", user.uid));
        setFormData({
          profilePic: snap.exists() ? (snap.data().profilePic || "") : "",
          fullName:   snap.exists() ? (snap.data().fullName || user.displayName || "Student") : (user.displayName || "Student"),
        });
      } else {
        navigate("/login");
      }
    });
    return () => unsub();
  }, [db, auth, navigate]);

  const handleLogout = async () => {
    try { await signOut(auth); navigate("/"); } catch (e) { console.error(e); }
  };

  const handleApply = () => {
    applyColors(draft);
    setApplied(draft);
    localStorage.setItem("dash-colors", JSON.stringify(draft));
    setPanelOpen(false);
  };

  const handleReset = () => {
    setDraft(DEFAULT_COLORS);
  };

  const selectPreset = (preset) => {
    setDraft(preset.colors);
  };

  const menuItems = [
    { title: "My Profile",       path: "/profile" },
    { title: "Enrolled Courses", path: "/enrolledcourse" },
    { title: "Add Courses",      path: "/courses" },
    { title: "Payments",         path: "/finalize" },
    { title: "Course Trash",     path: "/trashed-courses" },
  ];

  return (
    <>
      {/* ── Mobile toggle ── */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden fixed top-4 left-4 w-11 h-11 z-[100] flex items-center justify-center rounded shadow-[0_4px_16px_rgba(0,0,0,0.25)] transition-all"
          style={{ background: "var(--dash-sidebar-bg, #bf0603)", border: "1px solid rgba(255,255,255,0.2)", color: "var(--dash-sidebar-text, #ffffff)" }}
        >
          <div className="flex flex-col gap-1.5">
            <span className="w-5 h-px bg-current rounded-full" />
            <span className="w-5 h-px bg-current rounded-full" />
            <span className="w-3 h-px bg-current rounded-full" />
          </div>
        </button>
      )}

      {/* ── Mobile overlay ── */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[2050] lg:hidden" />
      )}

      {/* ── Styling panel overlay ── */}
      {panelOpen && (
        <div onClick={() => setPanelOpen(false)} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[3000]" />
      )}

      {/* ── Dashboard Styling slide-over panel ── */}
      <div
        className={`fixed top-0 right-0 h-full w-80 max-w-[90vw] z-[3100] flex flex-col bg-white shadow-[-8px_0_40px_rgba(0,0,0,0.2)] transition-transform duration-400 ease-out ${panelOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Panel header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100" style={{ background: applied.sidebarBg }}>
          <div className="flex items-center gap-2.5">
            <svg className="w-4 h-4" fill="none" stroke={applied.sidebarActive} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            <span className="text-sm font-bold tracking-wide" style={{ color: applied.sidebarText }}>Dashboard Styling</span>
          </div>
          <button onClick={() => setPanelOpen(false)} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors" style={{ color: applied.sidebarText }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-6">
          {/* Quick Presets */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-gray-400 mb-3">Quick Presets</p>
            <div className="grid grid-cols-2 gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.key}
                  onClick={() => selectPreset(p)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border text-left transition-all duration-150 ${
                    JSON.stringify(draft) === JSON.stringify(p.colors)
                      ? "border-[rgba(0,0,0,0.3)] shadow-sm bg-gray-50"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <span className="h-5 w-5 rounded-full shrink-0 border border-black/10 shadow-sm" style={{ background: p.dot }} />
                  <span className="text-[11px] font-bold text-gray-700 leading-tight">{p.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Colors */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-gray-400 mb-3">Custom Colors</p>
            <div className="space-y-2.5">
              {COLOR_FIELDS.map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between gap-3 py-1">
                  <span className="text-[12px] font-medium text-gray-600 flex-1">{label}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-mono text-gray-400 uppercase">{draft[key]}</span>
                    <div className="relative">
                      <input
                        type="color"
                        value={draft[key]}
                        onChange={(e) => setDraft((prev) => ({ ...prev, [key]: e.target.value }))}
                        className="w-8 h-8 rounded cursor-pointer border border-gray-200 p-0.5"
                        style={{ background: draft[key] }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Panel footer — Reset + Apply */}
        <div className="flex items-center gap-3 px-5 py-4 border-t border-gray-100 bg-gray-50">
          <button
            onClick={handleReset}
            className="flex-1 flex items-center justify-center gap-2 h-10 rounded-lg border border-gray-300 bg-white text-[11px] font-bold text-gray-600 uppercase tracking-[0.15em] hover:border-gray-400 transition-all"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reset
          </button>
          <button
            onClick={handleApply}
            className="flex-1 flex items-center justify-center gap-2 h-10 rounded-lg text-[11px] font-bold text-white uppercase tracking-[0.15em] transition-all hover:opacity-90"
            style={{ background: draft.accent }}
          >
            Apply
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── Sidebar ── */}
      <aside
        ref={sidebarRef}
        className={`fixed lg:sticky top-0 left-0 w-60 transition-transform duration-500 z-[2100] flex flex-col h-screen overflow-hidden self-start border-r border-[rgba(255,255,255,0.07)]
        ${sidebarOpen ? "translate-x-0 shadow-[30px_0_80px_rgba(0,0,0,0.7)]" : "-translate-x-full lg:translate-x-0"}`}
        style={{ background: applied.sidebarBg }}
      >
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${applied.sidebarActive}, transparent)` }} />

        {/* Mobile close */}
        <div className="lg:hidden flex items-center justify-between px-5 pb-0 pt-6">
          <span className="text-[8px] font-black uppercase tracking-[0.4em]" style={{ color: applied.sidebarText + "60" }}>Student Portal</span>
          <button onClick={() => setSidebarOpen(false)} className="w-8 h-8 flex items-center justify-center rounded border transition-all" style={{ borderColor: applied.sidebarActive + "40", color: applied.sidebarText }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Profile */}
        <div className="flex flex-col items-center text-center px-5 pt-8 pb-6 border-b" style={{ borderColor: applied.sidebarActive + "14" }}>
          <div className="relative mb-4">
            <div className="w-20 h-20 rounded overflow-hidden flex items-center justify-center shadow-[0_8px_24px_rgba(0,0,0,0.4)]" style={{ border: `2px solid ${applied.sidebarActive}50`, background: applied.cardBg + "22" }}>
              {formData.profilePic
                ? <img src={formData.profilePic} alt="Profile" className="w-full h-full object-cover" />
                : <IoIosContact size={36} style={{ color: applied.sidebarActive + "60" }} />
              }
            </div>
            <span className="absolute top-0 left-0 h-3 w-3 border-l border-t" style={{ borderColor: applied.sidebarActive + "90" }} />
            <span className="absolute bottom-0 right-0 h-3 w-3 border-r border-b" style={{ borderColor: applied.sidebarActive + "90" }} />
          </div>
          <h2 className="font-serif text-base tracking-wide" style={{ color: applied.sidebarText }}>{formData.fullName}</h2>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="h-1.5 w-1.5 rounded-full opacity-70" style={{ background: applied.sidebarActive }} />
            <p className="text-[8px] uppercase tracking-[0.4em] font-bold" style={{ color: applied.sidebarText + "50" }}>Sacred Seeker</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto custom-scrollbar px-4 space-y-1.5 py-5">
          {menuItems.map((item, i) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={i}
                onClick={() => { navigate(item.path); if (window.innerWidth < 1024) setSidebarOpen(false); }}
                className="w-full text-left flex items-center gap-3 px-4 py-3 rounded transition-all duration-200 font-bold uppercase text-[9px] tracking-[0.2em]"
                style={isActive
                  ? { background: applied.sidebarActive + "18", border: `1px solid ${applied.sidebarActive}55`, color: applied.sidebarActive }
                  : { border: "1px solid transparent", color: applied.sidebarText + "80" }
                }
                onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.color = applied.sidebarActive + "cc"; e.currentTarget.style.borderColor = applied.sidebarActive + "25"; } }}
                onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.color = applied.sidebarText + "80"; e.currentTarget.style.borderColor = "transparent"; } }}
              >
                {item.title}
              </button>
            );
          })}
        </nav>

        {/* Customize button */}
        <div className="px-4 pb-3 border-b" style={{ borderColor: applied.sidebarActive + "14" }}>
          <button
            onClick={() => setPanelOpen(true)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded border font-bold uppercase text-[9px] tracking-[0.2em] transition-all duration-200"
            style={{ borderColor: applied.sidebarActive + "45", color: applied.sidebarActive, background: applied.sidebarActive + "10" }}
          >
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            Customize
          </button>
        </div>

        {/* Logout */}
        <div className="p-4 flex-shrink-0">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded border font-bold uppercase text-[9px] tracking-[0.25em] transition-all group"
            style={{ borderColor: "rgba(255,255,255,0.08)", color: applied.sidebarText + "55" }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = applied.sidebarActive + "35"; e.currentTarget.style.color = applied.sidebarActive + "aa"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = applied.sidebarText + "55"; }}
          >
            <IoIosLogOut size={15} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Aside;
