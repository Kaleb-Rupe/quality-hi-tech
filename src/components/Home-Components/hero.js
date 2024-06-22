import React from "react";
import { Link } from "react-router-dom";
import "./hero.css";

const Hero = () => {
  return (
    <header className="hero">
      <div className="wrapper">
        <div className="contrast-element">
          <h1>Santa Cruz Sun</h1>
          <p>Building Your Dreams Into Reality</p>
          <button aria-label="Get a free estimate">
            <Link id="link" to="/contact">
              Free Estimate
            </Link>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Hero;
