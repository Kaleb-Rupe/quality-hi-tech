import React from "react";
import Form from "../components/Footer/contact-form";
import "../css/contact.css";

const ContactForm = () => {
  return (
    <div className="wrapper-contact">
      <div className="contact-container">
        <Form />
      </div>
    </div>
  );
};

export default React.memo(ContactForm);
