import React, { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./pages/Layout.js";
import LoadingFallback from "./shared/loading-fallback.jsx";
import ErrorPage from "./pages/error-page.js";
import "./css/app.css";

const Home = lazy(() => import("./pages/Home.js"));
const Services = lazy(() => import("./pages/gallery.js"));
const About = lazy(() => import("./pages/about.js"));
const ContactForm = lazy(() => import("./pages/contact.js"));

const App = () => (
  <Layout>
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/" element={<Home />} key="home" />
        <Route path="/services" element={<Services />} key="services" />
        <Route path="/about" element={<About />} key="about" />
        <Route path="/contact" element={<ContactForm />} key="contact" />
        <Route path="*" element={<ErrorPage />} key="error" />
      </Routes>
    </Suspense>
  </Layout>
);

export default React.memo(App);
