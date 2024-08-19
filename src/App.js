import React from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./pages/Layout.js";
import ErrorPage from "./pages/error-page.js";
import Home from "./pages/Home.js";
import Services from "./pages/gallery.js";
import About from "./pages/about.js";
import ContactForm from "./pages/contact.js";
import "./css/app.css";

const App = () => (
  <Layout>
    <Routes>
      <Route path="/" element={<Home />} key="home" />
      <Route path="/services" element={<Services />} key="services" />
      <Route path="/about" element={<About />} key="about" />
      <Route path="/contact" element={<ContactForm />} key="contact" />
      <Route path="*" element={<ErrorPage />} key="error" />
    </Routes>
  </Layout>
);

export default React.memo(App);