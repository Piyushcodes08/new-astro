
import React from "react";
import PremiumCourseLayout from "../../../components/layouts/PremiumCourseLayout";

const NaradCourse = () => {
  const courseData = {
    title: "Narad Puran Mastery",
    subtitle: "Unlock the secrets of the Narad Puran and master the art of divine communication and cosmic law.",
    heroImage: "/src/assets/images/pages/courses/Narad puranhp.webp",
    isFree: true,
    enrollLink: "/enrollfree/narad-bhakti-sutra/free",
    description: "The Narad Purana is one of the eighteen Mahapuranas, a sacred genre of Hindu texts. This course provides a deep dive into its teachings on devotion (bhakti), cosmic creation, and the divine laws governing the universe. Led by Acharya Hansal Ji, you will explore how the wisdom of Narada Muni can be applied to achieve mental clarity and spiritual growth in the modern age.",
    whatYouWillLearn: [
      "The 5 Pillars of Divine Devotion (Bhakti Yoga)",
      "Vedic Communication & Conflict Resolution",
      "Cosmic Creation according to Narad Purana",
      "Practical Remedies for Mercury & Jupiter",
      "The Art of Spiritual Storytelling",
      "Universal Moral Laws (Dharma) & Their Impact"
    ],
    curriculum: [
      { 
        title: "Introduction to the Narad Purana", 
        duration: "1.5 Hours",
        content: "Overview of the text's history, authorship, and its significance among the Mahapuranas." 
      },
      { 
        title: "The Life & Teachings of Narada Muni", 
        duration: "2 Hours",
        content: "Exploring the archetype of the Divine Messenger and the power of 'Naam Simran'." 
      },
      { 
        title: "Cosmology and Universal Order", 
        duration: "2.5 Hours",
        content: "Understanding the Vedic structure of the universe and the cycles of time (Yugas)." 
      },
      { 
        title: "Devotional Practices (Bhakti Sutras)", 
        duration: "3 Hours",
        content: "Deep analysis of the 84 Bhakti Sutras and their practical application in daily life." 
      },
      { 
        title: "Mercury & The Power of Speech", 
        duration: "2 Hours",
        content: "Remedies for effective communication and sharpening the intellect based on Naradic wisdom." 
      }
    ],
    faqs: [
      {
        q: "Do I need prior knowledge of Sanskrit?",
        a: "No, all teachings are explained in Hindi and English. We provide simplified translations of all sacred verses."
      },
      {
        q: "Is this course really free?",
        a: "Yes, this foundational course on the Narad Purana is offered for free as part of our mission to spread Vedic wisdom."
      },
      {
        q: "Will I get a certificate for a free course?",
        a: "While you get full access to the portal, the verified digital certification is only available for our professional-level masterclasses."
      }
    ]
  };

  return <PremiumCourseLayout {...courseData} />;
};

export default NaradCourse;


