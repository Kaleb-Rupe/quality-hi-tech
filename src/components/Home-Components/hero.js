import React from "react";
import { Link } from "react-router-dom";
import "./hero.css";

export const Hero = () => {
  return (
    <section className="hero">
      <div className="wrapper">
        <div className="contrast-element">
          <h1>Santa Cruz Sun</h1>
          <p>Building Your Dreams Into Reality</p>
          <button>
            <Link id="link" to="/contact">
              Free Estimate
            </Link>
          </button>
        </div>
      </div>
    </section>
  );
};
