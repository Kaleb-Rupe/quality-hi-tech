import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import Header from "../shared/Header";

// Mock the useMediaQuery hook
jest.mock("../hooks/useMediaQuery", () => ({
  useMediaQuery: jest.fn(),
}));

describe("Header component", () => {
  const useMediaQuery = require("../hooks/useMediaQuery").useMediaQuery;

  beforeEach(() => {
    useMediaQuery.mockClear();
  });

  test("renders logo and navigation links for desktop view", () => {
    useMediaQuery.mockReturnValue(false); // Simulate desktop view

    render(
      <Router>
        <Header />
      </Router>
    );

    // Check for logo
    const logo = screen.getByAltText(/Quality Hi-Tech Carpet Cleaning Logo/i);
    expect(logo).toBeInTheDocument();

    // Check for navigation links
    const navElement = screen.getByRole("navigation", {
      name: /main navigation/i,
    });
    expect(navElement).toBeInTheDocument();

    const homeLink = screen.getByTestId("home-link");
    const galleryLink = screen.getByTestId("gallery-link");
    const aboutLink = screen.getByTestId("about-link");
    const contactLink = screen.getByTestId("contact-link");

    expect(homeLink).toBeInTheDocument();
    expect(galleryLink).toBeInTheDocument();
    expect(aboutLink).toBeInTheDocument();
    expect(contactLink).toBeInTheDocument();
  });

  test("renders logo and menu button for mobile view", () => {
    useMediaQuery.mockReturnValue(true); // Simulate mobile view

    render(
      <Router>
        <Header />
      </Router>
    );

    const logo = screen.getByAltText(/Quality Hi-Tech Carpet Cleaning Logo/i);
    expect(logo).toBeInTheDocument();

    const menuButton = screen.getByRole("button", { name: /menu/i });
    expect(menuButton).toBeInTheDocument();

    // Navigation should not be visible initially in mobile view
    const navElement = screen.queryByRole("navigation", {
      name: /main navigation/i,
    });
    expect(navElement).not.toBeInTheDocument();
  });
});
