import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  Suspense
} from "react";
import Modal from "react-modal";
import { images } from "../../Services-Gallery/gallery-img";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "../../../css/gallery.css"
import LoadingFallback from "../../../shared/loading-fallback";

Modal.setAppElement("#root");

const ArrowLeft = React.memo(() => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
  </svg>
));

const ArrowRight = React.memo(() => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
  </svg>
));

const FeaturedGallery = React.memo(() => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState(null);
  const [visibleStart, setVisibleStart] = useState(0);
  const [visibleCount, setVisibleCount] = useState(4);
  const galleryRef = useRef(null);

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
  }, [visibleCount]);

  const prevImages = useCallback(() => {
    setVisibleStart((prev) => Math.max(prev - visibleCount, 0));
  }, [visibleCount]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "ArrowLeft") {
        prevImages();
      } else if (e.key === "ArrowRight") {
        nextImages();
      }
    },
    [prevImages, nextImages]
  );

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 480) {
        setVisibleCount(1);
      } else if (window.innerWidth < 768) {
        setVisibleCount(2);
      } else {
        setVisibleCount(4);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const gallery = galleryRef.current;
    let startX, startY, distX, distY;
    let isSwiping = false;

    const handleTouchStart = (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      isSwiping = true;
    };

    const handleTouchMove = (e) => {
      if (!isSwiping) return;
      distX = e.touches[0].clientX - startX;
      distY = e.touches[0].clientY - startY;
    };

    const handleTouchEnd = () => {
      if (!isSwiping) return;
      if (Math.abs(distX) > Math.abs(distY)) {
        if (distX > 50 && visibleStart > 0) {
          prevImages();
        } else if (distX < -50 && visibleStart + visibleCount < images.length) {
          nextImages();
        }
      }
      isSwiping = false;
    };

    gallery.addEventListener("touchstart", handleTouchStart, { passive: true });
    gallery.addEventListener("touchmove", handleTouchMove, { passive: true });
    gallery.addEventListener("touchend", handleTouchEnd);
    gallery.addEventListener("keydown", handleKeyDown);
    return () => {
      gallery.removeEventListener("touchstart", handleTouchStart);
      gallery.removeEventListener("touchmove", handleTouchMove);
      gallery.removeEventListener("touchend", handleTouchEnd);
      gallery.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown, visibleStart, prevImages, nextImages, visibleCount]);

  const visibleImages = useMemo(
    () => images.slice(visibleStart, visibleStart + visibleCount),
    [visibleStart, visibleCount]
  );

  const totalDots = Math.ceil(images.length / visibleCount);
  const currentDot = Math.floor(visibleStart / visibleCount);

  return (
    <div
      className="gallery-container"
      ref={galleryRef}
      tabIndex="0"
      role="region"
      aria-label="Featured Gallery"
    >
      <button
        className="nav-button left"
        onClick={prevImages}
        disabled={visibleStart === 0}
        aria-label="Previous images"
      >
        <ArrowLeft />
      </button>
      <div className="gallery">
        <Suspense fallback={<LoadingFallback />}>
          {visibleImages.map((image, index) => (
            <div
              key={index}
              className="gallery-item"
              onClick={() => openModal(image)}
              tabIndex={0}
              role="button"
              aria-label={`View larger image of ${image.alt}`}
              onKeyDown={(e) => e.key === "Enter" && openModal(image)}
            >
              <LazyLoadImage
                src={image.src}
                alt={image.alt}
                effect="blur"
                width="100%"
                height="100%"
              />
            </div>
          ))}
        </Suspense>
      </div>
      <button
        className="nav-button right"
        onClick={nextImages}
        disabled={visibleStart + visibleCount >= images.length}
        aria-label="Next images"
      >
        <ArrowRight />
      </button>

      <div className="gallery-dots">
        {Array.from({ length: totalDots }).map((_, index) => (
          <span
            key={index}
            className={`dot ${index === currentDot ? "active" : ""}`}
            onClick={() => setVisibleStart(index * visibleCount)}
          />
        ))}
      </div>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        className="image-modal"
        overlayClassName="image-overlay"
      >
        {currentImage && (
          <div>
            <button
              className="close-button"
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
});

export default FeaturedGallery;
