import React, { lazy, Suspense } from "react";
import ErrorBoundary from "../shared/error-boundary";
import LoadingFallback from "../shared/loading-fallback";
import Hero from "../components/Home/hero-section";

const FeaturedServices = lazy(() => import("../components/Home/featured-services"));
const FeaturedGallery = lazy(() => import("../components/Featured-Gallery/featured-gallery"));
const Testimonials = lazy(() => import("../components/Home/testimonials"));

const ErrorFallback = ({ error }) => <div>Error: {error.message}</div>;

const Home = () => {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <div className="home-page">
        <Hero />
        <Suspense fallback={<LoadingFallback />}>
          <FeaturedServices />
          <FeaturedGallery />
          <Testimonials />
        </Suspense>
      </div>
    </ErrorBoundary>
  );
};

export default React.memo(Home);