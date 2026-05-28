import { useEffect, useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebaseConfig";

const InquiryHandler = ({ formData }) => {
  const [submitted, setSubmitted] = useState(false); // ✅ Track submission status

  useEffect(() => {
    if (formData.name && formData.email && formData.phone && formData.course && !submitted) {
      handleSubmitInquiry();
      setSubmitted(true); // ✅ Set flag to prevent duplicate submission
    }
  }, [formData, submitted]); // ✅ Depend only on formData

  const handleSubmitInquiry = async () => {
    try {
      // ✅ Add inquiry to Firestore (Only once)
      const inquiryRef = collection(db, "Astroinquiries");
      await addDoc(inquiryRef, {
        name: formData.name,
        email: formData.email,
        phone: `${formData.countryCode} ${formData.phone}`,
        course: formData.course,
        timestamp: serverTimestamp(),
      });

      console.log("✅ Inquiry successfully stored in Firestore!");

      // ✅ Send inquiry email using Web3Forms (Only once)
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
            📞 Phone: ${formData.countryCode} ${formData.phone}
            📌 Course ID: ${formData.course}

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

  return null; // This component runs in the background
};

export default InquiryHandler;

