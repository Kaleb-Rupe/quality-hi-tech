import React, { useState, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import Logo from "../assets/images/logo.JPG";
import "../css/header.css";

const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(window.matchMedia(query).matches);

  useEffect(() => {
    const mediaQueryList = window.matchMedia(query);
    const documentChangeHandler = () => setMatches(mediaQueryList.matches);

    mediaQueryList.addEventListener("change", documentChangeHandler);

    return () => {
      mediaQueryList.removeEventListener("change", documentChangeHandler);
    };
  }, [query]);

  return matches;
};

const Header = () => {
  const isMobile = useMediaQuery("(max-width: 1180px)");
  const [menuOpen, setMenuOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);

  const toggleMenu = useCallback(() => {
    setMenuOpen((prev) => !prev);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const onClick = () => {
    setMenuOpen(false);
    window.scrollTo(0, 0);
  };

  return (
    <header id="masthead" className={`site-header ${isSticky ? "sticky" : ""}`}>
      <div className="header-content">
        <button
          className={`menu-toggle ${menuOpen ? "open" : ""}`}
          onClick={toggleMenu}
          aria-expanded={menuOpen}
          aria-label="Toggle navigation menu"
        >
          <span className="hamburger"></span>
          <span className="hamburger"></span>
          <span className="hamburger"></span>
        </button>
        <div className="header-logo">
          <Link to="/" id="logo" onClick={() => window.scrollTo(0, 0)}>
            <img src={Logo} alt="Santa Cruz Sun LLC Logo" />
          </Link>
          <h1 className="site-title">Santa Cruz Sun</h1>
        </div>

        <nav className={`header-nav ${menuOpen ? "open" : ""}`}>
          <ul>
            <li>
              <Link to="/" onClick={onClick}>
                Home
              </Link>
            </li>
            <li>
              <Link to="/gallery" onClick={onClick}>
                Services & Photos
              </Link>
            </li>
            <li>
              <Link to="/about" onClick={onClick}>
                About
              </Link>
            </li>
            <li>
              <Link to="/contact" onClick={onClick}>
                Contact
              </Link>
            </li>
            {!isMobile ? (
              <li>
                <div className="login-button">
                  <Link to="/login" onClick={onClick}>
                    Login
                  </Link>
                </div>
              </li>
            ) : null}
          </ul>
        </nav>
        {isMobile ? (
          <div className="login-button">
            <Link to="/login" onClick={onClick}>
              Login
            </Link>
          </div>
        ) : null}
      </div>
    </header>
  );
};

export default React.memo(Header);
