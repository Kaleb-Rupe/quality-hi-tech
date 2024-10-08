import React, { useState, useCallback, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../assets/logos/quality-hi-tech-main.svg";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { FaPhone, FaSignInAlt, FaSignOutAlt } from "react-icons/fa";
import "../css/header.css";

const Header = ({ isLoggedIn, onLogin, onLogout }) => {
  const onClick = () => window.scrollTo(0, 0);
  const isMobile = useMediaQuery("(max-width: 880px)");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const headerRef = useRef(null);
  const navigate = useNavigate();

  const toggleMenu = useCallback(() => {
    setIsMenuOpen((prev) => !prev);
    window.scrollTo(0, 0);
  }, []);

  const handleLoginLogout = () => {
    if (isLoggedIn) {
      onLogout();
    } else {
      navigate('/admin');
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (headerRef.current && !headerRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="site-header" ref={headerRef}>
      <div className="header-content">
        <Link
          to="/"
          className="header-logo"
          onClick={onClick}
          aria-label="Home page"
        >
          <img src={Logo} alt="Quality Hi-Tech Carpet Cleaning Logo" />
        </Link>
        {isMobile ? (
          <button
            className={`menu-toggle ${isMenuOpen ? "open" : ""}`}
            onClick={toggleMenu}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
          >
            <span className="burger-icon">
              <span className="burger-line"></span>
              <span className="burger-line"></span>
              <span className="burger-line"></span>
            </span>
            <span className="visually-hidden">
              {isMenuOpen ? "Close menu" : "Open menu"}
            </span>
          </button>
        ) : (
          <nav className="header-nav" aria-label="Main Navigation">
            <ul>
              <li>
                <Link to="/" onClick={onClick} data-testid="home-link">
                  Home
                </Link>
              </li>
              <div className="header-line"></div>
              <li>
                <Link to="/services" onClick={onClick} data-testid="services-link">
                  Services
                </Link>
              </li>
              <div className="header-line"></div>
              <li>
                <Link to="/about" onClick={onClick} data-testid="about-link">
                  About
                </Link>
              </li>
              <div className="header-line"></div>
              <li>
                <a href="tel:8132256515" rel="noopener noreferrer" aria-label="Call us">
                  <FaPhone className="icon" />
                  <span>(813) 225-6515</span>
                </a>
              </li>
              <div className="header-line"></div>
              <li>
                <button onClick={handleLoginLogout} className="login-logout-btn">
                  {isLoggedIn ? (
                    <>
                      <FaSignOutAlt className="icon" />
                      <span>Logout</span>
                    </>
                  ) : (
                    <>
                      <FaSignInAlt className="icon" />
                      {/* <span>Admin</span> */}
                    </>
                  )}
                </button>
              </li>
            </ul>
          </nav>
        )}
      </div>
      {isMobile && isMenuOpen && (
        <nav id="mobile-menu" className="mobile-nav" aria-label="Mobile Navigation">
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
              <a href="tel:8132256515" rel="noopener noreferrer" aria-label="Call us">
                <FaPhone className="icon" />
                <span>(813) 225-6515</span>
              </a>
            </li>
            <li>
              <button onClick={() => { handleLoginLogout(); toggleMenu(); }} className="login-logout-btn">
                {isLoggedIn ? (
                  <>
                    <FaSignOutAlt className="icon" />
                    <span>Logout</span>
                  </>
                ) : (
                  <>
                    <FaSignInAlt className="icon" />
                    <span>Admin</span>
                  </>
                )}
              </button>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
};

export default Header;