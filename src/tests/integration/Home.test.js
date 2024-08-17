import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import Home from "../../pages/Home";

// Mock the react-modal library
jest.mock("react-modal", () => ({
  setAppElement: jest.fn(),
}));

// Mock the components that are lazy loaded
jest.mock("../../components/Home/hero-section", () => () => (
  <div data-testid="hero-section">Hero Section</div>
));
jest.mock("../../components/Home/featured-services", () => () => (
  <div data-testid="featured-services">Featured Services</div>
));
jest.mock(
  "../../components/Home/Featured-Gallery/featured-gallery",
  () => () => <div data-testid="featured-gallery">Our Work</div>
);
jest.mock("../../components/Home/testimonials", () => () => (
  <div data-testid="testimonials">What Our Clients Say</div>
));

describe("Home page", () => {
  test("renders all necessary components", async () => {
    render(
      <Router>
        <Home />
      </Router>
    );

    // Use findByTestId instead of waitFor + getByTestId
    await screen.findByTestId("hero-section");
    await screen.findByTestId("featured-services");
    await screen.findByTestId("featured-gallery");
    await screen.findByTestId("testimonials");

    // Check for specific text content
    expect(screen.getByText(/Hero Section/i)).toBeInTheDocument();
    expect(screen.getByText(/Featured Services/i)).toBeInTheDocument();
    expect(screen.getByText(/Our Work/i)).toBeInTheDocument();
    expect(screen.getByText(/What Our Clients Say/i)).toBeInTheDocument();
  });
});