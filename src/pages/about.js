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
  return (
    <div className="about-page">
      <section className="about-intro">
        <h1>About Santa Cruz Sun LLC</h1>
        <p>
          Santa Cruz Sun LLC is a leading construction and renovation company
          serving the Santa Cruz area. With years of experience and a commitment
          to quality, we transform spaces and build dreams for our clients.
        </p>
      </section>

      <section className="our-mission">
        <h2>Our Mission</h2>
        <p>
          Our mission is to provide top-quality construction and renovation
          services that exceed our clients' expectations. We are dedicated to
          using sustainable practices and innovative techniques to create
          beautiful, functional spaces that stand the test of time.
        </p>
      </section>

      <section className="our-team">
        <h2>Our Team</h2>
        <div className="team-members">
          <TeamMember
            name="John Doe"
            role="Founder & Lead Contractor"
            description="John has over 20 years of experience in the construction industry and is passionate about creating beautiful, functional spaces."
          />
          <TeamMember
            name="Jane Smith"
            role="Interior Designer"
            description="Jane brings a keen eye for design and helps our clients visualize their dream spaces before we bring them to life."
          />
          {/* Add more team members as needed */}
        </div>
      </section>

      <section className="our-values">
        <h2>Our Values</h2>
        <ul>
          <li>Quality craftsmanship</li>
          <li>Customer satisfaction</li>
          <li>Sustainable practices</li>
          <li>Innovation in design and construction</li>
          <li>Integrity in all our dealings</li>
        </ul>
      </section>
    </div>
  );
};

export default About;