import React, { useState, useRef, useEffect } from "react";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Password } from "primereact/password";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { Link } from "react-router-dom";
import { Toast } from "primereact/toast";
import "../css/admin.css";

const AdminLogin = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showVerificationLink, setShowVerificationLink] = useState(false);
  const toast = useRef(null);
  const auth = getAuth();

  useEffect(() => {
    return () => {
      setEmail("");
      setPassword("");
    };
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setShowVerificationLink(false);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      if (!userCredential.user.emailVerified) {
        setShowVerificationLink(true);
        toast.current.show({
          severity: "warn",
          summary: "Email not verified",
          detail: "Please verify your email before you are authorized to login.",
        });
      } else {
        onLogin();
        toast.current.show({
          severity: "success",
          summary: "Login Successful",
          detail: "Welcome back!",
        });
      }
    } catch (error) {
      handleLoginError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginError = (error) => {
    let errorMessage = "An unexpected error occurred. Please try again.";
    let severity = "error";

    if (error.code) {
      switch (error.code) {
        case "auth/invalid-email":
          errorMessage = "Invalid email format. Please enter a valid email address.";
          severity = "warn";
          break;
        case "auth/invalid-password":
          errorMessage = "Incorrect password. Please try again.";
          severity = "warn";
          break;
        case "auth/invalid-credential":
          errorMessage = "Invalid email or password. Please try again.";
          severity = "warn";
          break;
        case "auth/user-not-found":
          errorMessage = "No account found with this email. Please check your email or sign up.";
          severity = "warn";
          break;
        default:
          console.error("Login error:", error);
      }
    } else {
      console.error("Unexpected error structure:", error);
    }

    toast.current.show({
      severity,
      summary: "Login Error",
      detail: errorMessage,
    });
  };

  return (
    <form onSubmit={handleLogin} className="admin-login">
      <Toast ref={toast} />
      <h2 className="admin-login-title">Admin Login</h2>
      <div className="p-fluid">
        <div className="p-field">
          <label htmlFor="admin-email">Email</label>
          <InputText
            id="admin-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="p-field">
          <label htmlFor="password">Password</label>
          <Password
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            feedback={false}
            toggleMask
            required
          />
        </div>
        <Button type="submit" label="Login" loading={loading} />
        <div className="auth-links">
          <Link to="/forgot-password" state={{ email }}>
            Forgot Password?
          </Link>
          {showVerificationLink && (
            <Link to="/verify-email" state={{ email }}>
              Resend Verification Email
            </Link>
          )}
        </div>
      </div>
    </form>
  );
};

export default AdminLogin;