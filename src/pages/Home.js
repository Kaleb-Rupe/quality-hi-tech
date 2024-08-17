import React, { lazy, Suspense } from "react";
import ErrorBoundary from "../shared/error-boundary";

const Hero = lazy(() => import("../components/Home/hero-section"));
const FeaturedServices = lazy(() =>
  import("../components/Home/featured-services")
);
const FeaturedGallery = lazy(() =>
  import("../components/Home/Featured-Gallery/featured-gallery")
);
const Testimonials = lazy(() => import("../components/Home/testimonials"));

const LoadingFallback = () => <div>Loading...</div>;
const ErrorFallback = ({ error }) => <div>Error: {error.message}</div>;

const Home = () => {
  return (
    <div className="home-page">
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Suspense fallback={<LoadingFallback />}>
          <Hero />
        </Suspense>
      </ErrorBoundary>

      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Suspense fallback={<LoadingFallback />}>
          <FeaturedServices />
        </Suspense>
      </ErrorBoundary>

      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Suspense fallback={<LoadingFallback />}>
          <FeaturedGallery />
        </Suspense>
      </ErrorBoundary>

      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Suspense fallback={<LoadingFallback />}>
          <Testimonials />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
};

export default React.memo(Home);
