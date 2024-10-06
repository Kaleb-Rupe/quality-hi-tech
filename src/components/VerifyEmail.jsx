import React, { useState, useEffect, useRef } from "react";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { getAuth, sendEmailVerification } from "firebase/auth";
import { useLocation, useNavigate } from "react-router-dom";

const VerifyEmail = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    if (location.state && location.state.email) {
      setEmail(location.state.email);
    }
  }, [location]);

  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("No user is currently signed in");
      }
      await sendEmailVerification(user);
      toast.current.show({
        severity: "success",
        summary: "Success",
        detail: "Verification email sent. Please check your inbox.",
      });
    } catch (error) {
      console.error("Error sending verification email:", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to send verification email: " + error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleVerifyEmail} className="admin-login">
      <Toast ref={toast} position="top-right" />
      <div className="back-button-container">
        <h2>Verify Email</h2>
        <button
          type="button"
          className="back-button"
          onClick={() => navigate(-1)}
        >
          Back
        </button>
      </div>
      <div className="p-fluid">
        <div className="p-field">
          <label htmlFor="verify-email">Email</label>
          <InputText
            id="verify-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled
          />
        </div>
        <Button
          type="submit"
          label="Send Verification Email"
          loading={loading}
        />
      </div>
    </form>
  );
};

export default VerifyEmail;
