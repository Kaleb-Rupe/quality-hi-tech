import React, { useRef, useEffect } from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import "../../css/gallery.css";

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

      const handleKeyDown = (e) => {
        if (e.key === "ArrowLeft") {
          onPrev();
        } else if (e.key === "ArrowRight") {
          onNext();
        }
      };

      gallery.addEventListener("touchstart", handleTouchStart, {
        passive: true,
      });
      gallery.addEventListener("touchmove", handleTouchMove, { passive: true });
      gallery.addEventListener("touchend", handleTouchEnd);
      document.addEventListener("keydown", handleKeyDown);

      return () => {
        gallery.removeEventListener("touchstart", handleTouchStart);
        gallery.removeEventListener("touchmove", handleTouchMove);
        gallery.removeEventListener("touchend", handleTouchEnd);
        document.removeEventListener("keydown", handleKeyDown);
      };
    }, [visibleStart, totalImages, visibleCount, onPrev, onNext]);

    const totalDots = Math.ceil(totalImages / visibleCount);
    const currentDot = Math.floor(visibleStart / visibleCount);

    return (
      <div
        className="image-gallery-wrapper"
        ref={galleryRef}
        tabIndex="0"
        role="region"
        aria-label="Image gallery"
      >
        <button
          className="navigation-btn navigation-btn-prev"
          onClick={onPrev}
          aria-label="Previous images"
          disabled={visibleStart === 0}
        >
          <ArrowLeft />
        </button>
        <div className="image-grid">
          {images.map((image, index) => (
            <div
              key={image.id}
              className="image-tile"
              onClick={() => onImageClick(image)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  onImageClick(image);
                }
              }}
              tabIndex="0"
              role="button"
              aria-label={`View larger image of ${image.alt}`}
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
        </div>
        <button
          className="navigation-btn navigation-btn-next"
          onClick={onNext}
          aria-label="Next images"
          disabled={visibleStart + visibleCount >= totalImages}
        >
          <ArrowRight />
        </button>
        <div className="gallery-dots">
          {Array.from({ length: totalDots }).map((_, index) => (
            <span
              key={index}
              className={`dot ${index === currentDot ? "active" : ""}`}
              onClick={() => onImageClick(images[index * visibleCount])}
            />
          ))}
        </div>
      </div>
    );
  }
);

export default React.memo(ImageGallery);
