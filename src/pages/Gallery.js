import React, { useState, useCallback, useMemo } from "react";
import Modal from "react-modal";
import "../pages/gallery.css";
import { images } from "./gallery-img";
import { services } from "./Services-list";
import Services from "./Services";
import ImageGallery from "./ImageGallery";

Modal.setAppElement("#root");

const Gallery = () => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState(null);
  const [visibleStart, setVisibleStart] = useState(0);
  const visibleCount = 4;

  const openModal = useCallback((image) => {
    setCurrentImage(image);
    setModalIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalIsOpen(false);
    setCurrentImage(null);
  }, []);

  const nextImages = useCallback(() => {
    setVisibleStart((prev) =>
      Math.min(prev + visibleCount, images.length - visibleCount)
    );
  }, []);

  const prevImages = useCallback(() => {
    setVisibleStart((prev) => Math.max(prev - visibleCount, 0));
  }, []);

  const visibleImages = useMemo(
    () => images.slice(visibleStart, visibleStart + visibleCount),
    [visibleStart]
  );

  return (
    <div className="page-wrapper">
      <header className="page-header">
        <h1>Construction & Renovations</h1>
        <p>Transforming Spaces, Building Dreams</p>
      </header>

      <Services services={services} />

      <section className="gallery-section">
        <h2>Our Work</h2>
        <ImageGallery
          images={visibleImages}
          visibleStart={visibleStart}
          totalImages={images.length}
          visibleCount={visibleCount}
          onPrev={prevImages}
          onNext={nextImages}
          onImageClick={openModal}
        />
      </section>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        className="modal-content"
        overlayClassName="modal-overlay"
      >
        {currentImage && (
          <div>
            <button
              className="modal-close-btn"
              onClick={closeModal}
              aria-label="Close modal"
            >
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

export default React.memo(Gallery);
