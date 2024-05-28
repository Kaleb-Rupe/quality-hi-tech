import * as React from "react";
import { Link } from "react-router-dom";
import Logo from "/Users/kalebrupe/Desktop/Zachs Project/santa-cruz-sun/src/assets/images/logo.JPG";
import "./Header.css";

const Header = () => {
  return (
    <>
      <header className="header">
        <div className="header-logo">
          <img src={Logo} alt="Logo" />
          <h1>Santa Cruz Sun Contractor</h1>
        </div>
        <nav className="header-nav">
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/services">Services</Link>
            </li>
            <li>
              <Link to="/gallery">Gallery</Link>
            </li>
            <li>
              <Link to="/about">About</Link>
            </li>
            <li>
              <Link to="/contact">Contact</Link>
            </li>
            <li className="login-button">
              <Link to="/login">Login</Link>
            </li>
          </ul>
        </nav>
      </header>
    </>
  );
};

export default Header;
