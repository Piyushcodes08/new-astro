import React from "react";
import { Link } from "react-router-dom";
import {
  FaFacebookF,
  FaInstagram,
  FaYoutube,
  FaWhatsapp,
} from "react-icons/fa";
import {
  IoCallOutline,
  IoLocationOutline,
  IoMailOutline,
  IoArrowUpOutline,
  IoArrowForwardOutline,
} from "react-icons/io5";
import { footerData } from "../../../data/layout/footer";
import "./Footer.css";

const SOCIAL_ICONS = {
  Facebook: FaFacebookF,
  Instagram: FaInstagram,
  YouTube: FaYoutube,
  WhatsApp: FaWhatsapp,
};

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
              {social.map((item) => {
                const Icon = SOCIAL_ICONS[item.name];
                return (
                  <a
                    key={item.name}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-icon"
                    aria-label={`Follow us on ${item.name}`}
                    title={item.name}
                  >
                    {Icon ? <Icon aria-hidden="true" /> : item.name.charAt(0)}
                  </a>
                );
              })}
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
                    <IoArrowForwardOutline aria-hidden="true" />
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
                    <IoArrowForwardOutline aria-hidden="true" />
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
                <span className="footer-contact-icon"><IoMailOutline /></span>
                <span>
                  <small>Email us</small>
                  <strong>{contact.email}</strong>
                </span>
              </a>

              <a
                href={`tel:${contact.phone.replace(/\s/g, "")}`}
                className="footer-contact-item"
              >
                <span className="footer-contact-icon"><IoCallOutline /></span>
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
                <span className="footer-contact-icon"><IoLocationOutline /></span>
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
            <IoArrowUpOutline aria-hidden="true" />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;