import React from "react";
import "../../css/testimonials.css";

const Testimonials = () => {
  return (
    <section className="testimonials">
      <h2>What Our Clients Say</h2>
      <div className="testimonial-cards">
        <div className="testimonial-card">
          <p>"Excellent work! Highly recommend."</p>
          <h3>- Carlton Arms Management</h3>
        </div>
        <div className="testimonial-card">
          <p>"Professional and reliable service."</p>
          <h3>- Kaleb Rupe</h3>
        </div>
        <div className="testimonial-card">
          <p>"Transformed our home beyond expectations."</p>
          <h3>- Mark Wilson</h3>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
