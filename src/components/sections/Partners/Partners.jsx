import React from "react";
import "./Partners.css";
import vahlayLogo from "../../../assets/images/common/logos/VahalyConsulting logo.webp";

const Partners = () => {
  return (
    <section className="partners-section">
      <div className="section-container">
        <div className="partners-content">
          <div className="partners-header">
            <h2 className="title-batangas">Our Partners</h2>
            <p className="subtitle-poppins">
              We proudly collaborate with trusted brands and organizations to deliver
              meaningful growth, guidance, and reliable solutions.
            </p>
          </div>

          <div className="partner-card">
            <div className="partner-logo-ring">
              <img src={vahlayLogo} alt="Vahlay Consulting" />
            </div>

            <h3>Vahlay Consulting</h3>
            <p>Strategic Business & Digital Growth Partner</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Partners;