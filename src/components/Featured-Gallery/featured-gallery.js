import React, { useState, useEffect } from 'react';
import { Galleria } from 'primereact/galleria';
import { storage } from '../../firebaseConfig';
import { ref, listAll, getDownloadURL } from 'firebase/storage';
import "../../css/gallery.css";

const FeaturedGallery = () => {
  const [galleryImages, setGalleryImages] = useState([]);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const imagesRef = ref(storage, 'images');
        const imageList = await listAll(imagesRef);
        const imageUrls = await Promise.all(
          imageList.items.map(async (item) => {
            const url = await getDownloadURL(item);
            return {
              itemImageSrc: url,
              thumbnailImageSrc: url,
              alt: item.name,
              title: item.name
            };
          })
        );
        setGalleryImages(imageUrls);
      } catch (error) {
        console.error("Error fetching images:", error);
        // You might want to add some UI feedback here
      }
    };

    fetchImages();
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
        circular
        showItemNavigators
        showIndicators
        showIndicatorsOnItem={true}
        showThumbnails={false}
        item={itemTemplate}
        thumbnail={thumbnailTemplate}
        className="custom-galleria"
      />
    </div>
  );
};

export default FeaturedGallery;