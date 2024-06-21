import React from "react";
import "./testimonials.css";

export const Testimonials = () => {
  return (
    <section className="testimonials">
      <h2>What Our Clients Say</h2>
      <div className="testimonial-cards">
        <div className="testimonial-card">
          <p>"Excellent work! Highly recommend."</p>
          <h3>- John Doe</h3>
        </div>
        <div className="testimonial-card">
          <p>"Professional and reliable service."</p>
          <h3>- Jane Smith</h3>
        </div>
        <div className="testimonial-card">
          <p>"Transformed our home beyond expectations."</p>
          <h3>- Mark Wilson</h3>
        </div>
      </div>
    </section>
  );
};
