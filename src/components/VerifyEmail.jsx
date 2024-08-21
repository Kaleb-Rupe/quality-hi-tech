import React, { useState, useEffect, useRef } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { getAuth, sendEmailVerification } from 'firebase/auth';
import { Toast } from 'primereact/toast';
import { useLocation, useNavigate } from 'react-router-dom';

const VerifyEmail = () => {
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

  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (user && user.email === email) {
        await sendEmailVerification(user);
        if (isMounted.current && toast.current) {
          toast.current.show({ severity: 'success', summary: 'Success', detail: 'Verification email sent. Please check your inbox.' });
        }
      } else {
        throw new Error('User not found or email mismatch');
      }
    } catch (error) {
      if (isMounted.current && toast.current) {
        toast.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to send verification email. Please try again.' });
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  return (
    <form onSubmit={handleVerifyEmail} className="admin-login">
      <Toast ref={toast} />
      <div className="back-button-container">
        <h2>Verify Email</h2>
        <button type="button" className="back-button" onClick={() => navigate(-1)}>
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