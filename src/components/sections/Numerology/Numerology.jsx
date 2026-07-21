import React, { useState } from "react";
import { homeData } from "../../../data/pages/home";
import "./Numerology.css";

const { meanings } = homeData.numerology;

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const pythagoreanNameValues = {
  A: 1, J: 1, S: 1,
  B: 2, K: 2, T: 2,
  C: 3, L: 3, U: 3,
  D: 4, M: 4, V: 4,
  E: 5, N: 5, W: 5,
  F: 6, O: 6, X: 6,
  G: 7, P: 7, Y: 7,
  H: 8, Q: 8, Z: 8,
  I: 9, R: 9,
};

const nameMeanings = {
  1: "The Leader — Ambition, independence, and pioneering spirit.",
  2: "The Diplomat — Harmony, cooperation, and intuitive sensitivity.",
  3: "The Communicator — Creative expression, joy, and social energy.",
  4: "The Builder — Organization, discipline, and practical foundations.",
  5: "The Adventurer — Freedom, adaptability, and progressive thinking.",
  6: "The Nurturer — Love, responsibility, and domestic harmony.",
  7: "The Seeker — Analysis, spiritual insight, and deep wisdom.",
  8: "The Achiever — Power, ambition, and material success.",
  9: "The Humanitarian — Compassion, selflessness, and creative flow.",
};

const loShuOrder = [4, 9, 2, 3, 5, 7, 8, 1, 6];

const reduceToSingleDigit = (number) => {
  let value = Number(number);
  while (value > 9) {
    value = String(value)
      .split("")
      .reduce((sum, digit) => sum + Number(digit), 0);
  }
  return value;
};

const isValidDate = (day, month, year) => {
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  return (
    date.getFullYear() === Number(year) &&
    date.getMonth() === Number(month) - 1 &&
    date.getDate() === Number(day)
  );
};

const getMulank = (day) => reduceToSingleDigit(day);

const getBhagyank = (day, month, year) =>
  reduceToSingleDigit(
    `${day}${month}${year}`
      .split("")
      .reduce((sum, digit) => sum + Number(digit), 0)
  );

const getPythagoreanNameNumber = (name) => {
  const letters = name.toUpperCase().replace(/[^A-Z]/g, "");
  if (!letters) return null;

  const total = letters
    .split("")
    .reduce((sum, letter) => sum + (pythagoreanNameValues[letter] || 0), 0);

  return reduceToSingleDigit(total);
};

const getLoShuData = (day, month, year) => {
  const mulank = getMulank(day);
  const bhagyank = getBhagyank(day, month, year);
  const digits = `${day}${month}${year}`.replace(/0/g, "").split("");

  digits.push(String(mulank), String(bhagyank));

  const count = { 1: "", 2: "", 3: "", 4: "", 5: "", 6: "", 7: "", 8: "", 9: "" };
  digits.forEach((digit) => {
    if (count[digit] !== undefined) count[digit] += digit;
  });

  const present = [];
  const missing = [];
  for (let number = 1; number <= 9; number += 1) {
    (count[number] ? present : missing).push(number);
  }

  return { count, present, missing };
};

const SparkIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 2l2.35 7.65L22 12l-7.65 2.35L12 22l-2.35-7.65L2 12l7.65-2.35L12 2Z" />
  </svg>
);

const PersonIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4.5 3.6-8 8-8s8 3.5 8 8" />
  </svg>
);

const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M8 2v6M16 2v6M3 10h18" />
    <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" />
  </svg>
);

const Numerology = () => {
  const [nameInput, setNameInput] = useState("");
  const [nameSubmitted, setNameSubmitted] = useState(false);
  const [nameResultNumber, setNameResultNumber] = useState(null);
  const [nameError, setNameError] = useState("");

  const [dobMonth, setDobMonth] = useState("");
  const [dobDay, setDobDay] = useState("");
  const [dobYear, setDobYear] = useState("");
  const [dobSubmitted, setDobSubmitted] = useState(false);
  const [dobResult, setDobResult] = useState(null);
  const [dobError, setDobError] = useState("");

  const resetNameResult = (value) => {
    setNameInput(value);
    setNameResultNumber(null);
    setNameSubmitted(false);
    setNameError("");
  };

  const resetDobResult = (setter, value) => {
    setter(value);
    setDobResult(null);
    setDobSubmitted(false);
    setDobError("");
  };

  const handleNameCalculate = () => {
    setNameSubmitted(true);

    if (!nameInput.trim()) {
      setNameError("Please enter your full name.");
      setNameResultNumber(null);
      return;
    }

    const result = getPythagoreanNameNumber(nameInput);
    if (!result) {
      setNameError("Please use alphabetic letters in your name.");
      setNameResultNumber(null);
      return;
    }

    setNameError("");
    setNameResultNumber(result);
  };

  const handleDobCalculate = () => {
    setDobSubmitted(true);

    if (!dobMonth || !dobDay || !dobYear) {
      setDobError("Please select your complete date of birth.");
      setDobResult(null);
      return;
    }

    if (!isValidDate(dobDay, dobMonth, dobYear)) {
      setDobError("Please select a valid date.");
      setDobResult(null);
      return;
    }

    setDobError("");
    setDobResult({
      mulank: getMulank(dobDay),
      bhagyank: getBhagyank(dobDay, dobMonth, dobYear),
      loshu: getLoShuData(dobDay, dobMonth, dobYear),
    });
  };

  return (
    <section className="numerology-section" id="numerology" aria-labelledby="numerology-title">
      <div className="numerology-glow numerology-glow--left" aria-hidden="true" />
      <div className="numerology-glow numerology-glow--right" aria-hidden="true" />

      <div className="section-container numerology-container">
        <div className="numerology-cosmic-card">
          <header className="numerology-header">
            <h2 id="numerology-title" className="title-batangas numerology-title">
              Unlock the <span>Numbers</span>
            </h2>
            <p className="subtitle-poppins numerology-subtitle">
              Discover the hidden numerical patterns that shape your personality,
              purpose, and life journey.
            </p>
    
          </header>

          <div className="numerology-calculators">
            <article className="numerology-calculator-card">
              <span className="numerology-card-corner numerology-card-corner--tl" />
              <span className="numerology-card-corner numerology-card-corner--br" />

              <div className="numerology-calculator-heading">
                <div className="numerology-calculator-icon"><PersonIcon /></div>
                <div>
                  <span className="numerology-step">Calculator 01</span>
                  <h3>Pythagorean Name</h3>
                  <p>Reveal your expression number</p>
                </div>
              </div>

              <label className="numerology-field-label" htmlFor="numerology-name">Your full name</label>
              <div className="numerology-input-shell">
                <PersonIcon />
                <input
                  id="numerology-name"
                  type="text"
                  value={nameInput}
                  onChange={(event) => resetNameResult(event.target.value)}
                  onKeyDown={(event) => event.key === "Enter" && handleNameCalculate()}
                  placeholder="Enter your full name"
                  autoComplete="name"
                />
              </div>

              <button type="button" className="numerology-action" onClick={handleNameCalculate}>
                <SparkIcon /><span>Calculate Name Number</span><b>→</b>
              </button>

              {nameSubmitted && nameError && (
                <p className="numerology-error" role="alert">{nameError}</p>
              )}

              {nameSubmitted && nameResultNumber && !nameError && (
                <div className="numerology-name-result numerology-result-enter">
                  <span className="numerology-result-label">Expression Number</span>
                  <strong>{nameResultNumber}</strong>
                  <p>{nameMeanings[nameResultNumber]}</p>
                </div>
              )}
            </article>

            <article className="numerology-calculator-card">
              <span className="numerology-card-corner numerology-card-corner--tl" />
              <span className="numerology-card-corner numerology-card-corner--br" />

              <div className="numerology-calculator-heading">
                <div className="numerology-calculator-icon"><CalendarIcon /></div>
                <div>
                  <span className="numerology-step">Calculator 02</span>
                  <h3>Date of Birth</h3>
                  <p>Discover your destiny numbers</p>
                </div>
              </div>

              <span className="numerology-field-label">Your birth date</span>
              <div className="numerology-date-grid">
                <label>
                  <span>Month</span>
                  <select value={dobMonth} onChange={(event) => resetDobResult(setDobMonth, event.target.value)}>
                    <option value="">Month</option>
                    {months.map((month, index) => (
                      <option key={month} value={String(index + 1).padStart(2, "0")}>{month}</option>
                    ))}
                  </select>
                </label>

                <label>
                  <span>Day</span>
                  <select value={dobDay} onChange={(event) => resetDobResult(setDobDay, event.target.value)}>
                    <option value="">Day</option>
                    {Array.from({ length: 31 }, (_, index) => String(index + 1).padStart(2, "0")).map((day) => (
                      <option key={day} value={day}>{Number(day)}</option>
                    ))}
                  </select>
                </label>

                <label>
                  <span>Year</span>
                  <select value={dobYear} onChange={(event) => resetDobResult(setDobYear, event.target.value)}>
                    <option value="">Year</option>
                    {Array.from({ length: 100 }, (_, index) => String(new Date().getFullYear() - index)).map((year) => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </label>
              </div>

              <button type="button" className="numerology-action" onClick={handleDobCalculate}>
                <SparkIcon /><span>Calculate Birth Numbers</span><b>→</b>
              </button>

              {dobSubmitted && dobError && (
                <p className="numerology-error" role="alert">{dobError}</p>
              )}

              {dobSubmitted && dobResult && !dobError && (
                <div className="numerology-birth-result numerology-result-enter">
                  <div>
                    <span>Mulank</span>
                    <strong>{dobResult.mulank}</strong>
                    <p>{meanings[dobResult.mulank]}</p>
                  </div>
                  <div>
                    <span>Bhagyank</span>
                    <strong>{dobResult.bhagyank}</strong>
                    <p>{meanings[dobResult.bhagyank]}</p>
                  </div>
                </div>
              )}
            </article>
          </div>

          {dobSubmitted && dobResult && !dobError && (
            <section className="loshu-wrapper numerology-result-enter" aria-labelledby="loshu-title">
              <div className="loshu-copy">
                <span className="numerology-step">Your numerical blueprint</span>
                <h3 id="loshu-title">Lo Shu Grid</h3>
                <p>
                  Your date of birth, Mulank, and Bhagyank arranged according
                  to the traditional Lo Shu numerology system.
                </p>

                <div className="loshu-summary">
                  <div><span>Present</span><strong>{dobResult.loshu.present.join(", ") || "None"}</strong></div>
                  <div><span>Missing</span><strong>{dobResult.loshu.missing.join(", ") || "None"}</strong></div>
                </div>
              </div>

              <div className="loshu-grid" aria-label="Lo Shu numerology grid">
                {loShuOrder.map((number) => {
                  const value = dobResult.loshu.count[number];
                  return (
                    <div className={`loshu-box ${value ? "is-present" : "is-missing"}`} key={number}>
                      <span className="loshu-number">{number}</span>
                      <strong>{value || "—"}</strong>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </div>
    </section>
  );
};

export default Numerology;