import React, { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import { Toast } from 'primereact/toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = React.useRef(null);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const auth = getAuth();
      await sendPasswordResetEmail(auth, email);
      toast.current.show({ severity: 'success', summary: 'Success', detail: 'Password reset email sent. Please check your inbox.' });
    } catch (error) {
      toast.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to send password reset email. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleResetPassword} className="admin-login">
      <Toast ref={toast} />
      <h2>Reset Password</h2>
      <div className="p-fluid">
        <div className="p-field">
          <label htmlFor="email">Email</label>
          <InputText id="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <Button type="submit" label="Send Reset Email" loading={loading} />
      </div>
    </form>
  );
};

export default ForgotPassword;
