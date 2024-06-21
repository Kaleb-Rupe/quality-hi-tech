import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from "react";
import Modal from "react-modal";
import "../pages/gallery.css";
import { images } from "./gallery-img";
import { services } from "./Services-list";

Modal.setAppElement("#root");

export const Gallery = () => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState(null);
  const [visibleStart, setVisibleStart] = useState(0);
  const [expandedService, setExpandedService] = useState(null);
  const visibleCount = 4;
  const servicesSectionRef = useRef(null);

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

  const toggleService = (index) => {
    setExpandedService(expandedService === index ? null : index);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        servicesSectionRef.current &&
        !servicesSectionRef.current.contains(event.target)
      ) {
        setExpandedService(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="page-wrapper">
      <header className="page-header">
        <h1>Elite Construction & Renovations</h1>
        <p>Transforming Spaces, Building Dreams</p>
      </header>

      <section className="services-section" ref={servicesSectionRef}>
        <h2>Our Services</h2>
        <div className="services-grid">
          {services.map((service, index) => (
            <div
              key={index}
              className={`service-item ${
                expandedService === index ? "expanded" : ""
              }`}
              onClick={() => toggleService(index)}
            >
              <div className="service-header">
                <h3>{service.title}</h3>
                <span className="service-arrow">&#9656;</span>
              </div>
              <div className="service-description">
                <p>{service.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="gallery-section">
        <h2>Our Work</h2>
        <div className="image-gallery-wrapper">
          {visibleStart > 0 && (
            <button
              className="navigation-btn navigation-btn-prev"
              onClick={prevImages}
            >
              &#10094;
            </button>
          )}
          <div className="image-grid">
            {visibleImages.map((image) => (
              <div
                key={image.id}
                className="image-tile"
                onClick={() => openModal(image)}
              >
                <img src={image.src} alt={image.alt} loading="lazy" />
              </div>
            ))}
          </div>
          {visibleStart + visibleCount < images.length && (
            <button
              className="navigation-btn navigation-btn-next"
              onClick={nextImages}
            >
              &#10095;
            </button>
          )}
        </div>
      </section>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        className="modal-content"
        overlayClassName="modal-overlay"
      >
        {currentImage && (
          <div>
            <button className="modal-close-btn" onClick={closeModal}>
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
