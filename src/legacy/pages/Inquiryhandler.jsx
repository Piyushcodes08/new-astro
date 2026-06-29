import { useEffect, useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebaseConfig";

const InquiryHandler = ({ formData, courseTitle }) => {
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (formData.name && formData.email && formData.phone && formData.course && !submitted) {
      handleSubmitInquiry();
      setSubmitted(true);
    }
  }, [formData, submitted]);

  const handleSubmitInquiry = async () => {
    // Build full phone with country code
    const fullPhone = formData.countryCode
      ? `${formData.countryCode} ${formData.phone}`
      : formData.phone;

    // Message shows which course the user is interested in
    const resolvedCourseTitle = courseTitle || formData.course;
    const message = `Interested in course: ${resolvedCourseTitle}`;

    try {
      // Save all details to Firestore
      const inquiryRef = collection(db, "Astroinquiries");
      await addDoc(inquiryRef, {
        name: formData.name,
        email: formData.email,
        phone: fullPhone,
        courseId: formData.course,
        courseName: resolvedCourseTitle,
        message: message,
        createdAt: serverTimestamp(),
        timestamp: serverTimestamp(),
      });

      console.log("✅ Inquiry successfully stored in Firestore!");

      // Send email notification via Web3Forms
      const web3FormsURL = "https://api.web3forms.com/submit";
      const web3FormsAccessKey = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY;

      const response = await fetch(web3FormsURL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          access_key: web3FormsAccessKey,
          subject: "📩 New Course Inquiry",
          from_name: formData.name,
          from_email: formData.email,
          message: `
            📌 New Course Inquiry Received:

            👤 Name: ${formData.name}
            📧 Email: ${formData.email}
            📞 Phone: ${fullPhone}
            📌 Course: ${resolvedCourseTitle} (ID: ${formData.course})

            Please review this inquiry and take necessary action.

            🚀 Astrology Course Team
          `,
        }),
      });

      const result = await response.json();
      if (result.success) {
        console.log("✅ Inquiry email sent successfully!");
      } else {
        console.error("❌ Error sending email:", result);
      }
    } catch (error) {
      console.error("❌ Error handling inquiry:", error);
    }
  };

  return null;
};

export default InquiryHandler;

