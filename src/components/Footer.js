import * as React from "react";
import "./Footer.css";
import Form from "./Footer-Comp/form_page";
import Details from "./Footer-Comp/details_page";
import Nav from "./Footer-Comp/footer_nav_socials";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-section footer-nav">
        <h2 className="component-title">What can we build for you?</h2>
        <Nav />
      </div>
      <div className="footer-section footer-form">
        <h2 className="component-title">Contact Us</h2>
        <Form />
      </div>
      <div className="footer-section footer-contact">
        <h2 className="component-title">Contact Info</h2>
        <Details />
      </div>
    </footer>
  );
};

export default Footer;
