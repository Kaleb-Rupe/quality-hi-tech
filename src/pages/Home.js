import React from "react";
import Hero from "../components/Home/hero-section";
import FeaturedServices from "../components/Home/featured-services";
import FeaturedGallery from "../components/Home/Featured-Gallery/featured-gallery";
import Testimonials from "../components/Home/testimonials";

const Home = () => {
  return (
    <>
      <Hero />
      <FeaturedServices />
      <FeaturedGallery />
      <Testimonials />
    </>
  );
};

export default Home;
