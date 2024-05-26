import React, { useState } from "react";
import MobileDetect from "mobile-detect";

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
      <h1>Santa Cruz Sun</h1>
      <p>Contractor</p>
      <div>
        <nav>
          <address style={{ padding: "20px" }}>
            <a
              href={mapsLink || "#"}
              onClick={(e) => {
                if (!mapsLink) {
                  e.preventDefault();
                  handleClick();
                }
              }}
              style={{ color: "blue", textDecoration: "underline" }}
            >
              219 B Street
              <br />
              Coos Bay, OR 97420
            </a>
          </address>
          <a
            style={{
              padding: "20px",
              color: "blue",
              textDecoration: "underline",
            }}
            target="_blank"
            href={href}
            rel="noopener noreferrer"
          >
            Send Email
          </a>
          <a
            style={{
              padding: "20px",
              color: "blue",
              textDecoration: "underline",
            }}
            href="tel:555-555-5555"
            rel="noreopener noreferrer"
          >
            Phone
          </a>
        </nav>
      </div>
    </>
  );
};

export default Details;
