import React from "react";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import "../../css/hero-section.css";
import heroImg from "../../assets/logos/quality-hi-tech-large.svg";
import { FaPhone } from "react-icons/fa";
import ContactForm from "../Footer/contact-form";

const Hero = () => {
  const isMobile = useMediaQuery("(max-width: 880px)");

  const phone = process.env.REACT_APP_CONTACT_PHONE;

  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-content">
        <div className="hero-left">
          <div className="contrast-element">
            <h1 id="hero-title" className="visually-hidden">
              Quality Hi Tech Carpet Cleaning
            </h1>
            <img
              src={heroImg}
              alt="Quality Hi Tech Logo"
              loading="eager"
              width="300"
              height="100"
            />
          </div>
          <div className="contrast-element hero-contact-info">
            <h3>Licensed & Insured Serving the Pasco & Hillsborough County</h3>
            <div className="hero-contact-links">
              {isMobile ? (
                <a
                  href={`tel:${phone}`}
                  rel="noopener noreferrer"
                  aria-label="Call Us"
                >
                  <span>
                    <FaPhone className="icon" />
                    Call For A Quote
                  </span>
                </a>
              ) : (
                <></>
              )}
              <div>
                <h3>Hours of Operation:</h3>
              </div>
              <div className="hero-contact-column">
                <p>
                  Monday-Friday:
                  <br />
                  9:00 AM - 6:00 PM
                </p>
                <p>
                  Saturday & Sunday:
                  <br />
                  By Appointment Only
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="hero-right">
          <ContactForm />
        </div>
      </div>
    </section>
  );
};

export default React.memo(Hero);
