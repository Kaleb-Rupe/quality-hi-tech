import React, { useState, useRef, useEffect } from "react";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Password } from "primereact/password";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import { Toast } from "primereact/toast";
import { useAuth } from "./AuthContext";
import "../css/admin.css";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showVerificationLink, setShowVerificationLink] = useState(false);
  const toast = useRef(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const auth = getAuth();

  useEffect(() => {
    return () => {
      setEmail("");
      setPassword("");
    };
  }, []);

  React.useEffect(() => {
    if (user && user.isAdmin) {
      navigate("/admin/dashboard");
    }
  }, [user, navigate]);

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
      const user = userCredential.user;

      if (!user.emailVerified) {
        setShowVerificationLink(true);
        toast.current.show({
          severity: "warn",
          summary: "Email not verified",
          detail: "Please verify your email before logging in.",
        });
        await auth.signOut();
      } else {
        // Check for admin claim
        const token = await user.getIdTokenResult();
        if (token.claims.admin) {
          toast.current.show({
            severity: "success",
            summary: "Login Successful",
            detail: "Welcome back, admin!",
          });
          navigate("/admin/dashboard");
        } else {
          toast.current.show({
            severity: "error",
            summary: "Access Denied",
            detail: "You do not have admin privileges.",
          });
          await auth.signOut();
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.current.show({
        severity: "error",
        summary: "Login Error",
        detail: "Invalid email or password. Please try again.",
      });
    } finally {
      setLoading(false);
    }
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
