import React, { useState } from "react";
import Modal from "react-modal";
import "./featured-gallery.css";

import { images } from "./galleryData";

Modal.setAppElement("#root"); // This is important for accessibility reasons

const FeaturedGallery = () => {
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

export default FeaturedGallery;
