import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaInstagram, FaYoutube, FaWhatsapp } from "react-icons/fa";
import { footerData } from '../../../data/layout/footer';
import "./Footer.css";

const Footer = () => {
  const { brand, quickLinks, supportLinks, contact, social, copyright } = footerData;

  const getSocialIcon = (name) => {
    switch (name) {
      case 'Facebook': return <FaFacebookF size={18} />;
      case 'Instagram': return <FaInstagram size={18} />;
      case 'YouTube': return <FaYoutube size={18} />;
      case 'WhatsApp': return <FaWhatsapp size={18} />;
      default: return null;
    }
  };

  return (
    <footer className="footer-section">
      <div className="section-container">
        <div className="footer-grid">
          {/* Column 1: About */}
          <div className="footer-col">
            <h3 className="title-batangas footer-brand">{brand.name}</h3>
            <p className="subtitle-poppins footer-desc">
              {brand.description}
            </p>
            <p className="subtitle-poppins footer-mission">
              {brand.mission}
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div className="footer-col">
            <h3 className="title-batangas footer-col-title">Quick Links</h3>
            <ul className="footer-links">
              {quickLinks.map((link, idx) => (
                <li key={idx}><Link to={link.path}>{link.name}</Link></li>
              ))}
            </ul>
          </div>

          {/* Column 3: Support */}
          <div className="footer-col">
            <h3 className="title-batangas footer-col-title">Support</h3>
            <ul className="footer-links">
              {supportLinks.map((link, idx) => (
                <li key={idx}><Link to={link.path}>{link.name}</Link></li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div className="footer-col">
            <h3 className="title-batangas footer-col-title">Contact Details</h3>
            <div className="footer-contact-info">
              <a href={`mailto:${contact.email}`} className="footer-contact-link">
                <p className="subtitle-poppins"><strong>Email:</strong> {contact.email}</p>
              </a>
              <a href={`tel:${contact.phone.replace(/\s/g, '')}`} className="footer-contact-link">
                <p className="subtitle-poppins"><strong>LandLine:</strong> {contact.phone}</p>
              </a>
              
              <h4 className="title-batangas location-title">Locations</h4>
              <a 
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contact.address)}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="footer-contact-link"
              >
                <p className="subtitle-poppins footer-address">
                  {contact.address}
                </p>
              </a>

              {/* Premium Map Card */}
              <div className="footer-map-wrapper">
                {/* Header label */}
                <div className="footer-map-header">
                  <span className="footer-map-pin-dot" />
                  <span className="footer-map-label">Find Us Here</span>
                </div>

                {/* Map Frame */}
                <div className="footer-map-container">
                  {/* Glow border layer */}
                  <div className="footer-map-glow" />

                  <iframe
                    title="Vahlay Astro Location"
                    src={contact.mapUrl}
                    width="100%"
                    height="180"
                    style={{ border: 0, display: 'block' }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>

                  {/* Bottom overlay ribbon */}
                  <div className="footer-map-ribbon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="#dd2727" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                    <span>{contact.address}</span>
                  </div>
                </div>

                {/* CTA */}
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contact.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-map-cta"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M19 19H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/></svg>
                  View on Google Maps
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div className="footer-social-icons">
             {social.map((item, idx) => (
               <a key={idx} href={item.url} target="_blank" rel="noopener noreferrer" className="social-icon" aria-label={`Follow us on ${item.name}`}>
                 {getSocialIcon(item.name)}
               </a>
             ))}
          </div>
          <p className="footer-copyright">
            {copyright}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;