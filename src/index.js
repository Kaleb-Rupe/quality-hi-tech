import React, { Suspense } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import Modal from "react-modal";
import "./css/index.css";
import ErrorBoundary from "./shared/error-boundary.jsx";
import LoadingFallback from "./shared/loading-fallback.jsx";
import { useViewportHeight } from "./hooks/useViewportHeight.jsx";
import App from "./App";
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

const rootElement = document.getElementById("root");

if (!rootElement) {
  console.error("Root element not found");
} else {
  const RootComponent = () => {
    useViewportHeight();

    React.useEffect(() => {
      Modal.setAppElement(rootElement);
    }, []);

    return (
      <React.StrictMode>
        <ErrorBoundary>
          <Router basename={process.env.REACT_APP_PUBLIC_URL || ""}>
            <Suspense fallback={<LoadingFallback />}>
              <App />
            </Suspense>
          </Router>
        </ErrorBoundary>
      </React.StrictMode>
    );
  };

  createRoot(rootElement).render(<RootComponent />);
}