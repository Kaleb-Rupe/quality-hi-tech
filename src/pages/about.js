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