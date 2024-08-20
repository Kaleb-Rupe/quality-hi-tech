import React, { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { getAuth, sendEmailVerification } from 'firebase/auth';
import { Toast } from 'primereact/toast';

const VerifyEmail = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = React.useRef(null);

  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (user && user.email === email) {
        await sendEmailVerification(user);
        toast.current.show({ severity: 'success', summary: 'Success', detail: 'Verification email sent. Please check your inbox.' });
      } else {
        throw new Error('User not found or email mismatch');
      }
    } catch (error) {
      toast.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to send verification email. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleVerifyEmail} className="admin-login">
      <Toast ref={toast} />
      <h2>Verify Email</h2>
      <div className="p-fluid">
        <div className="p-field">
          <label htmlFor="email">Email</label>
          <InputText id="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <Button type="submit" label="Send Verification Email" loading={loading} />
      </div>
    </form>
  );
};

export default VerifyEmail;
