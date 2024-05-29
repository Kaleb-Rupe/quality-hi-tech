import React from "react";
import { Routes, Route } from "react-router-dom";
import { Home } from "./pages/Home";
import { Services } from "./pages/Services";
import About from "./pages/About";
import Contact from "./pages/Contact";
import { ErrorPage } from "./pages/ErrorPage";
import { Header } from "./components/Header";
import Footer from "./components/Footer";
import { Gallery } from "./pages/Gallery";
import { Login } from "./pages/Login";
import "./App.css";

const App = () => {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<Services />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<ErrorPage />} />
      </Routes>
      <Footer />
    </>
  );
};

export default App;
