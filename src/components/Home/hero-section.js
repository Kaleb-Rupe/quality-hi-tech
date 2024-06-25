import React from "react";
import { Link } from "react-router-dom";
import "../../css/hero-section.css";
import heroImg from "../../assets/logos/Santa-Cruz-Construction-font-large.png";

const Hero = () => {
  return (
    <header className="hero">
      <div className="wrapper">
        <div className="contrast-element">
          <h1>
            <img src={heroImg} alt="Santa Cruz Sun LLC Logo" />
          </h1>
          <p>Building Your Dreams Into Reality</p>
          <Link
            to="/contact"
            className="cta-button"
            onClick={() => window.scrollTo(0, 0)}
          >
            Free Estimate
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Hero;
