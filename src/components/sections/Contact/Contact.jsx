import React, { useState, useRef } from "react";
import { IoLocationOutline, IoCallOutline, IoTimeOutline } from "react-icons/io5";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../../firebaseConfig";
import ReCAPTCHA from "react-google-recaptcha";
import { homeData } from "../../../data/pages/home";
import { footerData } from "../../../data/layout/footer";
import "./Contact.css";

const { contact: contactContent } = homeData;
const { contact: contactInfo } = footerData;

const Contact = () => {
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", message: "" });
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [captchaToken, setCaptchaToken] = useState(null);
  const recaptchaRef = useRef(null);

  const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY || "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"; // Fallback to testing key if not set

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const onCaptchaChange = (token) => {
    setCaptchaToken(token);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    if (!captchaToken) {
      alert("Please verify that you are not a robot.");
      return;
    }

    setStatus("loading");
    try {
      await addDoc(collection(db, "Astro_Contact"), {
        ...formData,
        captchaVerified: true,
        createdAt: serverTimestamp(),
      });
      setStatus("success");
      setFormData({ name: "", email: "", phone: "", message: "" });
      setCaptchaToken(null);
      if (recaptchaRef.current) recaptchaRef.current.reset();
    } catch (err) {
      console.error("Contact form error:", err);
      setStatus("error");
    }
  };

  return (
    <section className="contact-section" id="contact">
      <div className="section-container">
        <div className="contact-header">
          <p className="contact-label">{contactContent.label}</p>
          <h2 className="title-batangas text-4xl md:text-5xl font-bold uppercase tracking-tight leading-tight">
            {contactContent.title}
          </h2>
          <p className="subtitle-poppins text-lg md:text-xl font-medium">
            {contactContent.subtitle}
          </p>
        </div>

        <div className="contact-grid">
          <div className="contact-info">
            <p className="contact-desc subtitle-poppins">
              {contactContent.description}
            </p>

            <ul className="contact-list">
              <li>
                <div className="contact-icon">
                  <IoLocationOutline size={24} />
                </div>
                <div className="contact-text-group">
                  <h3 className="title-batangas">Our Address</h3>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contactInfo.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="contact-link"
                  >
                    <p className="subtitle-poppins">{contactInfo.address}</p>
                  </a>
                </div>
              </li>

              <li>
                <div className="contact-icon">
                  <IoCallOutline size={24} />
                </div>
                <div className="contact-text-group">
                  <h3 className="title-batangas">Contact</h3>
                  <a href={`tel:${contactInfo.phone.replace(/\s/g, '')}`} className="contact-link">
                    <p className="subtitle-poppins">LandLine: {contactInfo.phone}</p>
                  </a>
                  <a href={`mailto:${contactInfo.email}`} className="contact-link">
                    <p className="subtitle-poppins">Email: {contactInfo.email}</p>
                  </a>
                </div>
              </li>

              <li>
                <div className="contact-icon">
                  <IoTimeOutline size={24} />
                </div>
                <div className="contact-text-group">
                  <h3 className="title-batangas">Working Hours</h3>
                  <p className="subtitle-poppins">{contactContent.workingHours.weekdays}</p>
                  <p className="subtitle-poppins">{contactContent.workingHours.sunday}</p>
                </div>
              </li>
            </ul>
          </div>

          <div className="contact-card">
            <h2 className="title-batangas">{contactContent.formTitle}</h2>

            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="input-group">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  required
                />
              </div>
              <div className="input-group">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Your email address"
                  required
                />
              </div>
              <div className="input-group">
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Your phone number"
                />
              </div>
              <div className="input-group">
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Write your message..."
                  required
                />
              </div>

              <div className="recaptcha-container my-4 flex justify-center">
                <ReCAPTCHA
                  ref={recaptchaRef}
                  sitekey={recaptchaSiteKey}
                  onChange={onCaptchaChange}
                  theme="dark"
                />
              </div>

              {status === "success" && (
                <p className="text-green-400 text-sm text-center subtitle-poppins mb-2">
                  ✅ Message sent! We'll get back to you shortly.
                </p>
              )}
              {status === "error" && (
                <p className="text-red-400 text-sm text-center subtitle-poppins mb-2">
                  ❌ Something went wrong. Please try again.
                </p>
              )}

              <button
                type="submit"
                className="contact-submit-btn"
                disabled={status === "loading" || !captchaToken}
              >
                {status === "loading" ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;