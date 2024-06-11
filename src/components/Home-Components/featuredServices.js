import React from "react";
import "./services.css";

const featuredServices = () => {
  return (
    <section className="services">
      <h2>Our Services</h2>
      <div className="service-cards">
        <div className="service-card">
          <h3>Renovations</h3>
          <p>High-quality renovations to transform your space.</p>
        </div>
        <div className="service-card">
          <h3>New Construction</h3>
          <p>Building new structures with precision and expertise.</p>
        </div>
        <div className="service-card">
          <h3>Project Management</h3>
          <p>End-to-end project management for a seamless experience.</p>
        </div>
      </div>
    </section>
  );
};

export default featuredServices;
