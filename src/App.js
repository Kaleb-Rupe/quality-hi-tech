import React, { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout.js";
import "./css/app.css";

const Home = lazy(() => import("./pages/Home.js"));
const Gallery = lazy(() => import("./pages/gallery.js"));
const About = lazy(() => import("./pages/about.js"));
const ContactForm = lazy(() => import("./pages/contact.js"));
const Login = lazy(() => import("./components/login.js"));
const ErrorPage = lazy(() => import("./pages/error-page.js"));

const App = () => (
  <Layout>
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<ContactForm />} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </Suspense>
  </Layout>
);

export default App;
