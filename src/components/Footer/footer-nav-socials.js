import React, { lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import "../../css/footer-nav-socials.css";

const LazyFacebookIcon = lazy(() => import("./FacebookIcon"));

const Nav = () => {
  const onClick = () => window.scrollTo(0, 0);

  return (
    <div className="nav-container">
      <nav className="nav-links">
        <ul>
          <li>
            <Link to="/" onClick={onClick}>
              Home
            </Link>
          </li>
          <li>
            <Link to="/services" onClick={onClick}>
              Services & Photos
            </Link>
          </li>
          <li>
            <Link to="/about" onClick={onClick}>
              About
            </Link>
          </li>
        </ul>
      </nav>

      <p className="social-title">Check Us Out On Facebook!</p>
      <div className="nav-social">
        <a
          href="https://www.facebook.com/profile.php?id=100092280827323"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Facebook"
        >
          <Suspense fallback={<div>Loading...</div>}>
            <LazyFacebookIcon />
          </Suspense>
        </a>
      </div>

      <div className="hours-of-operation">
        <h3>Hours of Operation:</h3>
        <p>
          Monday-Friday:
          <br />
          9:00 AM - 6:00 PM
        </p>
        <p>
          Saturday & Sunday:
          <br />
          By Appointment Only
        </p>
      </div>
    </div>
  );
};

export default React.memo(Nav);
