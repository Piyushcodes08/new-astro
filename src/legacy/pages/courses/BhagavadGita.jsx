
import React from "react";
import PremiumCourseLayout from "../../../components/layouts/PremiumCourseLayout";

const BhagavadGitaCourse = () => {
  const courseData = {
    title: "New Edge Bhagavad Gita",
    subtitle: "A modern guide to ancient wisdom. Master the timeless philosophy of the Gita to conquer modern-day challenges.",
    heroImage: "/src/assets/images/pages/courses/New edge Bhadvad Geetahp.webp",
    isFree: true,
    enrollLink: "/enrollfree/bhagavad-gita/free",
    description: "The Bhagavad Gita is the ultimate manual for human life. In this 'New Edge' edition, we focus on the practical application of Krishna's teachings in today's high-stress world. Whether you are a student, a professional, or a seeker, this course provides the mental tools for decision-making, emotional stability, and spiritual awakening. Join Acharya Hansal Ji as he decodes the 18 chapters for a 21st-century audience.",
    duration: "18 Deep Sessions",
    level: "All Levels",
    whatYouWillLearn: [
      "Decision Making in Times of Crisis (Dharma Sankat)",
      "The Science of Karma Yoga (Action without Attachment)",
      "Mind Control & Emotional Resilience (Sthitaprajna)",
      "Understanding the 3 Gunas (Sattva, Rajas, Tamas)",
      "The Path of Devotion (Bhakti) & Knowledge (Jnana)",
      "Universal Vision & Spiritual Leadership"
    ],
    curriculum: [
      { 
        title: "The Yoga of Despondency", 
        duration: "2 Hours",
        content: "Understanding Arjuna's dilemma and how we face similar crises today." 
      },
      { 
        title: "Sankhya Yoga: The Nature of the Soul", 
        duration: "2.5 Hours",
        content: "The timeless truth of immortality and the transient nature of the physical world." 
      },
      { 
        title: "Karma Yoga: Excellence in Action", 
        duration: "3 Hours",
        content: "How to perform your duties with peak efficiency and zero stress." 
      },
      { 
        title: "Dhyana Yoga: The Path of Meditation", 
        duration: "2.5 Hours",
        content: "Practical techniques for stillness and concentration in a noisy world." 
      },
      { 
        title: "The Divine Eye: Viswarupa Darshana", 
        duration: "2 Hours",
        content: "Experiencing the cosmic interconnectedness of all beings." 
      }
    ],
    faqs: [
      {
        q: "Is this a religious course?",
        a: "While the Gita is a sacred Hindu text, our approach is philosophical and psychological, focusing on universal truths applicable to anyone."
      },
      {
        q: "How long do I have access?",
        a: "Enrolled students get lifetime access to the recorded sessions and the study materials portal."
      },
      {
        q: "Can I ask questions during the course?",
        a: "Yes, we have a dedicated Q&A section in the portal where our team and Hansal Sir provide regular clarifications."
      }
    ]
  };

  return <PremiumCourseLayout {...courseData} />;
};

export default BhagavadGitaCourse;


