import React, { useState } from "react";
import { Link } from "react-router-dom";
import Header from "../sections/Header/Header";
import Footer from "../sections/Footer/Footer";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaStar,
  FaClock,
  FaUserGraduate,
  FaCertificate,
  FaBookOpen,
  FaCheckCircle,
  FaChevronDown,
  FaQuoteLeft,
  FaArrowRight,
  FaPlay,
} from "react-icons/fa";

const PremiumCourseLayout = ({
  title,
  subtitle,
  heroImage,
  instructorImage = "/src/assets/images/common/team/hansal sir.jpg",
  rating = "4.9",
  reviews = "120+",
  duration = "24 Sessions",
  level = "Beginner to Advanced",
  language = "Hindi / English",
  whatYouWillLearn = [],
  curriculum = [],
  faqs = [],
  enrollLink = "#",
  isFree = false,
  description = "",
}) => {
  const [activeFaq, setActiveFaq] = useState(null);

  const stats = [
    { icon: <FaClock />, label: "Duration", val: duration },
    { icon: <FaUserGraduate />, label: "Level", val: level },
    { icon: <FaBookOpen />, label: "Language", val: language },
    {
      icon: <FaCertificate />,
      label: "Outcome",
      val: isFree ? "Free Access" : "Verified Certificate",
    },
  ];

  return (
    <div className="min-h-screen bg-[#080101] text-white font-poppins overflow-x-hidden selection:bg-brand-red/30">
      <Header />

      <main className="relative">
        {/* Premium Background */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(221,39,39,0.16),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(176,161,2,0.12),transparent_35%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-size-[70px_70px]" />
        </div>

        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center pt-28 pb-20 px-6">
          <div className="absolute inset-0 z-0">
            <img
              src={heroImage}
              alt=""
              className="w-full h-full object-cover opacity-[0.08] blur-2xl scale-110"
            />
            <div className="absolute inset-0 bg-linear-to-b from-[#080101] via-[#080101]/80 to-[#080101]" />
          </div>

          <div className="relative z-10 premium-container w-full grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] items-center gap-14 lg:gap-20">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, y: 35 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75 }}
              className="text-center lg:text-left"
            >
              <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full border border-white/10 bg-white/6 backdrop-blur-xl shadow-[0_0_40px_rgba(221,39,39,0.12)]">
                <span className="flex text-brand-red gap-1">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} size={11} />
                  ))}
                </span>
                <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.22em] text-white/75">
                  Premium Vedic Education
                </span>
              </div>

              <h1 className="title-batangas mt-8 text-4xl sm:text-5xl md:text-7xl xl:text-8xl leading-[1.02] text-white">
                {title}
              </h1>

              <p className="mt-7 text-base md:text-xl text-white/62 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                {subtitle ||
                  "Unveil the ancient secrets of Vedic wisdom through a professionally guided and deeply practical learning journey."}
              </p>

              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-5">
                <Link to={enrollLink}>
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    className="group px-8 md:px-10 py-4 md:py-5 rounded-full bg-brand-red text-white font-black uppercase tracking-[0.22em] text-xs md:text-sm shadow-[0_18px_45px_rgba(221,39,39,0.35)] hover:bg-white hover:text-brand-red transition-all duration-500 flex items-center gap-3"
                  >
                    {isFree ? "Start Learning Free" : "Secure Your Seat"}
                    <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                </Link>

                <div className="flex items-center gap-3 px-5 py-3 rounded-full border border-white/10 bg-white/4 backdrop-blur-md">
                  <div className="flex -space-x-3">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="w-9 h-9 rounded-full border-2 border-[#080101] bg-gray-800 overflow-hidden"
                      >
                        <img
                          src={`https://i.pravatar.cc/100?u=${i + title}`}
                          alt=""
                          loading="lazy"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                  <div>
                    <p className="text-xs font-black text-white">{rating}/5 Rating</p>
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                      {reviews} Enrolled
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.15 }}
              className="relative max-w-[560px] mx-auto w-full"
            >
              <div className="absolute -inset-4 bg-linear-to-br from-brand-red/35 via-white/5 to-[#b0a102]/25 rounded-[3rem] blur-3xl opacity-60" />

              <div className="relative rounded-4xl md:rounded-[2.8rem] overflow-hidden border border-white/12 bg-white/4 shadow-[0_30px_100px_rgba(0,0,0,0.55)] aspect-4/3">
                <img
                  src={heroImage}
                  alt={title}
                  className="w-full h-full object-cover transition-transform duration-1000 hover:scale-105"
                />

                <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-transparent" />

                <div className="absolute top-6 right-6 w-14 h-14 rounded-full bg-white/10 border border-white/15 backdrop-blur-xl flex items-center justify-center">
                  <FaPlay className="text-brand-red ml-1" />
                </div>

                <div className="absolute bottom-5 left-5 right-5 md:bottom-8 md:left-8 md:right-8 p-5 md:p-6 rounded-3xl bg-black/45 backdrop-blur-2xl border border-white/10">
                  <p className="text-[10px] font-black uppercase tracking-[0.35em] text-brand-red mb-2">
                    Sacred Mastery
                  </p>
                  <p className="text-sm md:text-base text-white/75 italic leading-relaxed">
                    “This journey is not just about knowledge, but about personal transformation.”
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Stats Grid */}
        <section className="relative z-10 px-6 -mt-10 lg:-mt-16">
          <div className="premium-container grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-[#130707]/85 backdrop-blur-2xl border border-white/10 rounded-4xl md:rounded-[2.8rem] p-5 md:p-8 shadow-[0_25px_90px_rgba(0,0,0,0.45)]">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -6 }}
                className="flex items-center gap-4 p-5 rounded-2xl bg-white/[0.035] hover:bg-white/[0.07] border border-white/5 hover:border-brand-red/25 transition-all"
              >
                <div className="w-12 h-12 rounded-2xl bg-brand-red/10 flex items-center justify-center text-brand-red text-xl">
                  {stat.icon}
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/40">
                    {stat.label}
                  </p>
                  <p className="font-bold text-white text-sm md:text-base">
                    {stat.val}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Overview */}
        <section className="relative py-24 md:py-32 px-6">
          <div className="premium-container grid grid-cols-1 lg:grid-cols-[1fr_440px] gap-14 lg:gap-20">
            <div>
              <p className="text-brand-red text-xs font-black uppercase tracking-[0.35em] mb-4">
                Complete Learning Path
              </p>

              <h2 className="title-batangas text-4xl md:text-6xl mb-8">
                Course <span className="text-brand-red">Overview</span>
              </h2>

              <p className="text-white/65 leading-relaxed text-base md:text-lg max-w-3xl">
                {description ||
                  "Dive deep into the metaphysical realms of Vedic science. This course is carefully designed to connect ancient spiritual knowledge with practical modern-life applications."}
              </p>

              {whatYouWillLearn.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-12">
                  {whatYouWillLearn.map((item, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ x: 6 }}
                      className="flex items-start gap-4 p-5 rounded-2xl bg-white/4 border border-white/6 hover:border-brand-red/30 hover:bg-white/6.5 transition-all"
                    >
                      <FaCheckCircle className="text-brand-red mt-1 shrink-0" />
                      <span className="text-white/82 font-medium leading-relaxed">
                        {item}
                      </span>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Sticky Sidebar */}
            <aside className="lg:sticky lg:top-28 h-fit space-y-6">
              <div className="p-7 md:p-9 rounded-[2.4rem] bg-linear-to-br from-white/9 to-white/2 border border-white/10 backdrop-blur-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 translate-x-1/3 -translate-y-1/3 w-44 h-44 bg-brand-red/15 rounded-full blur-3xl" />

                <h3 className="title-batangas text-3xl mb-7 relative z-10">
                  The Experience
                </h3>

                <ul className="space-y-5 relative z-10">
                  {[
                    "Live Interactive Q&A Sessions",
                    "Downloadable Sacred Resources",
                    "Personal Mentorship Path",
                    "Private Community Access",
                    "Lifetime Portal Updates",
                  ].map((feat, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-4 text-xs font-black text-white/78 uppercase tracking-[0.18em]"
                    >
                      <span className="w-2 h-2 rounded-full bg-brand-red shadow-[0_0_18px_rgba(221,39,39,0.8)]" />
                      {feat}
                    </li>
                  ))}
                </ul>

                <Link to={enrollLink}>
                  <button className="relative z-10 w-full mt-9 py-4 rounded-2xl bg-white text-black font-black uppercase tracking-[0.22em] text-xs hover:bg-brand-red hover:text-white transition-all duration-500">
                    Get Started Today
                  </button>
                </Link>
              </div>

              <div className="relative rounded-[2.4rem] overflow-hidden border border-white/10 aspect-video group shadow-2xl">
                <img
                  src={instructorImage}
                  alt="Instructor"
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <p className="text-[10px] font-black uppercase tracking-[0.35em] text-brand-red mb-1">
                    Guided By
                  </p>
                  <p className="title-batangas text-2xl">Acharya Hansal Ji</p>
                </div>
              </div>
            </aside>
          </div>
        </section>

        {/* Curriculum */}
        {curriculum.length > 0 && (
          <section className="relative py-24 md:py-32 px-6 bg-white/2 border-y border-white/5">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-16">
                <p className="text-brand-red text-xs font-black uppercase tracking-[0.35em] mb-4">
                  Path to Enlightenment
                </p>
                <h2 className="title-batangas text-4xl md:text-6xl">
                  Course <span className="text-brand-red">Curriculum</span>
                </h2>
              </div>

              <div className="space-y-5">
                {curriculum.map((item, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ y: -4 }}
                    className="group p-6 md:p-8 rounded-4xl bg-[#120707]/80 border border-white/10 hover:border-brand-red/35 transition-all"
                  >
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                      <div className="flex items-start md:items-center gap-5">
                        <span className="text-3xl font-black text-white/10 group-hover:text-brand-red/60 transition-colors">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <div>
                          <h4 className="text-lg md:text-xl font-bold text-white/95">
                            {item.title}
                          </h4>
                          {item.content && (
                            <p className="mt-3 text-white/52 leading-relaxed text-sm">
                              {item.content}
                            </p>
                          )}
                        </div>
                      </div>

                      {item.duration && (
                        <span className="w-fit text-[10px] font-black text-brand-red uppercase tracking-widest px-4 py-2 rounded-full bg-brand-red/10 border border-brand-red/15">
                          {item.duration}
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* FAQ */}
        {faqs.length > 0 && (
          <section className="relative py-24 md:py-32 px-6">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-16">
                <p className="text-white/40 uppercase tracking-[0.3em] text-xs font-black mb-4">
                  Resolving Cosmic Doubts
                </p>
                <h2 className="title-batangas text-4xl md:text-6xl">
                  Common <span className="text-brand-red">Inquiries</span>
                </h2>
              </div>

              <div className="space-y-4">
                {faqs.map((faq, i) => (
                  <div
                    key={i}
                    className="rounded-2xl bg-white/[0.035] border border-white/8 overflow-hidden hover:border-brand-red/25 transition-all"
                  >
                    <button
                      onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                      className="w-full flex justify-between items-center gap-5 p-6 text-left hover:bg-white/[0.035] transition-colors"
                    >
                      <span className="font-bold text-white/92">{faq.q}</span>
                      <FaChevronDown
                        className={`text-brand-red shrink-0 transition-transform duration-500 ${
                          activeFaq === i ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    <AnimatePresence>
                      {activeFaq === i && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden"
                        >
                          <div className="px-6 pb-6 pt-0 text-white/55 leading-relaxed text-sm border-t border-white/5">
                            <div className="pt-5">{faq.a}</div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Certification */}
        <section className="relative py-24 md:py-32 px-6">
          <div className="premium-container p-8 md:p-16 lg:p-20 rounded-[2.5rem] md:rounded-[4rem] bg-linear-to-br from-brand-red/12 via-white/[0.035] to-transparent border border-brand-red/20 flex flex-col md:flex-row items-center gap-12 lg:gap-16 relative overflow-hidden">
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-brand-red/10 rounded-full blur-[120px]" />

            <div className="flex-1 text-center md:text-left relative z-10">
              <p className="text-brand-red text-xs font-black uppercase tracking-[0.35em] mb-4">
                Official Recognition
              </p>

              <h2 className="title-batangas text-4xl md:text-6xl">
                Vedic <span className="text-brand-red">Certification</span>
              </h2>

              <p className="mt-7 text-white/62 leading-relaxed text-base md:text-lg">
                Upon successful completion of the {title}, you will receive a verified digital certificate that honors your dedication and strengthens your credibility in Vedic learning.
              </p>

              <div className="mt-9 flex items-center gap-6 justify-center md:justify-start">
                <div>
                  <p className="text-3xl font-black text-white">100%</p>
                  <p className="text-[10px] font-bold text-brand-red uppercase tracking-widest">
                    Verified
                  </p>
                </div>

                <div className="w-px h-12 bg-white/10" />

                <div>
                  <p className="text-3xl font-black text-white">Digital</p>
                  <p className="text-[10px] font-bold text-brand-red uppercase tracking-widest">
                    Sharable ID
                  </p>
                </div>
              </div>
            </div>

            <div className="md:w-[34%] relative group">
              <div className="absolute inset-0 bg-white/20 blur-3xl opacity-0 group-hover:opacity-30 transition-opacity" />
              <img
                src={instructorImage}
                alt="Certificate Preview"
                loading="lazy"
                className="w-full rounded-3xl shadow-2xl border border-white/20 grayscale group-hover:grayscale-0 transition-all duration-700 md:rotate-3 group-hover:rotate-0"
              />
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="relative py-24 md:py-32 px-6">
          <div className="premium-container">
            <div className="text-center mb-16">
              <p className="text-white/40 uppercase tracking-[0.3em] text-xs font-black mb-4">
                Life-Changing Results
              </p>

              <h2 className="title-batangas text-4xl md:text-6xl">
                Student <span className="text-brand-red">Echoes</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              {[
                {
                  q: "This course transformed how I view the cosmos. Hansal Ji explains complex concepts with wonderful simplicity.",
                  a: "Priya Sharma",
                  r: "Professional Astrologer",
                },
                {
                  q: "The practical remedies shared during the sessions brought clarity, discipline, and peace into my life.",
                  a: "Amit Patel",
                  r: "Business Owner",
                },
                {
                  q: "A beautiful course that respects Vedic tradition while making it practical for modern challenges.",
                  a: "Sarah Johnson",
                  r: "Yoga Instructor",
                },
              ].map((t, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -8 }}
                  className="p-7 md:p-9 rounded-[2.4rem] bg-white/[0.035] border border-white/8 hover:border-brand-red/30 transition-all duration-500 group"
                >
                  <FaQuoteLeft className="text-3xl text-brand-red opacity-25 mb-7 group-hover:opacity-100 transition-opacity" />

                  <p className="text-white/68 italic leading-relaxed mb-8">
                    “{t.q}”
                  </p>

                  <div>
                    <p className="font-bold text-white uppercase tracking-widest text-[10px] mb-1">
                      {t.a}
                    </p>
                    <p className="text-brand-red font-black uppercase tracking-[0.22em] text-[10px]">
                      {t.r}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="relative py-28 md:py-40 text-center overflow-hidden px-6">
          <div className="absolute top-1/2 left-1/2 w-[800px] h-[800px] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(circle,rgba(221,39,39,0.18),transparent_60%)] blur-3xl" />

          <div className="max-w-4xl mx-auto relative z-10">
            <p className="text-brand-red text-xs font-black uppercase tracking-[0.35em] mb-6">
              Begin The Journey
            </p>

            <h2 className="title-batangas text-5xl md:text-8xl leading-tight">
              Begin Your <br />
              <span className="text-brand-red">Sacred Path</span>
            </h2>

            <p className="mt-8 text-base md:text-xl text-white/52 max-w-2xl mx-auto leading-relaxed">
              Do not just learn. Transform. Join dedicated students who are walking the path of Vedic wisdom and inner growth.
            </p>

            <Link to={enrollLink}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="mt-11 px-10 md:px-16 py-5 md:py-6 rounded-full bg-brand-red text-white font-black uppercase tracking-[0.3em] text-xs md:text-sm shadow-[0_22px_55px_rgba(221,39,39,0.45)] hover:bg-white hover:text-brand-red transition-all duration-700"
              >
                Enroll Now
              </motion.button>
            </Link>

            <p className="mt-7 text-white/30 text-[10px] uppercase tracking-[0.35em] font-black">
              Limited Cosmic Slots Available
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default PremiumCourseLayout;