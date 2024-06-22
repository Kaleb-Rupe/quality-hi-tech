import * as React from "react";
import Hero from "../components/Home-Components/hero";
import FeaturedServices from "../components/Home-Components/featuredServices";
import FeaturedGallery from "../components/Home-Components/featuredGallery";
import Testimonials from "../components/Home-Components/testimonials";

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
