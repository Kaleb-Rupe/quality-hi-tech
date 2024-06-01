import * as React from "react";
import { Link } from "react-router-dom";
import { FaFacebook } from "react-icons/fa";
import "./footer_nav_socials.css";

const Nav = () => {
  return (
    <>
      <div className="nav-container">
        <div className="nav-links">
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/about">About</Link>
            </li>
            <li>
              <Link to="/services">Services</Link>
            </li>
          </ul>
        </div>

        <p className="social-title">Check Us Out On Facebook!</p>
        <div className="nav-social">
          <a
            href="https://www.facebook.com/profile.php?id=100092280827323"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaFacebook />
          </a>
        
        </div>

        <div className="hours-of-operation">
          <p>Contractors License: CCB#249418</p>
          <h3>Hours of Operation:</h3>
          <p>Monday-Friday: 9:00 AM - 6:00 PM</p>
          <p>Saturday & Sunday By Appointment Only</p>
        </div>

        <div className="footer-copy">
          <p>&copy; 2024 Santa Cruz Sun Construction. All rights reserved.</p>
        </div>
      </div>
    </>
  );
};

export default Nav;
