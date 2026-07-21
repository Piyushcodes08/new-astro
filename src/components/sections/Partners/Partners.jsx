import React from "react";
import "./Partners.css";
import vahlayLogo from "../../../assets/images/common/logos/VahalyConsulting logo.webp";

const Partners = () => {
  return (
    <section className="partners-section" aria-labelledby="partners-title">
      <div className="partners-ambient partners-ambient--left" aria-hidden="true" />
      <div className="partners-ambient partners-ambient--right" aria-hidden="true" />

      <div className="partner-pattern" aria-hidden="true">
        <span className="partner-orbit partner-orbit--one" />
        <span className="partner-orbit partner-orbit--two" />
        <span className="partner-star partner-star--one">✦</span>
        <span className="partner-star partner-star--two">✦</span>
        <span className="partner-star partner-star--three">✦</span>
      </div>

      <div className="section-container">
        <div className="partners-content">
          <header className="partners-header">
            <span className="partners-eyebrow">
              <i aria-hidden="true" /> Trusted Association <i aria-hidden="true" />
            </span>

            <h2 id="partners-title" className="title-batangas">
              Our <span>Partners</span>
            </h2>

            <p className="subtitle-poppins">
              We collaborate with trusted organizations that share our commitment
              to purposeful growth, dependable guidance and lasting value.
            </p>

            <div className="partners-ornament" aria-hidden="true">
              <span />
              <b>◆</b>
              <span />
            </div>
          </header>

          <article className="partner-card">
            <span className="partner-card-corner partner-card-corner--tl" aria-hidden="true" />
            <span className="partner-card-corner partner-card-corner--tr" aria-hidden="true" />
            <span className="partner-card-corner partner-card-corner--bl" aria-hidden="true" />
            <span className="partner-card-corner partner-card-corner--br" aria-hidden="true" />

            <div className="partner-logo-stage">
              <div className="partner-logo-halo" aria-hidden="true" />
              <div className="partner-logo-ring">
                <div className="partner-logo-surface">
                  <img src={vahlayLogo} alt="Vahlay Consulting logo" />
                </div>
              </div>
            </div>

            <div className="partner-card-copy">
              <span className="partner-status">
                <i aria-hidden="true" /> Official Strategic Partner
              </span>
              <h3>Vahlay Consulting</h3>
              <p>Strategic Business &amp; Digital Growth Partner</p>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
};

export default Partners;