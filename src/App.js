import React, { useEffect } from 'react';
import { Routes, Route } from "react-router-dom";
import { AuthProvider, ProtectedRoute } from "./components/AuthContext";
import Layout from "./pages/Layout.js";
import ErrorPage from "./pages/error-page.js";
import Home from "./pages/Home.js";
import Services from "./pages/services.js";
import About from "./pages/about.js";
import ContactForm from "./pages/contact.js";
import AdminPage from "./components/AdminPage";
import AdminDashboard from "./components/AdminDashboard";
import ForgotPassword from "./components/ForgotPassword";
import VerifyEmail from "./components/VerifyEmail";
import "./css/app.css";
import "./css/toast.css";
import {
  initializeSecureStorage,
} from "./utils/secureStorage";

const App = () => {
  useEffect(() => {
    const initStorage = async () => {
      try {
        await initializeSecureStorage();
        console.log("Secure storage initialized successfully");
      } catch (error) {
        console.error("Failed to initialize secure storage:", error);
      }
    };
    initStorage();
  }, []);

  return (
    <AuthProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} key="home" />
          <Route path="/services" element={<Services />} key="services" />
          <Route path="/about" element={<About />} key="about" />
          <Route path="/contact" element={<ContactForm />} key="contact" />
          <Route path="/admin" element={<AdminPage />} key="admin" />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute adminOnly>
                <AdminDashboard />
              </ProtectedRoute>
            }
            key="admin-dashboard"
          />
          <Route
            path="/forgot-password"
            element={<ForgotPassword />}
            key="forgot-password"
          />
          <Route
            path="/verify-email"
            element={<VerifyEmail />}
            key="verify-email"
          />
          <Route path="*" element={<ErrorPage />} key="error" />
        </Routes>
      </Layout>
    </AuthProvider>
  );
};

export default React.memo(App);
