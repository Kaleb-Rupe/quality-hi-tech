import React from "react";
import "./gallery.css";

const Gallery = () => {
  return (
    <section className="gallery">
      <h2>Gallery</h2>
      <div className="gallery-images">
        {/* Add images here */}
        <div className="gallery-image">Image 1</div>
        <div className="gallery-image">Image 2</div>
        <div className="gallery-image">Image 3</div>
      </div>
    </section>
  );
};

export default Gallery;
