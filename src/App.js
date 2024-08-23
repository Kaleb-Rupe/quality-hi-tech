import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./pages/Layout.js";
import ErrorPage from "./pages/error-page.js";
import Home from "./pages/Home.js";
import Services from "./pages/services.js";
import About from "./pages/about.js";
import ContactForm from "./pages/contact.js";
import AdminPage from "./components/AdminPage";
import ForgotPassword from "./components/ForgotPassword";
import VerifyEmail from "./components/VerifyEmail";
import AdminDashboard from "./components/AdminDashboard.jsx";
import "./css/app.css";
import { AuthProvider, useAuth } from "./AuthProvider";

const ProtectedAdminRoute = ({ children }) => {
  const { user, isAdmin, isSuperAdmin, isEmailVerified } = useAuth();
  return user && isEmailVerified && (isAdmin || isSuperAdmin) ? children : <Navigate to="/admin" />;
};

const App = () => (
  <AuthProvider>
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<Services />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<ContactForm />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedAdminRoute>
              <AdminDashboard />
            </ProtectedAdminRoute>
          }
        />
        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </Layout>
  </AuthProvider>
);

export default React.memo(App);