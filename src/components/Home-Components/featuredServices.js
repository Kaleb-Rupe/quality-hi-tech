import React from "react";
import "./services.css";

const featuredServices = () => {
  return (
    <section className="services">
      <h2>Our Services</h2>
      <div className="service-cards">
      <div className="service-card">
          <h3>Kitchen Remodels</h3>
          <p>Update your kitchen with a custom hood and new cabinets!</p>
        </div>
        <div className="service-card">
          <h3>Decks</h3>
          <p>BBQ season is here! Let us build an outdoor haven for your family!</p>
        </div>
        <div className="service-card">
          <h3>She-Sheds/Mancaves</h3>
          <p>Let us build a private retreat!</p>
        </div>
      </div>
    </section>
  );
};

export default featuredServices;
