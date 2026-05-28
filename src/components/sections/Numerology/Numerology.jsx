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

const getKuaNumber = (year, gender) => {
  const lastTwoDigits = year.toString().slice(-2);

  let sum = lastTwoDigits
    .split("")
    .reduce((total, digit) => total + Number(digit), 0);

  sum = reduceToSingleDigit(sum);

  let kua = gender === "male" ? 11 - sum : 4 + sum;
  kua = reduceToSingleDigit(kua);

  if (kua === 5) {
    kua = gender === "male" ? 2 : 8;
  }

  return kua;
};

const chaldeanNameValues = {
  A: 1,
  I: 1,
  J: 1,
  Q: 1,
  Y: 1,

  B: 2,
  K: 2,
  R: 2,

  C: 3,
  G: 3,
  L: 3,
  S: 3,

  D: 4,
  M: 4,
  T: 4,

  E: 5,
  H: 5,
  N: 5,
  X: 5,

  U: 6,
  V: 6,
  W: 6,

  O: 7,
  Z: 7,

  F: 8,
  P: 8,
};

const getNameNumber = (name) => {
  const cleanName = name.toUpperCase().replace(/[^A-Z]/g, "");

  if (!cleanName) return null;

  const total = cleanName
    .split("")
    .reduce((sum, letter) => sum + (chaldeanNameValues[letter] || 0), 0);

  return reduceToSingleDigit(total);
};

const getLoShuData = (day, month, year) => {
  const dobDigits = `${day}${month}${year}`.replace(/0/g, "").split("");

  const count = {
    1: "",
    2: "",
    3: "",
    4: "",
    5: "",
    6: "",
    7: "",
    8: "",
    9: "",
  };

  dobDigits.forEach((digit) => {
    if (count[digit] !== undefined) {
      count[digit] += `${digit} `;
    }
  });

  const present = [];
  const missing = [];

  for (let i = 1; i <= 9; i += 1) {
    if (count[i].trim()) {
      present.push(i);
    } else {
      missing.push(i);
    }
  }

  return { count, present, missing };
};

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const Numerology = () => {
  const [form, setForm] = useState({
    name: "",
    day: "",
    month: "",
    year: "",
    gender: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const result = useMemo(() => {
    const { name, day, month, year, gender } = form;

    if (!name || !day || !month || !year || !gender) return null;
    if (!isValidDate(day, month, year)) return null;

    const nameNumber = getNameNumber(name);
    const mulank = getMulank(day);
    const bhagyank = getBhagyank(day, month, year);
    const kua = getKuaNumber(year, gender);
    const loshu = getLoShuData(day, month, year);

    return {
      nameNumber,
      mulank,
      bhagyank,
      kua,
      loshu,
    };
  }, [form]);

  const handleCalculate = () => {
    const { name, day, month, year, gender } = form;

    setSubmitted(true);

    if (!name.trim() || !day || !month || !year || !gender) {
      setError("Please fill name, day, month, year, and gender.");
      return;
    }

    if (!getNameNumber(name)) {
      setError("Please enter a valid name using alphabet letters.");
      return;
    }

    if (!isValidDate(day, month, year)) {
      setError("Please enter a valid birth date.");
      return;
    }

    setError("");
  };

  return (
    <section className="numerology-section" id="numerology">
      <div className="section-container">
        <div className="flex flex-col text-center gap-1 pb-8 mx-auto max-w-3xl">
          <h2 className="title-batangas text-4xl md:text-5xl font-bold uppercase tracking-tight leading-tight">
            {numerologyData.title}
          </h2>
          <p className="subtitle-poppins text-lg md:text-xl font-medium">
            {numerologyData.subtitle}
          </p>
        </div>

        <div className="numerology-form-card">
          <div className="numerology-form-grid">
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              className="numerology-input numerology-name-input"
            />

            <select
              name="month"
              value={form.month}
              onChange={handleChange}
              className="numerology-input"
            >
              <option value="">Month</option>
              {months.map((month, index) => (
                <option key={month} value={index + 1}>
                  {month}
                </option>
              ))}
            </select>

            <select
              name="day"
              value={form.day}
              onChange={handleChange}
              className="numerology-input"
            >
              <option value="">Day</option>
              {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>

            <input
              type="number"
              name="year"
              placeholder="Year"
              min="1900"
              max="2099"
              value={form.year}
              onChange={handleChange}
              className="numerology-input"
            />

            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              className="numerology-input"
            >
              <option value="">Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          <Button variant="secondary" onClick={handleCalculate} className="mt-8">
            Check My Numbers
          </Button>

          {error && <p className="numerology-error">{error}</p>}
        </div>

        {!submitted && !error && (
          <div className="numerology-intro-card">
            <h3>What you will get</h3>

            <div className="numerology-mini-grid">
              <div className="numerology-mini-item">
                <h4>Name Number</h4>
                <p>Your name vibration number based on Chaldean numerology.</p>
              </div>

              <div className="numerology-mini-item">
                <h4>Mulank</h4>
                <p>Your root personality number.</p>
              </div>

              <div className="numerology-mini-item">
                <h4>Bhagyank</h4>
                <p>Your destiny and life path number.</p>
              </div>

              <div className="numerology-mini-item">
                <h4>Kua Number</h4>
                <p>Your directional energy number.</p>
              </div>

              <div className="numerology-mini-item">
                <h4>Lo Shu Grid</h4>
                <p>Your number pattern and missing energies.</p>
              </div>
            </div>
          </div>
        )}

        {submitted && result && !error && (
          <div className="numerology-result-wrap">
            <div className="numerology-cards">
              <div className="numerology-card">
                <span>Name Number</span>
                <h3>{result.nameNumber}</h3>
                <p>
                  Your name carries this vibration number according to the
                  Chaldean numerology system.
                </p>
              </div>

              <div className="numerology-card">
                <span>Mulank</span>
                <h3>{result.mulank}</h3>
                <p>{meanings[result.mulank]}</p>
              </div>

              <div className="numerology-card">
                <span>Bhagyank</span>
                <h3>{result.bhagyank}</h3>
                <p>{meanings[result.bhagyank]}</p>
              </div>

              <div className="numerology-card">
                <span>Kua Number</span>
                <h3>{result.kua}</h3>
                <p>Used for personal energy and direction analysis.</p>
              </div>

              <div className="numerology-card">
                <span>Present Numbers</span>
                <h3>{result.loshu.present.join(", ") || "None"}</h3>
                <p>Numbers available in your Lo Shu Grid.</p>
              </div>
            </div>

            <div className="loshu-wrapper">
              <div className="loshu-header">
                <h3>Lo Shu Grid</h3>
                <p>Numbers are placed according to the classic Lo Shu layout.</p>
              </div>

              <div className="loshu-grid">
                <div className="loshu-box">
                  <span className="loshu-number">4</span>
                  <p>{result.loshu.count[4].trim() || "-"}</p>
                </div>

                <div className="loshu-box">
                  <span className="loshu-number">9</span>
                  <p>{result.loshu.count[9].trim() || "-"}</p>
                </div>

                <div className="loshu-box">
                  <span className="loshu-number">2</span>
                  <p>{result.loshu.count[2].trim() || "-"}</p>
                </div>

                <div className="loshu-box">
                  <span className="loshu-number">3</span>
                  <p>{result.loshu.count[3].trim() || "-"}</p>
                </div>

                <div className="loshu-box">
                  <span className="loshu-number">5</span>
                  <p>{result.loshu.count[5].trim() || "-"}</p>
                </div>

                <div className="loshu-box">
                  <span className="loshu-number">7</span>
                  <p>{result.loshu.count[7].trim() || "-"}</p>
                </div>

                <div className="loshu-box">
                  <span className="loshu-number">8</span>
                  <p>{result.loshu.count[8].trim() || "-"}</p>
                </div>

                <div className="loshu-box">
                  <span className="loshu-number">1</span>
                  <p>{result.loshu.count[1].trim() || "-"}</p>
                </div>

                <div className="loshu-box">
                  <span className="loshu-number">6</span>
                  <p>{result.loshu.count[6].trim() || "-"}</p>
                </div>
              </div>

              <div className="numerology-info-row">
                <div className="numerology-info-card">
                  <h4>Missing Numbers</h4>
                  <p>{result.loshu.missing.join(", ") || "None"}</p>
                </div>

                <div className="numerology-info-card">
                  <h4>Quick Summary</h4>
                  <p>
                    Name Number shows your name vibration, Mulank shows your
                    personality, Bhagyank reflects your life path, Kua shows
                    energetic direction, and Lo Shu reveals present and missing
                    number patterns.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Numerology;