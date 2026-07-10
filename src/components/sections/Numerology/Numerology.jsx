import React, { useMemo, useState } from "react";
import Button from "../../ui/Button/Button";
import { homeData } from "../../../data/pages/home";
import "./Numerology.css";

const { numerology: numerologyData } = homeData;
const { meanings } = numerologyData;

const reduceToSingleDigit = (num) => {
  let value = Number(num);
  while (value > 9) {
    value = value
      .toString()
      .split("")
      .reduce((sum, digit) => sum + Number(digit), 0);
  }
  return value;
};

const isValidDate = (day, month, year) => {
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === Number(year) &&
    date.getMonth() === Number(month) - 1 &&
    date.getDate() === Number(day)
  );
};

const getMulank = (day) => reduceToSingleDigit(day);

const getBhagyank = (day, month, year) => {
  const dobString = `${day}${month}${year}`;
  const total = dobString
    .split("")
    .reduce((sum, digit) => sum + Number(digit), 0);
  return reduceToSingleDigit(total);
};

const pythagoreanNameValues = {
  A: 1, J: 1, S: 1,
  B: 2, K: 2, T: 2,
  C: 3, L: 3, U: 3,
  D: 4, M: 4, V: 4,
  E: 5, N: 5, W: 5,
  F: 6, O: 6, X: 6,
  G: 7, P: 7, Y: 7,
  H: 8, Q: 8, Z: 8,
  I: 9, R: 9
};

const getPythagoreanNameNumber = (name) => {
  const cleanName = name.toUpperCase().replace(/[^A-Z]/g, "");
  if (!cleanName) return null;
  const total = cleanName
    .split("")
    .reduce((sum, letter) => sum + (pythagoreanNameValues[letter] || 0), 0);
  return reduceToSingleDigit(total);
};

const getLoShuData = (day, month, year) => {
  const mulank = getMulank(day);
  const bhagyank = getBhagyank(day, month, year);
  
  // Collect all digits of DOB, plus Mulank and Bhagyank
  const dobDigits = `${day}${month}${year}`.replace(/0/g, "").split("");
  dobDigits.push(String(mulank));
  dobDigits.push(String(bhagyank));

  const count = {
    1: "", 2: "", 3: "", 4: "", 5: "", 6: "", 7: "", 8: "", 9: ""
  };
  dobDigits.forEach((digit) => {
    if (count[digit] !== undefined) {
      count[digit] += digit; // Concatenate directly to prevent wrapping
    }
  });
  const present = [];
  const missing = [];
  for (let i = 1; i <= 9; i += 1) {
    if (count[i]) {
      present.push(i);
    } else {
      missing.push(i);
    }
  }
  return { count, present, missing };
};

const nameMeanings = {
  1: "The Leader — Ambition, independence, and pioneering spirit.",
  2: "The Diplomat — Harmony, cooperation, and intuitive sensitivity.",
  3: "The Communicator — Creative self-expression, joy, and social energy.",
  4: "The Builder — Organization, discipline, and practical foundations.",
  5: "The Adventurer — Freedom, adaptability, and progressive thinking.",
  6: "The Nurturer — Love, responsibility, and domestic harmony.",
  7: "The Seeker — Analysis, spiritual insight, and deep wisdom.",
  8: "The Achiever — Power, ambition, and material success.",
  9: "The Humanitarian — Compassion, selflessness, and creative flow."
};

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const Numerology = () => {
  // Name form state
  const [nameInput, setNameInput] = useState("");
  const [nameSubmitted, setNameSubmitted] = useState(false);
  const [nameResultNumber, setNameResultNumber] = useState(null);
  const [nameError, setNameError] = useState("");

  // DOB form state
  const [dobMonth, setDobMonth] = useState("");
  const [dobDay, setDobDay] = useState("");
  const [dobYear, setDobYear] = useState("");
  const [dobSubmitted, setDobSubmitted] = useState(false);
  const [dobResult, setDobResult] = useState(null);
  const [dobError, setDobError] = useState("");

  const handleNameCalculate = () => {
    setNameSubmitted(true);
    if (!nameInput.trim()) {
      setNameError("Please enter your name.");
      setNameResultNumber(null);
      return;
    }
    const nameNum = getPythagoreanNameNumber(nameInput);
    if (!nameNum) {
      setNameError("Please enter a valid name using letters.");
      setNameResultNumber(null);
      return;
    }
    setNameError("");
    setNameResultNumber(nameNum);
  };

  const handleDobCalculate = () => {
    setDobSubmitted(true);
    if (!dobMonth || !dobDay || !dobYear) {
      setDobError("Please select month, day, and year.");
      setDobResult(null);
      return;
    }
    if (!isValidDate(dobDay, dobMonth, dobYear)) {
      setDobError("Please select a valid date.");
      setDobResult(null);
      return;
    }
    setDobError("");
    const mulank = getMulank(dobDay);
    const bhagyank = getBhagyank(dobDay, dobMonth, dobYear);
    const loshu = getLoShuData(dobDay, dobMonth, dobYear);
    setDobResult({
      mulank,
      bhagyank,
      loshu
    });
  };

  return (
    <section className="numerology-section" id="numerology">
      <div className="section-container">
        
        {/* Main Card Container with Cosmic Red Theme */}
        <div className="numerology-cosmic-card">
          {/* Header */}
          <div className="text-center px-4 pt-10 pb-8">
            <div className="flex justify-center mb-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-amber-300">
                <path d="M12 2L9.5 9H2l5.9 4.3L5.5 20 12 15.7 18.5 20l-2.4-6.7L22 9h-7.5L12 2z" fill="currentColor" opacity="0.8"/>
                <path d="M12 2L9.5 9H2l5.9 4.3L5.5 20 12 15.7 18.5 20l-2.4-6.7L22 9h-7.5L12 2z" stroke="currentColor" strokeWidth="1" fill="none"/>
              </svg>
            </div>
            <h2 className="title-batangas text-3xl md:text-4xl font-bold text-amber-200 mb-2 uppercase tracking-wide">
              Unlock the Power of Numbers
            </h2>
            <p className="subtitle-poppins text-sm md:text-base text-amber-300/80 max-w-2xl mx-auto">
              Ancient wisdom. Modern clarity. Discover the numbers that shape your destiny.
            </p>
          </div>

          {/* Two Columns Grid for Forms */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-6 md:px-8 pb-10">

            {/* Left Card: Pythagorean Name Calculator */}
            <div className="rounded-2xl p-6 md:p-8 flex flex-col justify-between space-y-6" style={{background:'rgba(0,0,0,0.3)', border:'1px solid rgba(255,160,50,0.15)'}}>
              <div className="space-y-4">
                {/* Icon & Title */}
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{background:'rgba(191,6,3,0.2)', border:'1px solid rgba(191,6,3,0.4)'}}>
                    <svg width="32" height="32" viewBox="0 0 50 50" fill="none">
                      <polygon points="25,5 31,20 47,20 34,30 39,45 25,36 11,45 16,30 3,20 19,20" stroke="#f59e0b" strokeWidth="2.2" fill="rgba(245,158,11,0.1)"/>
                    </svg>
                  </div>
                  <h3 className="text-xl md:text-2xl font-black text-amber-200 uppercase tracking-wide" style={{fontFamily:'serif'}}>Pythagorean</h3>
                  <p className="text-amber-300/60 text-xs">Find your name number</p>
                </div>

                {/* Input Container */}
                <div className="flex items-center gap-3 rounded-xl px-4 py-3.5" style={{background:'rgba(0,0,0,0.4)', border:'1px solid rgba(255,160,50,0.2)'}}>
                  <svg width="18" height="18" fill="none" stroke="rgba(245,158,11,0.7)" strokeWidth="1.8" viewBox="0 0 24 24">
                    <circle cx="12" cy="8" r="4"/>
                    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                  </svg>
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => { setNameInput(e.target.value); setNameResultNumber(null); setNameSubmitted(false); }}
                    placeholder="Full Name"
                    className="flex-1 bg-transparent text-amber-100 text-sm md:text-base font-medium placeholder-amber-300/40 outline-none"
                  />
                </div>
              </div>

              {/* Action Button */}
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={handleNameCalculate}
                  className="w-full py-3.5 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all hover:brightness-110 shadow-lg"
                  style={{background:'linear-gradient(90deg,#bf0603,#8b0000)'}}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-amber-200"><path d="M12 2L9.5 9H2l5.9 4.3L5.5 20 12 15.7 18.5 20l-2.4-6.7L22 9h-7.5L12 2z"/></svg>
                  <span className="text-white uppercase tracking-widest text-[11px]">Check Name Number</span>
                  <span className="text-white">→</span>
                </button>
                {nameSubmitted && nameError && <p className="text-red-400 text-xs text-center font-semibold">{nameError}</p>}
              </div>

              {/* Result Area */}
              {nameSubmitted && nameResultNumber && !nameError && (
                <div className="rounded-xl p-5 mt-4 text-center animate-fade-in" style={{background:'rgba(191,6,3,0.15)', border:'1px solid rgba(191,6,3,0.3)'}}>
                  <div className="text-6xl font-black text-amber-300 leading-none mb-1" style={{fontFamily:'serif'}}>{nameResultNumber}</div>
                  <div className="text-[10px] font-black text-amber-300/60 uppercase tracking-widest mb-2">Expression Number</div>
                  <p className="text-xs text-amber-100/90 leading-relaxed font-medium">{nameMeanings[nameResultNumber]}</p>
                </div>
              )}
            </div>

            {/* Right Card: DOB / Birth Calculator */}
            <div className="rounded-2xl p-6 md:p-8 flex flex-col justify-between space-y-6" style={{background:'rgba(0,0,0,0.3)', border:'1px solid rgba(255,160,50,0.15)'}}>
              <div className="space-y-4">
                {/* Icon & Title */}
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{background:'rgba(191,6,3,0.2)', border:'1px solid rgba(191,6,3,0.4)'}}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.8">
                      <rect x="3" y="4" width="18" height="18" rx="2"/>
                      <path d="M16 2v4M8 2v4M3 10h18"/>
                      <circle cx="8" cy="15" r="1" fill="#f59e0b"/>
                      <circle cx="12" cy="15" r="1" fill="#f59e0b"/>
                      <circle cx="16" cy="15" r="1" fill="#f59e0b"/>
                    </svg>
                  </div>
                  <h3 className="text-xl md:text-2xl font-black text-amber-200 uppercase tracking-wide" style={{fontFamily:'serif'}}>Date of Birth</h3>
                  <p className="text-amber-300/60 text-xs">Discover your birth number</p>
                </div>

                {/* Dropdowns Row */}
                <div className="grid grid-cols-3 gap-2 md:gap-3">
                  {/* Month */}
                  <div className="relative">
                    <select
                      value={dobMonth}
                      onChange={(e) => { setDobMonth(e.target.value); setDobResult(null); setDobSubmitted(false); }}
                      className="w-full rounded-xl px-2 py-3.5 text-slate-800 text-xs md:text-sm font-black appearance-none text-center bg-white border border-slate-200 outline-none cursor-pointer"
                    >
                      <option value="">Month</option>
                      {months.map((m, i) => (
                        <option key={m} value={String(i + 1).padStart(2, "0")}>{m.slice(0, 3)}</option>
                      ))}
                    </select>
                  </div>

                  {/* Day */}
                  <div className="relative">
                    <select
                      value={dobDay}
                      onChange={(e) => { setDobDay(e.target.value); setDobResult(null); setDobSubmitted(false); }}
                      className="w-full rounded-xl px-2 py-3.5 text-slate-800 text-xs md:text-sm font-black appearance-none text-center bg-white border border-slate-200 outline-none cursor-pointer"
                    >
                      <option value="">Day</option>
                      {Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, "0")).map((d) => (
                        <option key={d} value={d}>{Number(d)}</option>
                      ))}
                    </select>
                  </div>

                  {/* Year */}
                  <div className="relative">
                    <select
                      value={dobYear}
                      onChange={(e) => { setDobYear(e.target.value); setDobResult(null); setDobSubmitted(false); }}
                      className="w-full rounded-xl px-2 py-3.5 text-slate-800 text-xs md:text-sm font-black appearance-none text-center bg-white border border-slate-200 outline-none cursor-pointer"
                    >
                      <option value="">Year</option>
                      {Array.from({ length: 100 }, (_, i) => String(new Date().getFullYear() - i)).map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={handleDobCalculate}
                  className="w-full py-3.5 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all hover:brightness-110 shadow-lg"
                  style={{background:'linear-gradient(90deg,#bf0603,#8b0000)'}}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-amber-200"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
                  <span className="text-white uppercase tracking-widest text-[11px]">Check Birth Number</span>
                  <span className="text-white">→</span>
                </button>
                {dobSubmitted && dobError && <p className="text-red-400 text-xs text-center font-semibold">{dobError}</p>}
              </div>

              {/* Result Area */}
              {dobSubmitted && dobResult && !dobError && (
                <div className="rounded-xl p-5 mt-4 text-center animate-fade-in space-y-4" style={{background:'rgba(191,6,3,0.15)', border:'1px solid rgba(191,6,3,0.3)'}}>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-5xl font-black text-amber-300 leading-none mb-1" style={{fontFamily:'serif'}}>{dobResult.mulank}</div>
                      <div className="text-[9px] font-black text-amber-300/60 uppercase tracking-widest">Mulank</div>
                    </div>
                    <div>
                      <div className="text-5xl font-black text-amber-300 leading-none mb-1" style={{fontFamily:'serif'}}>{dobResult.bhagyank}</div>
                      <div className="text-[9px] font-black text-amber-300/60 uppercase tracking-widest">Bhagyank</div>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-red-900/30 text-left">
                    <p className="text-xs text-amber-100/90 leading-relaxed font-semibold mb-2">
                      <span className="text-amber-300">Mulank Meaning:</span> {meanings[dobResult.mulank]}
                    </p>
                    <p className="text-xs text-amber-100/90 leading-relaxed font-semibold">
                      <span className="text-amber-300">Bhagyank Meaning:</span> {meanings[dobResult.bhagyank]}
                    </p>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Lo Shu Grid Display (renders below if DOB results exist) */}
          {dobSubmitted && dobResult && !dobError && (
            <div className="px-6 md:px-8 pb-10 pt-4 border-t border-amber-900/20 animate-fade-in">
              <div className="max-w-md mx-auto rounded-2xl p-6" style={{background:'rgba(0,0,0,0.25)', border:'1px solid rgba(255,160,50,0.1)'}}>
                <div className="text-center mb-6">
                  <h4 className="text-amber-200 text-lg font-black uppercase tracking-wider" style={{fontFamily:'serif'}}>Lo Shu Grid</h4>
                  <p className="text-amber-300/50 text-[11px]">Numbers are placed according to the classic Lo Shu layout.</p>
                </div>

                {/* Grid Layout */}
                <div className="grid grid-cols-3 gap-2 max-w-[240px] mx-auto mb-4">
                  {[
                    { val: 4, count: dobResult.loshu.count[4] },
                    { val: 9, count: dobResult.loshu.count[9] },
                    { val: 2, count: dobResult.loshu.count[2] },
                    { val: 3, count: dobResult.loshu.count[3] },
                    { val: 5, count: dobResult.loshu.count[5] },
                    { val: 7, count: dobResult.loshu.count[7] },
                    { val: 8, count: dobResult.loshu.count[8] },
                    { val: 1, count: dobResult.loshu.count[1] },
                    { val: 6, count: dobResult.loshu.count[6] }
                  ].map((box, idx) => (
                    <div key={idx} className="aspect-square flex flex-col justify-center items-center rounded-lg border border-amber-500/20 bg-black/30">
                      <span className="text-[9px] text-amber-500/40 font-bold">{box.val}</span>
                      <span className="text-base font-black text-amber-200">{box.count.trim() || "-"}</span>
                    </div>
                  ))}
                </div>

                <div className="text-center text-[10px] text-amber-300/60 font-medium">
                  Missing Numbers: <span className="text-amber-300 font-bold">{dobResult.loshu.missing.join(", ") || "None"}</span>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </section>
  );
};

export default Numerology;