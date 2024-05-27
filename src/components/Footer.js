import React from "react";
import "./Footer.css";
import Form from "./Footer-Comp/form_page";
import Details from "./Footer-Comp/details_page";
import Nav from "./Footer-Comp/footer_nav_socials";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-section footer-nav">
        <h3>Links</h3>
        <Nav />
      </div>
      <div className="footer-section footer-form">
        <h3>Contact Us</h3>
        <Form />
      </div>
      <div className="footer-section footer-contact">
        <h3>Contact Info</h3>
        <Details />
      </div>
    </footer>
  );
};

export default Footer;
