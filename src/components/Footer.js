import React, { lazy, Suspense } from "react";
import "../css/footer.css";
import Details from "./Footer/details-page";
import Nav from "./Footer/footer-nav-socials";

const LazyForm = lazy(() => import("./Footer/contact-form-page"));

const Footer = React.memo(() => {
  return (
    <footer className="footer">
      <div className="footer-section footer-nav">
        <h2 className="component-title">What can we build for you?</h2>
        <Nav />
      </div>
      <div className="footer-section footer-form">
        <h2 className="component-title">Contact Us</h2>
        <Suspense fallback={<div>Loading form...</div>}>
          <LazyForm />
        </Suspense>
      </div>
      <div className="footer-section footer-contact">
        <h2 className="component-title">Contact Info</h2>
        <Details />
      </div>
    </footer>
  );
});

export default Footer;
