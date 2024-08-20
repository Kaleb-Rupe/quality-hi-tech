import React, { useState, useRef } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Password } from 'primereact/password';
import { getAuth, signInWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { Link } from 'react-router-dom';
import { Toast } from 'primereact/toast';
import '../css/admin.css';

const AdminLogin = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useRef(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const auth = getAuth();
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      if (!userCredential.user.emailVerified) {
        await sendEmailVerification(userCredential.user);
        toast.current.show({ severity: 'warn', summary: 'Email not verified', detail: 'Please check your email to verify your account.' });
      } else {
        onLogin();
      }
    } catch (error) {
      let errorMessage = 'An error occurred during login. Please try again.';
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = 'Invalid email or password.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed login attempts. Please try again later.';
      }
      if (toast.current) {
        toast.current.show({ severity: 'error', summary: 'Login Error', detail: errorMessage });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="admin-login">
      <Toast ref={toast} />
      <h2>Admin Login</h2>
      <div className="p-fluid">
        <div className="p-field">
          <label htmlFor="email">Email</label>
          <InputText id="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="p-field">
          <label htmlFor="password">Password</label>
          <Password id="password" value={password} onChange={(e) => setPassword(e.target.value)} feedback={false} />
        </div>
        <Button type="submit" label="Login" loading={loading} />
        <div className="auth-links">
          <Link to="/forgot-password">Forgot Password?</Link>
          <Link to="/verify-email">Resend Verification Email</Link>
        </div>
      </div>
    </form>
  );
};

export default AdminLogin;