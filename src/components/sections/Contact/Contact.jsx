import React, { useState, useRef } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../../firebaseConfig";
import { createLogger } from "../../../utils/logger";
import ReCAPTCHA from "react-google-recaptcha";
import { homeData } from "../../../data/pages/home";
import { footerData } from "../../../data/layout/footer";
import "./Contact.css";

const LocationIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
    <path d="M12 21s-6-5.4-6-10a6 6 0 1 1 12 0c0 4.6-6 10-6 10Z" />
    <circle cx="12" cy="10" r="2" fill="currentColor" />
  </svg>
);

const CallIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 3.08 4.18 2 2 0 0 1 5 2h3a2 2 0 0 1 2 1.72 12.6 12.6 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L9.11 9.11a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.6 12.6 0 0 0 2.81.7A2 2 0 0 1 22 16.92Z" />
  </svg>
);

const TimeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
    <circle cx="12" cy="12" r="8" />
    <path d="M12 8v4l2 2" />
  </svg>
);

const logger = createLogger('Contact');

const { contact: contactContent } = homeData;
const { contact: contactInfo } = footerData;

const Contact = () => {
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", message: "" });
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [captchaToken, setCaptchaToken] = useState(null);
  const recaptchaRef = useRef(null);

  const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const onCaptchaChange = (token) => {
    setCaptchaToken(token);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setStatus("loading");
    try {
      await addDoc(collection(db, "Astro_Contact"), {
        ...formData,
        captchaVerified: !!captchaToken,
        createdAt: serverTimestamp(),
      });
      setStatus("success");
      setFormData({ name: "", email: "", phone: "", message: "" });
      setCaptchaToken(null);
      if (recaptchaRef.current) recaptchaRef.current.reset();
    } catch (err) {
      logger.error("Contact form error:", err);
      setStatus("error");
    }
  };

  return (
    <section className="contact-section" id="contact">
      <div className="section-container">
        <div className="contact-header">
  
          <h2 className="section-title-theme">
            {contactContent.title.split(" ").slice(0, -1).join(" ")} <span>{contactContent.title.split(" ").at(-1)}</span>
          </h2>
          <p className="subtitle-poppins" style={{ fontSize: "clamp(0.88rem, 1.35vw, 1rem)", color: "rgba(255, 246, 230, 0.66)", lineHeight: "1.78" }}>
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
                  <LocationIcon aria-hidden="true" />
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
                  <CallIcon aria-hidden="true" />
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
                  <TimeIcon aria-hidden="true" />
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

              {recaptchaSiteKey && (
                <div className="flex justify-center my-2">
                  <ReCAPTCHA
                    ref={recaptchaRef}
                    sitekey={recaptchaSiteKey}
                    onChange={onCaptchaChange}
                    theme="dark"
                  />
                </div>
              )}

              <button
                type="submit"
                className="contact-submit-btn"
                disabled={status === "loading" || (recaptchaSiteKey && !captchaToken)}
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