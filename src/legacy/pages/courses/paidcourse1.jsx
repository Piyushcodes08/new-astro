
import React from "react";
import PremiumCourseLayout from "../../../components/layouts/PremiumCourseLayout";

const FoundationCourse = () => {
  const courseData = {
    title: "Foundation of Astrology",
    subtitle: "The ultimate beginner's guide to mastering the Panchang, Nakshatras, and the building blocks of Vedic Astrology.",
    heroImage: "/src/assets/images/pages/courses/enrolledpg.webp",
    isFree: false,
    enrollLink: "/enroll/punchange-and-foundation-of-astrology/paid",
    description: "Unlock the cosmic code with our flagship Foundation Course. This program is designed for those who want to transition from curious enthusiasts to skilled practitioners. We cover everything from the five elements of the Panchang (Tithi, Vaar, Nakshatra, Yoga, Karana) to reading basic birth charts. Guided by Acharya Hansal Ji, you'll gain the confidence to predict daily Muhurats and understand planetary influences on your destiny.",
    duration: "36 Sessions",
    level: "Beginner",
    whatYouWillLearn: [
      "The 5 Elements of Panchang (Tithi, Nakshatra, etc.)",
      "Rashi & Bhava: The 12 Signs and Houses",
      "Planetary Aspects and Strengths (Shadbala)",
      "Daily Muhurat Prediction for Self & Family",
      "Vedic Lifestyle for Planetary Alignment",
      "Basic Chart Interpretation Techniques"
    ],
    curriculum: [
      { 
        title: "The Pillars of Time: Panchang", 
        duration: "4 Hours",
        content: "Understanding the solar and lunar calendars and the significance of the 5 elements." 
      },
      { 
        title: "The Zodiac Belt: Rashis & Nakshatras", 
        duration: "5 Hours",
        content: "Detailed study of the 12 signs and the 27 lunar mansions (Nakshatras)." 
      },
      { 
        title: "The Navagrahas: The Nine Influencers", 
        duration: "6 Hours",
        content: "Exploring the characteristics, mythology, and effects of the nine Vedic planets." 
      },
      { 
        title: "House Analysis (Bhavas)", 
        duration: "4 Hours",
        content: "How the 12 houses represent different aspects of your life from health to wealth." 
      },
      { 
        title: "Muhurat: The Art of Timing", 
        duration: "3 Hours",
        content: "Choosing the right time for new beginnings using the Choghadiya and Hora." 
      }
    ],
    faqs: [
      {
        q: "Who is this course for?",
        a: "Anyone with an interest in astrology, from absolute beginners to those who want to systematize their self-taught knowledge."
      },
      {
        q: "What software will we use?",
        a: "We recommend a few free mobile apps and websites during the course to generate charts instantly."
      },
      {
        q: "Is there a live component?",
        a: "Yes, every batch includes 4 live Zoom Q&A sessions with Hansal Sir to clear doubts in real-time."
      }
    ]
  };

  return <PremiumCourseLayout {...courseData} />;
};

export default FoundationCourse;


