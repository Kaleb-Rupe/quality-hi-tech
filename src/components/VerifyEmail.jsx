import React, { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { getFunctions, httpsCallable } from "firebase/functions";

const VerifyEmail = () => {
  const [email, setEmail] = useState('');
  const [resendingVerification, setResendingVerification] = useState(false);
  const toast = React.useRef(null);

  const handleResendVerification = async () => {
    setResendingVerification(true);
    try {
      const functions = getFunctions();
      const resendVerificationEmail = httpsCallable(
        functions,
        "resendVerificationEmail"
      );
      await resendVerificationEmail({ email });
      alert("Verification email sent. Please check your inbox.");
    } catch (error) {
      console.error("Error resending verification email:", error);
      alert("Failed to resend verification email. Please try again.");
    } finally {
      setResendingVerification(false);
    }
  };

  return (
    <form onSubmit={handleResendVerification} className="admin-login">
      <Toast ref={toast} />
      <h2>Verify Email</h2>
      <div className="p-fluid">
        <div className="p-field">
          <label htmlFor="email">Email</label>
          <InputText
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <Button
          type="button"
          label="Resend Verification Email"
          onClick={handleResendVerification}
          loading={resendingVerification}
          className="p-button-secondary"
        />
      </div>
    </form>
  );
};

export default VerifyEmail;
