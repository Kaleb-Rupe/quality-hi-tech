import React, { useState, useEffect, useRef } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import { Toast } from 'primereact/toast';
import { useLocation, useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const isMounted = useRef(true);

  useEffect(() => {
    if (location.state && location.state.email) {
      setEmail(location.state.email);
    }
    return () => {
      isMounted.current = false;
    };
  }, [location]);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const auth = getAuth();
      await sendPasswordResetEmail(auth, email);
      if (isMounted.current && toast.current) {
        toast.current.show({ severity: 'success', summary: 'Success', detail: 'Password reset email sent. Please check your inbox.' });
      }
    } catch (error) {
      if (isMounted.current && toast.current) {
        toast.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to send password reset email. Please try again.' });
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  return (
    <form onSubmit={handleResetPassword} className="admin-login">
      <Toast ref={toast} position="top-right" />
      <div className="back-button-container">
        <h2>Reset Password</h2>
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
          <label htmlFor="email">Email</label>
          <InputText
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <Button type="submit" label="Send Reset Email" loading={loading} />
      </div>
    </form>
  );
};

export default ForgotPassword;