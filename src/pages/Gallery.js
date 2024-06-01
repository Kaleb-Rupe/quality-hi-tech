import React from "react";
import "../components/Home-Components/gallery.css";
import Image1 from "../assets/images/FB_IMG_1609818291318_Original.jpeg";
import Image2 from "../assets/images/FB_IMG_1609818276266_Original.jpeg";
import Image3 from "../assets/images/FB_IMG_1609818328585_Original.jpeg";
import Image4 from "../assets/images/FB_IMG_1606604883160_Original.jpeg";
import Image5 from "../assets/images/FB_IMG_1609818199940_Original.jpeg";
import Image6 from "../assets/images/FB_IMG_1609818315477_Original.jpeg";
import Image7 from "../assets/images/20210707_155857_Original.jpeg";
import Image8 from "../assets/images/FB_IMG_1606604670891_Original.jpeg";
import Image9 from "../assets/images/FB_IMG_1606604901321_Original.jpeg"


const images = [
  {
    src: Image1,
    alt: "Description 1",
  },
  {
    src: Image2,
    alt: "Description 2",
  },
  {
    src: Image3,
    alt: "Description 3",
  },
  {
    src: Image4,
    alt: "Description 4",
  },
  {
    src: Image5,
    alt: "Description 5",
  },
  {
    src: Image6,
    alt: "Description 6",
  },
  {
    src: Image7,
    alt: "Description 7"
  }, 
  {
    src: Image8,
    alt: "Description 8"
  },
  {
    src: Image9,
    alt: "Description 9"
  }
  
  // Add more images as needed
];

export const Gallery = () => {
  return (
    <div className="gallery">
      {images.map((image, index) => (
        <div key={index} className="gallery-item">
          <img src={image.src} alt={image.alt} loading="lazy" />
        </div>
      ))}
    </div>
  );
};