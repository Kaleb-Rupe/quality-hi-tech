import React from "react";
import Details from "./Footer-Comp/details_page";
import Form from "./Footer-Comp/form_page";
// import FooterMap from "./Footer-Comp/google_maps";

const Footer = () => {
  return (
    <>
      <footer>
        <Details />
        <Form />
        {/* <FooterMap /> */}
      </footer>
    </>
  );
};

export default Footer;
