import React from "react";
import { Link } from "react-router-dom";
import { footerData } from "../../../data/layout/footer";
import "./Footer.css";

const SocialIcon = ({ name }) => {
  switch (name) {
    case "Facebook":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
          <path d="M22 12a10 10 0 1 0-11.5 9.9v-7h-2v-3h2V9.5c0-2 1.2-3.1 3-3.1.9 0 1.8.1 1.8.1v2h-1c-1 0-1.3.6-1.3 1.2V12h2.3l-.4 3h-1.9v7A10 10 0 0 0 22 12Z" />
        </svg>
      );
    case "Instagram":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
          <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm8 3.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Zm-3 1.5a4 4 0 1 0 .001 8.001A4 4 0 0 0 12 7Z" />
        </svg>
      );
    case "YouTube":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
          <path d="M21 7.5a2.7 2.7 0 0 0-1.9-1.9C17.4 5 12 5 12 5s-5.4 0-7.1.6A2.7 2.7 0 0 0 3 7.5 28.3 28.3 0 0 0 3 12a28.3 28.3 0 0 0 .6 4.5 2.7 2.7 0 0 0 1.9 1.9C6.6 19 12 19 12 19s5.4 0 7.1-.6a2.7 2.7 0 0 0 1.9-1.9A28.3 28.3 0 0 0 21 12a28.3 28.3 0 0 0-.6-4.5ZM10 15.5v-7l6 3.5-6 3.5Z" />
        </svg>
      );
    case "WhatsApp":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
          <path d="M16.7 13.5c-.3-.1-1.7-.8-2-.9-.4-.1-.6 0-.8.2-.2.3-.7.9-.8 1.1-.2.2-.4.2-.7.1-1.3-.6-2.1-2.4-2.1-4 0-1.6 1-2.3 1.4-2.6.2-.1.4-.2.6-.2.3 0 .6 0 .8 0 .2 0 .5-.2.8-.2.3 0 .7 0 1 .1.3.1.6.2.9.4.3.2.6.4.8.7.2.2.4.5.4.8 0 .3 0 .6-.1.9-.1.2-.2.4-.3.5-.2.3-.3.5-.3.7 0 .1 0 .3.1.4.1.1.2.1.4.2.5.2 1 .4 1.4.7.2.1.3.2.4.3.1.1.2.3.2.4 0 .1 0 .2-.1.4-.2.6-.7 1.1-1.2 1.4Z" />
          <path d="M12 2c-5.5 0-10 4.5-10 10 0 1.7.4 3.3 1.1 4.8L2 22l5.4-1.4c1.4.8 3 1.2 4.6 1.2 5.5 0 10-4.5 10-10S17.5 2 12 2Zm0 18.2c-1.4 0-2.8-.4-4-1.2l-.3-.2-3.2.8.8-3.2-.2-.3C3.4 15.1 3 13.6 3 12 3 7.6 7.6 3 12 3s9 4.6 9 9-4.6 8.2-9 8.2Z" />
        </svg>
      );
    default:
      return null;
  }
};

const ArrowForwardIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
    <path d="M5 12h14" />
    <path d="M13 5l7 7-7 7" />
  </svg>
);

const ArrowUpIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
    <path d="M12 19V5" />
    <path d="M5 12l7-7 7 7" />
  </svg>
);

const MailIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <path d="M3 6h18" />
    <path d="m3 6 9 7 9-7" />
    <path d="M21 18H3V6" />
  </svg>
);

const CallIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 3.08 4.18 2 2 0 0 1 5 2h3a2 2 0 0 1 2 1.72 12.6 12.6 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L9.11 9.11a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.6 12.6 0 0 0 2.81.7A2 2 0 0 1 22 16.92Z" />
  </svg>
);

const LocationIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <path d="M12 21s-6-5.4-6-10a6 6 0 1 1 12 0c0 4.6-6 10-6 10Z" />
    <circle cx="12" cy="10" r="2" fill="currentColor" />
  </svg>
);

const Footer = () => {
  const { brand, quickLinks, supportLinks, contact, social, copyright } = footerData;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="footer-section">
      <div className="footer-glow footer-glow-left" aria-hidden="true" />
      <div className="footer-glow footer-glow-right" aria-hidden="true" />

      <div className="section-container footer-container">
        <div className="footer-topline" aria-hidden="true">
          <span />
          <i>✦</i>
          <span />
        </div>

        <div className="footer-grid">
          <div className="footer-col footer-about">
            <p className="footer-eyebrow">Guidance · Wisdom · Transformation</p>
            <h2 className="title-batangas footer-brand">{brand.name}</h2>
            <p className="subtitle-poppins footer-desc">{brand.description}</p>
            {brand.mission && (
              <p className="subtitle-poppins footer-mission">{brand.mission}</p>
            )}

            <div className="footer-social-icons" aria-label="Social media links">
              {social.map((item) => (
                <a
                  key={item.name}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-icon"
                  aria-label={`Follow us on ${item.name}`}
                  title={item.name}
                >
                  <SocialIcon name={item.name} aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          <nav className="footer-col" aria-label="Quick links">
            <p className="footer-col-number">01</p>
            <h3 className="title-batangas footer-col-title">Quick Links</h3>
            <ul className="footer-links">
              {quickLinks.map((link) => (
                <li key={`${link.path}-${link.name}`}>
                  <Link to={link.path}>
                    <span>{link.name}</span>
                    <ArrowForwardIcon aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav className="footer-col" aria-label="Support links">
            <p className="footer-col-number">02</p>
            <h3 className="title-batangas footer-col-title">Support</h3>
            <ul className="footer-links">
              {supportLinks.map((link) => (
                <li key={`${link.path}-${link.name}`}>
                  <Link to={link.path}>
                    <span>{link.name}</span>
                    <ArrowForwardIcon aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="footer-col footer-contact">
            <p className="footer-col-number">03</p>
            <h3 className="title-batangas footer-col-title">Contact Details</h3>

            <div className="footer-contact-list">
              <a href={`mailto:${contact.email}`} className="footer-contact-item">
                <span className="footer-contact-icon"><MailIcon aria-hidden="true" /></span>
                <span>
                  <small>Email us</small>
                  <strong>{contact.email}</strong>
                </span>
              </a>

              <a
                href={`tel:${contact.phone.replace(/\s/g, "")}`}
                className="footer-contact-item"
              >
                <span className="footer-contact-icon"><CallIcon aria-hidden="true" /></span>
                <span>
                  <small>Landline</small>
                  <strong>{contact.phone}</strong>
                </span>
              </a>

              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contact.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="footer-contact-item footer-address-item"
              >
                <span className="footer-contact-icon"><LocationIcon aria-hidden="true" /></span>
                <span>
                  <small>Visit us</small>
                  <strong>{contact.address}</strong>
                </span>
              </a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copyright">{copyright}</p>
          <p className="footer-signature">Crafted for meaningful journeys</p>
          <button type="button" className="footer-to-top" onClick={scrollToTop} aria-label="Back to top">
            <span>Back to top</span>
            <ArrowUpIcon aria-hidden="true" />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;