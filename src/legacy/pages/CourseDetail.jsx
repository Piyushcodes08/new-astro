
import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { auth, db } from "../../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { useParams } from "react-router-dom";
import { RiShareForwardFill } from "react-icons/ri";
import {
  FaStar,
  FaClock,
  FaUserGraduate,
  FaCertificate,
  FaBookOpen,
  FaCheckCircle,
  FaChevronDown,
  FaQuoteLeft,
  FaLock,
  FaUnlock,
  FaPlayCircle,
  FaRegFolderOpen
} from "react-icons/fa";
import { useCourses } from "../../context/CoursesContext";
import { Helmet } from "react-helmet-async";
import Header from "../../components/sections/Header/Header";
import Footer from "../../components/sections/Footer/Footer";
import { motion, AnimatePresence } from "framer-motion";
import certificateImg from "../../assets/images/common/team/certificate.webp";
import hansalImg from "../../assets/images/common/team/hansal sir.webp";

const CourseDetail = () => {
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);
  const [syllabusOpen, setSyllabusOpen] = useState(0);

  const [isEnrolled, setIsEnrolled] = useState(false);

  const { slug, courseType } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { slugMap, loading: contextLoading } = useCourses();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);

      if (currentUser && slug) {
        // Check enrollment status
        try {
          const userRef = doc(db, "subscriptions", currentUser.email);
          const docSnap = await getDoc(userRef);
          if (docSnap.exists()) {
            const userData = docSnap.data();
            const courseId = slug; // The ID usually matches the slug or is passed in courseData

            const enrolledFree = userData.freecourses && userData.freecourses.includes(courseId);
            const enrolledPaid = userData.DETAILS && userData.DETAILS.some(d => Object.keys(d)[0] === courseId);

            if (enrolledFree || enrolledPaid) {
              setIsEnrolled(true);
            }
          }
        } catch (err) {
          console.error("Error checking enrollment:", err);
        }
      }
    });
    return () => unsubscribe();
  }, [slug]);

  useEffect(() => {
    if (!slug || !courseType || contextLoading) return;

    const key = `${courseType}/${slug}`;
    const foundCourse = slugMap[key];

    if (foundCourse) {
      setCourseData(foundCourse);
      setLoading(false);
    } else if (!contextLoading) {
      alert("Course not found.");
      navigate("/");
    }
  }, [slug, courseType, slugMap, contextLoading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-transparent backdrop-blur-sm">

      </div>
    );
  }

  if (!courseData) {
    return <div className="text-center mt-10 text-red-500">Course not found.</div>;
  }

  const currentUrl = window.location.href;
  const shareText = `Check out this course: ${courseData.title} - ${courseData.Subtitle}`;

  const shareArticle = () => {
    if (navigator.share) {
      navigator
        .share({
          title: courseData.title,
          text: shareText,
          url: currentUrl
        })
        .catch(console.error);
    } else {
      setShowShareOptions(!showShareOptions);
    }
  };

  const defaultFaqs = [
    { q: "Is this course live or recorded?", a: "This course primarily features high-quality recorded sessions, supplemented by live Q&A sessions with the instructor to ensure all your queries are resolved." },
    { q: "Do I get lifetime access?", a: "Yes! Once enrolled, you will have lifetime access to the course portal, including all future updates and study materials." },
    { q: "Will I receive a certificate?", a: "Absolutely. Upon completing all modules and assessments, you will receive a verified digital certificate from Vahlay Astro." }
  ];

  const getMetaTags = () => (
    <Helmet>
      <title>{courseData?.seoTitle || courseData.title}</title>
      <meta name="description" content={courseData?.seoDescription || courseData.Subtitle} />
    </Helmet>
  );

  const enrollUrl = isEnrolled
    ? `/course/${encodeURIComponent(courseData.id || slug)}`
    : user
      ? (courseData.type === 'free' ? `/enrollfree/${courseData.id || slug}/${courseType}` : `/enroll/${courseData.id || slug}/${courseType}`)
      : `/login?redirectTo=${encodeURIComponent(courseData.type === 'free' ? `/enrollfree/${courseData.id || slug}/${courseType}` : `/enroll/${courseData.id || slug}/${courseType}`)}`;

  const enrollText = isEnrolled
    ? 'Go to Course'
    : courseData.type === 'free'
      ? 'Enroll Free'
      : 'Secure Your Seat';

  // ── Static per-course rich content (keyed by course title) ──
  const staticCourseDetails = {
    "Narad Puran": {
      overview: "The Narad Purana is one of the eighteen Mahapuranas — a sacred genre of Hindu texts that preserves the spiritual heritage of ancient India. This foundational course takes you deep into the teachings of Narada Muni, the divine messenger of the cosmos. Led by Acharya Hansal Ji, you will explore the five pillars of Bhakti, the cosmic laws that govern the universe, and practical remedies that can transform your everyday life.",
      whatYouWillLearn: [
        "The 5 Pillars of Divine Devotion (Bhakti Yoga)",
        "Vedic Communication & Conflict Resolution",
        "Cosmic Creation according to Narad Purana",
        "Practical Remedies for Mercury & Jupiter",
        "The Art of Spiritual Storytelling",
        "Universal Moral Laws (Dharma) & Their Impact",
        "Narada Muni's Journey & The Power of Naam Simran",
        "Cycles of Time: Yugas & The Vedic Universe"
      ],
      curriculum: [
        { title: "Introduction to the Narad Purana", duration: "1.5 Hours", content: "Overview of the text's history, authorship, and its significance among the 18 Mahapuranas. Understanding why Narad Purana is called the 'Voice of the Divine.'" },
        { title: "The Life & Teachings of Narada Muni", duration: "2 Hours", content: "Exploring the archetype of the Divine Messenger and the power of 'Naam Simran'. How Narada Muni's stories are relevant to modern spiritual seekers." },
        { title: "Cosmology and Universal Order", duration: "2.5 Hours", content: "Understanding the Vedic structure of the universe and the cycles of time (Yugas). The creation, sustenance, and dissolution of the cosmos according to the Purana." },
        { title: "Devotional Practices (Bhakti Sutras)", duration: "3 Hours", content: "Deep analysis of the 84 Bhakti Sutras and their practical application in daily life. How devotion rewires the mind for peace, clarity, and spiritual liberation." },
        { title: "Mercury & The Power of Speech", duration: "2 Hours", content: "Remedies for effective communication and sharpening the intellect based on Naradic wisdom. How to harness the energy of Budha (Mercury) for articulate and truthful expression." }
      ]
    },
    "Basics of Astrology": {
      overview: "Astrology is the sacred language of the cosmos — a system through which the positions and movements of celestial bodies reveal the karmic blueprint of a soul. In this foundational course, Acharya Hansal Ji introduces you to the essential grammar of this cosmic language, covering the planets, zodiac signs, and how they influence your daily life and destiny.",
      whatYouWillLearn: [
        "The 9 Planets (Navagrahas) and their core nature",
        "Understanding the 12 Zodiac Signs (Rashis)",
        "How to read a basic birth chart (Kundali)",
        "Planetary periods (Dashas) and their life effects",
        "The role of the Ascendant (Lagna) in personality",
        "Auspicious and inauspicious planetary combinations"
      ],
      curriculum: [
        { title: "What is Astrology?", duration: "1 Hour", content: "The history, philosophy, and science behind Vedic astrology. How it differs from Western astrology and why it remains relevant today." },
        { title: "The Navagrahas: Nine Cosmic Influencers", duration: "2 Hours", content: "Characteristics, mythology, and effects of all nine Vedic planets — from the Sun (Surya) to the shadow planets Rahu and Ketu." },
        { title: "The Zodiac: 12 Signs of the Cosmos", duration: "2 Hours", content: "Understanding each Rashi's element, quality, ruling planet, and how it shapes personality and life events." },
        { title: "The Kundali: Your Cosmic Blueprint", duration: "2.5 Hours", content: "How to construct and read a basic birth chart. Identifying key placements and what they reveal about your life purpose." },
        { title: "Dashas & Transits", duration: "1.5 Hours", content: "Understanding planetary periods and how current transits affect your chart, enabling basic timing of life events." }
      ]
    },
    "New edge Bhagwat Geeta": {
      overview: "The Bhagavad Gita is the ultimate manual for human life. In this 'New Edge' edition, we focus on the practical application of Lord Krishna's timeless teachings in today's high-stress world. Whether you are a student, a professional, or a seeker, this course provides powerful mental tools for decision-making, emotional resilience, and spiritual awakening that are universally applicable.",
      whatYouWillLearn: [
        "Decision Making in Times of Crisis (Dharma Sankat)",
        "The Science of Karma Yoga (Action without Attachment)",
        "Mind Control & Emotional Resilience (Sthitaprajna)",
        "Understanding the 3 Gunas (Sattva, Rajas, Tamas)",
        "The Path of Devotion (Bhakti) & Knowledge (Jnana)",
        "Universal Vision & Spiritual Leadership"
      ],
      curriculum: [
        { title: "The Yoga of Despondency", duration: "2 Hours", content: "Understanding Arjuna's dilemma on the battlefield of Kurukshetra and how we face similar crises of identity and duty in modern life." },
        { title: "Sankhya Yoga: The Nature of the Soul", duration: "2.5 Hours", content: "The timeless truth of immortality of the Atman and the transient nature of the physical world (Anatman)." },
        { title: "Karma Yoga: Excellence in Action", duration: "3 Hours", content: "How to perform your duties with peak efficiency and zero psychological stress through the principle of Nishkama Karma." },
        { title: "Dhyana Yoga: The Path of Meditation", duration: "2.5 Hours", content: "Practical techniques for achieving stillness and concentration in a world filled with distraction and noise." },
        { title: "The Divine Eye: Viswarupa Darshana", duration: "2 Hours", content: "Experiencing the cosmic interconnectedness of all beings and understanding your role in the grand design of existence." }
      ]
    },
    "Foundation of Vedic Astrology": {
      overview: "Vedic astrology, known as Jyotish — the 'Eye of the Vedas' — is the most complete and systematic system for understanding human destiny. This professional-grade foundation course takes you from zero to practitioner level, covering the complete Panchang system, the 12 houses, 9 planets, and 27 Nakshatras under the expert guidance of Acharya Hansal Ji.",
      whatYouWillLearn: [
        "The 5 Elements of Panchang (Tithi, Nakshatra, etc.)",
        "Rashi & Bhava: The 12 Signs and 12 Houses",
        "Planetary Aspects and Strengths (Shadbala)",
        "Daily Muhurat Prediction for Self & Family",
        "Vedic Lifestyle for Planetary Alignment",
        "Basic Chart Interpretation Techniques"
      ],
      curriculum: [
        { title: "The Pillars of Time: Panchang", duration: "4 Hours", content: "Understanding the solar and lunar calendars and the profound significance of the 5 limbs of time." },
        { title: "The Zodiac Belt: Rashis & Nakshatras", duration: "5 Hours", content: "Detailed study of the 12 signs and the 27 lunar mansions (Nakshatras) that form the zodiacal foundation." },
        { title: "The Navagrahas: The Nine Influencers", duration: "6 Hours", content: "Exploring the characteristics, mythology, and effects of the nine Vedic planets on human life." },
        { title: "House Analysis (Bhavas)", duration: "4 Hours", content: "How the 12 houses represent different aspects of your life from health to wealth, career to spirituality." },
        { title: "Muhurat: The Art of Timing", duration: "3 Hours", content: "Choosing the right time for new beginnings using the Choghadiya and Hora systems." }
      ]
    },
    "The Essentials of Self-Discovery": {
      overview: "This introductory course bridges ancient Vedic wisdom with the modern quest for self-understanding. Through the lens of the Panchang and foundational astrology, you will discover your unique cosmic fingerprint — the planetary patterns that shape your personality, relationships, strengths, and spiritual purpose. A perfect starting point for anyone new to the world of Vedic sciences.",
      whatYouWillLearn: [
        "Reading your personal Panchang details at birth",
        "Understanding your Janma Nakshatra & its deeper meaning",
        "Identifying your dominant planetary energy",
        "Using astrology for self-acceptance and growth",
        "Simple daily practices aligned with your Rashi",
        "Finding your life purpose through the Vedic lens"
      ],
      curriculum: [
        { title: "Who Are You, Cosmically Speaking?", duration: "1.5 Hours", content: "Introduction to the concept of the Janma Kundali and what your birth chart reveals about your soul's journey." },
        { title: "The Panchang & You", duration: "2 Hours", content: "Discovering your Tithi, Vaar, Nakshatra, Yoga, and Karana at birth and their personality implications." },
        { title: "Your Nakshatra: The Star You Were Born Under", duration: "2 Hours", content: "A deep dive into the 27 Nakshatras — your birth star's characteristics, deity, and life themes." },
        { title: "Planetary Rulers & Your Life Themes", duration: "2 Hours", content: "Identifying the dominant planets in your chart and how they manifest as personality traits and recurring life patterns." },
        { title: "Practical Self-Discovery Exercises", duration: "1.5 Hours", content: "Guided journaling, chart reflection, and simple Vedic lifestyle practices to align with your cosmic nature." }
      ]
    }
  };

  const courseStatic = staticCourseDetails[courseData.title] || {
    overview: courseData.description || courseData.Subtitle || "Embark on a transformative journey of ancient Vedic wisdom guided by Acharya Hansal Ji.",
    whatYouWillLearn: [
      "Sacred principles from ancient Vedic scriptures",
      "Practical remedies for planetary imbalances",
      "Spiritual techniques for personal transformation",
      "Community learning with like-minded seekers"
    ],
    curriculum: [
      { title: "Introduction & Foundations", duration: "2 Hours", content: "Overview of the course structure, sacred texts referenced, and the philosophical foundation of the teachings." },
      { title: "Core Principles & Practices", duration: "3 Hours", content: "Deep exploration of the primary teachings with guided practice sessions and Q&A." },
      { title: "Advanced Insights", duration: "2.5 Hours", content: "Applying the wisdom to real-life situations and understanding advanced concepts." },
      { title: "Remedies & Rituals", duration: "2 Hours", content: "Practical Vedic remedies, mantras, and daily rituals to harmonize your life with cosmic law." },
      { title: "Integration & Certification Prep", duration: "1.5 Hours", content: "Consolidating your learning, final assessment guidance, and the path forward after the course." }
    ]
  };

  return (
    <div className="text-white selection:bg-brand-red/80 font-poppins bg-transparent">
      <Header />
      <div id="top-sentinel" className="h-0 w-full pt-[80px]"></div>
      {getMetaTags()}

      {/* Premium Hero Section */}
      <section className="relative flex items-center pt-20 pb-8 overflow-hidden hero-section">
        {/* Background Glows */}
        <div className="bg-glow-container">
          <div className="absolute top-[20%] right-[10%] w-[600px] h-[600px] bg-glow-red opacity-40"></div>
          <div className="absolute bottom-[10%] left-[5%] w-[400px] h-[400px] bg-glow-gold opacity-10"></div>
        </div>

        <div className="relative z-10 section-container pt-0! pb-0!">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-12 lg:gap-20">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="flex flex-col gap-6 text-center lg:text-left lg:flex-1 py-[30px]"
            >
              {/* Red Pill Label */}
              <div className="inline-block px-4 py-1 rounded-full border border-brand-red/30 bg-brand-red/5 mb-1 self-center lg:self-start">
                <span className="text-brand-red text-[10px] font-black uppercase tracking-[0.4em]">
                  {courseData.type === 'free' ? 'Sacred Wisdom' : 'Divine Mastery'}
                </span>
              </div>

              <h1 className="title-batangas text-3xl md:text-5xl leading-[1.1] tracking-tight text-white drop-shadow-2xl">
                {courseData.title}
              </h1>

              <p className="subtitle-poppins text-sm md:text-base text-white/70 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-medium">
                {courseData.Subtitle || "Embark on a journey to master ancient cosmic wisdom and transform your life path."}
              </p>

              {/* Social Proof / Avatar Stack */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <div className="flex -space-x-3 overflow-hidden">
                  {[1, 2, 3, 4].map(i => (
                    <img
                      key={i}
                      className="inline-block h-10 w-10 rounded-full ring-2 ring-black object-cover"
                      src={`https://i.pravatar.cc/100?img=${i + 10}`}
                      alt="Student"
                    />
                  ))}
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-white/10 ring-2 ring-black backdrop-blur-md text-[10px] font-black text-white/60">
                    +1k
                  </div>
                </div>
                <div className="text-[11px] font-black text-white/30 uppercase tracking-[0.2em]">
                  <span className="text-white">1,200+</span> Souls Aligned
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-8">
                <Link to={enrollUrl} className="group/btn relative">
                  <div className="absolute -inset-1 bg-linear-to-r from-brand-red to-orange-500 rounded-full blur opacity-40 group-hover/btn:opacity-100 transition duration-1000 group-hover/btn:duration-200"></div>
                  <button className="relative px-8 py-3.5 bg-white text-black rounded-full font-black uppercase tracking-[0.2em] text-[11px] hover:bg-black hover:text-white transition-all duration-500">
                    {isEnrolled ? 'Open Course' : 'Join the Journey'}
                  </button>
                </Link>

                <button
                  onClick={shareArticle}
                  className="flex items-center gap-3 text-white/40 hover:text-white transition-all text-[11px] uppercase tracking-[0.3em] font-black group/share"
                >
                  <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center group-hover/share:border-brand-red group-hover/share:text-brand-red transition-all bg-white/5">
                    <RiShareForwardFill className="text-xl" />
                  </div>
                  Share Wisdom
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
              className="relative lg:w-[35%] w-full max-w-[420px] flex flex-col gap-8"
            >
              <div className="relative rounded-xl overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(191, 6, 3,0.2)] group transition-all duration-700 hover:shadow-[0_0_80px_rgba(191, 6, 3,0.4)] hover:border-white/20">
                <img
                  src={courseData.imageUrl || "/src/assets/images/common/team/hansal sir.webp"}
                  alt={courseData.title}
                  className="w-full max-h-[380px] object-cover transition-transform duration-1000 group-hover:scale-[1.02]"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>

              <div className="w-full group">
                <Link to={enrollUrl}>
                  <button className="w-full py-3.5 rounded-lg bg-brand-red text-white font-black uppercase tracking-[0.3em] text-[11px] shadow-2xl hover:bg-white hover:text-brand-red transition-all duration-500 transform hover:-translate-y-1 relative overflow-hidden">
                    <span className="relative z-10">{enrollText}</span>
                    <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  </button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="relative z-20 -mt-16">
        <div className="premium-container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-black/40 backdrop-blur-2xl border border-white/10 rounded-xl p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-linear-to-br from-white/5 to-transparent pointer-events-none"></div>
            {[
              { icon: <FaClock />, label: "Duration", val: courseData.duration || "24 Sessions" },
              { icon: <FaUserGraduate />, label: "Level", val: courseData.level || "All Levels" },
              { icon: <FaBookOpen />, label: "Format", val: "Online Portal" },
              { icon: <FaCertificate />, label: "Certification", val: "Verified ID" }
            ].map((stat, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-lg hover:bg-white/3 transition-colors group relative z-10">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-brand-red text-xl group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(191, 6, 3,0.2)]">
                  {stat.icon}
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/40">{stat.label}</p>
                  <p className="font-bold text-white tracking-wide">{stat.val}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Course Highlights / Highlights Bar */}
      <section className="py-[50px] overflow-hidden">
        <div className="flex whitespace-nowrap animate-marquee gap-20">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex gap-20 items-center z-10">
              <span className="text-3xl md:text-5xl font-black uppercase tracking-[0.5em] text-white">Ancient Wisdom</span>
              <span className="text-3xl md:text-5xl font-black uppercase tracking-[0.5em] text-brand-red italic">Personal Growth</span>
              <span className="text-3xl md:text-5xl font-black uppercase tracking-[0.5em] text-white Sacred Wisdom">Sacred Remedies</span>
              <span className="text-3xl md:text-5xl font-black uppercase tracking-[0.5em] text-brand-red italic">Cosmic Laws</span>
            </div>
          ))}
        </div>
      </section>

      {/* Main Content Grid */}
      <section className="py-[50px]">
        <div className="premium-container flex flex-col lg:flex-row gap-8 lg:gap-12 xl:gap-16">
          <div className="flex-1 min-w-0 space-y-12">

            {/* ── Course Overview ── */}
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-1 h-8 bg-brand-red rounded-full"></div>
                <h2 className="title-batangas text-3xl md:text-4xl leading-tight">About This <span className="text-brand-red">Course</span></h2>
              </div>
              <p className="text-white/70 leading-relaxed text-base md:text-lg border-l-2 border-brand-red/20 pl-5">
                {courseStatic.overview}
              </p>
            </div>

            {/* ── What You Will Learn ── */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-1 h-8 bg-brand-red rounded-full"></div>
                <h2 className="title-batangas text-3xl md:text-4xl leading-tight">What You Will <span className="text-brand-red">Learn</span></h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {courseStatic.whatYouWillLearn.map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    className="flex items-start gap-3 p-4 rounded-lg bg-white/3 border border-white/5 hover:border-brand-red/20 hover:bg-white/[0.05] transition-all group"
                  >
                    <FaCheckCircle className="text-brand-red mt-0.5 shrink-0 text-sm" />
                    <p className="text-white/75 text-sm leading-relaxed font-medium">{item}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* ── Sacred Syllabus ── */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-8 bg-brand-red rounded-full"></div>
                  <h2 className="title-batangas text-3xl md:text-4xl leading-tight">Sacred <span className="text-brand-red">Syllabus</span></h2>
                </div>
                <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] hidden md:block">{courseStatic.curriculum.length} Modules</span>
              </div>
              <div className="space-y-3">
                {courseStatic.curriculum.map((mod, idx) => (
                  <div
                    key={idx}
                    className={`rounded-xl border transition-all duration-300 overflow-hidden ${syllabusOpen === idx
                      ? 'bg-white/6 border-brand-red/30'
                      : 'bg-white/3 border-white/8 hover:border-white/15'
                      }`}
                  >
                    <button
                      onClick={() => setSyllabusOpen(syllabusOpen === idx ? null : idx)}
                      className="w-full flex items-center gap-4 p-5 text-left"
                    >
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-all ${syllabusOpen === idx ? 'bg-brand-red text-white' : 'bg-white/5 text-brand-red'
                        }`}>
                        {syllabusOpen === idx ? <FaUnlock className="text-xs" /> : <FaLock className="text-xs" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-white truncate">{mod.title}</p>
                        <p className="text-[10px] text-white/30 uppercase tracking-widest mt-0.5 font-black">{mod.duration}</p>
                      </div>
                      <FaChevronDown className={`text-brand-red text-xs shrink-0 transition-transform duration-300 ${syllabusOpen === idx ? 'rotate-180' : ''}`} />
                    </button>
                    <AnimatePresence>
                      {syllabusOpen === idx && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 pb-5 pt-0 flex items-start gap-4">
                            <FaPlayCircle className="text-brand-red/50 mt-0.5 shrink-0 text-sm" />
                            <p className="text-white/55 text-sm leading-relaxed">{mod.content}</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>

          </div>

          <aside className="lg:w-[360px] xl:w-[400px] shrink-0">
            <div className="sticky top-32 space-y-8">
              <div className="p-10 rounded-xl bg-black/40 border border-white/10 backdrop-blur-2xl relative overflow-hidden shadow-2xl group">
                <div className="absolute inset-0 bg-linear-to-br from-brand-red/5 to-transparent pointer-events-none"></div>
                <h3 className="title-batangas text-2xl mb-8">What's Included</h3>
                <ul className="space-y-6">
                  {[
                    "Lifetime Portal Access",
                    "Verified Digital Certificate",
                    "Exclusive Study Materials",
                    "Community Support Group",
                    "Expert Q&A Support"
                  ].map((f, i) => (
                    <li key={i} className="flex items-center gap-4 text-xs font-bold text-white/70 uppercase tracking-widest">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-red"></div>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to={enrollUrl}>
                  <button className="w-full mt-12 py-5 rounded-lg bg-white text-black font-black uppercase tracking-[0.2em] text-xs hover:bg-brand-red hover:text-white transition-all duration-500">
                    Join the Batch
                  </button>
                </Link>
              </div>

              <div className="relative rounded-xl overflow-hidden border border-white/10 group h-[340px] shadow-2xl">
                <img src={hansalImg} alt="Acharya Hansal" loading="lazy" className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-1000" />
                <div className="absolute inset-0 bg-linear-to-t from-black via-black/30 to-transparent"></div>
                <div className="absolute bottom-6 left-6 right-6 z-10">
                  <p className="text-[10px] uppercase tracking-[0.4em] text-brand-red font-black mb-1.5">Your Guru</p>
                  <p className="title-batangas text-xl md:text-2xl leading-snug text-white">Acharya Hansal Ji</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>
      {/* Sacred Modules — Full Width */}
      <section className="py-8 w-full">
        <div className="w-full max-w-max-width mx-auto px-[15px] space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <h3 className="title-batangas text-2xl md:text-3xl">Sacred <span className="text-brand-red">Modules</span></h3>
            <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em] hidden md:block">The Curriculum of Stars</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { t: "The Foundation of Vedic Thought", i: "✦", c: "Understanding the origins and the cosmic map." },
              { t: "Practical Remedies & Rituals", i: "⚡", c: "Actionable steps to balance planetary energies." },
              { t: "The Art of Predictions", i: "👁", c: "Synthesizing charts to see the unfolding destiny." },
              { t: "Spiritual Growth & Ethics", i: "☯", c: "The responsibilities of a cosmic guide." }
            ].map((mod, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
                className="p-4 rounded-lg bg-white/3 backdrop-blur-xl border border-white/10 flex flex-col justify-between group hover:bg-white/[0.07] transition-all duration-400 hover:-translate-y-1 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-16 h-16 bg-linear-to-br from-brand-red/10 to-transparent rounded-full blur-lg -mr-4 -mt-4 group-hover:scale-150 transition-transform"></div>
                <div className="relative z-10">
                  <div className="text-xl mb-3">{mod.i}</div>
                  <h4 className="font-bold text-sm leading-snug mb-1.5">{mod.t}</h4>
                  <p className="text-white/40 text-[11px] leading-relaxed mb-4">{mod.c}</p>
                </div>
                <div className="flex items-center gap-2 relative z-10">
                  <span className="text-[9px] font-black text-brand-red uppercase tracking-widest">Module 0{i + 1}</span>
                  <div className="h-px flex-1 bg-white/5"></div>
                  <div className="w-5 h-5 rounded-full border border-white/10 flex items-center justify-center text-[9px] opacity-0 group-hover:opacity-100 transition-all">→</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Who this is for? */}
      <section className="py-8 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-red/5 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="premium-container relative z-10">
          <div className="text-center mb-10">
            <h2 className="title-batangas text-3xl md:text-5xl mb-4">Is This <span className="text-brand-red">For You?</span></h2>
            <p className="text-white/40 uppercase tracking-[0.5em] text-[10px] font-black">Aligning with the Right Souls</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { t: "Spiritual Seekers", d: "Those looking to understand the cosmic laws governing our lives and find deeper meaning.", i: "✦" },
              { t: "Aspiring Astrologers", d: "Individuals wanting a solid, authentic foundation in Vedic astrology to guide others.", i: "✧" },
              { t: "Practical Souls", d: "People seeking real, actionable remedies to overcome life's obstacles and find peace.", i: "❂" }
            ].map((item, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -12 }}
                className="p-8 rounded-xl bg-black/40 backdrop-blur-2xl border border-white/10 text-center hover:bg-white/5 hover:border-brand-red/30 transition-all duration-500 group shadow-2xl relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-brand-red/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="w-16 h-16 rounded-lg bg-white/3 border border-white/5 flex items-center justify-center text-brand-red text-3xl mx-auto mb-6 group-hover:scale-110 group-hover:bg-brand-red/10 transition-all duration-500 shadow-inner">
                  {item.i}
                </div>
                <h4 className="title-batangas text-2xl mb-4 group-hover:text-brand-red transition-colors">{item.t}</h4>
                <p className="text-white/50 leading-relaxed text-base font-light">{item.d}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Certification Section */}
      <section className="py-8">
        <div className="premium-container flex flex-col md:flex-row items-center gap-10 bg-black/40 backdrop-blur-2xl rounded-2xl border border-white/10 p-8 md:p-12 overflow-hidden relative shadow-2xl">
          <div className="absolute inset-0 bg-linear-to-br from-white/5 to-transparent pointer-events-none"></div>
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-brand-red/10 rounded-full blur-[100px]"></div>
          <div className="flex-1 space-y-4 relative z-10 text-center md:text-left">
            <div className="inline-block px-3 py-1 rounded-full border border-brand-red/30 bg-brand-red/5">
              <span className="text-brand-red text-[9px] font-black uppercase tracking-widest">Official Credentials</span>
            </div>
            <h2 className="title-batangas text-3xl md:text-5xl text-white">Verified <br /><span className="text-brand-red">Certification</span></h2>
            <p className="text-white/60 text-base leading-relaxed">
              Upon successful completion of the final assessment, you will receive a prestigious certificate from Vahlay Astro, signed by Acharya Hansal, validating your expertise in this sacred domain.
            </p>
            <ul className="space-y-2 inline-block md:block text-left">
              {["Industry Recognized", "Blockchain Verified", "Shareable on LinkedIn", "Print-Ready High Resolution"].map((p, i) => (
                <li key={i} className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/80">
                  <FaCheckCircle className="text-brand-red" /> {p}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex-1 relative z-10 w-full max-w-[450px]">
            <div className="relative transform rotate-2 hover:rotate-0 transition-transform duration-700 rounded-xl overflow-hidden shadow-[0_0_60px_rgba(191, 6, 3,0.15)] border border-white/10 group">
              <img
                src={certificateImg}
                alt="Vahlay Astro Certificate of Completion"
                className="w-full h-auto object-cover group-hover:scale-[1.02] transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
              <div className="absolute top-3 right-3 text-brand-red opacity-30 text-3xl">✦</div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-8 bg-transparent relative overflow-hidden">
        <div className="absolute top-1/2 left-0 w-64 h-64 bg-brand-red/5 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <div className="text-center mb-10">
            <h2 className="title-batangas text-3xl md:text-5xl text-white">Essential <span className="text-brand-red">Inquiries</span></h2>
            <p className="text-white/40 uppercase tracking-[0.4em] text-[10px] font-black mt-4">Resolving Your Cosmic Doubts</p>
          </div>
          <div className="space-y-6">
            {defaultFaqs.map((faq, i) => (
              <div
                key={i}
                className={`rounded-lg transition-all duration-500 border ${activeFaq === i
                  ? 'bg-white/8 border-brand-red/30 shadow-[0_20px_50px_rgba(0,0,0,0.3)]'
                  : 'bg-black/40 border-white/10 hover:border-white/20'
                  } backdrop-blur-2xl overflow-hidden`}
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  className="w-full flex justify-between items-center p-8 text-left group"
                >
                  <span className={`font-bold text-lg md:text-xl tracking-wide transition-colors ${activeFaq === i ? 'text-white' : 'text-white/70 group-hover:text-white'}`}>
                    {faq.q}
                  </span>
                  <div className={`w-10 h-10 rounded-full border border-white/10 flex items-center justify-center transition-all duration-500 ${activeFaq === i ? 'bg-brand-red border-brand-red rotate-180' : 'group-hover:border-brand-red'}`}>
                    <FaChevronDown className={`text-xs transition-colors ${activeFaq === i ? 'text-white' : 'text-brand-red'}`} />
                  </div>
                </button>
                <AnimatePresence>
                  {activeFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-8 pt-0 text-white/50 leading-relaxed text-base border-t border-white/5 font-light">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-[50px] bg-transparent relative overflow-hidden">
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-red/5 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="premium-container relative z-10">
          <div className="text-center mb-20">
            <h2 className="title-batangas text-4xl md:text-7xl">Student <span className="text-brand-red">Insights</span></h2>
            <p className="text-white/30 uppercase tracking-[0.5em] text-[10px] font-black mt-4">Voices from the Cosmic Journey</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { q: "Finally, a course that respects the sacredness of the Vedas while keeping them applicable to modern challenges.", a: "Sarah Johnson", r: "Yoga Instructor", i: "https://i.pravatar.cc/100?img=32" },
              { q: "This course transformed how I view the cosmos. Hansal Ji is a master of explaining complex concepts.", a: "Rajesh Kumar", r: "Enthusiast", i: "https://i.pravatar.cc/100?img=44" },
              { q: "The practical remedies provided have brought immense peace to my family life.", a: "Anita Desai", r: "Homemaker", i: "https://i.pravatar.cc/100?img=47" }
            ].map((t, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -10 }}
                className="p-10 rounded-xl bg-black/40 backdrop-blur-2xl border border-white/10 hover:border-brand-red/30 transition-all duration-500 group relative flex flex-col justify-between shadow-2xl"
              >
                <div className="absolute top-10 right-10 text-6xl text-brand-red/10 group-hover:text-brand-red/20 transition-colors pointer-events-none font-serif">“</div>

                <div className="space-y-6 relative z-10">
                  <FaQuoteLeft className="text-3xl text-brand-red opacity-40 group-hover:opacity-100 transition-opacity" />
                  <p className="text-white/80 text-lg leading-relaxed font-light italic">
                    "{t.q}"
                  </p>
                </div>

                <div className="mt-12 flex items-center gap-4 relative z-10 border-t border-white/5 pt-8">
                  <img src={t.i} alt={t.a} className="w-12 h-12 rounded-full border-2 border-white/10 group-hover:border-brand-red/50 transition-all" />
                  <div>
                    <p className="font-bold text-white uppercase tracking-[0.2em] text-[10px]">{t.a}</p>
                    <p className="text-brand-red font-black uppercase tracking-[0.3em] text-[9px] mt-1">{t.r}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section className="py-[50px]">
        <div className="premium-container">
          <div className="bg-brand-red/50 rounded-xl p-10 md:p-16 text-center relative overflow-hidden shadow-[0_20px_60px_rgba(191, 6, 3,0.2)]">
            <div className="absolute top-0 left-0 w-full h-full bg-linear-to-br from-white/5 to-transparent opacity-10 mix-blend-overlay"></div>
            <div className="relative z-10 space-y-10">
              <h2 className="title-batangas text-3xl md:text-5xl text-white">Join the <br /> Sacred Community</h2>
              <p className="text-white/80 text-base max-w-xl mx-auto leading-relaxed">
                Connect with like-minded souls on the same spiritual path. Share insights, participate in live discussions, and grow together in our exclusive student portal.
              </p>
              <div className="flex flex-wrap justify-center gap-12 pt-8">
                {[
                  { l: "Active Students", v: "15,000+" },
                  { l: "Daily Discussions", v: "200+" },
                  { l: "Success Stories", v: "1,200+" }
                ].map((s, i) => (
                  <div key={i} className="text-center">
                    <p className="text-3xl md:text-4xl font-black text-white mb-2">{s.v}</p>
                    <p className="text-[10px] uppercase tracking-[0.4em] text-white/60 font-black">{s.l}</p>
                  </div>
                ))}
              </div>
              <div className="pt-12">
                <Link to={enrollUrl}>
                  <button className="px-16 py-6 rounded-full bg-white text-brand-red font-black uppercase tracking-[0.3em] text-xs hover:bg-black hover:text-white transition-all duration-500 shadow-2xl scale-110">
                    Enroll in Course
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CourseDetail;

