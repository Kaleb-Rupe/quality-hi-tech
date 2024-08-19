import React, { useState, useEffect } from 'react';
import { Galleria } from 'primereact/galleria';
import { images } from "./gallery-img";
import "../../css/gallery.css";

const FeaturedGallery = () => {
  const [galleryImages, setGalleryImages] = useState([]);

  useEffect(() => {
    setGalleryImages(images);
  }, []);

  const itemTemplate = (item) => {
    return (
      <div className="galleria-item-container">
        <img 
          src={item.itemImageSrc} 
          alt={item.alt} 
          className="galleria-item-image"
        />
      </div>
    );
  }

  const thumbnailTemplate = (item) => {
    return <img src={item.thumbnailImageSrc} alt={item.alt} style={{ display: 'block' }} />;
  }

  return (
    <div className="gallery-container">
      <Galleria
        value={galleryImages}
        numVisible={5}
        circular
        showItemNavigators
        showIndicators
        showIndicatorsOnItem={true}
        responsiveOptions={[
          {
            breakpoint: '1024px',
            numVisible: 3
          },
          {
            breakpoint: '768px',
            numVisible: 2
          },
          {
            breakpoint: '560px',
            numVisible: 1
          }
        ]}
        showThumbnails={false}
        item={itemTemplate}
        thumbnail={thumbnailTemplate}
        className="custom-galleria"
      />
    </div>
  );
};

export default FeaturedGallery;