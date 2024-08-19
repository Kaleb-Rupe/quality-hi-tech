import React from "react";
import { services } from "./services-list";
import "../../css/services.css";

const ServiceItem = () => {

  return (
    <div className="services-page">
      <section className="our-services">
        <h2>Our Services</h2>
        <p>
          We offer a comprehensive range of services for both residential and
          commercial clients:
        </p>
        <div className="services-grid">
          {services.map((service, index) => (
            <div key={index} className="service-item">
              <h3>{service.title}</h3>
              <p>{service.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
  }

export default React.memo(ServiceItem);