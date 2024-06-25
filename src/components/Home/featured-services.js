import React from "react";
import "../../css/featured-services.css";

const services = [
  {
    title: "Kitchen Remodels",
    description: "Update your kitchen with a custom hood and new cabinets!",
  },
  {
    title: "Decks",
    description:
      "BBQ season is here! Let us build an outdoor haven for your family!",
  },
  {
    title: "She-Sheds/Mancaves",
    description: "Let us build a private retreat!",
  },
];

const FeaturedServices = () => {
  return (
    <section className="services">
      <h2>Our Services</h2>
      <div className="service-cards">
        {services.map((service, index) => (
          <div key={index} className="service-card">
            <h3>{service.title}</h3>
            <p>{service.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturedServices;
