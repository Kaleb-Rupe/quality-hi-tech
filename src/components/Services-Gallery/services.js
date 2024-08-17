import React, { useState, useRef, useEffect } from "react";
import "../../css/services.css";

const ServiceItem = React.memo(({ service, isExpanded, onClick }) => (
  <div
    className={`service-item ${isExpanded ? "expanded" : ""}`}
    onClick={onClick}
    tabIndex={0}
    role="button"
    aria-expanded={isExpanded}
    onKeyDown={(e) => e.key === "Enter" && onClick()}
  >
    <div className="service-header">
      <h3>{service.title}</h3>
      <span className="service-arrow">&#9656;</span>
    </div>
    <div className="service-description" aria-hidden={!isExpanded}>
      <p>{service.description}</p>
    </div>
  </div>
));

const Services = ({ services }) => {
  const [expandedServiceId, setExpandedServiceId] = useState(null);
  const servicesSectionRef = useRef(null);

  const toggleService = (id) => {
    setExpandedServiceId(prevId => prevId === id ? null : id);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        servicesSectionRef.current &&
        !servicesSectionRef.current.contains(event.target)
      ) {
        setExpandedServiceId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <section className="services-section" ref={servicesSectionRef}>
      <h2>Our Services</h2>
      <div className="services-grid">
        {services.map((service) => (
          <ServiceItem
            key={service.id}
            service={service}
            isExpanded={expandedServiceId === service.id}
            onClick={() => toggleService(service.id)}
          />
        ))}
      </div>
    </section>
  );
};

export default React.memo(Services);