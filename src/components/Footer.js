import React, { lazy, Suspense, useState, useEffect } from "react";
import "../css/footer.css";
import Details from "./Footer/details-page";
import Nav from "./Footer/footer-nav-socials";

const LazyForm = lazy(() => import("./Footer/contact-form-page"));

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

const Footer = React.memo(() => {
  const isMobile = useMediaQuery("(max-width: 844px)");

  return (
    <footer className="footer">
      <div className={isMobile ? "footer-mobile" : "footer-desktop"}>
        <div className="footer-section footer-contact">
          <h2 className="component-title">Contact Info</h2>
          <Details />
        </div>
        {!isMobile && (
          <div className="footer-section footer-form">
            <h2 className="component-title">Contact Us</h2>
            <Suspense fallback={<div>Loading form...</div>}>
              <LazyForm />
            </Suspense>
          </div>
        )}
        <div className="footer-section footer-nav">
          <h2 className="component-title bottom-margin">What can we build for you?</h2>
          <Nav />
        </div>
      </div>
      <div className="footer-copy">
        <p>
          &copy; {new Date().getFullYear()} Santa Cruz Sun LLC. All rights
          reserved.
        </p>
      </div>
    </footer>
  );
});

export default Footer;
