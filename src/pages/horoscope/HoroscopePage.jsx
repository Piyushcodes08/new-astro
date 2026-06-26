import { useParams, Link, useNavigate } from "react-router-dom";
import { useMemo } from "react";
import { horoscopeData } from "../../data/common/horoscope";
import Header from "../../components/sections/Header/Header";
import Footer from "../../components/sections/Footer/Footer";
import "./HoroscopePage.css";

const elementEmoji = { Fire: "🔥", Earth: "🌍", Air: "💨", Water: "💧" };
const elementColor = {
  Fire: "rgba(191, 6, 3,0.85)",
  Earth: "rgba(120,80,20,0.85)",
  Air: "rgba(60,120,200,0.85)",
  Water: "rgba(20,90,160,0.85)",
};

const dateRanges = {
  Aries:       "March 21 – April 19",
  Taurus:      "April 20 – May 20",
  Gemini:      "May 21 – June 20",
  Cancer:      "June 21 – July 22",
  Leo:         "July 23 – August 22",
  Virgo:       "August 23 – September 22",
  Libra:       "September 23 – October 22",
  Scorpio:     "October 23 – November 21",
  Sagittarius: "November 22 – December 21",
  Capricorn:   "December 22 – January 19",
  Aquarius:    "January 20 – February 18",
  Pisces:      "February 19 – March 20",
};

const rulingPlanets = {
  Aries: "Mars", Taurus: "Venus", Gemini: "Mercury", Cancer: "Moon",
  Leo: "Sun", Virgo: "Mercury", Libra: "Venus", Scorpio: "Pluto",
  Sagittarius: "Jupiter", Capricorn: "Saturn", Aquarius: "Uranus", Pisces: "Neptune",
};

const luckyDetails = {
  Aries:       { number: "9", color: "Red", day: "Tuesday", stone: "Diamond" },
  Taurus:      { number: "6", color: "Green", day: "Friday", stone: "Emerald" },
  Gemini:      { number: "5", color: "Yellow", day: "Wednesday", stone: "Agate" },
  Cancer:      { number: "2", color: "Silver", day: "Monday", stone: "Pearl" },
  Leo:         { number: "1", color: "Gold", day: "Sunday", stone: "Ruby" },
  Virgo:       { number: "5", color: "Green", day: "Wednesday", stone: "Sapphire" },
  Libra:       { number: "6", color: "Pink", day: "Friday", stone: "Opal" },
  Scorpio:     { number: "8", color: "Crimson", day: "Tuesday", stone: "Topaz" },
  Sagittarius: { number: "3", color: "Purple", day: "Thursday", stone: "Turquoise" },
  Capricorn:   { number: "8", color: "Brown", day: "Saturday", stone: "Garnet" },
  Aquarius:    { number: "4", color: "Blue", day: "Saturday", stone: "Amethyst" },
  Pisces:      { number: "7", color: "Sea Green", day: "Thursday", stone: "Aquamarine" },
};

const compatibleSigns = {
  Aries:       ["Leo", "Sagittarius", "Gemini"],
  Taurus:      ["Virgo", "Capricorn", "Cancer"],
  Gemini:      ["Libra", "Aquarius", "Aries"],
  Cancer:      ["Scorpio", "Pisces", "Taurus"],
  Leo:         ["Aries", "Sagittarius", "Libra"],
  Virgo:       ["Taurus", "Capricorn", "Cancer"],
  Libra:       ["Gemini", "Aquarius", "Leo"],
  Scorpio:     ["Cancer", "Pisces", "Virgo"],
  Sagittarius: ["Aries", "Leo", "Aquarius"],
  Capricorn:   ["Taurus", "Virgo", "Scorpio"],
  Aquarius:    ["Gemini", "Libra", "Sagittarius"],
  Pisces:      ["Cancer", "Scorpio", "Taurus"],
};

const strengths = {
  Aries:       ["Natural Leadership", "Courageous & Bold", "High Energy", "Pioneering Spirit"],
  Taurus:      ["Reliable & Loyal", "Patient & Persistent", "Practical Thinker", "Sensual & Warm"],
  Gemini:      ["Quick Intellect", "Highly Adaptable", "Excellent Communicator", "Curious Mind"],
  Cancer:      ["Deep Empathy", "Protective Nature", "Strong Intuition", "Nurturing Soul"],
  Leo:         ["Radiant Charisma", "Creative Flair", "Generous Spirit", "Inspiring Presence"],
  Virgo:       ["Analytical Mind", "Meticulous Detail", "Practical Wisdom", "Reliable Worker"],
  Libra:       ["Diplomatic Grace", "Artistic Eye", "Fair-Minded", "Social Harmony"],
  Scorpio:     ["Magnetic Intensity", "Deep Insight", "Fearless Transformation", "Unwavering Will"],
  Sagittarius: ["Optimistic Vision", "Philosophical Mind", "Love of Freedom", "Adventure Seeker"],
  Capricorn:   ["Disciplined Focus", "Strategic Planning", "Ambitious Drive", "Long-term Vision"],
  Aquarius:    ["Innovative Thinking", "Humanitarian Spirit", "Independent Mind", "Visionary Ideas"],
  Pisces:      ["Artistic Sensitivity", "Deep Compassion", "Spiritual Depth", "Intuitive Wisdom"],
};

export default function HoroscopePage() {
  const { sign } = useParams();
  const navigate = useNavigate();

  const zodiac = useMemo(
    () => horoscopeData.find((z) => z.name.toLowerCase() === sign?.toLowerCase()),
    [sign]
  );

  const currentIndex = useMemo(
    () => horoscopeData.findIndex((z) => z.name.toLowerCase() === sign?.toLowerCase()),
    [sign]
  );

  const prevSign = currentIndex > 0 ? horoscopeData[currentIndex - 1] : null;
  const nextSign = currentIndex < horoscopeData.length - 1 ? horoscopeData[currentIndex + 1] : null;

  if (!zodiac) {
    return (
      <>
        <Header />
        <div className="horo-not-found">
          <h1>Sign Not Found</h1>
          <Link to="/" className="horo-back-btn">← Back to Home</Link>
        </div>
        <Footer />
      </>
    );
  }

  const traits = zodiac.traits.split(", ");
  const lucky = luckyDetails[zodiac.name];
  const compatible = compatibleSigns[zodiac.name];
  const signStrengths = strengths[zodiac.name];
  const planet = rulingPlanets[zodiac.name];
  const elem = zodiac.element;

  return (
    <>
      <Header />
      <div className="horo-page">

        {/* ── HERO BANNER ── */}
        <section className="horo-hero">
          <div className="horo-hero-bg" />
          <div className="horo-hero-nebula" />

          <div className="horo-hero-inner">
            {/* Breadcrumb */}
            <nav className="horo-breadcrumb">
              <Link to="/">Home</Link>
              <span className="horo-bc-sep">✦</span>
              <Link to="/#horoscope">Horoscope</Link>
              <span className="horo-bc-sep">✦</span>
              <span>{zodiac.name}</span>
            </nav>

            <div className="horo-hero-content">
              {/* Icon orb */}
              <div className="horo-icon-orb">
                <div className="horo-orb-ring horo-orb-ring--outer" />
                <div className="horo-orb-ring horo-orb-ring--inner" />
                <img src={zodiac.icon} alt={zodiac.name} className="horo-orb-img" />
              </div>

              <div className="horo-hero-text">
                <p className="horo-order-label">
                  {["FIRST","SECOND","THIRD","FOURTH","FIFTH","SIXTH",
                    "SEVENTH","EIGHTH","NINTH","TENTH","ELEVENTH","TWELFTH"][currentIndex]} SIGN OF THE ZODIAC
                </p>
                <h1 className="horo-name">{zodiac.name.toUpperCase()}</h1>

                <div className="horo-title-divider">
                  <span className="horo-divider-line" />
                  <span className="horo-divider-gem">✦</span>
                  <span className="horo-divider-line" />
                </div>

                <p className="horo-date-range">{dateRanges[zodiac.name]}</p>

                <div className="horo-meta-row">
                  <div className="horo-meta-chip">
                    <span className="horo-chip-label">ELEMENT</span>
                    <span className="horo-chip-val">{elementEmoji[elem]} {elem}</span>
                  </div>
                  <div className="horo-meta-chip">
                    <span className="horo-chip-label">PLANET</span>
                    <span className="horo-chip-val">🪐 {planet}</span>
                  </div>
                  <div className="horo-meta-chip">
                    <span className="horo-chip-label">STONE</span>
                    <span className="horo-chip-val">💎 {lucky.stone}</span>
                  </div>
                </div>

                {/* Trait badges */}
                <div className="horo-trait-badges">
                  {traits.map((t, i) => (
                    <span key={i} className="horo-trait-badge">
                      <span className="horo-badge-icon">
                        {i === 0 ? "⚡" : i === 1 ? "🔥" : "🛡"}
                      </span>
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── MAIN CONTENT ── */}
        <main className="horo-main">
          <div className="horo-content-grid">

            {/* LEFT: description + strengths */}
            <div className="horo-left">
              {/* About */}
              <div className="horo-card">
                <div className="horo-card-header">
                  <div className="horo-card-line" />
                  <h2 className="horo-card-title">ABOUT {zodiac.name.toUpperCase()}</h2>
                  <div className="horo-card-line" />
                  <span className="horo-card-gem">✦</span>
                </div>
                <p className="horo-description">{zodiac.description}</p>
              </div>

              {/* Strengths */}
              <div className="horo-card">
                <div className="horo-card-header">
                  <div className="horo-card-line" />
                  <h2 className="horo-card-title">KEY STRENGTHS</h2>
                  <div className="horo-card-line" />
                  <span className="horo-card-gem">✦</span>
                </div>
                <div className="horo-strengths-list">
                  {signStrengths.map((s, i) => (
                    <div key={i} className="horo-strength-item">
                      <div className="horo-strength-num">
                        <span>{String(i + 1).padStart(2, "0")}</span>
                      </div>
                      <div className="horo-strength-content">
                        <span>{s.toUpperCase()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Compatible Signs */}
              <div className="horo-card">
                <div className="horo-card-header">
                  <div className="horo-card-line" />
                  <h2 className="horo-card-title">COMPATIBILITY</h2>
                  <div className="horo-card-line" />
                  <span className="horo-card-gem">✦</span>
                </div>
                <p className="horo-compat-intro">
                  {zodiac.name} finds the deepest connections with these signs:
                </p>
                <div className="horo-compat-row">
                  {compatible.map((c) => {
                    const cData = horoscopeData.find((z) => z.name === c);
                    return (
                      <Link
                        key={c}
                        to={`/horoscope/${c.toLowerCase()}`}
                        className="horo-compat-card"
                      >
                        <img src={cData?.icon} alt={c} className="horo-compat-icon" />
                        <span className="horo-compat-name">{c}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* RIGHT: lucky + all signs */}
            <div className="horo-right">
              {/* Lucky details */}
              <div className="horo-card horo-lucky-card">
                <div className="horo-card-header">
                  <div className="horo-card-line" />
                  <h2 className="horo-card-title">LUCKY DETAILS</h2>
                  <div className="horo-card-line" />
                  <span className="horo-card-gem">✦</span>
                </div>
                <div className="horo-lucky-grid">
                  {[
                    { label: "Lucky Number", value: lucky.number, icon: "🔢" },
                    { label: "Lucky Color", value: lucky.color, icon: "🎨" },
                    { label: "Lucky Day", value: lucky.day, icon: "📅" },
                    { label: "Power Stone", value: lucky.stone, icon: "💎" },
                    { label: "Ruling Planet", value: planet, icon: "🪐" },
                    { label: "Element", value: elem, icon: elementEmoji[elem] },
                  ].map(({ label, value, icon }) => (
                    <div key={label} className="horo-lucky-item">
                      <span className="horo-lucky-icon">{icon}</span>
                      <span className="horo-lucky-label">{label}</span>
                      <span className="horo-lucky-value">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* All Signs Navigator */}
              <div className="horo-card">
                <div className="horo-card-header">
                  <div className="horo-card-line" />
                  <h2 className="horo-card-title">ALL ZODIAC SIGNS</h2>
                  <div className="horo-card-line" />
                  <span className="horo-card-gem">✦</span>
                </div>
                <div className="horo-all-signs">
                  {horoscopeData.map((z) => (
                    <Link
                      key={z.name}
                      to={`/horoscope/${z.name.toLowerCase()}`}
                      className={`horo-sign-pill ${z.name === zodiac.name ? "horo-sign-pill--active" : ""}`}
                    >
                      <img src={z.icon} alt={z.name} className="horo-pill-icon" />
                      <span>{z.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── PREV / NEXT ── */}
          <div className="horo-pagination">
            {prevSign ? (
              <Link to={`/horoscope/${prevSign.name.toLowerCase()}`} className="horo-prev-btn">
                <img src={prevSign.icon} alt={prevSign.name} className="horo-pag-icon" />
                <div>
                  <span className="horo-pag-label">← PREVIOUS</span>
                  <span className="horo-pag-name">{prevSign.name}</span>
                </div>
              </Link>
            ) : <div />}

            <Link to="/" className="horo-home-btn">
              <span>🔯</span> ALL SIGNS
            </Link>

            {nextSign ? (
              <Link to={`/horoscope/${nextSign.name.toLowerCase()}`} className="horo-next-btn">
                <div>
                  <span className="horo-pag-label">NEXT →</span>
                  <span className="horo-pag-name">{nextSign.name}</span>
                </div>
                <img src={nextSign.icon} alt={nextSign.name} className="horo-pag-icon" />
              </Link>
            ) : <div />}
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
}
