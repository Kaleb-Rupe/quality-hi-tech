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
import Image9 from "../assets/images/FB_IMG_1606604901321_Original.jpeg";
import Image10 from "../assets/images/FB_IMG_1606604911539_Original.jpeg";
import Image11 from "../assets/images/FB_IMG_1606604956514_Original.jpeg";
import Image12 from "../assets/images/FB_IMG_1606604982389_Original.jpeg";
import Image13 from "../assets/images/FB_IMG_1606605002519_Original.jpeg";
import Image14 from "../assets/images/FB_IMG_1609818258950_Original.jpeg";
import Image15 from "../assets/images/IMG_0162.jpeg";
import Image16 from "../assets/images/IMG_0163.jpeg";
import Image17 from "../assets/images/IMG_0164.jpeg";
import Image18 from "../assets/images/IMG_0165.jpeg";
import Image19 from "../assets/images/IMG_0166.jpeg";
import Image20 from "../assets/images/IMG_0167.jpeg";
import Image21 from "../assets/images/IMG_0276.jpeg";
import Image22 from "../assets/images/IMG_0466.jpeg";
import Image23 from "../assets/images/IMG_0468.jpeg";
import Image24 from "../assets/images/IMG_0631.jpeg";


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
  },
  {
    src: Image10,
    alt: "Description 10"
  },
  {
    src: Image11,
    alt: "Description 11"
  },
  {
    src: Image12,
    alt: "Description 12"
  },
  {
    src: Image13,
    alt: "Description 13"
  },
  {
    src: Image14,
    alt: "Description 14"
  },
  {
    src: Image15,
    alt: "Description 15"
  },
  {
    src: Image16,
    alt: "Description 16"
  },
  {
    src: Image17,
    alt: "Description 17"
  },
  {
    src: Image18,
    alt: "Description 18"
  },
  {
    src: Image19,
    alt: "Description 19"
  },
  {
    src: Image20,
    alt: "Description 20"
  },
  {
    src: Image21,
    alt: "Description 21"
  },
  {
    src: Image22,
    alt: "Description 22"
  },
  {
    src: Image23,
    alt: "Description 23"
  },
  {
    src: Image24,
    alt: "Description 24"
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