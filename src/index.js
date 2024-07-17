import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import App from "./App";
import Modal from "react-modal";
import "./css/index.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  const fallbackRoot = document.createElement("div");
  fallbackRoot.id = "fallback-root";
  document.body.appendChild(fallbackRoot);

  createRoot(fallbackRoot).render(
    <div>
      <h1>Error: Unable to load application</h1>
      <p>
        Please try refreshing the page or contact support if the problem
        persists.
      </p>
    </div>
  );
} else {
  Modal.setAppElement(rootElement);

  function adjustViewportHeight() {
    // First we get the viewport height and we multiple it by 1% to get a value for a vh unit
    let vh = window.innerHeight * 0.01;
    // Then we set the value in the --vh custom property to the root of the document
    document.documentElement.style.setProperty("--vh", `${vh}px`);
  }

  // We listen to the resize event
  window.addEventListener("resize", adjustViewportHeight);

  // We call the function for the first time to set the initial value
  adjustViewportHeight();

  const root = createRoot(rootElement);

  root.render(
    <React.StrictMode>
      <Router basename={process.env.PUBLIC_URL}>
        <App />
      </Router>
    </React.StrictMode>
  );
}
