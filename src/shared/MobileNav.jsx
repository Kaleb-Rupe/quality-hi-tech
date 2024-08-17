import React from "react";
import { Link } from "react-router-dom";

const MobileNav = ({ toggleMenu }) => (
  <nav className="mobile-nav" id="mobile-menu" aria-label="Mobile Navigation">
    <ul>
      <li>
        <Link to="/" onClick={toggleMenu}>
          Home
        </Link>
      </li>
      <li>
        <Link to="/services" onClick={toggleMenu}>
          Services
        </Link>
      </li>
      <li>
        <Link to="/about" onClick={toggleMenu}>
          About
        </Link>
      </li>
      <li>
        <Link to="/contact" onClick={toggleMenu}>
          Contact
        </Link>
      </li>
    </ul>
  </nav>
);

export default MobileNav;
