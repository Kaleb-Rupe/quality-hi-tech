import React, { Suspense } from "react";
import Header from "../shared/Header";
import Footer from "../shared/Footer";
import ErrorBoundary from "../shared/error-boundary";
import LoadingFallback from "../shared/loading-fallback";
import PropTypes from "prop-types";
import "../css/layout.css";

const Layout = ({ children }) => (
  <ErrorBoundary>
    <div className="layout">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <Header />
      <Suspense fallback={<LoadingFallback />}>
        <main id="main-content" className="main-content">
          {children}
        </main>
      </Suspense>
      <Footer />
    </div>
  </ErrorBoundary>
);

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Layout;