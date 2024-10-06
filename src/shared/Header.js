import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../components/AuthContext";
import Logo from "../assets/logos/quality-hi-tech-main.svg";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { FaPhone, FaSignInAlt, FaSignOutAlt } from "react-icons/fa";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Toast } from "primereact/toast";
import "../css/header.css";

const Header = () => {
  const onClick = () => window.scrollTo(0, 0);
  const isMobile = useMediaQuery("(max-width: 880px)");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const headerRef = useRef(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const toast = React.useRef(null);

  const phone = process.env.REACT_APP_CONTACT_PHONE;

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleLogout = async () => {
    try {
      await logout();
      toast.current.show({
        severity: "success",
        summary: "Logged Out",
        detail: "You have been successfully logged out.",
      });
    } catch (error) {
      console.error("Logout error:", error);
      toast.current.show({
        severity: "error",
        summary: "Logout Error",
        detail: "An error occurred during logout. Please try again.",
      });
    }
  };

  const handleLogoutConfirmation = () => {
    if (user) {
      confirmDialog({
        message: "Are you sure you want to log out?",
        header: "Logout Confirmation",
        icon: "pi pi-exclamation-triangle",
        accept: handleLogout,
        reject: () => {
          // Do nothing if the user cancels
        },
      });
    } else {
      navigate("/admin");
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
      <Toast ref={toast} position="top-right" />
      <ConfirmDialog />
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
                <Link
                  to="/services"
                  onClick={onClick}
                  data-testid="services-link"
                >
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
              {!user && (
                <>
                  <li>
                    <a
                      href={`tel:${phone}`}
                      rel="noopener noreferrer"
                      aria-label="Call us"
                    >
                      <FaPhone className="icon" />
                      <span>Call For A Quote</span>
                    </a>
                  </li>
                  <div className="header-line"></div>
                </>
              )}
              {user && (
                <li>
                  <Link to="/admin" onClick={toggleMenu}>
                    Dashboard
                  </Link>
                </li>
              )}
              <li>
                {user ? (
                  <>
                    <button
                      onClick={handleLogoutConfirmation}
                      className="login-logout-btn"
                    >
                      <FaSignOutAlt className="icon" />
                      <span>Logout</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleLogoutConfirmation}
                      className="login-logout-btn"
                    >
                      <FaSignInAlt className="icon" />
                    </button>
                  </>
                )}
              </li>
            </ul>
          </nav>
        )}
      </div>
      {isMobile && isMenuOpen && (
        <nav
          id="mobile-menu"
          className="mobile-nav"
          aria-label="Mobile Navigation"
        >
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
            {!user && (
              <>
                <li>
                  <a
                    href={`tel:${phone}`}
                    rel="noopener noreferrer"
                    aria-label="Call us"
                  >
                    <FaPhone className="icon" />
                    <span>Call For A Quote</span>
                  </a>
                </li>
              </>
            )}
            {user && (
              <li>
                <Link to="/admin" onClick={toggleMenu}>
                  Back to Dashboard
                </Link>
              </li>
            )}
            <li>
              {user ? (
                <>
                  <button
                    onClick={() => {
                      handleLogoutConfirmation();
                      toggleMenu();
                    }}
                    className="login-logout-btn"
                  >
                    <FaSignOutAlt className="icon" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      handleLogoutConfirmation();
                      toggleMenu();
                    }}
                    className="login-logout-btn"
                  >
                    <FaSignInAlt className="icon" />
                  </button>
                </>
              )}
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
};

export default Header;
