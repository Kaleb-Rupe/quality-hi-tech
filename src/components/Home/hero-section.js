import React from "react";
import { Link } from "react-router-dom";
import "../../css/hero-section.css";
import heroImg from "../../assets/logos/quality-hi-tech-large.png";

const Hero = () => {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="wrapper">
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
          <p>
            Clean your Carpet, Upholstery, and Tile & Grout with our
            professional cleaning services.
          </p>
          <Link
            to="/contact"
            className="cta-button"
            onClick={() => window.scrollTo(0, 0)}
            aria-label="Get a free estimate"
          >
            Free Estimate
          </Link>
        </div>
      </div>
    </section>
  );
};

export default React.memo(Hero);
