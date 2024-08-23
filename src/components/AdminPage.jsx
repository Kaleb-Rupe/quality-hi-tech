import React, { useState, useEffect } from "react";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
} from "firebase/auth";
import { getFunctions, httpsCallable } from "firebase/functions";
import { analytics } from "../firebaseConfig";
import { logEvent } from "firebase/analytics";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthProvider";
import AdminLogin from "./AdminLogin";
import AdminDashboard from "./AdminDashboard";
import Header from "../shared/Header";
import { Toast } from "primereact/toast";
import "../css/admin.css";

const AdminPage = () => {
  const [loading, setLoading] = useState(false);
  const auth = getAuth();
  const navigate = useNavigate();
  const { user, isAdmin, isSuperAdmin } = useAuth();
  const toast = React.useRef(null);

  const functions = getFunctions();
  const checkLoginAttempts = httpsCallable(functions, "checkLoginAttempts");

  useEffect(() => {
    if (user && user.emailVerified && (isAdmin || isSuperAdmin)) {
      navigate("/admin/dashboard");
    }
  }, [user, isAdmin, isSuperAdmin, navigate]);

  const handleLogin = async (email, password) => {
    setLoading(true);
    try {
      // First, check login attempts
      const result = await checkLoginAttempts({ email });
      if (result.data.allowed) {
        // Proceed with login
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;
        const tokenResult = await user.getIdTokenResult(true);

        if (
          !tokenResult.claims.role ||
          (tokenResult.claims.role !== "admin" &&
            tokenResult.claims.role !== "superadmin")
        ) {
          throw new Error("Insufficient privileges");
        }

        if (!user.emailVerified) {
          await sendEmailVerification(user);
          toast.current.show({
            severity: "warning",
            summary: "Email Verification Required",
            detail: "Please check your email to verify your account.",
          });
        } else {
          logEvent(analytics, "login");
          navigate("/admin/dashboard");
        }
      } else {
        throw new Error("Too many login attempts");
      }
    } catch (error) {
      console.error("Error signing in: ", error);
      let errorMessage = "An error occurred during login. Please try again.";
      if (
        error.code === "auth/user-not-found" ||
        error.code === "auth/wrong-password"
      ) {
        errorMessage = "Invalid email or password";
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Too many login attempts. Please try again later.";
      } else if (error.message === "Insufficient privileges") {
        errorMessage = "You do not have permission to access the admin area.";
      }
      toast.current.show({
        severity: "error",
        summary: "Login Error",
        detail: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      logEvent(analytics, "logout");
      navigate("/admin");
    } catch (error) {
      console.error("Error signing out: ", error);
      toast.current.show({
        severity: "error",
        summary: "Logout Error",
        detail: "Failed to log out. Please try again.",
      });
    }
  };

  return (
    <div className="admin-page">
      <Header isLoggedIn={!!user} onLogout={handleLogout} />
      <Toast ref={toast} />
      {user && user.emailVerified && (isAdmin || isSuperAdmin) ? (
        <AdminDashboard />
      ) : (
        <AdminLogin onLogin={handleLogin} loading={loading} />
      )}
    </div>
  );
};

export default AdminPage;
