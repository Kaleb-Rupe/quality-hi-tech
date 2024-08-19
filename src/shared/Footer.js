import React, { lazy, Suspense } from "react";
import "../css/footer.css";
import Details from "../components/Footer/details-page";
import Nav from "../components/Footer/footer-nav-socials";
import { useMediaQuery } from "../hooks/useMediaQuery";
import ErrorBoundary from "./error-boundary";

const LazyForm = lazy(() => import("../components/Footer/contact-form"));

const Footer = () => {
  const isMobile = useMediaQuery("(max-width: 1080px)");

  return (
    <footer className="footer" role="contentinfo">
      <div className={isMobile ? "footer-mobile" : "footer-desktop"}>
        <div className="footer-section footer-contact">
          <h2 className="component-title">Contact Info</h2>
          <Details />
        </div>
        {!isMobile && (
          <div className="footer-section footer-form">
            <ErrorBoundary
              fallback={
                <div aria-live="polite">
                  Error loading form. Please try again later.
                </div>
              }
            >
              <Suspense
                fallback={<div aria-live="polite">Loading form...</div>}
              >
                <LazyForm />
              </Suspense>
            </ErrorBoundary>
          </div>
        )}
        <div className="footer-section footer-nav">
          <h2 className="component-title bottom-margin">
            What can we clean for you?
          </h2>
          <Nav />
        </div>
      </div>
      <div className="footer-copy">
        <p>
          &copy; {new Date().getFullYear()} Quality Hi Tech Carpet Cleaning. All
          rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default React.memo(Footer);
