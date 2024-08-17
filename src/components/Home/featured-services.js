import React from "react";
import { featuredServices } from "../../data/services";
import "../../css/featured-services.css";

const FeaturedServices = () => {
  return (
    <section className="services" aria-labelledby="services-title">
      <h2 id="services-title">Our Services</h2>
      <ul className="service-cards">
        {featuredServices.map((service) => (
          <li key={service.id} className="service-card">
            <h3>{service.title}</h3>
            <p>{service.description}</p>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default FeaturedServices;