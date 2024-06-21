import * as React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import { App } from "./App";
import Modal from "react-modal";
import "./index.css";

// Get the root element
const rootElement = document.getElementById("root");

// Check if root element is found
if (!rootElement) {
  throw new Error("Root element not found");
}

// Set the app element for react-modal
Modal.setAppElement(rootElement);

// Create a root
const root = createRoot(rootElement);

// Render the application
root.render(
  <React.StrictMode>
    <Router basename={process.env.PUBLIC_URL}>
      <App />
    </Router>
  </React.StrictMode>
);
