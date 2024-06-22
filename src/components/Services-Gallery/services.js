import React, { useState, useRef, useEffect } from "react";

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
    <div className="service-description">
      <p>{service.description}</p>
    </div>
  </div>
));

const Services = ({ services }) => {
  const [expandedService, setExpandedService] = useState(null);
  const servicesSectionRef = useRef(null);

  const toggleService = (index) => {
    setExpandedService(expandedService === index ? null : index);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        servicesSectionRef.current &&
        !servicesSectionRef.current.contains(event.target)
      ) {
        setExpandedService(null);
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
        {services.map((service, index) => (
          <ServiceItem
            key={index}
            service={service}
            isExpanded={expandedService === index}
            onClick={() => toggleService(index)}
          />
        ))}
      </div>
    </section>
  );
};

export default React.memo(Services);
