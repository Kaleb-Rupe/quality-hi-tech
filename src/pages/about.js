import React from "react";
import "../css/about.css";

const TeamMember = ({ name, role, description }) => (
  <div className="team-member">
    <h3>{name}</h3>
    <p className="role">{role}</p>
    <p>{description}</p>
  </div>
);

const About = () => {
  const services = [
    {
      title: "Carpet Cleaning and Maintenance (Residential & Commercial)",
      icon: "fa-broom",
      description: "Our expert technicians use state-of-the-art equipment and eco-friendly cleaning solutions to leave your carpets looking like new.",
    },
    {
      title: "Upholstery Cleaning (Sofas, Chairs, etc.)",
      icon: "fa-couch",
      description: "We use specialized cleaning methods and products to gently remove dirt and stains from your upholstered furniture.",
    },
    {
      title: "Tile and Grout Cleaning (Porcelain, Ceramic, Marble, Granite, Quartz, etc.)",
      icon: "fa-tile",
      description: "Our advanced cleaning technology and specialized cleaning solutions make quick work of dirt and grime on your tile and grout.",
    },
    {
      title: "Pet Odor Removal (Residential & Commercial)",
      icon: "fa-paw",
      description: "We use a combination of specialized cleaning products and odor-neutralizing treatments to eliminate pet odors from your carpets and upholstery.",
    },
    {
      title: "Water Damage Restoration (Residential & Commercial)",
      icon: "fa-water",
      description: "Our team is trained to quickly respond to water damage emergencies, extracting water and drying your property to prevent further damage.",
    },
    {
      title: "Commercial Carpet Cleaning Solutions (Restaurants, Offices, Schools, Retail Stores, etc.)",
      icon: "fa-building",
      description: "We offer customized commercial carpet cleaning solutions to meet the unique needs of your business, ensuring a clean and healthy environment for your employees and customers.",
    },
    {
      title: "Stripping and Waxing Terrazzo Floors (Marble, Granite, Quartz, etc.)",
      icon: "fa-hammer",
      description: "Our experienced technicians use specialized equipment and techniques to strip and wax your terrazzo floors, restoring their original shine and luster.",
    },
    {
      title: "Power Stretching Carpets(Residential & Commercial)",
      icon: "fa-arrows-alt-h",
      description: "We use specialized equipment to stretch and re-tension your carpets, removing wrinkles and creases for a like-new appearance.",
    },
    {
      title: "Repair & Patching Carpets(Residential & Commercial)",
      icon: "fa-seedling",
      description: "Our skilled technicians can repair and patch damaged areas of your carpet, extending its lifespan and saving you money.",
    },
  ];

  return (
    <div className="about-page">
      <section className="about-intro">
        <h1>About Quality Hi Tech Carpet Cleaning</h1>
        <p>
          Since 1993, Quality Hi Tech Carpet Cleaning has been the trusted name
          in carpet cleaning and restoration services for both residential and
          commercial clients in Pasco County, FL. With nearly three decades of
          experience, we've built a reputation for excellence, reliability, and
          customer satisfaction.
        </p>
      </section>

      <section className="our-mission">
        <h2>Our Mission</h2>
        <p>
          We are dedicated to providing top-quality carpet cleaning and
          restoration services that exceed our clients' expectations. By using
          cutting-edge technology, we deliver exceptional results for both homes
          and businesses, ensuring a healthier and more comfortable environment
          for all our customers.
        </p>
      </section>

      <section className="our-services">
        <h2>Our Services</h2>
        <p>
          We offer a comprehensive range of services for both residential and
          commercial clients:
        </p>
        <div className="services-grid">
          {services.map((service, index) => (
            <div key={index} className="service-item">
              <i className={`fas ${service.icon}`}></i>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="our-team">
        <h2>Our Team</h2>
        <div className="team-members">
          <TeamMember
            name="Mike Messenger"
            role="Founder & Lead Technician"
            description="With over 48 years of experience in the industry, Mike founded Quality Hi Tech in 1993 and continues to lead our team with his expertise and commitment to quality."
          />
        </div>
      </section>

      <section className="our-values">
        <h2>Our Values</h2>
        <ul>
          <li>Quality craftsmanship in every job</li>
          <li>Customer satisfaction as our top priority</li>
          <li>Eco-friendly and safe cleaning practices</li>
          <li>Continuous learning and improvement</li>
          <li>Integrity and transparency in all our dealings</li>
          <li>Commitment to both residential and commercial excellence</li>
        </ul>
      </section>
    </div>
  );
};

export default About;