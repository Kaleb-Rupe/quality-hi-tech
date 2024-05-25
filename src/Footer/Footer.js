import React from "react";
import Details from "./Footer-Comp/details_page";
import Form from "./Footer-Comp/form_page";
import MobileDetect from "mobile-detect";
// Use the navigator.userAgent property to get the user agent string
const userAgent = navigator.userAgent;
// Create a new instance of the MobileDetect class
const md = new MobileDetect();
// Split the user agent string by spaces to get the operating system
const os = userAgent.split(" ")[1];

// Check the operating system and render different content accordingly
if (os.includes("Windows")) {
  // Render Windows-specific content
} else if (os.includes("Macintosh")) {
  // Render Mac-specific content
} else if (md.os("windows")) {
  // Render Windows-specific content
} else if (md.os("mac")) {
  // Render Mac-specific content
} else {
  // Render content for other operating systems
}

const Footer = () => {
  return (
    <>
      <footer>
        <Details />
        <Form />
        <div>
          <div></div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
