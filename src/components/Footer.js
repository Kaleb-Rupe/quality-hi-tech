import React, { lazy, Suspense } from "react";
import "./Footer.css";
import Details from "./Footer-Comp/details_page";
import Nav from "./Footer-Comp/footer_nav_socials";

const LazyForm = lazy(() => import("./Footer-Comp/form_page"));

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
