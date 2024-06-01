import * as React from "react";
import { Hero } from "../components/Home-Components/hero";
import Services from "../components/Home-Components/services";
import { Gallery } from "../components/Home-Components/featuredGallery";
import Testimonials from "../components/Home-Components/testimonials";

export const Home = () => {
  return (
    <>
      <Hero />
      <Services />
      <Gallery />
      <Testimonials />
    </>
  );
};
