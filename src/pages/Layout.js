import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PropTypes from "prop-types";

const Layout = ({ children }) => (

  <React.Fragment>
    <Header />
    <main>{children}</main>
    <Footer />
  </React.Fragment>
);

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Layout;
