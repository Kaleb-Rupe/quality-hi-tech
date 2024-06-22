import React, { useRef, useEffect } from "react";

const ArrowLeft = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
  </svg>
);

const ArrowRight = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
  </svg>
);

const ImageGallery = React.memo(
  ({
    images,
    visibleStart,
    totalImages,
    visibleCount,
    onPrev,
    onNext,
    onImageClick,
  }) => {
    const galleryRef = useRef(null);

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
            onPrev();
          } else if (distX < -50 && visibleStart + visibleCount < totalImages) {
            onNext();
          }
        }
        isSwiping = false;
      };

      gallery.addEventListener("touchstart", handleTouchStart);
      gallery.addEventListener("touchmove", handleTouchMove);
      gallery.addEventListener("touchend", handleTouchEnd);

      return () => {
        gallery.removeEventListener("touchstart", handleTouchStart);
        gallery.removeEventListener("touchmove", handleTouchMove);
        gallery.removeEventListener("touchend", handleTouchEnd);
      };
    }, [visibleStart, totalImages, visibleCount, onPrev, onNext]);

    return (
      <div className="image-gallery-wrapper" ref={galleryRef}>
        <button
          className="navigation-btn navigation-btn-prev"
          onClick={onPrev}
          aria-label="Previous images"
          disabled={visibleStart === 0}
        >
          <ArrowLeft />
        </button>
        <div className="image-grid">
          {images.map((image) => (
            <div
              key={image.id}
              className="image-tile"
              onClick={() => onImageClick(image)}
              tabIndex={0}
              role="button"
              aria-label={`View larger image of ${image.alt}`}
              onKeyDown={(e) => e.key === "Enter" && onImageClick(image)}
            >
              <img src={image.src} alt={image.alt} loading="lazy" />
            </div>
          ))}
        </div>
        <button
          className="navigation-btn navigation-btn-next"
          onClick={onNext}
          aria-label="Next images"
          disabled={visibleStart + visibleCount >= totalImages}
        >
          <ArrowRight />
        </button>
      </div>
    );
  }
);

export default ImageGallery;
