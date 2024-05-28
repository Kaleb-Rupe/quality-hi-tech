import React, { useState } from "react";
import MobileDetect from "mobile-detect";
import { FaEnvelope, FaPhone } from "react-icons/fa";
import { GrLocation } from "react-icons/gr";
import Logo from "../assets/images/logo.JPG";
import "./details_page.css";

const Details = () => {
  const [mapsLink, setMapsLink] = useState("");

  // Saved info for email link.
  const subject = encodeURIComponent("Inquiry here!");
  const body = encodeURIComponent(
    "Put your inquiries or questions here. We will get back to you asap."
  );
  const email = "kalebrupe17@gmail.com";
  const href = `mailto:${email}?subject=${subject}&body=${body}`;

  // Saved info for Maps
  const address = "219 B St, Coos Bay, OR 97420, United States";
  const latitude = 43.36725;
  const longitude = -124.19758;

  const getOS = () => {
    // Use the navigator.userAgent property to get the user agent string
    const userAgent = window.navigator.userAgent || window.opera;
    // Create a new instance of the MobileDetect class
    const md = new MobileDetect();
    // Split the user agent string by spaces to get the operating system
    const os = userAgent.split(" ")[1];

    // Windows Phone must come first because its UA also contains "Android"
    if (os.includes("Windows")) {
      return "Windows";
    } else if (os.includes("Macintosh")) {
      return "Macintosh";
    } else if (md.os("windows") && !window.MSStream) {
      return "windows";
    } else if (md.os("mac")) {
      return "mac";
    } else {
      return "unknown";
    }
  };

  const handleClick = async () => {
    const os = getOS();

    let link;
    if (os === "Macintosh" || "mac") {
      link = `https://maps.apple.com/?ll=${latitude},${longitude}&q=${encodeURIComponent(
        address
      )}`;
    } else if (os === "Windows" || "windows") {
      link = `geo:${latitude},${longitude}?q=${encodeURIComponent(address)}`;
    } else {
      link = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    }

    setMapsLink(link);

    // Delay the navigation to ensure state is updated
    setTimeout(() => {
      window.location.href = link;
    }, 100);
  };

  return (
    <>
      <div className="center">
        <img alt="Sun Setting with the Ocean" className="photo" src={Logo} />
        <h1>Santa Cruz Sun</h1>
        <p>Contractor</p>
      </div>

      <div className="details-container">
        <div className="contact-links">
          <h3>Physical Address:</h3>
          <address>
            <a
              href={mapsLink || "#"}
              onClick={(e) => {
                if (!mapsLink) {
                  e.preventDefault();
                  handleClick();
                }
              }}
            >
              <GrLocation className="icon" />
              219 B Street
              <br />
              Coos Bay, OR 97420
            </a>
          </address>

          <h3>Email:</h3>
          <a href={href} target="_blank" rel="noopener noreferrer">
            <FaEnvelope className="icon" />
            <span>
              <p>Send Email</p>
            </span>
          </a>

          <h3>Phone:</h3>
          <a href="tel:555-555-5555" rel="noreopener noreferrer">
            <FaPhone className="icon" />
            <span>
              <p>(555) 555-5555</p>
            </span>
          </a>
        </div>
      </div>
    </>
  );
};

export default Details;
