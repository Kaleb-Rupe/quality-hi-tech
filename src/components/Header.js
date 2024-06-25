import React, { useState, useCallback, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Logo from "../assets/logos/Santa-Cruz-Construction-font-large-bold.png";
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
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  const toggleMenu = useCallback(() => {
    setMenuOpen((prev) => !prev);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 0);
    };

    const handleClickOutside = (event) => {
      if (
        menuOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        !buttonRef.current.contains(event.target)
      ) {
        setMenuOpen(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

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
          ref={buttonRef}
        >
          <span className="hamburger"></span>
          <span className="hamburger"></span>
          <span className="hamburger"></span>
        </button>
        <div className="header-logo">
          <Link to="/" id="logo" onClick={() => window.scrollTo(0, 0)}>
            <img src={Logo} alt="Santa Cruz Sun LLC Logo" />
          </Link>
          {/* <h1 className="site-title">Santa Cruz Sun</h1> */}
        </div>

        <nav ref={menuRef} className={`header-nav ${menuOpen ? "open" : ""}`}>
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
