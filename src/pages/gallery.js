import React, { Suspense } from 'react';
import { services } from '../components/Services-Gallery/services-list';
import LoadingFallback from "../shared/loading-fallback";
import Services from "../components/Services-Gallery/services";
import FeaturedGallery from "../components/Home/Featured-Gallery/featured-gallery";
import '../css/gallery.css';

const Gallery = () => {

  return (
    <div className="page-wrapper">
      <header className="page-header">
        <h1>Carpet & Tile Cleaning</h1>
        <p>Professional Solutions for Every Space</p>
      </header>

      <Suspense fallback={<LoadingFallback />}>
        <Services services={services} />
      </Suspense>

      <section className="gallery-section" aria-labelledby="gallery-title">
        <h2 id="gallery-title">Our Work</h2>
        <Suspense fallback={<LoadingFallback />}>
          <FeaturedGallery />
        </Suspense>
      </section>

    </div>
  );
};

export default Gallery;