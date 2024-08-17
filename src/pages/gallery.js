import React, { useState, useCallback, useMemo, lazy, Suspense } from 'react';
import Modal from 'react-modal';
import { images } from '../components/Services-Gallery/gallery-img';
import { services } from '../components/Services-Gallery/services-list';
import '../css/gallery.css';

const Services = lazy(() => import('../components/Services-Gallery/services'));
const ImageGallery = lazy(() => import('../components/Services-Gallery/image-gallery'));

const LoadingFallback = () => <div aria-live="polite">Loading...</div>;

const useGalleryState = (totalImages, visibleCount) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState(null);
  const [visibleStart, setVisibleStart] = useState(0);

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
      Math.min(prev + visibleCount, totalImages - visibleCount)
    );
  }, [visibleCount, totalImages]);

  const prevImages = useCallback(() => {
    setVisibleStart((prev) => Math.max(prev - visibleCount, 0));
  }, [visibleCount]);

  const visibleImages = useMemo(
    () => images.slice(visibleStart, visibleStart + visibleCount),
    [visibleStart, visibleCount]
  );

  return {
    modalIsOpen,
    currentImage,
    visibleStart,
    visibleImages,
    openModal,
    closeModal,
    nextImages,
    prevImages,
  };
};

const Gallery = () => {
  const visibleCount = 4;
  const {
    modalIsOpen,
    currentImage,
    visibleStart,
    visibleImages,
    openModal,
    closeModal,
    nextImages,
    prevImages,
  } = useGalleryState(images.length, visibleCount);

  return (
    <div className="page-wrapper">
      <header className="page-header">
        <h1>Construction & Renovations</h1>
        <p>Transforming Spaces, Building Dreams</p>
      </header>

      <Suspense fallback={<LoadingFallback />}>
        <Services services={services} />
      </Suspense>

      <section className="gallery-section" aria-labelledby="gallery-title">
        <h2 id="gallery-title">Our Work</h2>
        <Suspense fallback={<LoadingFallback />}>
          <ImageGallery
            images={visibleImages}
            visibleStart={visibleStart}
            totalImages={images.length}
            visibleCount={visibleCount}
            onPrev={prevImages}
            onNext={nextImages}
            onImageClick={openModal}
          />
        </Suspense>
      </section>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        className="modal-content"
        overlayClassName="modal-overlay"
        contentLabel="Image modal"
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

export default Gallery;