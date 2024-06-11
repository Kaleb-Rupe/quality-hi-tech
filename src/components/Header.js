import * as React from "react";
import { Link } from "react-router-dom";
import Logo from "../assets/images/logo.JPG";
import "./Header.css";

export const Header = () => {
  return (
    <>
      <header id="masthead" className="site-header">
        <div className="header-logo">
        <a href="/" id="bottle" onclick="document.location=/home'.html';return false;" >
          <img src={Logo} alt="logo" />
        </a>
          <h1>Santa Cruz Sun LLC, CCB#249418</h1>
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

