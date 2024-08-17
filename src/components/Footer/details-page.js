import React, { useCallback, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaEnvelope, FaPhone } from "react-icons/fa";
import { GrLocation } from "react-icons/gr";
import Logo from "../../assets/logos/quality-hi-tech-large.png";
import "../../css/details-page.css";

const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(window.matchMedia(query).matches);

  useEffect(() => {
    const mediaQueryList = window.matchMedia(query);
    const documentChangeHandler = () => setMatches(mediaQueryList.matches);

    mediaQueryList.addEventListener("change", documentChangeHandler);

    return () => {
      mediaQueryList.removeEventListener("change", documentChangeHandler);
    };
  }, [query]);

  return matches;
};

const Details = () => {
  const isMobile = useMediaQuery("(max-width: 844px)");
  const email = "qhtm58@yahoo.com";
  const subject = encodeURIComponent("Inquiry here!");
  const body = encodeURIComponent(
    "Put your inquiries or questions here. We will get back to you asap."
  );
  const mailtoHref = `mailto:${email}?subject=${subject}&body=${body}`;

  const address = "P.O. Box 1243, Land O' Lakes, FL 34639, United States";
  const latitude = 28.2323;
  const longitude = -82.4657;

  const handleMapClick = useCallback(
    (event) => {
      event.preventDefault();
      const userAgent = navigator.userAgent.toLowerCase();
      let mapsUrl;

      if (
        userAgent.includes("mac os x") ||
        userAgent.includes("iphone") ||
        userAgent.includes("ipad")
      ) {
        mapsUrl = `maps://maps.apple.com/?ll=${latitude},${longitude}&q=${encodeURIComponent(
          address
        )}`;
      } else if (userAgent.includes("android")) {
        mapsUrl = `geo:${latitude},${longitude}?q=${encodeURIComponent(
          address
        )}`;
      } else {
        mapsUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
      }

      window.location.href = mapsUrl;
    },
    [address, latitude, longitude]
  );

  return (
    <section className="details-container">
      <div className="center">
        <a href="/" id="bottle">
          <img src={Logo} alt="Quality Hi Tech Logo" className="photo" />
        </a>

        {isMobile && (
            <Link id="link" to="/contact" onClick={() => window.scrollTo(0, 0)}>
              <button aria-label="Get a free estimate">Free Estimate</button>
            </Link>
        )}

        {/* <h1>Quality Hi-Tech</h1> */}
        <p>Insured</p>
      </div>

      <div className="contact-links">
        <h3>Physical Address:</h3>
        <address>
          <a
            href="/"
            onClick={handleMapClick}
            rel="noopener noreferrer"
            aria-label="View our location on map"
          >
            <GrLocation className="icon" />
            P.O. Box 1243
            <br />
            Land O' Lakes, FL 34639
          </a>
        </address>

        <h3>Email:</h3>
        <a
          href={mailtoHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Send us an email"
        >
          <FaEnvelope className="icon" />
          <span>Send Email</span>
        </a>

        <h3>Phone:</h3>
        <a href="tel:8132256515" rel="noopener noreferrer" aria-label="Call us">
          <FaPhone className="icon" />
          <span>(813) 225-6515</span>
        </a>
      </div>
    </section>
  );
};

export default React.memo(Details);