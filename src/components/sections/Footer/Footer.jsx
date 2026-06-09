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