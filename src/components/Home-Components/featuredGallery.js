import React, { useState } from "react";
import Modal from "react-modal";
import "./gallery.css";

// Importing images using destructuring for clarity
import Image1 from "../../assets/images/FB_IMG_1609818291318_Original.jpeg";
import Image2 from "../../assets/images/FB_IMG_1609818276266_Original.jpeg";
import Image3 from "../../assets/images/FB_IMG_1609818328585_Original.jpeg";
import Image4 from "../../assets/images/FB_IMG_1606604883160_Original.jpeg";
import Image5 from "../../assets/images/FB_IMG_1609818199940_Original.jpeg";
import Image6 from "../../assets/images/FB_IMG_1609818315477_Original.jpeg";
import Image7 from "../../assets/images/20210707_155857_Original.jpeg";
import Image8 from "../../assets/images/FB_IMG_1606604670891_Original.jpeg";

const images = [
  { src: Image1, alt: "Description 1" },
  { src: Image2, alt: "Description 2" },
  { src: Image3, alt: "Description 3" },
  { src: Image4, alt: "Description 4" },
  { src: Image5, alt: "Description 5" },
  { src: Image6, alt: "Description 6" },
  { src: Image7, alt: "Description 7" },
  { src: Image8, alt: "Description 8" },
];

Modal.setAppElement("#root"); // This is important for accessibility reasons

export const FeaturedGallery = () => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState(null);
  const [visibleStart, setVisibleStart] = useState(0);
  const visibleCount = 4; // Number of images visible at a time

  const openModal = (image) => {
    setCurrentImage(image);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setCurrentImage(null);
  };

  const nextImages = () => {
    setVisibleStart((prev) =>
      Math.min(prev + visibleCount, images.length - visibleCount)
    );
  };

  const prevImages = () => {
    setVisibleStart((prev) => Math.max(prev - visibleCount, 0));
  };

  return (
    <div className="gallery-container">
      {visibleStart > 0 && ( // Show left arrow if not at the beginning
        <button className="nav-button left" onClick={prevImages}>
          &#10094;
        </button>
      )}
      <div className="gallery">
        {images
          .slice(visibleStart, visibleStart + visibleCount)
          .map((image, index) => (
            <div
              key={index}
              className="gallery-item"
              onClick={() => openModal(image)}
            >
              <img src={image.src} alt={image.alt} loading="lazy" />
            </div>
          ))}
      </div>
      {visibleStart + visibleCount < images.length && ( // Show right arrow if more images available
        <button className="nav-button right" onClick={nextImages}>
          &#10095;
        </button>
      )}

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        className="image-modal"
        overlayClassName="image-overlay"
      >
        {currentImage && (
          <div>
            <button className="close-button" onClick={closeModal}>
              &times;
            </button>
            <img
              src={currentImage.src}
              alt={currentImage.alt}
              className="modal-image"
            />
          </div>
        )}
      </Modal>
    </div>
  );
};
