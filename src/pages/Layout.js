import React from "react";
import Header from "../shared/Header";
import Footer from "../shared/Footer";
import ErrorBoundary from "../shared/error-boundary";
import PropTypes from "prop-types";
import "../css/layout.css";

const Layout = ({ children }) => (
  <div className="layout">
    <a href="#main-content" className="skip-link">
      Skip to main content
    </a>
    <Header />
    <ErrorBoundary>
      <main id="main-content" className="main-content">
        {children}
      </main>
    </ErrorBoundary>
    <Footer />
  </div>
);

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Layout;
